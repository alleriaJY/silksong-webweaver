"""
Internal developer save-file dictionary and line-by-line inspector.

Classifies every single entry in a Silksong .dat (or decrypted .json) save file:
  1. playerData top-level keys (booleans, ints, floats, strings, dicts, lists)
  2. playerData inner container records (Tools, ToolEquips, ExtraToolEquips,
     ToolLiquids, QuestCompletionData, QuestRumourData, Collectables, Relics,
     MateriumCollected, MementosDeposited, EnemyJournalKillData, StoryEvents,
     scenesVisited, scenesMapped, scenesEncounteredBench, scenesEncounteredCocoon,
     placedMarkers, FleasCollectedTargetOrder, SteelQuestSpots,
     mossBerryValueList, GrubFarmerMimicValueList)
  3. sceneData.persistentBools.serializedList  (SceneName / ID -> bool)
  4. sceneData.persistentInts.serializedList   (SceneName / ID -> int)
  5. sceneData.geoRocks.serializedList         (SceneName / ID -> int)

Auto-derives verified items from web/src/data/packs/base/*.js so pack updates
immediately flow into this tool without duplication.

Usage:
    python tools/inspect_save.py <save.(dat|json)> [--search <query>]
                                 [--section <name>] [--unknown-only]
                                 [--annotate <out.txt>]
"""

import json
import re
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from savelib import WEB_DATA_DIR, load_save, player_data, scene_entries  # noqa: E402
from unknown_keys import js_unescape, untracked_patterns  # noqa: E402

BASE_PACK_DIR = WEB_DATA_DIR / "packs" / "base"

