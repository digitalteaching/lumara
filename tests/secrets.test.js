import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SECRET_PLACES } from '../js/data/secrets.js';
import { SECRET_STORY, secretStory } from '../js/data/story.js';
import { EN_SECRET_STORY } from '../js/i18n/en-story.js';
import { secretOpen, takeSecretStory, takeSecretStone } from '../js/world/secrets.js';
import { wildTableFor } from '../js/world/encounters.js';
import { AREA_WILD } from '../js/data/species.js';
import { giveKey } from '../js/items/keys.js';
import { newGameState } from '../js/state.js';
import { setLanguage } from '../js/i18n/i18n.js';

const s0 = () => newGameState({ name: 'A', species: 'nixi', nickname: null });

test('Ein geheimer Ort öffnet sich nur mit seinem Schlüsselgegenstand', () => {
  const s = s0();
  const entrance = { type: 'secret', id: 'eingang', place: 'eiche' };
  assert.equal(secretOpen(s, entrance), false);
  giveKey(s, 'hook');
  assert.equal(secretOpen(s, entrance), false);
  giveKey(s, 'lantern');
  assert.equal(secretOpen(s, entrance), true);
});

test('Geschichtsstein und Stein gibt es je Ort genau einmal', () => {
  const s = s0();
  assert.equal(takeSecretStory(s, 'eiche'), SECRET_STORY.eiche);
  assert.equal(takeSecretStory(s, 'eiche'), null);
  assert.equal(takeSecretStone(s, 'eiche'), 'life');
  assert.equal(s.creature.lifeStones, 1);
  assert.equal(takeSecretStone(s, 'eiche'), null);
  assert.deepEqual(s.secrets.eiche, { story: true, stone: true });
  const t = s0();
  t.creature.lifeStones = 3;
  assert.equal(takeSecretStone(t, 'eiche'), 'farsight'); // wirken schon alle Lebenssteine
  assert.equal(t.bag.farsight, 1);
  assert.equal(takeSecretStone(t, 'glasturm'), 'farsight');
});

test('Geheime Karten haben ihre eigene Tabelle wilder Wesen, sonst gilt die des Gebiets', () => {
  assert.equal(wildTableFor({ area: 2 }), AREA_WILD[2]);
  const own = { common: ['wurzelgeist'], rare: 'wurzelgeist' };
  assert.equal(wildTableFor({ area: 2, wild: own }), own);
});

test('Jeder geheime Ort hat sein Geschichtsstück auf Deutsch und Englisch, ohne Morrows Namen', () => {
  for (const place of Object.keys(SECRET_PLACES)) {
    assert.ok(SECRET_STORY[place]?.length >= 60 && SECRET_STORY[place].length <= 260, place);
    assert.ok(EN_SECRET_STORY[place]?.length >= 60 && EN_SECRET_STORY[place].length <= 260, place);
    assert.ok(!SECRET_STORY[place].includes('Morrow') && !EN_SECRET_STORY[place].includes('Morrow'), place);
  }
  setLanguage('en');
  try {
    assert.equal(secretStory('eiche'), EN_SECRET_STORY.eiche);
  } finally {
    setLanguage('de');
  }
});
