/**
 * Silksong Webweaver - app bootstrap (index.html).
 *
 * Wires the hash router (app/router.js), the upload UI, decrypts with WASM
 * (core/wasm.js), parses every category (data/categories) and renders them.
 * Before a save is loaded (and after Clear or a failed load) the stats page
 * shows its real layout as a placeholder: values read N/A and item lists are
 * blurred, so nothing is spoiled.
 * Category-specific code lives in data/categories/<id>.js, never here.
 */

import { loadWasm, decryptSave, SaveDecryptError } from './core/wasm.js';
import { parseAllData, renderAll } from './data/categories/index.js';
import { setupGlobalDragDrop } from './app/upload.js';
import { setupTabs, switchTab } from './app/tabs.js';
import { showBuildInfo } from './app/buildInfo.js';
import { saveStore } from './app/saveStore.js';
import { mountTimeline } from './timeline/timeline.js';
import { checkSave, describeProblem } from './app/errors.js';
import { startRouter } from './app/router.js';
import { showScene } from './app/scene.js';

// State
let wasmReady = false;
let selectedFile = null;
let currentData = null; // last parsed save

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
const errorHint = document.getElementById('error-hint');
const errorDetail = document.getElementById('error-detail');
const statsSection = document.getElementById('stats-section');
const tabNav = document.getElementById('tab-nav');
const emptyBanner = document.getElementById('empty-banner');

// Item lists and visuals that are blurred while no save is loaded
const PLACEHOLDER_BLUR = '[role="list"], .source-checklist, .inventory-list, .icon-container, '
    + '.equipped-tools-row, .equipment-columns, .completion-breakdown, .stat-bar';
// Values that read N/A while no save is loaded, and counts that read a dash ("Unlocked: –/6")
const PLACEHOLDER_VALUES = '.stat-value, .percent-value, .completion-big-number, #completion-modelled strong';
const PLACEHOLDER_COUNTS = '.unlocked-stats strong, .panel-description strong';

async function initWasm() {
    try {
        await loadWasm();
        wasmReady = true;
        console.log('✓ WASM module initialized');
    } catch (error) {
        console.error('Failed to initialize WASM:', error);
        showError('wasm-load', error.message);
    }
}

function setupFileUpload() {
    uploadBtn.addEventListener('click', showUploadModal);
    document.getElementById('empty-upload-btn')?.addEventListener('click', showUploadModal);
    uploadModalClose.addEventListener('click', hideUploadModal);
    uploadModalBackdrop.addEventListener('click', hideUploadModal);
    uploadModal.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideUploadModal(); });
    // The file input is hidden; its label acts as the button from the keyboard
    document.getElementById('upload-label')?.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        fileInput.click();
    });

    // Picking a file analyses it straight away
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFileSelect(e.target.files[0]);
    });

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
        if (e.dataTransfer.files.length > 0) handleFileSelect(e.dataTransfer.files[0]);
    });

    resetBtn.addEventListener('click', resetStats);
    setupGlobalDragDrop(handleFileSelect);
}

let uploadReturnFocus = null;

function showUploadModal() {
    uploadReturnFocus = document.activeElement;
    uploadModal.hidden = false;
    hideError();
    document.getElementById('upload-label')?.focus();
}

function hideUploadModal() {
    if (uploadModal.hidden) return;
    uploadModal.hidden = true;
    uploadReturnFocus?.focus?.();
}

/** Back to the empty state. */
function resetStats() {
    selectedFile = null;
    currentData = null;
    fileName.textContent = '';
    uploadArea.classList.remove('has-file');
    resetBtn.hidden = true;
    fileInput.value = '';
    hideError();
    showPlaceholder();
    saveStore.reset();
}

