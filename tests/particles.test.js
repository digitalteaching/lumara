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
  assert.deepEqual(PARTICLE_LIMITS, { gull: 2, spray: 12, firefly: 14, leaf: 10, spore: 14, bubble: 8, wisp: 3, sand: 12, glint: 10, windstreak: 8, cloud: 4, spark: 10, steam: 6, snow: 16, aurora: 3, fallingstar: 2, glimmer: 12 });
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

test('Neue Teilchen: Grenzen, ein Viertel bei Bewegung reduzieren, Blasen nur an Ankern', () => {
  for (const k of ['spore', 'wisp', 'sand', 'glint', 'windstreak', 'cloud']) {
    const p = createParticles([k], { rng: createRng(5), reducedMotion: false });
    for (let i = 0; i < 900; i++) p.update(16, { x: 0, y: 0 });
    assert.ok(count(p) > 0 && count(p) <= PARTICLE_LIMITS[k], k);
    const r = createParticles([k], { rng: createRng(5), reducedMotion: true });
    for (let i = 0; i < 900; i++) r.update(16, { x: 0, y: 0 });
    assert.ok(count(r) <= Math.ceil(PARTICLE_LIMITS[k] / 4), `${k} reduziert`);
  }
  const b = createParticles(['bubble'], { rng: createRng(6), reducedMotion: false, anchors: { bubble: [[50, 60]] } });
  for (let i = 0; i < 300; i++) b.update(16, { x: 0, y: 0 });
  assert.ok(count(b) > 0);
  b.each(q => assert.ok(Math.abs(q.x - 50) <= 8 && q.y <= 60 + 8));
  const none = createParticles(['bubble'], { rng: createRng(6), reducedMotion: false });
  for (let i = 0; i < 300; i++) none.update(16, { x: 0, y: 0 });
  assert.equal(count(none), 0); // ohne Moorfelder keine Blasen
  const w = createParticles(['wisp', 'glint'], { rng: createRng(7), reducedMotion: false });
  for (let i = 0; i < 300; i++) w.update(16, { x: 0, y: 0 });
  w.each(q => assert.ok((q.blinkHz ?? 0) <= (q.kind === 'wisp' ? 1 : 2), q.kind));
});

test('shore bleibt die Kurzform für die Anker der Gischt', () => {
  const p = createParticles(['spray'], { rng: createRng(8), reducedMotion: false, anchors: { spray: [[30, 30]] } });
  for (let i = 0; i < 200; i++) p.update(16, { x: 0, y: 0 });
  assert.ok(count(p) > 0);
  p.each(q => assert.ok(Math.abs(q.x - 30) <= 8));
});

test('Bei „Bewegung reduzieren“ ziehen die Wolken nicht', () => {
  const p = createParticles(['cloud'], { rng: createRng(9), reducedMotion: true });
  for (let i = 0; i < 400; i++) p.update(16, { x: 0, y: 0 });
  const before = [];
  p.each(q => before.push(q.x));
  assert.ok(before.length > 0);
  for (let i = 0; i < 120; i++) p.update(16, { x: 0, y: 0 });
  const after = [];
  p.each(q => after.push(q.x));
  assert.deepEqual(after.slice(0, before.length), before);
});

test('Teilchen 6 bis 8: Grenzen, ein Viertel, still und ohne Sternschnuppen bei Bewegung reduzieren', () => {
  for (const k of ['steam', 'snow', 'aurora', 'fallingstar', 'glimmer']) {
    const p = createParticles([k], { rng: createRng(5), reducedMotion: false });
    for (let i = 0; i < 900; i++) p.update(16, { x: 0, y: 0 });
    let most = 0;
    for (let i = 0; i < 600; i++) {
      p.update(16, { x: 0, y: 0 });
      most = Math.max(most, count(p));
    }
    assert.ok(most > 0 && most <= PARTICLE_LIMITS[k], k);
    const r = createParticles([k], { rng: createRng(5), reducedMotion: true });
    for (let i = 0; i < 900; i++) r.update(16, { x: 0, y: 0 });
    assert.ok(count(r) <= Math.ceil(PARTICLE_LIMITS[k] / 4), `${k} reduziert`);
  }
  const f = createParticles(['fallingstar'], { rng: createRng(3), reducedMotion: true });
  for (let i = 0; i < 900; i++) f.update(16, { x: 0, y: 0 });
  assert.equal(count(f), 0);
  const s = createParticles(['spark'], { rng: createRng(4), reducedMotion: false, anchors: { spark: [[40, 40]] } });
  for (let i = 0; i < 300; i++) s.update(16, { x: 0, y: 0 });
  assert.ok(count(s) > 0);
  s.each(q => assert.ok(Math.abs(q.x - 40) <= 8 && q.y <= 48, `${q.x},${q.y}`));
  const none = createParticles(['spark'], { rng: createRng(4), reducedMotion: false });
  for (let i = 0; i < 300; i++) none.update(16, { x: 0, y: 0 });
  assert.equal(count(none), 0); // ohne Zahnräder keine Funken
  for (const k of ['aurora', 'steam']) {
    const a = createParticles([k], { rng: createRng(5), reducedMotion: true });
    for (let i = 0; i < 400; i++) a.update(16, { x: 0, y: 0 });
    const before = [];
    a.each(q => before.push([q.x, q.y, q.phase]));
    assert.ok(before.length > 0, k);
    for (let i = 0; i < 100; i++) a.update(16, { x: 0, y: 0 });
    const after = [];
    a.each(q => after.push([q.x, q.y, q.phase]));
    assert.deepEqual(after.slice(0, before.length), before, k);
  }
  const g = createParticles(['glimmer', 'spark'], { rng: createRng(6), reducedMotion: false, anchors: { spark: [[40, 40]] } });
  for (let i = 0; i < 300; i++) g.update(16, { x: 0, y: 0 });
  let n = 0;
  g.each(q => {
    n++;
    assert.ok((q.blinkHz ?? 0) <= 1, q.kind);
  });
  assert.ok(n > 0);
});
