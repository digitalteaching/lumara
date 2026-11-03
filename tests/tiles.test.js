import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSprite } from '../js/gfx/sprites.js';
import { TILES, BUILDINGS, PROPS } from '../js/gfx/art/tiles.js';
import { WALKABLE, BLOCKED } from '../js/world/map.js';

test('jede Kachelart hat Bilder zu 16 × 16', () => {
  for (const kind of [...WALKABLE, ...BLOCKED]) {
    assert.ok(TILES[kind]?.length, kind);
    TILES[kind].forEach((f, i) => {
      const s = parseSprite(`${kind}.${i}`, f);
      assert.equal(s.w, 16);
      assert.equal(s.h, 16);
    });
  }
});

test('Gebäude und Gegenstände haben ihre Größe', () => {
  const size = { lighthouse: [32, 64], house: [48, 48], houseTeal: [48, 48], housePlum: [48, 48], boat: [32, 16] };
  for (const [id, [w, h]] of Object.entries(size)) {
    const s = parseSprite(id, BUILDINGS[id]);
    assert.equal(s.w, w, id);
    assert.equal(s.h, h, id);
  }
  assert.equal(parseSprite('sign', PROPS.sign).w, 16);
});

test('Gegenstände der Welt aus Plan 3a haben ihre Größe', () => {
  const size = { bush: [16, 16], bushEmpty: [16, 16], noteStone: [16, 16], noteStoneDone: [16, 16], beaconDark: [16, 32], beaconLit: [16, 32], oldtree: [16, 32] };
  for (const [id, [w, h]] of Object.entries(size)) {
    const s = parseSprite(id, PROPS[id]);
    assert.equal(s.w, w, id);
    assert.equal(s.h, h, id);
  }
  assert.equal(TILES.fern.length, 2);
});

test('Kacheln der Gebiete 3 bis 5: 16 × 16, bekannte Farben, richtige Bildzahl', () => {
  const frames = { peat: 1, reed: 2, bog: 2, glowshroom: 1, glasssand: 1, dunegrass: 2, dune: 1, mirage: 2, cliffrock: 1, windgrass: 2, clouds: 2, bridge: 1, bridgev: 1, spire: 1 };
  for (const [k, n] of Object.entries(frames)) {
    assert.equal(TILES[k].length, n, k);
    TILES[k].forEach((f, i) => {
      const s = parseSprite(`${k}.${i}`, f); // wirft bei unbekannten Farben
      assert.equal(s.w, 16, k);
      assert.equal(s.h, 16, k);
    });
  }
  for (const [k, h] of Object.entries({ bigshroom: 32, statue: 32, glasstower: 48, windmill0: 32, windmill1: 32 })) {
    const s = parseSprite(k, PROPS[k]);
    assert.equal(s.w, 16, k);
    assert.equal(s.h, h, k);
  }
  assert.notDeepEqual(PROPS.windmill0, PROPS.windmill1); // die Flügel stehen anders
});
