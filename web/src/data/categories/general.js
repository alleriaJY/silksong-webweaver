/**
 * General tab: game info, max stats with icons, the in-game Save Slot Banner
 * profile card, and the game's own completion percentage (also shown on the
 * Unlockables tab).
 */
import { parseSimpleFields, field } from './common.js';
import { formatPlayTime, formatNumber } from '../../core/format.js';
import { iconUrl } from '../../core/icons.js';
import { setStat, setText, renderEmpty } from '../../ui/renderers.js';

const BELLHOME_COLOURS = {
    1: 'Area_Art__0014_Bellhome_red.png',
    2: 'Area_Art__0014_Bellhome_blue.png',
    3: 'Area_Art__0014_Bellhome_white.png',
    4: 'Area_Art__0014_Bellhome_black.png',
    5: 'Area_Art__0014_Bellhome_bronze.png',
    6: 'Area_Art__0014_Bellhome_chrome.png',
};

const AREA_BANNERS = {
    ABYSS: { title: 'THE ABYSS', art: () => 'Area_Art__0001_Abyss.png' },
    AQUEDUCT: { title: 'PUTRIFIED DUCTS', art: () => 'Area_Art__0001_Aqueduct.png' },
    ARBORIUM: { title: 'MEMORIUM', art: () => 'Area_Art_Arborium.png' },
    ASPID: { title: 'MOSS GROTTO', art: () => 'Area_Art_Aspid.png' },
    BELLHART: { title: 'BELLHART', art: ({ blackThread }) => (blackThread ? 'Area_Art__0014_Bellhart_broken.png' : 'Area_Art__0014_Bellhart.png') },
    BELLHART_HAUNTED: { title: 'BELLHART', art: () => 'Area_Art__0014_Bellhart_Haunted.png' },
    BELLHOME: { title: 'BELLHOME', art: ({ houseColour }) => BELLHOME_COLOURS[houseColour] || 'Area_Art__0014_Bellhome.png' },
    BELLSHRINE: { title: 'BELLSHRINE', art: () => 'Area_Art__0008_Bellshrine.png' },
    BELLVEIN: { title: 'BELLVEIN', art: () => 'Area_Art_Bellvein.png' },
    BONEBOTTOM: { title: 'BONE BOTTOM', art: ({ blackThread }) => (blackThread ? 'Area_Art__0013_Bonebottom_Broken.png' : 'Area_Art__0013_Bonebottom.png') },
    BONECHURCH: { title: 'CHAPEL OF THE WANDERER', art: () => 'Area_Art__0012_Bonechurch.png' },
    BONEFOREST: { title: 'THE MARROW', art: () => 'Area_Art__0009_Boneforest.png' },
    BONEGRAVE: { title: 'BONEGRAVE', art: () => 'Area_Art__0003__Bonegrave.png' },
    BORDER_CAVES: { title: 'BORDER CAVES', art: () => 'Area_Art__0001_Border_Caves.png' },
    CITADEL_STATION: { title: 'GRAND BELLWAY', art: ({ blackThread }) => (blackThread ? 'Area_Art__0001_Citadel_station_act_3.png' : 'Area_Art__0001_Citadel_station.png') },
    CITY_OF_SONG: { title: 'CHORAL CHAMBERS', art: ({ blackThread }) => (blackThread ? 'Area_Art__0004_City-of-Song_act_3.png' : 'Area_Art__0004_City-of-Song.png') },
    CLOVER: { title: 'VERDANIA', art: () => 'Area_Art__0001_Clover.png' },
    COG_CORE: { title: 'COGWORK CORE', art: ({ blackThread }) => (blackThread ? 'Area_Art_Cog_Core_Act3.png' : 'Area_Art_Cog_Core.png') },
    CORAL_CAVERNS: { title: 'SANDS OF KARAK', art: () => 'Area_Art__0001_Coral_Caverns.png' },
    CORAL_GORGE: { title: 'BLASTED STEPS', art: () => 'Area_Art__0005_Coral-Gorge.png' },
    CORAL_TOWER: { title: 'CORAL TOWER', art: () => 'Area_Art__0001_Coral_Tower.png' },
    CRADLE: { title: 'THE CRADLE', art: ({ blackThread }) => (blackThread ? 'Area_Art__0001_Cradle_Destroyed_Infected.png' : 'Area_Art__0001_Cradle_Destroyed.png') },
    CRADLE_DESTROYED: { title: 'THE CRADLE', art: ({ blackThread }) => (blackThread ? 'Area_Art__0001_Cradle_Destroyed_Infected.png' : 'Area_Art__0001_Cradle_Destroyed.png') },
    CRAWL: { title: 'WORMWAYS', art: () => 'Area_Art__0001_Crawl.png' },
    DOCKS: { title: 'DEEP DOCKS', art: () => 'Area_Art__0008_Docks.png' },
    DUSTPENS: { title: "SINNER'S ROAD", art: () => 'Area_Art_Dustpens.png' },
    ENCLAVE: { title: 'SONGCLAVE', art: ({ blackThread }) => (blackThread ? 'Area_Art__0001_Enclave_Act_3.png' : 'Area_Art__0001_Enclave.png') },
    ENCLAVE_BELLSHRINE: { title: 'FIRST SHRINE', art: () => 'Area_Art__0008_Enclave_Bellshrine.png' },
    FLEATOPIA: { title: 'FLEATOPIA', art: () => 'Area_Art__0001_Fleatopia.png' },
    FLEA_FESTIVAL: { title: 'FLEA FESTIVAL', art: () => 'Area_Art__0001_Flea_Festival.png' },
    GRAND_GATE: { title: 'GRAND GATE', art: () => 'Area_Art__GrandGate.png' },
    GRANDGATE: { title: 'GRAND GATE', art: () => 'Area_Art__GrandGate.png' },
    GREYMOOR: { title: 'GREYMOOR', art: () => 'Area_Art__0007_Greymoor.png' },
    HALFWAY: { title: 'HALFWAY HOME', art: () => 'Area_Art_Halfway.png' },
    HANG: { title: 'HIGH HALLS', art: () => 'Area_Art_Hang.png' },
    HUNTERS_NEST: { title: "HUNTER'S MARCH", art: () => 'Area_Art__0002_Hunters_Nest.png' },
    LIBRARY: { title: 'WHISPERING VAULTS', art: () => 'Area_Art__0002_Library.png' },
    MEMORY: { title: 'MEMORY', art: () => 'Area_Art__0001_Memory.png' },
    MOSSCAVE: { title: 'MOSS GROTTO', art: () => 'Area_Art__0011_Mosscave.png' },
    MOSSTOWN: { title: 'MOSSHOME', art: () => 'Area_Art__0010_Mosstown.png' },
    ORGAN: { title: 'EXHAUST ORGAN', art: () => 'Area_Art__0001_Organ.png' },
    PEAK: { title: 'MOUNT FAY', art: () => 'Area_Art_Peak.png' },
    PILGRIMS_REST: { title: "PILGRIM'S REST", art: ({ blackThread }) => (blackThread ? 'Area_Art_Pilgrims_Rest_act3.png' : 'Area_Art_Pilgrims_Rest.png') },
    PINSTRESS: { title: 'PINSTRESS', art: () => 'Area_Art__0003_Pinstress.png' },
    RED_MEMORY: { title: 'RED MEMORY', art: () => 'Area_Art__0001_RedMemory.png' },
    REDMEMORY: { title: 'RED MEMORY', art: () => 'Area_Art__0001_RedMemory.png' },
    SCORCHLANDS: { title: 'FAR FIELDS', art: () => 'Area_Art__0001_Scorchlands.png' },
    SEAMSTRESS: { title: 'SEAMSTRESS', art: () => 'Area_Art__0003_Seamstress.png' },
    SHELLWOOD: { title: 'SHELLWOOD', art: () => 'Area_Art__0006_Shellwood.png' },
    SLAB_CELL: { title: 'THE SLAB', art: () => 'Area_Art_Slab_Cell.png' },
    SPRINTMASTER_CAVE: { title: 'FAR FIELDS', art: () => 'Area_Art__0001_Sprintmaster_Cave.png' },
    SWAMP: { title: 'BILEWATER', art: () => 'Area_Art__0001_Swamp.png' },
    THE_SLAB: { title: 'THE SLAB', art: () => 'Area_Art__0003_The-Slab.png' },
    TUBE_HUB: { title: 'TERMINUS', art: ({ blackThread }) => (blackThread ? 'Area_Art_Tube_Hub_act3.png' : 'Area_Art_Tube_Hub.png') },
    UNDERSTORE: { title: 'UNDERWORKS', art: () => 'Area_Art_Understore.png' },
    WARD: { title: 'WHITEWARD', art: () => 'Area_Art__Ward.png' },
    WEAVER_SHRINE: { title: 'WEAVENEST ATLA', art: () => 'Area_Art__0005_Weaver_Shrine.png' },
    WISP: { title: 'WISP THICKET', art: () => 'Area_Art__0001_Wisp.png' },
};

