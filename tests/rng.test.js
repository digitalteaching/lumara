import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../js/core/rng.js';

test('gleicher Seed ergibt gleiche Folge', () => {
  const a = createRng(42), b = createRng(42);
  for (let i = 0; i < 100; i++) assert.equal(a.next(), b.next());
});

test('int trifft beide Grenzen und nichts außerhalb', () => {
  const r = createRng(1), seen = new Set();
  for (let i = 0; i < 5000; i++) {
    const v = r.int(8, 25);
    assert.ok(v >= 8 && v <= 25);
    seen.add(v);
  }
  assert.equal(seen.size, 18);
});

test('shuffle lässt das Original unverändert', () => {
  const arr = [1, 2, 3, 4, 5], s = createRng(7).shuffle(arr);
  assert.deepEqual(arr, [1, 2, 3, 4, 5]);
  assert.deepEqual([...s].sort(), [1, 2, 3, 4, 5]);
});

test('weighted bevorzugt das höhere Gewicht', () => {
  const r = createRng(3);
  let a = 0;
  for (let i = 0; i < 4000; i++) if (r.weighted(['a', 'b'], x => (x === 'a' ? 3 : 1)) === 'a') a++;
  assert.ok(a > 2800 && a < 3200);
});
