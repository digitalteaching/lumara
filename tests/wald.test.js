import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMap, reachable, cellKey, step } from '../js/world/map.js';
import { WALD } from '../js/world/maps/wald.js';
import { beaconFront } from '../js/world/network.js';

test('Wald: 40 × 30, Gebiet 2, alles Wichtige ist vom Eingang aus erreichbar', () => {
  const m = createMap(WALD, { openGates: [] });
  const r = reachable(m, WALD.spawn);
  assert.equal(m.width, 40);
  assert.equal(m.height, 30);
  assert.equal(WALD.area, 2);
  const nextTo = (x, y) => [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => r.has(cellKey(x + dx, y + dy)));
  for (const o of WALD.objects.filter(o => o.type !== 'building')) assert.ok(nextTo(o.x, o.y), `${o.type} ${o.id ?? o.number}`);
  for (const f of WALD.finds) assert.ok(r.has(cellKey(f.x, f.y)) && m.isTallGrass(f.x, f.y), `Fundstelle ${f.id}`);
  assert.ok(WALD.objects.some(o => o.type === 'trainer' && o.number === 2));
  assert.ok(WALD.objects.some(o => o.type === 'beacon' && o.number === 2));
  const npcs = WALD.objects.filter(o => o.type === 'npc').length;
  assert.ok(npcs >= 2 && npcs <= 4);
  assert.ok(WALD.objects.filter(o => o.type === 'whisper').length >= 3);
  assert.ok(WALD.objects.filter(o => o.type === 'notestone').length >= 3);
  assert.ok(WALD.objects.some(o => o.type === 'bush'));
  assert.ok([...r].filter(k => m.isTallGrass(...k.split(',').map(Number))).length >= 12);
  assert.ok(WALD.objects.some(o => o.type === 'sign' && o.role === 'fogEdge' && o.leadsTo === 3 && o.gate === 2));
});

test('Wald: Aufwachpunkt vor dem Leuchtstein, Start am Eingang, der Waldläufer blickt über den Weg', () => {
  const m = createMap(WALD);
  assert.deepEqual(WALD.respawn, beaconFront(WALD, 2));
  assert.ok(m.canEnter(WALD.spawn.x, WALD.spawn.y));
  assert.ok(m.canEnter(WALD.respawn.x, WALD.respawn.y));
  const t = WALD.objects.find(o => o.type === 'trainer');
  let p = { x: t.x, y: t.y };
  let pathSeen = false;
  for (let i = 0; i < t.sight; i++) {
    p = step(p, t.dir);
    if (!m.canEnter(p.x, p.y)) break;
    if (m.tileAt(p.x, p.y) === 'path') pathSeen = true;
  }
  assert.ok(pathSeen, 'der Waldläufer sieht den Weg');
});

test('Wald: der Leuchtstein liegt nicht im Blickfeld des Waldläufers', () => {
  const t = WALD.objects.find(o => o.type === 'trainer');
  const b = beaconFront(WALD, 2);
  const seen = [];
  let p = { x: t.x, y: t.y };
  for (let i = 0; i < t.sight; i++) seen.push(cellKey(...Object.values((p = step(p, t.dir)))));
  assert.ok(!seen.includes(cellKey(b.x, b.y)));
});
