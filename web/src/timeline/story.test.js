import { describe, it, expect } from 'vitest';
import { buildRespawnPin, describeStoryEvent, eventLabel, formatPlayTime, placeEvents, sceneBoundsCenter } from './story.js';

describe('placeEvents', () => {
    const scenes = ['Tut_01', 'Bonetown', 'Bone_01', 'Bone_East_20', 'Shellwood_14'];
    const ev = (scene, playTime) => ({ type: 0, scene, playTime });

    it('places an event at its scene\'s first visit', () => {
        expect(placeEvents([ev('Bone_East_20', 10)], scenes)[0].index).toBe(4);
    });
    it('never places an event before the previous one', () => {
        // a later event back in Bonetown happened after reaching Shellwood_14
        const placed = placeEvents([ev('Shellwood_14', 10), ev('Bonetown', 20)], scenes);
        expect(placed.map(e => e.index)).toEqual([5, 5]);
    });
    it('keeps unvisited scenes after the previous event', () => {
        const placed = placeEvents([ev('Bone_01', 10), ev('Nowhere', 20)], scenes);
        expect(placed.map(e => e.index)).toEqual([3, 3]);
    });
    it('keeps the event fields and attaches running nth count and sourceName', () => {
        const placed = placeEvents([
            { type: 3, scene: 'Bone_18', playTime: 5, area: 'Bone' },
            { type: 3, scene: 'Bone_East_10_Room', playTime: 15, area: 'Bone_East' },
        ], scenes);
        expect(placed[0]).toEqual({
            type: 3,
            scene: 'Bone_18',
            playTime: 5,
            area: 'Bone',
            index: 0,
            nth: 1,
            sourceName: 'The Marrow - arena battle (Bone_18)',
        });
        expect(placed[1].nth).toBe(2);
        expect(placed[1].sourceName).toBe("Far Fields - Mort (Pilgrim's Rest, 150 Rosaries)");
        expect(describeStoryEvent(2, 'Dust_06')).toContain('Roachkeeper');
    });
});

describe('sceneBoundsCenter & buildRespawnPin', () => {
    const tiles = {
        t1: { x: 100, y: 200, width: 40, height: 20 },
        t2: { x: 140, y: 200, width: 60, height: 60 },
    };
    const lookup = scene => (scene === 'Belletown' ? ['t1', 't2'] : []);

    it('computes the bounding-box centre of a scene\'s tiles', () => {
        expect(sceneBoundsCenter('Belletown', lookup, tiles)).toEqual({ x: 150, y: 230 });
        expect(sceneBoundsCenter('Unknown_01', lookup, tiles)).toBeNull();
    });

    it('builds respawn bench pin data when respawnScene resolves to map tiles', () => {
        const pin = buildRespawnPin({ respawnScene: 'Belletown', respawnMarkerName: 'RestBench' }, lookup, tiles);
        expect(pin).toEqual({
            scene: 'Belletown',
            marker: 'RestBench',
            x: 150,
            y: 230,
            title: 'Current respawn bench · Belletown (RestBench)',
        });
        expect(buildRespawnPin({}, lookup, tiles)).toBeNull();
    });
});

describe('formatPlayTime & eventLabel', () => {
    it.each([[16899.4, '4h 41m'], [300, '5m'], [3600, '1h 00m'], [-5, '0m']])('%s -> %s', (s, out) => {
        expect(formatPlayTime(s)).toBe(out);
    });
    it('maps StoryEvents EventType 0..3 to item categories', () => {
        expect(eventLabel(0)).toBe('Mask Shard');
        expect(eventLabel(1)).toBe('Spool Fragment');
        expect(eventLabel(2)).toBe('Simple Key');
        expect(eventLabel(3)).toBe('Memory Locket');
        expect(eventLabel(99)).toBe('Type 99');
    });
});
