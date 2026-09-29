/**
 * Silksong Webweaver - Main JavaScript
 * 
 * Handles file upload, WASM-based decryption, tab navigation, and stats display
 */

import { loadWasm, decryptSave } from './core/wasm.js';
import { parseAllData, formatPlayTime, formatNumber, CLOAK_TIERS, NEEDLE_TIERS } from './data/index.js';

// State
let wasmReady = false;
let selectedFile = null;
let currentData = null;

// DOM Elements
const uploadBtn = document.getElementById('upload-btn');
const resetBtn = document.getElementById('reset-btn');
const uploadModal = document.getElementById('upload-modal');
const uploadModalBackdrop = document.getElementById('upload-modal-backdrop');
const uploadModalClose = document.getElementById('upload-modal-close');
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const fileName = document.getElementById('file-name');
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
        await loadWasm();
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
    // Upload button opens modal
    uploadBtn.addEventListener('click', showUploadModal);

    // Close modal handlers
    uploadModalClose.addEventListener('click', hideUploadModal);
    uploadModalBackdrop.addEventListener('click', hideUploadModal);

    // File input change - auto analyze
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

    // Reset button
    resetBtn.addEventListener('click', resetStats);

    // Global Window-Wide Seamless Drag and Drop
    setupGlobalDragDrop();
}

/**
 * Global window-wide seamless drag and drop handler
 */
