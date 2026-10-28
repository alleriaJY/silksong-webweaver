/**
 * Contract tests between content packs, assets and real saves
 * (ROADMAP Phase 1 steps 10 and 11).
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

const WEB = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const FIXTURE_DIR = join(WEB, 'src', 'data', '__fixtures__');
const FIXTURES = readdirSync(FIXTURE_DIR)
    .filter(f => f.endsWith('.json') && !f.endsWith('.expected.json'))
    .map(f => ({ name: f, save: JSON.parse(readFileSync(join(FIXTURE_DIR, f), 'utf-8')) }));

/** Icon kind (core/icons.js) for each list that has icons. */
const ICON_KIND = {
    tools: 'tool', bosses: 'boss', maps: 'map', travel: 'map',
    abilities: 'ability', otherAbilities: 'ability', cloakTiers: 'ability',
    skills: 'skill', crests: 'crest', specialCrestStates: 'crest', needleTiers: 'nail',
    journal: 'journal',
};
const iconKindOf = name => ICON_KIND[name] ?? (name.endsWith('Sources') ? 'general' : null);

/** Lists whose `json` is a top-level playerData key. */
const TOP_LEVEL_LISTS = ['generalFields', 'currentFields', 'miscFields', 'bosses', 'fleas', 'abilities', 'otherAbilities', 'skills', 'maps', 'travel'];

/** Top-level keys allowed to be absent from some saves. */
const OPTIONAL_TOP_KEYS = {
    currentArea: 'not written until the player first enters a named area (absent in brand-new saves)',
};

/** Container names not met in any fixture save. */
const NEVER_IN_FIXTURES = {
    'Curve Claws Upgraded': 'Curvesickle: fixture saves only have Curveclaw',
    'WebShot Forge': 'Silkshot variant not chosen in any fixture save',
    'WebShot Architect': 'Silkshot variant not chosen in any fixture save',
    'Mosscreep Tool 2': "Druid's Eyes: fixture saves only have Druid's Eye",
    'Shell Satchel': 'Steel Soul only; the Steel Soul fixture is a new game',
};

/** Relic names (Relics container) not met in any fixture save. */
const RELICS_NEVER_IN_FIXTURES = {
    'Weaver Totem Bonetown_upper_room': 'Weaver Effigy above Bone Bottom: not collected in any fixture save',
    'Weaver Record Sprint_Challenge': 'Rune Harp from the Far Fields sprint plates: not collected in any fixture save',
};

/** Scene pickups (scene/ID) not met in any fixture save. */
const SCENE_NOT_IN_FIXTURES = {
    'Dock_13/Collectable Item Pickup': 'Deep Docks Memory Locket: no fixture save has entered the room',
};

const allTopKeys = () => new Set(FIXTURES.flatMap(f => Object.keys(f.save.playerData)));
const containerNames = (save, key) => new Set((save.playerData[key]?.savedData || []).map(e => e.Name));
const inSomeFixture = (key, name) => FIXTURES.some(f => containerNames(f.save, key).has(name));
const scenePickupSeen = (sceneName, id) => FIXTURES.some(f =>
    (f.save.sceneData?.persistentBools?.serializedList || []).some(e => e.SceneName === sceneName && e.ID === id));

describe('pack contracts', () => {
    it('fixtures cover more than one game version', () => {
        expect(new Set(FIXTURES.map(f => f.save.playerData.version)).size).toBeGreaterThan(1);
    });

    it('every icon exists on disk', () => {
        const missing = [];
        for (const name of listNames()) {
            const kind = iconKindOf(name);
            if (!kind) continue;
            for (const entry of mergedList(name)) {
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
            ...TOP_LEVEL_LISTS.flatMap(n => mergedList(n).map(e => e.json)),
            ...listNames().filter(n => n.endsWith('Sources')).flatMap(n => mergedList(n))
                .filter(s => s.flagType === 'bool' || s.flagType === 'atLeast').flatMap(s => [s.flag].flat()),
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
            if (!journalNames.has(j.json)) problems.push(`journal ${j.json}`);
        }
        for (const [list, container] of [['relics', 'Relics'], ['materium', 'MateriumCollected'], ['inventoryItems', 'Collectables'], ['quests', 'QuestCompletionData']]) {
            for (const e of mergedList(list)) {
                if (list === 'relics' && RELICS_NEVER_IN_FIXTURES[e.json]) continue;
                if (!inSomeFixture(container, e.json)) problems.push(`${list} ${e.json}`);
            }
        }
        for (const s of mergedList('skills')) {
            if (!inSomeFixture('Tools', s.equipName)) problems.push(`skill equipName ${s.equipName}`);
        }
        for (const c of [...mergedList('crests'), ...mergedList('specialCrestStates')]) {
            for (const alias of c.aliases) if (!inSomeFixture('ToolEquips', alias)) problems.push(`crest alias ${alias}`);
        }
        for (const name of listNames().filter(n => n.endsWith('Sources'))) {
            for (const s of mergedList(name)) {
                if (s.flagType === 'quest' && !inSomeFixture('QuestCompletionData', s.flag)) problems.push(`quest ${s.flag}`);
                if (s.flagType !== 'scene') continue;
                const ids = [s.sceneId].flat();
                if (!SCENE_NOT_IN_FIXTURES[`${s.sceneName}/${ids[0]}`] && !ids.some(id => scenePickupSeen(s.sceneName, id))) {
                    problems.push(`scene ${s.sceneName}/${ids.join('|')}`);
                }
            }
        }
        expect(problems).toEqual([]);
    });

    it('exceptions stay honest: a listed name that appears in a fixture must be removed from the list', () => {
        for (const name of Object.keys(NEVER_IN_FIXTURES)) expect(inSomeFixture('Tools', name), name).toBe(false);
        for (const name of Object.keys(RELICS_NEVER_IN_FIXTURES)) expect(inSomeFixture('Relics', name), name).toBe(false);
        for (const key of Object.keys(SCENE_NOT_IN_FIXTURES)) {
            const [scene, id] = key.split('/');
            expect(scenePickupSeen(scene, id), key).toBe(false);
        }
    });

    it('names shown to players carry no scene codes or internal names', () => {
        // "Bone_East_20", "Song_09", "Flea (Dock 16)" style leftovers
        const CODE = /[A-Za-z]_[A-Za-z0-9]|\b[A-Z][a-z]+ \d{2}[a-z]?\b|SavedFlea|Collectable Item/;
        const problems = [];
        for (const name of listNames()) {
            for (const e of mergedList(name)) {
                for (const field of ['display', 'name']) {
                    if (typeof e[field] === 'string' && CODE.test(e[field])) problems.push(`${name}/${e.id}: ${e[field]}`);
                }
            }
        }
        expect(problems).toEqual([]);
    });

    it('every pack declares the required fields', () => {
        for (const p of PACKS) {
            expect(p).toEqual(expect.objectContaining({ id: expect.any(String), label: expect.any(String), minVersion: expect.any(String) }));
            expect(typeof p.detect).toBe('function');
        }
    });
});
