<img src="https://raw.githubusercontent.com/alleriaJY/silksong-webweaver/refs/heads/main/web/assets/img/silksong_logo.ico" alt="Silksong" title="Silksong Webweaver" align="left" height="70" />

# Silksong: Webweaver

Re-weaving the timeline. Drop in a Hollow Knight: Silksong save file and see everything it remembers: your completion, every collectible, and the path Hornet took across Pharloom.

**Open the app:** https://alleriajy.github.io/silksong-webweaver/

<br clear="left" />

## What it does

**Statistics** reads the whole save and lays it out tab by tab:

- **General and Current stats**: a Save Slot Profile banner, play time, completion, the current loadout, and the respawn bench.
- **Unlockables**: tools and their upgrades, crests, abilities, skills, Mask Shards, Spool Fragments, Silk Hearts, Craftmetal, Memory Lockets, Tool Pouch and Crafting Kit upgrades, the needle, and more. Every source is listed, so you can see which ones you still need.
- **Bosses and Hunter's Journal**: all bosses and Void Masses, and every journal entry with its kill target.
- **Quests, Fleas, Maps and Collectables**: main quests, wishes, courier deliveries, fleas, maps, map pins and the quill, Bellway and Ventrica stations, relics, mementos, materium, and key items.
- **Misc**: endings, milestones, arenas, bellshrines, and Bellhome upgrades.
- **Completion breakdown**: rebuilds the game's own completion percentage piece by piece, so you can see exactly where each percent comes from.
- **Compare**: load a second save to see what changed between the two (`+N` / `-N` on every category).
- **Export**: download the decrypted save as readable JSON.

**Hero's Path** draws your run on the full Pharloom map: the rooms you have visited, story events (Mask Shards, Spool Fragments, keys, lockets) in the order you found them, filters by category, a playback bar, your current bench, and pins for collectibles you have missed.

Entries that only exist in one game mode (for example Steel Soul) are shown only for saves in that mode.

## Your save stays on your device

The save is decrypted in your browser by a small WebAssembly module. Nothing is uploaded and there is no server: the site is static files on GitHub Pages.

## Finding your save file

Each save slot is its own file, `user1.dat` to `user4.dat`:

| Platform | Folder |
|---|---|
| Windows | `%USERPROFILE%\AppData\LocalLow\Team Cherry\Hollow Knight Silksong\<id>\` |
| macOS | `~/Library/Application Support/unity.Team-Cherry.Silksong/<id>/` |
| Linux / Steam Deck | `~/.config/unity3d/Team Cherry/Hollow Knight Silksong/<id>/` |

`<id>` is a numeric folder named after your platform account. Paths can differ by store or launcher.

## Running it yourself

```bash
npx --yes serve web -l 5175
```

Then open http://localhost:5175. See [DEVELOPMENT.md](DEVELOPMENT.md) for building the WASM module, running the tests, and the save inspection tools.

## Built with

- Plain JavaScript ES modules, with no framework and no build step for the site
- Rust compiled to WebAssembly for save decryption
- Python tools for inspecting saves and for placing the map tiles
- GitHub Actions running the Rust, JavaScript and Python tests; the site deploys only after they pass

## Assets

Game sprites, icons and map art under `web/assets/img/` belong to Team Cherry. They are used here for a free, non-commercial fan tool with no affiliation to Team Cherry, and will be removed on request. The license below covers the code in this repository, not the game assets.

## License

GPL-3.0. See [LICENSE](LICENSE).
