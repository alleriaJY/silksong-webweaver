//! WASM module for Silksong save file decryption
//!
//! This module provides browser-compatible decryption of Hollow Knight: Silksong save files.
//! Parsing is handled by JavaScript using the schema system.

use aes::Aes256;
use base64::Engine;
use cipher::{BlockDecryptMut, KeyInit};
use ecb::Decryptor;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// The AES-256 key used for Silksong save file encryption
const ENCRYPTION_KEY: &[u8; 32] = b"UKu52ePUBwetZ9wNX88o54dnfKRu0T1l";

/// Header size to skip in save files
const HEADER_SIZE: usize = 25;

/// Result for `decrypt_save`: the whole decrypted save, every root included
#[derive(Serialize, Deserialize)]
pub struct SaveResult {
    pub success: bool,
    pub error: Option<String>,
    pub save: Option<serde_json::Value>,
}

/// Decrypt a Silksong save file and return every root of the save.
///
/// Objects are serialised as plain JavaScript objects (not `Map`s), so the JS
/// side needs no `instanceof Map` handling. New top-level roots (for example
/// from a DLC) reach JS without a Rust change.
#[wasm_bindgen]
pub fn decrypt_save(data: &[u8]) -> JsValue {
    let result = match decrypt_save_file(data) {
        Ok(save) => SaveResult {
            success: true,
            error: None,
            save: Some(save),
        },
        Err(e) => SaveResult {
            success: false,
            error: Some(e),
            save: None,
        },
    };
    let serializer = serde_wasm_bindgen::Serializer::json_compatible();
    result.serialize(&serializer).unwrap_or(JsValue::NULL)
}

/// Decrypt a Silksong save file to its plaintext JSON string (for exports and tools).
#[wasm_bindgen]
pub fn decrypt_to_json(data: &[u8]) -> Result<String, JsValue> {
    decrypt_plaintext(data).map_err(|e| JsValue::from_str(&e))
}

/// Internal: decrypt the save file to its plaintext JSON string
fn decrypt_plaintext(raw_bytes: &[u8]) -> Result<String, String> {
    // Validate minimum size
    if raw_bytes.len() <= HEADER_SIZE + 1 {
        return Err("Save file too small".to_string());
    }

    // Trim header and trailer
    let trimmed = &raw_bytes[HEADER_SIZE..raw_bytes.len().saturating_sub(1)];

    let decrypted = decrypt_aes256_ecb(trimmed)?;
    String::from_utf8(decrypted).map_err(|e| format!("Invalid UTF-8: {}", e))
}

/// Internal: decrypt and parse the whole save
fn decrypt_save_file(raw_bytes: &[u8]) -> Result<serde_json::Value, String> {
    let json_str = decrypt_plaintext(raw_bytes)?;
    let json: serde_json::Value =
        serde_json::from_str(&json_str).map_err(|e| format!("Invalid JSON: {}", e))?;
    if !json.is_object() {
        return Err("Invalid save: top level is not an object".to_string());
    }
    Ok(json)
}

/// Internal: AES-256-ECB decryption
fn decrypt_aes256_ecb(input: &[u8]) -> Result<Vec<u8>, String> {
    // Convert to string and decode base64
    let input_str = std::str::from_utf8(input)
        .map_err(|e| format!("Invalid UTF-8 in encrypted data: {}", e))?;

    let mut decoded = base64::engine::general_purpose::STANDARD
        .decode(input_str)
        .map_err(|e| format!("Base64 decode failed: {}", e))?;

    // Decrypt
    let plaintext = Decryptor::<Aes256>::new(ENCRYPTION_KEY.into())
        .decrypt_padded_mut::<cipher::block_padding::Pkcs7>(&mut decoded)
        .map_err(|_| "Decryption failed - invalid padding or key".to_string())?
        .to_vec();

    Ok(plaintext)
}

