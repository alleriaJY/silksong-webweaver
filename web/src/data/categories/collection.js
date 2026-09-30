/**
 * Collectables tab (beyond the Memory Locket / Craftmetal checklists):
 * relics, mementos, materium and the carried inventory. None of these count
 * toward the completion percentage.
 */
import { savedDataByName } from '../../core/saveAccess.js';
import { renderChecklist, setText } from '../../ui/renderers.js';

/** Names in a save container that no pack lists: new content or a pack gap. */
function unknown(map, list) {
    const known = new Set(list.map(e => e.json));
    return [...map.keys()].filter(name => !known.has(name));
}

export function parseCollection(save, ctx) {
    const pd = save.playerData || {};
    const relicData = savedDataByName(pd.Relics);
    const materiumData = savedDataByName(pd.MateriumCollected);
    const items = savedDataByName(pd.Collectables);
    const deposited = savedDataByName(pd.MementosDeposited);

    const relics = ctx.lists('relics').map(def => {
        const d = relicData.get(def.json);
        return { json: def.json, display: def.display, kind: def.kind, collected: !!d?.IsCollected, deposited: !!d?.IsDeposited };
    });
    // An entry is recorded in the Materium when it is in the list at all;
    // IsCollected is only set for the three special stones (Smeltstone,
    // Voltstone, Magnetite), so it cannot mean "recorded".
    const materium = ctx.lists('materium').map(def => ({
        json: def.json, display: def.display, collected: materiumData.has(def.json),
    }));
    const mementos = ctx.lists('mementos').map(def => {
        const held = def.item ? (items.get(def.item)?.Amount || 0) > 0 : false;
        const isDeposited = def.item ? !!deposited.get(def.item)?.IsDeposited : false;
        const flagged = def.flag ? !!pd[def.flag] : false;
        return { id: def.id, display: def.display, obtained: held || isDeposited || flagged, deposited: isDeposited };
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
    renderChecklist(container, rows, null);
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
        if (!document.getElementById('panel-collectables')) return;
        const s = result.stats;

        renderRows('relics-checklist', result.relics.map(r => ({
            name: r.display,
            collected: r.collected,
            pending: false,
            status: r.deposited ? 'Deposited' : (r.collected ? 'Collected' : 'Missing'),
        })));
        setText('relics-collected-count', s.relics.collected);
        setText('relics-deposited-count', s.relics.deposited);
        setText('relics-total-count', s.relics.total);

        renderRows('mementos-checklist', result.mementos.map(m => ({
            name: m.display,
            collected: m.obtained,
            pending: false,
            status: m.deposited ? 'Deposited' : (m.obtained ? 'Obtained' : 'Missing'),
        })));
        setText('mementos-obtained-count', s.mementos.obtained);
        setText('mementos-total-count', s.mementos.total);

        renderRows('materium-checklist', result.materium.map(m => ({
            name: m.display, collected: m.collected, pending: false, status: m.collected ? 'Recorded' : 'Missing',
        })));
        setText('materium-collected-count', s.materium.collected);
        setText('materium-total-count', s.materium.total);

        renderInventory(result.inventory);
        setText('inventory-kinds-count', s.inventory.kinds);
    },
};
