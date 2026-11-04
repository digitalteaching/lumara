// Duell-Szene (Design 7): Arena auf dem Canvas, Namensschilder und Antworten als HTML.

import { CONFIG } from '../config.js';
import { createDuel } from '../duel/duel.js';
import { timerFor } from '../duel/timing.js';
import { createDeck, poolFor } from '../duel/questions.js';
import { bossSetup, foeStageForPhase } from '../duel/boss.js';
import { stageForLevel, maxEnergy } from '../duel/progress.js';
import { speciesName, displayName, wildName, nameAtStage, evolutionLines, AREA_WILD, TRAINER_CREATURES } from '../data/species.js';
import { drawEvolution, evolutionAt } from '../gfx/evolution.js';
import { ownEnergyShown, creatureAlpha, foeEnergyShown } from '../duel/plates.js';
import { creatureRows } from '../gfx/art/creatures.js';
import { spriteFrom, whiteOf } from '../gfx/canvasSprites.js';
import { drawArena, ARENA } from '../gfx/arena.js';
import { createDuelPanel, watchKeyboard } from '../ui/duelPanel.js';
import { say, choose, closeDialogs } from '../ui/dialog.js';
import { el, clear } from '../ui/dom.js';
import { applyDuelResult, packProgress } from '../state.js';
import { FOOD, foodCount, takeItem } from '../items/bag.js';
import { foodEnergy } from '../items/food.js';
import { pickWild, wildLevel, rollShiny } from '../world/encounters.js';
import { shinyRows } from '../gfx/art/shiny.js';
import { t as tr } from '../i18n/i18n.js'; // t ist hier die Zeit

const FINAL = new Set(['won', 'lost', 'fled']);
const wait = ms => new Promise(r => setTimeout(r, ms));

export function makeWildSetup(game, area = 1, table = AREA_WILD[area]) {
  const pack = game.pack.data;
  const beaten = packProgress(game.state, pack.shortId).beaten;
  return {
    kind: 'wild',
    area,
    foe: {
      species: pickWild(table, game.rng),
      stage: 1,
      level: wildLevel(area, game.rng),
      maxEnergy: CONFIG.wild.energyByArea[area - 1],
      shiny: rollShiny(game.rng), // Glanzform (Design 6.4)
    },
    pool: poolFor(pack, { kind: 'wild', beaten }),
  };
}

export function makeTrainerSetup(game, number) {
  const pack = game.pack.data;
  const t = pack.trainers.find(x => x.number === number);
  const cfg = CONFIG.trainers[number - 1];
  return {
    kind: 'trainer',
    area: number,
    foe: { ...TRAINER_CREATURES[number], level: cfg.level, maxEnergy: cfg.energy },
    trainer: { number, name: t.name, lines: { hello: t.hello, win: t.win, loss: t.loss } },
    pool: poolFor(pack, { kind: 'trainer', trainerNumber: number, beaten: [] }),
    time: { trainerNumber: number, setting: pack.timePressure }, // Zeitdruck ab Trainer 4 (Design 7.4)
  };
}

// Das Endduell gegen Morrow (Design 7.4).
export const makeBossSetup = game => bossSetup(game.pack.data);

// Probefrage für Lehrkräfte (Design 12.3): ein Trainerduell mit den Fragen eines beliebigen Trainers,
// mit dessen Wesen und Arena.
export function makeProbeSetup(game, number) {
  const pack = game.pack.data;
  const t = pack.trainers.find(x => x.number === number) ?? pack.trainers[0];
  const cfg = CONFIG.trainers[t.number - 1];
  return {
    kind: 'trainer',
    area: t.number,
    foe: { ...TRAINER_CREATURES[t.number], level: cfg.level, maxEnergy: cfg.energy },
    trainer: { number: t.number, name: t.name, lines: { hello: t.hello, win: t.win, loss: t.loss } },
    pool: poolFor(pack, { kind: 'trainer', trainerNumber: t.number, beaten: [] }),
    time: { trainerNumber: t.number, setting: pack.timePressure },
  };
}


function plate(cls) {
  const name = el('span', { class: 'plate-name' });
  const lv = el('span', { class: 'plate-lv' });
  const bar = el('div', { class: 'plate-bar', role: 'meter', 'aria-label': tr('duel.energy') });
  const extra = el('div', { class: 'plate-extra' });
  const node = el('div', { class: `plate ${cls} passive` }, el('div', { class: 'plate-head' }, name, lv), bar, extra);
  return { node, name, lv, bar, extra };
}

