/**
 * Upload plumbing shared by the stats page: the window-wide drop overlay and
 * the landing-page hand-off (index.html stores a dropped save in
 * sessionStorage and redirects here).
 */

const OVERLAY_HTML = `
    <div class="global-drop-content">
        <div class="global-drop-icon">📥</div>
        <div class="global-drop-title">Drop Save File Anywhere</div>
        <div class="global-drop-subtitle">Release your save file (user1.dat to user4.dat) to decrypt &amp; analyze instantly</div>
    </div>
`;

/** Show an overlay while a file is dragged over the window; call onFile on drop. */
export function setupGlobalDragDrop(onFile) {
    let overlay = document.getElementById('global-drop-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'global-drop-overlay';
        overlay.className = 'global-drop-overlay';
        overlay.innerHTML = OVERLAY_HTML;
        document.body.appendChild(overlay);
    }

    // dragenter/dragleave fire for every child element; count them
    let depth = 0;
    window.addEventListener('dragenter', (e) => {
        e.preventDefault();
        depth++;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) overlay.classList.add('active');
    });
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('dragleave', (e) => {
        e.preventDefault();
        depth--;
        if (depth <= 0) {
            depth = 0;
            overlay.classList.remove('active');
        }
    });
    window.addEventListener('drop', (e) => {
        e.preventDefault();
        depth = 0;
        overlay.classList.remove('active');
        if (e.dataTransfer.files.length > 0) onFile(e.dataTransfer.files[0]);
    });
}

export const PENDING_SAVE_KEY = 'pending_save_file';

/** Take (and clear) a save handed over by the landing page, as a File, or null. */
export function takePendingSaveFile() {
    try {
        const stored = sessionStorage.getItem(PENDING_SAVE_KEY);
        if (!stored) return null;
        sessionStorage.removeItem(PENDING_SAVE_KEY);
        const { name, data } = JSON.parse(stored);
        const binary = atob(data);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return new File([bytes], name, { type: 'application/octet-stream' });
    } catch (e) {
        console.warn('Could not load pending save file:', e);
        return null;
    }
}
