/**
 * Shared DOM renderers. Category modules describe *what* to show; these build
 * the elements. Element and attribute order is deliberate: the golden render
 * test (src/render.test.js) compares the serialised DOM.
 */

/**
 * Icons in grids and checklists are not fetched until their tab is shown:
 * the URL waits in data-src and app/tabs.js#switchTab calls loadDeferredImages
 * on the panel it opens. (loading="lazy" is not enough: Chrome still fetched
 * hidden panels' icons while the page was starting.)
 */
export function deferSrc(img, url) {
    img.dataset.src = url;
}

/** Give every deferred image under `root` its real src. */
export function loadDeferredImages(root) {
    for (const img of root.querySelectorAll('img[data-src]')) {
        img.src = img.dataset.src;
        delete img.dataset.src;
    }
}

/**
 * Render an icon grid: one `div.<itemClass>` per item with an <img> and a label.
 * The grid is a list for screen readers; each item is named by its title
 * ("Display (Unlocked)"), so the state is not conveyed by greyscale alone.
 *
 * @param {Element|null} container  grid element (no-op when null)
 * @param {object[]} items
 * @param {object} o
 * @param {string}   o.itemClass          class of each item div
 * @param {Function} o.icon               item => img src (use core/icons.js iconUrl)
 * @param {Function} [o.isOn]             item => boolean (unlocked / defeated ...)
 * @param {boolean}  [o.lockItem=false]   add 'locked' to the item div when off
 * @param {Function} [o.imgClass]         item => class for the <img>; default on/off class
 * @param {string}   [o.onClass='unlocked']
 * @param {string}   [o.offClass='locked']
 * @param {Function} [o.title]            item => <img> title; default "Display (Unlocked|Locked)"
 * @param {Function} [o.label]            item => label text; default item.display
 * @param {Function} [o.labelClass]       item => extra class for the label, or null
 * @param {Function} [o.detail]           item => small second line under the label ('' = none)
 * @param {Function} [o.decorate]         (itemEl, item) => void, before the img is added
 * @param {Function} [o.onClick]          item => void
 * @param {Function} [o.clickable]        item => boolean: which items get onClick (default all)
 * @returns {number} how many items are on
 */
export function renderIconGrid(container, items, o) {
    if (!container) return 0;
    const isOn = o.isOn || (() => true);
    const onClass = o.onClass ?? 'unlocked';
    const offClass = o.offClass ?? 'locked';
    const label = o.label || (item => item.display);
    container.innerHTML = '';
    container.setAttribute('role', 'list');
    let onCount = 0;

    for (const item of items) {
        const on = !!isOn(item);
        if (on) onCount++;

        const el = document.createElement('div');
        el.className = o.itemClass;
        el.setAttribute('role', 'listitem');
        if (o.lockItem && !on) el.classList.add('locked');
        if (o.decorate) o.decorate(el, item);

        const title = o.title ? o.title(item) : `${item.display} (${on ? 'Unlocked' : 'Locked'})`;
        el.setAttribute('aria-label', title);
        const img = document.createElement('img');
        deferSrc(img, o.icon(item));
        img.alt = '';   // the item's aria-label names it
        img.title = title;
        const imgClass = o.imgClass ? o.imgClass(item, on) : (on ? onClass : offClass);
        if (imgClass) img.className = imgClass;

        const span = document.createElement('span');
        const text = label(item);
        span.textContent = text;
        span.title = text;
        const extra = o.labelClass ? o.labelClass(item, on) : null;
        if (extra) span.classList.add(extra);

        el.appendChild(img);
        el.appendChild(span);
        const detail = o.detail ? o.detail(item) : '';
        if (detail) {
            const small = document.createElement('small');
            small.className = 'grid-detail';
            small.textContent = detail;
            el.appendChild(small);
        }
        if (o.onClick && (!o.clickable || o.clickable(item))) {
            // Opens a dialog: reachable and usable from the keyboard
            el.tabIndex = 0;
            el.setAttribute('aria-haspopup', 'dialog');
            el.addEventListener('click', () => o.onClick(item));
            el.addEventListener('keydown', (e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                e.preventDefault();
                o.onClick(item);
            });
        }
        container.appendChild(el);
    }
    return onCount;
}

/**
 * Render a source checklist: rows with collected / missing / pending state.
 *
 * @param {Element|null} container
 * @param {{name, collected, pending}[]} sources
 * @param {Function} iconSrc  (source, index) => img src, or null for no icon
 */
export function renderChecklist(container, sources, iconSrc) {
    if (!container) return;
    container.innerHTML = '';
    container.setAttribute('role', 'list');
    sources.forEach((source, index) => {
        const row = document.createElement('div');
        const state = source.pending ? 'pending' : (source.collected ? 'collected' : 'missing');
        row.className = `source-item ${state}`;
        row.setAttribute('role', 'listitem');

        const left = document.createElement('div');
        left.className = 'source-left';

        const src = iconSrc ? iconSrc(source, index) : null;
        if (src) {
            const img = document.createElement('img');
            deferSrc(img, src);
            img.alt = '';   // the row's name text follows
            img.className = 'source-icon';
            left.appendChild(img);
        }

        const name = document.createElement('span');
        name.className = 'source-name';
        name.textContent = source.name;
        left.appendChild(name);

        const status = document.createElement('span');
        status.className = 'source-status';
        status.textContent = source.pending ? 'Pending' : (source.collected ? 'Collected' : 'Missing');

        row.appendChild(left);
        row.appendChild(status);
        container.appendChild(row);
    });
}

/** Write text to every [data-stat="key"] element under root; null/undefined -> "-". */
export function setStat(key, value, root = document) {
    for (const el of root.querySelectorAll(`[data-stat="${key}"]`)) {
        el.textContent = value !== undefined && value !== null ? value : '-';
    }
}

/** Write text to the element with this id, if present. */
export function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

/** "N%" badge that gets the `maxed` class when complete. */
export function setPercent(id, value, maxed) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = `${value}%`;
    if (maxed !== undefined) el.classList.toggle('maxed', !!maxed);
}

/** Replace a container's content with a muted "none" message. */
export function renderEmpty(container, text, style = 'color: var(--text-secondary);') {
    if (container) container.innerHTML = `<span style="${style}">${text}</span>`;
}
