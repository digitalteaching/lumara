// Entwickler-Galerie (?galerie, nur localhost): alle Wesen in Originalgröße auf dem Bucht-Hintergrund.
// Passen nicht alle auf ein Bild, blättert A (oder Tippen) zur nächsten Seite.

import { CREATURE_ART } from '../gfx/art/creatures.js';
import { spriteFrom } from '../gfx/canvasSprites.js';
import { SPECIES } from '../data/species.js';
import { el } from '../ui/dom.js';
import { drawBayArena } from '../gfx/arena.js';

export function createGalleryScene(game) {
  const entries = [];
  for (const [id, stages] of Object.entries(CREATURE_ART)) {
    for (const [stage, rows] of Object.entries(stages)) entries.push({ id, stage: Number(stage), rows });
  }

  // Seiten: Zeilen von links nach rechts, eine neue Seite, wenn unten kein Platz mehr ist.
  function layout() {
    let x = 6, y = 4, rowH = 0, page = 0;
    return entries.map(e => {
      const size = e.rows.length;
      if (x + size > 236) {
        x = 6;
        y += rowH + 12;
        rowH = 0;
      }
      if (y + size + 10 > 160) {
        page++;
        x = 6;
        y = 4;
        rowH = 0;
      }
      const pos = { x, y, page };
      x += size + 10;
      rowH = Math.max(rowH, size);
      return pos;
    });
  }
  const positions = layout();
  const pages = Math.max(...positions.map(p => p.page)) + 1;
  let page = 0;
  let labels = [];
  let offA = () => {};

  function showLabels() {
    labels.forEach(l => l.remove());
    labels = [];
    entries.forEach((e, i) => {
      const p = positions[i];
      if (p.page !== page) return;
      const label = el('div', {
        class: 'gallery-label passive',
        style: { left: `calc(var(--gpx) * ${p.x})`, top: `calc(var(--gpx) * ${p.y + e.rows.length + 1})` },
      }, SPECIES[e.id].names[e.stage - 1]);
      labels.push(label);
      game.ui.append(label);
    });
  }

  return {
    enter() {
      game.mode = 'screen';
      showLabels();
      offA = game.input.on('a', () => {
        page = (page + 1) % pages;
        showLabels();
      });
    },
    exit() {
      offA();
      labels.forEach(l => l.remove());
    },
    update() {},
    render(ctx, t) {
      drawBayArena(ctx, t, game.reducedMotion);
      entries.forEach((e, i) => {
        const p = positions[i];
        if (p.page === page) ctx.drawImage(spriteFrom(`creature:${e.id}:${e.stage}`, e.rows), p.x, p.y);
      });
    },
  };
}
