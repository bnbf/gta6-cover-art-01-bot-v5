// Golden Hour Cover Studio — editor wiring.
// Canvas preview, panel picking, drag-to-pan, wheel zoom, uploads,
// presets/layouts/grades, text controls, undo/redo, export and shots.

import { drawCover, renderCover } from './cover.js';
import { LAYOUTS, LAYOUT_IDS, slotsForLayout, slotRect } from './layouts.js';
import { GRADES, GRADE_IDS } from './grades.js';
import { PRESETS, defaultState, applyPreset, cloneState, History } from './state.js';
import { SHOTS } from './shots.js';

const $ = (id) => document.getElementById(id);
const LS_KEY = 'gh-cover-studio-v5';
const photos = { boulevard: null, pier: null };
const uploads = [];

let state = loadState();
let selected = 0;
const history = new History(60);
let drag = null;

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && s.title && Array.isArray(s.slots)) return s;
    }
  } catch { /* fresh state */ }
  return defaultState();
}

function saveState() {
  try {
    const s = { ...state, slots: state.slots.map(({ photo, art, focus, zoom, ox, oy, sticker }) => ({ photo, art, focus, zoom, ox, oy, sticker })) };
    localStorage.setItem(LS_KEY, JSON.stringify(s));
  } catch { /* storage full — ignore */ }
}

function commit() {
  history.push(state);
  saveState();
  render();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function loadSamples() {
  photos.boulevard = await loadImage('samples/boulevard.jpg').catch(() => null);
  photos.pier = await loadImage('samples/pier.jpg').catch(() => null);
}

function allPhotos() {
  const out = { ...photos };
  uploads.forEach((img, i) => { out[`upload:${i}`] = img; });
  return out;
}

function fitCanvas() {
  const canvas = $('cover');
  const ratio = state.exportSize === 'story' ? 1080 / 1350 : state.exportSize === 'square' ? 1 : 1920 / 1080;
  canvas.width = 1080;
  canvas.height = Math.round(1080 / ratio);
  canvas.style.aspectRatio = `${ratio}`;
}

function render() {
  fitCanvas();
  const canvas = $('cover');
  drawCover(canvas.getContext('2d'), state, canvas.width, canvas.height, allPhotos());
  renderThumbs();
  renderControls();
  window.__shotReady = true;
}

function renderThumbs() {
  const strip = $('thumbs');
  strip.innerHTML = '';
  const mk = (label, key, img) => {
    const d = document.createElement('button');
    d.className = 'thumb';
    d.type = 'button';
    d.textContent = label;
    if (img) {
      d.style.backgroundImage = `url(${img.src})`;
      d.style.backgroundSize = 'cover';
      d.style.backgroundPosition = 'center';
    }
    d.onclick = () => {
      commit();
      const slot = state.slots[selected];
      slot.photo = key;
      slot.art = null;
      slot.focus = null;
      slot.zoom = 1;
      slot.ox = null;
      slot.oy = null;
      render();
    };
    strip.appendChild(d);
  };
  mk('BOULEVARD', 'boulevard', photos.boulevard);
  mk('PIER', 'pier', photos.pier);
  uploads.forEach((img, i) => mk(`UPLOAD ${i + 1}`, `upload:${i}`, img));
  ['sunset', 'skyline', 'palmroad'].forEach((art) => {
    const d = document.createElement('button');
    d.className = 'thumb art';
    d.type = 'button';
    d.textContent = art.toUpperCase();
    d.onclick = () => {
      commit();
      const slot = state.slots[selected];
      slot.art = art;
      slot.photo = null;
      render();
    };
    strip.appendChild(d);
  });
}

function chipRow(el, items, current, onPick) {
  el.innerHTML = '';
  items.forEach(([id, label]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (id === current ? ' active' : '');
    b.textContent = label;
    b.onclick = () => onPick(id);
    el.appendChild(b);
  });
}

function renderControls() {
  chipRow($('layouts'), LAYOUT_IDS.map((id) => [id, LAYOUTS[id].name]), state.layout, (id) => {
    commit();
    state.layout = id;
    state.slots = slotsForLayout(state.slots, id, PRESETS.golden.slots);
    render();
  });
  chipRow($('grades'), GRADE_IDS.map((id) => [id, GRADES[id].name]), state.grade, (id) => {
    commit();
    state.grade = id;
    render();
  });
  chipRow($('presets'), Object.keys(PRESETS).map((id) => [id, PRESETS[id].name]), null, (id) => {
    commit();
    state = applyPreset(state, id);
    selected = 0;
    render();
  });
  const setVal = (id, val) => {
    const el = $(id);
    if (document.activeElement !== el) el.value = val;
  };
  setVal('title', state.title);
  setVal('subtitle', state.subtitle);
  setVal('tagline', state.tagline);
  setVal('quote', state.quote);
  setVal('paper', state.paper);
  setVal('vol', state.vol);
  setVal('seal', state.seal);
  setVal('footer', state.footer);
  $('heat').value = String(state.heat);
  $('heatVal').textContent = '★'.repeat(state.heat) + '☆'.repeat(5 - state.heat);
  $('zoom').value = String((state.slots[selected]?.zoom || 1) * 100);
  $('zoomVal').textContent = `${Math.round((state.slots[selected]?.zoom || 1) * 100)}%`;
  $('slotLabel').textContent = `Panel ${selected + 1} of ${state.slots.length}`;
  $('undoBtn').disabled = !history.canUndo;
  $('redoBtn').disabled = !history.canRedo;
  const sizeBtns = { square: '1:1', story: '4:5', wide: '16:9' };
  chipRow($('sizes'), Object.keys(sizeBtns).map((id) => [id, sizeBtns[id]]), state.exportSize, (id) => {
    commit();
    state.exportSize = id;
    render();
  });
  $('tglQuote').checked = state.showQuote;
  $('tglVol').checked = state.showVol;
  $('tglHeat').checked = state.showHeat;
  $('tglSeal').checked = state.showSeal;
  $('tglBarcode').checked = state.showBarcode;
}

// Panel hit test: point in cover coordinates -> slot index or -1.
function hitSlot(x, y, W, H) {
  const layout = LAYOUTS[state.layout];
  for (let i = 0; i < layout.slots.length; i++) {
    const r = slotRect(layout.slots[i], W, H);
    if (r.poly) {
      if (pointInPoly(x, y, r.poly)) return i;
    } else if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
      return i;
    }
  }
  return -1;
}

function pointInPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}

function photoMetrics(slot, rect, img) {
  const pw = img.naturalWidth || img.width;
  const ph = img.naturalHeight || img.height;
  const f = slot.focus || { x: 0, y: 0, w: 1, h: 1 };
  const sw = f.w * pw, sh = f.h * ph;
  const s = Math.max(rect.w / sw, rect.h / sh) * (slot.zoom || 1);
  return { dw: sw * s, dh: sh * s };
}

function bindCanvas() {
  const canvas = $('cover');
  const toCover = (e) => {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * canvas.width,
      y: ((e.clientY - r.top) / r.height) * canvas.height,
    };
  };
  canvas.addEventListener('pointerdown', (e) => {
    const p = toCover(e);
    const i = hitSlot(p.x, p.y, canvas.width, canvas.height);
    if (i < 0) return;
    selected = i;
    history.push(state);
    const slot = state.slots[i];
    const layout = LAYOUTS[state.layout];
    const rect = slotRect(layout.slots[i], canvas.width, canvas.height);
    const img = slot.photo ? allPhotos()[slot.photo] : null;
    drag = { start: p, slot, rect, img, moved: false };
    canvas.setPointerCapture(e.pointerId);
    renderControls();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag || !drag.img) return;
    const p = toCover(e);
    const dx = p.x - drag.start.x, dy = p.y - drag.start.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;
    const m = photoMetrics(drag.slot, drag.rect, drag.img);
    const oxPx = m.dw - drag.rect.w, oyPx = m.dh - drag.rect.h;
    const slot = drag.slot;
    if (oxPx > 0.5) slot.ox = Math.min(1, Math.max(0, (slot.ox ?? 0.5) + dx / oxPx));
    if (oyPx > 0.5) slot.oy = Math.min(1, Math.max(0, (slot.oy ?? 0.5) + dy / oyPx));
    drag.start = p;
    render();
  });
  canvas.addEventListener('pointerup', () => {
    if (drag && drag.moved) saveState();
    drag = null;
  });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const slot = state.slots[selected];
    if (!slot || !slot.photo) return;
    history.push(state);
    slot.zoom = Math.min(3, Math.max(1, (slot.zoom || 1) * (e.deltaY < 0 ? 1.12 : 1 / 1.12)));
    render();
  }, { passive: false });
}

