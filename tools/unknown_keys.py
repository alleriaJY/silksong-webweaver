"""
List save keys that no schema in web/src/data references yet.

Usage:
    python tools/unknown_keys.py <save.(dat|json)> [--bools-only] [--all]

A key counts as "referenced" when it appears as a quoted string literal in any
non-test .js file under web/src/data (schema lists, parsers, packs). Output is
grouped by naming prefix so related flags (defeated*, Has*Map, Purchased*...)
sit together. Replaces the deleted analyze_unused_flags.py.

Unreferenced keys that match a pattern in web/src/data/packs/*/untracked.js
are "explained" (deliberately not shown, with a reason); only the count per
pattern is printed. The remaining "unexplained" keys are listed in full: that
is where new content and missed items show up. --all lists explained keys too.
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
# { id: 'x', pattern: '...' } entries in untracked.js (JS single-quoted strings)
UNTRACKED_ENTRY = re.compile(r"id: '([^']+)',\s*pattern: '((?:\\.|[^'\\])*)'")


def referenced_strings(data_dir: Path = WEB_DATA_DIR) -> set:
    refs = set()
    for path in data_dir.rglob("*.js"):
        if path.name.endswith(".test.js") or "__fixtures__" in path.parts:
            continue
        for match in STRING_LITERAL.finditer(path.read_text(encoding="utf-8")):
            refs.add(match.group(2))
    return refs


def js_unescape(text: str) -> str:
    """Undo JS string escaping for a single-quoted literal (\\\\ -> \\, \\' -> ')."""
    return re.sub(r"\\(.)", lambda m: m.group(1), text)


def untracked_patterns(data_dir: Path = WEB_DATA_DIR) -> list:
    """[(id, compiled regex)] from every pack's untracked.js, in file order."""
    patterns = []
    for path in sorted(data_dir.glob("packs/*/untracked.js")):
        for pid, raw in UNTRACKED_ENTRY.findall(path.read_text(encoding="utf-8")):
            patterns.append((pid, re.compile(js_unescape(raw))))
    return patterns


def explain(key: str, patterns: list):
    """Id of the first untracked pattern matching key, or None."""
    for pid, rx in patterns:
        if rx.search(key):
            return pid
    return None


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


def split_explained(groups: dict, patterns: list):
    """Move pattern-matched keys out of groups; returns (unexplained groups, {pattern id: keys})."""
    explained = defaultdict(list)
    remaining = {}
    for group, items in groups.items():
        keep = []
        for key, value in items:
            pid = explain(key, patterns)
            if pid:
                explained[pid].append((key, value))
            else:
                keep.append((key, value))
        if keep:
            remaining[group] = keep
    return remaining, dict(explained)


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
    groups, explained = split_explained(groups, untracked_patterns())
    unexplained = sum(len(v) for v in groups.values())
    pd = player_data(save)
    print(f"{paths[0]}: {total} of {len(pd)} playerData keys unreferenced "
          f"({len(refs)} string literals scanned in {WEB_DATA_DIR.relative_to(WEB_DATA_DIR.parents[2])})")
    print(f"  explained by untracked.js: {total - unexplained}   UNEXPLAINED: {unexplained}\n")
    for pid in sorted(explained, key=lambda k: (-len(explained[k]), k)):
        print(f"  [{pid}] {len(explained[pid])}")
        if "--all" in argv:
            for key, _ in sorted(explained[pid]):
                print(f"      {key}")
    print()
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
