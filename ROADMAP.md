# ROADMAP.md - Silksong Webweaver: Target Architecture and Phased Plan

**Purpose:** A plan an AI agent can execute phase by phase without further input from the owner. Every phase states its goal, the debt items it retires (D-numbers from [OPUS.md section 12](OPUS.md#12-known-issues-and-technical-debt)), exact steps with file paths, acceptance criteria that can be checked mechanically, and the docs to update.

**Prerequisite reading:** [OPUS.md](OPUS.md) in full.

**Written:** 2026-09-18. Phases are ordered by dependency, not by size. Do not skip Phase 0 or Phase 1; every later phase assumes them.

---

## Table of Contents

0. [How to Work This Roadmap](#0-how-to-work-this-roadmap)
1. [Target Architecture](#1-target-architecture)
2. [Phase 0 - Hygiene and Safety Net (DONE 2026-09-23)](#phase-0---hygiene-and-safety-net-done-2026-09-23)
3. [Phase 1 - Core Rework (DONE 2026-09-30)](#phase-1---core-rework-done-2026-09-30)
4. [Phase 2 - Parsing Coverage (DONE 2026-09-30)](#phase-2---parsing-coverage-done-2026-09-30)
5. [Phase 3 - Hero's Path and Map (DONE 2026-10-28)](#phase-3---heros-path-and-map-done-2026-10-28)
6. [Phase 4 - App Shell Consolidation (DONE 2026-10-28)](#phase-4---app-shell-consolidation-done-2026-10-28)
7. [Phase 5 - DLC Readiness](#phase-5---dlc-readiness)
8. [Phase 6 - Stretch](#phase-6---stretch)
9. [DLC Playbook](#dlc-playbook)
- [Asset Requests](#asset-requests)
- [Appendix A - Open Data Questions](#appendix-a---open-data-questions)
- [Appendix B - Fixture Guidelines](#appendix-b---fixture-guidelines)
- [Appendix C - Category Module Template](#appendix-c---category-module-template)

---

## 0. How to Work This Roadmap

### Operating rules for an agent
1. Work one phase at a time, in order. Inside a phase, steps are ordered; each step should leave `npm test` green.
2. Before starting, run the verification block below and confirm it is green. If it is not, fix that first (it is Phase 0 work).
3. Never commit `.dat` files, `savefiles/`, `output*.json`, or anything under `tools/__pycache__`.
4. Never change the AES key, header or trailer constants in `wasm-crypto/src/lib.rs`.
5. When a save flag is not known, keep `flagType: 'unknown'` and add the item to Appendix A. Do not guess.
6. Update OPUS.md whenever a path, shape, or workflow changes. Update the "Last verified" date.
7. Commit at the end of every step with a message that names the phase and step (`phase1-step3: registry for bosses`). **Never `git push`** and never open PRs; the owner reviews and pushes.
8. If a step is impossible with the data on hand (for example a flag needs a save the repo does not have), finish the rest of the phase, mark the step "blocked: needs <save state>" in this file, and continue.

### Verification block (run after every step)
```bash
cd web && npm test
```
```bash
cargo test --manifest-path wasm-crypto/Cargo.toml && cargo fmt --check --manifest-path wasm-crypto/Cargo.toml && cargo clippy --manifest-path wasm-crypto/Cargo.toml -- -D warnings
```
Then serve `web/` (`npx --yes serve web -l 5175`), open `index.html#stats`, load a save from `savefiles/` and check the browser console is free of errors and that every tab renders.

### Definition of done for a phase
- All acceptance criteria listed for the phase are met.
- Verification block is green.
- OPUS.md reflects the new state; this file has the phase marked `DONE (date)` in its heading.

---

## 1. Target Architecture

This section is the set of rework recommendations. Each rework names the debt it retires. Phase 1 implements the foundations; later phases build on them.

### 1.1 Target module layout (`web/src/`)

```
web/src/
├── app/
│   ├── main.js              # bootstrap only: init wasm, wire upload, route pages, call registry
│   ├── saveStore.js         # single in-memory save state + change events (shared by stats/timeline/map)
│   ├── router.js            # sidebar pages + tabs from data-page / data-tab (no iframes)
│   └── upload.js            # file input, drag-drop, landing hand-off
├── core/
│   ├── wasm.js              # loadWasm(), decryptSave(bytes) -> normalised plain-object save
│   ├── normalize.js         # toPlain(): Map -> object deep conversion (defensive)
│   ├── saveAccess.js        # savedDataByName(), questCompleted(), scenePickup(), flag()
│   ├── icons.js             # iconUrl(kind, file) with encodeURIComponent
│   ├── format.js            # formatPlayTime, formatNumber, formatPercent
│   └── version.js           # parseGameVersion(), compareVersion()
├── data/
│   ├── packs/
│   │   ├── index.js         # PACKS[], activePacks(save), mergedList(category, packs)
│   │   ├── base/            # base-game content, one file per category
│   │   │   ├── index.js     # { id:'base', detect: () => true, areas, tools, bosses, maps, ... }
│   │   │   ├── tools.js  bosses.js  maps.js  crests.js  abilities.js  skills.js
│   │   │   ├── fleas.js  unlockables.js  collectables.js  journal.js  quests.js  areas.js
│   │   └── <dlc-id>/        # same shape; added when a DLC ships (see DLC Playbook)
│   ├── categories/          # one module per UI category: parse + render + completion
│   │   ├── index.js         # CATEGORIES registry (ordered)
│   │   ├── general.js  current.js  tools.js  bosses.js  maps.js  fleas.js
│   │   ├── crests.js  abilities.js  skills.js  unlockables.js  collectables.js  journal.js  misc.js
│   ├── completion.js        # computeCompletion(parsed, packs) -> { total, byCategory }
│   ├── index.js             # parseAllData(playerData, sceneData) kept for compatibility
│   └── __fixtures__/        # minimal sanitised saves + expected values (Appendix B)
├── ui/
│   ├── renderers.js         # renderIconGrid, renderChecklist, renderStatFields, setCount
│   └── modal.js             # tool-variants popup and upload modal
├── timeline/                # Hero's Path as a module, replaces exploration_timeline.html (done in Phase 3)
├── map/                     # map data + scene -> tile lookup shared by map pages (sceneTiles.js)
└── styles.css
```

Old files `data/silksongdata.js` and `data/parsers.js` survived Phase 1 as thin re-export shims so existing tests kept passing; they were deleted in Phase 4 (2026-10-10).

### 1.2 Normalise at the WASM boundary (retires D1, D5)

**Rust:** serialise with `serde_wasm_bindgen::Serializer::json_compatible()` so objects arrive as plain JS objects, and return the whole decrypted JSON rather than two hand-picked roots.

```rust
// lib.rs - new API; keep decrypt_and_parse() as a thin wrapper for one release
#[wasm_bindgen]
pub fn decrypt_save(data: &[u8]) -> JsValue {
    let result = match decrypt_save_file(data) {   // now returns the full serde_json::Value
        Ok(save) => DecryptResult { success: true, error: None, save: Some(save) },
        Err(e)   => DecryptResult { success: false, error: Some(e), save: None },
    };
    let ser = serde_wasm_bindgen::Serializer::json_compatible();
    serde::Serialize::serialize(&result, &ser).unwrap_or(JsValue::NULL)
}

#[wasm_bindgen]
pub fn decrypt_to_json(data: &[u8]) -> Result<String, JsValue> { /* plaintext JSON string, for exports and tools */ }
```

**JS:** `core/wasm.js` exposes `decryptSave(bytes)` which calls the new export, runs `toPlain()` defensively, and returns `{ playerData, sceneData, ...otherRoots, raw }`. All parsers then assume plain objects; every `instanceof Map` branch in `parsers.js` and `main.js` is deleted.

Why: it removes the double code path, makes the unit tests represent production, and lets a DLC add a new top-level root without a Rust rebuild.

### 1.3 Category registry (retires D2, part of D3)

Each UI category is one module exporting `{ id, tab, title, parse(save, ctx), render(result, ctx), completion? }` (template in Appendix C). `categories/index.js` exports the ordered `CATEGORIES` array. Then:

```javascript
// data/index.js
export function parseAllData(playerData, sceneData) {
  const save = { playerData, sceneData };
  const ctx = makeContext(save);                // packs, lists, helpers
  const out = {};
  for (const c of CATEGORIES) out[c.id] = c.parse(save, ctx);
  out.raw = playerData; out.rawScene = sceneData; // compatibility
  return out;
}
// app/main.js
export function displayStats(parsed) {
  const ctx = makeRenderContext(parsed);
  for (const c of CATEGORIES) c.render(parsed[c.id], ctx);
}
```

Why: adding a category becomes "add one module and one `<div class="tab-panel">`". The seven copy-pasted grid loops collapse into `renderIconGrid`.

### 1.4 Content packs for DLC and versions (retires D4)

A pack is a folder of per-category lists plus a `detect(save)` predicate. `packs/index.js` merges the lists of all active packs; every merged entry is stamped with `pack: '<id>'`.

```javascript
// packs/base/index.js
export default {
  id: 'base', label: 'Silksong', minVersion: '1.0.0',
  detect: () => true,
  areas, tools, bosses, maps, crests, abilities, skills, fleas, unlockables, collectables, journal, quests,
};
// packs/<dlc>/index.js
export default {
  id: 'dlc1', label: '<DLC name>', minVersion: '1.1.0',
  detect: (save) => 'SomeDlcOnlyFlag' in save.playerData,   // presence probe beats version compare
  bosses: [...], maps: [...], areas: [...], ...
};
// packs/index.js
export const PACKS = [base /*, dlc1 */];
export function activePacks(save) { return PACKS.filter(p => p.detect(save)); }
export function mergedList(name, packs) { return packs.flatMap(p => (p[name] ?? []).map(e => ({ ...e, pack: p.id }))); }
```

Rules:
- Every schema entry gets a stable `id` (kebab-case, never displayed) in addition to `json`. Icons, wiki links and fixtures reference the `id`, so a renamed save key does not ripple.
- Totals (`28 maps`, `59 tools`) are never written in HTML. Counts come from `stats.total` of the merged list.
- `detect` for a DLC uses a presence probe on a key that exists only in DLC saves (found by the unknown-keys tool, section 1.9). `minVersion` is informational.
- `areas` (scene prefix, display name, colour) moves into packs so the timeline, map legend and gap tool stop hard-coding area lists.

### 1.5 Schema hygiene (retires D3, D14, D15)

Move every schema-like constant into the base pack:
| Today | Target |
|---|---|
| `upgradeSets` in `parseTools()` | `packs/base/tools.js` export `TOOL_UPGRADE_SETS` |
| `SKILL_ICON_MAP` in `parsers.js` | `packs/base/skills.js` entries gain `equipName` (`'Silk Spear'`) |
| `CLOAK_TIERS`, `NEEDLE_DATA` in `main.js` | `packs/base/unlockables.js` |
| `Silk Snare`/`Extractor` are "Others" | `TOOLS` entries gain `countsTowardTotal: false` |
| per-checklist icons in `main.js` | `*_SOURCES` lists gain `icon` |
| `HasAbyssMap` placeholder special case | `MAPS` entry gains `iconStyle: 'placeholder'` |
| `FLEAS_LIST` mixed kinds | entries gain `kind: 'flea' | 'npc'` |
| `CURRENT_FIELDS_LIST` duplicates | remove duplicated `maxHealth`/`silkMax` |

### 1.6 Renderers and icon resolver (retires D2)

`ui/renderers.js`:
```javascript
renderIconGrid(container, items, { iconKind, isOn: (i) => boolean, onClass = 'unlocked', offClass = 'locked', onClick })
renderChecklist(container, sources, { iconKind })          // collected | missing | pending rows
renderStatFields(root, fields)                             // data-stat spans
setCount(id, value); setPercent(id, value, { maxed })
```
`core/icons.js`:
```javascript
export const ICON_DIRS = { tool: 'assets/img/tools', boss: 'assets/img/bosses', map: 'assets/img/maps',
  ability: 'assets/img/general/ability', skill: 'assets/img/general/skills', crest: 'assets/img/general/crests',
  nail: 'assets/img/general/nail', general: 'assets/img/general', journal: 'assets/img/journal' };
export const iconUrl = (kind, file) => `${ICON_DIRS[kind]}/${encodeURIComponent(file)}`;
```
Every `img.src` goes through `iconUrl`. Missing icons get `onerror` fallback to a placeholder per kind.

### 1.7 Completion model with an oracle (retires D10)

`data/completion.js` computes `{ total, byCategory: [{ id, label, earned, max }] }` from parsed data using weights declared on category modules. The game's `playerData.completionPercentage` is the oracle: a fixture test asserts `|computed - oracle| <= 0.5` for every fixture. Until all categories are modelled the test asserts `computed <= oracle` and reports the gap, so coverage progress is visible.

Weights to verify against fixtures (hypotheses from the current code, not facts): masks 5, spool 9, silk hearts 3, needle 4, crafting kit 4, tool pouch 4, crests 6 (Hunter excluded), abilities 6, skills 6, other unlockables 2, tools 1 each for tools with `countsTowardTotal`. Sum must reach 100 with the fixtures' oracle; adjust the hypotheses, not the oracle.

### 1.8 Single page, shared state (retires D6, D7)

Replace both iframes with modules that read the same `saveStore`. The landing page hand-off keeps the bytes in `sessionStorage` but encodes with a chunked loop (or stores the `ArrayBuffer` in IndexedDB), never `String.fromCharCode(...bytes)`.

```javascript
// app/saveStore.js
const listeners = new Set();
let state = { file: null, save: null, parsed: null, packs: [] };
export const saveStore = {
  get: () => state,
  set(next) { state = { ...state, ...next }; listeners.forEach(l => l(state)); },
  subscribe(l) { listeners.add(l); return () => listeners.delete(l); },
};
```
Timeline and map subscribe; uploading once feeds every page.

### 1.9 Test and tooling strategy (retires D11, D12, D16)

- `web/src/data/__fixtures__/*.json`: small sanitised saves produced by `tools/make_fixture.py` (Appendix B). Each has a sibling `*.expected.json` with the oracle values (`completionPercentage`, counts).
- Contract tests: every `json` key in every pack list must appear in at least one fixture (catches typos); every `icon` must exist on disk (vitest can `fs.existsSync` under `web/assets`).
- Python: `tools/decrypt_save.py` (CLI decrypt to JSON), `tools/diff_saves.py` (flag discovery), `tools/unknown_keys.py` (keys present in a save but absent from all packs, grouped by prefix), with pytest tests under `tools/tests/`.
- Map data: `tools/tilefit/` is authoritative; `run_all.py` publishes the reviewed `tile_coordinates.json` and `scene_tiles.json` to `web/assets/img/fullmap/` so nothing is copied by hand.

---

## Phase 0 - Hygiene and Safety Net (DONE 2026-09-23)

**Goal:** A clean, reproducible baseline before any refactor. **Retires:** D11, D12 (partly), D13, D14. **Depends on:** nothing.

### Steps
1. **Commit or stash the current work-in-progress** so the tree is clean. The uncommitted changes (sceneData in WASM, source checklists, crests, stats.html) are coherent and should be committed as `wip: unlockables checklists, crests, sceneData`.
2. **Fix `.gitignore`** by appending:
   ```
   *.dat
   /savefiles/
   /output*.json
   /outputdelete.json
   /*.png
   /*_report.txt
   __pycache__/
   *.pyc
   ```
   Then `git rm --cached user1.dat tools/__pycache__ -r`. Keep `web/pkg/` tracked (static hosting needs it).
3. **Add `tools/decrypt_save.py`** (pycryptodome): read `.dat`, strip 25-byte header and 1-byte trailer, base64-decode, AES-256-ECB decrypt with the key from OPUS section 4, PKCS7-unpad, write JSON. CLI: `python tools/decrypt_save.py in.dat out.json`. Add `pycryptodome` to `requirements-dev.txt`.
4. **Add `tools/diff_saves.py`**: `python tools/diff_saves.py a.json b.json` prints playerData keys whose value changed (grouped: bool flips, int changes, list length changes) and `sceneData.persistentBools/Ints` entries added or changed, keyed by `SceneName/ID`.
5. **Add `tools/unknown_keys.py`**: loads a decrypted save and every `json`/`flag`/`sceneId` referenced in `web/src/data/**/*.js` (regex over the source is acceptable), prints unreferenced playerData keys grouped by prefix (`defeated`, `Has`, `SavedFlea_`, `Purchased`, `Collected`, `has`, `met`, other). This restores the deleted `analyze_unused_flags.py`.
6. **Add `tools/tests/test_tools.py`** with pytest covering decrypt (round-trip on a synthetic encrypted blob built in the test with the same key), diff, and unknown-keys on tiny inline JSON. Add a `python-tests` job to `ci.yml` (`pip install -r requirements-dev.txt && pytest tools`).
7. **Make `merge_all_tiles.py` copy** `confirmed_tiles.json` and `map_transform.json` from `tools/` to `web/assets/img/fullmap/` after merging, and document that the web copies are generated.
8. **Remove the stray `console.log` in `updateNeedleDisplay`** and the duplicated `maxHealth`/`silkMax` in `CURRENT_FIELDS_LIST` (adjust `main.js` to read them from `general`).
9. **Create fixtures** per Appendix B from `savefiles/0completelynew.json`, `savefiles/0steelsoul.json`, `savefiles/2aftermossmother.json`, and `output2.json` (late game). Add a first fixture test in `parsers.test.js` that `parseAllData(fixture.playerData, fixture.sceneData)` does not throw and that `bosses.stats.defeated`, `maps.stats.unlocked`, `tools.stats.unlocked` equal the values in `*.expected.json`.
10. Update DEVELOPMENT.md to point at OPUS.md and delete duplicated content.
11. **Gate deploy on tests.** In `deploy.yml`, trigger on `workflow_run` of CI with `conclusion == 'success'` on `main` (or merge the test jobs into the deploy workflow and make `build` `needs:` them). A red test run must never publish.
12. **Untrack the personal save.** `git rm --cached user1.dat`. It stays in history; rewriting history is the owner's decision and is out of scope.
13. **Save-slot and save-location UX.** Replace every "user1.dat" string in the UI with generic wording ("your save file, e.g. user1.dat to user4.dat"). Add a collapsible "Where is my save?" note next to the upload area with the paths per platform: Windows `%USERPROFILE%\AppData\LocalLow\Team Cherry\Hollow Knight Silksong\<steam-id>\`, macOS `~/Library/Application Support/unity.Team-Cherry.Silksong/<steam-id>/`, Linux/Steam Deck `~/.config/unity3d/Team Cherry/Hollow Knight Silksong/<steam-id>/`. Mark the paths "verify" in OPUS until the owner confirms them on each platform.
14. **Asset attribution.** Add an "Assets" section to README stating that game sprites, icons and map art are property of Team Cherry, used for a non-commercial fan tool, and will be removed on request. Whether to keep hosting them in the repo is an owner decision (Appendix A).

### Acceptance criteria
- `git status` shows no `.dat`, `savefiles/`, `output*.json`, or `__pycache__`.
- `pytest tools` passes locally and in CI.
- `python tools/decrypt_save.py savefiles/0completelynew.dat /tmp/x.json` produces JSON with `playerData` and `sceneData`.
- Four fixtures exist under `web/src/data/__fixtures__/` and the fixture test passes.
- `deploy.yml` cannot run its build job when CI fails; `git ls-files '*.dat'` is empty; no UI string mentions `user1.dat` alone; README has an Assets section.
- Verification block green.

### Phase 0 results
- Commits `phase0-steps3-6` through `phase0-steps10,14`. Step 1 and 2 were done earlier in commits `a09712e` to `9b54f26`.
- Fixtures: `new-game`, `steel-soul`, `early-game`, `late-game` (72%), `complete` (100%, from `savefiles/user3.dat`). The largest is 171 KB (journal, quests and scene lists are needed by Phase 2), so the Appendix B size target is now 200 KB.
- `savefiles/2aftermossmother.json` is a corrupted hand-made dump (55 keys missing, stray empty key). Always build fixtures and diffs from `.dat`.
- Saves in `savefiles/` span game versions 1.0.28561, 1.0.28714, 1.0.28891 and 1.0.29315, with 1305 to 1315 playerData keys. Patch drift is real, which motivates the Phase 1 patch-drift contract test.
- **Oracle finding:** the 100% save reports 16 of 18 spool fragments. The quest-reward flags `pilgrimQuestSpoolCollected` and `tookGreymoor17Spool` are false in a save with `silkMax` 18, so both schema entries are wrong. Pinned with `it.fails` in `fixtures.test.js`; Phase 2 step 6 fixes them.
- `tools/unknown_keys.py output2.json --bools-only` baseline: 1024 unreferenced **boolean** keys (1164 of 1312 keys of any type without the flag).
- Verification: vitest 541, pytest 13, cargo test 7, fmt and clippy clean. Save-location help and the current-field change verified in the browser.

---

## Phase 1 - Core Rework (DONE 2026-09-30)

**Goal:** Implement the target architecture (sections 1.2 to 1.7) with zero visible behaviour change, then prove it by converting the Fleas placeholder into a real tab in under 50 lines. **Retires:** D1, D2, D3, D4, D5, D8, D10, D15. **Depends on:** Phase 0.

### Steps
1. **WASM boundary.** Add `decrypt_save` and `decrypt_to_json` to `lib.rs` as in section 1.2; keep `decrypt_and_parse` delegating to the same internals. Rebuild `web/pkg`. Add a Rust test that `decrypt_save` on a synthetic blob (encrypt in-test with the `aes`/`ecb` crates) round-trips a JSON object with a nested object and array.
2. **`core/normalize.js`** with `toPlain(value)` (recursive Map to object, arrays mapped). **`core/wasm.js`** with `loadWasm()` and `decryptSave(bytes)` returning `{ playerData, sceneData, roots: {...all}, }` as plain objects. Unit test `toPlain` on nested Maps.
3. **`core/saveAccess.js`**: `flag(pd, key)`, `savedDataByName(container)` returning a `Map<name, Data>`, `questCompleted(pd, name)`, `scenePickup(sd, sceneName, id)`, `persistentInt(sd, sceneName, id)`. Port the private helpers from `parsers.js` here and delete their `instanceof Map` branches.
4. **`core/icons.js`, `core/format.js`, `core/version.js`** as in section 1.6; move the three formatters out of `parsers.js` (re-export from the old location).
5. **Packs.** Create `data/packs/base/*.js` by moving each list from `silksongdata.js`; add `id` to every entry (derive from `json`, kebab-case, then hand-fix collisions); move the constants listed in section 1.5. Create `packs/base/areas.js` from the area prefix lists currently hard-coded in `exploration_timeline.html` (`getAreaFromScene`) and `map_viewer.html` (legend colours). `data/packs/index.js` exports `PACKS`, `activePacks`, `mergedList`. Keep `silksongdata.js` as a shim that re-exports `mergedList('<name>', [base])` under the old names.
6. **Renderers.** Create `ui/renderers.js`; replace the seven inline grid loops and the local `renderSourceChecklist` in `main.js` with calls. Behaviour must be pixel-identical (same class names, same tooltips).
7. **Category modules.** For each existing category create `data/categories/<id>.js` (Appendix C), moving the parse code from `parsers.js` and the render code from `main.js`. Order in `categories/index.js`: general, current, unlockables (crests, masks, spool, hearts, needle, kit, pouch, other), bosses, fleas, maps, collectables, misc. `parseAllData` and `displayStats` become the loops in section 1.3. Old `parsers.js` becomes a shim re-exporting the category `parse` functions under the old names so `parsers.test.js` still passes.
8. **Completion model.** `data/completion.js` per section 1.7 with the hypothesised weights; a fixture test that prints the per-fixture gap and asserts `computed <= oracle + 0.5`. Render the model's total next to the game's number on the Unlockables tab (label it "modelled") so discrepancies are visible in the UI.
9. **Fleas tab (proof of the pattern).** `packs/base/fleas.js` entries get `kind` and `icon` (use the existing flea sprite if present under `assets/img`, otherwise a shared placeholder and note it in Appendix A). `categories/fleas.js` renders an icon grid plus `saved/total` counters into `panel-fleas`, replacing the placeholder card in `stats.html`.
10. **Contract tests** (section 1.9): all icons exist on disk; every `json` key in packs appears in at least one fixture or is explicitly listed in an `ALLOW_MISSING` set with a comment; no duplicate `id` across packs.
11. **Patch-drift contract test.** For every fixture, assert that each `json` key referenced by an active pack is *present* in the save (value may be false). A key missing from a newer-version fixture means the game renamed or removed it; the test must fail with the key and fixture name rather than letting the item silently render as missing. Keys legitimately absent on early saves (lazy-created containers such as `Tools.savedData` entries) go in a per-list `optionalKeys` set with a comment.
12. Delete every remaining `instanceof Map` in `web/src`. The only one allowed is the boundary converter `core/normalize.js`.

### Acceptance criteria
- `grep -rn "instanceof Map" web/src` matches only `core/normalize.js`; `grep -rn "assets/img/" web/src --include=*.js` only matches `core/icons.js`.
- `main.js` is under 250 lines; no category-specific rendering remains in it.
- Loading each fixture save renders every tab with the same counts as before the refactor (record them in Phase 0 step 9 and compare).
- Fleas tab shows saved/total from the fixture with correct `kind` split (27 fleas, 3 NPC-type entries shown in a separate "Others" row).
- Completion test passes and the printed gap per fixture is recorded in this file under Phase 1 results.
- Verification block green; OPUS.md sections 3, 6, 7, 8 rewritten to describe the registry/pack design.

### Phase 1 results
- Commits `phase1-step0` to `phase1-steps10-11`, plus `fix: equipped Sharp Dart and Pale Nails...`. Every step left the golden render test (`src/render.test.js`, added as step 0 before any refactor) unchanged except the two intentional visual additions (completion breakdown, Fleas tab). After each step the live page in Chrome, with the real WASM and the real 100% and Steel Soul saves, was compared with the goldens: zero differences.
- `main.js` 1108 -> 173 lines. `instanceof Map` remains only in `core/normalize.js`; `assets/img/` only in `core/icons.js`.
- **Completion model: gap 0 on every fixture**, and on 4 more saves (3%, 6%, 8%, 0%) across versions 1.0.28561 to 1.0.29315. Breakdown in OPUS section 8. Bosses, maps, fleas and the journal do not count.
- Fleas tab: 27 scattered + 3 special fleas, all counted (the special ones are fleas recruited through events, so they are shown as their own section rather than "Others").
- Found and fixed: equipped Sharp Dart and Pale Nails rendered as unknown tools; the slot names are `Silk Charge` and `Silk Boss Needle` (OPUS D21).
- Found, not fixable with the saves on hand: `FleasCollectedTargetOrder` exists only in 1.0.28561 saves (OPUS D20, Appendix A).
- Deviation: `app/`, `core/`, `ui/` exist as planned, but `main.js` stays at `src/main.js` (no need to move it until Phase 4 merges the pages).
- Tests: 611 JS, 13 Python, 9 Rust.

---

## Phase 2 - Parsing Coverage (DONE 2026-09-30)

**Goal:** Parse every remaining save section the README lists, using the Phase 1 pattern. **Retires:** D9. **Depends on:** Phase 1.

Each step is one category module plus one pack file plus fixtures expectations. Order chosen so that each step is independently shippable.

### Steps
1. **Hunter's Journal.** `packs/base/journal.js`: one entry per enemy `{ id, json: '<internal Name in EnemyJournalKillData>', display, icon: '<file in assets/img/journal>', killsRequired }`. The 232 icon filenames follow `"<Display> - <Internal Name> #<id>.png"` (some are `"<Display> #<id>.png"`), so the mapping can be bootstrapped by a one-off script that parses the filenames; `killsRequired` must come from the wiki and is `null` until filled. `categories/journal.js` renders a grid with three states (`unseen`, `seen`, `complete`) and counters (seen/total, completed/total). The journal does **not** count toward the game's % (the Phase 1 model is exact without it), so it gets no `completion()` hook.
2. **Collectables.** Extend `packs/base/collectables.js` with Relics (`Relics.savedData`: collected/deposited), Materium (`MateriumCollected.savedData`), Mementos (the eight booleans in TO-DO.txt plus `MementosDeposited`), and consumables (`Collectables.savedData` with `Amount`). `categories/collectables.js` gets sub-sections; Memory Lockets and Craftmetal move into it unchanged.
3. **Quests.** `packs/base/quests.js` from `QuestCompletionData.savedData` names (47 in the sample; use `unknown_keys.py` and the wiki for display names and givers). Render accepted/completed with `CompletedCount` for repeatables. Wishes and quest boards are the same container.
4. **Story timeline data.** Parse `StoryEvents` (`EventType`, `PlayTime`, `SceneName`) into a `story` category (no tab yet; consumed by Phase 3 timeline markers).
5. **Benches and bellways.** Parse `scenesEncounteredBench`, `scenesEncounteredCocoon`, `hasPinBench`-style flags and the `*Bench*` booleans into a `travel` sub-section of Maps (count of benches rested at; bellways unlocked from `Bellway_*` scene flags in `persistentBools` if identifiable).
6. **Fix the two wrong spool fragment flags first** (see Phase 0 results): diff `savefiles/user2.dat` against `savefiles/user3.dat`, look for quest completions and booleans that correlate with the Sherma and Greymoor_17 rewards, then flip the `it.fails` in `fixtures.test.js` to `it` and re-run `node scripts/snapshot-fixtures.mjs`.
   **Resolve unknowns with the diff tool** for Tool Pouch (Loddie), Craftmetal 8th, and Memory Lockets (resolved 2026-10-28, Appendix A). Leads from the 100% save: purchase flags `PurchasedPilgrimsRestMemoryLocket`, `PurchasedBelltownMemoryLocket`, `purchasedGrindleMemoryLocket` (Grindle is missing from the current 20-entry list); world pickup `Shadow_27 / Breakable Hang Sack Memory Locket`; the item's internal collectable name is `Crest Socket Unlocker`. Other world lockets are likely generic `Collectable Item Pickup*` IDs, so match them by `SceneName` against the wiki rooms. Method: OPUS section 11. Expected outcome for lockets: purchases map to `Purchased*Locket`/`*MemoryLocket*` booleans, world pickups to `persistentBools` with an ID containing `Locket`; grep `output2.json` and the fixtures for `Locket` (case-insensitive) first. Anything not resolvable from the saves on hand stays `unknown` and goes to Appendix A.
7. **Update README to-do checkboxes** to match reality.

### Acceptance criteria
- Journal, Collectables, Quests tabs render from fixtures; counts match `*.expected.json` values added in this phase.
- `python tools/unknown_keys.py output2.json` reports fewer than 150 unreferenced boolean keys (down from about 1000); the remainder are listed by prefix in Appendix A with a one-line reason each ("NPC dialogue state", "tutorial prompt seen").
- Completion oracle gap per fixture is at most 1.0 or the remaining gap is explained in Phase 2 results.
- Verification block green; OPUS section 5 and 6 updated with the new containers and lists.

### Phase 2 results
- New tabs: Journal (235 enemies), Quests (74), Collectables gains relics, mementos, materium, inventory; Maps gains Bellway, Ventrica and map pins. StoryEvents parsed for Phase 3. All heading totals come from data (D4 closed).
- Spool rewards fixed (inferred: quest `Save Sherma`, `silkFarmBattle1_complete`); fragments now equal `(silkMax - 9) * 2` on every fixture. 3 of 20 Memory Lockets mapped.
- Unknown keys: 999 unreferenced booleans, 986 explained by `packs/base/untracked.js`, **13 unexplained** (OPUS D22 minibosses, 2 bench flags, 4 one-off room flags).
- Completion oracle gap: 0 on every fixture (unchanged; the new data does not count).
- Findings: materium presence = recorded; journal `HasBeenSeen` is a new-entry marker; quest `CompletedCount` is progress; benches cannot be counted.

---

## Phase 3 - Hero's Path and Map (DONE 2026-10-28)

**Goal:** Finish map coverage and make Hero's Path first-class. The standalone map viewer was dropped on 2026-10-09 (owner decision): Hero's Path covers the map, and placed markers would need an unknown in-game-units to map-pixels transform. **Depends on:** Phase 1 (areas in packs), Phase 2 step 4 (story events).

### Steps
1. **Tile gap closure.** DONE with `tools/tilefit`: every sprite is reviewed (`review.json`: 739 positioned, 92 removed) and the reviewed set is what the pages read. Coverage of map room pixels 98.4%; the remaining rooms (interiors, challenge rooms) are not drawn on the world map.
2. **Scene to tile mapping as data.** DONE: `tools/tilefit/scene_tiles.py` writes `scene_tiles.json` (aliases, hash/prefix/case-insensitive names, pieces by longest known scene) and the timeline looks scenes up there. The lookup lives in `web/src/map/sceneTiles.js`.
3. **Timeline module.** DONE: `web/src/timeline/` reads `saveStore` (no own WASM) and keeps the slider, play/pause, speed and revealed list, with story-event markers and the visited / in-game map toggle (`scenesMapped`). `exploration_timeline.html` is gone.
4. ~~**Map viewer module.**~~ Dropped 2026-10-09; `map_viewer.html` deleted. If wanted later, a `respawnScene` pin can go on Hero's Path.
5. **Dev viewer** DONE: `tools/tilefit/viewer.html` via `tools/tilefit/review_server.py` (not deployed).
6. **Mobile** DONE 2026-10-09: at 375 px Hero's Path fits the screen under the top bar (no page scroll), drag and pinch-zoom work (pointer events), story pins shrink to 8 px.

### Acceptance criteria
- Every sprite has a verdict in `tools/tilefit/review.json` or `confirmed_locks.json` (met).
- Scene lookup tests pass; the timeline lights the scenes `scene_tiles.json` covers (72% save: 557 of 686, 100% save: 658 of 842; the rest are not on the world map).
- One upload feeds Statistics and Hero's Path (no second upload) (met).
- Verification block green; OPUS section 9 updated (met: OPUS.md was rebuilt from the code on 2026-10-28; it had never been committed).

---

## Phase 4 - App Shell Consolidation (DONE 2026-10-28)

**Goal:** One page, one state, no iframes, no shims. **Retires:** remaining D13 (D6 retired by step 1, D7 in Phase 3). **Depends on:** Phase 3.

### Steps
1. DONE 2026-10-09: the `sessionStorage` base64 hand-off uses a chunked encoder (32 KB chunks, `app/upload.js#bytesToBase64`) and the landing page reuses `setupGlobalDragDrop`; `app/upload.test.js` round-trips a 400 KB save.
2. DONE 2026-10-10: one `index.html` with hash routes `#home` (the old landing page), `#stats`, `#timeline`, handled by `app/router.js` (`#map` / `#dev` dropped with the map viewer and the dev tile viewer). `stats.html` is a redirect that keeps its hash. (Home was dropped on 2026-10-28, owner decision: the app opens on Statistics, which shows its layout with N/A values and blurred lists until a save is loaded; `#home` falls back to `#stats`.) A save dropped on Home opens Statistics; the sessionStorage hand-off from step 1 is gone because there is no second page to hand off to.
3. DONE 2026-10-10: `silksongdata.js`, `parsers.js` and `data/index.js` deleted; their tests moved to `core/format.test.js`, `data/categories/parse.test.js` and `data/packs/lists.test.js` (same 658 tests). `exploration_timeline.html` and `map_viewer.html` were already gone.
4. Error handling DONE 2026-10-09: `app/errors.js` (`describeProblem`, `checkSave`) and `main.js#showError(kind, detail)`. Kinds: wasm-load, file-type, decrypt (wrong game or damaged), not-silksong (no playerData), unsupported-version (older than the oldest pack `minVersion`), parse (our bug), and unknown-content: a warning, with stats still shown, when the journal, quests, relics, materium or inventory hold names no pack lists (how a patch or DLC without a pack shows up).
5. **Mobile layout** DONE 2026-10-09 (D18, D23): at 768 px and below the sidebar becomes a 52 px top bar; `.app-main` has `min-width: 0`; card grids use `minmax(min(280px, 100%), 1fr)`; the 11-tab bar is one row that scrolls sideways (fits without scrolling from about 1250 px) and scrolls the active tab into view. Checked with no horizontal overflow on every tab at 375, 600, 768, 1024, 1280 and 1440 px.
6. Accessibility pass DONE 2026-10-10: one `<main>`; sidebar items are links (`aria-current`); the tab bar follows the ARIA tabs pattern (roving tabindex, Left/Right/Home/End); icon grids and checklists are lists whose items are named with their state; upgrade-set tool tiles open their dialog with Enter/Space; both dialogs have `role="dialog"`, close on Esc and return focus; the upload picker opens from the keyboard; icon-only timeline buttons have labels; `:focus-visible` ring; Hero's Path text colours raised to 4.5:1. axe-core 4.10 reports no violations on Home, Statistics (every tab, empty and loaded) and Hero's Path at 1280 px.
7. Performance DONE 2026-10-28: map data loads the first time Hero's Path is shown (Statistics makes no `fullmap/` request), and each tile's image is fetched the first time the tile is revealed. Measured on a local static server: Statistics page load 64 requests / 292 KB, save to rendered stats about 1.05 s (100% save, `savefiles/user3.dat`); Hero's Path, early-game save (`1belowmossmother.dat`): 9 map requests, 440 KB, drawn in 0.38 s; 100% save: 725 requests, 1.46 MB (map, JSON and 724 lit tiles), drawn in 0.70 s. Before, opening Hero's Path fetched all 738 tile PNGs (2.09 MB) whatever the save.
8. Tile weight DONE 2026-10-28: lossless WebP. `tools/tilefit/publish_tiles.py` (run by `run_all.py`) writes one WebP per confirmed sprite to `web/assets/img/fullmap/` and drops unused ones; the source PNGs and the labeled map moved to `tools/tilefit/sprites/` and are no longer deployed. Deployed tile bytes: 2.21 MB of PNG (831 files, 93 of them unused) -> 1.08 MB of WebP (738 files), 51% smaller; with the 2.83 MB labeled map no longer shipped, `fullmap/` sprites went from 5.04 MB to 1.08 MB. Atlases were not needed to reach the target.

### Acceptance criteria
- `ls web/*.html` shows `index.html` and `stats.html` (redirect only).
- Lighthouse accessibility score at or above 90 on the stats page. (Checked with axe-core instead, which Lighthouse's accessibility audit is built on: no violations.)
- Verification block green; OPUS sections 2 and 3 rewritten.

---

## Phase 5 - DLC Readiness

**Goal:** Everything needed to support a content expansion is in place before it ships. **Depends on:** Phase 1; better after Phase 4.

### Steps
1. **In-app unknown-keys panel** under a `?dev` route: lists playerData keys and `persistentBools` IDs not referenced by any active pack, grouped by prefix, with copy-to-clipboard. This is the browser twin of `tools/unknown_keys.py` and lets the owner explore a new save without Python.
2. **Pack scaffold script** `tools/new_pack.py <id> "<label>" <minVersion>` that creates `web/src/data/packs/<id>/` with empty category files and registers it in `packs/index.js` (behind `detect: () => false` until a probe is set).
3. **Version banner**: show `version` and the list of active packs in the General tab header.
4. **Fixture policy** for packs: every pack must ship at least one fixture where `detect` is true and one where it is false; contract test enforces it.
5. **Map extension path**: a new area gets tiles by adding its sprites to `tools/tilefit/sprites/` and running `tools/tilefit/run_all.py` on them and the map, then reviewing them in `tilefit_viewer.html`; see `tools/tilefit/README.md`.
6. Write the DLC Playbook section below into OPUS as the standing procedure.

### Acceptance criteria
- `python tools/new_pack.py demo "Demo" 9.9.9` followed by `npm test` passes with the demo pack present and detected false; removing it passes too.
- Dev panel lists unknown keys for the late-game fixture.
- Verification block green.

---

## Phase 6 - Stretch

Not required for "complete"; pick by owner interest. Each is independent.

- **Save comparison**: load two saves, diff every category (uses `saveStore` with two slots and the category `parse` outputs).
- **Export**: JSON and CSV of parsed data; PNG snapshot of the map with revealed tiles.
- **Shareable read-only link**: encode parsed summary (not the save) in the URL hash.
- **Wiki links** per item via `id` (a `wiki` field per entry).
- **Localisation**: display names keyed by the Phase 1 `id` in `packs/<pack>/i18n/<lang>.json`, falling back to English.
- **Save editing**: out of scope; would require re-encryption in WASM and is a different product.

---

## DLC Playbook

Run this when a DLC or major patch ships. Assumes Phases 0, 1 and 5 are done.

1. Obtain a save from the new content (owner provides `.dat`). Decrypt: `python tools/decrypt_save.py dlc.dat savefiles/dlc.json`.
2. `python tools/unknown_keys.py savefiles/dlc.json` (or the `?dev` panel). Pick one key that exists only in DLC saves as the pack's `detect` probe; confirm it is absent in every base fixture.
3. `python tools/new_pack.py <id> "<label>" <version>` and set `detect`.
4. Fill pack lists: bosses (`defeated*` keys), maps (`Has*Map`), tools (`Tools.savedData` names not in base), abilities/skills (`has*`), fleas, journal entries (`EnemyJournalKillData` names not in base), areas (new scene prefixes from `scenesVisited`), quests, unlockable sources (`diff_saves.py` between DLC saves).
5. Add icons under the existing `assets/img/<kind>/` folders; the icon contract test tells you what is missing.
6. Add a DLC fixture (Appendix B) with its oracle values. Update `completion.js` weights if the DLC changes the 100% breakdown; the oracle test will fail loudly if it does.
7. Map: if the DLC adds areas, obtain the new clean and labeled maps, update `tools/map_transform.json`, add the new sprites to `tools/tilefit/sprites/`, run `tools/tilefit/run_all.py` (drop `--skip-candidates`) and review the new sprites in `tilefit_viewer.html`.
8. Update OPUS.md status snapshot and this file.

Base-game saves must render identically before and after adding a pack; the contract test with `detect: false` fixtures guarantees it.

---

## Asset Requests

Art the UI would use if it were in `web/assets/img/`. Each row names the sprite, where it goes and what the app does without it. Sprites come from the game files (Team Cherry; see README "Assets"); export PNG with transparency at the game's native size. After adding one, point the code at it and drop the fallback.

| Sprite | Folder / file name | Used by | Fallback today |
|---|---|---|---|
| HUD mask, empty (lost health) | `general/hud_mask_empty.png` | Current tab health row (`categories/current.js`, `MASK_EMPTY`) | inventory health backboard (`Inv_0030_inv_health_backboard.png`), slightly different shape |
| HUD mask, empty, Steel Soul | `general/hud_mask_empty_ss.png` | same, Steel Soul saves | `Inv_health_backboard_SS.png` |
| HUD mask, full (cropped like the empty one) | `general/hud_mask_full.png` | same | `general_hp.png` |
| HUD silk spool: left cap, right cap, one thread segment full, one empty, and the broken-spool variant | `general/hud_silk_cap_l.png`, `hud_silk_cap_r.png`, `hud_silk_full.png`, `hud_silk_empty.png`, `hud_silk_broken.png` | Current tab silk spool (`.silk-spool` in `styles.css`) | CSS-drawn spool and thread segments |

---

## Appendix A - Open Data Questions

Items that cannot be resolved from the saves in `savefiles/` and `output2.json`. The owner can unblock each by producing a save immediately before and after the event and dropping the pair into `savefiles/`.

| Item | Needed save states | Notes |
|---|---|---|
| Deep Docks Memory Locket (`Dock_13`) | any save that has entered the room | mapping from the reference tracker; no fixture has the room yet, so it is listed in `SCENE_NOT_IN_FIXTURES` (contracts test) |
| Bilewater cocoon locket ID | a fixture rebuilt from `savefiles/user3.dat` | `Sack Corpse Pickup` (reference) vs `Breakable Hang Sack Memory Locket` (old guess, false in the 100% save); both are accepted. `make_fixture.py` now keeps `Corpse Pickup` IDs: rebuild the fixtures to confirm and drop the alias |
| Loddie's pouch picked up off the ground | none (reference) | if Loddie's challenge is skipped the pouch can be found at `Bone_12` / `Ladybug Craft Pickup`; add it as an alias once a save shows it |
| Leads | none | `PurchasedBelltownToolPouch` and `CollectedToolMetal` are false / always true and match no source; `CollectedToolMetal` looks like a "first craftmetal seen" flag |
| Minibosses (OPUS D22) | none | display names and icons for the 7 defeat flags |
| Journal `killsRequired` | none (wiki) | data entry task |
| Scenes without tile art (gap category D) | none | needs map art from the game's files |
| Flea icon | none | asset needed for the Fleas tab (the Huge Flea portrait stands in) |
| Keep hosting Team Cherry assets in the repo? | none (owner decision) | Alternatives: keep with attribution (default), or load from an external host. |
| Save paths per platform | none (owner check) | Confirm the Phase 0 step 13 paths on each platform. |

Add rows here whenever a step is blocked; remove them when resolved and note the resolving commit.

**Resolved 2026-10-28** (commit "data: map memory lockets, Loddie's pouch and the 8th craftmetal"), using the scene and flag names from [silksong-completionist](https://github.com/Br3zzly/silksong-completionist) (MIT) and checking each against the fixtures:
- Memory Lockets: 17 world pickups mapped by scene, Volatile Flintbeetles = quest `Rock Rollers`; `purchasedGrindleMemoryLocket` is Grindle's Act 3 restock of Mort's locket (same locket). The 100% fixture reads 17 of 20 (see the two rows above), the 72% fixture 12.
- Tool Pouch from Loddie: `pinGalleriesCompleted >= 1` (0 in early saves, 1 at 72%, 2 at 100%; the 72% save has all 4 upgrades, so its Loddie flag must be set).
- Fleamaster Tool Pouch: `Aqueduct_05` / `Caravan Troupe Leader Fleatopia NPC` replaces the `FleasCollectedTargetOrder` heuristic (that key is not written by newer versions, OPUS D20). Every fixture's pouch sources now equal `ToolPouchUpgrades`.
- Craftmetal 8th source: the Deep Docks chest, `Dock_03` / `Collectable Item Pickup`, set only in the 100% save. `Under_19b` is in the Underworks, not Deep Docks / Far Fields.
- Greymoor spool fragment: the Fleamaster's reward when the caravan reaches Greymoor (`CaravanTroupeLocation >= 2`), replacing the `silkFarmBattle1_complete` guess.

---

## Appendix B - Fixture Guidelines

- Location: `web/src/data/__fixtures__/<name>.json` plus `<name>.expected.json`. Generate expected files with `cd web && node scripts/snapshot-fixtures.mjs`; they hold `oracle` values read from the save and a `baseline` snapshot of parser output.
- Produce with `python tools/make_fixture.py in.json out.json` (create in Phase 0 step 9): keeps `playerData` keys that are referenced by any pack list or are scalar and under 64 characters, keeps every `savedData` container referenced by packs, keeps `scenesVisited`/`scenesMapped`, keeps `sceneData.persistentBools/Ints` entries whose `ID` matches `Heart Piece|Silk Spool|Tool Metal|Locket`, drops everything else. Target size under 200 KB. Always build from the `.dat`, never from a hand-made `.json`.
- `*.expected.json` holds: `completionPercentage`, `version`, `permadeathMode`, and per-category counts (`bosses.defeated`, `maps.unlocked`, `tools.unlocked`, `fleas.saved`, `crests.unlocked`, `maskShards.collected`, `spoolFragments.collected`). Fill from the game UI or the pre-refactor app, never from the code under test.
- Minimum set: `new-game`, `steel-soul`, `early-game` (after Moss Mother), `late-game` (72%), `complete` (100%). Add `dlc-*` per pack.
- Fixtures are derived from the owner's saves; they are play-state only, but keep them minimal so they stay reviewable.

---

## Appendix C - Category Module Template

```javascript
// web/src/data/categories/bosses.js
import { mergedList } from '../packs/index.js';
import { flag } from '../../core/saveAccess.js';
import { renderIconGrid, setCount } from '../../ui/renderers.js';

export default {
  id: 'bosses',
  tab: 'bosses',                 // panel id: panel-bosses
  title: 'Bosses',

  // ctx.packs: active packs for this save; ctx.lists(name) = mergedList(name, ctx.packs)
  parse(save, ctx) {
    const items = ctx.lists('bosses').map(def => ({
      ...def,
      defeated: flag(save.playerData, def.json),
    }));
    return { items, stats: { total: items.length, defeated: items.filter(i => i.defeated).length } };
  },

  render(result, ctx) {
    renderIconGrid(ctx.el('bosses-grid'), result.items, {
      iconKind: 'boss',
      isOn: i => i.defeated,
      onClass: 'defeated',
      offClass: 'not-defeated',
      label: i => i.display,
    });
    setCount('bosses-count', result.stats.defeated);
    setCount('bosses-total', result.stats.total);   // replaces the hard-coded "/36" in HTML
  },

  // optional: contribution to the completion model
  completion: null,
};
```

Contract for every module:
- `parse` is pure: same input, same output; no DOM access; must not throw on an empty `playerData` (`{}`) or missing containers.
- `render` touches only elements inside its own panel, obtained through `ctx.el(id)` which returns `null` safely when the panel is absent (so tests can call `render` with a stub context).
- Each entry produced by `parse` keeps `id`, `display`, `pack` from the schema so the UI and tests can key on them.
