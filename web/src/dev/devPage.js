/**
 * #dev page: playerData keys no content pack reads (dev/unknownKeys.js), for
 * exploring a new save or a patch without Python. Only mounted when the app is
 * served from this machine or the local network (app/devHost.js); the deploy
 * workflow leaves src/dev/ out of the GitHub Pages upload.
 *
 *   const dev = mountDevPage(root, saveStore);
 */
import { activePacks } from '../data/packs/index.js';
import { describeValue, findUnknownKeys, reportText } from './unknownKeys.js';

const TEMPLATE = `
    <div class="container dev-page">
        <header class="dev-header">
            <h2>Unknown save keys</h2>
            <p class="dev-note">Local only: this page is not part of the published site.
                Lists every <code>playerData</code> key that no content pack reads.
                "Unexplained" keys are where new content or missed items show up;
                "explained" ones match a pattern in <code>packs/base/untracked.js</code>.</p>
        </header>
        <div class="dev-controls">
            <label><input type="checkbox" data-ref="bools"> Booleans only</label>
            <input type="search" data-ref="filter" placeholder="Filter keys" aria-label="Filter keys">
            <button type="button" class="btn" data-ref="copy" disabled>Copy unexplained</button>
            <span class="dev-copied" data-ref="copied" role="status"></span>
        </div>
        <p class="dev-summary" data-ref="summary">Load a save to list its keys.</p>
        <section>
            <h3>Unexplained</h3>
            <div data-ref="unexplained"></div>
        </section>
        <section>
            <h3>Explained by untracked patterns</h3>
            <div data-ref="explained"></div>
        </section>
    </div>`;

function keyTable(keys) {
    const table = document.createElement('table');
    table.className = 'dev-keys';
    for (const { key, value } of keys) {
        const row = table.insertRow();
        row.insertCell().textContent = key;
        const cell = row.insertCell();
        cell.textContent = describeValue(value);
        cell.className = `dev-value dev-${value === true ? 'true' : value === false ? 'false' : 'other'}`;
    }
    return table;
}

function section(title, count, keys, open, note) {
    const details = document.createElement('details');
    details.open = open;
    const summary = document.createElement('summary');
    summary.textContent = `${title} (${count})`;
    details.appendChild(summary);
    if (note) {
        const p = document.createElement('p');
        p.className = 'dev-reason';
        p.textContent = note;
        details.appendChild(p);
    }
    details.appendChild(keyTable(keys));
    return details;
}

export function mountDevPage(root, store) {
    root.innerHTML = TEMPLATE;
    const ref = name => root.querySelector(`[data-ref="${name}"]`);
    let result = null;

    function render() {
        const { save, fileName } = store.get();
        const copy = ref('copy');
        ref('unexplained').replaceChildren();
        ref('explained').replaceChildren();
        if (!save) {
            result = null;
            copy.disabled = true;
            ref('summary').textContent = 'Load a save to list its keys.';
            return;
        }
        result = findUnknownKeys(save.playerData, activePacks(save), { boolsOnly: ref('bools').checked });
        const filter = ref('filter').value.trim().toLowerCase();
        const match = keys => (filter ? keys.filter(k => k.key.toLowerCase().includes(filter)) : keys);
        const unexplainedCount = result.unexplained.reduce((n, g) => n + g.keys.length, 0);
        ref('summary').textContent = `${fileName || 'Save'}: ${result.keyCount} keys, ` +
            `${result.unreferenced} not read by any pack: ${result.unreferenced - unexplainedCount} explained, ` +
            `${unexplainedCount} unexplained.`;
        copy.disabled = unexplainedCount === 0;

        for (const g of result.unexplained) {
            const keys = match(g.keys);
            if (keys.length) ref('unexplained').appendChild(section(g.group, keys.length, keys, true));
        }
        for (const e of result.explained) {
            const keys = match(e.keys);
            if (keys.length) ref('explained').appendChild(section(e.id, keys.length, keys, !!filter, e.reason));
        }
        if (!ref('unexplained').children.length) ref('unexplained').textContent = 'None.';
    }

    ref('bools').addEventListener('change', render);
    ref('filter').addEventListener('input', render);
    ref('copy').addEventListener('click', async () => {
        if (!result) return;
        try {
            await navigator.clipboard.writeText(reportText(result, store.get().fileName));
            ref('copied').textContent = 'Copied';
        } catch {
            ref('copied').textContent = 'Could not copy (clipboard blocked)';
        }
        setTimeout(() => { ref('copied').textContent = ''; }, 2000);
    });
    store.subscribe(render);
    render();
}