function setBar(bar, value, max) {
  if (bar.children.length !== max) {
    clear(bar);
    for (let i = 0; i < max; i++) bar.append(el('span', { class: 'seg' }));
  }
  [...bar.children].forEach((s, i) => s.classList.toggle('on', i < value));
  bar.classList.toggle('low', value <= Math.max(1, Math.floor(max / 4)));
  bar.setAttribute('aria-valuenow', String(value));
  bar.setAttribute('aria-valuemax', String(max));
}

export function createDuelScene(game, setup, onEnd) {
  const c = game.state.creature;
  const stage = stageForLevel(c.level);
  const player = { species: c.species, stage, energy: c.energy, maxEnergy: maxEnergy(c) };
  const progress = packProgress(game.state, game.pack.data.shortId);
  const timeFor = timerFor(setup, c.species);
  const duel = createDuel({
    kind: setup.kind,
    player,
    foe: { maxEnergy: setup.foe.maxEnergy, phases: setup.foe.phases },
    deck: createDeck(setup.pool, progress.history, game.rng),
    rng: game.rng,
    timeFor,
  });
  const hasClock = timeFor({ form: 'choice' }) !== null;
  const foeName = speciesName(setup.foe.species, setup.foe.stage);
  // Bis die Entwicklung vorbei ist, zeigen Bild, Schild und Texte die Stufe vom Duellbeginn.
  let shownStage = stage;
  let ownRows = creatureRows(c.species, stage);
  let evolving = null; // { start, fromImg, toImg, resolve }
  let over = false; // nach der Entwicklung zeigt das Schild die Energie des Wesens selbst
  const shiny = setup.kind === 'wild' && setup.foe.shiny === true;
  let foeRows = shiny ? shinyRows(creatureRows(setup.foe.species, setup.foe.stage), setup.foe.species) : creatureRows(setup.foe.species, setup.foe.stage);
  let foeKey = `creature:${setup.foe.species}:${setup.foe.stage}${shiny ? ':glanz' : ''}`;
  // Endgegner (Design 7.4): In jeder Phase eine andere Gestalt, sanft übergeblendet.
  let morph = null; // { start, rows, key }: die alte Gestalt, die ausblendet
  let phaseHold = false; // Balken leer zeigen, bis die neue Gestalt da ist
  const MORPH_MS = 900;
  function nextForm() {
    morph = game.reducedMotion ? null : { start: t, rows: foeRows, key: foeKey };
    const st = foeStageForPhase(duel.phase);
    foeRows = creatureRows(setup.foe.species, st);
    foeKey = `creature:${setup.foe.species}:${st}`;
    phaseHold = false;
    updatePlates();
  }

  let t = 0;
  let alive = true;
  let panel = null;
  let asking = false; // eine Frage ist zu sehen: Nur dann läuft die Uhr (Design 7.4)
  const plates = { own: plate('own'), foe: plate('foe') };
  const anim = { own: { lunge: -1e9, hit: -1e9, faint: null }, foe: { lunge: -1e9, hit: -1e9, faint: null }, sparkle: -1e9, foeSparkle: -1e9 };

  function updatePlates() {
    plates.foe.name.textContent = foeName;
    plates.foe.lv.textContent = `Lv ${setup.foe.level}`;
    if (shiny && !plates.foe.extra.firstChild) plates.foe.extra.append(el('span', { class: 'shiny-mark' }, tr('duel.shinyMark')));
    setBar(plates.foe.bar, foeEnergyShown(duel, phaseHold), duel.foeMax);
    plates.own.name.textContent = nameAtStage(c, shownStage);
    plates.own.lv.textContent = `Lv ${c.level}`;
    const own = ownEnergyShown(duel, c, over);
    setBar(plates.own.bar, own.energy, own.max);
    clear(plates.own.extra);
    const n = duel.critEvery;
    const filled = duel.streak % n;
    const pips = el('span', { class: 'pips', 'aria-label': tr('duel.streakAria', { n: duel.streak }) });
    for (let i = 0; i < n; i++) pips.append(el('span', { class: `pip${i < filled ? ' on' : ''}` }));
    plates.own.extra.append(pips);
    if (filled === n - 1) plates.own.extra.append(el('span', { class: 'ready' }, tr('duel.critReady')));
  }

  let stopKeyboard = () => {};

  // Die Entwicklung in der Arena (Design 6.3). Danach steht das neue Wesen auf der Plattform.
  function evolveInArena(from, to) {
    const fromRows = creatureRows(c.species, from);
    const toRows = creatureRows(c.species, to);
    return new Promise(resolve => {
      evolving = {
        start: t,
        fromImg: spriteFrom(`creature:${c.species}:${fromRows.length}`, fromRows),
        toImg: spriteFrom(`creature:${c.species}:${toRows.length}`, toRows),
        resolve: () => {
          shownStage = to;
          ownRows = toRows;
          over = true;
          updatePlates();
          resolve();
        },
      };
    });
  }

  async function showResult(r, response, ctx) {
    if (r.correct) {
      anim.own.lunge = t;
      await wait(150);
      anim.foe.hit = t;
      updatePlates();
      const lines = r.healed ? [tr('duel.springHeal')] : [];
      await panel.feedback({ ok: true, title: r.crit ? tr('duel.crit') : tr('duel.right'), lines, autoMs: 1100 });
      duel.next();
      return;
    }
    if (r.secondChance) {
      ctx.disabledIndex = !r.timedOut && duel.current.form === 'choice' ? response.index : null;
      ctx.notice = r.timedOut ? tr('duel.secondChanceTime') : tr('duel.secondChanceWrong');
      return;
    }
    const lines = [tr('duel.correctIs', { answer: r.correctText })];
    if (r.shielded) lines.push(tr('duel.shield'));
    await panel.feedback({
      ok: false,
      title: r.timedOut ? tr('duel.timeUp') : r.almost ? tr('feedback.almost') : tr('feedback.wrong'),
      lines,
      minMs: CONFIG.duel.wrongMinMs,
    });
    if (!r.shielded) {
      anim.foe.lunge = t;
      await wait(150);
      anim.own.hit = t;
      updatePlates();
      await wait(350);
    }
    duel.next();
  }

  // Füttern statt antworten (Design 8). Bei Beeren und Sternfrüchten fragt eine kleine Auswahl.
  // Abbrechen zeigt dieselbe Frage wieder.
  async function feed() {
    panel.clear();
    const bag = game.state.bag;
    const kinds = FOOD.filter(k => bag[k] > 0);
    let item = kinds[0];
    if (kinds.length > 1) {
      const pick = await choose(game, tr('duel.whatEat', { name: displayName(c) }), [tr('duel.berryCount', { n: bag.berry }), tr('duel.starfruitCount', { n: bag.starfruit }), tr('common.back')], { cancelIndex: 2 });
      if (!alive) return;
      item = kinds[pick];
    }
    if (!item || !duel.canFeed() || !takeItem(game.state, item)) return;
    const gained = duel.feed(foodEnergy(c.species, item));
    c.energy = duel.playerEnergy; // Rucksack und Energie passen zusammen, falls jetzt gespeichert wird
    anim.sparkle = t;
    updatePlates();
    const what = item === 'berry' ? tr('item.aBerry') : tr('item.aStarfruit');
    await panel.feedback({ ok: true, title: tr('duel.eats', { name: displayName(c), what }), lines: [tr('duel.energyPlus', { n: gained })], autoMs: 1400 });
  }

  async function end() {
    panel?.remove();
    panel = null;
    const s = duel.summary();
    const own = displayName(c);
    // Sofort übernehmen und speichern, noch vor den Dialogen: Kinder schließen die App oft genau
    // beim Sieg (Design 11). Sonst speichert das Schließen den Stand ohne Sieg und XP.
    const report = applyDuelResult(game.state, game.pack.data.shortId, setup, s, game.rng);
    game.save?.();
    if (s.outcome === 'won') {
      anim.foe.faint = t;
      if (setup.trainer) await say(game, [setup.trainer.lines.win], { speaker: setup.trainer.name });
      else if (setup.kind === 'boss') await say(game, [tr('boss.tired')]);
      else await say(game, [tr('duel.foeTired', { wild: wildName(setup.foe.species, setup.foe.stage, 'the') })]);
    } else if (s.outcome === 'lost') {
      anim.own.faint = t;
      if (setup.trainer) await say(game, [setup.trainer.lines.loss], { speaker: setup.trainer.name });
      await say(game, [tr('duel.ownTired', { name: own })]);
    } else {
      await say(game, [tr('duel.escaped')]);
    }
    if (!alive) return;
    if (report.xp) {
      const extra = `${report.flawless ? tr('duel.flawless') : ''}${report.shine ? tr('duel.shineDoubles') : ''}`;
      await say(game, [tr('duel.xp', { name: own, xp: report.xp, extra })]);
      for (let lvl = report.levelAfter - report.levelsGained + 1; lvl <= report.levelAfter; lvl++) {
        if (!alive) return;
        anim.sparkle = t;
        updatePlates();
        await say(game, [tr('duel.levelUp', { name: nameAtStage(c, shownStage), level: lvl })]);
      }
      if (report.stageAfter > report.stageBefore) {
        await evolveInArena(report.stageBefore, report.stageAfter);
        if (!alive) return;
        await say(game, evolutionLines(c, report.stageBefore, report.stageAfter));
      }
    }
    for (const l of report.loot) {
      if (!alive) return;
      const line = l.source === 'wild'
        ? tr('duel.foeDroppedBerry', { wild: wildName(setup.foe.species, setup.foe.stage, 'the') })
        : tr('duel.foundBerry', { name: displayName(c) });
      await say(game, l.kept ? [line] : [line, tr('bag.full')]);
    }
    if (alive) onEnd(report);
  }

  async function run() {
    if (setup.kind === 'wild') {
      // Eine Glanzform funkelt einmal kurz auf (nicht bei „Bewegung reduzieren“) und sagt es dazu.
      if (shiny && !game.reducedMotion) anim.foeSparkle = t;
      await say(game, [tr('duel.wildAppears', { wild: wildName(setup.foe.species, setup.foe.stage, 'a') }), ...(shiny ? [tr('duel.shinyAppears')] : [])]);
      if (!alive) return;
      const pick = await choose(game, tr('duel.whatDo'), [tr('duel.fight'), tr('duel.flee')]);
      if (!alive) return;
      if (pick === 1) {
        duel.flee();
        return end();
      }
    }
    panel = createDuelPanel(game);
    const ctx = { disabledIndex: null, notice: null, feed: null, farsight: null, time: null };
    const hadFood = foodCount(game.state.bag) > 0;
    // Weitblick steht das ganze Duell an seinem Platz, wenn zu Beginn einer im Rucksack war.
    if (game.state.bag.farsight > 0) {
      ctx.farsight = {
        label: () => tr('duel.farsightBtn', { n: game.state.bag.farsight }),
        enabled: () => duel.canFarsight() && game.state.bag.farsight > 0,
        use: () => (ctx.farsight.enabled() && takeItem(game.state, 'farsight') ? duel.useFarsight() : null),
      };
    }
    // Zeitstein: nach derselben Regel, wenn das Duell eine Uhr hat.
    if (hasClock && game.state.bag.time > 0) {
      ctx.time = {
        label: () => tr('duel.timeBtn', { n: game.state.bag.time }),
        enabled: () => duel.canFreeze() && game.state.bag.time > 0,
        use: () => ctx.time.enabled() && takeItem(game.state, 'time') && duel.freezeTime(),
      };
    }
    while (alive && !FINAL.has(duel.state)) {
      if (duel.state === 'ready') duel.ask();
      ctx.feed = {
        show: hadFood,
        enabled: () => duel.canFeed() && foodCount(game.state.bag) > 0 && duel.playerEnergy < duel.playerMax,
      };
      asking = true;
      const action = await panel.ask(duel, ctx);
      asking = false;
      ctx.disabledIndex = null;
      ctx.notice = null;
      if (!alive) return;
      if (action.type === 'timeout') {
        await showResult(action.result, null, ctx);
        updatePlates();
        continue;
      }
      if (action.type === 'feed') {
        await feed();
        continue;
      }
      if (action.type === 'flee') {
        duel.flee();
        break;
      }
      if (action.type === 'surrender') {
        panel.clear();
        const yes = (await choose(game, tr('duel.surrenderAsk'), [tr('common.yes'), tr('common.no')], { cancelIndex: 1, selected: 1 })) === 0;
        if (yes) {
          duel.surrender();
          break;
        }
        continue;
      }
      const r = duel.answer(action.response);
      if (!r) continue;
      phaseHold = r.phaseCleared;
      await showResult(r, action.response, ctx);
      updatePlates();
      if (r.phaseCleared && alive) {
        nextForm();
        await say(game, [tr('boss.phase')]);
      }
    }
    if (alive) await end();
  }

  function drawCreature(ctx, rows, key, base, flip, who, fade = 1) {
    const img = spriteFrom(key, rows, { flip });
    const size = rows.length;
    const a = anim[who];
    const dir = flip ? -1 : 1;
    let dx = 0;
    let dy = game.reducedMotion ? 0 : Math.round(Math.sin(t / 650 + (flip ? 1.7 : 0)));
    const lp = (t - a.lunge) / 300;
    if (!game.reducedMotion && lp >= 0 && lp < 1) dx += Math.round(Math.sin(lp * Math.PI) * 8) * dir;
    const hp = (t - a.hit) / 300;
    if (!game.reducedMotion && hp >= 0 && hp < 1) dx -= Math.round(2 * (1 - hp)) * dir;
    const x = base.x - size / 2 + dx;
    const y = base.y - size + 3 + dy;
    const alpha = creatureAlpha(a.faint, t, fade);
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, x, y);
    if (hp >= 0 && hp < 1) {
      ctx.globalAlpha = alpha * (1 - hp) * 0.85;
      ctx.drawImage(whiteOf(img), x, y);
    }
    ctx.globalAlpha = 1;
  }

  return {
    duel,
    enter() {
      game.mode = 'duel';
      game.ui.append(plates.foe.node, plates.own.node);
      updatePlates();
      stopKeyboard = watchKeyboard();
      run();
    },
    exit() {
      alive = false;
      closeDialogs();
      panel?.remove();
      plates.foe.node.remove();
      plates.own.node.remove();
      stopKeyboard();
    },
    update(dt) {
      t += dt;
      if (evolving && evolutionAt(t - evolving.start, game.reducedMotion).done) {
        const done = evolving.resolve;
        evolving = null;
        done();
      }
      // Die Uhr läuft nur, solange die Frage zu sehen ist, nicht bei Futterauswahl, „Aufgeben?“ oder
      // Rückmeldungen. Ist die App verdeckt, steht die Spielschleife und damit auch die Uhr.
      if (!asking || !panel || duel.timeLimit == null) return;
      const r = duel.tick(dt);
      if (r) {
        asking = false; // weitere Schritte in diesem Bild (Aufholen) ticken nicht nach
        panel.interrupt({ type: 'timeout', result: r });
      }
      else panel.setTime(duel.timeLeft, duel.timeLimit, duel.frozen);
    },
    render(ctx) {
      drawArena(ctx, setup.arena ?? setup.area, t, game.reducedMotion);
      if (morph && t - morph.start < MORPH_MS) {
        const p = (t - morph.start) / MORPH_MS;
        drawCreature(ctx, morph.rows, morph.key, ARENA.foe, true, 'foe', 1 - p);
        drawCreature(ctx, foeRows, foeKey, ARENA.foe, true, 'foe', p);
      } else {
        morph = null;
        drawCreature(ctx, foeRows, foeKey, ARENA.foe, true, 'foe');
      }
      const fs = (t - anim.foeSparkle) / 1200;
      if (fs >= 0 && fs < 1) {
        ctx.fillStyle = '#fffaf0';
        ctx.globalAlpha = 1 - fs;
        for (let i = 0; i < 4; i++) {
          const ang = (i / 4) * Math.PI * 2 + 0.6;
          const r = 14 + fs * 10;
          const x = Math.round(ARENA.foe.x + Math.cos(ang) * r), y = Math.round(ARENA.foe.y - 18 + Math.sin(ang) * r * 0.8);
          ctx.fillRect(x - 1, y, 3, 1);
          ctx.fillRect(x, y - 1, 1, 3);
        }
        ctx.globalAlpha = 1;
      }
      if (evolving) drawEvolution(ctx, t - evolving.start, evolving, ARENA.own, game.reducedMotion);
      else drawCreature(ctx, ownRows, `creature:${c.species}:${ownRows.length}`, ARENA.own, false, 'own');
      const sp = (t - anim.sparkle) / 1200;
      if (sp >= 0 && sp < 1) {
        ctx.fillStyle = '#ffe08a';
        for (let i = 0; i < 8; i++) {
          const ang = (i / 8) * Math.PI * 2 + sp * 2;
          const r = 10 + sp * 18;
          ctx.fillRect(Math.round(ARENA.own.x + Math.cos(ang) * r), Math.round(ARENA.own.y - 16 + Math.sin(ang) * r * 0.7 - sp * 10), 2, 2);
        }
      }
    },
  };
}
