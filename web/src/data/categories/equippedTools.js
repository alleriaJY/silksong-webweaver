/**
 * Current tab loadout: the ToolEquips entry named after CurrentCrestID holds
 * the crest's slots; ExtraToolEquips holds the extra slots. A slot may hold a
 * tool or a skill (skills are looked up by their equipName).
 */
import { savedDataByName, savedDataEntries } from '../../core/saveAccess.js';
import { iconUrl } from '../../core/icons.js';
import { renderIconGrid, renderEmpty } from '../../ui/renderers.js';

export function parseEquippedTools(save, ctx) {
    const pd = save.playerData;
    const currentCrestId = pd?.CurrentCrestID;
    const tools = new Map(ctx.lists('tools').map(t => [t.json, t]));
    const skills = new Map(ctx.lists('skills').map(s => [s.equipName, s]));

    const info = (name) => {
        const tool = tools.get(name);
        if (tool) {
            return { name, display: tool.display || name, icon: tool.icon || 'T_straight_pin.png', category: tool.category || 'Tool', iconKind: 'tool' };
        }
        const skill = skills.get(name);
        if (skill) return { name, display: skill.display || name, icon: skill.icon, category: 'Skill', iconKind: 'skill' };
        return { name, display: name, icon: 'T_straight_pin.png', category: 'Unknown', iconKind: 'tool' };
    };

    const equippedTools = [];
    if (currentCrestId) {
        const crestData = savedDataByName(pd.ToolEquips).get(currentCrestId);
        for (const slot of crestData?.Slots || []) {
            if (slot?.EquippedTool) equippedTools.push(info(slot.EquippedTool));
        }
    }

    const extraEquippedTools = [];
    for (const { name: slotName, data } of savedDataEntries(pd?.ExtraToolEquips)) {
        if (data?.EquippedTool) extraEquippedTools.push({ ...info(data.EquippedTool), slotName });
    }

    return { equippedTools, extraEquippedTools, crestId: currentCrestId };
}

const EMPTY_STYLE = 'color: var(--text-secondary); font-size: 0.85rem;';

function renderRow(container, items, emptyText, title) {
    if (!container) return;
    if (!items || items.length === 0) {
        renderEmpty(container, emptyText, EMPTY_STYLE);
        return;
    }
    renderIconGrid(container, items, {
        itemClass: 'equipped-tool-item',
        icon: t => iconUrl(t.iconKind, t.icon),
        title,
        imgClass: () => null,
    });
}

export default {
    id: 'equippedTools',
    parse: parseEquippedTools,

    render(result) {
        renderRow(document.getElementById('equipped-tools-row'), result.equippedTools, 'No tools equipped',
            t => `${t.display} (${t.category || 'Tool'})`);
        renderRow(document.getElementById('extra-tools-row'), result.extraEquippedTools, 'No extra slots',
            t => `${t.display} (${t.slotName || 'Extra'})`);
    },
};
