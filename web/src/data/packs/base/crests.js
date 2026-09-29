/**
 * Crests: playerData.ToolEquips.savedData, one entry per internal crest ID.
 * Several IDs collapse onto one crest (aliases); unlocked if any alias is.
 * countsTowardCompletion: false = not part of the crest completion % (the starting crest).
 * Entry: { id, json, aliases[], display, icon, iconSteelSoul, countsTowardCompletion? }
 */

export const CRESTS = [
    { id: 'hunter', json: 'Hunter', countsTowardCompletion: false, aliases: ['Hunter', 'Hunter_v2', 'Hunter_v3'], display: 'Hunter', icon: 'Select_Game_Crest_Spools__0000_hunter.png', iconSteelSoul: 'Select_Game_Crest_Spools__0000_hunter_SS.png' },
    { id: 'reaper', json: 'Reaper', aliases: ['Reaper'], display: 'Reaper', icon: 'Select_Game_Crest_Spools__0004_reaper.png', iconSteelSoul: 'Select_Game_Crest_Spools__0004_reaper_SS.png' },
    { id: 'wanderer', json: 'Wanderer', aliases: ['Wanderer'], display: 'Wanderer', icon: 'Select_Game_Crest_Spools__0008_wanderer.png', iconSteelSoul: 'Select_Game_Crest_Spools__0008_wanderer_SS.png' },
    { id: 'beast', json: 'Warrior', aliases: ['Warrior'], display: 'Beast', icon: 'Select_Game_Crest_Spools__0007_warrior.png', iconSteelSoul: 'Select_Game_Crest_Spools__0007_warrior_SS.png' },
    { id: 'witch', json: 'Witch', aliases: ['Witch'], display: 'Witch', icon: 'Select_Game_Crest_Spools__0009_witch.png', iconSteelSoul: 'Select_Game_Crest_Spools__0009_witch_SS.png' },
    { id: 'architect', json: 'Toolmaster', aliases: ['Toolmaster'], display: 'Architect', icon: 'Select_Game_Crest_Spools__0006_architect.png', iconSteelSoul: 'Select_Game_Crest_Spools__0006_architect_SS.png' },
    { id: 'shaman', json: 'Spell', aliases: ['Spell'], display: 'Shaman', icon: 'Select_Game_Crest_Spools__0005_shaman.png', iconSteelSoul: 'Select_Game_Crest_Spools__0005_shaman_SS.png' },
];

// Event-driven states, not part of the normal crest roster
export const SPECIAL_CREST_STATES = [
    { id: 'cursed', json: 'Cursed', aliases: ['Cursed'], display: 'Cursed', icon: 'Select_Game_Crest_Spools__0002_cursed.png', iconSteelSoul: 'Select_Game_Crest_Spools__0002_cursed_SS.png' },
    { id: 'cloakless', json: 'Cloakless', aliases: ['Cloakless'], display: 'Cloakless', icon: null, iconSteelSoul: null },
];
