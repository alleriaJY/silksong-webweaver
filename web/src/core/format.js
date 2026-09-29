/** Display formatters shared by all categories. */

/** Seconds -> "XXh XXm XXs". */
export function formatPlayTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
}

/** Locale-grouped number; null/undefined -> "0". */
export function formatNumber(value) {
    return (value || 0).toLocaleString();
}

/** One decimal percentage; null/undefined -> "0.0%". */
export function formatPercent(value) {
    return `${(value || 0).toFixed(1)}%`;
}
