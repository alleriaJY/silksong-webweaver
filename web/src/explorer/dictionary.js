/**
 * Savefile Variable Dictionary: maps playerData keys and sceneData entries
 * (persistentBools, persistentInts, geoRocks) to human-readable categories,
 * descriptions, and verification status.
 *
 * Three-layer resolution (highest priority first):
 *   1. Auto-derived from content packs (packs/base/*) -> status: 'verified'
 *   2. Curated PLAYER_DATA_DOCS (containers, counters, timers, engine) -> status: 'verified'
 *   3. Pattern rules from packs/base/untracked.js + scene ID heuristics -> status: 'pattern'
 *   Otherwise -> status: 'unknown', category: 'Undocumented'
 */
import { mergedList } from '../data/packs/index.js';
import { UNTRACKED } from '../data/packs/base/untracked.js';
import { AREAS } from '../data/packs/base/areas.js';

const AREA_BY_PREFIX = new Map(AREAS.map(a => [a.prefix.toLowerCase(), a.display || a.prefix]));
function areaNameOf(sceneName) {
    if (!sceneName) return '';
    const prefix = String(sceneName).split('_')[0].toLowerCase();
    return AREA_BY_PREFIX.get(prefix) || sceneName;
}

/** Curated descriptions for structural containers and scalar playerData keys. */
export const PLAYER_DATA_DOCS = {
    // Containers / Lists
    Tools: { category: 'Collectables', description: 'Unlocked, seen, and selected state for every Red, Blue, and Yellow Tool.' },
    ToolEquips: { category: 'Progression', description: 'Per-Crest unlock state and equipped Tool/Skill slot assignments.' },
    ExtraToolEquips: { category: 'Progression', description: 'Equipped tools in the Vesticrest extra Yellow/Blue slots.' },
    ToolLiquids: { category: 'Collectables', description: 'Remaining charges/refills for liquid-based tools (e.g. Flea Brew, Plasmium Phial).' },
    QuestCompletionData: { category: 'Quests', description: 'Accepted, completed, and progress counts for all Quests & Wishes.' },
    QuestRumourData: { category: 'Quests', description: 'Heard rumour/hint entries on wishboards before accepting the quest.' },
    Collectables: { category: 'Collectables', description: 'Carried inventory items and current stack amounts (Rosary strings, keys, quest items, etc.).' },
    Relics: { category: 'Collectables', description: 'Collected and deposited state for all Relics and Psalm Cylinders.' },
    MateriumCollected: { category: 'Collectables', description: 'Materials recorded in the Bellhome Materium.' },
    MementosDeposited: { category: 'Collectables', description: 'Mementos placed on the display shelf in Hornet\'s Bellhome.' },
    EnemyJournalKillData: { category: 'Journal', description: 'Hunter\'s Journal kill counts and seen markers per internal enemy ID.' },
    StoryEvents: { category: 'World & Story', description: 'Chronological log of major story events (EventType, PlayTime, SceneName).' },
    scenesVisited: { category: 'Maps & Travel', description: 'Ordered list of every scene ID Hornet has entered (drives Hero\'s Path).' },
    scenesMapped: { category: 'Maps & Travel', description: 'Scene IDs that have been drawn onto the in-game map (requires Quill + Bench).' },
    scenesEncounteredBench: { category: 'Maps & Travel', description: 'Legacy/engine bench encounter list (often empty in current patches).' },
    scenesEncounteredCocoon: { category: 'Maps & Travel', description: 'Scenes where Hornet has encountered a death cocoon.' },
    placedMarkers: { category: 'Maps & Travel', description: 'Custom map markers placed by the player on the world map.' },
    FleasCollectedTargetOrder: { category: 'Collectables', description: 'Order in which fleas were rescued (present on early 1.0.28561 saves).' },
    SteelQuestSpots: { category: 'Quests', description: 'Steel Soul exclusive quest target locations.' },
    mossBerryValueList: { category: 'Collectables', description: 'Internal value/state list for Mossberries turned in to the Moss Druid.' },
    GrubFarmerMimicValueList: { category: 'NPCs', description: 'Internal value/state list for Styx\'s Silkeater/grub farm.' },

    // Core Progress, Endings, Quills, Modes
    CompletedEndings: { category: 'World & Story', description: 'Bitmask of endings completed (1=Weaver Queen, 2=Twisted Child, 4=Snared Silk, 8=Sister of the Void).' },
    LastCompletedEnding: { category: 'World & Story', description: 'Bit ID of the most recently completed ending.' },
    QuillState: { category: 'Maps & Travel', description: 'Equipped Quill color variant (0=None, 1=White, 2=Red, 3=Purple).' },
    hasQuill: { category: 'Maps & Travel', description: 'Whether Hornet owns a Quill to update area maps at benches.' },
    CaravanTroupeLocation: { category: 'World & Story', description: 'Flea Caravan progression stage (0=Bone Bottom, 1=Greymoor, 2=Blasted Steps, 3=Fleatopia).' },
    BelltownHouseState: { category: 'World & Story', description: 'Bellhome upgrade/renovation stage in Bellhart.' },
    enclaveLevel: { category: 'World & Story', description: 'Songclave settlement development level (driven by donation wishes).' },
    blackThreadWorld: { category: 'World & Story', description: 'Act 3 world state flag: Pharloom is overtaken by Black Thread / Void.' },
    citadelWoken: { category: 'World & Story', description: 'Act 2 story flag: the Citadel has awakened.' },
    citadelHalfwayComplete: { category: 'World & Story', description: 'Act 2 midpoint milestone flag.' },
    hasNeedolinMemoryPowerup: { category: 'Progression', description: 'Elegy of the Deep powerup for the Needolin (used to enter Old Heart memories).' },
    UnlockedFastTravelTeleport: { category: 'Maps & Travel', description: 'Beastling Call fast-travel teleport unlocked.' },

    // Health, Silk, Combat, Timers
    maxHealthBase: { category: 'Progression', description: 'Base maximum masks before temporary Lifeblood/Plasmium masks.' },
    healthBlue: { category: 'Current State', description: 'Current temporary Lifeblood / Plasmium masks.' },
    prevHealth: { category: 'Current State', description: 'Health value stored prior to the last transition/memory.' },
    heartPieces: { category: 'Progression', description: 'Partial Mask Shards currently held toward the next full Mask (0-3).' },
    silkSpoolParts: { category: 'Progression', description: 'Partial Spool Fragments currently held toward the next Silk notch (0-1).' },
    silkSpecialLevel: { category: 'Progression', description: 'Internal Silk Skill / special tier level.' },
    nailRange: { category: 'Progression', description: 'Bonus Needle reach modifier.' },
    beamDamage: { category: 'Progression', description: 'Needle beam/projectile damage modifier.' },
    attunement: { category: 'Engine / Meta', description: 'Internal attunement counter.' },
    attunementLevel: { category: 'Engine / Meta', description: 'Internal attunement tier.' },
    CrawbellTimer: { category: 'World & Story', description: 'Elapsed timer for the Bellhome Crawbell passive rosary/shard generator.' },
    GrowstoneState: { category: 'Collectables', description: 'Growth stage of the Growstone.' },
    GrowstoneTimer: { category: 'Collectables', description: 'Elapsed timer for Growstone growth.' },
    GrubFarmerSilkGrubsSold: { category: 'NPCs', description: 'Number of Silkeaters bought/taken from Styx.' },
    grubFarmLevel: { category: 'NPCs', description: 'Upgrade level of Styx\'s Silkeater farm.' },
    cloakOdour_slabFly: { category: 'World State', description: 'Slab fly scent/odour counter on Hornet\'s cloak.' },

    // Death, Respawn, Memory, Maze, Engine
    HeroDeathScenePos: { category: 'Current State', description: 'World (x, y) coordinates of Hornet\'s active death cocoon.' },
    HeroDeathSceneSize: { category: 'Current State', description: 'Scene bounds where Hornet\'s death cocoon was dropped.' },
    PreMemoryState: { category: 'Current State', description: 'Saved player state restored upon exiting a memory sequence.' },
    PreviousCrestID: { category: 'Current State', description: 'Crest equipped before entering a temporary state (e.g. Cursed/Cloakless).' },
    TempGeoStore: { category: 'Current State', description: 'Rosaries temporarily stored (e.g. inside active death cocoon).' },
    TempShellShardStore: { category: 'Current State', description: 'Shell Shards temporarily stored during special sequences.' },
    MazeEntranceScene: { category: 'World State', description: 'Scene from which Hornet entered The Mist maze.' },
    MazeEntranceInitialScene: { category: 'World State', description: 'Initial entry scene recorded for The Mist maze.' },
    PreviousMazeScene: { category: 'World State', description: 'Previous room visited inside The Mist maze.' },
    FastTravelNPCLocation: { category: 'Maps & Travel', description: 'Current station index of the Bell Beast.' },
    extraRestZone: { category: 'Current State', description: 'Active rest/respawn zone enum.' },
    hazardRespawnFacing: { category: 'Current State', description: 'Facing direction on hazard respawn.' },
    previousDarkness: { category: 'Engine / Meta', description: 'Darkness level of the previous room.' },
    environmentType: { category: 'Engine / Meta', description: 'Audio/footstep environment material enum for the current room.' },
    currentInvPane: { category: 'Engine / Meta', description: 'Last opened inventory pane index.' },
    mapKeyPref: { category: 'Engine / Meta', description: 'Saved map UI preference.' },
    profileID: { category: 'Engine / Meta', description: 'Save slot number (1-4).' },
    RevisionBreak: { category: 'Engine / Meta', description: 'Internal Team Cherry save-schema revision number.' },
    date: { category: 'Engine / Meta', description: 'Timestamp string when the save was last written.' },
    LastSetFieldName: { category: 'Engine / Meta', description: 'Debug/engine field recording the last PlayerData variable modified.' },

    // Town Crowds & Dynamic Spawns
    belltownCrowd: { category: 'World State', description: 'Crowd population state in Bellhart.' },
    bonetownCrowd: { category: 'World State', description: 'Crowd population state in Bone Bottom.' },
    halfwayCrowd: { category: 'World State', description: 'Crowd population state in Halfway Home.' },
    halfwayCrowEnemyGroup: { category: 'World State', description: 'Active enemy group variation in Greymoor / Halfway Home.' },
    enemyGroupAnt04: { category: 'World State', description: 'Active enemy group variation in Hunter\'s March (Ant_04).' },
    EnclaveStateNPCShortHorned: { category: 'NPCs', description: 'Songclave NPC variant state (Short-Horned Pilgrim).' },
    EnclaveStateNPCStandard: { category: 'NPCs', description: 'Songclave NPC variant state (Standard Pilgrim).' },
    EnclaveStateNPCTall: { category: 'NPCs', description: 'Songclave NPC variant state (Tall Pilgrim).' },
    EnclaveStatePilgrimSmall: { category: 'NPCs', description: 'Songclave NPC variant state (Small Pilgrim).' },
    EnclaveState_songKnightFan: { category: 'NPCs', description: 'Songclave NPC state (Second Sentinel admirer).' },
    whiteCloverPos: { category: 'World State', description: 'Current room/position index of the Palestag / White Clover.' },
    greyWarriorDeathX: { category: 'World State', description: 'X-coordinate where Watcher at the Edge was defeated.' },
};