# Curated documentation for non-boolean scalar and structural playerData keys.
PLAYER_DATA_DOCS = {
    # Containers / Lists
    "Tools": ("Collectables", "Unlocked, seen, and selected state for every Red, Blue, and Yellow Tool."),
    "ToolEquips": ("Progression", "Per-Crest unlock state and equipped Tool/Skill slot assignments."),
    "ExtraToolEquips": ("Progression", "Equipped tools in the Vesticrest extra Yellow/Blue slots."),
    "ToolLiquids": ("Collectables", "Remaining charges/refills for liquid-based tools (Flea Brew, Plasmium Phial)."),
    "QuestCompletionData": ("Quests", "Accepted, completed, and progress counts for all Quests & Wishes."),
    "QuestRumourData": ("Quests", "Heard rumour/hint entries on wishboards before accepting the quest."),
    "Collectables": ("Collectables", "Carried inventory items and stack amounts (Rosary strings, keys, quest items)."),
    "Relics": ("Collectables", "Collected and deposited state for all Relics and Psalm Cylinders."),
    "MateriumCollected": ("Collectables", "Materials recorded in the Bellhome Materium."),
    "MementosDeposited": ("Collectables", "Mementos placed on the display shelf in Hornet's Bellhome."),
    "EnemyJournalKillData": ("Journal", "Hunter's Journal kill counts and seen markers per internal enemy ID."),
    "StoryEvents": ("World & Story", "Chronological log of major story events (EventType, PlayTime, SceneName)."),
    "scenesVisited": ("Maps & Travel", "Ordered list of every scene ID Hornet has entered (drives Hero's Path)."),
    "scenesMapped": ("Maps & Travel", "Scene IDs drawn onto the in-game map (requires Quill + Bench)."),
    "scenesEncounteredBench": ("Maps & Travel", "Engine bench encounter list."),
    "scenesEncounteredCocoon": ("Maps & Travel", "Scenes where Hornet has encountered a death cocoon."),
    "placedMarkers": ("Maps & Travel", "Custom map markers placed by the player on the world map (5 color buckets)."),
    "FleasCollectedTargetOrder": ("Collectables", "Order in which fleas were rescued (early 1.0.28561 saves)."),
    "SteelQuestSpots": ("Quests", "Steel Soul exclusive quest target locations."),
    "mossBerryValueList": ("Collectables", "Internal value/state list for Mossberries turned in to the Moss Druid."),
    "GrubFarmerMimicValueList": ("NPCs", "Internal value/state list for Styx's Silkeater farm."),
    "CrawbellCurrency": ("World & Story", "Stored Rosary and Shell Shard payout inside the Bellhome Crawbell."),
    "CrawbellCurrencyCaps": ("World & Story", "Maximum Rosary and Shell Shard capacity for the Bellhome Crawbell."),

    # Core Progress, Endings, Quills, Modes
    "CompletedEndings": ("World & Story", "Bitmask of endings completed (1=Weaver Queen, 2=Twisted Child, 4=Snared Silk, 8=Sister of the Void)."),
    "LastCompletedEnding": ("World & Story", "Bit ID of the most recently completed ending."),
    "QuillState": ("Maps & Travel", "Equipped Quill color variant (0=None, 1=White, 2=Red, 3=Purple)."),
    "hasQuill": ("Maps & Travel", "Whether Hornet owns a Quill to update area maps at benches."),
    "CaravanTroupeLocation": ("World & Story", "Flea Caravan progression stage (0=Bone Bottom, 1=Greymoor, 2=Blasted Steps, 3=Fleatopia)."),
    "BelltownHouseState": ("World & Story", "Bellhome upgrade/renovation stage in Bellhart."),
    "enclaveLevel": ("World & Story", "Songclave settlement development level (driven by donation wishes)."),
    "blackThreadWorld": ("World & Story", "Act 3 world state flag: Pharloom is overtaken by Black Thread / Void."),
    "citadelWoken": ("World & Story", "Act 2 story flag: the Citadel has awakened."),
    "citadelHalfwayComplete": ("World & Story", "Act 2 midpoint milestone flag."),
    "hasNeedolinMemoryPowerup": ("Progression", "Elegy of the Deep powerup for the Needolin (enters Old Heart memories)."),
    "UnlockedFastTravelTeleport": ("Maps & Travel", "Beastling Call fast-travel teleport unlocked."),
    "pinGalleriesCompleted": ("Progression", "Number of Loddie pin gallery challenges completed."),

    # Health, Silk, Combat, Timers
    "maxHealthBase": ("Progression", "Base maximum masks before temporary Lifeblood/Plasmium masks."),
    "healthBlue": ("Current State", "Current temporary Lifeblood / Plasmium masks."),
    "prevHealth": ("Current State", "Health value stored prior to the last transition/memory."),
    "heartPieces": ("Progression", "Partial Mask Shards currently held toward the next full Mask (0-3)."),
    "silkSpoolParts": ("Progression", "Partial Spool Fragments currently held toward the next Silk notch (0-1)."),
    "silkSpecialLevel": ("Progression", "Internal Silk Skill / special tier level."),
    "nailRange": ("Progression", "Bonus Needle reach modifier."),
    "beamDamage": ("Progression", "Needle beam/projectile damage modifier."),
    "attunement": ("Engine / Meta", "Internal attunement counter."),
    "attunementLevel": ("Engine / Meta", "Internal attunement tier."),
    "CrawbellTimer": ("World & Story", "Elapsed timer for the Bellhome Crawbell passive rosary/shard generator."),
    "GrowstoneState": ("Collectables", "Growth stage of the Growstone."),
    "GrowstoneTimer": ("Collectables", "Elapsed timer for Growstone growth."),
    "GrubFarmerSilkGrubsSold": ("NPCs", "Number of Silkeaters collected from Styx."),
    "grubFarmLevel": ("NPCs", "Upgrade level of Styx's Silkeater farm."),
    "cloakOdour_slabFly": ("World State", "Slab fly scent/odour counter on Hornet's cloak."),

    # Death, Respawn, Memory, Maze, Engine
    "HeroDeathScenePos": ("Current State", "World (x, y) coordinates of Hornet's active death cocoon."),
    "HeroDeathSceneSize": ("Current State", "Scene bounds where Hornet's death cocoon was dropped."),
    "PreMemoryState": ("Current State", "Saved player state restored upon exiting a memory sequence."),
    "PreviousCrestID": ("Current State", "Crest equipped before entering a temporary state (e.g. Cursed/Cloakless)."),
    "TempGeoStore": ("Current State", "Rosaries temporarily stored (e.g. inside active death cocoon)."),
    "TempShellShardStore": ("Current State", "Shell Shards temporarily stored during special sequences."),
    "MazeEntranceScene": ("World State", "Scene from which Hornet entered The Mist maze."),
    "MazeEntranceInitialScene": ("World State", "Initial entry scene recorded for The Mist maze."),
    "PreviousMazeScene": ("World State", "Previous room visited inside The Mist maze."),
    "FastTravelNPCLocation": ("Maps & Travel", "Current station index of the Bell Beast."),
    "extraRestZone": ("Current State", "Active rest/respawn zone enum."),
    "hazardRespawnFacing": ("Current State", "Facing direction on hazard respawn."),
    "previousDarkness": ("Engine / Meta", "Darkness level of the previous room."),
    "environmentType": ("Engine / Meta", "Audio/footstep environment material enum for the current room."),
    "currentInvPane": ("Engine / Meta", "Last opened inventory pane index."),
    "mapKeyPref": ("Engine / Meta", "Saved map UI preference."),
    "profileID": ("Engine / Meta", "Save slot number (1-4)."),
    "RevisionBreak": ("Engine / Meta", "Internal Team Cherry save-schema revision number."),
    "date": ("Engine / Meta", "Timestamp string when the save was last written."),
    "LastSetFieldName": ("Engine / Meta", "Debug/engine field recording the last PlayerData variable modified."),

    # Town Crowds & Dynamic Spawns
    "belltownCrowd": ("World State", "Crowd population state in Bellhart."),
    "bonetownCrowd": ("World State", "Crowd population state in Bone Bottom."),
    "halfwayCrowd": ("World State", "Crowd population state in Halfway Home."),
    "halfwayCrowEnemyGroup": ("World State", "Active enemy group variation in Greymoor / Halfway Home."),
    "enemyGroupAnt04": ("World State", "Active enemy group variation in Hunter's March (Ant_04)."),
    "EnclaveStateNPCShortHorned": ("NPCs", "Songclave NPC variant state (Short-Horned Pilgrim)."),
    "EnclaveStateNPCStandard": ("NPCs", "Songclave NPC variant state (Standard Pilgrim)."),
    "EnclaveStateNPCTall": ("NPCs", "Songclave NPC variant state (Tall Pilgrim)."),
    "EnclaveStatePilgrimSmall": ("NPCs", "Songclave NPC variant state (Small Pilgrim)."),
    "EnclaveState_songKnightFan": ("NPCs", "Songclave NPC state (Second Sentinel admirer)."),
    "whiteCloverPos": ("World State", "Current room/position index of the Palestag / White Clover."),
    "greyWarriorDeathX": ("World State", "X-coordinate where Watcher at the Edge was defeated."),
}

