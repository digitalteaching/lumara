import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../css/spiel.css', import.meta.url), 'utf8');

const rule = selector => {
  const i = css.indexOf(`${selector} {`);
  assert.ok(i >= 0, selector);
  return css.slice(i, css.indexOf('}', i));
};
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const lum = rgb => {
  const [r, g, b] = rgb.map(v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const blend = (rgba, under) => rgba.slice(0, 3).map((v, i) => v * rgba[3] + under[i] * (1 - rgba[3]));

test('Zeitbalken: Die Beschriftung ist auf jeder Füllung gut lesbar (mindestens 4,5 : 1)', () => {
  const label = rule('.timebar-label');
  assert.match(label, /color: var\(--cream\)/);
  const m = label.match(/background: rgba\((\d+), (\d+), (\d+), ([\d.]+)\)/);
  assert.ok(m, 'die Beschriftung hat einen eigenen dunklen Hintergrund');
  const back = m.slice(1).map(Number);
  const cream = hex('#f3ecd2');
  // Unter der Beschriftung kann jede Füllung liegen: Gold, Rot gestreift, Blau oder die leere Spur.
  for (const fill of ['#e0b34a', '#e2553f', '#b8321f', '#5a9fd6', '#fffaf0']) {
    assert.ok(contrast(cream, blend(back, hex(fill))) >= 4.5, fill);
  }
});
