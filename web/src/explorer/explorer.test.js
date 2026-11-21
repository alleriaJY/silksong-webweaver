// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describePlayerDataKey, describeSceneEntry, getDictionaryIndex } from './dictionary.js';
import { buildExplorerRows, filterRows, summarizeCoverage, mountExplorer } from './explorer.js';
import { createSaveStore } from '../app/saveStore.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const COMPLETE_SAVE = JSON.parse(
    readFileSync(join(HERE, '..', 'data', '__fixtures__', 'complete.json'), 'utf-8'),
);

describe('savefile variable dictionary', () => {
    it('auto-derives verified entries from content packs and curated docs', () => {
        const idx = getDictionaryIndex();
        expect(idx.pdMap.size).toBeGreaterThan(250);
        expect(idx.sceneBoolMap.size).toBeGreaterThan(80);
        expect(idx.sceneIntMap.size).toBeGreaterThanOrEqual(6);

        expect(describePlayerDataKey('PurchasedBelltownMemoryLocket')).toEqual(
            expect.objectContaining({ status: 'verified', category: 'Collectables' }),
        );
        expect(describePlayerDataKey('CompletedEndings')).toEqual(
            expect.objectContaining({ status: 'verified', category: 'World & Story' }),
        );
        expect(describeSceneEntry('persistentBools', 'Shadow_27', 'Sack Corpse Pickup')).toEqual(
            expect.objectContaining({ status: 'verified', category: 'Collectables' }),
        );
    });

    it('classifies untracked keys via patterns and flags unknown keys', () => {
        expect(describePlayerDataKey('MetSomeCustomNpc')).toEqual(
            expect.objectContaining({ status: 'pattern', category: 'NPCs' }),
        );
        expect(describePlayerDataKey('totallyMadeUpFutureKey123')).toEqual(
            expect.objectContaining({ status: 'unknown', category: 'Undocumented' }),
        );
    });

    it('catalogues every playerData key in the 100% fixture with zero undocumented keys', () => {
        const rows = buildExplorerRows(COMPLETE_SAVE, 'playerData');
        const cov = summarizeCoverage(rows);
        expect(cov.total).toBe(Object.keys(COMPLETE_SAVE.playerData).length);
        expect(cov.verified).toBeGreaterThan(280);
        expect(cov.unknown).toBe(0);
    });
});

describe('explorer rows, filtering, and compare diff', () => {
    it('builds reference dictionary rows when no save is loaded', () => {
        const rows = buildExplorerRows(null, 'playerData');
        expect(rows.length).toBeGreaterThan(250);
        expect(rows.every(r => r.status === 'verified' && r.preview === '—')).toBe(true);
    });

    it('highlights changed values against a compare save and filters correctly', () => {
        const saveA = { playerData: { geo: 500, hasDash: true, customFlag: false }, sceneData: {} };
        const saveB = { playerData: { geo: 100, hasDash: true, customFlag: false }, sceneData: {} };
        const rows = buildExplorerRows(saveA, 'playerData', saveB);

        const changed = filterRows(rows, { valueMode: 'changed' });
        expect(changed.map(r => r.key)).toEqual(['geo']);
        expect(changed[0].comparePreview).toBe('100');

        const truthy = filterRows(rows, { valueMode: 'truthy' });
        expect(truthy.map(r => r.key).sort()).toEqual(['geo', 'hasDash']);

        const searched = filterRows(rows, { query: 'swift step' });
        expect(searched.map(r => r.key)).toEqual(['hasDash']);
    });

    it('mounts into a container, renders live save data, and switches roots', () => {
        const root = document.createElement('div');
        const store = createSaveStore();
        const explorer = mountExplorer(root, store);

        explorer.show();
        expect(root.querySelector('#explorer-subtitle').textContent).toContain('Reference dictionary');
        expect(root.querySelectorAll('#explorer-tbody tr').length).toBeGreaterThan(0);

        store.set({ status: 'ready', fileName: 'user3.dat', save: COMPLETE_SAVE });
        expect(root.querySelector('#explorer-subtitle').textContent).toContain('user3.dat');

        // Switch to sceneData persistentBools
        root.querySelector('[data-root="persistentBools"]').click();
        expect(root.querySelector('#explorer-match-count').textContent).toContain('persistentBools');
    });
});
