import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gardenFriends, gardenCells, placeFriends, wanderTarget } from '../js/world/garden.js';
import { GARTEN } from '../js/world/maps/garten.js';
import { exitAt } from '../js/world/network.js';
import { createMap, cellKey, step } from '../js/world/map.js';
import { createRng } from '../js/core/rng.js';
import { FRIENDABLE, WATER_FRIENDS, makeFriend, setCompanion } from '../js/friends/friends.js';
import { createWorldScene } from '../js/scenes/world.js';
import { addGarden, friendCountLines } from '../js/scenes/gardenEvents.js';
import { addCompanion } from '../js/scenes/companion.js';
import { miniImages } from '../js/gfx/miniImages.js';
import { stubContext } from './helpers/fixtures.js';
import { CONFIG } from '../js/config.js';
import { setLanguage, t } from '../js/i18n/i18n.js';
import { EN_WORLD } from '../js/i18n/en-world.js';

const NEIGHBOURS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const parse = k => { const [x, y] = k.split(',').map(Number); return { x, y }; };
const isNeighbour = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;

test('Der Begleiter läuft nicht zusätzlich im Garten herum', () => {
  const state = { friends: {}, companion: null };
  assert.deepEqual(gardenFriends(state), []);
  makeFriend(state, 'moosling', false);
  makeFriend(state, 'gischtling', true);
  makeFriend(state, 'drachling', false);
  setCompanion(state, 'gischtling');
  assert.deepEqual(gardenFriends(state), [{ species: 'moosling', shiny: false }, { species: 'drachling', shiny: false }]);
  setCompanion(state, null);
  assert.deepEqual(gardenFriends(state), [{ species: 'gischtling', shiny: true }, { species: 'moosling', shiny: false }, { species: 'drachling', shiny: false }]);
  // Ein alter Begleiter, der kein Freund ist, nimmt niemandem den Platz im Garten.
  state.companion = 'nixi';
  assert.equal(gardenFriends(state).length, 3);
});

test('Jeder Freund hat ein eigenes Feld, nie auf Weg, Ausgang oder Ankunft', () => {
  const map = createMap(GARTEN);
  const { free, pond } = gardenCells(map);
  const freeKeys = new Set(free.map(c => cellKey(c.x, c.y)));
  const friends = FRIENDABLE.map(species => ({ species, shiny: false }));
  for (let seed = 1; seed <= 25; seed++) {
    const placed = placeFriends(map, friends, createRng(seed));
    assert.equal(placed.size, friends.length);
    const keys = [...placed.values()].map(p => cellKey(p.x, p.y));
    assert.equal(new Set(keys).size, keys.length, 'verschiedene Felder');
    for (const [species, p] of placed) {
      const k = cellKey(p.x, p.y);
      assert.ok(freeKeys.has(k), `${species} auf (${k})`);
      assert.ok(map.canEnter(p.x, p.y));
      assert.notEqual(map.tileAt(p.x, p.y), 'path');
      assert.equal(exitAt(GARTEN, p.x, p.y), null);
      assert.ok(!(p.x === GARTEN.spawn.x && p.y === GARTEN.spawn.y), 'nicht auf der Ankunft');
      if (WATER_FRIENDS.has(species)) assert.ok(pond.has(k), `${species} am Teich`);
      else assert.ok(!pond.has(k), `${species} zuerst außerhalb des Teichs`);
    }
  }
  // Belegte Felder (etwa die der Figur) bleiben frei.
  const avoid = new Set(free.slice(0, 60).map(c => cellKey(c.x, c.y)));
  for (const p of placeFriends(map, friends.slice(0, 8), createRng(3), avoid).values()) assert.ok(!avoid.has(cellKey(p.x, p.y)));
});

