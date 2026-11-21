// Befreunden nach dem Duell (Lumara 1.2, Spec 6.1): was das Antwort-Panel beim Befreunden zeigt,
// Vertrauensring und Herz in der Arena, wie die Duellszene den Ablauf einbindet, und der Ablauf
// selbst mit Dialogen und Panel zum Mitschreiben statt im Browser.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { panelRules } from '../js/ui/duelPanel.js';
import { RING, ringArcs, ringFill, heartPose, heartMs, drawTrustRing, drawHeart } from '../js/gfx/trustRing.js';
import { PALETTE } from '../js/gfx/palette.js';
import { ARENA } from '../js/gfx/arena.js';
import { stubContext, q } from './helpers/fixtures.js';
import { playBefriend } from '../js/scenes/befriend.js';
import { newGameState } from '../js/state.js';
import { createRng } from '../js/core/rng.js';
import { createDeck, recordAnswer } from '../js/duel/questions.js';
import { speciesName, speciesText } from '../js/data/species.js';
import { t } from '../js/i18n/i18n.js';

const src = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('Panel beim Befreunden: nur Weitblick und „Weiterziehen“, keine Fähigkeiten der Startwesen', () => {
  assert.deepEqual(panelRules('befriend'), { leave: 'moveon', leaveLabel: 'befriend.moveOn', abilities: false, farsight: true });
  assert.deepEqual(panelRules('note'), { leave: 'later', leaveLabel: 'duel.later', abilities: false, farsight: false });
  assert.deepEqual(panelRules('wild'), { leave: 'flee', leaveLabel: 'duel.flee', abilities: true, farsight: true });
  assert.deepEqual(panelRules('trainer'), { leave: 'surrender', leaveLabel: 'duel.surrender', abilities: true, farsight: true });
  assert.equal(panelRules('boss').leave, 'surrender');
});

test('Ring: drei Bögen zu je 120° mit 12° Lücke, der erste beginnt oben', () => {
  const arcs = ringArcs();
  assert.equal(arcs.length, 3);
  assert.deepEqual(arcs.map(a => a.to - a.from), [108, 108, 108]);
  assert.equal(arcs[0].from, -84);
  for (let i = 1; i < 3; i++) assert.equal(arcs[i].from - arcs[i - 1].to, 12);
  assert.equal(arcs[0].from + 360 - arcs[2].to, 12);
  assert.deepEqual([RING.r, RING.width, RING.fillMs], [22, 2, 250]);
});

test('Ring: ein neues Feld füllt sich in 250 ms, bei „Bewegung reduzieren“ sofort', () => {
  const ring = { filled: 1, since: [1000] };
  assert.equal(ringFill(ring, 0, 1000, false), 0);
  assert.equal(ringFill(ring, 0, 1125, false), 0.5);
  assert.equal(ringFill(ring, 0, 1250, false), 1);
  assert.equal(ringFill(ring, 0, 9000, false), 1);
  assert.equal(ringFill(ring, 0, 1000, true), 1);
  assert.equal(ringFill(ring, 1, 9000, false), 0, 'noch leeres Feld');
  assert.equal(ringFill(ring, 1, 9000, true), 0);
});

test('Herz: steigt in 1,2 s 20 px auf und verblasst; bei „Bewegung reduzieren“ steht es 1 s still', () => {
  assert.deepEqual([heartMs(false), heartMs(true)], [1200, 1000]);
  assert.deepEqual(heartPose(0, false), { dy: 0, alpha: 1 });
  assert.equal(heartPose(600, false).dy, -10);
  assert.ok(heartPose(1199, false).dy >= -20 && heartPose(1199, false).alpha < 0.05);
  assert.equal(heartPose(1200, false), null);
  assert.equal(heartPose(-1, false), null);
  for (const ms of [0, 500, 999]) assert.deepEqual(heartPose(ms, true), { dy: 0, alpha: 1 }, `${ms} ms`);
  assert.equal(heartPose(1000, true), null);
});

