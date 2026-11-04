// Mindestgrößen der Touch-Steuerung (Design 13): Steuerkreuz mindestens 140 px, A und B mindestens
// 64 px, alle Tippflächen mindestens 48 px. Die Größen stehen in css/spiel.css.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../css/spiel.css', import.meta.url), 'utf8');
// Die Breite und Höhe in px aus dem ersten Regelblock zu diesem Selektor.
function size(selector) {
  const at = css.indexOf(`${selector} {`);
  assert.ok(at >= 0, selector);
  const block = css.slice(at, css.indexOf('}', at));
  const px = prop => Number(block.match(new RegExp(`(?:^|[\\s;{])${prop}:\\s*(\\d+)px`))?.[1]);
  return { w: px('width'), h: px('height') };
}

test('Steuerung: Steuerkreuz mindestens 140 px, A und B mindestens 64 px, Menüknopf mindestens 48 px', () => {
  const dpad = size('#pad .dpad');
  assert.ok(dpad.w >= 140 && dpad.h >= 140, JSON.stringify(dpad));
  for (const b of ['#pad .pad-btn.a', '#pad .pad-btn.b']) {
    const s = size(b);
    assert.ok(s.w >= 64 && s.h >= 64, `${b}: ${JSON.stringify(s)}`);
  }
  const menu = size('.menu-btn');
  assert.ok(menu.w >= 48 && menu.h >= 48, JSON.stringify(menu));
  assert.match(css, /env\(safe-area-inset-bottom\)/, 'Abstand zum Rand des iPads');
});
