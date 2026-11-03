import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMap, reachable, cellKey, step } from '../js/world/map.js';
import { MOOR } from '../js/world/maps/moor.js';
import { beaconFront } from '../js/world/network.js';

const NEAR = [[0, 1], [0, -1], [1, 0], [-1, 0]];

test('Moor: 40 × 30, Gebiet 3, alles Wichtige ist vom Eingang aus erreichbar', () => {
  const m = createMap(MOOR, { openGates: [] });
  const r = reachable(m, MOOR.spawn);
  assert.equal(m.width, 40);
  assert.equal(m.height, 30);
  assert.equal(MOOR.area, 3);
  const nextTo = (x, y) => NEAR.some(([dx, dy]) => r.has(cellKey(x + dx, y + dy)));
  for (const o of MOOR.objects.filter(o => o.id !== 'irrlichtinsel')) assert.ok(nextTo(o.x, o.y), `${o.type} ${o.id ?? o.number}`);
  for (const f of MOOR.finds) assert.ok(r.has(cellKey(f.x, f.y)) && m.isTallGrass(f.x, f.y), `Fundstelle ${f.id}`);
  assert.ok(MOOR.objects.some(o => o.type === 'trainer' && o.number === 3 && o.afterWin));
  assert.ok(MOOR.objects.some(o => o.type === 'beacon' && o.number === 3));
  const npcs = MOOR.objects.filter(o => o.type === 'npc');
  assert.ok(npcs.length >= 2 && npcs.length <= 4);
  for (const n of npcs) assert.ok(n.lines.length && n.linesLit.length, n.id);
  assert.ok(MOOR.objects.filter(o => o.type === 'notestone').length >= 3);
  assert.ok(MOOR.objects.filter(o => o.type === 'bush').length >= 2);
  assert.ok(MOOR.objects.filter(o => o.type === 'deco' && o.prop === 'bigshroom').length >= 4);
  assert.equal(MOOR.finds.length, 3);
  assert.ok([...r].filter(k => m.isTallGrass(...k.split(',').map(Number))).length >= 12);
  assert.ok(MOOR.objects.some(o => o.type === 'sign' && !o.role));
  assert.ok(MOOR.objects.some(o => o.type === 'sign' && o.role === 'fogEdge' && o.leadsTo === 4 && o.gate === 3 && o.leadsToPlural));
  assert.deepEqual(MOOR.particles, ['spore', 'bubble', 'wisp']);
});

test('Moor: Aufwachpunkt vor dem Leuchtstein, Hüterin blickt über den Steg, Stein nicht in ihrem Blick', () => {
  const m = createMap(MOOR);
  assert.deepEqual(MOOR.respawn, beaconFront(MOOR, 3));
  assert.ok(m.canEnter(MOOR.spawn.x, MOOR.spawn.y));
  const t = MOOR.objects.find(o => o.type === 'trainer');
  const seen = [];
  let p = { x: t.x, y: t.y };
  for (let i = 0; i < t.sight; i++) {
    p = step(p, t.dir);
    if (!m.canEnter(p.x, p.y)) break;
    seen.push(p);
  }
  assert.ok(seen.some(c => m.tileAt(c.x, c.y) === 'pier'), 'die Hüterin sieht den Steg');
  const b = beaconFront(MOOR, 3);
  assert.ok(!seen.some(c => c.x === b.x && c.y === b.y));
});

test('Moor: Die Irrlichtinsel ist zu sehen, aber nicht erreichbar', () => {
  const m = createMap(MOOR, { openGates: ['nord'] });
  const r = reachable(m, MOOR.spawn);
  const isle = MOOR.objects.find(o => o.id === 'irrlichtinsel');
  assert.ok(isle);
  assert.ok(!NEAR.some(([dx, dy]) => r.has(cellKey(isle.x + dx, isle.y + dy))));
});

test('Moor: Spieltexte sind kurz und nennen Morrow nicht', () => {
  for (const o of MOOR.objects) {
    for (const l of [...(o.lines ?? []), ...(o.linesLit ?? []), ...(o.linesOpen ?? []), ...(o.afterWin ? [o.afterWin] : [])]) {
      assert.ok(l.length <= 90, l);
      assert.equal(/morrow/i.test(l), false, l);
    }
  }
});
