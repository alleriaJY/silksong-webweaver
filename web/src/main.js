/**
 * Silksong Webweaver - stats page bootstrap.
 *
 * Wires the upload UI, decrypts with WASM (core/wasm.js), parses every
 * category (data/categories) and renders them. Category-specific code lives
 * in data/categories/<id>.js, never here.
 */

import { loadWasm, decryptSave } from './core/wasm.js';
import { parseAllData, renderAll } from './data/categories/index.js';
import { setupGlobalDragDrop, takePendingSaveFile } from './app/upload.js';
import { setupTabs, switchTab } from './app/tabs.js';

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
const statsSection = document.getElementById('stats-section');
const tabNav = document.getElementById('tab-nav');

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
}

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
    await analyzeFile();
}

async function analyzeFile() {
    if (!selectedFile) {
        showError('Please select a save file first');
        return;
    }
    if (!wasmReady) {
        showError('Decryption module not ready. Please wait or refresh the page.');
        return;
    }

    hideUploadModal();
    loading.hidden = false;
    statsSection.hidden = true;
    hideError();

    try {
        const bytes = new Uint8Array(await selectedFile.arrayBuffer());
        const save = decryptSave(bytes);
        currentData = parseAllData(save.playerData, save.sceneData);
        displayStats(currentData);
        resetBtn.hidden = false;
    } catch (error) {
        console.error('Analysis failed:', error);
        showError('Failed to analyze save file: ' + error.message);
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

function showError(message) {
    errorText.textContent = message;
    errorMessage.hidden = false;
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

    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});
