import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGameState } from '../js/state.js';
import { rollStone, findKey, findReady, takeFind, stepFind, useShine, STONE_LINES } from '../js/items/stones.js';
import { CONFIG } from '../js/config.js';

const s0 = () => newGameState({ name: 'A', species: 'nixi', nickname: null });
const seq = (...v) => {
  let i = 0;
  return { next: () => v[i++ % v.length] };
};

test('Fundwerte aus der Einstellung', () => {
  assert.deepEqual(CONFIG.finds, { stepChance: 1 / 150, respawnMs: 600000, table: { farsight: 3, shine: 2, life: 1 }, tableTimed: { farsight: 3, shine: 2, life: 1, time: 3 } });
});

test('Fundtabelle: Weitblick 3, Glanz 2, Leben 1; mit 3 Lebenssteinen kein weiterer', () => {
  assert.equal(rollStone(s0(), seq(0)), 'farsight');
  assert.equal(rollStone(s0(), seq(0.55)), 'shine');
  assert.equal(rollStone(s0(), seq(0.9)), 'life');
  const s = s0();
  s.creature.lifeStones = 3;
  assert.equal(rollStone(s, seq(0.9)), 'farsight');
});

test('Fundstelle: einmal aufheben, nach 10 Minuten Spielzeit wieder da', () => {
  assert.equal(findKey('wald', { x: 5, y: 6 }), 'wald:5,6');
  const s = s0();
  s.playMs = 0;
  assert.equal(findReady(s, 'wald:5,6'), true);
  assert.deepEqual(takeFind(s, 'wald:5,6', seq(0)), { item: 'farsight', added: 1 });
  assert.equal(s.bag.farsight, 1);
  assert.equal(findReady(s, 'wald:5,6'), false);
  s.playMs = 599999;
  assert.equal(findReady(s, 'wald:5,6'), false);
  s.playMs = 600000;
  assert.equal(findReady(s, 'wald:5,6'), true);
});

test('Ein Lebensstein wirkt sofort auf das Wesen', () => {
  const s = s0();
  assert.deepEqual(takeFind(s, 'bucht:5,7', seq(0.9)), { item: 'life', added: 1 });
  assert.equal(s.creature.lifeStones, 1);
  assert.equal(s.bag.farsight + s.bag.shine, 0);
});

test('Fund beim Schritt im Gras: 1 zu 150, landet im Rucksack', () => {
  const s = s0();
  assert.equal(stepFind(s, seq(1 / 150 - 1e-9, 0)), 'farsight');
  assert.equal(s.bag.farsight, 1);
  assert.equal(stepFind(s0(), seq(1 / 150)), null);
});

test('Glanzstein einsetzen: nur einer zugleich, nur wenn einer im Rucksack ist', () => {
  const s = s0();
  assert.equal(useShine(s), false);
  s.bag.shine = 2;
  assert.equal(useShine(s), true);
  assert.equal(s.shineActive, true);
  assert.equal(s.bag.shine, 1);
  assert.equal(useShine(s), false);
  assert.equal(s.bag.shine, 1);
});

test('Meldungen zu den Funden', () => {
  assert.equal(STONE_LINES.farsight('Nixi'), 'Du findest einen Weitblickstein!');
  assert.equal(STONE_LINES.shine('Nixi'), 'Du findest einen Glanzstein!');
  assert.equal(STONE_LINES.time('Nixi'), 'Du findest einen Zeitstein!');
  assert.equal(STONE_LINES.life('Nixi'), 'Ein Lebensstein! Nixi hat jetzt dauerhaft 1 Energie mehr.');
});

test('Fundstelle zweimal aufgehoben: beim zweiten Mal nichts', () => {
  const s = s0();
  takeFind(s, 'wald:5,6', seq(0));
  assert.deepEqual(takeFind(s, 'wald:5,6', seq(0)), { item: null, added: 0 });
  assert.equal(s.bag.farsight, 1);
});

test('Zeitsteine gibt es erst ab Gebiet 4, wo Trainer Zeitdruck haben', () => {
  assert.equal(rollStone(s0(), seq(0.95), 3), 'life');
  assert.equal(rollStone(s0(), seq(0.95), 4), 'time');
  assert.equal(rollStone(s0(), seq(0.95)), 'life'); // ohne Gebiet wie bisher
  const s = s0();
  assert.deepEqual(takeFind(s, 'duenen:5,6', seq(0.95), 4), { item: 'time', added: 1 });
  assert.equal(s.bag.time, 1);
  assert.equal(stepFind(s0(), seq(0, 0.95), 5), 'time');
});
