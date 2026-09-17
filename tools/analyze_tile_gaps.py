"""
Tile Gap Analysis for Silksong Webweaver

Cross-references:
  1. scenesVisited from save data (output2.json)
  2. Tile PNG files on disk (web/assets/img/fullmap/)
  3. Confirmed tiles (tools/confirmed_tiles.json)
  4. Tile coordinates (web/assets/img/fullmap/tile_coordinates.json)

Produces a categorized report showing:
  A. Scenes WITH a tile PNG that IS confirmed (done - no action needed)
  B. Scenes WITH a tile PNG that is matched but NOT confirmed (needs confirmation)
  C. Scenes WITH a tile PNG that FAILED to match (needs manual placement)
  D. Scenes WITH NO tile PNG at all (no tile exists)
  E. Tile PNGs that exist but have NO corresponding scene in scenesVisited (orphan tiles)
"""

import json
import os
from pathlib import Path
from collections import defaultdict

# Paths
ROOT = Path(__file__).parent.parent
SAVE_DATA_PATH = ROOT / "output2.json"
TILES_DIR = ROOT / "web" / "assets" / "img" / "fullmap"
CONFIRMED_TILES_PATH = ROOT / "tools" / "confirmed_tiles.json"
TILE_COORDS_PATH = TILES_DIR / "tile_coordinates.json"

# Directories and files to ignore in fullmap folder
IGNORE_DIRS = {"Markers", "widemap"}
IGNORE_FILES = {
    "full_dont_use_pharloom.png",
    "full_pharloom_clean.webp",
    "pharloom_covered.png",
    "silksong_fullmap.png",
    "0000_pharloom.png",
    "tile_coordinates.json",
}


