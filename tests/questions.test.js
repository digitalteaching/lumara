import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../js/core/rng.js';
import { parsePack } from '../js/pack/parser.js';
import { questionWeight, recordAnswer, createDeck, pickForm, poolFor } from '../js/duel/questions.js';
import { q, makePackText } from './helpers/fixtures.js';

test('Gewichte: nie gestellt 2, zuletzt falsch 3, normal 1, zweimal richtig 0,5', () => {
  assert.equal(questionWeight(undefined), 2);
  assert.equal(questionWeight({ n: 3, s: 0, w: true }), 3);
  assert.equal(questionWeight({ n: 3, s: 1, w: false }), 1);
  assert.equal(questionWeight({ n: 3, s: 2, w: false }), 0.5);
});

test('recordAnswer führt Anzahl, Serie und „zuletzt falsch“', () => {
  const h = {};
  recordAnswer(h, 'k', true);
  recordAnswer(h, 'k', true);
  assert.deepEqual(h.k, { n: 2, s: 2, w: false });
  recordAnswer(h, 'k', false);
  assert.deepEqual(h.k, { n: 3, s: 0, w: true });
});

test('Deck wiederholt keine Frage, bis alle dran waren', () => {
  const qs = Array.from({ length: 6 }, (_, i) => q({ text: `F${i}` }));
  const d = createDeck(qs, {}, createRng(4));
  assert.equal(new Set(Array.from({ length: 6 }, () => d.draw().key)).size, 6);
});

test('zuletzt falsch beantwortete Fragen kommen deutlich öfter zuerst', () => {
  const qs = [q({ text: 'A' }), q({ text: 'B' })];
  const h = { a: { n: 1, s: 0, w: true }, b: { n: 1, s: 1, w: false } };
  let a = 0;
  for (let s = 0; s < 3000; s++) if (createDeck(qs, h, createRng(s)).draw().key === 'a') a++;
  assert.ok(a > 2050 && a < 2450);
});

test('dieselbe Form nie dreimal hintereinander, wenn es eine Alternative gibt', () => {
  const r = createRng(8), recent = [];
  for (let i = 0; i < 1000; i++) {
    const f = pickForm(['choice', 'typing'], recent, r);
    recent.push(f);
    if (recent.length >= 3) assert.ok(!(recent.at(-1) === recent.at(-2) && recent.at(-2) === recent.at(-3)));
  }
  assert.equal(pickForm(['tiles'], ['tiles', 'tiles'], r), 'tiles');
});

test('Pool für wilde Wesen: besiegte Themen plus das nächste, vorher nur Thema 1', () => {
  const pack = parsePack(makePackText({ trainers: 3 })).pack;
  const topics = p => new Set(p.map(x => x.text.split(' ')[0]));
  assert.deepEqual(topics(poolFor(pack, { kind: 'wild', beaten: [] })), new Set(['T1']));
  assert.deepEqual(topics(poolFor(pack, { kind: 'wild', beaten: [1] })), new Set(['T1', 'T2']));
  assert.deepEqual(topics(poolFor(pack, { kind: 'wild', beaten: [1, 2, 3] })), new Set(['T1', 'T2', 'T3']));
  assert.deepEqual(topics(poolFor(pack, { kind: 'trainer', trainerNumber: 2, beaten: [] })), new Set(['T2']));
  assert.equal(poolFor(pack, { kind: 'note', beaten: [] }).length, 8);
});
