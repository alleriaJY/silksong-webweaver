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

    // Define upgrade sets (tools that should be displayed as one with variants)
    const upgradeSets = [
        {
            name: 'Curveclaw',
            tools: ['Curve Claws', 'Curve Claws Upgraded'],
            preferredUpgrade: 'Curve Claws Upgraded'
        },
        {
            name: 'Silkshot',
            tools: ['WebShot Forge', 'WebShot Architect', 'WebShot Weaver'],
            preferredUpgrade: 'WebShot Weaver'
        },
        {
            name: "Druid's Eye",
            tools: ['Mosscreep Tool 1', 'Mosscreep Tool 2'],
            preferredUpgrade: 'Mosscreep Tool 2'
        },
        {
            name: 'Money Pouch',
            tools: ['Dead Mans Purse', 'Shell Satchel'],
            preferredUpgrade: 'Shell Satchel',
            type: 'gameMode', // Special type for Classic/Steel Soul variants
            variantLabels: {
                'Dead Mans Purse': 'Classic Only',
                'Shell Satchel': 'Steel Soul Only'
            }
        },
        {
            name: 'Claw Mirror',
            tools: ['Dazzle Bind', 'Dazzle Bind Upgraded'], // Claw Mirror, Claw Mirrors
            preferredUpgrade: 'Dazzle Bind Upgraded'
        }
    ];

    // Process upgrade sets: filter tools and create variant info
    const filteredTools = [];
    const usedToolNames = new Set();
    const toolVariants = new Map(); // Store all variants for popup

    for (const tool of tools) {
        const upgradeSet = upgradeSets.find(set => set.tools.includes(tool.json));

        if (upgradeSet && !usedToolNames.has(upgradeSet.name)) {
            // This tool belongs to an upgrade set
            const variants = tools.filter(t => upgradeSet.tools.includes(t.json));

            // Determine which variant to show
            let displayTool;
            const unlockedVariant = variants.find(v => v.unlocked);

            if (unlockedVariant) {
                // If multiple are unlocked (shouldn't happen), prefer the upgrade
                const preferredTool = variants.find(v => v.json === upgradeSet.preferredUpgrade && v.unlocked);
                displayTool = preferredTool || unlockedVariant;
            } else {
                // All locked: show base tool (first in list)
                displayTool = variants.find(v => v.json === upgradeSet.tools[0]);
            }

            // Mark as special tool with variants
            displayTool.isUpgradeSet = true;
            displayTool.upgradeSetName = upgradeSet.name;
            displayTool.upgradeSetType = upgradeSet.type; // e.g., 'gameMode'
            displayTool.variantLabels = upgradeSet.variantLabels; // Custom labels if any
            displayTool.variants = variants;

            filteredTools.push(displayTool);
            usedToolNames.add(upgradeSet.name);

            // Mark all variants as used
            upgradeSet.tools.forEach(t => usedToolNames.add(t));
        } else if (!upgradeSets.some(set => set.tools.includes(tool.json))) {
            // Regular tool, not part of any upgrade set
            filteredTools.push(tool);
        }
    }

    // Separate "Others" tools that shouldn't be counted
    const otherTools = [];
    const regularTools = [];

    for (const tool of filteredTools) {
        // Move Snare Setter and Needle Phial to Others section
        if (tool.json === 'Silk Snare' || tool.json === 'Extractor') {
            tool.isOther = true;
            otherTools.push(tool);
        } else {
            regularTools.push(tool);
        }
    }

    // Calculate statistics based on regular tools only (exclude "Others")
    const stats = {
        total: regularTools.length,
        unlocked: regularTools.filter(t => t.unlocked).length,
        // Removed: seen count (no longer needed)
    };

    return { tools: regularTools, otherTools, stats };
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
// ABILITIES PARSING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Parse abilities (movement abilities) with statistics - includes icon property
 */
export function parseAbilities(playerData) {
    const abilities = schemas.ABILITY_LIST.map(item => ({
        json: item.json,
        display: item.display,
        icon: item.icon,
        value: getValue(playerData, item.json) || false,
    }));
    const stats = {
        total: abilities.length,
        unlocked: abilities.filter(a => a.value).length,
    };
    return { abilities, stats };
}

// ═══════════════════════════════════════════════════════════════════════════
// SKILLS PARSING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Parse skills (combat skills) with statistics - includes icon property
 */
export function parseSkills(playerData) {
    const skills = schemas.SKILLS_LIST.map(item => ({
        json: item.json,
        display: item.display,
        icon: item.icon,
        value: getValue(playerData, item.json) || false,
    }));
    const stats = {
        total: skills.length,
        unlocked: skills.filter(s => s.value).length,
    };
    return { skills, stats };
}

// ═══════════════════════════════════════════════════════════════════════════
// EQUIPPED TOOLS PARSING
// ═══════════════════════════════════════════════════════════════════════════

