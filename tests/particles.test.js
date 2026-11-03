import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../js/core/rng.js';
import { createParticles, PARTICLE_LIMITS } from '../js/gfx/particles.js';
import { BUCHT } from '../js/world/maps/bucht.js';
import { WALD } from '../js/world/maps/wald.js';

const count = (p, k) => {
  let n = 0;
  p.each(q => {
    if (!k || q.kind === k) n++;
  });
  return n;
};

test('Grenzen je Art', () => {
  assert.deepEqual(PARTICLE_LIMITS, { gull: 2, spray: 12, firefly: 14, leaf: 10 });
});

test('nie mehr Teilchen als erlaubt, bei Bewegung reduzieren höchstens ein Viertel', () => {
  const p = createParticles(['firefly', 'leaf'], { rng: createRng(1), reducedMotion: false });
  for (let i = 0; i < 600; i++) p.update(16, { x: 0, y: 0 });
  assert.ok(count(p, 'firefly') <= 14 && count(p, 'firefly') > 0);
  assert.ok(count(p, 'leaf') <= 10 && count(p, 'leaf') > 0);
  const r = createParticles(['firefly'], { rng: createRng(1), reducedMotion: true });
  for (let i = 0; i < 600; i++) r.update(16, { x: 0, y: 0 });
  assert.ok(count(r) <= 4 && count(r) > 0);
});

test('Glühwürmchen glimmen langsam, höchstens dreimal pro Sekunde', () => {
  const p = createParticles(['firefly'], { rng: createRng(2), reducedMotion: false });
  for (let i = 0; i < 200; i++) p.update(16, { x: 0, y: 0 });
  assert.ok(count(p) > 0);
  p.each(q => assert.ok(q.blinkHz <= 3));
});

test('Gischt entsteht nur an den Uferstellen, die zu sehen sind', () => {
  const shore = [[40, 40], [1000, 1000]];
  const p = createParticles(['spray'], { rng: createRng(3), reducedMotion: false, shore });
  for (let i = 0; i < 300; i++) p.update(16, { x: 0, y: 0 });
  assert.ok(count(p) > 0 && count(p) <= 12);
  p.each(q => assert.ok(Math.abs(q.x - 40) <= 8 && Math.abs(q.y - 40) <= 8, `${q.x},${q.y}`));
  const none = createParticles(['spray'], { rng: createRng(3), reducedMotion: false, shore: [] });
  for (let i = 0; i < 300; i++) none.update(16, { x: 0, y: 0 });
  assert.equal(count(none), 0);
});

test('Wechsel auf „Bewegung reduzieren“ kürzt sofort auf ein Viertel', () => {
  let reduced = false;
  const p = createParticles(['firefly'], { rng: createRng(4), reducedMotion: () => reduced });
  for (let i = 0; i < 600; i++) p.update(16, { x: 0, y: 0 });
  reduced = true;
  p.update(16, { x: 0, y: 0 });
  assert.ok(count(p) <= 4);
});

test('Bucht und Wald haben ihre Teilchen', () => {
  assert.deepEqual(BUCHT.particles, ['gull', 'spray']);
  assert.deepEqual(WALD.particles, ['firefly', 'leaf']);
});
