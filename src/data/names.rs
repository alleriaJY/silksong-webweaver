use std::collections::HashMap;
use once_cell::sync::Lazy;

pub static NEEDLE_NAMES: Lazy<HashMap<&'static str, &'static str>> = Lazy::new(|| {
    HashMap::from([
        ("1"   , "Sharpened Needle"),
        ("2"   , "Shining Needle"),
        ("3"   , "Hivesteel Needle"),
        ("4"   , "Pale Steel Needle"),
    ])
});

pub static SKILL_NAMES: Lazy<HashMap<&'static str, &'static str>> = Lazy::new(|| {
    HashMap::from([
        ("hasNeedleThrow"   , "Silkspear"),
        ("hasThreadSphere"  , "Thread Storm"),
        ("hasParry"         , "Cross Stitch"),
        ("hasSilkCharge"    , "Shaprdart"),
        ("hasSilkBomb"      , "Rune Rage"),
        ("hasSilkBossNeedle", "Pale Nails"),
    ])
});

pub static MAP_NAMES: Lazy<HashMap<&'static str, &'static str>> = Lazy::new(|| {
    HashMap::from([
        ("HasMossGrottoMap"   , "Moss Grotto"),
        ("HasBoneforestMap"   , "The Marrow"),
        ("HasDocksMap"        , "Deep Docks"),
        ("HasWildsMap"        , "Far Fields"),
        ("HasGreymoorMap"     , "Greymoor"),
        ("HasBellhartMap"     , "Bellhart"),
        ("HasShellwoodMap"    , "Shellwood"),
        ("HasHuntersNestMap"  , "Hunter's March"),
        ("HasJudgeStepsMap"   , "Blasted Steps"),
        ("HasPeakMap"         , "Mount Fay"),
        ("HasSlabMap"         , "The Slab"),
        ("HasSwampMap"        , "Bilewater"),
        ("HasAqueductMap"     , "Putrified Ducts"),
        ("HasCoralMap"        , "Sands of Karak"),
        ("HasWeavehomeMap"    , "Weavernest Atla"),
        ("HasCrawlMap"        , "Wormways"),
        ("HasDustpensMap"     , "Sinner's Road"),
        ("HasSongGateMap"           , "Citadel - Grand Gate"),
        ("HasCitadelUnderstoreMap"  , "Citadel - Underworks"),
        ("HasCogMap"                , "Citadel - Cogwork Core"),
        ("HasArboriumMap"           , "Citadel - Memorium"),
        ("HasWardMap"               , "Citadel - Whiteward"),
        ("HasLibraryMap"            , "Citadel - Whispering Vault"),
        ("HasHallsMap"              , "Citadel - Choral Chambers"),
        ("HasHangMap"               , "Citadel - High Halls"),
        ("HasCradleMap"             , "The Cradle"),
        ("HasAbyssMap"              , "The Abyss"),
        ("HasCloverMap"             , "Verdania"),
        // No Wisp Thicket
    ])
});

pub static FLEA_NAMES: Lazy<HashMap<&'static str, &'static str>> = Lazy::new(|| {
    HashMap::from([
        
        ("SavedFlea_Ant_03"   , ""),
        ("SavedFlea_Belltown_04"   , ""),
        ("SavedFlea_Bone_06"   , ""),
        ("SavedFlea_Bone_East_05"   , ""),
        ("SavedFlea_Bone_East_10_Church"   , ""),
        ("SavedFlea_Bone_East_17b"   , ""),
        ("SavedFlea_Coral_24"   , ""),
        ("SavedFlea_Coral_35"   , ""),
        ("SavedFlea_Crawl_06"   , ""),
        ("SavedFlea_Dock_03d"   , ""),
        ("SavedFlea_Dock_16"   , ""),
        ("SavedFlea_Dust_09"   , ""),
        ("SavedFlea_Dust_12"   , ""),
        ("SavedFlea_Greymoor_06"   , ""),
        ("SavedFlea_Greymoor_15b"   , ""),
        ("SavedFlea_Library_01"   , ""),
        ("SavedFlea_Library_09"   , ""),
        ("SavedFlea_Peak_05c"   , ""),
        ("SavedFlea_Shadow_10"   , ""),
        ("SavedFlea_Shadow_28"   , ""),
        ("SavedFlea_Shellwood_03"   , ""),
        ("SavedFlea_Slab_06"   , ""),
        ("SavedFlea_Slab_Cell"   , ""),
        ("SavedFlea_Song_11"   , ""),
        ("SavedFlea_Song_14"   , ""),
        ("SavedFlea_Under_21"   , ""),
        ("SavedFlea_Under_23"   , ""),
        //CaravanLechSaved?
        ("CaravanLechReturnedToCaravan"   , "Kratt"),
        ("tamedGiantFlea"   , "Huge Flea"),
        ("MetTroupeHunterWild"   , "Vog"),
    ])
});

