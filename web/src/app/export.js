/**
 * Export the currently loaded decrypted save as a formatted JSON file.
 */

export function exportFileName(fileName) {
    if (!fileName || typeof fileName !== 'string') return 'save.json';
    const base = fileName.replace(/\.dat$/i, '');
    return `${base || 'save'}.json`;
}

export function formatSaveJson(save) {
    if (!save || !save.playerData) return null;
    const payload = {
        playerData: save.playerData,
        sceneData: save.sceneData ?? {},
    };
    return JSON.stringify(payload, null, 2) + '\n';
}

export function downloadSaveJson(save, fileName) {
    const json = formatSaveJson(save);
    if (!json) return false;
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportFileName(fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    return true;
}
