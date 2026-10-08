"""Tests for the pure helpers of tools/tilefit. Skipped when OpenCV is not installed (CI)."""

import sys
from pathlib import Path

import pytest

pytest.importorskip("cv2")
np = pytest.importorskip("numpy")

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "tilefit"))

from common import MapStats, base_name, ncc  # noqa: E402
from solve import family, is_piece, is_variant, rect_gap  # noqa: E402


@pytest.mark.parametrize("filename, expected", [
    ("Abyss_02b #4265375.png", "Abyss_02b"),
    ("__0003_Ward_04.png", "Ward_04"),
    ("_0002_Bone_East_18b_right.png", "Bone_East_18b_right"),
    ("Bone_East_15_left.png", "Bone_East_15_left"),
])
def test_base_name(filename, expected):
    assert base_name(filename) == expected


@pytest.mark.parametrize("filename, fam, piece", [
    ("Bone_East_15_bot #4264866.png", "bone_east_15", True),
    ("Bone_East_15.png", "bone_east_15", False),
    ("Dock_03b_2.png", "dock_03b", True),
    ("Belltown.png", "belltown", False),
])
def test_family_and_piece(filename, fam, piece):
    assert family(filename) == fam
    assert is_piece(filename) is piece


def test_variant_detection():
    assert is_variant("Cog_09_Destroyed.png")
    assert is_variant("Abyss_03_bell_repaired.png")
    assert not is_variant("Cog_09 #4264410.png")


def test_rect_gap():
    xs, ys = np.array([0, 50]), np.array([0, 0])
    gap = rect_gap(xs, ys, 10, 10, [(20, 0, 10, 10)])
    assert gap[0] == 10       # box 0..10 vs rect 20..30
    assert gap[1] == 20       # box 50..60 vs rect 20..30


def test_ncc_finds_template_and_ignores_flat_background():
    rng = np.random.default_rng(0)
    image = np.zeros((80, 80), np.float32)
    patch = rng.uniform(40, 255, (12, 16)).astype(np.float32)
    image[30:42, 50:66] = patch * 0.6 + 10      # tinted copy: gain + offset
    mask = np.ones_like(patch)
    r = ncc(MapStats(image), patch, mask)
    y, x = np.unravel_index(r.argmax(), r.shape)
    assert (x, y) == (50, 30)
    assert r.max() > 0.99
    assert r[:10, :10].max() < 0.1              # black background must not score


def test_review_file_is_well_formed():
    import json
    from common import tile_files
    path = Path(__file__).resolve().parents[1] / "tilefit" / "review.json"
    if not path.exists():
        pytest.skip("no review.json")
    tiles = set(tile_files())
    for name, e in json.loads(path.read_text(encoding="utf-8"))["tiles"].items():
        assert name in tiles, name
        assert e["verdict"] in {"remove", "lock", "search"}, name
        if e["verdict"] == "lock":
            assert isinstance(e["x"], int) and isinstance(e["y"], int), name
        if e["verdict"] == "search":
            x0, y0, x1, y1 = e["box"]
            assert x0 <= x1 and y0 <= y1, name
