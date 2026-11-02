import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMap, reachable, cellKey, step } from '../js/world/map.js';
import { BUCHT } from '../js/world/maps/bucht.js';

test('Bucht: 40 × 30, fehlerfrei, Start und Aufwachpunkt begehbar', () => {
  const m = createMap(BUCHT);
  assert.equal(m.width, 40);
  assert.equal(m.height, 30);
  assert.ok(m.canEnter(BUCHT.spawn.x, BUCHT.spawn.y));
  assert.ok(m.canEnter(BUCHT.respawn.x, BUCHT.respawn.y));
});

test('vom Start erreichbar: Ilvy, Trainerin, jedes Schild, jeder Bewohner, Leuchtturmtür, mindestens 12 Grasfelder', () => {
  const m = createMap(BUCHT), r = reachable(m, BUCHT.spawn);
  const nextTo = (x, y) => [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => r.has(cellKey(x + dx, y + dy)));
  for (const o of BUCHT.objects.filter(o => o.type !== 'building')) assert.ok(nextTo(o.x, o.y), `${o.type} ${o.id ?? o.number}`);
  const lh = BUCHT.objects.find(o => o.id === 'leuchtturm');
  assert.equal(lh.onDoor, 'heal');
  assert.ok(nextTo(lh.x + lh.door.dx, lh.y + lh.door.dy));
  assert.ok([...r].filter(k => m.isTallGrass(...k.split(',').map(Number))).length >= 12);
  assert.ok(BUCHT.objects.some(o => o.type === 'npc' && o.id === 'ilvy'));
  assert.ok(BUCHT.objects.some(o => o.type === 'trainer' && o.number === 1));
});

test('Nebel schließt den Weg nach Norden, davor steht ein Schild', () => {
  const m = createMap(BUCHT), r = reachable(m, BUCHT.spawn);
  const fog = [];
  for (let y = 0; y < 3; y++) for (let x = 0; x < 40; x++) if (m.tileAt(x, y) === 'fog') fog.push([x, y]);
  assert.ok(fog.length >= 3);
  assert.ok(BUCHT.objects.some(o => o.type === 'sign' && r.has(cellKey(o.x, o.y + 1)) && m.tileAt(o.x, o.y - 1) === 'fog'));
});

test('Trainerin 1 blickt über mindestens 2 begehbare Felder', () => {
  const m = createMap(BUCHT), t = BUCHT.objects.find(o => o.type === 'trainer');
  let p = { x: t.x, y: t.y }, n = 0;
  for (let i = 0; i < t.sight; i++) {
    p = step(p, t.dir);
    if (m.canEnter(p.x, p.y)) n++;
    else break;
  }
  assert.ok(n >= 2);
});
