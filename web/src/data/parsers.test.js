/**
 * Unit tests for Silksong Save Data Parsers
 */

import { describe, it, expect } from 'vitest';
import {
    formatPlayTime,
    formatNumber,
    formatPercent,
    parseSimpleFields,
    parseTools,
    parseBosses,
    parseFleas,
    parseMaps,
    parseAllData,
} from './parsers.js';
import { GENERAL_FIELDS_LIST, TOOLS_LIST, BOSSES_LIST, FLEAS_LIST, MAPS_LIST } from './silksongdata.js';

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTION TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('formatPlayTime', () => {
    it('should format 0 seconds correctly', () => {
        expect(formatPlayTime(0)).toBe('00h 00m 00s');
    });

    it('should format seconds only', () => {
        expect(formatPlayTime(45)).toBe('00h 00m 45s');
    });

    it('should format minutes and seconds', () => {
        expect(formatPlayTime(125)).toBe('00h 02m 05s');
    });

    it('should format hours, minutes, and seconds', () => {
        expect(formatPlayTime(3661)).toBe('01h 01m 01s');
    });

    it('should handle large hour values', () => {
        expect(formatPlayTime(36000)).toBe('10h 00m 00s');
    });

    it('should pad single digit values', () => {
        expect(formatPlayTime(3723)).toBe('01h 02m 03s');
    });
});

describe('formatNumber', () => {
    it('should format 0', () => {
        expect(formatNumber(0)).toBe('0');
    });

    it('should format undefined as 0', () => {
        expect(formatNumber(undefined)).toBe('0');
    });

    it('should format null as 0', () => {
        expect(formatNumber(null)).toBe('0');
    });

    it('should format small numbers', () => {
        expect(formatNumber(42)).toBe('42');
    });

    // Note: locale-specific formatting may vary by system
    it('should format large numbers with separators', () => {
        const result = formatNumber(1234567);
        // Should have some kind of separator (locale-dependent)
        expect(result.length).toBeGreaterThan(6);
    });
});