test('Ist außerhalb des Teichs kein Platz mehr, stehen die übrigen am Teich; ohne Platz fehlt einer, statt zu stören', () => {
  const tiny = createMap({
    name: 'teich-test',
    rows: ['TTTTTT', 'T.~~.T', 'T....T', 'TT_TTT'],
    legend: { T: 'tree', '.': 'grass', '~': 'water', _: 'path' },
    objects: [],
    exits: [{ x: 2, y: 3, w: 1, h: 1, to: 'bucht', at: { x: 33, y: 10, dir: 'down' } }],
    spawn: { x: 2, y: 2, dir: 'up' },
  });
  const { free, pond } = gardenCells(tiny);
  assert.equal(free.length, 5);
  assert.equal(pond.size, 5);
  const placed = placeFriends(tiny, ['moosling', 'drachling', 'gischtling', 'klippbock', 'zahnmaus', 'wolkenwal'].map(species => ({ species, shiny: false })), createRng(1));
  assert.equal(placed.size, 5);
  assert.equal(new Set([...placed.values()].map(p => cellKey(p.x, p.y))).size, 5);
  assert.ok(placed.has('gischtling'), 'das Wasserwesen hat seinen Platz am Teich');
});

test('Wasserwesen bleiben am Teich, auch beim Laufen', () => {
  const map = createMap(GARTEN);
  const { pond } = gardenCells(map);
  const rng = createRng(7);
  let pos = parse([...pond][0]);
  let moved = 0;
  for (let i = 0; i < 200; i++) {
    const next = wanderTarget(map, pos, rng, { occupied: new Set(), water: true });
    if (!next) continue;
    assert.ok(pond.has(cellKey(next.x, next.y)), `(${next.x}, ${next.y}) ist nicht am Teich`);
    assert.ok(isNeighbour(pos, next));
    pos = next;
    moved++;
  }
  assert.ok(moved > 150, `${moved} Schritte`);
});

test('Kein Schritt auf ein besetztes Feld', () => {
  const map = createMap(GARTEN);
  const { free } = gardenCells(map);
  const freeKeys = new Set(free.map(c => cellKey(c.x, c.y)));
  const around = c => NEIGHBOURS.map(([dx, dy]) => cellKey(c.x + dx, c.y + dy)).filter(k => freeKeys.has(k));
  const cell = free.find(c => around(c).length >= 3);
  const [open, ...rest] = around(cell);
  const rng = createRng(11);
  for (let i = 0; i < 20; i++) assert.equal(cellKey(...Object.values(wanderTarget(map, cell, rng, { occupied: new Set(rest), water: false }))), open);
  assert.equal(wanderTarget(map, cell, rng, { occupied: new Set([open, ...rest]), water: false }), null);
  // Zufällige Wege zwischen zufällig besetzten Feldern
  let pos = cell;
  for (let i = 0; i < 300; i++) {
    const occupied = new Set(free.filter(() => rng.next() < 0.3).map(c => cellKey(c.x, c.y)));
    const next = wanderTarget(map, pos, rng, { occupied, water: false });
    if (!next) continue;
    const k = cellKey(next.x, next.y);
    assert.ok(!occupied.has(k), `besetzt: ${k}`);
    assert.ok(freeKeys.has(k), `nicht frei: ${k}`);
    assert.ok(isNeighbour(pos, next));
    pos = next;
  }
});

// ---------- Der Garten in der Welt (js/scenes/gardenEvents.js) ----------

const fakeGame = (state, reducedMotion) => ({
  state,
  mode: 'walk',
  reducedMotion,
  input: { dir: () => null, pressed: () => false },
});

function gardenWorld({ reducedMotion = false, companion = FRIENDABLE[0] } = {}) {
  const state = { friends: {}, companion: null, position: { map: 'garten', ...GARTEN.spawn } };
  FRIENDABLE.forEach((id, i) => makeFriend(state, id, i % 4 === 0));
  state.companion = companion;
  const game = fakeGame(state, reducedMotion);
  const world = createWorldScene(game, GARTEN);
  const handlers = world.onInteract.length;
  addGarden(world, game);
  return { state, game, world, handlers };
}

