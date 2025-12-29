//! WASM module for Silksong save file decryption
//!
//! This module provides browser-compatible decryption of Hollow Knight: Silksong save files.
//! Parsing is handled by JavaScript using the schema system.

use wasm_bindgen::prelude::*;
use aes::Aes256;
use cipher::{BlockDecryptMut, KeyInit};
use ecb::Decryptor;
use base64::Engine;
use serde::{Serialize, Deserialize};

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

/// Initialize console error panic hook for better error messages
#[wasm_bindgen(start)]
pub fn init() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
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
    let json_str = String::from_utf8(decrypted)
        .map_err(|e| format!("Invalid UTF-8: {}", e))?;
    
    let json: serde_json::Value = serde_json::from_str(&json_str)
        .map_err(|e| format!("Invalid JSON: {}", e))?;
    
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
