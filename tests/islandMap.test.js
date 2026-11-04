import { test } from 'node:test';
import assert from 'node:assert/strict';
import { islandMap, mapLabels, caveLabels, breakName } from '../js/world/islandMap.js';
import { MAPS } from '../js/world/network.js';
import { resolveStart } from '../js/world/network.js';
import { newGameState } from '../js/state.js';

const pack = n => ({ trainers: Array.from({ length: n }, (_, i) => ({ number: i + 1 })) });
const st = (stones = [], position = { map: 'bucht', x: 19, y: 24, dir: 'up' }) => ({ ...newGameState({ name: 'A', species: 'nixi', nickname: null }), stones, position });

test('Karte: Ring wie Design 5.2, Nebel nach Paket, Steine und „Du bist hier“', () => {
  const s = { ...st([1, 2, 3, 4, 5]), position: { map: 'moor', x: 19, y: 20, dir: 'up' } };
  const m = islandMap(s, pack(3));
  assert.deepEqual(m.areas.map(a => a.area), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(m.areas.filter(a => a.open).map(a => a.area), [1, 2, 3]); // Stein 4 und 5 leuchten, aber das Paket hat nur 3 Trainer
  assert.deepEqual(m.areas.filter(a => a.lit).map(a => a.area), [1, 2, 3, 4, 5]);
  assert.deepEqual(m.areas.filter(a => a.here).map(a => a.area), [3]);
  assert.deepEqual([m.areas[4].col, m.areas[4].row], [2, 1]); // Windklippen oben
  assert.deepEqual([m.areas[0].col, m.areas[0].row], [2, 5]); // Bucht unten
  assert.deepEqual(m.areas.map(a => [a.col, a.row]), [[2, 5], [1, 4], [1, 3], [1, 2], [2, 1], [3, 2], [3, 3], [3, 4]]);
  assert.deepEqual(m.cave, { col: 2, row: 3, lit: 5 });
  assert.equal(m.areas[2].name, 'Pilzmoor');
  assert.deepEqual(m.areas.map(a => a.name), ['Leuchtturmbucht', 'Flüsterwald', 'Pilzmoor', 'Spiegeldünen', 'Windklippen', 'Uhrwerkruinen', 'Nordlichtsee', 'Sternenwiese']);
});

test('Karte: Nach einem Umzug durch Ilvy steht „Du bist hier“ am neuen Ort', () => {
  const s = st([1, 2, 3, 4, 5], { map: 'klippen', x: 20, y: 18, dir: 'up' });
  s.position = resolveStart(s, pack(4));
  assert.deepEqual(islandMap(s, pack(4)).areas.filter(a => a.here).map(a => a.area), [4]);
});

test('Karte: Jeder Kasten sagt seinen Zustand mit Text, nicht nur mit Farbe', () => {
  assert.deepEqual(mapLabels({ open: true, lit: true, here: false }), ['✦ Leuchtstein leuchtet']);
  assert.deepEqual(mapLabels({ open: true, lit: false, here: true }), ['○ Leuchtstein dunkel', '● Du bist hier']);
  assert.deepEqual(mapLabels({ open: false, lit: true, here: false }), ['☁ Im Nebel']); // Stein aus einem anderen Paket
  assert.deepEqual(caveLabels({ lit: 0 }), ['Berg mit Höhle', '0 von 8 Fassungen leuchten']);
  assert.deepEqual(caveLabels({ lit: 8 }), ['Berg mit Höhle', '8 von 8 Fassungen leuchten']);
});

test('Gebietsnamen trennen an der richtigen Stelle (weicher Trennstrich), etwa „Uhrwerk-ruinen“', () => {
  assert.equal(breakName('Uhrwerkruinen'), 'Uhrwerk\u00adruinen');
  assert.equal(breakName('Leuchtturmbucht'), 'Leucht\u00adturm\u00adbucht');
  assert.equal(breakName('Hierbleiben'), 'Hierbleiben');
  for (const d of Object.values(MAPS).filter(m => !m.secret && !m.cave)) {
    assert.ok(breakName(d.name).includes('\u00ad'), d.name);
    assert.equal(breakName(d.name).replaceAll('\u00ad', ''), d.name);
  }
});
