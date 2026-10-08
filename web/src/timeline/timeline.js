/**
 * Hero's Path: replays scenesVisited over the Pharloom map, lighting the tiles
 * each scene draws, with the save's story events as markers. "In-game map"
 * limits it to scenes the save's own map shows (scenesMapped). Reads the save from the shared saveStore, so the save
 * uploaded on any page drives it; it never decrypts on its own.
 *
 *   const timeline = mountTimeline(root, saveStore, { onUpload });
 *   timeline.show();   // when its page becomes visible
 *   timeline.hide();
 */
import { FULLMAP, areaOf, litTiles, loadMapData, spriteOf, tilesForScene } from '../map/sceneTiles.js';
import { mergedList } from '../data/packs/index.js';
import { EVENT_COLORS, formatPlayTime, placeEvents } from './story.js';

const PLAY_DURATION_MS = 30000;   // a whole save plays in 30 s
const RECENT = 10;                // scenes listed in "Recently revealed"
const MIN_SCALE = 0.1, MAX_SCALE = 3;

const TEMPLATE = `
    <div class="tl-header">
        <h1>Hero's Path</h1>
        <span class="tl-file" data-ref="file"></span>
        <div class="tl-stats">
            <div>Revealed tiles: <span data-ref="revealed">0</span></div>
            <div>Mapped tiles: <span data-ref="total">0</span></div>
            <div>Story events: <span data-ref="events">0</span></div>
        </div>
        <div class="tl-mode" role="group" aria-label="Which rooms to show">
            <button class="on" data-act="mode-visited" title="Every room you have entered">Visited</button>
            <button data-act="mode-mapped" title="Only rooms your in-game map shows">In-game map</button>
        </div>
    </div>
    <div class="tl-controls">
        <button class="tl-step" data-act="start" title="Go to start (Home)">⏮</button>
        <button class="tl-step" data-act="prev" title="Previous scene (←)">⏪</button>
        <button class="tl-step tl-play" data-act="play" title="Play / pause (Space)">▶</button>
        <div class="tl-track">
            <input type="range" class="tl-slider" data-ref="slider" min="0" max="0" value="0" aria-label="Timeline position">
            <div class="tl-marks" data-ref="marks"></div>
        </div>
        <button class="tl-step" data-act="next" title="Next scene (→)">⏩</button>
        <button class="tl-step" data-act="end" title="Go to end (End)">⏭</button>
        <div class="tl-position"><span class="tl-current" data-ref="pos">0</span> / <span data-ref="count">0</span></div>
        <div class="tl-scene" data-ref="scene">No scene selected</div>
    </div>
    <div class="tl-body">
        <div class="tl-map" data-ref="map">
            <div class="tl-world" data-ref="world">
                <img class="tl-fullmap" alt="Pharloom map" draggable="false">
                <div class="tl-dark"></div>
                <div data-ref="tiles"></div>
                <div data-ref="pins"></div>
            </div>
            <div class="tl-zoom">
                <button class="tl-zoom-btn" data-act="zoom-in" title="Zoom in">+</button>
                <button class="tl-zoom-btn" data-act="zoom-out" title="Zoom out">−</button>
                <button class="tl-zoom-btn" data-act="zoom-reset" title="Fit map">⌂</button>
            </div>
            <div class="tl-empty" data-ref="empty">
                <h2>Hero's Path</h2>
                <p data-ref="empty-text">Upload a save to replay your journey across Pharloom.</p>
                <button class="tl-upload" data-act="upload">Upload save</button>
            </div>
        </div>
        <aside class="tl-side">
            <h2>Recently revealed</h2>
            <div class="tl-recent" data-ref="recent"><p class="tl-muted">No scenes yet</p></div>
            <h2 class="tl-events-title">Story events</h2>
            <div class="tl-legend" data-ref="legend"></div>
            <div class="tl-recent" data-ref="event-list"><p class="tl-muted">None yet</p></div>
            <p class="tl-muted tl-keys">Keys: ← → step · Space play · Home / End</p>
        </aside>
    </div>`;

