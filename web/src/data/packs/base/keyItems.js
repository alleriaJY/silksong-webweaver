/**
 * Keys: same entry shape as the source checklists (unlockables.js), so a key
 * can be a playerData flag, any of several flags, or a world pickup.
 * Names and save keys from silksong-completionist (MIT), checked against the
 * fixtures: the 72% and 100% saves have all four Simple Keys, and their
 * Hero's Path pickup events (type 2) are in exactly these four rooms.
 * Entry: { id, name, flagType, flag | sceneName+sceneId }
 */

export const KEY_SOURCES = [
    { id: 'simple-key-pebb', name: 'Simple Key - Pebb (Bone Bottom)', flagType: 'bool', flag: 'PurchasedBonebottomFaithToken' },
    { id: 'simple-key-sinners-road', name: "Simple Key - Roachkeeper's cage (Sinner's Road)", flagType: 'bool', flag: 'CollectedDustCageKey' },
    { id: 'simple-key-jubilana', name: 'Simple Key - Jubilana (Songclave)', flagType: 'bool', flag: 'MerchantEnclaveSimpleKey' },
    { id: 'simple-key-bellshrine', name: 'Simple Key - corpse on the bench (Sands of Karak)', flagType: 'scene', sceneName: 'Bellshrine_Coral', sceneId: 'Collectable Item Pickup' },
    { id: 'key-of-indolent', name: 'Key of Indolent (The Slab)', flagType: 'bool', flag: 'HasSlabKeyA' },
    { id: 'key-of-heretic', name: 'Key of Heretic (The Slab)', flagType: 'bool', flag: 'HasSlabKeyB' },
    { id: 'key-of-apostate', name: 'Key of Apostate (Putrified Ducts)', flagType: 'bool', flag: 'HasSlabKeyC' },
    { id: 'architects-key', name: "Architect's Key (Underworks)", flagType: 'bool', flag: 'PurchasedArchitectKey' },
    { id: 'white-key', name: 'White Key (Whiteward)', flagType: 'bool', flag: ['collectedWardKey', 'MerchantEnclaveWardKey'] },
    { id: 'surgeons-key', name: "Surgeon's Key (Whiteward)", flagType: 'bool', flag: 'collectedWardBossKey' },
    { id: 'ballow-key', name: 'Diving Bell Key (Ballow, Deep Docks)', flagType: 'bool', flag: 'BallowGivenKey' },
];
