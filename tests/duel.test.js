import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../js/core/rng.js';
import { createDuel } from '../js/duel/duel.js';
import { q } from './helpers/fixtures.js';

const deckOf = qs => {
  let i = 0;
  return { draw: () => qs[i++ % qs.length] };
};
const mk = (p = {}, f = {}, kind = 'wild') =>
  createDuel({
    kind,
    rng: createRng(1),
    player: { species: 'kiesel', stage: 1, energy: 4, maxEnergy: 4, ...p },
    foe: { maxEnergy: 5, ...f },
    deck: deckOf(['A', 'B', 'C', 'D'].map(t => q({ text: t, forms: ['typing'] }))),
  });
const reply = (d, ok) => d.answer({ text: ok ? d.current.question.answer : 'xxxx' });
const play = (d, ok) => {
  d.ask();
  const r = reply(d, ok);
  if (d.state === 'feedback') d.next();
  return r;
};

test('Füttern statt antworten: höchstens zweimal, niemand verliert Energie', () => {
  const d = mk({ energy: 2, maxEnergy: 4 });
  d.ask();
  assert.equal(d.canFeed(), true);
  assert.equal(d.feed(2), 2);
  assert.equal(d.playerEnergy, 4);
  assert.equal(d.state, 'ready');
  d.ask();
  assert.equal(d.feed('full'), 0);
  d.ask();
  assert.equal(d.canFeed(), false);
  assert.equal(d.feed(2), 0);
  assert.equal(d.foeEnergy, 5);
});

test('Weitblick: einmal pro Frage, dieselbe Form wie Erleuchtung, auch nach verbrauchter Erleuchtung', () => {
  const d = mk({ species: 'funki' });
  assert.equal(d.canFarsight(), false); // keine offene Frage
  d.ask();
  assert.ok(d.useJoker().firstLetter);
  assert.equal(d.canFarsight(), false); // Hinweis für diese Frage schon gezeigt
  assert.equal(d.useFarsight(), null);
  reply(d, true);
  d.next();
  d.ask();
  assert.equal(d.canJoker(), false);
  assert.equal(d.canFarsight(), true);
  assert.deepEqual(d.useFarsight(), { firstLetter: d.current.question.answer.trim()[0] });
  assert.equal(d.canFarsight(), false);
  reply(d, true);
  d.next();
  d.ask();
  assert.equal(d.canFarsight(), true); // neue Frage, neuer Weitblick
});

test('Nach Weitblick gibt es für dieselbe Frage keine Erleuchtung mehr', () => {
  const d = mk({ species: 'funki' });
  d.ask();
  assert.ok(d.useFarsight());
  assert.equal(d.canJoker(), false);
});

test('Füttern geht nur, solange eine Frage offen ist', () => {
  const d = mk({ energy: 1, maxEnergy: 4 });
  assert.equal(d.canFeed(), false);
  assert.equal(d.feed('full'), 0);
  assert.equal(d.playerEnergy, 1);
  d.ask();
  assert.equal(d.feed('full'), 3);
  assert.equal(d.summary().answers.length, 0);
});

test('richtig kostet den Gegner 1, jede dritte richtige in Folge 2', () => {
  const d = mk(), rs = [play(d, true), play(d, true), play(d, true)];
  assert.deepEqual(rs.map(r => r.foeDamage), [1, 1, 2]);
  assert.deepEqual(rs.map(r => r.crit), [false, false, true]);
  assert.equal(d.foeEnergy, 1);
});

test('falsch kostet das eigene Wesen 1 und setzt die Serie zurück', () => {
  const d = mk();
  play(d, true);
  play(d, true);
  play(d, false);
  assert.equal(play(d, true).crit, false);
  assert.equal(d.playerEnergy, 3);
});

test('ab Stufe 3 Volltreffer schon nach 2', () => {
  const d = mk({ stage: 3 });
  assert.deepEqual([play(d, true), play(d, true)].map(r => r.foeDamage), [1, 2]);
});

test('Sieg und Niederlage bei 0 Energie', () => {
  const w = mk({}, { maxEnergy: 3 });
  play(w, true);
  play(w, true);
  play(w, true);
  assert.equal(w.state, 'won');
  assert.equal(w.foeEnergy, 0);
  const l = mk({ energy: 1 });
  play(l, false);
  assert.equal(l.state, 'lost');
});

