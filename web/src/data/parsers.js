/**
 * Silksong Save Data Parsers
 * 
 * Category-specific parsing functions that use schema definitions
 * from silksongdata.js to extract and format save data.
 */

import * as schemas from './silksongdata.js';
import { flag, savedDataByName, savedDataEntries, questCompleted, scenePickup } from '../core/saveAccess.js';

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

// Formatters moved to core/format.js; re-exported for existing importers
export { formatPlayTime, formatNumber, formatPercent } from '../core/format.js';

// ═══════════════════════════════════════════════════════════════════════════
// SIMPLE FIELD PARSING
// ═══════════════════════════════════════════════════════════════════════════

// Save data arrives as plain objects (core/wasm.js); `flag` reads a top-level key.
const getValue = flag;

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
    // Tool name -> Data ({ IsUnlocked, HasBeenSeen, HasBeenSelected })
    const toolsMap = savedDataByName(getValue(playerData, 'Tools'));
    const getToolDataProp = (data, prop) => data?.[prop] || false;

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

    // Tools shown as one tile with variants (packs/base/tools.js TOOL_UPGRADE_SETS)
    const upgradeSets = schemas.TOOL_UPGRADE_SETS;

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

    // Tools marked countsTowardTotal: false (Snare Setter, Needle Phial) go to Others
    const notCounted = new Set(schemas.TOOLS_LIST.filter(t => t.countsTowardTotal === false).map(t => t.json));
    for (const tool of filteredTools) {
        if (notCounted.has(tool.json)) {
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
        iconStyle: item.iconStyle,
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
    const otherAbilities = schemas.OTHER_ABILITY_LIST.map(item => ({
        json: item.json,
        display: item.display,
        icon: item.icon,
        value: getValue(playerData, item.json) || false,
    }));
    const stats = {
        total: abilities.length,
        unlocked: abilities.filter(a => a.value).length,
    };
    return { abilities, otherAbilities, stats };
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

// Equipped-slot name -> skill display/icon (skills can sit in tool slots).
// Built from SKILLS equipName in packs/base/skills.js.
const SKILL_ICON_MAP = Object.fromEntries(
    schemas.SKILLS_LIST.map(skill => [skill.equipName, { display: skill.display, icon: skill.icon, isSkill: true }]),
);

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
        // The ToolEquips entry named after CurrentCrestID holds the loadout
        const crestData = savedDataByName(getValue(playerData, 'ToolEquips')).get(currentCrestId);
        for (const slot of crestData?.Slots || []) {
            const toolName = slot?.EquippedTool;
            if (toolName && toolName !== '') {
                equippedTools.push(getToolInfo(toolName));
            }
        }
    }

    // Parse ExtraToolEquips
    const extraEquippedTools = [];
    for (const { name: slotName, data } of savedDataEntries(getValue(playerData, 'ExtraToolEquips'))) {
        const toolName = data?.EquippedTool;
        if (toolName && toolName !== '') {
            const info = getToolInfo(toolName);
            info.slotName = slotName; // e.g., "Explore1", "Attack1"
            extraEquippedTools.push(info);
        }
    }

    return { equippedTools, extraEquippedTools, crestId: currentCrestId };
}

// ═══════════════════════════════════════════════════════════════════════════
// CRESTS PARSING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Parse crests from playerData.ToolEquips.savedData
 * Several internal save IDs (e.g. Hunter/Hunter_v2/Hunter_v3) collapse onto
 * a single in-game crest - unlocked if ANY alias is unlocked.
 */
function getToolEquipsMap(playerData) {
    return savedDataByName(getValue(playerData, 'ToolEquips'));
}

function isCrestUnlocked(entryData) {
    return entryData?.IsUnlocked || false;
}

export function parseCrests(playerData) {
    const equipsMap = getToolEquipsMap(playerData);
    const currentCrestId = getValue(playerData, 'CurrentCrestID');

    const crests = schemas.CRESTS_LIST.map(crestDef => {
        const unlocked = crestDef.aliases.some(alias => isCrestUnlocked(equipsMap.get(alias)));
        const isEquipped = crestDef.aliases.includes(currentCrestId);
        return {
            json: crestDef.json,
            display: crestDef.display,
            icon: crestDef.icon,
            iconSteelSoul: crestDef.iconSteelSoul,
            unlocked,
            isEquipped,
        };
    });

    const specialStates = schemas.SPECIAL_CREST_STATES_LIST.map(crestDef => {
        const unlocked = crestDef.aliases.some(alias => isCrestUnlocked(equipsMap.get(alias)));
        const isEquipped = crestDef.aliases.includes(currentCrestId);
        return {
            json: crestDef.json,
            display: crestDef.display,
            icon: crestDef.icon,
            iconSteelSoul: crestDef.iconSteelSoul,
            unlocked,
            isEquipped,
        };
    });

    const stats = {
        total: crests.length,
        unlocked: crests.filter(c => c.unlocked).length,
    };

    // Hunter is the starting crest and doesn't count toward the 6%
    // completion contribution from crests (only the other 6 do)
    const contributing = crests.filter(c => c.json !== 'Hunter');
    const contributionStats = {
        total: contributing.length,
        unlocked: contributing.filter(c => c.unlocked).length,
    };

    // Resolve the currently-equipped crest's display info (falls back to raw ID if unknown)
    const allDefs = [...crests, ...specialStates];
    const equippedCrest = allDefs.find(c => c.isEquipped) || null;

    // Currently-active special state (Cursed/Cloakless), if any - reported
    // separately since these aren't part of the normal crest roster
    const activeSpecialState = specialStates.find(s => s.isEquipped) || null;

    return { crests, specialStates, stats, contributionStats, currentCrestId, equippedCrest, activeSpecialState };
}

