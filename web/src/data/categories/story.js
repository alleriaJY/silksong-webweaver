/**
 * Story events: playerData.StoryEvents [{ EventType, SceneName, PlayTime }],
 * parsed in play-time order for the Hero's Path timeline (ROADMAP Phase 3).
 * No tab yet. EventType values 0-3 are not documented; they are kept as-is
 * (the 100% save has 20 x 0, 18 x 1, 4 x 2, 18 x 3).
 */
export function parseStory(save) {
    const raw = save.playerData?.StoryEvents;
    const events = (Array.isArray(raw) ? raw : [])
        .filter(e => e && typeof e.PlayTime === 'number')
        .map(e => ({ type: e.EventType, scene: e.SceneName, playTime: e.PlayTime, area: String(e.SceneName || '').split('_')[0] }))
        .sort((a, b) => a.playTime - b.playTime);
    const byType = {};
    for (const e of events) byType[e.type] = (byType[e.type] || 0) + 1;
    return { events, stats: { total: events.length, byType } };
}

export default {
    id: 'story',
    parse: parseStory,
};
