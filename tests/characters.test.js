import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSprite } from '../js/gfx/sprites.js';
import { CHARACTERS } from '../js/gfx/art/characters.js';
import { BUCHT } from '../js/world/maps/bucht.js';
import { WALD } from '../js/world/maps/wald.js';

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

test('jede Figur des Waldes hat Bilder; Bewohner und Bäume haben echte Texte, auch für die Zeit danach', () => {
  for (const o of WALD.objects.filter(o => o.type === 'npc' || o.type === 'trainer')) assert.ok(CHARACTERS[o.sprite], o.sprite);
  for (const o of WALD.objects.filter(o => o.type === 'npc')) {
    assert.ok(o.lines.length >= 2 && o.lines.length <= 3, o.id);
    assert.ok(o.linesLit?.length >= 1 && o.linesLit.length <= 2, `${o.id}: linesLit`);
  }
  for (const o of WALD.objects.filter(o => o.type === 'whisper')) assert.ok(o.lines.length >= 2 && o.lines.length <= 3, o.id);
  for (const o of [...WALD.objects, ...BUCHT.objects].filter(o => o.lines || o.linesLit)) {
    for (const l of [...(o.lines ?? []), ...(o.linesLit ?? [])]) {
      assert.ok(l.length <= 100, l);
      assert.ok(!/psst/.test(l), `Platzhalter: ${l}`);
      assert.ok(!/Morrow/.test(l), `Morrows Name kommt erst später: ${l}`);
    }
  }
  for (const id of ['ilvy', 'bram', 'pim', 'oda']) assert.ok(BUCHT.objects.find(o => o.id === id).linesLit?.length >= 1, id);
});

test('jede Figur der Bucht hat Bilder und Text, jede Zeile höchstens 100 Zeichen', () => {
  for (const o of BUCHT.objects.filter(o => o.type === 'npc' || o.type === 'trainer')) assert.ok(CHARACTERS[o.sprite], o.sprite);
  for (const o of BUCHT.objects.filter(o => o.lines)) {
    assert.ok(o.lines.length >= 1);
    for (const l of o.lines) assert.ok(l.length <= 100, l);
  }
});
