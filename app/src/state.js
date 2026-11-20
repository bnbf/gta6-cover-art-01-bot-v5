// Golden Hour Cover Studio — shared state, presets and history.
// A slot is one panel's content: a photo key ('boulevard', 'pier' or
// 'upload:n') or a procedural art scene, an optional focus rect + zoom /
// pan, and a sticker label with a sub-line.

import { slotsForLayout } from './layouts.js';

export const WALLET = 'AoP4eSdGC9V2jioJANjN2jPsxL5DnHkWmNicRznF3x67';

export const EXPORT_SIZES = [
  { id: 'square', label: 'Square 1080 × 1080', w: 1080, h: 1080 },
  { id: 'story', label: 'Story 1080 × 1350', w: 1080, h: 1350 },
  { id: 'wide', label: 'Wide 1920 × 1080', w: 1920, h: 1080 },
];

// One panel of a layout: which photo (by key) or procedural art scene it
// shows, how it is cropped, and what its sticker says.
//   photo: 'boulevard' | 'pier' | 'upload:0'..'upload:3'
//   focus: {x,y,w,h} fractions of the photo to fit (car-detail crops etc.)
//   art: 'sunset' | 'skyline' | 'palmroad' (procedural, drawn by art.js)
//   sticker: {label, sub} — sub is "PLACE · TIME · ONE-LINER" or ''.
export function slot(photo, sticker, extra = {}) {
  return { photo, sticker, zoom: 1, ox: 0.5, oy: null, focus: null, art: null, ...extra };
}

export function artSlot(art, sticker, extra = {}) {
  return { photo: null, art, sticker, zoom: 1, ox: 0.5, oy: null, focus: null, ...extra };
}

export const PRESETS = {
  golden: {
    name: 'Golden Hour',
    layout: 'golden',
    grade: 'golden',
    title: 'GOLDEN HOUR',
    subtitle: 'Chasing the Sun',
    tagline: 'ONE COAST · SEVEN STORIES · NO WAY BACK',
    quote: 'THE BEST LIGHT IN TOWN',
    paper: 'THE VICE HERALD',
    vol: 'VOL. 01',
    heat: 4,
    seal: 'ORIGINAL COVER ART',
    footer: 'A GOLDEN HOUR PICTURE · STARRING YOUR CREW',
    slots: [
      slot('boulevard', { label: 'THE DRIVER', sub: 'OCEAN DRIVE · 6:42 PM · LOOKING FOR TROUBLE' }),
      slot('pier', { label: 'THE OLD SALT', sub: 'BAYFRONT · 8:30 PM · OWNS THE PIER' }),
      artSlot('sunset', { label: 'GOLDEN HOUR', sub: 'SUNSET STRIP · 7:15 PM · LAST LIGHT' }),
      slot('boulevard', { label: 'THE RIDE', sub: 'PALM ROW · 9:15 PM · FULL THROTTLE' }, { focus: { x: 0, y: 0.52, w: 0.58, h: 0.48 }, zoom: 1.15 }),
      artSlot('skyline', { label: 'NEON ROW', sub: 'NEON ROW · 11:50 PM · NEVER SLEEPS' }),
      artSlot('palmroad', { label: 'PALM ROW', sub: 'PALM ROW · 9:15 PM · CRUISE CONTROL' }),
      slot('pier', { label: 'THE ANGLER', sub: 'BAYFRONT · 8:30 PM · ALWAYS ON TIME' }, { zoom: 1.2 }),
    ],
  },
  neon: {
    name: 'Neon Nights',
    layout: 'strip',
    grade: 'neon',
    title: 'NEON SHORE',
    subtitle: 'Vice Nights',
    tagline: 'SIX NIGHTS · ONE COAST · NO WAY BACK',
    quote: 'THE COAST HAS NEVER LOOKED THIS GOOD',
    paper: 'THE VICE HERALD',
    vol: 'VOL. 07',
    heat: 5,
    seal: 'HOT SUMMER ’26',
    footer: 'A NEON COAST PICTURE · STARRING YOUR CREW',
    slots: [
      slot('boulevard', { label: 'THE WHEELMAN', sub: 'OCEAN DRIVE · 6:42 PM · LOOKING FOR TROUBLE' }),
      slot('pier', { label: 'THE OLD SALT', sub: 'BAYFRONT · 8:30 PM · OWNS THE PIER' }),
      artSlot('sunset', { label: 'GOLDEN HOUR', sub: 'SUNSET STRIP · 7:15 PM · LAST LIGHT' }),
      slot('boulevard', { label: 'THE RIDE', sub: 'PALM ROW · 9:15 PM · FULL THROTTLE' }, { focus: { x: 0, y: 0.52, w: 0.58, h: 0.48 }, zoom: 1.15 }),
      artSlot('skyline', { label: 'NEON ROW', sub: 'NEON ROW · 11:50 PM · NEVER SLEEPS' }),
      artSlot('palmroad', { label: 'PALM ROW', sub: 'PALM ROW · 9:15 PM · CRUISE CONTROL' }),
      slot('pier', { label: 'THE ANGLER', sub: 'BAYFRONT · 8:30 PM · ALWAYS ON TIME' }, { zoom: 1.2 }),
      slot('boulevard', { label: 'THE DRIVER', sub: 'OCEAN DRIVE · 6:42 PM · LOOKING FOR TROUBLE' }, { zoom: 1.4 }),
    ],
  },
  poster: {
    name: 'Poster Ink',
    layout: 'keyart',
    grade: 'poster',
    title: 'SUNSET STRIP',
    subtitle: 'After the Tide',
    tagline: 'FIVE FRIENDS · ONE COAST · NO WAY BACK',
    quote: 'PURE GOLDEN-HOUR MAYHEM',
    paper: 'THE HARBOR GAZETTE',
    vol: 'VOL. 06',
    heat: 5,
    seal: 'ORIGINAL COVER ART',
    footer: 'A SUNSET PICTURES PRODUCTION · STARRING YOU',
    slots: [
      slot('boulevard', { label: 'THE DRIVER', sub: 'OCEAN DRIVE · 6:42 PM · LOOKING FOR TROUBLE' }),
      slot('pier', { label: 'THE OLD SALT', sub: 'BAYFRONT · 8:30 PM · OWNS THE PIER' }),
      artSlot('sunset', { label: 'GOLDEN HOUR', sub: 'SUNSET STRIP · 7:15 PM · LAST LIGHT' }),
      slot('boulevard', { label: 'THE RIDE', sub: 'PALM ROW · 9:15 PM · FULL THROTTLE' }, { focus: { x: 0, y: 0.52, w: 0.58, h: 0.48 }, zoom: 1.15 }),
      artSlot('skyline', { label: 'NEON ROW', sub: 'NEON ROW · 11:50 PM · NEVER SLEEPS' }),
    ],
  },
};

