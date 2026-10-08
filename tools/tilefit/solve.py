"""
Stage 3: place every tile on the clean map by iterative greedy assignment.

Score of tile t at offset p (top-left, clean-map pixels, global scale):

    S = NCC(p)                                  shape, tint-invariant
      - W_TINT * ramp(angle(p), 2..8 deg)       tint vs the tile's area colour
      - W_OVERLAP * overlap(p)                   fraction of t already covered by
                                                 tiles of OTHER scenes (a scene's own
                                                 pieces, e.g. X and X_top, may stack)
      + W_LABEL * label(p)                       OCR label of t's name inside/next to t
      + W_FAMILY * family(p)                     t touches an already placed piece of
                                                 its own scene (X_top next to X)

The tint at p is the per-channel regression gain of map on tile, as a unit
vector. Area colours are learnt from "anchors": tiles whose raw NCC peak is
both high and unique (from out/candidates.json).

Each round every unplaced tile gets its best and runner-up (non-overlapping)
positions. Tiles that are clearly best (score and margin) are committed and
their pixels marked occupied, which removes slots for the next round. What
is left after the rounds is placed at its best position with a lower status.

Old confirmations are NOT used as input; they are only compared in the report.

Output: out/tile_fit.json, out/fit_report.txt
Usage:  python tools/tilefit/solve.py [--workers 8]
"""

import argparse
import json
import os
import re
from collections import defaultdict
from pathlib import Path
from multiprocessing import Pool

import cv2
import numpy as np

from common import (GLOBAL_SCALE, MIN_WINDOW_STD, OUT_DIR, ROOT, area_of, base_name,
                    load_map_value, load_tile, tile_template)

W_TINT = 0.15
W_OVERLAP = 1.0
# Pure-black map pixels are outside every room. Measured on the 561 fits that
# agree with old confirmations: median 0%, 99th percentile 4.4%, max 11% of a
# tile's drawn pixels land there; wrong fits sit 70-97% on it. A stray edge line
# in the void could otherwise give a corridor-shaped sprite a decent NCC.
VOID_LEVEL = 2           # map brightness (0-255) at or below this is void
VOID_FREE = 0.10         # void fraction below this is free ...
VOID_MAX = 0.30          # ... the penalty ramps to W_VOID here; beyond it a tile is unmatched
W_VOID = 1.0
W_LABEL = 0.15
LABEL_SIGMA = 20.0       # px; 65% of exact-name labels fall inside their tile, 75% within 21px
W_FAMILY = 0.15
FAMILY_SIGMA = 15.0      # px gap between t and the nearest placed piece of its scene
MIN_ANGLE = 2.0          # deg; tint differences below this are free
MAX_ANGLE = 8.0          # deg; tint mismatch saturates here
ACCEPT_SCORE = 0.80      # commit in a round when score >= this (relaxed to
ACCEPT_FLOOR = 0.60      # this floor in 0.05 steps when a round stalls) ...
ACCEPT_MARGIN = 0.06     # ... and beats the runner-up by this much
FINAL_MIN_NCC = 0.55     # below this raw NCC a tile is reported unmatched
PLACED_MIN_NCC = 0.70    # committed via relaxed threshold but below this: reported weak
ROUNDS = 20
DETACH_GAP = 80          # px; a sub-piece (X_top) this far from every placed piece of X is suspect

# Alternate states of a room drawn over the same place as the base room.
VARIANT = re.compile(r"(destroyed|repaired|_after|empty|broken|completed|post_boss|standard|blank|_extra)", re.I)

_S = {}


def tint_key(name):
    return base_name(name).split("_")[0].lower()


def is_variant(name):
    return bool(VARIANT.search(base_name(name)))


def family(name):
    """Scene a sprite belongs to: tokens up to the first one with a digit.
    'Bone_East_15_bot' -> 'bone_east_15', 'Dock_03b_2' -> 'dock_03b'."""
    parts = base_name(name).lower().split("_")
    for i, p in enumerate(parts):
        if any(ch.isdigit() for ch in p):
            return "_".join(parts[:i + 1])
    return "_".join(parts)


# ---------------------------------------------------------------- worker side

