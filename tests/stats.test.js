import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTeacherStats } from '../js/teacher/stats.js';
import { newGameState, packProgress } from '../js/state.js';
import { speciesName } from '../js/data/species.js';

test('Statistik für die Lehrkraft', () => {
  const s = newGameState({ name: 'Mia', species: 'nixi', nickname: 'Blubb' });
  s.creature.level = 12;
  const p = packProgress(s, 'ENQ9');
  p.beaten = [1];
  Object.assign(p.stats, { wins: 23, right: 87, total: 100, playMs: 95 * 60000 + 59000, topics: { 1: { right: 80, total: 90 }, 2: { right: 7, total: 10 } } });
  const pack = { title: 'Englisch 6', shortId: 'ENQ9', trainers: [{ number: 1, topic: 'Simple present' }, { number: 2, topic: 'Present progressive' }] };
  const t = buildTeacherStats(s, pack);
  assert.equal(t.name, 'Mia');
  assert.equal(t.accuracy, 87);
  assert.equal(t.playTime, '1:35');
  assert.equal(t.minutes, 95);
  assert.equal(t.trainersBeaten, 1);
  assert.equal(t.trainerCount, 2);
  assert.equal(t.boss, false);
  assert.deepEqual(t.topics, [
    { number: 1, topic: 'Simple present', accuracy: 89, total: 90 },
    { number: 2, topic: 'Present progressive', accuracy: 70, total: 10 },
  ]);
  assert.deepEqual(t.creature, { name: 'Blubb', species: speciesName('nixi', 1), level: 12, stage: 1 });
  assert.deepEqual(t.pack, { title: 'Englisch 6', shortId: 'ENQ9' });
  assert.equal(t.code, 'U3K-XXT');
});

test('ohne Antworten: 0 %, Themen ohne Antworten mit null', () => {
  const s = newGameState({ name: 'Ben', species: 'funki', nickname: null });
  const t = buildTeacherStats(s, { title: 'X', shortId: 'GNEP', trainers: [{ number: 1, topic: 'A' }] });
  assert.equal(t.accuracy, 0);
  assert.equal(t.playTime, '0:00');
  assert.equal(t.topics[0].accuracy, null);
  assert.equal(t.floor, 0);
  assert.equal(t.code, '2PY-BBQ');
});

test('besiegte Trainer zählen nur, wenn das Paket sie enthält', () => {
  const s = newGameState({ name: 'Ben', species: 'funki', nickname: null });
  packProgress(s, 'GNEP').beaten = [1, 2];
  const t = buildTeacherStats(s, { title: 'X', shortId: 'GNEP', trainers: [{ number: 1, topic: 'A' }] });
  assert.equal(t.trainersBeaten, 1);
});
