import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QUESTS } from '../js/data/quests.js';
import { questFor, acceptQuest, advanceQuest, finishQuest, activePickups, activeGuests } from '../js/world/quests.js';
import { hasKey } from '../js/items/keys.js';
import { newGameState } from '../js/state.js';
import { CONFIG } from '../js/config.js';

const s0 = () => newGameState({ name: 'A', species: 'nixi', nickname: null });

test('Ein Auftrag: annehmen, Schritt für Schritt, Abschluss erst nach dem Stein, nur einmal Belohnung', () => {
  const s = s0();
  assert.deepEqual(questFor(s, 'bucht', 'bram'), { quest: QUESTS[0], role: 'offer' });
  assert.equal(acceptQuest(s, 'q1'), true);
  assert.equal(acceptQuest(s, 'q1'), false);
  assert.equal(questFor(s, 'bucht', 'bram').role, 'remind');
  assert.deepEqual(activePickups(s, 'bucht').map(p => p.id), ['muschel']);
  assert.equal(advanceQuest(s, 'q1', 1), false); // nicht der aktuelle Schritt
  assert.equal(advanceQuest(s, 'q1', 0), true);
  assert.deepEqual(activePickups(s, 'bucht'), []);
  assert.equal(questFor(s, 'bucht', 'bram').role, 'locked'); // Stein 1 leuchtet noch nicht
  assert.equal(finishQuest(s, 'q1'), null);
  s.stones = [1];
  assert.equal(questFor(s, 'bucht', 'bram').role, 'finish');
  const r = finishQuest(s, 'q1');
  assert.deepEqual([r.xp, r.key, hasKey(s, 'foodbag')], [CONFIG.quests.xp, 'foodbag', true]);
  assert.equal(CONFIG.quests.xp, 50);
  assert.equal(finishQuest(s, 'q1'), null);
  assert.equal(questFor(s, 'bucht', 'bram').role, 'done');
});

test('Gast-Bewohner und Zwischenschritte: Flo steht nur im Wald, solange er gesucht wird', () => {
  const s = s0();
  assert.deepEqual(activeGuests(s, 'wald'), []);
  acceptQuest(s, 'q3');
  assert.deepEqual(activeGuests(s, 'wald').map(g => g.id), ['flo']);
  assert.equal(questFor(s, 'wald', 'flo').role, 'step');
  assert.equal(advanceQuest(s, 'q3', 0), true);
  assert.deepEqual(activeGuests(s, 'wald'), []);
  assert.equal(questFor(s, 'moor', 'jasper').role, 'locked');
});

test('Botengang: Oda ist ein Zwischenschritt von Fennas Auftrag, ihr eigenes Gespräch bleibt sonst', () => {
  const s = s0();
  assert.equal(questFor(s, 'bucht', 'oda'), null);
  acceptQuest(s, 'q2');
  assert.equal(questFor(s, 'bucht', 'oda').role, 'step');
  assert.equal(questFor(s, 'wald', 'fenna').role, 'remind');
  advanceQuest(s, 'q2', 0);
  assert.equal(questFor(s, 'bucht', 'oda'), null);
});

test('Belohnungen: Lebensstein bei drei wirkenden wird zum Weitblickstein, 3 Glanzsteine passen immer', () => {
  const s = s0();
  s.stones = [1, 2, 3, 4, 5];
  s.creature.lifeStones = 3;
  for (const id of ['q2', 'q4']) {
    acceptQuest(s, id);
    advanceQuest(s, id, 0);
  }
  const life = finishQuest(s, 'q2');
  assert.deepEqual([life.item, life.kept, s.bag.farsight], ['farsight', true, 1]);
  const shine = finishQuest(s, 'q4');
  assert.deepEqual([shine.item, shine.n, s.bag.shine], ['shine', 3, 3]);
});

test('Ein Auftrag mit erfülltem Schritt bleibt nach dem Paketwechsel, auch wenn sein Gebiet im Nebel liegt', () => {
  const s = s0();
  acceptQuest(s, 'q5');
  advanceQuest(s, 'q5', 0);
  s.packs = {}; // anderes Paket: Fortschritt der Aufträge hängt nicht am Paket
  assert.deepEqual(s.quests.q5, { step: 1, done: false });
});
