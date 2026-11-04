import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GLASTURM } from '../js/world/maps/glasturm.js';
import { DUENEN } from '../js/world/maps/duenen.js';
import { MAPS } from '../js/world/network.js';
import { createMap, reachable, cellKey } from '../js/world/map.js';
import { CREATURE_ART } from '../js/gfx/art/creatures.js';
import { SPECIES } from '../js/data/species.js';
import { BOOK_SLOTS } from '../js/data/book.js';

test('Glasturm: oben auf dem Turm, alles vom Eingang erreichbar, Ausgang zurück zur Öse', () => {
  assert.equal(MAPS.glasturm, GLASTURM);
  assert.deepEqual([GLASTURM.area, GLASTURM.secret], [4, 'glasturm']);
  const map = createMap(GLASTURM);
  const seen = reachable(map, GLASTURM.spawn);
  const nextTo = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has(cellKey(x + dx, y + dy)));
  const stone = GLASTURM.objects.find(o => o.type === 'storystone');
  assert.ok(stone && stone.place === 'glasturm' && nextTo(stone.x, stone.y));
  assert.ok(seen.has(cellKey(GLASTURM.secretStone.x, GLASTURM.secretStone.y)));
  assert.ok([...seen].some(k => { const [x, y] = k.split(',').map(Number); return map.isTallGrass(x, y); }), 'Prismengras erreichbar');
  const exit = GLASTURM.exits[0];
  assert.ok(seen.has(cellKey(exit.x, exit.y)));
  assert.deepEqual([exit.to, exit.at.x, exit.at.y], ['duenen', 15, 5]);
});

test('In den Spiegeldünen führt die Öse an der Glaswand mit dem Kletterhaken hinauf', () => {
  const ring = DUENEN.objects.find(o => o.type === 'secret');
  assert.deepEqual([ring.place, ring.x, ring.y, ring.prop], ['glasturm', 15, 4, 'hookring']);
  assert.ok(createMap(DUENEN).canEnter(15, 5));
  assert.deepEqual([ring.to.map, ring.to.x, ring.to.y], ['glasturm', GLASTURM.spawn.x, GLASTURM.spawn.y]);
});

test('Prismalibelle: Buchplatz 26, Bild 32 × 32 mit eigener Silhouette', () => {
  assert.deepEqual(BOOK_SLOTS.slice(24, 26), ['wurzelgeist', 'prismalibelle']);
  assert.deepEqual([SPECIES.prismalibelle.kind, SPECIES.prismalibelle.area], ['secret', 4]);
  const rows = CREATURE_ART.prismalibelle[1];
  assert.equal(rows.length, 32);
  const shape = r => r.map(x => x.replace(/[^.]/g, '#')).join('/');
  for (const [id, stages] of Object.entries(CREATURE_ART)) if (id !== 'prismalibelle') assert.notEqual(shape(stages[1]), shape(rows), id);
});