test('Ring und Herz: nur Farben der Palette, leer #46496e, voll #ffe08a, alles im Bild', () => {
  const hexes = new Set(PALETTE.map(p => p.hex));
  const ctx = stubContext();
  drawTrustRing(ctx, { filled: 2, since: [0, 100] }, ARENA.foe.x, ARENA.foe.y - 16, 225, false);
  drawHeart(ctx, ARENA.foe.x, ARENA.foe.y - 16, 1);
  const colors = ctx.calls.filter(c => c[0] === 'set' && c[1] === 'fillStyle').map(c => c[2]);
  for (const c of colors) assert.ok(hexes.has(c), c);
  assert.ok(colors.includes('#46496e') && colors.includes('#ffe08a'));
  for (const [, x, y, w, h] of ctx.calls.filter(c => c[0] === 'fillRect')) {
    assert.ok(x >= 0 && y >= 0 && x + w <= 240 && y + h <= 160, `${x},${y}`);
    assert.ok(Number.isInteger(x) && Number.isInteger(y), 'ganze Pixel');
  }
});

// Farben der Pixel, die drawTrustRing setzt, in der Reihenfolge der Aufrufe.
function ringColors(ring, t, reducedMotion) {
  const ctx = stubContext();
  drawTrustRing(ctx, ring, ARENA.foe.x, ARENA.foe.y - 16, t, reducedMotion);
  let color = null;
  const out = [];
  for (const c of ctx.calls) {
    if (c[0] === 'set' && c[1] === 'fillStyle') color = c[2];
    if (c[0] === 'fillRect') out.push(color);
  }
  return out;
}

test('Ring: leer ohne einen hellen Pixel, voll ohne einen dunklen', () => {
  for (const rm of [false, true]) {
    const empty = ringColors({ filled: 0, since: [] }, 5000, rm);
    assert.ok(empty.length > 0);
    assert.ok(empty.every(c => c === '#46496e'), `leer, reducedMotion=${rm}`);
    const full = ringColors({ filled: 3, since: [0, 0, 0] }, 5000, rm);
    assert.equal(full.length, empty.length, 'gleich viele Pixel');
    assert.ok(full.every(c => c === '#ffe08a'), `voll, reducedMotion=${rm}`);
  }
  // Ein Feld voll (Leckerli), die anderen beiden ganz dunkel: genau ein Drittel hell.
  const one = ringColors({ filled: 1, since: [0] }, 5000, false);
  assert.equal(one.filter(c => c === '#ffe08a').length * 3, one.length);
  // Ein neues Feld beginnt dunkel, auch ganz am Anfang des Bogens.
  const starting = ringColors({ filled: 1, since: [1000] }, 1000, false);
  assert.ok(starting.every(c => c === '#46496e'));
});

test('Ring bei „Bewegung reduzieren“: gleich, egal wie spät', () => {
  const ring = { filled: 2, since: [0, 100] };
  const early = stubContext();
  const late = stubContext();
  drawTrustRing(early, ring, 184, 39, 101, true);
  drawTrustRing(late, ring, 184, 39, 5000, true);
  assert.deepEqual(late.calls, early.calls);
});

