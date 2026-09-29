/**
 * Content pack registry.
 *
 *   const packs = activePacks(save);          // packs whose detect(save) is true
 *   const bosses = mergedList('bosses', packs); // entries stamped with { pack }
 *
 * To add a DLC: create packs/<id>/index.js with the same shape as base
 * (id, label, minVersion, detect(save), lists) and append it to PACKS.
 * detect() should probe a key that only exists in saves with that content.
 */
import base from './base/index.js';

export const PACKS = [base];

/** Packs whose detect() accepts this save (base always does). */
export function activePacks(save, packs = PACKS) {
    return packs.filter(p => {
        try {
            return p.detect(save);
        } catch {
            return false;
        }
    });
}

/** Concatenate list `name` from every pack, stamping each entry with its pack id. */
export function mergedList(name, packs = PACKS) {
    return packs.flatMap(p => (p.lists[name] ?? []).map(entry => ({ ...entry, pack: p.id })));
}

/** Names of every list any pack defines. */
export function listNames(packs = PACKS) {
    return [...new Set(packs.flatMap(p => Object.keys(p.lists)))];
}
