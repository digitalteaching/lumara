import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STERNWARTE } from '../js/world/maps/sternwarte.js';
import { RUINEN } from '../js/world/maps/ruinen.js';
import { MAPS, openGatesFor } from '../js/world/network.js';
import { createMap, reachable, cellKey } from '../js/world/map.js';
import { turnGear } from '../js/world/puzzles.js';
import { migrateState } from '../js/save/migrate.js';
import { SPIELSTAND_V5 } from './fixtures/spielstand-v5.js';
import { newGameState } from '../js/state.js';
import { textIn } from '../js/i18n/i18n.js';
import { CREATURE_ART } from '../js/gfx/art/creatures.js';
import { PROPS } from '../js/gfx/art/tiles.js';
import { SPECIES, SECRET_SPECIES } from '../js/data/species.js';
import { EN_SPECIES } from '../js/i18n/en-species.js';
import { EN_WORLD } from '../js/i18n/en-world.js';
import { BOOK_SLOTS } from '../js/data/book.js';

const PACK = { trainers: [] };
const s0 = () => newGameState({ name: 'A', species: 'nixi', nickname: null });

test('Die Kuppel ist ein Tor, das sich erst nach dem Rätsel öffnet, und nach dem Laden offen bleibt', () => {
  const s = s0();
  assert.deepEqual(openGatesFor(STERNWARTE, s, PACK), []);
  turnGear(s, 'sternwarte', 0);
  assert.deepEqual(openGatesFor(STERNWARTE, s, PACK), []);
  for (const i of [0, 1, 2, 2, 2]) turnGear(s, 'sternwarte', i); // zusammen mit der ersten Drehung: 2, 1, 3
  assert.deepEqual(openGatesFor(STERNWARTE, s, PACK), ['kuppel']);
  turnGear(s, 'sternwarte', 1); // weiterdrehen schließt nichts
  assert.deepEqual(openGatesFor(STERNWARTE, s, PACK), ['kuppel']);
  const loaded = migrateState({ ...structuredClone(SPIELSTAND_V5), secrets: structuredClone(s.secrets) });
  assert.deepEqual(openGatesFor(STERNWARTE, loaded.state, PACK), ['kuppel']);
});

test('Sternwarte: ohne gelöstes Rätsel bleibt die Kuppel zu; die Räder und die Tafel erreicht man immer', () => {
  assert.equal(MAPS.sternwarte, STERNWARTE);
  assert.deepEqual([STERNWARTE.area, STERNWARTE.secret], [6, 'sternwarte']);
  const shut = createMap(STERNWARTE);
  const seenShut = reachable(shut, STERNWARTE.spawn);
  const open = createMap(STERNWARTE, { openGates: ['kuppel'] });
  const seenOpen = reachable(open, STERNWARTE.spawn);
  const nextTo = (seen, x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has(cellKey(x + dx, y + dy)));
  const gears = STERNWARTE.objects.filter(o => o.type === 'gear');
  assert.deepEqual(gears.map(g => g.index), [0, 1, 2]);
  assert.deepEqual(gears.map(g => g.x), [...gears.map(g => g.x)].sort((a, b) => a - b), 'von links nach rechts');
  for (const g of gears) assert.ok(seenShut.has(cellKey(g.x, g.y + 1)), `Rad ${g.index + 1} von unten erreichbar`);
  const hint = STERNWARTE.objects.find(o => o.type === 'gearhint');
  assert.ok(hint && nextTo(seenShut, hint.x, hint.y));
  const story = STERNWARTE.objects.find(o => o.type === 'storystone');
  const grass = seen => [...seen].some(k => { const [x, y] = k.split(',').map(Number); return shut.isTallGrass(x, y); });
  assert.equal(nextTo(seenShut, story.x, story.y), false, 'Geschichtsstein hinter der Kuppel');
  assert.equal(seenShut.has(cellKey(STERNWARTE.secretStone.x, STERNWARTE.secretStone.y)), false);
  assert.equal(grass(seenShut), false);
  assert.ok(nextTo(seenOpen, story.x, story.y) && seenOpen.has(cellKey(STERNWARTE.secretStone.x, STERNWARTE.secretStone.y)) && grass(seenOpen));
  const exit = STERNWARTE.exits[0];
  assert.ok(seenShut.has(cellKey(exit.x, exit.y)));
  assert.deepEqual([exit.to, exit.at.x, exit.at.y], ['ruinen', 27, 7]);
  assert.deepEqual(STERNWARTE.wild, { common: ['zeitschnecke'], rare: 'zeitschnecke' });
});

test('In den Uhrwerkruinen führt die Sternentafel am Kanal mit der Sternkarte hinüber', () => {
  const plaque = RUINEN.objects.find(o => o.type === 'secret');
  assert.deepEqual([plaque.place, plaque.x, plaque.y, plaque.prop], ['sternwarte', 28, 7, 'starplaque']);
  assert.ok(createMap(RUINEN).canEnter(27, 7));
  assert.deepEqual([plaque.to.map, plaque.to.x, plaque.to.y], ['sternwarte', STERNWARTE.spawn.x, STERNWARTE.spawn.y]);
  const en = EN_WORLD.objects.ruinen[plaque.id];
  assert.deepEqual([en.lines.length, en.linesOpen.length], [plaque.lines.length, plaque.linesOpen.length]);
  assert.ok(EN_WORLD.areas.sternwarte?.name);
});

test('Zahnrad-Sätze auf Deutsch und Englisch; jede Stellung hat ihr eigenes Bild', () => {
  assert.equal(textIn('de', 'gear.turned', { n: 2, dir: textIn('de', 'gear.dir.1') }), 'Zahnrad 2: Der Stern zeigt nach rechts.');
  assert.equal(textIn('en', 'gear.turned', { n: 2, dir: textIn('en', 'gear.dir.1') }), 'Gear 2: The star points right.');
  for (const key of ['gear.solved', 'gear.hint1', 'gear.hint2', 'gear.hint3']) assert.ok(textIn('de', key) && textIn('en', key), key);
  const pics = [0, 1, 2, 3].map(i => PROPS[`stargear${i}`]);
  for (const p of pics) assert.equal(p.length, 16);
  assert.equal(new Set(pics.map(p => p.join('/'))).size, 4);
  assert.ok(PROPS.starplaque);
});

test('Zeitschnecke: Buchplatz 30, Bild 32 × 32 mit eigener Silhouette, Text auf Englisch', () => {
  assert.equal(SECRET_SPECIES[5], 'zeitschnecke');
  assert.equal(BOOK_SLOTS[29], 'zeitschnecke');
  assert.deepEqual([SPECIES.zeitschnecke.kind, SPECIES.zeitschnecke.area], ['secret', 6]);
  assert.ok(EN_SPECIES.zeitschnecke?.names?.[0]);
  const rows = CREATURE_ART.zeitschnecke[1];
  assert.equal(rows.length, 32);
  const shape = r => r.map(x => x.replace(/[^.]/g, '#')).join('/');
  for (const [id, stages] of Object.entries(CREATURE_ART)) if (id !== 'zeitschnecke') assert.notEqual(shape(stages[1]), shape(rows), id);
});
