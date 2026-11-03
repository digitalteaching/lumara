// Die Welt eines Gebiets (Design 5, 6.4, 7.1): wilde Wesen im hohen Gras, der Trainer des Gebiets,
// Wege in andere Gebiete, Nebeltore, Aufwachen nach einer Niederlage und das Licht des Leuchtturms.

import { CONFIG } from '../config.js';
import { createWorldScene } from './world.js';
import { createDuelScene, makeWildSetup, makeTrainerSetup } from './duel.js';
import { playTransition, reveal } from './transition.js';
import { createEncounterCounter } from '../world/encounters.js';
import { trainerSees } from '../world/map.js';
import { fogEdgeLines } from '../world/fogEdge.js';
import { MAPS, areaConfig, areaOpen, exitAt, openGatesFor, resolveStart, whisperLine, beaconFront } from '../world/network.js';
import { visitStone, travelTargets, respawnPoint, challengeMark } from '../world/beacons.js';
import { playBeaconScene } from './beacon.js';
import { bushKey, bushReady, harvest } from '../items/food.js';
import { findKey, findReady, takeFind, stepFind, STONE_LINES } from '../items/stones.js';
import { BUCHT } from '../world/maps/bucht.js';
import { packProgress, recordNoteAnswer } from '../state.js';
import { notePool, noteKey, noteReady, solveNote } from '../world/notes.js';
import { playNote } from './note.js';
import { displayName } from '../data/species.js';
import { maxEnergy } from '../duel/progress.js';
import { say, choose } from '../ui/dialog.js';
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

  // ---------- Duell starten und zurückkehren ----------

  function runDuel(setup, style) {
    return new Promise(async resolve => {
      await playTransition(game, style);
      game.go(createDuelScene(game, setup, resolve));
      reveal(game);
    });
  }

  // Nach einer Niederlage wacht man am zuletzt besuchten Leuchtstein auf, sonst am Leuchtturm (Design 5.1).
  async function backToWorld(report) {
    const lost = report.outcome === 'lost';
    const r = lost ? respawnPoint(game.state, game.pack.data) : null;
    if (lost) game.state.position = { ...r };
    game.save();
    await playTransition(game, 'fade', 300);
    const where = r && !samePlace(r, { map: 'bucht', ...BUCHT.respawn }) ? 'am Leuchtstein' : 'am Leuchtturm';
    const line = `Du bist ${where} aufgewacht. ${displayName(game.state.creature)} hat sich erholt.`;
    if (lost && r.map !== def.id) {
      const next = createGameWorld(game);
      game.go(next);
      await reveal(game);
      await next.lock(() => say(game, [line]));
      return { left: true };
    }
    if (lost) player.teleport(r.x, r.y, r.dir);
    game.go(world);
    await reveal(game);
    if (lost) await say(game, [line]);
    return { left: false };
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
    if (report.stoneLit) await afterStoneLit();
  }

  // Erster Sieg, solange der Stein noch nicht leuchtete: Leuchtstein-Szene, das Tor öffnet sich.
  // Entzündet und gespeichert ist er da schon (applyDuelResult). Leuchtete er schon (anderes
  // Paket), gibt es keine Szene, die XP sind trotzdem die vollen.
  async function afterStoneLit() {
    await playBeaconScene(game, world, trainerNumber);
    const sign = def.objects.find(o => o.type === 'sign' && o.role === 'fogEdge');
    const lit = `Der Leuchtstein ${def.genitive} leuchtet wieder!`;
    if (sign && areaOpen(game.state, game.pack.data, sign.leadsTo)) {
      await say(game, [`${lit} Der Nebel weicht.`]);
    } else {
      const more = sign ? fogEdgeLines(sign, { gateBeaten: true, packHasNext: game.pack.data.trainers.some(t => t.number === sign.leadsTo), builtAreas: CONFIG.world.builtAreas }) : null;
      await say(game, [lit, ...(more ?? [])]);
    }
  }

  // ---------- Leuchtstein ----------

  async function useBeacon(o) {
    const c = game.state.creature;
    if (!game.state.stones.includes(o.number)) {
      await say(game, ['Ein erloschener Leuchtstein. Seine Hüterin oder sein Hüter ist ganz in der Nähe.']);
      return;
    }
    c.energy = maxEnergy(c);
    visitStone(game.state, o.number);
    game.save();
    await say(game, [`${displayName(c)} tankt neues Licht.`]);
    const others = travelTargets(game.state, game.pack.data).filter(t => t.number !== o.number);
    if (!others.length) return;
    const pick = await choose(game, 'Wohin möchtest du reisen?', [...others.map(t => t.name), 'Hierbleiben']);
    const target = others[pick];
    if (!target) return;
    visitStone(game.state, target.number);
    await travelTo(game, { map: target.map, ...beaconFront(MAPS[target.map], target.number) });
  }

  function trainerSpotsPlayer(pos = player) {
    if (!trainer || beaten() || !packTrainer()) return false;
    return trainerSees(map, trainer, pos) !== null;
  }

  // ---------- Ereignisse ----------

  // Flüsternde Bäume (Design 5.3): Wer vorbeigeht, hört sie leise sprechen. Blockiert nichts.
  const whispers = def.objects.filter(o => o.type === 'whisper');
  const whisperCount = new Map();
  let nearWhisper = null;
  let whisperNode = null;
  let whisperTimer = null;
  function showWhisper(text) {
    whisperNode?.remove();
    clearTimeout(whisperTimer);
    whisperNode = el('div', { class: 'whisper passive', 'aria-live': 'polite' }, text);
    game.ui.append(whisperNode);
    whisperTimer = setTimeout(() => whisperNode?.remove(), 3000);
  }
  world.onStepped.unshift((x, y) => {
    const tree = whispers.find(o => Math.abs(o.x - x) + Math.abs(o.y - y) === 1) ?? null;
    if (tree && tree !== nearWhisper) {
      const n = whisperCount.get(tree) ?? 0;
      whisperCount.set(tree, n + 1);
      showWhisper(whisperLine(tree, n));
    }
    nearWhisper = tree;
    return null;
  });

  world.onStepped.push((x, y) => {
    // Ausgang in ein anderes Gebiet zählt vor allem anderen.
    const exit = exitAt(def, x, y);
    if (exit) return () => travelTo(game, { map: exit.to, ...exit.at });
    if (trainerSpotsPlayer({ x, y })) return () => trainerDuel({ spotted: true });
    // Ein Stein im Gras zählt vor der Begegnung: Dann gibt es in diesem Schritt kein Duell.
    if (map.isTallGrass(x, y)) {
      const item = stepFind(game.state, game.rng);
      if (item) return () => foundStone(item);
    }
    if (counter.onStep(map.isTallGrass(x, y))) return () => wildDuel();
    return null;
  });

  // ---------- Seltene Steine (Design 8.2) ----------

  async function foundStone(item) {
    game.save();
    await say(game, [STONE_LINES[item](displayName(game.state.creature))]);
  }

  const finds = def.finds ?? [];
  const findAt = (x, y) => finds.find(f => f.x === x && f.y === y && findReady(game.state, findKey(def.id, f))) ?? null;

  // Bereite Fundstellen glitzern: ein schwacher Punkt, dazu höchstens alle 1,4 Sekunden ein kurzes
  // Aufblitzen. Bei „Bewegung reduzieren“ leuchtet der Punkt nur still.
  world.groundRender.push((ctx, cam) => {
    for (const f of finds) {
      const x = f.x * 16 - cam.x + 8, y = f.y * 16 - cam.y + 9;
      if (x < -4 || y < -4 || x > 244 || y > 164) continue;
      if (!findReady(game.state, findKey(def.id, f))) continue;
      const flash = !game.reducedMotion && (world.time + f.x * 137 + f.y * 71) % 1400 < 280;
      ctx.fillStyle = '#fffaf0';
      ctx.globalAlpha = game.reducedMotion ? 0.85 : flash ? 1 : 0.5;
      ctx.fillRect(x, y, 1, 1);
      if (flash || game.reducedMotion) {
        ctx.fillRect(x - 1, y, 3, 1);
        ctx.fillRect(x, y - 1, 1, 3);
      }
      if (flash) {
        ctx.globalAlpha = 0.5;
        ctx.fillRect(x - 2, y, 1, 1);
        ctx.fillRect(x + 2, y, 1, 1);
        ctx.fillRect(x, y - 2, 1, 1);
        ctx.fillRect(x, y + 2, 1, 1);
      }
      ctx.globalAlpha = 1;
    }
  });

  // Aufheben: vor der Fundstelle stehen und A drücken (Ziel ist die leere Zelle davor).
  world.onInteract.push(async ev => {
    if (ev.target) return false;
    const f = findAt(ev.x, ev.y);
    if (!f) return false;
    const { item } = takeFind(game.state, findKey(def.id, f), game.rng);
    await foundStone(item);
    return true;
  });

  // Sträucher (Design 8): voll mit roten Beeren oder nur Blätter, bis die Spielzeit sie nachwachsen lässt.
  world.propVariant.bush = o => (bushReady(game.state, bushKey(def.id, o)) ? 'bush' : 'bushEmpty');

  // Zettelsteine (Design 5.4): mit hellem Zeichen, solange ein Zettel darunter liegt, sonst grau.
  world.propVariant.notestone = o => (noteReady(game.state, noteKey(def.id, o)) ? 'noteStone' : 'noteStoneDone');

  async function useNoteStone(o) {
    const key = noteKey(def.id, o);
    if (!noteReady(game.state, key)) {
      await say(game, ['Ein grauer Stein. Gerade liegt kein Zettel darunter.']);
      return;
    }
    const pick = await choose(game, 'Unter dem Stein liegt ein Zettel. Möchtest du die Aufgabe lösen?', ['Ja', 'Später'], { cancelIndex: 1 });
    if (pick !== 0) return;
    const c = game.state.creature;
    const levelBefore = c.level;
    const beatenNow = packProgress(game.state, shortId()).beaten;
    const result = await playNote(game, notePool(game.pack.data, beatenNow), answer => {
      recordNoteAnswer(game.state, shortId(), answer);
      const out = solveNote(game.state, key, def.area, answer.correct, game.rng);
      game.save();
      return out;
    });
    if (!result) return;
    for (let lvl = levelBefore + 1; lvl <= c.level; lvl++) await say(game, [`${displayName(c)} erreicht Level ${lvl}!`]);
    if (result.story) await say(game, [result.story], { speaker: 'Ein Stück Geschichte' });
  }

  // Schild am Nebelrand: vor dem Standard-Schild, weil der Text vom Stand abhängt (Design 10.4).
  world.onInteract.unshift(async ev => {
    const o = ev.target;
    if (o?.type !== 'sign' || o.role !== 'fogEdge') return false;
    // Ob der Stein leuchtet, entscheidet über das Tor (auch mit einem anderen Paket entzündet).
    const lines = fogEdgeLines(o, {
      gateBeaten: game.state.stones.includes(o.gate),
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
        await say(game, afterWinLines(o), { speaker: packTrainer()?.name });
        world.resetFacing(o);
      } else {
        await trainerDuel({ spotted: false });
      }
      return true;
    }
    if (o?.type === 'beacon') {
      await useBeacon(o);
      return true;
    }
    if (o?.type === 'notestone') {
      await useNoteStone(o);
      return true;
    }
    if (o?.type === 'bush') {
      const r = harvest(game.state, bushKey(def.id, o));
      if (r === 'ok') game.save();
      await say(game, [{ ok: 'Du pflückst eine Beere.', full: 'Dein Rucksack ist voll.', empty: 'Hier wachsen bald neue Beeren.' }[r]]);
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

  // Was ein besiegter Trainer sagt: Ist der Weg weiter offen, sein Satz aus der Karte, sonst der
  // Text vom Nebelrand (nächstes Thema fehlt im Paket oder das Gebiet ist noch nicht gebaut).
  function afterWinLines(t) {
    const sign = def.objects.find(o => o.type === 'sign' && o.role === 'fogEdge');
    if (!sign) return [t.afterWin ?? AFTER_WIN];
    if (areaOpen(game.state, game.pack.data, sign.leadsTo)) return [t.afterWin ?? AFTER_WIN];
    return fogEdgeLines(sign, { gateBeaten: true, packHasNext: game.pack.data.trainers.some(x => x.number === sign.leadsTo), builtAreas: CONFIG.world.builtAreas }) ?? [t.afterWin ?? AFTER_WIN];
  }

  // Weißer Stern über einem Trainer, dessen Stein leuchtet, der mit diesem Paket aber noch nicht
  // besiegt ist: eine neue Herausforderung (Design 10.4).
  world.afterRender.push((ctx, cam) => {
    if (!trainer || bubble || !packTrainer() || !challengeMark(game.state, game.pack.data, trainerNumber)) return;
    const p = trainer.pixel ? trainer.pixel() : { x: trainer.x * 16, y: trainer.y * 16 };
    const x = p.x - cam.x + 7, y = p.y - cam.y - 9;
    ctx.fillStyle = '#1b1a2e';
    ctx.fillRect(x - 2, y - 1, 5, 3);
    ctx.fillRect(x - 1, y - 2, 3, 5);
    ctx.fillStyle = '#fffaf0';
    ctx.fillRect(x - 1, y, 3, 1);
    ctx.fillRect(x, y - 1, 1, 3);
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
    whisperNode?.remove();
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
