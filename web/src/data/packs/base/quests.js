/**
 * Quests and wishes: playerData.QuestCompletionData.savedData, matched by Name.
 * Data = { IsAccepted, IsCompleted, WasEverCompleted, CompletedCount, HasBeenSeen }.
 * CompletedCount behaves like a progress counter for collection quests
 * (Crow Feathers 25, Destroy Thread Cores 12), not a repeat count.
 *
 * kind:
 *   'quest'    = Main story objectives (Act I–III progression)
 *   'wish'     = Town Wishwall & NPC side wishes (with the 7 '* Pre' Wishwall
 *                intro leads placed at the front with `intro: true`)
 *   'delivery' = Courier delivery wishes (Tipp & Pill)
 *
 * Entry: { id, json, display, kind, intro? }
 */

export const QUESTS = [
    // ─── Main Story Quests (20) ─────────────────────────────────────────────
    { id: 'citadel-seeker', json: 'Citadel Seeker', display: 'The Citadel (Seek the Citadel)', kind: 'quest' },
    { id: 'the-threadspun-town', json: 'The Threadspun Town', display: 'The Threadspun Town', kind: 'quest' },
    { id: 'grand-gate-bellshrines', json: 'Grand Gate Bellshrines', display: 'The Grand Gate (Bellshrines)', kind: 'quest' },
    { id: 'citadel-investigate', json: 'Citadel Investigate', display: 'The Citadel (Investigate)', kind: 'quest' },
    { id: 'citadel-ascent', json: 'Citadel Ascent', display: 'Ascent to the Citadel', kind: 'quest' },
    { id: 'citadel-ascent-melodies', json: 'Citadel Ascent Melodies', display: 'Threefold Melody', kind: 'quest' },
    { id: 'citadel-ascent-lift', json: 'Citadel Ascent Lift', display: 'Ascent Lift', kind: 'quest' },
    { id: 'citadel-ascent-silk-defeat', json: 'Citadel Ascent Silk Defeat', display: 'Confront the Monarch', kind: 'quest' },
    { id: 'silk-defeat-snare', json: 'Silk Defeat Snare', display: 'Ensnare the Monarch', kind: 'quest' },
    { id: 'black-thread-pt0', json: 'Black Thread Pt0', display: 'Act III: Pharloom Below', kind: 'quest' },
    { id: 'black-thread-pt1-shamans', json: 'Black Thread Pt1 Shamans', display: 'Seek the Snail Shamans', kind: 'quest' },
    { id: 'bellbeast-rescue', json: 'Bellbeast Rescue', display: 'Rescue the Bell Beast', kind: 'quest' },
    { id: 'diving-bell-pt1-inspect', json: 'Diving Bell Pt1 Inspect', display: 'The Diving Bell (Inspect)', kind: 'quest' },
    { id: 'diving-bell-pt2-ballow', json: 'Diving Bell Pt2 Ballow', display: 'The Diving Bell (Ballow)', kind: 'quest' },
    { id: 'diving-bell-pt3-descend', json: 'Diving Bell Pt3 Descend', display: 'The Diving Bell (Descend)', kind: 'quest' },
    { id: 'black-thread-pt2-abyss', json: 'Black Thread Pt2 Abyss', display: 'Descent into the Abyss', kind: 'quest' },
    { id: 'black-thread-pt3-escape', json: 'Black Thread Pt3 Escape', display: 'Escape the Abyss', kind: 'quest' },
    { id: 'black-thread-pt4-return', json: 'Black Thread Pt4 Return', display: 'Return to Pharloom', kind: 'quest' },
    { id: 'black-thread-pt5-heart', json: 'Black Thread Pt5 Heart', display: 'Old Hearts of Pharloom', kind: 'quest' },
    { id: 'black-thread-pt6-flower', json: 'Black Thread Pt6 Flower', display: 'The Everbloom', kind: 'quest' },

    // ─── Wishes: Intro / Pre-Quest Leads First (7) ──────────────────────────
    { id: 'mossberry-collection-pre', json: 'Mossberry Collection Pre', display: 'Berry Picking (Intro)', kind: 'wish', intro: true },
    { id: 'save-the-fleas-pre', json: 'Save the Fleas Pre', display: 'The Lost Fleas (Intro)', kind: 'wish', intro: true },
    { id: 'crow-feathers-pre', json: 'Crow Feathers Pre', display: 'Crawbug Clearing (Intro)', kind: 'wish', intro: true },
    { id: 'soul-snare-pre', json: 'Soul Snare Pre', display: 'Silk and Soul (Intro)', kind: 'wish', intro: true },
    { id: 'pinstress-battle-pre', json: 'Pinstress Battle Pre', display: 'Fatal Resolve (Intro)', kind: 'wish', intro: true },
    { id: 'flea-games-pre', json: 'Flea Games Pre', display: 'Ecstasy of the End (Intro)', kind: 'wish', intro: true },
    { id: 'sprintmaster-pre', json: 'Sprintmaster Pre', display: 'Fastest in Pharloom (Intro)', kind: 'wish', intro: true },

    // ─── Wishes (47) ────────────────────────────────────────────────────────
    { id: 'mossberry-collection-1', json: 'Mossberry Collection 1', display: 'Berry Picking', kind: 'wish' },
    { id: 'save-the-fleas', json: 'Save the Fleas', display: 'The Lost Fleas', kind: 'wish' },
    { id: 'building-materials', json: 'Building Materials', display: 'Bone Bottom Repairs', kind: 'wish' },
    { id: 'pilgrim-rags', json: 'Pilgrim Rags', display: 'Garb of the Pilgrims', kind: 'wish' },
    { id: 'brolly-get', json: 'Brolly Get', display: 'Flexile Spines', kind: 'wish' },
    { id: 'journal', json: 'Journal', display: 'Bugs of Pharloom', kind: 'wish' },
    { id: 'building-materials-bridge', json: 'Building Materials (Bridge)', display: 'A Lifesaving Bridge', kind: 'wish' },
    { id: 'rock-rollers', json: 'Rock Rollers', display: 'Volatile Flintbeetles', kind: 'wish' },
    { id: 'shell-flowers', json: 'Shell Flowers', display: 'Rite of the Pollip', kind: 'wish' },
    { id: 'crow-feathers', json: 'Crow Feathers', display: 'Crawbug Clearing', kind: 'wish' },
    { id: 'skull-king', json: 'Skull King', display: 'The Terrible Tyrant', kind: 'wish' },
    { id: 'shiny-bell-goomba', json: 'Shiny Bell Goomba', display: 'Silver Bells', kind: 'wish' },
    { id: 'save-courier-short', json: 'Save Courier Short', display: 'My Missing Courier', kind: 'wish' },
    { id: 'a-pinsmiths-tools', json: 'A Pinsmiths Tools', display: "Pinmaster's Oil", kind: 'wish' },
    { id: 'belltown-house-start', json: 'Belltown House Start', display: 'Restoration of Bellhart', kind: 'wish' },
    { id: 'songclave-donation-1', json: 'Songclave Donation 1', display: 'Building Up Songclave', kind: 'wish' },
    { id: 'fine-pins', json: 'Fine Pins', display: 'Fine Pins', kind: 'wish' },
    { id: 'save-city-merchant', json: 'Save City Merchant', display: 'The Wandering Merchant', kind: 'wish' },
    { id: 'great-gourmand', json: 'Great Gourmand', display: 'Great Taste of Pharloom', kind: 'wish' },
    { id: 'building-materials-statue', json: 'Building Materials (Statue)', display: 'An Icon of Hope', kind: 'wish' },
    { id: 'song-pilgrim-cloaks', json: 'Song Pilgrim Cloaks', display: 'Cloaks of the Choir', kind: 'wish' },
    { id: 'save-sherma', json: 'Save Sherma', display: 'Balm for the Wounded', kind: 'wish' },
    { id: 'belltown-house-mid', json: 'Belltown House Mid', display: "Bellhart's Glory", kind: 'wish' },
    { id: 'save-courier-tall', json: 'Save Courier Tall', display: 'My Missing Brother', kind: 'wish' },
    { id: 'beastfly-hunt', json: 'Beastfly Hunt', display: 'Savage Beastfly', kind: 'wish' },
    { id: 'roach-killing', json: 'Roach Killing', display: 'Roach Guts', kind: 'wish' },
    { id: 'songclave-donation-2', json: 'Songclave Donation 2', display: 'Strengthening Songclave', kind: 'wish' },
    { id: 'broodmother-hunt', json: 'Broodmother Hunt', display: 'The Wailing Mother', kind: 'wish' },
    { id: 'extractor-blue', json: 'Extractor Blue', display: "Alchemist's Assistant", kind: 'wish' },
    { id: 'save-city-merchant-bridge', json: 'Save City Merchant Bridge', display: 'The Lost Merchant', kind: 'wish' },
    { id: 'shakra-final-quest', json: 'Shakra Final Quest', display: "Trail's End", kind: 'wish' },
    { id: 'soul-snare', json: 'Soul Snare', display: 'Silk and Soul', kind: 'wish' },
    { id: 'song-knight', json: 'Song Knight', display: 'Final Audience', kind: 'wish' },
    { id: 'wood-witch-curse', json: 'Wood Witch Curse', display: 'Rite of Rebirth', kind: 'wish' },
    { id: 'doctor-curse-cure', json: 'Doctor Curse Cure', display: 'Infestation Operation', kind: 'wish' },
    { id: 'huntress-quest', json: 'Huntress Quest', display: 'Broodfeast', kind: 'wish' },
    { id: 'destroy-thread-cores', json: 'Destroy Thread Cores', display: 'Dark Hearts', kind: 'wish' },
    { id: 'flea-games', json: 'Flea Games', display: 'Ecstasy of the End', kind: 'wish' },
    { id: 'tormented-trobbio', json: 'Tormented Trobbio', display: 'Pain, Anguish and Misery', kind: 'wish' },
    { id: 'pinstress-battle', json: 'Pinstress Battle', display: 'Fatal Resolve', kind: 'wish' },
    { id: 'garmond-black-threaded', json: 'Garmond Black Threaded', display: "Hero's Call", kind: 'wish' },
    { id: 'extractor-blue-worms', json: 'Extractor Blue Worms', display: 'Advanced Alchemy', kind: 'wish' },
    { id: 'sprintmaster-race', json: 'Sprintmaster Race', display: 'Fastest in Pharloom', kind: 'wish' },
    { id: 'ant-trapper', json: 'Ant Trapper', display: 'The Hidden Hunter', kind: 'wish' },
    { id: 'mr-mushroom', json: 'Mr Mushroom', display: 'Passing of the Age', kind: 'wish' },
    { id: 'huntress-quest-runt', json: 'Huntress Quest Runt', display: 'Runtfeast', kind: 'wish' },
    { id: 'steel-sentinel', json: 'Steel Sentinel', display: 'A Vassal Lost (Steel Soul)', kind: 'wish' },

    // ─── Courier Deliveries (7) ─────────────────────────────────────────────
    { id: 'courier-delivery-pilgrims-rest', json: 'Courier Delivery Pilgrims Rest', display: "Pilgrim's Rest Delivery", kind: 'delivery' },
    { id: 'courier-delivery-songclave', json: 'Courier Delivery Songclave', display: "Queen's Egg (Songclave Delivery)", kind: 'delivery' },
    { id: 'courier-delivery-bonebottom', json: 'Courier Delivery Bonebottom', display: 'Bone Bottom Supplies', kind: 'delivery' },
    { id: 'courier-delivery-dustpens-slave', json: 'Courier Delivery Dustpens Slave', display: "Queen's Egg", kind: 'delivery' },
    { id: 'courier-delivery-fleatopia', json: 'Courier Delivery Fleatopia', display: 'Fleatopia Supplies', kind: 'delivery' },
    { id: 'courier-delivery-mask-maker', json: 'Courier Delivery Mask Maker', display: 'Liquid Lacquer', kind: 'delivery' },
    { id: 'courier-delivery-fixer', json: 'Courier Delivery Fixer', display: "Survivor's Camp Supplies", kind: 'delivery' },
];
