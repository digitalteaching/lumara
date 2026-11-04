// Entwicklung über der Welt (Design 6.3), etwa nach einem Zettel: ein dunkler Grund über dem Bild,
// das Wesen in der Mitte. Ablauf wie die Leuchtstein-Szene: Einträge in onTick und afterRender, die
// sich selbst wieder entfernen.

import { creatureRows } from '../gfx/art/creatures.js';
import { spriteFrom } from '../gfx/canvasSprites.js';
import { drawEvolution, evolutionAt } from '../gfx/evolution.js';

const BASE = { x: 120, y: 104 };

// Solange die Szene läuft, ist die Welt nicht im Laufmodus: Anzeige oben links, Menüknopf und
// Steuerkreuz sind weg (die Anzeige zeigte sonst schon den neuen Namen).
export function playEvolution(game, world, { species, from, to }) {
  return new Promise(resolve => {
    const fromRows = creatureRows(species, from);
    const toRows = creatureRows(species, to);
    let imgs = null; // erst beim Zeichnen, im Browser
    const prevMode = game.mode;
    game.mode = 'scene';
    let ms = 0;
    const tick = dt => {
      ms += dt;
      if (!evolutionAt(ms, game.reducedMotion).done) return;
      world.onTick.splice(world.onTick.indexOf(tick), 1);
      world.afterRender.splice(world.afterRender.indexOf(draw), 1);
      game.mode = prevMode;
      resolve();
    };
    const draw = ctx => {
      ctx.fillStyle = 'rgba(27, 26, 46, 0.82)';
      ctx.fillRect(0, 0, 240, 160);
      imgs ??= {
        fromImg: spriteFrom(`creature:${species}:${fromRows.length}`, fromRows),
        toImg: spriteFrom(`creature:${species}:${toRows.length}`, toRows),
      };
      drawEvolution(ctx, ms, imgs, BASE, game.reducedMotion);
    };
    world.onTick.push(tick);
    world.afterRender.push(draw);
  });
}
