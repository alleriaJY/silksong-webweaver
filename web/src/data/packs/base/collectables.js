/**
 * Collectable source checklists (same entry shape as unlockables.js).
 */

// 8 craftmetal. The Deep Docks chest is a generic pickup ID in Dock_03 (ref):
// set only in the 100% save, the one save with all 8 sources.
export const CRAFTMETAL_SOURCES = [
    { id: 'purchased-bonebottom-tool-metal', name: 'Pebb (Bone Bottom, 60 Rosaries)', flagType: 'bool', flag: 'PurchasedBonebottomToolMetal', icon: 'Hornet_Tool_Metal.png' },
    { id: 'merchant-enclave-tool-metal', name: 'Jubilana (Songclave, 180 Rosaries, after "The Lost Merchant")', flagType: 'bool', flag: 'MerchantEnclaveToolMetal', icon: 'Hornet_Tool_Metal.png' },
    { id: 'bone-07-collectable-item-pickup-tool-metal', name: 'The Marrow - booby-trapped tunnel in a secret room', flagType: 'scene', sceneName: 'Bone_07', sceneId: 'Collectable Item Pickup - Tool Metal', icon: 'Hornet_Tool_Metal.png' },
    { id: 'coral-32-collectable-item-pickup-tool-metal', name: 'Blasted Steps - end of a passage of worms and falling rocks', flagType: 'scene', sceneName: 'Coral_32', sceneId: 'Collectable Item Pickup - Tool Metal', icon: 'Hornet_Tool_Metal.png' },
    { id: 'wisp-05-collectable-item-pickup-tool-metal', name: 'Wisp Thicket - hidden path in the top left', flagType: 'scene', sceneName: 'Wisp_05', sceneId: 'Collectable Item Pickup - Tool Metal', icon: 'Hornet_Tool_Metal.png' },
    { id: 'aqueduct-05-collectable-item-pickup-tool-metal', name: 'Putrified Ducts - crevice right of Pale Lake', flagType: 'scene', sceneName: 'Aqueduct_05', sceneId: 'Collectable Item Pickup - Tool Metal', icon: 'Hornet_Tool_Metal.png' },
    { id: 'under-19b-collectable-item-pickup-tool-metal', name: 'Underworks - end of a lava-filled tunnel', flagType: 'scene', sceneName: 'Under_19b', sceneId: 'Collectable Item Pickup - Tool Metal', icon: 'Hornet_Tool_Metal.png' },
    { id: 'deep-docks-chest', name: 'Deep Docks - chest behind the blockade', flagType: 'scene', sceneName: 'Dock_03', sceneId: 'Collectable Item Pickup', icon: 'Hornet_Tool_Metal.png' },
];

