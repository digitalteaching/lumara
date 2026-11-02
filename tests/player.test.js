import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMap } from '../js/world/map.js';
import { createPlayer } from '../js/world/player.js';
import { TEST_MAP_DEF } from './helpers/fixtures.js';

test('gehaltene Richtung: nach msPerTile genau ein Feld und ein stepped-Ereignis', () => {
  const m = createMap(TEST_MAP_DEF), p = createPlayer({ x: 1, y: 2, dir: 'up' });
  assert.deepEqual(p.update(100, { dir: 'down', a: false }, m), []);
  assert.equal(p.moving, true);
  assert.deepEqual(p.update(120, { dir: null, a: false }, m), [{ type: 'stepped', x: 1, y: 3 }]);
  assert.equal(p.moving, false);
  assert.equal(p.dir, 'down');
});

test('cancelMove nimmt den bei gehaltener Taste schon begonnenen nächsten Schritt zurück', () => {
  const m = createMap(TEST_MAP_DEF), p = createPlayer({ x: 2, y: 3, dir: 'up' });
  p.update(100, { dir: 'up', a: false }, m);
  const ev = p.update(130, { dir: 'up', a: false }, m);
  assert.deepEqual(ev, [{ type: 'stepped', x: 2, y: 2 }]);
  assert.equal(p.moving, true);
  p.cancelMove();
  assert.deepEqual({ x: p.x, y: p.y, moving: p.moving }, { x: 2, y: 2, moving: false });
  assert.deepEqual(p.pixel(), { x: 32, y: 32 });
});

test('gegen Wasser dreht sich die Figur nur um', () => {
  const m = createMap(TEST_MAP_DEF), p = createPlayer({ x: 1, y: 3, dir: 'down' });
  p.update(16, { dir: 'right', a: false }, m);
  assert.equal(p.dir, 'right');
  assert.equal(p.moving, false);
  assert.equal(p.x, 1);
});

test('A meldet das Feld und das Objekt in Blickrichtung', () => {
  const m = createMap(TEST_MAP_DEF), p = createPlayer({ x: 1, y: 2, dir: 'up' });
  const [ev] = p.update(16, { dir: null, a: true }, m);
  assert.equal(ev.type, 'interact');
  assert.equal(ev.target.type, 'trainer');
});
