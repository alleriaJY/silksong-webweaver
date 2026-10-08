/**
 * Story events on the Hero's Path timeline.
 *
 * The timeline counts scenes in first-visit order (scenesVisited has no times),
 * while StoryEvents carry a play time. An event is placed at the exploration
 * progress it happened at: never before the previous event (they are in time
 * order) and never before its scene was first visited. Events in a scene the
 * save never visited go after the previous event.
 */

/** EventType values are undocumented; these colours only tell them apart. */
export const EVENT_COLORS = { 0: '#4fc3f7', 1: '#ffb74d', 2: '#e57373', 3: '#81c784' };

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
