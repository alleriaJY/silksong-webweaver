/**
 * Quests tab: QuestCompletionData by quest name. Quests do not count toward
 * the completion percentage.
 */
import { savedDataByName } from '../../core/saveAccess.js';
import { renderChecklist, setText } from '../../ui/renderers.js';

const STATUS = { completed: 'Completed', active: 'In progress', seen: 'Seen', none: 'Not started' };

/** ' (5/13)' toward a known goal, ' (5)' without one, '' before any progress. */
function progressText(q) {
    if (q.target) return q.progress > 0 || q.state !== 'none' ? ` (${Math.min(q.progress, q.target)}/${q.target})` : '';
    return q.progress > 0 ? ` (${q.progress})` : '';
}


export function parseQuests(save, ctx) {
    const data = savedDataByName(save.playerData?.QuestCompletionData);
    const quests = ctx.lists('quests').map(def => {
        const d = data.get(def.json);
        const state = !d ? 'none' : d.IsCompleted ? 'completed' : d.IsAccepted ? 'active' : d.HasBeenSeen ? 'seen' : 'none';
        return { json: def.json, display: def.display, group: def.group, target: def.target, where: def.where, state, progress: d?.CompletedCount || 0 };
    });
    const known = new Set(quests.map(q => q.json));
    const by = state => quests.filter(q => q.state === state).length;
    return {
        quests,
        unknownNames: [...data.keys()].filter(name => !known.has(name)),
        stats: { total: quests.length, completed: by('completed'), active: by('active') },
    };
}

export default {
    id: 'quests',
    parse: parseQuests,

    render(result) {
        const container = document.getElementById('quests-checklist');
        if (!container) return;
        // Completed first, then in progress, then the rest, keeping save order within each
        const rank = { completed: 0, active: 1, seen: 2, none: 3 };
        const rows = [...result.quests]
            .sort((a, b) => rank[a.state] - rank[b.state])
            .map(q => ({
                name: `${q.display}${progressText(q)}`,
                // where to find it, while there is still something to do
                title: q.state === 'completed' ? '' : q.where,
                collected: q.state === 'completed',
                pending: q.state === 'active',
                status: STATUS[q.state],
            }));
        renderChecklist(container, rows, null);
        container.querySelectorAll('.source-status').forEach((el, i) => { el.textContent = rows[i].status; });
        setText('quests-completed-count', result.stats.completed);
        setText('quests-active-count', result.stats.active);
        setText('quests-total-count', result.stats.total);
    },
};
