/**
 * Contract tests between content packs, assets and real saves.
 *
 * - every icon a pack names exists under web/assets/img
 * - ids are unique per list across all packs
 * - patch drift: every top-level playerData key a pack reads is present in
 *   EVERY fixture (fixtures span game versions 1.0.28561 and 1.0.29315). A key
 *   the game renamed or removed fails here instead of silently rendering as
 *   "missing" in the UI.
 * - names inside containers (Tools, ToolEquips, QuestCompletionData, sceneData
 *   pickups) must appear in AT LEAST ONE fixture, because the game only creates
 *   those entries once the item is met.
 *
 * Exceptions are listed below with the reason. Adding one needs evidence.
 */
import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PACKS, mergedList, listNames } from './index.js';
import { ICON_DIRS } from '../../core/icons.js';
import { resolveSaveBanner } from '../categories/general.js';

const WEB = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const FIXTURE_DIR = join(WEB, 'src', 'data', '__fixtures__');
const FIXTURES = readdirSync(FIXTURE_DIR)
    .filter(f => f.endsWith('.json') && !f.endsWith('.expected.json'))
    .map(f => ({ name: f, save: JSON.parse(readFileSync(join(FIXTURE_DIR, f), 'utf-8')) }));

/** Icon kind (core/icons.js) for each list that has icons. */
const ICON_KIND = {
    tools: 'tool', bosses: 'boss', maps: 'map', travel: 'marker',
    abilities: 'ability', otherAbilities: 'ability', cloakTiers: 'ability',
    skills: 'skill', crests: 'crest', specialCrestStates: 'crest', needleTiers: 'nail',
    journal: 'journal',
    fleas: 'flea', relics: 'collectable', materium: 'general', mementos: 'memento', keyItems: 'key',
};
const iconKindOf = name => ICON_KIND[name] ?? (name.endsWith('Sources') ? 'general' : null);

/** Lists whose `json` is a top-level playerData key. */
const TOP_LEVEL_LISTS = ['generalFields', 'currentFields', 'miscFields', 'bosses', 'fleas', 'abilities', 'otherAbilities', 'skills', 'maps', 'travel', 'keyItems'];

/** Top-level keys allowed to be absent from some saves. */
const OPTIONAL_TOP_KEYS = {
    currentArea: 'not written until the player first enters a named area (absent in brand-new saves)',
};

/** Container names not met in any fixture save (keyed by "<kind>:<name>" or tool name). */
const NEVER_IN_FIXTURES = {
    'Curve Claws Upgraded': 'Curvesickle: fixture saves only have Curveclaw',
    'WebShot Forge': 'Silkshot variant not chosen in any fixture save',
    'WebShot Architect': 'Silkshot variant not chosen in any fixture save',
    'Mosscreep Tool 2': "Druid's Eyes: fixture saves only have Druid's Eye",
    'Shell Satchel': 'Steel Soul only; the Steel Soul fixture is a new game',
};

const NEVER_IN_FIXTURES_CONTAINERS = {
    'journal:Garmond_Zaza': 'missable Act 2 spar; absent from fixtures',
    'journal:Abyss Mass': 'Steel Soul exclusive (Summoned Saviour); Steel Soul fixture is a new game',
    'relics:Weaver Totem Bonetown_upper_room': 'not collected in fixture saves',
    'relics:Weaver Record Sprint_Challenge': 'not collected in fixture saves',
    'materium:Courier Supplies Slave': "Queen's Egg courier item; not collected in fixture saves",
    'materium:Courier Supplies Mask Maker': 'Liquid Lacquer courier item; not collected in fixture saves',
    'quests:Huntress Quest Runt': 'optional Act 3 hunt wish; not accepted in fixture saves',
    'quests:Courier Delivery Bonebottom': 'repeatable delivery wish; not accepted in fixture saves',
    'quests:Courier Delivery Dustpens Slave': 'repeatable delivery wish; not accepted in fixture saves',
    'quests:Courier Delivery Fleatopia': 'repeatable delivery wish; not accepted in fixture saves',
    'quests:Courier Delivery Mask Maker': 'repeatable delivery wish; not accepted in fixture saves',
    'quests:Courier Delivery Fixer': 'repeatable delivery wish; not accepted in fixture saves',
    'quests:Steel Sentinel': 'Steel Soul exclusive wish; Steel Soul fixture is a new game',
};

