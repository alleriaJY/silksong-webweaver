/**
 * Map data for Hero's Path: reviewed tile positions
 * (tile_coordinates.json), which tiles each scene lights (scene_tiles.json) and
 * a lossless WebP of each tile's sprite, all published by tools/tilefit. The browser looks scenes up; it never
 * matches file names except for scenes the map data has never seen.
 */

export const FULLMAP = 'assets/img/fullmap/';

/** 'Abyss_02b #4265375.png' -> 'Abyss_02b', '__0003_Ward_04.png' -> 'Ward_04'. */
export function tileBaseName(tileName) {
    return tileName.replace(/\.png$/, '').replace(/\s*#\d+$/, '').replace(/^_+\d{4}_/, '');
}

/** Image file of a tile entry; instances ('<sprite>@<scene>') name their sprite. */
export function spriteOf(name, tile) {
    return tile?.sprite || name;
}

/** Published image of a tile: 'X.png@Room' with sprite 'X.png' -> 'X.webp'. */
export function spriteFile(name, tile) {
    return spriteOf(name, tile).replace(/\.png$/, '') + '.webp';
}

/**
 * Tiles a scene lights. Known scenes use scene_tiles.json; an unknown scene
 * (new patch or DLC) falls back to a tile named exactly like it.
 */
export function tilesForScene(scene, sceneTiles, tiles) {
    const known = sceneTiles[scene];
    if (known) return known.filter(name => tiles[name]);
    return Object.keys(tiles).filter(name => tileBaseName(name) === scene);
}

/** Every tile lit by the first `count` entries of `scenes`. */
export function litTiles(scenes, count, lookup) {
    const lit = new Set();
    for (let i = 0; i < count && i < scenes.length; i++) {
        for (const name of lookup(scenes[i])) lit.add(name);
    }
    return lit;
}

/** Pack area for a scene: the entry with the longest prefix the scene starts with. */
export function areaOf(scene, areas) {
    let best = null;
    for (const a of areas) {
        if ((scene === a.prefix || scene.startsWith(a.prefix + '_'))
            && (!best || a.prefix.length > best.prefix.length)) best = a;
    }
    return best;
}

/** Fetch the published map data; confirmed tiles only. */
export async function loadMapData(base = FULLMAP) {
    const [coords, scenes] = await Promise.all([
        fetch(base + 'tile_coordinates.json').then(r => r.json()),
        fetch(base + 'scene_tiles.json').then(r => (r.ok ? r.json() : { scenes: {} })),
    ]);
    const tiles = {};
    for (const [name, tile] of Object.entries(coords.tiles || {})) {
        if (tile.confirmed === true) tiles[name] = tile;
    }
    return { tiles, sceneTiles: scenes.scenes || {}, width: coords.metadata?.fullmap_width || 4096,
             height: coords.metadata?.fullmap_height || 4096 };
}
