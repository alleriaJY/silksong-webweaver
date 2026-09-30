/**
 * Collectable source checklists (same entry shape as unlockables.js).
 */

// 8 craftmetal; 7 sources confirmed
export const CRAFTMETAL_SOURCES = [
    { id: 'purchased-bonebottom-tool-metal', name: 'Pebb (Bone Bottom, 60 Rosaries)', flagType: 'bool', flag: 'PurchasedBonebottomToolMetal', icon: 'Hornet_Tool_Metal.png' },
    { id: 'merchant-enclave-tool-metal', name: 'Jubilana (Songclave, 180 Rosaries)', flagType: 'bool', flag: 'MerchantEnclaveToolMetal', icon: 'Hornet_Tool_Metal.png' },
    { id: 'bone-07-collectable-item-pickup-tool-metal', name: 'The Marrow (Bone_07)', flagType: 'scene', sceneName: 'Bone_07', sceneId: 'Collectable Item Pickup - Tool Metal', icon: 'Hornet_Tool_Metal.png' },
    { id: 'coral-32-collectable-item-pickup-tool-metal', name: 'Blasted Steps (Coral_32)', flagType: 'scene', sceneName: 'Coral_32', sceneId: 'Collectable Item Pickup - Tool Metal', icon: 'Hornet_Tool_Metal.png' },
    { id: 'wisp-05-collectable-item-pickup-tool-metal', name: 'Wisp Thicket (Wisp_05)', flagType: 'scene', sceneName: 'Wisp_05', sceneId: 'Collectable Item Pickup - Tool Metal', icon: 'Hornet_Tool_Metal.png' },
    { id: 'aqueduct-05-collectable-item-pickup-tool-metal', name: 'Putrified Ducts (Aqueduct_05)', flagType: 'scene', sceneName: 'Aqueduct_05', sceneId: 'Collectable Item Pickup - Tool Metal', icon: 'Hornet_Tool_Metal.png' },
    { id: 'under-19b-collectable-item-pickup-tool-metal', name: 'Deep Docks / Far Fields (Under_19b)', flagType: 'scene', sceneName: 'Under_19b', sceneId: 'Collectable Item Pickup - Tool Metal', icon: 'Hornet_Tool_Metal.png' },
    { id: 'craftmetal-8th-unconfirmed', name: '8th location - not yet confirmed', flagType: 'unknown', flag: null, icon: 'Hornet_Tool_Metal.png' },
];