test('Prüffokus: zweite Antwort auf dieselbe Frage wird ignoriert', () => {
  const d = mk();
  d.ask();
  reply(d, true);
  assert.equal(reply(d, true), null);
  assert.equal(d.foeEnergy, 4);
});

test('Flucht nur bei wilden Wesen, Aufgeben nur bei Trainern', () => {
  const w = mk();
  assert.equal(w.flee(), true);
  assert.equal(w.state, 'fled');
  const t = mk({}, {}, 'trainer');
  assert.equal(t.flee(), false);
  t.surrender();
  assert.equal(t.state, 'lost');
});

test('Nixi: +1 Energie bei 3, 6, 9 richtigen in Folge, höchstens bis zum Maximum', () => {
  const d = mk({ species: 'nixi', energy: 2 }, { maxEnergy: 20 });
  assert.deepEqual([1, 2, 3].map(() => play(d, true).healed), [0, 0, 1]);
  assert.equal(d.playerEnergy, 3);
  const full = mk({ species: 'nixi' }, { maxEnergy: 20 });
  [1, 2].forEach(() => play(full, true));
  assert.equal(play(full, true).healed, 0);
});

test('Zweite Chance ab Stufe 2: einmal, ohne Energieverlust, dieselbe Frage', () => {
  const d = mk({ stage: 2 });
  d.ask();
  const key = d.current.question.key, r = reply(d, false);
  assert.equal(r.secondChance, true);
  assert.equal(r.playerDamage, 0);
  assert.equal(d.state, 'question');
  assert.equal(d.current.question.key, key);
  assert.equal(reply(d, true).foeDamage, 1);
  d.next();
  assert.equal(play(d, false).playerDamage, 1);
});

test('Schild ab Stufe 4: erste falsche Antwort kostet nichts, danach Zweite Chance', () => {
  const d = mk({ stage: 4, energy: 7, maxEnergy: 7 });
  const r1 = play(d, false);
  assert.equal(r1.shielded, true);
  assert.equal(r1.playerDamage, 0);
  d.ask();
  assert.equal(reply(d, false).secondChance, true);
  reply(d, true);
  d.next();
  assert.equal(play(d, false).playerDamage, 1);
});

test('Funki: Joker einmal pro Duell, andere Wesen nicht', () => {
  const f = mk({ species: 'funki' });
  f.ask();
  assert.equal(f.canJoker(), true);
  assert.ok(f.useJoker().firstLetter);
  assert.equal(f.canJoker(), false);
  const k = mk();
  k.ask();
  assert.equal(k.canJoker(), false);
});

test('Flausch: Frage einmal tauschen, ohne Nachteil', () => {
  const d = mk({ species: 'flausch' });
  d.ask();
  const before = d.current.question.key;
  assert.notEqual(d.swap().question.key, before);
  assert.equal(d.playerEnergy, 4);
  assert.equal(d.streak, 0);
  assert.equal(d.canSwap(), false);
});

test('Makellos nur ohne jede falsche Antwort, summary listet jeden Versuch', () => {
  const d = mk({ stage: 2 }, { maxEnergy: 1 });
  d.ask();
  reply(d, false);
  reply(d, true);
  assert.deepEqual(d.summary(), {
    outcome: 'won',
    playerEnergy: 4,
    flawless: false,
    answers: [{ key: 'a', correct: false, trainer: 1 }, { key: 'a', correct: true, trainer: 1 }],
  });
});

test('die Zusammenfassung nennt das Thema jeder Antwort', () => {
  const d = createDuel({
    kind: 'wild',
    rng: createRng(1),
    player: { species: 'kiesel', stage: 1, energy: 4, maxEnergy: 4 },
    foe: { maxEnergy: 5 },
    deck: deckOf([q({ text: 'Z', forms: ['typing'], trainer: 3 })]),
  });
  d.ask();
  reply(d, true);
  assert.equal(d.summary().answers[0].trainer, 3);
});

// Zeitdruck (Design 7.1, 7.4): eine Uhr pro Frage.
const timed = (p = {}, ms = 1000) =>
  createDuel({
    kind: 'trainer',
    rng: createRng(1),
    timeFor: () => ms,
    player: { species: 'kiesel', stage: 1, energy: 4, maxEnergy: 4, ...p },
    foe: { maxEnergy: 5 },
    deck: deckOf(['A', 'B', 'C'].map(t => q({ text: t, forms: ['typing'] }))),
  });

