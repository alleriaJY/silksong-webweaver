/**
 * Collectable source checklists (same entry shape as unlockables.js).
 */

// 8 craftmetal. Confirmed against the 8 craftable tools + held Tool Metal
// oracle (0 in early saves, 4 in the 72% save, 8 in the 100% save).
export const CRAFTMETAL_SOURCES = [
    { id: 'purchased-bonebottom-tool-metal', name: 'Pebb (Bone Bottom, 60 Rosaries)', flagType: 'bool', flag: 'PurchasedBonebottomToolMetal', icon: 'Hornet_Tool_Metal.png' },
    { id: 'merchant-enclave-tool-metal', name: 'Jubilana (Songclave, 180 Rosaries)', flagType: 'bool', flag: 'MerchantEnclaveToolMetal', icon: 'Hornet_Tool_Metal.png' },
    { id: 'bone-07-collectable-item-pickup-tool-metal', name: 'The Marrow (Bone_07)', flagType: 'scene', sceneName: 'Bone_07', sceneId: 'Collectable Item Pickup - Tool Metal', icon: 'Hornet_Tool_Metal.png' },
    { id: 'coral-32-collectable-item-pickup-tool-metal', name: 'Blasted Steps (Coral_32)', flagType: 'scene', sceneName: 'Coral_32', sceneId: 'Collectable Item Pickup - Tool Metal', icon: 'Hornet_Tool_Metal.png' },
    { id: 'wisp-05-collectable-item-pickup-tool-metal', name: 'Wisp Thicket (Wisp_05)', flagType: 'scene', sceneName: 'Wisp_05', sceneId: 'Collectable Item Pickup - Tool Metal', icon: 'Hornet_Tool_Metal.png' },
    { id: 'aqueduct-05-collectable-item-pickup-tool-metal', name: 'Putrified Ducts (Aqueduct_05)', flagType: 'scene', sceneName: 'Aqueduct_05', sceneId: 'Collectable Item Pickup - Tool Metal', icon: 'Hornet_Tool_Metal.png' },
    { id: 'under-19b-collectable-item-pickup-tool-metal', name: 'Underworks (Under_19b)', flagType: 'scene', sceneName: 'Under_19b', sceneId: 'Collectable Item Pickup - Tool Metal', icon: 'Hornet_Tool_Metal.png' },
    { id: 'dock-03-collectable-item-pickup', name: 'Deep Docks / Far Fields chest (Dock_03)', flagType: 'scene', sceneName: 'Dock_03', sceneId: 'Collectable Item Pickup', icon: 'Hornet_Tool_Metal.png' },
];

