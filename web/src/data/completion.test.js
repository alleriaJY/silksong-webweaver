// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { computeCompletion, renderCompletion } from './completion.js';

const categories = [
    { id: 'a', completion: r => ({ label: 'A', earned: r.n, max: 2 }) },
    { id: 'b' }, // no completion hook: ignored
    { id: 'c', completion: () => null }, // opted out for this save
];

describe('completion model', () => {
    it('sums declared parts and compares with the game number', () => {
        const parsed = { a: { n: 2 }, b: {}, c: {}, general: { completionPercentage: { value: 2 } } };
        expect(computeCompletion(parsed, categories)).toMatchObject({ earned: 2, max: 2, oracle: 2, matchesGame: true });
    });

    it('flags a mismatch and has no verdict without an oracle', () => {
        expect(computeCompletion({ a: { n: 1 }, general: { completionPercentage: { value: 2 } } }, categories).matchesGame).toBe(false);
        expect(computeCompletion({ a: { n: 1 } }, categories).matchesGame).toBeNull();
    });

    it('renders the mismatch state', () => {
        document.body.innerHTML = '<span id="completion-modelled"><strong id="completion-modelled-percent"></strong></span><div id="completion-breakdown"></div>';
        renderCompletion(computeCompletion({ a: { n: 1 }, general: { completionPercentage: { value: 2 } } }, categories));
        const el = document.getElementById('completion-modelled');
        expect(el.classList.contains('mismatch')).toBe(true);
        expect(el.title).toContain('The game reports 2%');
        expect(document.getElementById('completion-modelled-percent').textContent).toBe('1%');
        expect(document.getElementById('completion-breakdown').textContent).toBe('A 1/2');
    });
});
