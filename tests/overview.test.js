import { test } from 'node:test';
import assert from 'node:assert/strict';
import { packOverview } from '../js/teacher/overview.js';
import { parsePack } from '../js/pack/parser.js';
import { makePackText, fillerQuestions } from './helpers/fixtures.js';

test('Übersicht pro Trainer', () => {
  const r = parsePack(makePackText({ trainers: 2, questions: 8 }) + '=== ZETTEL ===\n' + fillerQuestions(3, 'Z'));
  const o = packOverview(r.pack);
  assert.equal(o.title, 'Testpaket');
  assert.equal(o.shortId, r.pack.shortId);
  assert.equal(o.hasKennung, true);
  assert.equal(o.notes, 3);
  assert.equal(o.boss, false);
  assert.deepEqual(o.trainers[0], { number: 1, name: 'Trainer 1', topic: 'Thema 1', questions: 8, choice: 8, typing: 8, tiles: 0 });
  assert.equal(o.trainers.length, 2);
});

test('ohne KENNUNG', () => {
  const o = packOverview(parsePack(makePackText({ kennung: null })).pack);
  assert.equal(o.hasKennung, false);
});
