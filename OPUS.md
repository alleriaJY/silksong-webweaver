# OPUS.md - Silksong Webweaver: As-Is Technical Reference

**Last verified:** 2026-10-28 (against `main` at the end of Phase 4).

This is the "what exists" companion to [ROADMAP.md](ROADMAP.md) ("what to do next") and [DEVELOPMENT.md](DEVELOPMENT.md) ("how to run it"). Section numbers are stable: ROADMAP and code comments link to them (for example "OPUS section 5").

> History note: earlier phases referred to an OPUS.md that lived only on the owner's machine and was never committed. This file was rebuilt from the code on 2026-10-28. Debt items whose original wording was not recoverable are listed by number only (section 12).

---

## 1. Overview

A static web app (GitHub Pages) that decrypts a Hollow Knight: Silksong `.dat` save in the browser (Rust compiled to WASM), parses it into categories, and shows:

- **Statistics** (`#stats`): eleven tabs of counts, icon grids and source checklists, plus a completion breakdown that recomputes the game's own percentage.
- **Hero's Path** (`#timeline`): the order in which the player visited scenes, replayed over the Pharloom map, with story-event pins.

Nothing is uploaded anywhere; the save never leaves the browser.

## 2. App shell

- One page, `web/index.html`. `web/stats.html` only redirects to `index.html` and keeps its hash.
- `app/router.js` handles hash routes `#stats` (default) and `#timeline`; unknown hashes and the old `#home` fall back to `#stats`. Each change fires `app:page` on `window`.
- `src/main.js` is bootstrap only: loads WASM, wires the upload modal and global drag-and-drop (`app/upload.js`), decrypts, calls `parseAllData` / `renderAll`, and reports problems through `app/errors.js` (`describeProblem`, `checkSave`).
- Before a save is loaded the Statistics page renders its real layout with N/A values and blurred, inert lists (`showPlaceholder` in `main.js`).
- `app/saveStore.js` holds the one loaded save (`status`, `fileName`, `save`, `parsed`, `error`); Hero's Path subscribes to it, so one upload feeds both pages.
- `app/tabs.js` implements the ARIA tabs pattern and loads a tab's deferred icons the first time it is shown (`ui/renderers.js#loadDeferredImages`).
- Local hosting only: `main.js#addDevPage` adds a `#dev` route (sidebar "Dev: save keys") when `app/devHost.js#isLocalHost` is true. `dev/unknownKeys.js` lists playerData keys no active pack reads (pack strings plus `CODE_READS`), explained by the `untracked` pack list or not; `dev/devPage.js` renders it. `deploy.yml` deletes `web/src/dev/` before uploading, so the published site has neither the route nor the code.
- `app/scene.js` picks a random background scene from `assets/img/scenes/`.

## 3. Module layout (`web/src/`)

```
app/        router, tabs, upload, errors, saveStore, scene, buildInfo
core/       wasm.js (only WASM caller), normalize.js (Map -> object), saveAccess.js,
            icons.js (only place that knows asset paths), format.js, version.js
data/
  packs/        index.js (PACKS, activePacks, mergedList) + base/ (one file per content list)
  categories/   one module per UI category; index.js is the ordered CATEGORIES registry
  completion.js computeCompletion / renderCompletion
  __fixtures__/ trimmed saves + *.expected.json oracle values
ui/         renderers.js (icon grid, checklist, setStat/setText/setPercent), modal.js
map/        sceneTiles.js (scene name -> map tile lookup)
timeline/   Hero's Path (timeline.js, story.js, timeline.css)
```

Rules that tests enforce: `instanceof Map` appears only in `core/normalize.js`; `assets/img/` appears only in `core/icons.js`.

## 4. Save format and decryption

- A `.dat` file is a 25-byte header, a base64 body and a 1-byte trailer. The body is AES-256-ECB with PKCS7 padding; the key and the header/trailer constants live in `wasm-crypto/src/lib.rs` and must never change.
- `wasm-crypto` exports `decrypt_save(bytes)` (plain-object result via `serde_wasm_bindgen` json-compatible serialiser) and `decrypt_to_json(bytes)`. The built package is committed under `web/pkg/` because Pages serves it as-is.
- `core/wasm.js#decryptSave` returns `{ playerData, sceneData, roots }` and throws `SaveDecryptError` on failure.
- Python twin for tooling: `tools/savelib.py` / `tools/decrypt_save.py`.

## 5. Save shapes

Read helpers are in `core/saveAccess.js`; every helper tolerates missing containers.

| Shape | Example | Helper |
|---|---|---|
| Top-level scalar | `playerData.maxHealth`, `playerData.HasAbyssMap` | `flag(pd, key)` |
| Name/Data container | `{ savedData: [ { Name, Data: {...} } ] }`: `Tools`, `QuestCompletionData`, `Collectables`, `Relics`, `MateriumCollected`, `MementosDeposited`, `ToolEquips` | `savedDataByName(container)` |
| Name/Record list | `EnemyJournalKillData: { list: [ { Name, Record } ] }` | `savedDataEntries(container)` |
| Scene lists | `sceneData.persistentBools/persistentInts: { serializedList: [ { SceneName, ID, Value, Mutator } ] }` | `scenePickup(sd, scene, id)`, `persistentInt(...)` |
| Story events | `playerData.StoryEvents: [ { EventType, SceneName, PlayTime } ]` | `data/categories/story.js` |

Notes:
- World pickups are `persistentBools` keyed by scene and object name. Most use generic IDs (`Collectable Item Pickup`, `Collectable Item Pickup (1)`), so a source can only be mapped once its scene is known.
- Quest data is `{ IsAccepted, IsCompleted, WasEverCompleted, CompletedCount, HasBeenSeen }`; `CompletedCount` behaves as a progress counter for collection wishes.
- Some keys exist only on some game versions (for example `FleasCollectedTargetOrder`, D20). The patch-drift contract test lists them.

