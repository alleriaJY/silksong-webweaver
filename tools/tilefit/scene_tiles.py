"""
Map every reviewed sprite to the scene (room) it draws, so pages look scenes up
instead of matching file names in the browser.

A sprite belongs to the first of:
  1. scene_aliases.json            sprite drawn for a differently named scene
  2. its name                      'Abyss_02b #4265375.png' -> 'Abyss_02b', '__0003_Ward_04.png' -> 'Ward_04'
  3. its name, ignoring case       'shellwood_25.png' -> 'Shellwood_25'
  4. the longest known scene its name starts with, cut at '_'
                                   'Bone_East_15_left.png' -> 'Bone_East_15'
Instances (a sprite drawn again for another scene, from instances.json) carry their scene.
Known scenes are every scenesVisited / scenesMapped entry in the fixture saves.

Output: out/scene_tiles.json  { "scenes": {scene: [sprite, ...]}, "unassigned": [sprite, ...] }
Usage:  python tools/tilefit/scene_tiles.py
"""

import json
from pathlib import Path

from common import FULLMAP_DIR, OUT_DIR, ROOT, base_name

HERE = Path(__file__).resolve().parent
FIXTURES = ROOT / "web" / "src" / "data" / "__fixtures__"


def known_scenes():
    scenes = set()
    for path in FIXTURES.glob("*.json"):
        if path.name.endswith(".expected.json"):
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        pd = data.get("playerData", data)
        scenes.update(pd.get("scenesVisited", []), pd.get("scenesMapped", []))
    return scenes


def load_aliases():
    path = HERE / "scene_aliases.json"
    return json.loads(path.read_text(encoding="utf-8"))["aliases"] if path.exists() else {}


def scene_of(sprite, scenes, aliases, lower=None):
    """Scene a sprite draws, or None if no rule applies."""
    if sprite in aliases:
        return aliases[sprite]
    lower = lower if lower is not None else {s.lower(): s for s in scenes}
    name = base_name(sprite)
    if name in scenes:
        return name
    if name.lower() in lower:
        return lower[name.lower()]
    parts = name.split("_")
    for cut in range(len(parts) - 1, 0, -1):
        hit = lower.get("_".join(parts[:cut]).lower())
        if hit:
            return hit
    return None


def build(coords, scenes, aliases):
    """coords: tile_coordinates entries by key (a sprite file, or '<sprite>@<scene>' for an instance)."""
    lower = {s.lower(): s for s in scenes}
    out, unassigned = {}, []
    for sprite in sorted(coords):
        scene = coords[sprite].get("scene") or scene_of(sprite, scenes, aliases, lower)
        if scene is None:
            unassigned.append(sprite)
        else:
            out.setdefault(scene, []).append(sprite)
    return {"scenes": dict(sorted(out.items())), "unassigned": unassigned}


def main():
    # the run's fresh output, else the published copy (when run on its own after a fresh clone)
    path = OUT_DIR / "tile_coordinates.json"
    if not path.exists():
        path = FULLMAP_DIR / "tilefit" / "tile_coordinates.json"
    coords = json.loads(path.read_text())["tiles"]
    scenes = known_scenes()
    aliases = load_aliases()
    missing = sorted(set(aliases) - set(coords))
    if missing:
        print(f"note: aliased sprites not in the reviewed set (removed?): {missing}")
    result = build(coords, scenes, aliases)
    OUT_DIR.mkdir(exist_ok=True)
    (OUT_DIR / "scene_tiles.json").write_text(json.dumps(result, indent=1), encoding="utf-8")
    print(f"scene_tiles.json: {len(result['scenes'])} of {len(scenes)} known scenes have a tile; "
          f"{len(result['unassigned'])} sprites unassigned: {', '.join(result['unassigned'])}")


if __name__ == "__main__":
    main()
