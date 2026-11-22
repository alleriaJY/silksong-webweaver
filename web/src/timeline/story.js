/**
 * Story events and respawn marker helpers on the Hero's Path timeline.
 *
 * The timeline counts scenes in first-visit order (scenesVisited has no times),
 * while StoryEvents carry a play time. An event is placed at the exploration
 * progress it happened at: never before the previous event (they are in time
 * order) and never before its scene was first visited. Events in a scene the
 * save never visited go after the previous event.
 */

import { mergedList } from '../data/packs/index.js';

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
 * Scene-based overrides for StoryEvents where the pickup happens in a shop or
 * quest/wish turn-in room rather than a `flagType: 'scene'` world pickup.
 */
const STORY_SCENE_SOURCES = {
    0: {
        Bonetown: 'Bone Bottom - Pebb (300 Rosaries)',
        Song_Enclave: 'Songclave - Jubilana (750 Rosaries)',
        Sprintmaster_Cave: 'Far Fields - Sprintmaster Swift race (Sprintmaster_Cave)',
        Belltown: 'Bellhart - Wishboard reward (Belltown)',
    },
    1: {
        Belltown: 'Bellhart - Frey (270 Rosaries)',
        Song_Enclave: 'Songclave - Jubilana (500 Rosaries)',
        Coral_42: 'Blasted Steps - Grindle (680 Rosaries)',
        Ward_09: 'Whiteward - Rescue Sherma ("Balm for the Wounded")',
        Coral_Judge_Arena: 'Blasted Steps - Fleamaster Mooshka Caravan (14 Fleas)',
    },
    2: {
        Bonetown: 'Bone Bottom - Pebb (500 Rosaries)',
        Dust_06: "Sinner's Road - Roachkeeper drop (Dust_06)",
        Song_Enclave: 'Songclave - Jubilana (650 Rosaries)',
        Bellshrine_Coral: 'Sands of Karak - Eastern bench corpse (Bellshrine_Coral)',
    },
    3: {
        Bonetown: 'Bone Bottom - "Volatile Flintbeetles" wish reward',
        Bone_East_10_Room: "Far Fields - Mort (Pilgrim's Rest, 150 Rosaries)",
        Belltown: 'Bellhart - Frey purchase / Bellhome summit (Belltown)',
    },
};

let cachedSceneSources = null;
function getPackSceneSources() {
    if (cachedSceneSources) return cachedSceneSources;
    const byType = { 0: new Map(), 1: new Map(), 2: new Map(), 3: new Map() };
    for (const s of mergedList('maskShardSources')) {
        if (s.sceneName) byType[0].set(s.sceneName, s.name);
    }
    for (const s of mergedList('spoolFragmentSources')) {
        if (s.sceneName) byType[1].set(s.sceneName, s.name);
    }
    for (const s of mergedList('memoryLocketSources')) {
        if (s.sceneName) byType[3].set(s.sceneName, s.name);
    }
    cachedSceneSources = byType;
    return cachedSceneSources;
}

/** Resolve `(type, scene)` of a StoryEvent to its human-readable source description. */
export function describeStoryEvent(type, scene) {
    const override = STORY_SCENE_SOURCES[type]?.[scene];
    if (override) return override;
    const fromPack = getPackSceneSources()[type]?.get(scene);
    if (fromPack) return fromPack;
    return scene || 'Unknown location';
}

/**
 * events: parseStory(...).events (sorted by playTime); scenes: scenesVisited.
 * Returns the events with:
 *   - `index` = number of scenes visited when it happened
 *   - `nth` = 1-based running counter for that EventType
 *   - `sourceName` = human-readable item source description
 */
export function placeEvents(events, scenes) {
    const firstVisit = new Map();
    scenes.forEach((scene, i) => { if (!firstVisit.has(scene)) firstVisit.set(scene, i + 1); });
    const counts = {};
    let progress = 0;
    return events.map(e => {
        progress = Math.max(progress, firstVisit.get(e.scene) ?? progress);
        const nth = (counts[e.type] || 0) + 1;
        counts[e.type] = nth;
        return {
            ...e,
            index: progress,
            nth,
            sourceName: describeStoryEvent(e.type, e.scene),
        };
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
