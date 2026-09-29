/**
 * Fleas: one playerData boolean per flea. kind 'flea' = SavedFlea_<scene>
 * rescues, 'special' = named fleas recruited through events. All count.
 */
export function parseFleas(save, ctx) {
    const fleas = ctx.lists('fleas').map(def => ({
        json: def.json,
        display: def.display,
        kind: def.kind,
        value: save.playerData?.[def.json] || false,
    }));
    return { fleas, stats: { total: fleas.length, saved: fleas.filter(f => f.value).length } };
}

export default {
    id: 'fleas',
    parse: parseFleas,
};
