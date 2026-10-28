/**
 * Hash routes for the one-page app: #stats, #timeline (and #dev when served
 * locally, see main.js). Pages are
 * id="page-<route>", sidebar items data-page="<route>"; never hard-code page
 * ids elsewhere. Every change fires `app:page` (detail = route) on window.
 *
 *   const router = startRouter();   // shows the page for the current hash
 *   startRouter(window, [...ROUTES, 'dev']);   // with extra routes
 *   router.go('stats');
 */

export const ROUTES = ['stats', 'timeline'];
export const DEFAULT_ROUTE = 'stats';

/** '#timeline' -> 'timeline'; unknown or empty (and the old '#home') -> the default route. */
export function routeFromHash(hash, routes = ROUTES) {
    const route = String(hash || '').replace(/^#\/?/, '');
    return routes.includes(route) ? route : DEFAULT_ROUTE;
}

/** Mark the route's page and sidebar item active. */
export function showRoute(route, doc = document) {
    for (const item of doc.querySelectorAll('.sidebar-nav-item')) {
        const active = item.dataset.page === route;
        item.classList.toggle('active', active);
        if (active) item.setAttribute('aria-current', 'page');
        else item.removeAttribute('aria-current');
    }
    for (const page of doc.querySelectorAll('.app-page')) {
        page.classList.toggle('active', page.id === `page-${route}`);
    }
}

export function startRouter(win = window, routes = ROUTES) {
    let current = null;
    const apply = () => {
        const route = routeFromHash(win.location.hash, routes);
        if (route === current) return;
        current = route;
        showRoute(route, win.document);
        win.dispatchEvent(new CustomEvent('app:page', { detail: route }));
    };
    win.addEventListener('hashchange', apply);
    for (const item of win.document.querySelectorAll('.sidebar-nav-item[data-page]')) {
        item.addEventListener('click', () => { win.location.hash = item.dataset.page; });
    }
    apply();
    return {
        go(route) { win.location.hash = route; },
        get current() { return current; },
    };
}
