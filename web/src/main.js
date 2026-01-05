/**
 * Silksong Webweaver - Main JavaScript
 * 
 * Handles file upload, WASM-based decryption, tab navigation, and stats display
 */

import init, { decrypt_and_parse } from '../pkg/wasm_crypto.js';
import { parseAllData, formatPlayTime, formatNumber } from './data/index.js';

// State
let wasmReady = false;
let selectedFile = null;
let currentData = null;

// DOM Elements
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const fileName = document.getElementById('file-name');
const analyzeBtn = document.getElementById('analyze-btn');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const statsSection = document.getElementById('stats-section');
const tabNav = document.getElementById('tab-nav');

/**
 * Initialize WASM module on page load
 */
async function initWasm() {
    try {
        await init();
        wasmReady = true;
        console.log('✓ WASM module initialized');
    } catch (error) {
        console.error('Failed to initialize WASM:', error);
        showError('Failed to initialize decryption module. Please refresh the page.');
    }
}

/**
 * Set up file upload handlers
 */
function setupFileUpload() {
    // Click to upload
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });

    // Analyze button
    analyzeBtn.addEventListener('click', analyzeFile);
}

/**
 * Show popup with tool variants (spoiler-protected)
 */
function showToolVariantsPopup(tool) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('tool-variants-modal');
    if (!modal) {
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

        // Close button handler
        modal.querySelector('.tool-modal-close').addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Reveal spoiler button
        modal.querySelector('.reveal-spoiler-btn').addEventListener('click', (e) => {
            e.target.parentElement.style.display = 'none';
            modal.querySelector('.variants-container').style.display = 'block';
        });
    }

    // Populate variants
    const title = modal.querySelector('#tool-modal-title');
    const variantsGrid = modal.querySelector('#variants-grid');
    title.textContent = `${tool.upgradeSetName} Variants`;
    variantsGrid.innerHTML = '';

    // Reset spoiler state
    modal.querySelector('.spoiler-warning').style.display = 'block';
    modal.querySelector('.variants-container').style.display = 'none';

    // Render each variant
    for (const variant of tool.variants) {
        const variantItem = document.createElement('div');
        variantItem.className = 'variant-item';

        const img = document.createElement('img');
        img.src = `assets/img/tools/${variant.icon}`;
        img.alt = variant.display;
        img.className = variant.unlocked ? 'unlocked' : 'locked';

        const label = document.createElement('div');
        label.className = 'variant-label';

        // Determine status text based on upgrade set type
        let statusText;
        let statusClass;
        if (tool.upgradeSetType === 'gameMode' && tool.variantLabels) {
            // Special gameMode labels (e.g., "Classic Only", "Steel Soul Only")
            if (variant.unlocked) {
                statusText = '✓ Unlocked';
                statusClass = 'status-unlocked';
            } else {
                statusText = tool.variantLabels[variant.json] || '✗ Locked';
                statusClass = 'status-locked';
            }
        } else {
            // Default Locked/Unlocked labels
            statusText = variant.unlocked ? '✓ Unlocked' : '✗ Locked';
            statusClass = variant.unlocked ? 'status-unlocked' : 'status-locked';
        }

        label.innerHTML = `
            <strong>${variant.display}</strong>
            <span class="variant-status ${statusClass}">
                ${statusText}
            </span>
        `;

        variantItem.appendChild(img);
        variantItem.appendChild(label);
        variantsGrid.appendChild(variantItem);
    }

    // Show modal
    modal.style.display = 'flex';
}

/**
 * Set up tab navigation
 */
function setupTabs() {
    const tabButtons = tabNav.querySelectorAll('.tab-btn');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            switchTab(tabId);
        });
    });
}

/**
 * Switch to a specific tab
 */
function switchTab(tabId) {
    // Update tab buttons
    const tabButtons = tabNav.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    // Update panels
    const panels = document.querySelectorAll('.tab-panel');
    panels.forEach(panel => {
        panel.classList.toggle('active', panel.id === `panel-${tabId}`);
    });
}

/**
 * Handle file selection
 */
function handleFileSelect(file) {
    hideError();

    if (!file.name.endsWith('.dat')) {
        showError('Please upload a .dat save file');
        return;
    }

    selectedFile = file;
    fileName.textContent = file.name;
    uploadArea.classList.add('has-file');
    analyzeBtn.disabled = false;

    // Hide any previous stats
    statsSection.hidden = true;

    console.log('File selected:', file.name, `(${(file.size / 1024).toFixed(1)} KB)`);
}