export function mountTimeline(root, store, { onUpload } = {}) {
    root.classList.add('timeline');
    root.innerHTML = TEMPLATE;
    const ref = name => root.querySelector(`[data-ref="${name}"]`);
    const areas = mergedList('areas');

    let map = null, mapLoading = null;     // published map data, loaded on first show
    let overlays = {};                      // tile name -> element
    let scenes = [];
    let events = [];                        // story events placed on the timeline
    let mapped = new Set();                 // scenesMapped
    let mode = 'visited';                   // 'visited' | 'mapped'
    let pins = [];                          // [{ event, el }]
    let lookup = () => [];
    let position = 0;
    let active = false, fitted = false;
    let timer = null;
    const view = { scale: 0.2, x: 0, y: 0 };

    // ------------------------------------------------------------ map data
    function ensureMap() {
        if (!mapLoading) {
            mapLoading = loadMapData().then(data => {
                map = data;
                const img = root.querySelector('.tl-fullmap');
                img.src = FULLMAP + 'full_pharloom_clean.webp';
                Object.assign(ref('world').style, { width: map.width + 'px', height: map.height + 'px' });
                const frag = document.createDocumentFragment();
                for (const [name, tile] of Object.entries(map.tiles)) {
                    const el = document.createElement('div');
                    el.className = 'tl-tile';
                    Object.assign(el.style, { left: tile.x + 'px', top: tile.y + 'px', width: tile.width + 'px', height: tile.height + 'px' });
                    const sprite = document.createElement('img');
                    sprite.alt = '';
                    sprite.src = FULLMAP + encodeURIComponent(spriteOf(name, tile));
                    el.appendChild(sprite);
                    frag.appendChild(el);
                    overlays[name] = el;
                }
                ref('tiles').appendChild(frag);
                ref('total').textContent = Object.keys(map.tiles).length;
                const cache = new Map();
                lookup = scene => {
                    if (!cache.has(scene)) cache.set(scene, tilesForScene(scene, map.sceneTiles, map.tiles));
                    return cache.get(scene);
                };
                buildPins();
            }).catch(err => {
                mapLoading = null;
                ref('empty-text').textContent = 'Could not load the map data: ' + err.message;
                throw err;
            });
        }
        return mapLoading;
    }

    // ------------------------------------------------------------ save
    function applyStore(s) {
        stop();
        ref('file').textContent = s.fileName ? `✓ ${s.fileName}` : '';
        const visited = s.status === 'ready' ? (s.save?.playerData?.scenesVisited || []) : [];
        scenes = visited;
        const empty = ref('empty');
        empty.hidden = scenes.length > 0;
        ref('empty-text').textContent = {
            loading: 'Decrypting your save…',
            error: `Could not read that save: ${s.error || 'unknown error'}`,
            ready: 'This save has no visited scenes yet.',
        }[s.status] || 'Upload a save to replay your journey across Pharloom.';
        root.querySelector('[data-act="upload"]').hidden = s.status === 'loading';
        ref('slider').max = scenes.length;
        ref('count').textContent = scenes.length;
        const pd = s.status === 'ready' ? s.save?.playerData : null;
        mapped = new Set(pd?.scenesMapped || []);
        events = placeEvents(s.status === 'ready' ? (s.parsed?.story?.events || []) : [], scenes);
        ref('events').textContent = events.length;
        renderMarks();
        if (map) buildPins();
        if (map) seek(scenes.length);        // a fresh save opens on the full journey
        else position = scenes.length;
    }

    // ------------------------------------------------------------ timeline
    function seek(pos) {
        position = Math.max(0, Math.min(scenes.length, pos));
        ref('slider').value = position;
        if (!map) return;
        const show = mode === 'mapped' ? (scene => (mapped.has(scene) ? lookup(scene) : [])) : lookup;
        const lit = litTiles(scenes, position, show);
        for (const [name, el] of Object.entries(overlays)) el.classList.toggle('revealed', lit.has(name));
        ref('pos').textContent = position;
        ref('revealed').textContent = lit.size;
        const scene = scenes[position - 1];
        const area = scene && areaOf(scene, areas);
        const sceneEl = ref('scene');
        sceneEl.textContent = scene || 'Start';
        if (area) {
            const tag = document.createElement('span');
            tag.className = 'tl-area';
            tag.textContent = ` [${area.display || area.prefix}]`;
            sceneEl.appendChild(tag);
        }
        for (const { event, el } of pins) el.hidden = event.index > position;
        renderRecent();
        renderEvents();
    }

    // ------------------------------------------------------------ story events
    function renderMarks() {
        const marks = ref('marks');
        marks.replaceChildren();
        for (const e of events) {
            const m = document.createElement('button');
            m.className = 'tl-mark';
            m.style.left = `${scenes.length ? (100 * e.index) / scenes.length : 0}%`;
            m.style.background = EVENT_COLORS[e.type] || '#ccc';
            m.title = `Story event (type ${e.type}) · ${e.scene} · ${formatPlayTime(e.playTime)}`;
            m.addEventListener('click', () => { stop(); seek(e.index); });
            marks.appendChild(m);
        }
        const legend = ref('legend');
        legend.replaceChildren();
        const types = [...new Set(events.map(e => e.type))].sort();
        for (const t of types) {
            const item = document.createElement('span');
            const dot = document.createElement('i');
            dot.style.background = EVENT_COLORS[t] || '#ccc';
            item.append(dot, `type ${t}`);
            legend.appendChild(item);
        }
        if (types.length) legend.append(' (meaning not yet known)');
    }

    function buildPins() {
        const layer = ref('pins');
        layer.replaceChildren();
        pins = [];
        for (const event of events) {
            const names = lookup(event.scene);
            if (!names.length) continue;
            // centre of the scene's tiles
            const boxes = names.map(n => map.tiles[n]);
            const x0 = Math.min(...boxes.map(b => b.x)), x1 = Math.max(...boxes.map(b => b.x + b.width));
            const y0 = Math.min(...boxes.map(b => b.y)), y1 = Math.max(...boxes.map(b => b.y + b.height));
            const el = document.createElement('div');
            el.className = 'tl-pin';
            el.style.left = `${(x0 + x1) / 2}px`;
            el.style.top = `${(y0 + y1) / 2}px`;
            el.style.background = EVENT_COLORS[event.type] || '#ccc';
            el.title = `Story event (type ${event.type}) · ${event.scene} · ${formatPlayTime(event.playTime)}`;
            el.hidden = true;
            layer.appendChild(el);
            pins.push({ event, el });
        }
    }

    function renderEvents() {
        const list = ref('event-list');
        list.replaceChildren();
        for (let i = events.length - 1; i >= 0; i--) {
            const e = events[i];
            if (e.index > position) continue;
            const row = document.createElement('button');
            row.className = 'tl-recent-item tl-event';
            const dot = document.createElement('i');
            dot.style.background = EVENT_COLORS[e.type] || '#ccc';
            const name = document.createElement('span');
            name.append(dot, e.scene);
            const time = document.createElement('span');
            time.className = 'tl-muted';
            time.textContent = formatPlayTime(e.playTime);
            row.append(name, time);
            row.title = `Type ${e.type} · reached at scene ${e.index} of ${scenes.length}`;
            row.addEventListener('click', () => { stop(); seek(e.index); });
            list.appendChild(row);
        }
        if (!list.children.length) {
            const p = document.createElement('p');
            p.className = 'tl-muted';
            p.textContent = events.length ? 'None reached yet' : 'This save has no story events';
            list.appendChild(p);
        }
    }

    function setMode(next) {
        mode = next;
        root.querySelector('[data-act="mode-visited"]').classList.toggle('on', mode === 'visited');
        root.querySelector('[data-act="mode-mapped"]').classList.toggle('on', mode === 'mapped');
        seek(position);
    }

    function renderRecent() {
        const list = ref('recent');
        list.replaceChildren();
        for (let i = position - 1; i >= Math.max(0, position - RECENT); i--) {
            const n = lookup(scenes[i]).length;
            const row = document.createElement('div');
            row.className = 'tl-recent-item';
            const name = document.createElement('span');
            name.textContent = scenes[i];
            const count = document.createElement('span');
            count.className = n ? 'tl-area' : 'tl-muted';
            count.textContent = `${n} tile${n === 1 ? '' : 's'}`;
            row.append(name, count);
            list.appendChild(row);
        }
        if (!list.children.length) {
            const p = document.createElement('p');
            p.className = 'tl-muted';
            p.textContent = 'No scenes yet';
            list.appendChild(p);
        }
    }

    function play() {
        if (!scenes.length) return;
        if (position >= scenes.length) seek(0);
        const btn = root.querySelector('[data-act="play"]');
        btn.textContent = '⏸';
        btn.classList.add('playing');
        timer = setInterval(() => {
            if (position >= scenes.length) return stop();
            seek(position + 1);
        }, PLAY_DURATION_MS / scenes.length);
    }

    function stop() {
        clearInterval(timer);
        timer = null;
        const btn = root.querySelector('[data-act="play"]');
        btn.textContent = '▶';
        btn.classList.remove('playing');
    }

    // ------------------------------------------------------------ pan / zoom
    function applyView() {
        const world = ref('world');
        world.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
        world.style.setProperty('--zoom', view.scale);   // pins stay the same size on screen
    }
    function fit() {
        if (!map) return;
        const box = ref('map').getBoundingClientRect();
        if (!box.width || !box.height) return;   // not laid out yet; the ResizeObserver refits
        view.scale = Math.min(box.width / map.width, box.height / map.height) * 0.98;
        view.x = (box.width - map.width * view.scale) / 2;
        view.y = (box.height - map.height * view.scale) / 2;
        applyView();
        fitted = true;
    }
    function zoomAt(px, py, factor) {
        const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, view.scale * factor));
        view.x = px - (px - view.x) * (next / view.scale);
        view.y = py - (py - view.y) * (next / view.scale);
        view.scale = next;
        applyView();
    }
    function zoomCentre(factor) {
        const box = ref('map').getBoundingClientRect();
        zoomAt(box.width / 2, box.height / 2, factor);
    }

    const mapEl = ref('map');
    const pointers = new Map();
    let pinch = null;
    mapEl.addEventListener('pointerdown', e => {
        if (e.target.closest('button')) return;
        mapEl.setPointerCapture(e.pointerId);
        pointers.set(e.pointerId, [e.clientX, e.clientY]);
        mapEl.classList.add('dragging');
    });
    mapEl.addEventListener('pointermove', e => {
        const last = pointers.get(e.pointerId);
        if (!last) return;
        pointers.set(e.pointerId, [e.clientX, e.clientY]);
        if (pointers.size === 2) {                      // pinch zoom
            const [a, b] = [...pointers.values()];
            const dist = Math.hypot(a[0] - b[0], a[1] - b[1]);
            const box = mapEl.getBoundingClientRect();
            if (pinch) zoomAt((a[0] + b[0]) / 2 - box.left, (a[1] + b[1]) / 2 - box.top, dist / pinch);
            pinch = dist;
            return;
        }
        view.x += e.clientX - last[0];
        view.y += e.clientY - last[1];
        applyView();
    });
    const release = e => {
        pointers.delete(e.pointerId);
        pinch = null;
        if (!pointers.size) mapEl.classList.remove('dragging');
    };
    mapEl.addEventListener('pointerup', release);
    mapEl.addEventListener('pointercancel', release);
    mapEl.addEventListener('wheel', e => {
        e.preventDefault();
        const box = mapEl.getBoundingClientRect();
        zoomAt(e.clientX - box.left, e.clientY - box.top, e.deltaY > 0 ? 0.9 : 1.1);
    }, { passive: false });

    // ------------------------------------------------------------ controls
    const actions = {
        start: () => { stop(); seek(0); },
        prev: () => { stop(); seek(position - 1); },
        next: () => { stop(); seek(position + 1); },
        end: () => { stop(); seek(scenes.length); },
        play: () => (timer ? stop() : play()),
        'zoom-in': () => zoomCentre(1.2),
        'zoom-out': () => zoomCentre(1 / 1.2),
        'zoom-reset': fit,
        upload: () => onUpload?.(),
        'mode-visited': () => setMode('visited'),
        'mode-mapped': () => setMode('mapped'),
    };
    root.addEventListener('click', e => {
        const btn = e.target.closest('[data-act]');
        if (btn && actions[btn.dataset.act]) actions[btn.dataset.act]();
    });
    ref('slider').addEventListener('input', e => { stop(); seek(Number(e.target.value)); });
    document.addEventListener('keydown', e => {
        if (!active || !scenes.length || e.target.closest?.('input:not([type="range"]), select, textarea')) return;
        const keys = { ArrowLeft: 'prev', ArrowRight: 'next', Home: 'start', End: 'end', ' ': 'play' };
        if (keys[e.key]) {
            e.preventDefault();
            actions[keys[e.key]]();
        }
    });
    // Fit once the map area has a size (it is 0 x 0 while its page is hidden).
    new ResizeObserver(() => { if (active && !fitted) fit(); }).observe(mapEl);

    store.subscribe(applyStore);
    applyStore(store.get());

    return {
        async show() {
            active = true;
            await ensureMap();
            if (!fitted) fit();
            seek(position);
        },
        hide() {
            active = false;
            stop();
        },
    };
}
