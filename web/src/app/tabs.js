/**
 * Tab bar on the stats page: buttons carry data-tab="<id>", panels are
 * id="panel-<id>". Never hard-code tab ids elsewhere.
 */

export function switchTab(tabNav, tabId) {
    for (const btn of tabNav.querySelectorAll('.tab-btn')) {
        const active = btn.dataset.tab === tabId;
        btn.classList.toggle('active', active);
        // The tab bar scrolls sideways on narrow screens; keep the active tab visible
        if (active) btn.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    }
    for (const panel of document.querySelectorAll('.tab-panel')) {
        panel.classList.toggle('active', panel.id === `panel-${tabId}`);
    }
}

export function setupTabs(tabNav) {
    for (const btn of tabNav.querySelectorAll('.tab-btn')) {
        btn.addEventListener('click', () => switchTab(tabNav, btn.dataset.tab));
    }
}
