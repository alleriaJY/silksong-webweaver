"""Tests for the save tooling. Uses only synthetic data - no personal saves."""

import json
import sys
from pathlib import Path

import pytest

TOOLS_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(TOOLS_DIR))

import decrypt_save  # noqa: E402
import diff_saves  # noqa: E402
import make_fixture  # noqa: E402
import unknown_keys  # noqa: E402
from savelib import HEADER_SIZE, SaveFormatError, decrypt_bytes, encrypt_save, load_save  # noqa: E402

SAMPLE = {
    "playerData": {
        "version": "1.0.99999",
        "defeatedMossMother": False,
        "HasAbyssMap": False,
        "geo": 10,
        "Tools": {"savedData": [{"Name": "Straight Pin", "Data": {"IsUnlocked": True}}]},
        "scenesVisited": ["Tut_01", "Tut_02"],
        "HeroDeathScenePos": {"x": 1.0, "y": 2.0},
    },
    "sceneData": {
        "persistentBools": {"serializedList": [
            {"ID": "Heart Piece", "SceneName": "Bone_East_20", "Mutator": 0, "Value": False},
            {"ID": "Breakable Wall", "SceneName": "Tut_01", "Mutator": 0, "Value": True},
        ]},
        "persistentInts": {"serializedList": []},
        "geoRocks": {"serializedList": [{"ID": "rock"}]},
    },
}


# --- savelib / decrypt ------------------------------------------------------

def test_round_trip():
    assert decrypt_bytes(encrypt_save(SAMPLE)) == SAMPLE


def test_encrypted_layout_matches_rust_expectations():
    blob = encrypt_save(SAMPLE)
    assert blob[:HEADER_SIZE] == bytes(HEADER_SIZE)
    assert blob[-1:] == b"\x0b"


@pytest.mark.parametrize("blob, message", [
    (bytes(26), "too small"),
    (bytes(25) + b"!!!not-base64!!!" + b"\x00", "Base64"),
    (bytes(25) + b"dGVzdA==" + b"\x00", "AES blocks"),
])
def test_rejects_bad_input(blob, message):
    with pytest.raises(SaveFormatError, match=message):
        decrypt_bytes(blob)


def test_decrypt_cli_writes_json(tmp_path, capsys):
    src = tmp_path / "user1.dat"
    src.write_bytes(encrypt_save(SAMPLE))
    assert decrypt_save.main([str(src)]) == 0
    assert json.loads((tmp_path / "user1.json").read_text(encoding="utf-8")) == SAMPLE
    assert "1.0.99999" in capsys.readouterr().out


def test_decrypt_cli_reports_errors(tmp_path):
    bad = tmp_path / "bad.dat"
    bad.write_bytes(bytes(30))
    assert decrypt_save.main([str(bad), str(tmp_path / "out.json")]) == 1


def test_load_save_accepts_bare_player_data(tmp_path):
    path = tmp_path / "bare.json"
    path.write_text(json.dumps({"geo": 1}), encoding="utf-8")
    assert load_save(path) == {"playerData": {"geo": 1}}


# --- diff -------------------------------------------------------------------

def test_diff_player_data_classifies_changes():
    before = SAMPLE["playerData"]
    after = json.loads(json.dumps(before))
    after["defeatedMossMother"] = True
    after["geo"] = 50
    after["Tools"]["savedData"].append({"Name": "Tri Pin", "Data": {"IsUnlocked": True}})
    after["newFlag"] = True
    d = diff_saves.diff_player_data(before, after)
    assert d["bool_on"] == ["defeatedMossMother"]
    assert ("newFlag", True) in d["added"]
    assert d["containers"] == [("Tools", [("Tri Pin", None, {"IsUnlocked": True})])]
    assert d["numeric"] == []  # geo is noisy and hidden by default
    assert ("geo", 10, 50) in diff_saves.diff_player_data(before, after, show_all=True)["numeric"]


def test_diff_scene_reports_new_and_changed_entries():
    a = [{"SceneName": "S", "ID": "Heart Piece", "Value": False}]
    b = [{"SceneName": "S", "ID": "Heart Piece", "Value": True}, {"SceneName": "T", "ID": "Silk Spool", "Value": True}]
    assert diff_saves.diff_scene(a, b) == [("S / Heart Piece", False, True), ("T / Silk Spool", "<absent>", True)]


# --- unknown keys -----------------------------------------------------------

def test_unknown_keys_groups_unreferenced_keys(tmp_path):
    (tmp_path / "schema.js").write_text("export const X = [{ json: 'defeatedMossMother' }];", encoding="utf-8")
    (tmp_path / "schema.test.js").write_text("'HasAbyssMap'", encoding="utf-8")  # tests are ignored
    refs = unknown_keys.referenced_strings(tmp_path)
    groups = unknown_keys.unknown_keys(SAMPLE, refs, bools_only=True)
    assert groups == {"Has*": [("HasAbyssMap", False)]}


def test_unknown_keys_scans_real_schema():
    refs = unknown_keys.referenced_strings()
    assert {"defeatedMossMother", "HasAbyssMap", "Straight Pin"} <= refs


# --- fixtures ---------------------------------------------------------------

def test_make_fixture_trims_world_state():
    fixture = make_fixture.make_fixture(SAMPLE, "user1.dat")
    pd = fixture["playerData"]
    assert "HeroDeathScenePos" not in pd
    assert pd["Tools"] == SAMPLE["playerData"]["Tools"]
    assert pd["scenesVisited"] == ["Tut_01", "Tut_02"]
    bools = fixture["sceneData"]["persistentBools"]["serializedList"]
    assert [e["ID"] for e in bools] == ["Heart Piece"]
    assert "geoRocks" not in fixture["sceneData"]
    assert fixture["_fixture"]["source"] == "user1.dat"


def test_untracked_patterns_explain_unreferenced_keys(tmp_path):
    packs = tmp_path / "packs" / "base"
    packs.mkdir(parents=True)
    (packs / "untracked.js").write_text(
        "export const UNTRACKED = [\n"
        "    { id: 'npc-met', pattern: '^(Met|met)[A-Z]', reason: 'x' },\n"
        "    {\n        id: 'multi-line',\n        pattern: '^visited\\\\w+',\n        reason: 'y',\n    },\n"
        "];\n", encoding="utf-8")
    patterns = unknown_keys.untracked_patterns(tmp_path)
    assert [pid for pid, _ in patterns] == ["npc-met", "multi-line"]
    assert unknown_keys.explain("MetSherma", patterns) == "npc-met"
    assert unknown_keys.explain("visitedAbyss", patterns) == "multi-line"
    assert unknown_keys.explain("defeatedGreyWarrior", patterns) is None
    groups = {"(other)": [("MetSherma", True), ("defeatedGreyWarrior", True)]}
    remaining, explained = unknown_keys.split_explained(groups, patterns)
    assert remaining == {"(other)": [("defeatedGreyWarrior", True)]}
    assert explained == {"npc-met": [("MetSherma", True)]}


def test_real_untracked_file_loads():
    ids = [pid for pid, _ in unknown_keys.untracked_patterns()]
    assert "npc-state" in ids and "world-state" in ids and len(ids) == len(set(ids))
