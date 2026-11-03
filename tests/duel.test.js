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
