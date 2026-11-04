import { test } from 'node:test';
import assert from 'node:assert/strict';
import { finaleDone, finishFinale } from '../js/world/finale.js';
import { resolveStart } from '../js/world/network.js';
import { BUCHT } from '../js/world/maps/bucht.js';
import { HOEHLE2 } from '../js/world/maps/hoehle2.js';
import { newGameState } from '../js/state.js';
import { textIn } from '../js/i18n/i18n.js';
import { DE } from '../js/i18n/de.js';
import { EN } from '../js/i18n/en.js';

const s0 = () => newGameState({ name: 'A', species: 'nixi', nickname: null });
const pack = n => ({ trainers: Array.from({ length: n }, (_, i) => ({ number: i + 1 })) });

test('Ein neues Spiel steht vor dem Finale; der Zustand danach gehört dem Kind', () => {
  const s = s0();
  assert.deepEqual(s.finale, { done: false });
  assert.equal(finaleDone(s), false);
  s.finale.done = true;
  assert.equal(finaleDone(s), true);
  s.packs = {}; // ein anderes Paket ändert nichts
  assert.equal(finaleDone(s), true);
  assert.equal(finaleDone({}), false);
});

test('Das Finale wird genau einmal erledigt', () => {
  const s = s0();
  assert.equal(finishFinale(s), true);
  assert.equal(finaleDone(s), true);
  assert.equal(finishFinale(s), false);
});

test('Wer in der Höhle steht und ein Paket ohne alle acht Trainer lädt, startet am Leuchtturm', () => {
  const s = { ...s0(), stones: [1, 2, 3, 4, 5, 6, 7, 8], position: { map: 'hoehle2', ...HOEHLE2.spawn } };
  assert.deepEqual(resolveStart(s, pack(3)), { map: 'bucht', ...BUCHT.respawn });
  assert.deepEqual(resolveStart(s, pack(8)), s.position);
});

test('Die Texte des Endduells und des Finales gibt es auf Deutsch und Englisch', () => {
  for (const key of ['boss.hello', 'boss.phase', 'boss.tired', 'boss.lost', 'finale.ask', 'finale.sayName', 'finale.after']) {
    assert.ok(textIn('de', key) && textIn('en', key), key);
  }
  assert.deepEqual([DE['boss.hello'].length, EN['boss.hello'].length, DE['finale.after'].length, EN['finale.after'].length], [3, 3, 3, 3]);
  assert.ok(textIn('de', 'finale.sayName').includes('Morrow'));
});
