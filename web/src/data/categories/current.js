/**
 * Current tab: health as a row of masks and silk as one spool of thread,
 * like the in-game HUD; currencies. Crest, loadout, cloak and
 * needle on the same tab are rendered by their own categories; the position
 * fields render into the Current Position card on the Misc tab.
 */
import { parseSimpleFields, field } from './common.js';
import { formatNumber, humanize } from '../../core/format.js';
import { iconUrl } from '../../core/icons.js';
import { setStat } from '../../ui/renderers.js';

const MASK_FULL = 'general_hp.png';
const MASK_EMPTY = 'Inv_0030_inv_health_backboard.png';
const MASK_EMPTY_STEEL_SOUL = 'Inv_health_backboard_SS.png';

/** One mask per point of max health: filled up to `health`, empty after. */
function renderMasks(container, health, max, steelSoul) {
    if (!container) return;
    container.replaceChildren();
    container.setAttribute('role', 'img');
    container.setAttribute('aria-label', `Health: ${health} of ${max} masks`);
    for (let i = 0; i < max; i++) {
        const full = i < health;
        const img = document.createElement('img');
        img.src = iconUrl('general', full ? MASK_FULL : (steelSoul ? MASK_EMPTY_STEEL_SOUL : MASK_EMPTY));
        img.alt = '';
        img.className = full ? 'mask full' : 'mask empty';
        container.appendChild(img);
    }
}

/** One stretch of thread per point of max silk, wound onto a spool. */
function renderSpool(container, silk, max) {
    if (!container) return;
    container.replaceChildren();
    container.style.setProperty('--silk-max', max);
    container.setAttribute('role', 'img');
    container.setAttribute('aria-label', `Silk: ${silk} of ${max}`);
    const thread = document.createElement('div');
    thread.className = 'silk-thread';
    for (let i = 0; i < max; i++) {
        const seg = document.createElement('span');
        seg.className = i < silk ? 'silk-seg full' : 'silk-seg empty';
        thread.appendChild(seg);
    }
    container.append(thread);
}

export default {
    id: 'current',
    parse(save, ctx) {
        const result = parseSimpleFields(save.playerData, ctx.lists('currentFields'));
        // currentArea is the game's zone name ("MOSSCAVE"); show the area name
        const zone = result.currentArea?.value;
        const known = zone ? ctx.lists('mapZones').find(z => z.zone === zone) : null;
        result.areaName = { value: known ? known.display : (zone ? humanize(zone) : undefined), display: 'Current Area' };
        result.areaScene = { value: known?.slotScene, display: 'Area background' };
        return result;
    },

    render(result, ctx) {
        const get = name => field(ctx.parsed, 'current', name);
        const health = get('health') || 0;
        const maxHealth = field(ctx.parsed, 'general', 'maxHealth') || 0;
        const silk = get('silk') || 0;
        const maxSilk = field(ctx.parsed, 'general', 'silkMax') || 0;

        setStat('healthDisplay', `${health}/${maxHealth}`);
        setStat('silkDisplay', `${silk}/${maxSilk}`);
        // Before a save is loaded, draw a new game's 5 masks and 9 silk (blurred)
        renderMasks(document.getElementById('health-masks'), Math.min(health, maxHealth), maxHealth || 5, ctx.isSteelSoul);
        renderSpool(document.getElementById('silk-spool'), Math.min(silk, maxSilk), maxSilk || 9);

        const geo = get('geo');
        const shellShards = get('ShellShards');
        setStat('geo', geo !== undefined ? formatNumber(geo) : '0');
        setStat('shellShards', shellShards !== undefined ? formatNumber(shellShards) : '0');

        setStat('currentArea', get('areaName') || 'Unknown');
        setStat('atBench', get('atBench') ? '✓ Yes' : '✗ No');
    },
};