// 20 lockets. World pickups use generic 'Collectable Item Pickup' IDs, so
// each is keyed by its scene (ref). Cross-checked against the fixtures: 15 of
// the 17 scene flags are set in the 100% save; Halfway_01 is unset there
// (Sylphsong needs only 12) and Dock_13 is not in any fixture.
// Bilewater cocoon: the pickup is 'Sack Corpse Pickup' (ref), which older
// fixtures dropped; 'Breakable Hang Sack Memory Locket' is kept as an alias.
// Mort's locket is sold by Grindle in Act 3 instead if it was not bought
// (purchasedGrindleMemoryLocket, ref), so either flag counts: it is the same
// locket, not a 21st.
export const MEMORY_LOCKET_SOURCES = [
    { id: 'bone-bottom-volatile-flintbeetles-wish-reward', name: 'Bone Bottom - "Volatile Flintbeetles" wish reward', flagType: 'quest', flag: 'Rock Rollers', icon: 'Charm_Notch.png' },
    { id: 'the-marrow-arena-battle', name: 'The Marrow - top of the area (Cling Grip)', flagType: 'scene', sceneName: 'Bone_18', sceneId: 'Collectable Item Pickup', icon: 'Charm_Notch.png' },
    { id: 'wormways-after-gromling', name: 'Wormways - held by a corpse, bottom right', flagType: 'scene', sceneName: 'Crawl_09', sceneId: 'Collectable Item Pickup', icon: 'Charm_Notch.png' },
    { id: 'deep-docks-secret-passage', name: 'Deep Docks - magma room behind a breakable wall', flagType: 'scene', sceneName: 'Dock_13', sceneId: 'Collectable Item Pickup', icon: 'Charm_Notch.png' },
    { id: 'far-fields-mort-purchase-pilgrims-rest-150-rosaries', name: "Far Fields - Mort (Pilgrim's Rest, 150 Rosaries; Grindle in Act 3)", flagType: 'bool', flag: ['PurchasedPilgrimsRestMemoryLocket', 'purchasedGrindleMemoryLocket'], icon: 'Charm_Notch.png' },
    { id: 'far-fields-east-of-skarrsinger-karmelita-arena', name: 'Far Fields - east of the Skarrsinger Karmelita arena', flagType: 'scene', sceneName: 'Bone_East_25', sceneId: 'Collectable Item Pickup', icon: 'Charm_Notch.png' },
    { id: 'hunters-march-dead-pilgrim', name: "Hunter's March - cage at the end of the spiky corridor", flagType: 'scene', sceneName: 'Ant_20', sceneId: 'Collectable Item Pickup', icon: 'Charm_Notch.png' },
    { id: 'greymoor-near-creige-faydown-cloak', name: 'Greymoor - inside Halfway Home (Faydown Cloak)', flagType: 'scene', sceneName: 'Halfway_01', sceneId: 'Collectable Item Pickup', icon: 'Charm_Notch.png' },
    { id: 'greymoor-backpack-ledge', name: 'Greymoor - ledge above a Mitemother', flagType: 'scene', sceneName: 'Greymoor_16', sceneId: 'Collectable Item Pickup', icon: 'Charm_Notch.png' },
    { id: 'bellhart-frey-purchase-330-rosaries-after-threadspun-town', name: 'Bellhart - Frey (330 Rosaries, after "The Threadspun Town")', flagType: 'bool', flag: 'PurchasedBelltownMemoryLocket', icon: 'Charm_Notch.png' },
    { id: 'bellhart-bellhome-summit-silk-soar', name: 'Bellhart - Silk Soar into the roof', flagType: 'scene', sceneName: 'Belltown', sceneId: 'Collectable Item Pickup', icon: 'Charm_Notch.png' },
    { id: 'blasted-steps-east-of-shakra', name: 'Blasted Steps - narrow platform above the sands', flagType: 'scene', sceneName: 'Coral_02', sceneId: 'Collectable Item Pickup (1)', icon: 'Charm_Notch.png' },
    { id: 'underworks-west-of-confession-booth-bench', name: 'Underworks - hidden area west of the confession booth', flagType: 'scene', sceneName: 'Under_08', sceneId: 'Collectable Item Pickup', icon: 'Charm_Notch.png' },
    { id: 'bilewater-after-muckmaggot-path', name: 'Bilewater - far left of a secret room', flagType: 'scene', sceneName: 'Shadow_20', sceneId: 'Collectable Item Pickup', icon: 'Charm_Notch.png' },
    { id: 'bilewater-destroyed-ceiling-cocoon', name: 'Bilewater - cocoon hanging from the ceiling', flagType: 'scene', sceneName: 'Shadow_27', sceneId: ['Sack Corpse Pickup', 'Breakable Hang Sack Memory Locket'], icon: 'Charm_Notch.png' },
    { id: 'whispering-vaults-near-giant-drapemite', name: 'Whispering Vaults - top of a tunnel', flagType: 'scene', sceneName: 'Library_08', sceneId: 'Collectable Item Pickup', icon: 'Charm_Notch.png' },
    { id: 'choral-chambers-behind-trapdoor-breakable-wall', name: 'Grand Bellway - behind a breakable wall above the station', flagType: 'scene', sceneName: 'Bellway_City', sceneId: 'Collectable Item Pickup', icon: 'Charm_Notch.png' },
    { id: 'memorium-from-ventrica-station', name: 'Memorium - after a platforming section', flagType: 'scene', sceneName: 'Arborium_05', sceneId: 'Collectable Item Pickup', icon: 'Charm_Notch.png' },
    { id: 'the-slab-shortcut-cave', name: 'The Slab - shortcut cave, behind a breakable wall', flagType: 'scene', sceneName: 'Slab_Cell_Quiet', sceneId: 'Collectable Item Pickup', icon: 'Charm_Notch.png' },
    { id: 'sands-of-karak-upper-western-platform', name: 'Sands of Karak - held by a corpse at the top', flagType: 'scene', sceneName: 'Coral_23', sceneId: 'Collectable Item Pickup', icon: 'Charm_Notch.png' },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lists below are generated from the names found in every save in savefiles/.
// They are the names we have seen, not necessarily the full in-game sets; the
// collectables category reports any save name missing here (unknownNames).
// ═══════════════════════════════════════════════════════════════════════════

// Relics: playerData.Relics.savedData { IsCollected, IsDeposited } (19 seen).
// kind = relic type (internal); display = "<in-game name> (<area>)", names from
// silksong-completionist (MIT). Not seen in any save yet, so not listed:
// 'Weaver Totem Bonetown_upper_room' (Bone Bottom) and
// 'Weaver Record Sprint_Challenge' (Far Fields).
export const RELICS = [
    { id: 'seal-chit-aspid-01', json: 'Seal Chit Aspid_01', display: 'Choral Commandment (Bone Bottom)', kind: 'seal-chit' },
    { id: 'bone-record-bone-east-14', json: 'Bone Record Bone_East_14', display: 'Bone Scroll (Far Fields)', kind: 'bone-record' },
    { id: 'bone-record-greymoor-flooded-corridor', json: 'Bone Record Greymoor_flooded_corridor', display: 'Bone Scroll (Greymoor)', kind: 'bone-record' },
    { id: 'weaver-record-weave-08', json: 'Weaver Record Weave_08', display: 'Rune Harp (Weavenest Atla)', kind: 'weaver-record' },
    { id: 'bone-record-understore-map-room', json: 'Bone Record Understore_Map_Room', display: 'Bone Scroll (Underworks)', kind: 'bone-record' },
    { id: 'seal-chit-ward-corpse', json: 'Seal Chit Ward Corpse', display: 'Choral Commandment (Whiteward)', kind: 'seal-chit' },
    { id: 'psalm-cylinder-librarian', json: 'Psalm Cylinder Librarian', display: 'Psalm Cylinder (Whispering Vaults)', kind: 'psalm-cylinder' },
    { id: 'psalm-cylinder-hang', json: 'Psalm Cylinder Hang', display: 'Psalm Cylinder (High Halls)', kind: 'psalm-cylinder' },
    { id: 'librarian-melody-cylinder', json: 'Librarian Melody Cylinder', display: 'Sacred Cylinder', kind: 'librarian-melody-cylinder' },
    { id: 'weaver-totem-slab-bottom', json: 'Weaver Totem Slab_Bottom', display: 'Weaver Effigy (The Slab)', kind: 'weaver-totem' },
    { id: 'psalm-cylinder-grindle', json: 'Psalm Cylinder Grindle', display: 'Psalm Cylinder (Blasted Steps)', kind: 'psalm-cylinder' },
    { id: 'bone-record-wisp-top', json: 'Bone Record Wisp Top', display: 'Bone Scroll (Wisp Thicket)', kind: 'bone-record' },
    { id: 'seal-chit-city-merchant', json: 'Seal Chit City Merchant', display: 'Choral Commandment (Songclave)', kind: 'seal-chit' },
    { id: 'weaver-totem-witch', json: 'Weaver Totem Witch', display: 'Weaver Effigy (Shellwood)', kind: 'weaver-totem' },
    { id: 'psalm-cylinder-library-roof', json: 'Psalm Cylinder Library Roof', display: 'Psalm Cylinder (Whispering Vaults, 2)', kind: 'psalm-cylinder' },
    { id: 'ancient-egg-abyss-middle', json: 'Ancient Egg Abyss Middle', display: 'Arcane Egg', kind: 'ancient-egg' },
    { id: 'weaver-record-conductor', json: 'Weaver Record Conductor', display: 'Rune Harp (High Halls)', kind: 'weaver-record' },
    { id: 'seal-chit-silk-siphon', json: 'Seal Chit Silk Siphon', display: 'Choral Commandment (Whiteward, 2)', kind: 'seal-chit' },
    { id: 'psalm-cylinder-ward', json: 'Psalm Cylinder Ward', display: 'Psalm Cylinder (Underworks)', kind: 'psalm-cylinder' },
];

// Materium entries: playerData.MateriumCollected.savedData (37 seen). Presence in
// the list = recorded; IsCollected is only set for the three special stones.
// display = in-game Materium name (silksong-completionist, MIT).
export const MATERIUM = [
    { id: 'silk', json: 'Silk', display: 'Silk' },
    { id: 'shell-shard', json: 'Shell Shard', display: 'Shell Shards' },
    { id: 'rosary-small', json: 'Rosary Small', display: 'Rosaries' },
    { id: 'rosary-mid', json: 'Rosary Mid', display: 'Shell Rosaries' },
    { id: 'rock-roller-item', json: 'Rock Roller Item', display: 'Flintgem' },
    { id: 'beastfly-remains', json: 'Beastfly Remains', display: 'Horn Fragment' },
    { id: 'crow-feathers', json: 'Crow Feathers', display: 'Ragpelt' },
    { id: 'song-pilgrim-cloak', json: 'Song Pilgrim Cloak', display: 'Choir Cloak' },
    { id: 'broodmother-remains', json: 'Broodmother Remains', display: "Broodmother's Eye" },
    { id: 'roach-corpse-item', json: 'Roach Corpse Item', display: 'Roach Guts' },
    { id: 'courier-supplies-generic', json: 'Courier Supplies Generic', display: "Courier's Swag" },
    { id: 'lifeblood', json: 'Lifeblood', display: 'Plasmium' },
    { id: 'rosary-big', json: 'Rosary Big', display: 'Pearl Rosaries' },
    { id: 'tool-metal', json: 'Tool Metal', display: 'Craftmetal' },
    { id: 'mossberry', json: 'Mossberry', display: 'Mossberry' },
    { id: 'pilgrim-rag', json: 'Pilgrim Rag', display: 'Pilgrim Shawl' },
    { id: 'skull-king-fragment', json: 'Skull King Fragment', display: 'Crown Fragment' },
    { id: 'common-spine', json: 'Common Spine', display: 'Spine Core' },
    { id: 'silver-bellclapper', json: 'Silver Bellclapper', display: 'Silver Bell' },
    { id: 'pale-oil', json: 'Pale Oil', display: 'Pale Oil' },
    { id: 'shell-flower', json: 'Shell Flower', display: 'Pollip Heart' },
    { id: 'smeltstone', json: 'Smeltstone', display: 'Flintstone' },
    { id: 'crustnut', json: 'Crustnut', display: 'Crustnut' },
    { id: 'courier-supplies-gourmand', json: 'Courier Supplies Gourmand', display: "Courier's Rasher" },
    { id: 'vintage-nectar', json: 'Vintage Nectar', display: 'Vintage Nectar' },
    { id: 'pickled-roach-egg', json: 'Pickled Roach Egg', display: 'Pickled Muckmaggot' },
    { id: 'mossberry-stew', json: 'Mossberry Stew', display: 'Mossberry Stew' },
    { id: 'extractor-machine-pins', json: 'Extractor Machine Pins', display: 'Steel Spines' },
    { id: 'enemy-morsel-shredded', json: 'Enemy Morsel Shredded', display: 'Shredded Organ' },
    { id: 'enemy-morsel-speared', json: 'Enemy Morsel Speared', display: 'Skewered Organ' },
    { id: 'snare-soul-bell-hermit', json: 'Snare Soul Bell Hermit', display: "Hermit's Soul" },
    { id: 'enemy-morsel-seared', json: 'Enemy Morsel Seared', display: 'Seared Organ' },
    { id: 'snare-soul-churchkeeper', json: 'Snare Soul Churchkeeper', display: "Maiden's Soul" },
    { id: 'snare-soul-swamp-bug', json: 'Snare Soul Swamp Bug', display: "Seeker's Soul" },
    { id: 'voltstone', json: 'Voltstone', display: 'Voltridian' },
    { id: 'plasmium-blood', json: 'Plasmium Blood', display: 'Plasmified Blood' },
    { id: 'magnetite', json: 'Magnetite', display: 'Magnetite' },
];

// Mementos: held as a Collectables item or deposited (MementosDeposited), or a
// playerData flag for the two with no item name in any save. Hero's =
// 'Memento Garmond' by elimination (the other six match by name).
// Hearts Memento: the story needs only three of the four hearts; the fourth
// becomes the memento. `allFlags` all set = obtained, and `depositItems` are
// the heart items that can land in MementosDeposited (holding one is not
// enough, since every heart is a Collectables item).
export const MEMENTOS = [
    { id: 'heros-memento', display: "Hero's Memento (Garmond)", item: 'Memento Garmond' },
    { id: 'craw-memento', display: 'Craw Memento', item: 'Crowman Memento', flag: 'PickedUpCrowMemento' },
    { id: 'gray-memento', display: 'Gray Memento', item: 'Grey Memento', flag: 'CollectedMementoGrey' },
    { id: 'surface-memento', display: 'Surface Memento', item: 'Memento Surface' },
    { id: 'hunter-memento', display: 'Hunter Memento', item: 'Hunter Memento', flag: 'nuuMementoAwarded' },
    {
        id: 'hearts-memento', display: 'Hearts Memento (all four hearts)',
        allFlags: ['CollectedHeartFlower', 'CollectedHeartCoral', 'CollectedHeartHunter', 'CollectedHeartClover'],
        depositItems: ['Flower Heart', 'Coral Heart', 'Hunter Heart', 'Clover Heart'],
    },
    { id: 'sprintmaster-memento', display: 'Sprintmaster Memento', flag: 'CollectedMementoSprintmaster' },
    { id: 'guardian-memento', display: 'Guardian Memento (Flea Games)', flag: 'FleaGamesMementoGiven' },
];

// Inventory: playerData.Collectables.savedData { Amount, ... } (76 names seen).
// display: the in-game name where known (materium names from
// silksong-completionist, MIT); otherwise the internal name tidied up.
// "R " prefixes mark carried relics. The rosary string / necklace names are
// from guides, not checked against the game text.
export const INVENTORY_ITEMS = [
    { id: 'rosary-set-frayed', json: 'Rosary_Set_Frayed', display: 'Frayed Rosary String' },
    { id: 'mossberry', json: 'Mossberry', display: 'Mossberry' },
    { id: 'r-seal-chit', json: 'R Seal Chit', display: 'Choral Commandment' },
    { id: 'quill', json: 'Quill', display: 'Quill' },
    { id: 'tool-metal', json: 'Tool Metal', display: 'Craftmetal' },
    { id: 'rosary-set-small', json: 'Rosary_Set_Small', display: 'Rosary String' },
    { id: 'pilgrim-rag', json: 'Pilgrim Rag', display: 'Pilgrim Shawl' },
    { id: 'rosary-set-medium', json: 'Rosary_Set_Medium', display: 'Rosary Necklace' },
    { id: 'common-spine', json: 'Common Spine', display: 'Spine Core' },
    { id: 'r-bone-record', json: 'R Bone Record', display: 'Bone Scroll' },
    { id: 'tool-pouch-kit-inv', json: 'Tool Pouch&Kit Inv', display: 'Tool Pouch and Crafting Kit' },
    { id: 'dresses', json: 'Dresses', display: 'Dresses' },
    { id: 'shard-pouch', json: 'Shard Pouch', display: 'Shard Pouch' },
    { id: 'shell-flower', json: 'Shell Flower', display: 'Pollip Heart' },
    { id: 'rock-roller-item', json: 'Rock Roller Item', display: 'Flintgem' },
    { id: 'crow-feather', json: 'Crow Feather', display: 'Crow Feather' },
    { id: 'crest-socket-unlocker', json: 'Crest Socket Unlocker', display: 'Memory Locket' },
    { id: 'slab-key', json: 'Slab Key', display: 'Slab Key' },
    { id: 'skull-king-fragment', json: 'Skull King Fragment', display: 'Crown Fragment' },
    { id: 'rosary-set-large', json: 'Rosary_Set_Large', display: 'Heavy Rosary Necklace' },
    { id: 'simple-key', json: 'Simple Key', display: 'Simple Key' },
    { id: 'r-weaver-record', json: 'R Weaver Record', display: 'Rune Harp' },
    { id: 'silver-bellclapper', json: 'Silver Bellclapper', display: 'Silver Bell' },
    { id: 'silk-grub', json: 'Silk Grub', display: 'Silkeater' },
    { id: 'ward-key', json: 'Ward Key', display: 'Ward Key' },
    { id: 'fine-pin', json: 'Fine Pin', display: 'Fine Pin' },
    { id: 'cog-heart-pieces', json: 'Cog Heart Pieces', display: 'Cog Heart Pieces' },
    { id: 'r-psalm-cylinder', json: 'R Psalm Cylinder', display: 'Psalm Cylinder' },
    { id: 'pale-oil', json: 'Pale_Oil', display: 'Pale Oil' },
    { id: 'song-pilgrim-cloak', json: 'Song Pilgrim Cloak', display: 'Choir Cloak' },
    { id: 'roach-corpse-item', json: 'Roach Corpse Item', display: 'Roach Guts' },
    { id: 'vintage-nectar', json: 'Vintage Nectar', display: 'Vintage Nectar' },
    { id: 'beastfly-remains', json: 'Beastfly Remains', display: 'Horn Fragment' },
    { id: 'rosary-set-huge-white', json: 'Rosary_Set_Huge_White', display: 'Pale Rosary Necklace' },
    { id: 'broodmother-remains', json: 'Broodmother Remains', display: "Broodmother's Eye" },
    { id: 'fixer-idol', json: 'Fixer Idol', display: 'Fixer Idol' },
    { id: 'mossberry-stew', json: 'Mossberry Stew', display: 'Mossberry Stew' },
    { id: 'plasmium', json: 'Plasmium', display: 'Plasmium Phial' },
    { id: 'courier-supplies-gourmand', json: 'Courier Supplies Gourmand', display: "Courier's Rasher" },
    { id: 'materium', json: 'Materium', display: 'Materium' },
    { id: 'courier-supplies', json: 'Courier Supplies', display: 'Courier Supplies' },
    { id: 'belltown-house-key', json: 'Belltown House Key', display: 'Belltown House Key' },
    { id: 'r-weaver-totem', json: 'R Weaver Totem', display: 'Weaver Effigy' },
    { id: 'coral-ingredient', json: 'Coral Ingredient', display: 'Coral Ingredient' },
    { id: 'great-shard', json: 'Great Shard', display: 'Great Shard' },
    { id: 'snare-soul-swamp-bug', json: 'Snare Soul Swamp Bug', display: "Seeker's Soul" },
    { id: 'pickled-roach-egg', json: 'Pickled Roach Egg', display: 'Pickled Muckmaggot' },
    { id: 'snare-soul-churchkeeper', json: 'Snare Soul Churchkeeper', display: "Maiden's Soul" },
    { id: 'architect-key', json: 'Architect Key', display: 'Architect Key' },
    { id: 'wood-witch-item', json: 'Wood Witch Item', display: 'Wood Witch Item' },
    { id: 'pristine-core', json: 'Pristine Core', display: 'Pristine Core' },
    { id: 'broken-silkshot', json: 'Broken SilkShot', display: 'Broken Silkshot' },
    { id: 'snare-soul-bell-hermit', json: 'Snare Soul Bell Hermit', display: "Hermit's Soul" },
    { id: 'extractor-machine-pins', json: 'Extractor Machine Pins', display: 'Steel Spines' },
    { id: 'enemy-morsel-speared', json: 'Enemy Morsel Speared', display: 'Skewered Organ' },
    { id: 'enemy-morsel-seared', json: 'Enemy Morsel Seared', display: 'Seared Organ' },
    { id: 'enemy-morsel-shredded', json: 'Enemy Morsel Shredded', display: 'Shredded Organ' },
    { id: 'dock-key', json: 'Dock Key', display: 'Dock Key' },
    { id: 'r-ancient-egg', json: 'R Ancient Egg', display: 'Arcane Egg' },
    { id: 'coral-heart', json: 'Coral Heart', display: 'Encrusted Heart' },
    { id: 'craw-summons', json: 'Craw Summons', display: 'Craw Summons' },
    { id: 'memento-garmond', json: 'Memento Garmond', display: "Hero's Memento" },
    { id: 'flower-heart', json: 'Flower Heart', display: 'Pollen Heart' },
    { id: 'clover-heart', json: 'Clover Heart', display: 'Conjoined Heart' },
    { id: 'crowman-memento', json: 'Crowman Memento', display: 'Craw Memento' },
    { id: 'crawbell', json: 'Crawbell', display: 'Crawbell' },
    { id: 'hunter-heart', json: 'Hunter Heart', display: "Hunter's Heart" },
    { id: 'white-flower', json: 'White Flower', display: 'Everbloom' },
    { id: 'plasmium-blood', json: 'Plasmium Blood', display: 'Plasmified Blood' },
    { id: 'plasmium-gland', json: 'Plasmium Gland', display: 'Plasmium Gland' },
    { id: 'ant-trapper-item', json: 'Ant Trapper Item', display: 'Ant Trapper Item' },
    { id: 'farsight', json: 'Farsight', display: 'Farsight' },
    { id: 'ward-boss-key', json: 'Ward Boss Key', display: 'Ward Boss Key' },
    { id: 'grey-memento', json: 'Grey Memento', display: 'Grey Memento' },
    { id: 'memento-surface', json: 'Memento Surface', display: 'Surface Memento' },
    { id: 'hunter-memento', json: 'Hunter Memento', display: "Hunter's Memento" },
];
