"""
Internal developer save-file dictionary and line-by-line inspector.

Classifies and groups every single entry in a Silksong .dat (or decrypted .json)
save file across all 5 layers:
  1. playerData top-level keys (booleans, ints, floats, strings, dicts, lists)
  2. playerData inner container records (Tools, ToolEquips, ExtraToolEquips,
     ToolLiquids, QuestCompletionData, QuestRumourData, Collectables, Relics,
     MateriumCollected, MementosDeposited, EnemyJournalKillData, StoryEvents)
  3. sceneData.persistentBools.serializedList  (SceneName / ID -> bool)
  4. sceneData.persistentInts.serializedList   (SceneName / ID -> int)
  5. sceneData.geoRocks.serializedList         (SceneName / ID -> int)

Every entry receives:
  - status:      'verified' | 'pattern' | 'undecoded' | 'unknown'
  - group:       stable machine-readable group ID (e.g. 'sc-darkness-mask')
  - group_label: human-readable group title
  - category:    high-level domain
  - description: plain-English explanation of the entry

Usage:
    python tools/inspect_save.py <save.(dat|json)>
    python tools/inspect_save.py <save.(dat|json)> --groups
    python tools/inspect_save.py <save.(dat|json)> --group <group_id>
    python tools/inspect_save.py <save.(dat|json)> --undecoded
    python tools/inspect_save.py <save.(dat|json)> --search <query>
    python tools/inspect_save.py <save.(dat|json)> --annotate <out.txt>
"""

import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from savelib import WEB_DATA_DIR, load_save, player_data, scene_entries  # noqa: E402
from unknown_keys import js_unescape, untracked_patterns  # noqa: E402

BASE_PACK_DIR = WEB_DATA_DIR / "packs" / "base"

# Human-readable labels for every group ID.
GROUP_LABELS = {
    # playerData - Verified groups
    "pd-general-meta": "General Save Metadata (version, mode, completion %, play time)",
    "pd-current-vitals": "Current Vitals, Currencies & Respawn Position",
    "pd-containers": "Structured Data Containers & Lists",
    "pd-progression-upgrades": "Core Upgrades (Masks, Spool, Hearts, Needle, Kit, Pouch, Crests, Vesticrest)",
    "pd-abilities-skills": "Abilities, Cloaks & Silk Skills",
    "pd-boss-defeats": "Boss & Miniboss Defeat Flags",
    "pd-flea-rescues": "Flea Rescue Flags (Scattered & Special)",
    "pd-maps-travel": "Area Maps, Bellways, Ventrica Tubes, Map Pins & Quill",
    "pd-key-items": "Key Items, Passes & Story Keys",
    "pd-collectables-sources": "Collectable Source Flags (Lockets, Craftmetal, Pale Oil, Mossberries, Silkeaters, Mementos)",
    "pd-world-bellhome": "Endings, Bellshrines, Threefold Melody, Bellhome & Arenas",
    "pd-timers-counters": "Gameplay Timers, Counters & Cocoon State",

    # playerData - Pattern-classified groups
    "pd-npc-met": "NPC First-Meeting Flags (Met* / met*)",
    "pd-npc-dialogue": "NPC Dialogue & Conversation History Flags",
    "pd-npc-quest-state": "NPC World Placement, Shop Stock & Quest Script Sub-states",
    "pd-boss-encountered": "Boss / Miniboss First-Encounter Intro Flags (encountered*)",
    "pd-area-visited": "Area & Room First-Visit Flags (visited* / entered*)",
    "pd-crest-chapel": "Crest Chapel Memory & Door Closure Flags",
    "pd-verdania-orbs": "Lost Verdania Memory Orb Sub-flags (memoryOrbs_Clover_*)",
    "pd-flea-festival": "Flea Festival Minigame State & Scores",
    "pd-styx-farm": "Styx's Silkeater Farm Growth Slot Flags",
    "pd-tutorial-prompt": "Tutorial & UI Prompt Seen Flags",
    "pd-world-shortcut": "World Doors, One-Way Gates, Lifts & Breakable Wall Flags",
    "pd-story-act-flag": "Act 1 / Act 2 / Act 3 Story Transition & Cutscene Flags",
    "pd-map-pin-flag": "Map Pin & Bellshrine UI Flags",
    "pd-key-quest-flag": "Internal Key & Quest Item Hand-off Flags",
    "pd-unused-fallback": "Unused / Fallback Shop Purchase Flags",
    "pd-engine-meta": "Engine, Debug & Per-Room Scripting Flags",

    # Containers - Verified groups
    "cnt-tools": "Tools.savedData (59 Red/Blue/Yellow Tools & Silk Skills)",
    "cnt-crest-loadouts": "ToolEquips.savedData (Per-Crest Slot Loadouts)",
    "cnt-vesticrest-slots": "ExtraToolEquips.savedData (Vesticrest Extra Slots)",
    "cnt-tool-liquids": "ToolLiquids.savedData (Liquid Tool Refill Charges)",
    "cnt-quests": "QuestCompletionData.savedData (Quests & Wishes)",
    "cnt-quest-rumours": "QuestRumourData.savedData (Wishboard Rumours)",
    "cnt-inventory": "Collectables.savedData (Carried Inventory Items & Amounts)",
    "cnt-relics": "Relics.savedData (Relics & Psalm Cylinders)",
    "cnt-materium": "MateriumCollected.savedData (Recorded Materium Entries)",
    "cnt-mementos": "MementosDeposited.savedData (Bellhome Display Mementos)",
    "cnt-journal": "EnemyJournalKillData.list (Hunter's Journal Kill Counts)",
    "cnt-story-events": "StoryEvents (Chronological Milestone Log: Mask/Spool/Key/Locket)",

    # sceneData - Verified groups
    "sc-verified-mask-shard": "Verified Mask Shard Room Pickups",
    "sc-verified-spool-fragment": "Verified Spool Fragment Room Pickups",
    "sc-verified-memory-locket": "Verified Memory Locket Room Pickups",
    "sc-verified-craftmetal": "Verified Craftmetal Room Pickups",
    "sc-verified-upgrade-item": "Verified Pale Oil, Mossberry, Silkeater, Pollip Heart, Old Heart & Key Pickups",
    "sc-verified-relic-cylinder": "Verified Relic, Choir Cylinder & Bellhome Device Pickups",
    "sc-verified-unique-spawn": "Verified Unique Spawns (Rhinogrunds, Pilgrims, Shardillards, 46 Void Masses)",
    "sc-verified-bench-toll": "Verified Paid Benches & Bellway/Room Toll Machines",
    "sc-verified-chest": "Verified Named Treasure Chests",

    # sceneData - Pattern-classified groups
    "sc-darkness-mask": "Room Darkness & Secret-Alcove Mask Triggers (Remasker*)",
    "sc-breakable-wall": "Breakable Walls, Secret Passages & Breakable Props",
    "sc-door-mechanism": "Doors, Levers, Locks, Gates, Lifts & Pressure Plates",
    "sc-platform-collapser": "Collapsing Floors, Sliding Vault Platforms & Bridges",
    "sc-shard-cache": "Shell Shard Fossil Deposits & Hanging Shard Strings",
    "sc-rosary-cache": "Rosary Geo Rocks & Hanging Rosary Strings",
    "sc-hazard-trap": "Room Traps, Spike Balls, Cages & Environmental Hazards",
    "sc-combat-arena": "Room Combat Arenas & Enemy Ambush States",
    "sc-thread-memory": "Weaver Thread Memories & Memory Orb Challenges",
    "sc-cutscene-trigger": "Room Cutscenes, Bellshrine/Music Sequences & Camera Triggers",
    "sc-npc-placement": "In-Room NPC Placements & Dialogue States",
    "sc-ambient-prop": "Ambient Creatures, Flora & Background Props",
    "sc-tutorial-reminder": "In-Room Control & Ability Tutorial Prompts",
    "sc-runtime-clone": "Unity Runtime Prefab Clones (Generic Pickup(Clone) / Instant(Clone))",

    # sceneData - Needs individual 1-to-1 item decoding
    "sc-unmapped-pickup": "Generic 'Collectable Item Pickup' (Specific Drop Item Not Yet Individually Mapped)",
}