pub static TOOL_NAMES: Lazy<HashMap<&'static str, &'static str>> = Lazy::new(|| {
    HashMap::from([
        // Red Tools
        ("Straight Pin"         , ""),
        ("Tri Pin"              , ""),
        ("Sting Shard"          , ""),
        ("Curve Claws"          , ""),
        ("Curve Claws Upgraded" , ""),
        ("Harpoon"              , ""),
        ("Tack"                 , ""),
        ("Shakra Ring"          , ""),
        ("Pimpilo"              , ""),
        ("WebShot Forge"        , ""),
        ("WebShot Architect"    , ""),
        ("WebShot Weaver"       , ""),
        ("Conch Drill"          , ""),
        ("Screw Attack"         , ""),
        ("Cogwork Saw"          , ""),
        ("Silk Snare"           , ""),
        ("Flintstone"           , ""),
        ("Cogwork Flier"        , ""),
        ("Extractor"            , ""),
        ("Flea Brew"            , ""),
        ("Lifeblood Syringe"    , ""),
        ("Lightning Rod"        , ""),
        ("Rosary Cannon"        , ""),

        // Blue Tools
        ("Mosscreep Tool 1"     , ""),
        ("Mosscreep Tool 2"     , ""),
        ("Lava Charm"           , ""),
        ("Fractured Mask"       , ""),
        ("Poison Pouch"         , ""),
        ("Bell Bind"            , ""),
        ("Multibind"            , ""),
        ("White Ring"           , ""),
        ("Brolly Spike"         , ""),
        ("Reserve Bind"         , ""),
        ("Spool Extender"       , ""),
        ("Quickbind"            , ""),
        ("Dazzle Bind"          , ""),
        ("Dazzle Bind Upgraded" , ""),
        ("Revenge Crystal"      , ""),
        ("Quick Sling"          , ""),
        ("Zap Imbuement"        , ""),
        ("Thief Claw"           , ""),
        ("Maggot Charm"         , ""),
        ("Longneedle"           , ""),
        ("Wisp Lantern"         , ""),
        ("Pinstress Tool"       , ""),
        ("Flea Charm"           , ""),

        // Yellow Tools
        ("Compass"              , ""),
        ("Bone Necklace"        , ""),
        ("Rosary Magnet"        , ""),
        ("Dead Mans Purse"      , ""),
        ("Barbed Wire"          , ""),
        ("Weighted Anklet"      , ""),
        ("Magnetite Dice"       , ""),
        ("Scuttlebrace"         , ""),
        ("Sprintmaster"         , ""),
        ("Musician Charm"       , ""),
        ("Wallcling"            , ""),
        ("Thief Charm"          , ""),
        ("Shell Satchel"        , "Shell Satchel"),

        // Apparently Silk Skills are here too. 
        ("Silk Spear"           , "Silkspear"),
        ("Thread Sphere"        , "Thread Storm"),
        ("Parry"                , "Cross Stitch"),        
        ("Silk Charge"          , "Sharpdart"),
        ("Silk Bomb"            , "Rune Rage"),
        ("Silk Boss Needle"     , "Pale Nails"),
    ])
});



pub static BOSS_NAMES: Lazy<HashMap<&'static str, &'static str>> = Lazy::new(|| {
    HashMap::from([
        ("defeatedMossMother"       , "Moss Mother"),
        ("defeatedBellBeast"        , "Bell Beast"),
        ("defeatedLace1"            , "Lace 1 (Deep Docks)"),
        ("defeatedSongGolem"        , "Fourth Chorus"),
        ("defeatedVampireGnatBoss"  , "Moorwing"),
        ("defeatedSplinterQueen"    , "Sister Splinter"),
        //skullKingDefeatedBlackThreaded?
        ("skullKingDefeated"        , "Skull Tyrant 1"),
        ("skullKingKilled"          , "Skull Tyrant 2"),
        ("defeatedCoralDrillers"    , "Great Conchflies"),
        //(""                       , "Moss Mother 2 (Weavenest Atla)"),
        // Widow To Be confirmed 
        //("spinnerDefeated", "Widow"), 
        ("defeatedPhantom"          , "Phantom"),
        ("defeatedLastJudge"        , "The Last Judge"),
        ("defeatedBoneFlyerGiant"   , "Savage Beastfly 1"),
        ("defeatedBoneFlyerGiantGolemScene", "Savage Beastfly 2"),
        ("defeatedCogworkDancers"   , "Cogwork Dancers"),
        ("defeatedTrobbio"          , "Trobbio"),
        ("defeatedSongChevalierBoss", "Second Sentinel"),
        ("defeatedFirstWeaver"      , "First Sinner"),
        ("defeatedRoachkeeperChef"  , "Disgraced Chef Lugoli"),
        ("defeatedBroodMother"      , "Broodmother"),
        ("defeatedWispPyreEffigy"   , "Father of the Flame"),
        ("defeatedCoralDrillerSolo" , "Raging Conchfly"),
        ("defeatedDockForemen"      , "Forebrothers Signis & Gron"),
        ("wardBossDefeated", "The Unravelled"),
        ("DefeatedSwampShaman", "Groal the Great"),
        ("defeatedZapCoreEnemy", "Voltvyrm"),
        // ("", "Garmond and Zaza"),
        // Shakra?
        // GMS
        //("roofCrabDefeated", "The Craggler"),
        ("defeatedLaceTower", "Lace 2 (The Cradle)"),
        // Bell Eater?
        //("defeatedMossEvolver", "Lost Moss Mother? Act 3"),
        // journal? ("defeatedCrowCourt", "Crawfather"),
        // ("", "Plasmified Zango"),
        // ("", "Watcher at the Edge"), defeatedGreyWarrior?
        ("garmondBlackThreadDefeated", "Lost Garmond"),
        ("defeatedAntTrapper", "Gurr the Outcast"),
        ("PinstressPeakBattleAccepted", "Pinstress"),
        ("defeatedTormentedTrobbio", "Tormented Trobbio"),
        ("defeatedWhiteCloverstag", "Palestag"),
        ("defeatedAntQueen", "Skarrsinger Karmelita"),
        ("defeatedCoralKing", "Crust King Khann"),
        ("defeatedSeth", "Seth"),
        ("defeatedFlowerQueen", "Nyleth"),
        ("defeatedCloverDancers", "Clover Dancers"),
        //journal: ("", "Lost Lace"),
        ("Abyss Mass", "Summoned Saviour"),
    ])
});

