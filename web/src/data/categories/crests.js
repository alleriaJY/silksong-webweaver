/**
 * Crests: unlocked state from ToolEquips (any alias unlocked), the crest grid
 * on the Unlockables tab, and the equipped crest / special state on the
 * Current tab. Steel Soul saves use the SS icon variants.
 */
import { savedDataByName } from '../../core/saveAccess.js';
import { iconUrl } from '../../core/icons.js';
import { renderIconGrid, setStat, setText } from '../../ui/renderers.js';

export function parseCrests(save, ctx) {
    const equips = savedDataByName(save.playerData?.ToolEquips);
    const currentCrestId = save.playerData?.CurrentCrestID;
    const resolve = def => ({
        json: def.json,
        display: def.display,
        icon: def.icon,
        iconSteelSoul: def.iconSteelSoul,
        countsTowardCompletion: def.countsTowardCompletion !== false,
        unlocked: def.aliases.some(alias => equips.get(alias)?.IsUnlocked || false),
        isEquipped: def.aliases.includes(currentCrestId),
    });

    const crests = ctx.lists('crests').map(resolve);
    const specialStates = ctx.lists('specialCrestStates').map(resolve);
    const contributing = crests.filter(c => c.countsTowardCompletion);

    return {
        crests,
        specialStates,
        stats: { total: crests.length, unlocked: crests.filter(c => c.unlocked).length },
        // The starting crest (Hunter) is not part of the 6% crest completion
        contributionStats: { total: contributing.length, unlocked: contributing.filter(c => c.unlocked).length },
        currentCrestId,
        equippedCrest: [...crests, ...specialStates].find(c => c.isEquipped) || null,
        activeSpecialState: specialStates.find(s => s.isEquipped) || null,
    };
}

const crestFile = (crest, steelSoul) => (steelSoul && crest.iconSteelSoul ? crest.iconSteelSoul : crest.icon);

export default {
    id: 'crests',
    parse: parseCrests,

    render(result, ctx) {
        const steelSoul = ctx.isSteelSoul;

        // Current tab: equipped crest (falls back to the raw ID when unknown)
        const crestId = result.currentCrestId || '';
        const equipped = result.equippedCrest;
        setStat('crest', equipped?.display || crestId || 'None');
        const crestImage = document.getElementById('crest-image');
        if (crestImage && crestId) {
            crestImage.src = iconUrl('crest', equipped?.icon ? crestFile(equipped, steelSoul) : 'Select_Game_Crest_Spools__0000_hunter.png');
            crestImage.alt = equipped?.display || crestId;
        }
        // Cursed is shown; Cloakless is an event state we do not surface
        const special = result.activeSpecialState;
        setStat('specialCrestState', special && special.json !== 'Cloakless' ? special.display : 'None');

        // Unlockables tab: crest grid
        renderIconGrid(document.getElementById('crests-grid'), result.crests, {
            itemClass: 'tool-item', isOn: c => c.unlocked,
            icon: c => (crestFile(c, steelSoul) ? iconUrl('crest', crestFile(c, steelSoul)) : ''),
        });
        setText('crests-unlocked-count', result.stats.unlocked);
        setText('crests-percent', `${result.contributionStats.unlocked}%`);
    },
};
