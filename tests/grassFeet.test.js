// Hohes Gras verdeckt die Füße (js/scenes/world.js grassOver): bei der Spielfigur, beim Begleiter und
// bei den Freunden im Garten. Gezeichnet wird in einen Kontext, der nur mitschreibt; die Bilder
// entstehen in einem kleinen Canvas-Ersatz. Eigene Datei, eigener Prozess: document gilt nur hier.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stubContext } from './helpers/fixtures.js';

globalThis.document = {
  createElement: () => ({
    width: 0,
    height: 0,
    getContext: () => ({ createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }), putImageData() {} }),
  }),
};

const { createWorldScene } = await import('../js/scenes/world.js');
const { addCompanion } = await import('../js/scenes/companion.js');
const { addGarden } = await import('../js/scenes/gardenEvents.js');
const { GARTEN } = await import('../js/world/maps/garten.js');
const { FRIENDABLE, makeFriend } = await import('../js/friends/friends.js');

// Eine Wiese, in der Mitte (Spalten 4 bis 7) hohes Gras.
const FIELD = {
  id: 'gras-test',
  name: 'gras-test',
  rows: ['############', '#...,,,,...#', '#...,,,,...#', '#...,,,,...#', '#...,,,,...#', '############'],
  legend: { '#': 'tree', '.': 'grass', ',': 'tallgrass' },
  objects: [],
  spawn: { x: 5, y: 2, dir: 'down' },
};

const fakeGame = state => ({ state, mode: 'walk', reducedMotion: true, input: { dir: () => null, pressed: () => false } });
const CAM = { x: 0, y: 0 };

// Die Grasstreifen, die über eine Figur gezeichnet wurden: Feld, auf dem sie liegen.
const strips = ctx => ctx.calls.filter(c => c[0] === 'drawImage' && c.length === 10 && c[2] === 0 && c[3] === 10).map(c => ({ x: c[6] / 16, y: (c[7] - 10) / 16 }));

function companionWorld(spawn) {
  const state = { friends: {}, companion: null };
  makeFriend(state, FRIENDABLE[0], false);
  state.companion = FRIENDABLE[0];
  const game = fakeGame(state);
  const world = createWorldScene(game, { ...FIELD, spawn });
  addCompanion(world, game);
  world.actors[0].z(); // liest den Begleiter, wie vor dem ersten Bild
  return { world, actor: world.actors[0] };
}

function drawActor(actor) {
  const ctx = stubContext();
  actor.z();
  actor.draw(ctx, CAM);
  return strips(ctx);
}

test('Begleiter auf hohem Gras: Das Gras liegt über seinen Füßen, auf kurzem Gras nicht', () => {
  // Die Figur schaut nach unten, er steht ein Feld darüber im hohen Gras (5,1).
  const { world, actor } = companionWorld({ x: 5, y: 2, dir: 'down' });
  assert.deepEqual(world.companion.cell(), { x: 5, y: 1 });
  assert.deepEqual(drawActor(actor), [{ x: 5, y: 1 }]);
  // Am Rand des hohen Grases: Er steht auf kurzem Gras (2,2) links der Figur.
  const edge = companionWorld({ x: 3, y: 2, dir: 'right' });
  assert.deepEqual(edge.world.companion.cell(), { x: 2, y: 2 });
  assert.deepEqual(drawActor(edge.actor), []);
});

test('Begleiter im Schritt: wie bei der Figur erst ab der Hälfte das Zielfeld', () => {
  // Die Figur geht von (3,2) nach rechts ins Gras; er folgt von (2,2) auf (3,2), beides kurzes Gras.
  // Dann geht sie weiter auf (5,2), er von (3,2) auf (4,2) ins hohe Gras.
  const { world, actor } = companionWorld({ x: 3, y: 2, dir: 'right' });
  const p = world.player;
  const map = world.map;
  p.update(16, { dir: 'right', a: false }, map);
  while (p.moving) p.update(16, { dir: null, a: false }, map);
  actor.z();
  assert.deepEqual(world.companion.cell(), { x: 3, y: 2 });
  p.update(16, { dir: 'right', a: false }, map); // Beginn des Schritts nach (5,2)
  assert.deepEqual(drawActor(actor), [], 'am Anfang des Schritts kein Gras');
  assert.deepEqual(world.companion.cell(), { x: 4, y: 2 });
  while (p.progress <= 0.5) p.update(16, { dir: null, a: false }, map);
  assert.deepEqual(drawActor(actor), [{ x: 4, y: 2 }], 'ab der Hälfte das Gras des Zielfelds');
});

test('In einer Szene (Versteck) nur, solange er genau auf einem Feld steht', () => {
  const { world, actor } = companionWorld({ x: 5, y: 2, dir: 'down' });
  world.companion.setPose({ x: 6 * 16, y: 3 * 16, side: 'right', walking: false });
  assert.deepEqual(drawActor(actor), [{ x: 6, y: 3 }]);
  world.companion.setPose({ x: 6 * 16 + 5, y: 3 * 16, side: 'right', walking: true });
  assert.deepEqual(drawActor(actor), []);
  world.companion.setPose({ x: 9 * 16, y: 3 * 16, side: 'right', walking: false }); // kurzes Gras
  assert.deepEqual(drawActor(actor), []);
});

test('Freunde im Garten auf hohem Gras: Das Gras liegt über ihren Füßen', () => {
  // Der Garten, aber überall, wo sonst Wiese ist, hohes Gras.
  const def = { ...GARTEN, legend: { ...GARTEN.legend, '.': 'tallgrass' } };
  const state = { friends: {}, companion: null, position: { map: 'garten', ...GARTEN.spawn } };
  for (const id of FRIENDABLE.slice(0, 5)) makeFriend(state, id, false);
  const game = fakeGame(state);
  const world = createWorldScene(game, def);
  addGarden(world, game);
  assert.equal(world.actors.length, 5);
  for (const f of world.actors) {
    const ctx = stubContext();
    const cam = { x: f.x * 16 - 100, y: f.y * 16 - 60 };
    f.draw(ctx, cam);
    const want = world.map.isTallGrass(f.x, f.y) ? [{ x: f.x - cam.x / 16, y: f.y - cam.y / 16 }] : [];
    assert.deepEqual(strips(ctx), want, f.species);
  }
  assert.ok(world.actors.some(f => world.map.isTallGrass(f.x, f.y)), 'mindestens einer steht im hohen Gras');
});
