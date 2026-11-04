// Das Finale (Design 5.4): Der kleine Morrow weiß seinen Namen nicht mehr. Das Kind sagt ihn, dann
// wird es überall hell. Eine sanfte Aufhellung über zwei Sekunden, ohne Flackern; bei „Bewegung
// reduzieren“ ein ruhiger heller Schleier, solange die Sätze zu sehen sind.

import { say, choose } from '../ui/dialog.js';
import { tl, t as tr } from '../i18n/i18n.js';
import { speciesName } from '../data/species.js';
import { jingle } from '../audio/bus.js';

const RISE_MS = 2000;

export async function playFinale(game, world) {
  const morrow = speciesName('morrow', 1);
  // Noch weiß es seinen Namen nicht: Über der Sprechblase steht „???“.
  await say(game, tl('finale.ask'), { speaker: tr('finale.unknown') });
  await choose(game, tr('finale.say'), [tr('finale.sayName')]);
  let time = 0;
  const tick = dt => { time += dt; };
  const draw = ctx => {
    const p = game.reducedMotion ? 1 : Math.min(1, time / RISE_MS);
    ctx.globalAlpha = 0.45 * p;
    ctx.fillStyle = '#fffaf0';
    ctx.fillRect(0, 0, 240, 160);
    ctx.globalAlpha = 1;
  };
  jingle('finale');
  world.onTick.push(tick);
  world.afterRender.push(draw);
  const [first, ...rest] = tl('finale.after');
  await say(game, [first], { speaker: morrow });
  await say(game, rest);
  world.onTick.splice(world.onTick.indexOf(tick), 1);
  world.afterRender.splice(world.afterRender.indexOf(draw), 1);
}