// 20 lockets (wiki list). Mapped only where the save names the locket
// explicitly: two shop purchases and the Bilewater sack. The rest use generic
// 'Collectable Item Pickup' IDs and need a bracketing save pair (Appendix A).
// Lead: purchasedGrindleMemoryLocket also exists (false in every save) but
// Grindle is not on the wiki list.
export const MEMORY_LOCKET_SOURCES = [
    { id: 'bone-bottom-volatile-flintbeetles-wish-reward', name: 'Bone Bottom - Volatile Flintbeetles wish reward', flagType: 'unknown', flag: null, icon: 'Charm_Notch.png' },
    { id: 'the-marrow-arena-battle', name: 'The Marrow - arena battle', flagType: 'unknown', flag: null, icon: 'Charm_Notch.png' },
    { id: 'wormways-after-gromling', name: 'Wormways - after Gromling', flagType: 'unknown', flag: null, icon: 'Charm_Notch.png' },
    { id: 'deep-docks-secret-passage', name: 'Deep Docks - secret passage', flagType: 'unknown', flag: null, icon: 'Charm_Notch.png' },
    { id: 'far-fields-mort-purchase-pilgrims-rest-150-rosaries', name: "Far Fields - Mort purchase (Pilgrim's Rest, 150 Rosaries)", flagType: 'bool', flag: 'PurchasedPilgrimsRestMemoryLocket', icon: 'Charm_Notch.png' },
    { id: 'far-fields-east-of-skarrsinger-karmelita-arena', name: 'Far Fields - east of Skarrsinger Karmelita arena', flagType: 'unknown', flag: null, icon: 'Charm_Notch.png' },
    { id: 'hunters-march-dead-pilgrim', name: "Hunter's March - dead pilgrim", flagType: 'unknown', flag: null, icon: 'Charm_Notch.png' },
    { id: 'greymoor-near-creige-faydown-cloak', name: 'Greymoor - near Creige (Faydown Cloak)', flagType: 'unknown', flag: null, icon: 'Charm_Notch.png' },
    { id: 'greymoor-backpack-ledge', name: 'Greymoor - backpack ledge', flagType: 'unknown', flag: null, icon: 'Charm_Notch.png' },
    { id: 'bellhart-frey-purchase-330-rosaries-after-threadspun-town', name: 'Bellhart - Frey purchase (330 Rosaries, after Threadspun Town)', flagType: 'bool', flag: 'PurchasedBelltownMemoryLocket', icon: 'Charm_Notch.png' },
    { id: 'bellhart-bellhome-summit-silk-soar', name: 'Bellhart - Bellhome summit (Silk Soar)', flagType: 'unknown', flag: null, icon: 'Charm_Notch.png' },
    { id: 'blasted-steps-east-of-shakra', name: 'Blasted Steps - east of Shakra', flagType: 'unknown', flag: null, icon: 'Charm_Notch.png' },
    { id: 'underworks-west-of-confession-booth-bench', name: 'Underworks - west of Confession Booth bench', flagType: 'unknown', flag: null, icon: 'Charm_Notch.png' },
    { id: 'bilewater-after-muckmaggot-path', name: 'Bilewater - after Muckmaggot path', flagType: 'unknown', flag: null, icon: 'Charm_Notch.png' },
    { id: 'bilewater-destroyed-ceiling-cocoon', name: 'Bilewater - destroyed ceiling cocoon (Shadow_27)', flagType: 'scene', sceneName: 'Shadow_27', sceneId: 'Breakable Hang Sack Memory Locket', icon: 'Charm_Notch.png' },
    { id: 'whispering-vaults-near-giant-drapemite', name: 'Whispering Vaults - near Giant Drapemite', flagType: 'unknown', flag: null, icon: 'Charm_Notch.png' },
    { id: 'choral-chambers-behind-trapdoor-breakable-wall', name: 'Choral Chambers - behind trapdoor breakable wall', flagType: 'unknown', flag: null, icon: 'Charm_Notch.png' },
    { id: 'memorium-from-ventrica-station', name: 'Memorium - from Ventrica Station', flagType: 'unknown', flag: null, icon: 'Charm_Notch.png' },
    { id: 'the-slab-shortcut-cave', name: 'The Slab - Shortcut Cave', flagType: 'unknown', flag: null, icon: 'Charm_Notch.png' },
    { id: 'sands-of-karak-upper-western-platform', name: 'Sands of Karak - upper western platform', flagType: 'unknown', flag: null, icon: 'Charm_Notch.png' },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lists below are generated from the names found in every save in savefiles/.
// They are the names we have seen, not necessarily the full in-game sets; the
// collectables category reports any save name missing here (unknownNames).
// ═══════════════════════════════════════════════════════════════════════════

// Relics: playerData.Relics.savedData { IsCollected, IsDeposited } (19 seen).
// kind = relic type; display = "<Type> (<where, from the internal name>)".
export const RELICS = [
    { id: 'seal-chit-aspid-01', json: 'Seal Chit Aspid_01', display: 'Seal Chit (Aspid 01)', kind: 'seal-chit' },
    { id: 'bone-record-bone-east-14', json: 'Bone Record Bone_East_14', display: 'Bone Record (Bone East 14)', kind: 'bone-record' },
    { id: 'bone-record-greymoor-flooded-corridor', json: 'Bone Record Greymoor_flooded_corridor', display: 'Bone Record (Greymoor flooded corridor)', kind: 'bone-record' },
    { id: 'weaver-record-weave-08', json: 'Weaver Record Weave_08', display: 'Weaver Record (Weave 08)', kind: 'weaver-record' },
    { id: 'bone-record-understore-map-room', json: 'Bone Record Understore_Map_Room', display: 'Bone Record (Understore Map Room)', kind: 'bone-record' },
    { id: 'seal-chit-ward-corpse', json: 'Seal Chit Ward Corpse', display: 'Seal Chit (Ward Corpse)', kind: 'seal-chit' },
    { id: 'psalm-cylinder-librarian', json: 'Psalm Cylinder Librarian', display: 'Psalm Cylinder (Librarian)', kind: 'psalm-cylinder' },
    { id: 'psalm-cylinder-hang', json: 'Psalm Cylinder Hang', display: 'Psalm Cylinder (Hang)', kind: 'psalm-cylinder' },
    { id: 'librarian-melody-cylinder', json: 'Librarian Melody Cylinder', display: 'Librarian Melody Cylinder', kind: 'librarian-melody-cylinder' },
    { id: 'weaver-totem-slab-bottom', json: 'Weaver Totem Slab_Bottom', display: 'Weaver Totem (Slab Bottom)', kind: 'weaver-totem' },
    { id: 'psalm-cylinder-grindle', json: 'Psalm Cylinder Grindle', display: 'Psalm Cylinder (Grindle)', kind: 'psalm-cylinder' },
    { id: 'bone-record-wisp-top', json: 'Bone Record Wisp Top', display: 'Bone Record (Wisp Top)', kind: 'bone-record' },
    { id: 'seal-chit-city-merchant', json: 'Seal Chit City Merchant', display: 'Seal Chit (City Merchant)', kind: 'seal-chit' },
    { id: 'weaver-totem-witch', json: 'Weaver Totem Witch', display: 'Weaver Totem (Witch)', kind: 'weaver-totem' },
    { id: 'psalm-cylinder-library-roof', json: 'Psalm Cylinder Library Roof', display: 'Psalm Cylinder (Library Roof)', kind: 'psalm-cylinder' },
    { id: 'ancient-egg-abyss-middle', json: 'Ancient Egg Abyss Middle', display: 'Ancient Egg (Abyss Middle)', kind: 'ancient-egg' },
    { id: 'weaver-record-conductor', json: 'Weaver Record Conductor', display: 'Weaver Record (Conductor)', kind: 'weaver-record' },
    { id: 'seal-chit-silk-siphon', json: 'Seal Chit Silk Siphon', display: 'Seal Chit (Silk Siphon)', kind: 'seal-chit' },
    { id: 'psalm-cylinder-ward', json: 'Psalm Cylinder Ward', display: 'Psalm Cylinder (Ward)', kind: 'psalm-cylinder' },
];

// Materium entries: playerData.MateriumCollected.savedData (37 seen). Presence in
// the list = recorded; IsCollected is only set for the three special stones.
export const MATERIUM = [
    { id: 'silk', json: 'Silk', display: 'Silk' },
    { id: 'shell-shard', json: 'Shell Shard', display: 'Shell Shard' },
    { id: 'rosary-small', json: 'Rosary Small', display: 'Rosary Small' },
    { id: 'rosary-mid', json: 'Rosary Mid', display: 'Rosary Mid' },
    { id: 'rock-roller-item', json: 'Rock Roller Item', display: 'Rock Roller Item' },
    { id: 'beastfly-remains', json: 'Beastfly Remains', display: 'Beastfly Remains' },
    { id: 'crow-feathers', json: 'Crow Feathers', display: 'Crow Feathers' },
    { id: 'song-pilgrim-cloak', json: 'Song Pilgrim Cloak', display: 'Song Pilgrim Cloak' },
    { id: 'broodmother-remains', json: 'Broodmother Remains', display: 'Broodmother Remains' },
    { id: 'roach-corpse-item', json: 'Roach Corpse Item', display: 'Roach Corpse Item' },
    { id: 'courier-supplies-generic', json: 'Courier Supplies Generic', display: 'Courier Supplies Generic' },
    { id: 'lifeblood', json: 'Lifeblood', display: 'Lifeblood' },
    { id: 'rosary-big', json: 'Rosary Big', display: 'Rosary Big' },
    { id: 'tool-metal', json: 'Tool Metal', display: 'Tool Metal' },
    { id: 'mossberry', json: 'Mossberry', display: 'Mossberry' },
    { id: 'pilgrim-rag', json: 'Pilgrim Rag', display: 'Pilgrim Rag' },
    { id: 'skull-king-fragment', json: 'Skull King Fragment', display: 'Skull King Fragment' },
    { id: 'common-spine', json: 'Common Spine', display: 'Common Spine' },
    { id: 'silver-bellclapper', json: 'Silver Bellclapper', display: 'Silver Bellclapper' },
    { id: 'pale-oil', json: 'Pale Oil', display: 'Pale Oil' },
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
    { id: 'magnetite', json: 'Magnetite', display: 'Magnetite' },
];

// Mementos: held as a Collectables item or deposited (MementosDeposited), or a
// playerData flag for the two with no item name in any save. Display names
// follow the owner's TO-DO notes; Hero's = 'Memento Garmond' and Hearts =
// 'Hunter Heart' are by elimination (the other six match by name).
export const MEMENTOS = [
    { id: 'heros-memento', display: "Hero's Memento (Garmond)", item: 'Memento Garmond' },
    { id: 'craw-memento', display: 'Craw Memento', item: 'Crowman Memento', flag: 'PickedUpCrowMemento' },
    { id: 'gray-memento', display: 'Gray Memento', item: 'Grey Memento', flag: 'CollectedMementoGrey' },
    { id: 'surface-memento', display: 'Surface Memento', item: 'Memento Surface' },
    { id: 'hunter-memento', display: 'Hunter Memento', item: 'Hunter Memento', flag: 'nuuMementoAwarded' },
    { id: 'hearts-memento', display: 'Hearts Memento (Hunter Heart)', item: 'Hunter Heart' },
    { id: 'sprintmaster-memento', display: 'Sprintmaster Memento', flag: 'CollectedMementoSprintmaster' },
    { id: 'guardian-memento', display: 'Guardian Memento (Flea Games)', flag: 'FleaGamesMementoGiven' },
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
