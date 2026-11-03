import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMap, reachable, cellKey, step } from '../js/world/map.js';
import { DUENEN } from '../js/world/maps/duenen.js';
import { beaconFront } from '../js/world/network.js';

const NEAR = [[0, 1], [0, -1], [1, 0], [-1, 0]];

test('Dünen: 40 × 30, Gebiet 4, alles Wichtige ist vom Eingang aus erreichbar', () => {
  const m = createMap(DUENEN, { openGates: [] });
  const r = reachable(m, DUENEN.spawn);
  assert.equal(m.width, 40);
  assert.equal(m.height, 30);
  assert.equal(DUENEN.area, 4);
  const nextTo = (x, y) => NEAR.some(([dx, dy]) => r.has(cellKey(x + dx, y + dy)));
  for (const o of DUENEN.objects.filter(o => o.id !== 'glasturm')) assert.ok(nextTo(o.x, o.y), `${o.type} ${o.id ?? o.number}`);
  for (const f of DUENEN.finds) assert.ok(r.has(cellKey(f.x, f.y)) && m.isTallGrass(f.x, f.y), `Fundstelle ${f.id}`);
  assert.ok(DUENEN.objects.some(o => o.type === 'trainer' && o.number === 4 && o.afterWin));
  assert.ok(DUENEN.objects.some(o => o.type === 'beacon' && o.number === 4));
  const npcs = DUENEN.objects.filter(o => o.type === 'npc');
  assert.ok(npcs.length >= 2 && npcs.length <= 4);
  for (const n of npcs) assert.ok(n.lines.length && n.linesLit.length, n.id);
  assert.ok(DUENEN.objects.filter(o => o.type === 'notestone').length >= 3);
  assert.ok(DUENEN.objects.filter(o => o.type === 'bush').length >= 2);
  const statues = DUENEN.objects.filter(o => o.type === 'deco' && o.prop === 'statue');
  assert.ok(statues.length >= 3 && statues.every(s => s.lines?.length));
  assert.ok([...r].filter(k => m.isTallGrass(...k.split(',').map(Number))).length >= 12);
  assert.ok(DUENEN.objects.some(o => o.type === 'sign' && o.role === 'fogEdge' && o.leadsTo === 5 && o.gate === 4 && o.leadsToPlural));
  assert.deepEqual(DUENEN.particles, ['sand', 'glint']);
});

test('Dünen: Aufwachpunkt vor dem Leuchtstein, Karim blickt über den Weg nach Osten, Stein nicht in seinem Blick', () => {
  const m = createMap(DUENEN);
  assert.deepEqual(DUENEN.respawn, beaconFront(DUENEN, 4));
  assert.ok(m.canEnter(DUENEN.spawn.x, DUENEN.spawn.y));
  const t = DUENEN.objects.find(o => o.type === 'trainer');
  const seen = [];
  let p = { x: t.x, y: t.y };
  for (let i = 0; i < t.sight; i++) {
    p = step(p, t.dir);
    if (!m.canEnter(p.x, p.y)) break;
    seen.push(p);
  }
  assert.ok(seen.some(c => m.tileAt(c.x, c.y) === 'path'));
  const b = beaconFront(DUENEN, 4);
  assert.ok(!seen.some(c => c.x === b.x && c.y === b.y));
});

test('Dünen: Luftspiegelungen sehen aus wie Wege, sind aber blockiert; der Glasturm ist unerreichbar', () => {
  const m = createMap(DUENEN, { openGates: ['ost'] });
  const r = reachable(m, DUENEN.spawn);
  const mirages = [];
  for (let y = 0; y < 30; y++) for (let x = 0; x < 40; x++) if (m.tileAt(x, y) === 'mirage') mirages.push([x, y]);
  assert.ok(mirages.length >= 6);
  assert.ok(mirages.every(([x, y]) => !m.canEnter(x, y)));
  assert.ok(mirages.some(([x, y]) => NEAR.some(([dx, dy]) => r.has(cellKey(x + dx, y + dy)))), 'man kommt an eine heran');
  const t = DUENEN.objects.find(o => o.id === 'glasturm');
  assert.equal(t.prop, 'glasstower');
  assert.ok(!NEAR.some(([dx, dy]) => r.has(cellKey(t.x + dx, t.y + dy))));
});

test('Dünen: Spieltexte sind kurz und nennen Morrow nicht', () => {
  for (const o of DUENEN.objects) {
    for (const l of [...(o.lines ?? []), ...(o.linesLit ?? []), ...(o.linesOpen ?? []), ...(o.afterWin ? [o.afterWin] : [])]) {
      assert.ok(l.length <= 90, l);
      assert.equal(/morrow/i.test(l), false, l);
    }
  }
});