# Curated documentation for non-boolean scalar and structural playerData keys.
# Value: (group_id, category, description)
PLAYER_DATA_DOCS = {
    # Containers / Lists
    "Tools": ("pd-containers", "Collectables", "Unlocked, seen, and selected state for every Red, Blue, and Yellow Tool."),
    "ToolEquips": ("pd-containers", "Progression", "Per-Crest unlock state and equipped Tool/Skill slot assignments."),
    "ExtraToolEquips": ("pd-containers", "Progression", "Equipped tools in the Vesticrest extra Yellow/Blue slots."),
    "ToolLiquids": ("pd-containers", "Collectables", "Remaining charges/refills for liquid-based tools (Flea Brew, Plasmium Phial)."),
    "QuestCompletionData": ("pd-containers", "Quests", "Accepted, completed, and progress counts for all Quests & Wishes."),
    "QuestRumourData": ("pd-containers", "Quests", "Heard rumour/hint entries on wishboards before accepting the quest."),
    "Collectables": ("pd-containers", "Collectables", "Carried inventory items and stack amounts (Rosary strings, keys, quest items)."),
    "Relics": ("pd-containers", "Collectables", "Collected and deposited state for all Relics and Psalm Cylinders."),
    "MateriumCollected": ("pd-containers", "Collectables", "Materials recorded in the Bellhome Materium."),
    "MementosDeposited": ("pd-containers", "Collectables", "Mementos placed on the display shelf in Hornet's Bellhome."),
    "EnemyJournalKillData": ("pd-containers", "Journal", "Hunter's Journal kill counts and seen markers per internal enemy ID."),
    "StoryEvents": ("pd-containers", "World & Story", "Chronological log of major story events (0=Mask Shard, 1=Spool Fragment, 2=Simple Key, 3=Memory Locket)."),
    "scenesVisited": ("pd-containers", "Maps & Travel", "Ordered list of every scene ID Hornet has entered (drives Hero's Path)."),
    "scenesMapped": ("pd-containers", "Maps & Travel", "Scene IDs drawn onto the in-game map (requires Quill + Bench)."),
    "scenesEncounteredBench": ("pd-containers", "Maps & Travel", "Engine bench encounter list."),
    "scenesEncounteredCocoon": ("pd-containers", "Maps & Travel", "Scenes where Hornet has encountered a death cocoon."),
    "placedMarkers": ("pd-containers", "Maps & Travel", "Custom map markers placed by the player on the world map (5 color buckets)."),
    "FleasCollectedTargetOrder": ("pd-containers", "Collectables", "Order in which fleas were rescued (early 1.0.28561 saves)."),
    "SteelQuestSpots": ("pd-containers", "Quests", "Steel Soul exclusive quest target locations."),
    "mossBerryValueList": ("pd-containers", "Collectables", "Internal value/state list for Mossberries turned in to the Moss Druid."),
    "GrubFarmerMimicValueList": ("pd-containers", "NPCs", "Internal value/state list for Styx's Silkeater farm."),
    "CrawbellCurrency": ("pd-timers-counters", "World & Story", "Stored Rosary and Shell Shard payout inside the Bellhome Crawbell."),
    "CrawbellCurrencyCaps": ("pd-timers-counters", "World & Story", "Maximum Rosary and Shell Shard capacity for the Bellhome Crawbell."),

    # Core Progress, Endings, Quills, Modes
    "CompletedEndings": ("pd-world-bellhome", "World & Story", "Bitmask of endings completed (1=Weaver Queen, 2=Twisted Child, 4=Snared Silk, 8=Sister of the Void)."),
    "LastCompletedEnding": ("pd-world-bellhome", "World & Story", "Bit ID of the most recently completed ending."),
    "QuillState": ("pd-maps-travel", "Maps & Travel", "Equipped Quill color variant (0=None, 1=White, 2=Red, 3=Purple)."),
    "hasQuill": ("pd-maps-travel", "Maps & Travel", "Whether Hornet owns a Quill to update area maps at benches."),
    "CaravanTroupeLocation": ("pd-world-bellhome", "World & Story", "Flea Caravan progression stage (0=Bone Bottom, 1=Greymoor, 2=Blasted Steps, 3=Fleatopia)."),
    "BelltownHouseState": ("pd-world-bellhome", "World & Story", "Bellhome upgrade/renovation stage in Bellhart."),
    "BelltownHouseColour": ("pd-world-bellhome", "World & Story", "Selected Bell Lacquer paint color on Hornet's Bellhome."),
    "BelltownHousePlayingInfo": ("pd-world-bellhome", "World & Story", "Currently playing Psalm Cylinder track on the Bellhome Gramophone."),
    "enclaveLevel": ("pd-world-bellhome", "World & Story", "Songclave settlement development level (driven by donation wishes)."),
    "blackThreadWorld": ("pd-world-bellhome", "World & Story", "Act 3 world state flag: Pharloom is overtaken by Black Thread / Void."),
    "citadelWoken": ("pd-world-bellhome", "World & Story", "Act 2 story flag: the Citadel has awakened."),
    "citadelHalfwayComplete": ("pd-world-bellhome", "World & Story", "Act 2 midpoint milestone flag."),
    "hasNeedolinMemoryPowerup": ("pd-abilities-skills", "Progression", "Elegy of the Deep powerup for the Needolin (enters Old Heart memories)."),
    "UnlockedFastTravelTeleport": ("pd-abilities-skills", "Maps & Travel", "Beastling Call fast-travel teleport unlocked."),
    "pinGalleriesCompleted": ("pd-progression-upgrades", "Progression", "Number of Loddie pin gallery challenges completed."),
    "fleaGames_bouncing_highscore": ("pd-timers-counters", "Quests", "High score in the Flea Bounce festival minigame (Fleatopia)."),
    "fleaGames_dodging_highscore": ("pd-timers-counters", "Quests", "High score in the Flea Dodge festival minigame (Fleatopia)."),
    "fleaGames_juggling_highscore": ("pd-timers-counters", "Quests", "High score in the Flea Juggle festival minigame (Fleatopia)."),

    # Health, Silk, Combat, Timers
    "maxHealthBase": ("pd-progression-upgrades", "Progression", "Base maximum masks before temporary Lifeblood/Plasmium masks."),
    "healthBlue": ("pd-current-vitals", "Current State", "Current temporary Lifeblood / Plasmium masks."),
    "prevHealth": ("pd-current-vitals", "Current State", "Health value stored prior to the last transition/memory."),
    "heartPieces": ("pd-progression-upgrades", "Progression", "Partial Mask Shards currently held toward the next full Mask (0-3)."),
    "silkSpoolParts": ("pd-progression-upgrades", "Progression", "Partial Spool Fragments currently held toward the next Silk notch (0-1)."),
    "silkSpecialLevel": ("pd-progression-upgrades", "Progression", "Internal Silk Skill / special tier level."),
    "nailRange": ("pd-progression-upgrades", "Progression", "Bonus Needle reach modifier."),
    "beamDamage": ("pd-progression-upgrades", "Progression", "Needle beam/projectile damage modifier."),
    "attunement": ("pd-timers-counters", "Engine / Meta", "Internal attunement counter."),
    "attunementLevel": ("pd-timers-counters", "Engine / Meta", "Internal attunement tier."),
    "CrawbellTimer": ("pd-timers-counters", "World & Story", "Elapsed timer for the Bellhome Crawbell passive rosary/shard generator."),
    "GrowstoneState": ("pd-timers-counters", "Collectables", "Growth stage of the Growstone."),
    "GrowstoneTimer": ("pd-timers-counters", "Collectables", "Elapsed timer for Growstone growth."),
    "GrubFarmerSilkGrubsSold": ("pd-timers-counters", "NPCs", "Number of Silkeaters collected from Styx."),
    "grubFarmLevel": ("pd-timers-counters", "NPCs", "Upgrade level of Styx's Silkeater farm."),
    "cloakOdour_slabFly": ("pd-timers-counters", "World State", "Slab fly scent/odour counter on Hornet's cloak."),

    # Death, Respawn, Memory, Maze, Engine
    "HeroDeathScenePos": ("pd-timers-counters", "Current State", "World (x, y) coordinates of Hornet's active death cocoon."),
    "HeroDeathSceneSize": ("pd-timers-counters", "Current State", "Scene bounds where Hornet's death cocoon was dropped."),
    "HeroCorpseMoneyPool": ("pd-timers-counters", "Current State", "Rosaries stored inside Hornet's active death cocoon."),
    "HeroCorpseScene": ("pd-timers-counters", "Current State", "Scene ID where Hornet's active death cocoon is located."),
    "HeroCorpseType": ("pd-timers-counters", "Current State", "Visual/state variant of Hornet's active death cocoon."),
    "PreMemoryState": ("pd-timers-counters", "Current State", "Saved player state restored upon exiting a memory sequence."),
    "PreviousCrestID": ("pd-current-vitals", "Current State", "Crest equipped before entering a temporary state (e.g. Cursed/Cloakless)."),
    "TempGeoStore": ("pd-timers-counters", "Current State", "Rosaries temporarily stored (e.g. inside active death cocoon)."),
    "TempShellShardStore": ("pd-timers-counters", "Current State", "Shell Shards temporarily stored during special sequences."),
    "MazeEntranceScene": ("pd-timers-counters", "World State", "Scene from which Hornet entered The Mist maze."),
    "MazeEntranceInitialScene": ("pd-timers-counters", "World State", "Initial entry scene recorded for The Mist maze."),
    "PreviousMazeScene": ("pd-timers-counters", "World State", "Previous room visited inside The Mist maze."),
    "FastTravelNPCLocation": ("pd-maps-travel", "Maps & Travel", "Current station index of the Bell Beast."),
    "extraRestZone": ("pd-current-vitals", "Current State", "Active rest/respawn zone enum."),
    "hazardRespawnFacing": ("pd-current-vitals", "Current State", "Facing direction on hazard respawn."),
    "previousDarkness": ("pd-general-meta", "Engine / Meta", "Darkness level of the previous room."),
    "environmentType": ("pd-general-meta", "Engine / Meta", "Audio/footstep environment material enum for the current room."),
    "currentInvPane": ("pd-general-meta", "Engine / Meta", "Last opened inventory pane index."),
    "mapKeyPref": ("pd-general-meta", "Engine / Meta", "Saved map UI preference."),
    "profileID": ("pd-general-meta", "Engine / Meta", "Save slot number (1-4)."),
    "RevisionBreak": ("pd-general-meta", "Engine / Meta", "Internal Team Cherry save-schema revision number."),
    "date": ("pd-general-meta", "Engine / Meta", "Timestamp string when the save was last written."),
    "LastSetFieldName": ("pd-general-meta", "Engine / Meta", "Debug/engine field recording the last PlayerData variable modified."),

    # Town Crowds & Dynamic Spawns
    "belltownCrowd": ("pd-timers-counters", "World State", "Crowd population state in Bellhart."),
    "bonetownCrowd": ("pd-timers-counters", "World State", "Crowd population state in Bone Bottom."),
    "halfwayCrowd": ("pd-timers-counters", "World State", "Crowd population state in Halfway Home."),
    "halfwayCrowEnemyGroup": ("pd-timers-counters", "World State", "Active enemy group variation in Greymoor / Halfway Home."),
    "enemyGroupAnt04": ("pd-timers-counters", "World State", "Active enemy group variation in Hunter's March (Ant_04)."),
    "EnclaveStateNPCShortHorned": ("pd-timers-counters", "NPCs", "Songclave NPC variant state (Short-Horned Pilgrim)."),
    "EnclaveStateNPCStandard": ("pd-timers-counters", "NPCs", "Songclave NPC variant state (Standard Pilgrim)."),
    "EnclaveStateNPCTall": ("pd-timers-counters", "NPCs", "Songclave NPC variant state (Tall Pilgrim)."),
    "EnclaveStatePilgrimSmall": ("pd-timers-counters", "NPCs", "Songclave NPC variant state (Small Pilgrim)."),
    "EnclaveState_songKnightFan": ("pd-timers-counters", "NPCs", "Songclave NPC state (Second Sentinel admirer)."),
    "whiteCloverPos": ("pd-timers-counters", "World State", "Current room/position index of the Palestag / White Clover."),
    "greyWarriorDeathX": ("pd-timers-counters", "World State", "X-coordinate where Watcher at the Edge was defeated."),
}

