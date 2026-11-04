import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rematchStage, rematchSetup, rematchOffer } from '../js/duel/rematch.js';
import { timerFor, questionTimeMs } from '../js/duel/timing.js';
import { xpForWin } from '../js/duel/progress.js';
import { newGameState, applyDuelResult, packProgress } from '../js/state.js';
import { textIn } from '../js/i18n/i18n.js';
import { q } from './helpers/fixtures.js';

const pack = (setting = 'normal') => ({
  shortId: 'ENQ9',
  timePressure: setting,
  trainers: [1, 2, 3, 4, 5, 6, 7, 8].map(n => ({ number: n, name: `T${n}`, hello: ['Hallo'], win: 'Gut!', loss: 'Schade', rematch: `Revanche ${n}!`, questions: [q({ text: `T${n}`, trainer: n })] })),
});
const won = { outcome: 'won', playerEnergy: 3, flawless: false, answers: [] };
const s0 = () => newGameState({ name: 'A', species: 'kiesel', nickname: null });

test('Die Revanche-Stufe ist eins mehr als die gewonnenen Revanchen, höchstens 5', () => {
  assert.equal(rematchStage({ tiers: {} }, 1), 1);
  assert.equal(rematchStage({ tiers: { 1: 4 } }, 1), 5);
  assert.equal(rematchStage({ tiers: { 1: 5 } }, 1), 5);
  assert.equal(rematchStage({}, 3), 1);
});

test('Revanche gegen Trainer 1 auf Stufe 1: mehr Energie und erstmals eine Uhr', () => {
  const s = rematchSetup(pack(), 1, 1);
  assert.deepEqual([s.kind, s.rematch, s.foe.maxEnergy, s.trainer.number], ['trainer', 1, 7, 1]);
  assert.deepEqual(s.trainer.lines.hello, ['Revanche 1!']);
  assert.equal(timerFor(s, 'kiesel')({ form: 'choice' }), 36000);
  assert.equal(xpForWin({ kind: 'trainer', trainerNumber: 1, rematch: 1, flawless: false }), 75);
  assert.equal(xpForWin({ kind: 'trainer', trainerNumber: 1, rematch: 1, flawless: true }), 94);
});

test('Stufe 5: Trainer 8 mit 22 Energie und knapp 12 s, Trainer 4 mit gut 23 s, nie unter 10 s', () => {
  const t8 = rematchSetup(pack(), 8, 5);
  assert.equal(t8.foe.maxEnergy, 22);
  assert.equal(timerFor(t8, 'kiesel')({ form: 'choice' }), 11810);
  assert.equal(timerFor(rematchSetup(pack(), 4, 5), 'kiesel')({ form: 'choice' }), 23620);
  assert.ok(questionTimeMs({ seconds: 3, form: 'choice', setting: 'normal' }) === 3000);
  for (let n = 1; n <= 8; n++) assert.ok(rematchSetup(pack(), n, 5).time.seconds >= 10, `Trainer ${n}`);
  assert.equal(timerFor(rematchSetup(pack('aus'), 4, 2), 'kiesel')({ form: 'choice' }), null);
});

test('Ein Revanche-Sieg hebt die Stufe, höchstens auf 5; eine Niederlage nicht; jedes Paket hat eigene Stufen', () => {
  const s = s0();
  packProgress(s, 'ENQ9').beaten = [1];
  s.stones = [1]; // besiegt heißt: Stein leuchtet
  const r = applyDuelResult(s, 'ENQ9', rematchSetup(pack(), 1, 1), won);
  assert.equal(r.xp, 75);
  assert.equal(r.stoneLit, false);
  assert.deepEqual(packProgress(s, 'ENQ9').tiers, { 1: 1 });
  applyDuelResult(s, 'ENQ9', rematchSetup(pack(), 1, 2), { ...won, outcome: 'lost', playerEnergy: 0 });
  assert.deepEqual(packProgress(s, 'ENQ9').tiers, { 1: 1 });
  packProgress(s, 'ENQ9').tiers[1] = 5;
  applyDuelResult(s, 'ENQ9', rematchSetup(pack(), 1, 5), won);
  assert.equal(packProgress(s, 'ENQ9').tiers[1], 5);
  assert.deepEqual(packProgress(s, 'MATH').tiers, {});
});

test('Angebot der Revanche: erst nach dem Sieg mit diesem Paket; Texte auf Deutsch und Englisch', () => {
  assert.equal(rematchOffer({ beaten: [], tiers: {} }, 1), null);
  assert.deepEqual(rematchOffer({ beaten: [1], tiers: {} }, 1), { stage: 1, max: false });
  assert.deepEqual(rematchOffer({ beaten: [1], tiers: { 1: 5 } }, 1), { stage: 5, max: true });
  for (const key of ['rematch.offer', 'rematch.yes', 'rematch.later', 'rematch.offerMax']) assert.ok(textIn('de', key) && textIn('en', key), key);
});
