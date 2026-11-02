import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPackStore } from '../js/pack/store.js';

const fake = () => {
  const m = new Map();
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) };
};

test('speichert, lädt und löscht den Paket-Text', () => {
  const s = createPackStore(fake());
  assert.equal(s.load(), null);
  assert.equal(s.save('PAKET: A'), true);
  assert.equal(s.load(), 'PAKET: A');
  s.clear();
  assert.equal(s.load(), null);
});

test('kaputter oder fehlender Speicher bricht nichts', () => {
  const bad = {
    getItem() { throw new Error('SecurityError'); },
    setItem() { throw new Error('QuotaExceededError'); },
    removeItem() { throw new Error('x'); },
  };
  const s = createPackStore(bad);
  assert.equal(s.load(), null);
  assert.equal(s.save('x'), false);
  s.clear();
  assert.equal(createPackStore(undefined).load(), null);
});
