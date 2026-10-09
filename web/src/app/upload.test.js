// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { bytesToBase64, base64ToBytes, storePendingSaveFile, takePendingSaveFile, PENDING_SAVE_KEY } from './upload.js';

/** Deterministic pseudo-random bytes covering every value 0-255. */
function sampleBytes(length) {
    const bytes = new Uint8Array(length);
    let x = 12345;
    for (let i = 0; i < length; i++) {
        x = (x * 1103515245 + 12345) >>> 0;
        bytes[i] = x >>> 24;
    }
    return bytes;
}

describe('base64 helpers', () => {
    it('round-trip a 400 KB save without hitting the argument limit', () => {
        const bytes = sampleBytes(400 * 1024);
        expect(base64ToBytes(bytesToBase64(bytes))).toEqual(bytes);
    });

    it('match btoa on small input and handle empty input', () => {
        const bytes = new Uint8Array([0, 1, 127, 128, 254, 255]);
        expect(bytesToBase64(bytes)).toBe(btoa(String.fromCharCode(...bytes)));
        expect(bytesToBase64(new Uint8Array(0))).toBe('');
        expect(base64ToBytes('')).toEqual(new Uint8Array(0));
    });
});

describe('landing page hand-off', () => {
    beforeEach(() => sessionStorage.clear());

    it('passes a 400 KB save from the landing page to the stats page', async () => {
        const bytes = sampleBytes(400 * 1024 + 7);
        expect(await storePendingSaveFile(new File([bytes], 'user3.dat'))).toBe(true);

        const file = takePendingSaveFile();
        expect(file.name).toBe('user3.dat');
        expect(new Uint8Array(await file.arrayBuffer())).toEqual(bytes);
        expect(sessionStorage.getItem(PENDING_SAVE_KEY)).toBeNull();
    });

    it('returns null when nothing was handed over or the data is corrupt', () => {
        expect(takePendingSaveFile()).toBeNull();
        sessionStorage.setItem(PENDING_SAVE_KEY, 'not json');
        expect(takePendingSaveFile()).toBeNull();
    });
});
