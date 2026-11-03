import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SPECIES, STARTERS, AREA_WILD, TRAINER_CREATURES, displayName, speciesName } from '../js/data/species.js';

test('Gebiet 2 hat zwei häufige und eine seltene Art, die Trainer-Art ist weiterentwickelt', () => {
  assert.deepEqual(AREA_WILD[2], { common: ['moosling', 'eichhuscher'], rare: 'rindenwicht' });
  for (const id of ['moosling', 'eichhuscher', 'rindenwicht']) {
    assert.equal(SPECIES[id].area, 2);
    assert.ok(SPECIES[id].description.length > 20);
  }
  assert.equal(SPECIES.rindenwicht.rarity, 'rare');
  assert.equal(speciesName('eichhuscher', 2), 'Kronenhuscher');
  assert.equal(speciesName('moosling', 2), 'Moosmuffel');
  assert.deepEqual(TRAINER_CREATURES[2], { species: 'eichhuscher', stage: 2 });
});

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
