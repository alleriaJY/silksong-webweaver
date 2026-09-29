/**
 * General tab: game info, max stats with icons, and the game's own completion
 * percentage (also shown on the Unlockables tab).
 */
import { parseSimpleFields, field } from './common.js';
import { formatPlayTime } from '../../core/format.js';
import { iconUrl } from '../../core/icons.js';
import { setStat, setText, renderEmpty } from '../../ui/renderers.js';

function renderIconRow(container, count, file, alt) {
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const img = document.createElement('img');
        img.src = iconUrl('general', file);
        img.alt = alt;
        img.title = `${alt} ${i + 1}`;
        container.appendChild(img);
    }
    if (count === 0) renderEmpty(container, 'None');
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
        setStat('playTime', playTime ? formatPlayTime(playTime) : '00h 00m 00s');

        const maxHealth = get('maxHealth') || 0;
        const silkHearts = get('silkRegenMax') || 0;
        setStat('maxHealth', maxHealth);
        setStat('maxSilk', get('silkMax'));
        setStat('silkHearts', silkHearts);

        renderIconRow(document.getElementById('health-icons'), Math.min(Math.max(0, maxHealth), 10), 'general_hp.png', 'Health');
        renderIconRow(document.getElementById('silkheart-icons'), Math.min(Math.max(0, silkHearts), 3), 'general_silkheart.png', 'Silk Heart');

        // Unlockables tab summary: the game's overall completion (covers every
        // category, not only that tab's)
        setText('unlockables-completion-percent', completionText);
    },
};