const UNTRACKED_CATEGORY = {
    'npc-met': 'NPCs',
    'npc-dialogue': 'Dialogue',
    'npc-state': 'NPCs',
    'tutorial-prompts': 'Engine / Meta',
    'first-encounter': 'Bosses',
    'area-visited': 'Maps & Travel',
    'world-state': 'World State',
    'story-acts': 'World & Story',
    'meta-debug': 'Engine / Meta',
    'map-ui': 'Maps & Travel',
    'keys-items': 'Key Items',
    'collection-substeps': 'Quests',
    'unused-shop': 'Collectables',
};

const COMPILED_UNTRACKED = UNTRACKED.map(u => ({
    id: u.id,
    category: UNTRACKED_CATEGORY[u.id] || 'World State',
    reason: u.reason,
    rx: new RegExp(u.pattern),
}));

/** Split camelCase / snake_case into readable words for pattern-matched hints. */
function humanizeKey(key) {
    return key
        .replace(/_/g, ' ')
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/\s+/g, ' ')
        .trim();
}

const LIST_TO_CATEGORY = [
    ['generalFields', 'General'],
    ['currentFields', 'Current State'],
    ['miscFields', 'Current State'],
    ['bosses', 'Bosses'],
    ['fleas', 'Collectables'],
    ['abilities', 'Progression'],
    ['otherAbilities', 'Progression'],
    ['skills', 'Progression'],
    ['maps', 'Maps & Travel'],
    ['travel', 'Maps & Travel'],
    ['keyItems', 'Key Items'],
    ['mementos', 'Collectables'],
];

