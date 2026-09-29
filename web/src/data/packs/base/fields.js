/**
 * Simple playerData fields shown as text on the General/Current/Misc tabs.
 * Entry: { id, json, display }
 */

export const GENERAL_FIELDS = [
    { id: 'version', json: 'version', display: 'Game Version' },
    { id: 'permadeath-mode', json: 'permadeathMode', display: 'Game Mode' },
    { id: 'completion-percentage', json: 'completionPercentage', display: 'Completion' },
    { id: 'play-time', json: 'playTime', display: 'Play Time' },
    { id: 'max-health', json: 'maxHealth', display: 'Max Health' },
    { id: 'silk-max', json: 'silkMax', display: 'Max Silk' },
    { id: 'silk-regen-max', json: 'silkRegenMax', display: 'Max Silk Hearts' },
    { id: 'nail-upgrades', json: 'nailUpgrades', display: 'Nail Upgrades' },
    { id: 'tool-kit-upgrades', json: 'ToolKitUpgrades', display: 'Crafting Kit Tier' },
    { id: 'tool-pouch-upgrades', json: 'ToolPouchUpgrades', display: 'Tool Pouch Tier' },
];

// maxHealth / silkMax live in GENERAL_FIELDS; read them from there
export const CURRENT_FIELDS = [
    { id: 'health', json: 'health', display: 'Current Health' },
    { id: 'silk', json: 'silk', display: 'Current Silk' },
    { id: 'geo', json: 'geo', display: 'Rosaries' },
    { id: 'shell-shards', json: 'ShellShards', display: 'Shell Shards' },
    { id: 'current-crest-id', json: 'CurrentCrestID', display: 'Equipped Crest' },
    { id: 'current-area', json: 'currentArea', display: 'Current Area' },
    { id: 'map-zone', json: 'mapZone', display: 'Map Zone' },
    { id: 'at-bench', json: 'atBench', display: 'At Bench' },
];

export const MISC_FIELDS = [
    { id: 'respawn-scene', json: 'respawnScene', display: 'Respawn Area' },
    { id: 'respawn-marker-name', json: 'respawnMarkerName', display: 'Respawn Marker' },
    { id: 'respawn-type', json: 'respawnType', display: 'Respawn Type' },
];
