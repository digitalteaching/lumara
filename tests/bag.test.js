import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addItem, takeItem, foodCount } from '../js/items/bag.js';
import { newGameState } from '../js/state.js';

const s0 = () => newGameState({ name: 'Mia', species: 'nixi', nickname: null });

test('Futter passt höchstens zu zehnt in den Rucksack, Steine ohne Grenze', () => {
  const s = s0();
  assert.equal(addItem(s, 'berry', 8), 8);
  assert.equal(addItem(s, 'starfruit', 3), 2);
  assert.equal(addItem(s, 'berry'), 0);
  assert.equal(foodCount(s.bag), 10);
  assert.equal(addItem(s, 'farsight', 5), 5);
  assert.equal(s.bag.farsight, 5);
});

test('Lebensstein wirkt sofort, höchstens dreimal', () => {
  const s = s0();
  const e = s.creature.energy;
  assert.equal(addItem(s, 'life', 2), 2);
  assert.equal(s.creature.lifeStones, 2);
  assert.equal(s.creature.energy, e + 2);
  assert.equal(addItem(s, 'life', 5), 1);
  assert.equal(s.creature.lifeStones, 3);
});

test('Gegenstand nehmen', () => {
  const s = s0();
  addItem(s, 'berry');
  assert.equal(takeItem(s, 'berry'), true);
  assert.equal(takeItem(s, 'berry'), false);
  assert.equal(s.bag.berry, 0);
});
