import { describe, it, expect } from 'vitest';
import { formatBuild } from './buildInfo.js';

describe('formatBuild', () => {
    it('shortens the sha and links the full commit', () => {
        const sha = 'a0936eb1234567890abcdef1234567890abcdef1';
        expect(formatBuild({ sha, date: '2026-10-08' })).toEqual({
            text: 'a0936eb · 2026-10-08',
            href: `https://github.com/alleriaJY/silksong-webweaver/commit/${sha}`,
        });
    });

    it('omits a missing date', () => {
        expect(formatBuild({ sha: 'abcdef1234' }).text).toBe('abcdef1');
    });

    it('returns null without a sha', () => {
        expect(formatBuild(null)).toBeNull();
        expect(formatBuild({})).toBeNull();
        expect(formatBuild({ sha: '' })).toBeNull();
    });
});
