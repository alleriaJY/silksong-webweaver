/**
 * Silksong Webweaver - Main JavaScript
 * 
 * Handles file upload, WASM-based decryption, tab navigation, and stats display
 */

import init, { decrypt_and_parse } from '../pkg/wasm_crypto.js';

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

        console.log('Processing file...', bytes.length, 'bytes');

        // Decrypt and parse using WASM
        const result = decrypt_and_parse(bytes);

        if (result.success) {
            currentData = result.data;
            displayStats(result.data);
            console.log('✓ Save file parsed successfully');
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

    // General Tab - Game Info
    setStat('version', data.version || 'Unknown');
    setStat('permadeath', data.permadeathMode ? 'Steel Soul' : 'Classic');
    setStat('completion', `${data.completionPercentage?.toFixed(1) || 0}%`);
    setStat('playTime', data.playTimeFormatted || '00h 00m 00s');

    // General Tab - Max Unlocked
    setStat('maxHealth', data.maxHealth);
    setStat('maxSilk', data.maxSilk);
    setStat('silkHearts', data.silkHearts);

    // Current Stats Tab - Health & Silk
    setStat('healthDisplay', `${data.health}/${data.maxHealth}`);
    setStat('silkDisplay', `${data.silk}/${data.maxSilk}`);

    // Update health bar
    const healthPercent = data.maxHealth > 0 ? (data.health / data.maxHealth) * 100 : 100;
    const healthFill = document.getElementById('health-fill');
    if (healthFill) {
        healthFill.style.width = `${healthPercent}%`;
    }

    // Current Stats Tab - Currency
    setStat('geo', data.geo?.toLocaleString() || '0');
    setStat('shellShards', data.shellShards?.toLocaleString() || '0');

    // Current Stats Tab - Equipment
    setStat('crest', data.currentCrestId || 'None');

    // Current Stats Tab - Position
    setStat('currentArea', data.currentArea || 'Unknown');
    setStat('mapZone', data.mapZone);
    setStat('atBench', data.atBench ? '✓ Yes' : '✗ No');

    // Misc Tab - Respawn Info
    setStat('respawnScene', data.respawnScene || 'Unknown');
    setStat('respawnMarker', data.respawnMarkerName || '-');
    setStat('respawnType', data.respawnType);

    // Tools Tab
    setStat('toolsTotal', data.toolsTotal);
    setStat('toolsUnlocked', data.toolsUnlocked);
    setStat('toolsSeen', data.toolsSeen);

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