function bindInputs() {
  const text = (id, key) => {
    $(id).addEventListener('focus', () => history.push(state));
    $(id).addEventListener('input', () => {
      state[key] = $(id).value;
      render();
    });
    $(id).addEventListener('change', () => saveState());
  };
  text('title', 'title');
  text('subtitle', 'subtitle');
  text('tagline', 'tagline');
  text('quote', 'quote');
  text('paper', 'paper');
  text('vol', 'vol');
  text('seal', 'seal');
  text('footer', 'footer');
  $('heat').addEventListener('input', () => {
    state.heat = Number($('heat').value);
    render();
  });
  $('zoom').addEventListener('input', () => {
    const slot = state.slots[selected];
    if (!slot) return;
    slot.zoom = Number($('zoom').value) / 100;
    render();
  });
  const toggle = (id, key) => {
    $(id).addEventListener('change', () => {
      commit();
      state[key] = $(id).checked;
      render();
    });
  };
  toggle('tglQuote', 'showQuote');
  toggle('tglVol', 'showVol');
  toggle('tglHeat', 'showHeat');
  toggle('tglSeal', 'showSeal');
  toggle('tglBarcode', 'showBarcode');
  $('undoBtn').onclick = () => {
    const s = history.undo(state);
    if (s) { state = s; saveState(); render(); }
  };
  $('redoBtn').onclick = () => {
    const s = history.redo(state);
    if (s) { state = s; saveState(); render(); }
  };
  $('shuffleBtn').onclick = () => {
    commit();
    const pool = ['boulevard', 'pier', 'sunset', 'skyline', 'palmroad'];
    state.slots.forEach((slot, i) => {
      const pick = pool[(i * 2 + Math.floor(Math.random() * pool.length)) % pool.length];
      if (ART_SCENES[pick]) { slot.art = pick; slot.photo = null; }
      else { slot.photo = pick; slot.art = null; }
      slot.zoom = 1; slot.ox = null; slot.oy = null;
    });
    render();
  };
  $('resetBtn').onclick = () => {
    commit();
    state = defaultState();
    selected = 0;
    render();
  };
  $('upload').addEventListener('change', async (e) => {
    for (const file of [...e.target.files].slice(0, 4 - uploads.length)) {
      const url = await new Promise((res) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.readAsDataURL(file);
      });
      const img = await loadImage(url).catch(() => null);
      if (img) uploads.push(img);
    }
    render();
  });
  $('exportBtn').onclick = () => {
    const size = state.exportSize === 'story' ? [1080, 1350] : state.exportSize === 'square' ? [1080, 1080] : [1920, 1080];
    const c = renderCover(state, size[0], size[1], allPhotos());
    c.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `golden-hour-cover-${state.exportSize}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    }, 'image/png');
  };
  $('shareBtn').onclick = async () => {
    const text = `${state.title} — ${state.subtitle}. ${state.tagline} Cover by Golden Hour Cover Studio.`;
    try { await navigator.clipboard.writeText(text); $('shareBtn').textContent = 'Copied!'; }
    catch { $('shareBtn').textContent = text; }
    setTimeout(() => { $('shareBtn').textContent = 'Copy share text'; }, 2000);
  };
}

// API used by the screenshot driver (shots.js).
window.__api = {
  setPreset(id) { state = applyPreset(state, id); selected = 0; render(); },
  setLayout(id) {
    state.layout = id;
    state.slots = slotsForLayout(state.slots, id, PRESETS.golden.slots);
    render();
  },
  setGrade(id) { state.grade = id; render(); },
  setExportSize(id) { state.exportSize = id; render(); },
  selectSlot(i) { selected = i; render(); },
  loadSample(key) {
    const slot = state.slots[selected];
    slot.photo = key; slot.art = null; slot.zoom = 1; slot.ox = null; slot.oy = null;
    render();
  },
};

const ART_SCENES = { sunset: 1, skyline: 1, palmroad: 1 };

async function init() {
  bindCanvas();
  bindInputs();
  try {
    await Promise.all([
      document.fonts.load('16px Anton'),
      document.fonts.load('16px Pacifico'),
      loadSamples(),
    ]);
  } catch { /* render anyway with fallbacks */ }
  const params = new URLSearchParams(location.search);
  const shotId = params.get('shot');
  if (shotId) {
    const shot = SHOTS.find((s) => s.id === shotId);
    if (shot) {
      if (shot.coverOnly) document.body.classList.add('shot-cover');
      shot.apply(window.__api);
    }
  }
  history.push(state);
  render();
}

init();
