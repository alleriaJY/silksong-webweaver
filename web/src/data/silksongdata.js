/**
 * Silksong Save Data Schema Definitions
 * 
 * This file contains all the field definitions for parsing Silksong save data.
 * To add new fields, simply add entries to the appropriate list.
 */

// ═══════════════════════════════════════════════════════════════════════════
// GENERAL FIELDS - Overview tab data (direct playerData access)
// ═══════════════════════════════════════════════════════════════════════════
export const GENERAL_FIELDS_LIST = [
    { json: 'version', display: 'Game Version' },
    { json: 'permadeathMode', display: 'Game Mode' },
    { json: 'completionPercentage', display: 'Completion' },
    { json: 'playTime', display: 'Play Time' },
    { json: 'maxHealth', display: 'Max Health' },
    { json: 'silkMax', display: 'Max Silk' },
    { json: 'silkRegenMax', display: 'Max Silk Hearts' },
];

// ═══════════════════════════════════════════════════════════════════════════
// CURRENT STATS FIELDS - Current gameplay state
// ═══════════════════════════════════════════════════════════════════════════
export const CURRENT_FIELDS_LIST = [
    { json: 'health', display: 'Current Health' },
    { json: 'maxHealth', display: 'Max Health' },
    { json: 'silk', display: 'Current Silk' },
    { json: 'silkMax', display: 'Max Silk' },
    { json: 'geo', display: 'Rosaries' },
    { json: 'ShellShards', display: 'Shell Shards' },
    { json: 'CurrentCrestID', display: 'Equipped Crest' },
    { json: 'currentArea', display: 'Current Area' },
    { json: 'mapZone', display: 'Map Zone' },
    { json: 'atBench', display: 'At Bench' },
];

// ═══════════════════════════════════════════════════════════════════════════
// MISC FIELDS - Respawn and other info
// ═══════════════════════════════════════════════════════════════════════════
export const MISC_FIELDS_LIST = [
    { json: 'respawnScene', display: 'Respawn Area' },
    { json: 'respawnMarkerName', display: 'Respawn Marker' },
    { json: 'respawnType', display: 'Respawn Type' },
];

