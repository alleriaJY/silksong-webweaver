/**
 * Browser twin of tools/unknown_keys.py: which playerData keys does no active
 * content pack read? Used by the local-only #dev page (dev/devPage.js).
 *
 * A key is "referenced" when it is a string anywhere in an active pack's lists
 * (json, flag, requires, allFlags, item, ...) or a container that category
 * code reads directly (CODE_READS). Unreferenced keys that match an
 * `untracked` pattern are "explained" (deliberately not shown, with a reason);
 * the rest are "unexplained": new content and missed items show up there.
 *
 * The Python tool scans source string literals instead, so its counts differ
 * slightly (it reports the containers below as unexplained).
 */
import { listNames, mergedList } from '../data/packs/index.js';

/** playerData keys read by category / timeline code rather than pack lists. */
export const CODE_READS = [
    'Collectables', 'MateriumCollected', 'MementosDeposited', 'Relics', 'Tools', 'ToolEquips',
    'ExtraToolEquips', 'QuestCompletionData', 'EnemyJournalKillData', 'StoryEvents',
    'scenesVisited', 'scenesMapped', 'nailUpgrades', 'CurrentCrestID', 'version',
];

/** Same buckets as unknown_keys.py PREFIXES, so both tools group alike. */
const PREFIXES = [
    'SavedFlea_', 'defeated', 'Defeated', 'Has', 'has', 'Purchased', 'purchased',
    'Collected', 'collected', 'met', 'Met', 'seen', 'Seen', 'visited', 'completed',
    'Completed', 'shop', 'Merchant', 'encountered', 'unlocked', 'Unlocked', 'got', 'opened',
];

export function groupOf(key) {
    const prefix = PREFIXES.find(p => key.startsWith(p));
    if (prefix) return `${prefix}*`;
    return key.endsWith('Defeated') ? '*Defeated' : '(other)';
}

function collectStrings(value, out) {
    if (typeof value === 'string') out.add(value);
    else if (Array.isArray(value)) for (const v of value) collectStrings(v, out);
    else if (value && typeof value === 'object') for (const v of Object.values(value)) collectStrings(v, out);
}

/** Every string the packs' lists hold (the untracked patterns themselves excepted). */
export function referencedKeys(packs) {
    const refs = new Set(CODE_READS);
    for (const name of listNames(packs)) {
        if (name === 'untracked') continue;
        collectStrings(mergedList(name, packs), refs);
    }
    return refs;
}

/** Short text for a value: scalars as-is, containers by kind and size. */
export function describeValue(value) {
    if (value === null || ['boolean', 'number'].includes(typeof value)) return String(value);
    if (typeof value === 'string') return value.length > 40 ? `"${value.slice(0, 40)}…"` : `"${value}"`;
    if (Array.isArray(value)) return `list (${value.length})`;
    return 'object';
}

/**
 * @param {object} playerData
 * @param {object[]} packs   active packs (data/packs/index.js#activePacks)
 * @param {{ boolsOnly?: boolean }} [o]
 * @returns {{ keyCount, unreferenced, explained: {id, reason, keys}[], unexplained: {group, keys}[] }}
 *   keys are [{ key, value }] sorted by name; explained by size, unexplained groups by size
 */
export function findUnknownKeys(playerData, packs, { boolsOnly = false } = {}) {
    const pd = playerData || {};
    const refs = referencedKeys(packs);
    const patterns = mergedList('untracked', packs).map(u => ({ ...u, rx: new RegExp(u.pattern) }));
    const explained = new Map();
    const unexplained = new Map();
    let unreferenced = 0;

    for (const key of Object.keys(pd).sort()) {
        const value = pd[key];
        if (refs.has(key) || (boolsOnly && typeof value !== 'boolean')) continue;
        unreferenced++;
        const hit = patterns.find(p => p.rx.test(key));
        const [map, id] = hit ? [explained, hit.id] : [unexplained, groupOf(key)];
        if (!map.has(id)) map.set(id, { id, reason: hit?.reason, keys: [] });
        map.get(id).keys.push({ key, value });
    }
    const bySize = (a, b) => b.keys.length - a.keys.length || a.id.localeCompare(b.id);
    return {
        keyCount: Object.keys(pd).length,
        unreferenced,
        explained: [...explained.values()].sort(bySize),
        unexplained: [...unexplained.values()].sort(bySize).map(({ id, keys }) => ({ group: id, keys })),
    };
}

/** Plain-text report of the unexplained keys, for the clipboard. */
export function reportText(result, fileName = '') {
    const lines = [`Unexplained playerData keys${fileName ? ` in ${fileName}` : ''}: ` +
        `${result.unexplained.reduce((n, g) => n + g.keys.length, 0)} of ${result.keyCount}`];
    for (const g of result.unexplained) {
        lines.push('', `== ${g.group} (${g.keys.length})`);
        for (const { key, value } of g.keys) lines.push(`  ${key} = ${describeValue(value)}`);
    }
    return lines.join('\n');
}
