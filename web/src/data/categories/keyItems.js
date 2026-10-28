/**
 * Key Items card on the Collectables tab: Simple Keys, the Slab keys and the
 * other keys, one checklist row each (entries in packs/base/keyItems.js).
 */
import { parseSourceChecklist } from './checklists.js';
import { renderChecklist, setText } from '../../ui/renderers.js';

export function parseKeyItems(save, ctx) {
    const { sources, stats } = parseSourceChecklist(save.playerData, save.sceneData, ctx.lists('keySources'));
    return { items: sources, stats: { total: stats.total, obtained: stats.collected } };
}

export default {
    id: 'keyItems',
    parse: parseKeyItems,

    render(result) {
        const container = document.getElementById('key-items-checklist');
        if (!container) return;
        renderChecklist(container, result.items, null);
        container.querySelectorAll('.source-status').forEach((el, i) => {
            if (!result.items[i].pending) el.textContent = result.items[i].collected ? 'Obtained' : 'Missing';
        });
        setText('key-items-obtained-count', result.stats.obtained);
        setText('key-items-total-count', result.stats.total);
    },
};