// Mapping from equipped tool names to skill icons (skills can be equipped)
const SKILL_ICON_MAP = {
    // Skills
    'Silk Spear': { display: 'Silkspear', icon: 'Art_Rune__0002_silk_spear.png', isSkill: true },
    'Thread Sphere': { display: 'Thread Storm', icon: 'Art_Rune__0008_silk_sphere.png', isSkill: true },
    'Parry': { display: 'Cross Stitch', icon: 'Art_Rune__0014_cross_stitch.png', isSkill: true },
    'Silk Dart': { display: 'Sharp Dart', icon: 'Art_Rune__0017_silk_dart.png', isSkill: true },
    'Silk Bomb': { display: 'Rune Rage', icon: 'Art_Rune__0005_silk_bomb.png', isSkill: true },
    'Finger Blades': { display: 'Pale Nails', icon: 'Art_Rune__0011_finger_blades.png', isSkill: true },
};

/**
 * Parse currently equipped tools from ToolEquips based on CurrentCrestID
 * Also parses ExtraToolEquips for extra equipment slots
 * Returns array of equipped tool objects with display names and icons
 */
export function parseEquippedTools(playerData) {
    // Get the current crest ID
    const currentCrestId = getValue(playerData, 'CurrentCrestID');

    // Build a lookup map from TOOLS_LIST for icons
    const toolsLookup = new Map();
    for (const tool of schemas.TOOLS_LIST) {
        toolsLookup.set(tool.json, tool);
    }

    // Helper to get tool info (checks tools, then skills/abilities)
    const getToolInfo = (toolName) => {
        // First check TOOLS_LIST
        const toolDef = toolsLookup.get(toolName);
        if (toolDef) {
            return {
                name: toolName,
                display: toolDef.display || toolName,
                icon: toolDef.icon || 'T_straight_pin.png',
                category: toolDef.category || 'Tool',
                iconPath: 'tools'
            };
        }
        // Check skill/ability mapping
        const skillDef = SKILL_ICON_MAP[toolName];
        if (skillDef) {
            return {
                name: toolName,
                display: skillDef.display || toolName,
                icon: skillDef.icon,
                category: skillDef.isSkill ? 'Skill' : 'Ability',
                iconPath: skillDef.isSkill ? 'general/skills' : 'general/ability'
            };
        }
        // Fallback
        return {
            name: toolName,
            display: toolName,
            icon: 'T_straight_pin.png',
            category: 'Unknown',
            iconPath: 'tools'
        };
    };

    // Parse ToolEquips (main crest slots)
    const equippedTools = [];
    if (currentCrestId) {
        const toolEquipsObj = getValue(playerData, 'ToolEquips');
        const toolEquipsData = toolEquipsObj instanceof Map
            ? (toolEquipsObj.get('savedData') || [])
            : (toolEquipsObj?.savedData || []);

        // Find the crest matching CurrentCrestID
        let matchingCrest = null;
        for (const crest of toolEquipsData) {
            const crestName = crest instanceof Map ? crest.get('Name') : crest?.Name;
            if (crestName === currentCrestId) {
                matchingCrest = crest;
                break;
            }
        }

        if (matchingCrest) {
            const crestData = matchingCrest instanceof Map ? matchingCrest.get('Data') : matchingCrest?.Data;
            const slots = crestData instanceof Map ? (crestData.get('Slots') || []) : (crestData?.Slots || []);

            for (const slot of slots) {
                const toolName = slot instanceof Map ? slot.get('EquippedTool') : slot?.EquippedTool;
                if (toolName && toolName !== '') {
                    equippedTools.push(getToolInfo(toolName));
                }
            }
        }
    }

    // Parse ExtraToolEquips
    const extraEquippedTools = [];
    const extraToolEquipsObj = getValue(playerData, 'ExtraToolEquips');
    const extraToolEquipsData = extraToolEquipsObj instanceof Map
        ? (extraToolEquipsObj.get('savedData') || [])
        : (extraToolEquipsObj?.savedData || []);

    for (const entry of extraToolEquipsData) {
        const entryData = entry instanceof Map ? entry.get('Data') : entry?.Data;
        const toolName = entryData instanceof Map ? entryData.get('EquippedTool') : entryData?.EquippedTool;
        const slotName = entry instanceof Map ? entry.get('Name') : entry?.Name;
        if (toolName && toolName !== '') {
            const info = getToolInfo(toolName);
            info.slotName = slotName; // e.g., "Explore1", "Attack1"
            extraEquippedTools.push(info);
        }
    }

    return { equippedTools, extraEquippedTools, crestId: currentCrestId };
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
        abilities: parseAbilities(playerData),
        skills: parseSkills(playerData),
        equippedTools: parseEquippedTools(playerData),

        // Keep raw data for any custom access
        raw: playerData,
    };
}


