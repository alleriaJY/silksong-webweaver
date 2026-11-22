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

/**
 * Interior and sub-room scenes that do not have their own world-map sprite,
 * mapped to the parent exterior room where their doorway sits on the Pharloom map.
 */
export const INTERIOR_PARENT_SCENES = {
    Bone_12: 'Bone_11',
    Bone_East_10_Room: 'Bone_East_10',
    Bone_East_LavaChallenge: 'Bone_East_20',
    Dock_03d: 'Dock_03c',
    Greymoor_17: 'Greymoor_16',
    Halfway_01: 'Greymoor_03',
    Organ_01: 'Dust_09_right',
    Shadow_20: 'Shadow_20_right',
    Shadow_23: 'Shadow_22',
    Slab_Cell: 'Slab_13_2',
    Slab_Cell_Quiet: 'Slab_08_top',
    Sprintmaster_Cave: 'Bone_East_24',
    Ward_09: 'Ward_03',
    Belltown_Room_Spare: 'Belltown',
    Belltown_Room_Relic: 'Belltown',
    Belltown_Room_Doctor: 'Belltown',
    Belltown_Room_Pinsmith: 'Belltown',
    Room_Forge: 'Dock_02',
    Room_Witch: 'Shellwood_13',
    Room_CrowCourt: 'Greymoor_15',
    Room_CrowCourt_02: 'Greymoor_15',
    Room_Pinstress: 'Peak_05',
    Room_Caravan_Spa: 'Aqueduct_05',
    Room_Caravan_Interior: 'Aqueduct_05',
};

/** Resolve a scene (including interior sub-rooms) to tile names via `lookup`. */
export function resolveSceneTiles(scene, lookup, scenesVisited = []) {
    if (!scene) return [];
    const direct = lookup(scene);
    if (direct && direct.length) return direct;

    const parent = INTERIOR_PARENT_SCENES[scene];
    if (parent) {
        const parentTiles = lookup(parent);
        if (parentTiles && parentTiles.length) return parentTiles;
    }

    if (Array.isArray(scenesVisited) && scenesVisited.length) {
        const idx = scenesVisited.indexOf(scene);
        for (let i = idx - 1; i >= 0; i--) {
            const prev = lookup(scenesVisited[i]);
            if (prev && prev.length) return prev;
        }
    }
    return [];
}

/** Bounding-box centre of the tiles belonging to `scene` (or its parent exterior room), or null if unmapped. */
export function sceneBoundsCenter(scene, lookup, tiles, scenesVisited = []) {
    if (!scene) return null;
    const names = resolveSceneTiles(scene, lookup, scenesVisited);
    if (!names || !names.length) return null;
    const boxes = names.map(n => tiles[n]).filter(Boolean);
    if (!boxes.length) return null;
    const x0 = Math.min(...boxes.map(b => b.x)), x1 = Math.max(...boxes.map(b => b.x + b.width));
    const y0 = Math.min(...boxes.map(b => b.y)), y1 = Math.max(...boxes.map(b => b.y + b.height));
    return { x: (x0 + x1) / 2, y: (y0 + y1) / 2 };
}

/** Build respawn bench pin metadata from `playerData.respawnScene`. */
export function buildRespawnPin(playerData, lookup, tiles, scenesVisited = []) {
    const scene = playerData?.respawnScene;
    if (!scene) return null;
    const center = sceneBoundsCenter(scene, lookup, tiles, scenesVisited);
    if (!center) return null;
    const marker = playerData?.respawnMarkerName || null;
    const title = marker
        ? `Current respawn bench · ${scene} (${marker})`
        : `Current respawn bench · ${scene}`;
    return { scene, marker, x: center.x, y: center.y, title };
}

/** Fallback room mapping for shop/quest checklist entries that lack a direct `sceneName`. */
const ITEM_ID_SCENES = {
    'purchased-bonebottom-heart-piece': 'Bonetown',
    'purchased-bonebottom-tool-metal': 'Bonetown',
    'bone-bottom-volatile-flintbeetles-wish-reward': 'Bonetown',
    'mossberry-bonetown-aspid': 'Bonetown',
    'mossberry-mosstown-aspid': 'Mosstown_02',
    'mossberry-bonegrave-aspid': 'Bone_01',
    'merchant-enclave-shell-fragment': 'Song_Enclave',
    'merchant-enclave-spool-piece': 'Song_Enclave',
    'merchant-enclave-tool-metal': 'Song_Enclave',
    'purchased-belltown-spool-segment': 'Belltown',
    'bellhart-frey-purchase-330-rosaries-after-threadspun-town': 'Belltown',
    'beastfly-hunt': 'Belltown',
    'ant-trapper': 'Belltown',
    'destroy-thread-cores': 'Belltown',
    'pale-oil-flea-games': 'Belltown',
    'purchased-grindle-spool-piece': 'Coral_42',
    'purchased-grindle-tool-kit': 'Coral_42',
    'pilgrim-quest-spool-collected': 'Ward_03',
    'took-greymoor17-spool': 'Greymoor_16',
    'purchased-pilgrims-rest-tool-pouch': 'Bone_East_10',
    'far-fields-mort-purchase-pilgrims-rest-150-rosaries': 'Bone_East_10',
    'loddie-the-marrow': 'Bone_11',
    'journal': 'Greymoor_03',
    'crow-feathers': 'Greymoor_03',
    'purchased-forge-tool-kit': 'Dock_02',
    'purchased-architect-tool-kit': 'Under_17',
    'pale-oil-great-gourmand': 'Song_20',
    'sprintmaster-race': 'Bone_East_24',
};

