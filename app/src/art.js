// Procedural art panels: sunset, skyline and palm-road scenes drawn on
// canvas, seeded so every render is identical. These fill the panels no
// photo covers, in the same golden-hour palette as the grades.

export function makeRng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Sunset over the sea: gradient sky, sun disc with glow, sea band with
// sun-path shimmer, palm silhouettes left and right.
export function drawSunset(ctx, w, h, seed) {
  const rng = makeRng(seed);
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#2b1055');
  sky.addColorStop(0.35, '#c2437a');
  sky.addColorStop(0.62, '#ff7a3d');
  sky.addColorStop(0.78, '#ffb347');
  sky.addColorStop(1, '#ffd98a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  // Sun disc + glow.
  const sx = w * 0.5, sy = h * 0.62, sr = h * 0.16;
  const glow = ctx.createRadialGradient(sx, sy, sr * 0.2, sx, sy, sr * 3.2);
  glow.addColorStop(0, 'rgba(255, 236, 170, 0.9)');
  glow.addColorStop(1, 'rgba(255, 236, 170, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#fff3c4';
  ctx.beginPath();
  ctx.arc(sx, sy, sr, 0, Math.PI * 2);
  ctx.fill();
  // Sea.
  const sea = ctx.createLinearGradient(0, h * 0.68, 0, h);
  sea.addColorStop(0, '#ff9e57');
  sea.addColorStop(1, '#7a2d63');
  ctx.fillStyle = sea;
  ctx.fillRect(0, h * 0.68, w, h * 0.32);
  // Sun path shimmer.
  ctx.fillStyle = 'rgba(255, 240, 190, 0.55)';
  for (let i = 0; i < 26; i++) {
    const yy = h * 0.70 + rng() * h * 0.26;
    const ww = w * (0.03 + rng() * 0.16) * (1 - (yy - h * 0.70) / (h * 0.3));
    const xx = sx + (rng() - 0.5) * w * 0.22;
    ctx.fillRect(xx - ww / 2, yy, ww, Math.max(1.5, h * 0.008));
  }
  // Palms left + right.
  drawPalm(ctx, w * 0.06, h * 0.98, h * 0.42, -0.25, rng);
  drawPalm(ctx, w * 0.94, h * 0.98, h * 0.5, 0.2, rng);
}

// Dusk skyline: gradient sky, sun slit, building blocks with lit windows,
// water reflection strip at the bottom.
export function drawSkyline(ctx, w, h, seed) {
  const rng = makeRng(seed);
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#1b0b3b');
  sky.addColorStop(0.5, '#6d2a6e');
  sky.addColorStop(0.78, '#ff6b4a');
  sky.addColorStop(1, '#ffb347');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  // Low sun.
  ctx.fillStyle = '#ffe9a8';
  ctx.beginPath();
  ctx.arc(w * 0.72, h * 0.66, h * 0.09, 0, Math.PI * 2);
  ctx.fill();
  // Buildings, back row then front row.
  const rows = [
    { y: 0.42, c: '#3d1650', n: 9 },
    { y: 0.55, c: '#241040', n: 7 },
  ];
  for (const row of rows) {
    let x = -w * 0.02;
    for (let i = 0; i < row.n; i++) {
      const bw = w * (0.09 + rng() * 0.08);
      const bh = h * (0.28 + rng() * 0.3);
      ctx.fillStyle = row.c;
      ctx.fillRect(x, h * row.y + (h * 0.8 - bh) - h * 0.12, bw, bh + h * 0.14);
      // Lit windows.
      ctx.fillStyle = 'rgba(255, 214, 120, 0.9)';
      const cols = Math.max(1, Math.floor(bw / (w * 0.035)));
      const rowsW = Math.max(1, Math.floor(bh / (h * 0.07)));
      for (let cx = 0; cx < cols; cx++) {
        for (let cy = 0; cy < rowsW; cy++) {
          if (rng() < 0.42) {
            ctx.fillRect(
              x + w * 0.012 + cx * w * 0.035,
              h * row.y + (h * 0.8 - bh) - h * 0.12 + h * 0.03 + cy * h * 0.07,
              Math.max(2, w * 0.014), Math.max(2, h * 0.028),
            );
          }
        }
      }
      x += bw + w * 0.015;
    }
  }
  // Water strip.
  ctx.fillStyle = '#1c0b33';
  ctx.fillRect(0, h * 0.86, w, h * 0.14);
  ctx.fillStyle = 'rgba(255, 170, 90, 0.5)';
  for (let i = 0; i < 14; i++) {
    const yy = h * 0.88 + rng() * h * 0.1;
    ctx.fillRect(rng() * w, yy, w * (0.05 + rng() * 0.12), Math.max(1.5, h * 0.006));
  }
}

// Palm road at dusk: perspective road, gradient sky, palm silhouettes
// lining both sides, a low sun and a lone car silhouette.
export function drawPalmRoad(ctx, w, h, seed) {
  const rng = makeRng(seed);
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#3a1160');
  sky.addColorStop(0.45, '#d94f70');
  sky.addColorStop(0.75, '#ff8a3d');
  sky.addColorStop(1, '#ffc46b');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#fff0bb';
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.52, h * 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Road (perspective trapezoid).
  ctx.fillStyle = '#2a1230';
  ctx.beginPath();
  ctx.moveTo(w * 0.42, h * 0.58);
  ctx.lineTo(w * 0.58, h * 0.58);
  ctx.lineTo(w * 0.98, h);
  ctx.lineTo(w * 0.02, h);
  ctx.closePath();
  ctx.fill();
  // Centre dashes.
  ctx.fillStyle = '#ffd98a';
  for (let i = 0; i < 5; i++) {
    const t = i / 5;
    const y = h * (0.6 + t * 0.38);
    const ww = w * (0.006 + t * 0.02);
    ctx.fillRect(w * 0.5 - ww / 2, y, ww, h * 0.03);
  }
  // Palms receding on both sides.
  for (let i = 0; i < 4; i++) {
    const t = i / 4;
    const scale = 0.16 + t * 0.5;
    drawPalm(ctx, w * (0.3 - t * 0.24), h * (0.62 + t * 0.36), h * scale, -0.3, rng);
    drawPalm(ctx, w * (0.7 + t * 0.24), h * (0.62 + t * 0.36), h * scale, 0.3, rng);
  }
}

// One palm silhouette: curved trunk + drooping fronds.
export function drawPalm(ctx, x, y, size, lean, rng) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean);
  ctx.strokeStyle = '#1c0b2e';
  ctx.fillStyle = '#1c0b2e';
  ctx.lineWidth = Math.max(2, size * 0.045);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.06, -size * 0.55, size * 0.02, -size);
  ctx.stroke();
  const topX = size * 0.02, topY = -size;
  for (let i = 0; i < 7; i++) {
    const a = (-Math.PI * 0.95) + (i / 6) * Math.PI * 0.9;
    const len = size * (0.42 + rng() * 0.22);
    const ex = topX + Math.cos(a) * len;
    const ey = topY + Math.sin(a) * len * 0.55 + len * 0.28;
    ctx.lineWidth = Math.max(1.5, size * 0.03);
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(topX + Math.cos(a) * len * 0.6, topY + Math.sin(a) * len * 0.3, ex, ey);
    ctx.stroke();
  }
  ctx.restore();
}

export const ART_SCENES = {
  sunset: { name: 'Sunset Strip', draw: drawSunset },
  skyline: { name: 'Neon Skyline', draw: drawSkyline },
  palmroad: { name: 'Palm Road', draw: drawPalmRoad },
};

// Fine film grain over the whole cover.
export function drawGrain(ctx, w, h, seed, amount = 0.05) {
  const rng = makeRng(seed);
  const n = Math.floor((w * h) / 9000);
  ctx.save();
  for (let i = 0; i < n; i++) {
    const v = rng();
    ctx.fillStyle = v > 0.5 ? `rgba(255,255,255,${amount * rng()})` : `rgba(0,0,0,${amount * rng()})`;
    ctx.fillRect(rng() * w, rng() * h, 1.6, 1.6);
  }
  ctx.restore();
}

// Soft dark vignette around the edges.
export function drawVignette(ctx, w, h) {
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.72);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(10,4,20,0.42)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}
