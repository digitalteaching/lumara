import { test } from 'node:test';
import assert from 'node:assert/strict';
import { xpToNext, stageForLevel, maxEnergy, addXp, xpForWin } from '../js/duel/progress.js';

const total = L => {
  let s = 0;
  for (let l = 1; l < L; l++) s += xpToNext(l);
  return s;
};

test('XP-Kurve wie im Design: 665, 3315, 9440, 25740', () => {
  assert.equal(xpToNext(1), 15);
  assert.deepEqual([total(15), total(35), total(60), total(100)], [665, 3315, 9440, 25740]);
  assert.equal(xpToNext(100), 0);
});

test('Stufen ab Level 15, 35, 60', () => {
  assert.deepEqual([1, 14, 15, 34, 35, 59, 60, 100].map(stageForLevel), [1, 1, 2, 2, 3, 3, 4, 4]);
});

test('Energie 4 + Stufe + Lebenssteine (höchstens 3) + Kiesel', () => {
  assert.equal(maxEnergy({ species: 'funki', level: 1, lifeStones: 0 }), 4);
  assert.equal(maxEnergy({ species: 'kiesel', level: 1, lifeStones: 0 }), 5);
  assert.equal(maxEnergy({ species: 'kiesel', level: 60, lifeStones: 5 }), 11);
});

test('addXp über mehrere Level, Deckel bei 100', () => {
  assert.deepEqual(addXp({ level: 1, xpInLevel: 0 }, 60), { level: 4, xpInLevel: 0, levelsGained: 3, stageBefore: 1, stageAfter: 1 });
  assert.equal(addXp({ level: 14, xpInLevel: 70 }, 10).stageAfter, 2);
  assert.deepEqual(addXp({ level: 100, xpInLevel: 0 }, 999), { level: 100, xpInLevel: 0, levelsGained: 0, stageBefore: 4, stageAfter: 4 });
});

test('XP für Siege', () => {
  assert.equal(xpForWin({ kind: 'trainer', trainerNumber: 1, flawless: false }), 60);
  assert.equal(xpForWin({ kind: 'trainer', trainerNumber: 8, flawless: false }), 200);
  assert.equal(xpForWin({ kind: 'wild', area: 1, flawless: false }), 10);
  assert.equal(xpForWin({ kind: 'wild', area: 1, flawless: true }), 13);
});
