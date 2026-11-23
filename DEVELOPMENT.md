# Development

Everything needed to run, test and extend Silksong Webweaver. For what the app does, see [README.md](README.md).

## Run locally

ES modules and WASM need http, not `file://`.

```bash
npx --yes serve web -l 5175
```

To reach it from another device on your network, run `python -m http.server 8080 --bind 0.0.0.0` inside `web/` and open `http://<your-ip>:8080`.

The site has no build step. The only compiled part is the WASM module, which you rebuild only when `wasm-crypto/src/lib.rs` changes:

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

- **`diff_saves.py`** is how new flags are found. Save just before an in-game event and again just after it, then diff the two saves.
- **`unknown_keys.py`** lists save keys that nothing in `web/src/data` reads yet. Keys skipped on purpose are listed, each with a reason, in `packs/base/untracked.js`. Anything still listed after that is either new content or a missed item.

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
