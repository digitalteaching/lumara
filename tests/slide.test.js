import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slideIntent, isSliding, slideStops } from '../js/world/slide.js';
import { EISGROTTE } from '../js/world/maps/eisgrotte.js';
import { SEE } from '../js/world/maps/see.js';
import { MAPS } from '../js/world/network.js';
import { createMap, cellKey } from '../js/world/map.js';
import { createPlayer } from '../js/world/player.js';
import { CREATURE_ART } from '../js/gfx/art/creatures.js';
import { PROPS } from '../js/gfx/art/tiles.js';
import { SPECIES, SECRET_SPECIES } from '../js/data/species.js';
import { EN_SPECIES } from '../js/i18n/en-species.js';
import { EN_WORLD } from '../js/i18n/en-world.js';
import { BOOK_SLOTS } from '../js/data/book.js';
import { blockedCells } from '../js/world/secrets.js';
import { newGameState } from '../js/state.js';

// Eine kleine Eisfläche: oben drei Felder Rutscheis, unten Schnee und eine Eissäule.
const MINI = {
  name: 'mini',
  rows: ['WWWWW', 'WiiiW', 'WsiXW', 'WWWWW'],
  legend: { W: 'icewall', i: 'slideice', s: 'snow', X: 'icepillar' },
  objects: [],
};

test('Auf Rutscheis mit freiem Feld vorne behält die Figur ihre Richtung, sonst gilt die Eingabe', () => {
  const map = createMap(MINI);
  assert.equal(map.isSlippery(1, 1), true);
  assert.equal(map.isSlippery(1, 2), false);
  const p = { x: 1, y: 1, dir: 'right' };
  assert.equal(isSliding(map, p), true);
  assert.equal(slideIntent(map, p, 'down'), 'right');
  assert.equal(slideIntent(map, p, null), 'right');
  const wall = { x: 3, y: 1, dir: 'right' }; // vor der Wand
  assert.equal(isSliding(map, wall), false);
  assert.equal(slideIntent(map, wall, 'left'), 'left');
  const pillar = { x: 2, y: 2, dir: 'right' }; // vor der Säule
  assert.equal(slideIntent(map, pillar, 'up'), 'up');
  const snow = { x: 1, y: 2, dir: 'up' }; // auf Schnee rutscht nichts
  assert.equal(slideIntent(map, snow, 'right'), 'right');
});

test('Mit slideIntent gleitet die Figur Feld für Feld weiter, bis etwas sie aufhält', () => {
  const map = createMap(MINI);
  const p = createPlayer({ x: 1, y: 2, dir: 'up' });
  const cells = [];
  let input = 'up';
  for (let i = 0; i < 40; i++) {
    const dir = slideIntent(map, p, input);
    for (const ev of p.update(100, { dir, a: false }, map)) if (ev.type === 'stepped') cells.push([ev.x, ev.y]);
    if (cells.length === 1) input = 'right'; // auf dem Eis: nach rechts
    if (cells.length >= 3) input = null;
  }
  assert.deepEqual(cells, [[1, 1], [2, 1], [3, 1]]);
  assert.equal(p.moving, false);
});

test('Eisgrotte: der Kristall ist nur durch mindestens drei Rutschzüge erreichbar, und nirgends steckt man fest', () => {
  assert.equal(MAPS.eisgrotte, EISGROTTE);
  assert.deepEqual([EISGROTTE.area, EISGROTTE.secret], [7, 'eisgrotte']);
  const map = createMap(EISGROTTE);
  const stops = slideStops(map, EISGROTTE.spawn);
  const crystal = EISGROTTE.objects.find(o => o.type === 'storystone');
  assert.equal(crystal.prop, 'icecrystal');
  const beside = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => cellKey(crystal.x + dx, crystal.y + dy)).filter(k => stops.has(k));
  assert.ok(beside.length, 'man kommt an den Kristall');
  assert.ok(Math.min(...beside.map(k => stops.get(k))) >= 3, 'mindestens drei Rutschzüge');
  assert.ok(stops.has(cellKey(EISGROTTE.secretStone.x, EISGROTTE.secretStone.y)), 'Stein erreichbar');
  const exit = EISGROTTE.exits[0];
  for (const k of stops.keys()) {
    const [x, y] = k.split(',').map(Number);
    assert.ok(slideStops(map, { x, y }).has(cellKey(exit.x, exit.y)), `von ${k} zurück zum Ausgang`);
  }
  // Auch solange der Lebensstein noch liegt (er belegt sein Feld): nirgends feststecken.
  const stone = blockedCells(EISGROTTE, newGameState({ name: 'A', species: 'nixi', nickname: null }));
  assert.equal(stone.size, 1);
  const withStone = slideStops(map, EISGROTTE.spawn, stone);
  assert.ok(withStone.get(beside[0]) >= 3);
  assert.ok(stops.has(cellKey(2, 1)) && !withStone.has(cellKey(2, 1)), "auf dem liegenden Stein hält man nicht an");
  for (const k of withStone.keys()) {
    const [x, y] = k.split(',').map(Number);
    assert.ok(slideStops(map, { x, y }, stone).has(cellKey(exit.x, exit.y)), `mit Stein: von ${k} zurück zum Ausgang`);
  }
  assert.ok([...stops.keys()].some(k => { const [x, y] = k.split(',').map(Number); return map.isTallGrass(x, y); }), 'Schneegras erreichbar');
  assert.deepEqual([exit.to, exit.at.x, exit.at.y], ['see', 28, 4]);
  assert.deepEqual(EISGROTTE.wild, { common: ['kristallotter'], rare: 'kristallotter' });
});

test('Am Nordlichtsee führt die Eiskante mit den Eiskufen in die Grotte', () => {
  const edge = SEE.objects.find(o => o.type === 'secret');
  assert.deepEqual([edge.place, edge.x, edge.y, edge.prop], ['eisgrotte', 29, 4, 'iceedge']);
  assert.ok(createMap(SEE).canEnter(28, 4));
  assert.deepEqual([edge.to.map, edge.to.x, edge.to.y], ['eisgrotte', EISGROTTE.spawn.x, EISGROTTE.spawn.y]);
  const en = EN_WORLD.objects.see[edge.id];
  assert.deepEqual([en.lines.length, en.linesOpen.length], [edge.lines.length, edge.linesOpen.length]);
  assert.ok(EN_WORLD.areas.eisgrotte?.name);
  assert.ok(PROPS.iceedge && PROPS.icecrystal && PROPS.icecrystalDone);
});

test('Kristallotter: Buchplatz 29, Bild 32 × 32 mit eigener Silhouette, Text auf Englisch', () => {
  assert.equal(SECRET_SPECIES[4], 'kristallotter');
  assert.equal(BOOK_SLOTS[28], 'kristallotter');
  assert.deepEqual([SPECIES.kristallotter.kind, SPECIES.kristallotter.area], ['secret', 7]);
  assert.ok(EN_SPECIES.kristallotter?.names?.[0]);
  const rows = CREATURE_ART.kristallotter[1];
  assert.equal(rows.length, 32);
  const shape = r => r.map(x => x.replace(/[^.]/g, '#')).join('/');
  for (const [id, stages] of Object.entries(CREATURE_ART)) if (id !== 'kristallotter') assert.notEqual(shape(stages[1]), shape(rows), id);
});
