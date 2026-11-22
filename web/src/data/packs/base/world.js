/**
 * World-progression checklists: Bellhome furnishings & devices, Endings,
 * World Milestones (Bellshrines & Threefold Melody), Arena Battles,
 * Unique Spawns (Rhinogrunds, Covetous Pilgrims, Shardillards), and Void Masses.
 */

export const BELLHOME_SOURCES = [
    { id: 'bellhome-desk', name: 'Desk (Frey, 380 Rosaries)', flagType: 'bool', flag: 'BelltownFurnishingDesk' },
    { id: 'bellhome-gleamlights', name: 'Gleamlights (Frey, 320 Rosaries)', flagType: 'bool', flag: 'BelltownFurnishingFairyLights' },
    { id: 'bellhome-lacquer', name: 'Bell Lacquer (Frey, 520 Rosaries)', flagType: 'bool', flag: 'BelltownHousePaintComplete' },
    { id: 'bellhome-spa', name: 'Personal Spa (Frey, 1100 Rosaries)', flagType: 'bool', flag: 'BelltownFurnishingSpa' },
    { id: 'bellhome-gramophone', name: 'Gramophone (Frey, 490 Rosaries)', flagType: 'bool', flag: 'BelltownFurnishingGramaphone' },
    { id: 'bellhome-materium', name: 'Materium (device installed)', flagType: 'bool', flag: 'ConstructedMaterium' },
    { id: 'bellhome-crawbell', name: 'Crawbell (device installed)', flagType: 'bool', flag: 'CrawbellInstalled' },
    { id: 'bellhome-farsight', name: 'Farsight (device installed)', flagType: 'bool', flag: 'ConstructedFarsight' },
];

export const ENDING_SOURCES = [
    { id: 'ending-weaver-queen', name: 'Ending A: Weaver Queen (Act 2 Regular)', flagType: 'bit', flag: 'CompletedEndings', bit: 1 },
    { id: 'ending-twisted-child', name: 'Ending D: Twisted Child (Act 2 Cursed)', flagType: 'bit', flag: 'CompletedEndings', bit: 2 },
    { id: 'ending-snared-silk', name: 'Ending C: Snared Silk (Act 2 Soul Snare)', flagType: 'bit', flag: 'CompletedEndings', bit: 4 },
    { id: 'ending-sister-of-the-void', name: 'Ending E: Sister of the Void (Act 3)', flagType: 'bit', flag: 'CompletedEndings', bit: 8 },
];

export const WORLD_MILESTONE_SOURCES = [
    // Bellshrines (Act 1 gate)
    { id: 'bellshrine-marrow', name: 'Bellshrine - The Marrow', flagType: 'bool', flag: 'bellShrineBoneForest' },
    { id: 'bellshrine-far-fields', name: 'Bellshrine - Far Fields', flagType: 'bool', flag: 'bellShrineWilds' },
    { id: 'bellshrine-greymoor', name: 'Bellshrine - Greymoor', flagType: 'bool', flag: 'bellShrineGreymoor' },
    { id: 'bellshrine-bellhart', name: 'Bellshrine - Bellhart', flagType: 'bool', flag: 'bellShrineBellhart' },
    { id: 'bellshrine-shellwood', name: 'Bellshrine - Shellwood', flagType: 'bool', flag: 'bellShrineShellwood' },
    // Threefold Melody (Act 2 Citadel gate)
    { id: 'melody-architect', name: "Threefold Melody - Architect's Melody", flagType: 'bool', flag: 'HasMelodyArchitect' },
    { id: 'melody-conductor', name: "Threefold Melody - Conductor's Melody", flagType: 'bool', flag: 'HasMelodyConductor' },
    { id: 'melody-librarian', name: "Threefold Melody - Vaultkeeper's Melody", flagType: 'bool', flag: 'HasMelodyLibrarian' },
    { id: 'melody-lift', name: 'Threefold Melody - Cradle Lift Unlocked', flagType: 'bool', flag: 'UnlockedMelodyLift' },
];

