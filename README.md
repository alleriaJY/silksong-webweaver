<img src="https://raw.githubusercontent.com/alleriaJY/silksong-webweaver/refs/heads/main/web/assets/img/silksong_logo.ico" alt="Silksong" title="Silksong Webweaver" align="left" height="70" />

# Silksong: Webweaver

Re-weaving the timeline. A Hollow Knight: Silksong savefile loader project for fun.

## Documentation

- [OPUS.md](OPUS.md) - as-is technical reference: architecture, save format, schema system, map pipeline, known debt.
- [ROADMAP.md](ROADMAP.md) - target architecture and the phased plan (Phase 0 to 6) with acceptance criteria, plus the DLC playbook.
- [DEVELOPMENT.md](DEVELOPMENT.md) - quick start for running and building locally.

## Status

### Completed
- [x] Web UI with drag-and-drop upload (landing page + stats page)
- [x] WASM-based decryption (Rust, AES-256-ECB)
- [x] GitHub Pages deployment with CI (Rust fmt/clippy/test, JS vitest)
- [x] Hero's Path exploration timeline over the Pharloom map
- [x] Tile confirmation pipeline (629 of 669 tiles confirmed)
- [x] Parsing: general stats, current state, tools (with upgrade sets), abilities, skills, crests, equipped loadout, bosses, maps, masks, silk spools, silk hearts, needle, crafting kit, tool pouch, craftmetal, other unlockables

### In progress / planned (see ROADMAP.md for the phase each belongs to)
- [ ] Phase 0: repo hygiene, Python decrypt/diff/unknown-keys tools, test fixtures
- [ ] Phase 1: core rework (plain-object WASM boundary, category registry, content packs, renderers, completion model), Fleas tab
- [ ] Phase 2: Hunter's Journal, Collectables (relics, materium, mementos, consumables), Quests, story events, benches; resolve Memory Locket flags
- [ ] Phase 3: close tile gaps, timeline and map viewer as modules sharing one upload
- [ ] Phase 4: single-page app shell, no iframes, accessibility and performance pass
- [ ] Phase 5: DLC readiness (pack scaffold, unknown-keys dev panel, version banner)
- [ ] Stretch: save comparison, exports, shareable summary links

## 📄 License

See [LICENSE](LICENSE) for details.