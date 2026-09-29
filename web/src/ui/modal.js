/**
 * Spoiler-protected popup listing the variants of an upgrade-set tool
 * (Curveclaw/Curvesickle, the three Silkshots, ...).
 */
import { iconUrl } from '../core/icons.js';

function ensureModal() {
    let modal = document.getElementById('tool-variants-modal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'tool-variants-modal';
    modal.className = 'tool-modal';
    modal.innerHTML = `
        <div class="tool-modal-content">
            <div class="tool-modal-header">
                <h3 id="tool-modal-title"></h3>
                <button class="tool-modal-close">&times;</button>
            </div>
            <div class="tool-modal-body">
                <div class="spoiler-warning">
                    <p>⚠️ This section contains spoilers about tool variations</p>
                    <button class="reveal-spoiler-btn">Click to Reveal Variants</button>
                </div>
                <div class="variants-container" style="display: none;">
                    <div id="variants-grid"></div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const close = () => { modal.style.display = 'none'; };
    modal.querySelector('.tool-modal-close').addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    modal.querySelector('.reveal-spoiler-btn').addEventListener('click', (e) => {
        e.target.parentElement.style.display = 'none';
        modal.querySelector('.variants-container').style.display = 'block';
    });
    return modal;
}

function variantStatus(tool, variant) {
    if (variant.unlocked) return { text: '✓ Unlocked', cls: 'status-unlocked' };
    // gameMode sets (Classic / Steel Soul exclusive) explain why a variant is locked
    const label = tool.upgradeSetType === 'gameMode' && tool.variantLabels?.[variant.json];
    return { text: label || '✗ Locked', cls: 'status-locked' };
}

export function showToolVariantsPopup(tool) {
    const modal = ensureModal();
    modal.querySelector('#tool-modal-title').textContent = `${tool.upgradeSetName} Variants`;
    const grid = modal.querySelector('#variants-grid');
    grid.innerHTML = '';

    // Every opening starts hidden behind the spoiler warning
    modal.querySelector('.spoiler-warning').style.display = 'block';
    modal.querySelector('.variants-container').style.display = 'none';

    for (const variant of tool.variants) {
        const item = document.createElement('div');
        item.className = 'variant-item';

        const img = document.createElement('img');
        img.src = iconUrl('tool', variant.icon);
        img.alt = variant.display;
        img.className = variant.unlocked ? 'unlocked' : 'locked';

        const status = variantStatus(tool, variant);
        const label = document.createElement('div');
        label.className = 'variant-label';
        const strong = document.createElement('strong');
        strong.textContent = variant.display;
        const span = document.createElement('span');
        span.className = `variant-status ${status.cls}`;
        span.textContent = status.text;
        label.append(strong, span);

        item.append(img, label);
        grid.appendChild(item);
    }

    modal.style.display = 'flex';
}