UNTRACKED_CATEGORY = {
    "npc-met": "NPCs",
    "npc-dialogue": "Dialogue",
    "npc-state": "NPCs",
    "tutorial-prompts": "Engine / Meta",
    "first-encounter": "Bosses",
    "area-visited": "Maps & Travel",
    "world-state": "World State",
    "story-acts": "World & Story",
    "meta-debug": "Engine / Meta",
    "map-ui": "Maps & Travel",
    "keys-items": "Key Items",
    "collection-substeps": "Quests",
    "unused-shop": "Collectables",
}

# Comprehensive scene object classification rules covering 100% of persistentBools and persistentInts.
SCENE_RULES = [
    (re.compile(r"Remasker|remask", re.I), "Room Mask / Darkness", "Room darkness / hidden-area mask reveal trigger"),
    (re.compile(r"Heart Piece|library_glass_heart_piece", re.I), "Progression", "Mask Shard pickup / container"),
    (re.compile(r"Silk Spool", re.I), "Progression", "Spool Fragment pickup"),
    (re.compile(r"Tool Metal|tool_metal_deposit", re.I), "Collectables", "Craftmetal pickup / ore deposit"),
    (re.compile(r"Memory Locket", re.I), "Collectables", "Memory Locket pickup"),
    (re.compile(r"SimpleKey", re.I), "Key Items", "Simple Key pickup"),
    (re.compile(r"Cog_Choir_Cylinder", re.I), "Collectables", "Psalm Cylinder / Choir cylinder pickup"),
    (re.compile(r"Nectar Pickup", re.I), "Collectables", "Vintage Nectar / nectar pickup"),
    (re.compile(r"Collectable Item Pickup|Generic Pickup|^Pickup$", re.I), "Collectables", "World item pickup"),
    (re.compile(r"Geo Rock", re.I), "Caches & Secrets", "Rosary / Geo Rock deposit"),
    (re.compile(r"Shell Shard|Shard Deposit|Fossil|Song Shard Barrel|ant_shell_shard_string", re.I), "Caches & Secrets", "Shell Shard cache / hanging shard string"),
    (re.compile(r"Rosary|Geo|ant_item_string|scissor_string|bell_necklace|slab_item_chain", re.I), "Caches & Secrets", "Rosary cache / hanging rosary string"),
    (re.compile(r"Chest", re.I), "Caches & Secrets", "Treasure chest"),
    (re.compile(r"Breakable|Wall|Floor|Ceiling|Secret|Crystal Break Chunk|grave_marker_break|junk_pile_break|crest_shrine_break_tube|drop pillar_chunk|loom_room_jar|Coral Crust Mask|moss_bone_plaque", re.I), "Caches & Secrets", "Breakable wall, prop, or secret passage"),
    (re.compile(r"Collapser|Drop Platform|Fall_platform|Fall platform|drop_planks|slab_cage_plat|cradle_plat|cradle_spike_plat|Coal Bucket Plat|Abyss_Weaver_Hanging_Plat|Bell Chain Plat|Vine Platform|Library Sliding Plat|Plat Collider|Plank Solid|Chain Platform Breaker", re.I), "Platforms & Hazards", "Collapsing, sliding, or movable platform"),
    (re.compile(r"stake_trap|DropBomb Rock|DockDashExplodeRock|Wind Rock|Stalactite|lamp_hang_top|lamp_pivot|propeller|black_thread_impacter|pustule_set|tentacle_|cage_|Spine Floater", re.I), "Platforms & Hazards", "Room hazard, trap, cage, or environmental prop"),
    (re.compile(r"Bench|RestBench", re.I), "Maps & Travel", "Bench / rest point"),
    (re.compile(r"bell_toll_machine|Toll_machine", re.I), "Maps & Travel", "Rosary toll machine"),
    (re.compile(r"Lever|Switch|Gate|Door|Lift|Elevator|Shortcut|Bridge|Hatch|Slab Lock|lock_machine|Dock Key Receptacle|pressure_plate|Plate|attic_ladder|Slab_vent_mask", re.I), "Doors & Mechanisms", "Door, lock, pressure plate, lever, or shortcut"),
    (re.compile(r"Black_Thread_Core", re.I), "Bosses", "Void Mass (Act 3)"),
    (re.compile(r"Battle Scene|Arena|Boss Scene|Bone Hunter|Farmer Wisp|Rock Roller|Swamp Muckman|Coral Warrior|Mossbone Mother|Bone Thumper|Tiny Brood Mother|Shellwood Hive|Bot Blocker", re.I), "Encounters", "Room combat encounter or enemy spawn state"),
    (re.compile(r"Cocoon|Silk Grub", re.I), "Collectables", "Silkeater cocoon"),
    (re.compile(r"thread_memory|Memory Orb|Memory Group", re.I), "World & Story", "Weaver thread memory / memory orb challenge"),
    (re.compile(r"Bellshrine Sequence|Music Box Sequence|Weakness.*Scene|Wake.*Scene|Abyss Dive Cutscene|Flyaway Scene|Pin Challenge|CameraLockArea|Start Range|Start Inspect|Inspect Region|Sound Control|Disable Sound Trigger|Bone_East_10_Church|Bone East 11 Cross Over Group|Song Knight Tube|Tension Tone", re.I), "World & Story", "Cutscene, sequence trigger, or room event state"),
    (re.compile(r"Reminder|Interact Reminder", re.I), "Engine / Meta", "In-room control / ability tutorial prompt"),
    (re.compile(r"Silkfly Ambient|fly corpse|Moss Vine Cluster|Witch_Cluster_Vine|^vine|Thick Silk Vines|Craw_home|craw_court_summons_pin|SC_0060_sc_post|Bone Carriage|body lower|body top|^head$|Song Reed Grand|Grasshopper Child", re.I), "World State", "Ambient creature, flora, or background prop state"),
    (re.compile(r"NPC|Pilgrim|Mapper|Caravan|Sherma|Garmond|Green Prince|Seth|Gilly|Courier|Thief|Huntress|Pinstress|Ballow|Churchkeeper|Confessional|Fixer|Chef_Meat_React|City Merchant|Dust Traders|HH Bartender|HH Patron|Blue Assistant|Moss Creep|Slab Prisoner|Sprintmaster|Snail Shamans|Ant Queen|Enclave|Belltown Greeter|Mask Maker|Slab Fly Large Cage", re.I), "NPCs", "In-room NPC placement or interaction state"),
]


