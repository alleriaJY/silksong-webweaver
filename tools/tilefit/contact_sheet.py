"""
Diagnostic: for each named tile, show the tile and map crops at its candidate
positions (and at its old confirmed position, if any) with the tile outline drawn
in magenta.

Usage: python tools/tilefit/contact_sheet.py OUT.png TILE [TILE ...] [--peaks 3]
"""

import argparse
import json

import cv2
import numpy as np

from common import FULLMAP_DIR, OUT_DIR, ROOT, load_map_value, load_tile, tile_template

CELL = 260


def outline(mask):
    m = (mask > 0).astype(np.uint8)
    return m - cv2.erode(m, np.ones((3, 3), np.uint8))


def crop_with_overlay(bgr, x, y, w, h, edge, color):
    pad = 30
    x0, y0 = max(0, x - pad), max(0, y - pad)
    x1, y1 = min(bgr.shape[1], x + w + pad), min(bgr.shape[0], y + h + pad)
    c = bgr[y0:y1, x0:x1].copy()
    if edge is not None:
        eh, ew = edge.shape
        ys, xs = np.nonzero(edge)
        ys, xs = ys + (y - y0), xs + (x - x0)
        ok = (ys >= 0) & (xs >= 0) & (ys < c.shape[0]) & (xs < c.shape[1])
        c[ys[ok], xs[ok]] = color
    return c


def fit(img, size=CELL):
    h, w = img.shape[:2]
    s = min(size / w, (size - 20) / h, 3.0)
    img = cv2.resize(img, (max(1, int(w * s)), max(1, int(h * s))), interpolation=cv2.INTER_NEAREST)
    cell = np.zeros((size, size, 3), np.uint8)
    cell[20:20 + img.shape[0], :img.shape[1]] = img
    return cell


def label(cell, text, color=(255, 255, 255)):
    cv2.putText(cell, text[:40], (2, 14), cv2.FONT_HERSHEY_SIMPLEX, 0.4, color, 1, cv2.LINE_AA)
    return cell


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out")
    ap.add_argument("tiles", nargs="+")
    ap.add_argument("--peaks", type=int, default=3)
    ap.add_argument("--fit", default=None, help="tile_fit.json to show the chosen position")
    ap.add_argument("--labeled", action="store_true", help="add a labeled-map crop at the chosen position")
    args = ap.parse_args()

    bgr, _ = load_map_value()
    cand = json.loads((OUT_DIR / "candidates.json").read_text())
    conf = json.loads((ROOT / "tools" / "confirmed_tiles.json").read_text())["tiles"]
    chosen = json.loads(open(args.fit).read())["tiles"] if args.fit else {}
    labeled = cv2.imread(str(FULLMAP_DIR / "silksong_fullmap.png")) if args.labeled else None
    to_lab = np.array(json.loads((ROOT / "tools" / "map_transform.json").read_text())["clean_to_labeled"])
    rows = []
    for name in args.tiles:
        tile = load_tile(name)
        value, mask = tile_template(tile)
        edge = outline(mask)
        preview = cv2.cvtColor(tile, cv2.COLOR_BGRA2BGR)
        preview[tile[..., 3] < 64] = (60, 0, 60)
        cells = [label(fit(preview), name)]
        c = conf.get(name)
        if c and c["status"] == "confirmed":
            cells.append(label(fit(crop_with_overlay(bgr, c["x"], c["y"], c["width"], c["height"], None, None)), "old confirmed", (0, 255, 255)))
        else:
            cells.append(label(np.zeros((CELL, CELL, 3), np.uint8), f"old: {c['status'] if c else 'none'}"))
        if name in chosen:
            f = chosen[name]
            cells.append(label(fit(crop_with_overlay(bgr, f["x"], f["y"], f["width"], f["height"], edge, (255, 0, 255))), f"chosen {f.get('ncc', 0):.3f} {f.get('status', '')}", (0, 255, 0)))
            if labeled is not None:
                x0, y0 = (to_lab @ [f["x"], f["y"], 1]).astype(int)
                x1, y1 = (to_lab @ [f["x"] + f["width"], f["y"] + f["height"], 1]).astype(int)
                pad = 60
                cx0, cy0 = max(0, x0 - pad), max(0, y0 - pad)
                c = labeled[cy0:y1 + pad, cx0:x1 + pad].copy()
                cv2.rectangle(c, (x0 - cx0, y0 - cy0), (x1 - cx0, y1 - cy0), (255, 0, 255), 1)
                cells.append(label(fit(c), "labeled map", (0, 255, 0)))
        for s, x, y in cand[name]["peaks"][: args.peaks]:
            cells.append(label(fit(crop_with_overlay(bgr, x, y, value.shape[1], value.shape[0], edge, (255, 0, 255))), f"{s:.3f} @{x},{y}"))
        width = 2 + args.peaks + (1 if chosen else 0) + (1 if labeled is not None else 0)
        while len(cells) < width:
            cells.append(np.zeros((CELL, CELL, 3), np.uint8))
        rows.append(np.hstack(cells))
    sheet = np.vstack(rows)
    cv2.imwrite(args.out, sheet)
    print(f"wrote {args.out} {sheet.shape[1]}x{sheet.shape[0]}")


if __name__ == "__main__":
    main()
