import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMap, reachable, cellKey, step } from '../js/world/map.js';
import { SEE } from '../js/world/maps/see.js';
import { beaconFront } from '../js/world/network.js';
import { CHARACTERS } from '../js/gfx/art/characters.js';

const NEAR = [[0, 1], [0, -1], [1, 0], [-1, 0]];

test('See: 40 × 30, Gebiet 7, alles Wichtige ist vom Eingang aus erreichbar', () => {
  const m = createMap(SEE, { openGates: [] });
  const r = reachable(m, SEE.spawn);
  assert.equal(m.width, 40);
  assert.equal(m.height, 30);
  assert.equal(SEE.area, 7);
  assert.equal(SEE.ground, 'snow');
  assert.equal(SEE.genitive, 'des Nordlichtsees');
  const nextTo = (x, y) => NEAR.some(([dx, dy]) => r.has(cellKey(x + dx, y + dy)));
  for (const o of SEE.objects.filter(o => o.id !== 'eisgrotte')) assert.ok(nextTo(o.x, o.y), `${o.type} ${o.id ?? o.number}`);
  for (const f of SEE.finds) assert.ok(r.has(cellKey(f.x, f.y)) && m.isTallGrass(f.x, f.y), `Fundstelle ${f.id}`);
  assert.ok(SEE.objects.some(o => o.type === 'trainer' && o.number === 7 && o.sprite === 'trainer7' && o.afterWin));
  assert.ok(SEE.objects.some(o => o.type === 'beacon' && o.number === 7));
  const npcs = SEE.objects.filter(o => o.type === 'npc');
  assert.deepEqual(npcs.map(n => n.name), ['Sven', 'Mira', 'Ari']);
  for (const n of npcs) assert.ok(n.lines.length && n.linesLit.length, n.id);
  for (const o of [...npcs, ...SEE.objects.filter(o => o.type === 'trainer')]) assert.ok(CHARACTERS[o.sprite], o.sprite);
  assert.ok(SEE.objects.filter(o => o.type === 'notestone').length >= 3);
  assert.ok(SEE.objects.filter(o => o.type === 'bush').length >= 2);
  assert.equal(SEE.finds.length, 3);
  assert.ok([...r].filter(k => m.isTallGrass(...k.split(',').map(Number))).length >= 12);
  assert.ok(SEE.objects.some(o => o.type === 'sign' && !o.role));
  const fog = SEE.objects.find(o => o.type === 'sign' && o.role === 'fogEdge');
  assert.deepEqual([fog.gate, fog.leadsTo, fog.leadsToName], [7, 8, 'die Sternenwiese']);
  assert.deepEqual(fog.linesOpen, ['Süden: Sternenwiese', 'Der Nebel hat sich zurückgezogen. Der Weg ist frei.']);
  assert.deepEqual(SEE.gates, [{ id: 'sued', leadsTo: 8, x: 18, y: 28, w: 4, h: 2, ground: 'snow' }]);
  assert.deepEqual(SEE.particles, ['snow', 'aurora']);
});

test('See: Aufwachpunkt vor dem Leuchtstein, Freya blickt über das Eis, Stein nicht in ihrem Blick', () => {
  const m = createMap(SEE);
  assert.deepEqual(SEE.respawn, beaconFront(SEE, 7));
  assert.ok(m.canEnter(SEE.spawn.x, SEE.spawn.y));
  const t = SEE.objects.find(o => o.type === 'trainer');
  const seen = [];
  let p = { x: t.x, y: t.y };
  for (let i = 0; i < t.sight; i++) {
    p = step(p, t.dir);
    if (!m.canEnter(p.x, p.y)) break;
    seen.push(p);
  }
  assert.ok(seen.length >= 3 && seen.every(c => m.tileAt(c.x, c.y) === 'ice'), 'Freya sieht über das Eis');
  const b = beaconFront(SEE, 7);
  assert.ok(!seen.some(c => c.x === b.x && c.y === b.y));
});

test('See: Die Eisgrotte liegt hinter offenem Wasser und ist nicht erreichbar; das Zelt hat eine Zeile', () => {
  const m = createMap(SEE, { openGates: ['sued'] });
  const r = reachable(m, SEE.spawn);
  const cave = SEE.objects.find(o => o.id === 'eisgrotte');
  assert.equal(cave?.prop, 'icecave');
  assert.ok(!NEAR.some(([dx, dy]) => r.has(cellKey(cave.x + dx, cave.y + dy))));
  let water = 0;
  for (let y = 0; y < m.height; y++) for (let x = 0; x < m.width; x++) if (m.tileAt(x, y) === 'icewater') water++;
  assert.ok(water >= 4);
  const tent = SEE.objects.find(o => o.type === 'deco' && o.prop === 'tent');
  assert.ok(tent?.lines?.length >= 1);
});

test('See: Spieltexte sind kurz und nennen Morrow nicht', () => {
  for (const o of SEE.objects) {
    for (const l of [...(o.lines ?? []), ...(o.linesLit ?? []), ...(o.linesOpen ?? []), ...(o.afterWin ? [o.afterWin] : [])]) {
      assert.ok(l.length <= 90, l);
      assert.equal(/morrow/i.test(l), false, l);
    }
  }
});