/** Scene pickups not visited in any fixture save. */
const NEVER_IN_FIXTURES_SCENES = {
    'Dock_13/Collectable Item Pickup': 'Deep Docks Memory Locket not picked up in any fixture save',
    'Greymoor_17/Shell Fossil Mimic': 'optional Shardillard not triggered in any fixture save',
    'Weave_03/Black_Thread_Core': 'optional Void Mass not visited in Act 3 fixture save',
    'Bone_07/Black_Thread_Core': 'optional Void Mass not visited in Act 3 fixture save',
    'Ant_05b/Black_Thread_Core': 'optional Void Mass not visited in Act 3 fixture save',
    'Greymoor_12/Black_Thread_Core': 'optional Void Mass not visited in Act 3 fixture save',
    'Shellwood_15/Black_Thread_Core': 'optional Void Mass not visited in Act 3 fixture save',
    'Dust_03/Black_Thread_Core': 'optional Void Mass not visited in Act 3 fixture save',
    'Song_04/Black_Thread_Core': 'optional Void Mass not visited in Act 3 fixture save',
    'Song_15/Black_Thread_Core_Citadel': 'optional Void Mass not visited in Act 3 fixture save',
    'Song_17/Black_Thread_Core_Citadel': 'optional Void Mass not visited in Act 3 fixture save',
    'Hang_03/Black_Thread_Core_Citadel': 'optional Void Mass not visited in Act 3 fixture save',
    'Hang_13/Black_Thread_Core': 'optional Void Mass not visited in Act 3 fixture save',
};

const allTopKeys = () => new Set(FIXTURES.flatMap(f => Object.keys(f.save.playerData)));
const containerNames = (save, key) => new Set((save.playerData[key]?.savedData || []).map(e => e.Name));
const inSomeFixture = (key, name) => FIXTURES.some(f => containerNames(f.save, key).has(name));
const scenePickupSeen = (sceneName, id) => FIXTURES.some(f =>
    (f.save.sceneData?.persistentBools?.serializedList || []).some(e => e.SceneName === sceneName && e.ID === id));
const sceneIntSeen = (sceneName, id) => FIXTURES.some(f =>
    (f.save.sceneData?.persistentInts?.serializedList || []).some(e => e.SceneName === sceneName && e.ID === id));
const sceneVisitedSeen = (sceneName) => FIXTURES.some(f =>
    (f.save.playerData?.scenesVisited || []).includes(sceneName));
const expandChecks = (src) => (src.flagType === 'any' ? (src.checks || []) : [src]);

