/**
 * Compatibility shim: the schema lists now live in content packs under
 * data/packs/ (base game in packs/base/). This module re-exports the merged
 * lists of all packs under the historical names so existing importers keep
 * working. New code should use mergedList() from packs/index.js with the
 * save's active packs. Removed in ROADMAP Phase 4.
 */
import { mergedList } from './packs/index.js';

export const GENERAL_FIELDS_LIST = mergedList('generalFields');
export const CURRENT_FIELDS_LIST = mergedList('currentFields');
export const MISC_FIELDS_LIST = mergedList('miscFields');

export const TOOLS_LIST = mergedList('tools');
export const TOOL_UPGRADE_SETS = mergedList('toolUpgradeSets');
export const BOSSES_LIST = mergedList('bosses');
export const FLEAS_LIST = mergedList('fleas');
export const ABILITY_LIST = mergedList('abilities');
export const OTHER_ABILITY_LIST = mergedList('otherAbilities');
export const CLOAK_TIERS = mergedList('cloakTiers');
export const SKILLS_LIST = mergedList('skills');
export const CRESTS_LIST = mergedList('crests');
export const SPECIAL_CREST_STATES_LIST = mergedList('specialCrestStates');
export const MAPS_LIST = mergedList('maps');

export const MASK_SHARD_SOURCES = mergedList('maskShardSources');
export const SPOOL_FRAGMENT_SOURCES = mergedList('spoolFragmentSources');
export const SILK_HEART_SOURCES = mergedList('silkHeartSources');
export const TOOL_POUCH_SOURCES = mergedList('toolPouchSources');
export const CRAFTING_KIT_SOURCES = mergedList('craftingKitSources');
export const OTHER_UNLOCKABLE_SOURCES = mergedList('otherUnlockableSources');
export const NEEDLE_TIERS = mergedList('needleTiers');
export const CRAFTMETAL_SOURCES = mergedList('craftmetalSources');
export const MEMORY_LOCKET_SOURCES = mergedList('memoryLocketSources');

export const AREAS = mergedList('areas');
