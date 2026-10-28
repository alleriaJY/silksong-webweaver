/**
 * Maps tab, Travel section: Bellway stations, Ventrica tubes, map pins and
 * markers (all playerData booleans). Not part of the completion percentage.
 */
import { iconUrl } from '../../core/icons.js';
import { renderChecklist, setText } from '../../ui/renderers.js';

const SECTIONS = [
    { kind: 'bellway', container: 'bellway-checklist', count: 'bellway-count', total: 'bellway-total', status: 'Unlocked' },
    { kind: 'ventrica', container: 'ventrica-checklist', count: 'ventrica-count', total: 'ventrica-total', status: 'Unlocked' },
    { kind: 'pin', container: 'map-pins-checklist', count: 'map-pins-count', total: 'map-pins-total', status: 'Owned' },
];

export function parseTravel(save, ctx) {
    const items = ctx.lists('travel').map(def => ({
        json: def.json, display: def.display, kind: def.kind, icon: def.icon, value: !!save.playerData?.[def.json],
    }));
    const stats = {};
    for (const { kind } of SECTIONS) {
        const ofKind = items.filter(i => i.kind === kind);
        stats[kind] = { total: ofKind.length, unlocked: ofKind.filter(i => i.value).length };
    }
    return { items, stats };
}

export default {
    id: 'travel',
    parse: parseTravel,

    render(result) {
        for (const s of SECTIONS) {
            const container = document.getElementById(s.container);
            if (!container) continue;
            const rows = result.items.filter(i => i.kind === s.kind)
                .map(i => ({ name: i.display, icon: i.icon, collected: i.value, pending: false }));
            renderChecklist(container, rows, r => (r.icon ? iconUrl('map', r.icon) : null));
            container.querySelectorAll('.source-item.collected .source-status').forEach(el => { el.textContent = s.status; });
            setText(s.count, result.stats[s.kind].unlocked);
            setText(s.total, result.stats[s.kind].total);
        }
    },
};
