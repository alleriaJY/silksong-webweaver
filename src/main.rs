//! Silksong Save File Tool
//!
//! CLI tool to decrypt and parse Hollow Knight: Silksong save files.

use clap::Parser;
use silksongtool::{decrypt_save_file, SaveFile};
use std::fs::{self, File};
use std::io::Write;
use std::path::PathBuf;

/// Silksong save file parser and analyzer
#[derive(Parser, Debug)]
#[command(name = "silksongtool")]
#[command(author, version, about, long_about = None)]
struct Args {
    /// Path to the save file (.dat)
    #[arg(short, long, default_value = "user1.dat")]
    input: PathBuf,

    /// Path to output JSON file (optional)
    #[arg(short, long)]
    output: Option<PathBuf>,

    /// Only output JSON, don't print stats
    #[arg(short, long)]
    quiet: bool,
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args = Args::parse();

    // Read save file
    let ciphertext_bytes = fs::read(&args.input)
        .map_err(|e| format!("Failed to read '{}': {}", args.input.display(), e))?;

    // Decrypt
    let decrypted = decrypt_save_file(&ciphertext_bytes)?;

    // Parse
    let save_file = SaveFile::from_bytes(&decrypted)?;

    // Optionally save to output file
    if let Some(output_path) = &args.output {
        let mut file = File::create(output_path)?;
        let pretty_json = serde_json::to_string_pretty(&save_file.raw_json)?;
        file.write_all(pretty_json.as_bytes())?;
        if !args.quiet {
            println!("Decrypted JSON saved to {}", output_path.display());
        }
    }

    // Print stats unless quiet mode
    if !args.quiet {
        print_stats(&save_file);
    }

    Ok(())
}

fn print_stats(save: &SaveFile) {
    let player = &save.player_data;

    println!("\n=====\n1. Generic Stats\n=====");
    println!("Game Version       : {}", player.version);
    println!("Completion %       : {}%", player.completion_percentage);
    println!("Play Time          : {}\n", player.play_time_formatted());

    println!("Max Health         : {}", player.max_health);
    println!("Max Silk           : {}", player.max_silk);
    println!("Silk Hearts        : {}\n", player.silk_regen_max);

    println!("Rosaries           : {}", player.geo);
    println!("Shell Shards       : {}\n", player.shell_shards);

    println!("\n=====\n1.2 Current Stats\n=====");
    println!("Current Health     : {}/{}", player.health, player.max_health);
    println!("Current Silk       : {}/{}\n", player.silk, player.max_silk);

    println!("Current Area       : {}", player.current_area);
    println!("Current AreaZone   : {}", player.map_zone);
    println!("At Bench?          : {}\n", player.at_bench);

    println!("\n=====\n1.8 Misc Information\n=====");
    println!("Will Respawn At    : {}", player.respawn_scene);
    println!("Respawn ZoneName   : {}", player.respawn_marker_name);
    println!("Respawn Type (WIP) : {}\n", player.respawn_type);

    let tool_stats = player.tool_stats();
    println!("\n=====\n7. Tools\n=====");
    println!("Tools Count        : {}", tool_stats.total);
    println!("Tools Selected     : {}", tool_stats.selected);
    println!("Tools Seen         : {}", tool_stats.seen);
    println!("Tools Unlocked     : {}", tool_stats.unlocked);
}