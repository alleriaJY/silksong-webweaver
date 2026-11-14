/**
 * Compare two parsed saves (base vs comparison save) across progression categories.
 */

const METRICS = [
    { id: 'completion', label: 'Completion %', get: p => ({ count: p.completion?.earned ?? 0, total: 100 }) },
    { id: 'bosses', label: 'Bosses', get: p => ({ count: p.bosses?.stats?.defeated ?? 0, total: p.bosses?.stats?.total ?? 0 }) },
    { id: 'tools', label: 'Tools', get: p => ({ count: p.tools?.stats?.unlocked ?? 0, total: p.tools?.stats?.total ?? 0 }) },
    { id: 'abilities', label: 'Abilities', get: p => ({ count: p.abilities?.stats?.unlocked ?? 0, total: p.abilities?.stats?.total ?? 0 }) },
    { id: 'skills', label: 'Skills', get: p => ({ count: p.skills?.stats?.unlocked ?? 0, total: p.skills?.stats?.total ?? 0 }) },
    { id: 'crests', label: 'Crests', get: p => ({ count: p.crests?.stats?.unlocked ?? 0, total: p.crests?.stats?.total ?? 0 }) },
    { id: 'maskShards', label: 'Mask Shards', get: p => ({ count: p.maskShards?.stats?.collected ?? 0, total: p.maskShards?.stats?.total ?? 0 }) },
    { id: 'spoolFragments', label: 'Spool Fragments', get: p => ({ count: p.spoolFragments?.stats?.collected ?? 0, total: p.spoolFragments?.stats?.total ?? 0 }) },
    { id: 'silkHearts', label: 'Silk Hearts', get: p => ({ count: p.silkHearts?.stats?.collected ?? 0, total: p.silkHearts?.stats?.total ?? 0 }) },
    { id: 'toolPouch', label: 'Tool Pouch', get: p => ({ count: p.toolPouch?.stats?.collected ?? 0, total: p.toolPouch?.stats?.total ?? 0 }) },
    { id: 'craftingKit', label: 'Crafting Kit', get: p => ({ count: p.craftingKit?.stats?.collected ?? 0, total: p.craftingKit?.stats?.total ?? 0 }) },
    { id: 'fleas', label: 'Fleas', get: p => ({ count: p.fleas?.stats?.saved ?? 0, total: p.fleas?.stats?.total ?? 0 }) },
    { id: 'maps', label: 'Maps', get: p => ({ count: p.maps?.stats?.unlocked ?? 0, total: p.maps?.stats?.total ?? 0 }) },
    { id: 'quests', label: 'Quests Completed', get: p => ({ count: p.quests?.stats?.completed ?? 0, total: p.quests?.stats?.total ?? 0 }) },
    { id: 'journalEncountered', label: 'Journal Encountered', get: p => ({ count: p.journal?.stats?.encountered ?? 0, total: p.journal?.stats?.total ?? 0 }) },
    { id: 'journalCompleted', label: 'Journal Completed', get: p => ({ count: p.journal?.stats?.completed ?? 0, total: p.journal?.stats?.total ?? 0 }) },
    { id: 'craftmetal', label: 'Craftmetal', get: p => ({ count: p.craftmetal?.stats?.collected ?? 0, total: p.craftmetal?.stats?.total ?? 0 }) },
    { id: 'memoryLockets', label: 'Memory Lockets', get: p => ({ count: p.memoryLockets?.stats?.collected ?? 0, total: p.memoryLockets?.stats?.total ?? 0 }) },
    { id: 'keyItems', label: 'Key Items', get: p => ({ count: p.keyItems?.stats?.obtained ?? 0, total: p.keyItems?.stats?.total ?? 0 }) },
];

export function formatDelta(delta) {
    if (delta > 0) return `+${delta}`;
    if (delta < 0) return `${delta}`;
    return '0';
}

export function diffParsedSaves(baseParsed, otherParsed, { baseName = 'Save A', otherName = 'Save B' } = {}) {
    if (!baseParsed || !otherParsed) return null;
    const categories = METRICS.map(m => {
        const a = m.get(baseParsed);
        const b = m.get(otherParsed);
        return {
            id: m.id,
            label: m.label,
            base: a.count,
            other: b.count,
            total: Math.max(a.total, b.total),
            delta: b.count - a.count,
        };
    });
    return {
        baseName,
        otherName,
        categories,
        changedCount: categories.filter(c => c.delta !== 0).length,
    };
}

export function renderComparisonBanner(container, diff, { onClear } = {}) {
    if (!container) return;
    if (!diff) {
        container.replaceChildren();
        container.hidden = true;
        return;
    }
    container.replaceChildren();

    const header = document.createElement('div');
    header.className = 'compare-header';
    const title = document.createElement('div');
    title.className = 'compare-title';
    const strongA = document.createElement('strong');
    strongA.textContent = diff.baseName;
    const strongB = document.createElement('strong');
    strongB.textContent = diff.otherName;
    title.append('Comparing ', strongA, ' → ', strongB);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'header-btn reset-btn compare-close-btn';
    closeBtn.type = 'button';
    closeBtn.textContent = 'Close comparison';
    closeBtn.addEventListener('click', () => onClear?.());
    header.append(title, closeBtn);

    const grid = document.createElement('div');
    grid.className = 'compare-grid';
    for (const item of diff.categories) {
        const cell = document.createElement('div');
        cell.className = 'compare-item';
        const label = document.createElement('span');
        label.className = 'compare-label';
        label.textContent = item.label;

        const values = document.createElement('span');
        values.className = 'compare-values';
        values.textContent = `${item.base}/${item.total} → ${item.other}/${item.total}`;

        const badge = document.createElement('span');
        const state = item.delta > 0 ? 'positive' : (item.delta < 0 ? 'negative' : 'neutral');
        badge.className = `compare-delta ${state}`;
        badge.textContent = formatDelta(item.delta);

        cell.append(label, values, badge);
        grid.appendChild(cell);
    }

    container.append(header, grid);
    container.hidden = false;
}
