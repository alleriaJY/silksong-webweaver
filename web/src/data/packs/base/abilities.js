/**
 * Abilities: playerData has* booleans.
 * ABILITIES count toward the tab total; OTHER_ABILITIES (cloaks) do not.
 * CLOAK_TIERS: shown on the Current tab from the cloak abilities.
 */

export const ABILITIES = [
    { id: 'swift-step', json: 'hasDash', display: 'Swift Step', icon: 'swiftstep.png' },
    { id: 'cling-grip', json: 'hasWalljump', display: 'Cling Grip', icon: 'clinggrip.png' },
    { id: 'needolin', json: 'hasNeedolin', display: 'Needolin', icon: 'needolin.png' },
    { id: 'clawline', json: 'hasHarpoonDash', display: 'Clawline', icon: 'clawline.png' },
    { id: 'needle-strike', json: 'hasChargeSlash', display: 'Needle Strike', icon: 'needlestrike.png' },
    { id: 'silk-soar', json: 'hasSuperJump', display: 'Silk Soar', icon: 'silksoar.png' },
];

export const OTHER_ABILITIES = [
    { id: 'drifters-cloak', json: 'hasBrolly', display: "Drifter's Cloak", icon: 'drifterscloak.png' },
    { id: 'faydown-cloak', json: 'hasDoubleJump', display: 'Faydown Cloak', icon: 'faydown_cloak.png' },
];

// Highest tier whose `requires` flag is set wins; the base tier has none.
export const CLOAK_TIERS = [
    { id: 'crimson-cloak', name: 'Crimson Cloak', level: 'Base', icon: 'I_crimson_cloak.png', requires: null },
    { id: 'drifters-cloak', name: "Drifter's Cloak", level: 'Tier 1', icon: 'I_spine_cloak.png', requires: 'hasBrolly' },
    { id: 'faydown-cloak', name: 'Faydown Cloak', level: 'Tier 2', icon: 'I_spine_cloak_down.png', requires: 'hasDoubleJump' },
];
