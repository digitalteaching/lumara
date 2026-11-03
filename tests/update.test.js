import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isNewer } from '../js/app/update.js';

test('Versionen vergleichen', () => {
  assert.ok(isNewer('0.2.1', '0.2.0'));
  assert.ok(isNewer('0.10.0', '0.9.9'));
  assert.ok(isNewer('1.0.0', '0.99.99'));
  assert.ok(!isNewer('0.2.0', '0.2.0'));
  assert.ok(!isNewer('0.1.9', '0.2.0'));
  assert.ok(!isNewer('kaputt', '0.2.0'));
  assert.ok(!isNewer(undefined, '0.2.0'));
});