export const ARENA_SOURCES = [
    { id: 'arena-ant-04', name: "Arena - Hunter's March (Ant_04)", flagType: 'bool', flag: 'ant04_battleCompleted' },
    { id: 'arena-ant-21', name: "Arena - Hunter's March entrance (Ant_21)", flagType: 'bool', flag: 'ant21_InitBattleCompleted' },
    { id: 'arena-aspid-06', name: 'Arena - Verdania / Aspid (Aspid_06)', flagType: 'bool', flag: 'aspid06_battleComplete' },
    { id: 'arena-cog-10', name: 'Arena - Cogwork Core Abyss (Cog_10)', flagType: 'bool', flag: 'completedCog10_abyssBattle' },
    { id: 'arena-library-entry', name: 'Arena - Whispering Vaults Entry', flagType: 'bool', flag: 'completedLibraryEntryBattle' },
    { id: 'arena-library-acolyte', name: 'Arena - Whispering Vaults Acolytes', flagType: 'bool', flag: 'completedLibraryAcolyteBattle' },
    { id: 'arena-dust-03', name: "Arena - Sinner's Road (Dust_03)", flagType: 'bool', flag: 'dust03_battleCompleted' },
    { id: 'arena-greymoor-04', name: 'Arena - Greymoor Tower (Greymoor_04)', flagType: 'bool', flag: 'greymoor_04_battleCompleted' },
    { id: 'arena-hang-04', name: 'Arena - High Halls Gauntlet (Hang_04)', flagType: 'bool', flag: 'hang04Battle' },
    { id: 'arena-slab-cloak', name: 'Arena - The Slab Cloak Recovery', flagType: 'bool', flag: 'slab_cloak_battle_completed' },
    { id: 'arena-song-04', name: 'Arena - Choral Chambers (Song_04)', flagType: 'bool', flag: 'song_04_battleCompleted' },
    { id: 'arena-under-07', name: 'Arena - Underworks (Under_07)', flagType: 'bool', flag: 'under07_battleCompleted' },
];

export const UNIQUE_SPAWN_SOURCES = [
    // Rhinogrunds (3)
    { id: 'rhinogrund-1', name: "Rhinogrund #1 - Far Fields (Pilgrim's Rest, missable)", flagType: 'bool', flag: 'churchRhinoKilled', iconKind: 'journal', icon: 'Rhinogrund - Rhino #4267198.png' },
    { id: 'rhinogrund-2', name: 'Rhinogrund #2 - Memorium (Arborium_02)', flagType: 'scene', sceneName: 'Arborium_02', sceneId: 'Rhino', iconKind: 'journal', icon: 'Rhinogrund - Rhino #4267198.png' },
    { id: 'rhinogrund-3', name: 'Rhinogrund #3 - Far Fields Act 3 (Bone_East_02b)', flagType: 'scene', sceneName: 'Bone_East_02b', sceneId: 'Rhino', iconKind: 'journal', icon: 'Rhinogrund - Rhino #4267198.png' },
    // Covetous Pilgrims (3)
    { id: 'covetous-pilgrim-1', name: 'Covetous Pilgrim #1 - Shellwood (Shellgrave)', flagType: 'scene', sceneName: 'Shellgrave', sceneId: 'Rosary Pilgrim', iconKind: 'journal', icon: 'Covetous Pilgrim - Rosary Pilgrim #4266887.png' },
    { id: 'covetous-pilgrim-2', name: 'Covetous Pilgrim #2 - Bilewater (Shadow_23)', flagType: 'scene', sceneName: 'Shadow_23', sceneId: 'Rosary Pilgrim', iconKind: 'journal', icon: 'Covetous Pilgrim - Rosary Pilgrim #4266887.png' },
    { id: 'covetous-pilgrim-3', name: 'Covetous Pilgrim #3 - Moss Grotto Act 3 (Bonegrave)', flagType: 'scene', sceneName: 'Bonegrave', sceneId: 'Rosary Pilgrim', iconKind: 'journal', icon: 'Covetous Pilgrim - Rosary Pilgrim #4266887.png' },
    // Shardillards (6)
    { id: 'shardillard-1', name: 'Shardillard #1 - Deep Docks (Bone_East_03)', flagType: 'sceneInt', sceneName: 'Bone_East_03', sceneId: 'Shell Fossil Mimic', value: -1, iconKind: 'journal', icon: 'Shardillard - Shell Fossil Mimic #4267128.png' },
    { id: 'shardillard-2', name: 'Shardillard #2 - Greymoor (Greymoor_17)', flagType: 'sceneInt', sceneName: 'Greymoor_17', sceneId: 'Shell Fossil Mimic', value: -1, iconKind: 'journal', icon: 'Shardillard - Shell Fossil Mimic #4267128.png' },
    { id: 'shardillard-3', name: 'Shardillard #3 - The Marrow (Bone_14)', flagType: 'sceneInt', sceneName: 'Bone_14', sceneId: 'Shell Fossil Mimic', value: -1, iconKind: 'journal', icon: 'Shardillard - Shell Fossil Mimic #4267128.png' },
    { id: 'shardillard-4', name: 'Shardillard #4 - Far Fields (Bone_East_14)', flagType: 'sceneInt', sceneName: 'Bone_East_14', sceneId: 'Shell Fossil Mimic', value: -1, iconKind: 'journal', icon: 'Shardillard - Shell Fossil Mimic #4267128.png' },
    { id: 'shardillard-5', name: 'Shardillard #5 - Sands of Karak (Coral_38)', flagType: 'sceneInt', sceneName: 'Coral_38', sceneId: 'Shell Fossil Mimic', value: -1, iconKind: 'journal', icon: 'Shardillard - Shell Fossil Mimic #4267128.png' },
    { id: 'shardillard-6', name: 'Shardillard #6 - The Marrow late (Bone_06)', flagType: 'sceneInt', sceneName: 'Bone_06', sceneId: 'Shell Fossil Mimic AppearVariant', value: -1, iconKind: 'journal', icon: 'Shardillard - Shell Fossil Mimic #4267128.png' },
];