const MISSING_CHECKLISTS = [
    { parsedKey: 'maskShards', listName: 'maskShardSources', kind: 'Mask Shard', color: '#4fc3f7' },
    { parsedKey: 'spoolFragments', listName: 'spoolFragmentSources', kind: 'Spool Fragment', color: '#ffb74d' },
    { parsedKey: 'memoryLockets', listName: 'memoryLocketSources', kind: 'Memory Locket', color: '#81c784' },
    { parsedKey: 'craftmetal', listName: 'craftmetalSources', kind: 'Craftmetal', color: '#b0bec5' },
    { parsedKey: 'toolPouch', listName: 'toolPouchSources', kind: 'Tool Pouch', color: '#ce93d8' },
    { parsedKey: 'craftingKit', listName: 'craftingKitSources', kind: 'Crafting Kit', color: '#ce93d8' },
    { parsedKey: 'paleOil', listName: 'paleOilSources', kind: 'Pale Oil', color: '#fff176' },
    { parsedKey: 'mossberries', listName: 'mossberrySources', kind: 'Mossberry', color: '#a5d6a7' },
    { parsedKey: 'silkeaters', listName: 'silkeaterSources', kind: 'Silkeater', color: '#ef9a9a' },
];

function sceneForChecklistEntry(packEntry) {
    if (packEntry.sceneName) return packEntry.sceneName;
    if (Array.isArray(packEntry.checks)) {
        const sc = packEntry.checks.find(c => c.sceneName)?.sceneName;
        if (sc) return sc;
    }
    return ITEM_ID_SCENES[packEntry.id] || null;
}

/**
 * Build map pins for uncollected items in `parsed` across upgrade & collectable
 * checklists plus scattered Fleas (`SavedFlea_<Scene>`).
 */
export function buildMissingPins(parsed, lookup, tiles, scenesVisited = []) {
    if (!parsed) return [];
    const rawPins = [];

    for (const cfg of MISSING_CHECKLISTS) {
        const parsedSources = parsed[cfg.parsedKey]?.sources || [];
        const packById = new Map(mergedList(cfg.listName).map(e => [e.id, e]));
        for (const src of parsedSources) {
            if (src.collected || src.pending) continue;
            const packEntry = packById.get(src.id);
            const scene = packEntry ? sceneForChecklistEntry(packEntry) : null;
            if (!scene) continue;
            const center = sceneBoundsCenter(scene, lookup, tiles, scenesVisited);
            if (!center) continue;
            rawPins.push({
                id: src.id,
                kind: cfg.kind,
                name: src.name,
                scene,
                color: cfg.color,
                x: center.x,
                y: center.y,
                title: `Missing ${cfg.kind} · ${src.name}`,
            });
        }
    }

    for (const flea of parsed.fleas?.fleas || []) {
        if (flea.value || !flea.json?.startsWith('SavedFlea_')) continue;
        const scene = flea.json.slice('SavedFlea_'.length);
        const center = sceneBoundsCenter(scene, lookup, tiles, scenesVisited);
        if (!center) continue;
        rawPins.push({
            id: flea.id || flea.json,
            kind: 'Flea',
            name: flea.display,
            scene,
            color: '#f48fb1',
            x: center.x,
            y: center.y,
            title: `Missing Flea · ${flea.display}`,
        });
    }

    // Offset pins that share the exact same room center so all remain clickable
    const byCoord = new Map();
    for (const p of rawPins) {
        const key = `${Math.round(p.x)},${Math.round(p.y)}`;
        if (!byCoord.has(key)) byCoord.set(key, []);
        byCoord.get(key).push(p);
    }
    for (const group of byCoord.values()) {
        if (group.length <= 1) continue;
        const radius = 14;
        group.forEach((p, idx) => {
            const angle = (2 * Math.PI * idx) / group.length;
            p.x = Math.round((p.x + radius * Math.cos(angle)) * 10) / 10;
            p.y = Math.round((p.y + radius * Math.sin(angle)) * 10) / 10;
        });
    }

    return rawPins;
}

/** 16899.4 -> '4h 41m'; 300 -> '5m'. */
export function formatPlayTime(seconds) {
    const total = Math.max(0, Math.floor(seconds / 60));
    const h = Math.floor(total / 60), m = total % 60;
    return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
}