// ═══════════════════════════════════════════════════════════════════════════
// TOOLS - playerData.Tools.savedData array
// Each tool has: Name, Data.IsUnlocked, Data.HasBeenSeen, Data.HasBeenSelected
// ═══════════════════════════════════════════════════════════════════════════
export const TOOLS_LIST = [
    // Red Tools
    { json: 'Straight Pin', display: 'Straight Pin', category: 'Red', icon: 'T_straight_pin.png' },
    { json: 'Tri Pin', display: 'Threefold Pin', category: 'Red', icon: 'T_tri_pin.png' },
    { json: 'Sting Shard', display: 'Sting Shard', category: 'Red', icon: 'T_sting_shard.png' },
    { json: 'Tack', display: 'Tacks', category: 'Red', icon: 'T_tack.png' },
    { json: 'Harpoon', display: 'Longpin', category: 'Red', icon: 'T_claw_javelin.png' },
    { json: 'Curve Claws', display: 'Curveclaw', category: 'Red', icon: 'T_curve_claw.png' },
    { json: 'Curve Claws Upgraded', display: 'Curvesickle', category: 'Red', icon: 'T_curve_claw_upgraded.png' },
    { json: 'Shakra Ring', display: 'Throwing Ring', category: 'Red', icon: 'T_shakra_ring.png' },
    { json: 'Pimpilo', display: 'Pimpillo', category: 'Red', icon: 'T_pimpilo.png' },
    { json: 'Conch Drill', display: 'Conchcutter', category: 'Red', icon: 'T_Conch_Drill_Shot.png' },
    { json: 'WebShot Forge', display: 'Silkshot (Forge Daughter)', category: 'Red', icon: '_0002_T_web_shot_forge.png' },
    { json: 'WebShot Architect', display: 'Silkshot (Twelfth Architect)', category: 'Red', icon: '_0003_T_web_shot_architect.png' },
    { json: 'WebShot Weaver', display: 'Silkshot (Mount Fay)', category: 'Red', icon: '_0001_T_web_shot_forge_runes.png' },
    { json: 'Screw Attack', display: "Delver's Drill", category: 'Red', icon: 'T_Spine_head.png' },
    { json: 'Cogwork Saw', display: 'Cogwork Wheel', category: 'Red', icon: 'T_cogwork_saw.png' },
    { json: 'Cogwork Flier', display: 'Cogfly', category: 'Red', icon: 'T_cogwork_flier.png' },
    { json: 'Rosary Cannon', display: 'Rosary Cannon', category: 'Red', icon: '_0004_T_rosary_cannon_loaded.png' },
    { json: 'Flintstone', display: 'Flintslate', category: 'Red', icon: 'Hornet_icon_0003_T_flintstone.png' },
    { json: 'Silk Snare', display: 'Snare Setter', category: 'Red', icon: '_0004_T_snare_setter.png' },
    { json: 'Flea Brew', display: 'Flea Brew', category: 'Red', icon: 'T_flea_brew.png' },
    { json: 'Lifeblood Syringe', display: 'Plasmium Phial', category: 'Red', icon: 'T_syringe_lifeblood.png' },
    { json: 'Extractor', display: 'Needle Phial', category: 'Red', icon: 'T_Extractor.png' },
    { json: 'Lightning Rod', display: 'Voltvessels', category: 'Red', icon: '_0004_T_lightning__0001_1_venom.png' },
    // Blue Tools
    { json: 'Mosscreep Tool 1', display: "Druid's Eye", category: 'Blue', icon: 'T_mossmedal.png' },
    { json: 'Mosscreep Tool 2', display: "Druid's Eyes", category: 'Blue', icon: 'T_mossmedal_second.png' },
    { json: 'Lava Charm', display: 'Magma Bell', category: 'Blue', icon: 'Hornet_T_lava_charm.png' },
    { json: 'Bell Bind', display: 'Warding Bell', category: 'Blue', icon: 'Hornet_icon_0001_T_bell_shield.png' },
    { json: 'Poison Pouch', display: 'Pollip Pouch', category: 'Blue', icon: 'T_poison_pouch.png' },
    { json: 'Fractured Mask', display: 'Fractured Mask', category: 'Blue', icon: 'Hornet_T_Fractured_Mask.png' },
    { json: 'Multibind', display: 'Multibinder', category: 'Blue', icon: 'T_multi_bind.png' },
    { json: 'White Ring', display: 'Weavelight', category: 'Blue', icon: 'T_icon_white_ring.png' },
    { json: 'Brolly Spike', display: 'Sawtooth Circlet', category: 'Blue', icon: 'T_brolly_spike.png' },
    { json: 'Quickbind', display: 'Injector Band', category: 'Blue', icon: 'T_quick_bind.png' },
    { json: 'Spool Extender', display: 'Spool Extender', category: 'Blue', icon: 'T_spool_bar_extender.png' },
    { json: 'Reserve Bind', display: 'Reserve Bind', category: 'Blue', icon: 'T_focus_spool.png' },
    { json: 'Dazzle Bind', display: 'Claw Mirror', category: 'Blue', icon: 'T_dazzle_bind.png' },
    { json: 'Dazzle Bind Upgraded', display: 'Claw Mirrors', category: 'Blue', icon: 'T_dazzle_bind_upg.png' },
    { json: 'Revenge Crystal', display: 'Memory Crystal', category: 'Blue', icon: 'T_revenge_crystal.png' },
    { json: 'Thief Claw', display: 'Snitch Pick', category: 'Blue', icon: 'Thief_Claw.png' },
    { json: 'Zap Imbuement', display: 'Volt Filament', category: 'Blue', icon: 'T_zap_imbuement.png' },
    { json: 'Quick Sling', display: 'Quick Sling', category: 'Blue', icon: 'T_quick_sling.png' },
    { json: 'Maggot Charm', display: 'Wreath of Purity', category: 'Blue', icon: 'poultice_pouch_icon.png' },
    { json: 'Longneedle', display: 'Longclaw', category: 'Blue', icon: 'T_longneedle.png' },
    { json: 'Wisp Lantern', display: 'Wispfire Lantern', category: 'Blue', icon: 'T_wisp_lantern.png' },
    { json: 'Flea Charm', display: 'Egg of Flealia', category: 'Blue', icon: 'Flea_Egg.png' },
    { json: 'Pinstress Tool', display: 'Pin Badge', category: 'Blue', icon: 'T_pinstress_tool.png' },
    // Yellow Tools
    { json: 'Compass', display: 'Compass', category: 'Yellow', icon: 'T_Compass.png' },
    { json: 'Bone Necklace', display: 'Shard Pendant', category: 'Yellow', icon: 'Hornet_Bone_Necklace.png' },
    { json: 'Rosary Magnet', display: 'Magnetite Brooch', category: 'Yellow', icon: 'T_rosary_magnet.png' },
    { json: 'Weighted Anklet', display: 'Weighted Belt', category: 'Yellow', icon: 'T_weighted_anklet.png' },
    { json: 'Barbed Wire', display: 'Barbed Bracelet', category: 'Yellow', icon: 'T_barbed_wire.png' },
    { json: 'Dead Mans Purse', display: "Dead Bug's Purse", category: 'Yellow', icon: 'T_dead_purse.png' },
    { json: 'Shell Satchel', display: 'Shell Satchel', category: 'Yellow', icon: 'T_shell_satchel.png' },
    { json: 'Magnetite Dice', display: 'Magnetite Dice', category: 'Yellow', icon: '_0006_I_magnetite_dice.png' },
    { json: 'Scuttlebrace', display: 'Scuttlebrace', category: 'Yellow', icon: 'T_steel_spine.png' },
    { json: 'Wallcling', display: "Ascendant's Grip", category: 'Yellow', icon: 'T_longneedle_old1.png' },
    { json: 'Musician Charm', display: 'Spider Strings', category: 'Yellow', icon: 'T_attunement_charm.png' },
    { json: 'Sprintmaster', display: 'Silkspeed Anklets', category: 'Yellow', icon: 'T_icon_sprintmaster.png' },
    { json: 'Thief Charm', display: "Thief's Mark", category: 'Yellow', icon: 'Thief_Brooch.png' },
];

