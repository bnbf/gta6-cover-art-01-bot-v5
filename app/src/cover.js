// Golden Hour Cover Studio — canvas renderer.
// Draws the whole cover: panels (photos with face-band-anchored crops or
// procedural art), the grade, the giant striped title + script subtitle,
// quote strip, stickers with sub-lines, VOL/HEAT/seal, tagline ribbon,
// palm band and footer with barcode. Deterministic: every random choice
// comes from a seeded RNG, so two runs draw byte-identical pixels.

import { LAYOUTS, slotRect } from './layouts.js';
import { GRADES, posterizeCanvas, halftoneDots } from './grades.js';
import { ART_SCENES, drawGrain, drawVignette, drawPalm, makeRng } from './art.js';

const DARK = '#14081f';
const GOLD = '#ffd94a';
const PINK = '#ff7ad9';

// Draw one photo into a panel rect with cover-fit, a focus rect, zoom and
// pan. When the panel crops vertically and no explicit pan was set, the
// visible band anchors on the face region (0.18 of the photo height) so
// heads are never cropped out by default.
export function drawPhotoInto(ctx, img, rect, slot) {
  const pw = img.naturalWidth || img.width;
  const ph = img.naturalHeight || img.height;
  const f = slot.focus || { x: 0, y: 0, w: 1, h: 1 };
  const sx = f.x * pw, sy = f.y * ph, sw = f.w * pw, sh = f.h * ph;
  const zoom = slot.zoom || 1;
  const s = Math.max(rect.w / sw, rect.h / sh) * zoom;
  const dw = sw * s, dh = sh * s;
  const oxPx = dw - rect.w, oyPx = dh - rect.h;
  let ox = slot.ox == null ? 0.5 : slot.ox;
  let oy = slot.oy;
  if (oy == null) {
    if (oyPx > 0.5) {
      // Anchor the visible band on the face region (0.18 of photo height).
      const faceFrac = (0.18 * ph - sy) / sh;
      const wantTop = faceFrac * dh - rect.h * 0.3;
      oy = Math.min(1, Math.max(0, -wantTop / oyPx));
    } else {
      oy = 0.5;
    }
  }
  const dx = rect.x - oxPx * ox;
  const dy = rect.y - oyPx * oy;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  ctx.restore();
  return { dx, dy, dw, dh, s };
}

// Render one panel (photo or art) onto its own offscreen canvas, apply
// the grade, then blit it into the cover.
function renderPanel(slot, rect, W, H, photos, grade, seed) {
  const cw = Math.max(2, Math.round(rect.w));
  const ch = Math.max(2, Math.round(rect.h));
  const c = document.createElement('canvas');
  c.width = cw;
  c.height = ch;
  const ctx = c.getContext('2d');
  const local = { x: 0, y: 0, w: cw, h: ch };
  if (slot.art && ART_SCENES[slot.art]) {
    ART_SCENES[slot.art].draw(ctx, cw, ch, seed);
  } else if (slot.photo && photos[slot.photo]) {
    ctx.filter = grade.filter === 'none' ? 'none' : grade.filter;
    drawPhotoInto(ctx, photos[slot.photo], local, slot);
    ctx.filter = 'none';
  } else {
    const g = ctx.createLinearGradient(0, 0, cw, ch);
    g.addColorStop(0, '#3a1160');
    g.addColorStop(1, '#ff8a3d');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, cw, ch);
  }
  if (grade.wash) {
    ctx.save();
    ctx.globalCompositeOperation = grade.wash.mode;
    ctx.globalAlpha = grade.wash.alpha;
    ctx.fillStyle = grade.wash.color;
    ctx.fillRect(0, 0, cw, ch);
    ctx.restore();
  }
  if (grade.wash2) {
    ctx.save();
    ctx.globalCompositeOperation = grade.wash2.mode;
    ctx.globalAlpha = grade.wash2.alpha;
    ctx.fillStyle = grade.wash2.color;
    ctx.fillRect(0, 0, cw, ch);
    ctx.restore();
  }
  if (grade.posterize > 0) {
    posterizeCanvas(c, grade.posterize);
    if (grade.halftone) halftoneDots(ctx, 0, 0, cw, ch);
  }
  return c;
}

