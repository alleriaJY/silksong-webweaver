/**
 * Schema Validation Tests for Silksong Data Definitions
 * 
 * These tests ensure that all schema lists are properly structured
 * and contain the required fields for each item type.
 */

import { describe, it, expect } from 'vitest';
import * as schemas from './silksongdata.js';

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA STRUCTURE TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('Schema Lists Exist and Are Non-Empty', () => {
    it('GENERAL_FIELDS_LIST should be a non-empty array', () => {
        expect(Array.isArray(schemas.GENERAL_FIELDS_LIST)).toBe(true);
        expect(schemas.GENERAL_FIELDS_LIST.length).toBeGreaterThan(0);
    });

    it('CURRENT_FIELDS_LIST should be a non-empty array', () => {
        expect(Array.isArray(schemas.CURRENT_FIELDS_LIST)).toBe(true);
        expect(schemas.CURRENT_FIELDS_LIST.length).toBeGreaterThan(0);
    });

    it('TOOLS_LIST should be a non-empty array', () => {
        expect(Array.isArray(schemas.TOOLS_LIST)).toBe(true);
        expect(schemas.TOOLS_LIST.length).toBeGreaterThan(0);
    });

    it('BOSSES_LIST should be a non-empty array', () => {
        expect(Array.isArray(schemas.BOSSES_LIST)).toBe(true);
        expect(schemas.BOSSES_LIST.length).toBeGreaterThan(0);
    });

    it('FLEAS_LIST should be a non-empty array', () => {
        expect(Array.isArray(schemas.FLEAS_LIST)).toBe(true);
        expect(schemas.FLEAS_LIST.length).toBeGreaterThan(0);
    });

    it('MAPS_LIST should be a non-empty array', () => {
        expect(Array.isArray(schemas.MAPS_LIST)).toBe(true);
        expect(schemas.MAPS_LIST.length).toBeGreaterThan(0);
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// FIELD VALIDATION TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('Simple Field Lists Have Required Properties', () => {
    const validateSimpleFields = (list, listName) => {
        list.forEach((item, index) => {
            it(`${listName}[${index}] should have 'json' property`, () => {
                expect(item).toHaveProperty('json');
                expect(typeof item.json).toBe('string');
                expect(item.json.length).toBeGreaterThan(0);
            });

            it(`${listName}[${index}] should have 'display' property`, () => {
                expect(item).toHaveProperty('display');
                expect(typeof item.display).toBe('string');
                expect(item.display.length).toBeGreaterThan(0);
            });
        });
    };

    describe('GENERAL_FIELDS_LIST items', () => {
        validateSimpleFields(schemas.GENERAL_FIELDS_LIST, 'GENERAL_FIELDS_LIST');
    });

    describe('CURRENT_FIELDS_LIST items', () => {
        validateSimpleFields(schemas.CURRENT_FIELDS_LIST, 'CURRENT_FIELDS_LIST');
    });
});

describe('TOOLS_LIST Has All Required Properties', () => {
    schemas.TOOLS_LIST.forEach((tool, index) => {
        describe(`Tool ${index}: ${tool.json}`, () => {
            it('should have json property', () => {
                expect(tool).toHaveProperty('json');
                expect(typeof tool.json).toBe('string');
            });

            it('should have display property', () => {
                expect(tool).toHaveProperty('display');
                expect(typeof tool.display).toBe('string');
            });

            it('should have category property (Red, Blue, or Yellow)', () => {
                expect(tool).toHaveProperty('category');
                expect(['Red', 'Blue', 'Yellow']).toContain(tool.category);
            });

            it('should have icon property with .png extension', () => {
                expect(tool).toHaveProperty('icon');
                expect(typeof tool.icon).toBe('string');
                expect(tool.icon.endsWith('.png')).toBe(true);
            });
        });
    });
});

describe('BOSSES_LIST Has All Required Properties', () => {
    schemas.BOSSES_LIST.forEach((boss, index) => {
        describe(`Boss ${index}: ${boss.json}`, () => {
            it('should have json property', () => {
                expect(boss).toHaveProperty('json');
                expect(typeof boss.json).toBe('string');
            });

            it('should have display property', () => {
                expect(boss).toHaveProperty('display');
                expect(typeof boss.display).toBe('string');
            });

            it('should have icon property with .png extension', () => {
                expect(boss).toHaveProperty('icon');
                expect(typeof boss.icon).toBe('string');
                expect(boss.icon.endsWith('.png')).toBe(true);
            });
        });
    });
});

describe('MAPS_LIST Has All Required Properties', () => {
    schemas.MAPS_LIST.forEach((map, index) => {
        describe(`Map ${index}: ${map.json}`, () => {
            it('should have json property', () => {
                expect(map).toHaveProperty('json');
                expect(typeof map.json).toBe('string');
            });

            it('should have display property', () => {
                expect(map).toHaveProperty('display');
                expect(typeof map.display).toBe('string');
            });

            it('should have icon property with .png extension', () => {
                expect(map).toHaveProperty('icon');
                expect(typeof map.icon).toBe('string');
                expect(map.icon.endsWith('.png')).toBe(true);
            });
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// DATA INTEGRITY TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('No Duplicate JSON Keys', () => {
    const checkNoDuplicates = (list, listName) => {
        const jsonKeys = list.map((item) => item.json);
        const uniqueKeys = new Set(jsonKeys);
        expect(uniqueKeys.size).toBe(jsonKeys.length);
    };

    it('TOOLS_LIST should have no duplicate json keys', () => {
        checkNoDuplicates(schemas.TOOLS_LIST, 'TOOLS_LIST');
    });

    it('BOSSES_LIST should have no duplicate json keys', () => {
        checkNoDuplicates(schemas.BOSSES_LIST, 'BOSSES_LIST');
    });

    it('FLEAS_LIST should have no duplicate json keys', () => {
        checkNoDuplicates(schemas.FLEAS_LIST, 'FLEAS_LIST');
    });

    it('MAPS_LIST should have no duplicate json keys', () => {
        checkNoDuplicates(schemas.MAPS_LIST, 'MAPS_LIST');
    });
});

describe('Expected Item Counts', () => {
    it('TOOLS_LIST should have approximately 59 tools', () => {
        // Based on OPUS.md and silksongdata.js, there should be ~59 tools
        expect(schemas.TOOLS_LIST.length).toBeGreaterThanOrEqual(50);
        expect(schemas.TOOLS_LIST.length).toBeLessThanOrEqual(70);
    });

    it('MAPS_LIST should have approximately 28 maps', () => {
        expect(schemas.MAPS_LIST.length).toBeGreaterThanOrEqual(25);
        expect(schemas.MAPS_LIST.length).toBeLessThanOrEqual(35);
    });

    it('BOSSES_LIST should have at least 30 bosses', () => {
        expect(schemas.BOSSES_LIST.length).toBeGreaterThanOrEqual(30);
    });
});
