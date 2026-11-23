/**
 * Collectables tab (beyond the Memory Locket / Craftmetal checklists):
 * relics, mementos, materium and the carried inventory. None of these count
 * toward the completion percentage.
 */
import { savedDataByName } from '../../core/saveAccess.js';
import { iconUrl } from '../../core/icons.js';
import { renderChecklist, setText } from '../../ui/renderers.js';

/** Names in a save container that no pack lists: new content or a pack gap. */
function unknown(map, list) {
    const known = new Set(list.map(e => e.json));
    return [...map.keys()].filter(name => !known.has(name));
}

/**
 * Which Old Heart is (or will be) the Hearts Memento, or null while it can't
 * be known yet (fewer than three hearts). Red Memory uses three hearts and the
 * fourth becomes the memento:
 *   - a heart in MementosDeposited is the memento;
 *   - with exactly three collected, the missing one will be;
 *   - with all four, the one still carried (Amount > 0) is, if exactly one is;
 *     otherwise the Conjoined Heart, which the game keeps when all four are
 *     held before Red Memory.
 */
export function mementoHeart(hearts, pd, items, deposited) {
    const placed = hearts.find(h => deposited.get(h.item)?.IsDeposited);
    if (placed) return placed;
    const missing = hearts.filter(h => !pd[h.flag]);
    if (missing.length === 1) return missing[0];
    if (missing.length > 1) return null;
    const carried = hearts.filter(h => (items.get(h.item)?.Amount || 0) > 0);
    if (carried.length === 1) return carried[0];
    return hearts.find(h => h.flag === 'CollectedHeartClover') || null;
}

export function parseCollection(save, ctx) {
    const pd = save.playerData || {};
    const relicData = savedDataByName(pd.Relics);
    const materiumData = savedDataByName(pd.MateriumCollected);
    const items = savedDataByName(pd.Collectables);
    const deposited = savedDataByName(pd.MementosDeposited);

    const relics = ctx.lists('relics').map(def => {
        const d = relicData.get(def.json);
        return { json: def.json, display: def.display, kind: def.kind, icon: def.icon, iconKind: def.iconKind, collected: !!d?.IsCollected, deposited: !!d?.IsDeposited };
    });
    // An entry is recorded in the Materium when it is in the list at all;
    // IsCollected is only set for the three special stones (Smeltstone,
    // Voltstone, Magnetite), so it cannot mean "recorded".
    const materium = ctx.lists('materium').map(def => ({
        json: def.json, display: def.display, icon: def.icon, iconKind: def.iconKind, collected: materiumData.has(def.json),
    }));
    const mementos = ctx.lists('mementos').map(def => {
        const held = def.item ? (items.get(def.item)?.Amount || 0) > 0 : false;
        const isDeposited = [def.item, ...(def.depositItems || [])].some(name => name && !!deposited.get(name)?.IsDeposited);
        const flagged = (def.flag ? !!pd[def.flag] : false) || (!!def.allFlags && def.allFlags.every(f => !!pd[f]));
        const heart = def.hearts ? mementoHeart(def.hearts, pd, items, deposited) : null;
        return {
            id: def.id,
            display: heart ? `${def.display} (${heart.name})` : def.display,
            icon: heart?.icon || def.icon,
            iconKind: def.iconKind,
            obtained: held || isDeposited || flagged,
            deposited: isDeposited,
        };
    });
    const itemDefs = ctx.lists('inventoryItems');
    const displayOf = new Map(itemDefs.map(d => [d.json, d.display]));
    const inventory = [...items.entries()]
        .filter(([, data]) => (data?.Amount || 0) > 0)
        .map(([name, data]) => ({ json: name, display: displayOf.get(name) || name, amount: data.Amount }));

    const count = (list, key) => list.filter(e => e[key]).length;
    return {
        relics,
        materium,
        mementos,
        inventory,
        unknownNames: {
            relics: unknown(relicData, ctx.lists('relics')),
            materium: unknown(materiumData, ctx.lists('materium')),
            inventory: unknown(items, itemDefs),
        },
        stats: {
            relics: { total: relics.length, collected: count(relics, 'collected'), deposited: count(relics, 'deposited') },
            materium: { total: materium.length, collected: count(materium, 'collected') },
            mementos: { total: mementos.length, obtained: count(mementos, 'obtained') },
            inventory: { kinds: inventory.length },
        },
    };
}

/** Checklist rows with custom status text; state class stays collected/missing. */
function renderRows(id, rows) {
    const container = document.getElementById(id);
    renderChecklist(container, rows, r => (r.icon ? iconUrl(r.iconKind || 'general', r.icon) : null));
    if (!container) return;
    container.querySelectorAll('.source-status').forEach((el, i) => { el.textContent = rows[i].status; });
}

function renderInventory(items) {
    const container = document.getElementById('inventory-list');
    if (!container) return;
    container.innerHTML = '';
    if (items.length === 0) {
        container.textContent = 'Nothing carried';
        return;
    }
    for (const item of items) {
        const row = document.createElement('div');
        row.className = 'inventory-row';
        const name = document.createElement('span');
        name.textContent = item.display;
        const amount = document.createElement('strong');
        amount.textContent = `×${item.amount}`;
        row.append(name, amount);
        container.appendChild(row);
    }
}

export default {
    id: 'collection',
    parse: parseCollection,

    render(result) {
        const s = result.stats;

        if (document.getElementById('panel-collectables')) {
            renderRows('relics-checklist', result.relics.map(r => ({
                name: r.display,
                icon: r.icon,
                iconKind: r.iconKind,
                collected: r.collected,
                pending: false,
                status: r.deposited ? 'Deposited' : (r.collected ? 'Collected' : 'Missing'),
            })));
            setText('relics-collected-count', s.relics.collected);
            setText('relics-deposited-count', s.relics.deposited);
            setText('relics-total-count', s.relics.total);

            renderRows('mementos-checklist', result.mementos.map(m => ({
                name: m.display,
                icon: m.icon,
                iconKind: m.iconKind,
                collected: m.obtained,
                pending: false,
                status: m.deposited ? 'Deposited' : (m.obtained ? 'Obtained' : 'Missing'),
            })));
            setText('mementos-obtained-count', s.mementos.obtained);
            setText('mementos-total-count', s.mementos.total);

            renderRows('materium-checklist', result.materium.map(m => ({
                name: m.display, icon: m.icon, iconKind: m.iconKind, collected: m.collected, pending: false, status: m.collected ? 'Recorded' : 'Missing',
            })));
            setText('materium-collected-count', s.materium.collected);
            setText('materium-total-count', s.materium.total);
        }

        renderInventory(result.inventory);
        setText('inventory-kinds-count', s.inventory.kinds);
    },
};
