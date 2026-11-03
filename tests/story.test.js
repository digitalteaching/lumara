import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STORY } from '../js/data/story.js';

test('Geschichte: Gebiet 1 bis 6 haben je 3 Stücke, jedes 60 bis 240 Zeichen', () => {
  assert.deepEqual(Object.keys(STORY), ['1', '2', '3', '4', '5', '6']);
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

test('Das erste Stück des Pilzmoors steht genau so da', () => {
  assert.equal(STORY[3][0], 'Im Moor leuchten die Pilze, damit sich niemand verirrt. Früher stellten die Leute Laternen auf die Stege und sangen dabei Lieder über das Licht.');
});

test('Das erste Stück der Spiegeldünen steht genau so da', () => {
  assert.equal(STORY[4][0], 'Die Dünen waren einmal ein weiter Strand. Der Sand wurde zu Glas, als der Leuchtstein hier so hell strahlte wie die Mittagssonne.');
});

test('Das erste Stück der Windklippen steht genau so da', () => {
  assert.equal(STORY[5][0], 'Auf den Klippen drehen sich die Windräder schon seit hundert Jahren. Früher trug der Wind Nachrichten von einem Gebiet zum nächsten.');
});

test('Das erste Stück der Uhrwerkruinen steht genau so da', () => {
  assert.equal(STORY[6][0], 'In der Stadt der Zahnräder bauten die Leute Uhren, die sich alles merkten. Jede Uhr schlug einmal, wenn jemand etwas Neues gelernt hatte.');
});
