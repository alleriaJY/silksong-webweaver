/**
 * User-facing messages for everything that can go wrong with a save.
 *
 *   const problem = checkSave(save, parsed);   // null, or { kind, detail }
 *   const { title, hint, severity } = describeProblem(kind, detail);
 *
 * Kinds:
 *   wasm-load            the decryption module did not load (error)
 *   file-type            not a .dat file (error)
 *   decrypt              decryption or JSON parsing failed: another game's file, or damaged (error)
 *   not-silksong         decrypts, but has no playerData (error)
 *   unsupported-version  playerData.version older than the base pack's minVersion (error)
 *   parse                decrypted, but the parser failed: a bug here (error)
 *   unknown-content      parsed fine, but holds names no pack lists: new patch or DLC (warning; stats still shown)
 */
import { compareVersion, isAtLeast } from '../core/version.js';
import { PACKS } from '../data/packs/index.js';

const MESSAGES = {
    'wasm-load': {
        title: "The save decoder didn't load.",
        hint: 'Refresh the page. If it keeps failing, your browser may block WebAssembly.',
    },
    'file-type': {
        title: "That isn't a save file.",
        hint: 'Silksong saves are named user1.dat to user4.dat.',
    },
    decrypt: {
        title: "This file couldn't be decrypted.",
        hint: "It may be from another game, or damaged. Try another copy of your userN.dat (not a .bak or a renamed file).",
    },
    'not-silksong': {
        title: "This doesn't look like a Silksong save.",
        hint: 'It decrypted, but has no player data. Make sure you picked a userN.dat from the Silksong save folder.',
    },
    'unsupported-version': {
        title: 'This save is from an unsupported game version.',
        hint: 'Update the game and save again, then upload the new file.',
    },
    parse: {
        title: 'Something went wrong reading this save.',
        hint: 'Please report it on GitHub with your game version; the details below help.',
    },
    'unknown-content': {
        title: 'This save has items this tool does not know yet.',
        hint: 'Probably a new patch or DLC. Everything known is shown; the new items are left out until the tool is updated.',
        severity: 'warning',
    },
};

/** { title, hint, detail, severity: 'error' | 'warning' } for a problem kind. */
export function describeProblem(kind, detail = '') {
    const m = MESSAGES[kind] || { title: 'Something went wrong reading this save.', hint: '' };
    return { title: m.title, hint: m.hint, detail, severity: m.severity || 'error' };
}

/** Names in the save that no pack lists, across the categories that report them. */
export function unknownNames(parsed) {
    const c = parsed?.collection?.unknownNames || {};
    return [
        ...(parsed?.journal?.unknownNames || []),
        ...(parsed?.quests?.unknownNames || []),
        ...(c.relics || []),
        ...(c.materium || []),
        ...(c.inventory || []),
    ];
}

/** Oldest version any pack supports (the base pack's minVersion). */
function minSupportedVersion(packs) {
    return packs.map(p => p.minVersion).filter(Boolean).sort(compareVersion)[0];
}

/**
 * Problems found after decrypting: a missing playerData or too old a version
 * (errors, before parsing), or unknown names (a warning, after parsing).
 * Pass `parsed` = null for the pre-parse check.
 */
export function checkSave(save, parsed = null, packs = PACKS) {
    const pd = save?.playerData;
    if (!pd || typeof pd !== 'object' || Object.keys(pd).length === 0) return { kind: 'not-silksong' };

    const version = pd.version;
    const min = minSupportedVersion(packs);
    if (typeof version === 'string' && min && !isAtLeast(version, min)) {
        return { kind: 'unsupported-version', detail: `Save version ${version}; supported from ${min}.` };
    }

    if (parsed) {
        const names = unknownNames(parsed);
        if (names.length) {
            const shown = names.slice(0, 5).join(', ');
            const more = names.length > 5 ? ` and ${names.length - 5} more` : '';
            return { kind: 'unknown-content', detail: `${names.length} unknown: ${shown}${more}.` };
        }
    }
    return null;
}
