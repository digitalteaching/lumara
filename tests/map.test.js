import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMap, trainerSees, reachable } from '../js/world/map.js';
import { TEST_MAP_DEF } from './helpers/fixtures.js';

const DEF = TEST_MAP_DEF;

test('createMap liest Größe und Kacheln', () => {
  const m = createMap(DEF);
  assert.equal(m.width, 6);
  assert.equal(m.height, 5);
  assert.equal(m.tileAt(3, 1), 'tallgrass');
  assert.equal(m.isTallGrass(3, 2), true);
});

test('Bäume, Wasser, Steine, Figuren und Kartenrand blockieren', () => {
  const m = createMap(DEF);
  assert.equal(m.canEnter(0, 0), false);
  assert.equal(m.canEnter(2, 3), false);
  assert.equal(m.canEnter(3, 3), false);
  assert.equal(m.canEnter(1, 1), false);
  assert.equal(m.canEnter(-1, 2), false);
  assert.equal(m.canEnter(2, 1), true);
  assert.equal(m.canEnter(2, 1, new Set(['2,1'])), false);
});

test('Fehler nennen Karte und Zeile', () => {
  assert.throws(() => createMap({ ...DEF, rows: ['###', '#.'] }), /Test.*Zeile 2/);
  assert.throws(() => createMap({ ...DEF, rows: ['#?#'] }), /Test.*'\?'/);
});

test('Trainer sieht geradeaus bis zur Sichtweite, nicht nach hinten, nicht durch Hindernisse', () => {
  const m = createMap(DEF), t = DEF.objects[0];
  assert.equal(trainerSees(m, t, { x: 3, y: 1 }), 2);
  assert.equal(trainerSees(m, t, { x: 1, y: 2 }), null);
  assert.equal(trainerSees(m, { ...t, x: 4, y: 3, dir: 'left', sight: 4 }, { x: 1, y: 3 }), null);
});

test('reachable findet alle begehbaren Felder vom Start', () => {
  assert.equal(reachable(createMap(DEF), DEF.spawn).has('4,3'), true);
});
