// Colour grades. Every grade is a canvas filter string plus an optional
// warm/cool wash drawn over the photo in 'overlay' or 'soft-light'.
// Golden Hour is the default: a warm photographic grade that keeps faces
// photographic — no posterize. Poster Ink is the flat screen-print look,
// kept as an option, never the default.

export const GRADES = {
  golden: {
    name: 'Golden Hour',
    filter: 'contrast(1.12) saturate(1.22) sepia(0.22) hue-rotate(-8deg) brightness(1.04)',
    wash: { color: '#ff9a3d', alpha: 0.16, mode: 'overlay' },
    wash2: { color: '#ff5e8a', alpha: 0.08, mode: 'soft-light' },
    posterize: 0,
    halftone: false,
  },
  sunset: {
    name: 'Vice Sunset',
    filter: 'contrast(1.16) saturate(1.3) sepia(0.3) hue-rotate(-14deg) brightness(1.02)',
    wash: { color: '#ff6b9d', alpha: 0.22, mode: 'overlay' },
    wash2: { color: '#ffb347', alpha: 0.1, mode: 'soft-light' },
    posterize: 0,
    halftone: false,
  },
  neon: {
    name: 'Neon Night',
    filter: 'contrast(1.18) saturate(1.35) hue-rotate(18deg) brightness(0.96)',
    wash: { color: '#7a2bd6', alpha: 0.24, mode: 'overlay' },
    wash2: { color: '#19e3ff', alpha: 0.1, mode: 'soft-light' },
    posterize: 0,
    halftone: false,
  },
  gold: {
    name: 'Gold Hour',
    filter: 'contrast(1.1) saturate(1.05) sepia(0.55) brightness(1.06)',
    wash: { color: '#ffc46b', alpha: 0.2, mode: 'overlay' },
    wash2: null,
    posterize: 0,
    halftone: false,
  },
  teal: {
    name: 'Teal Heat',
    filter: 'contrast(1.14) saturate(1.2) hue-rotate(8deg) brightness(1.0)',
    wash: { color: '#0f7d8c', alpha: 0.2, mode: 'overlay' },
    wash2: { color: '#ff8a3d', alpha: 0.12, mode: 'soft-light' },
    posterize: 0,
    halftone: false,
  },
  mono: {
    name: 'Mono Ink',
    filter: 'grayscale(1) contrast(1.22) brightness(1.05)',
    wash: { color: '#ffffff', alpha: 0.06, mode: 'overlay' },
    wash2: null,
    posterize: 0,
    halftone: false,
  },
  true: {
    name: 'True Colour',
    filter: 'none',
    wash: null,
    wash2: null,
    posterize: 0,
    halftone: false,
  },
  poster: {
    name: 'Poster Ink',
    filter: 'contrast(1.25) saturate(1.5) brightness(1.0)',
    wash: { color: '#ff5e3a', alpha: 0.18, mode: 'overlay' },
    wash2: { color: '#7a2bd6', alpha: 0.14, mode: 'soft-light' },
    posterize: 4,
    halftone: true,
  },
};

export const GRADE_IDS = Object.keys(GRADES);

// Quantize an image region to `levels` steps per channel (screen-print).
// Operates on the panel's own offscreen canvas so the rest is untouched.
export function posterizeCanvas(canvas, levels) {
  const ctx = canvas.getContext('2d');
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = img.data;
  const step = 255 / (levels - 1);
  for (let i = 0; i < d.length; i += 4) {
    d[i] = Math.round(d[i] / step) * step;
    d[i + 1] = Math.round(d[i + 1] / step) * step;
    d[i + 2] = Math.round(d[i + 2] / step) * step;
  }
  ctx.putImageData(img, 0, 0);
}

// Halftone dot grid over a panel (only for the Poster Ink grade).
export function halftoneDots(ctx, x, y, w, h) {
  const gap = Math.max(5, w / 90);
  ctx.save();
  ctx.fillStyle = 'rgba(20, 6, 30, 0.16)';
  for (let yy = y + gap / 2; yy < y + h; yy += gap) {
    for (let xx = x + gap / 2; xx < x + w; xx += gap) {
      ctx.beginPath();
      ctx.arc(xx, yy, gap * 0.16, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
