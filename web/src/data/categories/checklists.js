/**
 * Source checklists: which world pickup / purchase / quest each upgrade piece
 * comes from. One factory builds the eight checklist categories; each config
 * says which pack list to read and which elements to fill.
 *
 * flagType (see packs/base/unlockables.js):
 *   bool    playerData boolean (flag may be a list: any)    quest   QuestCompletionData IsCompleted
 *   atLeast playerData number >= min    scene   sceneData.persistentBools (sceneId may be a list: any)
 *   unknown flag not identified yet -> rendered as Pending
 */
import { questCompleted, scenePickup } from '../../core/saveAccess.js';
import { field } from './common.js';
import { iconUrl } from '../../core/icons.js';
import { renderChecklist, setText } from '../../ui/renderers.js';

export function parseSourceChecklist(playerData, sceneData, sourceList) {
    const sources = sourceList.map(src => {
        let collected = false;
        let pending = false;
        switch (src.flagType) {
            case 'bool':
                collected = [src.flag].flat().some(f => !!playerData?.[f]);
                break;
            case 'atLeast':
                collected = (Number(playerData?.[src.flag]) || 0) >= src.min;
                break;
            case 'quest':
                collected = questCompleted(playerData, src.flag);
                break;
            case 'scene':
                collected = [src.sceneId].flat().some(id => scenePickup(sceneData, src.sceneName, id));
                break;
            default:
                pending = true;
        }
        return { id: src.id, name: src.name, icon: src.icon, flagType: src.flagType, collected, pending };
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
 * @param {string} [c.collectedTotalId] element for the number of sources
 * @param {string} [c.unlockedTotalId]  element for the upgrade maximum (completion.max)
 * @param {Function} [c.unlocked]  parsed => upgrades earned (drives unlockedId/percentId)
 * @param {string} [c.unlockedId]
 * @param {string} [c.percentId]   "N%": each upgrade is worth 1% of completion
 * @param {object} [c.completion]  { label, max(result) } -> counts toward completion
 */
function checklist(c) {
    return {
        id: c.id,
        parse: (save, ctx) => parseSourceChecklist(save.playerData, save.sceneData, ctx.lists(c.list)),
        completion: c.completion
            ? (result, parsed) => ({ label: c.completion.label, earned: c.unlocked(parsed, result), max: c.completion.max(result) })
            : undefined,
        render(result, ctx) {
            const container = document.getElementById(c.container);
            renderChecklist(container, result.sources, s => (s.icon ? iconUrl('general', s.icon) : null));
            if (container && c.collectedId) setText(c.collectedId, result.stats.collected);
            if (c.collectedTotalId) setText(c.collectedTotalId, result.stats.total);
            if (c.unlockedTotalId && c.completion) setText(c.unlockedTotalId, c.completion.max(result));
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
        collectedTotalId: 'mask-shards-total', unlockedTotalId: 'masks-total',
        unlocked: p => clamp((general(p, 'maxHealth') || 5) - 5, 0, 5), unlockedId: 'masks-unlocked-count', percentId: 'masks-percent',
        completion: { label: 'Masks', max: () => 5 },
    }),
    // 2 fragments = 1 spool point; base 9 silk, 9 extra = 9%
    checklist({
        id: 'spoolFragments', list: 'spoolFragmentSources', container: 'spool-fragments-checklist', collectedId: 'spool-fragments-collected-count',
        collectedTotalId: 'spool-fragments-total', unlockedTotalId: 'silk-spool-total',
        unlocked: p => clamp((general(p, 'silkMax') || 9) - 9, 0, 9), unlockedId: 'silk-spool-unlocked-count', percentId: 'silk-spool-percent',
        completion: { label: 'Silk Spool', max: () => 9 },
    }),
    checklist({
        id: 'silkHearts', list: 'silkHeartSources', container: 'silk-hearts-checklist', unlockedTotalId: 'silk-hearts-total',
        unlocked: p => general(p, 'silkRegenMax') || 0, unlockedId: 'silk-hearts-unlocked-count', percentId: 'silk-hearts-percent',
        completion: { label: 'Silk Hearts', max: r => r.stats.total },
    }),
    checklist({
        id: 'toolPouch', list: 'toolPouchSources', container: 'tool-pouch-checklist', unlockedTotalId: 'pouch-total',
        unlocked: p => general(p, 'ToolPouchUpgrades') || 0, unlockedId: 'pouch-unlocked-count', percentId: 'pouch-percent',
        completion: { label: 'Tool Pouch', max: r => r.stats.total },
    }),
    checklist({
        id: 'craftingKit', list: 'craftingKitSources', container: 'crafting-kit-checklist', unlockedTotalId: 'crafting-total',
        unlocked: p => general(p, 'ToolKitUpgrades') || 0, unlockedId: 'crafting-unlocked-count', percentId: 'crafting-percent',
        completion: { label: 'Crafting Kit', max: r => r.stats.total },
    }),
    // Everbloom + Sylphsong, 1% each
    checklist({
        id: 'otherUnlockables', list: 'otherUnlockableSources', container: 'other-unlockables-checklist', unlockedTotalId: 'other-unlockables-total',
        unlocked: (p, r) => r.stats.collected, unlockedId: 'other-unlockables-count', percentId: 'other-unlockables-percent',
        completion: { label: 'Other', max: r => r.stats.total },
    }),
    checklist({ id: 'craftmetal', list: 'craftmetalSources', container: 'craftmetal-checklist', collectedId: 'craftmetal-collected-count', collectedTotalId: 'craftmetal-total' }),
    checklist({ id: 'memoryLockets', list: 'memoryLocketSources', container: 'memory-lockets-checklist', collectedId: 'memory-lockets-collected-count', collectedTotalId: 'memory-lockets-total' }),
];
