import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shortId, packIdentity } from '../js/pack/packId.js';

test('Kurzform: 4 Zeichen ohne 0 O 1 I L, stabil', () => {
  assert.equal(shortId('englisch6-beispiel'), 'ENQ9');
  assert.equal(shortId('englisch6-unit1-4'), 'GNEP');
  assert.match(shortId('irgendwas'), /^[2-9A-HJKMNP-Z]{4}$/);
});

test('Identität: KENNUNG gewinnt, sonst Inhalt ohne Kommentare und Leerzeilen', () => {
  assert.equal(packIdentity('x', 'abc'), 'abc');
  assert.equal(packIdentity('# k\n\nPAKET: A\n  FACH: B  \n', null), packIdentity('PAKET: A\nFACH: B', null));
});