def load_scenes_visited():
    """Load scenesVisited from decrypted save data."""
    with open(SAVE_DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    # Handle both direct playerData and nested structure
    if "playerData" in data:
        pd = data["playerData"]
    else:
        pd = data
    
    scenes = pd.get("scenesVisited", [])
    return scenes


def load_tile_pngs():
    """Get all tile PNG files on disk. Returns dict: {basename_no_ext: filename}"""
    tiles = {}
    for item in TILES_DIR.iterdir():
        if item.is_dir() and item.name in IGNORE_DIRS:
            continue
        if item.is_dir():
            continue
        if item.name in IGNORE_FILES:
            continue
        if item.suffix.lower() != ".png":
            continue
        
        # Store with full filename as value, stem (no ext) as a lookup key
        tiles[item.name] = item
    
    return tiles


def load_confirmed_tiles():
    """Load confirmed tiles JSON."""
    if not CONFIRMED_TILES_PATH.exists():
        return {}
    with open(CONFIRMED_TILES_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("tiles", {})


def load_tile_coordinates():
    """Load tile_coordinates.json."""
    if not TILE_COORDS_PATH.exists():
        return {}
    with open(TILE_COORDS_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("tiles", {})


def normalize_scene_name(scene):
    """Normalize a scene name for matching against tile filenames."""
    return scene.strip()


def find_matching_tiles(scene, tile_filenames):
    """
    Find tile PNGs that could correspond to a scene name.
    
    Scene names like 'Abyss_01' could match:
      - Abyss_01.png (exact)
      - Abyss_01 #1234567.png (with hash suffix)
      - _0001_Abyss_01.png (with numeric prefix)
    
    Returns list of matching filenames.
    """
    matches = []
    scene_lower = scene.lower()
    
    for filename in tile_filenames:
        stem = Path(filename).stem.lower()
        
        # Exact match
        if stem == scene_lower:
            matches.append(filename)
            continue
        
        # Match with hash suffix: "Abyss_01 #1234567"
        if stem.startswith(scene_lower) and (
            len(stem) > len(scene_lower) and 
            stem[len(scene_lower):].strip().startswith("#")
        ):
            matches.append(filename)
            continue
        
        # Match with numeric prefix: "_0001_Abyss_01" or "__0001_Abyss_01"
        cleaned = stem.lstrip("_")
        # Remove leading digits and underscore
        parts = cleaned.split("_", 1)
        if len(parts) > 1 and parts[0].isdigit():
            rest = parts[1]
            if rest == scene_lower:
                matches.append(filename)
                continue
    
    return matches


def main():
    print("=" * 70)
    print("TILE GAP ANALYSIS - Silksong Webweaver")
    print("=" * 70)
    
    # Load all data sources
    print("\nLoading data sources...")
    scenes = load_scenes_visited()
    tile_files = load_tile_pngs()
    confirmed = load_confirmed_tiles()
    coordinates = load_tile_coordinates()
    
    print(f"  Scenes visited: {len(scenes)}")
    print(f"  Tile PNGs on disk: {len(tile_files)}")
    print(f"  Confirmed tiles: {sum(1 for t in confirmed.values() if t.get('status') == 'confirmed')}")
    print(f"  Rejected tiles: {sum(1 for t in confirmed.values() if t.get('status') == 'rejected')}")
    print(f"  Tile coordinates entries: {len(coordinates)}")
    
    # Categorize each scene
    cat_a = []  # Has tile, confirmed
    cat_b = []  # Has tile, matched but not confirmed
    cat_c = []  # Has tile, failed to match
    cat_d = []  # No tile PNG exists
    
    matched_tile_files = set()  # Track which tile files got matched to a scene
    
    for scene in scenes:
        scene_norm = normalize_scene_name(scene)
        
        # Find matching tile PNGs
        matching_tiles = find_matching_tiles(scene_norm, tile_files.keys())
        
        if not matching_tiles:
            cat_d.append(scene_norm)
            continue
        
        matched_tile_files.update(matching_tiles)
        
        # Check if any matching tile is confirmed
        any_confirmed = False
        any_matched = False
        
        for tile_fn in matching_tiles:
            # Check confirmed_tiles.json
            if tile_fn in confirmed and confirmed[tile_fn].get("status") == "confirmed":
                any_confirmed = True
                break
            # Check tile_coordinates.json
            if tile_fn in coordinates and coordinates[tile_fn].get("confirmed"):
                any_confirmed = True
                break
        
        if any_confirmed:
            cat_a.append((scene_norm, matching_tiles))
            continue
        
        # Check if matched but not confirmed
        for tile_fn in matching_tiles:
            if tile_fn in coordinates:
                any_matched = True
                break
        
        if any_matched:
            cat_b.append((scene_norm, matching_tiles))
        else:
            cat_c.append((scene_norm, matching_tiles))
    
    # Find orphan tiles (tile PNGs with no corresponding scene)
    cat_e = []
    for tile_fn in sorted(tile_files.keys()):
        if tile_fn not in matched_tile_files:
            cat_e.append(tile_fn)
    
    # ─── Print Report ───────────────────────────────────────────────────
    
    report_lines = []
    def p(line=""):
        try:
            print(line)
        except UnicodeEncodeError:
            print(line.encode("ascii", errors="replace").decode("ascii"))
        report_lines.append(line)
    
    p("\n" + "=" * 70)
    p("CATEGORIZED TILE GAP REPORT")
    p("=" * 70)
    
    p(f"\n  Total scenes visited: {len(scenes)}")
    p(f"  [A] Has tile + CONFIRMED:              {len(cat_a):4d}  [DONE]")
    p(f"  [B] Has tile + matched, NOT confirmed: {len(cat_b):4d}  [NEEDS CONFIRMATION]")
    p(f"  [C] Has tile + FAILED to match:        {len(cat_c):4d}  [NEEDS MANUAL PLACEMENT]")
    p(f"  [D] NO tile PNG exists:                {len(cat_d):4d}  [NO TILE]")
    p(f"  [E] Orphan tiles (no scene):           {len(cat_e):4d}  [ORPHAN]")
    
    # ─── Category B: Matched but not confirmed ──────────────────────────
    p("\n" + "-" * 70)
    p("[B] MATCHED BUT NOT CONFIRMED — needs review/confirmation")
    p("-" * 70)
    
    cat_b_by_area = defaultdict(list)
    for scene, tiles in cat_b:
        area = scene.split("_")[0]
        # Get confidence from coordinates
        confs = []
        for t in tiles:
            if t in coordinates:
                confs.append((t, coordinates[t].get("confidence", 0)))
        cat_b_by_area[area].append((scene, confs))
    
    for area in sorted(cat_b_by_area.keys()):
        entries = cat_b_by_area[area]
        p(f"\n  ### {area} ({len(entries)} scenes)")
        for scene, confs in sorted(entries, key=lambda x: x[0]):
            conf_str = ", ".join(f"{t} ({c:.2f})" for t, c in confs) if confs else "no coords"
            p(f"    - {scene}  →  {conf_str}")
    
    # ─── Category C: Has tile but failed to match ────────────────────────
    p("\n" + "-" * 70)
    p("[C] HAS TILE PNG BUT FAILED TO MATCH — needs manual placement")
    p("-" * 70)
    
    cat_c_by_area = defaultdict(list)
    for scene, tiles in cat_c:
        area = scene.split("_")[0]
        cat_c_by_area[area].append((scene, tiles))
    
    for area in sorted(cat_c_by_area.keys()):
        entries = cat_c_by_area[area]
        p(f"\n  ### {area} ({len(entries)} scenes)")
        for scene, tiles in sorted(entries, key=lambda x: x[0]):
            p(f"    - {scene}  →  tiles: {', '.join(tiles)}")
    
    # ─── Category D: No tile PNG at all ──────────────────────────────────
    p("\n" + "-" * 70)
    p("[D] NO TILE PNG EXISTS — these scenes have no map tile image")
    p("-" * 70)
    
    cat_d_by_area = defaultdict(list)
    for scene in cat_d:
        area = scene.split("_")[0]
        cat_d_by_area[area].append(scene)
    
    for area in sorted(cat_d_by_area.keys()):
        entries = cat_d_by_area[area]
        p(f"\n  ### {area} ({len(entries)} scenes)")
        for scene in sorted(entries):
            p(f"    - {scene}")
    
    # ─── Category E: Orphan tiles ────────────────────────────────────────
    p("\n" + "-" * 70)
    p("[E] ORPHAN TILES — tile PNGs with no matching scenesVisited entry")
    p("-" * 70)
    
    cat_e_by_area = defaultdict(list)
    for tile_fn in cat_e:
        stem = Path(tile_fn).stem
        # Extract area
        name = stem.lstrip("_")
        parts = name.split("_")
        if parts[0].isdigit() and len(parts) > 1:
            area = parts[1]
        else:
            area = parts[0]
        cat_e_by_area[area].append(tile_fn)
    
    for area in sorted(cat_e_by_area.keys()):
        entries = cat_e_by_area[area]
        p(f"\n  ### {area} ({len(entries)} tiles)")
        for tile_fn in sorted(entries):
            # Check if it's confirmed or matched
            status = ""
            if tile_fn in confirmed:
                status = f" [{confirmed[tile_fn].get('status', '?')}]"
            elif tile_fn in coordinates:
                conf = coordinates[tile_fn].get("confidence", 0)
                is_conf = coordinates[tile_fn].get("confirmed", False)
                status = f" [coords: conf={conf:.2f}, confirmed={is_conf}]"
            p(f"    - {tile_fn}{status}")
    
    # ─── Summary for action ──────────────────────────────────────────────
    p("\n" + "=" * 70)
    p("ACTION SUMMARY")
    p("=" * 70)
    p(f"\n  Priority 1: Confirm {len(cat_b)} matched-but-unconfirmed tiles")
    p(f"             (these already have coordinates, just need human review)")
    p(f"\n  Priority 2: Manually place {len(cat_c)} tiles that have PNGs but failed matching")
    p(f"             (these need OCR or manual annotation on the labeled map)")
    p(f"\n  Priority 3: Handle {len(cat_d)} scenes with NO tile PNG")
    p(f"             (may be interiors, cutscenes, or shared rooms — need to decide)")
    p(f"\n  Info: {len(cat_e)} orphan tiles exist that don't match any visited scene")
    p(f"             (could be alternate states, destroyed versions, etc.)")
    
    # Save report to file
    report_path = ROOT / "tile_gap_report.txt"
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("\n".join(report_lines))
    
    p(f"\n  Report saved to: {report_path}")


if __name__ == "__main__":
    main()
