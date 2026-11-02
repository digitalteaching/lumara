import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PALETTE, CHARS } from '../js/gfx/palette.js';
import { parseSprite, rows } from '../js/gfx/sprites.js';

test('Palette: 32 verschiedene Farben, 32 verschiedene Zeichen, kein Punkt', () => {
  assert.equal(PALETTE.length, 32);
  assert.equal(new Set(PALETTE.map(p => p.hex)).size, 32);
  assert.equal(new Set(PALETTE.map(p => p.char)).size, 32);
  assert.ok(!('.' in CHARS));
});

test('parseSprite liest Größe und Farbindizes', () => {
  const s = parseSprite('probe', ['.k', 'kc']);
  assert.equal(s.w, 2);
  assert.equal(s.h, 2);
  assert.deepEqual([...s.data], [0, CHARS.k, CHARS.k, CHARS.c]);
});

test('falsche Zeilenlänge nennt Sprite und Zeile', () => {
  assert.throws(() => parseSprite('baum', ['kk', 'k']), /baum.*Zeile 2/);
});

test('unbekanntes Zeichen wird genannt', () => {
  assert.throws(() => parseSprite('x', ['kq']), /'q'/);
});

test('rows entfernt Rand-Leerzeilen und Einrückung', () => {
  assert.deepEqual(rows('\n    .k\n    kc\n  '), ['.k', 'kc']);
});
