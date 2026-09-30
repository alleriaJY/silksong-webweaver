/**
 * Hunter's Journal tab: EnemyJournalKillData.list matched by internal Name.
 * An enemy is "encountered" when the save has a Record for it. Kills are
 * shown; "complete" needs killsRequired, which is not in the save and stays
 * null until filled from the wiki. The journal does not count toward
 * completion, so there is no completion() hook.
 */
import { savedDataByName } from '../../core/saveAccess.js';
import { iconUrl, placeholderIconUrl } from '../../core/icons.js';
import { renderIconGrid, setText } from '../../ui/renderers.js';

export function parseJournal(save, ctx) {
    const records = savedDataByName(save.playerData?.EnemyJournalKillData);
    const entries = ctx.lists('journal').map(def => {
        const record = records.get(def.json);
        const kills = record?.Kills || 0;
        const killsRequired = def.killsRequired ?? null;
        return {
            json: def.json,
            display: def.display,
            icon: def.icon,
            encountered: !!record,
            kills,
            killsRequired,
            complete: killsRequired !== null && kills >= killsRequired,
        };
    });
    // Names the save has but no pack knows: new content, or a pack gap
    const known = new Set(entries.map(e => e.json));
    const unknownNames = [...records.keys()].filter(name => !known.has(name));
    return {
        entries,
        unknownNames,
        stats: {
            total: entries.length,
            encountered: entries.filter(e => e.encountered).length,
            kills: entries.reduce((sum, e) => sum + e.kills, 0),
        },
    };
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

export default {
    id: 'journal',
    parse: parseJournal,

    render(result) {
        const grid = document.getElementById('journal-grid');
        if (!grid) return;
        renderIconGrid(grid, result.entries, {
            itemClass: 'journal-item', isOn: e => e.encountered,
            icon: e => (e.icon ? iconUrl('journal', e.icon) : placeholderIconUrl()),
            title: e => (e.encountered ? `${e.display}: ${plural(e.kills, 'kill')}` : `${e.display}: not encountered`),
            detail: e => (e.encountered ? plural(e.kills, 'kill') : ''),
        });
        setText('journal-encountered-count', result.stats.encountered);
        setText('journal-total-count', result.stats.total);
        setText('journal-kills-count', result.stats.kills.toLocaleString());
    },
};
