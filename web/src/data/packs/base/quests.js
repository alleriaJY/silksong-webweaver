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
 * where:   where the wish is found and what unlocks it (silksong-completionist,
 *          MIT); internal steps share their parent's. Shown on hover while the
 *          wish is not completed.
 * Entry: { id, json, display, group, target?, where }
 */

export const QUESTS = [
    { id: 'citadel-seeker', json: 'Citadel Seeker', display: 'The Great Citadel', group: 'Main', where: "Bone Bottom: Ascend through the lands of Pharloom to reach the Citadel at the kingdom's peak." },
    { id: 'mossberry-collection-pre', json: 'Mossberry Collection Pre', display: 'Berry Picking (start)', group: 'Gather', where: "Moss Grotto (Mosshome): Wish from Moss Druid." },
    { id: 'mossberry-collection-1', json: 'Mossberry Collection 1', display: 'Berry Picking', group: 'Gather', where: "Moss Grotto (Mosshome): Wish from Moss Druid." },
    { id: 'save-the-fleas-pre', json: 'Save the Fleas Pre', display: 'The Lost Fleas (start)', group: 'Wayfarer', where: "The Marrow: Wish from Fleamaster Mooshka." },
    { id: 'save-the-fleas', json: 'Save the Fleas', display: 'The Lost Fleas', group: 'Wayfarer', where: "The Marrow: Wish from Fleamaster Mooshka." },
    { id: 'building-materials', json: 'Building Materials', display: 'Bone Bottom Repairs', group: 'Donate', where: "Bone Bottom: On the Wishwall." },
    { id: 'pilgrim-rags', json: 'Pilgrim Rags', display: 'Garb of the Pilgrims', group: 'Hunt', target: 13, where: "Bone Bottom: On the Wishwall." },
    { id: 'brolly-get', json: 'Brolly Get', display: 'Flexile Spines', group: 'Hunt', where: "Far Fields: Wish from Seamstress." },
    { id: 'journal', json: 'Journal', display: 'Bugs of Pharloom', group: 'Learn', where: "Greymoor (Halfway Home): Wish from Nuu." },
    { id: 'the-threadspun-town', json: 'The Threadspun Town', display: 'The Threadspun Town', group: 'Main', where: "Bellhart: Defeat Widow." },
    { id: 'building-materials-bridge', json: 'Building Materials (Bridge)', display: 'A Lifesaving Bridge', group: 'Donate', where: "Bone Bottom: On the Wishwall (appears after you reach Greymoor)." },
    { id: 'rock-rollers', json: 'Rock Rollers', display: 'Volatile Flintbeetles', group: 'Hunt', target: 3, where: "Bone Bottom: On the Wishwall (appears after you reach Greymoor)." },
    { id: 'shell-flowers', json: 'Shell Flowers', display: 'Rite of the Pollip', group: 'Gather', where: "Shellwood: Wish from Greyroot." },
    { id: 'crow-feathers-pre', json: 'Crow Feathers Pre', display: 'Crawbug Clearing (start)', group: 'Hunt', where: "Bellhart: On the Wishwall (appears after defeating Widow)." },
    { id: 'crow-feathers', json: 'Crow Feathers', display: 'Crawbug Clearing', group: 'Hunt', target: 25, where: "Bellhart: On the Wishwall (appears after defeating Widow)." },
    { id: 'skull-king', json: 'Skull King', display: 'The Terrible Tyrant', group: 'Grand Hunt', where: "Bone Bottom: On the Wishwall (appears after acquiring Cling Grip)." },
    { id: 'shiny-bell-goomba', json: 'Shiny Bell Goomba', display: 'Silver Bells', group: 'Gather', target: 8, where: "Bellhart: On the Wishwall (appears after defeating Widow)." },
    { id: 'save-courier-short', json: 'Save Courier Short', display: 'My Missing Courier', group: 'Wayfarer', where: "Bellhart: On the Wishwall (appears after defeating Widow)." },
    { id: 'a-pinsmiths-tools', json: 'A Pinsmiths Tools', display: "Pinmaster's Oil", group: 'Wayfarer', where: "Bellhart: Wish from Pinmaster Plinney (accessible after sharpening your needle for the first time, and speaking to Pinmaster Plinney)." },
    { id: 'belltown-house-start', json: 'Belltown House Start', display: 'Restoration of Bellhart', group: 'Donate', where: "Bellhart: On the Wishwall (appears after defeating Widow, speaking to Pinmaster Plinney for the first needle upgrade, and selling a(ny) relic to Relic Seeker Scrounge)." },
    { id: 'grand-gate-bellshrines', json: 'Grand Gate Bellshrines', display: 'Grand Gate', group: 'Main', where: "Blasted Steps (Outside Grand Gate): Awaken the old bells throughout the lands." },
    { id: 'citadel-investigate', json: 'Citadel Investigate', display: 'Silent Halls', group: 'Main', where: "Grand Gate" },
    { id: 'citadel-ascent', json: 'Citadel Ascent', display: "Pharloom's Crown", group: 'Main', where: "Cogwork Core (Centre)" },
    { id: 'songclave-donation-1', json: 'Songclave Donation 1', display: 'Building up Songclave', group: 'Donate', where: "Songclave: On the Wishwall." },
    { id: 'fine-pins', json: 'Fine Pins', display: 'Fine Pins', group: 'Hunt', target: 10, where: "Songclave: On the Wishwall." },
    { id: 'save-city-merchant', json: 'Save City Merchant', display: 'The Wandering Merchant', group: 'Wayfarer', where: "Songclave: On the Wishwall." },
    { id: 'great-gourmand', json: 'Great Gourmand', display: 'Great Taste of Pharloom', group: 'Gather', where: "Choral Chambers: Wish from Loyal Mergwin." },
    { id: 'citadel-ascent-melodies', json: 'Citadel Ascent Melodies', display: "Pharloom's Crown: the three Melodies", group: 'Main', where: "Cogwork Core (Centre)" },
    { id: 'building-materials-statue', json: 'Building Materials (Statue)', display: 'An Icon of Hope', group: 'Donate', where: "Bone Bottom: On the Wishwall (appears in ACT 2)." },
    { id: 'song-pilgrim-cloaks', json: 'Song Pilgrim Cloaks', display: 'Cloaks of the Choir', group: 'Hunt', target: 15, where: "Songclave: On the Wishwall (appears after completing \"Building up Songclave\" and \"Fine Pins\" wishes)." },
    { id: 'save-sherma', json: 'Save Sherma', display: 'Balm for the Wounded', group: 'Wayfarer', where: "Songclave: Wish from Sherma (appears after you discover Whiteward, is also accessible by directly speaking to Sherma in Whiteward)." },
    { id: 'belltown-house-mid', json: 'Belltown House Mid', display: "Bellhart's Glory", group: 'Donate', where: "Bellhart: On the Wishwall (appears after completing \"Restoration of Bellhart\" wish, and completing one of these in ACT 2 \u2014 defeating Cogwork Dancers, obtaining Clawline, or activating Songclave)." },
    { id: 'save-courier-tall', json: 'Save Courier Tall', display: 'My Missing Brother', group: 'Wayfarer', where: "Bellhart: On the Wishwall (appears in ACT 2, provided that \"My Missing Courier\" wish is completed)." },
    { id: 'beastfly-hunt', json: 'Beastfly Hunt', display: 'Savage Beastfly', group: 'Grand Hunt', where: "Bellhart: On the Wishwall (appears sometime in ACT 2, provided that Savage Beastfly in Hunter's March (Chapel of the Beast) is defeated)." },
    { id: 'roach-killing', json: 'Roach Killing', display: 'Roach Guts', group: 'Hunt', target: 10, where: "Sinner's Road: Wish from Crull and Benjin." },
    { id: 'songclave-donation-2', json: 'Songclave Donation 2', display: 'Strengthening Songclave', group: 'Donate', where: "Songclave: On the Wishwall." },
    { id: 'broodmother-hunt', json: 'Broodmother Hunt', display: 'The Wailing Mother', group: 'Grand Hunt', where: "Songclave: On the Wishwall (appears after completing \"The Wandering Merchant\" and \"Strengthening Songclave\" wishes)." },
    { id: 'citadel-ascent-lift', json: 'Citadel Ascent Lift', display: "Pharloom's Crown: the lift", group: 'Main', where: "Cogwork Core (Centre)" },
    { id: 'citadel-ascent-silk-defeat', json: 'Citadel Ascent Silk Defeat', display: "Pharloom's Crown: the final battle", group: 'Main', where: "Cogwork Core (Centre)" },
    { id: 'extractor-blue', json: 'Extractor Blue', display: "Alchemist's Assistant", group: 'Gather', where: "Wormways: Wish from Alchemist Zylotol (accessed after talking to him twice)." },
    { id: 'save-city-merchant-bridge', json: 'Save City Merchant Bridge', display: 'The Lost Merchant', group: 'Wayfarer', where: "Songclave: On the Wishwall (appears after getting the Faydown Cloak and completing \"The Wandering Merchant\" and \"Strengthening Songclave\" wishes)." },
    { id: 'courier-delivery-pilgrims-rest', json: 'Courier Delivery Pilgrims Rest', display: "Pilgrim's Rest Supplies", group: 'Delivery', where: "Bellhart: Wish from Couriers Tipp & Pill (accessible after completing \"My Missing Courier\" and \"My Missing Brother\" wishes)." },
    { id: 'shakra-final-quest', json: 'Shakra Final Quest', display: "Trail's End", group: 'Wayfarer', where: "Any Wishwall (appears after purchasing all maps from Shakra)" },
    { id: 'soul-snare-pre', json: 'Soul Snare Pre', display: 'Silk and Soul', group: 'Collect', where: "Songclave: On the Wishwall (appears after defeating Lace, saving 25 Fleas and moving the caravan to Fleatopia, unlocking the Bellhome, completing all the available wishes, and talking to the Caretaker)." },
    { id: 'courier-delivery-songclave', json: 'Courier Delivery Songclave', display: 'Songclave Supplies', group: 'Delivery', where: "Bellhart: Wish from Couriers Tipp & Pill (accessible after completing \"My Missing Courier\" and \"My Missing Brother\" wishes)." },
    { id: 'soul-snare', json: 'Soul Snare', display: 'Soul Snare', group: 'Main', where: "The Cradle: Scale the Citadel and ensnare its monarch in a deadly trap (requires the completion of \"Silk and Soul\" wish)." },
    { id: 'song-knight', json: 'Song Knight', display: 'Final Audience', group: 'Wayfarer', where: "Songclave: On the Wishwall (appears after learning The Conductor's Melody, activating Second Sentinel (3 Cogheart Pieces), encountering a couple of Second Sentinel fight scenes in Choral Chambers)." },
    { id: 'wood-witch-curse', json: 'Wood Witch Curse', display: 'Rite of Rebirth', group: 'Wayfarer', where: "Shellwood: Wish from Greyroot (accessible after completing the \"Rite of the Pollip\" wish and giving Twisted Bud to them)." },
    { id: 'doctor-curse-cure', json: 'Doctor Curse Cure', display: 'Infestation Operation', group: 'Wayfarer', where: "Greymoor: Wish from Yarnaby (accessible after completing \"Rite of Rebirth\" wish)." },
    { id: 'silk-defeat-snare', json: 'Silk Defeat Snare', display: 'Pale Monarch', group: 'Main', where: "The Cradle: One of the endings." },
    { id: 'huntress-quest', json: 'Huntress Quest', display: 'Broodfeast', group: 'Hunt', where: "Putrified Ducts: Wish from Huntress / Runt (ACT 3)." },
    { id: 'black-thread-pt0', json: 'Black Thread Pt0', display: 'After the Fall', group: 'Main', where: "The Cradle: Discover the fate of Pharloom." },
    { id: 'black-thread-pt1-shamans', json: 'Black Thread Pt1 Shamans', display: 'Awaiting the End', group: 'Main', where: "Songclave: Confront the Caretaker and his family in the Ruined Chapel beside Bone Bottom." },
    { id: 'bellbeast-rescue', json: 'Bellbeast Rescue', display: 'Beast in the Bells', group: 'Main', where: "Grand Bellway: This is also accessible from any other Bellway." },
    { id: 'diving-bell-pt1-inspect', json: 'Diving Bell Pt1 Inspect', display: 'The Dark Below: inspect the diving bell', group: 'Main', where: "Bone Bottom (Ruined Chapel): Find aid in Deep Docks to access its diving bell and descend beneath Pharloom." },
    { id: 'diving-bell-pt2-ballow', json: 'Diving Bell Pt2 Ballow', display: 'The Dark Below: find Ballow', group: 'Main', where: "Bone Bottom (Ruined Chapel): Find aid in Deep Docks to access its diving bell and descend beneath Pharloom." },
    { id: 'diving-bell-pt3-descend', json: 'Diving Bell Pt3 Descend', display: 'The Dark Below', group: 'Main', where: "Bone Bottom (Ruined Chapel): Find aid in Deep Docks to access its diving bell and descend beneath Pharloom." },
    { id: 'black-thread-pt2-abyss', json: 'Black Thread Pt2 Abyss', display: 'The Dark Below: into the Abyss', group: 'Main', where: "Bone Bottom (Ruined Chapel): Find aid in Deep Docks to access its diving bell and descend beneath Pharloom." },
    { id: 'black-thread-pt3-escape', json: 'Black Thread Pt3 Escape', display: 'Return to Pharloom', group: 'Main', where: "The Abyss: Escape!" },
    { id: 'black-thread-pt4-return', json: 'Black Thread Pt4 Return', display: 'Spell Seeker', group: 'Main', where: "Bone Bottom (Ruined Chapel): Return to the Snail Shamans." },
    { id: 'black-thread-pt5-heart', json: 'Black Thread Pt5 Heart', display: 'The Old Hearts', group: 'Main', where: "Bone Bottom (Ruined Chapel): Complete the \"Heart of Might\", \"Heart of the Woods\", \"Heart of the Wild\" objectives." },
    { id: 'pinstress-battle-pre', json: 'Pinstress Battle Pre', display: 'Fatal Resolve (start)', group: 'Wayfarer', where: "Bellhart: On the Wishwall (appears after returning from The Abyss, or directly from a note left by Pinstress at her home in the Blasted Steps)." },
    { id: 'flea-games-pre', json: 'Flea Games Pre', display: 'Ecstasy of the End (start)', group: 'Wayfarer', where: "Bellhart: On the Wishwall (appears after finding all 30 Lost Fleas)." },
    { id: 'destroy-thread-cores', json: 'Destroy Thread Cores', display: 'Dark Hearts', group: 'Grand Hunt', target: 12, where: "Bellhart: On the Wishwall (appears after confronting the Caretaker and his family in the Ruined Chapel beside Bone Bottom)." },
    { id: 'flea-games', json: 'Flea Games', display: 'Ecstasy of the End', group: 'Wayfarer', where: "Bellhart: On the Wishwall (appears after finding all 30 Lost Fleas)." },
    { id: 'tormented-trobbio', json: 'Tormented Trobbio', display: 'Pain, Anguish, and Misery', group: 'Wayfarer', where: "Songclave: On the Wishwall (appears after obtaining Claw Mirror from Trobbio, and obtaining Silk Soar)." },
    { id: 'pinstress-battle', json: 'Pinstress Battle', display: 'Fatal Resolve', group: 'Wayfarer', where: "Bellhart: On the Wishwall (appears after returning from The Abyss, or directly from a note left by Pinstress at her home in the Blasted Steps)." },
    { id: 'garmond-black-threaded', json: 'Garmond Black Threaded', display: "Hero's Call", group: 'Wayfarer', where: "Bellhart: On the Wishwall (appears after encountering a couple of Garmond and Zaza fight scenes in ACT 3)." },
    { id: 'black-thread-pt6-flower', json: 'Black Thread Pt6 Flower', display: 'The Old Hearts: the Everbloom', group: 'Main', where: "Bone Bottom (Ruined Chapel): Complete the \"Heart of Might\", \"Heart of the Woods\", \"Heart of the Wild\" objectives." },
    { id: 'extractor-blue-worms', json: 'Extractor Blue Worms', display: 'Advanced Alchemy', group: 'Gather', where: "Wormways: Wish from Alchemist Zylotol (accessed in ACT 3, provided that \"Alchemist's Assistant\" wish is completed)." },
    { id: 'sprintmaster-pre', json: 'Sprintmaster Pre', display: 'Fastest in Pharloom (start)', group: 'Sprint', where: "Far Fields: Wish from Sprintmaster Swift." },
    { id: 'sprintmaster-race', json: 'Sprintmaster Race', display: 'Fastest in Pharloom', group: 'Sprint', where: "Far Fields: Wish from Sprintmaster Swift." },
    { id: 'ant-trapper', json: 'Ant Trapper', display: 'The Hidden Hunter', group: 'Grand Hunt', where: "Bellhart: On the Wishwall (appears after obtaining the Silk Soar ability and meeting Skarrsinger Karmelita in Far Fields)." },
    { id: 'mr-mushroom', json: 'Mr Mushroom', display: 'Passing of the Age', group: 'Witness', where: "Putrified Ducts (Pale Lake): Interact with the riddle tablet." },
];
