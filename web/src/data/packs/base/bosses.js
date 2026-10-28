/**
 * Bosses: one playerData boolean each. Flag names are inconsistent
 * (defeatedX, xDefeated, PinstressPeakBattleAccepted); never derive them.
 * Entry: { id, json, display, icon }
 */

export const BOSSES = [
    { id: 'moss-mother', json: 'defeatedMossMother', display: 'Moss Mother', icon: 'Moss Mother - Mossbone Mother.png' },
    { id: 'bell-beast', json: 'defeatedBellBeast', display: 'Bell Beast', icon: 'Bell Beast - Bone Beast.png' },
    { id: 'lace-1', json: 'defeatedLace1', display: 'Lace 1 (Deep Docks)', icon: 'Lace.png' },
    { id: 'fourth-chorus', json: 'defeatedSongGolem', display: 'Fourth Chorus', icon: 'Fourth Chorus - Song Golem.png' },
    { id: 'moorwing', json: 'defeatedVampireGnatBoss', display: 'Moorwing', icon: 'Moorwing - Vampire Gnat.png' },
    { id: 'sister-splinter', json: 'defeatedSplinterQueen', display: 'Sister Splinter', icon: 'Sister Splinter - Splinter Queen.png' },
    { id: 'skull-tyrant-1', json: 'skullKingDefeated', display: 'Skull Tyrant 1', icon: 'Skull Tyrant - Skull King.png' },
    { id: 'skull-tyrant-2', json: 'skullKingKilled', display: 'Skull Tyrant 2', icon: 'Skull Tyrant - Skull King.png' },
    { id: 'great-conchflies', json: 'defeatedCoralDrillers', display: 'Great Conchflies', icon: 'Great Conchfly - Coral Conch Driller Giant.png' },
    { id: 'phantom', json: 'defeatedPhantom', display: 'Phantom', icon: 'Phantom.png' },
    { id: 'the-last-judge', json: 'defeatedLastJudge', display: 'The Last Judge', icon: 'Last Judge.png' },
    { id: 'savage-beastfly-1', json: 'defeatedBoneFlyerGiant', display: 'Savage Beastfly 1', icon: 'Savage Beastfly - Bone Flyer Giant.png' },
    { id: 'savage-beastfly-2', json: 'defeatedBoneFlyerGiantGolemScene', display: 'Savage Beastfly 2', icon: 'Savage Beastfly - Bone Flyer Giant.png' },
    { id: 'cogwork-dancers', json: 'defeatedCogworkDancers', display: 'Cogwork Dancers', icon: 'Cogwork Dancers - Clockwork Dancer.png' },
    { id: 'trobbio', json: 'defeatedTrobbio', display: 'Trobbio', icon: 'Trobbio #4267244.png' },
    { id: 'second-sentinel', json: 'defeatedSongChevalierBoss', display: 'Second Sentinel', icon: 'Second Sentinel - Song Knight.png' },
    { id: 'first-sinner', json: 'defeatedFirstWeaver', display: 'First Sinner', icon: 'First Sinner - First Weaver.png' },
    { id: 'disgraced-chef-lugoli', json: 'defeatedRoachkeeperChef', display: 'Disgraced Chef Lugoli', icon: 'Disgraced Chef Lugoli - Roachkeeper Chef.png' },
    { id: 'broodmother', json: 'defeatedBroodMother', display: 'Broodmother', icon: 'Broodmother - Slab Fly Broodmother.png' },
    { id: 'father-of-the-flame', json: 'defeatedWispPyreEffigy', display: 'Father of the Flame', icon: 'Father of the Flame - Wisp Pyre Effigy.png' },
    { id: 'raging-conchfly', json: 'defeatedCoralDrillerSolo', display: 'Raging Conchfly', icon: 'Great Conchfly - Coral Conch Driller Giant.png' },
    { id: 'forebrothers-signis-gron', json: 'defeatedDockForemen', display: 'Forebrothers Signis & Gron', icon: 'Forebrothers Signis & Gron - Dock Guard Thrower.png' },
    { id: 'the-unravelled', json: 'wardBossDefeated', display: 'The Unravelled', icon: 'The Unravelled - Conductor Boss.png' },
    { id: 'groal-the-great', json: 'DefeatedSwampShaman', display: 'Groal the Great', icon: 'Groal the Great - Swamp Shaman.png' },
    { id: 'voltvyrm', json: 'defeatedZapCoreEnemy', display: 'Voltvyrm', icon: 'Voltvyrm - Zap Core Enemy.png' },
    { id: 'lace-2', json: 'defeatedLaceTower', display: 'Lace 2 (The Cradle)', icon: 'Lace #4267252.png' },
    { id: 'lost-garmond', json: 'garmondBlackThreadDefeated', display: 'Lost Garmond', icon: 'Lost Garmond - Garmond.png' },
    { id: 'gurr-the-outcast', json: 'defeatedAntTrapper', display: 'Gurr the Outcast', icon: 'Gurr the Outcast - Bone Hunter Trapper.png' },
    { id: 'pinstress', json: 'PinstressPeakBattleAccepted', display: 'Pinstress', icon: 'Pinstress Boss.png' },
    { id: 'tormented-trobbio', json: 'defeatedTormentedTrobbio', display: 'Tormented Trobbio', icon: 'Tormented Trobbio.png' },
    { id: 'palestag', json: 'defeatedWhiteCloverstag', display: 'Palestag', icon: 'Palestag - Cloverstag White.png' },
    { id: 'skarrsinger-karmelita', json: 'defeatedAntQueen', display: 'Skarrsinger Karmelita', icon: 'Skarrsinger Karmelita - Hunter Queen.png' },
    { id: 'crust-king-khann', json: 'defeatedCoralKing', display: 'Crust King Khann', icon: 'Crust King Khann - Coral King.png' },
    { id: 'seth', json: 'defeatedSeth', display: 'Seth', icon: 'Shrine Guardian Seth - Seth.png' },
    { id: 'nyleth', json: 'defeatedFlowerQueen', display: 'Nyleth', icon: 'Nyleth - Flower Queen.png' },
    { id: 'clover-dancers', json: 'defeatedCloverDancers', display: 'Clover Dancers', icon: 'Clover Dancers - Clover Dancer.png' },
    // Optional fights (the reference tracker lists the first two as bosses).
    // defeatedGuardBoneEast25 is the void-powered Skarrgard guarding the Far
    // Fields Memory Locket in Bone_East_25: set only in the 100% save, the one
    // fixture that has that locket.
    { id: 'crawfather', json: 'defeatedCrowCourt', display: 'Crawfather', icon: 'Crawfather.png' },
    { id: 'watcher-at-the-edge', json: 'defeatedGreyWarrior', display: 'Watcher at the Edge', icon: 'Watcher at the Edge - Coral Warrior Grey.png' },
    { id: 'skarrgard-far-fields', json: 'defeatedGuardBoneEast25', display: 'Skarrgard (Far Fields)', icon: 'Skarrgard - Bone Hunter Throw.png' },
];
