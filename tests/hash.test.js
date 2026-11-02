import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hash32 } from '../js/core/hash.js';

test('FNV-1a Prüfwerte', () => {
  assert.equal(hash32(''), 0x811c9dc5);
  assert.equal(hash32('a'), 0xe40c292c);
  assert.equal(hash32('englisch6-beispiel'), 473995592);
});
