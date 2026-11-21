import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMap, reachable, cellKey, step, WALKABLE } from '../js/world/map.js';
import { KLIPPEN } from '../js/world/maps/klippen.js';
import { beaconFront } from '../js/world/network.js';

const NEAR = [[0, 1], [0, -1], [1, 0], [-1, 0]];

test('Klippen: 40 × 30, Gebiet 5, alles Wichtige ist vom Eingang aus erreichbar', () => {
  const m = createMap(KLIPPEN, { openGates: [] });
  const r = reachable(m, KLIPPEN.spawn);
  assert.equal(m.width, 40);
  assert.equal(m.height, 30);
  assert.equal(KLIPPEN.area, 5);
  const nextTo = (x, y) => NEAR.some(([dx, dy]) => r.has(cellKey(x + dx, y + dy)));
  for (const o of KLIPPEN.objects) assert.ok(nextTo(o.x, o.y), `${o.type} ${o.id ?? o.number}`);
  for (const f of KLIPPEN.finds) assert.ok(r.has(cellKey(f.x, f.y)) && m.isTallGrass(f.x, f.y), `Fundstelle ${f.id}`);
  assert.ok(KLIPPEN.objects.some(o => o.type === 'trainer' && o.number === 5 && o.afterWin));
  const npcs = KLIPPEN.objects.filter(o => o.type === 'npc');
  assert.ok(npcs.length >= 2 && npcs.length <= 4);
  for (const n of npcs) assert.ok(n.lines.length && n.linesLit.length, n.id);
  assert.ok(KLIPPEN.objects.filter(o => o.type === 'notestone').length >= 3);
  assert.ok(KLIPPEN.objects.filter(o => o.type === 'bush').length >= 2);
  assert.ok([...r].filter(k => m.isTallGrass(...k.split(',').map(Number))).length >= 12);
  assert.ok(KLIPPEN.objects.some(o => o.type === 'sign' && o.role === 'fogEdge' && o.leadsTo === 6 && o.gate === 5 && o.leadsToPlural));
  assert.deepEqual(KLIPPEN.particles, ['windstreak', 'cloud']);
});

test('Klippen: Aufwachpunkt vor dem Leuchtstein, Skye blickt über die Brücke, Stein nicht in ihrem Blick', () => {
  const m = createMap(KLIPPEN);
  assert.deepEqual(KLIPPEN.respawn, beaconFront(KLIPPEN, 5));
  assert.ok(m.canEnter(KLIPPEN.spawn.x, KLIPPEN.spawn.y));
  const t = KLIPPEN.objects.find(o => o.type === 'trainer');
  const seen = [];
  let p = { x: t.x, y: t.y };
  for (let i = 0; i < t.sight; i++) {
    p = step(p, t.dir);
    if (!m.canEnter(p.x, p.y)) break;
    seen.push(p);
  }
  assert.ok(seen.some(c => m.tileAt(c.x, c.y) === 'bridge'), 'Skye sieht die Brücke');
  const b = beaconFront(KLIPPEN, 5);
  assert.ok(!seen.some(c => c.x === b.x && c.y === b.y));
});

test('Klippen: Die Plattformen mit Leuchtstein, Skye und den Bewohnern dahinter erreicht man nur über Brücken', () => {
  const withBridges = createMap(KLIPPEN);
  const r = reachable(withBridges, KLIPPEN.spawn);
  const bridges = [];
  for (let y = 0; y < 30; y++) for (let x = 0; x < 40; x++) if (['bridge', 'bridgev'].includes(withBridges.tileAt(x, y))) bridges.push([x, y]);
  assert.ok(bridges.length >= 10);
  for (const [x, y] of bridges) {
    assert.ok(WALKABLE.has(withBridges.tileAt(x, y)));
    assert.ok(r.has(cellKey(x, y)), `Brücke ${x},${y}`);
  }
  // Ohne Brücken: nur noch die Eingangsplattform
  const legend = { ...KLIPPEN.legend, '-': 'clouds', '|': 'clouds' };
  const noBridges = createMap({ ...KLIPPEN, legend });
  const rr = reachable(noBridges, KLIPPEN.spawn);
  const near = o => NEAR.some(([dx, dy]) => rr.has(cellKey(o.x + dx, o.y + dy)));
  for (const o of KLIPPEN.objects.filter(o => ['beacon', 'trainer'].includes(o.type) || ['ina', 'tamo'].includes(o.id))) {
    assert.equal(near(o), false, `${o.type} ${o.id ?? o.number}`);
  }
});

test('Klippen: mindestens drei Windräder, die sich drehen; Felsnadeln in den Wolken', () => {
  const mills = KLIPPEN.objects.filter(o => o.type === 'deco' && o.prop === 'windmill');
  assert.ok(mills.length >= 3);
  assert.ok(mills.every(o => o.anim));
  assert.ok(KLIPPEN.rows.join('').includes('S'));
});

test('Klippen: Spieltexte sind kurz und nennen Morrow nicht', () => {
  for (const o of KLIPPEN.objects) {
    for (const l of [...(o.lines ?? []), ...(o.linesLit ?? []), ...(o.linesOpen ?? []), ...(o.afterWin ? [o.afterWin] : [])]) {
      assert.ok(l.length <= 90, l);
      assert.equal(/morrow/i.test(l), false, l);
    }
  }
});

test('Klippen: Die Windräder der Spielaufgabe stehen an der Nordkante, davor Fels ohne Windgras', () => {
  const m = createMap(KLIPPEN);
  const parts = KLIPPEN.objects.filter(o => o.type === 'task');
  assert.equal(parts.filter(o => o.role === 'switch').length, 3);
  for (const o of parts) {
    assert.ok(o.y <= 3 && o.x >= 12 && o.x <= 24, `${o.id}: auf der Nordplattform`);
    assert.equal(m.tileAt(o.x, o.y), 'cliffrock', `${o.id}: auf Fels, nicht auf Wolken`);
    const front = [[0, 1], [-1, 0]].map(([dx, dy]) => ({ x: o.x + dx, y: o.y + dy })).find(p => m.canEnter(p.x, p.y));
    assert.ok(front && !m.isTallGrass(front.x, front.y), `${o.id}: Vorfeld ohne Windgras`);
  }
});
