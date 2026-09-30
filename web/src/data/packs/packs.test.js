import { describe, it, expect } from 'vitest';
import { PACKS, activePacks, mergedList, listNames } from './index.js';
import base from './base/index.js';

const demo = {
    id: 'demo',
    label: 'Demo DLC',
    minVersion: '9.9.9',
    detect: (save) => 'demoFlag' in (save.playerData || {}),
    lists: { bosses: [{ id: 'demo-boss', json: 'defeatedDemo', display: 'Demo Boss', icon: 'x.png' }] },
};

describe('pack registry', () => {
    it('ships the base pack first', () => {
        expect(PACKS[0]).toBe(base);
        expect(base.detect({})).toBe(true);
    });

    it('activePacks filters by detect and treats a throwing detect as inactive', () => {
        const broken = { ...demo, id: 'broken', detect: () => { throw new Error('x'); } };
        expect(activePacks({ playerData: {} }, [base, demo, broken]).map(p => p.id)).toEqual(['base']);
        expect(activePacks({ playerData: { demoFlag: true } }, [base, demo]).map(p => p.id)).toEqual(['base', 'demo']);
    });

    it('mergedList concatenates in pack order and stamps the pack id', () => {
        const bosses = mergedList('bosses', [base, demo]);
        expect(bosses.length).toBe(base.lists.bosses.length + 1);
        expect(bosses[0].pack).toBe('base');
        expect(bosses.at(-1)).toMatchObject({ id: 'demo-boss', pack: 'demo' });
        expect(mergedList('noSuchList', [base, demo])).toEqual([]);
    });

    it('mergedList does not mutate pack data', () => {
        mergedList('bosses', [base]);
        expect(base.lists.bosses[0].pack).toBeUndefined();
    });

    it('every base list is a non-empty array of entries with unique ids', () => {
        for (const name of listNames([base])) {
            const list = base.lists[name];
            expect(Array.isArray(list), name).toBe(true);
            expect(list.length, name).toBeGreaterThan(0);
            const ids = list.map(e => e.id);
            expect(ids.every(id => typeof id === 'string' && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)), `${name} ids are kebab-case`).toBe(true);
            expect(new Set(ids).size, `${name} ids unique`).toBe(ids.length);
        }
    });
});

describe('untracked patterns', () => {
    it('compile as JavaScript regexes and have unique ids and a reason', async () => {
        const { UNTRACKED } = await import('./base/untracked.js');
        expect(new Set(UNTRACKED.map(u => u.id)).size).toBe(UNTRACKED.length);
        for (const u of UNTRACKED) {
            expect(() => new RegExp(u.pattern), u.id).not.toThrow();
            expect(u.reason.length, u.id).toBeGreaterThan(5);
        }
        const rx = new RegExp(UNTRACKED.find(u => u.id === 'keys-items').pattern);
        expect(rx.test('CollectedDustCageKey')).toBe(true);
    });
});