function frameRect(ctx, rect, frame, W) {
  const g = Math.max(2, Math.round(W * 0.004));
  if (frame === 'none') return;
  ctx.save();
  if (frame === 'snap') {
    // Polaroid: white border, thicker at the bottom.
    ctx.fillStyle = '#fdf8ef';
    ctx.fillRect(rect.x - g * 2, rect.y - g * 2, rect.w + g * 4, rect.h + g * 5);
    ctx.strokeStyle = 'rgba(20,8,31,0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(rect.x - g * 2, rect.y - g * 2, rect.w + g * 4, rect.h + g * 5);
  } else if (frame === 'ink') {
    ctx.strokeStyle = DARK;
    ctx.lineWidth = g;
    ctx.strokeRect(rect.x - g / 2, rect.y - g / 2, rect.w + g, rect.h + g);
    ctx.strokeStyle = 'rgba(255, 217, 74, 0.85)';
    ctx.lineWidth = Math.max(1, g * 0.35);
    ctx.strokeRect(rect.x + g * 0.7, rect.y + g * 0.7, rect.w - g * 1.4, rect.h - g * 1.4);
  } else {
    ctx.strokeStyle = DARK;
    ctx.lineWidth = g;
    ctx.strokeRect(rect.x - g / 2, rect.y - g / 2, rect.w + g, rect.h + g);
  }
  ctx.restore();
}

// A sticker: black slanted tab with the label, plus a one-line sub
// (place · time · tag) in small white type just below it. `y` is the top
// of the label tab; the whole sticker (label + sub) fits above
// `panelBottom`, so the sub-line never crosses the panel's bottom edge.
function stickerHeight(label, sub, scale) {
  const fs = Math.max(10, Math.round(15 * scale));
  const sfs = Math.max(8, Math.round(10.5 * scale));
  const labelH = fs + fs * 0.42 * 2;
  const subH = sub ? sfs * 1.9 : 0;
  return labelH + subH;
}

function drawSticker(ctx, x, y, label, sub, scale, align = 'left') {
  const fs = Math.max(10, Math.round(15 * scale));
  ctx.save();
  ctx.font = `${fs}px Anton, 'Arial Narrow', sans-serif`;
  const tw = ctx.measureText(label).width;
  const padX = fs * 0.7, padY = fs * 0.42;
  const bx = align === 'right' ? x - tw - padX * 2 : x;
  ctx.fillStyle = '#0d0518';
  ctx.beginPath();
  ctx.moveTo(bx, y);
  ctx.lineTo(bx + tw + padX * 2, y);
  ctx.lineTo(bx + tw + padX * 2 - fs * 0.35, y + fs + padY * 2);
  ctx.lineTo(bx, y + fs + padY * 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, bx + padX, y + fs * 0.5 + padY);
  if (sub) {
    const sfs = Math.max(8, Math.round(10.5 * scale));
    ctx.font = `bold ${sfs}px 'Arial Narrow', Arial, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 3;
    ctx.fillText(sub, bx + 2, y + fs + padY * 2 + sfs * 0.9);
  }
  ctx.restore();
}

// The rectangle the title glyphs occupy (script subtitle excluded): a
// sticker whose top falls inside it would be painted over, so it moves
// to the top of its panel instead.
function titleZone(layout, W, H) {
  const t = layout.title;
  if (t.place === 'center') {
    return { x0: t.x * W, x1: (t.x + t.w) * W, top: t.y * H, bottom: (t.y + t.h) * H };
  }
  return { x0: 0, x1: W, top: t.top * H, bottom: t.top * H + H * 0.24 };
}

// Five gold stars.
function drawStars(ctx, x, y, size, n = 5) {
  ctx.save();
  ctx.fillStyle = GOLD;
  ctx.font = `${size}px sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.fillText('★'.repeat(n), x, y);
  ctx.restore();
  return ctx.measureText('★'.repeat(n)).width;
}

// Gold starburst seal with two lines of red text.
function drawSeal(ctx, cx, cy, r, line1, line2) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  const spikes = 12;
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.78;
    const px = Math.cos(a) * rr, py = Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = GOLD;
  ctx.fill();
  ctx.strokeStyle = '#c22e00';
  ctx.lineWidth = Math.max(1.5, r * 0.05);
  ctx.stroke();
  ctx.fillStyle = '#c22e00';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fs = Math.max(9, r * 0.24);
  ctx.font = `${fs}px Anton, sans-serif`;
  ctx.fillText(line1, 0, -fs * 0.55);
  ctx.font = `${Math.max(8, fs * 0.8)}px Anton, sans-serif`;
  ctx.fillText(line2, 0, fs * 0.55);
  ctx.restore();
}

