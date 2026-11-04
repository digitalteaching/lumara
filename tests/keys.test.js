import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hasKey, giveKey, KEY_ITEMS } from '../js/items/keys.js';
import { addItem, foodMax } from '../js/items/bag.js';
import { newGameState } from '../js/state.js';

const s0 = () => newGameState({ name: 'A', species: 'nixi', nickname: null });

test('Schlüsselgegenstände: einmal geschenkt, nie doppelt, nur bekannte', () => {
  const s = s0();
  assert.deepEqual(KEY_ITEMS, ['foodbag', 'lantern', 'hook', 'nutshell', 'skates', 'starmap']);
  assert.equal(hasKey(s, 'lantern'), false);
  assert.equal(giveKey(s, 'lantern'), true);
  assert.equal(giveKey(s, 'lantern'), false);
  assert.equal(hasKey(s, 'lantern'), true);
  assert.equal(giveKey(s, 'besen'), false);
  assert.deepEqual(s.keys, ['lantern']);
});

test('Futterbeutel: Platz für 20 statt 10 Futter', () => {
  const s = s0();
  assert.equal(foodMax(s), 10);
  assert.equal(addItem(s, 'berry', 10), 10);
  assert.equal(addItem(s, 'berry'), 0);
  giveKey(s, 'foodbag');
  assert.equal(foodMax(s), 20);
  assert.equal(addItem(s, 'starfruit', 12), 10);
  assert.equal(addItem(s, 'berry'), 0);
});
