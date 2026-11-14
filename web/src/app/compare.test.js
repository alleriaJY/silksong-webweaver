// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { parseAllData } from '../data/categories/index.js';
import { diffParsedSaves, formatDelta, renderComparisonBanner } from './compare.js';

describe('save comparison', () => {
    it('formats numeric deltas with explicit signs', () => {
        expect(formatDelta(5)).toBe('+5');
        expect(formatDelta(-3)).toBe('-3');
        expect(formatDelta(0)).toBe('0');
    });

    it('diffs two parsed saves across progression categories', () => {
        const a = parseAllData({ hasDash: true, defeatedMossMother: true }, {});
        const b = parseAllData({ hasDash: true, hasWalljump: true, defeatedMossMother: true, defeatedLace1: true, BelltownHouseUnlocked: true }, {});
        const diff = diffParsedSaves(a, b, { baseName: 'user2.dat', otherName: 'user3.dat' });

        expect(diff.baseName).toBe('user2.dat');
        expect(diff.otherName).toBe('user3.dat');
        expect(diff.changedCount).toBeGreaterThan(0);

        const bosses = diff.categories.find(c => c.id === 'bosses');
        expect(bosses).toMatchObject({ base: 1, other: 2, delta: 1 });

        const abilities = diff.categories.find(c => c.id === 'abilities');
        expect(abilities).toMatchObject({ base: 1, other: 2, delta: 1 });

        const keyItems = diff.categories.find(c => c.id === 'keyItems');
        expect(keyItems).toMatchObject({ base: 0, other: 1, delta: 1 });
    });

    it('renders and clears the comparison banner DOM', () => {
        const container = document.createElement('div');
        container.hidden = true;
        const a = parseAllData({}, {});
        const b = parseAllData({ defeatedMossMother: true }, {});
        const diff = diffParsedSaves(a, b, { baseName: 'early.dat', otherName: 'late.dat' });
        const onClear = vi.fn();

        renderComparisonBanner(container, diff, { onClear });
        expect(container.hidden).toBe(false);
        expect(container.querySelector('.compare-title').textContent).toContain('early.dat');
        expect(container.querySelector('.compare-title').textContent).toContain('late.dat');
        expect(container.querySelectorAll('.compare-item').length).toBe(diff.categories.length);

        container.querySelector('.compare-close-btn').click();
        expect(onClear).toHaveBeenCalledOnce();

        renderComparisonBanner(container, null);
        expect(container.hidden).toBe(true);
        expect(container.children.length).toBe(0);
    });
});
