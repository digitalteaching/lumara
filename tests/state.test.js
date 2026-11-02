import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGameState, validateName, packProgress } from '../js/state.js';
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

test('Fortschritt wird pro Paket angelegt und wiedergefunden', () => {
  const s = newGameState({ name: 'A', species: 'funki', nickname: null });
  packProgress(s, 'ENQ9').beaten.push(1);
  assert.deepEqual(packProgress(s, 'ENQ9').beaten, [1]);
  assert.deepEqual(packProgress(s, 'GNEP').beaten, []);
});
