/**
 * Single place that knows where icons live. Every <img src> in the app is built
 * with iconUrl(), which URL-encodes the filename: many asset names contain
 * spaces, '#', '&' or apostrophes, and an unencoded '#' truncates the URL.
 */
export const ICON_DIRS = Object.freeze({
    tool: 'assets/img/tools',
    boss: 'assets/img/bosses',
    map: 'assets/img/maps',
    quill: 'assets/img/maps/quills',
    marker: 'assets/img/Markers',
    flea: 'assets/img/fleas',
    journal: 'assets/img/journal',
    general: 'assets/img/general',
    checklist: 'assets/img/general/checklists',
    collectable: 'assets/img/general/collectables',
    key: 'assets/img/general/keys',
    memento: 'assets/img/general/mementos',
    ability: 'assets/img/general/ability',
    skill: 'assets/img/general/skills',
    crest: 'assets/img/general/crests',
    nail: 'assets/img/general/nail',
    saveart: 'assets/img/saveart',
    root: 'assets/img',
});

/** Generic stand-in for an item whose icon is not in the assets yet. */
export const PLACEHOLDER_ICON = { kind: 'root', file: 'knight_icon.png' };

export function placeholderIconUrl() {
    return iconUrl(PLACEHOLDER_ICON.kind, PLACEHOLDER_ICON.file);
}

export function iconUrl(kind, file) {
    const dir = ICON_DIRS[kind];
    if (!dir) throw new Error(`Unknown icon kind: ${kind}`);
    return `${dir}/${encodeURIComponent(file)}`;
}
