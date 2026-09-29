/**
 * Completion model: recompute the game's completion percentage from parsed
 * data, one point per item, using the `completion(result, parsed)` hook that
 * categories declare. The game's own `completionPercentage` is the oracle.
 *
 * Verified on 9 saves across 4 game versions (0% to 100%), exact match:
 *   masks 5 + spool 9 + silk hearts 3 + needle 4 + crafting kit 4 + tool pouch 4
 *   + crests 6 (Hunter excluded) + abilities 6 + skills 6 + other unlockables 2
 *   + tools 51 = 100.
 * Bosses, maps, fleas and the Hunter's Journal do not count.
 */
import { setText } from '../ui/renderers.js';

export function computeCompletion(parsed, categories) {
    const byCategory = [];
    for (const category of categories) {
        if (!category.completion || !parsed[category.id]) continue;
        const part = category.completion(parsed[category.id], parsed);
        if (part) byCategory.push({ id: category.id, ...part });
    }
    const earned = byCategory.reduce((sum, p) => sum + p.earned, 0);
    const max = byCategory.reduce((sum, p) => sum + p.max, 0);
    const oracle = parsed.general?.completionPercentage?.value;
    return {
        earned,
        max,
        byCategory,
        oracle,
        // null when the save has no completionPercentage to compare with
        matchesGame: typeof oracle === 'number' ? Math.abs(earned - oracle) <= 0.5 : null,
    };
}

/** Unlockables tab: modelled total next to the game's number, plus the breakdown. */
export function renderCompletion(completion) {
    const modelled = document.getElementById('completion-modelled');
    if (!modelled || !completion) return;
    setText('completion-modelled-percent', `${completion.earned}%`);
    modelled.classList.toggle('mismatch', completion.matchesGame === false);
    modelled.title = completion.matchesGame === false
        ? `The game reports ${completion.oracle}%. Our model is missing something; please report this save.`
        : 'Recomputed from the items in this save; matches the game\'s own number.';

    const breakdown = document.getElementById('completion-breakdown');
    if (!breakdown) return;
    breakdown.innerHTML = '';
    for (const part of completion.byCategory) {
        const chip = document.createElement('span');
        chip.className = `completion-part${part.earned >= part.max ? ' complete' : ''}`;
        chip.textContent = `${part.label} `;
        const value = document.createElement('strong');
        value.textContent = `${part.earned}/${part.max}`;
        chip.appendChild(value);
        breakdown.appendChild(chip);
    }
}
