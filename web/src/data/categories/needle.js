/**
 * Needle tier from playerData.nailUpgrades (0-4), shown on the Current tab and
 * the Unlockables tab. Only the 4 upgrades count toward completion (1% each).
 */
import { iconUrl } from '../../core/icons.js';
import { setText } from '../../ui/renderers.js';

export function parseNeedle(save, ctx) {
    const raw = save.playerData?.nailUpgrades;
    const upgrades = Math.max(0, Math.min(4, parseInt(raw, 10) || 0));
    return { upgrades, rawUpgrades: raw || 0, tier: ctx.lists('needleTiers')[upgrades] || null };
}

function setIcon(id, tier) {
    const el = document.getElementById(id);
    if (!el) return false;
    el.src = iconUrl('nail', tier.icon);
    el.alt = tier.name;
    return true;
}

export default {
    id: 'needle',
    parse: parseNeedle,

    render(result) {
        const { tier, upgrades } = result;
        if (!tier) return;
        if (document.getElementById('needle-icon') && document.getElementById('needle-name')) {
            setIcon('needle-icon', tier);
            setText('needle-name', tier.name);
        }
        if (document.getElementById('unlockables-needle-icon') && document.getElementById('unlockables-needle-name')
            && document.getElementById('unlockables-needle-level')) {
            setIcon('unlockables-needle-icon', tier);
            setText('unlockables-needle-name', tier.name);
            setText('unlockables-needle-level', tier.level);
        }
        setText('unlockables-needle-upgrades', `${upgrades} Upgrade${upgrades !== 1 ? 's' : ''}`);
        setText('needle-percent', `${result.rawUpgrades}%`);
    },
};
