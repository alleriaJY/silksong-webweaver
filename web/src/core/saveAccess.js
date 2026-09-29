/**
 * Read helpers for the decrypted save. Inputs are plain objects (see
 * core/wasm.js); every helper tolerates missing containers and returns a safe
 * default, so parsers never need null checks for absent data.
 *
 * Shapes (OPUS.md section 5):
 *   Name/Data containers  { savedData: [ { Name, Data: {...} } ] }
 *   Journal               { list: [ { Name, Record: {...} } ] }
 *   sceneData lists       { serializedList: [ { SceneName, ID, Value } ] }
 */

/** A top-level playerData value (undefined when absent). */
export function flag(playerData, key) {
    return playerData ? playerData[key] : undefined;
}

/** Entries of a Name/Data (or Name/Record) container as [{ name, data }]. */
export function savedDataEntries(container) {
    const items = container?.savedData ?? container?.list ?? [];
    if (!Array.isArray(items)) return [];
    return items
        .filter(item => item && item.Name !== undefined)
        .map(item => ({ name: item.Name, data: item.Data ?? item.Record ?? {} }));
}

/** Name/Data container as Map<name, data>. */
export function savedDataByName(container) {
    const map = new Map();
    for (const { name, data } of savedDataEntries(container)) map.set(name, data);
    return map;
}

/** True when QuestCompletionData has the quest marked IsCompleted. */
export function questCompleted(playerData, questName) {
    return savedDataByName(playerData?.QuestCompletionData).get(questName)?.IsCompleted || false;
}

function sceneList(sceneData, kind) {
    const list = sceneData?.[kind]?.serializedList;
    return Array.isArray(list) ? list : [];
}

function findSceneEntry(sceneData, kind, sceneName, id) {
    return sceneList(sceneData, kind).find(e => e.SceneName === sceneName && e.ID === id);
}

/** World pickup / persistent bool for (scene, id); false when absent. */
export function scenePickup(sceneData, sceneName, id) {
    return findSceneEntry(sceneData, 'persistentBools', sceneName, id)?.Value || false;
}

/** Persistent int for (scene, id); undefined when absent. */
export function persistentInt(sceneData, sceneName, id) {
    return findSceneEntry(sceneData, 'persistentInts', sceneName, id)?.Value;
}
