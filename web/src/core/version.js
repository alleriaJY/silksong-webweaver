/**
 * Game version helpers. Saves store `playerData.version` as "1.0.28561".
 * Used by content packs (minVersion) and the unsupported-version check.
 */

/** "1.0.28561" -> [1, 0, 28561]; missing/garbled parts become 0. */
export function parseGameVersion(version) {
    if (typeof version !== 'string' || !version.trim()) return [0, 0, 0];
    return version.trim().split('.').map(part => {
        const n = parseInt(part, 10);
        return Number.isFinite(n) ? n : 0;
    });
}

/** Negative, zero or positive like a sort comparator. */
export function compareVersion(a, b) {
    const pa = parseGameVersion(a);
    const pb = parseGameVersion(b);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
        const d = (pa[i] || 0) - (pb[i] || 0);
        if (d !== 0) return d;
    }
    return 0;
}

export function isAtLeast(version, minVersion) {
    return compareVersion(version, minVersion) >= 0;
}
