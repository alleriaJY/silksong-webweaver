/**
 * Current tab: health and silk bars, currencies. Crest, loadout,
 * cloak and needle on the same tab are rendered by their own categories;
 * the position fields render into the Current Position card on the Misc tab.
 */
import { parseSimpleFields, field } from './common.js';
import { formatNumber, humanize } from '../../core/format.js';
import { setStat } from '../../ui/renderers.js';

function setBar(id, value, max) {
    const el = document.getElementById(id);
    if (el) el.style.width = `${max > 0 ? (value / max) * 100 : 0}%`;
}

export default {
    id: 'current',
    parse(save, ctx) {
        const result = parseSimpleFields(save.playerData, ctx.lists('currentFields'));
        // currentArea is the game's zone name ("MOSSCAVE"); show the area name
        const zone = result.currentArea?.value;
        const known = zone ? ctx.lists('mapZones').find(z => z.zone === zone) : null;
        result.areaName = { value: known ? known.display : (zone ? humanize(zone) : undefined), display: 'Current Area' };
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
        setBar('health-fill', health, maxHealth);
        setBar('silk-fill', silk, maxSilk);

        const geo = get('geo');
        const shellShards = get('ShellShards');
        setStat('geo', geo !== undefined ? formatNumber(geo) : '0');
        setStat('shellShards', shellShards !== undefined ? formatNumber(shellShards) : '0');

        setStat('currentArea', get('areaName') || 'Unknown');
        setStat('atBench', get('atBench') ? '✓ Yes' : '✗ No');
    },
};