def _init(occ_path, protos, labels, families, placed_path):
    cv2.setNumThreads(2)
    bgr, v = load_map_value()
    _S["i"] = (v / 255.0).astype(np.float32)
    _S["i2"] = _S["i"] * _S["i"]
    _S["void"] = (v <= VOID_LEVEL).astype(np.float32)
    _S["ch"] = [(bgr[..., c] / 255.0).astype(np.float32) for c in range(3)]
    _S["occ_path"] = occ_path
    _S["occ_ver"] = None
    _S["protos"] = {k: np.array(p, np.float32) for k, p in protos.items()}
    _S["labels"] = labels
    _S["families"] = families
    _S["placed_path"] = placed_path
    _S["placed_ver"] = None


def _occupancy():
    ver = os.path.getmtime(_S["occ_path"])
    if _S["occ_ver"] != ver:
        _S["occ"] = np.load(_S["occ_path"])
        _S["occ_ver"] = ver
    return _S["occ"]


def _placed_by_family():
    ver = os.path.getmtime(_S["placed_path"])
    if _S["placed_ver"] != ver:
        _S["placed"] = json.loads(open(_S["placed_path"]).read())
        _S["placed_ver"] = ver
    return _S["placed"]


def rect_gap(xs, ys, w, h, rects):
    """Smallest gap (px) between the w x h box at each (xs, ys) and any rect."""
    gap = np.full(len(xs), np.inf, np.float32)
    for px, py, pw, ph in rects:
        dx = np.maximum(0, np.maximum(px - (xs + w), xs - (px + pw)))
        dy = np.maximum(0, np.maximum(py - (ys + h), ys - (py + ph)))
        gap = np.minimum(gap, np.hypot(dx, dy))
    return gap


def label_points(name):
    """Label positions for this tile: exact name first, else its parent scene."""
    b = base_name(name)
    parts = b.split("_")
    for cut in range(len(parts), 1, -1):
        key = "_".join(parts[:cut]).lower()
        pts = _S["labels"].get(key)
        if pts:
            return pts, (1.0 if cut == len(parts) else 0.6)
    return [], 0.0


def surfaces(name, box=None):
    tile = load_tile(name)
    value, mask = tile_template(tile)
    h, w = value.shape
    t = value / 255.0
    n = float(mask.sum())
    tz = ((t - (t * mask).sum() / n) * mask).astype(np.float32)
    energy = float((tz * tz).sum())

    num = cv2.matchTemplate(_S["i"], tz, cv2.TM_CCORR)
    s1 = cv2.matchTemplate(_S["i"], mask, cv2.TM_CCORR)
    s2 = cv2.matchTemplate(_S["i2"], mask, cv2.TM_CCORR)
    var = np.maximum(s2 - s1 * s1 / n, n * (MIN_WINDOW_STD / 255.0) ** 2)
    ncc = num / np.sqrt(var * energy)
    del s1, s2, var

    # fraction of the sprite's drawn (non-black) pixels that would sit on void
    body = ((mask > 0) & (value > 8)).astype(np.float32)
    vf = cv2.matchTemplate(_S["void"], body, cv2.TM_CCORR) / max(1.0, float(body.sum()))
    score = ncc - W_VOID * np.clip((vf - VOID_FREE) / (VOID_MAX - VOID_FREE), 0, 1)
    live = score > max(0.3, float(score.max()) - 0.35)   # only these can win; skip work elsewhere
    if box is not None:   # owner review: only top-left corners inside [x0, y0, x1, y1]
        x0, y0, x1, y1 = box
        live = np.zeros_like(live)
        live[max(0, y0):y1 + 1, max(0, x0):x1 + 1] = True

    protos = _S["protos"].get(tint_key(name))
    if protos is not None:
        cov = np.stack([cv2.matchTemplate(c, tz, cv2.TM_CCORR)[live] for c in _S["ch"]], axis=1)
        cov /= np.linalg.norm(cov, axis=1, keepdims=True) + 1e-9
        cos = np.clip((cov @ protos.T).max(axis=1), -1, 1)
        ang = np.degrees(np.arccos(cos))
        score[live] -= W_TINT * np.clip(ang - MIN_ANGLE, 0, MAX_ANGLE - MIN_ANGLE) / (MAX_ANGLE - MIN_ANGLE)

    if not is_variant(name):
        occ = _occupancy()
        other = ((occ != 0) & (occ != _S["families"][family(name)])).astype(np.float32)
        if other.any():
            ov = cv2.matchTemplate(other, mask, cv2.TM_CCORR) / n
            score -= W_OVERLAP * ov

    ys, xs = np.nonzero(live)
    pts, weight = label_points(name)
    if pts:   # distance from each label point to the tile's rectangle
        gap = rect_gap(xs, ys, w, h, [(lx, ly, 0, 0) for lx, ly in pts])
        score[ys, xs] += W_LABEL * weight * np.exp(-gap * gap / (2 * LABEL_SIGMA ** 2))

    siblings = [r for n, r in _placed_by_family().get(family(name), []) if n != name]
    if siblings:
        gap = rect_gap(xs, ys, w, h, siblings)
        score[ys, xs] += W_FAMILY * np.exp(-gap * gap / (2 * FAMILY_SIGMA ** 2))
    score[~live] = -1.0
    return ncc, score, w, h, vf


