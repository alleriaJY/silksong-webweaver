import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { activePacks, mergedList } from '../data/packs/index.js';
import { findUnknownKeys, groupOf, referencedKeys, reportText } from './unknownKeys.js';
import { isLocalHost } from '../app/devHost.js';

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', '__fixtures__');
const load = name => JSON.parse(readFileSync(join(FIXTURES, `${name}.json`), 'utf-8'));

describe('findUnknownKeys', () => {
    const save = load('complete');
    const packs = activePacks(save);
    const result = findUnknownKeys(save.playerData, packs);
    const unexplained = result.unexplained.flatMap(g => g.keys.map(k => k.key));
    const explained = result.explained.flatMap(e => e.keys.map(k => k.key));

    it('never reports a key a pack list or category code reads', () => {
        const refs = referencedKeys(packs);
        for (const key of ['HasAbyssMap', 'defeatedLace1', 'pinGalleriesCompleted', 'QuestCompletionData', 'Tools']) {
            expect(refs.has(key), key).toBe(true);
            expect([...unexplained, ...explained]).not.toContain(key);
        }
    });

    it('splits unreferenced keys into explained (with a reason) and unexplained', () => {
        expect(explained.length + unexplained.length).toBe(result.unreferenced);
        expect(result.unreferenced).toBeLessThan(result.keyCount);
        for (const e of result.explained) expect(e.reason, e.id).toEqual(expect.any(String));
        expect(explained).toContain('MetPinChallengeBug');   // npc-met
        expect(unexplained).toContain('CrawbellTimer');       // nothing explains it
    });

    it('bools only leaves out numbers, strings and containers', () => {
        const bools = findUnknownKeys(save.playerData, packs, { boolsOnly: true });
        for (const g of [...bools.unexplained, ...bools.explained]) {
            for (const { value } of g.keys) expect(typeof value).toBe('boolean');
        }
        expect(bools.unreferenced).toBeLessThan(result.unreferenced);
    });

    it('reads the untracked patterns from the packs', () => {
        expect(mergedList('untracked', packs).length).toBeGreaterThan(0);
        expect(result.explained.map(e => e.id)).toContain('npc-dialogue');
    });

    it('handles a missing playerData', () => {
        expect(findUnknownKeys(undefined, packs)).toEqual({ keyCount: 0, unreferenced: 0, explained: [], unexplained: [] });
    });

    it('copies a readable report', () => {
        const text = reportText(result, 'user3.dat');
        expect(text.split('\n')[0]).toMatch(/^Unexplained playerData keys in user3\.dat: \d+ of \d+$/);
        expect(text).toContain('  CrawbellTimer = ');
    });
});

describe('groupOf', () => {
    it('groups like tools/unknown_keys.py', () => {
        expect(groupOf('SavedFlea_Ant_03')).toBe('SavedFlea_*');
        expect(groupOf('HasAbyssMap')).toBe('Has*');
        expect(groupOf('wardBossDefeated')).toBe('*Defeated');
        expect(groupOf('CrawbellTimer')).toBe('(other)');
    });
});

describe('isLocalHost', () => {
    it('accepts this machine and private network addresses', () => {
        for (const h of ['localhost', '127.0.0.1', '[::1]', '192.168.1.20', '10.0.0.5', '172.20.3.4', 'pc.local', 'app.localhost']) {
            expect(isLocalHost(h), h).toBe(true);
        }
    });
    it('rejects the published site and public addresses', () => {
        for (const h of ['alleriajy.github.io', 'example.com', '8.8.8.8', '172.32.0.1', '192.169.0.1', '', undefined]) {
            expect(isLocalHost(h), String(h)).toBe(false);
        }
    });
});
