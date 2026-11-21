import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BOOK_SIZE, BOOK_SLOTS, recordSighting, bookView, bookLabels } from '../js/data/book.js';
import { AREA_WILD, SPECIES } from '../js/data/species.js';
import { newGameState } from '../js/state.js';
import { setLanguage, t } from '../js/i18n/i18n.js';
import { MENU_ITEMS } from '../js/menu/items.js';

test('Das Buch hat 33 Plätze: 1 bis 24 die wilden Arten nach Gebiet, 25 bis 33 kommen später', () => {
  assert.equal(BOOK_SIZE, 33);
  assert.equal(BOOK_SLOTS.length, 33);
  assert.deepEqual(BOOK_SLOTS.slice(0, 24), [1, 2, 3, 4, 5, 6, 7, 8].flatMap(a => [...AREA_WILD[a].common, AREA_WILD[a].rare]));
  assert.deepEqual(BOOK_SLOTS.slice(24, 30), ['wurzelgeist', 'prismalibelle', 'perlkrabbe', 'irrlichtfee', 'kristallotter', 'zeitschnecke']); // geheime Orte ab Platz 25
  assert.deepEqual(BOOK_SLOTS.slice(30), ['echomaus', 'kristallraupe', 'morrow']);
});

test('Eintragen: erst gesehen, dann besiegt und Glanz, nichts wird zurückgenommen', () => {
  const s = newGameState({ name: 'A', species: 'nixi', nickname: null });
  recordSighting(s, 'moosling');
  assert.deepEqual(s.book.moosling, { beaten: false, shiny: false });
  recordSighting(s, 'moosling', { beaten: true });
  recordSighting(s, 'moosling', { shiny: true });
  recordSighting(s, 'moosling');
  assert.deepEqual(s.book.moosling, { beaten: true, shiny: true });
  recordSighting(s, 'funki', { beaten: true }); // Startwesen stehen nicht im Buch
  recordSighting(s, 'gibtsnicht');
  assert.deepEqual(Object.keys(s.book), ['moosling']);
});

test('Ansicht: Zähler, Zustand, und Name, Fundort, Beschreibung erst, wenn man sie kennt', () => {
  const s = { ...newGameState({ name: 'A', species: 'nixi', nickname: null }), book: { gischtling: { beaten: true, shiny: false }, rindenwicht: { beaten: false, shiny: true } } };
  const v = bookView(s);
  assert.deepEqual([v.total, v.seen, v.beaten], [33, 2, 1]);
  assert.deepEqual(v.entries[0], { number: 1, id: 'gischtling', status: 'beaten', shiny: false, friend: false, name: 'Gischtling', place: 'Leuchtturmbucht', description: SPECIES.gischtling.description });
  assert.deepEqual(v.entries[5], { number: 6, id: 'rindenwicht', status: 'seen', shiny: true, friend: false, name: 'Rindenwicht', place: 'Flüsterwald', description: null });
  assert.deepEqual(v.entries[1], { number: 2, id: 'haeuschel', status: 'unknown', shiny: false, friend: false, name: null, place: null, description: null });
  assert.deepEqual(v.entries[32], { number: 33, id: 'morrow', status: 'unknown', shiny: false, friend: false, name: null, place: null, description: null });
  setLanguage('en');
  try {
    assert.deepEqual([bookView(s).entries[0].name, bookView(s).entries[0].place], ['Sprayling', 'Lighthouse Bay']);
  } finally {
    setLanguage('de');
  }
});

test('Jeder Eintrag sagt seinen Zustand mit Text, nicht nur mit Farbe', () => {
  assert.deepEqual(bookLabels({ status: 'unknown', shiny: false }), ['? Noch nicht gesehen']);
  assert.deepEqual(bookLabels({ status: 'seen', shiny: false }), ['◐ Gesehen']);
  assert.deepEqual(bookLabels({ status: 'beaten', shiny: true }), ['● Besiegt', '✦ Glanzform gesehen']);
  setLanguage('en');
  try {
    assert.deepEqual(bookLabels({ status: 'beaten', shiny: true }), ['● Beaten', '✦ Shiny form seen']);
  } finally {
    setLanguage('de');
  }
});

test('Menü in der Reihenfolge aus Design 13, mit dem Wesen-Buch', () => {
  assert.deepEqual(MENU_ITEMS.map(k => t(k)), ['Wesen', 'Rucksack', 'Wesen-Buch', 'Karte', 'Tagebuch', 'Einstellungen']);
  setLanguage('en');
  try {
    assert.deepEqual(MENU_ITEMS.map(k => t(k)), ['Creature', 'Backpack', 'Creature Book', 'Map', 'Diary', 'Settings']);
  } finally {
    setLanguage('de');
  }
});

test('Freunde bekommen ein Herz und zählen mit', () => {
  setLanguage('de');
  const s = newGameState({ name: 'A', species: 'nixi', nickname: null });
  s.book = { moosling: { beaten: true, shiny: false } };
  s.friends = { moosling: { shiny: false } };
  const v = bookView(s);
  const e = v.entries.find(x => x.id === 'moosling');
  assert.equal(e.friend, true);
  assert.equal(e.status, 'beaten');
  assert.equal(v.friends, 1);
  assert.equal(v.entries.filter(x => x.friend).length, 1);
  const labels = bookLabels(e);
  assert.equal(labels.indexOf('♥ Befreundet'), labels.indexOf('● Besiegt') + 1);
});
