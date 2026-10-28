/**
 * Map areas, keyed by the start of a scene / tile name: the longest matching
 * prefix wins ("Bone_East_20" -> Bone_East, "Bone_07" -> Bone).
 *
 * color:   area colour for map overlays and legends.
 * display: in-game area name shown to players. A few prefixes span several
 *          areas (Coral = Blasted Steps and Sands of Karak, Song = Choral
 *          Chambers and Grand Gate); the name is the area most of their rooms
 *          belong to in the silksong-completionist tracker data (MIT).
 *          Memory_* rooms are the memory sequences (crests, silk hearts);
 *          Abandoned_town is taken to be the Surface town above The Cradle.
 * Entry: { id, prefix, display, color }
 */

export const AREAS = [
    { id: 'abyss', prefix: 'Abyss', display: 'The Abyss', color: '#9c27b0' },
    { id: 'abandoned-town', prefix: 'Abandoned_town', display: 'The Surface', color: '#b0bec5' },
    { id: 'ant', prefix: 'Ant', display: "Hunter's March", color: '#ff5722' },
    { id: 'aqueduct', prefix: 'Aqueduct', display: 'Putrified Ducts', color: '#00bcd4' },
    { id: 'arborium', prefix: 'Arborium', display: 'Memorium', color: '#8bc34a' },
    { id: 'aspid', prefix: 'Aspid', display: 'Bone Bottom', color: '#ffc107' },
    { id: 'bellshrine', prefix: 'Bellshrine', display: 'Bell Shrine', color: '#e91e63' },
    { id: 'belltown', prefix: 'Belltown', display: 'Bellhart', color: '#2196f3' },
    { id: 'bellway', prefix: 'Bellway', display: 'Bellway', color: '#03a9f4' },
    { id: 'bellway-city', prefix: 'Bellway_City', display: 'Grand Bellway', color: '#03a9f4' },
    { id: 'bone', prefix: 'Bone', display: 'The Marrow', color: '#9e9e9e' },
    { id: 'bone-east', prefix: 'Bone_East', display: 'Far Fields', color: '#bdb76b' },
    { id: 'bonegrave', prefix: 'Bonegrave', display: 'Moss Grotto', color: '#607d8b' },
    { id: 'bonetown', prefix: 'Bonetown', display: 'Bone Bottom', color: '#795548' },
    { id: 'clover', prefix: 'Clover', display: 'Verdania', color: '#4caf50' },
    { id: 'cog', prefix: 'Cog', display: 'Cogwork Core', color: '#ff9800' },
    { id: 'coral', prefix: 'Coral', display: 'Blasted Steps', color: '#e91e63' },
    { id: 'cradle', prefix: 'Cradle', display: 'The Cradle', color: '#9575cd' },
    { id: 'crawl', prefix: 'Crawl', display: 'Wormways', color: '#a1887f' },
    { id: 'dock', prefix: 'Dock', display: 'Deep Docks', color: '#26a69a' },
    { id: 'dust', prefix: 'Dust', display: "Sinner's Road", color: '#bcaaa4' },
    { id: 'greymoor', prefix: 'Greymoor', display: 'Greymoor', color: '#78909c' },
    { id: 'halfway', prefix: 'Halfway', display: 'Halfway Home', color: '#78909c' },
    { id: 'hang', prefix: 'Hang', display: 'High Halls', color: '#f06292' },
    { id: 'library', prefix: 'Library', display: 'Whispering Vaults', color: '#ba68c8' },
    { id: 'mosstown', prefix: 'Mosstown', display: 'Moss Grotto', color: '#81c784' },
    { id: 'last-dive', prefix: 'Last_Dive', display: 'The Abyss', color: '#9c27b0' },
    { id: 'memory', prefix: 'Memory', display: 'Memory', color: '#f8bbd0' },
    { id: 'organ', prefix: 'Organ', display: 'Exhaust Organ', color: '#8d6e63' },
    { id: 'peak', prefix: 'Peak', display: 'Mount Fay', color: '#4dd0e1' },
    { id: 'room', prefix: 'Room', display: 'Interior', color: '#ffab91' },
    { id: 'shadow', prefix: 'Shadow', display: 'Bilewater', color: '#5c6bc0' },
    { id: 'shellgrave', prefix: 'Shellgrave', display: 'Shellwood', color: '#aed581' },
    { id: 'shellwood', prefix: 'Shellwood', display: 'Shellwood', color: '#aed581' },
    { id: 'slab', prefix: 'Slab', display: 'The Slab', color: '#90a4ae' },
    { id: 'sprintmaster', prefix: 'Sprintmaster_Cave', display: 'Far Fields', color: '#bdb76b' },
    { id: 'song', prefix: 'Song', display: 'Choral Chambers', color: '#ce93d8' },
    { id: 'song-enclave', prefix: 'Song_Enclave', display: 'Songclave', color: '#ce93d8' },
    { id: 'tube', prefix: 'Tube', display: 'Ventrica', color: '#4db6ac' },
    { id: 'tut', prefix: 'Tut', display: 'Moss Grotto', color: '#ffcc80' },
    { id: 'under', prefix: 'Under', display: 'Underworks', color: '#616161' },
    { id: 'ward', prefix: 'Ward', display: 'Whiteward', color: '#ec407a' },
    { id: 'weave', prefix: 'Weave', display: 'Weavenest Atla', color: '#7e57c2' },
    { id: 'wisp', prefix: 'Wisp', display: 'Wisp Thicket', color: '#64ffda' },
];

