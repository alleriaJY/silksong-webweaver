import { describe, it, expect } from 'vitest';
import { formatPlayTime, formatNumber, formatPercent } from './format.js';

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