// All 20 Memory Locket sources: 1 quest reward, 2 shop purchases (Mort's
// falls back to Grindle in Act 3 via purchasedGrindleMemoryLocket), and 17
// world pickups in sceneData.persistentBools.
export const MEMORY_LOCKET_SOURCES = [
    { id: 'bone-bottom-volatile-flintbeetles-wish-reward', name: 'Bone Bottom - Volatile Flintbeetles wish reward', flagType: 'quest', flag: 'Rock Rollers', icon: 'Charm_Notch.png' },
    { id: 'the-marrow-arena-battle', name: 'The Marrow - arena battle (Bone_18)', flagType: 'scene', sceneName: 'Bone_18', sceneId: 'Collectable Item Pickup', icon: 'Charm_Notch.png' },
    { id: 'wormways-after-gromling', name: 'Wormways - after Gromling (Crawl_09)', flagType: 'scene', sceneName: 'Crawl_09', sceneId: 'Collectable Item Pickup', icon: 'Charm_Notch.png' },
    { id: 'deep-docks-secret-passage', name: 'Deep Docks - secret passage (Dock_13)', flagType: 'scene', sceneName: 'Dock_13', sceneId: 'Collectable Item Pickup', icon: 'Charm_Notch.png' },
    {
        id: 'far-fields-mort-purchase-pilgrims-rest-150-rosaries',
        name: "Far Fields - Mort purchase (Pilgrim's Rest, 150 Rosaries; Grindle in Act 3)",
        flagType: 'any',
        checks: [
            { flagType: 'bool', flag: 'PurchasedPilgrimsRestMemoryLocket' },
            { flagType: 'bool', flag: 'purchasedGrindleMemoryLocket' },
        ],
        icon: 'Charm_Notch.png',
    },
    { id: 'far-fields-east-of-skarrsinger-karmelita-arena', name: 'Far Fields - east of Skarrsinger Karmelita arena (Bone_East_25)', flagType: 'scene', sceneName: 'Bone_East_25', sceneId: 'Collectable Item Pickup', icon: 'Charm_Notch.png' },
    { id: 'hunters-march-dead-pilgrim', name: "Hunter's March - dead pilgrim (Ant_20)", flagType: 'scene', sceneName: 'Ant_20', sceneId: 'Collectable Item Pickup', icon: 'Charm_Notch.png' },
    { id: 'greymoor-near-creige-faydown-cloak', name: 'Greymoor - inside Halfway Home (Halfway_01)', flagType: 'scene', sceneName: 'Halfway_01', sceneId: 'Collectable Item Pickup', icon: 'Charm_Notch.png' },
    { id: 'greymoor-backpack-ledge', name: 'Greymoor - ledge above Mitemother (Greymoor_16)', flagType: 'scene', sceneName: 'Greymoor_16', sceneId: 'Collectable Item Pickup', icon: 'Charm_Notch.png' },
    { id: 'bellhart-frey-purchase-330-rosaries-after-threadspun-town', name: 'Bellhart - Frey purchase (330 Rosaries, after Threadspun Town)', flagType: 'bool', flag: 'PurchasedBelltownMemoryLocket', icon: 'Charm_Notch.png' },
    { id: 'bellhart-bellhome-summit-silk-soar', name: 'Bellhart - Bellhome summit (Belltown)', flagType: 'scene', sceneName: 'Belltown', sceneId: 'Collectable Item Pickup', icon: 'Charm_Notch.png' },
    { id: 'blasted-steps-east-of-shakra', name: 'Blasted Steps - east of Shakra (Coral_02)', flagType: 'scene', sceneName: 'Coral_02', sceneId: 'Collectable Item Pickup (1)', icon: 'Charm_Notch.png' },
    { id: 'underworks-west-of-confession-booth-bench', name: 'Underworks - west of Confession Booth bench (Under_08)', flagType: 'scene', sceneName: 'Under_08', sceneId: 'Collectable Item Pickup', icon: 'Charm_Notch.png' },
    { id: 'bilewater-after-muckmaggot-path', name: 'Bilewater - after Muckmaggot path (Shadow_20)', flagType: 'scene', sceneName: 'Shadow_20', sceneId: 'Collectable Item Pickup', icon: 'Charm_Notch.png' },
    { id: 'bilewater-destroyed-ceiling-cocoon', name: 'Bilewater - destroyed ceiling cocoon (Shadow_27)', flagType: 'scene', sceneName: 'Shadow_27', sceneId: 'Sack Corpse Pickup', icon: 'Charm_Notch.png' },
    { id: 'whispering-vaults-near-giant-drapemite', name: 'Whispering Vaults - near Giant Drapemite (Library_08)', flagType: 'scene', sceneName: 'Library_08', sceneId: 'Collectable Item Pickup', icon: 'Charm_Notch.png' },
    { id: 'choral-chambers-behind-trapdoor-breakable-wall', name: 'Choral Chambers - behind trapdoor breakable wall (Bellway_City)', flagType: 'scene', sceneName: 'Bellway_City', sceneId: 'Collectable Item Pickup', icon: 'Charm_Notch.png' },
    { id: 'memorium-from-ventrica-station', name: 'Memorium - from Ventrica Station (Arborium_05)', flagType: 'scene', sceneName: 'Arborium_05', sceneId: 'Collectable Item Pickup', icon: 'Charm_Notch.png' },
    { id: 'the-slab-shortcut-cave', name: 'The Slab - Shortcut Cave (Slab_Cell_Quiet)', flagType: 'scene', sceneName: 'Slab_Cell_Quiet', sceneId: 'Collectable Item Pickup', icon: 'Charm_Notch.png' },
    { id: 'sands-of-karak-upper-western-platform', name: 'Sands of Karak - upper western platform (Coral_23)', flagType: 'scene', sceneName: 'Coral_23', sceneId: 'Collectable Item Pickup', icon: 'Charm_Notch.png' },
];

