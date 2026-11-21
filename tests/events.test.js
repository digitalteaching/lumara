import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGameState, applyDuelResult, recordNoteAnswer } from '../js/state.js';
import { CONFIG } from '../js/config.js';
import { emit } from '../js/world/events.js';
import { solveNote } from '../js/world/notes.js';
import { addTreasure } from '../js/items/treasures.js';
import { makeFriend } from '../js/friends/friends.js';
import { hideoutsOn, openCreature, openFind } from '../js/world/hideouts.js';

const s0 = () => newGameState({ name: 'A', species: 'nixi', nickname: null });
const seq = (...v) => {
  let i = 0;
  return { next: () => v[i++ % v.length] };
};

test('emit hängt an und kappt bei maxEvents', () => {
  const s = s0();
  emit(s, 'answer', { correct: true });
  emit(s, 'wildWin');
  assert.deepEqual(s.events, [{ type: 'answer', correct: true }, { type: 'wildWin' }]);
  for (let i = 0; i < CONFIG.board.maxEvents + 20; i++) emit(s, 'visit', { area: 1 + (i % 8) });
  assert.equal(s.events.length, CONFIG.board.maxEvents);
  assert.ok(s.events.every(e => e.type === 'visit'));
  assert.equal(s.events.at(-1).area, 1 + ((CONFIG.board.maxEvents + 19) % 8));
  delete s.events; // ein alter Stand im Speicher ohne Liste
  emit(s, 'note');
  assert.deepEqual(s.events, [{ type: 'note' }]);
});

test('applyDuelResult meldet Antworten in Reihenfolge und den Sieg über ein wildes Wesen', () => {
  const answers = [{ key: 'a', correct: false }, { key: 'b', correct: true }, { key: 'c', correct: true }];
  const s = s0();
  applyDuelResult(s, 'ENQ9', { kind: 'wild', area: 1 }, { outcome: 'won', playerEnergy: 2, flawless: false, answers });
  assert.deepEqual(s.events, [
    { type: 'answer', correct: false }, { type: 'answer', correct: true }, { type: 'answer', correct: true }, { type: 'wildWin' },
  ]);
  const t = s0();
  applyDuelResult(t, 'ENQ9', { kind: 'wild', area: 1 }, { outcome: 'lost', playerEnergy: 0, flawless: false, answers: [answers[0]] });
  applyDuelResult(t, 'ENQ9', { kind: 'trainer', area: 1, trainer: { number: 1 } }, { outcome: 'won', playerEnergy: 2, flawless: true, answers: [answers[1]] });
  assert.deepEqual(t.events, [{ type: 'answer', correct: false }, { type: 'answer', correct: true }]); // kein wildWin
  const u = s0();
  recordNoteAnswer(u, 'ENQ9', { key: 'z', correct: true, trainer: null });
  assert.deepEqual(u.events, [{ type: 'answer', correct: true }]);
});

test('Zettel, Schatz, neuer Freund und Versteck melden sich; Aufwertung und leerer Zettel nicht', () => {
  const s = s0();
  assert.deepEqual(solveNote(s, 'bucht:3,12', 1, false, seq(0)).xp, 0);
  assert.deepEqual(s.events, []); // falsch
  solveNote(s, 'bucht:3,12', 1, true, seq(0.4, 0));
  assert.deepEqual(s.events, [{ type: 'note' }]);
  solveNote(s, 'bucht:3,12', 1, true, seq(0.4, 0)); // Zettel noch leer
  assert.deepEqual(s.events, [{ type: 'note' }]);

  const t = s0();
  addTreasure(t, 'nope');
  addTreasure(t, 'acorncap', 0);
  assert.deepEqual(t.events, []);
  addTreasure(t, 'acorncap');
  assert.deepEqual(t.events, [{ type: 'treasure' }]);

  const f = s0();
  makeFriend(f, 'gischtling', false);
  assert.deepEqual(f.events, [{ type: 'befriend', area: 1 }]);
  makeFriend(f, 'gischtling', true); // Aufwertung zur Glanzform
  makeFriend(f, 'gischtling', false);
  assert.deepEqual(f.events, [{ type: 'befriend', area: 1 }]);

  const h = s0();
  const find = hideoutsOn('wald').find(x => x.kind === 'find');
  const creature = hideoutsOn('wald').find(x => x.kind === 'creature');
  openFind(h, find, 2, false, seq(0));
  assert.deepEqual(h.events, []); // falsch
  openFind(h, find, 2, true, seq(0.99, 0));
  assert.equal(h.events.filter(e => e.type === 'hideout').length, 1);
  openFind(h, find, 2, true, seq(0.99, 0)); // schon leer
  assert.equal(h.events.filter(e => e.type === 'hideout').length, 1);
  assert.ok(openCreature(h, creature));
  assert.equal(h.events.filter(e => e.type === 'hideout').length, 2);
  assert.equal(openCreature(h, creature), null);
  assert.equal(h.events.filter(e => e.type === 'hideout').length, 2);
});
