// App-Symbol (Design 14: das einzige Bild als Datei, selbst erzeugt): der Leuchtturm aus dem Spiel
// vor dem Nachthimmel, mit warmem Licht um die Lampe. Kein Text.

import { BUILDINGS } from '../js/gfx/art/tiles.js';
import { parseSprite } from '../js/gfx/sprites.js';
import { hexOf } from '../js/gfx/palette.js';

const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
const TOP = rgb('#12111f');
const BOTTOM = rgb('#2f3a5c');
const GLOW = rgb('#ffe08a');
const LAMP = { x: 16, y: 10 }; // Lampe im Leuchtturm-Sprite (32 × 64)

export function renderIcon(size) {
  const px = new Uint8Array(size * size * 4);
  const sprite = parseSprite('lighthouse', BUILDINGS.lighthouse);
  const scale = Math.max(2, Math.floor((size * 0.75) / sprite.h));
  const left = Math.round((size - sprite.w * scale) / 2);
  const top = Math.round((size - sprite.h * scale) / 2);
  const lampX = left + LAMP.x * scale;
  const lampY = top + LAMP.y * scale;
  const glowR = size * 0.32;

  for (let y = 0; y < size; y++) {
    const t = y / (size - 1);
    for (let x = 0; x < size; x++) {
      let c = TOP.map((v, i) => v + (BOTTOM[i] - v) * t);
      const d = Math.hypot(x - lampX, y - lampY) / glowR;
      if (d < 1) {
        const a = 0.55 * (1 - d) ** 2;
        c = c.map((v, i) => v + (GLOW[i] - v) * a);
      }
      const o = (y * size + x) * 4;
      px[o] = Math.round(c[0]);
      px[o + 1] = Math.round(c[1]);
      px[o + 2] = Math.round(c[2]);
      px[o + 3] = 255;
    }
  }

  for (let sy = 0; sy < sprite.h; sy++) {
    for (let sx = 0; sx < sprite.w; sx++) {
      const idx = sprite.data[sy * sprite.w + sx];
      if (!idx) continue;
      const [r, g, b] = rgb(hexOf(idx));
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const o = ((top + sy * scale + dy) * size + left + sx * scale + dx) * 4;
          px[o] = r;
          px[o + 1] = g;
          px[o + 2] = b;
        }
      }
    }
  }
  return px;
}
