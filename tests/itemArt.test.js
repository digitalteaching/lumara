import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ITEM_ART, BAG_ART, itemCanvas } from '../js/gfx/art/items.js';
import { parseSprite } from '../js/gfx/sprites.js';
import { KEY_ITEMS } from '../js/items/keys.js';
import { TREASURES } from '../js/items/treasures.js';

const IDS = ['berry', 'starfruit', 'treat', 'farsight', 'shine', 'time', ...KEY_ITEMS, ...TREASURES.map(x => x.id)];

test('Jeder Gegenstand, Schlüssel und Schatz hat ein Bild in 16 × 16', () => {
  for (const id of IDS) {
    assert.ok(ITEM_ART[id], id);
    const s = parseSprite(id, ITEM_ART[id]);
    assert.equal(s.w, 16, id);
    assert.equal(s.h, 16, id);
  }
  assert.equal(typeof itemCanvas, 'function');
});

test('Rucksackbilder in ihren Größen', () => {
  const size = name => { const s = parseSprite(name, BAG_ART[name]); return [s.w, s.h]; };
  assert.deepEqual(size('icon'), [16, 16]);
  assert.deepEqual(size('frame'), [24, 24]);
  assert.deepEqual(size('flap'), [48, 16]);
});

// border-image mit 8-px-Scheiben: Die Kanten werden wiederholt, die Mitte füllt die Fläche.
test('Rahmen: Kanten wiederholen sich nahtlos, die Mitte hat eine Farbe', () => {
  const f = BAG_ART.frame;
  for (let a = 0; a < 24; a++) {
    if (a >= 8 && a < 16) continue;
    for (let i = 8; i < 12; i++) {
      assert.equal(f[a][i], f[a][i + 4], `oben/unten Zeile ${a}, Spalte ${i}`);
      assert.equal(f[i][a], f[i + 4][a], `links/rechts Spalte ${a}, Zeile ${i}`);
    }
  }
  const middle = new Set(f.slice(8, 16).flatMap(r => [...r.slice(8, 16)]));
  assert.equal(middle.size, 1);
  assert.ok(!middle.has('.'));
});

test('Kein Bild ohne Gegenstand', () => {
  assert.equal(Object.keys(ITEM_ART).length, 36);
});

// Unbekannte Schätze kann der Rucksack als Schattenriss zeigen: Jeder hat seinen eigenen.
test('Jeder Schatz hat einen eigenen Umriss', () => {
  const shape = id => ITEM_ART[id].map(r => r.replace(/[^.]/g, '#')).join('/');
  const ids = TREASURES.map(x => x.id);
  for (const a of ids) for (const b of ids) if (a < b) assert.notEqual(shape(a), shape(b), `${a} wie ${b}`);
});
