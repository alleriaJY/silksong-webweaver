/**
 * Map areas, keyed by the first segment of a scene / tile name
 * ("Bone_East_20" -> "Bone", "Coral_19b" -> "Coral").
 *
 * color:   area colour for map overlays and legends.
 * display: in-game area name, only where an existing schema entry confirms it.
 *          null means "not confirmed yet"; UIs fall back to the prefix.
 *          Some prefixes span several in-game areas (Song = Grand Gate and
 *          Choral Chambers; Coral = Sands of Karak and Blasted Steps).
 * Entry: { id, prefix, display, color }
 */

export const AREAS = [
    { id: 'abyss', prefix: 'Abyss', display: null, color: '#9c27b0' },
    { id: 'ant', prefix: 'Ant', display: null, color: '#ff5722' },
    { id: 'aqueduct', prefix: 'Aqueduct', display: 'Putrified Ducts', color: '#00bcd4' },
    { id: 'arborium', prefix: 'Arborium', display: 'Memorium', color: '#8bc34a' },
    { id: 'aspid', prefix: 'Aspid', display: null, color: '#ffc107' },
    { id: 'bellshrine', prefix: 'Bellshrine', display: null, color: '#e91e63' },
    { id: 'belltown', prefix: 'Belltown', display: 'Bellhart', color: '#2196f3' },
    { id: 'bellway', prefix: 'Bellway', display: null, color: '#03a9f4' },
    { id: 'bone', prefix: 'Bone', display: null, color: '#9e9e9e' },
    { id: 'bonegrave', prefix: 'Bonegrave', display: null, color: '#607d8b' },
    { id: 'bonetown', prefix: 'Bonetown', display: 'Bone Bottom', color: '#795548' },
    { id: 'clover', prefix: 'Clover', display: 'Verdania', color: '#4caf50' },
    { id: 'cog', prefix: 'Cog', display: 'Cogwork Core', color: '#ff9800' },
    { id: 'coral', prefix: 'Coral', display: null, color: '#e91e63' },
    { id: 'cradle', prefix: 'Cradle', display: 'The Cradle', color: '#9575cd' },
    { id: 'crawl', prefix: 'Crawl', display: 'Wormways', color: '#a1887f' },
    { id: 'dock', prefix: 'Dock', display: 'Deep Docks', color: '#26a69a' },
    { id: 'dust', prefix: 'Dust', display: null, color: '#bcaaa4' },
    { id: 'greymoor', prefix: 'Greymoor', display: 'Greymoor', color: '#78909c' },
    { id: 'hang', prefix: 'Hang', display: 'High Halls', color: '#f06292' },
    { id: 'library', prefix: 'Library', display: 'Whispering Vaults', color: '#ba68c8' },
    { id: 'mosstown', prefix: 'Mosstown', display: null, color: '#81c784' },
    { id: 'peak', prefix: 'Peak', display: 'Mount Fay', color: '#4dd0e1' },
    { id: 'room', prefix: 'Room', display: null, color: '#ffab91' },
    { id: 'shadow', prefix: 'Shadow', display: null, color: '#5c6bc0' },
    { id: 'shellwood', prefix: 'Shellwood', display: 'Shellwood', color: '#aed581' },
    { id: 'slab', prefix: 'Slab', display: 'The Slab', color: '#90a4ae' },
    { id: 'song', prefix: 'Song', display: null, color: '#ce93d8' },
    { id: 'tube', prefix: 'Tube', display: null, color: '#4db6ac' },
    { id: 'tut', prefix: 'Tut', display: null, color: '#ffcc80' },
    { id: 'under', prefix: 'Under', display: 'Underworks', color: '#616161' },
    { id: 'ward', prefix: 'Ward', display: 'Whiteward', color: '#ec407a' },
    { id: 'weave', prefix: 'Weave', display: 'Weavenest Atla', color: '#7e57c2' },
    { id: 'wisp', prefix: 'Wisp', display: 'Wisp Thicket', color: '#64ffda' },
];