UNTRACKED_TO_GROUP = {
    "npc-met": ("pd-npc-met", "NPCs"),
    "npc-dialogue": ("pd-npc-dialogue", "Dialogue"),
    "npc-state": ("pd-npc-quest-state", "NPCs"),
    "tutorial-prompts": ("pd-tutorial-prompt", "Engine / Meta"),
    "first-encounter": ("pd-boss-encountered", "Bosses"),
    "area-visited": ("pd-area-visited", "Maps & Travel"),
    "world-state": ("pd-world-shortcut", "World State"),
    "story-acts": ("pd-story-act-flag", "World & Story"),
    "meta-debug": ("pd-engine-meta", "Engine / Meta"),
    "map-ui": ("pd-map-pin-flag", "Maps & Travel"),
    "keys-items": ("pd-key-quest-flag", "Key Items"),
    "collection-substeps": ("pd-npc-quest-state", "Quests"),
    "unused-shop": ("pd-unused-fallback", "Collectables"),
}

STORY_EVENT_TYPES = {
    0: "Mask Shard collected",
    1: "Spool Fragment collected",
    2: "Simple Key collected",
    3: "Memory Locket collected",
}

# Verified sceneData.persistentBools pickups, benches, toll machines, and quest objects
# beyond the checklist items in web/src/data/packs/base/*.js.
# Value: (group_id, category, description)
VERIFIED_SCENE_BOOLS = {
    # Named Quest & Progression World Pickups
    "Aqueduct_05/Collectable Item Pickup Reward 3": ("sc-verified-upgrade-item", "Quests", "Fleatopia festival reward item pickup"),
    "Arborium_07/Collectable Item Pickup Materium": ("sc-verified-relic-cylinder", "World & Story", "Materium device pickup (Memorium)"),
    "Aueduct_04/Collectable Item Pickup Slab Key": ("sc-verified-upgrade-item", "Key Items", "Key of the Apostate pickup (Putrified Ducts)"),
    "Coral_Tower_01/Collectable Item Pickup Heart": ("sc-verified-upgrade-item", "Collectables", "Encrusted Heart pickup (Crust King Khann arena)"),
    "Ant_Queen/Collectable Item Pickup": ("sc-verified-upgrade-item", "Collectables", "Hunter's Heart pickup (Skarrsinger Karmelita arena)"),
    "Dust_06/Collectable Item SimpleKey": ("sc-verified-upgrade-item", "Key Items", "Simple Key #2 world drop (Sinner's Road Roachkeeper)"),
    "Library_05/library_glass_heart_piece": ("sc-verified-mask-shard", "Progression", "Breakable glass display case for Whispering Vaults Mask Shard"),
    "Library_08/Collectable Item Pickup Librarian": ("sc-verified-relic-cylinder", "Collectables", "Psalm Cylinder (Librarian) pickup (Whispering Vaults)"),
    "Library_10/Collectable Item Pickup - Melody": ("sc-verified-relic-cylinder", "World & Story", "Vaultkeeper's Melody cylinder pickup (Whispering Vaults)"),
    "Library_13b/Collectable Item Pickup - Quill Purple": ("sc-verified-upgrade-item", "Maps & Travel", "Purple Quill pickup on Trobbio's desk (Whispering Vaults)"),
    "Library_13b/Collectable Item Pickup - Quill Red": ("sc-verified-upgrade-item", "Maps & Travel", "Red Quill pickup on Trobbio's desk (Whispering Vaults)"),
    "Room_CrowCourt_02/Collectable Item Pickup Crawbell": ("sc-verified-relic-cylinder", "World & Story", "Crawbell blueprint/item pickup (Craw Court)"),
    "Slab_16/Collectable Item Pickup Return": ("sc-verified-upgrade-item", "World & Story", "Hornet's Cloak & Needle equipment recovery pickup (The Slab)"),
    "Coral_36/Shell Shard Collectable Item Pickup Instant": ("sc-shard-cache", "Caches & Secrets", "Shell Shard bundle pickup (Sands of Karak Coral_36)"),

    # All 6 Pollip Hearts (Rite of the Pollip wish in Shellwood)
    "Shellwood_01/Nectar Pickup": ("sc-verified-upgrade-item", "Quests", "Pollip Heart #1 (Rite of the Pollip - Shellwood_01)"),
    "Shellwood_02/Nectar Pickup": ("sc-verified-upgrade-item", "Quests", "Pollip Heart #2 (Rite of the Pollip - Shellwood_02)"),
    "Shellwood_10/Nectar Pickup": ("sc-verified-upgrade-item", "Quests", "Pollip Heart #3 (Rite of the Pollip - Shellwood_10)"),
    "Shellwood_15/Nectar Pickup": ("sc-verified-upgrade-item", "Quests", "Pollip Heart #4 (Rite of the Pollip - Shellwood_15)"),
    "Shellwood_20/Nectar Pickup": ("sc-verified-upgrade-item", "Quests", "Pollip Heart #5 (Rite of the Pollip - Shellwood_20)"),
    "Shellwood_26/Nectar Pickup": ("sc-verified-upgrade-item", "Quests", "Pollip Heart #6 (Rite of the Pollip - Shellwood_26)"),

    # Cogwork Choir Cylinders (Cog_09)
    "Cog_09/Cog_Choir_Cylinder": ("sc-verified-relic-cylinder", "World & Story", "Cogwork Choir music cylinder #1 (Cogwork Core)"),
    "Cog_09/Cog_Choir_Cylinder (1)": ("sc-verified-relic-cylinder", "World & Story", "Cogwork Choir music cylinder #2 (Cogwork Core)"),
    "Cog_09/Cog_Choir_Cylinder (2)": ("sc-verified-relic-cylinder", "World & Story", "Cogwork Choir music cylinder #3 (Cogwork Core)"),
    "Cog_09/Cog_Choir_Cylinder (3)": ("sc-verified-relic-cylinder", "World & Story", "Cogwork Choir music cylinder #4 (Cogwork Core)"),

    # Relic World Pickups matching RELICS room identifiers
    "Aspid_01/Collectable Item Pickup (2)": ("sc-verified-relic-cylinder", "Collectables", "Relic pickup: Bone Scroll — Burning Bug (Seal Chit Aspid_01)"),
    "Bone_East_14/Collectable Item Pickup (1)": ("sc-verified-relic-cylinder", "Collectables", "Relic pickup: Weaver Effigy — Camora (Bone Record Bone_East_14)"),
    "Weave_08/Collectable Item Pickup": ("sc-verified-relic-cylinder", "Collectables", "Relic pickup: Rune Harp — Buried (Weaver Record Weave_08)"),
    "Wisp_08/Collectable Item Pickup": ("sc-verified-relic-cylinder", "Collectables", "Relic pickup: Bone Scroll — Singing Pilgrim (Bone Record Wisp Top)"),
    "Bonetown/Collectable Item Pickup": ("sc-verified-relic-cylinder", "Collectables", "Relic pickup: Weaver Effigy — Keelal (Weaver Totem Bonetown_upper_room)"),
    "Abyss_04/Collectable Item Pickup": ("sc-verified-relic-cylinder", "Collectables", "Abyss collectible / Arcane Egg pickup (Abyss_04)"),
    "Abyss_08/Collectable Item Pickup": ("sc-verified-relic-cylinder", "Collectables", "Abyss collectible / Arcane Egg pickup (Abyss_08)"),

    # Named Treasure Chests
    "Bone_19/Bone Chest": ("sc-verified-chest", "Caches & Secrets", "The Marrow Bone Chest (Bone_19)"),
    "Bone_East_17/Ant Chest": ("sc-verified-chest", "Caches & Secrets", "Far Fields / Hunter's March Skarr Chest (Bone_East_17)"),
    "Dock_03/City Shard Chest": ("sc-verified-chest", "Caches & Secrets", "Deep Docks Shell Shard Chest (Dock_03)"),
    "Dock_06_Church/City Shard Chest": ("sc-verified-chest", "Caches & Secrets", "Deep Docks Chapel Shell Shard Chest (Dock_06_Church)"),
    "Dust_05/Pilgrim Chest": ("sc-verified-chest", "Caches & Secrets", "Sinner's Road Pilgrim Chest (Dust_05)"),
    "Hang_06_bank/Chest": ("sc-verified-chest", "Caches & Secrets", "High Halls Treasury Vault Chest #1 (Hang_06_bank)"),
    "Hang_06_bank/Chest (1)": ("sc-verified-chest", "Caches & Secrets", "High Halls Treasury Vault Chest #2 (Hang_06_bank)"),
    "Hang_06_bank/Chest (2)": ("sc-verified-chest", "Caches & Secrets", "High Halls Treasury Vault Chest #3 (Hang_06_bank)"),
    "Hang_08/Chest": ("sc-verified-chest", "Caches & Secrets", "High Halls Chest (Hang_08)"),
    "Slab_19b/City Shard Chest": ("sc-verified-chest", "Caches & Secrets", "The Slab Shell Shard Chest (Slab_19b)"),
    "Song_03/Chest": ("sc-verified-chest", "Caches & Secrets", "Choral Chambers Chest (Song_03)"),
    "Song_17/Chest": ("sc-verified-chest", "Caches & Secrets", "Choral Chambers Chest (Song_17)"),
    "Tut_01/Bone Chest": ("sc-verified-chest", "Caches & Secrets", "Moss Grotto Bone Chest (Tut_01)"),

    # Benches & Bellway / Bench Toll Machines (16)
    "Bellway_03/bell_toll_machine": ("sc-verified-bench-toll", "Maps & Travel", "Far Fields Bellway station toll machine paid"),
    "Bellway_08/bell_toll_machine": ("sc-verified-bench-toll", "Maps & Travel", "Blasted Steps Bellway station toll machine paid"),
    "Bellway_08/Sherma BellBench NPC": ("sc-verified-bench-toll", "NPCs", "Sherma met at Blasted Steps Bellway bench"),
    "Bellway_Aqueduct/bell_toll_machine": ("sc-verified-bench-toll", "Maps & Travel", "Putrified Ducts Bellway station toll machine paid"),
    "Bellway_Peak/bell_toll_machine": ("sc-verified-bench-toll", "Maps & Travel", "Mount Fay Bellway station toll machine paid"),
    "Bellway_Shadow/bell_toll_machine": ("sc-verified-bench-toll", "Maps & Travel", "Bilewater Bellway station toll machine paid"),
    "Bone_01c/bell_toll_machine": ("sc-verified-bench-toll", "Maps & Travel", "The Marrow entrance toll bench paid (Bone_01c)"),
    "Bone_East_15/bell_toll_machine": ("sc-verified-bench-toll", "Maps & Travel", "Far Fields toll bench paid (Bone_East_15)"),
    "Coral_02/bell_toll_machine": ("sc-verified-bench-toll", "Maps & Travel", "Blasted Steps toll bench paid (Coral_02)"),
    "Dock_01/bell_toll_machine": ("sc-verified-bench-toll", "Maps & Travel", "Deep Docks entrance toll bench paid (Dock_01)"),
    "Dust_10/bell_toll_machine": ("sc-verified-bench-toll", "Maps & Travel", "Sinner's Road toll bench paid (Dust_10)"),
    "Organ_01/Organ Webbed Bench": ("sc-verified-bench-toll", "Maps & Travel", "Exhaust Organ webbed bench cleared (Organ_01)"),
    "Shadow_08/BreakableWallSwampBenchShortcut": ("sc-verified-bench-toll", "Maps & Travel", "Bilewater bench shortcut breakable wall opened (Shadow_08)"),
    "Shadow_15/Fake Bench Collapser": ("sc-verified-bench-toll", "Maps & Travel", "Bilewater trapped fake bench triggered (Shadow_15)"),
    "Shellwood_01b/bell_toll_machine": ("sc-verified-bench-toll", "Maps & Travel", "Shellwood lower toll bench paid (Shellwood_01b)"),
    "Shellwood_08c/bell_toll_machine": ("sc-verified-bench-toll", "Maps & Travel", "Shellwood central toll bench paid (Shellwood_08c)"),
}

