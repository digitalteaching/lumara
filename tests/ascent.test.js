import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ascentEnergy, ascentSeconds, ascentXp, refillAfter, recordFloor, ascentFoe, ascentSetup } from '../js/duel/ascent.js';
import { createDuel } from '../js/duel/duel.js';
import { timerFor } from '../js/duel/timing.js';
import { createRng } from '../js/core/rng.js';
import { SPECIES } from '../js/data/species.js';
import { ARENAS } from '../js/gfx/arena.js';
import { newGameState, applyDuelResult, packProgress } from '../js/state.js';
import { textIn } from '../js/i18n/i18n.js';
import { q } from './helpers/fixtures.js';

const pack = { shortId: 'ENQ9', timePressure: 'normal', trainers: [1, 2, 3].map(n => ({ number: n, questions: [q({ text: `T${n}`, trainer: n })] })) };

test('Etagen: Energie 4 + Etage/3 (höchstens 15), Uhr ab Etage 5 (35 s, dann 1 s weniger, nie unter 15 s)', () => {
  assert.deepEqual([1, 3, 30, 40].map(ascentEnergy), [4, 5, 14, 15]);
  assert.deepEqual([1, 4, 5, 6, 30].map(ascentSeconds), [null, null, 35, 34, 15]);
  assert.equal(timerFor(ascentSetup(pack, 4, createRng(1)), 'kiesel')({ form: 'choice' }), null);
  assert.equal(timerFor(ascentSetup(pack, 6, createRng(1)), 'kiesel')({ form: 'choice' }), 34000);
});

test('XP je Etage 20 + 2·Etage, Auffüllen nach jeder fünften, Bestmarke sinkt nie', () => {
  assert.equal(ascentXp(10, false), 40);
  assert.equal(ascentXp(10, true), 50);
  assert.deepEqual([4, 5, 9, 10].map(refillAfter), [false, true, false, true]);
  const p = { stats: { floor: 7 } };
  recordFloor(p, 3);
  assert.equal(p.stats.floor, 7);
  recordFloor(p, 9);
  assert.equal(p.stats.floor, 9);
});

test('Gegner im Aufstieg: wilde Arten aus allen Gebieten und der Höhle, nie geheim, nie Morrow; Fragen aus allen Themen', () => {
  const rng = createRng(3);
  const seen = new Set();
  for (let i = 0; i < 400; i++) {
    const f = ascentFoe(12, rng);
    seen.add(f.species);
    assert.ok(['wild', 'cave'].includes(SPECIES[f.species].kind), f.species);
    assert.deepEqual([f.stage, f.level, f.maxEnergy], [1, 46, 8]);
  }
  assert.ok(seen.size > 15);
  const s = ascentSetup(pack, 2, createRng(1));
  assert.deepEqual([s.kind, s.arena, s.floor, s.pool.length], ['ascent', 'tower', 2, 3]);
  assert.equal(typeof ARENAS.tower, 'function');
});

test('Im Aufstieg aufgeben ist eine Niederlage; Fliehen gibt es nicht', () => {
  const d = createDuel({ kind: 'ascent', rng: createRng(1), player: { species: 'kiesel', stage: 1, energy: 4, maxEnergy: 4 }, foe: { maxEnergy: 4 }, deck: { draw: () => q() } });
  assert.equal(d.flee(), false);
  d.surrender();
  assert.equal(d.state, 'lost');
});

test('Ein Sieg im Aufstieg: XP, Bestmarke, keine Energie zurück; eine Niederlage auf Etage 1 schreibt keine Bestmarke', () => {
  const s = newGameState({ name: 'A', species: 'kiesel', nickname: null });
  const setup = ascentSetup(pack, 10, createRng(2));
  const r = applyDuelResult(s, 'ENQ9', setup, { outcome: 'won', playerEnergy: 2, flawless: false, answers: [] });
  assert.equal(r.xp, 40);
  assert.equal(packProgress(s, 'ENQ9').stats.floor, 10);
  assert.equal(s.creature.energy, 2);
  const t = newGameState({ name: 'B', species: 'kiesel', nickname: null });
  applyDuelResult(t, 'ENQ9', ascentSetup(pack, 1, createRng(2)), { outcome: 'lost', playerEnergy: 0, flawless: false, answers: [] });
  assert.equal(packProgress(t, 'ENQ9').stats.floor, 0);
});

test('Texte des Aufstiegs auf Deutsch und Englisch', () => {
  for (const key of ['tower.door', 'tower.rest', 'tower.climb', 'tower.floor', 'tower.next', 'tower.down', 'tower.beacon', 'tower.end', 'tower.lost']) {
    assert.ok(textIn('de', key) && textIn('en', key), key);
  }
  assert.equal(textIn('de', 'tower.end', { n: 3, best: 5 }), 'Du hast Etage 3 geschafft. Deine Bestmarke: Etage 5.');
  assert.equal(textIn('en', 'tower.floor', { n: 4 }), 'Floor 4. A wild creature is already waiting!');
});
