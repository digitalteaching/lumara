import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMap } from '../js/world/map.js';
import { createPlayer } from '../js/world/player.js';
import { isSliding } from '../js/world/slide.js';
import { createFollower } from '../js/world/follower.js';
import { readFileSync } from 'node:fs';
import { createWorldScene } from '../js/scenes/world.js';
import { addCompanion } from '../js/scenes/companion.js';
import { FRIENDABLE, GIFTS, companionOf, makeFriend } from '../js/friends/friends.js';
import { DE } from '../js/i18n/de.js';
import { EN } from '../js/i18n/en.js';
import { FR } from '../js/i18n/fr.js';
import { ES } from '../js/i18n/es.js';

// Eine Wiese mit Bäumen am Rand und einem Felsen bei (2,3).
const MEADOW = {
  name: 'wiese-test',
  rows: [
    '##############',
    '#............#',
    '#............#',
    '#.o..........#',
    '#............#',
    '#............#',
    '#............#',
    '#............#',
    '##############',
  ],
  legend: { '#': 'tree', '.': 'grass', o: 'rock' },
  objects: [],
};

// Ein Gang: zwei Felder Schnee, drei Felder Rutscheis, dann wieder Schnee.
const ICE = {
  name: 'eis-test',
  rows: ['########', '#ssiiis#', '########'],
  legend: { '#': 'icewall', s: 'snow', i: 'slideice' },
  objects: [],
};

const cell = f => [f.x, f.y];

// Ein Schritt der Spielschleife: wie in der Welt erst vor dem Schritt der Figur (world.onTick),
// dann noch einmal vor dem Zeichnen.
function tick(map, p, f, dir) {
  f.update();
  const events = p.update(16, { dir: isSliding(map, p) ? p.dir : dir, a: false }, map);
  f.update();
  return events;
}

// Läuft n Felder in eine Richtung (die Taste bleibt gedrückt, bis der letzte Schritt begonnen hat)
// und wartet, bis die Figur steht.
function walk(map, p, f, dir, n) {
  let steps = 0;
  for (let i = 0; i < 400 && (steps < n || p.moving); i++) {
    const begun = steps + (p.moving ? 1 : 0);
    for (const ev of tick(map, p, f, begun < n ? dir : null)) if (ev.type === 'stepped') steps++;
  }
  assert.equal(p.moving, false);
}

test('Hinter der Figur: Gegenrichtung, sonst auf ihrem Feld', () => {
  const map = createMap(MEADOW);
  const p = createPlayer({ x: 2, y: 2, dir: 'down' });
  const f = createFollower(map, p);
  assert.deepEqual(cell(f), [2, 1]);
  assert.deepEqual([f.fromX, f.fromY], [2, 1]);
  assert.equal(f.hidden(), false);
  assert.deepEqual(f.pixel(), { x: 32, y: 16 });

  // Mit dem Rücken zum Felsen: Hinter der Figur ist kein Platz.
  const q = createPlayer({ x: 2, y: 2, dir: 'up' });
  const g = createFollower(map, q);
  assert.deepEqual(cell(g), [2, 2]);
  assert.equal(g.hidden(), true);
  // Ebenso, wenn dort etwas liegt (zusätzlich belegte Felder wie ein seltener Stein).
  assert.deepEqual(cell(createFollower(map, p, new Set(['2,1']))), [2, 2]);
  // Geht die Figur weg, bleibt er auf dem Feld und ist wieder zu sehen.
  walk(map, q, g, 'right', 1);
  assert.deepEqual([cell(q), cell(g)], [[3, 2], [2, 2]]);
  assert.equal(g.hidden(), false);
});

