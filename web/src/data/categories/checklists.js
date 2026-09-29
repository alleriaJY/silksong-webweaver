/**
 * Source checklists: which world pickup / purchase / quest each upgrade piece
 * comes from. One factory builds the eight checklist categories; each config
 * says which pack list to read and which elements to fill.
 *
 * flagType (see packs/base/unlockables.js):
 *   bool    playerData boolean          quest   QuestCompletionData IsCompleted
 *   scene   sceneData.persistentBools   flea    FleasCollectedTargetOrder heuristic
 *   unknown flag not identified yet -> rendered as Pending
 */
import { questCompleted, scenePickup } from '../../core/saveAccess.js';
import { field } from './common.js';
import { iconUrl } from '../../core/icons.js';
import { renderChecklist, setText } from '../../ui/renderers.js';

/**
 * Best-effort check for the flea-rescue-order Tool Pouch source. The exact
 * threshold is unconfirmed: any recorded rescue (value !== -1) counts.
 */
function fleaProgress(playerData, key) {
    const arr = playerData?.[key];
    if (!Array.isArray(arr)) return { collected: false, count: 0 };
    const count = arr.filter(v => v !== -1).length;
    return { collected: count > 0, count };
}

export function parseSourceChecklist(playerData, sceneData, sourceList) {
    const sources = sourceList.map(src => {
        let collected = false;
        let pending = false;
        let progress = null;
        switch (src.flagType) {
            case 'bool':
                collected = !!playerData?.[src.flag];
                break;
            case 'quest':
                collected = questCompleted(playerData, src.flag);
                break;
            case 'scene':
                collected = scenePickup(sceneData, src.sceneName, src.sceneId);
                break;
            case 'flea': {
                const r = fleaProgress(playerData, src.flag);
                collected = r.collected;
                progress = r.count;
                break;
            }
            default:
                pending = true;
        }
        return { id: src.id, name: src.name, icon: src.icon, flagType: src.flagType, collected, pending, progress };
    });
    return {
        sources,
        stats: {
            total: sources.length,
            collected: sources.filter(s => s.collected).length,
            pending: sources.filter(s => s.pending).length,
        },
    };
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/**
 * @param {object} c
 * @param {string} c.id            key in parsed data
 * @param {string} c.list          pack list name
 * @param {string} c.container     checklist element id
 * @param {string} [c.collectedId] element for "N collected"
 * @param {Function} [c.unlocked]  parsed => upgrades earned (drives unlockedId/percentId)
 * @param {string} [c.unlockedId]
 * @param {string} [c.percentId]   "N%": each upgrade is worth 1% of completion
 */
function checklist(c) {
    return {
        id: c.id,
        parse: (save, ctx) => parseSourceChecklist(save.playerData, save.sceneData, ctx.lists(c.list)),
        render(result, ctx) {
            const container = document.getElementById(c.container);
            renderChecklist(container, result.sources, s => (s.icon ? iconUrl('general', s.icon) : null));
            if (container && c.collectedId) setText(c.collectedId, result.stats.collected);
            const earned = c.unlocked ? c.unlocked(ctx.parsed, result) : null;
            if (earned !== null) {
                if (c.unlockedId) setText(c.unlockedId, earned);
                if (c.percentId) setText(c.percentId, `${earned}%`);
            }
        },
    };
}

const general = (parsed, name) => field(parsed, 'general', name);

export const CHECKLISTS = [
    // 4 shards = 1 mask; base 5 masks, 5 extra = 5%
    checklist({
        id: 'maskShards', list: 'maskShardSources', container: 'mask-shards-checklist', collectedId: 'mask-shards-collected-count',
        unlocked: p => clamp((general(p, 'maxHealth') || 5) - 5, 0, 5), unlockedId: 'masks-unlocked-count', percentId: 'masks-percent',
    }),
    // 2 fragments = 1 spool point; base 9 silk, 9 extra = 9%
    checklist({
        id: 'spoolFragments', list: 'spoolFragmentSources', container: 'spool-fragments-checklist', collectedId: 'spool-fragments-collected-count',
        unlocked: p => clamp((general(p, 'silkMax') || 9) - 9, 0, 9), unlockedId: 'silk-spool-unlocked-count', percentId: 'silk-spool-percent',
    }),
    checklist({
        id: 'silkHearts', list: 'silkHeartSources', container: 'silk-hearts-checklist',
        unlocked: p => general(p, 'silkRegenMax') || 0, unlockedId: 'silk-hearts-unlocked-count', percentId: 'silk-hearts-percent',
    }),
    checklist({
        id: 'toolPouch', list: 'toolPouchSources', container: 'tool-pouch-checklist',
        unlocked: p => general(p, 'ToolPouchUpgrades') || 0, unlockedId: 'pouch-unlocked-count', percentId: 'pouch-percent',
    }),
    checklist({
        id: 'craftingKit', list: 'craftingKitSources', container: 'crafting-kit-checklist',
        unlocked: p => general(p, 'ToolKitUpgrades') || 0, unlockedId: 'crafting-unlocked-count', percentId: 'crafting-percent',
    }),
    // Everbloom + Sylphsong, 1% each
    checklist({
        id: 'otherUnlockables', list: 'otherUnlockableSources', container: 'other-unlockables-checklist',
        unlocked: (p, r) => r.stats.collected, unlockedId: 'other-unlockables-count', percentId: 'other-unlockables-percent',
    }),
    checklist({ id: 'craftmetal', list: 'craftmetalSources', container: 'craftmetal-checklist', collectedId: 'craftmetal-collected-count' }),
    checklist({ id: 'memoryLockets', list: 'memoryLocketSources', container: 'memory-lockets-checklist', collectedId: 'memory-lockets-collected-count' }),
];
