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


def test_scene_of_rules():
    from scene_tiles import scene_of
    scenes = {"Abyss_02b", "Ward_04", "Shellwood_25", "Bone_East_15", "Arborium_11_mid", "Arborium_11", "Dock_08"}
    aliases = {"Dock_01b.png": "Dock_08"}
    assert scene_of("Abyss_02b #4265375.png", scenes, aliases) == "Abyss_02b"       # hash suffix
    assert scene_of("__0003_Ward_04.png", scenes, aliases) == "Ward_04"             # export prefix
    assert scene_of("shellwood_25.png", scenes, aliases) == "Shellwood_25"          # case
    assert scene_of("Bone_East_15_left.png", scenes, aliases) == "Bone_East_15"     # piece
    assert scene_of("Arborium_11_mid.png", scenes, aliases) == "Arborium_11_mid"    # exact beats prefix
    assert scene_of("Dock_01b.png", scenes, aliases) == "Dock_08"                   # alias
    assert scene_of("Nowhere_01.png", scenes, aliases) is None


def test_scene_aliases_point_at_real_sprites_and_scenes():
    from common import tile_files
    from scene_tiles import known_scenes, load_aliases
    tiles, scenes = set(tile_files()), known_scenes()
    for sprite, scene in load_aliases().items():
        assert sprite in tiles, sprite
        assert scene in scenes, f"{sprite} -> {scene}"


def test_instances_name_real_sprites_and_scenes():
    import json
    from common import tile_files
    from scene_tiles import known_scenes
    path = Path(__file__).resolve().parents[1] / "tilefit" / "instances.json"
    tiles, scenes = set(tile_files()), known_scenes()
    for key, inst in json.loads(path.read_text(encoding="utf-8"))["instances"].items():
        assert key == f"{inst['sprite']}@{inst['scene']}", key
        assert inst["sprite"] in tiles, key
        assert inst["scene"] in scenes, key
        assert isinstance(inst["x"], int) and isinstance(inst["y"], int), key


def test_build_uses_an_instance_scene():
    from scene_tiles import build
    coords = {"Bellshrine #1.png": {}, "Bellshrine #1.png@Bellshrine": {"sprite": "Bellshrine #1.png", "scene": "Bellshrine"}}
    out = build(coords, {"Bellshrine", "Bellshrine_03"}, {"Bellshrine #1.png": "Bellshrine_03"})
    assert out["scenes"] == {"Bellshrine": ["Bellshrine #1.png@Bellshrine"], "Bellshrine_03": ["Bellshrine #1.png"]}