const SOURCE_LIST_TO_CATEGORY = [
    ['maskShardSources', 'Progression', 'Mask Shard'],
    ['spoolFragmentSources', 'Progression', 'Spool Fragment'],
    ['silkHeartSources', 'Progression', 'Silk Heart'],
    ['toolPouchSources', 'Progression', 'Tool Pouch'],
    ['craftingKitSources', 'Progression', 'Crafting Kit'],
    ['otherUnlockableSources', 'Progression', 'Unlockable'],
    ['vesticrestSources', 'Progression', 'Vesticrest'],
    ['craftmetalSources', 'Collectables', 'Craftmetal'],
    ['memoryLocketSources', 'Collectables', 'Memory Locket'],
    ['paleOilSources', 'Collectables', 'Pale Oil'],
    ['mossberrySources', 'Collectables', 'Mossberry'],
    ['silkeaterSources', 'Collectables', 'Silkeater'],
    ['bellhomeSources', 'World & Story', 'Bellhome'],
    ['uniqueSpawnSources', 'Bosses', 'Unique Spawn'],
    ['worldMilestoneSources', 'World & Story', 'World Milestone'],
];

let cachedIndex = null;

/** Build (and cache) lookup maps from content packs + curated docs. */
export function getDictionaryIndex() {
    if (cachedIndex) return cachedIndex;

    const pdMap = new Map();
    const sceneBoolMap = new Map();
    const sceneIntMap = new Map();

    const addPd = (key, entry) => {
        if (!key || pdMap.has(key)) return;
        pdMap.set(key, { ...entry, status: 'verified' });
    };

    for (const [listName, category] of LIST_TO_CATEGORY) {
        for (const item of mergedList(listName)) {
            if (item.source === 'journal') continue;
            if (item.json) {
                const desc = item.note ? `${item.display} — ${item.note}` : item.display;
                addPd(item.json, { category, description: desc });
            }
            for (const alt of item.altFlags || []) {
                addPd(alt, { category, description: `${item.display} (alternate flag)` });
            }
            if (item.flag) addPd(item.flag, { category, description: item.display });
            for (const f of item.allFlags || []) addPd(f, { category, description: `${item.display} component flag` });
            if (item.sceneName && item.sceneId) {
                sceneBoolMap.set(`${item.sceneName}/${item.sceneId}`, {
                    category, description: `${item.display}${item.note ? ` — ${item.note}` : ''}`, status: 'verified',
                });
            }
        }
    }

    for (const [listName, category, prefix] of SOURCE_LIST_TO_CATEGORY) {
        for (const item of mergedList(listName)) {
            const checks = item.flagType === 'any' ? (item.checks || []) : [item];
            for (const c of checks) {
                if ((c.flagType === 'bool' || c.flagType === 'flagMin' || c.flagType === 'bit') && c.flag) {
                    addPd(c.flag, { category, description: `${prefix}: ${item.name}` });
                } else if (c.flagType === 'scene' && c.sceneName && c.sceneId) {
                    sceneBoolMap.set(`${c.sceneName}/${c.sceneId}`, {
                        category, description: `${prefix}: ${item.name}`, status: 'verified',
                    });
                } else if (c.flagType === 'sceneInt' && c.sceneName && c.sceneId) {
                    sceneIntMap.set(`${c.sceneName}/${c.sceneId}`, {
                        category, description: `${prefix}: ${item.name}`, status: 'verified',
                    });
                }
            }
        }
    }

    // Curated PLAYER_DATA_DOCS (overrides/fills structural & scalar keys)
    for (const [key, doc] of Object.entries(PLAYER_DATA_DOCS)) {
        pdMap.set(key, { ...doc, status: 'verified' });
    }

    cachedIndex = { pdMap, sceneBoolMap, sceneIntMap };
    return cachedIndex;
}

