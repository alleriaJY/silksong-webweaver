/**
 * Tab bar on the stats page: buttons carry data-tab="<id>", panels are
 * id="panel-<id>". Never hard-code tab ids elsewhere.
 *
 * ARIA tabs pattern: the active tab has aria-selected="true" and is the only
 * one in the Tab order; Left/Right/Home/End move between tabs.
 *
 * A panel's icons are fetched the first time it is shown (ui/renderers.js#deferSrc).
 */
import { loadDeferredImages } from '../ui/renderers.js';

export function switchTab(tabNav, tabId) {
    for (const btn of tabNav.querySelectorAll('.tab-btn')) {
        const active = btn.dataset.tab === tabId;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-selected', String(active));
        btn.tabIndex = active ? 0 : -1;
        // The tab bar scrolls sideways on narrow screens; keep the active tab visible
        if (active) btn.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    }
    for (const panel of document.querySelectorAll('.tab-panel')) {
        const active = panel.id === `panel-${tabId}`;
        panel.classList.toggle('active', active);
        if (active) loadDeferredImages(panel);
    }
}

const KEY_STEP = { ArrowRight: 1, ArrowLeft: -1 };

export function setupTabs(tabNav) {
    const buttons = () => [...tabNav.querySelectorAll('.tab-btn')];
    for (const btn of buttons()) {
        btn.addEventListener('click', () => switchTab(tabNav, btn.dataset.tab));
    }
    tabNav.addEventListener('keydown', (e) => {
        const list = buttons();
        const i = list.indexOf(document.activeElement);
        if (i < 0) return;
        let next;
        if (e.key in KEY_STEP) next = (i + KEY_STEP[e.key] + list.length) % list.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = list.length - 1;
        else return;
        e.preventDefault();
        switchTab(tabNav, list[next].dataset.tab);
        list[next].focus();
    });
}
