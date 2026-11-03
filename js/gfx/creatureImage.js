// Ein Wesen als eigenes, scharf hochskaliertes Canvas fürs Menü (Seite „Wesen“, Wesen-Buch):
// in Farbe, als Silhouette (gesehen, noch nicht besiegt) oder als Glanzform. Nur im Browser.

import { creatureRows } from './art/creatures.js';
import { shinyRows } from './art/shiny.js';
import { spriteFrom } from './canvasSprites.js';

export function creatureCanvas(speciesId, stage, { look = 'color', scale = 2 } = {}) {
  const base = creatureRows(speciesId, stage);
  const rows = look === 'shiny' ? shinyRows(base, speciesId) : base;
  const src = spriteFrom(`img:${speciesId}:${rows.length}:${look === 'shiny' ? 'glanz' : 'farbe'}`, rows);
  const c = document.createElement('canvas');
  c.width = src.width * scale;
  c.height = src.height * scale;
  c.className = 'creature-img';
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.drawImage(src, 0, 0, c.width, c.height);
  if (look === 'silhouette') {
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = '#46496e';
    g.fillRect(0, 0, c.width, c.height);
  }
  return c;
}
