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

test('Steuerung: Steuerkreuz mindestens 140 px, A und B mindestens 64 px, Menü- und Rucksack-Knöpfe mindestens 48 px', () => {
  const dpad = size('#pad .dpad');
  assert.ok(dpad.w >= 140 && dpad.h >= 140, JSON.stringify(dpad));
  for (const b of ['#pad .pad-btn.a', '#pad .pad-btn.b']) {
    const s = size(b);
    assert.ok(s.w >= 64 && s.h >= 64, `${b}: ${JSON.stringify(s)}`);
  }
  for (const b of ['.menu-btn', '.bag-btn', '.bp-close']) {
    const s = size(b);
    assert.ok(s.w >= 48 && s.h >= 48, `${b}: ${JSON.stringify(s)}`);
  }
  // Die Plätze im Rucksack (Gegenstände, Schätze, Schlüssel)
  assert.ok(Number(css.match(/\.backpack \{[^}]*--slot:\s*(\d+)px/)?.[1]) >= 48, '.backpack --slot');
  assert.match(css, /env\(safe-area-inset-bottom\)/, 'Abstand zum Rand des iPads');
});

// Lumara 1.3.1: In schmalen Fenstern (iPad Split View, Slide Over) bis 320 px überlappen A und das
// Steuerkreuz nicht; dazwischen bleiben mindestens 8 px. Ohne die Regel ab 370 px ebenso.
test('Steuerung im schmalen Fenster: A und Steuerkreuz bis 320 px mit mindestens 8 px Abstand', () => {
  // Der Regelblock, dessen Zeile mit genau diesem Selektor beginnt.
  const rule = (text, sel) => {
    const m = new RegExp(`\\n *${sel.replace(/\./g, '\\.')} \\{([^}]*)\\}`).exec(text);
    assert.ok(m, sel);
    return m[1];
  };
  const px = (block, prop) => Number(block.match(new RegExp(`(?:^|[\\s;{])${prop}:\\s*(?:calc\\()?(\\d+)px`))?.[1]);
  const at = css.indexOf('@media (max-width: 369px) {');
  assert.ok(at > 0, 'eigene Regel für schmale Fenster');
  const narrow = css.slice(at, css.indexOf('\n}', at) + 2);
  const dpadW = px(rule(css, '#pad .dpad'), 'width');
  const gap = (w, text) => w - px(rule(text, '#pad .dpad'), 'right') - dpadW - (px(rule(text, '#pad .ab'), 'left') + px(rule(text, '#pad .ab'), 'width'));
  assert.ok(gap(370, css) >= 8, `370 px ohne die Regel: ${gap(370, css)}`);
  for (const w of [320, 369]) assert.ok(gap(w, narrow) >= 8, `${w} px: ${gap(w, narrow)}`);
  // A bleibt mindestens 64 px, B und das Steuerkreuz behalten ihre Größe.
  const a = rule(narrow, '#pad .pad-btn.a');
  assert.ok(px(a, 'width') >= 64 && px(a, 'height') >= 64, a);
  assert.ok(!narrow.includes('.pad-btn.b') && !/width/.test(rule(narrow, '#pad .dpad')));
  // A (oben rechts) und B (unten links) passen nebeneinander in das schmalere Feld.
  assert.ok(px(rule(narrow, '#pad .ab'), 'width') >= px(a, 'width') + px(rule(css, '#pad .pad-btn.b'), 'width'));
});