export function resolveSaveBanner(playerData = {}) {
    const rawArea = String(playerData.currentArea || 'MOSSCAVE').toUpperCase();
    const blackThread = !!playerData.blackThreadWorld;
    const houseColour = Number(playerData.BelltownHouseColour) || 0;
    const entry = AREA_BANNERS[rawArea] || AREA_BANNERS.MOSSCAVE;
    const title = AREA_BANNERS[rawArea] ? entry.title : rawArea.replace(/_/g, ' ');
    return {
        areaKey: rawArea,
        title,
        artFile: entry.art({ blackThread, houseColour }),
        blackThread,
    };
}

function renderIconRow(container, count, file, alt, emptyText = 'None') {
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const img = document.createElement('img');
        img.src = iconUrl('general', file);
        img.alt = alt;
        img.title = `${alt} ${i + 1}`;
        container.appendChild(img);
    }
    if (count === 0 && emptyText) renderEmpty(container, emptyText);
}

function resolveSlotLabel(playerData) {
    const fileName = document.getElementById('file-name')?.textContent || '';
    const match = fileName.match(/user([1-4])\.dat/i);
    if (match) return `${match[1]}.`;
    const profileId = Number(playerData?.profileID);
    if (profileId >= 1 && profileId <= 4) return `${profileId}.`;
    return '1.';
}

