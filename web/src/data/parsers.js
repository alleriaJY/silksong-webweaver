/**
 * Compatibility shim: parsing now lives in one module per category under
 * data/categories/ (registry: data/categories/index.js). These wrappers keep
 * the historical `parseX(playerData)` signatures, parsing against every
 * registered pack. New code should use parseAllData() or a category's
 * parse(save, ctx). Removed in ROADMAP Phase 4.
 */
import { makeContext } from './categories/index.js';
import { parseTools as tools } from './categories/tools.js';
import { parseEquippedTools as equipped } from './categories/equippedTools.js';
import { parseCrests as crests } from './categories/crests.js';
import { parseFleas as fleas } from './categories/fleas.js';
import { parseAbilities as abilities, parseSkills as skills, parseMaps as maps, parseBosses as bosses } from './categories/flags.js';

export { formatPlayTime, formatNumber, formatPercent } from '../core/format.js';
export { parseSimpleFields, parseBooleanFlags } from './categories/common.js';
export { parseSourceChecklist } from './categories/checklists.js';
export { parseAllData } from './categories/index.js';

const wrap = (parse) => (playerData, sceneData) => {
    const save = { playerData, sceneData };
    return parse(save, makeContext(save));
};

export const parseTools = wrap(tools);
export const parseEquippedTools = wrap(equipped);
export const parseCrests = wrap(crests);
export const parseFleas = wrap(fleas);
export const parseAbilities = wrap(abilities);
export const parseSkills = wrap(skills);
export const parseMaps = wrap(maps);
export const parseBosses = wrap(bosses);
