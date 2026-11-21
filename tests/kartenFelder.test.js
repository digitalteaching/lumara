import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cellKey, createMap } from '../js/world/map.js';
import { BUCHT } from '../js/world/maps/bucht.js';
import { WALD } from '../js/world/maps/wald.js';
import { MOOR } from '../js/world/maps/moor.js';
import { DUENEN } from '../js/world/maps/duenen.js';
import { KLIPPEN } from '../js/world/maps/klippen.js';
import { RUINEN } from '../js/world/maps/ruinen.js';
import { SEE } from '../js/world/maps/see.js';
import { WIESE } from '../js/world/maps/wiese.js';
import { KARTEN_1_1 } from './fixtures/karten-1.1.js';

// Wie migrate.canStand: alle Tore offen
const open = def => createMap(def, { openGates: (def.gates ?? []).map(g => g.id) });

test('Jedes Feld, auf dem man in 1.1 stehen konnte, ist weiter begehbar', () => {
  const defs = [BUCHT, WALD, MOOR, DUENEN, KLIPPEN, RUINEN, SEE, WIESE];
  assert.deepEqual(Object.keys(KARTEN_1_1).sort(), defs.map(d => d.id).sort());
  for (const def of defs) {
    const now = open(def);
    assert.ok(KARTEN_1_1[def.id].length > 300, def.id);
    const lost = KARTEN_1_1[def.id].filter(k => {
      const [x, y] = k.split(',').map(Number);
      return !now.canEnter(x, y);
    });
    assert.deepEqual(lost, [], def.id);
  }
});

// Keine neuen Wege (Lumara 1.2): Verstecke und Spielaufgaben liegen auf Feldern, die schon vorher
// Hindernisse waren. Wird unter einem Teil einer Aufgabe Boden daraus, belegt das Teil das Feld.
test('Keine neuen Wege: Auf den Gebietskarten kann man nur dort stehen, wo man in 1.1 stand', () => {
  for (const def of [BUCHT, WALD, MOOR, DUENEN, KLIPPEN, RUINEN, SEE, WIESE]) {
    const m = open(def);
    const old = new Set(KARTEN_1_1[def.id]);
    const extra = [];
    for (let y = 0; y < m.height; y++) for (let x = 0; x < m.width; x++) if (m.canEnter(x, y) && !old.has(cellKey(x, y))) extra.push(cellKey(x, y));
    assert.deepEqual(extra, [], def.id);
  }
});
