import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGameState } from '../js/state.js';
import { TREASURES, AREA_TREASURES, isTreasure, addTreasure, takeTreasure, rollTreasure, treasureName, treasureText } from '../js/items/treasures.js';
import { CONFIG } from '../js/config.js';
import { setLanguage, LANGUAGES } from '../js/i18n/i18n.js';

const seq = (...v) => {
  let i = 0;
  return { next: () => v[i++ % v.length] };
};
const s0 = () => {
  const s = newGameState({ name: 'A', species: 'nixi', nickname: null });
  s.treasures = {};
  s.album = [];
  return s;
};

test('Schatzwerte aus der Einstellung', () => {
  assert.deepEqual(CONFIG.treasures, { findChance: 1 / 3, noteChance: 0.25, wildDropChance: 0.1 });
});

test('24 Schätze: je Gebiet zwei häufige und ein seltener, alle IDs verschieden', () => {
  assert.equal(TREASURES.length, 24);
  assert.equal(new Set(TREASURES.map(x => x.id)).size, 24);
  for (let a = 1; a <= 8; a++) {
    assert.equal(AREA_TREASURES[a].common.length, 2);
    assert.equal(TREASURES.filter(x => x.area === a && x.rarity === 'rare').length, 1);
  }
  assert.deepEqual(AREA_TREASURES[1], { common: ['glassshell', 'gullfeather'], rare: 'amber' });
  assert.equal(isTreasure('amber'), true);
  assert.equal(isTreasure('drache'), false);
});

test('Schatz hinzufügen: Anzahl steigt, Album merkt ihn einmal', () => {
  const s = s0();
  assert.equal(addTreasure(s, 'glassshell', 2), 2);
  assert.equal(addTreasure(s, 'glassshell'), 1);
  assert.equal(s.treasures.glassshell, 3);
  assert.deepEqual(s.album, ['glassshell']);
  assert.equal(addTreasure(s, 'drache'), 0);
  assert.deepEqual(s.treasures, { glassshell: 3 });
  assert.deepEqual(s.album, ['glassshell']);
  addTreasure(s, 'amber');
  addTreasure(s, 'gullfeather');
  assert.deepEqual(s.album, ['glassshell', 'gullfeather', 'amber']);
});

test('Schatz nehmen: Anzahl sinkt, Album bleibt', () => {
  const s = s0();
  addTreasure(s, 'glassshell', 2);
  assert.equal(takeTreasure(s, 'glassshell'), true);
  assert.equal(takeTreasure(s, 'glassshell'), true);
  assert.equal(takeTreasure(s, 'glassshell'), false);
  assert.equal(s.treasures.glassshell, 0);
  assert.ok(s.album.includes('glassshell'));
});

test('Ziehen: immer ein häufiger Schatz des Gebiets', () => {
  assert.equal(rollTreasure(3, seq(0)), 'sporeball');
  assert.equal(rollTreasure(3, seq(0.99)), 'dragonflywing');
});

test('Namen und Sätze in jeder Sprache', () => {
  try {
    for (const lang of LANGUAGES) {
      setLanguage(lang);
      for (const { id } of TREASURES) {
        const name = treasureName(id);
        const text = treasureText(id);
        assert.ok(name && !name.includes('Text fehlt'), `${lang} ${id} name`);
        assert.ok(text && !text.includes('Text fehlt') && text.length <= 90, `${lang} ${id} text`);
      }
    }
  } finally {
    setLanguage('de');
  }
});
