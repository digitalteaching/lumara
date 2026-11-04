import { test } from 'node:test';
import assert from 'node:assert/strict';
import { finaleDone, finishFinale, withFinale } from '../js/world/finale.js';
import { applyDuelResult } from '../js/state.js';
import { MAPS } from '../js/world/network.js';
import { resolveStart } from '../js/world/network.js';
import { BUCHT } from '../js/world/maps/bucht.js';
import { HOEHLE2 } from '../js/world/maps/hoehle2.js';
import { newGameState } from '../js/state.js';
import { textIn } from '../js/i18n/i18n.js';
import { readFileSync } from 'node:fs';
import { DE } from '../js/i18n/de.js';
import { EN } from '../js/i18n/en.js';

const s0 = () => newGameState({ name: 'A', species: 'nixi', nickname: null });
const pack = n => ({ trainers: Array.from({ length: n }, (_, i) => ({ number: i + 1 })) });

test('Ein neues Spiel steht vor dem Finale; der Zustand danach gehört dem Kind', () => {
  const s = s0();
  assert.deepEqual(s.finale, { done: false });
  assert.equal(finaleDone(s), false);
  s.finale.done = true;
  assert.equal(finaleDone(s), true);
  s.packs = {}; // ein anderes Paket ändert nichts
  assert.equal(finaleDone(s), true);
  assert.equal(finaleDone({}), false);
});

test('Das Finale wird genau einmal erledigt', () => {
  const s = s0();
  assert.equal(finishFinale(s), true);
  assert.equal(finaleDone(s), true);
  assert.equal(finishFinale(s), false);
});

test('Wer in der Höhle steht und ein Paket ohne alle acht Trainer lädt, startet am Leuchtturm', () => {
  const s = { ...s0(), stones: [1, 2, 3, 4, 5, 6, 7, 8], position: { map: 'hoehle2', ...HOEHLE2.spawn } };
  assert.deepEqual(resolveStart(s, pack(3)), { map: 'bucht', ...BUCHT.respawn });
  assert.deepEqual(resolveStart(s, pack(8)), s.position);
});

test('Die Texte des Endduells und des Finales gibt es auf Deutsch und Englisch', () => {
  for (const key of ['boss.hello', 'boss.phase', 'boss.tired', 'boss.lost', 'finale.ask', 'finale.sayName', 'finale.after']) {
    assert.ok(textIn('de', key) && textIn('en', key), key);
  }
  assert.deepEqual([DE['boss.hello'].length, EN['boss.hello'].length, DE['finale.after'].length, EN['finale.after'].length], [3, 3, 3, 3]);
  assert.ok(textIn('de', 'finale.sayName').includes('Morrow'));
});

test('Der Sieg über Morrow speichert das Finale gleich mit, samt Platz am Leuchtturm', () => {
  const s = { ...s0(), position: { map: 'hoehle3', x: 8, y: 4, dir: 'up' } };
  const setup = { kind: 'boss', area: 8, arena: 'cave', foe: { species: 'morrow', level: 50, maxEnergy: 6, phases: 3 }, pool: [] };
  applyDuelResult(s, 'ENQ9', setup, { outcome: 'won', playerEnergy: 3, flawless: false, answers: [] });
  assert.equal(finaleDone(s), true);
  assert.deepEqual(s.position, { map: 'bucht', ...BUCHT.respawn });
  const lost = { ...s0(), position: { map: 'hoehle3', x: 8, y: 4, dir: 'up' } };
  applyDuelResult(lost, 'ENQ9', setup, { outcome: 'lost', playerEnergy: 0, flawless: false, answers: [] });
  assert.equal(finaleDone(lost), false);
  assert.equal(lost.position.map, 'hoehle3');
});

test('Nach dem Finale ist auch der Zier-Nebel neben dem Tor der Bucht fort', () => {
  const fogCells = def => def.rows.flatMap((r, y) => [...r].map((c, x) => (def.legend[c] === 'fog' && !(def.gates ?? []).some(g => x >= g.x && x < g.x + g.w && y >= g.y && y < g.y + g.h) ? [x, y] : null)).filter(Boolean));
  const s = s0();
  assert.equal(fogCells(withFinale(MAPS.bucht, s)).length, 18);
  s.finale.done = true;
  const after = withFinale(MAPS.bucht, s);
  assert.deepEqual(fogCells(after), []);
  assert.equal(after.rows[0][15], 'T');
  assert.equal(after.rows[0][18], MAPS.bucht.rows[0][18], 'das Tor selbst bleibt, wie es ist');
});

test('Finale: Wer seinen Namen nicht mehr weiß, spricht als „???“, nicht als „Morrow“', () => {
  for (const lang of ['de', 'en', 'fr', 'es']) assert.equal(textIn(lang, 'finale.unknown'), '???', lang);
  const src = readFileSync(new URL('../js/scenes/finale.js', import.meta.url), 'utf8');
  assert.match(src, /say\(game, tl\('finale\.ask'\), \{ speaker: tr\('finale\.unknown'\) \}\)/);
});
