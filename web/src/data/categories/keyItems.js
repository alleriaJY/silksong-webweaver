/** Key Items card on the Collectables tab: keys and story items, one checklist row each. */
import { parseBooleanFlags } from './common.js';
import { renderChecklist, setText } from '../../ui/renderers.js';

export function parseKeyItems(save, ctx) {
    const defs = ctx.lists('keyItems');
    const items = parseBooleanFlags(save.playerData, defs).map((item, i) => ({ ...item, note: defs[i].note }));
    return { items, stats: { total: items.length, obtained: items.filter(k => k.value).length } };
}

export default {
    id: 'keyItems',
    parse: parseKeyItems,

    render(result) {
        const container = document.getElementById('key-items-checklist');
        if (!container) return;
        const rows = result.items.map(k => ({ name: k.note ? `${k.display} (${k.note})` : k.display, collected: k.value, pending: false }));
        renderChecklist(container, rows, null);
        container.querySelectorAll('.source-status').forEach((el, i) => { el.textContent = rows[i].collected ? 'Obtained' : 'Missing'; });
        setText('key-items-obtained-count', result.stats.obtained);
        setText('key-items-total-count', result.stats.total);
    },
};
