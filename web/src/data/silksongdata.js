/**
 * Silksong Save Data Schema Definitions
 * 
 * This file contains all the field definitions for parsing Silksong save data.
 * To add new fields, simply add entries to the appropriate list.
 */

export const GENERAL_FIELDS_LIST = [
    { json: 'version', display: 'Game Version' },
    { json: 'permadeathMode', display: 'Game Mode' },
    { json: 'completionPercentage', display: 'Completion' },
    { json: 'playTime', display: 'Play Time' },
    { json: 'maxHealth', display: 'Max Health' },
    { json: 'silkMax', display: 'Max Silk' },
    { json: 'silkRegenMax', display: 'Max Silk Hearts' },
    { json: 'nailUpgrades', display: 'Nail Upgrades' },
    { json: 'ToolKitUpgrades', display: 'Crafting Kit Tier' },
    { json: 'ToolPouchUpgrades', display: 'Tool Pouch Tier' },
];

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
    { json: 'Fractured Mask', display: 'Fractured Mask', category: 'Blue', icon: 'Hornet_T_fractured_mask.png' },
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

export const ABILITY_LIST = [
    { json: 'hasDash', display: 'Swift Step', icon: 'swiftstep.png' },
    { json: 'hasWalljump', display: 'Cling Grip', icon: 'clinggrip.png' },
    { json: 'hasNeedolin', display: 'Needolin', icon: 'needolin.png' },
    { json: 'hasHarpoonDash', display: 'Clawline', icon: 'clawline.png' },
    { json: 'hasChargeSlash', display: 'Needle Strike', icon: 'needlestrike.png' },
    { json: 'hasSuperJump', display: 'Silk Soar', icon: 'silksoar.png' },
];

export const OTHER_ABILITY_LIST = [
    { json: 'hasBrolly', display: 'Drifter\'s Cloak', icon: 'drifterscloak.png' },
    { json: 'hasDoubleJump', display: 'Faydown Cloak', icon: 'faydown_cloak.png' },
];

export const SKILLS_LIST = [
    { json: 'hasNeedleThrow', display: 'Silkspear', icon: 'Art_Rune__0002_silk_spear.png' },
    { json: 'hasParry', display: 'Cross Stitch', icon: 'Art_Rune__0014_cross_stitch.png' },
    { json: 'hasThreadSphere', display: 'Thread Storm', icon: 'Art_Rune__0008_silk_sphere.png' },
    { json: 'hasSilkCharge', display: 'Sharp Dart', icon: 'Art_Rune__0017_silk_dart.png' },
    { json: 'hasSilkBomb', display: 'Rune Rage', icon: 'Art_Rune__0005_silk_bomb.png' },
    { json: 'hasSilkBossNeedle', display: 'Pale Nails', icon: 'Art_Rune__0011_finger_blades.png' },
];

