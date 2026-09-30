/**
 * Categories that are lists of playerData booleans with icons:
 * abilities (plus cloak tier), skills, maps, bosses.
 */
import { parseIconFlags } from './common.js';
import { iconUrl, placeholderIconUrl } from '../../core/icons.js';
import { renderIconGrid, setText, setPercent } from '../../ui/renderers.js';

export function parseAbilities(save, ctx) {
    const abilities = parseIconFlags(save.playerData, ctx.lists('abilities'));
    const otherAbilities = parseIconFlags(save.playerData, ctx.lists('otherAbilities'));
    // Highest cloak tier whose required ability is unlocked
    const have = new Set(otherAbilities.filter(a => a.value).map(a => a.json));
    const cloak = [...ctx.lists('cloakTiers')].reverse().find(t => !t.requires || have.has(t.requires)) || null;
    return {
        abilities,
        otherAbilities,
        cloak,
        stats: { total: abilities.length, unlocked: abilities.filter(a => a.value).length },
    };
}

export function parseSkills(save, ctx) {
    const skills = parseIconFlags(save.playerData, ctx.lists('skills'));
    return { skills, stats: { total: skills.length, unlocked: skills.filter(s => s.value).length } };
}

export function parseMaps(save, ctx) {
    const maps = ctx.lists('maps').map(def => ({
        json: def.json,
        display: def.display,
        icon: def.icon,
        iconStyle: def.iconStyle,
        value: save.playerData?.[def.json] || false,
    }));
    return { maps, stats: { total: maps.length, unlocked: maps.filter(m => m.value).length } };
}

export function parseBosses(save, ctx) {
    const bosses = parseIconFlags(save.playerData, ctx.lists('bosses'));
    return { bosses, stats: { total: bosses.length, defeated: bosses.filter(b => b.value).length } };
}

/** Grid + "N unlocked" + "N%" badge that turns `maxed` when complete. */
function renderCountedGrid(prefix, items, opts) {
    const grid = document.getElementById(`${prefix}-grid`);
    if (!grid) return;
    const on = renderIconGrid(grid, items, opts);
    setText(`${prefix}-unlocked-count`, on);
    setPercent(`${prefix}-percent`, on, on === items.length);
}

const counted = (label) => (r) => ({ label, earned: r.stats.unlocked, max: r.stats.total });

export const abilities = {
    id: 'abilities',
    parse: parseAbilities,
    completion: counted('Abilities'),
    render(result) {
        renderCountedGrid('abilities', result.abilities, {
            itemClass: 'ability-item', lockItem: true, isOn: a => a.value,
            icon: a => iconUrl('ability', a.icon || 'swiftstep.png'),
        });
        renderIconGrid(document.getElementById('other-abilities-grid'), result.otherAbilities, {
            itemClass: 'ability-item', lockItem: true, isOn: a => a.value,
            icon: a => iconUrl('ability', a.icon || 'drifterscloak.png'),
        });
        // Current tab: cloak tier
        const icon = document.getElementById('cloak-icon');
        const name = document.getElementById('cloak-name');
        if (icon && name && result.cloak) {
            icon.src = iconUrl('ability', result.cloak.icon);
            icon.alt = result.cloak.name;
            name.textContent = result.cloak.name;
        }
    },
};

export const skills = {
    id: 'skills',
    parse: parseSkills,
    completion: counted('Skills'),
    render(result) {
        renderCountedGrid('skills', result.skills, {
            itemClass: 'skill-item', lockItem: true, isOn: s => s.value,
            icon: s => iconUrl('skill', s.icon || 'Art_Rune__0002_silk_spear.png'),
        });
    },
};

export const maps = {
    id: 'maps',
    parse: parseMaps,
    render(result) {
        const grid = document.getElementById('maps-grid');
        if (!grid) return;
        // Placeholder icons (Abyss) are tinted by CSS and get a coloured label
        const placeholder = m => m.iconStyle === 'placeholder';
        const on = renderIconGrid(grid, result.maps, {
            itemClass: 'map-item', isOn: m => m.value,
            icon: m => iconUrl('map', m.icon || 'I_map.png'),
            title: m => m.display,
            imgClass: (m, isOn) => `${isOn ? 'unlocked' : 'locked'}${placeholder(m) ? ' placeholder-icon' : ''}`,
            labelClass: (m, isOn) => (placeholder(m) ? (isOn ? 'status-unlocked' : 'status-locked') : null),
        });
        setText('maps-count', on);
        setText('maps-total-count', result.stats.total);
    },
};

export const bosses = {
    id: 'bosses',
    parse: parseBosses,
    render(result) {
        const grid = document.getElementById('bosses-grid');
        if (!grid) return;
        const on = renderIconGrid(grid, result.bosses, {
            itemClass: 'boss-item', isOn: b => b.value, onClass: 'defeated', offClass: 'not-defeated',
            icon: b => (b.icon ? iconUrl('boss', b.icon) : placeholderIconUrl()),
            title: b => b.display,
        });
        setText('bosses-count', on);
    },
};
