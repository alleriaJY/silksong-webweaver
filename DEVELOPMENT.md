# Development

Everything needed to run, test and extend Silksong Webweaver. For what the app does, see [README.md](README.md).

## Run locally

ES modules and WASM need http, not `file://`.

```bash
npx --yes serve web -l 5175
```

To reach it from another device on your network, run `python -m http.server 8080 --bind 0.0.0.0` inside `web/` and open `http://<your-ip>:8080`.

The site has no build step. The only compiled part is the WASM module. Its output in `web/pkg/` is committed, so a plain static server works without a Rust toolchain. Rebuild it only when `wasm-crypto/src/lib.rs` changes (CI rebuilds it anyway):

```bash
cd wasm-crypto && wasm-pack build --target web --out-dir ../web/pkg
```

## Tests

CI runs all three suites, and the site deploys only after they pass.

```bash
cd web && npm ci && npm test
```

```bash
cargo test --manifest-path wasm-crypto/Cargo.toml
```

```bash
pip install -r requirements-dev.txt && pytest tools
```

The JavaScript suite includes two kinds of snapshot that are meant to fail when output changes:

- **Render goldens** (`web/src/__snapshots__/render/`): the full Statistics page rendered for every fixture. After an intentional visual change, update them with `cd web && npx vitest run src/render.test.js -u` and review the diff.
- **Fixture expectations** (`web/src/data/__fixtures__/*.expected.json`): `oracle` values read straight from the save (the game's own numbers, which must never be edited to make a test pass) and a `baseline` of parser output. Regenerate the baseline with `cd web && node scripts/snapshot-fixtures.mjs`, and only when a behaviour change is intentional. Say so in the commit message.

## Code layout

```
web/
├── index.html            single page: upload, Statistics (#stats), Hero's Path (#timeline)
├── src/
│   ├── main.js           bootstrap: load WASM, wire upload, route pages
│   ├── app/              router, tabs, upload, save store, compare, export, build info
│   ├── core/             WASM wrapper, save normalisation, save access helpers, icons, formatting
│   ├── data/
│   │   ├── packs/base/   base-game content lists (bosses, tools, quests, ...), one file per kind
│   │   ├── categories/   one module per stats category: parse(save, ctx), render(result, ctx), completion()
│   │   ├── completion.js recomputes the game's completion percentage from category results
│   │   └── __fixtures__/ trimmed test saves and their expected values
│   ├── ui/               shared renderers (icon grids, checklists, counts) and modals
│   ├── timeline/         Hero's Path
│   └── map/              scene-to-tile lookup for the Pharloom map
└── assets/img/           icons, save art and map tiles
wasm-crypto/              Rust save decryption compiled to WASM
tools/                    Python save tools; tools/tilefit/ places map tiles
```

**Content lives in packs, logic lives in categories.** To add an item that fits an existing list (a boss, a tool, a quest), add an entry to the matching file in `web/src/data/packs/base/` and its icon under `web/assets/img/<kind>/`. The pack contract tests fail if an icon is missing or an id is duplicated. A new kind of data needs a category module in `web/src/data/categories/`, registered in `categories/index.js`. `parse()` must stay pure (no DOM access). `render()` writes only its own section and does nothing when that section is absent.

### Conventions and pitfalls

- **Icons**: filenames are exact and case-sensitive, and many contain spaces, `#`, `&` or apostrophes. Always build image URLs with `iconUrl(kind, file)` from `core/icons.js`, and never write an `assets/img/` path anywhere else.
- **Save data is plain objects**: `core/wasm.js` converts everything at the WASM boundary. Never add `instanceof Map` handling. If something looks like a Map, fix the boundary instead.
- **One save, many pages**: pages read the decrypted save from `app/saveStore.js`. Never decrypt a save or ask for an upload inside a page module.
- **Tabs and routes**: tabs use `data-tab` and `id="panel-<tab>"`, pages use `data-page` and `id="page-<route>"`, and routes live in `ROUTES` in `app/router.js`. Navigate by setting the hash (`router.go()`), never by toggling page classes.
- **Boss flags have no single pattern**: some are `defeatedX`, some `xDefeated`, and one is `PinstressPeakBattleAccepted`. Always read them from the pack list, never from a name pattern.
- **Crest names differ from the game's**: `Hunter`, `Hunter_v2` and `Hunter_v3` are one crest. `Toolmaster` is shown as Architect, `Spell` as Shaman, and `Warrior` as Beast.
- **Steel Soul** saves have `permadeathMode` set. Crests have `iconSteelSoul` variants, and `Dead Mans Purse` (Classic) and `Shell Satchel` (Steel Soul) never appear in the same save.
- **Scene names vs tile names**: tiles are named after scenes, but can carry `_top`/`_left` suffixes and ` #1234567` ids. Compare on the normalised base name.
- **Map data is generated**: `web/assets/img/fullmap/*.json` and the tile `*.webp` files are tilefit outputs. Change tile positions only through a tilefit review and republish.
- **Accessibility**: grids and checklists are lists (`role="list"` / `listitem`) whose items are named like "Display (Unlocked)", with decorative `alt=""` images. Make tiles clickable through the `clickable` and `onClick` options of `renderIconGrid`.

## Save format

```
.dat file:  [25-byte header][Base64( AES-256-ECB( JSON ) )][1-byte trailer]
```

The decrypted JSON has two roots, `playerData` (about 1,300 keys) and `sceneData`. `decrypt_save` forwards every root, so a new root (for example from a DLC) reaches `decryptSave().roots` without a Rust change.

Most of `playerData` is scalars: `version`, `permadeathMode`, `completionPercentage` (the game's own figure), `playTime` (seconds), `maxHealth`, `silkMax`, `silkRegenMax` (Silk Hearts), `nailUpgrades`, `ToolKitUpgrades`, `ToolPouchUpgrades`, `CurrentCrestID`, plus families of booleans (`has*` abilities, `defeated*` bosses, `Has*Map`, `SavedFlea_*`, `Unlocked*Station` / `*Tube`, `Collected*`, `Purchased*`).

Structured data comes in a few shapes:

| Shape | Where | Notes |
|---|---|---|
| `{ savedData: [ { Name, Data } ] }` | `Tools`, `ToolEquips`, `ExtraToolEquips`, `ToolLiquids`, `QuestCompletionData`, `Collectables`, `Relics`, `MateriumCollected`, `MementosDeposited` | Read with the helpers in `core/saveAccess.js`. The equipped loadout is the `ToolEquips` entry whose `Name` matches `CurrentCrestID`. |
| `{ list: [ { Name, Record: { Kills, HasBeenSeen } } ] }` | `EnemyJournalKillData` | `list`, not `savedData`. An enemy counts as encountered when it has a record; `HasBeenSeen` is only the journal's "new" marker. |
| ordered arrays | `scenesVisited` (first-visit order, the Hero's Path source), `scenesMapped` | `scenesEncounteredBench` is empty even at 100%, so benches can't be counted. |
| `[ { EventType, PlayTime, SceneName } ]` | `StoryEvents` | `EventType` 0 = Mask Shard, 1 = Spool Fragment, 2 = Simple Key, 3 = Memory Locket. |
| `{ serializedList: [ { SceneName, ID, Value } ] }` | `sceneData.persistentBools` / `persistentInts` | World pickups (mask shards, spool fragments, craftmetal on the ground), keyed by scene and ID. |

A few fields trip people up:
- In `QuestCompletionData`, `CompletedCount` is a progress counter for collection quests (Crow Feathers goes to 25), not a repeat count.
- In `MateriumCollected`, being in the list means recorded. `IsCollected` is only ever set for Smeltstone, Voltstone and Magnetite.
- `placedMarkers` uses in-game map units, and nobody has worked out how those map to pixels on the map image yet.

### Completion model

`completion.js` recomputes the game's percentage by summing each category's `completion()` hook, one point per item: tools 51, Silk Spool 9, crests 6 (not counting Hunter), abilities 6, skills 6, masks 5, needle 4, Crafting Kit 4, Tool Pouch 4, Silk Hearts 3, and Everbloom plus Sylphsong 2, for 100 in total. Bosses, maps, fleas and the Hunter's Journal don't count. This matches the game's figure exactly on every save tested so far, from 0% to 100% across four game versions. If the two ever disagree, the Unlockables tab shows the number in red and the fixture tests fail. That is how a patch or DLC that changes the breakdown will show up.

## Save tools

Personal saves go in `savefiles/`, which is git-ignored. Commit only trimmed fixtures.

```bash
python tools/decrypt_save.py savefiles/user1.dat savefiles/user1.json
python tools/diff_saves.py before.dat after.dat
python tools/unknown_keys.py savefiles/user1.dat --bools-only
python tools/inspect_save.py savefiles/user1.dat
python tools/inspect_save.py savefiles/user1.dat --group sc-darkness-mask
python tools/inspect_save.py savefiles/user1.dat --undecoded
python tools/inspect_save.py savefiles/user1.dat --search "Locket"
python tools/inspect_save.py savefiles/user1.dat --annotate savefiles/user1.annotated.txt
python tools/make_fixture.py savefiles/user1.dat web/src/data/__fixtures__/<name>.json
```

- **`diff_saves.py`** compares two saves and lists every flag that changed.
- **`unknown_keys.py`** lists save keys that nothing in `web/src/data` reads yet. Keys skipped on purpose are listed, each with a reason, in `packs/base/untracked.js`. Anything still listed after that is either new content or a missed item.

### Finding the flag for an in-game event

1. **Diff two saves that bracket the event.** Save just before it and again just after it, then run `diff_saves.py` on the two `.dat` files. For example, a pair taken either side of Moss Mother isolates `defeatedMossMother`, the journal entry and a few room flags.
2. **Use the naming patterns** to narrow the search: `defeated<Boss>`, `Has<Area>Map`, `SavedFlea_<Scene>`, `Purchased<Vendor><Item>`, `Collected<Thing>`, `has<Ability>`, `met<Npc>`. Scene names inside keys use the game's internal area prefixes (`Bone_East`, `Coral`, `Song`, `Under`, `Peak`, `Shadow`, `Greymoor`, `Dock`, and so on).
3. **World pickups** are in `sceneData.persistentBools`, with IDs like `Heart Piece`, `Heart Piece (1)`, `Silk Spool` or `Collectable Item Pickup - Tool Metal`. Search by the room's scene name first, then by ID.
4. **Quest rewards** are in `QuestCompletionData` under the quest's internal name (`Sprintmaster Race`, `Beastfly Hunt`, `Crow Feathers`).
5. **Don't guess.** If no pair of saves brackets the event, leave the entry marked as unknown and add it to [Open questions](#open-questions). A wrong flag is worse than a missing one.
6. **Inference needs a count check.** Without a bracketing pair, a flag may be adopted only when a number from the game forces it (for example, `silkMax` implies 12 fragments but only 10 sources are known) and it is the only candidate that fits every save. Mark it as inferred in the pack comment.
7. **Record the evidence** in a comment next to the pack entry: which saves you compared and which key changed.
8. **Classify what you don't show.** A real flag that isn't worth displaying gets a pattern and a reason in `packs/base/untracked.js`, so that `unknown_keys.py` keeps pointing only at what is genuinely new.

### Test fixtures

- Build fixtures with `make_fixture.py`, always from the `.dat` and never from a hand-edited `.json`. It keeps scalar `playerData`, the containers the parsers read, and collectible pickups, and drops everything else. Keep each fixture under 200 KB.
- The current set is `new-game`, `steel-soul`, `early-game` (after Moss Mother), `late-game` (72%) and `complete` (100%). Add a `dlc-*` fixture for each new pack.
- Take `oracle` values from the game itself, never from the code under test.

## Map tiles

Hero's Path draws reviewed room tiles over the clean Pharloom map. Placing, reviewing and publishing tiles is done with the tilefit pipeline, documented in [tools/tilefit/README.md](tools/tilefit/README.md).

## Updating for a DLC or patch

1. Get a save that includes the new content and decrypt it: `python tools/decrypt_save.py dlc.dat savefiles/dlc.json`.
2. Run `python tools/unknown_keys.py savefiles/dlc.json`. For a patch, extend `packs/base/`. For a DLC, add `web/src/data/packs/<id>/` with the same shape as `base`, give it a `detect(save)` that probes a key only DLC saves have, and append it to `PACKS` in `packs/index.js`.
3. Fill in the pack lists: bosses (`defeated*`), maps (`Has*Map`), tools (`Tools.savedData` names not in base), abilities and skills (`has*`), fleas, journal entries (`EnemyJournalKillData` names not in base), areas (new scene prefixes in `scenesVisited`), quests, and item sources (found with `diff_saves.py` between DLC saves).
4. Add the icons. The contract tests list any that are missing.
5. Add a fixture for the new content. If the DLC changes how the game counts 100%, update `completion.js`. The fixture's oracle test fails loudly when the breakdown no longer matches the game.
6. If the DLC adds areas: get the new map art, update `tools/map_transform.json`, add the room sprites to `tools/tilefit/sprites/`, run `python tools/tilefit/run_all.py` (the full run, without `--skip-candidates`), and review the results in the tilefit viewer.

## Open questions

These can't be settled from the saves we have:

| Item | What would settle it |
|---|---|
| Scenes without tile art | Map art for those rooms from the game's files |
| Flea icon for the Fleas tab | An icon taken from the game (the Huge Flea portrait stands in for now) |
| Hosting Team Cherry assets in the repo | Owner decision: keep them with attribution (current) or load them from somewhere else |

## Ideas

Optional features nobody has started:

- **Shareable read-only link**: encode the parsed summary (never the save) in the URL hash.
- **Wiki links**: a `wiki` field per pack entry, keyed by its `id`.
- **Localisation**: display names in `packs/<pack>/i18n/<lang>.json`, keyed by `id`, with English as the fallback.

Save editing is out of scope. It would mean re-encrypting saves and is a different product.

## Commit messages

The history should read like an upstream project's.

```
<area>: <Summary in the imperative mood>

<What changed and why, wrapped at 72 columns. Say what was wrong or
missing before, what the change does about it, and anything a reviewer
should know: snapshots regenerated, data sources, limits.>

Signed-off-by: Your Name <you@example.com>
```

**Title**
- Starts with the area it touches, for example `stats:`, `timeline:`, `map:`, `data:`, `ui:`, `app:`, `core:`, `wasm:`, `tools:`, `tilefit:`, `assets:`, `tests:`, `ci:` or `docs:`. Add a sub-area when it helps, as in `data: bosses:` or `stats: journal:`.
- After the prefix, a capitalised imperative verb, as in `Add`, `Fix`, `Show`, `Remove`, or `Rework`. Don't use past tense (`Added`) or `-ing` forms.
- 72 characters at most, ideally under 60, with no trailing period.
- Describes one change. If you need "and", it is probably two commits.

**Body**
- Always included, separated from the title by a blank line.
- Explains why, not only what. The diff already shows how.
- Names the in-game source of new data (the save flag or scene pickup) and any regenerated snapshots or fixture baselines.

**Trailer**
- End with `Signed-off-by:` (`git commit -s` adds it). Leave out other trailers such as `Co-authored-by`.

Example:

```
timeline: Show tooltip on playback bar story event marks

The marks on the playback bar had no label, so the only way to tell a
Mask Shard from a Memory Locket was to scrub to it. Hovering a mark now
shows the same item name and running count as the Story Events sidebar.

Signed-off-by: AlleriaJY <junyuan98@hotmail.com>
```
