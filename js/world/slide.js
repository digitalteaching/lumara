// Gleiten auf Rutscheis (Design 5.7, Rätsel der Eisgrotte): Wer auf Rutscheis steht und vorne frei
// hat, rutscht in seiner Richtung weiter. Eingaben zählen erst wieder, wenn etwas die Figur aufhält
// oder sie auf festem Boden ankommt. Ein Schritt nach dem anderen, gleichmäßig. DOM-frei.

import { step, cellKey } from './map.js';

// p: die Figur (x, y ist das Feld, auf dem sie steht oder auf das sie gerade läuft; dir ihre Richtung).
// occupied: zusätzlich belegte Felder (wie bei player.update).
export function isSliding(map, p, occupied) {
  if (!map.isSlippery(p.x, p.y)) return false;
  const n = step(p, p.dir);
  return map.canEnter(n.x, n.y, occupied);
}

export const slideIntent = (map, p, inputDir, occupied) => (isSliding(map, p, occupied) ? p.dir : inputDir);

const DIRS = ['up', 'down', 'left', 'right'];

// Ein Zug: ein Schritt in eine Richtung und danach Rutschen, bis etwas aufhält.
function slideMove(map, from, dir, occupied) {
  let at = step(from, dir);
  if (!map.canEnter(at.x, at.y, occupied)) return null;
  const slid = map.isSlippery(from.x, from.y) || map.isSlippery(at.x, at.y);
  for (;;) {
    if (!map.isSlippery(at.x, at.y)) break;
    const n = step(at, dir);
    if (!map.canEnter(n.x, n.y, occupied)) break;
    at = n;
  }
  return { at, slid };
}

// Alle Felder, auf denen man vom Start aus zum Stehen kommen kann, mit der kleinsten Zahl der
// Rutschzüge bis dorthin (Schritte auf festem Boden zählen nicht). Für Tests und den Kartenbau.
// occupied: zusätzlich belegte Felder, etwa ein noch liegender Stein.
export function slideStops(map, start, occupied) {
  const dist = new Map([[cellKey(start.x, start.y), 0]]);
  const queue = [{ x: start.x, y: start.y }];
  while (queue.length) {
    const cur = queue.shift();
    const d = dist.get(cellKey(cur.x, cur.y));
    for (const dir of DIRS) {
      const m = slideMove(map, cur, dir, occupied);
      if (!m) continue;
      const k = cellKey(m.at.x, m.at.y);
      const nd = d + (m.slid ? 1 : 0);
      if (dist.has(k) && dist.get(k) <= nd) continue;
      dist.set(k, nd);
      if (m.slid) queue.push(m.at);
      else queue.unshift(m.at);
    }
  }
  return dist;
}