def _humanize(key: str) -> str:
    s = re.sub(r"_+", " ", key)
    s = re.sub(r"([a-z0-9])([A-Z])", r"\1 \2", s)
    return re.sub(r"\s+", " ", s).strip()


def _parse_js_objects(path: Path) -> list:
    """Extract object literals with string fields from a pack .js file."""
    return _parse_js_objects_from_text(path.read_text(encoding="utf-8"))


def _parse_js_objects_from_text(text: str) -> list:
    out = []
    # Match single-level or nested check objects { ... }
    for m in re.finditer(r"\{([^{}]*)\}", text):
        body = m.group(1)
        obj = {}
        for kv in re.finditer(r"(\w+)\s*:\s*(?:'((?:\\.|[^'\\])*)'|\"((?:\\.|[^\"\\])*)\"|(-?\d+))", body):
            k = kv.group(1)
            val = kv.group(2) if kv.group(2) is not None else (kv.group(3) if kv.group(3) is not None else int(kv.group(4)))
            if isinstance(val, str):
                val = js_unescape(val)
            obj[k] = val
        if obj:
            out.append(obj)
    return out


def _parse_named_exports(path: Path) -> dict:
    """Return {EXPORT_NAME: [obj, ...]} for `export const NAME = [ ... ];` blocks."""
    text = path.read_text(encoding="utf-8")
    exports = {}
    for m in re.finditer(r"export\s+const\s+(\w+)\s*=\s*\[([\s\S]*?)\];", text):
        exports[m.group(1)] = _parse_js_objects_from_text(m.group(2))
    return exports


