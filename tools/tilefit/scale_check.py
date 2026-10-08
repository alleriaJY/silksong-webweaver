"""
Check the global-scale assumption on reviewed tiles: for every positioned tile in
the published tile_coordinates.json, find the scale (uniform, then x/y separately)
that best matches the map around its reviewed centre.

Output: out/scale_check.json and a summary on stdout.
Usage:  python tools/tilefit/scale_check.py [--workers N]
"""

import argparse
import json
import os
from multiprocessing import Pool

import cv2
import numpy as np

from common import FULLMAP_DIR, GLOBAL_SCALE, OUT_DIR, MapStats, load_map_value, load_tile, ncc

SCALES = np.round(np.arange(0.70, 0.8401, 0.005), 3)
SLACK = 6        # px the centre may shift while the scale changes
_V = None


def _init():
    global _V
    cv2.setNumThreads(1)
    _V = MapStats(load_map_value()[1])


def template(tile, sx, sy):
    w, h = max(1, round(tile.shape[1] * sx)), max(1, round(tile.shape[0] * sy))
    tr = cv2.resize(tile, (w, h), interpolation=cv2.INTER_AREA)
    alpha = tr[..., 3].astype(np.float32) / 255.0
    return tr[..., :3].max(axis=2).astype(np.float32) * alpha, (alpha > 0.25).astype(np.float32)


def best_at(tile, cx, cy, sx, sy, stats=None, with_pos=False):
    """Best NCC of the tile scaled by (sx, sy) whose centre is within SLACK px of
    (cx, cy); with_pos also returns that placement's top-left and size."""
    stats = stats or _V
    value, mask = template(tile, sx, sy)
    h, w = value.shape
    fail = (-1.0, 0, 0, w, h) if with_pos else -1.0
    if mask.sum() < 16:
        return fail
    x0, y0 = int(round(cx - w / 2)) - SLACK, int(round(cy - h / 2)) - SLACK
    x1, y1 = x0 + w + 2 * SLACK, y0 + h + 2 * SLACK
    if x0 < 0 or y0 < 0 or y1 > stats.i.shape[0] or x1 > stats.i.shape[1]:
        return fail
    sub = MapStats.__new__(MapStats)
    sub.i, sub.i2 = stats.i[y0:y1, x0:x1], stats.i2[y0:y1, x0:x1]
    _, best, _, (bx, by) = cv2.minMaxLoc(ncc(sub, value, mask))
    return (float(best), x0 + bx, y0 + by, w, h) if with_pos else float(best)


def process(item):
    name, t = item
    tile = load_tile(name)
    cx, cy = t["x"] + t["width"] / 2, t["y"] + t["height"] / 2
    uni = [best_at(tile, cx, cy, s, s) for s in SCALES]
    i = int(np.argmax(uni))
    g = best_at(tile, cx, cy, GLOBAL_SCALE, GLOBAL_SCALE)
    # separate x / y scale around the uniform best
    best_xy, sx_b, sy_b = uni[i], SCALES[i], SCALES[i]
    for sx in SCALES:
        for sy in SCALES:
            if abs(sx - SCALES[i]) > 0.04 or abs(sy - SCALES[i]) > 0.04:
                continue
            v = best_at(tile, cx, cy, sx, sy)
            if v > best_xy:
                best_xy, sx_b, sy_b = v, sx, sy
    return name, {"global_ncc": round(g, 4), "best_scale": float(SCALES[i]), "best_ncc": round(uni[i], 4),
                  "sx": float(sx_b), "sy": float(sy_b), "xy_ncc": round(best_xy, 4),
                  "w": tile.shape[1], "h": tile.shape[0]}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--workers", type=int, default=max(1, (os.cpu_count() or 2) - 2))
    args = ap.parse_args()
    coords = json.loads((FULLMAP_DIR / "tilefit" / "tile_coordinates.json").read_text())["tiles"]
    with Pool(args.workers, initializer=_init) as pool:
        res = dict(pool.imap_unordered(process, sorted(coords.items()), chunksize=4))
    (OUT_DIR / "scale_check.json").write_text(json.dumps(dict(sorted(res.items())), indent=1), encoding="utf-8")

    big = {n: r for n, r in res.items() if r["w"] * r["h"] >= 40 * 40 and r["best_ncc"] > 0.6}
    s = np.array([r["best_scale"] for r in big.values()])
    print(f"tiles: {len(res)}; well-matched tiles >= 40x40 px: {len(big)}")
    print(f"best uniform scale on those: median {np.median(s):.3f}, 5-95% {np.percentile(s, 5):.3f}-{np.percentile(s, 95):.3f}")
    print("histogram:", dict(zip(*np.unique(s, return_counts=True))))
    gain = sorted(((r["best_ncc"] - r["global_ncc"], n, r) for n, r in res.items()), reverse=True)
    print("\nlargest gain from a different uniform scale:")
    for d, n, r in gain[:15]:
        print(f"  {n:42s} +{d:.3f}  best {r['best_scale']} ncc {r['global_ncc']} -> {r['best_ncc']}")
    xy = sorted(((r["xy_ncc"] - r["best_ncc"], n, r) for n, r in res.items()), reverse=True)
    print("\nlargest gain from separate x/y scales:")
    for d, n, r in xy[:15]:
        print(f"  {n:42s} +{d:.3f}  sx {r['sx']} sy {r['sy']} ncc {r['best_ncc']} -> {r['xy_ncc']}")


if __name__ == "__main__":
    main()
