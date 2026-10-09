"""
Run the whole tilefit pipeline and publish its outputs (read by the review page, viewer.html).

  1. match_candidates.py  shape NCC of every tile over the clean map (~2 min)
  2. ocr_labels.py        read scene labels on silksong_fullmap.png (~10 min, skipped
                          if out/labels.json exists; pass --ocr to redo it)
  3. solve.py             iterative placement with tint/overlap/label terms (~10 min)
  4. coverage.py          uncovered regions + labels inside each tile
  5. merge.py             tile_coordinates.json (old schema): fit + old confirmations
  6. lock_confirmed.py    confirmed_locks.json: old confirmations the fit agrees with
                          become locks for the next run; the rest are listed as disputed
  7. scene_tiles.py       scene_tiles.json: scene -> reviewed sprites (names, aliases, pieces)

merge.py is followed by refine_scale.py, which gives tiles that clearly match better at
their own scale that scale (out/tile_coordinates.json in place).

The reviewed tile_coordinates.json and scene_tiles.json are also copied to
web/assets/img/fullmap/, where Hero's Path reads them.

Outputs go to tools/tilefit/out/ and are copied to tools/tilefit/published/ (for the review page).
tools/confirmed_tiles.json is never modified.

Usage: python tools/tilefit/run_all.py [--ocr] [--skip-candidates]
"""

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

from common import FULLMAP_DIR, OUT_DIR, PUBLISHED_DIR

HERE = Path(__file__).resolve().parent
PUBLISH = ["tile_fit.json", "uncovered.json", "uncovered.png", "labels.json", "tile_coordinates.json", "scene_tiles.json"]


def run(script):
    print(f"\n=== {script} ===", flush=True)
    subprocess.run([sys.executable, "-u", str(HERE / script)], cwd=HERE, check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ocr", action="store_true", help="re-run OCR even if labels.json exists")
    ap.add_argument("--skip-candidates", action="store_true")
    args = ap.parse_args()

    if not args.skip_candidates or not (OUT_DIR / "candidates.json").exists():
        run("match_candidates.py")
    if args.ocr or not (OUT_DIR / "labels.json").exists():
        run("ocr_labels.py")
    run("solve.py")
    run("coverage.py")
    run("merge.py")
    run("refine_scale.py")
    run("lock_confirmed.py")
    run("scene_tiles.py")

    dest = PUBLISHED_DIR
    dest.mkdir(exist_ok=True)
    for name in PUBLISH:
        shutil.copy2(OUT_DIR / name, dest / name)
    shutil.copy2(HERE / "confirmed_locks.json", dest / "confirmed_locks.json")
    for name in ("tile_coordinates.json", "scene_tiles.json"):   # what the pages read
        shutil.copy2(OUT_DIR / name, FULLMAP_DIR / name)
    print(f"\npublished {', '.join(PUBLISH)} to {dest}")


if __name__ == "__main__":
    main()
