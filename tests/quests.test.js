import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QUESTS, GUESTS, QUEST_TEXT, questText } from '../js/data/quests.js';
import { EN_QUEST_TEXT } from '../js/i18n/en-quests.js';
import { MAPS } from '../js/world/network.js';
import { createMap } from '../js/world/map.js';
import { setLanguage } from '../js/i18n/i18n.js';
import { questFor, acceptQuest, advanceQuest, finishQuest, activePickups, activeGuests, questLog } from '../js/world/quests.js';
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

test('Jeder Auftrag hat seine Texte auf Deutsch und Englisch, mit gleich vielen Schritten und kurzen Zeilen', () => {
  for (const q of QUESTS) {
    for (const table of [QUEST_TEXT, EN_QUEST_TEXT]) {
      const tx = table[q.id];
      assert.ok(tx?.title && tx.offer?.length && tx.remind?.length && tx.locked?.length && tx.finish?.length, q.id);
      assert.equal(tx.steps.length, q.steps.length - 1, q.id); // der letzte Schritt ist finish/locked
      assert.equal(tx.hints?.length, q.steps.length, `${q.id}: ein Tagebuch-Hinweis je Schritt`);
      const lines = [...tx.offer, ...tx.remind, ...tx.locked, ...tx.finish, ...tx.steps.flat(), ...tx.hints, ...(tx.guest ?? [])];
      for (const l of lines) assert.ok(l.length <= 90, `${q.id}: ${l.length} Zeichen: ${l}`);
    }
  }
  setLanguage('en');
  try {
    assert.equal(questText('q3').title, 'Where is Flo?');
  } finally {
    setLanguage('de');
  }
  assert.equal(questText('q3').title, 'Wo ist Flo?');
});

test('Fundstücke und Gäste stehen auf freien, begehbaren Feldern; Gespräche nennen echte Bewohner', () => {
  const free = (mapId, x, y) => createMap(MAPS[mapId], { openGates: (MAPS[mapId].gates ?? []).map(g => g.id) }).canEnter(x, y);
  for (const q of QUESTS) {
    for (const st of q.steps) {
      assert.ok(MAPS[st.map].area <= q.area, `${q.id}: ${st.map} liegt hinter Gebiet ${q.area}`);
      if (st.kind === 'pickup') assert.ok(free(st.map, st.x, st.y), `${q.id}.${st.id}`);
      else assert.ok(MAPS[st.map].objects.some(o => o.type === 'npc' && o.id === st.npc) || GUESTS.some(g => g.id === st.npc && g.map === st.map), `${q.id}: ${st.npc}`);
    }
    assert.ok(MAPS[q.giver.map].objects.some(o => o.type === 'npc' && o.id === q.giver.npc), q.id);
    assert.equal(MAPS[q.giver.map].area, q.area, q.id);
  }
  for (const g of GUESTS) assert.ok(free(g.map, g.x, g.y), g.id);
});

test('Tagebuch: angenommene Aufträge in fester Reihenfolge, offen mit Hinweis, erledigt ohne', () => {
  const s = s0();
  assert.deepEqual(questLog(s), []);
  s.stones = [1, 2, 3];
  acceptQuest(s, 'q3');
  acceptQuest(s, 'q1');
  advanceQuest(s, 'q3', 0);
  finishQuest(s, 'q3');
  assert.deepEqual(questLog(s), [
    { id: 'q1', title: 'Brams Glücksmuschel', done: false, hint: 'Bram sucht seine Glücksmuschel. Sie liegt am Strand im Westen.' },
    { id: 'q3', title: 'Wo ist Flo?', done: true, hint: null },
  ]);
});

test('Tagebuch: der Hinweis folgt dem Schritt, nach dem Fund zeigt er zurück zum Auftraggeber', () => {
  const s = s0();
  acceptQuest(s, 'q1');
  advanceQuest(s, 'q1', 0);
  assert.equal(questLog(s)[0].hint, QUEST_TEXT.q1.hints[1]);
  assert.notEqual(QUEST_TEXT.q1.hints[1], QUEST_TEXT.q1.hints[0]);
  setLanguage('en');
  try {
    assert.equal(questLog(s)[0].hint, EN_QUEST_TEXT.q1.hints[1]);
  } finally {
    setLanguage('de');
  }
});
