/**
 * Save Explorer sidebar page (#explorer): searchable, filterable variable
 * dictionary and live inspector for playerData and sceneData.
 *
 * Reads from the shared saveStore; when no save is loaded it still lets the
 * user browse the built-in verified variable dictionary as a reference.
 */
import { describePlayerDataKey, describeSceneEntry, getDictionaryIndex } from './dictionary.js';

export const ROOTS = [
    { id: 'playerData', label: 'playerData' },
    { id: 'persistentBools', label: 'sceneData · Bools' },
    { id: 'persistentInts', label: 'sceneData · Ints' },
    { id: 'geoRocks', label: 'sceneData · Geo Rocks' },
];

const PAGE_SIZE = 200;

function typeOf(value) {
    if (value === null) return 'null';
    if (Array.isArray(value)) return `array[${value.length}]`;
    if (typeof value === 'object') {
        const list = value.savedData || value.list;
        if (Array.isArray(list)) return `list[${list.length}]`;
        return `object{${Object.keys(value).length}}`;
    }
    return typeof value;
}

function isComplex(value) {
    return value !== null && typeof value === 'object';
}

function previewValue(value) {
    if (value === undefined) return '—';
    if (value === null) return 'null';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'number') return String(value);
    if (typeof value === 'string') return value === '' ? '""' : value;
    if (Array.isArray(value)) return `[${value.length} items]`;
    const list = value.savedData || value.list;
    if (Array.isArray(list)) return `{ ${list.length} entries }`;
    return `{ ${Object.keys(value).length} keys }`;
}

function isTruthyValue(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') return value.length > 0;
    if (Array.isArray(value)) return value.length > 0;
    const list = value.savedData || value.list;
    if (Array.isArray(list)) return list.length > 0;
    return Object.keys(value).length > 0;
}

function valuesEqual(a, b) {
    if (a === b) return true;
    if (isComplex(a) || isComplex(b)) {
        try { return JSON.stringify(a) === JSON.stringify(b); } catch { return false; }
    }
    return false;
}

function sceneList(save, root) {
    return save?.sceneData?.[root]?.serializedList || [];
}

/**
 * Build rows for a given root ('playerData' | 'persistentBools' | 'persistentInts' | 'geoRocks').
 * When `save` is null, returns the built-in verified dictionary reference rows.
 */
export function buildExplorerRows(save, root = 'playerData', compareSave = null) {
    if (!save) {
        const { pdMap, sceneBoolMap, sceneIntMap } = getDictionaryIndex();
        const source = root === 'playerData' ? pdMap : root === 'persistentBools' ? sceneBoolMap : root === 'persistentInts' ? sceneIntMap : new Map();
        return [...source.entries()]
            .map(([key, meta]) => ({
                key,
                category: meta.category,
                description: meta.description,
                status: meta.status,
                type: 'schema',
                value: undefined,
                preview: '—',
                complex: false,
                truthy: false,
                changed: false,
                comparePreview: null,
            }))
            .sort((a, b) => a.key.localeCompare(b.key));
    }

    if (root === 'playerData') {
        const pd = save.playerData || {};
        const cmpPd = compareSave?.playerData || null;
        return Object.keys(pd).sort().map(key => {
            const value = pd[key];
            const meta = describePlayerDataKey(key);
            const changed = cmpPd ? !valuesEqual(value, cmpPd[key]) : false;
            return {
                key,
                category: meta.category,
                description: meta.description,
                status: meta.status,
                type: typeOf(value),
                value,
                preview: previewValue(value),
                complex: isComplex(value),
                truthy: isTruthyValue(value),
                changed,
                comparePreview: changed ? previewValue(cmpPd[key]) : null,
            };
        });
    }

    const list = sceneList(save, root);
    const cmpMap = compareSave
        ? new Map(sceneList(compareSave, root).map(e => [`${e.SceneName}/${e.ID}`, e.Value]))
        : null;

    return list.map(entry => {
        const sceneName = entry.SceneName || '';
        const id = entry.ID || '';
        const key = `${sceneName} / ${id}`;
        const value = entry.Value;
        const meta = describeSceneEntry(root, sceneName, id);
        const cmpKey = `${sceneName}/${id}`;
        const changed = cmpMap ? !valuesEqual(value, cmpMap.get(cmpKey)) : false;
        return {
            key,
            sceneName,
            objectId: id,
            category: meta.category,
            description: meta.description,
            status: meta.status,
            type: typeOf(value),
            value,
            preview: previewValue(value),
            complex: isComplex(value),
            truthy: isTruthyValue(value),
            changed,
            comparePreview: changed ? previewValue(cmpMap.get(cmpKey)) : null,
        };
    }).sort((a, b) => a.key.localeCompare(b.key));
}

