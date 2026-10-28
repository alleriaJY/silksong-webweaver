/**
 * Fleas: one playerData boolean each.
 * kind: 'flea' = a SavedFlea_<scene> rescue; 'special' = a named flea recruited
 * through an event (Kratt, Huge Flea, Vog). Both count toward the 30.
 * Entry: { id, json, display, kind }
 */

export const FLEAS = [
    { id: 'flea-ant-03', json: 'SavedFlea_Ant_03', display: "Hunter's March", kind: 'flea' },
    { id: 'flea-belltown-04', json: 'SavedFlea_Belltown_04', display: 'Bellhart', kind: 'flea' },
    { id: 'flea-bone-06', json: 'SavedFlea_Bone_06', display: 'The Marrow', kind: 'flea' },
    { id: 'flea-bone-east-05', json: 'SavedFlea_Bone_East_05', display: 'Deep Docks', kind: 'flea' },
    { id: 'flea-bone-east-10-church', json: 'SavedFlea_Bone_East_10_Church', display: 'Far Fields (2)', kind: 'flea' },
    { id: 'flea-bone-east-17b', json: 'SavedFlea_Bone_East_17b', display: 'Far Fields', kind: 'flea' },
    { id: 'flea-coral-24', json: 'SavedFlea_Coral_24', display: 'Sands of Karak', kind: 'flea' },
    { id: 'flea-coral-35', json: 'SavedFlea_Coral_35', display: 'Blasted Steps', kind: 'flea' },
    { id: 'flea-crawl-06', json: 'SavedFlea_Crawl_06', display: 'Wormways', kind: 'flea' },
    { id: 'flea-dock-03d', json: 'SavedFlea_Dock_03d', display: 'Deep Docks (2)', kind: 'flea' },
    { id: 'flea-dock-16', json: 'SavedFlea_Dock_16', display: 'The Marrow (2)', kind: 'flea' },
    { id: 'flea-dust-09', json: 'SavedFlea_Dust_09', display: 'Exhaust Organ', kind: 'flea' },
    { id: 'flea-dust-12', json: 'SavedFlea_Dust_12', display: "Sinner's Road", kind: 'flea' },
    { id: 'flea-greymoor-06', json: 'SavedFlea_Greymoor_06', display: 'Greymoor (2)', kind: 'flea' },
    { id: 'flea-greymoor-15b', json: 'SavedFlea_Greymoor_15b', display: 'Greymoor', kind: 'flea' },
    { id: 'flea-library-01', json: 'SavedFlea_Library_01', display: 'Whispering Vaults', kind: 'flea' },
    { id: 'flea-library-09', json: 'SavedFlea_Library_09', display: 'Songclave', kind: 'flea' },
    { id: 'flea-peak-05c', json: 'SavedFlea_Peak_05c', display: 'Mount Fay', kind: 'flea' },
    { id: 'flea-shadow-10', json: 'SavedFlea_Shadow_10', display: 'Bilewater (2)', kind: 'flea' },
    { id: 'flea-shadow-28', json: 'SavedFlea_Shadow_28', display: 'Bilewater', kind: 'flea' },
    { id: 'flea-shellwood-03', json: 'SavedFlea_Shellwood_03', display: 'Shellwood', kind: 'flea' },
    { id: 'flea-slab-06', json: 'SavedFlea_Slab_06', display: 'The Slab (2)', kind: 'flea' },
    { id: 'flea-slab-cell', json: 'SavedFlea_Slab_Cell', display: 'The Slab', kind: 'flea' },
    { id: 'flea-song-11', json: 'SavedFlea_Song_11', display: 'Choral Chambers (2)', kind: 'flea' },
    { id: 'flea-song-14', json: 'SavedFlea_Song_14', display: 'Choral Chambers', kind: 'flea' },
    { id: 'flea-under-21', json: 'SavedFlea_Under_21', display: 'Underworks (2)', kind: 'flea' },
    { id: 'flea-under-23', json: 'SavedFlea_Under_23', display: 'Underworks', kind: 'flea' },
    { id: 'kratt', json: 'CaravanLechReturnedToCaravan', display: 'Kratt (Greymoor)', kind: 'special' },
    { id: 'huge-flea', json: 'tamedGiantFlea', display: 'Huge Flea (Memorium)', kind: 'special' },
    { id: 'vog', json: 'MetTroupeHunterWild', display: 'Vog (Putrified Ducts)', kind: 'special' },
];
