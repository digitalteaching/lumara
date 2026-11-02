import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SPECIES, STARTERS, AREA_WILD, TRAINER_CREATURES, displayName } from '../js/data/species.js';

test('fünf Startwesen mit je 4 Stufennamen und Besonderheit', () => {
  assert.deepEqual(SPECIES.funki.names, ['Funki', 'Funkelflug', 'Laternenfalter', 'Nordlichtfalter']);
  for (const id of STARTERS) {
    assert.equal(SPECIES[id].names.length, 4);
    assert.ok(SPECIES[id].special.name);
  }
});

test('Tabellen verweisen nur auf vorhandene Arten', () => {
  for (const t of Object.values(AREA_WILD)) for (const id of [...t.common, t.rare]) assert.ok(SPECIES[id], id);
  for (const t of Object.values(TRAINER_CREATURES)) assert.ok(SPECIES[t.species].names[t.stage - 1]);
});

test('Anzeigename: Spitzname oder Name der aktuellen Stufe', () => {
  assert.equal(displayName({ species: 'nixi', nickname: 'Blubb', level: 3 }), 'Blubb');
  assert.equal(displayName({ species: 'nixi', nickname: null, level: 20 }), 'Quellnix');
});
