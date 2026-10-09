/**
 * Tools (Unlockables tab): playerData.Tools.savedData matched by Name.
 * Upgrade sets collapse into one tile with a variants popup; tools with
 * countsTowardTotal: false go to a separate "Others" row.
 */
import { savedDataByName } from '../../core/saveAccess.js';
import { iconUrl } from '../../core/icons.js';
import { renderIconGrid, setText, setPercent } from '../../ui/renderers.js';
import { showToolVariantsPopup } from '../../ui/modal.js';

/** Collapse each upgrade set into the variant to display, with all variants attached. */
function collapseUpgradeSets(tools, upgradeSets) {
    const setOf = json => upgradeSets.find(set => set.tools.includes(json));
    const done = new Set();
    const out = [];
    for (const tool of tools) {
        const set = setOf(tool.json);
        if (!set) {
            out.push(tool);
            continue;
        }
        if (done.has(set.name)) continue;
        done.add(set.name);

        const variants = tools.filter(t => set.tools.includes(t.json));
        const unlocked = variants.find(v => v.unlocked);
        // Prefer the upgrade when several are unlocked; show the base when none is
        const shown = unlocked
            ? (variants.find(v => v.json === set.preferredUpgrade && v.unlocked) || unlocked)
            : variants.find(v => v.json === set.tools[0]);

        shown.isUpgradeSet = true;
        shown.upgradeSetName = set.name;
        shown.upgradeSetType = set.type;
        shown.variantLabels = set.variantLabels;
        shown.variants = variants;
        out.push(shown);
    }
    return out;
}

export function parseTools(save, ctx) {
    const defs = ctx.lists('tools');
    const saved = savedDataByName(save.playerData?.Tools);
    const tools = defs.map(def => {
        const data = saved.get(def.json);
        return {
            json: def.json,
            display: def.display,
            category: def.category,
            icon: def.icon,
            unlocked: data?.IsUnlocked || false,
            seen: data?.HasBeenSeen || false,
            selected: data?.HasBeenSelected || false,
        };
    });

    const notCounted = new Set(defs.filter(d => d.countsTowardTotal === false).map(d => d.json));
    const regularTools = [];
    const otherTools = [];
    for (const tool of collapseUpgradeSets(tools, ctx.lists('toolUpgradeSets'))) {
        if (notCounted.has(tool.json)) {
            tool.isOther = true;
            otherTools.push(tool);
        } else {
            regularTools.push(tool);
        }
    }

    return {
        tools: regularTools,
        otherTools,
        stats: { total: regularTools.length, unlocked: regularTools.filter(t => t.unlocked).length },
    };
}

const toolIcon = t => iconUrl('tool', t.icon || 'T_straight_pin.png');

export default {
    id: 'tools',
    parse: parseTools,
    // 1% per counted tool; an upgrade set counts once
    completion: r => ({ label: 'Tools', earned: r.stats.unlocked, max: r.stats.total }),

    render(result) {
        const total = result.stats.total;
        const unlocked = renderIconGrid(document.getElementById('tools-grid'), result.tools, {
            itemClass: 'tool-item', isOn: t => t.unlocked, icon: toolIcon,
            decorate: (el, t) => {
                if (!t.isUpgradeSet) return;
                el.classList.add('tool-upgrade-set');
                el.style.cursor = 'pointer';
                el.title = `Click to view ${t.upgradeSetName} variants (Spoilers)`;
            },
            clickable: t => t.isUpgradeSet,
            onClick: showToolVariantsPopup,
        });
        if (document.getElementById('tools-grid')) {
            setText('tools-unlocked-count', unlocked);
            setText('tools-total-count', total);
            setPercent('tools-percent', unlocked, unlocked === total);
        }
        renderIconGrid(document.getElementById('other-tools-grid'), result.otherTools, {
            itemClass: 'tool-item', isOn: t => t.unlocked, icon: toolIcon,
        });
    },
};
