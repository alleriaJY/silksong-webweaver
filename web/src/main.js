/**
 * Silksong Webweaver - stats page bootstrap.
 *
 * Wires the upload UI, decrypts with WASM (core/wasm.js), parses every
 * category (data/categories) and renders them. Category-specific code lives
 * in data/categories/<id>.js, never here.
 */

import { loadWasm, decryptSave, SaveDecryptError } from './core/wasm.js';
import { parseAllData, renderAll } from './data/categories/index.js';
import { setupGlobalDragDrop, takePendingSaveFile } from './app/upload.js';
import { setupTabs, switchTab } from './app/tabs.js';
import { showBuildInfo } from './app/buildInfo.js';
import { saveStore } from './app/saveStore.js';
import { mountTimeline } from './timeline/timeline.js';
import { checkSave, describeProblem } from './app/errors.js';

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
    uploadModalClose.addEventListener('click', hideUploadModal);
    uploadModalBackdrop.addEventListener('click', hideUploadModal);

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

function showUploadModal() {
    uploadModal.hidden = false;
    hideError();
}

function hideUploadModal() {
    uploadModal.hidden = true;
}

/** Back to the empty state. */
function resetStats() {
    selectedFile = null;
    currentData = null;
    fileName.textContent = '';
    uploadArea.classList.remove('has-file');
    statsSection.hidden = true;
    resetBtn.hidden = true;
    fileInput.value = '';
    hideError();
    saveStore.reset();
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
    statsSection.hidden = true;
    saveStore.set({ status: 'error', save: null, parsed: null, error: describeProblem(kind).title });
}

function hideError() {
    errorMessage.hidden = true;
}

/** Analyse a save dropped on the landing page, once WASM is ready. */
async function openPendingSaveFile() {
    const file = takePendingSaveFile();
    if (!file) return;
    try {
        await loadWasm();
    } catch {
        return; // initWasm already reported the failure
    }
    wasmReady = true;
    handleFileSelect(file);
}

document.addEventListener('DOMContentLoaded', () => {
    setupFileUpload();
    setupTabs(tabNav);
    initWasm();
    openPendingSaveFile();
    showBuildInfo();

    // Hero's Path reads the shared save; it builds its map the first time it is shown
    const timelineRoot = document.getElementById('timeline-root');
    if (timelineRoot) {
        const timeline = mountTimeline(timelineRoot, saveStore, { onUpload: showUploadModal });
        window.addEventListener('app:page', (e) => (e.detail === 'timeline' ? timeline.show() : timeline.hide()));
        if (document.getElementById('page-timeline')?.classList.contains('active')) timeline.show();
    }

    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});