export function defaultState() {
  const p = PRESETS.golden;
  return {
    layout: p.layout,
    grade: p.grade,
    title: p.title,
    subtitle: p.subtitle,
    tagline: p.tagline,
    quote: p.quote,
    paper: p.paper,
    vol: p.vol,
    heat: p.heat,
    seal: p.seal,
    footer: p.footer,
    showQuote: true,
    showSeal: true,
    showVol: true,
    showHeat: true,
    showBarcode: true,
    slots: p.slots.map((s) => ({ ...s, sticker: { ...s.sticker } })),
    selected: 0,
    exportSize: 'wide',
  };
}

export function applyPreset(state, name) {
  const p = PRESETS[name];
  if (!p) return state;
  const next = defaultState();
  next.layout = p.layout;
  next.grade = p.grade;
  next.title = p.title;
  next.subtitle = p.subtitle;
  next.tagline = p.tagline;
  next.quote = p.quote;
  next.paper = p.paper;
  next.vol = p.vol;
  next.heat = p.heat;
  next.seal = p.seal;
  next.footer = p.footer;
  next.slots = p.slots.map((s) => ({ ...s, sticker: { ...s.sticker } }));
  // A layout may need more panels than the preset carries (the strip
  // layout has 10); cycle the golden preset's slots for the rest.
  next.slots = slotsForLayout(next.slots, next.layout, PRESETS.golden.slots);
  next.exportSize = state.exportSize || 'wide';
  return next;
}

// Undo/redo history, capped at 60 snapshots.
export class History {
  constructor() {
    this.past = [];
    this.future = [];
  }
  push(state) {
    this.past.push(JSON.stringify(state));
    if (this.past.length > 60) this.past.shift();
    this.future = [];
  }
  undo(state) {
    if (!this.past.length) return null;
    this.future.push(JSON.stringify(state));
    return JSON.parse(this.past.pop());
  }
  redo(state) {
    if (!this.future.length) return null;
    this.past.push(JSON.stringify(state));
    return JSON.parse(this.future.pop());
  }
  get canUndo() { return this.past.length > 0; }
  get canRedo() { return this.future.length > 0; }
}

export function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}