// ═══════════════════════════════════════════════════════════════════════════
// CRESTS - playerData.ToolEquips.savedData array
// Several internal save IDs collapse onto the same in-game crest (Hunter has
// three internal tiers). Cursed/Cloakless are event-driven special states,
// not part of the normal 7-crest roster, and are tracked separately.
// ═══════════════════════════════════════════════════════════════════════════
export const CRESTS_LIST = [
    {
        json: 'Hunter',
        aliases: ['Hunter', 'Hunter_v2', 'Hunter_v3'],
        display: 'Hunter',
        icon: 'Select_Game_Crest_Spools__0000_hunter.png',
        iconSteelSoul: 'Select_Game_Crest_Spools__0000_hunter_SS.png',
    },
    {
        json: 'Reaper',
        aliases: ['Reaper'],
        display: 'Reaper',
        icon: 'Select_Game_Crest_Spools__0004_reaper.png',
        iconSteelSoul: 'Select_Game_Crest_Spools__0004_reaper_SS.png',
    },
    {
        json: 'Wanderer',
        aliases: ['Wanderer'],
        display: 'Wanderer',
        icon: 'Select_Game_Crest_Spools__0008_wanderer.png',
        iconSteelSoul: 'Select_Game_Crest_Spools__0008_wanderer_SS.png',
    },
    {
        json: 'Warrior',
        aliases: ['Warrior'],
        display: 'Beast',
        icon: 'Select_Game_Crest_Spools__0007_warrior.png',
        iconSteelSoul: 'Select_Game_Crest_Spools__0007_warrior_SS.png',
    },
    {
        json: 'Witch',
        aliases: ['Witch'],
        display: 'Witch',
        icon: 'Select_Game_Crest_Spools__0009_witch.png',
        iconSteelSoul: 'Select_Game_Crest_Spools__0009_witch_SS.png',
    },
    {
        json: 'Toolmaster',
        aliases: ['Toolmaster'],
        display: 'Architect',
        icon: 'Select_Game_Crest_Spools__0006_architect.png',
        iconSteelSoul: 'Select_Game_Crest_Spools__0006_architect_SS.png',
    },
    {
        json: 'Spell',
        aliases: ['Spell'],
        display: 'Shaman',
        icon: 'Select_Game_Crest_Spools__0005_shaman.png',
        iconSteelSoul: 'Select_Game_Crest_Spools__0005_shaman_SS.png',
    },
];

// Event-driven special crest states (not part of the normal 7-crest roster)
export const SPECIAL_CREST_STATES_LIST = [
    {
        json: 'Cursed',
        aliases: ['Cursed'],
        display: 'Cursed',
        icon: 'Select_Game_Crest_Spools__0002_cursed.png',
        iconSteelSoul: 'Select_Game_Crest_Spools__0002_cursed_SS.png',
    },
    // Cloakless is also event-driven; ignored for now per project notes
    { json: 'Cloakless', aliases: ['Cloakless'], display: 'Cloakless', icon: null, iconSteelSoul: null },
];

// ═══════════════════════════════════════════════════════════════════════════
// MASK SHARDS - 20 total, 4 shards = 1 mask, base 5 masks, max 10
// flagType 'scene' reads sceneData.persistentBools (world pickups),
// 'bool' reads a playerData boolean (purchases), 'quest' reads
// playerData.QuestCompletionData (quest-reward shards)
// ═══════════════════════════════════════════════════════════════════════════
export const MASK_SHARD_SOURCES = [
    // World pickups (14) - scene ID kept in the name since a couple of area
    // attributions are unconfirmed (e.g. the "Coral_" prefix is shared by
    // both Sands of Karak and Blasted Steps) and two pairs otherwise read
    // as near-duplicates
    { name: 'The Marrow - Lava Gauntlet reward (Bone_East_20)', flagType: 'scene', sceneName: 'Bone_East_20', sceneId: 'Heart Piece' },
    { name: 'The Marrow - Lava Gauntlet arena (Bone_East_LavaChallenge)', flagType: 'scene', sceneName: 'Bone_East_LavaChallenge', sceneId: 'Heart Piece (1)' },
    { name: 'Sands of Karak / Blasted Steps (Coral_19b)', flagType: 'scene', sceneName: 'Coral_19b', sceneId: 'Heart Piece' },
    { name: 'Wormways (Crawl_02)', flagType: 'scene', sceneName: 'Crawl_02', sceneId: 'Heart Piece' },
    { name: 'Deep Docks (Dock_08)', flagType: 'scene', sceneName: 'Dock_08', sceneId: 'Heart Piece' },
    { name: 'Whispering Vaults (Library_05)', flagType: 'scene', sceneName: 'Library_05', sceneId: 'Heart Piece' },
    { name: 'Mount Fay - Western (Peak_04c)', flagType: 'scene', sceneName: 'Peak_04c', sceneId: 'Heart Piece' },
    { name: 'Mount Fay - Central (Peak_06)', flagType: 'scene', sceneName: 'Peak_06', sceneId: 'Heart Piece' },
    { name: 'Blasted Steps area (Shadow_13)', flagType: 'scene', sceneName: 'Shadow_13', sceneId: 'Heart Piece' },
    { name: 'Shellwood (Shellwood_14)', flagType: 'scene', sceneName: 'Shellwood_14', sceneId: 'Heart Piece' },
    { name: 'The Slab (Slab_17)', flagType: 'scene', sceneName: 'Slab_17', sceneId: 'Heart Piece' },
    { name: 'Choral Chambers (Song_09)', flagType: 'scene', sceneName: 'Song_09', sceneId: 'Heart Piece' },
    { name: 'Weavenest Atla (Weave_05b)', flagType: 'scene', sceneName: 'Weave_05b', sceneId: 'Heart Piece' },
    { name: 'Wisp Thicket (Wisp_07)', flagType: 'scene', sceneName: 'Wisp_07', sceneId: 'Heart Piece' },
    // Purchases (2)
    { name: 'Pebb (Bone Bottom, 300 Rosaries)', flagType: 'bool', flag: 'PurchasedBonebottomHeartPiece' },
    { name: 'Jubilana (Songclave, 750 Rosaries)', flagType: 'bool', flag: 'MerchantEnclaveShellFragment' },
    // Quest rewards (4)
    { name: 'Sprintmaster Race (Pilgrim\'s Rest)', flagType: 'quest', flag: 'Sprintmaster Race' },
    { name: 'Savage Beastfly (Far Fields)', flagType: 'quest', flag: 'Beastfly Hunt' },
    { name: 'Gurr the Outcast (The Marrow)', flagType: 'quest', flag: 'Ant Trapper' },
    { name: 'Destroy 12 Void Masses', flagType: 'quest', flag: 'Destroy Thread Cores' },
];

