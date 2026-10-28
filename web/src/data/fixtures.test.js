/**
 * Fixture tests: real (trimmed) saves from src/data/__fixtures__.
 *
 * - "baseline" tests pin current parser behaviour so refactors can prove they
 *   changed nothing. Regenerate with `node scripts/snapshot-fixtures.mjs` only
 *   when a behaviour change is intentional.
 * - "oracle" tests compare parser output with numbers the game itself stores.
 *   Known mismatches are declared with it.fails so they flip red once fixed,
 *   forcing the declaration (and the baseline) to be updated.
 */
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseAllData } from './categories/index.js';
import { baselineCounts } from '../../scripts/snapshot-fixtures.mjs';

const FIXTURE_DIR = join(dirname(fileURLToPath(import.meta.url)), '__fixtures__');
const load = (name) => JSON.parse(readFileSync(join(FIXTURE_DIR, name), 'utf-8'));

const FIXTURES = readdirSync(FIXTURE_DIR)
    .filter(f => f.endsWith('.json') && !f.endsWith('.expected.json'))
    .map(f => {
        const fixture = load(f);
        return {
            name: f.replace(/\.json$/, ''),
            fixture,
            expected: load(f.replace(/\.json$/, '.expected.json')),
            parsed: parseAllData(fixture.playerData, fixture.sceneData),
        };
    });

describe('fixtures are present', () => {
    it('ships the minimum fixture set', () => {
        const names = FIXTURES.map(f => f.name).sort();
        expect(names).toEqual(expect.arrayContaining(['new-game', 'steel-soul', 'early-game', 'late-game', 'complete']));
    });
});

describe.each(FIXTURES)('fixture $name', ({ fixture, expected, parsed }) => {
    it('parses without throwing and keeps raw data', () => {
        expect(parsed).not.toBeNull();
        expect(parsed.raw).toBe(fixture.playerData);
    });

    it('matches the recorded baseline counts', () => {
        expect(baselineCounts(parsed)).toEqual(expected.baseline);
    });

    it('reads general fields straight from the save (oracle)', () => {
        expect(parsed.general.version.value).toBe(expected.oracle.version);
        expect(parsed.general.completionPercentage.value).toBe(expected.oracle.completionPercentage);
        expect(parsed.general.maxHealth.value).toBe(expected.oracle.maxHealth);
        expect(parsed.general.silkMax.value).toBe(expected.oracle.silkMax);
    });

    it('mask shards collected are consistent with maxHealth (oracle)', () => {
        // 4 shards = 1 mask, base 5 masks. Shards of a partial mask can exceed the floor.
        const fullMasksFromShards = Math.floor(parsed.maskShards.stats.collected / 4);
        expect(fullMasksFromShards).toBe(expected.oracle.maxHealth - 5);
    });

    it('silk hearts collected equal silkRegenMax (oracle)', () => {
        expect(parsed.silkHearts.stats.collected).toBe(expected.oracle.silkRegenMax);
    });

    it('crafting kit sources collected equal ToolKitUpgrades (oracle)', () => {
        expect(parsed.craftingKit.stats.collected).toBe(expected.oracle.ToolKitUpgrades);
    });

    it('tool pouch sources collected equal ToolPouchUpgrades (oracle)', () => {
        expect(parsed.toolPouch.stats.pending).toBe(0);
        expect(parsed.toolPouch.stats.collected).toBe(expected.oracle.ToolPouchUpgrades);
    });
});

describe('fixture complete (100% save) oracle gaps', () => {
    const complete = FIXTURES.find(f => f.name === 'complete');

    it('reports every boss, map, ability, skill and crest', () => {
        const { parsed } = complete;
        expect(parsed.bosses.stats.defeated).toBe(parsed.bosses.stats.total);
        expect(parsed.maps.stats.unlocked).toBe(parsed.maps.stats.total);
        expect(parsed.abilities.stats.unlocked).toBe(parsed.abilities.stats.total);
        expect(parsed.skills.stats.unlocked).toBe(parsed.skills.stats.total);
        expect(parsed.crests.stats.unlocked).toBe(parsed.crests.stats.total);
    });

    // Was it.fails until Phase 2 replaced the two wrong reward flags (OPUS D17)
    it('spool fragments collected are consistent with silkMax', () => {
        const { parsed, expected } = complete;
        expect(parsed.spoolFragments.stats.collected).toBe((expected.oracle.silkMax - 9) * 2);
    });
});

