// Erzeugt die App-Symbole: node tools/make-icons.mjs (im Repo-Wurzelordner).
// Die PNG-Dateien werden mit eingecheckt, das Spiel selbst braucht dieses Werkzeug nicht.

import { mkdirSync, writeFileSync } from 'node:fs';
import { encodePng } from './png.js';
import { renderIcon } from './icon.js';

mkdirSync('icons', { recursive: true });
for (const size of [180, 192, 512]) {
  writeFileSync(`icons/icon-${size}.png`, encodePng(size, size, renderIcon(size)));
  console.log(`icons/icon-${size}.png`);
}