// ═══════════════════════════════════════════════════════════════════════════
// SPOOL FRAGMENTS - 18 total, 2 fragments = 1 spool point, base 9 silk, max 18
// ═══════════════════════════════════════════════════════════════════════════
export const SPOOL_FRAGMENT_SOURCES = [
    // World pickups (13)
    { name: 'Memorium (Arborium_09)', flagType: 'scene', sceneName: 'Arborium_09', sceneId: 'Silk Spool' },
    { name: 'Mosshome (Bone_11b)', flagType: 'scene', sceneName: 'Bone_11b', sceneId: 'Silk Spool' },
    { name: 'The Marrow (Bone_East_13)', flagType: 'scene', sceneName: 'Bone_East_13', sceneId: 'Silk Spool' },
    { name: 'Cogwork Core (Cog_07)', flagType: 'scene', sceneName: 'Cog_07', sceneId: 'Silk Spool' },
    { name: 'Deep Docks (Dock_03c)', flagType: 'scene', sceneName: 'Dock_03c', sceneId: 'Silk Spool' },
    { name: 'Greymoor (Greymoor_02)', flagType: 'scene', sceneName: 'Greymoor_02', sceneId: 'Silk Spool' },
    { name: 'High Halls (Hang_03_top)', flagType: 'scene', sceneName: 'Hang_03_top', sceneId: 'Silk Spool' },
    { name: 'Whispering Vaults (Library_11b)', flagType: 'scene', sceneName: 'Library_11b', sceneId: 'Silk Spool' },
    { name: 'Mount Fay (Peak_01)', flagType: 'scene', sceneName: 'Peak_01', sceneId: 'Silk Spool' },
    { name: 'Grand Gate (Song_19_entrance)', flagType: 'scene', sceneName: 'Song_19_entrance', sceneId: 'Silk Spool' },
    { name: 'Underworks (Under_10)', flagType: 'scene', sceneName: 'Under_10', sceneId: 'Silk Spool' },
    { name: 'Whiteward (Ward_01)', flagType: 'scene', sceneName: 'Ward_01', sceneId: 'Silk Spool' },
    { name: 'Weavenest Atla (Weave_11)', flagType: 'scene', sceneName: 'Weave_11', sceneId: 'Silk Spool' },
    // Purchases (3)
    { name: 'Jubilana (Songclave, 500 Rosaries)', flagType: 'bool', flag: 'MerchantEnclaveSpoolPiece' },
    { name: 'Frey (Bellhart, 270 Rosaries)', flagType: 'bool', flag: 'PurchasedBelltownSpoolSegment' },
    { name: 'Grindle (Blasted Steps, 680 Rosaries)', flagType: 'bool', flag: 'purchasedGrindleSpoolPiece' },
    // Quest rewards (2)
    // pilgrimQuestSpoolCollected correlates with Sherma's multi-stage healing
    // questline (shermaQuestActive/shermaHealerActive/shermaWoundedPilgrim) -
    // matches the wiki's "Balm for the Wounded" reward at Whiteward
    { name: "Sherma's Healing - Balm for the Wounded (Whiteward)", flagType: 'bool', flag: 'pilgrimQuestSpoolCollected' },
    // tookGreymoor17Spool correlates 1:1 with completedGreymoor17Battle (both
    // False in every sample save) - an arena/gauntlet challenge at Greymoor_17
    { name: 'Greymoor Battle Challenge (Greymoor_17)', flagType: 'bool', flag: 'tookGreymoor17Spool' },
];

