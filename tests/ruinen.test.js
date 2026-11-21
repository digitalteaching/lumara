import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMap, reachable, cellKey, step } from '../js/world/map.js';
import { RUINEN } from '../js/world/maps/ruinen.js';
import { beaconFront } from '../js/world/network.js';
import { CHARACTERS } from '../js/gfx/art/characters.js';

const NEAR = [[0, 1], [0, -1], [1, 0], [-1, 0]];

test('Ruinen: 40 × 30, Gebiet 6, alles Wichtige ist vom Eingang aus erreichbar', () => {
  const m = createMap(RUINEN, { openGates: [] });
  const r = reachable(m, RUINEN.spawn);
  assert.equal(m.width, 40);
  assert.equal(m.height, 30);
  assert.equal(RUINEN.area, 6);
  assert.equal(RUINEN.ground, 'cobble');
  const nextTo = (x, y) => NEAR.some(([dx, dy]) => r.has(cellKey(x + dx, y + dy)));
  for (const o of RUINEN.objects.filter(o => o.id !== 'sternwarte')) assert.ok(nextTo(o.x, o.y), `${o.type} ${o.id ?? o.number}`);
  for (const f of RUINEN.finds) assert.ok(r.has(cellKey(f.x, f.y)) && m.isTallGrass(f.x, f.y), `Fundstelle ${f.id}`);
  assert.ok(RUINEN.objects.some(o => o.type === 'trainer' && o.number === 6 && o.sprite === 'trainer6' && o.afterWin));
  assert.ok(RUINEN.objects.some(o => o.type === 'beacon' && o.number === 6));
  const npcs = RUINEN.objects.filter(o => o.type === 'npc');
  assert.deepEqual(npcs.map(n => n.name), ['Greta', 'Pino', 'Bo']);
  for (const n of npcs) assert.ok(n.lines.length && n.linesLit.length, n.id);
  for (const o of [...npcs, ...RUINEN.objects.filter(o => o.type === 'trainer')]) assert.ok(CHARACTERS[o.sprite], o.sprite);
  assert.ok(RUINEN.objects.filter(o => o.type === 'notestone').length >= 3);
  assert.ok(RUINEN.objects.filter(o => o.type === 'bush').length >= 2);
  assert.equal(RUINEN.finds.length, 3);
  assert.ok([...r].filter(k => m.isTallGrass(...k.split(',').map(Number))).length >= 12);
  assert.ok(RUINEN.objects.some(o => o.type === 'sign' && !o.role));
  const fog = RUINEN.objects.find(o => o.type === 'sign' && o.role === 'fogEdge');
  assert.deepEqual([fog.gate, fog.leadsTo, fog.leadsToName], [6, 7, 'der Nordlichtsee']);
  assert.deepEqual(fog.linesOpen, ['Süden: Nordlichtsee', 'Der Nebel hat sich zurückgezogen. Der Weg ist frei.']);
  assert.deepEqual(RUINEN.gates, [{ id: 'sued', leadsTo: 7, x: 18, y: 28, w: 4, h: 2, ground: 'cobble' }]);
  assert.deepEqual(RUINEN.particles, ['spark', 'steam']);
});

test('Ruinen: Aufwachpunkt vor dem Leuchtstein, Otto blickt über die Brücke, Stein nicht in seinem Blick', () => {
  const m = createMap(RUINEN);
  assert.deepEqual(RUINEN.respawn, beaconFront(RUINEN, 6));
  assert.ok(m.canEnter(RUINEN.spawn.x, RUINEN.spawn.y));
  const t = RUINEN.objects.find(o => o.type === 'trainer');
  const seen = [];
  let p = { x: t.x, y: t.y };
  for (let i = 0; i < t.sight; i++) {
    p = step(p, t.dir);
    if (!m.canEnter(p.x, p.y)) break;
    seen.push(p);
  }
  assert.ok(seen.some(c => m.tileAt(c.x, c.y) === 'pier'), 'Otto sieht die Brücke');
  const b = beaconFront(RUINEN, 6);
  assert.ok(!seen.some(c => c.x === b.x && c.y === b.y));
});

test('Ruinen: Die Sternwarte ist zu sehen, aber nicht erreichbar; mindestens drei Zahnräder drehen sich', () => {
  const m = createMap(RUINEN, { openGates: ['sued'] });
  const r = reachable(m, RUINEN.spawn);
  const tower = RUINEN.objects.find(o => o.id === 'sternwarte');
  assert.equal(tower?.prop, 'observatory');
  assert.ok(!NEAR.some(([dx, dy]) => r.has(cellKey(tower.x + dx, tower.y + dy))));
  assert.ok(RUINEN.objects.filter(o => o.type === 'deco' && o.prop === 'gear' && o.anim).length >= 3);
});

test('Ruinen: Spieltexte sind kurz und nennen Morrow nicht', () => {
  for (const o of RUINEN.objects) {
    for (const l of [...(o.lines ?? []), ...(o.linesLit ?? []), ...(o.linesOpen ?? []), ...(o.afterWin ? [o.afterWin] : [])]) {
      assert.ok(l.length <= 90, l);
      assert.equal(/morrow/i.test(l), false, l);
    }
  }
});

test('Ruinen: Hebel und Wandzeichnung hängen an der Südmauer neben dem Kanalende', () => {
  const m = createMap(RUINEN);
  const parts = RUINEN.objects.filter(o => o.type === 'task');
  assert.equal(parts.length, 4);
  for (const o of parts) {
    assert.equal(m.tileAt(o.x, o.y), 'ruinwall', `${o.id}: an der Mauer`);
    assert.ok(m.canEnter(o.x, o.y - 1), `${o.id}: davor Pflaster`);
  }
  assert.equal(m.tileAt(14, 27), 'canal', 'das Kanalende bleibt Kanal');
});
