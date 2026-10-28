/**
 * Quests and wishes: playerData.QuestCompletionData.savedData, matched by Name.
 * Data = { IsAccepted, IsCompleted, WasEverCompleted, CompletedCount, HasBeenSeen }.
 * CompletedCount behaves like a progress counter for collection quests
 * (Crow Feathers 25, Destroy Thread Cores 12), not a repeat count.
 * The 74 names found across every save in savefiles/, in the order they
 * appear in the 100% save.
 *
 * display: the in-game wish / objective title (silksong-completionist, MIT).
 *   Internal steps the game does not list on its own get the parent's title
 *   plus the step ("Fatal Resolve (start)" for a *Pre entry, "The Dark Below:
 *   find Ballow"); those step labels are ours, not in-game text.
 * group:   wish board category (Main = main objectives).
 * target:  goal of a collection wish. Read from the saves: a completed wish's
 *          CompletedCount, identical in the 72% and 100% saves. Courier
 *          deliveries also count up but are not a collection goal, so none.
 * Entry: { id, json, display, group, target? }
 */

export const QUESTS = [
    { id: 'citadel-seeker', json: 'Citadel Seeker', display: 'The Great Citadel', group: 'Main' },
    { id: 'mossberry-collection-pre', json: 'Mossberry Collection Pre', display: 'Berry Picking (start)', group: 'Gather' },
    { id: 'mossberry-collection-1', json: 'Mossberry Collection 1', display: 'Berry Picking', group: 'Gather' },
    { id: 'save-the-fleas-pre', json: 'Save the Fleas Pre', display: 'The Lost Fleas (start)', group: 'Wayfarer' },
    { id: 'save-the-fleas', json: 'Save the Fleas', display: 'The Lost Fleas', group: 'Wayfarer' },
    { id: 'building-materials', json: 'Building Materials', display: 'Bone Bottom Repairs', group: 'Donate' },
    { id: 'pilgrim-rags', json: 'Pilgrim Rags', display: 'Garb of the Pilgrims', group: 'Hunt', target: 13 },
    { id: 'brolly-get', json: 'Brolly Get', display: 'Flexile Spines', group: 'Hunt' },
    { id: 'journal', json: 'Journal', display: 'Bugs of Pharloom', group: 'Learn' },
    { id: 'the-threadspun-town', json: 'The Threadspun Town', display: 'The Threadspun Town', group: 'Main' },
    { id: 'building-materials-bridge', json: 'Building Materials (Bridge)', display: 'A Lifesaving Bridge', group: 'Donate' },
    { id: 'rock-rollers', json: 'Rock Rollers', display: 'Volatile Flintbeetles', group: 'Hunt', target: 3 },
    { id: 'shell-flowers', json: 'Shell Flowers', display: 'Rite of the Pollip', group: 'Gather' },
    { id: 'crow-feathers-pre', json: 'Crow Feathers Pre', display: 'Crawbug Clearing (start)', group: 'Hunt' },
    { id: 'crow-feathers', json: 'Crow Feathers', display: 'Crawbug Clearing', group: 'Hunt', target: 25 },
    { id: 'skull-king', json: 'Skull King', display: 'The Terrible Tyrant', group: 'Grand Hunt' },
    { id: 'shiny-bell-goomba', json: 'Shiny Bell Goomba', display: 'Silver Bells', group: 'Gather', target: 8 },
    { id: 'save-courier-short', json: 'Save Courier Short', display: 'My Missing Courier', group: 'Wayfarer' },
    { id: 'a-pinsmiths-tools', json: 'A Pinsmiths Tools', display: "Pinmaster's Oil", group: 'Wayfarer' },
    { id: 'belltown-house-start', json: 'Belltown House Start', display: 'Restoration of Bellhart', group: 'Donate' },
    { id: 'grand-gate-bellshrines', json: 'Grand Gate Bellshrines', display: 'Grand Gate', group: 'Main' },
    { id: 'citadel-investigate', json: 'Citadel Investigate', display: 'Silent Halls', group: 'Main' },
    { id: 'citadel-ascent', json: 'Citadel Ascent', display: "Pharloom's Crown", group: 'Main' },
    { id: 'songclave-donation-1', json: 'Songclave Donation 1', display: 'Building up Songclave', group: 'Donate' },
    { id: 'fine-pins', json: 'Fine Pins', display: 'Fine Pins', group: 'Hunt', target: 10 },
    { id: 'save-city-merchant', json: 'Save City Merchant', display: 'The Wandering Merchant', group: 'Wayfarer' },
    { id: 'great-gourmand', json: 'Great Gourmand', display: 'Great Taste of Pharloom', group: 'Gather' },
    { id: 'citadel-ascent-melodies', json: 'Citadel Ascent Melodies', display: "Pharloom's Crown: the three Melodies", group: 'Main' },
    { id: 'building-materials-statue', json: 'Building Materials (Statue)', display: 'An Icon of Hope', group: 'Donate' },
    { id: 'song-pilgrim-cloaks', json: 'Song Pilgrim Cloaks', display: 'Cloaks of the Choir', group: 'Hunt', target: 15 },
    { id: 'save-sherma', json: 'Save Sherma', display: 'Balm for the Wounded', group: 'Wayfarer' },
    { id: 'belltown-house-mid', json: 'Belltown House Mid', display: "Bellhart's Glory", group: 'Donate' },
    { id: 'save-courier-tall', json: 'Save Courier Tall', display: 'My Missing Brother', group: 'Wayfarer' },
    { id: 'beastfly-hunt', json: 'Beastfly Hunt', display: 'Savage Beastfly', group: 'Grand Hunt' },
    { id: 'roach-killing', json: 'Roach Killing', display: 'Roach Guts', group: 'Hunt', target: 10 },
    { id: 'songclave-donation-2', json: 'Songclave Donation 2', display: 'Strengthening Songclave', group: 'Donate' },
    { id: 'broodmother-hunt', json: 'Broodmother Hunt', display: 'The Wailing Mother', group: 'Grand Hunt' },
    { id: 'citadel-ascent-lift', json: 'Citadel Ascent Lift', display: "Pharloom's Crown: the lift", group: 'Main' },
    { id: 'citadel-ascent-silk-defeat', json: 'Citadel Ascent Silk Defeat', display: "Pharloom's Crown: the final battle", group: 'Main' },
    { id: 'extractor-blue', json: 'Extractor Blue', display: "Alchemist's Assistant", group: 'Gather' },
    { id: 'save-city-merchant-bridge', json: 'Save City Merchant Bridge', display: 'The Lost Merchant', group: 'Wayfarer' },
    { id: 'courier-delivery-pilgrims-rest', json: 'Courier Delivery Pilgrims Rest', display: "Pilgrim's Rest Supplies", group: 'Delivery' },
    { id: 'shakra-final-quest', json: 'Shakra Final Quest', display: "Trail's End", group: 'Wayfarer' },
    { id: 'soul-snare-pre', json: 'Soul Snare Pre', display: 'Silk and Soul', group: 'Collect' },
    { id: 'courier-delivery-songclave', json: 'Courier Delivery Songclave', display: 'Songclave Supplies', group: 'Delivery' },
    { id: 'soul-snare', json: 'Soul Snare', display: 'Soul Snare', group: 'Main' },
    { id: 'song-knight', json: 'Song Knight', display: 'Final Audience', group: 'Wayfarer' },
    { id: 'wood-witch-curse', json: 'Wood Witch Curse', display: 'Rite of Rebirth', group: 'Wayfarer' },
    { id: 'doctor-curse-cure', json: 'Doctor Curse Cure', display: 'Infestation Operation', group: 'Wayfarer' },
    { id: 'silk-defeat-snare', json: 'Silk Defeat Snare', display: 'Pale Monarch', group: 'Main' },
    { id: 'huntress-quest', json: 'Huntress Quest', display: 'Broodfeast', group: 'Hunt' },
    { id: 'black-thread-pt0', json: 'Black Thread Pt0', display: 'After the Fall', group: 'Main' },
    { id: 'black-thread-pt1-shamans', json: 'Black Thread Pt1 Shamans', display: 'Awaiting the End', group: 'Main' },
    { id: 'bellbeast-rescue', json: 'Bellbeast Rescue', display: 'Beast in the Bells', group: 'Main' },
    { id: 'diving-bell-pt1-inspect', json: 'Diving Bell Pt1 Inspect', display: 'The Dark Below: inspect the diving bell', group: 'Main' },
    { id: 'diving-bell-pt2-ballow', json: 'Diving Bell Pt2 Ballow', display: 'The Dark Below: find Ballow', group: 'Main' },
    { id: 'diving-bell-pt3-descend', json: 'Diving Bell Pt3 Descend', display: 'The Dark Below', group: 'Main' },
    { id: 'black-thread-pt2-abyss', json: 'Black Thread Pt2 Abyss', display: 'The Dark Below: into the Abyss', group: 'Main' },
    { id: 'black-thread-pt3-escape', json: 'Black Thread Pt3 Escape', display: 'Return to Pharloom', group: 'Main' },
    { id: 'black-thread-pt4-return', json: 'Black Thread Pt4 Return', display: 'Spell Seeker', group: 'Main' },
    { id: 'black-thread-pt5-heart', json: 'Black Thread Pt5 Heart', display: 'The Old Hearts', group: 'Main' },
    { id: 'pinstress-battle-pre', json: 'Pinstress Battle Pre', display: 'Fatal Resolve (start)', group: 'Wayfarer' },
    { id: 'flea-games-pre', json: 'Flea Games Pre', display: 'Ecstasy of the End (start)', group: 'Wayfarer' },
    { id: 'destroy-thread-cores', json: 'Destroy Thread Cores', display: 'Dark Hearts', group: 'Grand Hunt', target: 12 },
    { id: 'flea-games', json: 'Flea Games', display: 'Ecstasy of the End', group: 'Wayfarer' },
    { id: 'tormented-trobbio', json: 'Tormented Trobbio', display: 'Pain, Anguish, and Misery', group: 'Wayfarer' },
    { id: 'pinstress-battle', json: 'Pinstress Battle', display: 'Fatal Resolve', group: 'Wayfarer' },
    { id: 'garmond-black-threaded', json: 'Garmond Black Threaded', display: "Hero's Call", group: 'Wayfarer' },
    { id: 'black-thread-pt6-flower', json: 'Black Thread Pt6 Flower', display: 'The Old Hearts: the Everbloom', group: 'Main' },
    { id: 'extractor-blue-worms', json: 'Extractor Blue Worms', display: 'Advanced Alchemy', group: 'Gather' },
    { id: 'sprintmaster-pre', json: 'Sprintmaster Pre', display: 'Fastest in Pharloom (start)', group: 'Sprint' },
    { id: 'sprintmaster-race', json: 'Sprintmaster Race', display: 'Fastest in Pharloom', group: 'Sprint' },
    { id: 'ant-trapper', json: 'Ant Trapper', display: 'The Hidden Hunter', group: 'Grand Hunt' },
    { id: 'mr-mushroom', json: 'Mr Mushroom', display: 'Passing of the Age', group: 'Witness' },
];