// Barcode: seeded bars + a number line under them.
function drawBarcode(ctx, x, y, w, h, seed) {
  const rng = makeRng(seed);
  ctx.save();
  ctx.fillStyle = '#0d0518';
  ctx.fillRect(x - 4, y - 4, w + 8, h + 16);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 4, y - 4, w + 8, h + 16);
  let bx = x;
  ctx.fillStyle = '#0d0518';
  while (bx < x + w - 2) {
    const bw = 1 + Math.floor(rng() * 4);
    if (rng() > 0.45) ctx.fillRect(bx, y, bw, h);
    bx += bw + 1 + Math.floor(rng() * 3);
  }
  ctx.font = `${Math.max(7, h * 0.28)}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('0 02113 122620', x + w / 2, y + h + 11);
  ctx.restore();
}

// Striped sunset gradient for the giant title.
function titleGradient(ctx, x, y, w, h) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#fff8dc');
  g.addColorStop(0.22, '#ffd94a');
  g.addColorStop(0.45, '#ff9a3d');
  g.addColorStop(0.68, '#ff5e8a');
  g.addColorStop(0.88, '#c44df0');
  g.addColorStop(1, '#8a3df0');
  return g;
}

function drawTitle(ctx, text, cx, top, maxW, maxH) {
  let size = maxH;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const fit = () => {
    ctx.font = `${size}px Anton, 'Arial Narrow', sans-serif`;
    return ctx.measureText(text).width <= maxW;
  };
  while (size > 12 && !fit()) size -= 2;
  ctx.font = `${size}px Anton, 'Arial Narrow', sans-serif`;
  ctx.shadowColor = 'rgba(10,4,20,0.85)';
  ctx.shadowBlur = size * 0.08;
  ctx.shadowOffsetY = size * 0.03;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#1a0b2e';
  ctx.lineWidth = Math.max(3, size * 0.085);
  ctx.strokeText(text, cx, top);
  ctx.fillStyle = titleGradient(ctx, cx - maxW / 2, top, maxW, size);
  ctx.fillText(text, cx, top);
  ctx.restore();
  return size;
}

function drawScript(ctx, text, cx, y, size) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = `${size}px Pacifico, cursive`;
  ctx.shadowColor = 'rgba(255, 122, 217, 0.9)';
  ctx.shadowBlur = size * 0.25;
  ctx.strokeStyle = 'rgba(26, 11, 46, 0.9)';
  ctx.lineWidth = Math.max(2, size * 0.06);
  ctx.strokeText(text, cx, y);
  ctx.fillStyle = '#ff8ad8';
  ctx.fillText(text, cx, y);
  ctx.restore();
}

// The whole cover. photos: {boulevard, pier, 'upload:0'...} Image elements.
export function drawCover(ctx, state, W, H, photos) {
  const layout = LAYOUTS[state.layout] || LAYOUTS.golden;
  const grade = GRADES[state.grade] || GRADES.golden;
  const g = Math.max(2, Math.round(W * 0.004));
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  // Outer dark ground + thin gold frame.
  ctx.fillStyle = DARK;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(255, 217, 74, 0.9)';
  ctx.lineWidth = Math.max(2, W * 0.002);
  ctx.strokeRect(W * 0.004, H * 0.004, W * 0.992, H * 0.992);

  // Panels.
  const rects = layout.slots.map((s) => slotRect(s, W, H));
  rects.forEach((rect, i) => {
    const slot = state.slots[i] || state.slots[0];
    const seed = 1000 + i * 77;
    if (rect.poly) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(rect.poly[0][0], rect.poly[0][1]);
      for (const [px, py] of rect.poly.slice(1)) ctx.lineTo(px, py);
      ctx.closePath();
      ctx.clip();
      const bounds = polyBounds(rect.poly);
      const panel = renderPanel(slot, bounds, W, H, photos, grade, seed);
      ctx.drawImage(panel, bounds.x, bounds.y, bounds.w, bounds.h);
      ctx.restore();
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(rect.poly[0][0], rect.poly[0][1]);
      for (const [px, py] of rect.poly.slice(1)) ctx.lineTo(px, py);
      ctx.closePath();
      ctx.strokeStyle = DARK;
      ctx.lineWidth = g;
      ctx.stroke();
      ctx.restore();
    } else if (rect.rot) {
      ctx.save();
      const cx = rect.x + rect.w / 2, cy = rect.y + rect.h / 2;
      ctx.translate(cx, cy);
      ctx.rotate((rect.rot * Math.PI) / 180);
      ctx.translate(-cx, -cy);
      // Polaroid frame first: its white fill must sit behind the photo,
      // not paint over it.
      frameRect(ctx, rect, layout.frame, W);
      const panel = renderPanel(slot, rect, W, H, photos, grade, seed);
      ctx.drawImage(panel, rect.x, rect.y, rect.w, rect.h);
      ctx.restore();
    } else {
      const panel = renderPanel(slot, rect, W, H, photos, grade, seed);
      ctx.drawImage(panel, rect.x, rect.y, rect.w, rect.h);
      frameRect(ctx, rect, layout.frame, W);
    }
  });

  // Stickers at panel bottoms, fitted inside the panel so the sub-line
  // never crosses the panel edge; a sticker that would sit under the
  // title glyphs moves to the top of its panel instead.
  const scale = W / 1920;
  const zone = titleZone(layout, W, H);
  rects.forEach((rect, i) => {
    const slot = state.slots[i] || state.slots[0];
    if (!slot.sticker || !slot.sticker.label) return;
    const r = rect.poly ? polyBounds(rect.poly) : rect;
    const sx = r.x + Math.max(6, 10 * scale);
    const total = stickerHeight(slot.sticker.label, slot.sticker.sub || '', scale);
    let top = r.y + r.h - 6 - 8 - total;
    const underTitle = sx >= zone.x0 && sx < zone.x1 && top < zone.bottom && top + total > zone.top;
    if (underTitle) top = r.y + 6;
    // Clip to the panel so a long sub-line never bleeds into the next panel.
    ctx.save();
    if (rect.poly) {
      ctx.beginPath();
      ctx.moveTo(rect.poly[0][0], rect.poly[0][1]);
      for (const [px, py] of rect.poly.slice(1)) ctx.lineTo(px, py);
      ctx.closePath();
      ctx.clip();
    } else {
      ctx.beginPath();
      ctx.rect(r.x, r.y, r.w, r.h);
      ctx.clip();
    }
    drawSticker(ctx, sx, top, slot.sticker.label, slot.sticker.sub || '', scale);
    ctx.restore();
  });

  // Quote strip across the top.
  if (state.showQuote) {
    const qh = H * 0.04;
    ctx.save();
    ctx.fillStyle = 'rgba(13, 5, 24, 0.92)';
    ctx.fillRect(0, 0, W, qh);
    ctx.fillStyle = GOLD;
    ctx.font = `${Math.max(11, qh * 0.52)}px sans-serif`;
    ctx.textBaseline = 'middle';
    const stars = '★★★★★';
    const sw = ctx.measureText(stars).width;
    ctx.font = `bold ${Math.max(11, qh * 0.44)}px 'Arial Narrow', Arial, sans-serif`;
    const quote = `"${state.quote}" — ${state.paper}`;
    const qw = ctx.measureText(quote).width;
    const total = sw + qw + qh * 0.5;
    let x = (W - total) / 2;
    ctx.fillStyle = GOLD;
    ctx.font = `${Math.max(11, qh * 0.52)}px sans-serif`;
    ctx.fillText(stars, x, qh / 2);
    x += sw + qh * 0.5;
    ctx.fillStyle = '#fff3c4';
    ctx.font = `bold ${Math.max(11, qh * 0.44)}px 'Arial Narrow', Arial, sans-serif`;
    ctx.fillText(quote, x, qh / 2);
    ctx.restore();
  }

  // VOL tag + HEAT pill, top-right under the quote strip.
  if (state.showVol) {
    const fs = Math.max(11, Math.round(17 * scale));
    ctx.save();
    ctx.font = `${fs}px Anton, sans-serif`;
    const tw = ctx.measureText(state.vol).width;
    const bw = tw + fs * 1.4, bh = fs * 1.9;
    const bx = W - bw - W * 0.012, by = H * 0.048;
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + bw, by);
    ctx.lineTo(bx + bw - fs * 0.4, by + bh);
    ctx.lineTo(bx, by + bh);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#0d0518';
    ctx.textBaseline = 'middle';
    ctx.fillText(state.vol, bx + fs * 0.7, by + bh / 2);
    ctx.restore();
  }
  if (state.showHeat) {
    const fs = Math.max(11, Math.round(16 * scale));
    ctx.save();
    const label = 'HEAT ';
    const stars = '★'.repeat(state.heat) + '☆'.repeat(Math.max(0, 5 - state.heat));
    ctx.font = `${fs}px Anton, sans-serif`;
    const w1 = ctx.measureText(label).width;
    ctx.font = `${fs}px sans-serif`;
    const w2 = ctx.measureText(stars).width;
    const bw = w1 + w2 + fs * 1.6, bh = fs * 2;
    const bx = W - bw - W * 0.012, by = H * 0.048 + (state.showVol ? fs * 2.4 : 0);
    ctx.fillStyle = 'rgba(13, 5, 24, 0.92)';
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, bh / 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = `${fs}px Anton, sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.fillText(label, bx + fs * 0.8, by + bh / 2);
    ctx.fillStyle = GOLD;
    ctx.font = `${fs}px sans-serif`;
    ctx.fillText(stars, bx + fs * 0.8 + w1, by + bh / 2);
    ctx.restore();
  }

  // Title block.
  const t = layout.title;
  if (t.place === 'center') {
    // Title lives inside its own sunset panel.
    const px = t.x * W, py = t.y * H, pw = t.w * W, ph = t.h * H;
    const c = document.createElement('canvas');
    c.width = Math.max(2, Math.round(pw));
    c.height = Math.max(2, Math.round(ph));
    ART_SCENES.sunset.draw(c.getContext('2d'), c.width, c.height, 4242);
    ctx.drawImage(c, px, py, pw, ph);
    ctx.strokeStyle = DARK;
    ctx.lineWidth = g;
    ctx.strokeRect(px, py, pw, ph);
    const words = state.title.split(' ');
    const lines = words.length > 1
      ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')]
      : [state.title];
    const lh = ph * 0.34;
    lines.forEach((line, i) => {
      drawTitle(ctx, line, px + pw / 2, py + ph * 0.12 + i * lh, pw * 0.94, lh * 0.92);
    });
    drawScript(ctx, state.subtitle, px + pw / 2, py + ph * 0.12 + lines.length * lh, ph * 0.2);
  } else {
    const top = t.top * H;
    const th = H * 0.24;
    const size = drawTitle(ctx, state.title, W / 2, top, W * 0.97, th);
    drawScript(ctx, state.subtitle, W / 2, top + size * 0.92, size * 0.52);
  }

  // Starburst seal, bottom-right over the tagline band.
  if (state.showSeal) {
    const parts = state.seal.split(' ');
    const l1 = parts[0] || 'ORIGINAL';
    const l2 = parts.slice(1).join(' ') || 'COVER ART';
    drawSeal(ctx, W * 0.945, H * 0.85, H * 0.046, l1, l2);
  }

  // Tagline ribbon.
  const ry = H * 0.82, rh = H * 0.055;
  ctx.save();
  const rg = ctx.createLinearGradient(0, ry, 0, ry + rh);
  rg.addColorStop(0, '#ff8a3d');
  rg.addColorStop(1, '#c2437a');
  ctx.fillStyle = rg;
  ctx.fillRect(0, ry, W, rh);
  ctx.fillStyle = '#ffffff';
  ctx.font = `${Math.max(11, rh * 0.5)}px Anton, 'Arial Narrow', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(state.tagline, W / 2, ry + rh / 2);
  ctx.restore();

  // Palm band: sunset strip with palm silhouettes.
  const py = H * 0.875, ph2 = H * 0.055;
  const pg = ctx.createLinearGradient(0, py, 0, py + ph2);
  pg.addColorStop(0, '#ff7a3d');
  pg.addColorStop(1, '#7a2d63');
  ctx.fillStyle = pg;
  ctx.fillRect(0, py, W, ph2);
  {
    const rng = makeRng(99);
    for (let i = 0; i < 7; i++) {
      const px = (i + 0.5) * (W / 7) + (rng() - 0.5) * W * 0.03;
      drawPalm(ctx, px, py + ph2, ph2 * 0.95, (rng() - 0.5) * 0.5, rng);
    }
  }

  // Footer: credits left/centre, COMING SOON + barcode right. The credits
  // shrink until they fit between COMING SOON and the barcode.
  const fy = H * 0.93, fh = H * 0.07;
  ctx.save();
  ctx.fillStyle = DARK;
  ctx.fillRect(0, fy, W, fh);
  ctx.fillStyle = '#ff8ad8';
  ctx.font = `${Math.max(10, fh * 0.32)}px Anton, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('COMING SOON', W * 0.012, fy + fh / 2);
  const csW = ctx.measureText('COMING SOON').width;
  ctx.fillStyle = 'rgba(255, 243, 196, 0.85)';
  const left = W * 0.012 + csW + 20;
  const right = W * 0.9 - 16;
  let ffs = Math.max(9, fh * 0.26);
  ctx.font = `${ffs}px 'Arial Narrow', Arial, sans-serif`;
  while (ffs > 8 && ctx.measureText(state.footer).width > right - left) {
    ffs -= 0.5;
    ctx.font = `${ffs}px 'Arial Narrow', Arial, sans-serif`;
  }
  ctx.textAlign = 'center';
  ctx.fillText(state.footer, (left + right) / 2, fy + fh / 2);
  if (state.showBarcode) {
    drawBarcode(ctx, W * 0.9, fy + fh * 0.18, W * 0.075, fh * 0.42, 7);
  }
  ctx.restore();

  // Grain + vignette last, over everything.
  drawGrain(ctx, W, H, 1337, 0.045);
  drawVignette(ctx, W, H);
  ctx.restore();
}

function polyBounds(poly) {
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  const x = Math.min(...xs), y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

// Render the cover to a fresh canvas at the requested size.
export function renderCover(state, W, H, photos) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  drawCover(canvas.getContext('2d'), state, W, H, photos);
  return canvas;
}
