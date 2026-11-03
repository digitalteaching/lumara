import { test } from 'node:test';
import assert from 'node:assert/strict';
import { questionTimeMs, timerFor } from '../js/duel/timing.js';
import { CONFIG } from '../js/config.js';

const t = (trainerNumber, form = 'choice', setting = 'normal', species = 'nixi') => questionTimeMs({ trainerNumber, form, setting, species });

test('Zeitwerte aus der Einstellung', () => {
  assert.deepEqual(CONFIG.time, { fromArea: 4, typing: 1.5, tiles: 2, long: 2, flausch: 0.25, lowShare: 0.25 });
});

test('Trainer 4: 40 s, Eintippen 60 s, Satzbau 80 s', () => {
  assert.equal(t(4), 40000);
  assert.equal(t(4, 'typing'), 60000);
  assert.equal(t(4, 'tiles'), 80000);
});

test('Trainer 1 bis 3, wilde Wesen und ZEITDRUCK: aus haben keine Uhr', () => {
  for (const n of [1, 2, 3]) assert.equal(t(n), null);
  assert.equal(t(null), null);
  assert.equal(t(5, 'tiles', 'aus'), null);
});

test('ZEITDRUCK: lang verdoppelt, Flausch bekommt 25 % mehr, beides zusammen', () => {
  assert.equal(t(5, 'choice', 'lang'), 70000);
  assert.equal(t(4, 'choice', 'normal', 'flausch'), 50000);
  assert.equal(t(4, 'tiles', 'lang', 'flausch'), 200000);
  assert.equal(t(8, 'typing'), 30000);
});

test('timerFor: Uhr nur mit setup.time', () => {
  assert.equal(timerFor({ kind: 'wild' }, 'nixi')({ form: 'choice' }), null);
  assert.equal(timerFor({ kind: 'trainer', time: { trainerNumber: 4, setting: 'normal' } }, 'nixi')({ form: 'typing' }), 60000);
  assert.equal(timerFor({ kind: 'trainer', time: { trainerNumber: 4, setting: 'lang' } }, 'flausch')({ form: 'choice' }), 100000);
});
