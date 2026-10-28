import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { slotNumber, slotPlayTime } from './saveSlot.js';
import { MAP_ZONES } from '../packs/base/areas.js';

describe('save slot card', () => {
    it('shows play time as the profile screen does', () => {
        expect(slotPlayTime(59400)).toBe('16h 30m');
        expect(slotPlayTime(236837.4)).toBe('65h 47m');
        expect(slotPlayTime(59)).toBe('0h 00m');
        expect(slotPlayTime(undefined)).toBe('0h 00m');
    });

    it('takes the slot number from the save file name', () => {
        expect(slotNumber('user1.dat')).toBe(1);
        expect(slotNumber('C:/saves/USER4.dat')).toBe(4);
        expect(slotNumber('backup.dat')).toBeNull();
        expect(slotNumber(undefined)).toBeNull();
    });
});

describe('area backgrounds', () => {
    it('every slotScene exists in assets/img/scenes', () => {
        for (const z of MAP_ZONES.filter(z => z.slotScene)) {
            expect(existsSync(fileURLToPath(new URL(`../../../assets/img/scenes/${z.slotScene}`, import.meta.url))), z.id).toBe(true);
        }
    });
});
