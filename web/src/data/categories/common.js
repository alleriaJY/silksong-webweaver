/**
 * Helpers shared by category modules.
 */
import { flag } from '../../core/saveAccess.js';

/** { [json]: { value, display } } for a list of { json, display } fields. */
export function parseSimpleFields(playerData, fieldList) {
    const result = {};
    for (const field of fieldList) {
        result[field.json] = { value: flag(playerData, field.json), display: field.display };
    }
    return result;
}

/** [{ json, display, value }] for a list of boolean flags. */
export function parseBooleanFlags(playerData, flagList) {
    return flagList.map(item => ({
        json: item.json,
        display: item.display,
        value: flag(playerData, item.json) || false,
    }));
}

/** [{ json, display, icon, value }] for a list of boolean flags with icons. */
export function parseIconFlags(playerData, list) {
    return list.map(item => ({
        json: item.json,
        display: item.display,
        icon: item.icon,
        value: flag(playerData, item.json) || false,
    }));
}

/** Value of a parsed simple field: field(parsed, 'general', 'maxHealth'). */
export function field(parsed, category, name) {
    return parsed?.[category]?.[name]?.value;
}