export const VOID_MASS_SOURCES = [
    { id: 'void-mass-mosstown-02', name: 'Void Mass - Moss Grotto (Mosstown_02)', flagType: 'scene', sceneName: 'Mosstown_02', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-weave-03', name: 'Void Mass - Weavenest Atla (Weave_03)', flagType: 'scene', sceneName: 'Weave_03', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-bone-02', name: 'Void Mass - The Marrow #1 (Bone_02)', flagType: 'scene', sceneName: 'Bone_02', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-bone-04', name: 'Void Mass - The Marrow #2 (Bone_04)', flagType: 'scene', sceneName: 'Bone_04', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-bone-07', name: 'Void Mass - The Marrow #3 (Bone_07)', flagType: 'scene', sceneName: 'Bone_07', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-bone-09', name: 'Void Mass - The Marrow #4 (Bone_09)', flagType: 'scene', sceneName: 'Bone_09', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-bone-east-03', name: 'Void Mass - Deep Docks #1 (Bone_East_03)', flagType: 'scene', sceneName: 'Bone_East_03', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-dock-04', name: 'Void Mass - Deep Docks #2 (Dock_04)', flagType: 'scene', sceneName: 'Dock_04', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-bone-east-05', name: 'Void Mass - Deep Docks #3 (Bone_East_05)', flagType: 'scene', sceneName: 'Bone_East_05', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-ant-04-left', name: "Void Mass - Hunter's March #1 (Ant_04_left)", flagType: 'scene', sceneName: 'Ant_04_left', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-ant-05b', name: "Void Mass - Hunter's March #2 (Ant_05b)", flagType: 'scene', sceneName: 'Ant_05b', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-bone-east-02b', name: 'Void Mass - Far Fields #1 (Bone_East_02b)', flagType: 'scene', sceneName: 'Bone_East_02b', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-bone-east-17', name: 'Void Mass - Far Fields #2 (Bone_East_17)', flagType: 'scene', sceneName: 'Bone_East_17', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-bone-east-26', name: 'Void Mass - Far Fields #3 (Bone_East_26)', flagType: 'scene', sceneName: 'Bone_East_26', sceneId: 'Black_Thread_Core_Citadel', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-greymoor-02', name: 'Void Mass - Greymoor #1 (Greymoor_02)', flagType: 'scene', sceneName: 'Greymoor_02', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-greymoor-07', name: 'Void Mass - Greymoor #2 (Greymoor_07)', flagType: 'scene', sceneName: 'Greymoor_07', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-greymoor-11', name: 'Void Mass - Greymoor #3 (Greymoor_11)', flagType: 'scene', sceneName: 'Greymoor_11', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-greymoor-12', name: 'Void Mass - Greymoor #4 (Greymoor_12)', flagType: 'scene', sceneName: 'Greymoor_12', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-greymoor-16', name: 'Void Mass - Greymoor #5 (Greymoor_16)', flagType: 'scene', sceneName: 'Greymoor_16', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-shellwood-01b', name: 'Void Mass - Shellwood #1 (Shellwood_01b)', flagType: 'scene', sceneName: 'Shellwood_01b', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-shellwood-02', name: 'Void Mass - Shellwood #2 (Shellwood_02)', flagType: 'scene', sceneName: 'Shellwood_02', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-shellwood-04b', name: 'Void Mass - Shellwood #3 (Shellwood_04b)', flagType: 'scene', sceneName: 'Shellwood_04b', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-shellwood-26', name: 'Void Mass - Shellwood #4 (Shellwood_26)', flagType: 'scene', sceneName: 'Shellwood_26', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-shellwood-15', name: 'Void Mass - Shellwood #5 (Shellwood_15)', flagType: 'scene', sceneName: 'Shellwood_15', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-under-27', name: 'Void Mass - Shellwood #6 (Under_27)', flagType: 'scene', sceneName: 'Under_27', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-coral-11', name: 'Void Mass - Blasted Steps #1 (Coral_11)', flagType: 'scene', sceneName: 'Coral_11', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-coral-12', name: 'Void Mass - Blasted Steps #2 (Coral_12)', flagType: 'scene', sceneName: 'Coral_12', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-coral-32', name: 'Void Mass - Blasted Steps #3 (Coral_32)', flagType: 'scene', sceneName: 'Coral_32', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-dust-03', name: "Void Mass - Sinner's Road (Dust_03)", flagType: 'scene', sceneName: 'Dust_03', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-styx-nest', name: "Void Mass - Styx's Nest #1 & #2 (Classic only)", flagType: 'bool', flag: 'silkFarmAbyssCoresCleared', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-shadow-05', name: 'Void Mass - Bilewater (Shadow_05)', flagType: 'scene', sceneName: 'Shadow_05', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-under-02', name: 'Void Mass - Underworks #1 (Under_02)', flagType: 'scene', sceneName: 'Under_02', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-under-05', name: 'Void Mass - Underworks #2 (Under_05)', flagType: 'scene', sceneName: 'Under_05', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-under-18', name: 'Void Mass - Underworks #3 (Under_18)', flagType: 'scene', sceneName: 'Under_18', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-song-01', name: 'Void Mass - Choral Chambers #1 (Song_01)', flagType: 'scene', sceneName: 'Song_01', sceneId: 'Black_Thread_Core_Citadel', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-song-04', name: 'Void Mass - Choral Chambers #2 (Song_04)', flagType: 'scene', sceneName: 'Song_04', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-song-05', name: 'Void Mass - Choral Chambers #3 (Song_05)', flagType: 'scene', sceneName: 'Song_05', sceneId: 'Black_Thread_Core_Citadel', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-song-15', name: 'Void Mass - Choral Chambers #4 (Song_15)', flagType: 'scene', sceneName: 'Song_15', sceneId: 'Black_Thread_Core_Citadel', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-song-17', name: 'Void Mass - Choral Chambers #5 (Song_17)', flagType: 'scene', sceneName: 'Song_17', sceneId: 'Black_Thread_Core_Citadel', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-song-27', name: 'Void Mass - Choral Chambers #6 (Song_27)', flagType: 'scene', sceneName: 'Song_27', sceneId: 'Black_Thread_Core_Citadel', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-library-04-1', name: 'Void Mass - Whispering Vaults #1 (Library_04)', flagType: 'scene', sceneName: 'Library_04', sceneId: 'Black_Thread_Core_Citadel', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-library-04-2', name: 'Void Mass - Whispering Vaults #2 (Library_04)', flagType: 'scene', sceneName: 'Library_04', sceneId: 'Black_Thread_Core_Citadel (1)', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-library-06', name: 'Void Mass - Whispering Vaults #3 (Library_06)', flagType: 'scene', sceneName: 'Library_06', sceneId: 'Black_Thread_Core_Citadel', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-cog-04', name: 'Void Mass - Cogwork Core (Cog_04)', flagType: 'scene', sceneName: 'Cog_04', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-hang-03', name: 'Void Mass - High Halls #1 (Hang_03)', flagType: 'scene', sceneName: 'Hang_03', sceneId: 'Black_Thread_Core_Citadel', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
    { id: 'void-mass-hang-13', name: 'Void Mass - High Halls #2 (Hang_13)', flagType: 'scene', sceneName: 'Hang_13', sceneId: 'Black_Thread_Core', iconKind: 'journal', icon: 'Void Mass - Black Thread Core #4267169.png' },
];