describe.each(FIXTURES)('completion model on $name (oracle)', ({ expected, parsed }) => {
    it('recomputes exactly the completion percentage the game stores', () => {
        expect(parsed.completion.earned).toBe(expected.oracle.completionPercentage);
        expect(parsed.completion.matchesGame).toBe(true);
    });

    it('breakdown adds up to a 100-point model', () => {
        expect(parsed.completion.max).toBe(100);
        expect(parsed.completion.byCategory.map(p => p.id)).toEqual([
            'abilities', 'skills', 'tools', 'crests', 'needle',
            'maskShards', 'spoolFragments', 'silkHearts', 'toolPouch', 'craftingKit', 'otherUnlockables',
        ]);
    });
});

describe('fleas', () => {
    it('splits 27 scattered and 3 special fleas, all counted', () => {
        const { parsed } = FIXTURES.find(f => f.name === 'complete');
        const kinds = parsed.fleas.fleas.reduce((acc, f) => ({ ...acc, [f.kind]: (acc[f.kind] || 0) + 1 }), {});
        expect(kinds).toEqual({ flea: 27, special: 3 });
        expect(parsed.fleas.stats).toEqual({ total: 30, saved: 30 });
    });
});

describe.each(FIXTURES)('spool fragments on $name (oracle)', ({ expected, parsed }) => {
    it('collected fragments match silkMax (2 fragments = 1 point, base 9)', () => {
        expect(parsed.spoolFragments.stats.collected).toBe((expected.oracle.silkMax - 9) * 2);
    });
});

describe('story events', () => {
    it('are parsed in play-time order with the area prefix', () => {
        const { parsed, fixture } = FIXTURES.find(f => f.name === 'complete');
        const { events, stats } = parsed.story;
        expect(stats.total).toBe(fixture.playerData.StoryEvents.length);
        expect(events.every((e, i) => i === 0 || events[i - 1].playTime <= e.playTime)).toBe(true);
        expect(events[0]).toEqual(expect.objectContaining({ scene: expect.any(String), area: expect.any(String), type: expect.any(Number) }));
    });
});

describe.each(FIXTURES)('wish targets on $name (oracle)', ({ parsed }) => {
    it('a completed collection wish has counted exactly to its target', () => {
        for (const q of parsed.quests.quests.filter(q => q.target && q.state === 'completed')) {
            expect(q.progress, q.json).toBe(q.target);
        }
    });
});

describe.each(FIXTURES.filter(f => f.fixture.playerData.StoryEvents?.length))('upgrade pickups on $name (oracle)', ({ expected, parsed, fixture }) => {
    const count = type => parsed.story.events.filter(e => e.type === type).length;

    it('type 0 = Mask Shards and type 1 = Spool Fragments, one event each', () => {
        expect(count(0)).toBe((expected.oracle.maxHealth - 5) * 4);
        expect(count(1)).toBe((expected.oracle.silkMax - 9) * 2);
    });

    it('type 2 = Simple Keys: one event per key source the save has', () => {
        const pd = fixture.playerData;
        const keys = ['PurchasedBonebottomFaithToken', 'CollectedDustCageKey', 'MerchantEnclaveSimpleKey'].filter(k => pd[k]).length
            + (fixture.sceneData.persistentBools.serializedList.some(e => e.SceneName === 'Bellshrine_Coral' && e.ID === 'Collectable Item Pickup' && e.Value) ? 1 : 0);
        expect(count(2)).toBe(keys);
    });

    it('type 3 = Memory Lockets: never fewer events than lockets the checklist finds', () => {
        expect(count(3)).toBeGreaterThanOrEqual(parsed.memoryLockets.stats.collected);
    });
});
