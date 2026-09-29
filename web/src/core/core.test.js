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

describe('core/icons', async () => {
    const { iconUrl, ICON_DIRS } = await import('./icons.js');

    it('encodes filenames with spaces, # and &', () => {
        expect(iconUrl('boss', 'Trobbio #4267244.png')).toBe('assets/img/bosses/Trobbio%20%234267244.png');
        expect(iconUrl('boss', 'Forebrothers Signis & Gron.png')).toBe('assets/img/bosses/Forebrothers%20Signis%20%26%20Gron.png');
        expect(iconUrl('tool', 'T_tack.png')).toBe('assets/img/tools/T_tack.png');
    });

    it('rejects unknown kinds and exposes every directory', () => {
        expect(() => iconUrl('nope', 'x.png')).toThrow('Unknown icon kind');
        expect(Object.keys(ICON_DIRS)).toEqual(expect.arrayContaining(['tool', 'boss', 'map', 'journal', 'crest']));
    });
});

describe('core/version', async () => {
    const { parseGameVersion, compareVersion, isAtLeast } = await import('./version.js');

    it('parses and compares versions numerically', () => {
        expect(parseGameVersion('1.0.28561')).toEqual([1, 0, 28561]);
        expect(parseGameVersion(undefined)).toEqual([0, 0, 0]);
        expect(compareVersion('1.0.29315', '1.0.28561')).toBeGreaterThan(0);
        expect(compareVersion('1.1', '1.0.99999')).toBeGreaterThan(0);
        expect(compareVersion('1.0', '1.0.0')).toBe(0);
        expect(isAtLeast('1.0.28561', '1.0.0')).toBe(true);
        expect(isAtLeast('0.9', '1.0.0')).toBe(false);
    });
});
