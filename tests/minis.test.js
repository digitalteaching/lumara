import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FRIENDABLE } from '../js/friends/friends.js';
import { miniFrames, miniRows } from '../js/gfx/art/minis.js';
import { parseSprite } from '../js/gfx/sprites.js';
import { CREATURE_ART } from '../js/gfx/art/creatures.js';

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

// Die Laterne der Eisflosse sitzt hinten in der Rückenflosse, nicht als Licht über dem Kopf (rechts).
test('Eisflosse: Laterne mit dunklem Rahmen hinten in der Flosse, weit weg vom Kopf', () => {
  for (const rows of [miniRows('eisflosse'), CREATURE_ART.eisflosse[1]]) {
    const n = rows.length;
    const cells = ch => rows.flatMap((r, y) => [...r].flatMap((c, x) => (c === ch ? [{ x, y }] : [])));
    const light = cells('H'), frame = cells('n');
    assert.ok(frame.length >= 8 && light.length >= 4, `${n}: Rahmen ${frame.length}, Licht ${light.length}`);
    // Der Rahmen schließt das Licht ein (oben, unten, links, rechts) und liegt in der hinteren Hälfte.
    const box = { x0: Math.min(...frame.map(c => c.x)), x1: Math.max(...frame.map(c => c.x)), y0: Math.min(...frame.map(c => c.y)), y1: Math.max(...frame.map(c => c.y)) };
    assert.ok(box.x1 < n / 2, `${n}: Rahmen bis x ${box.x1}`);
    const inside = light.filter(c => c.x > box.x0 && c.x < box.x1 && c.y > box.y0 && c.y < box.y1);
    assert.ok(inside.length >= 4, `${n}: Licht im Rahmen ${inside.length}`);
  }
});