class SaveDictionary:
    """Loads verified definitions from web/src/data/packs/base/*.js and rules."""

    def __init__(self, pack_dir: Path = BASE_PACK_DIR):
        self.pd_verified = {}          # key -> (category, description)
        self.scene_bools = {}          # "SceneName/ID" -> (category, description)
        self.scene_ints = {}           # "SceneName/ID" -> (category, description)
        self.container_items = {       # container_name -> { entry_name -> (category, description) }
            "Tools": {},
            "ToolEquips": {},
            "ExtraToolEquips": {
                "Defend1": ("Progression", "Vesticrest extra Blue (Defense) tool slot"),
                "Explore1": ("Progression", "Vesticrest extra Yellow (Exploration) tool slot"),
            },
            "ToolLiquids": {
                "Flea Brew": ("Collectables", "Flea Brew liquid refill counter"),
                "Lifeblood Syringe": ("Collectables", "Plasmium Phial / Lifeblood Syringe liquid refill counter"),
            },
            "QuestCompletionData": {},
            "QuestRumourData": {},
            "Collectables": {},
            "Relics": {},
            "MateriumCollected": {},
            "MementosDeposited": {},
            "EnemyJournalKillData": {},
        }
        self.areas = {}                # lower prefix -> display
        self.untracked = []            # [(id, category, reason, compiled_rx)]
        self._load_pack(pack_dir)

    def _load_pack(self, pack_dir: Path):
        # 1. Areas
        for obj in _parse_js_objects(pack_dir / "areas.js"):
            if "prefix" in obj:
                self.areas[obj["prefix"].lower()] = obj.get("display") or obj["prefix"]

        # 2. Untracked patterns +Reasons
        untracked_text = (pack_dir / "untracked.js").read_text(encoding="utf-8")
        reasons = dict(re.findall(r"id:\s*'([^']+)'[\s\S]*?reason:\s*'((?:\\.|[^'\\])*)'", untracked_text))
        for pid, rx in untracked_patterns(pack_dir.parent.parent):
            cat = UNTRACKED_CATEGORY.get(pid, "World State")
            reason = js_unescape(reasons.get(pid, pid))
            self.untracked.append((pid, cat, reason, rx))

        # 3. Pack files
        file_categories = [
            ("fields.js", "General"),
            ("bosses.js", "Bosses"),
            ("fleas.js", "Collectables"),
            ("abilities.js", "Progression"),
            ("skills.js", "Progression"),
            ("crests.js", "Progression"),
            ("maps.js", "Maps & Travel"),
            ("keyItems.js", "Key Items"),
            ("unlockables.js", "Progression"),
            ("collectables.js", "Collectables"),
            ("world.js", "World & Story"),
            ("journal.js", "Journal"),
            ("quests.js", "Quests"),
        ]
        for fname, default_cat in file_categories:
            fpath = pack_dir / fname
            if not fpath.exists():
                continue
            for obj in _parse_js_objects(fpath):
                display = obj.get("display") or obj.get("name") or obj.get("json") or obj.get("flag") or ""
                note = f" ({obj['note']})" if obj.get("note") else ""
                desc = f"{display}{note}"

                if fname == "tools.js":
                    continue
                if fname == "journal.js" and "json" in obj:
                    self.container_items["EnemyJournalKillData"][obj["json"]] = ("Journal", f"Hunter's Journal: {display}")
                    continue
                if fname == "quests.js" and "json" in obj:
                    self.container_items["QuestCompletionData"][obj["json"]] = ("Quests", f"Quest / Wish: {display}")
                    self.container_items["QuestRumourData"][obj["json"]] = ("Quests", f"Quest rumour: {display}")
                    continue
                if fname == "crests.js" and "json" in obj:
                    self.container_items["ToolEquips"][obj["json"]] = ("Progression", f"Crest loadout: {display}")

                # Direct playerData key
                for key_field in ("json", "flag"):
                    k = obj.get(key_field)
                    if k and obj.get("flagType") not in ("quest", "scene", "sceneInt", "item"):
                        self.pd_verified.setdefault(k, (default_cat, desc))

                # Scene pickups / checks
                sc, sid = obj.get("sceneName"), obj.get("sceneId")
                if sc and sid:
                    if obj.get("flagType") == "sceneInt":
                        self.scene_ints[f"{sc}/{sid}"] = (default_cat, desc)
                    else:
                        self.scene_bools[f"{sc}/{sid}"] = (default_cat, desc)

        # Tools & skills in tool slots
        for obj in _parse_js_objects(pack_dir / "tools.js"):
            if "json" in obj and "display" in obj:
                cat_label = obj.get("category", "Tool")
                self.container_items["Tools"][obj["json"]] = ("Collectables", f"{cat_label} Tool: {obj['display']}")
                self.container_items["ToolLiquids"].setdefault(obj["json"], ("Collectables", f"Liquid refills: {obj['display']}"))
        for obj in _parse_js_objects(pack_dir / "skills.js"):
            if "equipName" in obj and "display" in obj:
                self.container_items["Tools"][obj["equipName"]] = ("Progression", f"Silk Skill (in Tools table): {obj['display']}")

        # Crest aliases in ToolEquips
        for alias, label in [("Hunter_v2", "Hunter Crest (Evolved v2)"), ("Hunter_v3", "Hunter Crest (Evolved v3)")]:
            self.container_items["ToolEquips"][alias] = ("Progression", label)

        # Collectables containers (Relics, Materium, Mementos, Inventory items)
        coll_exports = _parse_named_exports(pack_dir / "collectables.js")
        for obj in coll_exports.get("RELICS", []):
            if "json" in obj:
                self.container_items["Relics"][obj["json"]] = ("Collectables", f"Relic ({obj.get('kind', 'Relic')}): {obj.get('display', obj['json'])}")
        for obj in coll_exports.get("MATERIUM", []):
            if "json" in obj:
                self.container_items["MateriumCollected"][obj["json"]] = ("Collectables", f"Materium entry: {obj.get('display', obj['json'])}")
        for obj in coll_exports.get("INVENTORY_ITEMS", []):
            if "json" in obj:
                self.container_items["Collectables"][obj["json"]] = ("Collectables", f"Inventory item: {obj.get('display', obj['json'])}")
        for obj in coll_exports.get("MEMENTOS", []):
            if obj.get("item"):
                disp = obj.get("display") or obj["item"]
                self.container_items["Collectables"].setdefault(obj["item"], ("Collectables", f"Memento item: {disp}"))
                self.container_items["MementosDeposited"].setdefault(obj["item"], ("Collectables", f"Deposited Memento: {disp}"))
        # Additional known MementosDeposited keys and allFlags
        for heart in ("Hunter Heart", "Flower Heart", "Coral Heart", "Clover Heart"):
            self.container_items["MementosDeposited"].setdefault(heart, ("Collectables", f"Deposited Conjoined Heart ({heart})"))
        for f in ("CollectedHeartFlower", "CollectedHeartCoral", "CollectedHeartHunter", "CollectedHeartClover"):
            self.pd_verified.setdefault(f, ("Collectables", f"Old Heart collected ({f})"))
        for alt in ("completedFirstWeaver", " PurchasedWardKey", "MerchantEnclaveWardKey", "purchasedGrindleMemoryLocket", "ShopkeeperQuestSpoolCollected", "MapperAppearInBellhart"):
            self.pd_verified.setdefault(alt.strip(), ("Progression", f"Progression flag ({alt.strip()})"))

        # Curated PLAYER_DATA_DOCS override
        for k, val in PLAYER_DATA_DOCS.items():
            self.pd_verified[k] = val

    def area_of(self, scene_name: str) -> str:
        if not scene_name:
            return "Unknown Area"
        prefix = str(scene_name).split("_")[0].lower()
        return self.areas.get(prefix, scene_name)

    def classify_player_data_key(self, key: str) -> dict:
        if key in self.pd_verified:
            cat, desc = self.pd_verified[key]
            return {"key": key, "category": cat, "description": desc, "status": "verified"}
        for _, cat, reason, rx in self.untracked:
            if rx.search(key):
                return {"key": key, "category": cat, "description": f"{_humanize(key)} ({reason})", "status": "pattern"}
        return {"key": key, "category": "Undocumented", "description": f"{_humanize(key)} — undocumented key", "status": "unknown"}

    def classify_container_entry(self, container: str, name: str) -> dict:
        table = self.container_items.get(container, {})
        if name in table:
            cat, desc = table[name]
            return {"key": f"{container}[{name}]", "category": cat, "description": desc, "status": "verified"}
        return {"key": f"{container}[{name}]", "category": "Undocumented", "description": f"Unlisted {container} entry: {name}", "status": "unknown"}

    def classify_scene_entry(self, kind: str, scene_name: str, obj_id: str) -> dict:
        comp = f"{scene_name}/{obj_id}"
        key = f"{scene_name} / {obj_id}"
        area = self.area_of(scene_name)
        if kind == "persistentBools" and comp in self.scene_bools:
            cat, desc = self.scene_bools[comp]
            return {"key": key, "category": cat, "description": f"{desc} [{area}]", "status": "verified"}
        if kind == "persistentInts" and comp in self.scene_ints:
            cat, desc = self.scene_ints[comp]
            return {"key": key, "category": cat, "description": f"{desc} [{area}]", "status": "verified"}
        if kind == "geoRocks":
            return {"key": key, "category": "Caches & Secrets", "description": f"Rosary / Geo Rock deposit in {area} (remaining hits)", "status": "pattern"}
        for rx, cat, label in SCENE_RULES:
            if rx.search(obj_id):
                return {"key": key, "category": cat, "description": f"{label} in {area}", "status": "pattern"}
        return {"key": key, "category": "Undocumented", "description": f"Unclassified scene object in {area} ({obj_id})", "status": "unknown"}