# Internal NPC & Boss code-name translations for rich playerData descriptions
NPC_ALIASES = [
    ("BlueScientist", "Alchemist Zylotol (Plasmium researcher)"),
    ("BlueAssistant", "Zylotol's Assistant"),
    ("WoodWitch", "Greyroot (Shellwood)"),
    ("BelltownDoctor", "Yarnaby (Bellhart Doctor)"),
    ("BelltownRelicDealer", "Scrounge (Bellhart Relic Seeker)"),
    ("BelltownGreeter", "Pavo (Bellhart Greeter)"),
    ("BelltownHermit", "Bell Hermit (Bellhart Underground)"),
    ("BelltownCouriers", "Tipp & Pill (Bellhart Couriers)"),
    ("CityMerchant", "Jubilana (Songclave Merchant)"),
    ("cityMerchant", "Jubilana (Songclave Merchant)"),
    ("AntMerchant", "Mottled Skarr (Hunter's March Merchant)"),
    ("antMerchant", "Mottled Skarr (Hunter's March Merchant)"),
    ("MottledChild", "Mottled Skarr"),
    ("SprintMaster", "Sprintmaster Swift"),
    ("ChurchKeeper", "Chapel Maid (Bone Bottom)"),
    ("churchKeeper", "Chapel Maid (Bone Bottom)"),
    ("Caretaker", "Songclave Caretaker"),
    ("caretaker", "Songclave Caretaker"),
    ("ForgeDaughter", "Forge Daughter (Deep Docks)"),
    ("Pinsmith", "Pinmaster Plinney (Bellhart)"),
    ("Plinney", "Pinmaster Plinney (Bellhart)"),
    ("MaskMaker", "Mask Maker (Mount Fay)"),
    ("Seamstress", "Seamstress (Far Fields)"),
    ("Gourmand", "Loyal Mergwin (Choral Chambers)"),
    ("GrubFarmer", "Styx (Silkeater Nest)"),
    ("grubFarmer", "Styx (Silkeater Nest)"),
    ("farmer_", "Styx's Silkeater Farm: "),
    ("Mapper", "Shakra (Cartographer)"),
    ("mapper", "Shakra (Cartographer)"),
    ("Caravan", "Flea Caravan (Mooshka)"),
    ("TroupeHunter", "Varga (Flea Caravan Hunter)"),
    ("TroupeLeader", "Fleamaster Mooshka"),
    ("SteelSentinel", "Steel Soul Jinn / Sentinel"),
    ("SongChevalier", "Second Sentinel (Citadel)"),
    ("songChevalier", "Second Sentinel (Citadel)"),
    ("Druid", "Moss Druid (Mosshome)"),
    ("druid", "Moss Druid (Mosshome)"),
    ("Fixer", "Flick the Fixer"),
    ("fixer", "Flick the Fixer"),
    ("Mort", "Mort (Pilgrim's Rest Merchant)"),
    ("mort", "Mort (Pilgrim's Rest Merchant)"),
    ("Pebb", "Pebb (Bone Bottom Merchant)"),
    ("Grindle", "Grindle (Thief Vendor)"),
    ("grindle", "Grindle (Thief Vendor)"),
    ("Sherma", "Sherma"),
    ("sherma", "Sherma"),
    ("Garmond", "Garmond & Zaza"),
    ("garmond", "Garmond & Zaza"),
    ("Pinstress", "Pinstress (Mount Fay)"),
    ("pinstress", "Pinstress (Mount Fay)"),
    ("Nuu", "Nuu (Halfway Home Hunter)"),
    ("nuu", "Nuu (Halfway Home Hunter)"),
    ("Pilby", "Pilby (Pilgrim NPC)"),
    ("Gilly", "Gilly (Hunter's March NPC)"),
    ("gilly", "Gilly (Hunter's March NPC)"),
    ("Ballow", "Ballow (Diving Bell Engineer)"),
    ("Architect", "Twelfth Architect (Underworks)"),
    ("Librarian", "Vaultkeeper Cardinius (Whispering Vaults)"),
    ("GreenPrince", "Green Prince (Verdania)"),
    ("FlowerQueen", "Nyleth (Shellwood Heart Boss)"),
    ("flowerQueen", "Nyleth (Shellwood Heart Boss)"),
    ("CoralKing", "Crust King Khann (Coral Tower Heart Boss)"),
    ("coralKing", "Crust King Khann (Coral Tower Heart Boss)"),
    ("AntQueen", "Skarrsinger Karmelita (Hunter's Heart Boss)"),
    ("antQueen", "Skarrsinger Karmelita (Hunter's Heart Boss)"),
    ("Spinner", "Widow (Bellhart Boss)"),
    ("spinner", "Widow (Bellhart Boss)"),
    ("SplinterQueen", "Sister Splinter (Shellwood Boss)"),
    ("splinterQueen", "Sister Splinter (Shellwood Boss)"),
    ("SkullKing", "Skull Tyrant (The Marrow Boss)"),
    ("skullKing", "Skull Tyrant (The Marrow Boss)"),
    ("FirstWeaver", "First Sinner (The Slab Boss)"),
    ("CrowCourt", "Crawfather (Greymoor Craw Court)"),
    ("GreyWarrior", "Watcher at the Edge (Sands of Karak)"),
    ("BonetownBoss", "Bell Beast (The Marrow)"),
]

