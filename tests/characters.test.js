import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSprite } from '../js/gfx/sprites.js';
import { CHARACTERS } from '../js/gfx/art/characters.js';
import { BUCHT } from '../js/world/maps/bucht.js';

test('alle Figurenbilder sind 16 × 16 und lesbar', () => {
  for (const [id, dirs] of Object.entries(CHARACTERS)) {
    for (const [d, frames] of Object.entries(dirs)) {
      frames.forEach((f, i) => {
        const s = parseSprite(`${id}.${d}.${i}`, f);
        assert.equal(s.w, 16);
        assert.equal(s.h, 16);
      });
    }
  }
  for (const d of ['down', 'up', 'side']) assert.equal(CHARACTERS.player[d].length, 2);
});

test('jede Figur der Bucht hat Bilder und Text, jede Zeile höchstens 100 Zeichen', () => {
  for (const o of BUCHT.objects.filter(o => o.type === 'npc' || o.type === 'trainer')) assert.ok(CHARACTERS[o.sprite], o.sprite);
  for (const o of BUCHT.objects.filter(o => o.lines)) {
    assert.ok(o.lines.length >= 1);
    for (const l of o.lines) assert.ok(l.length <= 100, l);
  }
});
