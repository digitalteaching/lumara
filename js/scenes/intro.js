// Intro (Design 4, Schritt 3): Ein Boot legt in der Leuchtturmbucht an, Ilvy erzählt vom Nebel.
// Mit „Überspringen“ oder B geht es sofort weiter.

import { createWorldScene } from './world.js';
import { BUILDINGS } from '../gfx/art/tiles.js';
import { spriteFrom } from '../gfx/canvasSprites.js';
import { say, closeDialogs } from '../ui/dialog.js';
import { el } from '../ui/dom.js';
import { t as tr, tl } from '../i18n/i18n.js'; // t ist hier ein eigener Name

const BOAT_TO = { x: 20 * 16, y: 24 * 16 };
const BOAT_FROM = { x: 40 * 16, y: 26 * 16 };
const ARRIVE_MS = 2600;

export function createIntroScene(game, next) {
  const world = createWorldScene(game, undefined, { hidePlayer: true, hiddenIds: ['boot'], passive: true });
  let t = 0;
  let skipBtn = null;
  let offB = null;
  let finished = false;

  function finish() {
    if (finished) return;
    finished = true;
    next();
  }

  async function run() {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    if (!game.reducedMotion) await wait(ARRIVE_MS + 300);
    for (const line of tl('intro.lines')) {
      if (finished) return;
      await say(game, [line], { speaker: 'Ilvy' });
    }
    finish();
  }

  return {
    enter() {
      game.mode = 'screen';
      skipBtn = el('button', { class: 'btn skip-btn', type: 'button', onclick: finish }, tr('intro.skip'));
      game.ui.append(skipBtn);
      offB = game.input.on('b', finish);
      run();
    },
    exit() {
      finished = true;
      skipBtn?.remove();
      offB?.();
      closeDialogs();
      game.input.consume();
    },
    update(dt) {
      t += dt;
      world.update(dt);
    },
    render(ctx) {
      world.render(ctx);
      const cam = world.camera();
      const p = game.reducedMotion ? 1 : Math.min(1, t / ARRIVE_MS);
      const ease = 1 - (1 - p) * (1 - p);
      const x = BOAT_FROM.x + (BOAT_TO.x - BOAT_FROM.x) * ease;
      const y = BOAT_FROM.y + (BOAT_TO.y - BOAT_FROM.y) * ease + (p < 1 ? Math.sin(t / 220) : 0);
      ctx.drawImage(spriteFrom('building:boat', BUILDINGS.boat), Math.round(x - cam.x), Math.round(y - cam.y));
    },
  };
}