export function filterRows(rows, { query = '', category = 'all', status = 'all', valueMode = 'all' } = {}) {
    const q = query.trim().toLowerCase();
    return rows.filter(r => {
        if (category !== 'all' && r.category !== category) return false;
        if (status !== 'all' && r.status !== status) return false;
        if (valueMode === 'truthy' && !r.truthy) return false;
        if (valueMode === 'changed' && !r.changed) return false;
        if (q) {
            const hay = `${r.key} ${r.category} ${r.description} ${r.preview}`.toLowerCase();
            if (!hay.includes(q)) return false;
        }
        return true;
    });
}

export function summarizeCoverage(rows) {
    let verified = 0;
    let pattern = 0;
    let unknown = 0;
    for (const r of rows) {
        if (r.status === 'verified') verified++;
        else if (r.status === 'pattern') pattern++;
        else unknown++;
    }
    return { total: rows.length, verified, pattern, unknown };
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export function mountExplorer(rootEl, store, { onUpload } = {}) {
    let visible = false;
    let built = false;
    let currentRoot = 'playerData';
    let filters = { query: '', category: 'all', status: 'all', valueMode: 'all' };
    let limit = PAGE_SIZE;
    let allRows = [];
    let filtered = [];

    const els = {};

    function buildShell() {
        built = true;
        rootEl.innerHTML = `
            <div class="explorer-container">
                <header class="stats-header explorer-header">
                    <div>
                        <h1 class="stats-title">Save Explorer</h1>
                        <p class="explorer-subtitle" id="explorer-subtitle">Inspect every variable in playerData and sceneData with plain-English documentation</p>
                    </div>
                    <div class="stats-header-actions">
                        <button class="header-btn upload-btn" id="explorer-upload-btn"><span>Open save</span></button>
                    </div>
                </header>

                <div class="explorer-coverage" id="explorer-coverage"></div>

                <div class="explorer-toolbar">
                    <div class="explorer-roots" id="explorer-roots" role="tablist" aria-label="Save data roots"></div>
                    <div class="explorer-filters">
                        <input type="search" id="explorer-search" class="explorer-search" placeholder="Search key, scene, description, or value..." aria-label="Search save variables">
                        <select id="explorer-category" class="explorer-select" aria-label="Filter by category"></select>
                        <select id="explorer-status" class="explorer-select" aria-label="Filter by documentation status">
                            <option value="all">All status</option>
                            <option value="verified">Verified</option>
                            <option value="pattern">Pattern-classified</option>
                            <option value="unknown">Undocumented</option>
                        </select>
                        <select id="explorer-value" class="explorer-select" aria-label="Filter by value">
                            <option value="all">All values</option>
                            <option value="truthy">Non-empty / true</option>
                            <option value="changed">Changed vs Compare</option>
                        </select>
                    </div>
                </div>

                <div class="explorer-meta-bar">
                    <span id="explorer-match-count">0 variables</span>
                </div>

                <div class="explorer-table-wrap">
                    <table class="explorer-table">
                        <thead>
                            <tr>
                                <th>Variable</th>
                                <th>Category</th>
                                <th>Type</th>
                                <th>Value</th>
                                <th>What it does</th>
                            </tr>
                        </thead>
                        <tbody id="explorer-tbody"></tbody>
                    </table>
                </div>

                <div class="explorer-more-wrap" id="explorer-more-wrap" hidden>
                    <button class="header-btn reset-btn" id="explorer-more-btn">Show more</button>
                </div>
            </div>
        `;

        els.subtitle = rootEl.querySelector('#explorer-subtitle');
        els.uploadBtn = rootEl.querySelector('#explorer-upload-btn');
        els.coverage = rootEl.querySelector('#explorer-coverage');
        els.roots = rootEl.querySelector('#explorer-roots');
        els.search = rootEl.querySelector('#explorer-search');
        els.category = rootEl.querySelector('#explorer-category');
        els.status = rootEl.querySelector('#explorer-status');
        els.value = rootEl.querySelector('#explorer-value');
        els.matchCount = rootEl.querySelector('#explorer-match-count');
        els.tbody = rootEl.querySelector('#explorer-tbody');
        els.moreWrap = rootEl.querySelector('#explorer-more-wrap');
        els.moreBtn = rootEl.querySelector('#explorer-more-btn');

        for (const r of ROOTS) {
            const btn = document.createElement('button');
            btn.className = `explorer-root-btn${r.id === currentRoot ? ' active' : ''}`;
            btn.dataset.root = r.id;
            btn.type = 'button';
            btn.setAttribute('role', 'tab');
            btn.setAttribute('aria-selected', String(r.id === currentRoot));
            btn.textContent = r.label;
            btn.addEventListener('click', () => {
                if (currentRoot === r.id) return;
                currentRoot = r.id;
                limit = PAGE_SIZE;
                for (const b of els.roots.querySelectorAll('.explorer-root-btn')) {
                    const on = b.dataset.root === currentRoot;
                    b.classList.toggle('active', on);
                    b.setAttribute('aria-selected', String(on));
                }
                rebuildData();
            });
            els.roots.appendChild(btn);
        }

        els.uploadBtn?.addEventListener('click', () => onUpload?.());
        els.search.addEventListener('input', () => { filters.query = els.search.value; limit = PAGE_SIZE; renderTable(); });
        els.category.addEventListener('change', () => { filters.category = els.category.value; limit = PAGE_SIZE; renderTable(); });
        els.status.addEventListener('change', () => { filters.status = els.status.value; limit = PAGE_SIZE; renderTable(); });
        els.value.addEventListener('change', () => { filters.valueMode = els.value.value; limit = PAGE_SIZE; renderTable(); });
        els.moreBtn.addEventListener('click', () => { limit += PAGE_SIZE; renderTable(); });
    }

    function populateCategories() {
        const prev = filters.category;
        const cats = [...new Set(allRows.map(r => r.category))].sort();
        els.category.innerHTML = '<option value="all">All categories</option>'
            + cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
        if (cats.includes(prev)) els.category.value = prev;
        else { filters.category = 'all'; els.category.value = 'all'; }
    }

    function renderCoverage(save, fileName) {
        const cov = summarizeCoverage(allRows);
        const modeLabel = save
            ? `Loaded: <strong>${escapeHtml(fileName || 'save.dat')}</strong>`
            : '<strong>Reference dictionary mode</strong> (open a save to inspect live values)';
        els.subtitle.innerHTML = modeLabel;
        els.coverage.innerHTML = `
            <span class="explorer-pill"><strong>${cov.total}</strong> keys</span>
            <span class="explorer-pill pill-verified"><strong>${cov.verified}</strong> verified</span>
            <span class="explorer-pill pill-pattern"><strong>${cov.pattern}</strong> pattern-classified</span>
            <span class="explorer-pill pill-unknown"><strong>${cov.unknown}</strong> undocumented</span>
        `;
    }

    function renderTable() {
        filtered = filterRows(allRows, filters);
        const shown = filtered.slice(0, limit);
        els.matchCount.textContent = `Showing ${shown.length} of ${filtered.length} matching variables (${allRows.length} total in ${currentRoot})`;

        els.tbody.innerHTML = '';
        const frag = document.createDocumentFragment();
        for (const row of shown) {
            const tr = document.createElement('tr');
            if (row.changed) tr.classList.add('is-changed');

            const tdKey = document.createElement('td');
            tdKey.className = 'col-key';
            const code = document.createElement('code');
            code.textContent = row.key;
            tdKey.appendChild(code);

            const tdCat = document.createElement('td');
            tdCat.className = 'col-cat';
            const badge = document.createElement('span');
            badge.className = `explorer-badge status-${row.status}`;
            badge.textContent = row.category;
            tdCat.appendChild(badge);

            const tdType = document.createElement('td');
            tdType.className = 'col-type';
            tdType.textContent = row.type;

            const tdVal = document.createElement('td');
            tdVal.className = `col-val${row.truthy ? ' is-truthy' : ''}`;
            if (row.complex) {
                const details = document.createElement('details');
                const summary = document.createElement('summary');
                summary.textContent = row.preview;
                const pre = document.createElement('pre');
                pre.className = 'explorer-json';
                details.addEventListener('toggle', () => {
                    if (details.open && !pre.textContent) {
                        pre.textContent = JSON.stringify(row.value, null, 2);
                    }
                });
                details.append(summary, pre);
                tdVal.appendChild(details);
            } else {
                tdVal.textContent = row.preview;
            }
            if (row.changed && row.comparePreview !== null) {
                const diff = document.createElement('span');
                diff.className = 'explorer-diff';
                diff.textContent = ` (was ${row.comparePreview})`;
                tdVal.appendChild(diff);
            }

            const tdDesc = document.createElement('td');
            tdDesc.className = 'col-desc';
            tdDesc.textContent = row.description;

            tr.append(tdKey, tdCat, tdType, tdVal, tdDesc);
            frag.appendChild(tr);
        }
        els.tbody.appendChild(frag);

        const remaining = filtered.length - shown.length;
        els.moreWrap.hidden = remaining <= 0;
        if (remaining > 0) {
            els.moreBtn.textContent = `Show ${Math.min(PAGE_SIZE, remaining)} more (${remaining} remaining)`;
        }
    }

    function rebuildData() {
        const { save, fileName, compareSave } = store.get();
        allRows = buildExplorerRows(save, currentRoot, compareSave || null);
        populateCategories();
        renderCoverage(save, fileName);
        renderTable();
    }

    store.subscribe(() => {
        if (visible && built) rebuildData();
    });

    return {
        show() {
            visible = true;
            if (!built) buildShell();
            rebuildData();
        },
        hide() {
            visible = false;
        },
    };
}
