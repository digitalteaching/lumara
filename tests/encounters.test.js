import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../js/core/rng.js';
import { nextThreshold, createEncounterCounter, pickWild, wildLevel } from '../js/world/encounters.js';

test('Schwellen zwischen 8 und 25, im Mittel 14 bis 16', () => {
  const r = createRng(5);
  let sum = 0;
  for (let i = 0; i < 20000; i++) {
    const t = nextThreshold(r);
    assert.ok(t >= 8 && t <= 25);
    sum += t;
  }
  assert.ok(sum / 20000 >= 14 && sum / 20000 <= 16);
});

test('nur Grasschritte zählen, nie zwei Begegnungen unter 8 Grasschritten', () => {
  const c = createEncounterCounter(createRng(9));
  let since = 0;
  for (let i = 0; i < 5000; i++) {
    assert.equal(c.onStep(false), false);
    since++;
    if (c.onStep(true)) {
      assert.ok(since >= 8);
      since = 0;
    }
  }
});

test('seltene Art in etwa 10 % der Fälle', () => {
  const r = createRng(2);
  let rare = 0;
  for (let i = 0; i < 10000; i++) if (pickWild({ common: ['a', 'b'], rare: 'c' }, r) === 'c') rare++;
  assert.ok(rare > 800 && rare < 1200);
});

test('angezeigtes Level wilder Wesen passt zum Gebiet', () => {
  const r = createRng(4);
  for (let i = 0; i < 500; i++) {
    const l = wildLevel(1, r);
    assert.ok(l >= 2 && l <= 5);
  }
});
