"""
Per-tile size refinement of the reviewed coordinates. Most sprites are drawn at the
global scale (0.767), but about 10% match clearly better at their own scale, a few
with different x and y scales. Keeping each tile's reviewed centre (it may move up
to scale_check.SLACK px), this picks the uniform scale, then the x/y pair near it,
that best matches the map, and applies it only when it beats the global scale by
MIN_GAIN NCC and lies inside the searched range.

Rewrites out/tile_coordinates.json in place: x, y, width, height and per-tile
scale_x / scale_y for refined tiles; others keep the global scale.
Usage:  python tools/tilefit/refine_scale.py [--workers N]
"""

import argparse
import json
import os
from multiprocessing import Pool

import cv2
import numpy as np

from common import GLOBAL_SCALE, OUT_DIR, MapStats, load_map_value, load_tile
from scale_check import SCALES, best_at

MIN_GAIN = 0.03      # NCC a tile's own scale must add over the global one
MIN_NCC = 0.60       # and the refined fit must reach
XY_RANGE = 0.04      # x/y scales searched around the best uniform scale
_V = None


def _init():
    global _V
    cv2.setNumThreads(1)
    _V = MapStats(load_map_value()[1])


def refine(item):
    name, t = item
    tile = load_tile(t.get("sprite", name))   # instances name their sprite
    cx, cy = t["x"] + t["width"] / 2, t["y"] + t["height"] / 2
    base = best_at(tile, cx, cy, GLOBAL_SCALE, GLOBAL_SCALE, _V, with_pos=True)
    uni = [best_at(tile, cx, cy, s, s, _V) for s in SCALES]
    i = int(np.argmax(uni))
    best = (uni[i], SCALES[i], SCALES[i])
    for sx in SCALES:
        for sy in SCALES:
            if abs(sx - SCALES[i]) <= XY_RANGE + 1e-9 and abs(sy - SCALES[i]) <= XY_RANGE + 1e-9:
                v = best_at(tile, cx, cy, sx, sy, _V)
                if v > best[0]:
                    best = (v, sx, sy)
    score, sx, sy = best
    edge = {SCALES[0], SCALES[-1]}
    if score - base[0] < MIN_GAIN or score < MIN_NCC or sx in edge or sy in edge:
        return name, None
    _, x, y, w, h = best_at(tile, cx, cy, sx, sy, _V, with_pos=True)
    return name, {"x": int(x), "y": int(y), "width": int(w), "height": int(h),
                  "scale_x": float(sx), "scale_y": float(sy),
                  "ncc_global": round(base[0], 4), "ncc_refined": round(score, 4)}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--workers", type=int, default=max(1, (os.cpu_count() or 2) - 2))
    args = ap.parse_args()
    path = OUT_DIR / "tile_coordinates.json"
    data = json.loads(path.read_text())
    tiles = data["tiles"]
    with Pool(args.workers, initializer=_init) as pool:
        results = dict(pool.imap_unordered(refine, sorted(tiles.items()), chunksize=4))
    refined = {n: r for n, r in results.items() if r}
    for n, r in refined.items():
        tiles[n].update(x=r["x"], y=r["y"], width=r["width"], height=r["height"],
                        scale_x=r["scale_x"], scale_y=r["scale_y"], confidence=r["ncc_refined"])
    data["metadata"]["scale_refined"] = len(refined)
    path.write_text(json.dumps(data, indent=2), encoding="utf-8")
    gains = sorted(((r["ncc_refined"] - r["ncc_global"], n, r) for n, r in refined.items()), reverse=True)
    print(f"refined {len(refined)} of {len(tiles)} tiles (gain >= {MIN_GAIN})")
    for g, n, r in gains[:12]:
        print(f"  {n:40s} +{g:.3f}  scale {r['scale_x']} x {r['scale_y']}  ncc {r['ncc_global']} -> {r['ncc_refined']}")


if __name__ == "__main__":
    main()
