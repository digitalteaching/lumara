import { test } from 'node:test';
import assert from 'node:assert/strict';
import { areaConfig } from '../js/world/network.js';
import { BUCHT } from '../js/world/maps/bucht.js';
import { WALD } from '../js/world/maps/wald.js';

test('Gebiet, Trainer und Leuchtstein kommen aus der Karte', () => {
  assert.deepEqual(areaConfig(BUCHT), { area: 1, trainerNumber: 1, beacon: 1 });
  assert.deepEqual(areaConfig(WALD), { area: 2, trainerNumber: 2, beacon: 2 });
});
