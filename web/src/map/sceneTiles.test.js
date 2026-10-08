import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { areaOf, litTiles, spriteOf, tileBaseName, tilesForScene } from './sceneTiles.js';
import { AREAS } from '../data/packs/base/areas.js';

const fullmap = new URL('../../assets/img/fullmap/', import.meta.url);
const read = name => JSON.parse(readFileSync(fileURLToPath(new URL(name, fullmap)), 'utf8'));

describe('tileBaseName', () => {
    it.each([
        ['Bone_East_15_left.png', 'Bone_East_15_left'],
        ['Abyss_02b #4265375.png', 'Abyss_02b'],
        ['__0003_Ward_04.png', 'Ward_04'],
        ['Song__02.png', 'Song__02'],
    ])('%s -> %s', (file, base) => expect(tileBaseName(file)).toBe(base));
});

describe('tilesForScene', () => {
    const tiles = { 'A_01.png': {}, 'A_01_top.png': {}, 'B_02 #1.png': {}, 'Gone.png': undefined };
    const sceneTiles = { A_01: ['A_01.png', 'A_01_top.png'], C: ['Gone.png'] };

    it('uses the scene map for known scenes', () => {
        expect(tilesForScene('A_01', sceneTiles, tiles)).toEqual(['A_01.png', 'A_01_top.png']);
    });
    it('drops mapped tiles that are not published', () => {
        expect(tilesForScene('C', sceneTiles, tiles)).toEqual([]);
    });
    it('falls back to an exact tile name for unknown scenes', () => {
        expect(tilesForScene('B_02', sceneTiles, tiles)).toEqual(['B_02 #1.png']);
        expect(tilesForScene('Nowhere', sceneTiles, tiles)).toEqual([]);
    });
});

describe('litTiles', () => {
    it('collects tiles of the first n scenes once each', () => {
        const lookup = s => ({ a: ['1', '2'], b: ['2', '3'] })[s] || [];
        expect([...litTiles(['a', 'b', 'a'], 2, lookup)].sort()).toEqual(['1', '2', '3']);
        expect(litTiles(['a'], 0, lookup).size).toBe(0);
    });
});

describe('spriteOf and areaOf', () => {
    it('instances name their sprite', () => {
        expect(spriteOf('X.png@Room', { sprite: 'X.png' })).toBe('X.png');
        expect(spriteOf('X.png', {})).toBe('X.png');
    });
    it('picks the longest matching area prefix', () => {
        const areas = [{ prefix: 'Bone' }, { prefix: 'Bonetown' }, { prefix: 'Bone_East' }];
        expect(areaOf('Bone_East_15', areas).prefix).toBe('Bone_East');
        expect(areaOf('Bonetown', areas).prefix).toBe('Bonetown');
        expect(areaOf('Bone_08', areas).prefix).toBe('Bone');
        expect(areaOf('Room_Witch', areas)).toBeNull();
    });
});

describe('published map data', () => {
    const coords = read('tile_coordinates.json').tiles;
    const scenes = read('scene_tiles.json').scenes;

    it('every scene maps to published tiles', () => {
        for (const [scene, names] of Object.entries(scenes)) {
            for (const name of names) expect(coords[name], `${scene} -> ${name}`).toBeDefined();
        }
    });
    it('every pack area prefix is a plain name', () => {
        for (const a of AREAS) expect(a.prefix).toMatch(/^[A-Za-z_]+$/);
    });
});
