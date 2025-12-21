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
use std::collections::HashMap;

use serde::Deserialize;

#[derive(Debug, Deserialize)]
struct Tool {
    Name: String,
    Data: ToolData,
}

#[derive(Debug, Deserialize)]
struct ToolData {
    AmountLeft: u32,
    HasBeenSeen: bool,
    HasBeenSelected: bool,
    IsHidden: bool,
    IsUnlocked: bool,
}

fn seconds_to_hms(seconds: Option<f64>) -> String {
    let seconds = match seconds {
        Some(s) => s,
        None => return "00h 00m 00s".to_string(),
    };

    let hours = (seconds / 3600.0) as u64;
    let minutes = ((seconds % 3600.0) / 60.0) as u64;
    let secs = seconds % 60.0;

    format!("{:02}h {:02}m {:02.0}s", hours, minutes, secs)
}

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
    let savefile_json_str = String::from_utf8_lossy(&decrypted_savefile);

    let savefile_full_json: Value = serde_json::from_str(&savefile_json_str)?;

    let savefile_json_player = &savefile_full_json["playerData"];
    let savefile_json_scene= &savefile_full_json["sceneData"];

    // Save to output.json
    let mut file = File::create("output.json")?;
    let pretty_savefile_full_json = serde_json::to_string_pretty(&savefile_full_json)?;
    file.write_all(pretty_savefile_full_json.as_bytes())?;

    println!("Decrypted JSON saved to output.json");

    // Start the parsing.

    // - Steel Soul?
    //    "permadeathMode": 0,

    // - Where am I?
    // - Location of Coccoon?
    // - Mask Shards
    // - Silk Hearts
    // - Rosaries
    // - Shell Shards

    // "respawnMarkerName": "RestBench",
    // "respawnScene": "Song_Enclave",
    // "respawnType": 1,
    // "silk"

        // "atBench": false,
    // "currentArea": "ABYSS",
    // "mapZone": 37,
    // "entered_Tut01b": true,
    // "environmentType": 0,

    let statsGameSaveVersion = &savefile_json_player["version"].as_str().unwrap_or("");
    let statsSteelSoul = &savefile_json_player["permadeathMode"].as_bool().unwrap_or(false);
    let statsCompletionPercentage = &savefile_json_player["completionPercentage"];
    let statsPlayTime = seconds_to_hms(savefile_json_player["playTime"].as_f64());

    let statsCurrentHealth = &savefile_json_player["health"];
    let statsCurrentSilk = &savefile_json_player["silk"];

    let statsMaxSilk = &savefile_json_player["silkMax"];
    let statsMaxSilkHearts = &savefile_json_player["silkRegenMax"];
    let statsMaxHealth = &savefile_json_player["maxHealth"];

    let statsCurrentRosaries = &savefile_json_player["geo"];
    let statsCurrentShellShards = &savefile_json_player["ShellShards"];

    // 1.5 Current Equipments
    let statsCurrentArea = &savefile_json_player["currentArea"].as_str().unwrap_or("");
    let statsMapZone = &savefile_json_player["mapZone"];
    let statsAtBench = &savefile_json_player["atBench"];
    
    // "PreviousCrestID": "Reaper",
    // Equipped Crest
    let currentCrestID = &savefile_json_player["CurrentCrestID"];

    // Equipped Tools
    // This needs further parsing + logic

    // Nail Level Picture
    // Quill
    // "QuillState": 1,

    // 1.8 Misc Information
    // Your respawn location
    let statsRespawnLocation = &savefile_json_player["respawnScene"];
    let statsRespawnType = &savefile_json_player["respawnType"];
    let statsRespawnMarker = &savefile_json_player["respawnMarkerName"];

    // - Location of Coccoon?
    // Where is da Coccoon?
    //     "HeroCorpseMoneyPool": 0,
    //     "HeroCorpseScene": "",
    //     "HeroCorpseType": 0,
    //     "HeroDeathScenePos": {
    //       "x": 48.71,
    //       "y": 8.17
    //     },
    //     "HeroDeathSceneSize": {
    //       "x": 65.0,
    //       "y": 1024.0
    //     },

    // Need Enum here
    let statsBellBeastLocation = &savefile_json_player["FastTravelNPCLocation"];

    // Where are the Fleas?
    // FleasCollectedTargetOrder

    // Silksong Percentage: 51% for Tools
    //println!("{}", savefile_json_player["Tools"]["savedData"]);

    let mut toolsCount = 0;
    let mut toolsSeenCount = 0;
    let mut toolsSelectedCount = 0;
    let mut toolsUnlockedCount = 0;

    // Per-tool stats
    let mut toolStats: HashMap<String, ToolData> = HashMap::new();

    if let Some(toolsArray) = savefile_json_player["Tools"]["savedData"].as_array() {
        for tool_value in toolsArray {

            //println!("{}", tool_value);

            let tool: Tool = serde_json::from_value(tool_value.clone())?;
            toolsCount += 1;

            if tool.Data.HasBeenSeen {
                toolsSeenCount += 1;
            }
            if tool.Data.HasBeenSelected {
                toolsSelectedCount += 1;
            }
            if tool.Data.IsUnlocked {
                toolsUnlockedCount += 1;
            }

            // Store per-name stats
            toolStats.insert(tool.Name.clone(), tool.Data);
        }
    }

    // 1. Generic Stats
    println!("\n=====\n1. Generic Stats\n=====");

    println!("Game Version       : {}", statsGameSaveVersion);
    println!("Completion %       : {}%", statsCompletionPercentage);
    println!("Play Time          : {}\n", statsPlayTime);

    println!("Max Health         : {}", statsMaxHealth);
    println!("Max Silk           : {}", statsMaxSilk);
    println!("Silk Hearts        : {}\n", statsMaxSilkHearts);

    println!("Rosaries           : {}", statsCurrentRosaries);
    println!("Shell Shards       : {}\n", statsCurrentShellShards);

    // Current Stats
    println!("\n=====\n1.2 Current Stats\n=====");

    println!("Current Health     : {}/{}", statsCurrentHealth, statsMaxHealth);
    println!("Current Silk       : {}/{}\n", statsCurrentSilk, statsMaxSilk);

    // - Where am I?
    println!("Current Area         : {}", statsCurrentArea);
    println!("Current AreaZone     : {}", statsMapZone);
    println!("At Bench?            : {}\n", statsAtBench);

    // 1.5 Current Equipment
    // println!("\n=====\n1.5 Current Equipment\n=====");
    

    // 1.8 Misc Information
    println!("\n=====\n1.8 Misc Information\n=====");
    // - What If i Die?
    println!("Will Respawn At    : {}", statsRespawnLocation);
    println!("Respawn ZoneName   : {}", statsRespawnMarker);
    println!("Respawn Type (WIP) : {}\n", statsRespawnType);
    
    // - Location of Coccoon?
    // Where is da Coccoon?
    //     "HeroCorpseMoneyPool": 0,
    //     "HeroCorpseScene": "",
    //     "HeroCorpseType": 0,
    //     "HeroDeathScenePos": {
    //       "x": 48.71,
    //       "y": 8.17
    //     },
    //     "HeroDeathSceneSize": {
    //       "x": 65.0,
    //       "y": 1024.0
    //     },

    // Where is da Taxi?
    //    "FastTravelNPCLocation": 2,

    // Where are the Fleas?
    // FleasCollectedTargetOrder
    
    // 2. Bosses (49 Total?)
    //println!("\n=====\n2. Bosses\n=====\n");

    // 3. 11 Crests
    //println!("\n=====\n3. Crests\n=====\n");

    // 4. Upgrades
    //println!("\n=====\n4. Upgrades\n=====\n");
    // - Needle Upgradess
    // - Crafting Kit Upgrades
    // "ToolKitUpgrades": 4,
    // - Unlocked Tool Pouches
    // - Mask Shards
    // - Spool Fragments
    // - Abilities
    // - Silk Skills

    // 5. Quests
    //println!("\n=====\n5. Quests\n=====\n");
    // - Objectives

    //    "HasMelodyArchitect": true,
    //    "HasMelodyConductor": true,
    //    "HasMelodyLibrarian": true,


    // - Wishes

    // 6. Areas
    //println!("\n=====\n6. Map\n=====\n");
    // - Maps
    // - Bellway Stations
    // - Ventrica Stations


    // 7. Tools
    println!("\n=====\n7. Tools\n=====");

    println!("Tools Count: {}", toolsCount);
    println!("Tools Selected: {}", toolsSelectedCount);
    println!("Tools Seen: {}", toolsSeenCount);
    println!("Tools Unlocked: {}", toolsUnlockedCount);

    // 8. Collectables
    //println!("\n=====\n8. Collectables\n=====\n");
    // - Fleas
    // - Simple Keys
    // - Other Keys
    //    "HasSlabKeyA": true,
    //    "HasSlabKeyB": true,
    //    "HasSlabKeyC": true,
    // - Craftmetal
    // - Pale Oil
    // - 20 Memory Lockets
    // - Mossberries
    // - Mementos
    // - Relics

    // 9. Hunter's Journal
    //println!("\n=====\n9. Hunter's Journal\n=====\n");

    // 10. Memorium
    //println!("\n=====\n10. Memorium\n=====\n");



    //Silksong Percentage: 4 Needle Upgrade - 4%
    //Silksong Percentage: 5 Mask Shard - 5%, 20 Mask Shards
    //Silksong Percentage: 9 Silk Spool - 9%, 18 Spool Fragments
    //Silksong Percentage: 3 Silk Hearts - 3%
    //Silksong Percentage: 6 Silk Skills - 6%
    //Silksong Percentage: 2 Misc - Everbloom & Sylphsong - 2%
    //Silksong Percentage: 6 Crests - 6%
    //Silksong Percentage: 4 Crafting Kit - 4%
    //Silksong Percentage: 4 Tool Pouch Upgrade - 4%
    //Silksong Percentage: 6 Abilities - 6%

    Ok(())
}