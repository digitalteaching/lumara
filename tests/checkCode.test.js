import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkCode, formatCode, normalizeCodeInput } from '../js/teacher/checkCode.js';

const base = { name: 'Mia', packId: 'ENQ9', level: 12, stage: 1, wins: 23, accuracy: 87, minutes: 95, trainers: 1 };

test('Prüfcode ist fest (nie ändern, sonst passen ausgegebene Codes nicht mehr)', () => {
  assert.equal(checkCode(base), 'U3KXXT');
  assert.equal(checkCode({ name: 'Ben', packId: 'GNEP', level: 1, stage: 1, wins: 0, accuracy: 0, minutes: 0, trainers: 0 }), '2PYBBQ');
});

test('Name und Kennung: Schreibweise egal', () => {
  assert.equal(checkCode({ ...base, name: '  mIa ' }), 'U3KXXT');
  assert.equal(checkCode({ ...base, packId: 'enq9' }), 'U3KXXT');
});

test('jede einzelne Zahl ändert den Code', () => {
  const codes = ['level', 'stage', 'wins', 'accuracy', 'minutes', 'trainers'].map(k => checkCode({ ...base, [k]: base[k] + 1 }));
  assert.equal(new Set([...codes, 'U3KXXT']).size, 7);
  assert.notEqual(checkCode({ ...base, name: 'Mio' }), 'U3KXXT');
});

test('nur Zeichen ohne Verwechslungsgefahr, Anzeige mit Bindestrich', () => {
  assert.match(checkCode(base), /^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/);
  assert.equal(formatCode('U3KXXT'), 'U3K-XXT');
  assert.equal(normalizeCodeInput(' u3k-xxt '), 'U3KXXT');
});