def inspect_save(save: dict, dictionary: SaveDictionary = None) -> dict:
    """Classify every line/entry of a decrypted save across all 5 sections."""
    d = dictionary or SaveDictionary()
    pd = player_data(save)

    pd_rows = []
    container_rows = []

    for key in sorted(pd):
        val = pd[key]
        info = d.classify_player_data_key(key)
        pd_rows.append({**info, "value": val})

        # Expand structured containers and lists so every inner line is accounted for
        if isinstance(val, dict):
            entries = val.get("savedData", val.get("list"))
            if isinstance(entries, list):
                for item in entries:
                    if isinstance(item, dict) and "Name" in item:
                        cinfo = d.classify_container_entry(key, item["Name"])
                        payload = item.get("Data", item.get("Record"))
                        container_rows.append({**cinfo, "container": key, "value": payload})

    bool_rows = [
        {**d.classify_scene_entry("persistentBools", e.get("SceneName", ""), e.get("ID", "")), "value": e.get("Value")}
        for e in scene_entries(save, "persistentBools")
    ]
    int_rows = [
        {**d.classify_scene_entry("persistentInts", e.get("SceneName", ""), e.get("ID", "")), "value": e.get("Value")}
        for e in scene_entries(save, "persistentInts")
    ]
    rock_rows = [
        {**d.classify_scene_entry("geoRocks", e.get("SceneName", ""), e.get("ID", "")), "value": e.get("Value")}
        for e in scene_entries(save, "geoRocks")
    ]

    return {
        "playerData": pd_rows,
        "containers": container_rows,
        "persistentBools": bool_rows,
        "persistentInts": int_rows,
        "geoRocks": rock_rows,
    }