function renderSaveSlotBanner(ctx, { maxHealth, silkMax, silkHearts, playTimeText }) {
    const raw = ctx.parsed.raw || {};
    const banner = resolveSaveBanner(raw);

    const artImg = document.getElementById('save-banner-art');
    if (artImg) {
        artImg.src = iconUrl('saveart', banner.artFile);
        artImg.alt = banner.title;
    }

    const overlayImg = document.getElementById('save-banner-black-thread');
    if (overlayImg) {
        overlayImg.src = iconUrl('saveart', 'Area_Art_Black_Thread_Overlay.png');
        overlayImg.hidden = !banner.blackThread;
    }

    const equipped = ctx.parsed.crests?.equippedCrest;
    const crestFile = (ctx.isSteelSoul && equipped?.iconSteelSoul)
        ? equipped.iconSteelSoul
        : (equipped?.icon || (ctx.isSteelSoul ? 'Select_Game_Crest_Spools__0000_hunter_SS.png' : 'Select_Game_Crest_Spools__0000_hunter.png'));
    const crestImg = document.getElementById('save-banner-crest');
    if (crestImg) {
        crestImg.src = iconUrl('crest', crestFile);
        crestImg.alt = equipped?.display || 'Hunter';
    }

    renderIconRow(document.getElementById('save-banner-masks'), Math.min(Math.max(0, maxHealth), 10), 'general_hp.png', 'Mask', '');
    renderIconRow(document.getElementById('save-banner-silkhearts'), Math.min(Math.max(0, silkHearts), 3), 'general_silkheart.png', 'Silk Heart', '');

    const spoolFill = document.getElementById('save-banner-spool-fill');
    if (spoolFill) {
        const clampedSilk = Math.min(Math.max(0, silkMax || 9), 18);
        spoolFill.style.width = `${Math.round((clampedSilk / 18) * 100)}%`;
    }

    const geo = field(ctx.parsed, 'current', 'geo');
    const shards = field(ctx.parsed, 'current', 'ShellShards');
    setText('save-banner-geo', geo !== undefined ? formatNumber(geo) : '0');
    setText('save-banner-shards', shards !== undefined ? formatNumber(shards) : '0');

    setText('save-banner-slot', resolveSlotLabel(raw));
    setText('save-banner-area', banner.title);
    const completion = field(ctx.parsed, 'general', 'completionPercentage');
    setText('save-banner-completion', completion !== undefined ? `${Math.round(completion)}%` : '0%');
    setText('save-banner-playtime', playTimeText);
}

export default {
    id: 'general',
    parse: (save, ctx) => parseSimpleFields(save.playerData, ctx.lists('generalFields')),

    render(result, ctx) {
        const get = name => field(ctx.parsed, 'general', name);

        setStat('version', get('version') || 'Unknown');
        setStat('permadeath', get('permadeathMode') ? 'Steel Soul' : 'Classic');
        const completion = get('completionPercentage');
        const completionText = completion !== undefined ? `${completion.toFixed(1)}%` : '0%';
        setStat('completion', completionText);
        const playTime = get('playTime');
        const playTimeText = playTime ? formatPlayTime(playTime) : '00h 00m 00s';
        setStat('playTime', playTimeText);

        const maxHealth = get('maxHealth') || 0;
        const silkMax = get('silkMax') || 0;
        const silkHearts = get('silkRegenMax') || 0;
        setStat('maxHealth', maxHealth);
        setStat('maxSilk', get('silkMax'));
        setStat('silkHearts', silkHearts);

        renderIconRow(document.getElementById('health-icons'), Math.min(Math.max(0, maxHealth), 10), 'general_hp.png', 'Health');
        renderIconRow(document.getElementById('silkheart-icons'), Math.min(Math.max(0, silkHearts), 3), 'general_silkheart.png', 'Silk Heart');
        renderSaveSlotBanner(ctx, { maxHealth, silkMax, silkHearts, playTimeText });

        // Unlockables tab summary: the game's overall completion (covers every
        // category, not only that tab's)
        setText('unlockables-completion-percent', completionText);
    },
};
