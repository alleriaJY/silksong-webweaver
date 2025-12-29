/**
 * Silksong Save Data Parsers
 * 
 * Category-specific parsing functions that use schema definitions
 * from silksongdata.js to extract and format save data.
 */

import * as schemas from './silksongdata.js';

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Format play time from seconds to "XXh XXm XXs"
 */
export function formatPlayTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
}

/**
 * Format number with locale-specific separators
 */
export function formatNumber(value) {
    return (value || 0).toLocaleString();
}

/**
 * Format percentage
 */
export function formatPercent(value) {
    return `${(value || 0).toFixed(1)}%`;
}

// ═══════════════════════════════════════════════════════════════════════════
// SIMPLE FIELD PARSING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get value from data - handles both Map and Object
 * WASM returns Map objects, but we need to access them like objects
 */
function getValue(data, key) {
    if (!data) return undefined;
    if (data instanceof Map) {
        return data.get(key);
    }
    return data[key];
}

/**
 * Parse simple fields from playerData based on a field list
 * Returns an object with json key as property name
 */
export function parseSimpleFields(playerData, fieldList) {
    const result = {};
    for (const field of fieldList) {
        const value = getValue(playerData, field.json);
        result[field.json] = {
            value: value,
            display: field.display,
        };
    }
    return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// TOOLS PARSING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Parse tools from playerData.Tools.savedData
 * Returns array of tool objects with unlock/seen/selected status
 */
export function parseTools(playerData) {
    const toolsObj = getValue(playerData, 'Tools');
    // toolsObj may itself be a Map, so use getValue to access savedData
    const toolsData = toolsObj instanceof Map
        ? (toolsObj.get('savedData') || [])
        : (toolsObj?.savedData || []);

    // Build lookup map for faster access
    const toolsMap = new Map();
    for (const tool of toolsData) {
        // Tool entries may also be Maps
        const toolName = tool instanceof Map ? tool.get('Name') : tool?.Name;
        if (toolName) {
            toolsMap.set(toolName, tool);
        }
    }

    // Helper to get tool data property (handles both Map and Object)
    const getToolDataProp = (tool, prop) => {
        if (!tool) return false;
        const data = tool instanceof Map ? tool.get('Data') : tool?.Data;
        if (!data) return false;
        return data instanceof Map ? data.get(prop) : data?.[prop];
    };

    // Parse each tool from schema
    const tools = schemas.TOOLS_LIST.map(toolDef => {
        const found = toolsMap.get(toolDef.json);
        return {
            json: toolDef.json,
            display: toolDef.display,
            category: toolDef.category,
            icon: toolDef.icon,
            unlocked: getToolDataProp(found, 'IsUnlocked') || false,
            seen: getToolDataProp(found, 'HasBeenSeen') || false,
            selected: getToolDataProp(found, 'HasBeenSelected') || false,
        };
    });

    // Calculate statistics
    const stats = {
        total: tools.length,
        unlocked: tools.filter(t => t.unlocked).length,
        seen: tools.filter(t => t.seen).length,
        selected: tools.filter(t => t.selected).length,
    };

    return { tools, stats };
}

// ═══════════════════════════════════════════════════════════════════════════
// BOOLEAN FLAGS PARSING (Bosses, Fleas, Maps)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Parse boolean flags from playerData
 * Returns array of objects with value and display name
 */
export function parseBooleanFlags(playerData, flagList) {
    return flagList.map(item => ({
        json: item.json,
        display: item.display,
        value: getValue(playerData, item.json) || false,
    }));
}

/**
 * Parse bosses with statistics - includes icon property from schema
 */
export function parseBosses(playerData) {
    const bosses = schemas.BOSSES_LIST.map(item => ({
        json: item.json,
        display: item.display,
        icon: item.icon,
        value: getValue(playerData, item.json) || false,
    }));
    const stats = {
        total: bosses.length,
        defeated: bosses.filter(b => b.value).length,
    };
    return { bosses, stats };
}

/**
 * Parse fleas with statistics
 */
export function parseFleas(playerData) {
    const fleas = parseBooleanFlags(playerData, schemas.FLEAS_LIST);
    const stats = {
        total: fleas.length,
        saved: fleas.filter(f => f.value).length,
    };
    return { fleas, stats };
}

/**
 * Parse maps with statistics - includes icon property from schema
 */
export function parseMaps(playerData) {
    const maps = schemas.MAPS_LIST.map(item => ({
        json: item.json,
        display: item.display,
        icon: item.icon,
        value: getValue(playerData, item.json) || false,
    }));
    const stats = {
        total: maps.length,
        unlocked: maps.filter(m => m.value).length,
    };
    return { maps, stats };
}

// ═══════════════════════════════════════════════════════════════════════════
// MASTER PARSE FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Parse all data from raw playerData
 * Returns structured object for all categories
 */
export function parseAllData(playerData) {
    if (!playerData) {
        return null;
    }

    return {
        // Simple field categories
        general: parseSimpleFields(playerData, schemas.GENERAL_FIELDS_LIST),
        current: parseSimpleFields(playerData, schemas.CURRENT_FIELDS_LIST),
        misc: parseSimpleFields(playerData, schemas.MISC_FIELDS_LIST),

        // Complex categories with items and stats
        tools: parseTools(playerData),
        bosses: parseBosses(playerData),
        fleas: parseFleas(playerData),
        maps: parseMaps(playerData),

        // Keep raw data for any custom access
        raw: playerData,
    };
}
