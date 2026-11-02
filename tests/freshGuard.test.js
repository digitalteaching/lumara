import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFreshGuard } from '../js/ui/freshGuard.js';

test('Prüffokus Doppeltipp: frisch erschienene Knöpfe nehmen 350 ms lang nichts an', () => {
  let now = 1000;
  const guard = createFreshGuard(350, () => now);
  assert.equal(guard.isFresh(), true);
  now = 1349;
  assert.equal(guard.isFresh(), true);
  now = 1350;
  assert.equal(guard.isFresh(), false);
  guard.reset();
  assert.equal(guard.isFresh(), true);
});
