/** Misc tab: respawn info. */
import { parseSimpleFields, field } from './common.js';
import { setStat } from '../../ui/renderers.js';

export default {
    id: 'misc',
    parse: (save, ctx) => parseSimpleFields(save.playerData, ctx.lists('miscFields')),

    render(result, ctx) {
        const get = name => field(ctx.parsed, 'misc', name);
        setStat('respawnScene', get('respawnScene') || 'Unknown');
        setStat('respawnMarker', get('respawnMarkerName') || '-');
        setStat('respawnType', get('respawnType'));
    },
};
