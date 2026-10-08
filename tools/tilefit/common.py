"""
Shared helpers for the tilefit pipeline.

Model: the clean Pharloom map is a composite of the room sprites (the tile PNGs),
each drawn at one global scale and tinted with its area colour. A tint is a
per-channel gain on the sprite's grey levels, so normalised cross-correlation on
brightness (max of RGB) is tint-invariant and the only unknown per tile is its
position.
"""

import re
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
FULLMAP_DIR = ROOT / "web" / "assets" / "img" / "fullmap"
CLEAN_MAP = FULLMAP_DIR / "full_pharloom_clean.webp"
OUT_DIR = Path(__file__).resolve().parent / "out"
# Committed copies of the review outputs, read by the review page (viewer.html via
# review_server.py). Not under web/, so they are never deployed.
PUBLISHED_DIR = Path(__file__).resolve().parent / "published"

# Measured on confirmed tiles: NCC peaks at 0.765-0.770 for every tile size,
# including tiles the old matcher had placed at 0.9/1.1/1.3.
GLOBAL_SCALE = 0.767

# Files in FULLMAP_DIR that are whole maps, not room sprites.
NOT_TILES = {"silksong_fullmap.png"}   # the labeled community map used for OCR


def tile_files():
    return sorted(
        p.name for p in FULLMAP_DIR.glob("*.png") if p.name not in NOT_TILES
    )


def base_name(filename):
    """'Abyss_02b #4265375.png' -> 'Abyss_02b'; '__0003_Ward_04.png' -> 'Ward_04'."""
    name = filename[:-4] if filename.endswith(".png") else filename
    name = re.sub(r"\s*#\d+$", "", name)
    name = re.sub(r"^_+\d{4}_", "", name)
    return name


def area_of(filename):
    return base_name(filename).split("_")[0].capitalize()


def load_map_value():
    """Map brightness as float32 (max over BGR)."""
    m = cv2.imread(str(CLEAN_MAP))
    return m, m.max(axis=2).astype(np.float32)


def load_tile(filename):
    t = cv2.imread(str(FULLMAP_DIR / filename), cv2.IMREAD_UNCHANGED)
    if t.ndim == 2:
        t = cv2.cvtColor(t, cv2.COLOR_GRAY2BGRA)
    elif t.shape[2] == 3:
        t = np.dstack([t, np.full(t.shape[:2], 255, np.uint8)])
    return t


def tile_template(tile, scale=GLOBAL_SCALE):
    """Scaled brightness template and alpha mask (float32) for matchTemplate."""
    w = max(1, round(tile.shape[1] * scale))
    h = max(1, round(tile.shape[0] * scale))
    tr = cv2.resize(tile, (w, h), interpolation=cv2.INTER_AREA)
    alpha = tr[..., 3].astype(np.float32) / 255.0
    value = tr[..., :3].max(axis=2).astype(np.float32) * alpha
    mask = (alpha > 0.25).astype(np.float32)
    return value, mask


# Windows flatter than this (brightness std, 0-255 scale) are treated as if they
# had this std, so black background can never correlate highly. cv2's masked
# TM_CCOEFF_NORMED divides by ~0 there and returns huge scores.
MIN_WINDOW_STD = 12.0


class MapStats:
    """Map brightness plus its square, precomputed for masked NCC."""

    def __init__(self, value):
        self.i = (value / 255.0).astype(np.float32)
        self.i2 = self.i * self.i


def ncc(stats, value, mask):
    """Masked zero-mean NCC of template `value` (inside `mask`) at every offset."""
    t = value / 255.0
    n = float(mask.sum())
    tz = ((t - (t * mask).sum() / n) * mask).astype(np.float32)
    t_energy = float((tz * tz).sum())
    num = cv2.matchTemplate(stats.i, tz, cv2.TM_CCORR)
    s1 = cv2.matchTemplate(stats.i, mask, cv2.TM_CCORR)
    s2 = cv2.matchTemplate(stats.i2, mask, cv2.TM_CCORR)
    var = np.maximum(s2 - s1 * s1 / n, n * (MIN_WINDOW_STD / 255.0) ** 2)
    return num / np.sqrt(var * t_energy)
