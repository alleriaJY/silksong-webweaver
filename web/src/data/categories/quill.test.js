/**
 * Quill icon: colour from QuillState, and the quill alone until a map is owned.
 */
import { describe, it, expect } from 'vitest';
import { makeContext } from './index.js';
import { parseTravel, quillIcon } from './travel.js';

describe('quill icon', () => {
    it('shows the quill alone until a map is owned', () => {
        expect(quillIcon(1, false)).toBe('I_quill.png');
        expect(quillIcon(2, false)).toBe('I_quill_red.png');
        expect(quillIcon(1, true)).toBe('I_quill_and_map.png');
        expect(quillIcon(3, true)).toBe('I_quill_and_map_purple.png');
    });

    it('reads map ownership from the save', () => {
        const parse = (playerData) => {
            const save = { playerData, sceneData: {} };
            return parseTravel(save, makeContext(save)).quill;
        };
        expect(parse({ hasQuill: true, QuillState: 2 }).icon).toBe('I_quill_red.png');
        expect(parse({ hasQuill: true, QuillState: 2, HasMossGrottoMap: true }).icon).toBe('I_quill_and_map_red.png');
    });
});
