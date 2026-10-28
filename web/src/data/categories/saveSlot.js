/**
 * General tab: the save as the game's profile screen shows it. Crest, masks,
 * silk spool, rosaries and shell shards, completion, play time, slot number
 * and area, over a game scene in a thorned frame. Nothing new is parsed; it
 * reads the other categories' results (render ctx.parsed) and the file name
 * (user1.dat -> slot 1).
 */
import { field } from './common.js';
import { crestFile } from './crests.js';
import { formatNumber } from '../../core/format.js';
import { iconUrl } from '../../core/icons.js';

/** 59400 s -> '16h 30m', as on the profile screen (no seconds). */
export function slotPlayTime(seconds) {
    const minutes = Math.floor(Math.max(0, seconds || 0) / 60);
    return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
}

/** 'user3.dat' -> 3; anything else -> null. */
export function slotNumber(fileName) {
    const m = /user(\d+)\.dat$/i.exec(fileName || '');
    return m ? Number(m[1]) : null;
}

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function icon(kind, file, className) {
    const img = el('img', className);
    img.src = iconUrl(kind, file);
    img.alt = '';
    return img;
}

export default {
    id: 'saveSlot',
    parse: () => ({}),

    render(result, ctx) {
        const root = document.getElementById('save-slot');
        if (!root) return;
        const { parsed } = ctx;
        const general = name => field(parsed, 'general', name);
        const loaded = general('version') !== undefined;
        root.replaceChildren();
        root.classList.toggle('steel-soul', !!ctx.isSteelSoul);
        root.classList.toggle('empty', !loaded);
        if (!loaded) {
            root.append(el('p', 'slot-empty', 'Empty slot'));
            root.setAttribute('aria-label', 'Save slot: no save loaded');
            return;
        }

        const maxHealth = general('maxHealth') || 0;
        const maxSilk = general('silkMax') || 0;
        const crest = parsed.crests?.equippedCrest;
        const area = field(parsed, 'current', 'areaName') || '';
        const completion = general('completionPercentage') || 0;
        const time = slotPlayTime(general('playTime'));
        const slot = slotNumber(parsed.fileName);

        const top = el('div', 'slot-top');
        top.append(icon('crest', crest ? crestFile(crest, ctx.isSteelSoul) : 'Select_Game_Crest_Spools__0000_hunter.png', 'slot-crest'));
        const masks = el('div', 'slot-masks');
        for (let i = 0; i < maxHealth; i++) masks.append(icon('general', 'general_hp.png', 'slot-mask'));
        top.append(masks);

        // The profile screen shows the spool at its full length, all silk
        const spool = el('div', 'silk-spool slot-spool');
        spool.style.setProperty('--silk-max', maxSilk);
        const thread = el('div', 'silk-thread');
        for (let i = 0; i < maxSilk; i++) thread.append(el('span', 'silk-seg full'));
        spool.append(thread);

        const money = el('div', 'slot-money');
        const rosaries = el('div', 'slot-count');
        rosaries.append(icon('general', 'general_rosaries.png', 'slot-currency'), formatNumber(field(parsed, 'current', 'geo') || 0));
        const shards = el('div', 'slot-count');
        shards.append(icon('general', 'general_shard.png', 'slot-currency'), formatNumber(field(parsed, 'current', 'ShellShards') || 0));
        money.append(rosaries, shards);

        const bottom = el('div', 'slot-bottom');
        bottom.append(el('span', 'slot-number', slot ? `${slot}.` : ''));
        const info = el('div', 'slot-info');
        info.append(el('span', 'slot-percent', `${Math.round(completion)}%`), el('span', 'slot-time', time), el('span', 'slot-area', area));
        bottom.append(info);

        root.append(top, spool, money, bottom);
        root.setAttribute('aria-label',
            `Save slot ${slot ?? ''}: ${area}, ${Math.round(completion)}% complete, ${time} played, ` +
            `${maxHealth} masks, ${maxSilk} silk`);
    },
};
