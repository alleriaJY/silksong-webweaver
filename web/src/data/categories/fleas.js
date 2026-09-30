/**
 * Fleas tab: one playerData boolean per flea. kind 'flea' = SavedFlea_<scene>
 * rescues, 'special' = named fleas recruited through events (Kratt, Huge Flea,
 * Vog). All count toward the Fleatopia total. Fleas are not part of the
 * completion percentage.
 */
import { iconUrl } from '../../core/icons.js';
import { renderChecklist, setText } from '../../ui/renderers.js';

// No generic flea sprite in the assets yet (ROADMAP Appendix A); the Huge Flea
// portrait stands in for every row.
const FLEA_ICON = iconUrl('boss', 'Huge Flea - Giant Flea.png');

export function parseFleas(save, ctx) {
    const fleas = ctx.lists('fleas').map(def => ({
        json: def.json,
        display: def.display,
        kind: def.kind,
        value: save.playerData?.[def.json] || false,
    }));
    return { fleas, stats: { total: fleas.length, saved: fleas.filter(f => f.value).length } };
}

function renderKind(result, kind, containerId, countId, totalId) {
    const fleas = result.fleas.filter(f => f.kind === kind);
    const container = document.getElementById(containerId);
    renderChecklist(container, fleas.map(f => ({ name: f.display, collected: f.value, pending: false })), () => FLEA_ICON);
    if (!container) return;
    // A checklist row says "Collected"; for fleas "Saved" reads right
    for (const status of container.querySelectorAll('.source-item.collected .source-status')) status.textContent = 'Saved';
    setText(countId, fleas.filter(f => f.value).length);
    setText(totalId, fleas.length);
}

export default {
    id: 'fleas',
    parse: parseFleas,

    render(result) {
        if (!document.getElementById('panel-fleas')) return;
        setText('fleas-saved-count', result.stats.saved);
        setText('fleas-total-count', result.stats.total);
        renderKind(result, 'flea', 'fleas-checklist', 'fleas-scattered-count', 'fleas-scattered-total');
        renderKind(result, 'special', 'special-fleas-checklist', 'fleas-special-count', 'fleas-special-total');
    },
};