test('Er geht auf das Feld, das die Figur gerade verlassen hat', () => {
  const map = createMap(MEADOW);
  const p = createPlayer({ x: 4, y: 4, dir: 'down' });
  const f = createFollower(map, p);
  assert.deepEqual(cell(f), [4, 3]);
  walk(map, p, f, 'right', 1);
  assert.deepEqual([cell(p), cell(f)], [[5, 4], [4, 4]]);
  assert.equal(f.dir, 'down');

  // Drei Schritte mit gehaltener Taste: im selben Tempo wie die Figur, immer genau ein Feld dahinter,
  // auch an den Feldgrenzen, wo gleich der nächste Schritt beginnt.
  let steps = 0;
  for (let i = 0; i < 400 && (steps < 3 || p.moving); i++) {
    const begun = steps + (p.moving ? 1 : 0);
    for (const ev of tick(map, p, f, begun < 3 ? 'right' : null)) if (ev.type === 'stepped') steps++;
    if (p.moving) {
      assert.equal(p.pixel().x - f.pixel().x, 16, `Bild ${i}`);
      assert.equal(f.pixel().y, p.pixel().y);
    }
  }
  assert.deepEqual([cell(p), cell(f)], [[8, 4], [7, 4]]);
  assert.deepEqual([f.fromX, f.fromY], [6, 4]);
  assert.equal(f.dir, 'right');
  assert.equal(f.hidden(), false);
});

test('Läuft die Figur auf ihn zu, tauschen sie die Plätze', () => {
  const map = createMap(MEADOW);
  const p = createPlayer({ x: 4, y: 4, dir: 'down' });
  const f = createFollower(map, p);
  assert.deepEqual(cell(f), [4, 3]);
  walk(map, p, f, 'up', 1);
  assert.deepEqual([cell(p), cell(f)], [[4, 3], [4, 4]]);
  assert.equal(f.dir, 'down');
  walk(map, p, f, 'down', 1);
  assert.deepEqual([cell(p), cell(f)], [[4, 4], [4, 3]]);
  assert.equal(f.dir, 'up');
});

test('Nach einem Teleport steht er wieder hinter der Figur', () => {
  const map = createMap(MEADOW);
  const p = createPlayer({ x: 4, y: 4, dir: 'down' });
  const f = createFollower(map, p);
  p.teleport(10, 5, 'up');
  f.update();
  assert.deepEqual(cell(f), [10, 6]);
  assert.deepEqual([f.fromX, f.fromY], [10, 6]);
  assert.equal(f.dir, 'up');
  assert.deepEqual(f.pixel(), { x: 160, y: 96 });
  // Auch ein Teleport auf ein Nachbarfeld setzt ihn neu hinter die Figur, statt ihn vor ihr stehen zu
  // lassen (er stand bei 10,6, die Figur schaut nach links).
  p.teleport(10, 7, 'left');
  f.update();
  assert.deepEqual(cell(f), [11, 7]);
  assert.deepEqual([f.fromX, f.fromY], [11, 7]);
  assert.equal(f.dir, 'left');
  // Ebenso auf sein eigenes Feld: Er wäre sonst unter der Figur verschwunden.
  p.teleport(11, 7, 'down');
  f.update();
  assert.deepEqual(cell(f), [11, 6]);
  assert.equal(f.hidden(), false);
  // Ohne neuen Teleport bleibt er stehen, auch bei vielen Aufrufen.
  f.update();
  f.update();
  assert.deepEqual(cell(f), [11, 6]);
});

test('Ein Schritt, den die Welt gleich zurücknimmt, versetzt ihn nicht', () => {
  const map = createMap(MEADOW);
  const p = createPlayer({ x: 4, y: 4, dir: 'right' });
  const f = createFollower(map, p);
  walk(map, p, f, 'right', 1);
  assert.deepEqual([cell(p), cell(f)], [[5, 4], [4, 4]]);
  // Wie in world.update: Ein Schritt beginnt und wird im selben Bild zurückgenommen (etwa weil auf dem
  // Feld davor gerade ein wildes Wesen erscheint). Dazwischen ruft niemand update().
  f.update();
  p.update(16, { dir: 'down', a: false }, map);
  p.cancelMove();
  f.update();
  assert.deepEqual([cell(p), cell(f)], [[5, 4], [4, 4]]);
});

