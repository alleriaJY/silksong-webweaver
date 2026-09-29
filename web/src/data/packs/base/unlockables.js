/**
 * Source checklists: where each upgrade piece comes from.
 * flagType: bool (playerData boolean), quest (QuestCompletionData IsCompleted),
 * scene (sceneData.persistentBools SceneName/ID), flea (FleasCollectedTargetOrder
 * heuristic), unknown (flag not identified yet; rendered as Pending).
 * Entry: { id, name, flagType, flag? | sceneName+sceneId, icon }
 */

// 20 shards, 4 = 1 mask; base 5 masks, max 10
export const MASK_SHARD_SOURCES = [
    { id: 'bone-east-20-heart-piece', name: 'The Marrow - Lava Gauntlet reward (Bone_East_20)', flagType: 'scene', sceneName: 'Bone_East_20', sceneId: 'Heart Piece', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'bone-east-lava-challenge-heart-piece-1', name: 'The Marrow - Lava Gauntlet arena (Bone_East_LavaChallenge)', flagType: 'scene', sceneName: 'Bone_East_LavaChallenge', sceneId: 'Heart Piece (1)', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'coral-19b-heart-piece', name: 'Sands of Karak / Blasted Steps (Coral_19b)', flagType: 'scene', sceneName: 'Coral_19b', sceneId: 'Heart Piece', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'crawl-02-heart-piece', name: 'Wormways (Crawl_02)', flagType: 'scene', sceneName: 'Crawl_02', sceneId: 'Heart Piece', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'dock-08-heart-piece', name: 'Deep Docks (Dock_08)', flagType: 'scene', sceneName: 'Dock_08', sceneId: 'Heart Piece', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'library-05-heart-piece', name: 'Whispering Vaults (Library_05)', flagType: 'scene', sceneName: 'Library_05', sceneId: 'Heart Piece', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'peak-04c-heart-piece', name: 'Mount Fay - Western (Peak_04c)', flagType: 'scene', sceneName: 'Peak_04c', sceneId: 'Heart Piece', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'peak-06-heart-piece', name: 'Mount Fay - Central (Peak_06)', flagType: 'scene', sceneName: 'Peak_06', sceneId: 'Heart Piece', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'shadow-13-heart-piece', name: 'Blasted Steps area (Shadow_13)', flagType: 'scene', sceneName: 'Shadow_13', sceneId: 'Heart Piece', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'shellwood-14-heart-piece', name: 'Shellwood (Shellwood_14)', flagType: 'scene', sceneName: 'Shellwood_14', sceneId: 'Heart Piece', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'slab-17-heart-piece', name: 'The Slab (Slab_17)', flagType: 'scene', sceneName: 'Slab_17', sceneId: 'Heart Piece', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'song-09-heart-piece', name: 'Choral Chambers (Song_09)', flagType: 'scene', sceneName: 'Song_09', sceneId: 'Heart Piece', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'weave-05b-heart-piece', name: 'Weavenest Atla (Weave_05b)', flagType: 'scene', sceneName: 'Weave_05b', sceneId: 'Heart Piece', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'wisp-07-heart-piece', name: 'Wisp Thicket (Wisp_07)', flagType: 'scene', sceneName: 'Wisp_07', sceneId: 'Heart Piece', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'purchased-bonebottom-heart-piece', name: 'Pebb (Bone Bottom, 300 Rosaries)', flagType: 'bool', flag: 'PurchasedBonebottomHeartPiece', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'merchant-enclave-shell-fragment', name: 'Jubilana (Songclave, 750 Rosaries)', flagType: 'bool', flag: 'MerchantEnclaveShellFragment', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'sprintmaster-race', name: "Sprintmaster Race (Pilgrim's Rest)", flagType: 'quest', flag: 'Sprintmaster Race', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'beastfly-hunt', name: 'Savage Beastfly (Far Fields)', flagType: 'quest', flag: 'Beastfly Hunt', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'ant-trapper', name: 'Gurr the Outcast (The Marrow)', flagType: 'quest', flag: 'Ant Trapper', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'destroy-thread-cores', name: 'Destroy 12 Void Masses', flagType: 'quest', flag: 'Destroy Thread Cores', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
];

// 18 fragments, 2 = 1 spool point; base 9 silk, max 18.
// KNOWN BUG (OPUS D17): the Sherma and Greymoor_17 quest flags are wrong.
export const SPOOL_FRAGMENT_SOURCES = [
    { id: 'arborium-09-silk-spool', name: 'Memorium (Arborium_09)', flagType: 'scene', sceneName: 'Arborium_09', sceneId: 'Silk Spool', icon: 'spool_upgrade_pickup.png' },
    { id: 'bone-11b-silk-spool', name: 'Mosshome (Bone_11b)', flagType: 'scene', sceneName: 'Bone_11b', sceneId: 'Silk Spool', icon: 'spool_upgrade_pickup.png' },
    { id: 'bone-east-13-silk-spool', name: 'The Marrow (Bone_East_13)', flagType: 'scene', sceneName: 'Bone_East_13', sceneId: 'Silk Spool', icon: 'spool_upgrade_pickup.png' },
    { id: 'cog-07-silk-spool', name: 'Cogwork Core (Cog_07)', flagType: 'scene', sceneName: 'Cog_07', sceneId: 'Silk Spool', icon: 'spool_upgrade_pickup.png' },
    { id: 'dock-03c-silk-spool', name: 'Deep Docks (Dock_03c)', flagType: 'scene', sceneName: 'Dock_03c', sceneId: 'Silk Spool', icon: 'spool_upgrade_pickup.png' },
    { id: 'greymoor-02-silk-spool', name: 'Greymoor (Greymoor_02)', flagType: 'scene', sceneName: 'Greymoor_02', sceneId: 'Silk Spool', icon: 'spool_upgrade_pickup.png' },
    { id: 'hang-03-top-silk-spool', name: 'High Halls (Hang_03_top)', flagType: 'scene', sceneName: 'Hang_03_top', sceneId: 'Silk Spool', icon: 'spool_upgrade_pickup.png' },
    { id: 'library-11b-silk-spool', name: 'Whispering Vaults (Library_11b)', flagType: 'scene', sceneName: 'Library_11b', sceneId: 'Silk Spool', icon: 'spool_upgrade_pickup.png' },
    { id: 'peak-01-silk-spool', name: 'Mount Fay (Peak_01)', flagType: 'scene', sceneName: 'Peak_01', sceneId: 'Silk Spool', icon: 'spool_upgrade_pickup.png' },
    { id: 'song-19-entrance-silk-spool', name: 'Grand Gate (Song_19_entrance)', flagType: 'scene', sceneName: 'Song_19_entrance', sceneId: 'Silk Spool', icon: 'spool_upgrade_pickup.png' },
    { id: 'under-10-silk-spool', name: 'Underworks (Under_10)', flagType: 'scene', sceneName: 'Under_10', sceneId: 'Silk Spool', icon: 'spool_upgrade_pickup.png' },
    { id: 'ward-01-silk-spool', name: 'Whiteward (Ward_01)', flagType: 'scene', sceneName: 'Ward_01', sceneId: 'Silk Spool', icon: 'spool_upgrade_pickup.png' },
    { id: 'weave-11-silk-spool', name: 'Weavenest Atla (Weave_11)', flagType: 'scene', sceneName: 'Weave_11', sceneId: 'Silk Spool', icon: 'spool_upgrade_pickup.png' },
    { id: 'merchant-enclave-spool-piece', name: 'Jubilana (Songclave, 500 Rosaries)', flagType: 'bool', flag: 'MerchantEnclaveSpoolPiece', icon: 'spool_upgrade_pickup.png' },
    { id: 'purchased-belltown-spool-segment', name: 'Frey (Bellhart, 270 Rosaries)', flagType: 'bool', flag: 'PurchasedBelltownSpoolSegment', icon: 'spool_upgrade_pickup.png' },
    { id: 'purchased-grindle-spool-piece', name: 'Grindle (Blasted Steps, 680 Rosaries)', flagType: 'bool', flag: 'purchasedGrindleSpoolPiece', icon: 'spool_upgrade_pickup.png' },
    { id: 'pilgrim-quest-spool-collected', name: "Sherma's Healing - Balm for the Wounded (Whiteward)", flagType: 'bool', flag: 'pilgrimQuestSpoolCollected', icon: 'spool_upgrade_pickup.png' },
    { id: 'took-greymoor17-spool', name: 'Greymoor Battle Challenge (Greymoor_17)', flagType: 'bool', flag: 'tookGreymoor17Spool', icon: 'spool_upgrade_pickup.png' },
];

// 3 silk hearts (silkRegenMax 0-3), one per boss
export const SILK_HEART_SOURCES = [
    { id: 'defeated-bell-beast', name: 'Bell Beast (The Marrow)', flagType: 'bool', flag: 'defeatedBellBeast', icon: 'general_silkheart.png' },
    { id: 'ward-boss-defeated', name: 'The Unravelled (Whiteward)', flagType: 'bool', flag: 'wardBossDefeated', icon: 'general_silkheart.png' },
    { id: 'defeated-lace-tower', name: 'Lace, 2nd encounter (The Cradle)', flagType: 'bool', flag: 'defeatedLaceTower', icon: 'general_silkheart.png' },
];

// 4 upgrades (ToolPouchUpgrades 0-4)
export const TOOL_POUCH_SOURCES = [
    { id: 'purchased-pilgrims-rest-tool-pouch', name: "Mort (Pilgrim's Rest, 220 Rosaries)", flagType: 'bool', flag: 'PurchasedPilgrimsRestToolPouch', icon: 'icon_tool_kit_upgrade.png' },
    { id: 'loddie-the-marrow', name: 'Loddie (The Marrow) - not yet confirmed', flagType: 'unknown', flag: null, icon: 'icon_tool_kit_upgrade.png' },
    { id: 'journal', name: 'Nuu, Journal quest (Halfway Home)', flagType: 'quest', flag: 'Journal', icon: 'icon_tool_kit_upgrade.png' },
    { id: 'fleas-collected-target-order', name: 'Fleamaster Mooshka (Fleatopia)', flagType: 'flea', flag: 'FleasCollectedTargetOrder', icon: 'icon_tool_kit_upgrade.png' },
];

// 4 upgrades (ToolKitUpgrades 0-4)
export const CRAFTING_KIT_SOURCES = [
    { id: 'purchased-forge-tool-kit', name: 'Forge Daughter (Deep Docks, 180 Rosaries)', flagType: 'bool', flag: 'PurchasedForgeToolKit', icon: 'Hornet_Tool_Metal_Pouch.png' },
    { id: 'crow-feathers', name: 'Creige, Crow Feathers quest (Halfway Home)', flagType: 'quest', flag: 'Crow Feathers', icon: 'Hornet_Tool_Metal_Pouch.png' },
    { id: 'purchased-architect-tool-kit', name: 'Twelfth Architect (Underworks, 450 Rosaries)', flagType: 'bool', flag: 'PurchasedArchitectToolKit', icon: 'Hornet_Tool_Metal_Pouch.png' },
    { id: 'purchased-grindle-tool-kit', name: 'Grindle (Blasted Steps, 700 Rosaries)', flagType: 'bool', flag: 'purchasedGrindleToolKit', icon: 'Hornet_Tool_Metal_Pouch.png' },
];

// One-off 1% items
export const OTHER_UNLOCKABLE_SOURCES = [
    { id: 'completed-red-memory', name: 'Everbloom (Complete the Red Memory)', flagType: 'bool', flag: 'CompletedRedMemory', icon: 'I_white_flower.png' },
    { id: 'has-seen-eva-heal', name: "Sylphsong (Eva's Heal - 12 Memory Lockets + all Crests)", flagType: 'bool', flag: 'HasSeenEvaHeal', icon: 'Eva_heal_prompt.png' },
];

// Needle tier by playerData.nailUpgrades (0-4). Icons live in general/nail.
export const NEEDLE_TIERS = [
    { id: 'needle', name: 'Needle', level: 1, icon: 'Inv_0033_inv_nail_01.png' },
    { id: 'sharpened-needle', name: 'Sharpened Needle', level: 2, icon: 'Inv_0033_inv_nail_02.png' },
    { id: 'shining-needle', name: 'Shining Needle', level: 3, icon: 'Inv_0033_inv_nail_03.png' },
    { id: 'hivesteel-needle', name: 'Hivesteel Needle', level: 4, icon: 'Inv_0033_inv_nail_04.png' },
    { id: 'pale-steel-needle', name: 'Pale Steel Needle', level: 5, icon: 'Inv_0033_inv_nail_05.png' },
];
