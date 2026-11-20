// Layouts: panel geometry as fractions of the cover. The panels area runs
// y 0.04–0.82 (a quote strip sits above it, a tagline/palm/footer band
// below). Every layout names its slots in order, its frame style and where
// the title block goes. Geometry is the layout's own — slots are filled
// from the state's slot list in order, remapped when the count changes.

export const LAYOUTS = {
  golden: {
    name: 'Golden Hour',
    frame: 'ink',
    title: { place: 'bottom', top: 0.5 },
    slots: [
      { x: 0, y: 0.04, w: 0.417, h: 0.78 },
      { x: 0.417, y: 0.04, w: 0.285, h: 0.335 },
      { x: 0.702, y: 0.04, w: 0.298, h: 0.335 },
      { x: 0.702, y: 0.375, w: 0.298, h: 0.225 },
      { x: 0.417, y: 0.6, w: 0.143, h: 0.22 },
      { x: 0.56, y: 0.6, w: 0.142, h: 0.22 },
      { x: 0.702, y: 0.6, w: 0.298, h: 0.22 },
    ],
  },
  strip: {
    name: 'Sunset Strip',
    frame: 'ink',
    title: { place: 'center', x: 0.33, y: 0.36, w: 0.34, h: 0.26 },
    slots: [
      { x: 0, y: 0.04, w: 0.25, h: 0.32 },
      { x: 0.25, y: 0.04, w: 0.25, h: 0.32 },
      { x: 0.5, y: 0.04, w: 0.25, h: 0.32 },
      { x: 0.75, y: 0.04, w: 0.25, h: 0.32 },
      { x: 0, y: 0.36, w: 0.33, h: 0.26 },
      { x: 0.67, y: 0.36, w: 0.33, h: 0.26 },
      { x: 0, y: 0.62, w: 0.25, h: 0.2 },
      { x: 0.25, y: 0.62, w: 0.25, h: 0.2 },
      { x: 0.5, y: 0.62, w: 0.25, h: 0.2 },
      { x: 0.75, y: 0.62, w: 0.25, h: 0.2 },
    ],
  },
  keyart: {
    name: 'Key Art',
    frame: 'ink',
    title: { place: 'bottom', top: 0.5 },
    slots: [
      { x: 0, y: 0.04, w: 0.42, h: 0.78 },
      { x: 0.42, y: 0.04, w: 0.28, h: 0.39 },
      { x: 0.7, y: 0.04, w: 0.3, h: 0.39 },
      { x: 0.42, y: 0.43, w: 0.28, h: 0.39 },
      { x: 0.7, y: 0.43, w: 0.3, h: 0.39 },
    ],
  },
  carhero: {
    name: 'Car Hero',
    frame: 'ink',
    title: { place: 'bottom', top: 0.5 },
    slots: [
      { x: 0, y: 0.04, w: 0.58, h: 0.78 },
      { x: 0.58, y: 0.04, w: 0.42, h: 0.78 },
    ],
  },
  nine: {
    name: 'Nine-Panel Grid',
    frame: 'band',
    title: { place: 'middle', top: 0.36 },
    slots: [
      { x: 0, y: 0.04, w: 0.333, h: 0.26 },
      { x: 0.333, y: 0.04, w: 0.334, h: 0.26 },
      { x: 0.667, y: 0.04, w: 0.333, h: 0.26 },
      { x: 0, y: 0.3, w: 0.333, h: 0.26 },
      { x: 0.333, y: 0.3, w: 0.334, h: 0.26 },
      { x: 0.667, y: 0.3, w: 0.333, h: 0.26 },
      { x: 0, y: 0.56, w: 0.333, h: 0.26 },
      { x: 0.333, y: 0.56, w: 0.334, h: 0.26 },
      { x: 0.667, y: 0.56, w: 0.333, h: 0.26 },
    ],
  },
  hero3: {
    name: 'Hero + Three',
    frame: 'ink',
    title: { place: 'bottom', top: 0.5 },
    slots: [
      { x: 0, y: 0.04, w: 0.55, h: 0.78 },
      { x: 0.55, y: 0.04, w: 0.45, h: 0.26 },
      { x: 0.55, y: 0.3, w: 0.45, h: 0.26 },
      { x: 0.55, y: 0.56, w: 0.45, h: 0.26 },
    ],
  },
  bleed: {
    name: 'Full Bleed',
    frame: 'none',
    title: { place: 'bottom', top: 0.52 },
    slots: [
      { x: 0, y: 0.04, w: 1, h: 0.78 },
    ],
  },
  tilt: {
    name: 'Tilted Snapshots',
    frame: 'snap',
    title: { place: 'bottom', top: 0.52 },
    slots: [
      { x: 0.05, y: 0.1, w: 0.3, h: 0.62, rot: -4 },
      { x: 0.35, y: 0.06, w: 0.3, h: 0.7, rot: 2 },
      { x: 0.65, y: 0.1, w: 0.3, h: 0.62, rot: 5 },
    ],
  },
  diagonal: {
    name: 'Diagonal Bands',
    frame: 'band',
    title: { place: 'middle', top: 0.38 },
    slots: [
      { poly: [[0, 0.82], [0.3, 0.04], [0.52, 0.04], [0.22, 0.82]] },
      { poly: [[0.24, 0.82], [0.54, 0.04], [0.76, 0.04], [0.46, 0.82]] },
      { poly: [[0.48, 0.82], [0.78, 0.04], [1, 0.04], [0.7, 0.82]] },
    ],
  },
  duo: {
    name: 'Split Duo',
    frame: 'ink',
    title: { place: 'bottom', top: 0.5 },
    slots: [
      { x: 0, y: 0.04, w: 0.5, h: 0.78 },
      { x: 0.5, y: 0.04, w: 0.5, h: 0.78 },
    ],
  },
  stage: {
    name: 'Centre Stage',
    frame: 'ink',
    title: { place: 'bottom', top: 0.5 },
    slots: [
      { x: 0, y: 0.04, w: 0.28, h: 0.78 },
      { x: 0.28, y: 0.04, w: 0.44, h: 0.78 },
      { x: 0.72, y: 0.04, w: 0.28, h: 0.78 },
    ],
  },
};

export const LAYOUT_IDS = Object.keys(LAYOUTS);

// Remap a state's slots to a layout's slot count: keep the ones that fit
// in order, cycle the golden preset's slots for the rest.
export function slotsForLayout(slots, layoutId, filler) {
  const n = LAYOUTS[layoutId].slots.length;
  const out = [];
  for (let i = 0; i < n; i++) {
    if (i < slots.length) {
      out.push({ ...slots[i], sticker: { ...slots[i].sticker } });
    } else {
      // Cycle the filler with an offset so repeats land on different
      // panels than the ones the preset already fills (a 10-panel layout
      // fed from a 7-slot preset should not show the same photo twice in
      // a row).
      const f = filler[(i + 3) % filler.length];
      out.push({ ...f, sticker: { ...f.sticker } });
    }
  }
  return out;
}

// Slot rectangle in cover pixels (or polygon points for diagonal bands).
export function slotRect(slot, W, H) {
  if (slot.poly) {
    return { poly: slot.poly.map(([x, y]) => [x * W, y * H]) };
  }
  return { x: slot.x * W, y: slot.y * H, w: slot.w * W, h: slot.h * H, rot: slot.rot || 0 };
}