def evaluate(arg):
    name, box = (arg, None) if isinstance(arg, str) else arg
    ncc, score, w, h, vf = surfaces(name, box)
    _, b1, _, (x1, y1) = cv2.minMaxLoc(score)
    # runner-up: best position that overlaps the winner by less than half
    sup = score.copy()
    sup[max(0, y1 - h // 2):y1 + h // 2 + 1, max(0, x1 - w // 2):x1 + w // 2 + 1] = -1.0
    _, b2, _, (x2, y2) = cv2.minMaxLoc(sup)
    return name, {"x": int(x1), "y": int(y1), "w": w, "h": h, "score": round(float(b1), 4),
                  "ncc": round(float(ncc[y1, x1]), 4), "runner_up": round(float(b2), 4),
                  "runner_xy": [int(x2), int(y2)], "void": round(float(vf[y1, x1]), 3)}


# ---------------------------------------------------------------- driver side

def is_piece(name):
    """X_top, X_left_2 ... : a part of scene X rather than the scene's main sprite."""
    return base_name(name).lower() != family(name)


def detached(name, r, placed):
    """True if name is a piece whose scene has placed pieces, none of them near r."""
    if not is_piece(name):
        return False
    sib = [p for n, p in placed.items() if n != name and family(n) == family(name) and "x" in p]
    if not sib:
        return False
    xs, ys = np.array([r["x"]]), np.array([r["y"]])
    rects = [(p["x"], p["y"], p["w"], p["h"]) for p in sib]
    return float(rect_gap(xs, ys, r["w"], r["h"], rects)[0]) > DETACH_GAP


def learn_protos(cands, bgr):
    ch = [(bgr[..., c] / 255.0).astype(np.float32) for c in range(3)]
    groups = defaultdict(list)
    for name, r in cands.items():
        p = r["peaks"]
        if r["degenerate"] or len(p) < 2 or p[0][0] < 0.88 or p[0][0] - p[1][0] < 0.08:
            continue
        value, mask = tile_template(load_tile(name))
        t = value / 255.0
        n = mask.sum()
        tz = (t - (t * mask).sum() / n) * mask
        x, y = p[0][1], p[0][2]
        h, w = value.shape
        k = np.array([(c[y:y + h, x:x + w] * tz).sum() for c in ch])
        groups[tint_key(name)].append(k / np.linalg.norm(k))
    protos = {}
    for key, vecs in groups.items():
        kept = []
        for v in vecs:   # keep distinct shades only (> 1 deg apart)
            if all(np.degrees(np.arccos(np.clip(v @ k, -1, 1))) > 1.0 for k in kept):
                kept.append(v)
        protos[key] = [k.tolist() for k in kept]
    return protos


def load_review():
    """Owner verdicts that override the solver: confirmed_locks.json (old confirmations
    the fit agreed with, from lock_confirmed.py) overlaid by review.json, which wins.
    Returns (removed names, {name: search box}, raw entries); a lock is a 1-pixel box."""
    entries = {}
    for fname in ("confirmed_locks.json", "review.json"):
        path = Path(__file__).resolve().parent / fname
        if path.exists():
            entries.update(json.loads(path.read_text(encoding="utf-8"))["tiles"])
    removed = {n for n, e in entries.items() if e["verdict"] == "remove"}
    boxes = {}
    for n, e in entries.items():
        if e["verdict"] == "lock":
            boxes[n] = [e["x"], e["y"], e["x"], e["y"]]
        elif e["verdict"] == "search":
            boxes[n] = e["box"]
    return removed, boxes, entries


def load_labels():
    path = OUT_DIR / "labels.json"
    if not path.exists():
        return {}
    out = defaultdict(list)
    for lab in json.loads(path.read_text()):
        if lab["name"] and lab["match"] >= 0.8:
            out[lab["name"].lower()].append((lab["x"], lab["y"]))
    return dict(out)


def stamp(occ, name, x, y, fam_id):
    _, mask = tile_template(load_tile(name))
    m = cv2.erode((mask > 0).astype(np.uint8), np.ones((5, 5), np.uint8))  # shared outlines are fine
    h, w = m.shape
    region = occ[y:y + h, x:x + w]
    region[m > 0] = fam_id


def rect_overlap(a, b):
    ix = max(0, min(a["x"] + a["w"], b["x"] + b["w"]) - max(a["x"], b["x"]))
    iy = max(0, min(a["y"] + a["h"], b["y"] + b["h"]) - max(a["y"], b["y"]))
    return ix * iy / max(1, min(a["w"] * a["h"], b["w"] * b["h"]))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--workers", type=int, default=8)
    args = ap.parse_args()

    cands = json.loads((OUT_DIR / "candidates.json").read_text())
    bgr, _ = load_map_value()
    protos = learn_protos(cands, bgr)
    labels = load_labels()
    print(f"tint prototypes for {len(protos)} areas; OCR labels for {len(labels)} names")

    families = {f: i + 1 for i, f in enumerate(sorted({family(n) for n in cands}))}
    occ = np.zeros(bgr.shape[:2], np.int32)
    occ_path = OUT_DIR / "_occupancy.npy"
    np.save(occ_path, occ)
    placed_path = OUT_DIR / "_placed.json"
    placed_path.write_text("{}")

    removed, boxes, review = load_review()
    unknown = (removed | boxes.keys()) - cands.keys()
    if unknown:
        raise SystemExit(f"review.json names tiles that do not exist: {sorted(unknown)}")
    todo = sorted(n for n, r in cands.items() if not r["degenerate"] and n not in removed and n not in boxes)
    placed = {}
    with Pool(args.workers, initializer=_init, initargs=(str(occ_path), protos, labels, families, str(placed_path))) as pool:
        # round 0: owner-reviewed tiles go first, so they claim their slots and anchor their scenes
        for n, r in pool.imap_unordered(evaluate, sorted(boxes.items()), chunksize=2):
            r.update(status="reviewed", round=0,
                     note=review[n].get("note") or ("old confirmation" if review[n].get("from") == "old confirmation" else None))
            placed[n] = r
            if not is_variant(n):
                stamp(occ, n, r["x"], r["y"], families[family(n)])
        np.save(occ_path, occ)
        by_family = defaultdict(list)
        for n, r in placed.items():
            by_family[family(n)].append([n, [r["x"], r["y"], r["w"], r["h"]]])
        placed_path.write_text(json.dumps(by_family))
        print(f"review: {len(boxes)} tiles locked or searched, {len(removed)} removed", flush=True)
        threshold = ACCEPT_SCORE
        for rnd in range(1, ROUNDS + 1):
            res = dict(pool.imap_unordered(evaluate, todo, chunksize=4))
            ok = [(n, r) for n, r in res.items()
                  if r["score"] >= threshold and r["score"] - r["runner_up"] >= ACCEPT_MARGIN
                  and not detached(n, r, placed)]
            ok.sort(key=lambda nr: -(nr[1]["score"] - nr[1]["runner_up"]))
            accepted = []
            for n, r in ok:   # two tiles may want the same slot this round: best margin wins
                if not is_variant(n) and any(rect_overlap(r, a) > 0.3 for m, a in accepted
                                             if not is_variant(m) and family(m) != family(n)):
                    continue
                accepted.append((n, r))
            for n, r in accepted:
                r.update(status="placed", round=rnd)
                placed[n] = r
                if not is_variant(n):
                    stamp(occ, n, r["x"], r["y"], families[family(n)])
            np.save(occ_path, occ)
            by_family = defaultdict(list)
            for n, r in placed.items():
                by_family[family(n)].append([n, [r["x"], r["y"], r["w"], r["h"]]])
            placed_path.write_text(json.dumps(by_family))
            todo = [n for n in todo if n not in placed]
            print(f"round {rnd}: threshold {threshold:.2f}, accepted {len(accepted)}, remaining {len(todo)}", flush=True)
            if not accepted:
                if threshold <= ACCEPT_FLOOR + 1e-9:
                    break
                threshold = max(ACCEPT_FLOOR, threshold - 0.05)
        # leftovers: best position under the final occupancy, flagged for review
        for n, r in pool.imap_unordered(evaluate, todo, chunksize=4):
            if r["ncc"] < FINAL_MIN_NCC or r["void"] > VOID_MAX:
                r["status"] = "unmatched"
            elif detached(n, r, placed):
                r["status"] = "detached"
            elif r["score"] - r["runner_up"] < ACCEPT_MARGIN:
                r["status"] = "ambiguous"
            else:
                r["status"] = "weak"
            placed[n] = r
    for n, r in cands.items():
        if n in removed:
            placed[n] = {"status": "removed", "w": r["w"], "h": r["h"]}
        elif r["degenerate"] and n not in placed:
            placed[n] = {"status": "too_small", "w": r["w"], "h": r["h"]}
    os.remove(occ_path)
    os.remove(placed_path)
    write_outputs(placed, cands)


def write_outputs(placed, cands):
    tiles = {}
    for n in sorted(placed):
        r = placed[n]
        c = cands[n]
        status = r["status"]
        if status == "placed" and r["ncc"] < PLACED_MIN_NCC:
            status = "weak"
        e = {"status": status, "area": area_of(n), "variant": is_variant(n),
             "native_width": c["native_w"], "native_height": c["native_h"], "scale": GLOBAL_SCALE}
        if "x" in r:
            e.update(x=r["x"], y=r["y"], width=r["w"], height=r["h"], score=r["score"],
                     ncc=r["ncc"], runner_up=r["runner_up"], runner_xy=r["runner_xy"], void=r.get("void"), round=r.get("round"))
            if r.get("note"):
                e["note"] = r["note"]
        tiles[n] = e
    counts = defaultdict(int)
    for e in tiles.values():
        counts[e["status"]] += 1
    meta = {"fullmap": "full_pharloom_clean.webp", "fullmap_width": 4096, "fullmap_height": 4096,
            "scale": GLOBAL_SCALE, "counts": dict(counts),
            "weights": {"tint": W_TINT, "overlap": W_OVERLAP, "label": W_LABEL, "family": W_FAMILY, "void": W_VOID}}
    (OUT_DIR / "tile_fit.json").write_text(json.dumps({"metadata": meta, "tiles": tiles}, indent=1), encoding="utf-8")
    print("wrote tile_fit.json", dict(counts))
    report(tiles)


def report(tiles):
    conf = json.loads((ROOT / "tools" / "confirmed_tiles.json").read_text())["tiles"]
    lines = ["TILEFIT REPORT", "=" * 70]
    agree, moved = 0, []
    for n, e in tiles.items():
        c = conf.get(n)
        if not c or c["status"] != "confirmed" or "x" not in e:
            continue
        d = np.hypot(c["x"] + c["width"] / 2 - e["x"] - e["width"] / 2, c["y"] + c["height"] / 2 - e["y"] - e["height"] / 2)
        if d < 25:
            agree += 1
        else:
            moved.append((n, int(d), e))
    lines.append(f"old confirmed tiles within 25px of new fit: {agree}; moved: {len(moved)}")
    for status in ["reviewed", "placed", "weak", "ambiguous", "detached", "unmatched", "too_small", "removed"]:
        group = [(n, e) for n, e in tiles.items() if e["status"] == status]
        lines += ["", f"[{status}] {len(group)}"]
        if status == "placed":
            continue
        for n, e in group:
            lines.append(f"  {n:45s} ncc={e.get('ncc', '-')} score={e.get('score', '-')} runner={e.get('runner_up', '-')}"
                         f" old={conf.get(n, {}).get('status', 'none')}")
    lines += ["", "[moved vs old confirmation]"]
    for n, d, e in sorted(moved, key=lambda m: -m[1]):
        lines.append(f"  {n:45s} {d:5d}px  new status={e['status']} ncc={e['ncc']} margin={round(e['score'] - e['runner_up'], 3)}")
    (OUT_DIR / "fit_report.txt").write_text("\n".join(lines), encoding="utf-8")
    print("\n".join(lines[:3]))


if __name__ == "__main__":
    main()
