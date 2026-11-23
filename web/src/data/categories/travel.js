/**
 * Maps tab, Travel section: Bellway stations, Ventrica tubes and map pins
 * (all playerData booleans). Not part of the completion percentage.
 */
import { iconUrl } from '../../core/icons.js';
import { renderChecklist, setText } from '../../ui/renderers.js';

const SECTIONS = [
    { kind: 'bellway', container: 'bellway-checklist', count: 'bellway-count', total: 'bellway-total', status: 'Unlocked' },
    { kind: 'ventrica', container: 'ventrica-checklist', count: 'ventrica-count', total: 'ventrica-total', status: 'Unlocked' },
    { kind: 'pin', container: 'map-pins-checklist', count: 'map-pins-count', total: 'map-pins-total', status: 'Owned' },
];

const QUILL_LABELS = { 0: 'None', 1: 'White Quill', 2: 'Red Quill', 3: 'Purple Quill' };
// QuillState: 1 = white (bought from Shakra), 2 = red (taken from Trobbio's
// desk in Act 2 without a quill), 3 = purple (same, in Act 3). The inventory
// shows the quill on its own until Hornet owns a map, then "Map & Quill".
const QUILL_COLOUR_SUFFIX = { 2: '_red', 3: '_purple' };

export function quillIcon(state, hasMap) {
    return `${hasMap ? 'I_quill_and_map' : 'I_quill'}${QUILL_COLOUR_SUFFIX[state] || ''}.png`;
}

export function parseTravel(save, ctx) {
    const pd = save.playerData || {};
    const items = ctx.lists('travel').map(def => ({
        json: def.json, display: def.display, kind: def.kind, icon: def.icon, iconKind: def.iconKind, value: !!pd[def.json],
    }));
    const stats = {};
    for (const { kind } of SECTIONS) {
        const ofKind = items.filter(i => i.kind === kind);
        stats[kind] = { total: ofKind.length, unlocked: ofKind.filter(i => i.value).length };
    }
    const quillState = pd.hasQuill ? (Number(pd.QuillState) || 1) : 0;
    const hasMap = ctx.lists('maps').some(m => !!pd[m.json]);
    const quill = {
        owned: !!pd.hasQuill,
        state: quillState,
        hasMap,
        icon: quillIcon(quillState, hasMap),
        label: QUILL_LABELS[quillState] || `Quill (state ${quillState})`,
    };
    return { items, quill, stats };
}

export default {
    id: 'travel',
    parse: parseTravel,

    render(result) {
        for (const s of SECTIONS) {
            const container = document.getElementById(s.container);
            if (!container) continue;
            const rows = result.items.filter(i => i.kind === s.kind)
                .map(i => ({ name: i.display, icon: i.icon, iconKind: i.iconKind, collected: i.value, pending: false }));
            if (s.kind === 'pin' && result.quill) {
                rows.push({
                    name: result.quill.owned ? result.quill.label : 'Quill',
                    icon: result.quill.icon,
                    iconKind: 'quill',
                    collected: result.quill.owned,
                    pending: false,
                });
            }
            renderChecklist(container, rows, r => (r.icon ? iconUrl(r.iconKind || 'map', r.icon) : null));
            container.querySelectorAll('.source-item.collected .source-status').forEach(el => { el.textContent = s.status; });
            setText(s.count, result.stats[s.kind].unlocked);
            setText(s.total, result.stats[s.kind].total);
        }
        setText('quill-state-label', result.quill.label);
    },
};