// ═══════════════════════════════════════════════════════════════════════════
// UNIT TESTS
// ═══════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    /// Test that files smaller than header + trailer are rejected
    #[test]
    fn test_decrypt_file_too_small() {
        // 26 bytes is the minimum (25 header + 1 trailer)
        let small_data = vec![0u8; 25];
        let result = decrypt_save_file(&small_data);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Save file too small");
    }

    /// Test that exactly 26 bytes (minimal valid size) results in empty content error
    #[test]
    fn test_decrypt_minimal_size() {
        let minimal_data = vec![0u8; 26];
        let result = decrypt_save_file(&minimal_data);
        // Should fail because content is empty/invalid
        assert!(result.is_err());
    }

    /// Test that invalid base64 content is handled
    #[test]
    fn test_invalid_base64() {
        // Create data with header + invalid base64 + trailer
        let mut data = vec![0u8; 25]; // Header
        data.extend_from_slice(b"!!!invalid-base64!!!"); // Invalid base64
        data.push(0); // Trailer

        let result = decrypt_save_file(&data);
        assert!(result.is_err());
        // Should fail at base64 decode or UTF-8 conversion
    }

    /// Test that valid base64 but wrong encryption fails gracefully
    #[test]
    fn test_wrong_encrypted_content() {
        // Create data with header + valid base64 (but wrong content) + trailer
        let mut data = vec![0u8; 25]; // Header
                                      // "dGVzdA==" is base64 for "test" - wrong length for AES block
        data.extend_from_slice(b"dGVzdA==");
        data.push(0); // Trailer

        let result = decrypt_save_file(&data);
        assert!(result.is_err());
    }

    /// Test that header size constant is correct
    #[test]
    fn test_header_size_constant() {
        assert_eq!(HEADER_SIZE, 25);
    }

    /// Encrypt JSON the way the game does, for round-trip tests
    fn encrypt_for_test(json: &str) -> Vec<u8> {
        use cipher::{block_padding::Pkcs7, BlockEncryptMut};
        let plain = json.as_bytes();
        let mut buf = vec![0u8; plain.len() + 16];
        buf[..plain.len()].copy_from_slice(plain);
        let cipher_bytes = ecb::Encryptor::<Aes256>::new(ENCRYPTION_KEY.into())
            .encrypt_padded_mut::<Pkcs7>(&mut buf, plain.len())
            .expect("buffer large enough");
        let mut out = vec![0u8; HEADER_SIZE];
        out.extend_from_slice(
            base64::engine::general_purpose::STANDARD
                .encode(cipher_bytes)
                .as_bytes(),
        );
        out.push(0x0b);
        out
    }

    /// The whole save round-trips, including nested objects, arrays and extra roots
    #[test]
    fn test_decrypt_save_round_trip() {
        let save = serde_json::json!({
            "playerData": {
                "playTime": 12.5,
                "Tools": { "savedData": [ { "Name": "Straight Pin", "Data": { "IsUnlocked": true } } ] },
                "scenesVisited": ["Tut_01", "Tut_02"]
            },
            "sceneData": { "persistentBools": { "serializedList": [] } },
            "dlcData": { "anything": 1 }
        });
        let blob = encrypt_for_test(&save.to_string());
        assert_eq!(decrypt_save_file(&blob).unwrap(), save);
        assert_eq!(
            serde_json::from_str::<serde_json::Value>(&decrypt_plaintext(&blob).unwrap()).unwrap(),
            save
        );
    }

    /// A payload that decrypts but is not a JSON object is rejected
    #[test]
    fn test_decrypt_rejects_non_object() {
        let blob = encrypt_for_test("[1,2,3]");
        assert!(decrypt_save_file(&blob).is_err());
    }

    /// Test that encryption key has correct length for AES-256
    #[test]
    fn test_encryption_key_length() {
        assert_eq!(ENCRYPTION_KEY.len(), 32); // AES-256 requires 32 bytes
    }
}
