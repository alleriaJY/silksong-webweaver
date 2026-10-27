/**
 * Window-wide drop overlay: a save dropped anywhere on the app opens it.
 */

const OVERLAY_HTML = `
    <div class="global-drop-content">
        <div class="global-drop-title">Let go to open this save</div>
        <div class="global-drop-subtitle">user1.dat to user4.dat · read in your browser, never uploaded</div>
    </div>
`;

/** Show an overlay while a file is dragged over the window; call onFile on drop. */
export function setupGlobalDragDrop(onFile) {
    let overlay = document.getElementById('global-drop-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'global-drop-overlay';
        overlay.className = 'global-drop-overlay';
        overlay.setAttribute('aria-hidden', 'true');
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
