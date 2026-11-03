import { test } from 'node:test';
import assert from 'node:assert/strict';
import { areaConfig, MAPS } from '../js/world/network.js';
import { BUCHT } from '../js/world/maps/bucht.js';
import { WALD } from '../js/world/maps/wald.js';

test('Gebiet, Trainer und Leuchtstein kommen aus der Karte', () => {
  assert.deepEqual(areaConfig(BUCHT), { area: 1, trainerNumber: 1, beacon: 1 });
  assert.deepEqual(areaConfig(WALD), { area: 2, trainerNumber: 2, beacon: 2 });
});

test('Jeder Trainer jeder Karte hat einen Satz nach dem Sieg (afterWin)', () => {
  for (const def of Object.values(MAPS)) for (const t of def.objects.filter(o => o.type === 'trainer')) assert.ok(t.afterWin, def.id);
});