// world.blocked enthält genau die Felder der Freunde: beim Laufen das alte und das neue.
function assertConsistent(world, map) {
  const { pond } = gardenCells(map);
  const want = new Set();
  for (const f of world.actors) {
    want.add(cellKey(f.x, f.y));
    if (f.moving) want.add(cellKey(f.fromX, f.fromY));
    assert.notEqual(map.tileAt(f.x, f.y), 'path', f.species);
    if (WATER_FRIENDS.has(f.species)) assert.ok(pond.has(cellKey(f.x, f.y)), `${f.species} verlässt den Teich`);
  }
  assert.deepEqual([...world.blocked].sort(), [...want].sort());
  const p = world.player;
  assert.ok(!world.blocked.has(cellKey(p.x, p.y)), 'kein Freund auf dem Feld der Figur');
}

test('Im Garten: Jeder Freund belegt sein Feld und geht nach einer Pause langsam ein Feld weiter', () => {
  const { world, handlers } = gardenWorld();
  const { map } = world;
  assert.equal(world.actors.length, FRIENDABLE.length - 1, 'alle außer dem Begleiter');
  assert.ok(!world.actors.some(f => f.species === FRIENDABLE[0]));
  assert.equal(world.onInteract.length, handlers + 2, 'ein Handler für die Freunde, einer für das Schild');
  assertConsistent(world, map);
  // Die Figur steht mitten auf der Wiese: Kein Freund läuft auf ihr Feld oder das Feld hinter ihr.
  const spot = gardenCells(map).free.find(c => !world.blocked.has(cellKey(c.x, c.y)) && !world.blocked.has(cellKey(c.x, c.y + 1)));
  world.player.teleport(spot.x, spot.y, 'up');
  const behind = step(spot, 'down');
  const { restMinMs, stepMs } = CONFIG.garden;
  const last = new Map(world.actors.map(f => [f.species, { x: f.x, y: f.y, moving: false, since: 0, startedAt: 0 }]));
  let now = 0;
  let moves = 0;
  for (let i = 0; i < 2500; i++) {
    world.update(16);
    now += 16;
    for (const f of world.actors) {
      const was = last.get(f.species);
      if (f.moving && !was.moving) {
        assert.ok(now - was.since >= restMinMs - 16, `${f.species} ruht zu kurz: ${now - was.since} ms`);
        assert.ok(isNeighbour(was, f), `${f.species} springt`);
        moves++;
        was.startedAt = now;
      }
      if (!f.moving && was.moving) {
        assert.ok(now - was.startedAt >= stepMs - 16, `${f.species} läuft zu schnell`);
        was.since = now;
      }
      Object.assign(was, { x: f.x, y: f.y, moving: f.moving });
      assert.ok(!(f.x === behind.x && f.y === behind.y), 'kein Freund auf dem Feld hinter der Figur');
    }
    assertConsistent(world, map);
  }
  assert.ok(moves > FRIENDABLE.length, `${moves} Schritte in 40 Sekunden`);
});

test('Neue Freunde stellen sich nicht neben die Figur, damit sie bei reduzierter Bewegung nie eingeschlossen ist', () => {
  for (let i = 0; i < 20; i++) {
    const { world } = gardenWorld({ reducedMotion: true });
    const p = world.player;
    for (const [dx, dy] of NEIGHBOURS) assert.ok(!world.blocked.has(cellKey(p.x + dx, p.y + dy)), `Freund neben der Figur bei (${p.x + dx}, ${p.y + dy})`);
  }
});

test('Bei reduzierter Bewegung bleiben alle stehen; ein neuer Begleiter macht im Garten Platz, der alte kommt zurück', () => {
  const { world, state } = gardenWorld({ reducedMotion: true });
  const { map } = world;
  const before = new Map(world.actors.map(f => [f.species, cellKey(f.x, f.y)]));
  for (let i = 0; i < 600; i++) world.update(16);
  assert.deepEqual(new Map(world.actors.map(f => [f.species, cellKey(f.x, f.y)])), before, 'niemand läuft');
  // Begleiter wechseln (etwa im Menü): Der neue verlässt den Garten, der alte steht wieder darin.
  state.companion = FRIENDABLE[1];
  world.update(16);
  assert.equal(world.actors.length, FRIENDABLE.length - 1);
  assert.ok(!world.actors.some(f => f.species === FRIENDABLE[1]));
  assert.ok(world.actors.some(f => f.species === FRIENDABLE[0]));
  for (const f of world.actors) if (f.species !== FRIENDABLE[0]) assert.equal(cellKey(f.x, f.y), before.get(f.species), `${f.species} bleibt, wo er war`);
  assertConsistent(world, map);
  // Ohne Begleiter: alle im Garten. Ohne Freunde: niemand, und kein Feld bleibt belegt.
  state.companion = null;
  world.update(16);
  assert.equal(world.actors.length, FRIENDABLE.length);
  assertConsistent(world, map);
  state.friends = {};
  world.update(16);
  assert.deepEqual([world.actors.length, world.blocked.size], [0, 0]);
});

