# Development Stuffs

## Quick Start

### Web Version
Visit the deployed site on GitHub Pages, or run/host locally:

```bash
# Navigate to web directory
cd web

# Start local server
python3 -m http.server 8080

# Open http://localhost:8080 in your browser
```

### Access from Other Devices
```bash
# Find your IP address
ipconfig getifaddr en0   # Returns something like 192.168.1.xxx

# Start server bound to all interfaces
cd web
python3 -m http.server 8080 --bind 0.0.0.0

# On other device, open: http://192.168.1.xxx:8080
```

### CLI Version
```bash
# Build
cargo build --release

# Run with default file (user1.dat)
cargo run

# Run with custom input/output
cargo run -- -i path/to/save.dat -o output.json

# Quiet mode (JSON only)
cargo run -- -i save.dat -o output.json -q
```

## Development

### Building WASM Module
```bash
# Install wasm-pack (first time only)
brew install wasm-pack  # macOS
# or: cargo install wasm-pack

# Build WASM
cd wasm-crypto
wasm-pack build --target web --out-dir ../web/pkg
```

### Running Tests
```bash
cargo test
```

## 📋 Features Experimented + Done

- ✅ Basic (but not full) parsing of save file.
- ✅ Web UI with drag & drop upload (HTML/CSS/JS)
- ✅ Runs entirely in browser (+ WASM from Rust)
- ✅ GitHub Actions CI/CD