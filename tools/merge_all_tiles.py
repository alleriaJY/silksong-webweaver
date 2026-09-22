"""
Phase 6: Final Tile Coordinate Merge & Verification for Silksong Webweaver

Merges tile coordinates from all sources in strict priority order:
  Priority 1: confirmed_tiles.json (manual confirmations)
  Priority 2: manual_annotations.json (Phase 5 manual annotations if present)
  Priority 3: ocr_matched_tiles.json (Phase 4 OCR extractions)
  Priority 4: tile_coordinates.json (original OpenCV template matcher fallback)

Saves the merged master file to web/assets/img/fullmap/tile_coordinates.json.
"""

import json
from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).parent.parent
CONFIRMED_PATH = ROOT / "tools" / "confirmed_tiles.json"
MANUAL_PATH = ROOT / "tools" / "manual_annotations.json"
OCR_MATCHES_PATH = ROOT / "tools" / "ocr_matched_tiles.json"
MASTER_COORDS_PATH = ROOT / "web" / "assets" / "img" / "fullmap" / "tile_coordinates.json"


def main():
    print("=" * 60)
    print("PHASE 6: FINAL TILE COORDINATE MERGE")
    print("=" * 60)

    merged_tiles = {}
    stats = {"confirmed": 0, "manual": 0, "ocr": 0, "opencv": 0}

    conf_tiles_dict = {}
    if CONFIRMED_PATH.exists():
        with open(CONFIRMED_PATH, "r", encoding="utf-8") as f:
            conf_tiles_dict = json.load(f).get("tiles", {})

    # 1. Base: Original OpenCV tile_coordinates.json
    if MASTER_COORDS_PATH.exists():
        with open(MASTER_COORDS_PATH, "r", encoding="utf-8") as f:
            base_data = json.load(f).get("tiles", {})
        for name, data in base_data.items():
            merged_tiles[name] = data
            stats["opencv"] += 1

    # 2. Layer OCR matches
    if OCR_MATCHES_PATH.exists():
        with open(OCR_MATCHES_PATH, "r", encoding="utf-8") as f:
            ocr_data = json.load(f).get("tiles", {})
        for name, data in ocr_data.items():
            if name not in merged_tiles or not merged_tiles[name].get("confirmed"):
                merged_tiles[name] = data
                stats["ocr"] += 1

    # 3. Layer Manual Annotations
    if MANUAL_PATH.exists():
        with open(MANUAL_PATH, "r", encoding="utf-8") as f:
            manual_data = json.load(f).get("tiles", {})

        tiles_dir = ROOT / "web" / "assets" / "img" / "fullmap"
        from PIL import Image

        for scene_key, data in manual_data.items():
            clean_x = data.get("clean_x", 0)
            clean_y = data.get("clean_y", 0)

            # Find matching tile PNG filename
            png_name = scene_key if scene_key.endswith(".png") else f"{scene_key}.png"
            png_path = tiles_dir / png_name

            if not png_path.exists():
                # Search for matching stem or hash version
                scene_lower = scene_key.lower()
                for item in tiles_dir.glob("*.png"):
                    stem = item.stem
                    if " #" in stem:
                        stem = stem.split(" #")[0]
                    if stem.lower() == scene_lower or item.stem.lower() == scene_lower:
                        png_path = item
                        png_name = item.name
                        break

            w, h = 60, 60
            if png_path.exists():
                try:
                    with Image.open(png_path) as img:
                        w, h = img.size
                except Exception:
                    pass

            top_left_x = max(0, int(round(clean_x - w / 2.0)))
            top_left_y = max(0, int(round(clean_y - h / 2.0)))
            area = scene_key.split("_")[0]

            # Don't overwrite existing confirmed tiles with different coordinates
            merged_tiles[png_name] = {
                "x": top_left_x,
                "y": top_left_y,
                "width": w,
                "height": h,
                "confidence": 1.0,
                "scale": 1.0,
                "area": area,
                "confirmed": True,
                "source": "manual",
            }
            stats["manual"] += 1

            # Update confirmed_tiles dictionary
            conf_tiles_dict[png_name] = {
                "status": "confirmed",
                "x": top_left_x,
                "y": top_left_y,
                "width": w,
                "height": h,
                "area": area,
                "confidence": 1.0,
                "source": "manual",
            }

    # Save updated confirmed_tiles.json
    if CONFIRMED_PATH.exists():
        with open(CONFIRMED_PATH, "r", encoding="utf-8") as f:
            full_conf_structure = json.load(f)
        full_conf_structure["tiles"] = conf_tiles_dict
        full_conf_structure["metadata"] = full_conf_structure.get("metadata", {})
        full_conf_structure["metadata"]["total_confirmed"] = sum(1 for t in conf_tiles_dict.values() if t.get("status") == "confirmed")
        full_conf_structure["metadata"]["total_rejected"] = sum(1 for t in conf_tiles_dict.values() if t.get("status") == "rejected")
        
        with open(CONFIRMED_PATH, "w", encoding="utf-8") as f:
            json.dump(full_conf_structure, f, indent=2)

    # 4. Layer Ground-Truth Confirmed Tiles
    if CONFIRMED_PATH.exists():
        with open(CONFIRMED_PATH, "r", encoding="utf-8") as f:
            conf_data = json.load(f).get("tiles", {})
        for name, data in conf_data.items():
            if data.get("status") == "confirmed":
                merged_tiles[name] = {
                    "x": data["x"],
                    "y": data["y"],
                    "width": data["width"],
                    "height": data["height"],
                    "confidence": 1.0,
                    "scale": 1.0,
                    "area": data.get("area", name.split("_")[0]),
                    "confirmed": True,
                }
                stats["confirmed"] += 1

    # Filter out full map background images from tile entries
    IGNORE_TILES = {"silksong_fullmap.png", "full_pharloom_clean.webp", "full_dont_use_pharloom.png", "pharloom_covered.png", "0000_pharloom.png"}
    merged_tiles = {k: v for k, v in merged_tiles.items() if k not in IGNORE_TILES}

    output = {
        "metadata": {
            "fullmap": "full_pharloom_clean.webp",
            "fullmap_width": 4096,
            "fullmap_height": 4096,
            "total_tiles": len(merged_tiles),
            "confirmed_count": stats["confirmed"],
            "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        },
        "tiles": dict(sorted(merged_tiles.items(), key=lambda x: x[0])),
    }

    with open(MASTER_COORDS_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)

    # tools/ is authoritative; the copies under web/assets/img/fullmap/ are
    # generated here so the web viewers can fetch them. Never edit them by hand.
    import shutil
    web_fullmap = ROOT / "web" / "assets" / "img" / "fullmap"
    for src in (CONFIRMED_PATH, ROOT / "tools" / "map_transform.json"):
        if src.exists():
            shutil.copy(src, web_fullmap / src.name)

    print(f"\nSuccessfully merged coordinates into {MASTER_COORDS_PATH}:")
    print(f"  Total mapped tiles: {len(merged_tiles)}")
    print(f"  Confirmed (Ground Truth): {stats['confirmed']}")
    print(f"  OCR extracted:            {stats['ocr']}")
    print(f"  Manual annotated:         {stats['manual']}")
    print(f"  OpenCV baseline:          {stats['opencv']}")


if __name__ == "__main__":
    main()
