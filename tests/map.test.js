import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMap, trainerSees, reachable, WALKABLE, BLOCKED, TALL_GRASS } from '../js/world/map.js';
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

test('Begehbar, blockiert und hohes Gras der neuen Kacheln', () => {
  for (const k of ['peat', 'glasssand', 'cliffrock', 'bridge', 'bridgev', 'pier']) assert.ok(WALKABLE.has(k), k);
  for (const k of ['bog', 'glowshroom', 'dune', 'mirage', 'clouds', 'spire']) assert.ok(BLOCKED.has(k), k);
  for (const k of ['reed', 'dunegrass', 'windgrass']) {
    assert.ok(TALL_GRASS.has(k), k);
    assert.ok(WALKABLE.has(k), k);
  }
});

test('Ein Zierobjekt blockiert sein Feld', () => {
  const m = createMap({ ...DEF, objects: [{ type: 'deco', x: 1, y: 1, prop: 'statue', lines: ['Eine Statue.'] }] });
  assert.equal(m.canEnter(1, 1), false);
  assert.equal(m.objectAt(1, 1).prop, 'statue');
});

test('Begehbar, blockiert und hohes Gras der Kacheln 6 bis 8', () => {
  for (const k of ['cobble', 'snow', 'ice', 'nightgrass']) assert.ok(WALKABLE.has(k), k);
  for (const k of ['canal', 'ruinwall', 'icewater', 'snowpine', 'nightrock', 'nightcliff']) assert.ok(BLOCKED.has(k), k);
  for (const k of ['ivy', 'snowgrass', 'startall']) {
    assert.ok(TALL_GRASS.has(k), k);
    assert.ok(WALKABLE.has(k), k);
  }
});
