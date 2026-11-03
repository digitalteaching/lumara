import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setLanguage, setPseudo, t, tl, language } from '../js/i18n/i18n.js';
import { DE } from '../js/i18n/de.js';
import { EN } from '../js/i18n/en.js';
import { STONE_LINES } from '../js/items/stones.js';
import { defaultLines } from '../js/data/texts.js';
import { fogEdgeLines } from '../js/world/fogEdge.js';
import { caveGateLines } from '../js/world/caveGate.js';
import { mapLabels, caveLabels } from '../js/world/islandMap.js';

test.afterEach(() => {
  setLanguage('de');
  setPseudo(false);
});

test('Sprachen: nur fertige werden aktiv, sonst Deutsch', () => {
  assert.equal(setLanguage('en'), 'en');
  assert.equal(language(), 'en');
  assert.equal(setLanguage('fr'), 'de');
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

test('Englisch hat jeden deutschen Schlüssel, mit gleicher Art und gleichen Platzhaltern', () => {
  const holes = v => [...String(v).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
  for (const [k, v] of Object.entries(DE)) {
    assert.ok(k in EN, `en fehlt: ${k}`);
    assert.equal(Array.isArray(EN[k]), Array.isArray(v), k);
    assert.equal(holes(EN[k]), holes(v), k);
  }
  assert.deepEqual(Object.keys(EN).filter(k => !(k in DE)), []);
});

test('Englische Texte sind nicht leer und je Zeile höchstens etwa 90 Zeichen lang', () => {
  for (const [k, v] of Object.entries(EN)) {
    for (const line of Array.isArray(v) ? v : [v]) {
      assert.ok(line.trim(), k);
      assert.ok(line.length <= 110, `${k}: ${line.length} Zeichen`);
    }
  }
});

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
  assert.deepEqual(caveLabels({ lit: 8 }), ['Mountain with a cave', '8 of 8 sockets are glowing']);
});
