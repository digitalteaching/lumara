// Sprites sind Pixelraster aus Palettenzeichen (siehe palette.js), '.' ist durchsichtig.
// Dieses Modul ist DOM-frei und wird in Node getestet.

import { CHARS } from './palette.js';

// Vorlagen-String → Zeilen, ohne leere Rand-Zeilen und ohne gemeinsame Einrückung.
export function rows(str) {
  const lines = str.split('\n');
  while (lines.length && lines[0].trim() === '') lines.shift();
  while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
  const indent = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^ */)[0].length));
  return lines.map(l => l.slice(indent).trimEnd());
}

export function parseSprite(name, lines) {
  const h = lines.length;
  const w = h ? lines[0].length : 0;
  const data = new Uint8Array(w * h);
  lines.forEach((line, y) => {
    if (line.length !== w) {
      throw new Error(`Sprite ${name}: Zeile ${y + 1} hat Länge ${line.length} statt ${w}`);
    }
    for (let x = 0; x < w; x++) {
      const ch = line[x];
      if (ch === '.') continue;
      const idx = CHARS[ch];
      if (!idx) throw new Error(`Sprite ${name}: unbekanntes Zeichen '${ch}' in Zeile ${y + 1}`);
      data[y * w + x] = idx;
    }
  });
  return { name, w, h, data };
}
