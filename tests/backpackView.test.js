import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGameState } from '../js/state.js';
import { POCKETS, backpackView, itemName, itemText, canOpenBackpack } from '../js/items/backpackView.js';
import { setLanguage } from '../js/i18n/i18n.js';

setLanguage('de');
const fresh = species => newGameState({ name: 'A', species, nickname: null });
const pocket = (v, id) => v.pockets.find(p => p.id === id);

test('Neues Spiel: vier Fächer, Futter leer und gesperrt, 0 von 24 Schätzen, keine Schlüssel', () => {
  const v = backpackView(fresh('nixi'));
  assert.deepEqual(v.pockets.map(p => p.id), POCKETS);
  assert.deepEqual(POCKETS, ['food', 'stones', 'treasures', 'keys']);
  const food = pocket(v, 'food');
  assert.deepEqual(food.items.map(e => e.id), ['berry', 'starfruit', 'treat']);
  assert.ok(food.items.filter(e => e.action === 'feed').every(e => e.count === 0 && e.disabled));
  assert.deepEqual(food.items.find(e => e.id === 'treat'), { id: 'treat', kind: 'item', count: 0, known: true, action: 'befriend', disabled: false });
  const tr = pocket(v, 'treasures');
  assert.equal(tr.items.length, 24);
  assert.equal(tr.found, 0);
  assert.equal(tr.total, 24);
  assert.ok(tr.items.every(e => !e.known && e.action === null));
  assert.deepEqual(pocket(v, 'keys').items, []);
  assert.equal(v.food.max, 10);
});

test('Hergegebener Schatz bleibt bekannt, mit Anzahl 0 und ansehbar', () => {
  const s = fresh('nixi');
  s.album = ['amber'];
  s.treasures = {};
  const tr = pocket(backpackView(s), 'treasures');
  const e = tr.items.find(x => x.id === 'amber');
  assert.equal(e.known, true);
  assert.equal(e.count, 0);
  assert.equal(e.action, 'view');
  assert.equal(tr.found, 1);
});

test('Glanzstein gesperrt, solange einer leuchtet', () => {
  const s = fresh('nixi');
  s.bag.shine = 2;
  const shine = v => pocket(v, 'stones').items.find(e => e.id === 'shine');
  assert.equal(shine(backpackView(s)).disabled, false);
  s.shineActive = true;
  assert.equal(shine(backpackView(s)).disabled, true);
  assert.equal(backpackView(s).shineActive, true);
});

test('Schlüssel nur, wenn vorhanden', () => {
  const s = fresh('nixi');
  s.keys = ['hook', 'foodbag'];
  const keys = pocket(backpackView(s), 'keys').items;
  assert.deepEqual(keys.map(e => e.id), ['foodbag', 'hook']);
  assert.ok(keys.every(e => e.kind === 'key' && e.action === null));
  assert.equal(backpackView(s).food.max, 20);
});

test('Beere: Pieks bekommt 4', () => {
  const s = fresh('pieks');
  assert.ok(itemText({ id: 'berry', kind: 'item' }, s).includes('4'));
});

test('Steine und Namen', () => {
  const s = fresh('nixi');
  const stones = pocket(backpackView(s), 'stones').items;
  assert.deepEqual(stones.map(e => [e.id, e.action]), [['farsight', 'duel'], ['shine', 'shine'], ['time', 'duel']]);
  assert.equal(itemName({ id: 'berry', kind: 'item' }, s), 'Beere');
  assert.equal(itemName({ id: 'amber', kind: 'treasure' }, s), 'Bernsteintropfen');
  assert.equal(itemName({ id: 'hook', kind: 'key' }, s), 'Kletterhaken');
});

test('Rucksack öffnet nur beim Laufen und ohne Sperre', () => {
  assert.equal(canOpenBackpack({ mode: 'walk', locked: false }), true);
  assert.equal(canOpenBackpack({ mode: 'walk', locked: true }), false);
  assert.equal(canOpenBackpack({ mode: 'screen', locked: false }), false);
  assert.equal(canOpenBackpack({ mode: 'duel', locked: false }), false);
});

// Nach einer Niederlage auf einer anderen Karte ist die neue Welt beim Aufblenden noch nicht gesperrt.
// Ginge der Rucksack dann auf, öffnete sich der Dialog darunter, und am Ende bliebe das Spiel hängen.
test('Rucksack öffnet nicht während einer Überblendung', () => {
  assert.equal(canOpenBackpack({ mode: 'walk', locked: false, fading: true }), false);
  assert.equal(canOpenBackpack({ mode: 'walk', locked: false, fading: false }), true);
  assert.equal(canOpenBackpack({ mode: 'walk', locked: true, fading: true }), false);
});

test('Leckerli im Futterfach, ohne Futterplatz', () => {
  const s = fresh('nixi');
  s.bag.berry = 10;
  s.bag.treat = 3;
  const v = backpackView(s);
  const food = pocket(v, 'food');
  assert.deepEqual(food.items.map(e => e.id), ['berry', 'starfruit', 'treat']);
  const treat = food.items.find(e => e.id === 'treat');
  assert.equal(treat.count, 3);
  assert.equal(treat.action, 'befriend');
  assert.equal(treat.disabled, false);
  assert.equal(v.food.n, 10);
});