function setupGlobalDragDrop() {
    let overlay = document.getElementById('global-drop-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'global-drop-overlay';
        overlay.className = 'global-drop-overlay';
        overlay.innerHTML = `
            <div class="global-drop-content">
                <div class="global-drop-icon">📥</div>
                <div class="global-drop-title">Drop Save File Anywhere</div>
                <div class="global-drop-subtitle">Release your save file (user1.dat to user4.dat) to decrypt &amp; analyze instantly</div>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    let dragCounter = 0;

    window.addEventListener('dragenter', (e) => {
        e.preventDefault();
        dragCounter++;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            overlay.classList.add('active');
        }
    });

    window.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    window.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dragCounter--;
        if (dragCounter <= 0) {
            dragCounter = 0;
            overlay.classList.remove('active');
        }
    });

    window.addEventListener('drop', (e) => {
        e.preventDefault();
        dragCounter = 0;
        overlay.classList.remove('active');
        if (e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });
}

/**
 * Show upload modal
 */
function showUploadModal() {
    uploadModal.hidden = false;
    hideError();
}

/**
 * Hide upload modal
 */
function hideUploadModal() {
    uploadModal.hidden = true;
}

/**
 * Reset stats and return to initial state
 */
function resetStats() {
    selectedFile = null;
    currentData = null;
    fileName.textContent = '';
    uploadArea.classList.remove('has-file');
    statsSection.hidden = true;
    resetBtn.hidden = true;
    fileInput.value = '';
    hideError();
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
 * Update cloak display based on ability unlocks
 */
function updateCloakDisplay(data) {
    const cloakIcon = document.getElementById('cloak-icon');
    const cloakName = document.getElementById('cloak-name');

    if (!cloakIcon || !cloakName) return;

    // Highest cloak tier whose required ability is unlocked (packs/base/abilities.js)
    const unlocked = new Set((data.abilities?.otherAbilities || []).filter(a => a.value).map(a => a.json));
    const cloak = [...CLOAK_TIERS].reverse().find(t => !t.requires || unlocked.has(t.requires));
    cloakIcon.src = `assets/img/general/ability/${cloak.icon}`;
    cloakIcon.alt = cloak.name;
    cloakName.textContent = cloak.name;
}

/**
 * Update needle display based on nailUpgrades
 */
function updateNeedleDisplay(data) {
    // Current Stats elements
    const needleIcon = document.getElementById('needle-icon');
    const needleName = document.getElementById('needle-name');

    // Unlockables elements
    const unlockablesNeedleIcon = document.getElementById('unlockables-needle-icon');
    const unlockablesNeedleName = document.getElementById('unlockables-needle-name');
    const unlockablesNeedleLevel = document.getElementById('unlockables-needle-level');
    const unlockablesNeedleUpgrades = document.getElementById('unlockables-needle-upgrades');

    // Get nail upgrades from raw data (more reliable)
    let nailUpgrades = 0;
    if (data.raw) {
        // Try direct access first
        if (typeof data.raw.nailUpgrades !== 'undefined') {
            nailUpgrades = parseInt(data.raw.nailUpgrades) || 0;
        } else if (data.raw.get && typeof data.raw.get === 'function') {
            // Handle Map objects from WASM
            nailUpgrades = parseInt(data.raw.get('nailUpgrades')) || 0;
        }
    }

    // Clamp to valid range (0-4)
    nailUpgrades = Math.max(0, Math.min(4, nailUpgrades));

    const needle = NEEDLE_TIERS[nailUpgrades];

    // Update Current Stats display (just icon and name)
    if (needleIcon && needleName) {
        needleIcon.src = `assets/img/general/nail/${needle.icon}`;
        needleIcon.alt = needle.name;
        needleName.textContent = needle.name;
    }

    // Update Unlockables display (with level)
    if (unlockablesNeedleIcon && unlockablesNeedleName && unlockablesNeedleLevel) {
        unlockablesNeedleIcon.src = `assets/img/general/nail/${needle.icon}`;
        unlockablesNeedleIcon.alt = needle.name;
        unlockablesNeedleName.textContent = needle.name;
        unlockablesNeedleLevel.textContent = needle.level;
    }

    if (unlockablesNeedleUpgrades) {
        unlockablesNeedleUpgrades.textContent = `${nailUpgrades} Upgrade${nailUpgrades !== 1 ? 's' : ''}`;
    }
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
 * Handle file selection - auto-triggers analysis
 */
async function handleFileSelect(file) {
    hideError();

    if (!file.name.endsWith('.dat')) {
        showError('Please upload a .dat save file');
        return;
    }

    selectedFile = file;
    fileName.textContent = file.name;
    uploadArea.classList.add('has-file');

    console.log('File selected:', file.name, `(${(file.size / 1024).toFixed(1)} KB)`);

    // Auto-analyze the file
    await analyzeFile();
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

    // Hide modal and show loading
    hideUploadModal();
    loading.hidden = false;
    statsSection.hidden = true;
    hideError();

    try {
        // Read file as bytes
        const arrayBuffer = await selectedFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        // Decrypt using WASM (plain objects, see core/wasm.js)
        const save = decryptSave(bytes);
        currentData = parseAllData(save.playerData, save.sceneData);
        displayStats(currentData);
        // Show reset button after successful analysis
        resetBtn.hidden = false;
    } catch (error) {
        console.error('Analysis failed:', error);
        showError('Failed to analyze save file: ' + error.message);
    } finally {
        loading.hidden = true;
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
    const maxHealth = getField('general', 'maxHealth') || 0;
    const silk = getField('current', 'silk') || 0;
    const maxSilk = getField('general', 'silkMax') || 0;
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
    const equippedCrest = data.crests?.equippedCrest;
    setStat('crest', equippedCrest?.display || crestId || 'None');

    // Update crest image (resolved via parseCrests - handles internal-name
    // aliases like Toolmaster/Spell -> Architect/Shaman correctly)
    const crestImage = document.getElementById('crest-image');
    if (crestImage && crestId) {
        const crestFile = equippedCrest?.icon
            ? (isSteelSoul && equippedCrest.iconSteelSoul ? equippedCrest.iconSteelSoul : equippedCrest.icon)
            : 'Select_Game_Crest_Spools__0000_hunter.png';
        crestImage.src = `assets/img/general/crests/${crestFile}`;
        crestImage.alt = equippedCrest?.display || crestId;
    }

    // Special Crest State (Cursed/Cloakless), shown alongside Equipped Crest
    // since these are event-driven states rather than part of the normal
    // 7-crest roster
    const activeSpecial = data.crests?.activeSpecialState;
    setStat('specialCrestState', (activeSpecial && activeSpecial.json !== 'Cloakless') ? activeSpecial.display : 'None');

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

    // Current Stats Tab - Cloak & Needle
    updateCloakDisplay(data);
    updateNeedleDisplay(data);

    // Misc Tab - Respawn Info
    setStat('respawnScene', getField('misc', 'respawnScene') || 'Unknown');
    setStat('respawnMarker', getField('misc', 'respawnMarkerName') || '-');
    setStat('respawnType', getField('misc', 'respawnType'));

    // Abilities Tab - Populate abilities grid
    const abilitiesGrid = document.getElementById('abilities-grid');
    const otherAbilitiesGrid = document.getElementById('other-abilities-grid');
    const abilitiesUnlockedCount = document.getElementById('abilities-unlocked-count');
    const abilitiesPercent = document.getElementById('abilities-percent');
    if (abilitiesGrid && data.abilities) {
        abilitiesGrid.innerHTML = '';
        let unlockedCount = 0;
        const total = data.abilities.abilities.length;

        for (const ability of data.abilities.abilities) {
            const abilityItem = document.createElement('div');
            abilityItem.className = 'ability-item';
            if (!ability.value) abilityItem.classList.add('locked');

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
        if (abilitiesPercent) {
            abilitiesPercent.textContent = `${unlockedCount}%`;
            if (unlockedCount === total) {
                abilitiesPercent.classList.add('maxed');
            } else {
                abilitiesPercent.classList.remove('maxed');
            }
        }
    }

    // Other Abilities Grid (Drifter's Cloak) - Not counted in main stats
    if (otherAbilitiesGrid && data.abilities && data.abilities.otherAbilities) {
        otherAbilitiesGrid.innerHTML = '';

        for (const ability of data.abilities.otherAbilities) {
            const abilityItem = document.createElement('div');
            abilityItem.className = 'ability-item';
            if (!ability.value) abilityItem.classList.add('locked');

            const img = document.createElement('img');
            img.src = `assets/img/general/ability/${ability.icon || 'drifterscloak.png'}`;
            img.alt = ability.display;
            img.title = `${ability.display} (${ability.value ? 'Unlocked' : 'Locked'})`;
            img.className = ability.value ? 'unlocked' : 'locked';

            const label = document.createElement('span');
            label.textContent = ability.display;
            label.title = ability.display;

            abilityItem.appendChild(img);
            abilityItem.appendChild(label);
            otherAbilitiesGrid.appendChild(abilityItem);
        }
    }

    // Skills Tab - Populate skills grid
    const skillsGrid = document.getElementById('skills-grid');
    const skillsUnlockedCount = document.getElementById('skills-unlocked-count');
    const skillsPercent = document.getElementById('skills-percent');
    if (skillsGrid && data.skills) {
        skillsGrid.innerHTML = '';
        let unlockedCount = 0;
        const total = data.skills.skills.length;

        for (const skill of data.skills.skills) {
            const skillItem = document.createElement('div');
            skillItem.className = 'skill-item';
            if (!skill.value) skillItem.classList.add('locked');

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
        if (skillsPercent) {
            skillsPercent.textContent = `${unlockedCount}%`;
            if (unlockedCount === total) {
                skillsPercent.classList.add('maxed');
            } else {
                skillsPercent.classList.remove('maxed');
            }
        }
    }

    // Tools Tab - Populate tool grid
    const toolsGrid = document.getElementById('tools-grid');
    const toolsUnlockedCount = document.getElementById('tools-unlocked-count');
    const toolsTotalCount = document.getElementById('tools-total-count');
    const toolsPercent = document.getElementById('tools-percent');
    if (toolsGrid && data.tools) {
        toolsGrid.innerHTML = '';
        let unlockedCount = 0;
        const total = data.tools.stats.total;

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
        if (toolsTotalCount) toolsTotalCount.textContent = total;
        if (toolsPercent) {
            toolsPercent.textContent = `${unlockedCount}%`;
            if (unlockedCount === total) {
                toolsPercent.classList.add('maxed');
            } else {
                toolsPercent.classList.remove('maxed');
            }
        }
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

            // Add special colored status for Abyss map (since icon is hard to see)
            if (isPlaceholder) {
                label.classList.add(map.value ? 'status-unlocked' : 'status-locked');
            }

            mapItem.appendChild(img);
            mapItem.appendChild(label);
            mapsGrid.appendChild(mapItem);
        }

        if (mapsCount) {
            mapsCount.textContent = unlockedCount;
        }
    }

    // Unlockables Tab - Crests grid
    const crestsGrid = document.getElementById('crests-grid');
    const crestsUnlockedCount = document.getElementById('crests-unlocked-count');
    const crestsPercent = document.getElementById('crests-percent');
    if (data.crests) {
        const renderCrestItem = (grid, crest) => {
            const item = document.createElement('div');
            item.className = 'tool-item';

            const img = document.createElement('img');
            const iconFile = (isSteelSoul && crest.iconSteelSoul) ? crest.iconSteelSoul : crest.icon;
            img.src = iconFile ? `assets/img/general/crests/${iconFile}` : '';
            img.alt = crest.display;
            img.title = `${crest.display} (${crest.unlocked ? 'Unlocked' : 'Locked'})`;
            img.className = crest.unlocked ? 'unlocked' : 'locked';

            const label = document.createElement('span');
            label.textContent = crest.display;
            label.title = crest.display;

            item.appendChild(img);
            item.appendChild(label);
            grid.appendChild(item);
        };

        if (crestsGrid) {
            crestsGrid.innerHTML = '';
            data.crests.crests.forEach(c => renderCrestItem(crestsGrid, c));
        }
        if (crestsUnlockedCount) crestsUnlockedCount.textContent = data.crests.stats.unlocked;
        if (crestsPercent) {
            // Hunter is the starting crest and doesn't count toward completion -
            // only the other 6 crests contribute (1% each, 6% max)
            crestsPercent.textContent = `${data.crests.contributionStats.unlocked}%`;
        }
    }

    // Generic renderer for source-checklist sections (Masks, Silk Spool,
    // Silk Hearts, Crafting Kit, Tool Pouch, Craftmetal, Memory Locket,
    // Other Unlockables). `icon` is either a shared filename (string) used
    // for every row, or a function (source, index) => filename for
    // per-item icons.
    const renderSourceChecklist = (containerId, checklistResult, icon) => {
        const container = document.getElementById(containerId);
        if (!container || !checklistResult) return;
        container.innerHTML = '';
        checklistResult.sources.forEach((source, index) => {
            const row = document.createElement('div');
            const state = source.pending ? 'pending' : (source.collected ? 'collected' : 'missing');
            row.className = `source-item ${state}`;

            const left = document.createElement('div');
            left.className = 'source-left';

            const iconFile = typeof icon === 'function' ? icon(source, index) : icon;
            if (iconFile) {
                const img = document.createElement('img');
                img.src = `assets/img/general/${iconFile}`;
                img.alt = source.name;
                img.className = 'source-icon';
                left.appendChild(img);
            }

            const name = document.createElement('span');
            name.className = 'source-name';
            name.textContent = source.name;
            left.appendChild(name);

            const status = document.createElement('span');
            status.className = 'source-status';
            status.textContent = source.pending ? 'Pending' : (source.collected ? 'Collected' : 'Missing');

            row.appendChild(left);
            row.appendChild(status);
            container.appendChild(row);
        });
        return checklistResult.stats;
    };

    // Small helper for the plain id="..." counter/percent badges used across
    // the Unlockables/Collectables sections (distinct from the data-stat
    // driven setStat helper above)
    const setById = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    // Masks (health) - mask count derived from maxHealth, shard sources from checklist.
    // Each mask upgrade contributes 1% to overall completion (5% max), so the
    // percent badge is just the literal mask count, not a unlocked/total ratio.
    const maxHealthForMasks = getField('general', 'maxHealth') || 5;
    const extraMasks = Math.max(0, Math.min(5, maxHealthForMasks - 5));
    setById('masks-unlocked-count', extraMasks);
    setById('masks-percent', `${extraMasks}%`);
    const maskShardStats = renderSourceChecklist('mask-shards-checklist', data.maskShards, 'Inv_0030_inv_health_backboard_mask_2.png');
    if (maskShardStats) setById('mask-shards-collected-count', maskShardStats.collected);

    // Silk Spool - spool points derived from silkMax (base 9, 2 fragments = 1 point).
    // Each point is worth 1% (9% max).
    const silkMaxForSpool = getField('general', 'silkMax') || 9;
    const spoolPoints = Math.max(0, Math.min(9, silkMaxForSpool - 9));
    setById('silk-spool-unlocked-count', spoolPoints);
    setById('silk-spool-percent', `${spoolPoints}%`);
    const spoolStats = renderSourceChecklist('spool-fragments-checklist', data.spoolFragments, 'spool_upgrade_pickup.png');
    if (spoolStats) setById('spool-fragments-collected-count', spoolStats.collected);

    // Silk Hearts - each worth 1% (3% max)
    const silkHeartsCount = getField('general', 'silkRegenMax') || 0;
    setById('silk-hearts-unlocked-count', silkHeartsCount);
    setById('silk-hearts-percent', `${silkHeartsCount}%`);
    renderSourceChecklist('silk-hearts-checklist', data.silkHearts, 'general_silkheart.png');

    // Crafting Kit - each upgrade worth 1% (4% max)
    const craftingTier = getField('general', 'ToolKitUpgrades') || 0;
    setById('crafting-unlocked-count', craftingTier);
    setById('crafting-percent', `${craftingTier}%`);
    renderSourceChecklist('crafting-kit-checklist', data.craftingKit, 'Hornet_Tool_Metal_Pouch.png');

    // Tool Pouch - each upgrade worth 1% (4% max)
    const poolTier = getField('general', 'ToolPouchUpgrades') || 0;
    setById('pouch-unlocked-count', poolTier);
    setById('pouch-percent', `${poolTier}%`);
    renderSourceChecklist('tool-pouch-checklist', data.toolPouch, 'icon_tool_kit_upgrade.png');

    // Needle - base level (level 1) doesn't count toward completion, only the
    // 4 upgrade stages do (1% each, 4% max = nailUpgrades value directly)
    const nailUpgradesForPercent = getField('general', 'nailUpgrades') || 0;
    setById('needle-percent', `${nailUpgradesForPercent}%`);

    // Other Unlockables - Everbloom + Sylphsong, 1% each (2% max).
    // Each has its own icon (Everbloom = white flower, Sylphsong = Eva's heal).
    const otherUnlockablesIcons = ['I_white_flower.png', 'Eva_heal_prompt.png'];
    const otherUnlockablesStats = renderSourceChecklist(
        'other-unlockables-checklist',
        data.otherUnlockables,
        (source, index) => otherUnlockablesIcons[index]
    );
    if (otherUnlockablesStats) {
        setById('other-unlockables-count', otherUnlockablesStats.collected);
        setById('other-unlockables-percent', `${otherUnlockablesStats.collected}%`);
    }

    // Completion summary - the game's own overall completion percentage
    // (covers Tools, Bosses, Maps, etc. too, not just this tab's categories)
    const overallCompletion = getField('general', 'completionPercentage');
    setById('unlockables-completion-percent', overallCompletion !== undefined ? `${overallCompletion.toFixed(1)}%` : '0%');

    // Collectables Tab - Memory Locket & Craftmetal
    const memoryLocketStats = renderSourceChecklist('memory-lockets-checklist', data.memoryLockets, 'Charm_Notch.png');
    if (memoryLocketStats) setById('memory-lockets-collected-count', memoryLocketStats.collected);
    const craftmetalStats = renderSourceChecklist('craftmetal-checklist', data.craftmetal, 'Hornet_Tool_Metal.png');
    if (craftmetalStats) setById('craftmetal-collected-count', craftmetalStats.collected);

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

// Check for pending dropped save file from landing page
async function checkPendingSaveFile() {
    try {
        const stored = sessionStorage.getItem('pending_save_file');
        if (stored) {
            sessionStorage.removeItem('pending_save_file');
            const parsed = JSON.parse(stored);
            const binary = atob(parsed.data);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            const file = new File([bytes], parsed.name, { type: 'application/octet-stream' });

            let attempts = 0;
            while (!wasmReady && attempts < 20) {
                await new Promise(r => setTimeout(r, 100));
                attempts++;
            }
            if (wasmReady) {
                handleFileSelect(file);
            }
        }
    } catch (e) { console.warn('Could not load pending save file:', e); }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setupFileUpload();
    setupTabs();
    initWasm();
    checkPendingSaveFile();

    // Set current year in footer
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});
