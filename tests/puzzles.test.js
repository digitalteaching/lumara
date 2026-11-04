import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SECRET_PLACES } from '../js/data/secrets.js';
import { SECRET_STORY } from '../js/data/story.js';
import { EN_SECRET_STORY } from '../js/i18n/en-story.js';
import { turnGear, puzzleSolved, gearsOf } from '../js/world/puzzles.js';
import { migrateState } from '../js/save/migrate.js';
import { SPIELSTAND_V5 } from './fixtures/spielstand-v5.js';
import { newGameState } from '../js/state.js';
import { textIn } from '../js/i18n/i18n.js';

const s0 = () => newGameState({ name: 'A', species: 'nixi', nickname: null });

test('Die vier neuen geheimen Orte: Gebiet, Schlüssel, Stein und bei der Sternwarte die Sternkarte', () => {
  assert.deepEqual(SECRET_PLACES.gezeiten, { area: 1, key: 'nutshell', stone: 'shine' });
  assert.deepEqual(SECRET_PLACES.irrlicht, { area: 3, key: 'nutshell', stone: 'time' });
  assert.deepEqual(SECRET_PLACES.eisgrotte, { area: 7, key: 'skates', stone: 'life' });
  assert.deepEqual(SECRET_PLACES.sternwarte, { area: 6, key: 'starmap', stone: 'farsight', gears: [2, 1, 3] });
  for (const place of ['gezeiten', 'irrlicht', 'eisgrotte', 'sternwarte']) {
    assert.ok(SECRET_STORY[place] && EN_SECRET_STORY[place], place);
    assert.ok(textIn('de', `secret.name.${place}`) && textIn('en', `secret.name.${place}`), place);
  }
});

test('Ein Zahnrad dreht sich bei jedem Drehen eine Vierteldrehung weiter, nach der vierten wieder oben', () => {
  const s = s0();
  assert.deepEqual(gearsOf(s, 'sternwarte'), [0, 0, 0]);
  for (const want of [1, 2, 3, 0]) {
    assert.equal(turnGear(s, 'sternwarte', 0).dir, want);
    assert.equal(gearsOf(s, 'sternwarte')[0], want);
  }
  assert.deepEqual(gearsOf(s, 'sternwarte'), [0, 0, 0]);
});

test('Stehen alle Räder wie auf der Sternkarte, ist das Rätsel gelöst und bleibt es beim Weiterdrehen', () => {
  const s = s0();
  assert.equal(puzzleSolved(s, 'sternwarte'), false);
  const turns = [0, 0, 1, 2, 2, 2];
  const results = turns.map(i => turnGear(s, 'sternwarte', i));
  assert.deepEqual(results.map(r => r.solvedNow), [false, false, false, false, false, true]);
  assert.equal(puzzleSolved(s, 'sternwarte'), true);
  assert.equal(turnGear(s, 'sternwarte', 1).solvedNow, false);
  assert.equal(puzzleSolved(s, 'sternwarte'), true);
  assert.deepEqual(s.secrets.sternwarte, { story: false, stone: false, solved: true, gears: [2, 2, 3] });
});

test('Orte ohne Zahnräder und Räder außerhalb der drei bleiben unberührt', () => {
  const s = s0();
  assert.equal(turnGear(s, 'eiche', 0), null);
  assert.equal(turnGear(s, 'sternwarte', 3), null);
  assert.equal(turnGear(s, 'sternwarte', -1), null);
  assert.equal(puzzleSolved(s, 'eiche'), false);
  assert.deepEqual(s.secrets, {});
});

test('Die vier Stellungen eines Rads gibt es auf Deutsch und Englisch', () => {
  assert.deepEqual([0, 1, 2, 3].map(i => textIn('de', `gear.dir.${i}`)), ['oben', 'rechts', 'unten', 'links']);
  assert.deepEqual([0, 1, 2, 3].map(i => textIn('en', `gear.dir.${i}`)), ['up', 'right', 'down', 'left']);
});

test('Format 5: der Rätselstand wird beim Laden repariert, andere Orte bekommen keine Räder', () => {
  const m = migrateState({
    ...structuredClone(SPIELSTAND_V5),
    secrets: {
      sternwarte: { story: false, stone: false, solved: 'ja', gears: [9, 'x'] },
      eiche: { story: true, stone: true, solved: true, gears: [1, 1, 1] },
      gezeiten: { story: true, stone: false },
    },
  });
  assert.deepEqual(m.state.secrets, {
    sternwarte: { story: false, stone: false, solved: false, gears: [0, 0, 0] },
    eiche: { story: true, stone: true },
    gezeiten: { story: true, stone: false },
  });
  const ok = migrateState({ ...structuredClone(SPIELSTAND_V5), secrets: { sternwarte: { story: true, stone: false, solved: true, gears: [2, 1, 3] } } });
  assert.deepEqual(ok.state.secrets.sternwarte, { story: true, stone: false, solved: true, gears: [2, 1, 3] });
  const bare = migrateState({ ...structuredClone(SPIELSTAND_V5), secrets: { sternwarte: { story: true, stone: true } } });
  assert.deepEqual(bare.state.secrets.sternwarte, { story: true, stone: true, solved: false, gears: [0, 0, 0] });
});
