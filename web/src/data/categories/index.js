/**
 * Category registry: the ordered list of everything the stats page parses
 * and renders. Each category is { id, parse(save, ctx), render?(result, ctx),
 * completion?(result, parsed) -> { label, earned, max } } (see data/completion.js)
 * (template: ROADMAP.md Appendix C).
 *
 *   parse ctx  { save, packs, lists(name) }      lists() = merged pack list
 *   render ctx { parsed, isSteelSoul }
 *
 * parse() is pure and must not touch the DOM. render() only writes elements
 * of its own section and does nothing when they are absent.
 */
import { activePacks, mergedList } from '../packs/index.js';
import general from './general.js';
import current from './current.js';
import misc from './misc.js';
import equippedTools from './equippedTools.js';
import tools from './tools.js';
import crests from './crests.js';
import fleas from './fleas.js';
import needle from './needle.js';
import { abilities, skills, maps, bosses } from './flags.js';
import { CHECKLISTS } from './checklists.js';
import { computeCompletion, renderCompletion } from '../completion.js';

export const CATEGORIES = [
    general,
    current,
    misc,
    equippedTools,
    abilities,
    skills,
    tools,
    crests,
    needle,
    ...CHECKLISTS,
    bosses,
    fleas,
    maps,
];

/** Parse context for a save; `packs` defaults to the packs that detect it. */
export function makeContext(save, packs = activePacks(save)) {
    const cache = new Map();
    return {
        save,
        packs,
        lists(name) {
            if (!cache.has(name)) cache.set(name, mergedList(name, packs));
            return cache.get(name);
        },
    };
}

/**
 * Parse every category. Returns null without playerData. The result keeps
 * `raw` / `rawScene` for code that needs untouched save data, and `packs`
 * (ids of the content packs active for this save).
 */
export function parseAllData(playerData, sceneData) {
    if (!playerData) return null;
    const save = { playerData, sceneData };
    const ctx = makeContext(save);
    const parsed = {};
    for (const category of CATEGORIES) parsed[category.id] = category.parse(save, ctx);
    parsed.completion = computeCompletion(parsed, CATEGORIES);
    parsed.packs = ctx.packs.map(p => p.id);
    parsed.raw = playerData;
    parsed.rawScene = sceneData;
    return parsed;
}

/** Render every category into the stats page. */
export function renderAll(parsed) {
    const ctx = { parsed, isSteelSoul: !!parsed.general?.permadeathMode?.value };
    for (const category of CATEGORIES) {
        if (category.render) category.render(parsed[category.id], ctx);
    }
    renderCompletion(parsed.completion);
}
