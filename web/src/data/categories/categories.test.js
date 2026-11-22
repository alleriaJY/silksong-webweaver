// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { CATEGORIES, makeContext, parseAllData, renderAll } from './index.js';

describe('category registry contract (ROADMAP Appendix C)', () => {
    it('ids are unique and every category can parse', () => {
        const ids = CATEGORIES.map(c => c.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const c of CATEGORIES) expect(typeof c.parse, c.id).toBe('function');
    });

    it.each(CATEGORIES.map(c => [c.id, c]))('%s parses an empty save without throwing', (id, category) => {
        for (const save of [{ playerData: {} }, { playerData: {}, sceneData: {} }]) {
            expect(() => category.parse(save, makeContext(save))).not.toThrow();
        }
    });

    it('parse is pure: same input, same output, no DOM access', () => {
        document.body.innerHTML = '<div id="sentinel"></div>';
        const save = { playerData: { geo: 5, hasDash: true, defeatedMossMother: true }, sceneData: {} };
        const a = parseAllData(save.playerData, save.sceneData);
        const b = parseAllData(save.playerData, save.sceneData);
        // toEqual, not JSON: an upgrade-set tool's variants include the tool itself
        expect(a).toEqual(b);
        expect(document.body.innerHTML).toBe('<div id="sentinel"></div>');
    });

    it('renderAll does nothing (and does not throw) when the page has none of the elements', () => {
        document.body.innerHTML = '';
        const parsed = parseAllData({}, {});
        expect(() => renderAll(parsed)).not.toThrow();
        expect(document.body.innerHTML).toBe('');
    });

    it('parseAllData reports the active packs', () => {
        expect(parseAllData({}, {}).packs).toEqual(['base']);
        expect(parseAllData(null)).toBeNull();
    });
});

describe('equipped loadout', () => {
    it('resolves every skill by the name the save uses in tool slots', () => {
        const slots = ['Silk Spear', 'Parry', 'Thread Sphere', 'Silk Charge', 'Silk Bomb', 'Silk Boss Needle'];
        const playerData = {
            CurrentCrestID: 'Hunter',
            ToolEquips: { savedData: [{ Name: 'Hunter', Data: { Slots: slots.map(EquippedTool => ({ EquippedTool })) } }] },
        };
        const { equippedTools } = parseAllData(playerData, {}).equippedTools;
        expect(equippedTools.map(t => t.display)).toEqual(['Silkspear', 'Cross Stitch', 'Thread Storm', 'Sharp Dart', 'Rune Rage', 'Pale Nails']);
        expect(equippedTools.every(t => t.category === 'Skill' && t.iconKind === 'skill')).toBe(true);
    });
});

describe('checklist & key item fallbacks', () => {
    it('recognises Act 3 fallback pickups and alt flags', () => {
        const parsed = parseAllData(
            {
                purchasedGrindleMemoryLocket: true,
                MerchantEnclaveWardKey: true,
                CaravanTroupeLocation: 2,
                scenesVisited: ['Memory_Silk_Heart_BellBeast'],
            },
            {
                persistentBools: {
                    serializedList: [
                        { SceneName: 'Bone_12', ID: 'Ladybug Craft Pickup', Value: true },
                        { SceneName: 'Bellshrine_Coral', ID: 'Collectable Item Pickup', Value: true },
                    ],
                },
            },
        );
        expect(parsed.memoryLockets.sources.find(s => s.id === 'far-fields-mort-purchase-pilgrims-rest-150-rosaries').collected).toBe(true);
        expect(parsed.toolPouch.sources.find(s => s.id === 'loddie-the-marrow').collected).toBe(true);
        expect(parsed.spoolFragments.sources.find(s => s.id === 'took-greymoor17-spool').collected).toBe(true);
        expect(parsed.silkHearts.sources.find(s => s.id === 'defeated-bell-beast').collected).toBe(true);
        expect(parsed.keyItems.items.find(k => k.id === 'white-key').value).toBe(true);
        expect(parsed.keyItems.items.find(k => k.id === 'simple-key-sands-of-karak').value).toBe(true);
    });
});

describe('game mode filtering (Classic vs Steel Soul)', () => {
    it('excludes Steel Soul-only entries on Classic saves and includes Classic-only entries', () => {
        const parsed = parseAllData({ permadeathMode: 0 }, {});
        expect(parsed.quests.quests.some(q => q.json === 'Steel Sentinel')).toBe(false);
        expect(parsed.bosses.bosses.some(b => b.json === 'Abyss Mass')).toBe(false);
        expect(parsed.journal.entries.some(e => e.json === 'Abyss Mass')).toBe(false);
        expect(parsed.silkeaters.sources.some(s => s.id === 'silkeater-coral-37')).toBe(true);
        expect(parsed.voidMasses.sources.some(s => s.id === 'void-mass-styx-nest')).toBe(true);
    });

    it('includes Steel Soul-only entries on Steel Soul saves and excludes Classic-only entries', () => {
        const parsed = parseAllData({ permadeathMode: 1 }, {});
        expect(parsed.quests.quests.some(q => q.json === 'Steel Sentinel')).toBe(true);
        expect(parsed.bosses.bosses.some(b => b.json === 'Abyss Mass')).toBe(true);
        expect(parsed.journal.entries.some(e => e.json === 'Abyss Mass')).toBe(true);
        expect(parsed.silkeaters.sources.some(s => s.id === 'silkeater-coral-37')).toBe(false);
        expect(parsed.voidMasses.sources.some(s => s.id === 'void-mass-styx-nest')).toBe(false);
    });
});

describe('mutually exclusive quest variants (Broodfeast / Runtfeast)', () => {
    it('collapses into one row showing both names when neither is started', () => {
        const parsed = parseAllData({}, {});
        const rows = parsed.quests.quests.filter(q => q.variantGroup === 'huntress-feast');
        expect(rows).toHaveLength(1);
        expect(rows[0].display).toBe('Broodfeast / Runtfeast');
        expect(rows[0].state).toBe('none');
    });

    it('shows the completed variant and keeps both json names known', () => {
        const brood = parseAllData({
            QuestCompletionData: { savedData: [{ Name: 'Huntress Quest', Data: { IsAccepted: true, IsCompleted: true } }] },
        }, {});
        const broodRow = brood.quests.quests.find(q => q.variantGroup === 'huntress-feast');
        expect(broodRow.display).toBe('Broodfeast');
        expect(broodRow.state).toBe('completed');
        expect(broodRow.variantAlt).toBe('Alt: Runtfeast');
        expect(brood.quests.unknownNames).toEqual([]);

        const runt = parseAllData({
            QuestCompletionData: { savedData: [{ Name: 'Huntress Quest Runt', Data: { IsAccepted: true, IsCompleted: true } }] },
        }, {});
        const runtRow = runt.quests.quests.find(q => q.variantGroup === 'huntress-feast');
        expect(runtRow.display).toBe('Runtfeast');
        expect(runtRow.state).toBe('completed');
        expect(runtRow.variantAlt).toBe('Alt: Broodfeast');
        expect(runt.quests.unknownNames).toEqual([]);
    });
});
