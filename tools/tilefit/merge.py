"""
Stage 5: merge the automatic fit with the old human confirmations into a file with
the same schema as web/assets/img/fullmap/tile_coordinates.json, so any viewer
can use it by pointing at a different path.

Policy, per tile:
  0. owner review (review.json): "removed" is left out even if an old confirmation
     exists; "reviewed" is taken as is, confirmed
  1. new fit "placed"                         -> new fit, confirmed
  2. else old confirmation exists             -> re-fit at the global scale within
                                                 +/-30px of the old centre, confirmed
                                                 (the human broke a tie the matcher can't)
  3. else new fit weak / ambiguous / detached -> new fit, confirmed=false (review)
  4. unmatched / too_small                    -> left out
  5. instances.json: extra placements of a sprite the map draws more than once,
     keyed '<sprite>@<scene>' with "sprite" and "scene" fields, confirmed

Output: out/tile_coordinates.json (published to web/assets/img/fullmap/tilefit/)
Usage:  python tools/tilefit/merge.py
"""

import json
from collections import Counter
from datetime import datetime
from pathlib import Path

import cv2

from common import GLOBAL_SCALE, OUT_DIR, ROOT, MapStats, area_of, load_map_value, load_tile, ncc, tile_template

REFINE_RADIUS = 30


def refine_near(stats, name, old):
    """Best global-scale position whose centre is within REFINE_RADIUS of the old centre."""
    value, mask = tile_template(load_tile(name))
    h, w = value.shape
    cx, cy = old["x"] + old["width"] / 2, old["y"] + old["height"] / 2
    x0 = max(0, int(cx - w / 2 - REFINE_RADIUS))
    y0 = max(0, int(cy - h / 2 - REFINE_RADIUS))
    x1 = min(stats.i.shape[1], int(cx + w / 2 + REFINE_RADIUS) + 1)
    y1 = min(stats.i.shape[0], int(cy + h / 2 + REFINE_RADIUS) + 1)
    sub = MapStats.__new__(MapStats)
    sub.i, sub.i2 = stats.i[y0:y1, x0:x1], stats.i2[y0:y1, x0:x1]
    if sub.i.shape[0] < h or sub.i.shape[1] < w:
        return old["x"], old["y"], w, h, 0.0
    r = ncc(sub, value, mask)
    _, best, _, (bx, by) = cv2.minMaxLoc(r)
    return x0 + bx, y0 + by, w, h, float(best)


def main():
    fit = json.loads((OUT_DIR / "tile_fit.json").read_text())["tiles"]
    conf = json.loads((ROOT / "tools" / "confirmed_tiles.json").read_text())["tiles"]
    stats = MapStats(load_map_value()[1])

    tiles, source = {}, Counter()
    for name, e in sorted(fit.items()):
        old = conf.get(name)
        old_ok = old is not None and old.get("status") == "confirmed"
        if e["status"] == "removed":
            continue
        if e["status"] == "reviewed":
            x, y, w, h, score, confirmed, src = e["x"], e["y"], e["width"], e["height"], e["ncc"], True, "review"
        elif e["status"] == "placed":
            x, y, w, h, score, confirmed, src = e["x"], e["y"], e["width"], e["height"], e["ncc"], True, "tilefit"
        elif old_ok and e["status"] != "too_small":
            x, y, w, h, score = refine_near(stats, name, old)
            confirmed, src = True, "confirmed_refined"
        elif e["status"] in ("weak", "ambiguous", "detached"):
            x, y, w, h, score, confirmed, src = e["x"], e["y"], e["width"], e["height"], e["ncc"], False, f"tilefit_{e['status']}"
        else:
            continue
        source[src] += 1
        tiles[name] = {"x": int(x), "y": int(y), "width": int(w), "height": int(h),
                       "confidence": round(float(score), 3), "scale": GLOBAL_SCALE,
                       "area": area_of(name), "confirmed": confirmed, "source": src}

    inst_path = Path(__file__).resolve().parent / "instances.json"
    instances = json.loads(inst_path.read_text(encoding="utf-8"))["instances"] if inst_path.exists() else {}
    for key, inst in sorted(instances.items()):
        value, _ = tile_template(load_tile(inst["sprite"]))
        h, w = value.shape
        source["instance"] += 1
        tiles[key] = {"x": int(inst["x"]), "y": int(inst["y"]), "width": w, "height": h,
                      "confidence": 1.0, "scale": GLOBAL_SCALE, "area": area_of(inst["sprite"]),
                      "confirmed": True, "source": "instance", "sprite": inst["sprite"], "scene": inst["scene"]}

    meta = {"fullmap": "full_pharloom_clean.webp", "fullmap_width": 4096, "fullmap_height": 4096,
            "total_tiles": len(tiles), "confirmed_count": sum(t["confirmed"] for t in tiles.values()),
            "sources": dict(source), "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "generator": "tools/tilefit/merge.py"}
    (OUT_DIR / "tile_coordinates.json").write_text(json.dumps({"metadata": meta, "tiles": tiles}, indent=2), encoding="utf-8")
    print(f"wrote tile_coordinates.json: {len(tiles)} tiles, {meta['confirmed_count']} confirmed, sources {dict(source)}")


if __name__ == "__main__":
    main()
