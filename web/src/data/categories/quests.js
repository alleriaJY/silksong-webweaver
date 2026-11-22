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
    const defs = ctx.lists('quests');
    const known = new Set(defs.map(def => def.json));

    const toEntry = def => {
        const d = data.get(def.json);
        const state = !d ? 'none' : d.IsCompleted ? 'completed' : d.IsAccepted ? 'active' : d.HasBeenSeen ? 'seen' : 'none';
        return {
            json: def.json,
            display: def.display,
            kind: def.kind || 'wish',
            intro: !!def.intro,
            variantGroup: def.variantGroup || null,
            variantNote: def.variantNote || null,
            infoNote: def.infoNote || null,
            state,
            progress: d?.CompletedCount || 0,
        };
    };

    // Collapse mutually exclusive variant groups (e.g. Broodfeast / Runtfeast) into one row
    const quests = [];
    const groups = new Map();
    for (const def of defs) {
        const entry = toEntry(def);
        if (!entry.variantGroup) {
            quests.push(entry);
            continue;
        }
        if (!groups.has(entry.variantGroup)) {
            const bucket = { entries: [entry], index: quests.length };
            groups.set(entry.variantGroup, bucket);
            quests.push(null);
        } else {
            groups.get(entry.variantGroup).entries.push(entry);
        }
    }
    for (const { entries, index } of groups.values()) {
        const best = entries.reduce((a, b) => (RANK[b.state] < RANK[a.state] ? b : a), entries[0]);
        const note = entries.find(e => e.variantNote)?.variantNote || '';
        const otherNames = entries.filter(e => e.json !== best.json).map(e => e.display);
        quests[index] = {
            ...best,
            display: best.state === 'none' ? entries.map(e => e.display).join(' / ') : best.display,
            variants: entries.map(({ json, display, state, progress }) => ({ json, display, state, progress })),
            variantAlt: best.state === 'none' ? 'Mutually exclusive' : `Alt: ${otherNames.join(' / ')}`,
            variantNote: note,
        };
    }

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
    const sorted = [...quests]
        .sort((a, b) => (b.intro ? 1 : 0) - (a.intro ? 1 : 0) || RANK[a.state] - RANK[b.state]);
    const rows = sorted.map(q => ({
        name: q.progress > 0 ? `${q.display} (${q.progress})` : q.display,
        collected: q.state === 'completed',
        pending: q.state === 'active',
        status: STATUS[q.state],
        variantAlt: q.variantAlt || null,
        variantNote: q.variantNote || null,
        infoNote: q.infoNote || null,
    }));
    renderChecklist(container, rows, null);
    container.querySelectorAll('.source-item').forEach((itemEl, i) => {
        const row = rows[i];
        const statusEl = itemEl.querySelector('.source-status');
        if (statusEl) statusEl.textContent = row.status;
        if (row.infoNote) {
            const hover = document.createElement('span');
            hover.className = 'info-hover';
            hover.tabIndex = 0;
            hover.setAttribute('aria-label', row.infoNote);
            const icon = document.createElement('span');
            icon.className = 'info-hover-icon';
            icon.setAttribute('aria-hidden', 'true');
            icon.textContent = 'i';
            const tip = document.createElement('span');
            tip.className = 'info-hover-tip';
            tip.setAttribute('role', 'tooltip');
            tip.textContent = row.infoNote;
            hover.append(icon, tip);
            itemEl.appendChild(hover);
        }
        if (row.variantAlt) {
            if (row.variantNote) itemEl.title = row.variantNote;
            const left = itemEl.querySelector('.source-left');
            if (left) {
                const tag = document.createElement('span');
                tag.className = 'quest-variant-tag';
                tag.textContent = row.variantAlt;
                if (row.variantNote) tag.title = row.variantNote;
                left.appendChild(tag);
            }
        }
    });
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