describe('formatPercent', () => {
    it('should format 0', () => {
        expect(formatPercent(0)).toBe('0.0%');
    });

    it('should format undefined as 0', () => {
        expect(formatPercent(undefined)).toBe('0.0%');
    });

    it('should format whole numbers', () => {
        expect(formatPercent(50)).toBe('50.0%');
    });

    it('should format decimal values with one decimal place', () => {
        expect(formatPercent(33.333)).toBe('33.3%');
    });

    it('should round correctly', () => {
        expect(formatPercent(99.99)).toBe('100.0%');
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// SIMPLE FIELD PARSING TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('parseSimpleFields', () => {
    it('should parse fields from object', () => {
        const mockData = { version: '1.0.0', playTime: 3600 };
        const fieldList = [
            { json: 'version', display: 'Game Version' },
            { json: 'playTime', display: 'Play Time' },
        ];
        const result = parseSimpleFields(mockData, fieldList);

        expect(result.version.value).toBe('1.0.0');
        expect(result.version.display).toBe('Game Version');
        expect(result.playTime.value).toBe(3600);
    });

    it('should handle missing fields', () => {
        const mockData = { version: '1.0.0' };
        const fieldList = [
            { json: 'version', display: 'Game Version' },
            { json: 'missingField', display: 'Missing' },
        ];
        const result = parseSimpleFields(mockData, fieldList);

        expect(result.version.value).toBe('1.0.0');
        expect(result.missingField.value).toBeUndefined();
    });

    it('should handle Map objects (WASM return type)', () => {
        const mockMap = new Map([
            ['version', '2.0.0'],
            ['health', 5],
        ]);
        const fieldList = [
            { json: 'version', display: 'Game Version' },
            { json: 'health', display: 'Health' },
        ];
        const result = parseSimpleFields(mockMap, fieldList);

        expect(result.version.value).toBe('2.0.0');
        expect(result.health.value).toBe(5);
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// TOOLS PARSING TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('parseTools', () => {
    it('should parse empty tools data', () => {
        const mockData = {};
        const result = parseTools(mockData);

        // Note: filtered tools may be less than TOOLS_LIST.length due to upgrade sets
        expect(result.tools.length).toBeGreaterThan(0);
        expect(result.stats.total).toBeGreaterThan(0);
        expect(result.stats.unlocked).toBe(0);
    });

    it('should parse tools with savedData array', () => {
        const mockData = {
            Tools: {
                savedData: [
                    {
                        Name: 'Straight Pin',
                        Data: { IsUnlocked: true, HasBeenSeen: true, HasBeenSelected: false },
                    },
                    {
                        Name: 'Tri Pin',
                        Data: { IsUnlocked: true, HasBeenSeen: false, HasBeenSelected: false },
                    },
                ],
            },
        };
        const result = parseTools(mockData);

        // Find Straight Pin in results
        const straightPin = result.tools.find((t) => t.json === 'Straight Pin');
        expect(straightPin.unlocked).toBe(true);
        expect(straightPin.seen).toBe(true);
        expect(straightPin.selected).toBe(false);
        expect(straightPin.category).toBe('Red');
        expect(straightPin.icon).toBe('T_straight_pin.png');

        // At least these 2 tools should be unlocked
        expect(result.stats.unlocked).toBeGreaterThanOrEqual(2);
    });

    it('should handle Map-based tools data (WASM format)', () => {
        const toolData = new Map([
            ['Name', 'Compass'],
            [
                'Data',
                new Map([
                    ['IsUnlocked', true],
                    ['HasBeenSeen', true],
                    ['HasBeenSelected', true],
                ]),
            ],
        ]);
        const savedData = [toolData];
        const toolsMap = new Map([['savedData', savedData]]);
        const mockData = new Map([['Tools', toolsMap]]);

        const result = parseTools(mockData);

        const compass = result.tools.find((t) => t.json === 'Compass');
        expect(compass.unlocked).toBe(true);
        expect(compass.seen).toBe(true);
        expect(compass.selected).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// BOOLEAN FLAGS PARSING TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('parseBosses', () => {
    it('should parse empty boss data', () => {
        const result = parseBosses({});

        expect(result.bosses).toHaveLength(BOSSES_LIST.length);
        expect(result.stats.total).toBe(BOSSES_LIST.length);
        expect(result.stats.defeated).toBe(0);
    });

    it('should count defeated bosses', () => {
        const mockData = {
            defeatedMossMother: true,
            defeatedBellBeast: true,
            defeatedLace1: false,
        };
        const result = parseBosses(mockData);

        expect(result.stats.defeated).toBe(2);

        const mossMother = result.bosses.find((b) => b.json === 'defeatedMossMother');
        expect(mossMother.value).toBe(true);
        expect(mossMother.icon).toBe('Moss Mother - Mossbone Mother.png');
    });
});

describe('parseFleas', () => {
    it('should parse empty flea data', () => {
        const result = parseFleas({});

        expect(result.fleas).toHaveLength(FLEAS_LIST.length);
        expect(result.stats.saved).toBe(0);
    });

    it('should count saved fleas', () => {
        const mockData = {
            SavedFlea_Ant_03: true,
            SavedFlea_Belltown_04: true,
        };
        const result = parseFleas(mockData);

        expect(result.stats.saved).toBe(2);
    });
});

describe('parseMaps', () => {
    it('should parse empty map data', () => {
        const result = parseMaps({});

        expect(result.maps).toHaveLength(MAPS_LIST.length);
        expect(result.stats.unlocked).toBe(0);
    });

    it('should count unlocked maps', () => {
        const mockData = {
            HasMossGrottoMap: true,
            HasBoneforestMap: true,
            HasDocksMap: false,
        };
        const result = parseMaps(mockData);

        expect(result.stats.unlocked).toBe(2);

        const mossGrotto = result.maps.find((m) => m.json === 'HasMossGrottoMap');
        expect(mossGrotto.value).toBe(true);
        expect(mossGrotto.icon).toBe('Shop_map_icon__0003_moss.png');
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// MASTER PARSE FUNCTION TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('parseAllData', () => {
    it('should return null for undefined input', () => {
        expect(parseAllData(undefined)).toBeNull();
    });

    it('should return null for null input', () => {
        expect(parseAllData(null)).toBeNull();
    });

    it('should return structured data object', () => {
        const mockData = {
            version: '1.0.0',
            playTime: 3600,
            health: 5,
            HasMossGrottoMap: true,
        };
        const result = parseAllData(mockData);

        expect(result).toHaveProperty('general');
        expect(result).toHaveProperty('current');
        expect(result).toHaveProperty('misc');
        expect(result).toHaveProperty('tools');
        expect(result).toHaveProperty('bosses');
        expect(result).toHaveProperty('fleas');
        expect(result).toHaveProperty('maps');
        expect(result).toHaveProperty('raw');

        // Check raw data is preserved
        expect(result.raw).toBe(mockData);
    });
});
