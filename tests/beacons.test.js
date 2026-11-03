import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lightStone, visitStone, travelTargets, respawnPoint, challengeMark } from '../js/world/beacons.js';
import { beaconFront } from '../js/world/network.js';
import { BUCHT } from '../js/world/maps/bucht.js';
import { WALD } from '../js/world/maps/wald.js';
import { newGameState, packProgress } from '../js/state.js';

const pack = n => ({ shortId: 'ENQ9', trainers: Array.from({ length: n }, (_, i) => ({ number: i + 1 })) });
const s0 = () => newGameState({ name: 'A', species: 'nixi', nickname: null });

test('Stein entzünden: einmal neu, merkt sich den letzten Stein', () => {
  const s = s0();
  assert.equal(lightStone(s, 1), true);
  assert.equal(lightStone(s, 1), false);
  assert.deepEqual(s.stones, [1]);
  assert.equal(s.lastStone, 1);
  visitStone(s, 2);
  assert.equal(s.lastStone, 1); // Stein 2 leuchtet noch nicht
});

test('Reiseziele: nur entzündete Steine in offenen Gebieten', () => {
  const s = s0();
  lightStone(s, 1);
  lightStone(s, 2);
  assert.deepEqual(travelTargets(s, pack(2)).map(t => t.number), [1, 2]);
  assert.deepEqual(travelTargets(s, pack(1)).map(t => t.number), [1]); // Wald liegt mit diesem Paket im Nebel
  assert.equal(travelTargets(s, pack(2))[1].name, 'Flüsterwald');
  assert.equal(travelTargets(s, pack(2))[0].map, 'bucht');
});

test('Aufwachen nach Niederlage: am zuletzt besuchten Stein, sonst am Leuchtturm', () => {
  const s = s0();
  assert.deepEqual(respawnPoint(s, pack(2)), { map: 'bucht', ...BUCHT.respawn });
  lightStone(s, 1);
  lightStone(s, 2);
  assert.deepEqual(respawnPoint(s, pack(2)), { map: 'wald', ...beaconFront(WALD, 2) });
  visitStone(s, 1);
  assert.deepEqual(respawnPoint(s, pack(2)), { map: 'bucht', ...beaconFront(BUCHT, 1) });
  s.lastStone = 2;
  assert.deepEqual(respawnPoint(s, pack(1)), { map: 'bucht', ...BUCHT.respawn });
});

test('Zeichen „neue Herausforderung“', () => {
  const s = s0();
  lightStone(s, 1);
  assert.equal(challengeMark(s, pack(2), 1), true);
  packProgress(s, 'ENQ9').beaten.push(1);
  assert.equal(challengeMark(s, pack(2), 1), false);
  assert.equal(challengeMark(s, pack(2), 2), false);
});