// ═══════════════════════════════════════════════════════════════════════════
// BOSSES - direct playerData boolean flags
// ═══════════════════════════════════════════════════════════════════════════
export const BOSSES_LIST = [
    { json: 'defeatedMossMother', display: 'Moss Mother', icon: 'Moss Mother - Mossbone Mother.png' },
    { json: 'defeatedBellBeast', display: 'Bell Beast', icon: 'Bell Beast - Bone Beast.png' },
    { json: 'defeatedLace1', display: 'Lace 1 (Deep Docks)', icon: 'Lace.png' },
    { json: 'defeatedSongGolem', display: 'Fourth Chorus', icon: 'Fourth Chorus - Song Golem.png' },
    { json: 'defeatedVampireGnatBoss', display: 'Moorwing', icon: 'Moorwing - Vampire Gnat.png' },
    { json: 'defeatedSplinterQueen', display: 'Sister Splinter', icon: 'Sister Splinter - Splinter Queen.png' },
    { json: 'skullKingDefeated', display: 'Skull Tyrant 1', icon: 'Skull Tyrant - Skull King.png' },
    { json: 'skullKingKilled', display: 'Skull Tyrant 2', icon: 'Skull Tyrant - Skull King.png' },
    { json: 'defeatedCoralDrillers', display: 'Great Conchflies', icon: 'Great Conchfly - Coral Conch Driller Giant.png' },
    { json: 'defeatedPhantom', display: 'Phantom', icon: 'Phantom.png' },
    { json: 'defeatedLastJudge', display: 'The Last Judge', icon: 'Last Judge.png' },
    { json: 'defeatedBoneFlyerGiant', display: 'Savage Beastfly 1', icon: 'Savage Beastfly - Bone Flyer Giant.png' },
    { json: 'defeatedBoneFlyerGiantGolemScene', display: 'Savage Beastfly 2', icon: 'Savage Beastfly - Bone Flyer Giant.png' },
    { json: 'defeatedCogworkDancers', display: 'Cogwork Dancers', icon: 'Cogwork Dancers - Clockwork Dancer.png' },
    { json: 'defeatedTrobbio', display: 'Trobbio', icon: 'Trobbio #4267244.png' },
    { json: 'defeatedSongChevalierBoss', display: 'Second Sentinel', icon: 'Second Sentinel - Song Knight.png' },
    { json: 'defeatedFirstWeaver', display: 'First Sinner', icon: 'First Sinner - First Weaver.png' },
    { json: 'defeatedRoachkeeperChef', display: 'Disgraced Chef Lugoli', icon: 'Disgraced Chef Lugoli - Roachkeeper Chef.png' },
    { json: 'defeatedBroodMother', display: 'Broodmother', icon: 'Broodmother - Slab Fly Broodmother.png' },
    { json: 'defeatedWispPyreEffigy', display: 'Father of the Flame', icon: 'Father of the Flame - Wisp Pyre Effigy.png' },
    { json: 'defeatedCoralDrillerSolo', display: 'Raging Conchfly', icon: 'Great Conchfly - Coral Conch Driller Giant.png' },
    { json: 'defeatedDockForemen', display: 'Forebrothers Signis & Gron', icon: 'Forebrothers Signis & Gron - Dock Guard Thrower.png' },
    { json: 'wardBossDefeated', display: 'The Unravelled', icon: 'The Unravelled - Conductor Boss.png' },
    { json: 'DefeatedSwampShaman', display: 'Groal the Great', icon: 'Groal the Great - Swamp Shaman.png' },
    { json: 'defeatedZapCoreEnemy', display: 'Voltvyrm', icon: 'Voltvyrm - Zap Core Enemy.png' },
    { json: 'defeatedLaceTower', display: 'Lace 2 (The Cradle)', icon: 'Lace #4267252.png' },
    { json: 'garmondBlackThreadDefeated', display: 'Lost Garmond', icon: 'Lost Garmond - Garmond.png' },
    { json: 'defeatedAntTrapper', display: 'Gurr the Outcast', icon: 'Gurr the Outcast - Bone Hunter Trapper.png' },
    { json: 'PinstressPeakBattleAccepted', display: 'Pinstress', icon: 'Pinstress Boss.png' },
    { json: 'defeatedTormentedTrobbio', display: 'Tormented Trobbio', icon: 'Tormented Trobbio.png' },
    { json: 'defeatedWhiteCloverstag', display: 'Palestag', icon: 'Palestag - Cloverstag White.png' },
    { json: 'defeatedAntQueen', display: 'Skarrsinger Karmelita', icon: 'Skarrsinger Karmelita - Hunter Queen.png' },
    { json: 'defeatedCoralKing', display: 'Crust King Khann', icon: 'Crust King Khann - Coral King.png' },
    { json: 'defeatedSeth', display: 'Seth', icon: 'Shrine Guardian Seth - Seth.png' },
    { json: 'defeatedFlowerQueen', display: 'Nyleth', icon: 'Nyleth - Flower Queen.png' },
    { json: 'defeatedCloverDancers', display: 'Clover Dancers', icon: 'Clover Dancers - Clover Dancer.png' },
];

