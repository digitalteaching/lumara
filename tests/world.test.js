import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWorldScene } from '../js/scenes/world.js';

const fakeGame = () => ({
  state: null,
  mode: 'screen',
  reducedMotion: true,
  input: { dir: () => 'left', pressed: () => true },
});

test('Intro-Welt (passive) reagiert nicht auf Tasten: die unsichtbare Figur bleibt stehen', () => {
  const world = createWorldScene(fakeGame(), undefined, { hidePlayer: true, passive: true });
  const { x, y } = world.player;
  for (let i = 0; i < 60; i++) world.update(16);
  assert.deepEqual({ x: world.player.x, y: world.player.y, moving: world.player.moving }, { x, y, moving: false });
});

test('normale Welt läuft mit gehaltener Richtung', () => {
  const world = createWorldScene(fakeGame());
  const x = world.player.x;
  for (let i = 0; i < 30; i++) world.update(16);
  assert.notEqual(world.player.x, x);
});