/** The stats page with no save: the real layout, N/A values, blurred lists. */
function showPlaceholder() {
    renderAll(parseAllData({}, {}));
    switchTab(tabNav, 'general');
    for (const el of statsSection.querySelectorAll(PLACEHOLDER_VALUES)) el.textContent = 'N/A';
    for (const el of statsSection.querySelectorAll(PLACEHOLDER_COUNTS)) el.textContent = '–';
    for (const el of statsSection.querySelectorAll(PLACEHOLDER_BLUR)) {
        el.classList.add('is-placeholder');
        el.inert = true;   // blurred names stay out of reach of keyboard and screen readers
    }
    statsSection.classList.add('is-empty');
    emptyBanner.hidden = false;
    statsSection.hidden = false;
}

function clearPlaceholder() {
    for (const el of statsSection.querySelectorAll('.is-placeholder')) {
        el.classList.remove('is-placeholder');
        el.inert = false;
    }
    statsSection.classList.remove('is-empty');
    emptyBanner.hidden = true;
}

async function handleFileSelect(file) {
    hideError();
    if (!file.name.endsWith('.dat')) {
        showError('file-type', `Got "${file.name}".`);
        return;
    }
    selectedFile = file;
    fileName.textContent = file.name;
    uploadArea.classList.add('has-file');
    console.log('File selected:', file.name, `(${(file.size / 1024).toFixed(1)} KB)`);
    await analyzeFile();
}

async function analyzeFile() {
    if (!selectedFile) return;
    if (!wasmReady) {
        showError('wasm-load', 'Still loading; try again in a moment.');
        return;
    }

    hideUploadModal();
    loading.hidden = false;
    statsSection.hidden = true;
    hideError();
    saveStore.set({ status: 'loading', fileName: selectedFile.name, error: null });

    // Each stage reports its own kind of problem (app/errors.js)
    let stage = 'decrypt';
    try {
        const bytes = new Uint8Array(await selectedFile.arrayBuffer());
        const save = decryptSave(bytes);
        const blocking = checkSave(save);
        if (blocking) {
            fail(blocking.kind, blocking.detail);
            return;
        }
        stage = 'parse';
        currentData = parseAllData(save.playerData, save.sceneData);
        displayStats(currentData);
        resetBtn.hidden = false;
        saveStore.set({ status: 'ready', save, parsed: currentData });
        const warning = checkSave(save, currentData);
        if (warning) showError(warning.kind, warning.detail);
    } catch (error) {
        console.error('Analysis failed:', error);
        fail(error instanceof SaveDecryptError || stage === 'decrypt' ? 'decrypt' : 'parse', error.message);
    } finally {
        loading.hidden = true;
    }
}

function displayStats(data) {
    clearPlaceholder();
    statsSection.hidden = false;
    renderAll(data);
    switchTab(tabNav, 'general');
    statsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Show a problem from app/errors.js; warnings use the amber style. */
function showError(kind, detail = '') {
    const { title, hint, severity } = describeProblem(kind, detail);
    errorText.textContent = title;
    errorHint.textContent = hint;
    errorDetail.textContent = detail;
    errorMessage.classList.toggle('warning', severity === 'warning');
    errorMessage.hidden = false;
}

/** A save that cannot be shown: report it here and to the other pages. */
function fail(kind, detail) {
    showError(kind, detail);
    showPlaceholder();
    saveStore.set({ status: 'error', save: null, parsed: null, error: describeProblem(kind).title });
}

function hideError() {
    errorMessage.hidden = true;
}

document.addEventListener('DOMContentLoaded', () => {
    showScene();
    setupFileUpload();
    setupTabs(tabNav);
    showPlaceholder();
    initWasm();
    showBuildInfo();

    // Hero's Path reads the shared save; it builds its map the first time it is shown
    const timelineRoot = document.getElementById('timeline-root');
    if (timelineRoot) {
        const timeline = mountTimeline(timelineRoot, saveStore, { onUpload: showUploadModal });
        window.addEventListener('app:page', (e) => (e.detail === 'timeline' ? timeline.show() : timeline.hide()));
    }
    startRouter();   // after the listeners: it announces the first page

    for (const el of document.querySelectorAll('[data-year]')) el.textContent = new Date().getFullYear();
});
