/**
 * Base game content pack. Every list the app reads lives in `lists`, keyed by
 * a camelCase name; a DLC pack uses the same keys for the entries it adds
 * (see ROADMAP "DLC Playbook"). Lists are merged in PACKS order.
 */
import { GENERAL_FIELDS, CURRENT_FIELDS, MISC_FIELDS } from './fields.js';
import { TOOLS, TOOL_UPGRADE_SETS } from './tools.js';
import { BOSSES } from './bosses.js';
import { FLEAS } from './fleas.js';
import { ABILITIES, OTHER_ABILITIES, CLOAK_TIERS } from './abilities.js';
import { SKILLS } from './skills.js';
import { CRESTS, SPECIAL_CREST_STATES } from './crests.js';
import { MAPS, TRAVEL } from './maps.js';
import {
    MASK_SHARD_SOURCES, SPOOL_FRAGMENT_SOURCES, SILK_HEART_SOURCES, TOOL_POUCH_SOURCES,
    CRAFTING_KIT_SOURCES, OTHER_UNLOCKABLE_SOURCES, NEEDLE_TIERS,
} from './unlockables.js';
import {
    CRAFTMETAL_SOURCES, MEMORY_LOCKET_SOURCES, RELICS, MATERIUM, MEMENTOS, INVENTORY_ITEMS,
} from './collectables.js';
import { AREAS, MAP_ZONES } from './areas.js';
import { JOURNAL } from './journal.js';
import { QUESTS } from './quests.js';
import { KEY_SOURCES } from './keyItems.js';
import { UNTRACKED } from './untracked.js';

export default {
    id: 'base',
    label: 'Hollow Knight: Silksong',
    minVersion: '1.0.0',
    detect: () => true,
    lists: {
        generalFields: GENERAL_FIELDS,
        currentFields: CURRENT_FIELDS,
        miscFields: MISC_FIELDS,
        tools: TOOLS,
        toolUpgradeSets: TOOL_UPGRADE_SETS,
        bosses: BOSSES,
        fleas: FLEAS,
        abilities: ABILITIES,
        otherAbilities: OTHER_ABILITIES,
        cloakTiers: CLOAK_TIERS,
        skills: SKILLS,
        crests: CRESTS,
        specialCrestStates: SPECIAL_CREST_STATES,
        maps: MAPS,
        travel: TRAVEL,
        maskShardSources: MASK_SHARD_SOURCES,
        spoolFragmentSources: SPOOL_FRAGMENT_SOURCES,
        silkHeartSources: SILK_HEART_SOURCES,
        toolPouchSources: TOOL_POUCH_SOURCES,
        craftingKitSources: CRAFTING_KIT_SOURCES,
        otherUnlockableSources: OTHER_UNLOCKABLE_SOURCES,
        needleTiers: NEEDLE_TIERS,
        craftmetalSources: CRAFTMETAL_SOURCES,
        memoryLocketSources: MEMORY_LOCKET_SOURCES,
        areas: AREAS,
        mapZones: MAP_ZONES,
        journal: JOURNAL,
        quests: QUESTS,
        relics: RELICS,
        materium: MATERIUM,
        mementos: MEMENTOS,
        inventoryItems: INVENTORY_ITEMS,
        keySources: KEY_SOURCES,
        untracked: UNTRACKED,
    },
};