/** Look up any playerData key -> { category, description, status }. */
export function describePlayerDataKey(key) {
    const { pdMap } = getDictionaryIndex();
    if (pdMap.has(key)) return pdMap.get(key);

    for (const rule of COMPILED_UNTRACKED) {
        if (rule.rx.test(key)) {
            return {
                category: rule.category,
                description: `${humanizeKey(key)} (${rule.reason})`,
                status: 'pattern',
            };
        }
    }
    return {
        category: 'Undocumented',
        description: `${humanizeKey(key)} — not yet documented`,
        status: 'unknown',
    };
}

/** Heuristic classification for sceneData objects not explicitly in packs. */
const SCENE_ID_RULES = [
    { rx: /Geo Rock/i, category: 'Caches & Secrets', label: 'Rosary / Geo Rock deposit' },
    { rx: /Shell Shard|Shard Deposit|Fossil/i, category: 'Caches & Secrets', label: 'Shell Shard cache' },
    { rx: /Breakable|Wall|Floor|Ceiling|Secret/i, category: 'Caches & Secrets', label: 'Breakable wall / secret passage' },
    { rx: /Collectable Item Pickup/i, category: 'Collectables', label: 'World item pickup' },
    { rx: /Chest/i, category: 'Caches & Secrets', label: 'Chest' },
    { rx: /Bench|RestBench/i, category: 'Maps & Travel', label: 'Bench / rest point' },
    { rx: /Lever|Switch|Gate|Door|Lift|Elevator|Shortcut|Bridge/i, category: 'World State', label: 'Door, lever, or shortcut' },
    { rx: /Black_Thread_Core/i, category: 'Bosses', label: 'Void Mass (Act 3)' },
    { rx: /Battle Scene|Arena/i, category: 'World State', label: 'Room arena encounter' },
    { rx: /Cocoon|Silk Grub/i, category: 'Collectables', label: 'Silkeater cocoon' },
    { rx: /Rosary|Geo/i, category: 'Caches & Secrets', label: 'Rosary cache' },
];

/** Look up any sceneData entry -> { category, description, status, area }. */
export function describeSceneEntry(root, sceneName, id) {
    const { sceneBoolMap, sceneIntMap } = getDictionaryIndex();
    const composite = `${sceneName}/${id}`;
    const area = areaNameOf(sceneName);

    if (root === 'persistentBools' && sceneBoolMap.has(composite)) {
        return { ...sceneBoolMap.get(composite), area };
    }
    if (root === 'persistentInts' && sceneIntMap.has(composite)) {
        return { ...sceneIntMap.get(composite), area };
    }
    if (root === 'geoRocks') {
        return {
            category: 'Caches & Secrets',
            description: `Rosary / Geo Rock in ${area} (remaining hits)`,
            status: 'pattern',
            area,
        };
    }

    for (const rule of SCENE_ID_RULES) {
        if (rule.rx.test(id)) {
            return {
                category: rule.category,
                description: `${rule.label} in ${area}`,
                status: 'pattern',
                area,
            };
        }
    }

    return {
        category: 'World State',
        description: `Scene object in ${area} (${humanizeKey(id)})`,
        status: 'unknown',
        area,
    };
}
