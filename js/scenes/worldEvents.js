// Die Welt eines Gebiets (Design 5, 6.4, 7.1): wilde Wesen im hohen Gras, der Trainer des Gebiets,
// Wege in andere Gebiete, Nebeltore, Aufwachen nach einer Niederlage und das Licht des Leuchtturms.

import { CONFIG } from '../config.js';
import { createWorldScene } from './world.js';
import { createDuelScene, makeWildSetup, makeTrainerSetup, makeBossSetup } from './duel.js';
import { rematchOffer, rematchSetup, rematchQuestion } from '../duel/rematch.js';
import { rememberBlock, rememberSetup, bossLines } from '../duel/boss.js';
import { fallenStarSpot, nearStar, starChance } from '../world/stars.js';
import { ascentSetup, refillBefore } from '../duel/ascent.js';
import { musicFor } from '../audio/choose.js';
import { sound, jingle, musicTo } from '../audio/bus.js';
import { playTransition, reveal } from './transition.js';
import { createEncounterCounter, wildTableFor } from '../world/encounters.js';
import { secretOpen, takeSecretStory, takeSecretStone, blockedCells } from '../world/secrets.js';
import { turnGear, gearsOf } from '../world/puzzles.js';
import { SECRET_PLACES } from '../data/secrets.js';
import { trainerSees } from '../world/map.js';
import { fogEdgeLines, fogSignLines, fogSignFor } from '../world/fogEdge.js';
import { caveGateLines, caveSocketLights, caveOpen, ilvyCaveLines } from '../world/caveGate.js';
import { withFinale, finaleDone, finishFinale } from '../world/finale.js';
import { playFinale } from './finale.js';
import { breakName } from '../world/islandMap.js';
import { MAPS, areaConfig, areaOpen, exitAt, openGatesFor, closedPuzzleGateAt, resolveStart, whisperLine, beaconFront, packWorldKey, worldLines, areaOf } from '../world/network.js';
import { visitStone, travelTargets, respawnPoint, challengeMark, respawnAfterLoss } from '../world/beacons.js';
import { playBeaconScene } from './beacon.js';
import { bushKey, bushReady, harvest } from '../items/food.js';
import { findKey, findReady, stepFind, STONE_LINES } from '../items/stones.js';
import { takeGlitter, treasureName } from '../items/treasures.js';
import { BUCHT } from '../world/maps/bucht.js';
import { packProgress, recordNoteAnswer } from '../state.js';
import { notePool, noteKey, noteReady, solveNote } from '../world/notes.js';
import { playNote } from './note.js';
import { displayName, nameAtStage, evolutionLines, speciesName } from '../data/species.js';
import { playEvolution } from './evolution.js';
import { questFor, acceptQuest, advanceQuest, finishQuest, activePickups, activeGuests } from '../world/quests.js';
import { questText } from '../data/quests.js';
import { maxEnergy, stageForLevel } from '../duel/progress.js';
import { say, choose } from '../ui/dialog.js';
import { el, clear } from '../ui/dom.js';
import { openMenu } from '../menu/menu.js';
import { openBackpack, bagIcon } from '../menu/backpack.js';
import { canOpenBackpack } from '../items/backpackView.js';
import { t as tr, tl, language } from '../i18n/i18n.js'; // t ist hier ein eigener Name

const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };
const DELTA = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

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

// Die Karte mit den Gästen der laufenden Aufträge als Bewohner (Design 5.6).
function withGuests(base, state) {
  const guests = activeGuests(state, base.id);
  if (!guests.length) return base;
  return {
    ...base,
    objects: [...base.objects, ...guests.map(g => ({ type: 'npc', id: g.id, name: g.name, x: g.x, y: g.y, dir: g.dir, sprite: g.sprite, guestOf: g.quest, lines: [] }))],
  };
}

