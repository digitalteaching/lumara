import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FRIENDABLE } from '../js/friends/friends.js';
import { miniFrames, miniRows } from '../js/gfx/art/minis.js';
import { parseSprite } from '../js/gfx/sprites.js';

const opaque = rows => rows.join('').replace(/\./g, '').length;

test('Jede befreundbare Art hat zwei Kleinbilder in 16 × 16', () => {
  for (const id of FRIENDABLE) {
    const frames = miniFrames(id);
    assert.equal(frames.length, 2);
    frames.forEach((rows, i) => {
      const s = parseSprite(`${id}:${i}`, rows);
      assert.equal(s.w, 16, id);
      assert.equal(s.h, 16, id);
    });
    assert.deepEqual(miniRows(id), frames[0]);
  }
});

test('Hüpfbild: dasselbe Bild einen Pixel höher, nichts abgeschnitten', () => {
  for (const id of FRIENDABLE) {
    const [stand, hop] = miniFrames(id);
    for (let y = 0; y < 15; y++) assert.equal(hop[y], stand[y + 1], `${id} Zeile ${y}`);
    assert.equal(hop[15], '.'.repeat(16), id);
    assert.equal(opaque(hop), opaque(stand), id);
  }
});

test('Glanzform tauscht Farben, der Umriss bleibt', () => {
  const marks = rows => rows.map(r => [...r].map(c => (c === 'k' ? 'k' : '.')).join(''));
  for (const id of FRIENDABLE) {
    const a = miniFrames(id);
    const b = miniFrames(id, { shiny: true });
    for (let i = 0; i < 2; i++) assert.deepEqual(marks(a[i]), marks(b[i]), id);
  }
});

test('Kleinbilder sind erkennbar verschieden', () => {
  const seen = new Map();
  for (const id of FRIENDABLE) {
    const key = miniRows(id).join('\n');
    assert.ok(!seen.has(key), `${id} gleicht ${seen.get(key)}`);
    seen.set(key, id);
  }
});
