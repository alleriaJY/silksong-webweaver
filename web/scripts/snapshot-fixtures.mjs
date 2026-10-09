/**
 * Write <fixture>.expected.json next to every fixture in src/data/__fixtures__.
 *
 * Usage (from web/):  node scripts/snapshot-fixtures.mjs
 *
 * Two kinds of values are recorded:
 *   - oracle:   read straight from the save (the game's own numbers). These are
 *               ground truth and must never be "fixed" to make a test pass.
 *   - baseline: produced by the parsers at the time of the snapshot. They pin
 *               current behaviour so refactors (ROADMAP Phase 1) can prove they
 *               changed nothing. Re-run this script only when a behaviour change
 *               is intentional, and say so in the commit message.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseAllData } from '../src/data/categories/index.js';

const FIXTURE_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', '__fixtures__');

export function baselineCounts(parsed) {
    const checklist = (r) => ({ collected: r.stats.collected, pending: r.stats.pending, total: r.stats.total });
    return {
        tools: { unlocked: parsed.tools.stats.unlocked, total: parsed.tools.stats.total },
        bosses: { defeated: parsed.bosses.stats.defeated, total: parsed.bosses.stats.total },
        maps: { unlocked: parsed.maps.stats.unlocked, total: parsed.maps.stats.total },
        fleas: { saved: parsed.fleas.stats.saved, total: parsed.fleas.stats.total },
        abilities: { unlocked: parsed.abilities.stats.unlocked, total: parsed.abilities.stats.total },
        skills: { unlocked: parsed.skills.stats.unlocked, total: parsed.skills.stats.total },
        crests: { unlocked: parsed.crests.stats.unlocked, total: parsed.crests.stats.total },
        equippedCrest: parsed.crests.equippedCrest?.json ?? null,
        equippedTools: parsed.equippedTools.equippedTools.map(t => t.name),
        maskShards: checklist(parsed.maskShards),
        spoolFragments: checklist(parsed.spoolFragments),
        silkHearts: checklist(parsed.silkHearts),
        toolPouch: checklist(parsed.toolPouch),
        craftingKit: checklist(parsed.craftingKit),
        otherUnlockables: checklist(parsed.otherUnlockables),
        craftmetal: checklist(parsed.craftmetal),
        memoryLockets: checklist(parsed.memoryLockets),
        journal: parsed.journal.stats,
        quests: parsed.quests.stats,
        relics: parsed.collection.stats.relics,
        materium: parsed.collection.stats.materium,
        mementos: parsed.collection.stats.mementos,
        inventoryKinds: parsed.collection.stats.inventory.kinds,
        travel: parsed.travel.stats,
        storyEvents: parsed.story.stats.total,
    };
}

function main() {
    const files = readdirSync(FIXTURE_DIR).filter(f => f.endsWith('.json') && !f.endsWith('.expected.json'));
    for (const file of files) {
        const fixture = JSON.parse(readFileSync(join(FIXTURE_DIR, file), 'utf-8'));
        const pd = fixture.playerData;
        const expected = {
            _note: 'oracle = from the save itself (ground truth); baseline = parser output snapshot (see scripts/snapshot-fixtures.mjs)',
            oracle: {
                version: pd.version,
                completionPercentage: pd.completionPercentage,
                permadeathMode: pd.permadeathMode,
                maxHealth: pd.maxHealth,
                silkMax: pd.silkMax,
                silkRegenMax: pd.silkRegenMax,
                nailUpgrades: pd.nailUpgrades,
                ToolKitUpgrades: pd.ToolKitUpgrades,
                ToolPouchUpgrades: pd.ToolPouchUpgrades,
                scenesVisited: pd.scenesVisited?.length ?? 0,
            },
            baseline: baselineCounts(parseAllData(pd, fixture.sceneData)),
        };
        const out = join(FIXTURE_DIR, file.replace(/\.json$/, '.expected.json'));
        writeFileSync(out, JSON.stringify(expected, null, 2) + '\n');
        console.log(`${file}: ${pd.completionPercentage}% -> ${out.split(/[\\/]/).pop()}`);
    }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
