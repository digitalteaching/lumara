import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPlayClock } from '../js/save/playClock.js';

test('zählt nur, solange in den letzten 2 Minuten etwas eingegeben wurde', () => {
  const c = createPlayClock({ idleMs: 120000, maxStepMs: 1000 });
  assert.equal(c.step(0, true), 0);
  c.activity(0);
  let sum = 0;
  for (let t = 1000; t <= 200000; t += 1000) sum += c.step(t, true);
  assert.equal(sum, 120000);
});

test('zählt nicht, solange das Spiel unsichtbar ist', () => {
  const c = createPlayClock();
  c.activity(0);
  c.step(0, true);
  assert.equal(c.step(1000, false), 0);
  assert.equal(c.step(2000, true), 1000);
});

test('eine lange Pause zählt höchstens einen Schritt', () => {
  const c = createPlayClock({ maxStepMs: 1000 });
  c.activity(0);
  c.step(0, true);
  c.activity(600000);
  assert.ok(c.step(600000, true) <= 1000);
});
