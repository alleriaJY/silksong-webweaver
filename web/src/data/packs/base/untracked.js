/**
 * playerData booleans we deliberately do NOT show, grouped by pattern with the
 * reason. tools/unknown_keys.py (and the Phase 5 dev panel) report keys that
 * match none of these AND are not referenced by any list as "unexplained";
 * that remainder is where new content and missed items show up.
 *
 * Patterns are applied only to keys no list references, so an over-broad
 * pattern can never hide a tracked flag. Keep each pattern Python- and
 * JavaScript-compatible (plain `re` / RegExp syntax, no flags).
 * Entry: { id, pattern, reason }
 */

export const UNTRACKED = [
    { id: 'npc-met', pattern: '^(Met|met)[A-Z]', reason: 'first meeting with an NPC' },
    { id: 'npc-dialogue', pattern: '(Convo|Dlg|Spoke|Spoken|Talked|Offered|Mentioned|Heard|Asked|Greet|Queued|Intro(duced)?|Remeet)', reason: 'NPC dialogue state' },
    {
        id: 'npc-state',
        pattern: '^(Architect|Ballow|Belltown|BlueAssistant|BlueScientist|BoneBottom|Bonebottom|Caravan|Caretaker|caretaker|ChurchKeeper|churchKeeper|Crest|CrowCourt|Dust|ForgeDaughter|Gourmand|Halfway|Huntress|Librarian|Mapper|mapper|MaskMaker|Pinsmith|pinstress|Pinstress|Seamstress|Shakra|SnailShamans|SprintMaster|SteelSentinel|Troupe|WoodWitch|cityMerchant|enclave|garmond|gilly|grindle|grubFarmer|nuu|pilby|pilgrim|sherma|seth|Seth|druid|fixer|lace|songChevalier|mort|Mottled|Deskplaced|DeskPlaced|FreedCaravan|GivenLibrarian|LastDive|Mushroom|ShopkeeperQuest|PilgrimStomper|pilgrimRest|pilgrims|Pilgrims|Fisher|Green|grishkin|gatePilgrim|dicePilgrim|marionettes|slabCaptor|slabPrisoner|scholar|antQueen|antMerchant|savedGrindle|savedPlinney|sawPlinney|learnedPilby|seenPilby|seenPebb|SeenMort|SeenAntMerchant|SeenArchitect|SeenGrindle|SeenHalfway|SeenMapper|seenMapper|SeenBoneBottom|SeenCaravan|SeenMelody|SeenFlea|SeenDivingBell|roachkeeper|swampMuckman|vampireGnat|Vampire|allowVampire|tormentedTrobbio|trobbio|spinner|Spinner|splinterQueen|coralKing|flowerQueen|skullKing|killedRoosting|rhino|church|bonetownPilgrim|bonegrave|thieves|rosaryThieves|shamanRitual|ShamanRitual|hunterInfestation|Huntress|sethLeft|uncaged|SethJoined|TroupeHunter|Curse|gainedCurse|MelodyLift|UnlockedMelodyLift|HasBoundCrestUpgrader|HasMelody|LibrarianCollection|HuntressRunt|littleCrabs|tinyBroodMother|bellCentipede|collectorEggs|lavaSpitters|pilgrimFisher|summonedLakeOrbs|FisherWalker|laceCorpse|garmondFinal|shellGrave)',
        reason: 'NPC / quest progression state (quests are shown on the Quests tab)',
    },
    { id: 'tutorial-prompts', pattern: '^(HasSeen|Seen|seen)[A-Z]|Prompt$|PaneHasNew$|HasNew$|^(show[A-Z]|promptFocus|bindCutscenePlayed|queuedGodfinderIcon|IsPinGallerySetup)', reason: 'tutorial prompt / UI hint already shown' },
    { id: 'first-encounter', pattern: '^(encountered|Encountered)[A-Z]', reason: 'first encounter with a boss or NPC (defeats are tracked)' },
    { id: 'area-visited', pattern: '^(visited|entered|Entered|previouslyVisited|fullyEntered)[A-Z_]', reason: 'area first-visit (candidate for a future Visited Areas section)' },
    {
        id: 'world-state',
        pattern: '(oneWay|oneway|OneWay|[Ss]hortcut|Wall|[Gg]ate|[Dd]oor|^opened|^Opened|[Pp]lat|Trapdoor|[Bb]attle|[Cc]leared|[Rr]eturned|[Rr]eturn|[Aa]mbush|Bridge|Lift|Floor|Rubbish|Geyser|Updraft|[Ee]xplode|^broke|^Broke|CavedIn|Chest|Emerge|Sprout|Invade|Awake|Appeared|Arrives|Destroyed|[Dd]estroyed|Repair|Mended|Fixed|Constructed|Burned|Burn|Released|Cage|Cannon|Machine|automaton|Statue|statue|QuestBoard|Funeral|Addition_|Crowds|Populated|Stationed|Corpse|Possessed|Killed$|Defeated_|Dead$|bankOpened|BonePlazaOpened|droppedFloor|Rock$|Heart(Appeared)?$|Toggle|InSession|Sauna|Furnishing|Paint|HouseUnlocked|Installed|Inside|Scared|Left$|Gone$|CanVisit|CanLeave|CanReturn|WillLeave|Moved|Visiting|Resting|Sitting|Cooldown|TimePassed|Lurking|Home$|Away$|InBank|InUnder|Hatch|Woken|woken|Woke|woke|Revived|Sing$|Ready$|Available$|CanStart|Started|Ended|Hit$|played$|Played|Added$|Collected$|_Seen$|_Left$|Seen$)',
        reason: 'room / world state (doors, shortcuts, arena battles, NPC positions)',
    },
    { id: 'story-acts', pattern: '^(act2|act3|act3_|citadel|Citadel|blackThread|betaEnd|crash|wardWoken|wardBoss|libraryStatue|completedMemory_|chapelClosed_|completedAbyssAscent|completedSuperJumpSequence|completedTutorial|completedLavaChallenge|completedWeave|CompletedWeave|promisedFirstWish|leftTheGrandForum|SatAtBench|spinnerDefeated)', reason: 'story / act progression (the completion model and quests cover the outcome)' },
    { id: 'meta-debug', pattern: '^(bossRushMode|infiniteAirJump|isInvincible|isFirstGame|hasKilled|mapAllRooms|newDat|openingCreditsPlayed|muchTimePassed|LightningToolToggle|HasStoredMemoryState|IsSilkSpoolBroken|hasMarker|hasGodfinder|hasJournal|hasQuill|hasSilkSpecial|hasNeedolinMemoryPowerup|mapUpdateQueued|DeclinedBartender|WasIn|tookRestroom|unlockedNewBossStatue|UnlockedFastTravel|UnlockedFastTravelTeleport|UnlockedDustCage|UnlockedExtra(Blue|Yellow)Slot|ConstructedFarsight|ConstructedMaterium|InvNailHasNew|didPilgrimIntroScene|didRhinoRuckus|creaturesReturned|coralBridgeGuard|coralDrillerSolo|docksBomberAmbush|gotPastDockSpearThrower|boneEastJailer|greymoor05_|roofCrab|rockRollerDefeated_|shellwood|slab_|slabFly|song05|songGolem|destroyedSongGolem|cog7_|coral19_|dust0|under07_|understoreLift|greatBoneGate|lavaChallenge|library_14|libraryRoof|arborium_|aspid|ant0|ant2|ant21|antBench|basementAnt|belltownBasement|bone0|bone03|boneEast07|bone01|mosstown0|peak0|peak1|hang_|hang04|weave0|crawl0|wisp0|docks_02|splinterQueenSprout|explodeWall|shermaCitadel|cauldronShortcut|openedCauldron|marionettesMet)', reason: 'debug / meta / engine flags and per-room scripting' },
    { id: 'map-ui', pattern: '^(hasPin(Cocoon|Flea|Shop|Spa)|bellShrine|mapUpdate|act3MapUpdated|HasSeenMap)', reason: 'map pins and bell shrine markers (candidates for the map page)' },
    { id: 'keys-items', pattern: '^(HasSlabKey|Collected\\w*Key|collected\\w*Key|Purchased\\w*Key|purchased\\w*Key|MerchantEnclave(SimpleKey|WardKey|Socket)|BallowGivenKey|PurchasedBonebottomFaithToken|CollectedCommonSpine|CollectedToolMetal|ForgeDaughterSpentToolMetal|CollectedDockDemoKey|gotPickledRoachEgg|broodMotherEyeCollected|GotGourmandReward|MottledChildGivenTool|WoodWitchGaveMandrake|OpenedCrowSummonsDoor|hitCrowCourtSwitch|CrawbellCrawsInside)', reason: 'keys and quest items (the Inventory section shows held items)' },
    { id: 'collection-substeps', pattern: '(AspidBerry|memoryOrbs_|farmer_grub|MushroomQuestFound|GourmandGiven|PinGallery|fleaGames_|FleaGames|Flea(Quest|Caravan|topia)|SprintMaster|silkFarm|farmer_)', reason: 'quest / collection sub-steps (the quest itself is on the Quests tab)' },
    { id: 'unused-shop', pattern: '^(PurchasedBelltownShellFragment|PurchasedBelltownToolPouch|PurchasedArchitectKey|purchasedGrindleSimpleKey|BoneBottomShellFrag1|purchasedGrindleMemoryLocket)$', reason: 'shop purchase not yet tied to a list (see ROADMAP Appendix A leads)' },
];
