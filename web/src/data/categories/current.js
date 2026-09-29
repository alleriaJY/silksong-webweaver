/**
 * Current tab: health and silk bars, currencies, position. Crest, loadout,
 * cloak and needle on the same tab are rendered by their own categories.
 */
import { parseSimpleFields, field } from './common.js';
import { formatNumber } from '../../core/format.js';
import { setStat } from '../../ui/renderers.js';

function setBar(id, value, max) {
    const el = document.getElementById(id);
    if (el) el.style.width = `${max > 0 ? (value / max) * 100 : 0}%`;
}

export default {
    id: 'current',
    parse: (save, ctx) => parseSimpleFields(save.playerData, ctx.lists('currentFields')),

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

        setStat('currentArea', get('currentArea') || 'Unknown');
        setStat('mapZone', get('mapZone'));
        setStat('atBench', get('atBench') ? '✓ Yes' : '✗ No');
    },
};
