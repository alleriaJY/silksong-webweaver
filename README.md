<img src="https://raw.githubusercontent.com/alleriaJY/silksong-webweaver/refs/heads/main/web/assets/img/silksong_logo.ico" alt="Silksong" title="Silksong Webweaver" align="left" height="70" />

# Silksong: Webweaver

Re-weaving the timeline. A Hollow Knight: Silksong savefile loader project for fun.

## Documentation

- [OPUS.md](OPUS.md) - as-is technical reference: architecture, save format, schema system, map pipeline, known debt.
- [ROADMAP.md](ROADMAP.md) - target architecture and the phased plan (Phase 0 to 6) with acceptance criteria, plus the DLC playbook.
- [DEVELOPMENT.md](DEVELOPMENT.md) - quick start for running and building locally.

## Status

### Completed
- [x] Web UI with drag-and-drop upload: one page with Statistics and Hero's Path
- [x] WASM-based decryption (Rust, AES-256-ECB)
- [x] GitHub Pages deployment with CI (Rust, JS and Python tests); deploys only after CI passes
- [x] Hero's Path exploration timeline over the Pharloom map
- [x] Tile confirmation pipeline (738 reviewed WebP tiles, 98.4% map room pixel coverage)
- [x] Parsing: general stats, current state, tools (with upgrade sets), abilities, skills, crests, equipped loadout, bosses (40), maps, masks, silk spools, silk hearts, needle, crafting kit, tool pouch (all 4 sources), craftmetal (all 8 sources), other unlockables
- [x] Completion breakdown that recomputes the game's own percentage exactly
- [x] Hunter's Journal, Fleas, Quests, relics, mementos, materium, inventory, Key Items, Bellway and Ventrica travel
- [x] Phase 0: save tools (decrypt, diff, unknown keys, fixtures), repo hygiene
- [x] Phase 1: core rework (content packs, category modules, renderers, contract and golden tests)
- [x] Phase 2: parsing coverage; every save flag is either shown or classified with a reason
- [x] Phase 3: tile gaps closed, Hero's Path in the app on the shared upload, usable on phones
- [x] Phase 4: single-page app shell, no iframes, accessibility and performance pass

### In progress / planned (see ROADMAP.md for the phase each belongs to)
- [ ] Remaining 17 Memory Locket world-pickup IDs (need bracketing saves) and Journal `killsRequired`
- [ ] Stretch: save comparison, exports, shareable summary links

## Assets

Game sprites, icons and map art under `web/assets/img/` are the property of Team Cherry. They are used here for a free, non-commercial fan tool with no affiliation to Team Cherry, and will be removed on request. The code in this repository is covered by the license below; the game assets are not.

## 📄 License

See [LICENSE](LICENSE) for details.