// ═══════════════════════════════════════════════════════════════════════════
// SOURCE-CHECKLIST PARSING (Mask Shards, Spool Fragments, Silk Hearts,
// Tool Pouch, Crafting Kit) - each item comes from one of several places in
// the save: a simple playerData boolean, a quest completion record, a
// sceneData world-pickup flag, or (for one Tool Pouch source) a flea-rescue
// tracking array.
// ═══════════════════════════════════════════════════════════════════════════

const isQuestCompleted = questCompleted;
const isScenePickupCollected = scenePickup;

/**
 * Best-effort check for the flea-rescue-order tracked Tool Pouch source.
 * Exact completion threshold is unconfirmed - currently treats any recorded
 * rescue (value !== -1) as progress. Flag for follow-up once confirmed.
 */
function getFleaProgress(playerData, flagName) {
    const arr = getValue(playerData, flagName);
    if (!Array.isArray(arr)) return { collected: false, count: 0 };
    const count = arr.filter(v => v !== -1).length;
    return { collected: count > 0, count };
}

/**
 * Parse a list of "source" definitions (see MASK_SHARD_SOURCES etc. in
 * silksongdata.js) against playerData/sceneData, returning each source's
 * completed/missing state plus aggregate stats.
 */
export function parseSourceChecklist(playerData, sceneData, sourceList) {
    const sources = sourceList.map(src => {
        let collected = false;
        let pending = false;
        let progress = null;

        switch (src.flagType) {
            case 'bool':
                collected = !!getValue(playerData, src.flag);
                break;
            case 'quest':
                collected = isQuestCompleted(playerData, src.flag);
                break;
            case 'scene':
                collected = isScenePickupCollected(sceneData, src.sceneName, src.sceneId);
                break;
            case 'flea': {
                const result = getFleaProgress(playerData, src.flag);
                collected = result.collected;
                progress = result.count;
                break;
            }
            case 'unknown':
            default:
                pending = true;
                break;
        }

        return { name: src.name, flagType: src.flagType, collected, pending, progress };
    });

    const stats = {
        total: sources.length,
        collected: sources.filter(s => s.collected).length,
        pending: sources.filter(s => s.pending).length,
    };

    return { sources, stats };
}

// ═══════════════════════════════════════════════════════════════════════════
// MASTER PARSE FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Parse all data from raw playerData (+ optional sceneData for world-pickup
 * source tracking - Mask Shards and Spool Fragments need it, everything
 * else only needs playerData)
 * Returns structured object for all categories
 */
export function parseAllData(playerData, sceneData) {
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
        crests: parseCrests(playerData),

        // Source checklists (which mask shard/spool fragment/etc came from where)
        maskShards: parseSourceChecklist(playerData, sceneData, schemas.MASK_SHARD_SOURCES),
        spoolFragments: parseSourceChecklist(playerData, sceneData, schemas.SPOOL_FRAGMENT_SOURCES),
        silkHearts: parseSourceChecklist(playerData, sceneData, schemas.SILK_HEART_SOURCES),
        toolPouch: parseSourceChecklist(playerData, sceneData, schemas.TOOL_POUCH_SOURCES),
        craftingKit: parseSourceChecklist(playerData, sceneData, schemas.CRAFTING_KIT_SOURCES),
        otherUnlockables: parseSourceChecklist(playerData, sceneData, schemas.OTHER_UNLOCKABLE_SOURCES),
        craftmetal: parseSourceChecklist(playerData, sceneData, schemas.CRAFTMETAL_SOURCES),
        memoryLockets: parseSourceChecklist(playerData, sceneData, schemas.MEMORY_LOCKET_SOURCES),

        // Keep raw data for any custom access
        raw: playerData,
        rawScene: sceneData,
    };
}


