/**
 * Story events and respawn marker helpers on the Hero's Path timeline.
 *
 * The timeline counts scenes in first-visit order (scenesVisited has no times),
 * while StoryEvents carry a play time. An event is placed at the exploration
 * progress it happened at: never before the previous event (they are in time
 * order) and never before its scene was first visited. Events in a scene the
 * save never visited go after the previous event.
 */

/**
 * StoryEvents EventType enum (verified against all 60 events in the 100% save):
 *   0 = Mask Shard (20)
 *   1 = Spool Fragment (18)
 *   2 = Simple Key (4)
 *   3 = Memory Locket (18)
 */
export const EVENT_COLORS = { 0: '#4fc3f7', 1: '#ffb74d', 2: '#e57373', 3: '#81c784' };
export const EVENT_LABELS = {
    0: 'Mask Shard',
    1: 'Spool Fragment',
    2: 'Simple Key',
    3: 'Memory Locket',
};

export function eventLabel(type) {
    return EVENT_LABELS[type] || `Type ${type}`;
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

/** Bounding-box centre of the tiles belonging to `scene`, or null if unmapped. */
export function sceneBoundsCenter(scene, lookup, tiles) {
    if (!scene) return null;
    const names = lookup(scene);
    if (!names || !names.length) return null;
    const boxes = names.map(n => tiles[n]).filter(Boolean);
    if (!boxes.length) return null;
    const x0 = Math.min(...boxes.map(b => b.x)), x1 = Math.max(...boxes.map(b => b.x + b.width));
    const y0 = Math.min(...boxes.map(b => b.y)), y1 = Math.max(...boxes.map(b => b.y + b.height));
    return { x: (x0 + x1) / 2, y: (y0 + y1) / 2 };
}

/** Build respawn bench pin metadata from `playerData.respawnScene`. */
export function buildRespawnPin(playerData, lookup, tiles) {
    const scene = playerData?.respawnScene;
    if (!scene) return null;
    const center = sceneBoundsCenter(scene, lookup, tiles);
    if (!center) return null;
    const marker = playerData?.respawnMarkerName || null;
    const title = marker
        ? `Current respawn bench · ${scene} (${marker})`
        : `Current respawn bench · ${scene}`;
    return { scene, marker, x: center.x, y: center.y, title };
}

/** 16899.4 -> '4h 41m'; 300 -> '5m'. */
export function formatPlayTime(seconds) {
    const total = Math.max(0, Math.floor(seconds / 60));
    const h = Math.floor(total / 60), m = total % 60;
    return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
}
