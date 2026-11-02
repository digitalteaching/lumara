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
