// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCENES, pickScene, showScene } from './scene.js';

describe('background scene', () => {
    it('every scene is published', () => {
        const web = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
        for (const path of SCENES) expect(existsSync(join(web, path)), path).toBe(true);
    });
    it('picks across the whole list', () => {
        expect(pickScene(() => 0)).toBe(SCENES[0]);
        expect(pickScene(() => 0.9999)).toBe(SCENES[SCENES.length - 1]);
    });
    it('sets an absolute url on the root', () => {
        const href = showScene(document, () => 0);
        expect(href).toMatch(/^https?:\/\/.+\/assets\/img\/scenes\/scene1\.webp$/);
        expect(document.documentElement.style.getPropertyValue('--scene')).toBe(`url("${href}")`);
    });
});
