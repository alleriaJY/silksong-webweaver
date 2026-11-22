/**
 * Key items: playerData booleans for keys and story items that open the way
 * forward. `note` says what the item is for.
 * Entry: { id, json, display, note }
 */

export const KEY_ITEMS = [
    { id: 'simple-key-bonebottom', json: 'PurchasedBonebottomFaithToken', display: 'Simple Key (Bone Bottom)', note: 'Purchased from Pebb for 500 Rosaries', iconKind: 'key', icon: 'rusted_cage_key.png' },
    { id: 'simple-key-sinners-road', json: 'CollectedDustCageKey', display: "Simple Key (Sinner's Road)", note: "Dropped by Roachkeeper in Sinner's Road", iconKind: 'key', icon: 'rusted_cage_key.png' },
    { id: 'simple-key-songclave', json: 'MerchantEnclaveSimpleKey', display: 'Simple Key (Songclave)', note: 'Purchased from Jubilana for 650 Rosaries', iconKind: 'key', icon: 'rusted_cage_key.png' },
    { id: 'simple-key-sands-of-karak', sceneName: 'Bellshrine_Coral', sceneId: 'Collectable Item Pickup', display: 'Simple Key (Sands of Karak)', note: 'Held by a corpse on the easternmost bench (Bellshrine_Coral)', iconKind: 'key', icon: 'rusted_cage_key.png' },
    { id: 'slab-key-indolent', json: 'HasSlabKeyA', display: 'Key of Indolent', note: 'The Slab: opens Indolent locks', iconKind: 'key', icon: 'I_slab_key_old.png' },
    { id: 'slab-key-heretic', json: 'HasSlabKeyB', display: 'Key of Heretic', note: 'The Slab: opens Heretic locks', iconKind: 'key', icon: 'I_slab_key_brass.png' },
    { id: 'slab-key-apostate', json: 'HasSlabKeyC', display: 'Key of Apostate', note: 'Putrified Ducts / The Slab: opens Apostate locks', iconKind: 'key', icon: 'I_slab_key_gold.png' },
    { id: 'architect-key', json: 'PurchasedArchitectKey', display: "Architect's Key", note: 'Underworks: purchased from Twelfth Architect, unlocks the Chapel of the Architect', iconKind: 'key', icon: 'I_key_architect.png' },
    { id: 'white-key', json: 'collectedWardKey', altFlags: ['MerchantEnclaveWardKey'], display: 'White Key', note: 'Songclave (or Jubilana for 220 Rosaries): unlocks the elevator into Whiteward', iconKind: 'key', icon: 'I_key_whiteward.png' },
    { id: 'surgeons-key', json: 'collectedWardBossKey', display: "Surgeon's Key", note: 'Whiteward: opens the sluice gate beneath the operating theatre', iconKind: 'key', icon: 'I_chute_key_whiteward.png' },
    { id: 'bellhome-key', json: 'BelltownHouseUnlocked', display: 'Bellhome Key', note: "Bellhart: received from Pavo, unlocks Hornet's Bellhome" },
    { id: 'materium-constructed', json: 'ConstructedMaterium', display: 'Materium', note: 'Bellhome: assembled to record materials of Pharloom' },
    { id: 'farsight-constructed', json: 'ConstructedFarsight', display: 'Farsight', note: 'Bellhome: assembled from Weavenest Absolom, reveals completion percentage' },
    { id: 'ballow-key', json: 'BallowGivenKey', display: 'Diving Bell Key', note: 'Act 3: given by Ballow, opens the way to the Abyss', iconKind: 'key', icon: 'dock_key.png' },
];
