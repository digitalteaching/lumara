import { test } from 'node:test';
import assert from 'node:assert/strict';
import { whisperLine, npcLines } from '../js/world/network.js';

test('flüsternde Bäume sagen ihre Zeilen der Reihe nach', () => {
  const o = { lines: ['a', 'b'] };
  assert.deepEqual([0, 1, 2].map(i => whisperLine(o, i)), ['a', 'b', 'a']);
});

test('Bewohner sagen etwas anderes, sobald der Stein leuchtet', () => {
  const o = { lines: ['vorher'], linesLit: ['nachher'] };
  const s = { stones: [2] };
  assert.deepEqual(npcLines(o, s, 2), ['nachher']);
  assert.deepEqual(npcLines(o, { stones: [] }, 2), ['vorher']);
  assert.deepEqual(npcLines({ lines: ['x'] }, s, 2), ['x']);
});