def summarize_section(rows: list) -> dict:
    counts = Counter(r["status"] for r in rows)
    return {
        "total": len(rows),
        "verified": counts.get("verified", 0),
        "pattern": counts.get("pattern", 0),
        "unknown": counts.get("unknown", 0),
    }


def _preview(val) -> str:
    if isinstance(val, dict):
        items = val.get("savedData", val.get("list"))
        if isinstance(items, list):
            return f"<{len(items)} entries>"
        return json.dumps(val, ensure_ascii=False)
    if isinstance(val, list):
        return f"<{len(val)} items>"
    return json.dumps(val, ensure_ascii=False)


def write_annotated_report(sections: dict, out_path: Path):
    """Write a complete line-by-line annotated dump of the save file."""
    lines = []
    for sec_name, rows in sections.items():
        s = summarize_section(rows)
        lines.append(f"=== {sec_name} ({s['total']} entries: {s['verified']} verified, {s['pattern']} pattern, {s['unknown']} unknown) ===")
        for r in rows:
            lines.append(f"  [{r['status']:8s}] [{r['category']}] {r['key']} = {_preview(r['value'])}  # {r['description']}")
        lines.append("")
    out_path.write_text("\n".join(lines), encoding="utf-8")


def main(argv=None) -> int:
    argv = sys.argv[1:] if argv is None else argv
    search = None
    section_filter = None
    annotate_out = None
    unknown_only = "--unknown-only" in argv

    paths = []
    i = 0
    while i < len(argv):
        a = argv[i]
        if a == "--search" and i + 1 < len(argv):
            search = argv[i + 1].lower()
            i += 2
        elif a == "--section" and i + 1 < len(argv):
            section_filter = argv[i + 1]
            i += 2
        elif a == "--annotate" and i + 1 < len(argv):
            annotate_out = Path(argv[i + 1])
            i += 2
        elif a.startswith("--"):
            i += 1
        else:
            paths.append(a)
            i += 1

    if len(paths) != 1:
        print(__doc__.strip())
        return 2

    save = load_save(paths[0])
    sections = inspect_save(save)
    pd = player_data(save)
    print(f"{paths[0]} (version {pd.get('version', '?')}, {pd.get('completionPercentage', '?')}%)")
    print("-" * 78)
    print(f"{'Section':20s} {'Total':>8s} {'Verified':>10s} {'Pattern':>10s} {'Unknown':>10s}")
    print("-" * 78)

    total_unknown = 0
    for sec_name, rows in sections.items():
        if section_filter and sec_name != section_filter:
            continue
        s = summarize_section(rows)
        total_unknown += s["unknown"]
        print(f"{sec_name:20s} {s['total']:8d} {s['verified']:10d} {s['pattern']:10d} {s['unknown']:10d}")
    print("-" * 78)

    if annotate_out:
        write_annotated_report(sections, annotate_out)
        print(f"Wrote line-by-line annotated save report to {annotate_out}")

    if search or unknown_only:
        print()
        for sec_name, rows in sections.items():
            if section_filter and sec_name != section_filter:
                continue
            matches = [
                r for r in rows
                if (not unknown_only or r["status"] == "unknown")
                and (not search or search in f"{r['key']} {r['category']} {r['description']} {_preview(r['value'])}".lower())
            ]
            if matches:
                print(f"== {sec_name} ({len(matches)} matches)")
                for r in matches[:100]:
                    print(f"  [{r['status']}] [{r['category']}] {r['key']} = {_preview(r['value'])}  -- {r['description']}")
                if len(matches) > 100:
                    print(f"  ... and {len(matches) - 100} more")
                print()
    elif total_unknown > 0:
        print("\nUnknown entries:")
        for sec_name, rows in sections.items():
            for r in rows:
                if r["status"] == "unknown":
                    print(f"  [{sec_name}] {r['key']} = {_preview(r['value'])}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
