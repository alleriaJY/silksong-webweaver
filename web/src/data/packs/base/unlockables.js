/**
 * Source checklists: where each upgrade piece comes from.
 * flagType: bool (playerData boolean), atLeast (playerData number >= min),
 * quest (QuestCompletionData IsCompleted), scene (sceneData.persistentBools
 * SceneName/ID; sceneId may be a list, any match counts), unknown (flag not
 * identified yet; rendered as Pending).
 * Entry: { id, name, flagType, flag?(+min) | sceneName+sceneId, icon };
 * bool flag may be a list (any counts).
 *
 * Sources marked "(ref)" were mapped with the silksong-completionist tracker
 * (github.com/Br3zzly/silksong-completionist, MIT) and checked against the
 * fixture saves: each is set in the saves whose upgrade counts require it.
 */

// 20 shards, 4 = 1 mask; base 5 masks, max 10
export const MASK_SHARD_SOURCES = [
    { id: 'bone-east-20-heart-piece', name: "Far Fields - hidden area left of the Seamstress' home", flagType: 'scene', sceneName: 'Bone_East_20', sceneId: 'Heart Piece', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'bone-east-lava-challenge-heart-piece-1', name: 'Far Fields - top of the Skull Cavern', flagType: 'scene', sceneName: 'Bone_East_LavaChallenge', sceneId: 'Heart Piece (1)', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'coral-19b-heart-piece', name: 'Blasted Steps - top of an area at the map edge', flagType: 'scene', sceneName: 'Coral_19b', sceneId: 'Heart Piece', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'crawl-02-heart-piece', name: "Wormways - behind a breakable wall at the water's edge", flagType: 'scene', sceneName: 'Crawl_02', sceneId: 'Heart Piece', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'dock-08-heart-piece', name: 'Deep Docks - near the entrance from The Marrow', flagType: 'scene', sceneName: 'Dock_08', sceneId: 'Heart Piece', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'library-05-heart-piece', name: 'Whispering Vaults', flagType: 'scene', sceneName: 'Library_05', sceneId: 'Heart Piece', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'peak-04c-heart-piece', name: 'Mount Fay - inside a hollow cylinder, left of the lowest bench', flagType: 'scene', sceneName: 'Peak_04c', sceneId: 'Heart Piece', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'peak-06-heart-piece', name: 'Mount Fay - very top of Brightvein', flagType: 'scene', sceneName: 'Peak_06', sceneId: 'Heart Piece', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'shadow-13-heart-piece', name: 'Bilewater - end of the long corridors of infested water', flagType: 'scene', sceneName: 'Shadow_13', sceneId: 'Heart Piece', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'shellwood-14-heart-piece', name: 'Shellwood - platforming room behind a breakable wall', flagType: 'scene', sceneName: 'Shellwood_14', sceneId: 'Heart Piece', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'slab-17-heart-piece', name: 'The Slab - platforming room behind a locked door (Key of Apostate)', flagType: 'scene', sceneName: 'Slab_17', sceneId: 'Heart Piece', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'song-09-heart-piece', name: 'Cogwork Core - top of the left-most tunnel, after an arena battle', flagType: 'scene', sceneName: 'Song_09', sceneId: 'Heart Piece', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'weave-05b-heart-piece', name: 'Weavenest Atla - behind a breakable wall', flagType: 'scene', sceneName: 'Weave_05b', sceneId: 'Heart Piece', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'wisp-07-heart-piece', name: 'Wisp Thicket - platforming challenge on the far right', flagType: 'scene', sceneName: 'Wisp_07', sceneId: 'Heart Piece', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'purchased-bonebottom-heart-piece', name: 'Pebb (Bone Bottom, 300 Rosaries)', flagType: 'bool', flag: 'PurchasedBonebottomHeartPiece', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'merchant-enclave-shell-fragment', name: 'Jubilana (Songclave, 750 Rosaries)', flagType: 'bool', flag: 'MerchantEnclaveShellFragment', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'sprintmaster-race', name: '"Fastest in Pharloom" wish (Sprintmaster Swift, Far Fields)', flagType: 'quest', flag: 'Sprintmaster Race', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'beastfly-hunt', name: '"Savage Beastfly" wish (Bellhart)', flagType: 'quest', flag: 'Beastfly Hunt', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'ant-trapper', name: '"The Hidden Hunter" wish (Bellhart)', flagType: 'quest', flag: 'Ant Trapper', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
    { id: 'destroy-thread-cores', name: '"Dark Hearts" wish - destroy 12 Void Masses (Bellhart)', flagType: 'quest', flag: 'Destroy Thread Cores', icon: 'Inv_0030_inv_health_backboard_mask_2.png' },
];

// 18 fragments, 2 = 1 spool point; base 9 silk, max 18.
// The two reward fragments: Sherma's wish (quest 'Save Sherma') and the
// Fleamaster's reward once the caravan moves on to Greymoor
// (CaravanTroupeLocation >= 2, ref). The 72% save has 12 fragments
// (silkMax 15) with 10 world/shop sources, so both rewards were earned there;
// both flags are set in both late saves and unset in every zero-fragment save.
// (The earlier guess, silkFarmBattle1_complete, matches the same saves but has
// no source naming it as a spool reward.)
export const SPOOL_FRAGMENT_SOURCES = [
    { id: 'arborium-09-silk-spool', name: 'Memorium - bottom left', flagType: 'scene', sceneName: 'Arborium_09', sceneId: 'Silk Spool', icon: 'spool_upgrade_pickup.png' },
    { id: 'bone-11b-silk-spool', name: 'Bone Bottom - above the settlement', flagType: 'scene', sceneName: 'Bone_11b', sceneId: 'Silk Spool', icon: 'spool_upgrade_pickup.png' },
    { id: 'bone-east-13-silk-spool', name: 'Deep Docks - end of a long room', flagType: 'scene', sceneName: 'Bone_East_13', sceneId: 'Silk Spool', icon: 'spool_upgrade_pickup.png' },
    { id: 'cog-07-silk-spool', name: 'Cogwork Core - bottom right', flagType: 'scene', sceneName: 'Cog_07', sceneId: 'Silk Spool', icon: 'spool_upgrade_pickup.png' },
    { id: 'dock-03c-silk-spool', name: 'Deep Docks - bottom right', flagType: 'scene', sceneName: 'Dock_03c', sceneId: 'Silk Spool', icon: 'spool_upgrade_pickup.png' },
    { id: 'greymoor-02-silk-spool', name: 'Greymoor - up and right of the Bellshrine', flagType: 'scene', sceneName: 'Greymoor_02', sceneId: 'Silk Spool', icon: 'spool_upgrade_pickup.png' },
    { id: 'hang-03-top-silk-spool', name: 'High Halls - very top', flagType: 'scene', sceneName: 'Hang_03_top', sceneId: 'Silk Spool', icon: 'spool_upgrade_pickup.png' },
    { id: 'library-11b-silk-spool', name: 'Underworks - hidden area near the bottom right', flagType: 'scene', sceneName: 'Library_11b', sceneId: 'Silk Spool', icon: 'spool_upgrade_pickup.png' },
    { id: 'peak-01-silk-spool', name: 'The Slab - top of a frosty section on the left', flagType: 'scene', sceneName: 'Peak_01', sceneId: 'Silk Spool', icon: 'spool_upgrade_pickup.png' },
    { id: 'song-19-entrance-silk-spool', name: 'Grand Gate - very top', flagType: 'scene', sceneName: 'Song_19_entrance', sceneId: 'Silk Spool', icon: 'spool_upgrade_pickup.png' },
    { id: 'under-10-silk-spool', name: 'Underworks - behind an arena battle', flagType: 'scene', sceneName: 'Under_10', sceneId: 'Silk Spool', icon: 'spool_upgrade_pickup.png' },
    { id: 'ward-01-silk-spool', name: 'Whiteward - bottom of the elevator shaft (call the lift up first)', flagType: 'scene', sceneName: 'Ward_01', sceneId: 'Silk Spool', icon: 'spool_upgrade_pickup.png' },
    { id: 'weave-11-silk-spool', name: 'Weavenest Atla - behind a breakable wall', flagType: 'scene', sceneName: 'Weave_11', sceneId: 'Silk Spool', icon: 'spool_upgrade_pickup.png' },
    { id: 'merchant-enclave-spool-piece', name: 'Jubilana (Songclave, 500 Rosaries, after "The Lost Merchant")', flagType: 'bool', flag: 'MerchantEnclaveSpoolPiece', icon: 'spool_upgrade_pickup.png' },
    { id: 'purchased-belltown-spool-segment', name: 'Frey (Bellhart, 270 Rosaries, after "My Missing Courier")', flagType: 'bool', flag: 'PurchasedBelltownSpoolSegment', icon: 'spool_upgrade_pickup.png' },
    { id: 'purchased-grindle-spool-piece', name: 'Grindle (Blasted Steps, 680 Rosaries)', flagType: 'bool', flag: 'purchasedGrindleSpoolPiece', icon: 'spool_upgrade_pickup.png' },
    { id: 'pilgrim-quest-spool-collected', name: '"Balm for the Wounded" wish (Sherma, Songclave)', flagType: 'quest', flag: 'Save Sherma', icon: 'spool_upgrade_pickup.png' },
    { id: 'fleamaster-greymoor-spool', name: 'Fleamaster Mooshka - reward for 14 Lost Fleas (Greymoor)', flagType: 'atLeast', flag: 'CaravanTroupeLocation', min: 2, icon: 'spool_upgrade_pickup.png' },
];

// 3 silk hearts (silkRegenMax 0-3), one per boss
export const SILK_HEART_SOURCES = [
    { id: 'defeated-bell-beast', name: 'Bell Beast (The Marrow)', flagType: 'bool', flag: 'defeatedBellBeast', icon: 'general_silkheart.png' },
    { id: 'ward-boss-defeated', name: 'The Unravelled (Whiteward)', flagType: 'bool', flag: 'wardBossDefeated', icon: 'general_silkheart.png' },
    { id: 'defeated-lace-tower', name: 'Lace, 2nd encounter (The Cradle)', flagType: 'bool', flag: 'defeatedLaceTower', icon: 'general_silkheart.png' },
];

// 4 upgrades (ToolPouchUpgrades 0-4). The 72% save has all four, so each
// source's flag must be set there; every save's collected count equals
// ToolPouchUpgrades (fixtures.test.js).
// Loddie: pinGalleriesCompleted counts his finished pin challenges (0 early,
// 1 in the 72% save, 2 in the 100% save); the first one gives the pouch (ref).
// Fleamaster: the caravan leader moves to Fleatopia once 20 fleas are saved,
// which is when the pouch is given (ref). This replaces the old
// FleasCollectedTargetOrder heuristic, a key newer game versions no longer write.
export const TOOL_POUCH_SOURCES = [
    { id: 'purchased-pilgrims-rest-tool-pouch', name: "Mort (Pilgrim's Rest, 220 Rosaries)", flagType: 'bool', flag: 'PurchasedPilgrimsRestToolPouch', icon: 'icon_tool_kit_upgrade.png' },
    { id: 'loddie-the-marrow', name: "Loddie's first pin challenge (The Marrow)", flagType: 'atLeast', flag: 'pinGalleriesCompleted', min: 1, icon: 'icon_tool_kit_upgrade.png' },
    { id: 'journal', name: 'Nuu, "Bugs of Pharloom" wish (Halfway Home)', flagType: 'quest', flag: 'Journal', icon: 'icon_tool_kit_upgrade.png' },
    { id: 'fleamaster-fleatopia', name: 'Fleamaster Mooshka - reward for 20 Lost Fleas (Fleatopia)', flagType: 'scene', sceneName: 'Aqueduct_05', sceneId: 'Caravan Troupe Leader Fleatopia NPC', icon: 'icon_tool_kit_upgrade.png' },
];

// 4 upgrades (ToolKitUpgrades 0-4)
export const CRAFTING_KIT_SOURCES = [
    { id: 'purchased-forge-tool-kit', name: 'Forge Daughter (Deep Docks, 180 Rosaries)', flagType: 'bool', flag: 'PurchasedForgeToolKit', icon: 'Hornet_Tool_Metal_Pouch.png' },
    { id: 'crow-feathers', name: '"Crawbug Clearing" wish (Bellhart)', flagType: 'quest', flag: 'Crow Feathers', icon: 'Hornet_Tool_Metal_Pouch.png' },
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
