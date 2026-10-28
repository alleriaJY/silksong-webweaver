// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { routeFromHash, startRouter, DEFAULT_ROUTE } from './router.js';

describe('routeFromHash', () => {
    it('maps known hashes and falls back to stats', () => {
        expect(routeFromHash('#stats')).toBe('stats');
        expect(routeFromHash('#/timeline')).toBe('timeline');
        expect(routeFromHash('')).toBe(DEFAULT_ROUTE);
        expect(routeFromHash('#map')).toBe(DEFAULT_ROUTE);   // the dropped map viewer
        expect(routeFromHash('#home')).toBe('stats');       // the dropped Home page
        expect(routeFromHash(undefined)).toBe('stats');
    });

    it('knows extra routes only when given them (#dev is local-only)', () => {
        expect(routeFromHash('#dev')).toBe(DEFAULT_ROUTE);
        expect(routeFromHash('#dev', ['stats', 'timeline', 'dev'])).toBe('dev');
    });
});

describe('startRouter', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <ul>
                <li class="sidebar-nav-item" data-page="stats"></li>
                <li class="sidebar-nav-item" data-page="timeline"></li>
            </ul>
            <div class="app-page" id="page-stats"></div>
            <div class="app-page" id="page-timeline"></div>`;
        window.location.hash = '';
    });

    const active = () => [...document.querySelectorAll('.app-page.active')].map(p => p.id);

    it('shows the page for the current hash and announces it', () => {
        window.location.hash = '#timeline';
        const seen = [];
        window.addEventListener('app:page', e => seen.push(e.detail), { once: true });
        const router = startRouter();
        expect(router.current).toBe('timeline');
        expect(active()).toEqual(['page-timeline']);
        expect(seen).toEqual(['timeline']);
        expect(document.querySelector('[data-page="timeline"]').getAttribute('aria-current')).toBe('page');
    });

    it('follows sidebar clicks and hash changes', async () => {
        const router = startRouter();
        expect(active()).toEqual(['page-stats']);
        document.querySelector('[data-page="timeline"]').click();
        window.dispatchEvent(new HashChangeEvent('hashchange'));
        expect(router.current).toBe('timeline');
        expect(active()).toEqual(['page-timeline']);
        expect(document.querySelector('[data-page="stats"]').hasAttribute('aria-current')).toBe(false);
    });
});
