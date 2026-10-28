/**
 * Upgrade pickups (playerData.StoryEvents) on the Hero's Path timeline.
 *
 * The timeline counts scenes in first-visit order (scenesVisited has no times),
 * while StoryEvents carry a play time. An event is placed at the exploration
 * progress it happened at: never before the previous event (they are in time
 * order) and never before its scene was first visited. Events in a scene the
 * save never visited go after the previous event.
 */

/**
 * EventType, worked out from the rooms each type happens in: 0 is always a
 * Mask Shard room (20 in the 100% save = all 20 shards), 1 a Silk Spool room
 * (18 = all fragments), 2 a Simple Key source (Pebb in Bone Bottom, the
 * Sinner's Road cage in Dust_06, Jubilana in Songclave, the corpse at
 * Bellshrine_Coral: all four keys), 3 a Memory Locket room.
 */
export const EVENT_TYPES = {
    0: { label: 'Mask Shard', color: '#e57373' },
    1: { label: 'Spool Fragment', color: '#e8e1d3' },
    2: { label: 'Simple Key', color: '#90a4ae' },
    3: { label: 'Memory Locket', color: '#d4b36a' },
};
export const EVENT_COLORS = Object.fromEntries(Object.entries(EVENT_TYPES).map(([t, v]) => [t, v.color]));

/** 3 -> 'Memory Locket'; an unknown type -> 'Upgrade (type 7)'. */
export function eventLabel(type) {
    return EVENT_TYPES[type]?.label ?? `Upgrade (type ${type})`;
}

/**
 * events: parseStory(...).events (sorted by playTime); scenes: scenesVisited.
 * Returns the events with `index` = number of scenes visited when it happened.
 */
export function placeEvents(events, scenes) {
    const firstVisit = new Map();
    scenes.forEach((scene, i) => { if (!firstVisit.has(scene)) firstVisit.set(scene, i + 1); });
    let progress = 0;
    return events.map(e => {
        progress = Math.max(progress, firstVisit.get(e.scene) ?? progress);
        return { ...e, index: progress };
    });
}

/** 16899.4 -> '4h 41m'; 300 -> '5m'. */
export function formatPlayTime(seconds) {
    const total = Math.max(0, Math.floor(seconds / 60));
    const h = Math.floor(total / 60), m = total % 60;
    return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
}
