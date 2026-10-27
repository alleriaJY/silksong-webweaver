"""
Stage 2: read the red scene-name labels on the community-labeled map
(tools/tilefit/sprites/silksong_fullmap.png) and map them to clean-map pixels.

Text is isolated with a soft "redness" channel (R - max(G, B)) so thin
anti-aliased letters survive, OCR'd in overlapping chunks with easyocr, then
snapped to the vocabulary of known names (tile base names + scenesVisited
entries) with fuzzy matching.

Output: out/labels.json
  [{ "text": raw OCR, "name": snapped name or null, "match": 0-1,
     "conf": ocr confidence, "x", "y": label centre on the CLEAN map }]

Usage: python tools/tilefit/ocr_labels.py
"""

import difflib
import json
import re

import cv2
import numpy as np

from common import OUT_DIR, ROOT, SPRITES_DIR, base_name, tile_files

LABELED = SPRITES_DIR / "silksong_fullmap.png"
TRANSFORM = ROOT / "tools" / "map_transform.json"
CHUNK, OVERLAP, UPSCALE = 700, 120, 2.5


def vocabulary():
    names = {base_name(f) for f in tile_files()}
    for p in [ROOT / "output2.json", ROOT / "output.json"]:
        if p.exists():
            try:
                pd = json.loads(p.read_text(encoding="utf-8")).get("playerData", {})
                names.update(pd.get("scenesVisited", []))
            except (ValueError, AttributeError):
                pass
    return sorted(names)


def squash(s):
    return re.sub(r"[^a-z0-9]", "", s.lower())


def snap(text, vocab, squashed):
    q = squash(text)
    if len(q) < 4:
        return None, 0.0
    best = difflib.get_close_matches(q, squashed, n=1, cutoff=0.0)
    if not best:
        return None, 0.0
    score = difflib.SequenceMatcher(None, q, best[0]).ratio()
    return vocab[squashed.index(best[0])], score


def main():
    import easyocr

    img = cv2.imread(str(LABELED))
    b, g, r = [img[..., i].astype(np.int16) for i in range(3)]
    red = np.clip((r - np.maximum(g, b)) * 2, 0, 255).astype(np.uint8)
    ink = 255 - red  # dark text on white for the OCR model

    A = np.array(json.loads(TRANSFORM.read_text())["labeled_to_clean"])
    vocab = vocabulary()
    squashed = [squash(v) for v in vocab]
    reader = easyocr.Reader(["en"], gpu=False, verbose=False)
    allow = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_"

    H, W = ink.shape
    seen = []
    step = CHUNK - OVERLAP
    for y0 in range(0, H, step):
        for x0 in range(0, W, step):
            tile = ink[y0:y0 + CHUNK, x0:x0 + CHUNK]
            if (tile < 128).sum() < 50:
                continue
            up = cv2.resize(tile, None, fx=UPSCALE, fy=UPSCALE, interpolation=cv2.INTER_CUBIC)
            for box, text, conf in reader.readtext(up, allowlist=allow, width_ths=0.3):
                pts = np.array(box) / UPSCALE + [x0, y0]
                cx, cy = pts[:, 0].mean(), pts[:, 1].mean()
                # labels inside the overlap are read twice; keep the longer read
                dup = next((s for s in seen if abs(s["lx"] - cx) < 25 and abs(s["ly"] - cy) < 8), None)
                if dup and len(dup["text"]) >= len(text):
                    continue
                if dup:
                    seen.remove(dup)
                seen.append({"text": text, "conf": round(float(conf), 3), "lx": float(cx), "ly": float(cy),
                             "lw": float(np.ptp(pts[:, 0]))})
        print(f"  row y={y0}: {len(seen)} labels so far")

    out = []
    for s in seen:
        name, score = snap(s["text"], vocab, squashed)
        x, y = A @ [s["lx"], s["ly"], 1.0]
        out.append({"text": s["text"], "name": name, "match": round(score, 3), "conf": s["conf"],
                    "x": round(float(x), 1), "y": round(float(y), 1),
                    "lx": round(s["lx"], 1), "ly": round(s["ly"], 1), "lw": round(s["lw"], 1)})
    OUT_DIR.mkdir(exist_ok=True)
    (OUT_DIR / "labels.json").write_text(json.dumps(out, indent=1), encoding="utf-8")
    good = sum(1 for o in out if o["match"] >= 0.8)
    print(f"wrote labels.json: {len(out)} reads, {good} snapped with match >= 0.8")


if __name__ == "__main__":
    main()
