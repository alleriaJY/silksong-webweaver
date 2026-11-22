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
import { FULLMAP, areaOf, litTiles, loadMapData, spriteFile, tilesForScene } from '../map/sceneTiles.js';
import { mergedList } from '../data/packs/index.js';
import { EVENT_COLORS, buildMissingPins, buildRespawnPin, eventLabel, formatPlayTime, placeEvents, sceneBoundsCenter } from './story.js';

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
            <div>Respawn bench: <span data-ref="bench">–</span></div>
        </div>
        <div class="tl-mode" role="group" aria-label="Which rooms to show">
            <button class="on" data-act="mode-visited" title="Every room you have entered">Visited</button>
            <button data-act="mode-mapped" title="Only rooms your in-game map shows">In-game map</button>
            <button data-act="toggle-missing" data-ref="missing-btn" title="Pin uncollected Mask Shards, Spool Fragments, Lockets, Fleas, and upgrades on the map">Missing items (0)</button>
        </div>
    </div>
    <div class="tl-controls">
        <button class="tl-step" data-act="start" title="Go to start (Home)" aria-label="Go to start">⏮\uFE0E</button>
        <button class="tl-step" data-act="prev" title="Previous scene (←)" aria-label="Previous scene">⏪\uFE0E</button>
        <button class="tl-step tl-play" data-act="play" title="Play / pause (Space)" aria-label="Play / pause">▶\uFE0E</button>
        <div class="tl-track">
            <input type="range" class="tl-slider" data-ref="slider" min="0" max="0" value="0" aria-label="Timeline position">
            <div class="tl-marks" data-ref="marks"></div>
        </div>
        <button class="tl-step" data-act="next" title="Next scene (→)" aria-label="Next scene">⏩\uFE0E</button>
        <button class="tl-step" data-act="end" title="Go to end (End)" aria-label="Go to end">⏭\uFE0E</button>
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
                <button class="tl-zoom-btn" data-act="zoom-in" title="Zoom in" aria-label="Zoom in">+</button>
                <button class="tl-zoom-btn" data-act="zoom-out" title="Zoom out" aria-label="Zoom out">−</button>
                <button class="tl-zoom-btn" data-act="zoom-reset" title="Fit map" aria-label="Fit map">⌂</button>
            </div>
            <div class="tl-tooltip" data-ref="tooltip" role="tooltip" hidden></div>
            <div class="tl-empty" data-ref="empty">
                <h2>Hero's Path</h2>
                <p data-ref="empty-text">Open a save to replay your journey across Pharloom.</p>
                <button class="tl-upload" data-act="upload">Open a save</button>
            </div>
        </div>
        <aside class="tl-side">
            <h2>Recently revealed</h2>
            <div class="tl-recent" data-ref="recent"><p class="tl-muted">No scenes yet</p></div>
            <h2 class="tl-events-title">Story events</h2>
            <div class="tl-legend" data-ref="legend"></div>
            <div class="tl-recent" data-ref="event-list"><p class="tl-muted">None yet</p></div>
            <div data-ref="missing-section" hidden>
                <h2 class="tl-events-title">Missing items (<span data-ref="missing-count">0</span>)</h2>
                <div class="tl-recent" data-ref="missing-list"></div>
            </div>
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
    let currentPd = null;                   // active save playerData
    let currentParsed = null;               // active save parsed categories
    let mode = 'visited';                   // 'visited' | 'mapped'
    let showMissing = false;                // toggle for uncollected item pins
    let pins = [];                          // [{ event, el }]
    let missingPins = [];                   // [{ item, el }]
    let hiddenTypes = new Set();            // filtered-out StoryEvent EventType values
    let activeEvent = null;                 // last clicked StoryEvent for pin highlight
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
                    // the image is fetched when the tile is first revealed (see seek)
                    el.dataset.src = FULLMAP + encodeURIComponent(spriteFile(name, tile));
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
            error: `${s.error || 'Could not read that save.'} See Statistics for details.`,
            ready: 'This save has no visited scenes yet.',
        }[s.status] || 'Open a save to replay your journey across Pharloom.';
        root.querySelector('[data-act="upload"]').hidden = s.status === 'loading';
        ref('slider').max = scenes.length;
        ref('count').textContent = scenes.length;
        const pd = s.status === 'ready' ? s.save?.playerData : null;
        currentPd = pd;
        currentParsed = s.status === 'ready' ? s.parsed : null;
        ref('bench').textContent = pd?.respawnScene || '–';
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
        for (const [name, el] of Object.entries(overlays)) {
            const on = lit.has(name);
            if (on && el.dataset.src) {
                const sprite = document.createElement('img');
                sprite.alt = '';
                sprite.decoding = 'async';
                sprite.draggable = false;
                sprite.src = el.dataset.src;
                el.appendChild(sprite);
                delete el.dataset.src;
            }
            el.classList.toggle('revealed', on);
        }
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
        for (const { event, el } of pins) {
            el.hidden = event.index > position || hiddenTypes.has(event.type);
            el.classList.toggle('tl-pin-active', event === activeEvent);
        }
        renderRecent();
        renderEvents();
    }

    function focusOnScene(scene, targetEvent = null) {
        activeEvent = targetEvent;
        if (!map) return;
        const center = sceneBoundsCenter(scene, lookup, map.tiles, scenes);
        if (!center) return;
        const box = ref('map').getBoundingClientRect();
        if (!box.width || !box.height) return;
        const targetScale = Math.max(view.scale, 0.65);
        view.scale = Math.min(MAX_SCALE, targetScale);
        view.x = box.width / 2 - center.x * view.scale;
        view.y = box.height / 2 - center.y * view.scale;
        applyView();
        for (const { event, el } of pins) {
            el.classList.toggle('tl-pin-active', event === activeEvent);
        }
    }

    // ------------------------------------------------------------ story events
    function formatEventTooltip(e) {
        const num = e.nth ? ` #${e.nth}` : '';
        return `${eventLabel(e.type)}${num} · ${e.sourceName || e.scene} · ${formatPlayTime(e.playTime)}`;
    }

    function renderMarks() {
        const marks = ref('marks');
        marks.replaceChildren();
        for (const e of events) {
            const m = document.createElement('button');
            m.className = 'tl-mark';
            m.style.left = `${scenes.length ? (100 * e.index) / scenes.length : 0}%`;
            m.style.background = EVENT_COLORS[e.type] || '#ccc';
            m.title = formatEventTooltip(e);
            m.hidden = hiddenTypes.has(e.type);
            m.addEventListener('click', () => { stop(); seek(e.index); focusOnScene(e.scene, e); });
            marks.appendChild(m);
        }
        const legend = ref('legend');
        legend.replaceChildren();
        const typeCounts = new Map();
        for (const e of events) typeCounts.set(e.type, (typeCounts.get(e.type) || 0) + 1);
        for (const t of [...typeCounts.keys()].sort()) {
            const on = !hiddenTypes.has(t);
            const item = document.createElement('button');
            item.type = 'button';
            item.className = `tl-legend-btn${on ? ' on' : ''}`;
            item.setAttribute('aria-pressed', String(on));
            item.title = `Toggle ${eventLabel(t)} markers (${typeCounts.get(t)})`;
            const dot = document.createElement('i');
            dot.style.background = EVENT_COLORS[t] || '#ccc';
            item.append(dot, `${eventLabel(t)} (${typeCounts.get(t)})`);
            item.addEventListener('click', () => {
                if (hiddenTypes.has(t)) hiddenTypes.delete(t);
                else hiddenTypes.add(t);
                renderMarks();
                seek(position);
            });
            legend.appendChild(item);
        }
    }

    function cleanHoverSubtitle(text, scene) {
        if (!text) return '';
        let out = text;
        if (scene) {
            const escaped = scene.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            out = out.replace(new RegExp(`\\s*\\(${escaped}\\)\\s*$`, 'i'), '');
        }
        out = out.replace(/\s*\([A-Z][A-Za-z0-9]*(?:_[A-Za-z0-9]+)+\)\s*$/, '');
        return out.trim();
    }

    function showPinTooltip(pinEl, { color, title, subtitle = '', meta = '' }) {
        const tip = ref('tooltip');
        if (!tip) return;
        tip.replaceChildren();
        const header = document.createElement('div');
        header.className = 'tl-tooltip-head';
        const dot = document.createElement('i');
        dot.style.background = color || '#ccc';
        const heading = document.createElement('strong');
        heading.textContent = title;
        header.append(dot, heading);
        if (meta) {
            const metaEl = document.createElement('span');
            metaEl.className = 'tl-tooltip-meta';
            metaEl.textContent = meta;
            header.append(metaEl);
        }
        tip.append(header);
        if (subtitle) {
            const sub = document.createElement('div');
            sub.className = 'tl-tooltip-sub';
            sub.textContent = subtitle;
            tip.append(sub);
        }
        tip.hidden = false;
        const mapBox = ref('map').getBoundingClientRect();
        const pinBox = pinEl.getBoundingClientRect();
        const tipBox = tip.getBoundingClientRect();
        const cx = pinBox.left + pinBox.width / 2 - mapBox.left;
        const left = Math.max(10, Math.min(mapBox.width - tipBox.width - 10, cx - tipBox.width / 2));
        let top = pinBox.top - mapBox.top - tipBox.height - 12;
        if (top < 10) top = pinBox.bottom - mapBox.top + 12;
        tip.style.left = `${left}px`;
        tip.style.top = `${top}px`;
    }

    function hidePinTooltip() {
        const tip = ref('tooltip');
        if (tip) tip.hidden = true;
    }

    function bindPinHover(el, info) {
        el.setAttribute('aria-label', info.subtitle ? `${info.title} — ${info.subtitle}` : info.title);
        el.addEventListener('pointerenter', () => showPinTooltip(el, info));
        el.addEventListener('pointerleave', hidePinTooltip);
    }

    function buildPins() {
        hidePinTooltip();
        const layer = ref('pins');
        layer.replaceChildren();
        pins = [];
        for (const event of events) {
            const center = sceneBoundsCenter(event.scene, lookup, map.tiles, scenes);
            if (!center) continue;
            const el = document.createElement('div');
            el.className = 'tl-pin';
            el.style.left = `${center.x}px`;
            el.style.top = `${center.y}px`;
            el.style.background = EVENT_COLORS[event.type] || '#ccc';
            const num = event.nth ? ` #${event.nth}` : '';
            bindPinHover(el, {
                color: EVENT_COLORS[event.type] || '#ccc',
                title: `${eventLabel(event.type)}${num}`,
                subtitle: cleanHoverSubtitle(event.sourceName || '', event.scene),
                meta: formatPlayTime(event.playTime),
            });
            el.hidden = true;
            el.addEventListener('click', () => { stop(); seek(event.index); focusOnScene(event.scene, event); });
            layer.appendChild(el);
            pins.push({ event, el });
        }
        const benchPin = buildRespawnPin(currentPd, lookup, map.tiles, scenes);
        if (benchPin) {
            const el = document.createElement('div');
            el.className = 'tl-pin tl-pin-bench';
            el.style.left = `${benchPin.x}px`;
            el.style.top = `${benchPin.y}px`;
            bindPinHover(el, {
                color: '#ffd54f',
                title: 'Respawn Bench',
                subtitle: benchPin.scene,
            });
            el.addEventListener('click', () => focusOnScene(benchPin.scene));
            layer.appendChild(el);
        }
        missingPins = [];
        for (const item of buildMissingPins(currentParsed, lookup, map.tiles, scenes)) {
            const el = document.createElement('div');
            el.className = 'tl-pin tl-pin-missing';
            el.style.left = `${item.x}px`;
            el.style.top = `${item.y}px`;
            el.style.borderColor = item.color;
            bindPinHover(el, {
                color: item.color,
                title: `Missing: ${item.kind}`,
                subtitle: cleanHoverSubtitle(item.name || '', item.scene),
            });
            el.hidden = !showMissing;
            el.addEventListener('click', () => focusOnScene(item.scene, item));
            layer.appendChild(el);
            missingPins.push({ item, el });
        }
        updateMissingUI();
    }

    function updateMissingUI() {
        const count = missingPins.length;
        const btn = ref('missing-btn');
        if (btn) {
            btn.textContent = `Missing items (${count})`;
            btn.classList.toggle('on', showMissing);
            btn.setAttribute('aria-pressed', String(showMissing));
        }
        for (const { item, el } of missingPins) {
            el.hidden = !showMissing;
            el.classList.toggle('tl-pin-active', item === activeEvent);
        }
        const section = ref('missing-section');
        if (section) section.hidden = !showMissing;
        const countEl = ref('missing-count');
        if (countEl) countEl.textContent = count;
        const list = ref('missing-list');
        if (!list) return;
        list.replaceChildren();
        if (!showMissing) return;
        for (const { item } of missingPins) {
            const row = document.createElement('button');
            row.type = 'button';
            row.className = `tl-recent-item tl-event${item === activeEvent ? ' active' : ''}`;
            const dot = document.createElement('i');
            dot.style.background = item.color;
            const name = document.createElement('span');
            name.append(dot, `${item.kind}: ${item.name}`);
            row.append(name);
            row.title = `${item.title} (${item.scene})`;
            row.addEventListener('click', () => {
                focusOnScene(item.scene, item);
                updateMissingUI();
            });
            list.appendChild(row);
        }
        if (!list.children.length) {
            const p = document.createElement('p');
            p.className = 'tl-muted';
            p.textContent = currentParsed ? 'All tracked items collected!' : 'Open a save to see missing items';
            list.appendChild(p);
        }
    }

    function toggleMissing() {
        showMissing = !showMissing;
        updateMissingUI();
    }

    function renderEvents() {
        const list = ref('event-list');
        list.replaceChildren();
        for (let i = events.length - 1; i >= 0; i--) {
            const e = events[i];
            if (e.index > position || hiddenTypes.has(e.type)) continue;
            const row = document.createElement('button');
            row.className = `tl-recent-item tl-event${e === activeEvent ? ' active' : ''}`;
            const dot = document.createElement('i');
            dot.style.background = EVENT_COLORS[e.type] || '#ccc';
            const name = document.createElement('span');
            const num = e.nth ? ` #${e.nth}` : '';
            name.append(dot, `${eventLabel(e.type)}${num}`);
            const time = document.createElement('span');
            time.className = 'tl-muted';
            time.textContent = formatPlayTime(e.playTime);
            row.append(name, time);
            row.title = `${formatEventTooltip(e)} (scene ${e.index} of ${scenes.length})`;
            row.addEventListener('click', () => { stop(); seek(e.index); focusOnScene(e.scene, e); });
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
            const sc = scenes[i];
            const n = lookup(sc).length;
            const row = document.createElement('button');
            row.type = 'button';
            row.className = 'tl-recent-item tl-event';
            const name = document.createElement('span');
            name.textContent = sc;
            const count = document.createElement('span');
            count.className = n ? 'tl-area' : 'tl-muted';
            count.textContent = `${n} tile${n === 1 ? '' : 's'}`;
            row.append(name, count);
            row.title = `Center map on ${sc}`;
            row.addEventListener('click', () => focusOnScene(sc));
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
        btn.textContent = '⏸\uFE0E';
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
        btn.textContent = '▶\uFE0E';
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
    mapEl.addEventListener('dragstart', e => e.preventDefault());
    mapEl.addEventListener('pointerdown', e => {
        if (e.target.closest('button')) return;
        // Left-click, middle-click, or touch pan; leave right-click untouched
        if (e.pointerType === 'mouse' && e.button !== 0 && e.button !== 1) return;
        e.preventDefault();
        hidePinTooltip();
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
        'toggle-missing': toggleMissing,
    };
    root.addEventListener('click', e => {
        const btn = e.target.closest('[data-act]');
        if (btn && actions[btn.dataset.act]) actions[btn.dataset.act]();
    });
    ref('slider').addEventListener('input', e => { stop(); seek(Number(e.target.value)); });
    document.addEventListener('keydown', e => {
        if (!active || !scenes.length || e.target.closest?.('input:not([type="range"]), select, textarea')) return;
        if (e.key === ' ' && e.target.closest?.('button, a, [role="button"], summary')) return;   // Space presses the focused control
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