# Comprehensive scene object classification rules with explicit group IDs.
# Tuple: (compiled_rx, group_id, category, label, status)
SCENE_RULES = [
    (re.compile(r"Remasker|remask", re.I), "sc-darkness-mask", "Room Mask / Darkness", "Room darkness / hidden-area mask reveal trigger", "pattern"),
    (re.compile(r"Heart Piece|library_glass_heart_piece", re.I), "sc-verified-mask-shard", "Progression", "Mask Shard pickup / container", "verified"),
    (re.compile(r"Silk Spool", re.I), "sc-verified-spool-fragment", "Progression", "Spool Fragment pickup", "verified"),
    (re.compile(r"Tool Metal|tool_metal_deposit", re.I), "sc-verified-craftmetal", "Collectables", "Craftmetal pickup / ore deposit", "pattern"),
    (re.compile(r"Memory Locket", re.I), "sc-verified-memory-locket", "Collectables", "Memory Locket pickup", "verified"),
    (re.compile(r"SimpleKey", re.I), "sc-verified-upgrade-item", "Key Items", "Simple Key pickup", "verified"),
    (re.compile(r"Cog_Choir_Cylinder", re.I), "sc-verified-relic-cylinder", "Collectables", "Psalm Cylinder / Choir cylinder pickup", "verified"),
    (re.compile(r"Nectar Pickup", re.I), "sc-verified-upgrade-item", "Collectables", "Pollip Heart / Nectar pickup", "verified"),
    (re.compile(r"\(Clone\)", re.I), "sc-runtime-clone", "Engine / Meta", "Unity runtime drop prefab clone", "pattern"),
    # Generic world pickups whose specific item is not yet individually mapped
    (re.compile(r"Collectable Item Pickup|Generic Pickup|^Pickup$", re.I), "sc-unmapped-pickup", "Collectables", "Generic world item pickup (specific drop item not yet individually mapped)", "undecoded"),
    (re.compile(r"Geo Rock", re.I), "sc-rosary-cache", "Caches & Secrets", "Rosary / Geo Rock deposit", "pattern"),
    (re.compile(r"Shell Shard|Shard Deposit|Fossil|Song Shard Barrel|ant_shell_shard_string", re.I), "sc-shard-cache", "Caches & Secrets", "Shell Shard cache / hanging shard string", "pattern"),
    (re.compile(r"Rosary|Geo|ant_item_string|scissor_string|bell_necklace|slab_item_chain", re.I), "sc-rosary-cache", "Caches & Secrets", "Rosary cache / hanging rosary string", "pattern"),
    (re.compile(r"Chest", re.I), "sc-verified-chest", "Caches & Secrets", "Treasure chest", "verified"),
    (re.compile(r"Breakable|Wall|Floor|Ceiling|Secret|Crystal Break Chunk|grave_marker_break|junk_pile_break|crest_shrine_break_tube|drop pillar_chunk|loom_room_jar|Coral Crust Mask|moss_bone_plaque", re.I), "sc-breakable-wall", "Caches & Secrets", "Breakable wall, prop, or secret passage", "pattern"),
    (re.compile(r"Collapser|Drop Platform|Fall_platform|Fall platform|drop_planks|slab_cage_plat|cradle_plat|cradle_spike_plat|Coal Bucket Plat|Abyss_Weaver_Hanging_Plat|Bell Chain Plat|Vine Platform|Library Sliding Plat|Plat Collider|Plank Solid|Chain Platform Breaker", re.I), "sc-platform-collapser", "Platforms & Hazards", "Collapsing, sliding, or movable platform", "pattern"),
    (re.compile(r"stake_trap|DropBomb Rock|DockDashExplodeRock|Wind Rock|Stalactite|lamp_hang_top|lamp_pivot|propeller|black_thread_impacter|pustule_set|tentacle_|cage_|Spine Floater", re.I), "sc-hazard-trap", "Platforms & Hazards", "Room hazard, trap, cage, or environmental prop", "pattern"),
    (re.compile(r"Bench|RestBench|bell_toll_machine|Toll_machine", re.I), "sc-verified-bench-toll", "Maps & Travel", "Bench or Rosary toll machine", "pattern"),
    (re.compile(r"Lever|Switch|Gate|Door|Lift|Elevator|Shortcut|Bridge|Hatch|Slab Lock|lock_machine|Dock Key Receptacle|pressure_plate|Plate|attic_ladder|Slab_vent_mask", re.I), "sc-door-mechanism", "Doors & Mechanisms", "Door, lock, pressure plate, lever, or shortcut", "pattern"),
    (re.compile(r"Black_Thread_Core", re.I), "sc-verified-unique-spawn", "Bosses", "Void Mass (Act 3)", "verified"),
    (re.compile(r"Battle Scene|Arena|Boss Scene|Bone Hunter|Farmer Wisp|Rock Roller|Swamp Muckman|Coral Warrior|Mossbone Mother|Bone Thumper|Tiny Brood Mother|Shellwood Hive|Bot Blocker", re.I), "sc-combat-arena", "Encounters", "Room combat encounter or enemy spawn state", "pattern"),
    (re.compile(r"Cocoon|Silk Grub", re.I), "sc-verified-upgrade-item", "Collectables", "Silkeater cocoon", "verified"),
    (re.compile(r"thread_memory|Memory Orb|Memory Group", re.I), "sc-thread-memory", "World & Story", "Weaver thread memory / memory orb challenge", "pattern"),
    (re.compile(r"Bellshrine Sequence|Music Box Sequence|Weakness.*Scene|Wake.*Scene|Abyss Dive Cutscene|Flyaway Scene|Pin Challenge|CameraLockArea|Start Range|Start Inspect|Inspect Region|Sound Control|Disable Sound Trigger|Bone_East_10_Church|Bone East 11 Cross Over Group|Song Knight Tube|Tension Tone", re.I), "sc-cutscene-trigger", "World & Story", "Cutscene, sequence trigger, or room event state", "pattern"),
    (re.compile(r"Reminder|Interact Reminder", re.I), "sc-tutorial-reminder", "Engine / Meta", "In-room control / ability tutorial prompt", "pattern"),
    (re.compile(r"Silkfly Ambient|fly corpse|Moss Vine Cluster|Witch_Cluster_Vine|^vine|Thick Silk Vines|Craw_home|craw_court_summons_pin|SC_0060_sc_post|Bone Carriage|body lower|body top|^head$|Song Reed Grand|Grasshopper Child", re.I), "sc-ambient-prop", "World State", "Ambient creature, flora, or background prop state", "pattern"),
    (re.compile(r"NPC|Pilgrim|Mapper|Caravan|Sherma|Garmond|Green Prince|Seth|Gilly|Courier|Thief|Huntress|Pinstress|Ballow|Churchkeeper|Confessional|Fixer|Chef_Meat_React|City Merchant|Dust Traders|HH Bartender|HH Patron|Blue Assistant|Moss Creep|Slab Prisoner|Sprintmaster|Snail Shamans|Ant Queen|Enclave|Belltown Greeter|Mask Maker|Slab Fly Large Cage", re.I), "sc-npc-placement", "NPCs", "In-room NPC placement or interaction state", "pattern"),
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


def _scene_group_for_obj(fname: str, oid: str, sid: str = "", icon: str = "") -> str:
    if "Heart Piece" in sid or "health_backboard_mask" in icon:
        return "sc-verified-mask-shard"
    if "Silk Spool" in sid or "spool_upgrade" in icon:
        return "sc-verified-spool-fragment"
    if "Charm_Notch" in icon or oid.startswith("locket-"):
        return "sc-verified-memory-locket"
    if "Tool_Metal.png" in icon or "Tool Metal" in sid:
        return "sc-verified-craftmetal"
    if fname == "world.js":
        return "sc-verified-unique-spawn"
    return "sc-verified-upgrade-item"


class SaveDictionary:
    """Loads verified definitions from web/src/data/packs/base/*.js and rules."""

    def __init__(self, pack_dir: Path = BASE_PACK_DIR):
        self.pd_verified = {}          # key -> (group_id, category, description)
        self.scene_bools = {}          # "SceneName/ID" -> (group_id, category, description)
        self.scene_ints = {}           # "SceneName/ID" -> (group_id, category, description)
        self.container_items = {       # container_name -> (group_id, { entry_name -> (category, description) })
            "Tools": ("cnt-tools", {}),
            "ToolEquips": ("cnt-crest-loadouts", {}),
            "ExtraToolEquips": ("cnt-vesticrest-slots", {
                "Defend1": ("Progression", "Vesticrest extra Blue (Defense) tool slot"),
                "Explore1": ("Progression", "Vesticrest extra Yellow (Exploration) tool slot"),
            }),
            "ToolLiquids": ("cnt-tool-liquids", {
                "Flea Brew": ("Collectables", "Flea Brew liquid refill counter"),
                "Lifeblood Syringe": ("Collectables", "Plasmium Phial / Lifeblood Syringe liquid refill counter"),
            }),
            "QuestCompletionData": ("cnt-quests", {}),
            "QuestRumourData": ("cnt-quest-rumours", {}),
            "Collectables": ("cnt-inventory", {}),
            "Relics": ("cnt-relics", {}),
            "MateriumCollected": ("cnt-materium", {}),
            "MementosDeposited": ("cnt-mementos", {}),
            "EnemyJournalKillData": ("cnt-journal", {}),
        }
        self.areas = {}                # lower prefix -> display
        self.untracked = []            # [(id, group_id, category, reason, compiled_rx)]
        self._load_pack(pack_dir)

    def _load_pack(self, pack_dir: Path):
        # 1. Areas
        for obj in _parse_js_objects(pack_dir / "areas.js"):
            if "prefix" in obj:
                self.areas[obj["prefix"].lower()] = obj.get("display") or obj["prefix"]

        # 2. Untracked patterns + reasons
        untracked_text = (pack_dir / "untracked.js").read_text(encoding="utf-8")
        reasons = dict(re.findall(r"id:\s*'([^']+)'[\s\S]*?reason:\s*'((?:\\.|[^'\\])*)'", untracked_text))
        for pid, rx in untracked_patterns(pack_dir.parent.parent):
            grp, cat = UNTRACKED_TO_GROUP.get(pid, ("pd-world-shortcut", "World State"))
            reason = js_unescape(reasons.get(pid, pid))
            self.untracked.append((pid, grp, cat, reason, rx))

        # 3. Pack files
        file_meta = [
            ("fields.js", "pd-current-vitals", "General"),
            ("bosses.js", "pd-boss-defeats", "Bosses"),
            ("fleas.js", "pd-flea-rescues", "Collectables"),
            ("abilities.js", "pd-abilities-skills", "Progression"),
            ("skills.js", "pd-abilities-skills", "Progression"),
            ("crests.js", "pd-progression-upgrades", "Progression"),
            ("maps.js", "pd-maps-travel", "Maps & Travel"),
            ("keyItems.js", "pd-key-items", "Key Items"),
            ("unlockables.js", "pd-progression-upgrades", "Progression"),
            ("collectables.js", "pd-collectables-sources", "Collectables"),
            ("world.js", "pd-world-bellhome", "World & Story"),
            ("journal.js", "cnt-journal", "Journal"),
            ("quests.js", "cnt-quests", "Quests"),
        ]
        general_keys = {"version", "permadeathMode", "completionPercentage", "playTime"}

        for fname, default_group, default_cat in file_meta:
            fpath = pack_dir / fname
            if not fpath.exists():
                continue
            for obj in _parse_js_objects(fpath):
                display = obj.get("display") or obj.get("name") or obj.get("json") or obj.get("flag") or ""
                note = f" ({obj['note']})" if obj.get("note") else ""
                desc = f"{display}{note}"
                oid = obj.get("id", "")

                if fname == "journal.js" and "json" in obj:
                    self.container_items["EnemyJournalKillData"][1][obj["json"]] = ("Journal", f"Hunter's Journal: {display}")
                    continue
                if fname == "quests.js" and "json" in obj:
                    self.container_items["QuestCompletionData"][1][obj["json"]] = ("Quests", f"Quest / Wish: {display}")
                    self.container_items["QuestRumourData"][1][obj["json"]] = ("Quests", f"Quest rumour: {display}")
                    continue
                if fname == "crests.js" and "json" in obj:
                    self.container_items["ToolEquips"][1][obj["json"]] = ("Progression", f"Crest loadout: {display}")

                for key_field in ("json", "flag"):
                    k = obj.get(key_field)
                    if k and obj.get("flagType") not in ("quest", "scene", "sceneInt", "item"):
                        grp = "pd-general-meta" if k in general_keys else ("pd-boss-defeats" if oid.startswith("rhinogrund") else default_group)
                        self.pd_verified.setdefault(k, (grp, default_cat, desc))

                sc, sid = obj.get("sceneName"), obj.get("sceneId")
                if sc and sid:
                    sc_grp = _scene_group_for_obj(fname, oid, sid, obj.get("icon", ""))
                    if obj.get("flagType") == "sceneInt":
                        self.scene_ints[f"{sc}/{sid}"] = ("sc-verified-unique-spawn", default_cat, desc)
                    else:
                        self.scene_bools[f"{sc}/{sid}"] = (sc_grp, default_cat, desc)

        # Tools & skills in tool slots
        for obj in _parse_js_objects(pack_dir / "tools.js"):
            if "json" in obj and "display" in obj:
                cat_label = obj.get("category", "Tool")
                self.container_items["Tools"][1][obj["json"]] = ("Collectables", f"{cat_label} Tool: {obj['display']}")
                self.container_items["ToolLiquids"][1].setdefault(obj["json"], ("Collectables", f"Liquid refills: {obj['display']}"))
        for obj in _parse_js_objects(pack_dir / "skills.js"):
            if "equipName" in obj and "display" in obj:
                self.container_items["Tools"][1][obj["equipName"]] = ("Progression", f"Silk Skill (in Tools table): {obj['display']}")

        # Crest aliases in ToolEquips
        for alias, label in [("Hunter_v2", "Hunter Crest (Evolved v2)"), ("Hunter_v3", "Hunter Crest (Evolved v3)")]:
            self.container_items["ToolEquips"][1][alias] = ("Progression", label)

        # Collectables containers (Relics, Materium, Mementos, Inventory items)
        coll_exports = _parse_named_exports(pack_dir / "collectables.js")
        for obj in coll_exports.get("RELICS", []):
            if "json" in obj:
                self.container_items["Relics"][1][obj["json"]] = ("Collectables", f"Relic ({obj.get('kind', 'Relic')}): {obj.get('display', obj['json'])}")
        for obj in coll_exports.get("MATERIUM", []):
            if "json" in obj:
                self.container_items["MateriumCollected"][1][obj["json"]] = ("Collectables", f"Materium entry: {obj.get('display', obj['json'])}")
        for obj in coll_exports.get("INVENTORY_ITEMS", []):
            if "json" in obj:
                self.container_items["Collectables"][1][obj["json"]] = ("Collectables", f"Inventory item: {obj.get('display', obj['json'])}")
        for obj in coll_exports.get("MEMENTOS", []):
            if obj.get("item"):
                disp = obj.get("display") or obj["item"]
                self.container_items["Collectables"][1].setdefault(obj["item"], ("Collectables", f"Memento item: {disp}"))
                self.container_items["MementosDeposited"][1].setdefault(obj["item"], ("Collectables", f"Deposited Memento: {disp}"))
        for heart in ("Hunter Heart", "Flower Heart", "Coral Heart", "Clover Heart"):
            self.container_items["MementosDeposited"][1].setdefault(heart, ("Collectables", f"Deposited Conjoined Heart ({heart})"))
        for f in ("CollectedHeartFlower", "CollectedHeartCoral", "CollectedHeartHunter", "CollectedHeartClover"):
            self.pd_verified.setdefault(f, ("pd-collectables-sources", "Collectables", f"Old Heart collected ({f})"))
        for alt in ("completedFirstWeaver", "PurchasedWardKey", "MerchantEnclaveWardKey", "purchasedGrindleMemoryLocket", "ShopkeeperQuestSpoolCollected", "MapperAppearInBellhart"):
            self.pd_verified.setdefault(alt, ("pd-progression-upgrades", "Progression", f"Progression flag ({alt})"))

        # Curated PLAYER_DATA_DOCS and VERIFIED_SCENE_BOOLS override
        for k, val in PLAYER_DATA_DOCS.items():
            self.pd_verified[k] = val
        for k, val in VERIFIED_SCENE_BOOLS.items():
            self.scene_bools.setdefault(k, val)

    def area_of(self, scene_name: str) -> str:
        if not scene_name:
            return "Unknown Area"
        prefix = str(scene_name).split("_")[0].lower()
        return self.areas.get(prefix, scene_name)

    def _refine_pattern_group(self, key: str, default_group: str) -> str:
        if key.startswith(("chapelClosed_", "completedMemory_")):
            return "pd-crest-chapel"
        if key.startswith("memoryOrbs_Clover_"):
            return "pd-verdania-orbs"
        if key.startswith(("fleaGames_", "FleaGames")):
            return "pd-flea-festival"
        if key.startswith("farmer_grub"):
            return "pd-styx-farm"
        return default_group

    def _enrich_pattern_description(self, key: str, pid: str, reason: str) -> str:
        if key.startswith(("encountered", "Encountered")):
            target = _humanize(re.sub(r"^[Ee]ncountered", "", key))
            for code, friendly in NPC_ALIASES:
                if code.lower() in key.lower():
                    target = f"{friendly} ({target})"
                    break
            return f"Encountered boss/miniboss intro cutscene: {target}"
        if key.startswith(("visited", "entered", "Entered", "previouslyVisited", "fullyEntered")) or key.endswith("_entered"):
            raw_area = re.sub(r"^(visited|entered|Entered|previouslyVisited|fullyEntered)_?|_entered$", "", key)
            area = self.area_of(raw_area)
            return f"Entered / visited area or room: {area} ({raw_area})"
        if key.startswith("chapelClosed_"):
            crest = key.split("_", 1)[1].title()
            return f"Chapel closed after claiming the {crest} Crest"
        if key.startswith("completedMemory_"):
            crest = key.split("_", 1)[1].title()
            return f"Completed Chapel memory sequence for the {crest} Crest"
        if key.startswith("memoryOrbs_Clover_"):
            room = key.replace("memoryOrbs_", "")
            return f"Completed Verdania (Lost Verdania) memory orb sequence in {room}"
        if key.startswith(("HasSeen", "Seen", "seen")):
            topic = _humanize(re.sub(r"^(HasSeen|Seen|seen)", "", key))
            return f"Tutorial / UI prompt shown: {topic}"
        if key.startswith(("Met", "met")):
            who = _humanize(re.sub(r"^(Met|met)", "", key))
            for code, friendly in NPC_ALIASES:
                if code.lower() in key.lower():
                    who = friendly
                    break
            return f"First meeting with NPC: {who}"

        base = _humanize(key)
        for code, friendly in NPC_ALIASES:
            if key.startswith(code):
                return f"{friendly}: {base} ({reason})"
        return f"{base} ({reason})"

    def classify_player_data_key(self, key: str) -> dict:
        if key in self.pd_verified:
            grp, cat, desc = self.pd_verified[key]
            return {
                "key": key, "group": grp, "group_label": GROUP_LABELS.get(grp, grp),
                "category": cat, "description": desc, "status": "verified",
            }
        for pid, grp, cat, reason, rx in self.untracked:
            if rx.search(key):
                refined_grp = self._refine_pattern_group(key, grp)
                desc = self._enrich_pattern_description(key, pid, reason)
                return {
                    "key": key, "group": refined_grp, "group_label": GROUP_LABELS.get(refined_grp, refined_grp),
                    "category": cat, "description": desc, "status": "pattern",
                }
        return {
            "key": key, "group": "pd-unknown", "group_label": "Unknown playerData Key",
            "category": "Undocumented", "description": f"{_humanize(key)} — undocumented key", "status": "unknown",
        }

    def classify_container_entry(self, container: str, name: str) -> dict:
        grp, table = self.container_items.get(container, ("cnt-unknown", {}))
        if name in table:
            cat, desc = table[name]
            return {
                "key": f"{container}[{name}]", "group": grp, "group_label": GROUP_LABELS.get(grp, grp),
                "category": cat, "description": desc, "status": "verified",
            }
        return {
            "key": f"{container}[{name}]", "group": grp, "group_label": GROUP_LABELS.get(grp, grp),
            "category": "Undocumented", "description": f"Unlisted {container} entry: {name}", "status": "unknown",
        }

    def classify_scene_entry(self, kind: str, scene_name: str, obj_id: str) -> dict:
        comp = f"{scene_name}/{obj_id}"
        key = f"{scene_name} / {obj_id}"
        area = self.area_of(scene_name)
        if kind == "persistentBools" and comp in self.scene_bools:
            grp, cat, desc = self.scene_bools[comp]
            return {
                "key": key, "group": grp, "group_label": GROUP_LABELS.get(grp, grp),
                "category": cat, "description": f"{desc} [{area}]", "status": "verified",
            }
        if kind == "persistentInts" and comp in self.scene_ints:
            grp, cat, desc = self.scene_ints[comp]
            return {
                "key": key, "group": grp, "group_label": GROUP_LABELS.get(grp, grp),
                "category": cat, "description": f"{desc} [{area}]", "status": "verified",
            }
        if kind == "geoRocks":
            grp = "sc-rosary-cache"
            return {
                "key": key, "group": grp, "group_label": GROUP_LABELS.get(grp, grp),
                "category": "Caches & Secrets", "description": f"Rosary / Geo Rock deposit in {area} (remaining hits)", "status": "pattern",
            }
        for rx, grp, cat, label, st in SCENE_RULES:
            if rx.search(obj_id):
                return {
                    "key": key, "group": grp, "group_label": GROUP_LABELS.get(grp, grp),
                    "category": cat, "description": f"{label} in {area}", "status": st,
                }
        return {
            "key": key, "group": "sc-unknown", "group_label": "Unknown Scene Object",
            "category": "Undocumented", "description": f"Unclassified scene object in {area} ({obj_id})", "status": "unknown",
        }


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

        if isinstance(val, dict):
            entries = val.get("savedData", val.get("list"))
            if isinstance(entries, list):
                for item in entries:
                    if isinstance(item, dict) and "Name" in item:
                        cinfo = d.classify_container_entry(key, item["Name"])
                        payload = item.get("Data", item.get("Record"))
                        container_rows.append({**cinfo, "container": key, "value": payload})
        elif key == "StoryEvents" and isinstance(val, list):
            for idx, ev in enumerate(val):
                if isinstance(ev, dict):
                    et = ev.get("EventType")
                    sc = ev.get("SceneName", "")
                    pt = ev.get("PlayTime", 0.0)
                    label = STORY_EVENT_TYPES.get(et, f"Unknown StoryEvent type {et}")
                    status = "verified" if et in STORY_EVENT_TYPES else "unknown"
                    grp = "cnt-story-events"
                    container_rows.append({
                        "key": f"StoryEvents[{idx}]",
                        "container": "StoryEvents",
                        "group": grp,
                        "group_label": GROUP_LABELS[grp],
                        "category": "World & Story",
                        "description": f"{label} in {d.area_of(sc)} ({sc}) at {pt:.1f}s",
                        "status": status,
                        "value": ev,
                    })

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


def _is_active(val) -> bool:
    if isinstance(val, bool):
        return val
    if isinstance(val, (int, float)):
        return val != 0
    if isinstance(val, str):
        return len(val) > 0
    if isinstance(val, list):
        return len(val) > 0
    if isinstance(val, dict):
        if "IsUnlocked" in val:
            return bool(val["IsUnlocked"])
        if "IsCompleted" in val:
            return bool(val["IsCompleted"])
        if "IsCollected" in val:
            return bool(val["IsCollected"])
        if "IsDeposited" in val:
            return bool(val["IsDeposited"])
        if "Kills" in val:
            return val["Kills"] > 0
        if "Amount" in val:
            return val["Amount"] > 0
        items = val.get("savedData", val.get("list"))
        if isinstance(items, list):
            return len(items) > 0
        return len(val) > 0
    return False


def summarize_section(rows: list) -> dict:
    counts = Counter(r["status"] for r in rows)
    return {
        "total": len(rows),
        "verified": counts.get("verified", 0),
        "pattern": counts.get("pattern", 0),
        "undecoded": counts.get("undecoded", 0),
        "unknown": counts.get("unknown", 0),
    }


def summarize_groups(rows: list) -> list:
    """Group rows by `group` ID and return sorted stats [{group, label, status, total, active}]."""
    buckets = defaultdict(list)
    for r in rows:
        buckets[r["group"]].append(r)
    out = []
    for grp, items in buckets.items():
        active = sum(1 for r in items if _is_active(r["value"]))
        out.append({
            "group": grp,
            "label": items[0].get("group_label", grp),
            "status": items[0]["status"],
            "total": len(items),
            "active": active,
        })
    status_order = {"verified": 0, "pattern": 1, "undecoded": 2, "unknown": 3}
    return sorted(out, key=lambda g: (status_order.get(g["status"], 9), -g["total"], g["group"]))


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
        lines.append(
            f"=== {sec_name} ({s['total']} entries: {s['verified']} verified, "
            f"{s['pattern']} pattern, {s['undecoded']} undecoded, {s['unknown']} unknown) ==="
        )
        for r in rows:
            lines.append(
                f"  [{r['status']:9s}] [{r['group']:26s}] {r['key']} = {_preview(r['value'])}  # {r['description']}"
            )
        lines.append("")
    out_path.write_text("\n".join(lines), encoding="utf-8")


def main(argv=None) -> int:
    argv = sys.argv[1:] if argv is None else argv
    search = None
    section_filter = None
    group_filter = None
    annotate_out = None
    show_groups = "--groups" in argv
    undecoded_only = "--undecoded" in argv
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
        elif a == "--group" and i + 1 < len(argv):
            group_filter = argv[i + 1]
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
    print("-" * 88)
    print(f"{'Section':18s} {'Total':>8s} {'Verified':>10s} {'Pattern':>10s} {'Undecoded':>11s} {'Unknown':>9s}")
    print("-" * 88)

    total_unknown = 0
    for sec_name, rows in sections.items():
        if section_filter and sec_name != section_filter:
            continue
        s = summarize_section(rows)
        total_unknown += s["unknown"]
        print(
            f"{sec_name:18s} {s['total']:8d} {s['verified']:10d} "
            f"{s['pattern']:10d} {s['undecoded']:11d} {s['unknown']:9d}"
        )
    print("-" * 88)

    if show_groups or (not search and not group_filter and not undecoded_only and not unknown_only and not annotate_out):
        for sec_name, rows in sections.items():
            if section_filter and sec_name != section_filter:
                continue
            if not rows:
                continue
            print(f"\n[{sec_name} groups]")
            for g in summarize_groups(rows):
                print(
                    f"  {g['status']:9s}  {g['group']:28s}  {g['active']:4d}/{g['total']:<4d} active   {g['label']}"
                )

    if annotate_out:
        write_annotated_report(sections, annotate_out)
        print(f"\nWrote line-by-line annotated save report to {annotate_out}")

    if search or group_filter or undecoded_only or unknown_only:
        print()
        for sec_name, rows in sections.items():
            if section_filter and sec_name != section_filter:
                continue
            matches = [
                r for r in rows
                if (not unknown_only or r["status"] == "unknown")
                and (not undecoded_only or r["status"] in ("undecoded", "unknown"))
                and (not group_filter or r["group"] == group_filter)
                and (not search or search in f"{r['key']} {r['group']} {r['category']} {r['description']} {_preview(r['value'])}".lower())
            ]
            if matches:
                print(f"== {sec_name} ({len(matches)} matches)")
                for r in matches[:120]:
                    print(f"  [{r['status']:9s}] [{r['group']}] {r['key']} = {_preview(r['value'])}  -- {r['description']}")
                if len(matches) > 120:
                    print(f"  ... and {len(matches) - 120} more")
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
