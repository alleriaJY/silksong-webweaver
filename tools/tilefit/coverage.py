"""
Stage 4: find map regions that no placed tile covers (rooms with no sprite art,
or tiles that are still missing/wrong), and name them from the OCR labels.
Also attaches the OCR labels that fall inside each placed tile, which gives a
sprite -> scene mapping independent of file names (e.g. sprite Dock_01b sits
in the room the labeled map calls Dock_08).

Output: out/uncovered.json, out/uncovered.png (RGBA overlay, clean-map size),
        tile_fit.json updated in place with "labels_inside".
Usage:  python tools/tilefit/coverage.py
"""

import json

import cv2
import numpy as np

from common import OUT_DIR, load_map_value, load_tile, tile_template

ROOM_MIN_V = 12        # map brightness above this counts as drawn room
MIN_REGION = 150       # px; smaller uncovered specks are ignored
USABLE = {"reviewed", "placed", "weak", "ambiguous"}


def main():
    fit = json.loads((OUT_DIR / "tile_fit.json").read_text())
    tiles = fit["tiles"]
    labels_path = OUT_DIR / "labels.json"
    labels = [l for l in json.loads(labels_path.read_text()) if l["name"] and l["match"] >= 0.8] if labels_path.exists() else []

    bgr, v = load_map_value()
    room = (v > ROOM_MIN_V).astype(np.uint8)
    room = cv2.morphologyEx(room, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    covered = np.zeros_like(room)
    for name, e in tiles.items():
        if e["status"] not in USABLE:
            continue
        _, mask = tile_template(load_tile(name))
        m = (mask > 0).astype(np.uint8)
        h, w = m.shape
        covered[e["y"]:e["y"] + h, e["x"]:e["x"] + w] |= m
        inside = [l["name"] for l in labels
                  if e["x"] - 10 <= l["x"] <= e["x"] + w + 10 and e["y"] - 10 <= l["y"] <= e["y"] + h + 10]
        e["labels_inside"] = sorted(set(inside))
    covered = cv2.dilate(covered, np.ones((5, 5), np.uint8))

    gap = room & (1 - covered)
    gap = cv2.morphologyEx(gap, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    n, cc, stats, _ = cv2.connectedComponentsWithStats(gap, connectivity=8)
    regions = []
    overlay = np.zeros((*gap.shape, 4), np.uint8)
    for i in range(1, n):
        x, y, w, h, area = stats[i]
        if area < MIN_REGION:
            continue
        near = sorted({l["name"] for l in labels if x - 40 <= l["x"] <= x + w + 40 and y - 40 <= l["y"] <= y + h + 40})
        regions.append({"x": int(x), "y": int(y), "width": int(w), "height": int(h), "area": int(area), "labels": near})
        overlay[cc == i] = (0, 0, 255, 170)
    regions.sort(key=lambda r: -r["area"])

    total_room = int(room.sum())
    fit["metadata"]["coverage"] = {"room_px": total_room, "covered_px": int((room & covered).sum()),
                                   "uncovered_regions": len(regions)}
    (OUT_DIR / "tile_fit.json").write_text(json.dumps(fit, indent=1), encoding="utf-8")
    (OUT_DIR / "uncovered.json").write_text(json.dumps(regions, indent=1), encoding="utf-8")
    cv2.imwrite(str(OUT_DIR / "uncovered.png"), overlay)
    pct = 100.0 * fit["metadata"]["coverage"]["covered_px"] / max(1, total_room)
    print(f"room pixels covered: {pct:.1f}%  uncovered regions: {len(regions)}")
    for r in regions[:25]:
        print(f"  {r['area']:6d}px at {r['x']},{r['y']} {r['width']}x{r['height']}  labels: {', '.join(r['labels']) or '-'}")


if __name__ == "__main__":
    main()
