# Development

Full technical reference: [OPUS.md](OPUS.md). Plan and phases: [ROADMAP.md](ROADMAP.md).

## Run locally

ES modules and WASM need http, not `file://`.

```bash
npx --yes serve web -l 5175
```

To reach it from another device on your network, use `python -m http.server 8080 --bind 0.0.0.0` inside `web/` and open `http://<your-ip>:8080`.

## Dev page (local only)

When the app is served from `localhost` or a LAN address, the sidebar gains **Dev: save keys** (`#dev`). Load a save and it lists every `playerData` key no content pack reads, split into "explained" (matched by `web/src/data/packs/base/untracked.js`) and "unexplained" (new content or missed items), with a filter, a booleans-only switch and a copy button. It is the browser twin of `tools/unknown_keys.py`. The published site never offers it, and the deploy workflow leaves `web/src/dev/` out of the upload.

## Build WASM (only when `wasm-crypto/src/lib.rs` changes)

```bash
cd wasm-crypto && wasm-pack build --target web --out-dir ../web/pkg
```

## Tests

```bash
cd web && npm ci && npm test
```

```bash
cargo test --manifest-path wasm-crypto/Cargo.toml
```

```bash
pip install -r requirements-dev.txt && pytest tools
```

## Save tools

```bash
python tools/decrypt_save.py savefiles/user1.dat savefiles/user1.json
python tools/diff_saves.py before.dat after.dat
python tools/unknown_keys.py savefiles/user1.dat --bools-only
python tools/make_fixture.py savefiles/user1.dat web/src/data/__fixtures__/<name>.json
cd web && node scripts/snapshot-fixtures.mjs
```

Personal saves belong in `savefiles/`, which is git-ignored. Only commit trimmed fixtures.
