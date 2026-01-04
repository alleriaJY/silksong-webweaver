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

/// Result returned to JavaScript with decrypted playerData
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DecryptResult {
    pub success: bool,
    pub error: Option<String>,
    pub player_data: Option<serde_json::Value>,
}

/// Decrypt a Silksong save file
///
/// Takes raw bytes from a .dat file and returns the raw playerData JSON
/// Parsing is handled by JavaScript using the schema system
#[wasm_bindgen]
pub fn decrypt_and_parse(data: &[u8]) -> JsValue {
    let result = match decrypt_save_file(data) {
        Ok(player_data) => DecryptResult {
            success: true,
            error: None,
            player_data: Some(player_data),
        },
        Err(e) => DecryptResult {
            success: false,
            error: Some(e),
            player_data: None,
        },
    };

    serde_wasm_bindgen::to_value(&result).unwrap_or(JsValue::NULL)
}

/// Internal: Decrypt the save file and extract playerData
fn decrypt_save_file(raw_bytes: &[u8]) -> Result<serde_json::Value, String> {
    // Validate minimum size
    if raw_bytes.len() <= HEADER_SIZE + 1 {
        return Err("Save file too small".to_string());
    }

    // Trim header and trailer
    let trimmed = &raw_bytes[HEADER_SIZE..raw_bytes.len().saturating_sub(1)];

    // Decrypt
    let decrypted = decrypt_aes256_ecb(trimmed)?;

    // Parse JSON
    let json_str = String::from_utf8(decrypted).map_err(|e| format!("Invalid UTF-8: {}", e))?;

    let json: serde_json::Value =
        serde_json::from_str(&json_str).map_err(|e| format!("Invalid JSON: {}", e))?;

    // Return playerData
    Ok(json["playerData"].clone())
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

    /// Test DecryptResult serialization structure
    #[test]
    fn test_decrypt_result_structure() {
        // Test success result
        let success_result = DecryptResult {
            success: true,
            error: None,
            player_data: Some(serde_json::json!({"test": "value"})),
        };
        assert!(success_result.success);
        assert!(success_result.error.is_none());
        assert!(success_result.player_data.is_some());

        // Test error result
        let error_result = DecryptResult {
            success: false,
            error: Some("Test error".to_string()),
            player_data: None,
        };
        assert!(!error_result.success);
        assert_eq!(error_result.error, Some("Test error".to_string()));
        assert!(error_result.player_data.is_none());
    }

    /// Test that header size constant is correct
    #[test]
    fn test_header_size_constant() {
        assert_eq!(HEADER_SIZE, 25);
    }

    /// Test that encryption key has correct length for AES-256
    #[test]
    fn test_encryption_key_length() {
        assert_eq!(ENCRYPTION_KEY.len(), 32); // AES-256 requires 32 bytes
    }
}
