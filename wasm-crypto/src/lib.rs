//! WASM module for Silksong save file decryption
//!
//! This module provides browser-compatible decryption and parsing
//! of Hollow Knight: Silksong save files.

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

/// Result returned to JavaScript with parsed save data
#[derive(Serialize, Deserialize)]
pub struct ParsedSaveData {
    pub success: bool,
    pub error: Option<String>,
    pub data: Option<SaveData>,
}

/// The main save data structure
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveData {
    pub version: String,
    pub permadeath_mode: bool,
    pub completion_percentage: f64,
    pub play_time: f64,
    pub play_time_formatted: String,
    
    // Health and resources
    pub health: i64,
    pub max_health: i64,
    pub silk: i64,
    pub max_silk: i64,
    pub silk_hearts: i64,
    pub geo: i64,
    pub shell_shards: i64,
    
    // Location
    pub current_area: String,
    pub map_zone: i64,
    pub at_bench: bool,
    pub current_crest_id: String,
    
    // Respawn
    pub respawn_scene: String,
    pub respawn_type: i64,
    pub respawn_marker_name: String,
    
    // Tools
    pub tools_total: usize,
    pub tools_unlocked: usize,
    pub tools_seen: usize,
    pub tools_selected: usize,
}

/// Initialize console error panic hook for better error messages
#[wasm_bindgen(start)]
pub fn init() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

/// Decrypt and parse a Silksong save file
/// 
/// Takes raw bytes from a .dat file and returns parsed save data as JSON
#[wasm_bindgen]
pub fn decrypt_and_parse(data: &[u8]) -> JsValue {
    let result = match process_save_file(data) {
        Ok(save_data) => ParsedSaveData {
            success: true,
            error: None,
            data: Some(save_data),
        },
        Err(e) => ParsedSaveData {
            success: false,
            error: Some(e),
            data: None,
        },
    };
    
    serde_wasm_bindgen::to_value(&result).unwrap_or(JsValue::NULL)
}

/// Internal: Process the entire save file
fn process_save_file(raw_bytes: &[u8]) -> Result<SaveData, String> {
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
    
    // Extract player data
    parse_player_data(&json["playerData"])
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

/// Internal: Parse player data from JSON
fn parse_player_data(json: &serde_json::Value) -> Result<SaveData, String> {
    // Parse tools
    let mut tools_total = 0;
    let mut tools_unlocked = 0;
    let mut tools_seen = 0;
    let mut tools_selected = 0;
    
    if let Some(tools_array) = json["Tools"]["savedData"].as_array() {
        for tool in tools_array {
            tools_total += 1;
            if tool["Data"]["IsUnlocked"].as_bool().unwrap_or(false) {
                tools_unlocked += 1;
            }
            if tool["Data"]["HasBeenSeen"].as_bool().unwrap_or(false) {
                tools_seen += 1;
            }
            if tool["Data"]["HasBeenSelected"].as_bool().unwrap_or(false) {
                tools_selected += 1;
            }
        }
    }
    
    let play_time = json["playTime"].as_f64().unwrap_or(0.0);
    
    Ok(SaveData {
        version: json["version"].as_str().unwrap_or("").to_string(),
        permadeath_mode: json["permadeathMode"].as_bool().unwrap_or(false),
        completion_percentage: json["completionPercentage"].as_f64().unwrap_or(0.0),
        play_time,
        play_time_formatted: format_play_time(play_time),
        
        health: json["health"].as_i64().unwrap_or(0),
        max_health: json["maxHealth"].as_i64().unwrap_or(0),
        silk: json["silk"].as_i64().unwrap_or(0),
        max_silk: json["silkMax"].as_i64().unwrap_or(0),
        silk_hearts: json["silkRegenMax"].as_i64().unwrap_or(0),
        geo: json["geo"].as_i64().unwrap_or(0),
        shell_shards: json["ShellShards"].as_i64().unwrap_or(0),
        
        current_area: json["currentArea"].as_str().unwrap_or("").to_string(),
        map_zone: json["mapZone"].as_i64().unwrap_or(0),
        at_bench: json["atBench"].as_bool().unwrap_or(false),
        current_crest_id: json["CurrentCrestID"].as_str().unwrap_or("").to_string(),
        
        respawn_scene: json["respawnScene"].as_str().unwrap_or("").to_string(),
        respawn_type: json["respawnType"].as_i64().unwrap_or(0),
        respawn_marker_name: json["respawnMarkerName"].as_str().unwrap_or("").to_string(),
        
        tools_total,
        tools_unlocked,
        tools_seen,
        tools_selected,
    })
}

/// Format seconds as "XXh XXm XXs"
fn format_play_time(seconds: f64) -> String {
    let hours = (seconds / 3600.0) as u64;
    let minutes = ((seconds % 3600.0) / 60.0) as u64;
    let secs = (seconds % 60.0) as u64;
    format!("{:02}h {:02}m {:02}s", hours, minutes, secs)
}
