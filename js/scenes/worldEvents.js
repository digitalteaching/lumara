// Die Welt eines Gebiets (Design 5, 6.4, 7.1): wilde Wesen im hohen Gras, der Trainer des Gebiets,
// Wege in andere Gebiete, Nebeltore, Aufwachen nach einer Niederlage und das Licht des Leuchtturms.

import { CONFIG } from '../config.js';
import { createWorldScene } from './world.js';
import { createDuelScene, makeWildSetup, makeTrainerSetup } from './duel.js';
import { playTransition, reveal } from './transition.js';
import { createEncounterCounter } from '../world/encounters.js';
import { trainerSees } from '../world/map.js';
import { fogEdgeLines } from '../world/fogEdge.js';
import { MAPS, areaConfig, exitAt, openGatesFor, resolveStart } from '../world/network.js';
import { BUCHT } from '../world/maps/bucht.js';
import { packProgress } from '../state.js';
import { displayName } from '../data/species.js';
import { maxEnergy } from '../duel/progress.js';
import { say } from '../ui/dialog.js';
import { el, clear } from '../ui/dom.js';
import { openMenu } from '../menu/menu.js';

const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };
const DELTA = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const AFTER_WIN = 'Der Leuchtstein der Bucht wartet darauf, wieder zu leuchten. Bald ist es so weit.';
export const RELOCATED = 'Der Nebel ist zurückgekommen. Ich habe dich hierher gebracht.';

// In ein anderes Gebiet (oder an einen anderen Ort) wechseln: überblenden, speichern, neue Welt.
export async function travelTo(game, pos, style = 'fade') {
  await playTransition(game, style, 300);
  game.state.position = { map: pos.map, x: pos.x, y: pos.y, dir: pos.dir };
  game.save();
  const world = createGameWorld(game);
  game.go(world);
  await reveal(game);
  return world;
}

const samePlace = (a, b) => a.map === b.map && a.x === b.x && a.y === b.y;