// playerData.currentArea is the game's MapZone name. Only MOSSCAVE, ENCLAVE
// and ABYSS appear in the fixture saves; the others follow the save's key
// naming (HasCrawlMap, UnlockedShadowStation, ...) and are unconfirmed. A zone
// not listed here is shown title-cased (core/format.js#humanize).
export const MAP_ZONES = [
    { id: 'abyss', zone: 'ABYSS', display: 'The Abyss' },
    { id: 'aqueduct', zone: 'AQUEDUCT', display: 'Putrified Ducts' },
    { id: 'arborium', zone: 'ARBORIUM', display: 'Memorium' },
    { id: 'belltown', zone: 'BELLTOWN', display: 'Bellhart' },
    { id: 'bone-forest', zone: 'BONE_FOREST', display: 'The Marrow' },
    { id: 'bonetown', zone: 'BONETOWN', display: 'Bone Bottom' },
    { id: 'clover', zone: 'CLOVER', display: 'Verdania' },
    { id: 'cog-core', zone: 'COG_CORE', display: 'Cogwork Core' },
    { id: 'cradle', zone: 'CRADLE', display: 'The Cradle' },
    { id: 'crawlspace', zone: 'CRAWLSPACE', display: 'Wormways' },
    { id: 'docks', zone: 'DOCKS', display: 'Deep Docks' },
    { id: 'dustpens', zone: 'DUSTPENS', display: "Sinner's Road" },
    { id: 'enclave', zone: 'ENCLAVE', display: 'Songclave' },
    { id: 'greymoor', zone: 'GREYMOOR', display: 'Greymoor' },
    { id: 'halfway-house', zone: 'HALFWAY_HOUSE', display: 'Halfway Home' },
    { id: 'hang', zone: 'HANG', display: 'High Halls' },
    { id: 'hunters-nest', zone: 'HUNTERS_NEST', display: "Hunter's March" },
    { id: 'judge-steps', zone: 'JUDGE_STEPS', display: 'Blasted Steps' },
    { id: 'library', zone: 'LIBRARY', display: 'Whispering Vaults' },
    { id: 'mosscave', zone: 'MOSSCAVE', display: 'Moss Grotto' },
    { id: 'peak', zone: 'PEAK', display: 'Mount Fay' },
    { id: 'shellwood', zone: 'SHELLWOOD_THICKET', display: 'Shellwood' },
    { id: 'slab', zone: 'THE_SLAB', display: 'The Slab' },
    { id: 'swamp', zone: 'SWAMP', display: 'Bilewater' },
    { id: 'understore', zone: 'UNDERSTORE', display: 'Underworks' },
    { id: 'ward', zone: 'WARD', display: 'Whiteward' },
    { id: 'weavehome', zone: 'WEAVER_HOME', display: 'Weavenest Atla' },
    { id: 'wilds', zone: 'WILDS', display: 'Far Fields' },
    { id: 'wisp', zone: 'WISP', display: 'Wisp Thicket' },
];