test('Zeit abgelaufen: zählt als falsch, Serie weg, 1 Energie', () => {
  const d = timed();
  d.ask();
  reply(d, true);
  d.next();
  d.ask();
  assert.equal(d.timeLimit, 1000);
  assert.equal(d.tick(400), null);
  assert.equal(d.timeLeft, 600);
  const r = d.tick(700);
  assert.equal(r.correct, false);
  assert.equal(r.timedOut, true);
  assert.equal(d.timeLeft, 0);
  assert.equal(d.playerEnergy, 3);
  assert.equal(d.streak, 0);
  assert.equal(d.summary().answers.at(-1).correct, false);
  assert.equal(d.summary().flawless, false);
});

test('Die Uhr steht außerhalb einer offenen Frage', () => {
  const d = timed();
  assert.equal(d.tick(5000), null); // ready
  d.ask();
  reply(d, false); // feedback
  assert.equal(d.tick(5000), null);
  assert.equal(d.state, 'feedback');
});

test('Antwort und Zeitablauf zugleich: Es zählt nur eines', () => {
  const d = timed();
  d.ask();
  d.tick(1500);
  assert.equal(d.answer({ text: d.current.question.answer }), null);
  assert.equal(d.summary().answers.length, 1);
  const e = timed();
  e.ask();
  reply(e, true);
  assert.equal(e.tick(1500), null);
  assert.equal(e.summary().answers.length, 1);
});

test('Zeitstein hält die Uhr für diese Frage an, die nächste läuft wieder', () => {
  const d = timed();
  d.ask();
  assert.equal(d.canFreeze(), true);
  assert.equal(d.freezeTime(), true);
  assert.equal(d.frozen, true);
  assert.equal(d.tick(1e9), null);
  assert.equal(d.canFreeze(), false);
  assert.equal(d.freezeTime(), false);
  reply(d, true);
  d.next();
  d.ask();
  assert.equal(d.frozen, false);
  assert.equal(d.timeLeft, 1000);
});

test('Zweite Chance nach Zeitablauf: volle Zeit von vorn', () => {
  const d = timed({ stage: 2 });
  d.ask();
  const r = d.tick(1000);
  assert.equal(r.secondChance, true);
  assert.equal(r.timedOut, true);
  assert.equal(d.state, 'question');
  assert.equal(d.timeLeft, 1000);
});

test('Zweite Chance nach falscher Antwort: volle Zeit von vorn, ein Zeitstein bleibt wirksam', () => {
  const d = timed({ stage: 2 });
  d.ask();
  d.tick(700);
  d.freezeTime();
  reply(d, false);
  assert.equal(d.state, 'question');
  assert.equal(d.timeLeft, 1000);
  assert.equal(d.frozen, true);
  assert.equal(d.tick(5000), null);
});

test('Flausch tauscht die Frage: neue Zeit, ein Zeitstein bleibt für diesen Zug wirksam', () => {
  const d = createDuel({
    kind: 'trainer',
    rng: createRng(1),
    timeFor: p => (p.form === 'typing' ? 1500 : 1000),
    player: { species: 'flausch', stage: 1, energy: 4, maxEnergy: 4 },
    foe: { maxEnergy: 5 },
    deck: deckOf([q({ text: 'A', forms: ['choice'] }), q({ text: 'B', forms: ['typing'] })]),
  });
  d.ask();
  d.tick(400);
  d.freezeTime();
  d.swap();
  assert.equal(d.timeLimit, 1500);
  assert.equal(d.timeLeft, 1500);
  assert.equal(d.frozen, true);
});

test('Ohne Zeitdruck keine Uhr', () => {
  const d = mk();
  d.ask();
  assert.equal(d.timeLimit, null);
  assert.equal(d.timeLeft, null);
  assert.equal(d.tick(1e9), null);
  assert.equal(d.canFreeze(), false);
});

test('Solange ein Zeitstein wirkt, wird nicht gefüttert', () => {
  const d = timed();
  d.ask();
  d.freezeTime();
  assert.equal(d.canFeed(), false);
  assert.equal(d.feed(2), 0);
  assert.equal(d.state, 'question');
});
