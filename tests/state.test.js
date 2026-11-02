import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGameState, validateName, packProgress, applyDuelResult } from '../js/state.js';
import { BUCHT } from '../js/world/maps/bucht.js';

test('neues Spiel: Level 1, volle Energie, Start am Steg', () => {
  const s = newGameState({ name: 'Mia', species: 'kiesel', nickname: null });
  assert.equal(s.version, 1);
  assert.equal(s.creature.level, 1);
  assert.equal(s.creature.xpInLevel, 0);
  assert.equal(s.creature.energy, 5);
  assert.deepEqual(s.position, { map: 'bucht', ...BUCHT.spawn });
});

test('Namen: nach dem Kürzen 1 bis 12 Zeichen', () => {
  assert.deepEqual(validateName('  Mia '), { ok: true, value: 'Mia' });
  assert.deepEqual(validateName('   '), { ok: false, message: 'Bitte gib einen Namen ein.' });
  assert.deepEqual(validateName('Maximilian-Jo'), { ok: false, message: 'Höchstens 12 Zeichen.' });
  assert.equal(validateName('Zoë🦊').ok, true);
});

const won = (answers = [{ key: 'a', correct: true }]) => ({ outcome: 'won', playerEnergy: 2, flawless: true, answers });
const T1 = { kind: 'trainer', area: 1, foe: { species: 'haeuschel', stage: 2, level: 7, maxEnergy: 5 }, trainer: { number: 1 }, pool: [] };

test('Trainersieg: XP, Level, besiegt, Energie bleibt', () => {
  const s = newGameState({ name: 'A', species: 'funki', nickname: null });
  const r = applyDuelResult(s, 'ENQ9', T1, { ...won(), flawless: false });
  assert.equal(r.xp, 60);
  assert.equal(s.creature.level, 4);
  assert.equal(s.creature.xpInLevel, 0);
  assert.equal(s.creature.energy, 2);
  assert.deepEqual(packProgress(s, 'ENQ9').beaten, [1]);
  assert.deepEqual(packProgress(s, 'ENQ9').history.a, { n: 1, s: 1, w: false });
});

test('Makelloser Trainersieg gibt 75 XP', () => {
  const s = newGameState({ name: 'A', species: 'funki', nickname: null });
  assert.equal(applyDuelResult(s, 'ENQ9', T1, won()).xp, 75);
  assert.equal(s.creature.xpInLevel, 15);
});

test('Niederlage: keine XP, volle Energie, Historie trotzdem', () => {
  const s = newGameState({ name: 'A', species: 'kiesel', nickname: null });
  const r = applyDuelResult(s, 'ENQ9', T1, { outcome: 'lost', playerEnergy: 0, flawless: false, answers: [{ key: 'b', correct: false }] });
  assert.equal(r.xp, 0);
  assert.equal(s.creature.energy, 5);
  assert.deepEqual(packProgress(s, 'ENQ9').beaten, []);
  assert.equal(packProgress(s, 'ENQ9').history.b.w, true);
});

test('Flucht: keine XP, Energie wie im Duell', () => {
  const s = newGameState({ name: 'A', species: 'funki', nickname: null });
  applyDuelResult(s, 'ENQ9', { ...T1, kind: 'wild' }, { outcome: 'fled', playerEnergy: 1, flawless: true, answers: [] });
  assert.equal(s.creature.energy, 1);
  assert.equal(s.creature.level, 1);
});

test('Fortschritt wird pro Paket angelegt und wiedergefunden', () => {
  const s = newGameState({ name: 'A', species: 'funki', nickname: null });
  packProgress(s, 'ENQ9').beaten.push(1);
  assert.deepEqual(packProgress(s, 'ENQ9').beaten, [1]);
  assert.deepEqual(packProgress(s, 'GNEP').beaten, []);
});
