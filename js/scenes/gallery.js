// Entwickler-Galerie (?galerie, nur localhost): alle Wesen in Originalgröße auf dem Bucht-Hintergrund.

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
  const labels = [];

  function layout() {
    let x = 6, y = 4, rowH = 0;
    return entries.map(e => {
      const size = e.rows.length;
      if (x + size > 236) {
        x = 6;
        y += rowH + 12;
        rowH = 0;
      }
      const pos = { x, y };
      x += size + 10;
      rowH = Math.max(rowH, size);
      return pos;
    });
  }
  const positions = layout();

  return {
    enter() {
      game.mode = 'screen';
      entries.forEach((e, i) => {
        const name = SPECIES[e.id].names[e.stage - 1];
        const p = positions[i];
        const label = el('div', {
          class: 'gallery-label passive',
          style: { left: `calc(var(--gpx) * ${p.x})`, top: `calc(var(--gpx) * ${p.y + e.rows.length + 1})` },
        }, name);
        labels.push(label);
        game.ui.append(label);
      });
    },
    exit() {
      labels.forEach(l => l.remove());
    },
    update() {},
    render(ctx, t) {
      drawBayArena(ctx, t);
      entries.forEach((e, i) => {
        const p = positions[i];
        ctx.drawImage(spriteFrom(`creature:${e.id}:${e.stage}`, e.rows), p.x, p.y);
      });
    },
  };
}
