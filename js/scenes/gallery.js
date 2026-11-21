// Entwickler-Galerie (?galerie, nur localhost): alle Wesen in Originalgröße auf dem Bucht-Hintergrund.
// Passen nicht alle auf ein Bild, blättert A (oder Tippen) zur nächsten Seite.

import { CREATURE_ART } from '../gfx/art/creatures.js';
import { shinyRows } from '../gfx/art/shiny.js';
import { miniFrames } from '../gfx/art/minis.js';
import { FRIENDABLE } from '../friends/friends.js';
import { spriteFrom } from '../gfx/canvasSprites.js';
import { SPECIES } from '../data/species.js';
import { el } from '../ui/dom.js';
import { drawBayArena } from '../gfx/arena.js';

const MINI_ZOOM = 4;

// ?galerie&glanz: alle Bilder als Glanzform (Design 6.4).
// ?galerie&klein: die Kleinbilder (16 × 16) der befreundbaren Arten, beide Bilder, vierfach.
export function createGalleryScene(game, { shiny = false, mini = false } = {}) {
  const entries = [];
  if (mini) {
    for (const id of FRIENDABLE) {
      const frames = miniFrames(id, { shiny });
      entries.push({ id, mini: frames, w: 2 * 16 * MINI_ZOOM + 4, h: 16 * MINI_ZOOM, label: SPECIES[id].names[0] });
    }
  } else {
    for (const [id, stages] of Object.entries(CREATURE_ART)) {
      for (const [stage, rows] of Object.entries(stages)) {
        entries.push({ id, stage: Number(stage), rows: shiny ? shinyRows(rows, id) : rows, w: rows.length, h: rows.length, label: SPECIES[id].names[Number(stage) - 1] });
      }
    }
  }
  const suffix = shiny ? ':glanz' : '';

  // Seiten: Zeilen von links nach rechts, eine neue Seite, wenn unten kein Platz mehr ist.
  function layout() {
    let x = 6, y = 4, rowH = 0, page = 0;
    return entries.map(e => {
      const size = e.h;
      if (x + e.w > 236) {
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
      x += e.w + 10;
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
        style: { left: `calc(var(--gpx) * ${p.x})`, top: `calc(var(--gpx) * ${p.y + e.h + 1})` },
      }, e.label);
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
        if (p.page !== page) return;
        if (e.mini) {
          e.mini.forEach((rows, f) => {
            const img = spriteFrom(`mini:${e.id}:${f}${suffix}`, rows);
            ctx.drawImage(img, p.x + f * (16 * MINI_ZOOM + 4), p.y, img.width * MINI_ZOOM, img.height * MINI_ZOOM);
          });
        } else {
          ctx.drawImage(spriteFrom(`creature:${e.id}:${e.stage}${suffix}`, e.rows), p.x, p.y);
        }
      });
    },
  };
}
