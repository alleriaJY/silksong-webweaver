/**
 * Fleas: one playerData boolean each.
 * kind: 'flea' = a SavedFlea_<scene> rescue; 'special' = a named flea recruited
 * through an event (Kratt, Huge Flea, Vog). Both count toward the 30.
 * Entry: { id, json, display, kind }
 */

export const FLEAS = [
    { id: 'flea-ant-03', json: 'SavedFlea_Ant_03', display: 'Flea (Ant 03)', kind: 'flea' },
    { id: 'flea-belltown-04', json: 'SavedFlea_Belltown_04', display: 'Flea (Belltown 04)', kind: 'flea' },
    { id: 'flea-bone-06', json: 'SavedFlea_Bone_06', display: 'Flea (Bone 06)', kind: 'flea' },
    { id: 'flea-bone-east-05', json: 'SavedFlea_Bone_East_05', display: 'Flea (Bone East 05)', kind: 'flea' },
    { id: 'flea-bone-east-10-church', json: 'SavedFlea_Bone_East_10_Church', display: 'Flea (Bone East Church)', kind: 'flea' },
    { id: 'flea-bone-east-17b', json: 'SavedFlea_Bone_East_17b', display: 'Flea (Bone East 17b)', kind: 'flea' },
    { id: 'flea-coral-24', json: 'SavedFlea_Coral_24', display: 'Flea (Coral 24)', kind: 'flea' },
    { id: 'flea-coral-35', json: 'SavedFlea_Coral_35', display: 'Flea (Coral 35)', kind: 'flea' },
    { id: 'flea-crawl-06', json: 'SavedFlea_Crawl_06', display: 'Flea (Crawl 06)', kind: 'flea' },
    { id: 'flea-dock-03d', json: 'SavedFlea_Dock_03d', display: 'Flea (Dock 03d)', kind: 'flea' },
    { id: 'flea-dock-16', json: 'SavedFlea_Dock_16', display: 'Flea (Dock 16)', kind: 'flea' },
    { id: 'flea-dust-09', json: 'SavedFlea_Dust_09', display: 'Flea (Dust 09)', kind: 'flea' },
    { id: 'flea-dust-12', json: 'SavedFlea_Dust_12', display: 'Flea (Dust 12)', kind: 'flea' },
    { id: 'flea-greymoor-06', json: 'SavedFlea_Greymoor_06', display: 'Flea (Greymoor 06)', kind: 'flea' },
    { id: 'flea-greymoor-15b', json: 'SavedFlea_Greymoor_15b', display: 'Flea (Greymoor 15b)', kind: 'flea' },
    { id: 'flea-library-01', json: 'SavedFlea_Library_01', display: 'Flea (Library 01)', kind: 'flea' },
    { id: 'flea-library-09', json: 'SavedFlea_Library_09', display: 'Flea (Library 09)', kind: 'flea' },
    { id: 'flea-peak-05c', json: 'SavedFlea_Peak_05c', display: 'Flea (Peak 05c)', kind: 'flea' },
    { id: 'flea-shadow-10', json: 'SavedFlea_Shadow_10', display: 'Flea (Shadow 10)', kind: 'flea' },
    { id: 'flea-shadow-28', json: 'SavedFlea_Shadow_28', display: 'Flea (Shadow 28)', kind: 'flea' },
    { id: 'flea-shellwood-03', json: 'SavedFlea_Shellwood_03', display: 'Flea (Shellwood 03)', kind: 'flea' },
    { id: 'flea-slab-06', json: 'SavedFlea_Slab_06', display: 'Flea (Slab 06)', kind: 'flea' },
    { id: 'flea-slab-cell', json: 'SavedFlea_Slab_Cell', display: 'Flea (Slab Cell)', kind: 'flea' },
    { id: 'flea-song-11', json: 'SavedFlea_Song_11', display: 'Flea (Song 11)', kind: 'flea' },
    { id: 'flea-song-14', json: 'SavedFlea_Song_14', display: 'Flea (Song 14)', kind: 'flea' },
    { id: 'flea-under-21', json: 'SavedFlea_Under_21', display: 'Flea (Under 21)', kind: 'flea' },
    { id: 'flea-under-23', json: 'SavedFlea_Under_23', display: 'Flea (Under 23)', kind: 'flea' },
    { id: 'kratt', json: 'CaravanLechReturnedToCaravan', display: 'Kratt', kind: 'special' },
    { id: 'huge-flea', json: 'tamedGiantFlea', display: 'Huge Flea', kind: 'special' },
    { id: 'vog', json: 'MetTroupeHunterWild', display: 'Vog', kind: 'special' },
];