// Die Duellszene selbst braucht den Browser. Hier nur, wie sie den Ablauf einbindet: Angebot gleich
// nach dem Ergebnis, Befreunden nach der Beute und vor onEnd, der Ring mit dem Deck des Duells.
test('Duellszene: Angebot gleich nach dem Ergebnis, Befreunden nach der Beute und vor onEnd', () => {
  const duel = src('js/scenes/duel.js');
  const apply = duel.indexOf('applyDuelResult(game.state');
  const offer = duel.indexOf('befriendOffer(game.state, setup, s.outcome)');
  const loot = duel.indexOf('for (const l of report.loot)');
  const play = duel.indexOf('await playBefriend(game, setup, offer, view)');
  const end = duel.lastIndexOf('onEnd(report)');
  assert.ok(apply > 0 && offer > apply && loot > offer && play > loot && end > play);
  assert.match(duel, /const deck = createDeck\(setup\.pool, progress\.history, game\.rng\);/);
  const create = duel.slice(duel.indexOf('const duel = createDuel({'), duel.indexOf('});', duel.indexOf('const duel = createDuel({')));
  assert.ok(create.includes('\n    deck,\n'), 'das Duell zieht aus demselben Deck');
  assert.match(duel, /const view = \{\n {4}alive: \(\) => alive,\n {4}deck,\n/);
  assert.ok(src('sw.js').includes('"js/scenes/befriend.js"'));
});

test('Befreunden: Im Code heißt es befreunden, nie fangen', () => {
  const scene = src('js/scenes/befriend.js');
  assert.ok(!/fang|catch\w*Creature/i.test(scene.replace(/\/\/.*$/gm, '')), 'man befreundet, man fängt nicht');
});

// ---------- Der Ablauf (js/scenes/befriend.js) mit vorgegebenen Antworten ----------

const FRIEND = 'gischtling'; // befreundbar, Wasserwesen
const NAME = speciesName(FRIEND, 1);
const QUESTIONS = Array.from({ length: 8 }, (_, i) => q({ text: `Ring Frage ${i + 1}`, forms: ['choice'] }));

// Spielt playBefriend mit Dialogen und Panel zum Mitschreiben. picks: Antworten auf choose der
// Reihe nach; answers: was das Kind im Ring tut ('right', 'wrong', 'moveon' oder eine Funktion
// run → Aktion); onFeedback(run, n) läuft bei der n-ten Rückmeldung. log hält alles der Reihe nach fest.
async function runBefriend({ picks = [], answers = [], treat = 0, friends = {}, companion = null, offer = {}, deck, onFeedback } = {}) {
  const state = newGameState({ name: 'Mia', species: 'nixi', nickname: null });
  state.bag.treat = treat;
  state.friends = structuredClone(friends);
  state.companion = companion;
  const log = [];
  const run = { state, log, alive: true, leave: null, removed: 0, asked: [] };
  const game = {
    state,
    pack: { data: { shortId: 'ring-test' } },
    rng: createRng(7),
    save: () => log.push(['save', structuredClone(state.friends), state.bag.treat]),
  };
  const view = {
    alive: () => run.alive,
    deck,
    setRing: trust => log.push(['ring', trust ? trust.filled : null]),
    heart: () => log.push(['heart']),
    onLeave: fn => {
      run.leave = fn;
    },
  };
  const panel = {
    async ask(duel) {
      assert.ok(run.alive, 'keine Frage nach dem Verlassen der Szene');
      const { question, choices } = duel.current;
      run.asked.push(question.key);
      log.push(['ask', question.key]);
      const a = answers.shift();
      if (typeof a === 'function') return a(run);
      if (a === 'right') return { type: 'answer', response: { index: choices.correctIndex } };
      if (a === 'wrong') return { type: 'answer', response: { index: (choices.correctIndex + 1) % choices.options.length } };
      return { type: a };
    },
    async feedback(o) {
      log.push(['feedback', o.ok]);
      onFeedback?.(run, log.filter(e => e[0] === 'feedback').length);
    },
    interrupt: v => log.push(['interrupt', v.type]),
    remove() {
      run.removed++;
      log.push(['remove']);
    },
  };
  const deps = {
    say: async (g, lines) => {
      assert.ok(run.alive, `kein Text nach dem Verlassen der Szene: ${lines[0]}`);
      log.push(['say', ...lines]);
    },
    choose: async (g, prompt) => {
      assert.ok(run.alive, `keine Auswahl nach dem Verlassen der Szene: ${prompt}`);
      log.push(['choose', prompt]);
      return picks.shift();
    },
    createDuelPanel: () => {
      log.push(['panel']);
      return panel;
    },
  };
  const setup = { kind: 'wild', pool: QUESTIONS };
  run.result = await playBefriend(game, setup, { species: FRIEND, shiny: false, upgrade: false, ...offer }, view, deps);
  run.said = log.filter(e => e[0] === 'say').flatMap(e => e.slice(1));
  run.prompts = log.filter(e => e[0] === 'choose').map(e => e[1]);
  return run;
}

const at = (log, entry) => log.findIndex(e => e[0] === entry);

test('Ablauf: drei richtige, der Freund ist gespeichert, Herz, dann die Frage nach dem Begleiter', async () => {
  const run = await runBefriend({ picks: [0, 0], answers: ['right', 'right', 'right'] });
  const { log, state } = run;
  assert.equal(run.result, 'friend');
  assert.deepEqual(state.friends[FRIEND], { shiny: false });
  assert.equal(state.companion, FRIEND, 'Ja auf die Frage nach dem Begleiter');
  assert.deepEqual(run.prompts, [t('befriend.ask'), t('befriend.companionAsk', { name: NAME })], 'ohne Leckerli keine Frage danach');
  assert.equal(run.said[0], t('befriend.sits', { name: NAME }));
  assert.ok(run.said.includes(t(`befriend.done.${speciesText(FRIEND).gender}`, { name: NAME })));
  assert.equal(run.said.at(-1), t('befriend.companionYes', { name: NAME }));
  // Nach jeder Antwort gespeichert, vor der Rückmeldung; der Freund vor Herz und Texten.
  const asks = log.map((e, i) => (e[0] === 'ask' ? i : -1)).filter(i => i >= 0);
  assert.equal(asks.length, 3);
  for (const i of asks) assert.deepEqual([log[i + 1][0], log[i + 2][0], log[i + 3][0]], ['save', 'ring', 'feedback']);
  const saved = log.findIndex(e => e[0] === 'save' && e[1][FRIEND]);
  assert.ok(saved > asks[2] && saved < at(log, 'heart'), 'erst gespeichert, dann das Herz');
  // Die Antworten zählen wie Antworten auf Zettel.
  const p = state.packs['ring-test'];
  assert.equal(p.stats.total, 3);
  assert.equal(Object.keys(p.history).length, 3);
  // Ring aus, Panel weg.
  assert.deepEqual(log.at(-1), ['ring', null]);
  assert.equal(run.removed, 1);
  assert.equal(run.leave, null, 'der Haken fürs Verlassen ist wieder frei');
});

test('Ablauf: drei falsche, das Wesen ist zu scheu', async () => {
  const run = await runBefriend({ picks: [0], answers: ['wrong', 'wrong', 'wrong'] });
  assert.equal(run.result, 'shy');
  assert.deepEqual(run.state.friends, {});
  assert.equal(run.said.at(-1), t('befriend.shy', { name: NAME }));
  assert.equal(run.log.filter(e => e[0] === 'ask').length, 3, 'nach drei falschen ist der Ring nicht mehr zu füllen');
  assert.deepEqual(run.log.at(-1), ['ring', null]);
  assert.equal(run.removed, 1);
});

test('Ablauf: „Weiterziehen“ im Ring, das Leckerli bleibt verbraucht', async () => {
  const run = await runBefriend({ picks: [0, 0], treat: 2, answers: ['right', 'moveon'] });
  const { log, state } = run;
  assert.equal(run.result, 'left');
  assert.equal(state.bag.treat, 1, 'ein Leckerli gegeben');
  assert.deepEqual(state.friends, {});
  assert.deepEqual(run.prompts, [t('befriend.ask'), t('befriend.treatAsk', { name: NAME })]);
  assert.ok(run.said.includes(t('befriend.treatTaken', { name: NAME })));
  assert.equal(run.said.at(-1), t('befriend.left', { name: NAME }));
  // Gleich nach dem Geben gespeichert, noch vor dem Ring; der Ring beginnt mit einem vollen Feld.
  const treatSave = log.findIndex(e => e[0] === 'save');
  assert.equal(log[treatSave][2], 1);
  assert.ok(treatSave < at(log, 'ring'));
  assert.deepEqual(log[at(log, 'ring')], ['ring', 1]);
  assert.equal(run.removed, 1);
});

test('Ablauf: Leckerli abgelehnt, es bleibt im Rucksack', async () => {
  const run = await runBefriend({ picks: [0, 1], treat: 1, answers: ['moveon'] });
  assert.equal(run.result, 'left');
  assert.equal(run.state.bag.treat, 1);
  assert.deepEqual(run.log[at(run.log, 'ring')], ['ring', 0]);
});

test('Ablauf: „Weiterziehen“ gleich bei der ersten Frage endet still', async () => {
  const run = await runBefriend({ picks: [1] });
  assert.equal(run.result, 'left');
  assert.deepEqual(run.said, [t('befriend.sits', { name: NAME })]);
  assert.deepEqual(run.prompts, [t('befriend.ask')]);
  assert.deepEqual(run.log.map(e => e[0]), ['say', 'choose'], 'kein Ring, kein Panel, nichts gespeichert');
});

test('Ablauf: eine Glanzform macht einen Freund glänzend; mit Begleiter keine Frage danach', async () => {
  const run = await runBefriend({
    picks: [0],
    answers: ['right', 'wrong', 'right', 'right'],
    friends: { [FRIEND]: { shiny: false }, moosling: { shiny: false } },
    companion: 'moosling',
    offer: { shiny: true, upgrade: true },
  });
  assert.equal(run.result, 'friend');
  assert.deepEqual(run.state.friends[FRIEND], { shiny: true });
  assert.equal(run.state.companion, 'moosling');
  assert.equal(run.said.at(-1), t('befriend.shinyNow', { name: NAME }));
  assert.deepEqual(run.prompts, [t('befriend.ask')], 'keine Frage nach dem Begleiter');
});

// Wie exit() in js/scenes/duel.js: Die Szene ist weg, ihr Haken räumt das Panel weg.
function exitScene(run) {
  run.alive = false;
  run.leave?.();
}

test('Ablauf: Wird die Szene mitten im Ring verlassen, kommt nichts mehr und es gibt keinen Freund', async () => {
  const run = await runBefriend({
    picks: [0],
    answers: ['right', r => {
      exitScene(r);
      return { type: 'moveon' }; // was interrupt dem offenen ask gibt
    }],
  });
  const { log } = run;
  assert.equal(run.result, 'left');
  assert.deepEqual(run.state.friends, {});
  assert.equal(run.log.filter(e => e[0] === 'ask').length, 2);
  // Nach dem Verlassen nur noch Aufräumen: Panel weg, Ring aus. Texte und Auswahl prüft deps selbst.
  const after = log.slice(log.findIndex(e => e[0] === 'interrupt'));
  assert.deepEqual(after.map(e => e[0]), ['interrupt', 'remove', 'remove', 'ring']);
  assert.deepEqual(after.at(-1), ['ring', null]);
  assert.equal(run.leave, null);
});

test('Ablauf: Endet die Szene bei der dritten Rückmeldung, zählt der volle Ring trotzdem', async () => {
  const run = await runBefriend({
    picks: [0],
    answers: ['right', 'right', 'right'],
    onFeedback: (r, n) => n === 3 && exitScene(r),
  });
  assert.equal(run.result, 'friend');
  assert.deepEqual(run.state.friends[FRIEND], { shiny: false });
  const saves = run.log.filter(e => e[0] === 'save');
  assert.deepEqual(saves.at(-1)[1], { [FRIEND]: { shiny: false } }, 'der Freund ist gespeichert');
  assert.equal(at(run.log, 'heart'), -1, 'kein Herz mehr, die Szene ist weg');
  assert.equal(run.state.companion, null);
});

test('Ring: zieht aus dem Deck des Duells, eben gestellte Fragen kommen nicht gleich wieder', async () => {
  // Ein vorgegebenes Deck: Der Ring nimmt genau dessen Fragen, in dessen Reihenfolge.
  const order = [QUESTIONS[5], QUESTIONS[2], QUESTIONS[7]];
  const given = { draw: () => order.shift() };
  const run = await runBefriend({ picks: [0], answers: ['right', 'right', 'right'], deck: given });
  assert.deepEqual(run.asked, [QUESTIONS[5].key, QUESTIONS[2].key, QUESTIONS[7].key]);
  // Das echte Deck nach einem Duell mit fünf Fragen, alle falsch beantwortet (sonst dreifach gewichtet):
  // Der Ring stellt die drei, die im Duell noch nicht kamen.
  const history = {};
  const deck = createDeck(QUESTIONS, history, createRng(3));
  const duelKeys = Array.from({ length: 5 }, () => deck.draw().key);
  for (const k of duelKeys) recordAnswer(history, k, false);
  const ring = await runBefriend({ picks: [0], answers: ['right', 'right', 'right'], deck });
  assert.equal(ring.asked.length, 3);
  for (const k of ring.asked) assert.ok(!duelKeys.includes(k), `${k} kam eben erst im Duell`);
  assert.equal(new Set([...duelKeys, ...ring.asked]).size, QUESTIONS.length);
});

test('Entwickler-Schalter &leckerli=n: nur auf localhost, setzt den Vorrat im Rucksack', () => {
  const main = src('js/main.js');
  assert.match(main, /const isLocal = \['localhost', '127\.0\.0\.1'\]\.includes\(location\.hostname\)/);
  const fn = main.match(/function devTreats\(state\) \{[\s\S]*?\n\}/)[0];
  assert.match(fn, /params\.get\('leckerli'\)/);
  assert.match(fn, /state\.bag\.treat = n/);
  // erreichbar nur über die Zweige mit isLocal
  assert.match(main, /else if \(isLocal && params\.has\('dev'\)\) devStart\(\)/);
  assert.match(main, /else if \(isLocal && params\.has\('duell'\)\) devDuel/);
  assert.doesNotMatch(fn, /save|store/);
});
