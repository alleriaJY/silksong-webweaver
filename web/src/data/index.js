/**
 * Silksong data module: category registry (parse + render), content packs,
 * and the compatibility shims (silksongdata.js, parsers.js).
 */

// Schema lists under their historical names (shim over data/packs)
export * from './silksongdata.js';

// Parsing functions (shim over data/categories) incl. parseAllData
export * from './parsers.js';

// Registry and packs
export { CATEGORIES, makeContext, renderAll } from './categories/index.js';
export { PACKS, activePacks, mergedList } from './packs/index.js';
