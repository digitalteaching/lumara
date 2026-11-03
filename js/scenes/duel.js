// Duell-Szene (Design 7): Arena auf dem Canvas, Namensschilder und Antworten als HTML.

import { CONFIG } from '../config.js';
import { createDuel } from '../duel/duel.js';
import { createDeck, poolFor } from '../duel/questions.js';
import { stageForLevel, maxEnergy } from '../duel/progress.js';
import { speciesName, displayName, wildName, AREA_WILD, TRAINER_CREATURES } from '../data/species.js';
import { creatureRows } from '../gfx/art/creatures.js';
import { spriteFrom } from '../gfx/canvasSprites.js';
import { drawArena, ARENA } from '../gfx/arena.js';
import { createDuelPanel } from '../ui/duelPanel.js';
import { say, choose, closeDialogs } from '../ui/dialog.js';
import { el, clear } from '../ui/dom.js';
import { applyDuelResult, packProgress } from '../state.js';
import { FOOD, foodCount, takeItem } from '../items/bag.js';
import { foodEnergy } from '../items/food.js';
import { pickWild, wildLevel } from '../world/encounters.js';

const FINAL = new Set(['won', 'lost', 'fled']);
const wait = ms => new Promise(r => setTimeout(r, ms));

export function makeWildSetup(game, area = 1) {
  const pack = game.pack.data;
  const beaten = packProgress(game.state, pack.shortId).beaten;
  return {
    kind: 'wild',
    area,
    foe: {
      species: pickWild(AREA_WILD[area], game.rng),
      stage: 1,
      level: wildLevel(area, game.rng),
      maxEnergy: CONFIG.wild.energyByArea[area - 1],
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
  };
}

// Probefrage für Lehrkräfte (Design 12.3): ein Trainerduell mit den Fragen eines beliebigen Trainers.
// Wesen gibt es bisher nur für Trainer 1, die anderen leihen sich das von Trainer 1 (bis Plan 3).
export function makeProbeSetup(game, number) {
  const pack = game.pack.data;
  const t = pack.trainers.find(x => x.number === number) ?? pack.trainers[0];
  const cfg = CONFIG.trainers[t.number - 1];
  return {
    kind: 'trainer',
    area: t.number,
    foe: { ...(TRAINER_CREATURES[t.number] ?? TRAINER_CREATURES[1]), level: cfg.level, maxEnergy: cfg.energy },
    trainer: { number: t.number, name: t.name, lines: { hello: t.hello, win: t.win, loss: t.loss } },
    pool: poolFor(pack, { kind: 'trainer', trainerNumber: t.number, beaten: [] }),
  };
}

// Weiße Silhouette eines Sprites für das Aufhellen bei Treffern.
const whiteCache = new WeakMap();
function whiteOf(img) {
  let c = whiteCache.get(img);
  if (!c) {
    c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = '#fffaf0';
    g.fillRect(0, 0, c.width, c.height);
    whiteCache.set(img, c);
  }
  return c;
}

function plate(cls) {
  const name = el('span', { class: 'plate-name' });
  const lv = el('span', { class: 'plate-lv' });
  const bar = el('div', { class: 'plate-bar', role: 'meter', 'aria-label': 'Energie' });
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
  const duel = createDuel({
    kind: setup.kind,
    player,
    foe: { maxEnergy: setup.foe.maxEnergy },
    deck: createDeck(setup.pool, progress.history, game.rng),
    rng: game.rng,
  });
  const foeName = speciesName(setup.foe.species, setup.foe.stage);
  const ownRows = creatureRows(c.species, stage);
  const foeRows = creatureRows(setup.foe.species, setup.foe.stage);

  let t = 0;
  let alive = true;
  let panel = null;
  const plates = { own: plate('own'), foe: plate('foe') };
  const anim = { own: { lunge: -1e9, hit: -1e9, faint: null }, foe: { lunge: -1e9, hit: -1e9, faint: null }, sparkle: -1e9 };

  function updatePlates() {
    plates.foe.name.textContent = foeName;
    plates.foe.lv.textContent = `Lv ${setup.foe.level}`;
    setBar(plates.foe.bar, duel.foeEnergy, duel.foeMax);
    plates.own.name.textContent = displayName(c);
    plates.own.lv.textContent = `Lv ${c.level}`;
    setBar(plates.own.bar, duel.playerEnergy, duel.playerMax);
    clear(plates.own.extra);
    const n = duel.critEvery;
    const filled = duel.streak % n;
    const pips = el('span', { class: 'pips', 'aria-label': `Serie ${duel.streak}` });
    for (let i = 0; i < n; i++) pips.append(el('span', { class: `pip${i < filled ? ' on' : ''}` }));
    plates.own.extra.append(pips);
    if (filled === n - 1) plates.own.extra.append(el('span', { class: 'ready' }, 'Volltreffer bereit!'));
  }

  function onViewport() {
    const vv = window.visualViewport;
    if (!vv) return;
    document.body.classList.toggle('kbd', vv.height < window.innerHeight * 0.75);
    document.documentElement.style.setProperty('--vv-top', `${vv.offsetTop}px`);
    document.documentElement.style.setProperty('--vv-height', `${vv.height}px`);
  }

  async function showResult(r, response, ctx) {
    if (r.correct) {
      anim.own.lunge = t;
      await wait(150);
      anim.foe.hit = t;
      updatePlates();
      const lines = r.healed ? ['Quelle: +1 Energie'] : [];
      await panel.feedback({ ok: true, title: r.crit ? 'Volltreffer!' : 'Richtig!', lines, autoMs: 1100 });
      duel.next();
      return;
    }
    if (r.secondChance) {
      ctx.disabledIndex = duel.current.form === 'choice' ? response.index : null;
      ctx.notice = '✗ Leider falsch. Zweite Chance! Versuch es noch einmal.';
      return;
    }
    const lines = [`Richtig ist: ${r.correctText}`];
    if (r.shielded) lines.push('Der Schild schützt dein Wesen.');
    await panel.feedback({
      ok: false,
      title: r.almost ? 'Fast! Achte auf die Schreibweise.' : 'Leider falsch.',
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
      const pick = await choose(game, `Was soll ${displayName(c)} essen?`, [`Beere (${bag.berry})`, `Sternfrucht (${bag.starfruit})`, 'Zurück'], { cancelIndex: 2 });
      if (!alive) return;
      item = kinds[pick];
    }
    if (!item || !duel.canFeed() || !takeItem(game.state, item)) return;
    const gained = duel.feed(foodEnergy(c.species, item));
    c.energy = duel.playerEnergy; // Rucksack und Energie passen zusammen, falls jetzt gespeichert wird
    anim.sparkle = t;
    updatePlates();
    const what = item === 'berry' ? 'eine Beere' : 'eine Sternfrucht';
    await panel.feedback({ ok: true, title: `${displayName(c)} isst ${what}.`, lines: [`+${gained} Energie`], autoMs: 1400 });
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
      else await say(game, [`${wildName(setup.foe.species, setup.foe.stage, 'the')} ist erschöpft.`]);
    } else if (s.outcome === 'lost') {
      anim.own.faint = t;
      if (setup.trainer) await say(game, [setup.trainer.lines.loss], { speaker: setup.trainer.name });
      await say(game, [`${own} ist erschöpft.`]);
    } else {
      await say(game, ['Du bist sicher entkommen.']);
    }
    if (!alive) return;
    if (report.xp) {
      await say(game, [`${own} bekommt ${report.xp} XP.${report.flawless ? ' Makellos! +25 %' : ''}`]);
      for (let lvl = report.levelAfter - report.levelsGained + 1; lvl <= report.levelAfter; lvl++) {
        if (!alive) return;
        anim.sparkle = t;
        updatePlates();
        await say(game, [`${displayName(c)} erreicht Level ${lvl}!`]);
      }
      if (report.stageAfter > report.stageBefore) await say(game, [`${displayName(c)} wird stärker!`]);
    }
    for (const l of report.loot) {
      if (!alive) return;
      const line = l.source === 'wild'
        ? `${wildName(setup.foe.species, setup.foe.stage, 'the')} hat eine Beere verloren.`
        : `${displayName(c)} findet eine Beere.`;
      await say(game, l.kept ? [line] : [line, 'Dein Rucksack ist voll.']);
    }
    if (alive) onEnd(report);
  }

  async function run() {
    if (setup.kind === 'wild') {
      await say(game, [`${wildName(setup.foe.species, setup.foe.stage, 'a')} taucht auf!`]);
      if (!alive) return;
      const pick = await choose(game, 'Was tust du?', ['Duell', 'Fliehen']);
      if (!alive) return;
      if (pick === 1) {
        duel.flee();
        return end();
      }
    }
    panel = createDuelPanel(game);
    const ctx = { disabledIndex: null, notice: null, feed: null };
    const hadFood = foodCount(game.state.bag) > 0;
    while (alive && !FINAL.has(duel.state)) {
      if (duel.state === 'ready') duel.ask();
      ctx.feed = {
        show: hadFood,
        enabled: duel.canFeed() && foodCount(game.state.bag) > 0 && duel.playerEnergy < duel.playerMax,
      };
      const action = await panel.ask(duel, ctx);
      ctx.disabledIndex = null;
      ctx.notice = null;
      if (!alive) return;
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
        const yes = (await choose(game, 'Aufgeben?', ['Ja', 'Nein'], { cancelIndex: 1, selected: 1 })) === 0;
        if (yes) {
          duel.surrender();
          break;
        }
        continue;
      }
      const r = duel.answer(action.response);
      if (!r) continue;
      await showResult(r, action.response, ctx);
      updatePlates();
    }
    if (alive) await end();
  }

  function drawCreature(ctx, rows, key, base, flip, who) {
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
    let alpha = 1;
    if (a.faint !== null) alpha = Math.max(0, 1 - (t - a.faint) / 600);
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
      window.visualViewport?.addEventListener('resize', onViewport);
      window.visualViewport?.addEventListener('scroll', onViewport);
      run();
    },
    exit() {
      alive = false;
      closeDialogs();
      panel?.remove();
      plates.foe.node.remove();
      plates.own.node.remove();
      window.visualViewport?.removeEventListener('resize', onViewport);
      window.visualViewport?.removeEventListener('scroll', onViewport);
      document.body.classList.remove('kbd');
    },
    update(dt) {
      t += dt;
    },
    render(ctx) {
      drawArena(ctx, setup.area, t, game.reducedMotion);
      drawCreature(ctx, foeRows, `creature:${setup.foe.species}:${setup.foe.stage}`, ARENA.foe, true, 'foe');
      drawCreature(ctx, ownRows, `creature:${c.species}:${ownRows.length}`, ARENA.own, false, 'own');
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
