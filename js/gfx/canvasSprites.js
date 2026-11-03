// Pixelraster → Canvas (nur im Browser). Ergebnisse werden zwischengespeichert.

import { PALETTE } from './palette.js';
import { parseSprite } from './sprites.js';

const RGB = [null, ...PALETTE.map(p => [1, 3, 5].map(i => parseInt(p.hex.slice(i, i + 2), 16)))];

const bySprite = new WeakMap();
const byName = new Map();

export function spriteCanvas(sprite, { flip = false } = {}) {
  let entry = bySprite.get(sprite);
  if (!entry) bySprite.set(sprite, (entry = {}));
  const key = flip ? 'flip' : 'plain';
  if (entry[key]) return entry[key];

  const canvas = document.createElement('canvas');
  canvas.width = sprite.w;
  canvas.height = sprite.h;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(sprite.w, sprite.h);
  for (let y = 0; y < sprite.h; y++) {
    for (let x = 0; x < sprite.w; x++) {
      const idx = sprite.data[y * sprite.w + x];
      if (!idx) continue;
      const tx = flip ? sprite.w - 1 - x : x;
      const o = (y * sprite.w + tx) * 4;
      const [r, g, b] = RGB[idx];
      img.data[o] = r;
      img.data[o + 1] = g;
      img.data[o + 2] = b;
      img.data[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  entry[key] = canvas;
  return canvas;
}

// Bequemer Weg für Kunst-Module: Name + Zeilen → Canvas, einmal gelesen und zwischengespeichert.
export function spriteFrom(name, lines, opts = {}) {
  let sprite = byName.get(name);
  if (!sprite) byName.set(name, (sprite = parseSprite(name, lines)));
  return spriteCanvas(sprite, opts);
}

// Weiße Silhouette eines Sprites für das Aufhellen bei Treffern.
const whiteCache = new WeakMap();
export function whiteOf(img) {
  let c = whiteCache.get(img);
  if (!c) {
    c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = '#fffaf0';
    g.fillRect(0, 0, c.width, c.height);
    whiteCache.set(img, c);
  }
  return c;
}
