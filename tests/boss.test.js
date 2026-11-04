import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../js/core/rng.js';
import { createDuel } from '../js/duel/duel.js';
import { bossSetup, foeStageForPhase } from '../js/duel/boss.js';
import { xpForWin } from '../js/duel/progress.js';
import { timerFor } from '../js/duel/timing.js';
import { newGameState, applyDuelResult, packProgress } from '../js/state.js';
import { CONFIG } from '../js/config.js';
import { q } from './helpers/fixtures.js';
import { creatureAlpha, foeEnergyShown } from '../js/duel/plates.js';

const deckOf = qs => {
  let i = 0;
  return { draw: () => qs[i++ % qs.length] };
};
const boss = (player = {}) =>
  createDuel({
    kind: 'boss',
    rng: createRng(1),
    player: { species: 'kiesel', stage: 1, energy: 40, maxEnergy: 40, ...player },
    foe: { maxEnergy: 6, phases: 3 },
    deck: deckOf(['A', 'B', 'C', 'D'].map(t => q({ text: t, forms: ['typing'] }))),
  });
// c: richtig, w: falsch
const play = (d, pattern) => {
  const out = [];
  for (const ch of pattern) {
    d.ask();
    out.push(d.answer({ text: ch === 'c' ? d.current.question.answer : 'xxxx' }));
    if (d.state === 'feedback') d.next();
  }
  return out;
};

test('Endduell: drei Phasen mit je 6 Energie, gewonnen erst am Ende der dritten', () => {
  const d = boss();
  assert.deepEqual([d.phase, d.phases, d.foeEnergy], [1, 3, 6]);
  const cleared = [];
  let n = 0;
  while (d.state !== 'won' && n < 60) {
    const [r] = play(d, 'c');
    n++;
    if (r.phaseCleared) cleared.push([n, d.phase, d.foeEnergy]);
  }
  assert.equal(d.state, 'won');
  assert.equal(d.phase, 3);
  assert.equal(cleared.length, 2);
  for (const [, phase, energy] of cleared) assert.equal(energy, 6, `Phase ${phase} beginnt voll`);
  assert.deepEqual(cleared.map(c => c[1]), [2, 3]);
});

test('Ein Volltreffer am Ende einer Phase springt nicht über die nächste', () => {
  const d = boss();
  // 6 → 5, falsch, 4, falsch, 3, falsch, dann 2, 1 und ein Volltreffer (2 Schaden bei 1 Rest)
  const rs = play(d, 'cwcwcwccc');
  const last = rs[rs.length - 1];
  assert.equal(last.crit, true);
  assert.equal(last.phaseCleared, true);
  assert.deepEqual([d.phase, d.foeEnergy, d.state], [2, 6, 'ready']);
});

test('Gegen den Endgegner gibt es keine Flucht; Aufgeben ist eine Niederlage; Füttern zweimal pro Duell', () => {
  const d = boss({ energy: 30 });
  assert.equal(d.flee(), false);
  d.ask();
  assert.equal(d.feed(2), 2); // 30 von 40: zwei dazu
  play(d, 'cccccc'.slice(1)); // bis zur nächsten Phase
  play(d, 'cc');
  assert.ok(d.phase >= 2);
  d.ask();
  assert.equal(d.canFeed(), true);
  d.feed(1);
  d.ask();
  assert.equal(d.canFeed(), false);
  d.surrender();
  assert.equal(d.state, 'lost');
});

test('Das Endduell: Morrow, Level 50, Fragen aus allen Themen, Uhr wie bei Trainer 8', () => {
  const pack = { timePressure: 'normal', trainers: [1, 2, 3, 4, 5, 6, 7, 8].map(n => ({ number: n, questions: [q({ text: `T${n}`, trainer: n })] })) };
  const s = bossSetup(pack);
  assert.deepEqual([s.kind, s.arena, s.foe.species, s.foe.level, s.foe.maxEnergy, s.foe.phases], ['boss', 'cave', 'morrow', 50, 6, 3]);
  assert.deepEqual(s.pool.map(x => x.text), ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8']);
  assert.equal(timerFor(s, 'kiesel')({ form: 'choice' }), 20000);
  assert.deepEqual([1, 2, 3].map(foeStageForPhase), [3, 2, 1]);
  assert.deepEqual([CONFIG.boss.phases, CONFIG.boss.energy, CONFIG.boss.level], [3, 6, 50]);
});

test('Erster Sieg gegen Morrow mit einem Paket: 500 XP und „Endgegner besiegt“; danach keine XP', () => {
  assert.equal(xpForWin({ kind: 'boss', flawless: false }), 500);
  assert.equal(xpForWin({ kind: 'boss', flawless: true }), 625);
  const s = newGameState({ name: 'A', species: 'funki', nickname: null });
  const setup = { kind: 'boss', area: 8, arena: 'cave', foe: { species: 'morrow', level: 50, maxEnergy: 6, phases: 3 }, pool: [] };
  const won = { outcome: 'won', playerEnergy: 3, flawless: false, answers: [] };
  const r = applyDuelResult(s, 'ENQ9', setup, won);
  assert.equal(r.xp, 500);
  assert.equal(packProgress(s, 'ENQ9').boss, true);
  assert.equal(applyDuelResult(s, 'ENQ9', setup, won).xp, 0);
  assert.equal(applyDuelResult(s, 'MATH', setup, won).xp, 500); // anderes Paket: erster Sieg
});

test('Gestaltwechsel: Die Deckkraft eines Bildes ist das Überblenden mal das Erschöpfen', () => {
  assert.equal(creatureAlpha(null, 0, 0.3), 0.3);
  assert.equal(creatureAlpha(null, 0), 1);
  assert.equal(creatureAlpha(100, 400, 0.5), 0.25);
  assert.equal(creatureAlpha(0, 1000, 1), 0);
});

test('Beim letzten Treffer einer Phase zeigt der Balken leer, bis die neue Gestalt da ist', () => {
  const d = boss();
  const rs = play(d, 'ccccc'); // Schaden 1, 1, 2 (Volltreffer), 1, 1: Phase 1 ist leer, Phase 2 voll
  assert.equal(rs[4].phaseCleared, true);
  assert.equal(d.foeEnergy, 6);
  assert.equal(foeEnergyShown(d, true), 0);
  assert.equal(foeEnergyShown(d, false), d.foeEnergy);
});
