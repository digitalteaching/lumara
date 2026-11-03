import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encodeSave, decodeSave } from '../js/save/codec.js';

test('Kodierung ist fest (nie ändern, sonst lassen sich alte Spielstände nicht mehr laden)', () => {
  assert.equal(encodeSave({ a: 1, b: 'ä' }), 'MY+9ZqEEfi3kQzeJW2YgaQ==.51f319ef');
});

test('hin und zurück, auch mit Umlauten, Emoji und großen Daten', () => {
  for (const v of [{ name: 'Jürgen 🐉' }, { big: 'x'.repeat(1_400_000) }, [1, 2, 3]]) {
    assert.deepEqual(decodeSave(encodeSave(v)), { ok: true, value: v });
  }
});

test('der Name steht nicht im Klartext darin', () => {
  const s = encodeSave({ name: 'Mia' });
  assert.ok(!s.includes('Mia'));
  assert.ok(!atob(s.split('.')[0]).includes('Mia'));
});

test('beschädigt oder verändert ergibt ok: false und nie eine Ausnahme', () => {
  const s = encodeSave({ level: 5 });
  const flipped = (s[0] === 'A' ? 'B' : 'A') + s.slice(1);
  for (const bad of [s.slice(0, -3), s.slice(0, 10), flipped, s.replace(/\.[0-9a-f]+$/, '.00000000'), '', 'Hallo', '%%%.1234abcd', null, undefined, 42]) {
    assert.deepEqual(decodeSave(bad), { ok: false });
  }
});

test('Leerraum und Zeilenumbrüche im Text stören nicht', () => {
  const s = encodeSave({ level: 5 });
  assert.deepEqual(decodeSave(`  ${s.replace(/(.{4})/g, '$1\r\n ')}\n`), { ok: true, value: { level: 5 } });
});
