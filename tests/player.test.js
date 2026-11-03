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

test('Anstoßen: einmal pro Drücken gegen dasselbe Feld', () => {
  const map = createMap(TEST_MAP_DEF);
  const p = createPlayer({ x: 2, y: 1, dir: 'up' }); // oben steht ein Baum
  const bumps = dir => p.update(16, { dir, a: false }, map).filter(e => e.type === 'bump');
  assert.deepEqual(bumps('up'), [{ type: 'bump', x: 2, y: 0 }]);
  assert.equal(bumps('up').length, 0);
  assert.equal(bumps('up').length, 0);
  p.update(16, { dir: null, a: false }, map); // loslassen
  assert.equal(bumps('up').length, 1);
  assert.equal(bumps('right').length, 0); // nach rechts ist frei: ein Schritt, kein Anstoßen
});

test('Anstoßen nach einem Richtungswechsel und am Ende eines Schritts', () => {
  const map = createMap(TEST_MAP_DEF);
  const p = createPlayer({ x: 2, y: 1, dir: 'up' });
  assert.equal(p.update(16, { dir: 'up', a: false }, map).filter(e => e.type === 'bump').length, 1); // Baum
  assert.equal(p.update(16, { dir: 'left', a: false }, map).filter(e => e.type === 'bump').length, 1); // Trainer: anderes Feld
  const q = createPlayer({ x: 2, y: 2, dir: 'up' });
  q.update(16, { dir: 'up', a: false }, map); // läuft nach (2,1)
  const ev = q.update(300, { dir: 'up', a: false }, map); // angekommen, oben ist der Baum
  assert.deepEqual(ev.map(e => e.type), ['stepped', 'bump']);
});