export function createGameWorld(game) {
  // Gäste eines Auftrags (etwa Flo) stehen nur, solange ihr Schritt dran ist; Objekte mit when nur
  // vor oder nach dem Finale (Ilvy in der Höhle, Morrow).
  const def = withFinale(withGuests(MAPS[game.state.position.map] ?? BUCHT, game.state), game.state);
  const world = createWorldScene(game, def, { openGates: openGatesFor(def, game.state, game.pack.data) });
  const { map, player } = world;
  // Musik nach Ort (Design 15): beim Betreten und nach jedem Duell wieder die Musik der Karte.
  const enterWorld = world.enter;
  // Während des Leuchtturm-Aufstiegs bleibt die Aufstiegsmusik zwischen den Etagen.
  let climbing = false;
  world.enter = () => {
    enterWorld();
    musicTo(climbing ? 'ascent' : musicFor(def));
  };
  const { trainerNumber } = areaConfig(def);
  const counter = createEncounterCounter(game.rng);
  const trainer = def.objects.find(o => o.type === 'trainer');
  let bubble = null;

  const shortId = () => game.pack.data.shortId;
  const timePressure = () => game.pack.data.timePressure;
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
  async function backToWorld(report, setup = null) {
    const lost = report.outcome === 'lost';
    const here = { map: def.id, x: player.x, y: player.y, dir: player.dir };
    const r = lost ? respawnAfterLoss(game.state, game.pack.data, setup, here) : null;
    if (lost) game.state.position = { ...r };
    game.save();
    await playTransition(game, 'fade', 300);
    const atBeacon = r && !samePlace(r, { map: 'bucht', ...BUCHT.respawn }) && !samePlace(r, here);
    const line = tr(atBeacon ? 'world.wokeAtBeacon' : 'world.wokeAtLighthouse', { name: displayName(game.state.creature) });
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
    const setup = makeWildSetup(game, def.area, wildTableFor(def), starChance(star, player.x, player.y));
    if (def.arena) setup.arena = def.arena; // eigene Arena, etwa die Höhle
    const report = await runDuel(setup, 'wild');
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
    const sign = fogSignFor(def, trainerNumber);
    const lit = tr('world.beaconRelit', { of: areaOf(def) });
    if (sign && areaOpen(game.state, game.pack.data, sign.leadsTo)) {
      await say(game, [`${lit} ${tr('world.mistRetreats')}`]);
    } else {
      const more = sign ? fogEdgeLines(sign, { gateBeaten: true, packHasNext: game.pack.data.trainers.some(x => x.number === sign.leadsTo), builtAreas: CONFIG.world.builtAreas }, def) : null;
      await say(game, [lit, ...(more ?? [])]);
    }
  }

  // ---------- Leuchtstein ----------

  async function useBeacon(o) {
    const c = game.state.creature;
    if (!game.state.stones.includes(o.number)) {
      await say(game, [tr('world.beaconDark')]);
      return;
    }
    c.energy = maxEnergy(c);
    visitStone(game.state, o.number);
    game.save();
    await say(game, [tr('world.beaconRefill', { name: displayName(c) })]);
    const others = travelTargets(game.state, game.pack.data).filter(t => t.number !== o.number);
    if (!others.length) return;
    const pick = await choose(game, tr('world.travelWhere'), [...others.map(o => breakName(o.name)), tr('world.stayHere')]);
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
      showWhisper(whisperLine({ lines: worldLines(def, tree, 'lines') }, n));
    }
    nearWhisper = tree;
    return null;
  });

  // Luftspiegelungen (Design 5.3): Wer dagegen läuft, bekommt einen leisen Hinweis, einmal pro Anlauf.
  world.onBump.push(ev => {
    if (map.tileAt(ev.x, ev.y) === 'mirage') showWhisper(tr('world.mirage'));
  });

  world.onStepped.push((x, y) => {
    // Ausgang in ein anderes Gebiet zählt vor allem anderen.
    const exit = exitAt(def, x, y);
    if (exit) return () => travelTo(game, { map: exit.to, ...exit.at });
    if (trainerSpotsPlayer({ x, y })) return () => trainerDuel({ spotted: true });
    // Ein Stein im Gras zählt vor der Begegnung: Dann gibt es in diesem Schritt kein Duell.
    if (map.isTallGrass(x, y)) {
      const item = stepFind(game.state, game.rng, def.area, timePressure());
      if (item) return () => foundStone(item);
    }
    if (counter.onStep(map.isTallGrass(x, y))) return () => wildDuel();
    return null;
  });

  // ---------- Seltene Steine (Design 8.2) ----------

  async function foundStone(item) {
    if (item == null) return; // eine leere Fundstelle bringt nichts
    game.save();
    jingle('find');
    await say(game, [STONE_LINES[item](displayName(game.state.creature))]);
  }

  async function foundTreasure(id) {
    game.save();
    jingle('find');
    await say(game, [tr('treasure.found', { name: treasureName(id) })]);
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
    const { item, treasure } = takeGlitter(game.state, findKey(def.id, f), game.rng, def.area, timePressure());
    if (item === 'treasure') await foundTreasure(treasure);
    else await foundStone(item); // mit Fund-Jingle, nur wenn wirklich etwas da ist
    return true;
  });

  // Sträucher (Design 8): voll mit roten Beeren oder nur Blätter, bis die Spielzeit sie nachwachsen lässt.
  world.propVariant.bush = o => (bushReady(game.state, bushKey(def.id, o)) ? 'bush' : 'bushEmpty');

  // Zettelsteine (Design 5.4): mit hellem Zeichen, solange ein Zettel darunter liegt, sonst grau.
  world.propVariant.notestone = o => (noteReady(game.state, noteKey(def.id, o)) ? 'noteStone' : 'noteStoneDone');

  async function useNoteStone(o) {
    sound('lift');
    const key = noteKey(def.id, o);
    if (!noteReady(game.state, key)) {
      await say(game, [tr('world.noteEmpty')]);
      return;
    }
    const pick = await choose(game, tr('world.noteAsk'), [tr('common.yes'), tr('duel.later')], { cancelIndex: 1 });
    if (pick !== 0) return;
    const c = game.state.creature;
    const levelBefore = c.level;
    const beatenNow = packProgress(game.state, shortId()).beaten;
    const result = await playNote(game, notePool(game.pack.data, beatenNow), answer => {
      recordNoteAnswer(game.state, shortId(), answer);
      const out = solveNote(game.state, key, def.area, answer.correct, game.rng, timePressure());
      game.save();
      return out;
    });
    if (!result) return;
    await levelUps(levelBefore);
    if (result.story) await say(game, [result.story], { speaker: tr('world.storySpeaker') });
  }

  // Level-Zeilen und Entwicklung nach XP außerhalb eines Duells (Zettel, Auftrag). Bis zur
  // Entwicklung heißt das Wesen noch wie vorher (Design 6.3).
  async function levelUps(levelBefore) {
    const c = game.state.creature;
    const from = stageForLevel(levelBefore), to = stageForLevel(c.level);
    if (c.level > levelBefore) jingle('levelup');
    for (let lvl = levelBefore + 1; lvl <= c.level; lvl++) await say(game, [tr('duel.levelUp', { name: nameAtStage(c, from), level: lvl })]);
    if (to > from) {
      jingle('evolution');
      await playEvolution(game, world, { species: c.species, from, to });
      await say(game, evolutionLines(c, from, to));
    }
  }

  // ---------- Leuchtturm-Aufstieg (Design 9) ----------
  // Etage für Etage ein Duell; dazwischen steht man vor der Tür und wählt weiter oder hinunter.
  // Keine Energie zurück, außer nach jeder fünften Etage. Eine Niederlage beendet den Aufstieg.
  async function climbTower() {
    climbing = true;
    try {
      await climbFloors();
    } finally {
      climbing = false;
      musicTo(musicFor(def));
    }
  }

  async function climbFloors() {
    const c = game.state.creature;
    const progress = () => packProgress(game.state, shortId());
    const back = async () => {
      game.save();
      await playTransition(game, 'fade', 300);
      game.go(world);
      await reveal(game);
    };
    for (let floor = 1; ; floor++) {
      if (refillBefore(floor)) {
        c.energy = maxEnergy(c);
        game.save();
        if (floor > 1) await say(game, [tr('tower.beacon', { name: displayName(c) })]);
      }
      await say(game, [tr('tower.floor', { n: floor })]);
      const report = await runDuel(ascentSetup(game.pack.data, floor, game.rng), 'wild');
      if (report.outcome !== 'won') {
        c.energy = maxEnergy(c);
        await back();
        const lines = [tr('tower.lost', { name: displayName(c) })];
        if (floor > 1) lines.push(tr('tower.end', { n: floor - 1, best: progress().stats.floor }));
        await say(game, lines);
        return;
      }
      await back();
      const pick = await choose(game, tr('tower.end', { n: floor, best: progress().stats.floor }), [tr('tower.next'), tr('tower.down')], { cancelIndex: 1 });
      if (pick !== 0) return;
    }
  }

  // ---------- Sternschnuppen (Design 9) ----------
  // Glitzern (höchstens 1 Hz, bei „Bewegung reduzieren“ ruhig) und einmal pro Besuch ein Satz in der Nähe.
  const star = fallenStarSpot(game.state, def);
  let starNoticed = false;
  if (star) {
    world.groundRender.push((ctx, cam) => {
      const x = star.x * 16 - cam.x + 8, y = star.y * 16 - cam.y + 8;
      if (x < -8 || y < -8 || x > 248 || y > 168) return;
      const glow = game.reducedMotion ? 0.8 : 0.55 + 0.35 * Math.sin((world.time / 1000) * Math.PI * 2 * 0.5);
      ctx.globalAlpha = glow;
      ctx.fillStyle = '#ffe08a';
      ctx.fillRect(x - 3, y, 7, 1);
      ctx.fillRect(x, y - 3, 1, 7);
      ctx.fillRect(x - 1, y - 1, 3, 3);
      ctx.fillStyle = '#fffaf0';
      ctx.fillRect(x, y, 1, 1);
      ctx.globalAlpha = 1;
    });
    world.onStepped.push((x, y) => {
      if (starNoticed || !nearStar(star, x, y)) return null;
      starNoticed = true;
      return () => say(game, [tr('star.near')]);
    });
  }

  // ---------- Höhle (Plan 5a) ----------
  // Der warme Kristall füllt die Energie auf; Ilvy nennt am Eingang Morrows Namen (Design 5.4).
  world.propVariant.heal = () => 'warmcrystal';
  world.propVariant.boss = () => 'morrowmist';
  world.onInteract.unshift(async ev => {
    const o = ev.target;
    if (o?.type === 'heal') {
      const c = game.state.creature;
      c.energy = maxEnergy(c);
      game.save();
      await say(game, [tr('cave.warm', { name: displayName(c) })]);
      return true;
    }
    // Morrow (Design 5.4, 7.4): das Endduell. Verloren: am Eingang der unteren Ebene, volle Energie.
    // Gewonnen: erst das Finale speichern, dann den Namen sagen und zum Leuchtturm.
    if (o?.type === 'boss') {
      if (finaleDone(game.state) || !caveOpen(game.state, game.pack.data)) return true;
      await say(game, bossLines(game.pack.data).hello, { speaker: speciesName('morrow', 3) });
      const report = await runDuel(makeBossSetup(game), 'trainer');
      const c = game.state.creature;
      if (report.outcome !== 'won') {
        c.energy = maxEnergy(c);
        game.state.position = { map: def.id, ...def.respawn };
        game.save();
        await playTransition(game, 'fade', 300);
        player.teleport(def.respawn.x, def.respawn.y, def.respawn.dir);
        game.go(world);
        await reveal(game);
        await say(game, [tr('boss.lost')]);
        return true;
      }
      finishFinale(game.state);
      game.save();
      await playTransition(game, 'fade', 300);
      game.go(world);
      await reveal(game);
      await playFinale(game, world);
      await travelTo(game, { map: 'bucht', ...BUCHT.respawn });
      return true;
    }
    // Morrow am Leuchtturm (Design 9): nach seinen Sätzen das Erinnerungsduell, wenn das Paket passt.
    if (o?.type === 'npc' && o.id === 'morrow') {
      world.turnToward(o, OPPOSITE[player.dir]);
      await say(game, worldLines(def, o, 'lines'), { speaker: o.name });
      const block = rememberBlock(game.state, game.pack.data);
      if (block) {
        await say(game, [tr(block)], { speaker: o.name });
        world.resetFacing(o);
        return true;
      }
      const setup = rememberSetup(game.pack.data, packProgress(game.state, shortId()));
      const ask = setup.rematch ? tr('remember.offer', { stage: setup.rematch, max: CONFIG.rematch.maxTier }) : tr('remember.offerFirst');
      const pick = await choose(game, ask, [tr('remember.yes'), tr('rematch.later')], { cancelIndex: 1 });
      world.resetFacing(o);
      if (pick !== 0) return true;
      const report = await runDuel(setup, 'trainer');
      await backToWorld(report, setup);
      return true;
    }
    if (o?.type === 'npc' && o.id === 'ilvy' && def.cave) {
      world.turnToward(o, OPPOSITE[player.dir]);
      await say(game, ilvyCaveLines(game.state), { speaker: o.name });
      world.resetFacing(o);
      return true;
    }
    return false;
  });

  // ---------- Geheime Orte (Design 5.7) ----------
  // Eingang: nur mit dem Schlüsselgegenstand des Ortes, sonst ein Hinweis (lines). Mit ihm erst
  // linesOpen, dann geht es hinein.
  world.propVariant.secret = o => o.prop;
  world.onInteract.unshift(async ev => {
    const o = ev.target;
    if (o?.type !== 'secret') return false;
    if (!secretOpen(game.state, o)) {
      await say(game, worldLines(def, o, 'lines'));
      return true;
    }
    await say(game, worldLines(def, o, 'linesOpen'));
    await travelTo(game, o.to);
    return true;
  });

  // Geschichtsstein: beim ersten Mal das Geheimstück, danach nur ein Satz.
  // Ein Geschichtsstein mit eigenem Bild (der Kristall der Eisgrotte) hat dazu ein „gelesen“-Bild.
  world.propVariant.storystone = o => {
    const read = game.state.secrets?.[o.place]?.story;
    if (o.prop) return read ? `${o.prop}Done` : o.prop;
    return read ? 'noteStoneDone' : 'noteStone';
  };
  world.onInteract.push(async ev => {
    const o = ev.target;
    if (o?.type !== 'storystone') return false;
    const text = takeSecretStory(game.state, o.place);
    if (text) {
      game.save();
      await say(game, [text], { speaker: tr('world.storySpeaker') });
    } else {
      await say(game, [tr('secret.knownStory')]);
    }
    return true;
  });

  // Zahnrad-Rätsel der Sternwarte: A dreht ein Rad eine Vierteldrehung weiter, der Satz nennt die
  // Stellung. Stehen alle wie auf der Sternkarte, öffnet sich das Tor zur Kuppel sofort.
  world.propVariant.gear = o => `stargear${gearsOf(game.state, def.secret)[o.index]}`;
  world.propVariant.gearhint = () => 'starplaque';
  const openPuzzleGates = () => {
    const open = openGatesFor(def, game.state, game.pack.data);
    for (const g of def.gates ?? []) {
      if (!g.afterPuzzle || !open.includes(g.id)) continue;
      for (let y = g.y; y < g.y + g.h; y++) for (let x = g.x; x < g.x + g.w; x++) world.map.setTile(x, y, g.ground);
    }
    world.refreshFog();
  };
  world.onInteract.unshift(async ev => {
    const o = ev.target;
    if (o?.type === 'gearhint') {
      const goal = SECRET_PLACES[def.secret]?.gears ?? [];
      const dir = i => tr(`gear.dir.${goal[i]}`);
      await say(game, [tr('gear.hint1'), tr('gear.hint2', { a: dir(0) }), tr('gear.hint3', { b: dir(1), c: dir(2) })]);
      return true;
    }
    if (!o && closedPuzzleGateAt(def, game.state, game.pack.data, ev.x, ev.y)) {
      await say(game, [tr('gear.domeClosed')]);
      return true;
    }
    if (o?.type !== 'gear') return false;
    const turned = turnGear(game.state, def.secret, o.index);
    if (!turned) return false;
    game.save();
    const lines = [tr('gear.turned', { n: o.index + 1, dir: tr(`gear.dir.${turned.dir}`) })];
    if (turned.solvedNow) {
      openPuzzleGates();
      lines.push(tr('gear.solved'));
    }
    await say(game, lines);
    return true;
  });

  // Der seltene Stein des Ortes: glitzert, bis er aufgehoben ist (einmal).
  const secretStone = def.secretStone ?? null;
  const stoneThere = () => secretStone && !game.state.secrets?.[secretStone.place]?.stone;
  for (const k of blockedCells(def, game.state)) world.blocked.add(k);
  world.groundRender.push((ctx, cam) => {
    if (!stoneThere()) return;
    const x = secretStone.x * 16 - cam.x + 8, y = secretStone.y * 16 - cam.y + 9;
    const flash = !game.reducedMotion && world.time % 1400 < 350;
    ctx.fillStyle = '#c49ad9';
    ctx.globalAlpha = flash ? 1 : 0.8;
    ctx.fillRect(x - 1, y, 3, 1);
    ctx.fillRect(x, y - 1, 1, 3);
    ctx.fillStyle = '#fffaf0';
    ctx.fillRect(x, y, 1, 1);
    ctx.globalAlpha = 1;
  });
  world.onInteract.push(async ev => {
    if (ev.target || !stoneThere() || ev.x !== secretStone.x || ev.y !== secretStone.y) return false;
    const item = takeSecretStone(game.state, secretStone.place);
    jingle('find');
    world.blocked.clear(); // das Feld ist wieder frei
    game.save();
    if (item) await say(game, [STONE_LINES[item](displayName(game.state.creature))]);
    return true;
  });

  // ---------- Aufträge (Design 5.6, 5.7) ----------
  // Vor dem allgemeinen Gespräch: Hat ein Bewohner etwas zu einem Auftrag zu sagen, sagt er das.

  async function questTalk(o, q) {
    const { quest, role } = q;
    const text = questText(quest.id);
    const speaker = o.name;
    if (role === 'offer') {
      await say(game, text.offer, { speaker });
      const pick = await choose(game, tr('quest.askHelp'), [tr('quest.yes'), tr('duel.later')], { cancelIndex: 1 });
      if (pick !== 0) return;
      acceptQuest(game.state, quest.id);
      game.save();
      await say(game, [tr('quest.accepted', { title: text.title })]);
    } else if (role === 'remind') {
      await say(game, text.remind, { speaker });
    } else if (role === 'step') {
      const i = game.state.quests[quest.id].step;
      await say(game, text.steps[i], { speaker });
      advanceQuest(game.state, quest.id, i);
      game.save();
    } else if (role === 'locked') {
      await say(game, text.locked, { speaker });
    } else if (role === 'finish') {
      await say(game, text.finish, { speaker });
      const c = game.state.creature;
      const levelBefore = c.level;
      const r = finishQuest(game.state, quest.id);
      game.save();
      if (!r) return;
      await say(game, [tr('quest.done', { title: text.title })]);
      await say(game, [r.key ? tr('quest.gotKey', { name: tr(`key.${r.key}.name`) }) : tr(`quest.got.${r.item}`, { n: r.n })]);
      await say(game, [tr('duel.xp', { name: nameAtStage(c, stageForLevel(levelBefore)), xp: r.xp, extra: '' })]);
      await levelUps(levelBefore);
    }
  }

  world.onInteract.unshift(async ev => {
    const o = ev.target;
    if (o?.type !== 'npc') return false;
    const q = questFor(game.state, def.id, o.id);
    if (!q || q.role === 'done') {
      // Ein Gast, dessen Schritt erledigt ist, verabschiedet sich.
      if (o.guestOf && questText(o.guestOf).guest) {
        await say(game, questText(o.guestOf).guest, { speaker: o.name });
        return true;
      }
      return false;
    }
    world.turnToward(o, OPPOSITE[player.dir]);
    await questTalk(o, q);
    world.resetFacing(o);
    return true;
  });

  // Fundstücke eines Auftrags: glitzern, solange ihr Schritt dran ist; aufheben mit A vom Nachbarfeld.
  world.groundRender.push((ctx, cam) => {
    for (const p of activePickups(game.state, def.id)) {
      const x = p.x * 16 - cam.x + 8, y = p.y * 16 - cam.y + 9;
      if (x < -4 || y < -4 || x > 244 || y > 164) continue;
      const flash = !game.reducedMotion && (world.time + p.x * 97) % 1200 < 300;
      ctx.fillStyle = '#ffe08a';
      ctx.globalAlpha = flash ? 1 : 0.75;
      ctx.fillRect(x - 1, y, 3, 1);
      ctx.fillRect(x, y - 1, 1, 3);
      if (flash) {
        ctx.fillStyle = '#fffaf0';
        ctx.fillRect(x, y, 1, 1);
      }
      ctx.globalAlpha = 1;
    }
  });
  world.onInteract.push(async ev => {
    if (ev.target) return false;
    const p = activePickups(game.state, def.id).find(f => f.x === ev.x && f.y === ev.y);
    if (!p) return false;
    await say(game, questText(p.quest).steps[p.index]);
    advanceQuest(game.state, p.quest, p.index);
    game.save();
    return true;
  });

  // ---------- Höhlentor (Design 5.2) ----------
  // Vor dem allgemeinen Gebäude-Handler: Das Tor sagt, wie viele Fassungen leuchten. Über das Torbild
  // kommen die Fassungen der entzündeten Steine in den Farben ihrer Ringe.
  const caveGate = def.objects.find(o => o.type === 'building' && o.sprite === 'cavegate');
  if (caveGate) {
    world.onInteract.unshift(async ev => {
      if (ev.target !== caveGate || player.dir !== 'up' || ev.y !== caveGate.y + caveGate.h - 1) return false;
      const open = caveOpen(game.state, game.pack.data);
      await say(game, caveGateLines(Math.min(8, game.state.stones.length), { packFull: open }));
      if (open) await travelTo(game, caveGate.to);
      return true;
    });
    world.afterRender.push((ctx, cam) => {
      const bx = caveGate.x * 16 - cam.x, by = caveGate.y * 16 - cam.y;
      for (const s of caveSocketLights(game.state.stones)) {
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = s.color;
        ctx.fillRect(bx + s.x - 2, by + s.y - 2, 5, 5);
        ctx.globalAlpha = 1;
        ctx.fillRect(bx + s.x - 1, by + s.y - 1, 3, 3);
        ctx.fillStyle = '#fffaf0';
        ctx.fillRect(bx + s.x, by + s.y, 1, 1);
      }
    });
  }

  // Schild am Nebelrand: vor dem Standard-Schild, weil der Text vom Stand abhängt (Design 10.4).
  world.onInteract.unshift(async ev => {
    const o = ev.target;
    if (o?.type !== 'sign' || o.role !== 'fogEdge') return false;
    // Ob der Stein leuchtet, entscheidet über das Tor (auch mit einem anderen Paket entzündet).
    await say(game, fogSignLines(o, {
      gateBeaten: game.state.stones.includes(o.gate),
      packHasNext: game.pack.data.trainers.some(x => x.number === o.leadsTo),
      builtAreas: CONFIG.world.builtAreas,
    }, def));
    return true;
  });

  world.onInteract.push(async ev => {
    const o = ev.target;
    // Ein Trainer, den das Paket nicht hat, fordert nicht heraus (sein Gebiet liegt im Nebel).
    if (o?.type === 'trainer' && o.number === trainerNumber && packTrainer()) {
      if (beaten()) {
        world.turnToward(o, OPPOSITE[player.dir]);
        await say(game, afterWinLines(o), { speaker: packTrainer()?.name });
        // Revanche (Design 7.5): nach dem Satz das Angebot auf der nächsten Stufe.
        const offer = rematchOffer(packProgress(game.state, shortId()), trainerNumber);
        if (offer) {
          const name = packTrainer().name;
          const ask = rematchQuestion(offer);
          const pick = await choose(game, tr(ask.key, ask.params), [tr('rematch.yes'), tr('rematch.later')], { cancelIndex: 1 });
          if (pick === 0) {
            const setup = rematchSetup(game.pack.data, trainerNumber, offer.stage);
            await say(game, setup.trainer.lines.hello, { speaker: name });
            world.resetFacing(o);
            const report = await runDuel(setup, 'trainer');
            await backToWorld(report);
            return true;
          }
        }
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
      await say(game, [tr({ ok: 'world.berryPicked', full: 'bag.full', empty: 'world.berriesSoon' }[r])]);
      return true;
    }
    if (o?.type === 'building' && o.onDoor === 'heal' && player.dir === 'up' && ev.y === o.y + o.h - 1) {
      const c = game.state.creature;
      // Nach dem Finale führt die Tür auch zum Aufstieg (Design 9).
      if (finaleDone(game.state)) {
        const pick = await choose(game, tr('tower.door'), [tr('tower.rest'), tr('tower.climb')], { cancelIndex: 0 });
        if (pick === 1) {
          await climbTower();
          return true;
        }
      }
      c.energy = maxEnergy(c);
      await say(game, [tr('world.lighthouseHeal', { name: displayName(c) })]);
      return true;
    }
    return false;
  });

  // Was ein besiegter Trainer sagt: Ist der Weg weiter offen, sein Satz aus der Karte, sonst der
  // Text vom Nebelrand (nächstes Thema fehlt im Paket oder das Gebiet ist noch nicht gebaut).
  function afterWinLines(t) {
    const sign = fogSignFor(def, trainerNumber);
    const line = worldLines(def, t, 'afterWin');
    if (!sign) return [line];
    if (areaOpen(game.state, game.pack.data, sign.leadsTo)) return [line];
    return fogEdgeLines(sign, { gateBeaten: true, packHasNext: game.pack.data.trainers.some(x => x.number === sign.leadsTo), builtAreas: CONFIG.world.builtAreas }, def) ?? [line];
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
      // Auch eine neue Fassung desselben Pakets (gleiche KENNUNG) kann Tore öffnen oder schließen.
      // Eine neue Sprache (Design 10.6) baut die Welt ebenfalls neu auf, damit alles Sichtbare passt.
      const packBefore = packWorldKey(game.pack.data);
      const langBefore = language();
      // „Rucksack“ im Menü schließt das Menü; der Rucksack öffnet im selben Lock, vor einem Neuaufbau.
      if ((await openMenu(game)) === 'bag') await openBackpack(game);
      if (packWorldKey(game.pack.data) !== packBefore || language() !== langBefore) await afterPackSwitch();
    });
  }

  // Rucksack-Knopf links neben ☰ und Taste R (Lumara 1.1): nur beim Laufen und ohne Sperre.
  function showBag() {
    if (!canOpenBackpack({ mode: game.mode, locked: world.locked })) return;
    world.lock(() => openBackpack(game));
  }

  // Nach einem Paketwechsel (Design 10.4): Tore neu bestimmen; liegt dieser Ort jetzt im Nebel,
  // bringt Ilvy das Kind zum offenen Leuchtstein oder Leuchtturm.
  async function afterPackSwitch() {
    const here = { map: def.id, x: player.x, y: player.y, dir: player.dir };
    const target = resolveStart({ ...game.state, position: here }, game.pack.data);
    const next = await travelTo(game, samePlace(here, target) ? here : target);
    if (!samePlace(here, target)) await next.lock(() => say(game, [tr('world.relocated')], { speaker: 'Ilvy' }));
  }
  const menuBtn = el('button', { class: 'menu-btn', type: 'button', 'aria-label': tr('world.menu'), onclick: showMenu }, '☰');
  const bagBtn = el('button', { class: 'bag-btn', type: 'button', 'aria-label': tr('world.bag'), onclick: showBag }, bagIcon());
  let offMenu = null;
  let offBag = null;

  const baseEnter = world.enter;
  world.enter = () => {
    baseEnter();
    if (!hud.isConnected) game.ui.append(hud);
    if (!bagBtn.isConnected) game.ui.append(bagBtn);
    if (!menuBtn.isConnected) game.ui.append(menuBtn);
    offMenu ??= game.input.on('menu', showMenu);
    offBag ??= game.input.on('bag', showBag);
  };
  const baseExit = world.exit;
  world.exit = () => {
    baseExit?.();
    hud.remove();
    bagBtn.remove();
    menuBtn.remove();
    whisperNode?.remove();
    offMenu?.();
    offMenu = null;
    offBag?.();
    offBag = null;
  };

  // Beim Betreten prüfen, ob die Trainerin die Figur schon sieht.
  world.onTick.push(function firstCheck() {
    world.onTick.splice(world.onTick.indexOf(firstCheck), 1);
    if (trainerSpotsPlayer()) world.lock(() => trainerDuel({ spotted: true }));
  });

  return world;
}
