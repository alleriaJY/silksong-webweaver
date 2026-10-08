"""
Stage 1: for every tile, correlate it against the whole clean map at the global
scale and keep the top candidate positions.

Output: out/candidates.json
  { "<tile.png>": { "w", "h", "native_w", "native_h", "degenerate",
                    "peaks": [[score, x, y], ...] } }

Usage: python tools/tilefit/match_candidates.py [--top 8] [--workers N]
"""

import argparse
import json
import os
from multiprocessing import Pool

import cv2
import numpy as np

from common import GLOBAL_SCALE, OUT_DIR, MapStats, load_map_value, load_tile, ncc, tile_files, tile_template

_V = None


def _init():
    global _V
    cv2.setNumThreads(1)
    _V = MapStats(load_map_value()[1])


def top_peaks(r, k, radius):
    """Greedy non-maximum suppression over the NCC surface."""
    r = r.copy()
    out = []
    for _ in range(k):
        _, mx, _, (x, y) = cv2.minMaxLoc(r)
        if mx <= 0.2:
            break
        out.append([round(float(mx), 4), int(x), int(y)])
        r[max(0, y - radius):y + radius + 1, max(0, x - radius):x + radius + 1] = -1
    return out


def process(args):
    name, k = args
    tile = load_tile(name)
    value, mask = tile_template(tile, GLOBAL_SCALE)
    h, w = value.shape
    rec = {"w": w, "h": h, "native_w": tile.shape[1], "native_h": tile.shape[0], "peaks": []}
    inside = value[mask > 0]
    rec["degenerate"] = bool(w < 4 or h < 4 or inside.size < 16 or inside.std() < 1.0)
    if rec["degenerate"]:
        return name, rec
    r = ncc(_V, value, mask)
    rec["peaks"] = top_peaks(r, k, radius=max(4, min(w, h) // 3))
    return name, rec


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--top", type=int, default=8)
    ap.add_argument("--workers", type=int, default=max(1, (os.cpu_count() or 2) - 2))
    args = ap.parse_args()

    names = tile_files()
    OUT_DIR.mkdir(exist_ok=True)
    results = {}
    with Pool(args.workers, initializer=_init) as pool:
        for i, (name, rec) in enumerate(pool.imap_unordered(process, [(n, args.top) for n in names]), 1):
            results[name] = rec
            if i % 50 == 0:
                print(f"  {i}/{len(names)}")
    out = OUT_DIR / "candidates.json"
    out.write_text(json.dumps(dict(sorted(results.items())), indent=1), encoding="utf-8")
    print(f"wrote {out} ({len(results)} tiles)")


if __name__ == "__main__":
    main()
