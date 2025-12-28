//! Save file parsing and data structures

use serde::Deserialize;
use serde_json::Value;
use thiserror::Error;

/// Errors that can occur during save file parsing
#[derive(Error, Debug)]
pub enum ParseError {
    #[error("Invalid JSON: {0}")]
    JsonError(#[from] serde_json::Error),

    #[error("Invalid UTF-8 in decrypted data: {0}")]
    Utf8Error(#[from] std::str::Utf8Error),

    #[error("Missing required field: {0}")]
    MissingField(String),
}

/// Represents a complete Silksong save file
#[derive(Debug)]
pub struct SaveFile {
    pub player_data: PlayerData,
    pub raw_json: Value,
}

/// Player statistics and state from the save file
#[derive(Debug)]
pub struct PlayerData {
    pub version: String,
    pub permadeath_mode: bool,
    pub completion_percentage: f64,
    pub play_time_seconds: f64,

    // Health and resources
    pub health: i64,
    pub max_health: i64,
    pub silk: i64,
    pub max_silk: i64,
    pub silk_regen_max: i64,
    pub geo: i64,
    pub shell_shards: i64,

    // Location
    pub current_area: String,
    pub map_zone: i64,
    pub at_bench: bool,

    // Equipment
    pub current_crest_id: String,

    // Respawn
    pub respawn_scene: String,
    pub respawn_type: i64,
    pub respawn_marker_name: String,

    // Tools
    pub tools: Vec<Tool>,
}

/// A tool/ability in the game
#[derive(Debug, Clone, Deserialize)]
pub struct Tool {
    #[serde(rename = "Name")]
    pub name: String,
    #[serde(rename = "Data")]
    pub data: ToolData,
}

/// Data associated with a tool
#[derive(Debug, Clone, Deserialize)]
pub struct ToolData {
    #[serde(rename = "AmountLeft")]
    pub amount_left: u32,
    #[serde(rename = "HasBeenSeen")]
    pub has_been_seen: bool,
    #[serde(rename = "HasBeenSelected")]
    pub has_been_selected: bool,
    #[serde(rename = "IsHidden")]
    pub is_hidden: bool,
    #[serde(rename = "IsUnlocked")]
    pub is_unlocked: bool,
}

impl SaveFile {
    /// Parse a decrypted save file from JSON bytes
    pub fn from_bytes(bytes: &[u8]) -> Result<Self, ParseError> {
        let json_str = std::str::from_utf8(bytes)?;
        let raw_json: Value = serde_json::from_str(json_str)?;
        let player_data = PlayerData::from_json(&raw_json["playerData"])?;

        Ok(SaveFile {
            player_data,
            raw_json,
        })
    }
}

impl PlayerData {
    /// Parse player data from a JSON value
    pub fn from_json(json: &Value) -> Result<Self, ParseError> {
        // Parse tools array
        let mut tools = Vec::new();
        if let Some(tools_array) = json["Tools"]["savedData"].as_array() {
            for tool_value in tools_array {
                if let Ok(tool) = serde_json::from_value::<Tool>(tool_value.clone()) {
                    tools.push(tool);
                }
            }
        }

        Ok(PlayerData {
            version: json["version"].as_str().unwrap_or("").to_string(),
            permadeath_mode: json["permadeathMode"].as_bool().unwrap_or(false),
            completion_percentage: json["completionPercentage"].as_f64().unwrap_or(0.0),
            play_time_seconds: json["playTime"].as_f64().unwrap_or(0.0),

            health: json["health"].as_i64().unwrap_or(0),
            max_health: json["maxHealth"].as_i64().unwrap_or(0),
            silk: json["silk"].as_i64().unwrap_or(0),
            max_silk: json["silkMax"].as_i64().unwrap_or(0),
            silk_regen_max: json["silkRegenMax"].as_i64().unwrap_or(0),
            geo: json["geo"].as_i64().unwrap_or(0),
            shell_shards: json["ShellShards"].as_i64().unwrap_or(0),

            current_area: json["currentArea"].as_str().unwrap_or("").to_string(),
            map_zone: json["mapZone"].as_i64().unwrap_or(0),
            at_bench: json["atBench"].as_bool().unwrap_or(false),

            current_crest_id: json["CurrentCrestID"].as_str().unwrap_or("").to_string(),

            respawn_scene: json["respawnScene"].as_str().unwrap_or("").to_string(),
            respawn_type: json["respawnType"].as_i64().unwrap_or(0),
            respawn_marker_name: json["respawnMarkerName"].as_str().unwrap_or("").to_string(),

            tools,
        })
    }

    /// Get tool statistics
    pub fn tool_stats(&self) -> ToolStats {
        let mut stats = ToolStats::default();
        for tool in &self.tools {
            stats.total += 1;
            if tool.data.has_been_seen {
                stats.seen += 1;
            }
            if tool.data.has_been_selected {
                stats.selected += 1;
            }
            if tool.data.is_unlocked {
                stats.unlocked += 1;
            }
        }
        stats
    }

    /// Format play time as "XXh XXm XXs"
    pub fn play_time_formatted(&self) -> String {
        seconds_to_hms(self.play_time_seconds)
    }
}

/// Statistics about tools
#[derive(Debug, Default)]
pub struct ToolStats {
    pub total: usize,
    pub seen: usize,
    pub selected: usize,
    pub unlocked: usize,
}

/// Convert seconds to "XXh XXm XXs" format
pub fn seconds_to_hms(seconds: f64) -> String {
    let hours = (seconds / 3600.0) as u64;
    let minutes = ((seconds % 3600.0) / 60.0) as u64;
    let secs = seconds % 60.0;
    format!("{:02}h {:02}m {:02.0}s", hours, minutes, secs)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_seconds_to_hms() {
        assert_eq!(seconds_to_hms(0.0), "00h 00m 00s");
        assert_eq!(seconds_to_hms(61.0), "00h 01m 01s");
        assert_eq!(seconds_to_hms(3661.0), "01h 01m 01s");
        assert_eq!(seconds_to_hms(7325.5), "02h 02m 06s");
    }

    #[test]
    fn test_tool_stats_empty() {
        let player = PlayerData {
            version: String::new(),
            permadeath_mode: false,
            completion_percentage: 0.0,
            play_time_seconds: 0.0,
            health: 0,
            max_health: 0,
            silk: 0,
            max_silk: 0,
            silk_regen_max: 0,
            geo: 0,
            shell_shards: 0,
            current_area: String::new(),
            map_zone: 0,
            at_bench: false,
            current_crest_id: String::new(),
            respawn_scene: String::new(),
            respawn_type: 0,
            respawn_marker_name: String::new(),
            tools: vec![],
        };

        let stats = player.tool_stats();
        assert_eq!(stats.total, 0);
        assert_eq!(stats.unlocked, 0);
    }
}
