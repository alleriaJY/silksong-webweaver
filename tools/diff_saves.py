"""
Diff two Silksong saves to discover which flags an in-game event touches.

Usage:
    python tools/diff_saves.py <before.(dat|json)> <after.(dat|json)> [--all]

Prints, for playerData:
  - boolean flips (false -> true first, then true -> false)
  - numeric changes
  - string changes
  - list length changes and savedData containers whose entries changed
  - keys added / removed
and for sceneData.persistentBools / persistentInts: entries added or changed,
keyed by "SceneName / ID".

By default noisy keys (playTime, positions, markers) are hidden; pass --all to show them.
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from savelib import load_save, player_data, scene_entries  # noqa: E402

NOISY_KEYS = {
    "playTime", "HeroDeathScenePos", "HeroDeathSceneSize", "placedMarkers",
    "scenesVisited", "scenesMapped", "StoryEvents", "PreMemoryState",
    "respawnScene", "respawnMarkerName", "respawnType", "currentArea", "mapZone",
    "health", "silk", "geo", "ShellShards", "atBench", "hazardRespawnFacing",
}


def _saved_data_entries(value):
    """Return {Name: Data} for Name/Data containers, or None."""
    if isinstance(value, dict):
        items = value.get("savedData", value.get("list"))
        if isinstance(items, list) and all(isinstance(i, dict) and "Name" in i for i in items):
            return {i["Name"]: i.get("Data", i.get("Record")) for i in items}
    return None


def diff_player_data(a: dict, b: dict, show_all=False) -> dict:
    out = {"bool_on": [], "bool_off": [], "numeric": [], "string": [], "lists": [],
           "containers": [], "added": [], "removed": []}
    for key in sorted(set(a) | set(b)):
        if not show_all and key in NOISY_KEYS:
            continue
        if key not in a:
            out["added"].append((key, b[key]))
            continue
        if key not in b:
            out["removed"].append((key, a[key]))
            continue
        va, vb = a[key], b[key]
        if va == vb:
            continue
        if isinstance(va, bool) and isinstance(vb, bool):
            out["bool_on" if vb else "bool_off"].append(key)
        elif isinstance(va, (int, float)) and isinstance(vb, (int, float)):
            out["numeric"].append((key, va, vb))
        elif isinstance(va, str) and isinstance(vb, str):
            out["string"].append((key, va, vb))
        elif isinstance(va, list) and isinstance(vb, list):
            added = [x for x in vb if x not in va] if len(vb) < 5000 else []
            out["lists"].append((key, len(va), len(vb), added[:10]))
        else:
            ea, eb = _saved_data_entries(va), _saved_data_entries(vb)
            if ea is not None and eb is not None:
                changes = []
                for name in sorted(set(ea) | set(eb)):
                    if ea.get(name) != eb.get(name):
                        changes.append((name, ea.get(name), eb.get(name)))
                out["containers"].append((key, changes))
            else:
                out["string"].append((key, json.dumps(va)[:80], json.dumps(vb)[:80]))
    return out


def diff_scene(a_entries: list, b_entries: list) -> list:
    def index(entries):
        return {f"{e.get('SceneName')} / {e.get('ID')}": e.get("Value") for e in entries}
    ia, ib = index(a_entries), index(b_entries)
    return [(k, ia.get(k, "<absent>"), ib[k]) for k in sorted(ib) if ia.get(k, "<absent>") != ib[k]]


def main(argv=None) -> int:
    argv = sys.argv[1:] if argv is None else argv
    show_all = "--all" in argv
    paths = [a for a in argv if not a.startswith("--")]
    if len(paths) != 2:
        print(__doc__.strip())
        return 2
    sa, sb = load_save(paths[0]), load_save(paths[1])
    pa, pb = player_data(sa), player_data(sb)
    print(f"before: {paths[0]} (version {pa.get('version')}, {pa.get('completionPercentage')}%)")
    print(f"after:  {paths[1]} (version {pb.get('version')}, {pb.get('completionPercentage')}%)\n")

    d = diff_player_data(pa, pb, show_all)
    sections = [
        ("BOOL false -> true", [f"  {k}" for k in d["bool_on"]]),
        ("BOOL true -> false", [f"  {k}" for k in d["bool_off"]]),
        ("NUMERIC", [f"  {k}: {x} -> {y}" for k, x, y in d["numeric"]]),
        ("STRING / OTHER", [f"  {k}: {x!r} -> {y!r}" for k, x, y in d["string"]]),
        ("LISTS", [f"  {k}: len {x} -> {y}" + (f"  +{add}" if add else "") for k, x, y, add in d["lists"]]),
        ("KEYS ADDED", [f"  {k} = {json.dumps(v)[:80]}" for k, v in d["added"]]),
        ("KEYS REMOVED", [f"  {k}" for k, _ in d["removed"]]),
    ]
    for key, changes in d["containers"]:
        sections.append((f"CONTAINER {key}", [f"  {n}: {json.dumps(x)} -> {json.dumps(y)}" for n, x, y in changes]))
    for kind in ("persistentBools", "persistentInts"):
        rows = diff_scene(scene_entries(sa, kind), scene_entries(sb, kind))
        sections.append((f"sceneData.{kind}", [f"  {k}: {x} -> {y}" for k, x, y in rows]))

    for title, lines in sections:
        if lines:
            print(f"== {title} ({len(lines)})")
            print("\n".join(lines))
            print()
    return 0


if __name__ == "__main__":
    sys.exit(main())
