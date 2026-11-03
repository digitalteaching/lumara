import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGameState } from '../js/state.js';
import { addItem } from '../js/items/bag.js';
import { foodEnergy, eat, bushKey, bushReady, harvest, duelLoot } from '../js/items/food.js';
import { CONFIG } from '../js/config.js';

const s0 = (species = 'nixi') => newGameState({ name: 'A', species, nickname: null });

test('Futterwerte aus der Einstellung', () => {
  assert.deepEqual(CONFIG.food, { berry: 2, berryPieks: 4, bushRegrowMs: 300000, wildDropChance: 0.2, pieksFindChance: 0.5, maxFeedPerDuel: 2 });
});

test('Beere +2, bei Pieks +4, Sternfrucht füllt ganz auf, nicht über das Maximum', () => {
  assert.equal(foodEnergy('nixi', 'berry'), 2);
  assert.equal(foodEnergy('pieks', 'berry'), 4);
  assert.equal(foodEnergy('nixi', 'starfruit'), 'full');
  const s = s0();
  s.creature.energy = 1;
  addItem(s, 'berry', 2);
  assert.deepEqual(eat(s, 'berry'), { ok: true, gained: 2 });
  assert.equal(s.creature.energy, 3);
  assert.deepEqual(eat(s, 'berry'), { ok: true, gained: 1 });
  assert.equal(s.creature.energy, 4);
  addItem(s, 'berry');
  assert.deepEqual(eat(s, 'berry'), { ok: false, gained: 0 });
  assert.equal(s.bag.berry, 1);
});

test('Sternfrucht füllt ganz auf; ohne Futter im Rucksack wird nichts gegessen', () => {
  const s = s0();
  s.creature.energy = 1;
  assert.deepEqual(eat(s, 'starfruit'), { ok: false, gained: 0 });
  addItem(s, 'starfruit');
  assert.deepEqual(eat(s, 'starfruit'), { ok: true, gained: 3 });
  assert.equal(s.creature.energy, 4);
  assert.equal(s.bag.starfruit, 0);
});

test('Strauch: ernten, nach 5 Minuten Spielzeit wieder voll, voller Rucksack lässt die Beere hängen', () => {
  assert.equal(bushKey('bucht', { x: 6, y: 13 }), 'bucht:6,13');
  const s = s0();
  s.playMs = 1000;
  assert.equal(harvest(s, 'bucht:6,13'), 'ok');
  assert.equal(s.bag.berry, 1);
  assert.equal(harvest(s, 'bucht:6,13'), 'empty');
  s.playMs = 1000 + 299999;
  assert.equal(bushReady(s, 'bucht:6,13'), false);
  s.playMs = 1000 + 300000;
  assert.equal(bushReady(s, 'bucht:6,13'), true);
  addItem(s, 'berry', 20);
  assert.equal(harvest(s, 'bucht:6,13'), 'full');
  assert.equal(bushReady(s, 'bucht:6,13'), true);
});

test('Beute nach dem Duell', () => {
  const always = { next: () => 0 };
  const never = { next: () => 0.99 };
  assert.deepEqual(duelLoot(s0(), { kind: 'wild' }, always), ['berry']);
  assert.deepEqual(duelLoot(s0('pieks'), { kind: 'wild' }, always), ['berry', 'berry']);
  assert.deepEqual(duelLoot(s0('pieks'), { kind: 'trainer' }, always), ['berry']);
  assert.deepEqual(duelLoot(s0(), { kind: 'trainer' }, always), []);
  assert.deepEqual(duelLoot(s0(), { kind: 'wild' }, never), []);
});
