import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toPlain } from './normalize.js';

const pkg = vi.hoisted(() => ({ result: null, init: null }));
vi.mock('../../pkg/wasm_crypto.js', () => ({
    default: (...args) => pkg.init(...args),
    decrypt_save: () => pkg.result,
}));

describe('toPlain', () => {
    it('converts nested Maps inside objects and arrays', () => {
        const input = new Map([
            ['playerData', new Map([
                ['Tools', new Map([['savedData', [new Map([['Name', 'Straight Pin'], ['Data', new Map([['IsUnlocked', true]])]])]]])],
                ['geo', 5],
            ])],
        ]);
        const out = toPlain(input);
        expect(out).toEqual({ playerData: { Tools: { savedData: [{ Name: 'Straight Pin', Data: { IsUnlocked: true } }] }, geo: 5 } });
        expect(out.playerData.Tools.savedData[0].Data).not.toBeInstanceOf(Map);
    });

    it('leaves primitives and null alone', () => {
        expect(toPlain(null)).toBeNull();
        expect(toPlain(0)).toBe(0);
        expect(toPlain('x')).toBe('x');
        expect(toPlain(false)).toBe(false);
    });
});

describe('core/wasm', () => {
    beforeEach(() => {
        vi.resetModules();
        pkg.init = vi.fn(async () => {});
    });

    it('decryptSave returns plain playerData, sceneData and all roots', async () => {
        const { decryptSave } = await import('./wasm.js');
        pkg.result = { success: true, error: null, save: new Map([['playerData', new Map([['geo', 1]])], ['dlcRoot', { a: 1 }]]) };
        const save = decryptSave(new Uint8Array(1));
        expect(save.playerData).toEqual({ geo: 1 });
        expect(save.sceneData).toEqual({});
        expect(save.roots.dlcRoot).toEqual({ a: 1 });
    });

    it('decryptSave throws SaveDecryptError with the WASM message', async () => {
        const { decryptSave, SaveDecryptError } = await import('./wasm.js');
        pkg.result = { success: false, error: 'Save file too small', save: null };
        expect(() => decryptSave(new Uint8Array(1))).toThrow(SaveDecryptError);
        expect(() => decryptSave(new Uint8Array(1))).toThrow('Save file too small');
    });

    it('loadWasm initialises once and can retry after a failure', async () => {
        const { loadWasm } = await import('./wasm.js');
        pkg.init = vi.fn().mockRejectedValueOnce(new Error('network')).mockResolvedValue(undefined);
        await expect(loadWasm()).rejects.toThrow('network');
        await loadWasm();
        await loadWasm();
        expect(pkg.init).toHaveBeenCalledTimes(2);
    });
});
