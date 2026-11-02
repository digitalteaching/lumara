// Entwickler-Galerie (?galerie, nur localhost): alle Wesen in Originalgröße auf dem Bucht-Hintergrund.

import { CREATURE_ART } from '../gfx/art/creatures.js';
import { spriteFrom } from '../gfx/canvasSprites.js';
import { SPECIES } from '../data/species.js';
import { el } from '../ui/dom.js';

export function drawBayArena(ctx, t = 0) {
  const sky = ctx.createLinearGradient(0, 0, 0, 70);
  sky.addColorStop(0, '#4fa3c4');
  sky.addColorStop(1, '#a7dde8');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 240, 70);
  ctx.fillStyle = '#f3ecd2';
  for (const [x, y, w] of [[30, 14, 26], [150, 22, 34], [96, 8, 18]]) {
    ctx.fillRect(x, y, w, 4);
    ctx.fillRect(x + 4, y - 3, w - 10, 3);
  }
  ctx.fillStyle = '#2f6f9c';
  ctx.fillRect(0, 56, 240, 16);
  ctx.fillStyle = '#4fa3c4';
  for (let x = (Math.floor(t / 120) % 12) - 12; x < 240; x += 12) ctx.fillRect(x, 60, 6, 1);
  ctx.fillStyle = '#f1ddb0';
  ctx.fillRect(0, 72, 240, 88);
  ctx.fillStyle = '#e2c48f';
  for (let i = 0; i < 70; i++) ctx.fillRect((i * 53) % 240, 74 + ((i * 29) % 80), 1, 1);
}

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
