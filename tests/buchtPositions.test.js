import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMap } from '../js/world/map.js';
import { BUCHT } from '../js/world/maps/bucht.js';
import { BUCHT_0_4 } from './fixtures/bucht-0.4.js';

// Wie migrate.canStand: alle Tore offen
const open = def => createMap(def, { openGates: (def.gates ?? []).map(g => g.id) });

test('Jedes Feld, auf dem man in der Bucht von 0.4 stehen konnte, ist weiter begehbar', () => {
  const before = open(BUCHT_0_4), now = open(BUCHT);
  const lost = [];
  for (let y = 0; y < before.height; y++) for (let x = 0; x < before.width; x++) {
    if (before.canEnter(x, y) && !now.canEnter(x, y)) lost.push([x, y]);
  }
  assert.deepEqual(lost, []);
});
