import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STORY } from '../js/data/story.js';

test('Geschichte: Gebiet 1 und 2 haben je 3 Stücke, jedes 60 bis 240 Zeichen', () => {
  assert.deepEqual(Object.keys(STORY), ['1', '2']);
  for (const pieces of Object.values(STORY)) {
    assert.equal(pieces.length, 3);
    for (const t of pieces) assert.ok(t.length >= 60 && t.length <= 240, t);
  }
});

test('Morrows Name kommt erst später vor', () => {
  for (const t of Object.values(STORY).flat()) assert.equal(/morrow/i.test(t), false, t);
});

test('Das erste Stück der Bucht steht genau so da', () => {
  assert.equal(STORY[1][0], 'Vor langer Zeit trugen die Menschen von Lumara alles, was sie lernten, zu den acht Leuchtsteinen. Je mehr sie wussten, desto heller leuchteten die Steine.');
});
