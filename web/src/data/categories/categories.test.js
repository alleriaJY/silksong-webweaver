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
