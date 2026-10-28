import { describe, it, expect } from 'vitest';
import { eventLabel, formatPlayTime, placeEvents } from './story.js';

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
    it('keeps the event fields', () => {
        expect(placeEvents([{ type: 3, scene: 'Tut_01', playTime: 5, area: 'Tut' }], scenes)[0])
            .toEqual({ type: 3, scene: 'Tut_01', playTime: 5, area: 'Tut', index: 1 });
    });
});

describe('formatPlayTime', () => {
    it.each([[16899.4, '4h 41m'], [300, '5m'], [3600, '1h 00m'], [-5, '0m']])('%s -> %s', (s, out) => {
        expect(formatPlayTime(s)).toBe(out);
    });
});

describe('eventLabel', () => {
    it('names the known pickup types and falls back for new ones', () => {
        expect([0, 1, 2, 3].map(eventLabel)).toEqual(['Mask Shard', 'Spool Fragment', 'Simple Key', 'Memory Locket']);
        expect(eventLabel(7)).toBe('Upgrade (type 7)');
    });
});
