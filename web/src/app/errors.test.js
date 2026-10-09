import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkSave, describeProblem, unknownNames } from './errors.js';
import { parseAllData } from '../data/categories/index.js';

const FIXTURE_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', '__fixtures__');
const FIXTURES = readdirSync(FIXTURE_DIR)
    .filter(f => f.endsWith('.json') && !f.endsWith('.expected.json'))
    .map(f => ({ name: f, save: JSON.parse(readFileSync(join(FIXTURE_DIR, f), 'utf8')) }));

const base = { id: 'base', minVersion: '1.0.0' };

describe('describeProblem', () => {
    it('gives every kind a title and hint, warnings only for unknown content', () => {
        for (const kind of ['wasm-load', 'file-type', 'decrypt', 'not-silksong', 'unsupported-version', 'parse', 'unknown-content']) {
            const p = describeProblem(kind, 'x');
            expect(p.title, kind).toBeTruthy();
            expect(p.hint, kind).toBeTruthy();
            expect(p.detail).toBe('x');
            expect(p.severity, kind).toBe(kind === 'unknown-content' ? 'warning' : 'error');
        }
    });

    it('falls back to a generic error for an unknown kind', () => {
        expect(describeProblem('nope')).toMatchObject({ severity: 'error', detail: '' });
    });
});

describe('checkSave', () => {
    it('rejects a save without playerData', () => {
        expect(checkSave({})).toEqual({ kind: 'not-silksong' });
        expect(checkSave({ playerData: {} })).toEqual({ kind: 'not-silksong' });
    });

    it('rejects a version older than the oldest pack supports', () => {
        const packs = [base, { id: 'dlc', minVersion: '1.2.0' }];
        expect(checkSave({ playerData: { version: '0.9.1' } }, null, packs)).toMatchObject({ kind: 'unsupported-version' });
        expect(checkSave({ playerData: { version: '1.0.0' } }, null, packs)).toBeNull();
    });

    it('accepts a save with no version string (some test saves)', () => {
        expect(checkSave({ playerData: { health: 5 } }, null, [base])).toBeNull();
    });

    it('warns about names no pack lists, listing at most five', () => {
        const parsed = { journal: { unknownNames: ['A', 'B', 'C'] }, quests: { unknownNames: ['D'] }, collection: { unknownNames: { relics: ['E', 'F'] } } };
        expect(unknownNames(parsed)).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
        expect(checkSave({ playerData: { version: '1.0.1' } }, parsed, [base])).toEqual({
            kind: 'unknown-content', detail: '6 unknown: A, B, C, D, E and 1 more.',
        });
    });

    it('finds nothing wrong with any fixture save', () => {
        for (const f of FIXTURES) {
            const parsed = parseAllData(f.save.playerData, f.save.sceneData);
            expect(checkSave(f.save, parsed), f.name).toBeNull();
        }
    });
});
