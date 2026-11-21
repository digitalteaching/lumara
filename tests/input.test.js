import { test } from 'node:test';
import assert from 'node:assert/strict';
import { keyToButton, dpadDirection, BUTTONS } from '../js/core/input.js';

test('Pfeile/WASD laufen, Enter/Leertaste = A, Esc/Rücktaste = B, M = Menü', () => {
  assert.equal(keyToButton('ArrowUp', false), 'up');
  assert.equal(keyToButton('a', false), 'left');
  assert.equal(keyToButton('D', false), 'right');
  assert.equal(keyToButton('Enter', false), 'a');
  assert.equal(keyToButton(' ', false), 'a');
  assert.equal(keyToButton('Escape', false), 'b');
  assert.equal(keyToButton('Backspace', false), 'b');
  assert.equal(keyToButton('m', false), 'menu');
  assert.equal(keyToButton('x', false), null);
});

test('R öffnet den Rucksack, auch groß geschrieben, im Textfeld nicht', () => {
  assert.equal(keyToButton('r', false), 'bag');
  assert.equal(keyToButton('R', false), 'bag');
  assert.equal(keyToButton('r', true), null);
  assert.ok(BUTTONS.includes('bag'));
});

test('Prüffokus: im Textfeld löst keine Taste eine Spielaktion aus', () => {
  for (const k of ['w', 'a', 's', 'd', 'm', ' ', 'Enter', 'Escape', 'Backspace', 'ArrowLeft']) {
    assert.equal(keyToButton(k, true), null);
  }
});

test('Steuerkreuz: stärkere Achse gewinnt, Gleichstand waagerecht, Mitte ist tot', () => {
  assert.equal(dpadDirection(30, 10, 12), 'right');
  assert.equal(dpadDirection(-5, -40, 12), 'up');
  assert.equal(dpadDirection(20, 20, 12), 'right');
  assert.equal(dpadDirection(4, 3, 12), null);
});
