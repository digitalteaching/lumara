import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseStatsForm, verifyCode } from '../js/teacher/verify.js';

const raw = { name: ' mia ', packId: 'enq9', level: '12', stage: '1', wins: '23', accuracy: '87 %', playTime: '1:35', trainers: '1', boss: false };

test('echter Prüfcode passt, auch klein, ohne Bindestrich oder mit Leerzeichen', () => {
  const r = parseStatsForm(raw);
  assert.equal(r.ok, true);
  for (const c of ['U3K-XXT', 'u3kxxt', ' U3K XXT ']) assert.deepEqual(verifyCode(r.stats, c), { ok: true, match: true });
});

test('eine geänderte Zahl passt nicht', () => {
  assert.deepEqual(verifyCode(parseStatsForm({ ...raw, wins: '24' }).stats, 'U3K-XXT'), { ok: true, match: false });
});

test('der Endgegner zählt als neunter Trainer', () => {
  assert.equal(parseStatsForm({ ...raw, trainers: '8', boss: true }).stats.trainers, 9);
});

test('Spielzeit als h:mm, h.mm oder in Minuten', () => {
  for (const [t, m] of [['1:35', 95], ['1.35', 95], ['95', 95], ['0:07', 7], [' 2:00 ', 120]]) assert.equal(parseStatsForm({ ...raw, playTime: t }).stats.minutes, m);
  assert.equal(parseStatsForm({ ...raw, playTime: '1:75' }).ok, false);
});

test('verständliche Hinweise bei falschen Eingaben', () => {
  const r = parseStatsForm({ ...raw, level: '', playTime: 'abc', packId: 'ENQ' });
  assert.equal(r.ok, false);
  assert.deepEqual(r.problems, ['Die Paketkennung hat 4 Zeichen, zum Beispiel K7PX.', 'Bitte gib das Level als Zahl ein.', 'Spielzeit bitte wie im Spiel angeben, zum Beispiel 1:05.']);
  const all = parseStatsForm({ name: ' ', packId: 'ENQ9', level: '101', stage: '5', wins: '-1', accuracy: '120', playTime: '1:00', trainers: '9', boss: false });
  assert.deepEqual(all.problems, [
    'Bitte gib den Namen ein.',
    'Bitte gib das Level als Zahl ein.',
    'Die Stufe ist eine Zahl von 1 bis 4.',
    'Bitte gib die gewonnenen Duelle als Zahl ein.',
    'Die Trefferquote ist eine Zahl von 0 bis 100.',
    'Die Zahl der besiegten Trainer ist 0 bis 8.',
  ]);
  const stats = parseStatsForm(raw).stats;
  assert.deepEqual(verifyCode(stats, 'U3K-XX'), { ok: false, problem: 'Der Prüfcode hat 6 Zeichen, zum Beispiel K7P-3QX.' });
  assert.deepEqual(verifyCode(stats, 'U3K-XX0'), { ok: false, problem: 'Im Prüfcode kommen 0, O, 1, I und L nie vor. Schau noch einmal genau hin.' });
});
