/**
 * Area maps: one playerData Has*Map boolean each.
 * iconStyle: 'placeholder' = generic icon tinted by CSS, with a coloured label.
 * Entry: { id, json, display, icon, iconStyle? }
 */

export const MAPS = [
    { id: 'moss-grotto', json: 'HasMossGrottoMap', display: 'Moss Grotto', icon: 'Shop_map_icon__0003_moss.png' },
    { id: 'the-marrow', json: 'HasBoneforestMap', display: 'The Marrow', icon: 'Shop_map_icon__0008_sinners.png' },
    { id: 'deep-docks', json: 'HasDocksMap', display: 'Deep Docks', icon: 'Shop_map_icon__0006_docks.png' },
    { id: 'far-fields', json: 'HasWildsMap', display: 'Far Fields', icon: 'Shop_map_icon__0004_fields.png' },
    { id: 'greymoor', json: 'HasGreymoorMap', display: 'Greymoor', icon: 'Shop_map_icon__0001_greymoor.png' },
    { id: 'bellhart', json: 'HasBellhartMap', display: 'Bellhart', icon: 'Shop_map_icon__0007_bellhart.png' },
    { id: 'shellwood', json: 'HasShellwoodMap', display: 'Shellwood', icon: 'Shop_map_icon__0002_shellwood.png' },
    { id: 'hunters-march', json: 'HasHuntersNestMap', display: "Hunter's March", icon: 'Shop_map_icon__0000_hunters_march.png' },
    { id: 'blasted-steps', json: 'HasJudgeStepsMap', display: 'Blasted Steps', icon: 'Shop_map_icon__0005_steps.png' },
    { id: 'mount-fay', json: 'HasPeakMap', display: 'Mount Fay', icon: 'Shop_map_icon__0008_generic_peak.png' },
    { id: 'the-slab', json: 'HasSlabMap', display: 'The Slab', icon: 'Shop_map_icon__0008_slab.png' },
    { id: 'bilewater', json: 'HasSwampMap', display: 'Bilewater', icon: 'Shop_map_icon__0004_bilewater.png' },
    { id: 'putrified-ducts', json: 'HasAqueductMap', display: 'Putrified Ducts', icon: 'Shop_map_icon__0008_crawl.png' },
    { id: 'sands-of-karak', json: 'HasCoralMap', display: 'Sands of Karak', icon: 'Shop_map_icon__0008_coral_cave.png' },
    { id: 'weavernest-atla', json: 'HasWeavehomeMap', display: 'Weavernest Atla', icon: 'Shop_map_icon__weavehome.png' },
    { id: 'wormways', json: 'HasCrawlMap', display: 'Wormways', icon: 'Shop_map_icon__0008_crawl.png' },
    { id: 'sinners-road', json: 'HasDustpensMap', display: "Sinner's Road", icon: 'Shop_map_icon__0008_sinners.png' },
    { id: 'citadel-grand-gate', json: 'HasSongGateMap', display: 'Citadel - Grand Gate', icon: 'Shop_map_icon__0008_generic.png' },
    { id: 'citadel-underworks', json: 'HasCitadelUnderstoreMap', display: 'Citadel - Underworks', icon: 'Shop_map_icon_understore.png' },
    { id: 'citadel-cogwork-core', json: 'HasCogMap', display: 'Citadel - Cogwork Core', icon: 'Shop_map_icon__0012_cog.png' },
    { id: 'citadel-memorium', json: 'HasArboriumMap', display: 'Citadel - Memorium', icon: 'Shop_map_icon__0012_arborium.png' },
    { id: 'citadel-whiteward', json: 'HasWardMap', display: 'Citadel - Whiteward', icon: 'Shop_map_icon__0010_ward.png' },
    { id: 'citadel-whispering-vault', json: 'HasLibraryMap', display: 'Citadel - Whispering Vault', icon: 'Shop_map_icon__0009_library.png' },
    { id: 'citadel-choral-chambers', json: 'HasHallsMap', display: 'Citadel - Choral Chambers', icon: 'Shop_map_icon__0012_halls_new.png' },
    { id: 'citadel-high-halls', json: 'HasHangMap', display: 'Citadel - High Halls', icon: 'Shop_map_icon__0011_conductor.png' },
    { id: 'the-cradle', json: 'HasCradleMap', display: 'The Cradle', icon: 'Shop_map_icon__0012_cradle.png' },
    { id: 'the-abyss', json: 'HasAbyssMap', display: 'The Abyss', icon: 'I_map_type_02.png', iconStyle: 'placeholder' },
    { id: 'verdania', json: 'HasCloverMap', display: 'Verdania', icon: 'Shop_map_icon__0003_clover.png' },
];

// Travel network: playerData booleans. kind 'bellway' = Bellway station,
// 'ventrica' = Ventrica tube stop, 'pin' = map pin set sold by the mapper.
// Display names use a confirmed area name where one exists (areas.js) and the
// internal name otherwise; confirm the rest against the game (Appendix A).
// scenesEncounteredBench is empty even in the 100% save, so benches rested at
// cannot be counted from the save.
export const TRAVEL = [
    { id: 'bellway-aqueduct', json: 'UnlockedAqueductStation', display: 'Putrified Ducts', kind: 'bellway' },
    { id: 'bellway-belltown', json: 'UnlockedBelltownStation', display: 'Bellhart', kind: 'bellway' },
    { id: 'bellway-boneforest-east', json: 'UnlockedBoneforestEastStation', display: 'The Marrow (Boneforest East)', kind: 'bellway' },
    { id: 'bellway-city', json: 'UnlockedCityStation', display: 'City', kind: 'bellway' },
    { id: 'bellway-coral-tower', json: 'UnlockedCoralTowerStation', display: 'Coral Tower', kind: 'bellway' },
    { id: 'bellway-docks', json: 'UnlockedDocksStation', display: 'Deep Docks', kind: 'bellway' },
    { id: 'bellway-greymoor', json: 'UnlockedGreymoorStation', display: 'Greymoor', kind: 'bellway' },
    { id: 'bellway-peak', json: 'UnlockedPeakStation', display: 'Mount Fay', kind: 'bellway' },
    { id: 'bellway-shadow', json: 'UnlockedShadowStation', display: 'Shadow', kind: 'bellway' },
    { id: 'bellway-shellwood', json: 'UnlockedShellwoodStation', display: 'Shellwood', kind: 'bellway' },
    { id: 'ventrica-arborium', json: 'UnlockedArboriumTube', display: 'Memorium', kind: 'ventrica' },
    { id: 'ventrica-city-bellway', json: 'UnlockedCityBellwayTube', display: 'City Bellway', kind: 'ventrica' },
    { id: 'ventrica-enclave', json: 'UnlockedEnclaveTube', display: 'Enclave', kind: 'ventrica' },
    { id: 'ventrica-hang', json: 'UnlockedHangTube', display: 'High Halls', kind: 'ventrica' },
    { id: 'ventrica-song', json: 'UnlockedSongTube', display: 'Song', kind: 'ventrica' },
    { id: 'ventrica-under', json: 'UnlockedUnderTube', display: 'Underworks', kind: 'ventrica' },
    { id: 'pin-bench', json: 'hasPinBench', display: 'Bench pins', kind: 'pin' },
    { id: 'pin-stag', json: 'hasPinStag', display: 'Bellway pins', kind: 'pin' },
    { id: 'pin-tube', json: 'hasPinTube', display: 'Ventrica pins', kind: 'pin' },
];
