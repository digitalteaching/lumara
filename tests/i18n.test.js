import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setLanguage, setPseudo, t, tl, language } from '../js/i18n/i18n.js';
import { STONE_LINES } from '../js/items/stones.js';
import { defaultLines } from '../js/data/texts.js';
import { fogEdgeLines } from '../js/world/fogEdge.js';
import { caveGateLines } from '../js/world/caveGate.js';
import { mapLabels, caveLabels } from '../js/world/islandMap.js';
import { backupMessage } from '../js/save/backup.js';
import { EN_WORLD } from '../js/i18n/en-world.js';
import { npcLines, areaName, areaOf, worldLines } from '../js/world/network.js';
import { BUCHT } from '../js/world/maps/bucht.js';
import { MOOR } from '../js/world/maps/moor.js';
import { DUENEN } from '../js/world/maps/duenen.js';
import { newGameState } from '../js/state.js';

test.afterEach(() => {
  setLanguage('de');
  setPseudo(false);
});

test('Sprachen: Deutsch, Englisch, Französisch und Spanisch; Unbekanntes wird Deutsch', () => {
  assert.equal(setLanguage('en'), 'en');
  assert.equal(language(), 'en');
  assert.equal(setLanguage('fr'), 'fr');
  assert.equal(setLanguage('es'), 'es');
  assert.equal(setLanguage('xy'), 'de');
});

test('t(): Platzhalter, Rückfall auf Deutsch, fehlender Schlüssel ist ein Fehler, Prüfmodus', () => {
  assert.equal(t('app.title'), 'Lumara – Das Land unter dem Nebel');
  assert.equal(t('name.tooLong', { max: 12 }), 'Höchstens 12 Zeichen.');
  setLanguage('en');
  assert.equal(t('app.title'), 'Lumara – The Land Beneath the Mist');
  assert.deepEqual(tl('eggs.hatched', { name: 'Nixi' }), ['Nixi has hatched!', 'Nixi looks at you with curious eyes.']);
  assert.throws(() => t('gibt.es.nicht'));
  setLanguage('de');
  setPseudo(true);
  assert.equal(t('app.title'), '⟦Lumara – Das Land unter dem Nebel⟧');
});

// Dass jede Fremdsprache jeden Text hat (Oberfläche, Wesen, Karten, Geschichte, Aufträge), prüft
// tests/sprachen.test.js für alle Sprachen. Hier stehen Beispiele auf Englisch.

test('Duell auf Englisch: Knöpfe und Rückmeldungen', () => {
  setLanguage('en');
  assert.equal(t('duel.check'), 'Check');
  assert.equal(t('duel.flee'), 'Run');
  assert.equal(t('feedback.almost'), 'Almost! Check your spelling.');
  assert.equal(STONE_LINES.farsight(), 'You find a farsight stone!');
  assert.equal(STONE_LINES.life('Nixi'), 'A life stone! Nixi now has 1 more energy for good.');
  assert.equal(defaultLines('en').win, 'Well done! You won.');
  assert.equal(defaultLines('de').loss, 'Diesmal nicht. Übe noch ein bisschen und komm wieder!');
});

test('Welt auf Englisch: Nebelschild, Höhlentor und Karte der Insel', () => {
  setLanguage('en');
  assert.deepEqual(fogEdgeLines({ leadsTo: 3, lines: [] }, { gateBeaten: true, packHasNext: false, builtAreas: 8 }), ['This path opens as soon as your teacher shares the next topic.']);
  assert.deepEqual(caveGateLines(3), ['A big gate in the mountain with eight sockets.', '3 of them are glowing.', 'Maybe it opens when all eight light stones glow again.']);
  assert.deepEqual(mapLabels({ open: false, lit: true, here: false }), ['☁ In the mist']);
  assert.deepEqual(caveLabels({ lit: 8 }), ['Mountain with a cave', 'Sockets glowing: 8 of 8']);
});

test('Menü auf Englisch, die Seite für die Lehrkraft bleibt Deutsch', () => {
  setLanguage('en');
  assert.equal(t('menu.creature'), 'Creature');
  assert.equal(t('menu.teacher'), 'For your teacher');
  assert.equal(backupMessage('unknown'), 'This file is not a Lumara saved game.');
  setLanguage('de');
  assert.equal(backupMessage('damaged'), 'Diese Sicherung ist beschädigt und lässt sich nicht laden.');
});

test('Bewohner, Schilder und Leuchtstein auf Englisch', () => {
  setLanguage('en');
  const ilvy = BUCHT.objects.find(o => o.id === 'ilvy');
  assert.equal(npcLines(ilvy, newGameState({ name: 'A', species: 'nixi', nickname: null }), 1, null)[0], EN_WORLD.objects.bucht.ilvy.lines[0]);
  assert.equal(areaName(MOOR), 'Mushroom Marsh');
  assert.equal(t('world.beaconRelit', { of: areaOf(MOOR) }), 'The light stone of the Mushroom Marsh shines again!');
  const sign = DUENEN.objects.find(o => o.id === 'nebel-ost');
  assert.deepEqual(worldLines(DUENEN, sign, 'linesOpen'), ['East: Windy Cliffs', 'The mist has moved back. The way is free.']);
  assert.deepEqual(fogEdgeLines(sign, { gateBeaten: true, packHasNext: true, builtAreas: 4 }, DUENEN)[0], 'Beyond the mist lie the Windy Cliffs.');
  setLanguage('de');
  assert.equal(areaName(MOOR), 'Pilzmoor');
  assert.deepEqual(fogEdgeLines(sign, { gateBeaten: true, packHasNext: true, builtAreas: 4 }, DUENEN)[0], 'Hinter dem Nebel liegen die Windklippen.');
});
