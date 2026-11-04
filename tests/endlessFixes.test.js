import { test } from 'node:test';
import assert from 'node:assert/strict';
import { starChance } from '../js/world/stars.js';
import { rematchQuestion } from '../js/duel/rematch.js';
import { refillBefore } from '../js/duel/ascent.js';
import { rememberBlock } from '../js/duel/boss.js';
import { respawnAfterLoss } from '../js/world/beacons.js';
import { CONFIG } from '../js/config.js';
import { newGameState } from '../js/state.js';
import { textIn } from '../js/i18n/i18n.js';

test('Die Chance auf seltene Wesen hängt an der Sternschnuppe, die die Welt zeigt', () => {
  const shown = { x: 4, y: 11 };
  assert.equal(starChance(shown, 5, 12), CONFIG.wild.starRareChance);
  assert.equal(starChance(shown, 10, 14), CONFIG.wild.rareChance, 'woanders nicht, auch wenn die Zeit weiterläuft');
  assert.equal(starChance(null, 4, 11), CONFIG.wild.rareChance);
});

test('Revanche-Angebote: „Stärke n von 5“, und auf der höchsten Stärke ohne Widerspruch', () => {
  assert.deepEqual(rematchQuestion({ stage: 2, max: false }), { key: 'rematch.offer', params: { stage: 2, max: 5 } });
  assert.deepEqual(rematchQuestion({ stage: 5, max: true }), { key: 'rematch.offerMax', params: {} });
  assert.equal(textIn('de', 'rematch.offer', { stage: 2, max: 5 }), 'Lust auf eine Revanche? Ich bin jetzt stärker. (Stärke 2 von 5)');
  assert.equal(textIn('en', 'rematch.offer', { stage: 2, max: 5 }), 'Fancy a rematch? I am stronger now. (Strength 2 of 5)');
  for (const lang of ['de', 'en']) assert.equal(/stärker now|stärker\.|stronger now/i.test(textIn(lang, 'rematch.offerMax')), false, lang);
  assert.equal(textIn('de', 'remember.offer', { stage: 3, max: 5 }).endsWith('(Stärke 3 von 5)'), true);
});

test('Aufstieg: volle Energie vor der ersten Etage und nach jeder fünften', () => {
  assert.deepEqual([1, 2, 5, 6, 7, 11].map(refillBefore), [true, false, false, true, false, true]);
});

test('Erinnerungsduell: eigener Satz, wenn dem Paket Themen fehlen', () => {
  const s = newGameState({ name: 'A', species: 'nixi', nickname: null });
  s.finale.done = true;
  const full = { shortId: 'ENQ9', trainers: [1, 2, 3, 4, 5, 6, 7, 8].map(n => ({ number: n })) };
  const small = { shortId: 'ENQ9', trainers: [1, 2, 3].map(n => ({ number: n })) };
  assert.equal(rememberBlock(s, small), 'remember.needPack');
  assert.equal(rememberBlock(s, full), 'remember.notYet');
  s.packs.ENQ9 = { beaten: [1, 2, 3, 4, 5, 6, 7, 8] };
  assert.equal(rememberBlock(s, full), null);
  for (const key of ['remember.needPack', 'rematch.offerMax']) assert.ok(textIn('de', key) && textIn('en', key), key);
});

test('Wer gegen Morrow am Leuchtturm verliert, bleibt am Leuchtturm; bei anderen Duellen gilt der Leuchtstein', () => {
  const s = { ...newGameState({ name: 'A', species: 'nixi', nickname: null }), stones: [1, 2], lastStone: 2 };
  const pack = { trainers: [1, 2].map(n => ({ number: n })) };
  const here = { map: 'bucht', x: 35, y: 17, dir: 'right' };
  assert.deepEqual(respawnAfterLoss(s, pack, { kind: 'boss', remember: true }, here), here);
  assert.notDeepEqual(respawnAfterLoss(s, pack, { kind: 'trainer' }, here), here);
});