## 6. Content packs and categories

- A pack (`data/packs/<id>/index.js`) is `{ id, label, minVersion, detect(save), lists }`. Only `base` exists. Every entry has a stable kebab-case `id`; `json`/`flag`/`sceneName`+`sceneId` point at the save.
- `mergedList(name, packs)` concatenates a list across active packs and stamps `pack`. Totals are never written in HTML; they come from list lengths.
- A category module is `{ id, parse(save, ctx), render?(result, ctx), completion?(result, parsed) }`. `parse` is pure; `render` writes only its own elements and is a no-op when they are missing. Template: ROADMAP Appendix C.
- Source checklists (`categories/checklists.js`) read `*_SOURCES` lists whose entries carry a `flagType`: `bool` (playerData boolean; `flag` may be a list, any counts), `atLeast` (playerData number `>= min`), `quest` (QuestCompletionData `IsCompleted`), `scene` (persistentBools; `sceneId` may be a list, any counts), `unknown` (rendered as Pending).
- Names shown to players are in-game names: area names, wish titles, item names. Scene codes (`Bone_East_20`) and internal quest names stay in `json` / `sceneName` / `flag` and tooltips; a contract test rejects them in `display` / `name`. Areas come from `packs/base/areas.js` (`areaName(scene)` in `map/sceneTiles.js`, longest prefix wins) and `MAP_ZONES` (for `playerData.currentArea`). Most names were checked against [silksong-completionist](https://github.com/Br3zzly/silksong-completionist) (MIT).
- `packs/base/untracked.js` classifies every playerData flag the app deliberately ignores, so `tools/unknown_keys.py` only reports genuinely new keys.

## 7. Renderers and icons

- `ui/renderers.js`: `renderIconGrid` (list semantics, state in `aria-label`), `renderChecklist` (collected / missing / pending rows), `setStat` (`[data-stat]`), `setText`, `setPercent`, `renderEmpty`, `deferSrc` / `loadDeferredImages`.
- `core/icons.js#iconUrl(kind, file)` maps kinds (`tool`, `boss`, `map`, `ability`, `skill`, `crest`, `nail`, `general`, `journal`) to `assets/img/...` and URL-encodes the file name. The icon contract test checks every referenced file exists.
- The golden render test (`src/render.test.js`) serialises the stats page for each fixture; regenerate snapshots only for intentional visual changes.

## 8. Completion model

`data/completion.js` sums `completion()` parts from categories and compares with `playerData.completionPercentage` (the oracle). Exact on 9 saves across 4 versions:

masks 5 + silk spool 9 + silk hearts 3 + needle 4 + crafting kit 4 + tool pouch 4 + crests 6 (Hunter excluded) + abilities 6 + skills 6 + other unlockables 2 + tools 51 = 100.

Bosses, maps, fleas, quests, relics and the Hunter's Journal do not count.

## 9. Map pipeline and Hero's Path

- `tools/tilefit/` is authoritative for map tiles: sprites in `tools/tilefit/sprites/`, review verdicts in `review.json` / `confirmed_locks.json`, `run_all.py` publishes `tile_coordinates.json`, `scene_tiles.json` and lossless WebP tiles (`publish_tiles.py`) to `web/assets/img/fullmap/`. See `tools/tilefit/README.md`. The dev viewer (`tools/tilefit/viewer.html` via `review_server.py`) is not deployed.
- `map/sceneTiles.js` resolves a scene name to tiles (aliases, hash suffixes, prefixes, case-insensitive, longest known scene for pieces).
- `timeline/` builds the map the first time Hero's Path is shown and fetches each tile image the first time it is revealed. It reads `scenesVisited` order, `scenesMapped` (in-game map toggle) and story events from `saveStore`.
- Coverage: 98.4% of map room pixels; the remaining scenes (interiors, challenge rooms) are not drawn on the world map.

## 10. Tests and tooling

| Suite | Command | Covers |
|---|---|---|
| Vitest (happy-dom) | `cd web && npm test` | parsers, fixtures vs `*.expected.json`, completion oracle, pack contracts (ids, icons, patch drift), golden render, router, errors, scene lookup |
| Rust | `cargo test --manifest-path wasm-crypto/Cargo.toml` | decrypt round-trip |
| Python | `pytest tools` | decrypt, diff, unknown keys, fixture builder |

Save tools: `decrypt_save.py`, `diff_saves.py` (flag discovery between two saves), `unknown_keys.py`, `make_fixture.py`. Fixtures keep scalars, the containers parsers read, and scene entries whose ID looks like a collectable (`PICKUP_ID` in `make_fixture.py`).

## 11. Status snapshot

- Phases 0 to 4 done (see ROADMAP headings). Phase 5 (DLC readiness) not started.
- Open data questions: ROADMAP Appendix A.

## 12. Known issues and technical debt

Retired: D1, D2, D3, D4, D5, D8, D10, D15 (Phase 1); D11, D12, D14, D16 (Phase 0/1); D6, D7, D13, D18, D23 (Phases 3-4); D17 (Phase 2, wrong spool reward flags); D21 (equipped Sharp Dart / Pale Nails slot names).

Open:
- **D20** `FleasCollectedTargetOrder` exists only in 1.0.28561 saves. Nothing reads it any more (the Fleamaster Tool Pouch now uses the Fleatopia scene flag); kept here in case a later feature wants the rescue order.
- **D22** Four miniboss defeat flags have no display names or icons (ROADMAP Appendix A); three of the original seven are now on the Bosses tab.
- Original wording of D9 and D19 was not recovered; reopen with a new number if the issue resurfaces.