export function createGameWorld(game) {
  const def = MAPS[game.state.position.map] ?? BUCHT;
  const world = createWorldScene(game, def, { openGates: openGatesFor(def, game.state, game.pack.data) });
  const { map, player } = world;
  const { trainerNumber } = areaConfig(def);
  const counter = createEncounterCounter(game.rng);
  const trainer = def.objects.find(o => o.type === 'trainer');
  let bubble = null;

  const shortId = () => game.pack.data.shortId;
  const beaten = () => packProgress(game.state, shortId()).beaten.includes(trainerNumber);
  const packTrainer = () => game.pack.data.trainers.find(t => t.number === trainerNumber);

  // Nebeltore, die jetzt offen sein müssen, sofort öffnen (nach einem Sieg oder Paketwechsel).
  function openGatesNow() {
    const open = openGatesFor(def, game.state, game.pack.data);
    let changed = false;
    for (const g of def.gates ?? []) {
      if (!open.includes(g.id)) continue;
      for (let y = g.y; y < g.y + g.h; y++) for (let x = g.x; x < g.x + g.w; x++) {
        if (map.tileAt(x, y) === 'fog') {
          map.setTile(x, y, g.ground);
          changed = true;
        }
      }
    }
    if (changed) world.refreshFog();
    return changed;
  }
  world.openGatesNow = openGatesNow;

  // ---------- Duell starten und zurückkehren ----------

  function runDuel(setup, style) {
    return new Promise(async resolve => {
      await playTransition(game, style);
      game.go(createDuelScene(game, setup, resolve));
      reveal(game);
    });
  }

  async function backToWorld(report) {
    if (report.outcome === 'lost') {
      const r = def.respawn;
      game.state.position = { map: def.id, x: r.x, y: r.y, dir: r.dir };
    }
    // Sofort speichern: Kinder schließen die App oft direkt nach einem Sieg (Design 11).
    game.save();
    await playTransition(game, 'fade', 300);
    if (report.outcome === 'lost') {
      const r = def.respawn;
      player.teleport(r.x, r.y, r.dir);
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
    const report = await runDuel(makeTrainerSetup(game, trainerNumber), 'trainer');
    resetTrainer();
    await backToWorld(report);
    if (report.outcome === 'won') await afterTrainerWin();
  }

  // Erster Sieg mit einem Stein, der noch nicht leuchtet: der Stein leuchtet (Szene folgt mit Task 5).
  async function afterTrainerWin() {
    if (game.state.stones.includes(trainerNumber)) return;
    game.state.stones = [...game.state.stones, trainerNumber].sort((a, b) => a - b);
    game.state.lastStone = trainerNumber;
    openGatesNow();
    game.save();
    await say(game, ['Der Leuchtstein leuchtet wieder!']);
  }

  function trainerSpotsPlayer(pos = player) {
    if (!trainer || beaten() || !packTrainer()) return false;
    return trainerSees(map, trainer, pos) !== null;
  }

  // ---------- Ereignisse ----------

  world.onStepped.push((x, y) => {
    // Ausgang in ein anderes Gebiet zählt vor allem anderen.
    const exit = exitAt(def, x, y);
    if (exit) return () => travelTo(game, { map: exit.to, ...exit.at });
    if (trainerSpotsPlayer({ x, y })) return () => trainerDuel({ spotted: true });
    if (counter.onStep(map.isTallGrass(x, y))) return () => wildDuel();
    return null;
  });

  // Schild am Nebelrand: vor dem Standard-Schild, weil der Text vom Stand abhängt (Design 10.4).
  world.onInteract.unshift(async ev => {
    const o = ev.target;
    if (o?.type !== 'sign' || o.role !== 'fogEdge') return false;
    const lines = fogEdgeLines(o, {
      gateBeaten: packProgress(game.state, shortId()).beaten.includes(o.gate),
      packHasNext: game.pack.data.trainers.some(t => t.number === o.leadsTo),
      builtAreas: CONFIG.world.builtAreas,
    });
    await say(game, lines ?? o.lines);
    return true;
  });

  world.onInteract.push(async ev => {
    const o = ev.target;
    if (o?.type === 'trainer' && o.number === trainerNumber) {
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

  // Menüknopf oben rechts und Taste M (Design 13)
  function showMenu() {
    if (game.mode !== 'walk' || world.locked) return;
    world.lock(async () => {
      const packBefore = game.pack.data.shortId;
      await openMenu(game);
      if (game.pack.data.shortId !== packBefore) await afterPackSwitch();
    });
  }

  // Nach einem Paketwechsel (Design 10.4): Tore neu bestimmen; liegt dieser Ort jetzt im Nebel,
  // bringt Ilvy das Kind zum offenen Leuchtstein oder Leuchtturm.
  async function afterPackSwitch() {
    const here = { map: def.id, x: player.x, y: player.y, dir: player.dir };
    const target = resolveStart({ ...game.state, position: here }, game.pack.data);
    const next = await travelTo(game, samePlace(here, target) ? here : target);
    if (!samePlace(here, target)) await next.lock(() => say(game, [RELOCATED], { speaker: 'Ilvy' }));
  }
  const menuBtn = el('button', { class: 'menu-btn', type: 'button', 'aria-label': 'Menü', onclick: showMenu }, '☰');
  let offMenu = null;

  const baseEnter = world.enter;
  world.enter = () => {
    baseEnter();
    if (!hud.isConnected) game.ui.append(hud);
    if (!menuBtn.isConnected) game.ui.append(menuBtn);
    offMenu ??= game.input.on('menu', showMenu);
  };
  const baseExit = world.exit;
  world.exit = () => {
    baseExit?.();
    hud.remove();
    menuBtn.remove();
    offMenu?.();
    offMenu = null;
  };

  // Beim Betreten prüfen, ob die Trainerin die Figur schon sieht.
  world.onTick.push(function firstCheck() {
    world.onTick.splice(world.onTick.indexOf(firstCheck), 1);
    if (trainerSpotsPlayer()) world.lock(() => trainerDuel({ spotted: true }));
  });

  return world;
}