// ═══════════════════════════════════════════════════════════════════════════
// FLEAS - direct playerData boolean flags
// ═══════════════════════════════════════════════════════════════════════════
export const FLEAS_LIST = [
    { json: 'SavedFlea_Ant_03', display: 'Flea (Ant 03)' },
    { json: 'SavedFlea_Belltown_04', display: 'Flea (Belltown 04)' },
    { json: 'SavedFlea_Bone_06', display: 'Flea (Bone 06)' },
    { json: 'SavedFlea_Bone_East_05', display: 'Flea (Bone East 05)' },
    { json: 'SavedFlea_Bone_East_10_Church', display: 'Flea (Bone East Church)' },
    { json: 'SavedFlea_Bone_East_17b', display: 'Flea (Bone East 17b)' },
    { json: 'SavedFlea_Coral_24', display: 'Flea (Coral 24)' },
    { json: 'SavedFlea_Coral_35', display: 'Flea (Coral 35)' },
    { json: 'SavedFlea_Crawl_06', display: 'Flea (Crawl 06)' },
    { json: 'SavedFlea_Dock_03d', display: 'Flea (Dock 03d)' },
    { json: 'SavedFlea_Dock_16', display: 'Flea (Dock 16)' },
    { json: 'SavedFlea_Dust_09', display: 'Flea (Dust 09)' },
    { json: 'SavedFlea_Dust_12', display: 'Flea (Dust 12)' },
    { json: 'SavedFlea_Greymoor_06', display: 'Flea (Greymoor 06)' },
    { json: 'SavedFlea_Greymoor_15b', display: 'Flea (Greymoor 15b)' },
    { json: 'SavedFlea_Library_01', display: 'Flea (Library 01)' },
    { json: 'SavedFlea_Library_09', display: 'Flea (Library 09)' },
    { json: 'SavedFlea_Peak_05c', display: 'Flea (Peak 05c)' },
    { json: 'SavedFlea_Shadow_10', display: 'Flea (Shadow 10)' },
    { json: 'SavedFlea_Shadow_28', display: 'Flea (Shadow 28)' },
    { json: 'SavedFlea_Shellwood_03', display: 'Flea (Shellwood 03)' },
    { json: 'SavedFlea_Slab_06', display: 'Flea (Slab 06)' },
    { json: 'SavedFlea_Slab_Cell', display: 'Flea (Slab Cell)' },
    { json: 'SavedFlea_Song_11', display: 'Flea (Song 11)' },
    { json: 'SavedFlea_Song_14', display: 'Flea (Song 14)' },
    { json: 'SavedFlea_Under_21', display: 'Flea (Under 21)' },
    { json: 'SavedFlea_Under_23', display: 'Flea (Under 23)' },
    { json: 'CaravanLechReturnedToCaravan', display: 'Kratt' },
    { json: 'tamedGiantFlea', display: 'Huge Flea' },
    { json: 'MetTroupeHunterWild', display: 'Vog' },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAPS - direct playerData boolean flags
// ═══════════════════════════════════════════════════════════════════════════
export const MAPS_LIST = [
    { json: 'HasMossGrottoMap', display: 'Moss Grotto', icon: 'Shop_map_icon__0003_moss.png' },
    { json: 'HasBoneforestMap', display: 'The Marrow', icon: 'Shop_map_icon__0008_sinners.png' },
    { json: 'HasDocksMap', display: 'Deep Docks', icon: 'Shop_map_icon__0006_docks.png' },
    { json: 'HasWildsMap', display: 'Far Fields', icon: 'Shop_map_icon__0004_fields.png' },
    { json: 'HasGreymoorMap', display: 'Greymoor', icon: 'Shop_map_icon__0001_greymoor.png' },
    { json: 'HasBellhartMap', display: 'Bellhart', icon: 'Shop_map_icon__0007_bellhart.png' },
    { json: 'HasShellwoodMap', display: 'Shellwood', icon: 'Shop_map_icon__0002_shellwood.png' },
    { json: 'HasHuntersNestMap', display: "Hunter's March", icon: 'Shop_map_icon__0000_hunters_march.png' },
    { json: 'HasJudgeStepsMap', display: 'Blasted Steps', icon: 'Shop_map_icon__0005_steps.png' },
    { json: 'HasPeakMap', display: 'Mount Fay', icon: 'Shop_map_icon__0008_generic_peak.png' },
    { json: 'HasSlabMap', display: 'The Slab', icon: 'Shop_map_icon__0008_slab.png' },
    { json: 'HasSwampMap', display: 'Bilewater', icon: 'Shop_map_icon__0004_bilewater.png' },
    { json: 'HasAqueductMap', display: 'Putrified Ducts', icon: 'Shop_map_icon__0008_crawl.png' },
    { json: 'HasCoralMap', display: 'Sands of Karak', icon: 'Shop_map_icon__0008_coral_cave.png' },
    { json: 'HasWeavehomeMap', display: 'Weavernest Atla', icon: 'Shop_map_icon__weavehome.png' },
    { json: 'HasCrawlMap', display: 'Wormways', icon: 'Shop_map_icon__0008_crawl.png' },
    { json: 'HasDustpensMap', display: "Sinner's Road", icon: 'Shop_map_icon__0008_sinners.png' },
    { json: 'HasSongGateMap', display: 'Citadel - Grand Gate', icon: 'Shop_map_icon__0008_generic.png' },
    { json: 'HasCitadelUnderstoreMap', display: 'Citadel - Underworks', icon: 'Shop_map_icon_understore.png' },
    { json: 'HasCogMap', display: 'Citadel - Cogwork Core', icon: 'Shop_map_icon__0012_cog.png' },
    { json: 'HasArboriumMap', display: 'Citadel - Memorium', icon: 'Shop_map_icon__0012_arborium.png' },
    { json: 'HasWardMap', display: 'Citadel - Whiteward', icon: 'Shop_map_icon__0010_ward.png' },
    { json: 'HasLibraryMap', display: 'Citadel - Whispering Vault', icon: 'Shop_map_icon__0009_library.png' },
    { json: 'HasHallsMap', display: 'Citadel - Choral Chambers', icon: 'Shop_map_icon__0012_halls_new.png' },
    { json: 'HasHangMap', display: 'Citadel - High Halls', icon: 'Shop_map_icon__0011_conductor.png' },
    { json: 'HasCradleMap', display: 'The Cradle', icon: 'Shop_map_icon__0012_cradle.png' },
    { json: 'HasAbyssMap', display: 'The Abyss', icon: 'I_map_type_02.png' },
    { json: 'HasCloverMap', display: 'Verdania', icon: 'Shop_map_icon__0003_clover.png' },
];