describe('pack contracts', () => {
    it('fixtures cover more than one game version', () => {
        expect(new Set(FIXTURES.map(f => f.save.playerData.version)).size).toBeGreaterThan(1);
    });

    it('every icon exists on disk', () => {
        const missing = [];
        for (const name of listNames()) {
            const defaultKind = iconKindOf(name);
            for (const entry of mergedList(name)) {
                const kind = entry.iconKind || defaultKind;
                if (!kind) continue;
                for (const field of ['icon', 'iconSteelSoul']) {
                    const file = entry[field];
                    if (file && !existsSync(join(WEB, ICON_DIRS[kind], file))) missing.push(`${name}/${entry.id}.${field}: ${file}`);
                }
            }
        }
        expect(missing).toEqual([]);
    });

    it('ids are unique per list across all packs', () => {
        for (const name of listNames()) {
            const ids = mergedList(name).map(e => e.id);
            expect(ids.filter((id, i) => ids.indexOf(id) !== i), name).toEqual([]);
        }
    });

    it('patch drift: top-level keys are present in every fixture', () => {
        const problems = [];
        const keys = new Set([
            ...TOP_LEVEL_LISTS.flatMap(n => mergedList(n)
                .filter(e => e.source !== 'journal')
                .flatMap(e => [e.json, ...(e.altFlags || [])]).filter(Boolean)),
            ...listNames().filter(n => n.endsWith('Sources')).flatMap(n => mergedList(n))
                .flatMap(expandChecks)
                .filter(s => s.flagType === 'bool' || s.flagType === 'flagMin' || s.flagType === 'bit').map(s => s.flag),
            ...mergedList('cloakTiers').map(t => t.requires).filter(Boolean),
            ...mergedList('mementos').map(m => m.flag).filter(Boolean),
            ...mergedList('mementos').flatMap(m => m.allFlags || []),
        ]);
        for (const key of keys) {
            if (OPTIONAL_TOP_KEYS[key]) continue;
            for (const f of FIXTURES) if (!(key in f.save.playerData)) problems.push(`${key} missing in ${f.name}`);
        }
        expect(problems).toEqual([]);
    });

    it('optional top-level keys are still read somewhere and still seen in some save', () => {
        const seen = allTopKeys();
        for (const key of Object.keys(OPTIONAL_TOP_KEYS)) expect(seen.has(key), key).toBe(true);
    });

    it('container names appear in at least one fixture', () => {
        const problems = [];
        for (const t of mergedList('tools')) {
            if (!NEVER_IN_FIXTURES[t.json] && !inSomeFixture('Tools', t.json)) problems.push(`tool ${t.json}`);
        }
        const journalNames = new Set(FIXTURES.flatMap(f => (f.save.playerData.EnemyJournalKillData?.list || []).map(e => e.Name)));
        for (const j of mergedList('journal')) {
            if (!NEVER_IN_FIXTURES_CONTAINERS[`journal:${j.json}`] && !journalNames.has(j.json)) problems.push(`journal ${j.json}`);
        }
        for (const b of mergedList('bosses')) {
            if (b.source === 'journal' && !NEVER_IN_FIXTURES_CONTAINERS[`journal:${b.json}`] && !journalNames.has(b.json)) {
                problems.push(`boss journal ${b.json}`);
            }
        }
        for (const [list, container] of [['relics', 'Relics'], ['materium', 'MateriumCollected'], ['inventoryItems', 'Collectables'], ['quests', 'QuestCompletionData']]) {
            for (const e of mergedList(list)) {
                if (!NEVER_IN_FIXTURES_CONTAINERS[`${list}:${e.json}`] && !inSomeFixture(container, e.json)) problems.push(`${list} ${e.json}`);
            }
        }
        for (const s of mergedList('skills')) {
            if (!inSomeFixture('Tools', s.equipName)) problems.push(`skill equipName ${s.equipName}`);
        }
        for (const c of [...mergedList('crests'), ...mergedList('specialCrestStates')]) {
            for (const alias of c.aliases) if (!inSomeFixture('ToolEquips', alias)) problems.push(`crest alias ${alias}`);
        }
        for (const k of mergedList('keyItems')) {
            if (k.sceneName && !scenePickupSeen(k.sceneName, k.sceneId)) problems.push(`keyItem scene ${k.sceneName}/${k.sceneId}`);
        }
        for (const name of listNames().filter(n => n.endsWith('Sources'))) {
            for (const s of mergedList(name).flatMap(expandChecks)) {
                if (s.flagType === 'quest' && !inSomeFixture('QuestCompletionData', s.flag)) problems.push(`quest ${s.flag}`);
                if (s.flagType === 'scene') {
                    const key = `${s.sceneName}/${s.sceneId}`;
                    if (!NEVER_IN_FIXTURES_SCENES[key] && !scenePickupSeen(s.sceneName, s.sceneId)) problems.push(`scene ${key}`);
                }
                if (s.flagType === 'sceneInt') {
                    const key = `${s.sceneName}/${s.sceneId}`;
                    if (!NEVER_IN_FIXTURES_SCENES[key] && !sceneIntSeen(s.sceneName, s.sceneId)) problems.push(`sceneInt ${key}`);
                }
                if (s.flagType === 'sceneVisited' && !sceneVisitedSeen(s.sceneName)) problems.push(`sceneVisited ${s.sceneName}`);
            }
        }
        expect(problems).toEqual([]);
    });

    it('exceptions stay honest: a listed name that appears in a fixture must be removed from the list', () => {
        for (const name of Object.keys(NEVER_IN_FIXTURES)) expect(inSomeFixture('Tools', name), name).toBe(false);
        const journalNames = new Set(FIXTURES.flatMap(f => (f.save.playerData.EnemyJournalKillData?.list || []).map(e => e.Name)));
        const containerByList = { relics: 'Relics', materium: 'MateriumCollected', quests: 'QuestCompletionData' };
        for (const key of Object.keys(NEVER_IN_FIXTURES_CONTAINERS)) {
            const [kind, ...rest] = key.split(':');
            const name = rest.join(':');
            const seen = kind === 'journal' ? journalNames.has(name) : inSomeFixture(containerByList[kind], name);
            expect(seen, key).toBe(false);
        }
        for (const key of Object.keys(NEVER_IN_FIXTURES_SCENES)) {
            const [sceneName, sceneId] = key.split('/');
            expect(scenePickupSeen(sceneName, sceneId) || sceneIntSeen(sceneName, sceneId), key).toBe(false);
        }
    });

    it('every pack declares the required fields', () => {
        for (const p of PACKS) {
            expect(p).toEqual(expect.objectContaining({ id: expect.any(String), label: expect.any(String), minVersion: expect.any(String) }));
            expect(typeof p.detect).toBe('function');
        }
    });

    it('every save slot area banner resolves to an existing saveart file on disk', () => {
        const areas = [
            'ABYSS', 'AQUEDUCT', 'ARBORIUM', 'ASPID', 'BELLHART', 'BELLHART_HAUNTED',
            'BELLHOME', 'BELLSHRINE', 'BELLVEIN', 'BONEBOTTOM', 'BONECHURCH', 'BONEFOREST',
            'BONEGRAVE', 'BORDER_CAVES', 'CITADEL_STATION', 'CITY_OF_SONG', 'CLOVER',
            'COG_CORE', 'CORAL_CAVERNS', 'CORAL_GORGE', 'CORAL_TOWER', 'CRADLE',
            'CRADLE_DESTROYED', 'CRAWL', 'DOCKS', 'DUSTPENS', 'ENCLAVE', 'ENCLAVE_BELLSHRINE',
            'FLEATOPIA', 'FLEA_FESTIVAL', 'GRAND_GATE', 'GRANDGATE', 'GREYMOOR', 'HALFWAY',
            'HANG', 'HUNTERS_NEST', 'LIBRARY', 'MEMORY', 'MOSSCAVE', 'MOSSTOWN', 'ORGAN',
            'PEAK', 'PILGRIMS_REST', 'PINSTRESS', 'RED_MEMORY', 'REDMEMORY', 'SCORCHLANDS',
            'SEAMSTRESS', 'SHELLWOOD', 'SLAB_CELL', 'SPRINTMASTER_CAVE', 'SWAMP', 'THE_SLAB',
            'TUBE_HUB', 'UNDERSTORE', 'WARD', 'WEAVER_SHRINE', 'WISP', '',
        ];
        const missing = [];
        for (const currentArea of areas) {
            for (const blackThreadWorld of [false, true]) {
                for (const BelltownHouseColour of [0, 1, 2, 3, 4, 5, 6]) {
                    const { artFile } = resolveSaveBanner({ currentArea, blackThreadWorld, BelltownHouseColour });
                    if (!existsSync(join(WEB, ICON_DIRS.saveart, artFile))) {
                        missing.push(`${currentArea}/${blackThreadWorld}/${BelltownHouseColour}: ${artFile}`);
                    }
                }
            }
        }
        expect(missing).toEqual([]);
        expect(existsSync(join(WEB, ICON_DIRS.saveart, 'Area_Art_Black_Thread_Overlay.png'))).toBe(true);
    });
});