// ═══════════════════════════════════════════════════════════════════════════
// SILK HEARTS - 3 total, each defeating a specific boss (silkRegenMax 0-3)
// Note: CollectedHeartClover/Coral/Flower/Hunter are unrelated boss/lore flags
// ═══════════════════════════════════════════════════════════════════════════
export const SILK_HEART_SOURCES = [
    { name: 'Bell Beast (The Marrow)', flagType: 'bool', flag: 'defeatedBellBeast' },
    { name: 'The Unravelled (Whiteward)', flagType: 'bool', flag: 'wardBossDefeated' },
    { name: 'Lace, 2nd encounter (The Cradle)', flagType: 'bool', flag: 'defeatedLaceTower' },
];

// ═══════════════════════════════════════════════════════════════════════════
// TOOL POUCH - 4 upgrades total (ToolPouchUpgrades, 0-4)
// ═══════════════════════════════════════════════════════════════════════════
export const TOOL_POUCH_SOURCES = [
    { name: 'Mort (Pilgrim\'s Rest, 220 Rosaries)', flagType: 'bool', flag: 'PurchasedPilgrimsRestToolPouch' },
    { name: 'Loddie (The Marrow) - not yet confirmed', flagType: 'unknown', flag: null },
    { name: 'Nuu, Journal quest (Halfway Home)', flagType: 'quest', flag: 'Journal' },
    { name: 'Fleamaster Mooshka (Fleatopia)', flagType: 'flea', flag: 'FleasCollectedTargetOrder' },
];

// ═══════════════════════════════════════════════════════════════════════════
// CRAFTING KIT - 4 upgrades total (ToolKitUpgrades, 0-4)
// ═══════════════════════════════════════════════════════════════════════════
export const CRAFTING_KIT_SOURCES = [
    { name: 'Forge Daughter (Deep Docks, 180 Rosaries)', flagType: 'bool', flag: 'PurchasedForgeToolKit' },
    { name: 'Creige, Crow Feathers quest (Halfway Home)', flagType: 'quest', flag: 'Crow Feathers' },
    { name: 'Twelfth Architect (Underworks, 450 Rosaries)', flagType: 'bool', flag: 'PurchasedArchitectToolKit' },
    { name: 'Grindle (Blasted Steps, 700 Rosaries)', flagType: 'bool', flag: 'purchasedGrindleToolKit' },
];

// ═══════════════════════════════════════════════════════════════════════════
// OTHER UNLOCKABLES - one-off 1%-completion items that don't fit the other
// categories
// ═══════════════════════════════════════════════════════════════════════════
export const OTHER_UNLOCKABLE_SOURCES = [
    { name: 'Everbloom (Complete the Red Memory)', flagType: 'bool', flag: 'CompletedRedMemory' },
    { name: 'Sylphsong (Eva\'s Heal - 12 Memory Lockets + all Crests)', flagType: 'bool', flag: 'HasSeenEvaHeal' },
];

