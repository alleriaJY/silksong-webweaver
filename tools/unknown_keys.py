"""
List save keys that no schema in web/src/data references yet.

Usage:
    python tools/unknown_keys.py <save.(dat|json)> [--bools-only]

A key counts as "referenced" when it appears as a quoted string literal in any
non-test .js file under web/src/data (schema lists, parsers, packs). Output is
grouped by naming prefix so related flags (defeated*, Has*Map, Purchased*...)
sit together. Replaces the deleted analyze_unused_flags.py.
"""

import re
import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from savelib import WEB_DATA_DIR, load_save, player_data  # noqa: E402

PREFIXES = [
    "SavedFlea_", "defeated", "Defeated", "Has", "has", "Purchased", "purchased",
    "Collected", "collected", "met", "Met", "seen", "Seen", "visited", "completed",
    "Completed", "shop", "Merchant", "encountered", "unlocked", "Unlocked", "got", "opened",
]
STRING_LITERAL = re.compile(r"""(['"`])((?:\\.|(?!\1).)*)\1""")


def referenced_strings(data_dir: Path = WEB_DATA_DIR) -> set:
    refs = set()
    for path in data_dir.rglob("*.js"):
        if path.name.endswith(".test.js") or "__fixtures__" in path.parts:
            continue
        for match in STRING_LITERAL.finditer(path.read_text(encoding="utf-8")):
            refs.add(match.group(2))
    return refs


def group_of(key: str) -> str:
    for prefix in PREFIXES:
        if key.startswith(prefix):
            return prefix + "*"
    if key.endswith("Defeated"):
        return "*Defeated"
    return "(other)"


def unknown_keys(save: dict, refs: set, bools_only=False) -> dict:
    groups = defaultdict(list)
    for key, value in player_data(save).items():
        if key in refs:
            continue
        if bools_only and not isinstance(value, bool):
            continue
        groups[group_of(key)].append((key, value))
    return dict(groups)


def main(argv=None) -> int:
    argv = sys.argv[1:] if argv is None else argv
    paths = [a for a in argv if not a.startswith("--")]
    if len(paths) != 1:
        print(__doc__.strip())
        return 2
    save = load_save(paths[0])
    refs = referenced_strings()
    groups = unknown_keys(save, refs, "--bools-only" in argv)
    total = sum(len(v) for v in groups.values())
    pd = player_data(save)
    print(f"{paths[0]}: {total} of {len(pd)} playerData keys unreferenced "
          f"({len(refs)} string literals scanned in {WEB_DATA_DIR.relative_to(WEB_DATA_DIR.parents[2])})\n")
    for group in sorted(groups, key=lambda g: (-len(groups[g]), g)):
        items = sorted(groups[group])
        print(f"== {group} ({len(items)})")
        for key, value in items:
            shown = value if isinstance(value, (bool, int, float)) else type(value).__name__
            print(f"  {key} = {shown}")
        print()
    return 0


if __name__ == "__main__":
    sys.exit(main())
