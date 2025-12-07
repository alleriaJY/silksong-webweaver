/*
    For SaveFile decryption, steps were taken from KayDeeTee https://github.com/KayDeeTee/Hollow-Knight-SaveManager
*/

use std::fs;
use std::fs::File;
use std::io::Write;
use serde_json::Value; // or `Map<String, Value>` if you want JsonObject
use aes::Aes256;
use cipher::{KeyInit, BlockDecryptMut};
use ecb::{Decryptor};
use base64::Engine;

/*
 * Base 64 Decodes a string then decrypts it via Rijndael/ECB/RKCS7 with the key UKu52ePUBwetZ9wNX88o54dnfKRu0T1l 
 */
fn decrypt_aes256_ecb(input: &[u8]) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    // AES-256 key (32 bytes)
    let key = b"UKu52ePUBwetZ9wNX88o54dnfKRu0T1l";

    //println!("Printing input bytes: {:?} length {}", input, input.len())

    // Converts savefile bytes into string, then decode it (base64)
    let input_str = std::str::from_utf8(input)?;
    let mut decoded = base64::engine::general_purpose::STANDARD.decode(input_str)?;

    // Main decrypting stuffs to get the JSON formatting
    let plaintext = Decryptor::<Aes256>::new(key.into())
        .decrypt_padded_mut::<cipher::block_padding::Pkcs7>(&mut decoded)
        .map_err(|e: cipher::block_padding::UnpadError| format!("PKCS7 unpad failed: {}", e))?
        .to_vec();

    Ok(plaintext)
}


fn main() -> Result<(), Box<dyn std::error::Error>> {

    // Read raw bytes from file
    let ciphertext_bytes = fs::read("user1.dat")?;

    // Will need to trim header (first 25 bytes) and the last byte.
    let trimmed = &ciphertext_bytes[..ciphertext_bytes.len().saturating_sub(1)];
    let trimmed_data = &trimmed[25..];

    // Decrypt the trimmed savefile
    let decrypted_savefile = decrypt_aes256_ecb(&trimmed_data)?;

    // Convert the output into JSON
    let json_str = String::from_utf8_lossy(&decrypted_savefile);
    let json_value: Value = serde_json::from_str(&json_str)?;

    // Save to output.json
    let mut file = File::create("output.json")?;
    let pretty = serde_json::to_string_pretty(&json_value)?;
    file.write_all(pretty.as_bytes())?;

    println!("Decrypted JSON saved to output.json");
    
    Ok(())
}