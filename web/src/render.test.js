// @vitest-environment happy-dom
/**
 * Render regression test: drives the real stats page (stats.html markup +
 * src/main.js) through the upload flow for every fixture, with the WASM module
 * mocked to return the fixture, and compares the rendered #stats-section with
 * committed golden files in __snapshots__/render/.
 *
 * Golden files are one tag per line so diffs point at the exact element. Image
 * src values are URL-decoded so a change in *how* a filename is encoded does not
 * count as a visual change, while a different file does.
 *
 * Update goldens only for an intentional visual change:
 *   npx vitest run src/render.test.js -u
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = join(HERE, 'data', '__fixtures__');
const STATS_HTML = readFileSync(join(HERE, '..', 'stats.html'), 'utf-8');

const wasm = vi.hoisted(() => ({ current: null }));
vi.mock('../pkg/wasm_crypto.js', () => ({
    default: vi.fn(async () => {}),
    // legacy export (Map-shaped in production; plain objects here)
    decrypt_and_parse: vi.fn(() => ({
        success: true, error: null,
        playerData: wasm.current.playerData, sceneData: wasm.current.sceneData,
    })),
    // Phase 1 export
    decrypt_save: vi.fn(() => ({ success: true, error: null, save: wasm.current })),
}));

const FIXTURES = readdirSync(FIXTURE_DIR)
    .filter(f => f.endsWith('.json') && !f.endsWith('.expected.json'))
    .map(f => f.replace(/\.json$/, ''));

function loadBody() {
    const body = STATS_HTML.slice(STATS_HTML.indexOf('<body>') + 6, STATS_HTML.indexOf('</body>'))
        .replace(/<script[\s\S]*?<\/script>/g, '')
        .replace(/<iframe[^>]*><\/iframe>/g, '');
    document.body.innerHTML = body;
}

async function waitFor(check, ms = 2000) {
    const start = Date.now();
    while (!check()) {
        if (Date.now() - start > ms) throw new Error('timed out waiting for render');
        await new Promise(r => setTimeout(r, 5));
    }
}

/**
 * happy-dom treats `el.textContent = 0` as empty; browsers render "0". Coerce
 * numbers to strings like a browser so goldens match what users see.
 */
function patchNumericTextContent() {
    let proto = HTMLElement.prototype;
    let desc;
    while (proto && !(desc = Object.getOwnPropertyDescriptor(proto, 'textContent'))) proto = Object.getPrototypeOf(proto);
    if (!desc || desc.set.__patched) return;
    const set = function (value) { desc.set.call(this, typeof value === 'number' ? String(value) : value); };
    set.__patched = true;
    Object.defineProperty(proto, 'textContent', { ...desc, set });
}

export function serialize(root) {
    const clone = root.cloneNode(true);
    for (const img of clone.querySelectorAll('img')) {
        const src = img.getAttribute('src');
        if (src) img.setAttribute('src', decodeURIComponent(src));
    }
    return clone.innerHTML
        .replace(/>\s*</g, '>\n<')
        .replace(/[ \t]+\n/g, '\n')
        .trim() + '\n';
}

describe('stats page render (golden)', () => {
    beforeEach(() => {
        vi.resetModules();
        loadBody();
        Element.prototype.scrollIntoView = () => {};
        patchNumericTextContent();
    });

    it.each(FIXTURES)('%s renders identically to the golden file', async (name) => {
        wasm.current = JSON.parse(readFileSync(join(FIXTURE_DIR, `${name}.json`), 'utf-8'));
        await import('./main.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));
        await new Promise(r => setTimeout(r, 0)); // let WASM init resolve

        const input = document.getElementById('file-input');
        Object.defineProperty(input, 'files', { value: [new File([new Uint8Array(64)], 'user1.dat')] });
        input.dispatchEvent(new Event('change'));

        const section = document.getElementById('stats-section');
        await waitFor(() => !section.hidden && document.getElementById('loading').hidden);
        expect(document.getElementById('error-message').hidden).toBe(true);

        await expect(serialize(section)).toMatchFileSnapshot(`./__snapshots__/render/${name}.html`);
    });
});