test('Auf Rutscheis folgt er Feld für Feld', () => {
  const map = createMap(ICE);
  const p = createPlayer({ x: 2, y: 1, dir: 'right' });
  const f = createFollower(map, p);
  assert.deepEqual(cell(f), [1, 1]);
  const seen = [f.x];
  let steps = 0;
  for (let i = 0; i < 400 && (steps < 1 || p.moving); i++) {
    // Nur der erste Schritt aufs Eis kommt von der Eingabe, danach gleitet die Figur.
    for (const ev of tick(map, p, f, steps < 1 ? 'right' : null)) if (ev.type === 'stepped') steps++;
    if (p.moving) assert.deepEqual(cell(f), [p.x - 1, 1]);
    if (seen.at(-1) !== f.x) seen.push(f.x);
  }
  assert.equal(steps, 4, 'ein Schritt aufs Eis und drei Felder gleiten');
  assert.deepEqual([cell(p), cell(f)], [[6, 1], [5, 1]]);
  assert.deepEqual(seen, [1, 2, 3, 4, 5]);
});

// ---------- Der Begleiter in der Welt (js/scenes/companion.js) ----------

const fakeGame = state => ({
  state,
  mode: 'walk',
  reducedMotion: true,
  input: { dir: () => null, pressed: () => false },
});
const noDrawing = new Proxy({}, { get: () => assert.fail('ohne Begleiter wird nichts gezeichnet') });

test('Begleiter in der Welt: wird er gesetzt, steht er sofort hinter der Figur; ohne ihn wird nichts gezeichnet', async () => {
  const state = { companion: null, friends: {} };
  const world = createWorldScene(fakeGame(state), { ...MEADOW, id: 'wiese-test', spawn: { x: 4, y: 4, dir: 'down' } });
  const before = world.onInteract.length;
  addCompanion(world, fakeGame(state));
  assert.equal(world.actors.length, 1);
  assert.equal(world.onInteract.length, before + 1);
  const [actor] = world.actors;
  const speak = world.onInteract.at(-1);

  assert.equal(actor.z(), 3); // unsichtbar auf (4,3)
  actor.draw(noDrawing, { x: 0, y: 0 });
  assert.equal(await speak({ target: null, x: 4, y: 5 }), false);

  // Nach einem Teleport ein Feld weiter steht er (noch unsichtbar) gleich wieder hinter der Figur.
  world.player.teleport(4, 2, 'down');
  world.update(16);
  assert.equal(actor.z(), 1);
  // Die Figur dreht sich auf der Stelle um (etwa gegen eine Wand): Nun steht er ein Feld vor ihr.
  // Erst mit dem Begleiter rückt er nach hinten.
  world.player.dir = 'up';
  world.update(16);
  assert.equal(actor.z(), 1);
  makeFriend(state, FRIENDABLE[0], false);
  state.companion = FRIENDABLE[0];
  assert.equal(actor.z(), 3);
  assert.equal(await speak({ target: { type: 'sign' }, x: 4, y: 3 }), false, 'vor einem Objekt schweigt er');

  // Kein Freund (etwa ein alter Spielstand): kein Begleiter.
  state.companion = FRIENDABLE[1];
  actor.z();
  actor.draw(noDrawing, { x: 0, y: 0 });
  assert.equal(companionOf(state), null);
});

test('Der A-Handler des Begleiters kommt in createGameWorld als letzter dazu', () => {
  const src = readFileSync(new URL('../js/scenes/worldEvents.js', import.meta.url), 'utf8');
  const body = src.slice(src.indexOf('export function createGameWorld'));
  assert.ok(body.indexOf('addCompanion(world, game);') > body.lastIndexOf('onInteract.'), 'nach addCompanion kommt kein Handler mehr');
  assert.match(body, /addCompanion\(world, game\);\n {2}return world;\n\}/);
});

test('Begleiter-Texte: je Gabe zwei kurze Sätze in jeder Sprache', () => {
  for (const [lang, table] of Object.entries({ de: DE, en: EN, fr: FR, es: ES })) {
    for (const gift of GIFTS) {
      const lines = table[`companion.${gift}`];
      assert.ok(Array.isArray(lines) && lines.length === 2, `${lang}: companion.${gift}`);
      for (const line of lines) assert.ok(line.trim() && line.length <= 60, `${lang}: ${line} (${line.length} Zeichen)`);
    }
  }
});
