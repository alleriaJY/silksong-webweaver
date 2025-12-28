// AES-256-ECB decryption for Silksong save files
// Save files are base64-encoded, AES-256-ECB encrypted with PKCS7 padding.
// Credit: Decryption steps from KayDeeTee https://github.com/KayDeeTee/Hollow-Knight-SaveManager

use aes::Aes256;
use base64::Engine;
use cipher::{BlockDecryptMut, KeyInit};
use ecb::Decryptor;
use thiserror::Error;

/// The AES-256 key used for Silksong save file encryption
const ENCRYPTION_KEY: &[u8; 32] = b"UKu52ePUBwetZ9wNX88o54dnfKRu0T1l";

/// Header size to skip in save files (first 25 bytes)
const HEADER_SIZE: usize = 25;

/// Errors that can occur during save file decryption
#[derive(Error, Debug)]
pub enum DecryptError {
    #[error("Save file too small (minimum {HEADER_SIZE} bytes required)")]
    FileTooSmall,

    #[error("Invalid UTF-8 in save file: {0}")]
    InvalidUtf8(#[from] std::str::Utf8Error),

    #[error("Base64 decode failed: {0}")]
    Base64Error(#[from] base64::DecodeError),

    #[error("AES decryption failed: PKCS7 unpad error")]
    DecryptionFailed,
}

/// Decrypt a raw Silksong save file (.dat) to JSON bytes.
///
/// The save file format:
/// - First 25 bytes: header (skipped)
/// - Last 1 byte: trailer (skipped)
/// - Middle: Base64-encoded, AES-256-ECB encrypted JSON with PKCS7 padding
///
/// # Arguments
/// * `raw_bytes` - The complete contents of a .dat save file
///
/// # Returns
/// * `Ok(Vec<u8>)` - Decrypted JSON as bytes
/// * `Err(DecryptError)` - If decryption fails
///
/// # Example
/// ```ignore
/// let save_bytes = std::fs::read("user1.dat")?;
/// let json_bytes = decrypt_save_file(&save_bytes)?;
/// let json_str = String::from_utf8_lossy(&json_bytes);
/// ```
pub fn decrypt_save_file(raw_bytes: &[u8]) -> Result<Vec<u8>, DecryptError> {
    // Validate minimum size
    if raw_bytes.len() <= HEADER_SIZE + 1 {
        return Err(DecryptError::FileTooSmall);
    }

    // Trim header (first 25 bytes) and trailer (last 1 byte)
    let trimmed = &raw_bytes[HEADER_SIZE..raw_bytes.len().saturating_sub(1)];

    decrypt_aes256_ecb(trimmed)
}

/// Internal: Decrypt base64-encoded, AES-256-ECB encrypted data
fn decrypt_aes256_ecb(input: &[u8]) -> Result<Vec<u8>, DecryptError> {
    // Convert bytes to string and decode base64
    let input_str = std::str::from_utf8(input)?;
    let mut decoded = base64::engine::general_purpose::STANDARD.decode(input_str)?;

    // Decrypt with AES-256-ECB and PKCS7 padding
    let plaintext = Decryptor::<Aes256>::new(ENCRYPTION_KEY.into())
        .decrypt_padded_mut::<cipher::block_padding::Pkcs7>(&mut decoded)
        .map_err(|_| DecryptError::DecryptionFailed)?
        .to_vec();

    Ok(plaintext)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_file_too_small() {
        let small_data = vec![0u8; 10];
        let result = decrypt_save_file(&small_data);
        assert!(matches!(result, Err(DecryptError::FileTooSmall)));
    }

    #[test]
    fn test_invalid_base64() {
        // Create data that's large enough but has invalid base64
        let mut data = vec![0u8; 30];
        data.extend_from_slice(b"!!!invalid base64!!!");
        let result = decrypt_save_file(&data);
        assert!(matches!(result, Err(DecryptError::Base64Error(_))));
    }
}
