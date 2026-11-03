import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGameState, packProgress, recordNoteAnswer } from '../js/state.js';
import { parsePack } from '../js/pack/parser.js';
import { notePool, noteKey, noteReady, solveNote, storyFound } from '../js/world/notes.js';
import { STORY } from '../js/data/story.js';
import { CONFIG } from '../js/config.js';
import { xpToNext } from '../js/duel/progress.js';
import { makePackText, fillerQuestions } from './helpers/fixtures.js';

const s0 = () => newGameState({ name: 'A', species: 'nixi', nickname: null });
const seq = (...v) => {
  let i = 0;
  return { next: () => v[i++ % v.length] };
};

test('Zettelwerte aus der Einstellung', () => {
  assert.deepEqual(CONFIG.notes, {
    xp: 15,
    rewardChance: 0.5,
    refillMs: 600000,
    rewards: { berry: 3, starfruit: 1, farsight: 2, shine: 1, life: 1 },
    rewardsTimed: { berry: 3, starfruit: 1, farsight: 2, shine: 1, life: 1, time: 2 },
  });
});

test('Zettel ohne ZETTEL-Abschnitt nehmen Fragen wie wilde Wesen', () => {
  const r = parsePack(makePackText({ trainers: 2 })).pack;
  assert.deepEqual(notePool(r, []).map(q => q.trainer), Array(8).fill(1));
  const withNotes = parsePack(makePackText({ trainers: 1 }) + '=== ZETTEL ===\n' + fillerQuestions(2, 'Z')).pack;
  assert.equal(notePool(withNotes, []).length, 2);
});

test('falsch: nichts, der Zettel bleibt liegen', () => {
  assert.equal(noteKey('bucht', { x: 3, y: 12 }), 'bucht:3,12');
  const s = s0();
  s.playMs = 0;
  assert.deepEqual(solveNote(s, 'bucht:3,12', 1, false, seq(0)), { xp: 0, item: null, lost: null, story: null, evolved: false });
  assert.equal(noteReady(s, 'bucht:3,12'), true);
  assert.equal(s.creature.xpInLevel, 0);
});

test('richtig: 15 XP, das nächste Geschichtsstück, mit 50 % ein Gegenstand, nach 10 Minuten neu', () => {
  const s = s0();
  s.playMs = 0;
  const a = solveNote(s, 'bucht:3,12', 1, true, seq(0.4, 0));
  assert.equal(a.xp, 15);
  assert.equal(a.item, 'berry');
  assert.equal(s.bag.berry, 1);
  assert.equal(a.story, STORY[1][0]);
  assert.deepEqual([s.creature.level, s.creature.xpInLevel], [2, 0]); // Level 1 braucht genau 15 XP
  assert.equal(noteReady(s, 'bucht:3,12'), false);
  const b = solveNote(s, 'bucht:4,12', 1, true, seq(0.6));
  assert.equal(b.item, null);
  assert.equal(b.story, STORY[1][1]);
  solveNote(s, 'bucht:5,12', 1, true, seq(0.6));
  assert.equal(solveNote(s, 'bucht:6,12', 1, true, seq(0.6)).story, null); // nur 3 Stücke je Gebiet
  s.playMs = 599999;
  assert.equal(noteReady(s, 'bucht:3,12'), false);
  s.playMs = 600000;
  assert.equal(noteReady(s, 'bucht:3,12'), true);
  assert.deepEqual(storyFound(s).map(x => x.index), [0, 1, 2]);
});

test('Geschichte: nach Gebiet geordnet, Gebiete ohne Text zählen nicht', () => {
  const s = s0();
  s.story = { 2: 1, 1: 2 };
  assert.deepEqual(storyFound(s).map(x => [x.area, x.index]), [[1, 0], [1, 1], [2, 0]]);
  assert.equal(storyFound(s)[2].text, STORY[2][0]);
  assert.equal(solveNote(s, 'irgendwo:1,1', 9, true, seq(0.6)).story, null); // ein Gebiet ohne Geschichte
});

test('Ein Lebensstein als Belohnung wird zum Weitblickstein, wenn schon 3 wirken; was nicht passt, wird nicht gemeldet', () => {
  const s = s0();
  s.creature.lifeStones = 3;
  assert.equal(solveNote(s, 'bucht:1,1', 1, true, seq(0, 0.99)).item, 'farsight');
  s.bag.berry = 10;
  assert.equal(solveNote(s, 'bucht:2,1', 1, true, seq(0, 0)).item, null);
  assert.equal(s.bag.berry, 10);
});

test('Zettelantwort zählt in Statistik und Historie, aber nicht als Sieg', () => {
  const s = s0();
  recordNoteAnswer(s, 'ENQ9', { key: 'z frage 1', correct: true, trainer: null });
  const p = packProgress(s, 'ENQ9');
  assert.equal(p.stats.total, 1);
  assert.equal(p.stats.right, 1);
  assert.equal(p.stats.wins, 0);
  assert.equal(p.history['z frage 1'].n, 1);
});

test('Zettel zweimal gelöst (Doppeltipp): Nur das erste Mal zählt', () => {
  const s = s0();
  s.playMs = 0;
  solveNote(s, 'bucht:3,12', 1, true, seq(0.6));
  assert.deepEqual(solveNote(s, 'bucht:3,12', 1, true, seq(0.6)), { xp: 0, item: null, lost: null, story: null, evolved: false });
  assert.equal(s.story[1], 1);
});

test('Belohnung bei vollem Rucksack wird gemeldet, nicht verschluckt', () => {
  const s = s0();
  s.bag.berry = 10;
  const r = solveNote(s, 'bucht:1,1', 1, true, seq(0, 0));
  assert.equal(r.item, null);
  assert.equal(r.lost, 'berry');
});

test('Zettel-XP lassen das Wesen sich entwickeln: evolved', () => {
  const s = s0();
  s.creature.level = 14;
  s.creature.xpInLevel = xpToNext(14) - 5;
  assert.equal(solveNote(s, 'bucht:1,1', 1, true, seq(0.6)).evolved, true);
  assert.equal(solveNote(s, 'bucht:2,1', 1, true, seq(0.6)).evolved, false);
});

test('Zettel ab Gebiet 4 können einen Zeitstein bringen', () => {
  const s = s0();
  assert.equal(solveNote(s, 'duenen:1,1', 4, true, seq(0, 0.95)).item, 'time');
  assert.equal(s.bag.time, 1);
  assert.equal(solveNote(s0(), 'moor:1,1', 3, true, seq(0, 0.95)).item, 'life'); // in Gebiet 3 noch die alte Tabelle
});

test('Zettel mit ZEITDRUCK: aus bringen keinen Zeitstein', () => {
  assert.equal(solveNote(s0(), 'duenen:1,1', 4, true, seq(0, 0.95), 'aus').item, 'life');
});
