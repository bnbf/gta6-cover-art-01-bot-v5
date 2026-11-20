# Golden Hour Cover Studio

[![make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/bnbf/gta6-cover-art-01-bot-v5/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/bnbf/gta6-cover-art-01-bot-v5/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

An offline browser web app that turns your photos into GTA 6-style cover
art — the multi-panel poster and loading-screen look with a golden-hour
neon-sunset grade — and exports it as a PNG to share.

## What it does

- **11 layouts**: Golden Hour (7-panel asymmetric collage, the default),
  Sunset Strip (8 panels around a centre title panel), Key Art, Car Hero,
  Nine-Panel Grid, Hero + Three, Full Bleed, Tilted Snapshots, Diagonal
  Bands, Split Duo and Centre Stage.
- **8 grades**: Golden Hour (warm photographic, the default), Vice Sunset,
  Neon Night, Gold Hour, Teal Heat, Mono Ink, True Colour and Poster Ink
  (flat screen-print with halftone dots).
- **Your photos or procedural art**: upload up to 4 photos, or use the two
  bundled sample photos (made for make.fun, free to use) and three
  procedural scenes — Sunset Strip, Neon Skyline and Palm Road — drawn on
  canvas, seeded so every render is identical.
- **Crop and position per panel**: click a panel to select it, drag the
  photo to pan, scroll to zoom. Photos anchor on the face band by default,
  so heads are never cropped out.
- **The genre's lettering**: a giant title in a striped sunset gradient
  with a heavy outline (Anton), a pink neon script subtitle (Pacifico,
  both fonts vendored under the OFL), a five-star press-quote strip, a
  volume tag, a heat meter, a starburst seal and a tagline ribbon.
- **Sticker labels with sub-lines**: every panel carries a label plus a
  place · time · tag line, like the covers on the leaderboard.
- **Palm band and footer**: a sunset strip with palm silhouettes, COMING
  SOON, credits and a barcode.
- **Three export sizes**: 1080×1080 (square), 1080×1350 (story),
  1920×1080 (wide), one click to a PNG.
- **Undo / redo, shuffle, presets** (Golden Hour, Neon Night, Poster Pop)
  and a saved state in your browser.

## How to use it

1. Serve `app/` locally: `node serve.ts`, then open
   http://localhost:8080.
2. Pick a preset, a layout and a grade. Click a panel, then a photo or
   art thumbnail to fill it. Drag to pan, scroll to zoom.
3. Edit the title, subtitle, tagline, quote, paper, volume, seal and
   footer. Toggle the quote strip, volume tag, heat pill, seal and
   barcode.
4. Choose an export size and hit **Export PNG**. **Copy share text**
   puts a ready caption on the clipboard.

Everything runs offline in the browser: no uploads, no tracking, no
network requests. Your photos never leave your machine.

## Build

`main.ts` (Node 22, standard library only) copies `app/` and
`screenshots/` to `/output` and writes `/output/dossier.json` with the
vendored make.fun library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Screenshots in `screenshots/` are real renders of the app, taken in
headless Chrome: the golden-hour landscape cover, the editor with a
photo loaded, a story-size cover, and a square Key Art cover in Poster
Ink.

## Licence

MIT. Fonts Anton and Pacifico are under the SIL Open Font License 1.1
(see `app/fonts/OFL.txt`).
