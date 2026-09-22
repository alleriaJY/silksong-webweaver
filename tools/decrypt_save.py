"""
Decrypt a Silksong .dat save file to JSON.

Usage:
    python tools/decrypt_save.py <in.dat> [out.json]

Without out.json the JSON is written next to the input with a .json suffix.
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from savelib import SaveFormatError, decrypt_bytes  # noqa: E402


def main(argv=None) -> int:
    argv = sys.argv[1:] if argv is None else argv
    if not argv or argv[0] in ("-h", "--help"):
        print(__doc__.strip())
        return 0 if argv else 2
    src = Path(argv[0])
    dst = Path(argv[1]) if len(argv) > 1 else src.with_suffix(".json")
    try:
        save = decrypt_bytes(src.read_bytes())
    except SaveFormatError as e:
        print(f"error: {src}: {e}", file=sys.stderr)
        return 1
    dst.write_text(json.dumps(save, indent=2, ensure_ascii=False), encoding="utf-8")
    pd = save.get("playerData", {})
    print(f"{src} -> {dst} (version {pd.get('version', '?')}, {len(pd)} playerData keys)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
