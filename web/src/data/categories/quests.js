/**
 * Quests & Wishes tab: QuestCompletionData by quest name, split into
 * Main Quests, Wishes (with Intro leads first), and Courier Deliveries.
 * Quests do not count toward the completion percentage.
 */
import { savedDataByName } from '../../core/saveAccess.js';
import { renderChecklist, setText } from '../../ui/renderers.js';

const STATUS = { completed: 'Completed', active: 'In progress', seen: 'Seen', none: 'Not started' };
const RANK = { completed: 0, active: 1, seen: 2, none: 3 };

const SECTIONS = [
    { kind: 'quest', container: 'main-quests-checklist', completedId: 'main-quests-completed-count', totalId: 'main-quests-total-count' },
    { kind: 'wish', container: 'wishes-checklist', completedId: 'wishes-completed-count', totalId: 'wishes-total-count' },
    { kind: 'delivery', container: 'deliveries-checklist', completedId: 'deliveries-completed-count', totalId: 'deliveries-total-count' },
];

export function parseQuests(save, ctx) {
    const data = savedDataByName(save.playerData?.QuestCompletionData);
    const quests = ctx.lists('quests').map(def => {
        const d = data.get(def.json);
        const state = !d ? 'none' : d.IsCompleted ? 'completed' : d.IsAccepted ? 'active' : d.HasBeenSeen ? 'seen' : 'none';
        return {
            json: def.json,
            display: def.display,
            kind: def.kind || 'wish',
            intro: !!def.intro,
            state,
            progress: d?.CompletedCount || 0,
        };
    });
    const known = new Set(quests.map(q => q.json));
    const by = state => quests.filter(q => q.state === state).length;
    return {
        quests,
        unknownNames: [...data.keys()].filter(name => !known.has(name)),
        stats: { total: quests.length, completed: by('completed'), active: by('active') },
    };
}

function renderQuestSection(quests, { container: containerId, completedId, totalId }) {
    const container = document.getElementById(containerId);
    if (!container) return;
    // Intro pre-quest leads stay at the very front, then completed -> active -> seen -> none
    const rows = [...quests]
        .sort((a, b) => (b.intro ? 1 : 0) - (a.intro ? 1 : 0) || RANK[a.state] - RANK[b.state])
        .map(q => ({
            name: q.progress > 0 ? `${q.display} (${q.progress})` : q.display,
            collected: q.state === 'completed',
            pending: q.state === 'active',
            status: STATUS[q.state],
        }));
    renderChecklist(container, rows, null);
    container.querySelectorAll('.source-status').forEach((el, i) => { el.textContent = rows[i].status; });
    setText(completedId, quests.filter(q => q.state === 'completed').length);
    setText(totalId, quests.length);
}

export default {
    id: 'quests',
    parse: parseQuests,

    render(result) {
        if (!document.getElementById('panel-quests')) return;
        for (const section of SECTIONS) {
            const ofKind = result.quests.filter(q => q.kind === section.kind);
            renderQuestSection(ofKind, section);
        }
        setText('quests-completed-count', result.stats.completed);
        setText('quests-active-count', result.stats.active);
        setText('quests-total-count', result.stats.total);
    },
};
