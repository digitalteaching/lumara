import { test } from 'node:test';
import assert from 'node:assert/strict';
import { drawArena, ARENAS } from '../js/gfx/arena.js';
import { stubContext } from './helpers/fixtures.js';

test('Arenen für die Gebiete 1 bis 5 lassen sich zeichnen, 2 bis 5 haben eine eigene', () => {
  const ctx = stubContext();
  for (const a of [1, 2, 3, 4, 5]) assert.doesNotThrow(() => drawArena(ctx, a, 0, false), `${a}`);
  for (const a of [2, 3, 4, 5]) assert.equal(typeof ARENAS[a], 'function', `${a}`);
  assert.equal(new Set([2, 3, 4, 5].map(a => ARENAS[a])).size, 4);
});

test('Bei „Bewegung reduzieren“ stehen die Arenen still', () => {
  for (const a of [1, 2, 3, 4, 5]) {
    const early = stubContext();
    const late = stubContext();
    drawArena(early, a, 0, true);
    drawArena(late, a, 5432, true);
    assert.deepEqual(late.calls, early.calls, `${a}`);
  }
});