// 3 Pale Oil sources (used by Pinmaster Plinney to upgrade Hornet's Needle)
export const PALE_OIL_SOURCES = [
    { id: 'pale-oil-whispering-vaults', name: 'Whispering Vaults - box puzzle (Library_03)', flagType: 'scene', sceneName: 'Library_03', sceneId: 'Collectable Item Pickup', iconKind: 'checklist', icon: 'oil_phial.png' },
    { id: 'pale-oil-great-gourmand', name: 'Choral Chambers - "Great Taste of Pharloom" wish', flagType: 'quest', flag: 'Great Gourmand', iconKind: 'checklist', icon: 'oil_phial.png' },
    { id: 'pale-oil-flea-games', name: 'Bellhart - "Ecstasy of the End" wish (Act 3)', flagType: 'quest', flag: 'Flea Games', iconKind: 'checklist', icon: 'oil_phial.png' },
];

// 7 Mossberry sources (4 world fruit + 3 flying enemy drops)
export const MOSSBERRY_SOURCES = [
    { id: 'mossberry-tut-02', name: 'Moss Grotto #1 (Tut_02)', flagType: 'scene', sceneName: 'Tut_02', sceneId: 'moss_berry_fruit', iconKind: 'checklist', icon: 'I_moss_berry.png' },
    { id: 'mossberry-tut-01b', name: 'Moss Grotto #2 (Tut_01b)', flagType: 'scene', sceneName: 'Tut_01b', sceneId: 'moss_berry_fruit', iconKind: 'checklist', icon: 'I_moss_berry.png' },
    { id: 'mossberry-bonetown-aspid', name: 'Moss Grotto - Bone Bottom flying enemy', flagType: 'bool', flag: 'bonetownAspidBerryCollected', iconKind: 'checklist', icon: 'I_moss_berry.png' },
    { id: 'mossberry-mosstown-aspid', name: 'Moss Grotto - Mosshome flying enemy', flagType: 'bool', flag: 'mosstownAspidBerryCollected', iconKind: 'checklist', icon: 'I_moss_berry.png' },
    { id: 'mossberry-bonegrave-aspid', name: 'Moss Grotto - Bonegrave flying enemy', flagType: 'bool', flag: 'bonegraveAspidBerryCollected', iconKind: 'checklist', icon: 'I_moss_berry.png' },
    { id: 'mossberry-weave-03', name: 'Weavenest Atla (Weave_03)', flagType: 'scene', sceneName: 'Weave_03', sceneId: 'moss_berry_fruit', iconKind: 'checklist', icon: 'I_moss_berry.png' },
    { id: 'mossberry-arborium-04', name: 'Memorium (Arborium_04)', flagType: 'scene', sceneName: 'Arborium_04', sceneId: 'moss_berry_fruit', iconKind: 'checklist', icon: 'I_moss_berry.png' },
];

