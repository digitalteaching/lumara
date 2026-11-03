import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDateTime, formatDate, isoDate, formatPlayTime } from '../js/ui/format.js';

test('Datum, Uhrzeit und Spielzeit', () => {
  const t = new Date(2026, 10, 3, 9, 5).getTime();
  assert.equal(formatDateTime(t), '03.11.2026, 09:05');
  assert.equal(formatDate(t), '03.11.2026');
  assert.equal(isoDate(t), '2026-11-03');
  assert.equal(formatPlayTime(0), '0:00');
  assert.equal(formatPlayTime(95 * 60000 + 59000), '1:35');
  assert.equal(formatPlayTime(600 * 60000), '10:00');
});
