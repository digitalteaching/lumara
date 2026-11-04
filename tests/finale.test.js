import { test } from 'node:test';
import assert from 'node:assert/strict';
import { finaleDone } from '../js/world/finale.js';
import { newGameState } from '../js/state.js';

const s0 = () => newGameState({ name: 'A', species: 'nixi', nickname: null });

test('Ein neues Spiel steht vor dem Finale; der Zustand danach gehört dem Kind', () => {
  const s = s0();
  assert.deepEqual(s.finale, { done: false });
  assert.equal(finaleDone(s), false);
  s.finale.done = true;
  assert.equal(finaleDone(s), true);
  s.packs = {}; // ein anderes Paket ändert nichts
  assert.equal(finaleDone(s), true);
  assert.equal(finaleDone({}), false);
});