test('A ins Leere neben den Freunden: Der Garten-Handler lässt den Begleiter sprechen', async () => {
  const { world } = gardenWorld({ reducedMotion: true });
  const { free } = gardenCells(world.map);
  const empty = free.find(c => !world.blocked.has(cellKey(c.x, c.y)));
  for (const fn of world.onInteract.slice(0, 2)) assert.equal(await fn({ target: null, x: empty.x, y: empty.y }), false);
  assert.equal(await world.onInteract[0]({ target: { type: 'sign', role: 'fogEdge' }, x: 0, y: 0 }), false);
});

test('Das Schild im Garten: erst seine eigenen Zeilen, dann die Zahl der Freunde, ohne Freunde ein Hinweis', () => {
  const sign = GARTEN.objects.find(o => o.role === 'friendCount');
  const max = FRIENDABLE.length;
  const state = { friends: {}, companion: null };
  assert.deepEqual(friendCountLines(state, sign), [...sign.lines, t('garden.count', { n: 0, max }), t('friends.none')]);
  makeFriend(state, 'moosling', false);
  makeFriend(state, 'gischtling', true);
  setCompanion(state, 'gischtling');
  assert.deepEqual(friendCountLines(state, sign), [...sign.lines, t('garden.count', { n: 2, max })], 'der Begleiter zählt mit');
  setLanguage('en');
  try {
    const lines = friendCountLines(state, sign);
    assert.deepEqual(lines, [...EN_WORLD.objects.garten['garten-schild'].lines, t('garden.count', { n: 2, max })]);
    assert.ok(lines.every(l => !/[äöüß]|Freunde/.test(l)), lines.join(' | '));
  } finally {
    setLanguage('de');
  }
});

// In Node gibt es kein Canvas: Jedes Kleinbild scheitert hier so, wie ein kaputtes Bild im Browser.
// Kein anderer Test dieser Datei zeichnet, daher hat noch kein Wesen gewarnt.
test('Kleinbild lässt sich nicht bauen: eine Warnung je Wesen, Garten und Begleiter lassen es nur weg', t => {
  const warnings = [];
  t.mock.method(console, 'warn', (...args) => warnings.push(String(args[0])));
  const { world, game } = gardenWorld({ reducedMotion: true });
  addCompanion(world, game);
  const spot = gardenCells(world.map).free.find(c => !world.blocked.has(cellKey(c.x, c.y)) && !world.blocked.has(cellKey(c.x, c.y + 1)));
  world.player.teleport(spot.x, spot.y, 'up');
  const ctx = stubContext();
  for (let round = 0; round < 3; round++) {
    world.update(16);
    for (const a of world.actors) {
      a.z();
      const cam = a.species ? { x: a.x * 16 - 100, y: a.y * 16 - 60 } : { x: spot.x * 16 - 100, y: spot.y * 16 - 60 };
      assert.doesNotThrow(() => a.draw(ctx, cam));
    }
  }
  assert.deepEqual(ctx.calls, [], 'nichts gezeichnet, auch kein Schatten');
  const species = warnings.map(w => w.match(/"(\w+)"/)?.[1]);
  assert.equal(new Set(species).size, species.length, 'je Wesen nur einmal');
  assert.deepEqual([...species].sort(), [...FRIENDABLE].sort(), 'alle Freunde im Garten und der Begleiter');
  // Auch die andere Farbe desselben Wesens warnt nicht noch einmal.
  assert.equal(miniImages(FRIENDABLE[1], true), null);
  assert.equal(miniImages(FRIENDABLE[1], false), null);
  assert.equal(warnings.length, FRIENDABLE.length);
});