// 9 Silkeater cocoons (Coral_37 is Classic Mode only)
export const SILKEATER_SOURCES = [
    { id: 'silkeater-dock-14', name: 'Deep Docks (Dock_14)', flagType: 'scene', sceneName: 'Dock_14', sceneId: 'Silk Grub Large Cocoon', iconKind: 'checklist', icon: 'Silk_Grub_large_cocoon0000.png' },
    { id: 'silkeater-greymoor-04', name: 'Greymoor (Greymoor_04)', flagType: 'scene', sceneName: 'Greymoor_04', sceneId: 'Silk Grub Large Cocoon', iconKind: 'checklist', icon: 'Silk_Grub_large_cocoon0000.png' },
    { id: 'silkeater-coral-37', name: 'Blasted Steps - Classic only (Coral_37)', flagType: 'scene', sceneName: 'Coral_37', sceneId: 'Silk Grub Large Cocoon', iconKind: 'checklist', icon: 'Silk_Grub_large_cocoon0000.png' },
    { id: 'silkeater-organ-01', name: 'Exhaust Organ (Organ_01)', flagType: 'scene', sceneName: 'Organ_01', sceneId: 'Silk Grub Large Cocoon', iconKind: 'checklist', icon: 'Silk_Grub_large_cocoon0000.png' },
    { id: 'silkeater-song-24', name: 'Choral Chambers #1 (Song_24)', flagType: 'scene', sceneName: 'Song_24', sceneId: 'Silk Grub Large Cocoon', iconKind: 'checklist', icon: 'Silk_Grub_large_cocoon0000.png' },
    { id: 'silkeater-song-09b', name: 'Choral Chambers #2 (Song_09b)', flagType: 'scene', sceneName: 'Song_09b', sceneId: 'Silk Grub Large Cocoon', iconKind: 'checklist', icon: 'Silk_Grub_large_cocoon0000.png' },
    { id: 'silkeater-library-14', name: 'Whispering Vaults (Library_14)', flagType: 'scene', sceneName: 'Library_14', sceneId: 'Silk Grub Large Cocoon', iconKind: 'checklist', icon: 'Silk_Grub_large_cocoon0000.png' },
    { id: 'silkeater-ward-04', name: 'Whiteward (Ward_04)', flagType: 'scene', sceneName: 'Ward_04', sceneId: 'Silk Grub Large Cocoon', iconKind: 'checklist', icon: 'Silk_Grub_large_cocoon0000.png' },
    { id: 'silkeater-tube-hub', name: 'The Cradle / Terminus (Tube_Hub)', flagType: 'scene', sceneName: 'Tube_Hub', sceneId: 'Silk Grub Large Cocoon', iconKind: 'checklist', icon: 'Silk_Grub_large_cocoon0000.png' },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lists below are generated from the names found in every save in savefiles/.
// They are the names we have seen, not necessarily the full in-game sets; the
// collectables category reports any save name missing here (unknownNames).
// ═══════════════════════════════════════════════════════════════════════════

// Relics: playerData.Relics.savedData { IsCollected, IsDeposited } (19 seen).
// kind = relic type; display = "<Type> (<where, from the internal name>)".
export const RELICS = [
    { id: 'seal-chit-aspid-01', json: 'Seal Chit Aspid_01', display: 'Seal Chit (Aspid 01)', kind: 'seal-chit', iconKind: 'collectable', icon: 'Hornet_icon_0000_R_seal_chit.png' },
    { id: 'bone-record-bone-east-14', json: 'Bone Record Bone_East_14', display: 'Bone Record (Bone East 14)', kind: 'bone-record', iconKind: 'collectable', icon: 'Hornet_icon_0002_R_bone_record.png' },
    { id: 'bone-record-greymoor-flooded-corridor', json: 'Bone Record Greymoor_flooded_corridor', display: 'Bone Record (Greymoor flooded corridor)', kind: 'bone-record', iconKind: 'collectable', icon: 'Hornet_icon_0002_R_bone_record.png' },
    { id: 'weaver-record-weave-08', json: 'Weaver Record Weave_08', display: 'Weaver Record (Weave 08)', kind: 'weaver-record', iconKind: 'collectable', icon: 'Hornet_icon_0002_R_weaver_record.png' },
    { id: 'bone-record-understore-map-room', json: 'Bone Record Understore_Map_Room', display: 'Bone Record (Understore Map Room)', kind: 'bone-record', iconKind: 'collectable', icon: 'Hornet_icon_0002_R_bone_record.png' },
    { id: 'seal-chit-ward-corpse', json: 'Seal Chit Ward Corpse', display: 'Seal Chit (Ward Corpse)', kind: 'seal-chit', iconKind: 'collectable', icon: 'Hornet_icon_0000_R_seal_chit.png' },
    { id: 'psalm-cylinder-librarian', json: 'Psalm Cylinder Librarian', display: 'Psalm Cylinder (Librarian)', kind: 'psalm-cylinder', iconKind: 'collectable', icon: 'Hornet_icon_0000_R_psalm_cylinder_gleam0002.png' },
    { id: 'psalm-cylinder-hang', json: 'Psalm Cylinder Hang', display: 'Psalm Cylinder (Hang)', kind: 'psalm-cylinder', iconKind: 'collectable', icon: 'Hornet_icon_0000_R_psalm_cylinder_gleam0002.png' },
    { id: 'librarian-melody-cylinder', json: 'Librarian Melody Cylinder', display: 'Librarian Melody Cylinder', kind: 'librarian-melody-cylinder', iconKind: 'collectable', icon: 'Hornet_icon_0000_R_psalm_cylinder_white.png' },
    { id: 'weaver-totem-slab-bottom', json: 'Weaver Totem Slab_Bottom', display: 'Weaver Totem (Slab Bottom)', kind: 'weaver-totem', iconKind: 'collectable', icon: 'Hornet_icon_0005_R_saint_locket.png' },
    { id: 'psalm-cylinder-grindle', json: 'Psalm Cylinder Grindle', display: 'Psalm Cylinder (Grindle)', kind: 'psalm-cylinder', iconKind: 'collectable', icon: 'Hornet_icon_0000_R_psalm_cylinder_gleam0002.png' },
    { id: 'bone-record-wisp-top', json: 'Bone Record Wisp Top', display: 'Bone Record (Wisp Top)', kind: 'bone-record', iconKind: 'collectable', icon: 'Hornet_icon_0002_R_bone_record.png' },
    { id: 'seal-chit-city-merchant', json: 'Seal Chit City Merchant', display: 'Seal Chit (City Merchant)', kind: 'seal-chit', iconKind: 'collectable', icon: 'Hornet_icon_0000_R_seal_chit.png' },
    { id: 'weaver-totem-witch', json: 'Weaver Totem Witch', display: 'Weaver Totem (Witch)', kind: 'weaver-totem', iconKind: 'collectable', icon: 'Hornet_icon_0005_R_saint_locket.png' },
    { id: 'psalm-cylinder-library-roof', json: 'Psalm Cylinder Library Roof', display: 'Psalm Cylinder (Library Roof)', kind: 'psalm-cylinder', iconKind: 'collectable', icon: 'Hornet_icon_0000_R_psalm_cylinder_gleam0002.png' },
    { id: 'ancient-egg-abyss-middle', json: 'Ancient Egg Abyss Middle', display: 'Ancient Egg (Abyss Middle)', kind: 'ancient-egg', iconKind: 'collectable', icon: 'Hornet_icon_0004_R_ancient_egg.png' },
    { id: 'weaver-record-conductor', json: 'Weaver Record Conductor', display: 'Weaver Record (Conductor)', kind: 'weaver-record', iconKind: 'collectable', icon: 'Hornet_icon_0002_R_weaver_record.png' },
    { id: 'seal-chit-silk-siphon', json: 'Seal Chit Silk Siphon', display: 'Seal Chit (Silk Siphon)', kind: 'seal-chit', iconKind: 'collectable', icon: 'Hornet_icon_0000_R_seal_chit.png' },
    { id: 'psalm-cylinder-ward', json: 'Psalm Cylinder Ward', display: 'Psalm Cylinder (Ward)', kind: 'psalm-cylinder', iconKind: 'collectable', icon: 'Hornet_icon_0000_R_psalm_cylinder_gleam0002.png' },
    { id: 'weaver-totem-bonetown-upper-room', json: 'Weaver Totem Bonetown_upper_room', display: 'Weaver Totem (Bone Bottom upper room)', kind: 'weaver-totem', iconKind: 'collectable', icon: 'Hornet_icon_0005_R_saint_locket.png' },
    { id: 'weaver-record-sprint-challenge', json: 'Weaver Record Sprint_Challenge', display: 'Weaver Record (Sprint Challenge)', kind: 'weaver-record', iconKind: 'collectable', icon: 'Hornet_icon_0002_R_weaver_record.png' },
];

// Materium entries: playerData.MateriumCollected.savedData (37 seen). Presence in
// the list = recorded; IsCollected is only set for the three special stones.
export const MATERIUM = [
    { id: 'silk', json: 'Silk', display: 'Silk' },
    { id: 'shell-shard', json: 'Shell Shard', display: 'Shell Shard', iconKind: 'general', icon: 'general_shard.png' },
    { id: 'rosary-small', json: 'Rosary Small', display: 'Rosary Small', iconKind: 'general', icon: 'general_rosaries.png' },
    { id: 'rosary-mid', json: 'Rosary Mid', display: 'Rosary Mid', iconKind: 'general', icon: 'general_rosaries.png' },
    { id: 'rock-roller-item', json: 'Rock Roller Item', display: 'Rock Roller Item', iconKind: 'tool', icon: 'Hornet_icon_0003_T_flintstone.png' },
    { id: 'beastfly-remains', json: 'Beastfly Remains', display: 'Beastfly Remains' },
    { id: 'crow-feathers', json: 'Crow Feathers', display: 'Crow Feathers' },
    { id: 'song-pilgrim-cloak', json: 'Song Pilgrim Cloak', display: 'Song Pilgrim Cloak' },
    { id: 'broodmother-remains', json: 'Broodmother Remains', display: 'Broodmother Remains' },
    { id: 'roach-corpse-item', json: 'Roach Corpse Item', display: 'Roach Corpse Item' },
    { id: 'courier-supplies-generic', json: 'Courier Supplies Generic', display: 'Courier Supplies Generic' },
    { id: 'lifeblood', json: 'Lifeblood', display: 'Lifeblood', iconKind: 'tool', icon: 'T_syringe_lifeblood.png' },
    { id: 'rosary-big', json: 'Rosary Big', display: 'Rosary Big', iconKind: 'general', icon: 'general_rosaries.png' },
    { id: 'tool-metal', json: 'Tool Metal', display: 'Tool Metal', iconKind: 'general', icon: 'Hornet_Tool_Metal.png' },
    { id: 'mossberry', json: 'Mossberry', display: 'Mossberry', iconKind: 'checklist', icon: 'I_moss_berry.png' },
    { id: 'pilgrim-rag', json: 'Pilgrim Rag', display: 'Pilgrim Rag' },
    { id: 'skull-king-fragment', json: 'Skull King Fragment', display: 'Skull King Fragment' },
    { id: 'common-spine', json: 'Common Spine', display: 'Common Spine' },
    { id: 'silver-bellclapper', json: 'Silver Bellclapper', display: 'Silver Bellclapper' },
    { id: 'pale-oil', json: 'Pale Oil', display: 'Pale Oil', iconKind: 'checklist', icon: 'oil_phial.png' },
    { id: 'shell-flower', json: 'Shell Flower', display: 'Shell Flower' },
    { id: 'smeltstone', json: 'Smeltstone', display: 'Smeltstone' },
    { id: 'crustnut', json: 'Crustnut', display: 'Crustnut' },
    { id: 'courier-supplies-gourmand', json: 'Courier Supplies Gourmand', display: 'Courier Supplies Gourmand' },
    { id: 'vintage-nectar', json: 'Vintage Nectar', display: 'Vintage Nectar' },
    { id: 'pickled-roach-egg', json: 'Pickled Roach Egg', display: 'Pickled Roach Egg' },
    { id: 'mossberry-stew', json: 'Mossberry Stew', display: 'Mossberry Stew' },
    { id: 'extractor-machine-pins', json: 'Extractor Machine Pins', display: 'Extractor Machine Pins' },
    { id: 'enemy-morsel-shredded', json: 'Enemy Morsel Shredded', display: 'Enemy Morsel Shredded' },
    { id: 'enemy-morsel-speared', json: 'Enemy Morsel Speared', display: 'Enemy Morsel Speared' },
    { id: 'snare-soul-bell-hermit', json: 'Snare Soul Bell Hermit', display: 'Snare Soul Bell Hermit' },
    { id: 'enemy-morsel-seared', json: 'Enemy Morsel Seared', display: 'Enemy Morsel Seared' },
    { id: 'snare-soul-churchkeeper', json: 'Snare Soul Churchkeeper', display: 'Snare Soul Churchkeeper' },
    { id: 'snare-soul-swamp-bug', json: 'Snare Soul Swamp Bug', display: 'Snare Soul Swamp Bug' },
    { id: 'voltstone', json: 'Voltstone', display: 'Voltstone' },
    { id: 'plasmium-blood', json: 'Plasmium Blood', display: 'Plasmium Blood' },
    { id: 'magnetite', json: 'Magnetite', display: 'Magnetite', iconKind: 'tool', icon: '_0006_I_magnetite_dice.png' },
    { id: 'courier-supplies-slave', json: 'Courier Supplies Slave', display: "Queen's Egg (Courier Supplies)" },
    { id: 'courier-supplies-mask-maker', json: 'Courier Supplies Mask Maker', display: 'Liquid Lacquer (Courier Supplies)' },
];

// Mementos: held as a Collectables item or deposited (MementosDeposited), or a
// playerData flag for the two with no item name in any save. Hero's =
// 'Memento Garmond' by elimination (the other six match by name).
// Hearts Memento: the story needs only three of the four hearts; the fourth
// becomes the memento. `allFlags` all set = obtained, and `depositItems` are
// the heart items that can land in MementosDeposited (holding one is not
// enough, since every heart is a Collectables item).
export const MEMENTOS = [
    { id: 'heros-memento', display: "Hero's Memento (Garmond)", item: 'Memento Garmond', iconKind: 'memento', icon: 'garmond_memento.png' },
    { id: 'craw-memento', display: 'Craw Memento', item: 'Crowman Memento', flag: 'PickedUpCrowMemento', iconKind: 'memento', icon: 'craw_court_memento.png' },
    { id: 'gray-memento', display: 'Gray Memento', item: 'Grey Memento', flag: 'CollectedMementoGrey', iconKind: 'memento', icon: 'grey_warrior_memento.png' },
    { id: 'surface-memento', display: 'Surface Memento', item: 'Memento Surface', iconKind: 'memento', icon: 'surface_memento.png' },
    { id: 'hunter-memento', display: 'Hunter Memento', item: 'Hunter Memento', flag: 'nuuMementoAwarded', iconKind: 'memento', icon: 'hunter_nuu_memento_seal.png' },
    {
        id: 'hearts-memento', display: 'Hearts Memento (all four hearts)',
        allFlags: ['CollectedHeartFlower', 'CollectedHeartCoral', 'CollectedHeartHunter', 'CollectedHeartClover'],
        depositItems: ['Flower Heart', 'Coral Heart', 'Hunter Heart', 'Clover Heart'],
        iconKind: 'memento', icon: 'memento_heart_clover0000.png',
    },
    { id: 'sprintmaster-memento', display: 'Sprintmaster Memento', item: 'Sprintmaster Memento', flag: 'CollectedMementoSprintmaster', iconKind: 'memento', icon: 'sprintmaster_memento.png' },
    { id: 'guardian-memento', display: 'Guardian Memento (Flea Games)', item: 'Memento Seth', flag: 'FleaGamesMementoGiven', iconKind: 'memento', icon: 'seth_memento.png' },
];

// Inventory: playerData.Collectables.savedData { Amount, ... } (76 names seen).
// display is the internal name tidied up; "R " prefixes mark carried relics.
export const INVENTORY_ITEMS = [
    { id: 'rosary-set-frayed', json: 'Rosary_Set_Frayed', display: 'Rosary Set Frayed' },
    { id: 'mossberry', json: 'Mossberry', display: 'Mossberry' },
    { id: 'r-seal-chit', json: 'R Seal Chit', display: 'Seal Chit' },
    { id: 'quill', json: 'Quill', display: 'Quill' },
    { id: 'tool-metal', json: 'Tool Metal', display: 'Tool Metal' },
    { id: 'rosary-set-small', json: 'Rosary_Set_Small', display: 'Rosary Set Small' },
    { id: 'pilgrim-rag', json: 'Pilgrim Rag', display: 'Pilgrim Rag' },
    { id: 'rosary-set-medium', json: 'Rosary_Set_Medium', display: 'Rosary Set Medium' },
    { id: 'common-spine', json: 'Common Spine', display: 'Common Spine' },
    { id: 'r-bone-record', json: 'R Bone Record', display: 'Bone Record' },
    { id: 'tool-pouch-kit-inv', json: 'Tool Pouch&Kit Inv', display: 'Tool Pouch & Kit Inv' },
    { id: 'dresses', json: 'Dresses', display: 'Dresses' },
    { id: 'shard-pouch', json: 'Shard Pouch', display: 'Shard Pouch' },
    { id: 'shell-flower', json: 'Shell Flower', display: 'Shell Flower' },
    { id: 'rock-roller-item', json: 'Rock Roller Item', display: 'Rock Roller Item' },
    { id: 'crow-feather', json: 'Crow Feather', display: 'Crow Feather' },
    { id: 'crest-socket-unlocker', json: 'Crest Socket Unlocker', display: 'Crest Socket Unlocker' },
    { id: 'slab-key', json: 'Slab Key', display: 'Slab Key' },
    { id: 'skull-king-fragment', json: 'Skull King Fragment', display: 'Skull King Fragment' },
    { id: 'rosary-set-large', json: 'Rosary_Set_Large', display: 'Rosary Set Large' },
    { id: 'simple-key', json: 'Simple Key', display: 'Simple Key' },
    { id: 'r-weaver-record', json: 'R Weaver Record', display: 'Weaver Record' },
    { id: 'silver-bellclapper', json: 'Silver Bellclapper', display: 'Silver Bellclapper' },
    { id: 'silk-grub', json: 'Silk Grub', display: 'Silk Grub' },
    { id: 'ward-key', json: 'Ward Key', display: 'Ward Key' },
    { id: 'fine-pin', json: 'Fine Pin', display: 'Fine Pin' },
    { id: 'cog-heart-pieces', json: 'Cog Heart Pieces', display: 'Cog Heart Pieces' },
    { id: 'r-psalm-cylinder', json: 'R Psalm Cylinder', display: 'Psalm Cylinder' },
    { id: 'pale-oil', json: 'Pale_Oil', display: 'Pale Oil' },
    { id: 'song-pilgrim-cloak', json: 'Song Pilgrim Cloak', display: 'Song Pilgrim Cloak' },
    { id: 'roach-corpse-item', json: 'Roach Corpse Item', display: 'Roach Corpse Item' },
    { id: 'vintage-nectar', json: 'Vintage Nectar', display: 'Vintage Nectar' },
    { id: 'beastfly-remains', json: 'Beastfly Remains', display: 'Beastfly Remains' },
    { id: 'rosary-set-huge-white', json: 'Rosary_Set_Huge_White', display: 'Rosary Set Huge White' },
    { id: 'broodmother-remains', json: 'Broodmother Remains', display: 'Broodmother Remains' },
    { id: 'fixer-idol', json: 'Fixer Idol', display: 'Fixer Idol' },
    { id: 'mossberry-stew', json: 'Mossberry Stew', display: 'Mossberry Stew' },
    { id: 'plasmium', json: 'Plasmium', display: 'Plasmium' },
    { id: 'courier-supplies-gourmand', json: 'Courier Supplies Gourmand', display: 'Courier Supplies Gourmand' },
    { id: 'materium', json: 'Materium', display: 'Materium' },
    { id: 'courier-supplies', json: 'Courier Supplies', display: 'Courier Supplies' },
    { id: 'belltown-house-key', json: 'Belltown House Key', display: 'Belltown House Key' },
    { id: 'r-weaver-totem', json: 'R Weaver Totem', display: 'Weaver Totem' },
    { id: 'coral-ingredient', json: 'Coral Ingredient', display: 'Coral Ingredient' },
    { id: 'great-shard', json: 'Great Shard', display: 'Great Shard' },
    { id: 'snare-soul-swamp-bug', json: 'Snare Soul Swamp Bug', display: 'Snare Soul Swamp Bug' },
    { id: 'pickled-roach-egg', json: 'Pickled Roach Egg', display: 'Pickled Roach Egg' },
    { id: 'snare-soul-churchkeeper', json: 'Snare Soul Churchkeeper', display: 'Snare Soul Churchkeeper' },
    { id: 'architect-key', json: 'Architect Key', display: 'Architect Key' },
    { id: 'wood-witch-item', json: 'Wood Witch Item', display: 'Wood Witch Item' },
    { id: 'pristine-core', json: 'Pristine Core', display: 'Pristine Core' },
    { id: 'broken-silkshot', json: 'Broken SilkShot', display: 'Broken SilkShot' },
    { id: 'snare-soul-bell-hermit', json: 'Snare Soul Bell Hermit', display: 'Snare Soul Bell Hermit' },
    { id: 'extractor-machine-pins', json: 'Extractor Machine Pins', display: 'Extractor Machine Pins' },
    { id: 'enemy-morsel-speared', json: 'Enemy Morsel Speared', display: 'Enemy Morsel Speared' },
    { id: 'enemy-morsel-seared', json: 'Enemy Morsel Seared', display: 'Enemy Morsel Seared' },
    { id: 'enemy-morsel-shredded', json: 'Enemy Morsel Shredded', display: 'Enemy Morsel Shredded' },
    { id: 'dock-key', json: 'Dock Key', display: 'Dock Key' },
    { id: 'r-ancient-egg', json: 'R Ancient Egg', display: 'Ancient Egg' },
    { id: 'coral-heart', json: 'Coral Heart', display: 'Coral Heart' },
    { id: 'craw-summons', json: 'Craw Summons', display: 'Craw Summons' },
    { id: 'memento-garmond', json: 'Memento Garmond', display: 'Memento Garmond' },
    { id: 'flower-heart', json: 'Flower Heart', display: 'Flower Heart' },
    { id: 'clover-heart', json: 'Clover Heart', display: 'Clover Heart' },
    { id: 'crowman-memento', json: 'Crowman Memento', display: 'Crowman Memento' },
    { id: 'crawbell', json: 'Crawbell', display: 'Crawbell' },
    { id: 'hunter-heart', json: 'Hunter Heart', display: 'Hunter Heart' },
    { id: 'white-flower', json: 'White Flower', display: 'White Flower' },
    { id: 'plasmium-blood', json: 'Plasmium Blood', display: 'Plasmium Blood' },
    { id: 'plasmium-gland', json: 'Plasmium Gland', display: 'Plasmium Gland' },
    { id: 'ant-trapper-item', json: 'Ant Trapper Item', display: 'Ant Trapper Item' },
    { id: 'farsight', json: 'Farsight', display: 'Farsight' },
    { id: 'ward-boss-key', json: 'Ward Boss Key', display: 'Ward Boss Key' },
    { id: 'grey-memento', json: 'Grey Memento', display: 'Grey Memento' },
    { id: 'memento-surface', json: 'Memento Surface', display: 'Memento Surface' },
    { id: 'hunter-memento', json: 'Hunter Memento', display: 'Hunter Memento' },
];
