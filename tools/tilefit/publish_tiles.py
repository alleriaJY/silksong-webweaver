"""
Publish the reviewed sprites for Hero's Path: every confirmed tile in
web/assets/img/fullmap/tile_coordinates.json gets a lossless WebP copy of its source
sprite (tools/tilefit/sprites/<name>.png -> web/assets/img/fullmap/<name>.webp).
WebP copies of sprites no confirmed tile uses are deleted, so the site only ships
what it draws. Copies newer than their source are kept as they are.

Needs Pillow only (no OpenCV), so it can run on its own after a review:
  pip install pillow
  python tools/tilefit/publish_tiles.py
"""

import json
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
SPRITES_DIR = HERE / "sprites"
FULLMAP_DIR = HERE.parents[1] / "web" / "assets" / "img" / "fullmap"
KEEP = {"full_pharloom_clean.webp"}   # the map itself, not a sprite copy


def webp_name(sprite):
    """'Abyss_02b #4265375.png' -> 'Abyss_02b #4265375.webp' (same rule as web/src/map/sceneTiles.js)."""
    return sprite[:-4] + ".webp" if sprite.endswith(".png") else sprite + ".webp"


def used_sprites(coords):
    return sorted({t.get("sprite") or name for name, t in coords.get("tiles", {}).items()
                   if t.get("confirmed") is True})


def main():
    coords = json.loads((FULLMAP_DIR / "tile_coordinates.json").read_text(encoding="utf-8"))
    sprites = used_sprites(coords)
    wanted = {webp_name(s) for s in sprites}
    written = png_bytes = 0
    for sprite in sprites:
        src, dst = SPRITES_DIR / sprite, FULLMAP_DIR / webp_name(sprite)
        png_bytes += src.stat().st_size
        if dst.exists() and dst.stat().st_mtime >= src.stat().st_mtime:
            continue
        with Image.open(src) as im:
            im.save(dst, "WEBP", lossless=True, quality=100, method=6)
        written += 1
    stale = [p for p in FULLMAP_DIR.glob("*.webp") if p.name not in wanted and p.name not in KEEP]
    for p in stale:
        p.unlink()
    webp_bytes = sum((FULLMAP_DIR / n).stat().st_size for n in wanted)
    print(f"{len(sprites)} sprites: {written} written, {len(stale)} stale removed; "
          f"{png_bytes / 1e6:.2f} MB PNG -> {webp_bytes / 1e6:.2f} MB WebP "
          f"({100 * (1 - webp_bytes / png_bytes):.0f}% smaller)")


if __name__ == "__main__":
    main()
