// Duelle in der Welt (Design 6.4, 7.1): wilde Wesen im hohen Gras, die Hüterin der Bucht,
// Aufwachen am Leuchtturm nach einer Niederlage und das Licht des Leuchtturms.

import { CONFIG } from '../config.js';
import { createWorldScene } from './world.js';
import { createDuelScene, makeWildSetup, makeTrainerSetup } from './duel.js';
import { playTransition, reveal } from './transition.js';
import { createEncounterCounter } from '../world/encounters.js';
import { trainerSees } from '../world/map.js';
import { packProgress } from '../state.js';
import { displayName } from '../data/species.js';
import { maxEnergy } from '../duel/progress.js';
import { say } from '../ui/dialog.js';
import { el, clear } from '../ui/dom.js';

const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };
const DELTA = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const AFTER_WIN = 'Der Leuchtstein der Bucht wartet darauf, wieder zu leuchten. Bald ist es so weit.';

export function createGameWorld(game) {
  const world = createWorldScene(game);
  const { map, player } = world;
  const def = map.def;
  const counter = createEncounterCounter(game.rng);
  const trainer = def.objects.find(o => o.type === 'trainer' && o.number === 1);
  let bubble = null;

  const shortId = () => game.pack.data.shortId;
  const beaten = () => packProgress(game.state, shortId()).beaten.includes(1);
  const packTrainer = () => game.pack.data.trainers.find(t => t.number === 1);

  // ---------- Duell starten und zurückkehren ----------

  function runDuel(setup, style) {
    return new Promise(async resolve => {
      await playTransition(game, style);
      game.go(createDuelScene(game, setup, resolve));
      reveal(game);
    });
  }

  async function backToWorld(report) {
    await playTransition(game, 'fade', 300);
    if (report.outcome === 'lost') {
      const r = def.respawn;
      player.teleport(r.x, r.y, r.dir);
      game.state.position = { map: def.id, x: r.x, y: r.y, dir: r.dir };
    }
    game.go(world);
    await reveal(game);
    if (report.outcome === 'lost') {
      await say(game, [`Du bist am Leuchtturm aufgewacht. ${displayName(game.state.creature)} hat sich erholt.`]);
    }
  }

  async function wildDuel() {
    const report = await runDuel(makeWildSetup(game, def.area), 'wild');
    await backToWorld(report);
  }

  // ---------- Trainerin ----------

  function walkTrainer(steps) {
    return new Promise(resolve => {
      if (steps <= 0) return resolve();
      const [dx, dy] = DELTA[trainer.dir];
      const total = steps * CONFIG.walk.msPerTile;
      let elapsed = 0;
      trainer.walking = true;
      trainer.pixel = () => {
        const f = Math.min(steps, elapsed / CONFIG.walk.msPerTile);
        return { x: Math.round((trainer.x + dx * f) * 16), y: Math.round((trainer.y + dy * f) * 16) };
      };
      const tick = dt => {
        elapsed += dt;
        if (elapsed >= total) {
          elapsed = total;
          trainer.walking = false;
          world.onTick.splice(world.onTick.indexOf(tick), 1);
          resolve();
        }
      };
      world.onTick.push(tick);
    });
  }

  function resetTrainer() {
    trainer.pixel = null;
    trainer.walking = false;
    world.resetFacing(trainer);
  }

  async function trainerDuel({ spotted }) {
    const t = packTrainer();
    if (spotted) {
      const dist = trainerSees(map, trainer, player);
      bubble = { until: world.time + 600 };
      await new Promise(r => setTimeout(r, 600));
      bubble = null;
      await walkTrainer((dist ?? 1) - 1);
      player.dir = OPPOSITE[trainer.dir];
    } else {
      world.turnToward(trainer, OPPOSITE[player.dir]);
    }
    await say(game, t.hello, { speaker: t.name });
    const report = await runDuel(makeTrainerSetup(game, 1), 'trainer');
    resetTrainer();
    await backToWorld(report);
  }

  function trainerSpotsPlayer(pos = player) {
    if (!trainer || beaten() || !packTrainer()) return false;
    return trainerSees(map, trainer, pos) !== null;
  }

  // ---------- Ereignisse ----------

  world.onStepped.push((x, y) => {
    if (trainerSpotsPlayer({ x, y })) return () => trainerDuel({ spotted: true });
    if (counter.onStep(map.isTallGrass(x, y))) return () => wildDuel();
    return null;
  });

  world.onInteract.push(async ev => {
    const o = ev.target;
    if (o?.type === 'trainer' && o.number === 1) {
      if (beaten()) {
        world.turnToward(o, OPPOSITE[player.dir]);
        await say(game, [AFTER_WIN], { speaker: packTrainer()?.name });
        world.resetFacing(o);
      } else {
        await trainerDuel({ spotted: false });
      }
      return true;
    }
    if (o?.type === 'building' && o.onDoor === 'heal' && player.dir === 'up' && ev.y === o.y + o.h - 1) {
      const c = game.state.creature;
      c.energy = maxEnergy(c);
      await say(game, [`Das Licht des Leuchtturms gibt ${displayName(c)} neue Kraft.`]);
      return true;
    }
    return false;
  });

  // Ausrufezeichen über der Trainerin
  world.afterRender.push((ctx, cam) => {
    if (!bubble || !trainer) return;
    const p = trainer.pixel ? trainer.pixel() : { x: trainer.x * 16, y: trainer.y * 16 };
    const x = p.x - cam.x + 4, y = p.y - cam.y - 14;
    ctx.fillStyle = '#1b1a2e';
    ctx.fillRect(x - 1, y - 1, 10, 12);
    ctx.fillStyle = '#fffaf0';
    ctx.fillRect(x, y, 8, 10);
    ctx.fillStyle = '#b8412f';
    ctx.fillRect(x + 3, y + 1, 2, 5);
    ctx.fillRect(x + 3, y + 7, 2, 2);
  });

  // Kleine Anzeige oben links: Wesen, Level, Energie (bis das Menü in Plan 2 kommt)
  const hud = el('div', { class: 'hud passive' });
  let hudKey = '';
  world.onTick.push(() => {
    const c = game.state.creature;
    const max = maxEnergy(c);
    const key = `${displayName(c)}|${c.level}|${c.energy}|${max}`;
    if (key === hudKey) return;
    hudKey = key;
    clear(hud);
    const bar = el('div', { class: 'plate-bar' });
    for (let i = 0; i < max; i++) bar.append(el('span', { class: `seg${i < c.energy ? ' on' : ''}` }));
    bar.classList.toggle('low', c.energy <= Math.max(1, Math.floor(max / 4)));
    hud.append(el('div', { class: 'plate-head' }, el('span', {}, displayName(c)), el('span', { class: 'plate-lv' }, `Lv ${c.level}`)), bar);
  });

  const baseEnter = world.enter;
  world.enter = () => {
    baseEnter();
    if (!hud.isConnected) game.ui.append(hud);
  };
  const baseExit = world.exit;
  world.exit = () => {
    baseExit?.();
    hud.remove();
  };

  // Beim Betreten prüfen, ob die Trainerin die Figur schon sieht.
  world.onTick.push(function firstCheck() {
    world.onTick.splice(world.onTick.indexOf(firstCheck), 1);
    if (trainerSpotsPlayer()) world.lock(() => trainerDuel({ spotted: true }));
  });

  return world;
}