// ═══════════════════════════════════════════════════════════════════════════
// CRAFTMETAL - 8 total, used to buy Crafting Kit upgrades
// 7 sources confirmed via save + wiki cross-reference; 8th not yet located
// ═══════════════════════════════════════════════════════════════════════════
export const CRAFTMETAL_SOURCES = [
    { name: 'Pebb (Bone Bottom, 60 Rosaries)', flagType: 'bool', flag: 'PurchasedBonebottomToolMetal' },
    { name: 'Jubilana (Songclave, 180 Rosaries)', flagType: 'bool', flag: 'MerchantEnclaveToolMetal' },
    { name: 'The Marrow (Bone_07)', flagType: 'scene', sceneName: 'Bone_07', sceneId: 'Collectable Item Pickup - Tool Metal' },
    { name: 'Blasted Steps (Coral_32)', flagType: 'scene', sceneName: 'Coral_32', sceneId: 'Collectable Item Pickup - Tool Metal' },
    { name: 'Wisp Thicket (Wisp_05)', flagType: 'scene', sceneName: 'Wisp_05', sceneId: 'Collectable Item Pickup - Tool Metal' },
    { name: 'Putrified Ducts (Aqueduct_05)', flagType: 'scene', sceneName: 'Aqueduct_05', sceneId: 'Collectable Item Pickup - Tool Metal' },
    { name: 'Deep Docks / Far Fields (Under_19b)', flagType: 'scene', sceneName: 'Under_19b', sceneId: 'Collectable Item Pickup - Tool Metal' },
    { name: '8th location - not yet confirmed', flagType: 'unknown', flag: null },
];

// ═══════════════════════════════════════════════════════════════════════════
// MEMORY LOCKET - 20 total, used to expand Crest tool slots
// Location names are from the wiki; only one candidate save flag has been
// found so far, so all 20 are marked pending until confirmed
// ═══════════════════════════════════════════════════════════════════════════
export const MEMORY_LOCKET_SOURCES = [
    { name: 'Bone Bottom - Volatile Flintbeetles wish reward', flagType: 'unknown', flag: null },
    { name: 'The Marrow - arena battle', flagType: 'unknown', flag: null },
    { name: 'Wormways - after Gromling', flagType: 'unknown', flag: null },
    { name: 'Deep Docks - secret passage', flagType: 'unknown', flag: null },
    { name: "Far Fields - Mort purchase (Pilgrim's Rest, 150 Rosaries)", flagType: 'unknown', flag: null },
    { name: 'Far Fields - east of Skarrsinger Karmelita arena', flagType: 'unknown', flag: null },
    { name: "Hunter's March - dead pilgrim", flagType: 'unknown', flag: null },
    { name: 'Greymoor - near Creige (Faydown Cloak)', flagType: 'unknown', flag: null },
    { name: 'Greymoor - backpack ledge', flagType: 'unknown', flag: null },
    { name: 'Bellhart - Frey purchase (330 Rosaries, after Threadspun Town)', flagType: 'unknown', flag: null },
    { name: 'Bellhart - Bellhome summit (Silk Soar)', flagType: 'unknown', flag: null },
    { name: 'Blasted Steps - east of Shakra', flagType: 'unknown', flag: null },
    { name: 'Underworks - west of Confession Booth bench', flagType: 'unknown', flag: null },
    { name: 'Bilewater - after Muckmaggot path', flagType: 'unknown', flag: null },
    { name: 'Bilewater - destroyed ceiling cocoon', flagType: 'unknown', flag: null },
    { name: 'Whispering Vaults - near Giant Drapemite', flagType: 'unknown', flag: null },
    { name: 'Choral Chambers - behind trapdoor breakable wall', flagType: 'unknown', flag: null },
    { name: 'Memorium - from Ventrica Station', flagType: 'unknown', flag: null },
    { name: 'The Slab - Shortcut Cave', flagType: 'unknown', flag: null },
    { name: 'Sands of Karak - upper western platform', flagType: 'unknown', flag: null },
];

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
