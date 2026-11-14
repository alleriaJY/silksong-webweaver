// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { downloadSaveJson, exportFileName, formatSaveJson } from './export.js';

describe('save JSON export', () => {
    it('derives a .json filename from the uploaded .dat filename', () => {
        expect(exportFileName('user1.dat')).toBe('user1.json');
        expect(exportFileName('USER3.DAT')).toBe('USER3.json');
        expect(exportFileName(null)).toBe('save.json');
        expect(exportFileName('')).toBe('save.json');
    });

    it('serialises playerData and sceneData as formatted JSON', () => {
        const json = formatSaveJson({ playerData: { geo: 42 }, sceneData: { persistentBools: [] } });
        expect(JSON.parse(json)).toEqual({
            playerData: { geo: 42 },
            sceneData: { persistentBools: [] },
        });
        expect(formatSaveJson(null)).toBeNull();
    });

    it('triggers a browser download when a save is present', () => {
        const createSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
        const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
        const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

        expect(downloadSaveJson(null, 'user1.dat')).toBe(false);
        expect(downloadSaveJson({ playerData: { geo: 10 }, sceneData: {} }, 'user1.dat')).toBe(true);
        expect(createSpy).toHaveBeenCalledOnce();
        expect(clickSpy).toHaveBeenCalledOnce();
        expect(revokeSpy).toHaveBeenCalledWith('blob:test');

        createSpy.mockRestore();
        revokeSpy.mockRestore();
        clickSpy.mockRestore();
    });
});
