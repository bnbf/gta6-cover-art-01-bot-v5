// Golden Hour Cover Studio — the entry program (Node 22, standard library
// only). It copies this directory's app/ and screenshots/ to /output and
// writes /output/dossier.json with the vendored make.fun library, using the
// scorer's own caps from the kit's reference/gate.json:
//   dossier at most 1.5 MiB, its text 160 KiB;
//   3 to 4 screenshots, each at most 256 KiB, long side at most 1280 px,
//   short side at least 480 px;
//   app/ at most 993 files/dirs and 48 MiB, each path at most 1000 bytes.
// Run it with:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
console.log('dossier written to', join(out, 'dossier.json'));
