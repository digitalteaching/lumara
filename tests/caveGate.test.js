import { test } from 'node:test';
import assert from 'node:assert/strict';
import { caveGateLines, caveSocketLights } from '../js/world/caveGate.js';
import { CAVE_SOCKETS } from '../js/gfx/art/tiles.js';
import { CONFIG } from '../js/config.js';

test('Höhlentor: die Zahl der leuchtenden Fassungen, bei acht „entsteht gerade“', () => {
  assert.deepEqual(caveGateLines(0), ['Ein großes Tor im Berg mit acht Fassungen.', 'Keine davon leuchtet.', 'Vielleicht öffnet es sich, wenn alle acht Leuchtsteine wieder leuchten.']);
  assert.equal(caveGateLines(1)[1], 'Eine davon leuchtet.');
  assert.equal(caveGateLines(5)[1], '5 davon leuchten.');
  assert.equal(caveGateLines(7)[2], 'Vielleicht öffnet es sich, wenn alle acht Leuchtsteine wieder leuchten.');
  assert.deepEqual(caveGateLines(8), ['Ein großes Tor im Berg mit acht Fassungen.', 'Alle acht Fassungen leuchten. Das Tor öffnet sich, sobald deine Lehrkraft alle acht Themen freigibt.']);
});

test('Höhlentor: Jeder entzündete Stein lässt seine Fassung in der Farbe seines Rings leuchten', () => {
  assert.deepEqual(caveSocketLights([]), []);
  assert.deepEqual(caveSocketLights([3, 1]), [
    { x: CAVE_SOCKETS[0][0], y: CAVE_SOCKETS[0][1], color: CONFIG.beacons.ringColors[0] },
    { x: CAVE_SOCKETS[2][0], y: CAVE_SOCKETS[2][1], color: CONFIG.beacons.ringColors[2] },
  ]);
  assert.equal(caveSocketLights([1, 2, 3, 4, 5, 6, 7, 8]).length, 8);
  assert.equal(new Set(caveSocketLights([1, 2, 3, 4, 5, 6, 7, 8]).map(s => s.color)).size, 8);
});
