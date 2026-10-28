/**
 * Misc tab: where Hornet respawns (Current Position on this tab is filled by
 * current.js). Scene codes are shown as the area name; respawnType 1 means
 * a bench, anything else the last respawn marker she passed.
 */
import { parseSimpleFields, field } from './common.js';
import { areaName } from '../../map/sceneTiles.js';
import { setStat } from '../../ui/renderers.js';

export default {
    id: 'misc',
    parse(save, ctx) {
        const result = parseSimpleFields(save.playerData, ctx.lists('miscFields'));
        const scene = result.respawnScene?.value;
        result.respawnArea = { value: scene ? areaName(scene, ctx.lists('areas')) || 'Unknown area' : undefined, display: 'Respawn Area' };
        const type = result.respawnType?.value;
        result.respawnPoint = {
            value: type === undefined ? undefined : (type === 1 ? 'Bench' : 'Respawn marker (not a bench)'),
            display: 'Respawn Point',
        };
        return result;
    },

    render(result, ctx) {
        const get = name => field(ctx.parsed, 'misc', name);
        setStat('respawnScene', get('respawnArea') || 'Unknown');
        setStat('respawnPoint', get('respawnPoint'));
    },
};