/**
 * Analyze the selected file
 */
async function analyzeFile() {
    if (!selectedFile) {
        showError('Please select a save file first');
        return;
    }

    if (!wasmReady) {
        showError('Decryption module not ready. Please wait or refresh the page.');
        return;
    }

    // Show loading
    loading.hidden = false;
    analyzeBtn.disabled = true;
    statsSection.hidden = true;
    hideError();

    try {
        // Read file as bytes
        const arrayBuffer = await selectedFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        // Decrypt using WASM
        const result = decrypt_and_parse(bytes);

        if (result.success) {
            // Parse raw playerData using schema system
            currentData = parseAllData(result.playerData);
            displayStats(currentData);
        } else {
            throw new Error(result.error || 'Unknown error');
        }
    } catch (error) {
        console.error('Analysis failed:', error);
        showError('Failed to analyze save file: ' + error.message);
    } finally {
        loading.hidden = true;
        analyzeBtn.disabled = false;
    }
}

/**
 * Display parsed stats across all tabs
 * Uses schema-based parsed data structure
 */
function displayStats(data) {
    statsSection.hidden = false;

    // Helper to set stat value
    const setStat = (key, value) => {
        const elements = document.querySelectorAll(`[data-stat="${key}"]`);
        elements.forEach(el => {
            el.textContent = value !== undefined && value !== null ? value : '-';
        });
    };

    // Helper to get value from parsed field
    const getField = (category, fieldName) => {
        return data[category]?.[fieldName]?.value;
    };

    // General Tab - Game Info
    setStat('version', getField('general', 'version') || 'Unknown');
    setStat('permadeath', getField('general', 'permadeathMode') ? 'Steel Soul' : 'Classic');
    const completion = getField('general', 'completionPercentage');
    setStat('completion', completion !== undefined ? `${completion.toFixed(1)}%` : '0%');
    const playTime = getField('general', 'playTime');
    setStat('playTime', playTime ? formatPlayTime(playTime) : '00h 00m 00s');

    // General Tab - Max Unlocked
    const maxHealthVal = getField('general', 'maxHealth') || 0;
    const silkHeartsVal = getField('general', 'silkRegenMax') || 0;
    setStat('maxHealth', maxHealthVal);
    setStat('maxSilk', getField('general', 'silkMax'));
    setStat('silkHearts', silkHeartsVal);

    // General Tab - Stats Visual Icons
    const healthIconsContainer = document.getElementById('health-icons');
    const silkHeartIconsContainer = document.getElementById('silkheart-icons');

    // Populate health icons (max 10)
    if (healthIconsContainer) {
        healthIconsContainer.innerHTML = '';
        const healthCount = Math.min(Math.max(0, maxHealthVal), 10);
        for (let i = 0; i < healthCount; i++) {
            const img = document.createElement('img');
            img.src = 'assets/img/general/general_hp.png';
            img.alt = 'Health';
            img.title = `Health ${i + 1}`;
            healthIconsContainer.appendChild(img);
        }
        if (healthCount === 0) {
            healthIconsContainer.innerHTML = '<span style="color: var(--text-secondary);">None</span>';
        }
    }

    // Populate silk heart icons (max 3)
    if (silkHeartIconsContainer) {
        silkHeartIconsContainer.innerHTML = '';
        const silkCount = Math.min(Math.max(0, silkHeartsVal), 3);
        for (let i = 0; i < silkCount; i++) {
            const img = document.createElement('img');
            img.src = 'assets/img/general/general_silkheart.png';
            img.alt = 'Silk Heart';
            img.title = `Silk Heart ${i + 1}`;
            silkHeartIconsContainer.appendChild(img);
        }
        if (silkCount === 0) {
            silkHeartIconsContainer.innerHTML = '<span style="color: var(--text-secondary);">None</span>';
        }
    }

    // Current Stats Tab - Health & Silk
    const health = getField('current', 'health') || 0;
    const maxHealth = getField('current', 'maxHealth') || 0;
    const silk = getField('current', 'silk') || 0;
    const maxSilk = getField('current', 'silkMax') || 0;
    setStat('healthDisplay', `${health}/${maxHealth}`);
    setStat('silkDisplay', `${silk}/${maxSilk}`);

    // Update health bar
    const healthPercent = maxHealth > 0 ? (health / maxHealth) * 100 : 0;
    const healthFill = document.getElementById('health-fill');
    if (healthFill) {
        healthFill.style.width = `${healthPercent}%`;
    }

    // Update silk bar
    const silkPercent = maxSilk > 0 ? (silk / maxSilk) * 100 : 0;
    const silkFill = document.getElementById('silk-fill');
    if (silkFill) {
        silkFill.style.width = `${silkPercent}%`;
    }

    // Current Stats Tab - Currency
    const geo = getField('current', 'geo');
    const shellShards = getField('current', 'ShellShards');
    setStat('geo', geo !== undefined ? formatNumber(geo) : '0');
    setStat('shellShards', shellShards !== undefined ? formatNumber(shellShards) : '0');

    // Current Stats Tab - Equipment & Crest Display
    const crestId = getField('current', 'CurrentCrestID') || '';
    const isSteelSoul = getField('general', 'permadeathMode') || false;
    setStat('crest', crestId || 'None');

    // Update crest image
    const crestImage = document.getElementById('crest-image');
    if (crestImage && crestId) {
        const crestMap = {
            'Hunter': isSteelSoul ? 'Select_Game_Crest_Spools__0000_hunter_SS.png' : 'Select_Game_Crest_Spools__0000_hunter.png',
            'Hunter_v2': isSteelSoul ? 'Select_Game_Crest_Spools__0003_hunter_v2_SS.png' : 'Select_Game_Crest_Spools__0003_hunter_v2.png',
            'Hunter_v3': isSteelSoul ? 'Select_Game_Crest_Spools__0001_hunter_v3_SS.png' : 'Select_Game_Crest_Spools__0001_hunter_v3.png',
            'Shaman': isSteelSoul ? 'Select_Game_Crest_Spools__0005_shaman_SS.png' : 'Select_Game_Crest_Spools__0005_shaman.png',
            'Reaper': isSteelSoul ? 'Select_Game_Crest_Spools__0004_reaper_SS.png' : 'Select_Game_Crest_Spools__0004_reaper.png',
            'Architect': isSteelSoul ? 'Select_Game_Crest_Spools__0006_architect_SS.png' : 'Select_Game_Crest_Spools__0006_architect.png',
            'Warrior': isSteelSoul ? 'Select_Game_Crest_Spools__0007_warrior_SS.png' : 'Select_Game_Crest_Spools__0007_warrior.png',
            'Wanderer': isSteelSoul ? 'Select_Game_Crest_Spools__0008_wanderer_SS.png' : 'Select_Game_Crest_Spools__0008_wanderer.png',
            'Witch': isSteelSoul ? 'Select_Game_Crest_Spools__0009_witch_SS.png' : 'Select_Game_Crest_Spools__0009_witch.png',
            'Cursed': isSteelSoul ? 'Select_Game_Crest_Spools__0002_cursed_SS.png' : 'Select_Game_Crest_Spools__0002_cursed.png',
        };
        const crestFile = crestMap[crestId] || crestMap['Hunter'];
        crestImage.src = `assets/img/general/crests/${crestFile}`;
        crestImage.alt = crestId;
    }

    // Current Stats Tab - Equipped Tools
    const equippedToolsRow = document.getElementById('equipped-tools-row');
    if (equippedToolsRow && data.equippedTools) {
        equippedToolsRow.innerHTML = '';
        const { equippedTools } = data.equippedTools;

        if (equippedTools.length === 0) {
            equippedToolsRow.innerHTML = '<span style="color: var(--text-secondary); font-size: 0.85rem;">No tools equipped</span>';
        } else {
            for (const tool of equippedTools) {
                const toolItem = document.createElement('div');
                toolItem.className = 'equipped-tool-item';

                const img = document.createElement('img');
                img.src = `assets/img/${tool.iconPath || 'tools'}/${tool.icon}`;
                img.alt = tool.display;
                img.title = `${tool.display} (${tool.category || 'Tool'})`;

                const label = document.createElement('span');
                label.textContent = tool.display;
                label.title = tool.display;

                toolItem.appendChild(img);
                toolItem.appendChild(label);
                equippedToolsRow.appendChild(toolItem);
            }
        }
    }

    // Current Stats Tab - Extra Tool Equips
    const extraToolsRow = document.getElementById('extra-tools-row');
    if (extraToolsRow && data.equippedTools) {
        extraToolsRow.innerHTML = '';
        const { extraEquippedTools } = data.equippedTools;

        if (!extraEquippedTools || extraEquippedTools.length === 0) {
            extraToolsRow.innerHTML = '<span style="color: var(--text-secondary); font-size: 0.85rem;">No extra slots</span>';
        } else {
            for (const tool of extraEquippedTools) {
                const toolItem = document.createElement('div');
                toolItem.className = 'equipped-tool-item';

                const img = document.createElement('img');
                img.src = `assets/img/${tool.iconPath || 'tools'}/${tool.icon}`;
                img.alt = tool.display;
                img.title = `${tool.display} (${tool.slotName || 'Extra'})`;

                const label = document.createElement('span');
                label.textContent = tool.display;
                label.title = tool.display;

                toolItem.appendChild(img);
                toolItem.appendChild(label);
                extraToolsRow.appendChild(toolItem);
            }
        }
    }

    // Current Stats Tab - Position
    setStat('currentArea', getField('current', 'currentArea') || 'Unknown');
    setStat('mapZone', getField('current', 'mapZone'));
    const atBench = getField('current', 'atBench');
    setStat('atBench', atBench ? '✓ Yes' : '✗ No');

    // Misc Tab - Respawn Info
    setStat('respawnScene', getField('misc', 'respawnScene') || 'Unknown');
    setStat('respawnMarker', getField('misc', 'respawnMarkerName') || '-');
    setStat('respawnType', getField('misc', 'respawnType'));

    // Abilities Tab - Populate abilities grid
    const abilitiesGrid = document.getElementById('abilities-grid');
    const abilitiesUnlockedCount = document.getElementById('abilities-unlocked-count');
    if (abilitiesGrid && data.abilities) {
        abilitiesGrid.innerHTML = '';
        let unlockedCount = 0;

        for (const ability of data.abilities.abilities) {
            const abilityItem = document.createElement('div');
            abilityItem.className = 'ability-item';

            const img = document.createElement('img');
            img.src = `assets/img/general/ability/${ability.icon || 'swiftstep.png'}`;
            img.alt = ability.display;
            img.title = `${ability.display} (${ability.value ? 'Unlocked' : 'Locked'})`;
            img.className = ability.value ? 'unlocked' : 'locked';

            if (ability.value) unlockedCount++;

            const label = document.createElement('span');
            label.textContent = ability.display;
            label.title = ability.display;

            abilityItem.appendChild(img);
            abilityItem.appendChild(label);
            abilitiesGrid.appendChild(abilityItem);
        }

        if (abilitiesUnlockedCount) abilitiesUnlockedCount.textContent = unlockedCount;
    }

    // Skills Tab - Populate skills grid
    const skillsGrid = document.getElementById('skills-grid');
    const skillsUnlockedCount = document.getElementById('skills-unlocked-count');
    if (skillsGrid && data.skills) {
        skillsGrid.innerHTML = '';
        let unlockedCount = 0;

        for (const skill of data.skills.skills) {
            const skillItem = document.createElement('div');
            skillItem.className = 'skill-item';

            const img = document.createElement('img');
            img.src = `assets/img/general/skills/${skill.icon || 'Art_Rune__0002_silk_spear.png'}`;
            img.alt = skill.display;
            img.title = `${skill.display} (${skill.value ? 'Unlocked' : 'Locked'})`;
            img.className = skill.value ? 'unlocked' : 'locked';

            if (skill.value) unlockedCount++;

            const label = document.createElement('span');
            label.textContent = skill.display;
            label.title = skill.display;

            skillItem.appendChild(img);
            skillItem.appendChild(label);
            skillsGrid.appendChild(skillItem);
        }

        if (skillsUnlockedCount) skillsUnlockedCount.textContent = unlockedCount;
    }

    // Tools Tab - Populate tool grid
    const toolsGrid = document.getElementById('tools-grid');
    const toolsUnlockedCount = document.getElementById('tools-unlocked-count');
    const toolsTotalCount = document.getElementById('tools-total-count');
    if (toolsGrid && data.tools) {
        toolsGrid.innerHTML = '';
        let unlockedCount = 0;

        for (const tool of data.tools.tools) {
            const toolItem = document.createElement('div');
            toolItem.className = 'tool-item';

            // Add special class for upgrade sets
            if (tool.isUpgradeSet) {
                toolItem.classList.add('tool-upgrade-set');
                toolItem.style.cursor = 'pointer';
                toolItem.title = `Click to view ${tool.upgradeSetName} variants (Spoilers)`;
            }

            const img = document.createElement('img');
            img.src = `assets/img/tools/${tool.icon || 'T_straight_pin.png'}`;
            img.alt = tool.display;
            img.title = `${tool.display} (${tool.unlocked ? 'Unlocked' : 'Locked'})`;
            img.className = tool.unlocked ? 'unlocked' : 'locked';

            if (tool.unlocked) unlockedCount++;

            const label = document.createElement('span');
            label.textContent = tool.display;
            label.title = tool.display;

            toolItem.appendChild(img);
            toolItem.appendChild(label);

            // Add click handler for upgrade sets
            if (tool.isUpgradeSet) {
                toolItem.addEventListener('click', () => showToolVariantsPopup(tool));
            }

            toolsGrid.appendChild(toolItem);
        }

        if (toolsUnlockedCount) toolsUnlockedCount.textContent = unlockedCount;
        if (toolsTotalCount) toolsTotalCount.textContent = data.tools.stats.total;
    }

    // Other Tools Grid - Items not counted in total
    const otherToolsGrid = document.getElementById('other-tools-grid');
    if (otherToolsGrid && data.tools && data.tools.otherTools) {
        otherToolsGrid.innerHTML = '';

        for (const tool of data.tools.otherTools) {
            const toolItem = document.createElement('div');
            toolItem.className = 'tool-item';

            const img = document.createElement('img');
            img.src = `assets/img/tools/${tool.icon || 'T_straight_pin.png'}`;
            img.alt = tool.display;
            img.title = `${tool.display} (${tool.unlocked ? 'Unlocked' : 'Locked'})`;
            img.className = tool.unlocked ? 'unlocked' : 'locked';

            const label = document.createElement('span');
            label.textContent = tool.display;
            label.title = tool.display;

            toolItem.appendChild(img);
            toolItem.appendChild(label);
            otherToolsGrid.appendChild(toolItem);
        }
    }

    // Maps Tab - Populate map grid
    const mapsGrid = document.getElementById('maps-grid');
    const mapsCount = document.getElementById('maps-count');
    if (mapsGrid && data.maps) {
        mapsGrid.innerHTML = '';
        let unlockedCount = 0;

        for (const map of data.maps.maps) {
            const mapItem = document.createElement('div');
            mapItem.className = 'map-item';

            const img = document.createElement('img');
            img.src = `assets/img/maps/${map.icon || 'I_map.png'}`;
            img.alt = map.display;
            img.title = map.display;

            // Special handling for placeholder icons (e.g., Abyss)
            const isPlaceholder = map.json === 'HasAbyssMap';
            if (isPlaceholder) {
                img.className = map.value ? 'unlocked placeholder-icon' : 'locked placeholder-icon';
            } else {
                img.className = map.value ? 'unlocked' : 'locked';
            }

            if (map.value) unlockedCount++;

            const label = document.createElement('span');
            label.textContent = map.display;
            label.title = map.display;

            mapItem.appendChild(img);
            mapItem.appendChild(label);
            mapsGrid.appendChild(mapItem);
        }

        if (mapsCount) {
            mapsCount.textContent = unlockedCount;
        }
    }

    // Bosses Tab - Populate boss grid
    const bossesGrid = document.getElementById('bosses-grid');
    const bossesCount = document.getElementById('bosses-count');
    if (bossesGrid && data.bosses) {
        bossesGrid.innerHTML = '';
        let defeatedCount = 0;

        for (const boss of data.bosses.bosses) {
            const bossItem = document.createElement('div');
            bossItem.className = 'boss-item';

            const img = document.createElement('img');
            // Encode the icon filename to handle special characters like #
            const iconFile = boss.icon || 'bestiary_icon__0001_frame_empty.png';
            img.src = `assets/img/bosses/${encodeURIComponent(iconFile)}`;
            img.alt = boss.display;
            img.title = boss.display;
            img.className = boss.value ? 'defeated' : 'not-defeated';

            if (boss.value) defeatedCount++;

            const label = document.createElement('span');
            label.textContent = boss.display;
            label.title = boss.display;

            bossItem.appendChild(img);
            bossItem.appendChild(label);
            bossesGrid.appendChild(bossItem);
        }

        if (bossesCount) {
            bossesCount.textContent = defeatedCount;
        }
    }

    // Switch to general tab and scroll to stats
    switchTab('general');
    statsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Show error message
 */
function showError(message) {
    errorText.textContent = message;
    errorMessage.hidden = false;
}

/**
 * Hide error message
 */
function hideError() {
    errorMessage.hidden = true;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setupFileUpload();
    setupTabs();
    initWasm();

    // Set current year in footer
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});
