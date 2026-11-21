import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GARTEN } from '../js/world/maps/garten.js';
import { BUCHT } from '../js/world/maps/bucht.js';
import { BUCHT_0_4 } from './fixtures/bucht-0.4.js';
import { MAPS, exitAt } from '../js/world/network.js';
import { createMap, reachable, cellKey, step } from '../js/world/map.js';
import { gardenCells } from '../js/world/garden.js';
import { PROPS } from '../js/gfx/art/tiles.js';
import { parseSprite } from '../js/gfx/sprites.js';
import { CONFIG } from '../js/config.js';

const NEIGHBOURS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const cells = map => Array.from({ length: map.width * map.height }, (_, i) => ({ x: i % map.width, y: Math.floor(i / map.width) }));

test('Garten: fehlerfrei, Ankunft begehbar, kein hohes Gras, keine Begegnungen', () => {
  assert.equal(MAPS.garten, GARTEN);
  assert.deepEqual([GARTEN.id, GARTEN.area, GARTEN.garden], ['garten', 1, true]);
  assert.ok(!GARTEN.secret && !GARTEN.cave);
  const map = createMap(GARTEN);
  assert.ok(map.width >= 20 && map.width <= 28, `Breite ${map.width}`);
  assert.ok(map.height >= 14 && map.height <= 18, `Höhe ${map.height}`);
  assert.ok(map.canEnter(GARTEN.spawn.x, GARTEN.spawn.y));
  assert.ok(map.canEnter(GARTEN.respawn.x, GARTEN.respawn.y));
  assert.deepEqual(cells(map).filter(c => map.isTallGrass(c.x, c.y)), [], 'kein hohes Gras');
  assert.equal(GARTEN.wild, undefined);
  assert.equal(GARTEN.finds, undefined);
  assert.equal(GARTEN.gates, undefined);
  assert.deepEqual(GARTEN.particles, []);
  assert.deepEqual(GARTEN.objects.filter(o => o.type === 'trainer' || o.type === 'beacon'), []);
  const sign = GARTEN.objects.find(o => o.type === 'sign');
  assert.deepEqual([sign?.id, sign?.role], ['garten-schild', 'friendCount']);
  assert.ok(sign.lines?.length);
});

test('Platz für alle 40: mindestens 60 freie Felder, vom Ankunftsfeld erreichbar; Teich mit mindestens 12 Feldern am Wasser', () => {
  const map = createMap(GARTEN);
  const { free, pond } = gardenCells(map);
  const seen = reachable(map, GARTEN.spawn);
  assert.ok(free.length >= 60, `${free.length} freie Felder`);
  for (const c of free) assert.ok(seen.has(cellKey(c.x, c.y)), `(${c.x}, ${c.y}) nicht erreichbar`);
  const water = cells(map).filter(c => map.tileAt(c.x, c.y) === 'water');
  assert.ok(water.length >= 6, `${water.length} Wasserfelder`);
  assert.ok(pond.size >= 12, `${pond.size} Felder am Teich`);
  const freeKeys = new Set(free.map(c => cellKey(c.x, c.y)));
  const r = CONFIG.garden.pondRadius;
  for (const k of pond) {
    assert.ok(freeKeys.has(k), k);
    const [x, y] = k.split(',').map(Number);
    assert.ok(water.some(w => Math.max(Math.abs(w.x - x), Math.abs(w.y - y)) <= r), `${k} liegt nicht am Teich`);
  }
  // Umgekehrt: Jedes freie Feld nah am Wasser gehört zum Teich.
  for (const c of free) {
    const near = water.some(w => Math.max(Math.abs(w.x - c.x), Math.abs(w.y - c.y)) <= r);
    assert.equal(pond.has(cellKey(c.x, c.y)), near, `(${c.x}, ${c.y})`);
  }
});

test('Tor und Ausgang führen hin und zurück', () => {
  const gate = BUCHT.objects.find(o => o.type === 'garden');
  assert.ok(gate, 'Gartentor in der Bucht');
  assert.deepEqual([gate.id, gate.prop], ['gartentor', 'gardengate']);
  assert.deepEqual(gate.to, { map: 'garten', ...GARTEN.spawn });
  assert.ok(gate.lines?.length);
  // Das Tor steht auf einem früheren Fels- oder Baumfeld und belegt es.
  assert.ok(['rock', 'tree'].includes(createMap(BUCHT_0_4).tileAt(gate.x, gate.y)));
  const bay = createMap(BUCHT);
  assert.equal(bay.objectAt(gate.x, gate.y), gate);
  assert.ok(!bay.canEnter(gate.x, gate.y));
  // Das Vorfeld: vom Start der Bucht erreichbar, höchstens 4 Felder vom Leuchtturm entfernt.
  const front = { x: gate.x, y: gate.y + 1 };
  assert.ok(reachable(bay, BUCHT.spawn).has(cellKey(front.x, front.y)), 'Vorfeld erreichbar');
  const lh = BUCHT.objects.find(o => o.id === 'leuchtturm');
  const dx = Math.max(0, lh.x - front.x, front.x - (lh.x + lh.w - 1));
  const dy = Math.max(0, lh.y - front.y, front.y - (lh.y + lh.h - 1));
  assert.ok(dx + dy <= 4, `Abstand zum Leuchtturm ${dx + dy}`);
  // Ein Ausgang unten am Rand des Gartens führt auf dieses Vorfeld zurück.
  assert.equal(GARTEN.exits.length, 1);
  const [exit] = GARTEN.exits;
  assert.deepEqual([exit.to, exit.at.x, exit.at.y, exit.at.dir], ['bucht', front.x, front.y, 'down']);
  assert.equal(exit.y + exit.h, GARTEN.rows.length, 'Ausgang am unteren Rand');
  assert.equal(exitAt(GARTEN, GARTEN.spawn.x, GARTEN.spawn.y), null);
  const below = step(GARTEN.spawn, 'down');
  assert.equal(exitAt(GARTEN, below.x, below.y), exit, 'die Ankunft liegt gleich über dem Ausgang');
  assert.equal(GARTEN.spawn.dir, 'up');
});

test('Vom Tor zum Schild führt ein Weg, den kein Freund betritt', () => {
  const map = createMap(GARTEN);
  const sign = GARTEN.objects.find(o => o.role === 'friendCount');
  assert.equal(map.tileAt(GARTEN.spawn.x, GARTEN.spawn.y), 'path');
  // Breitensuche nur über Wegfelder, vom Ankunftsfeld bis neben das Schild.
  const seen = new Set([cellKey(GARTEN.spawn.x, GARTEN.spawn.y)]);
  const queue = [GARTEN.spawn];
  while (queue.length) {
    const c = queue.shift();
    for (const [dx, dy] of NEIGHBOURS) {
      const n = { x: c.x + dx, y: c.y + dy };
      const k = cellKey(n.x, n.y);
      if (seen.has(k) || map.tileAt(n.x, n.y) !== 'path' || !map.canEnter(n.x, n.y)) continue;
      seen.add(k);
      queue.push(n);
    }
  }
  assert.ok(NEIGHBOURS.some(([dx, dy]) => seen.has(cellKey(sign.x + dx, sign.y + dy))), 'Weg bis neben das Schild');
  const { free } = gardenCells(map);
  assert.deepEqual(free.filter(c => map.tileAt(c.x, c.y) === 'path'), [], 'kein Freund steht auf dem Weg');
});

test('Gartentor: ein eigenes Bild, 16 × 16', () => {
  const s = parseSprite('gardengate', PROPS.gardengate);
  assert.deepEqual([s.w, s.h], [16, 16]);
});
