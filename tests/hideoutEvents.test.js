// Verstecke in einer echten Weltszene (js/scenes/hideoutEvents.js): Szene, Sperre, Doppeltipp,
// „Bewegung reduzieren“ und das Duell. Wege mit Dialog oder Antwort-Panel brauchen das DOM; sie
// prüft der Controller im Browser.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createWorldScene } from '../js/scenes/world.js';
import { addCompanion } from '../js/scenes/companion.js';
import { addHideouts } from '../js/scenes/hideoutEvents.js';
import { MAPS } from '../js/world/network.js';
import { createMap } from '../js/world/map.js';
import { newGameState } from '../js/state.js';
import { createRng } from '../js/core/rng.js';
import { FRIENDABLE, giftOf, makeFriend } from '../js/friends/friends.js';
import { HIDEOUTS } from '../js/data/hideouts.js';
import { hideoutReady } from '../js/world/hideouts.js';
import { HIDDEN_SPECIES } from '../js/data/species.js';
import { CONFIG } from '../js/config.js';
import { stubContext } from './helpers/fixtures.js';

const NEAR = [[0, 1], [1, 0], [0, -1], [-1, 0]];
const FACING = ([dx, dy]) => (dx > 0 ? 'left' : dx < 0 ? 'right' : dy > 0 ? 'up' : 'down');

// Die Figur steht auf einem Vorfeld des Verstecks und schaut es an, dahinter der Begleiter.
function setupWorld({ id = 'see-icehole', gift = null, reducedMotion = false } = {}) {
  const h = HIDEOUTS.find(x => x.id === id);
  const def = MAPS[h.map];
  const map = createMap(def);
  const d = NEAR.find(([dx, dy]) => map.canEnter(h.x + dx, h.y + dy));
  const front = { x: h.x + d[0], y: h.y + d[1], dir: FACING(d) };
  const state = newGameState({ name: 'A', species: 'nixi', nickname: null });
  state.position = { map: h.map, ...front };
  const friend = FRIENDABLE.find(x => giftOf(x) === (gift ?? h.gift));
  makeFriend(state, friend, false);
  state.companion = friend;
  const log = [];
  const game = {
    state,
    reducedMotion,
    mode: 'walk',
    rng: createRng(5),
    pack: { data: { shortId: 'versteck-test', trainers: [], notes: [] } },
    save: () => log.push('save'),
    input: { dir: () => null, pressed: () => false },
  };
  const world = createWorldScene(game, def, {});
  const duels = [];
  addHideouts(world, game, {
    wildDuel: async setup => {
      log.push('duel');
      duels.push(setup);
    },
    levelUps: async () => {},
  });
  addCompanion(world, game);
  world.update(16); // der Begleiter stellt sich hinter die Figur
  return { h, world, state, log, duels, front, handler: world.onInteract[0] };
}

const ticks = (world, ms) => {
  for (let i = 0; i < ms; i += 16) world.update(16);
};
const alertDrawn = world => {
  const ctx = stubContext();
  for (const fn of world.afterRender) fn(ctx, world.camera());
  return ctx.calls.some(c => c[0] === 'set' && c[1] === 'fillStyle' && c[2] === '#1b1a2e');
};

test('Der Versteck-Handler kommt zuerst und reagiert nur auf das Feld eines Verstecks', async () => {
  const { h, front, handler } = setupWorld();
  assert.equal(await handler({ target: { type: 'npc' }, x: h.x, y: h.y }), false);
  assert.equal(await handler({ target: null, x: front.x, y: front.y }), false);
});

test('Wesen-Versteck: Szene, gespeichert, dann ein Duell mit dem versteckten Wesen; ein zweites A startet nichts', async () => {
  const { h, world, state, log, duels, handler } = setupWorld();
  const start = world.companion.pixel();
  const run = handler({ target: null, x: h.x, y: h.y });
  assert.equal(await handler({ target: null, x: h.x, y: h.y }), true, 'Doppeltipp: schon in Arbeit');
  let moved = false;
  for (let ms = 0; ms < CONFIG.hideouts.sceneMs - 16; ms += 16) {
    world.update(16);
    const p = world.companion.pixel();
    if (p.x !== start.x || p.y !== start.y) moved = true;
  }
  assert.ok(moved, 'der Begleiter läuft zum Versteck');
  assert.deepEqual(log, [], 'vor dem Ende der Szene passiert nichts');
  ticks(world, 32);
  await run;
  const area = MAPS[h.map].area;
  assert.deepEqual(log, ['save', 'duel']);
  assert.equal(duels.length, 1);
  assert.equal(duels[0].kind, 'wild');
  assert.equal(duels[0].foe.species, HIDDEN_SPECIES[area - 1]);
  assert.equal(duels[0].foe.level, CONFIG.wild.levelByArea[area - 1][1]);
  assert.equal(hideoutReady(state, h), false, 'gleich leer, auch wenn das Spiel im Duell endet');
  assert.deepEqual(world.companion.pixel(), start, 'danach wieder hinter der Figur');
});

test('Bewegung reduzieren: kürzere Szene, der Begleiter bleibt stehen', async () => {
  const { h, world, duels, handler } = setupWorld({ id: 'wiese-pawprints', reducedMotion: true });
  const start = world.companion.pixel();
  const run = handler({ target: null, x: h.x, y: h.y });
  for (let ms = 0; ms < CONFIG.hideouts.sceneMsReduced - 16; ms += 16) {
    world.update(16);
    assert.deepEqual(world.companion.pixel(), start);
  }
  assert.equal(duels.length, 0);
  ticks(world, 32);
  await run;
  assert.equal(duels.length, 1);
  assert.equal(duels[0].foe.species, HIDDEN_SPECIES[7]);
});

test('„!“ über dem Begleiter: nur mit passender Gabe und nicht, solange die Welt gesperrt ist', async () => {
  const { world } = setupWorld();
  assert.equal(alertDrawn(world), true);
  let release;
  const held = world.lock(() => new Promise(r => (release = r)));
  assert.equal(alertDrawn(world), false);
  release();
  await held;
  assert.equal(alertDrawn(world), true);
  assert.equal(alertDrawn(setupWorld({ gift: 'climb' }).world), false, 'ein Kletterer am Eisloch');
});

test('Karten ohne Verstecke (Garten, Höhle, geheime Orte) bekommen keine Handler', () => {
  for (const id of ['garten', 'hoehle1', 'eisgrotte']) {
    const def = MAPS[id];
    const game = { state: newGameState({ name: 'A', species: 'nixi', nickname: null }), reducedMotion: false, input: { dir: () => null, pressed: () => false } };
    const world = createWorldScene(game, def, {});
    const counts = () => [world.onInteract.length, world.groundRender.length, world.afterRender.length];
    const before = counts();
    addHideouts(world, game, { wildDuel: async () => {}, levelUps: async () => {} });
    assert.deepEqual(counts(), before, id);
  }
});

test('In createGameWorld: Verstecke vor Garten und Begleiter, mit Duell und Level-Zeilen der Welt', () => {
  const src = readFileSync(new URL('../js/scenes/worldEvents.js', import.meta.url), 'utf8');
  const body = src.slice(src.indexOf('export function createGameWorld'));
  const at = body.indexOf('addHideouts(world, game, { wildDuel, levelUps });');
  assert.ok(at > 0);
  assert.ok(at < body.indexOf('addGarden(world, game)'));
  assert.ok(at < body.indexOf('addCompanion(world, game)'));
});
