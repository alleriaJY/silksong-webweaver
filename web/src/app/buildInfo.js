/**
 * Footer build stamp. The deploy workflow writes version.json next to the
 * pages ({ sha, date }); a local checkout has none and shows "dev".
 */

const REPO_URL = 'https://github.com/alleriaJY/silksong-webweaver';

export function formatBuild(info) {
    if (!info || typeof info.sha !== 'string' || !info.sha) return null;
    const short = info.sha.slice(0, 7);
    return {
        text: info.date ? `${short} · ${info.date}` : short,
        href: `${REPO_URL}/commit/${info.sha}`,
    };
}

export async function showBuildInfo(root = document) {
    const el = root.querySelector('[data-build]');
    if (!el) return;
    let build = null;
    try {
        const res = await fetch('version.json', { cache: 'no-store' });
        if (res.ok) build = formatBuild(await res.json());
    } catch {
        // No version.json (local dev) or offline: keep "dev".
    }
    if (!build) {
        el.textContent = 'Build dev';
        return;
    }
    const link = document.createElement('a');
    link.href = build.href;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = build.text;
    el.replaceChildren('Build ', link);
}
