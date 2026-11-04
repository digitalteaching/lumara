import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fallenStarSpot, rareChanceAt } from '../js/world/stars.js';
import { pickWild } from '../js/world/encounters.js';
import { WIESE } from '../js/world/maps/wiese.js';
import { MAPS } from '../js/world/network.js';
import { createMap, reachable, cellKey } from '../js/world/map.js';
import { createRng } from '../js/core/rng.js';
import { CONFIG } from '../js/config.js';
import { AREA_WILD } from '../js/data/species.js';
import { newGameState } from '../js/state.js';
import { textIn } from '../js/i18n/i18n.js';

const s0 = () => newGameState({ name: 'A', species: 'nixi', nickname: null });

test('Sternschnuppen gibt es erst nach dem Finale; alle 10 Minuten Spielzeit liegt eine woanders', () => {
  const s = s0();
  assert.equal(fallenStarSpot(s, WIESE), null);
  s.finale.done = true;
  const a = fallenStarSpot(s, WIESE);
  assert.deepEqual(a, WIESE.starSpots[0]);
  s.playMs = 10 * 60 * 1000;
  assert.notDeepEqual(fallenStarSpot(s, WIESE), a);
  s.playMs = WIESE.starSpots.length * 10 * 60 * 1000;
  assert.deepEqual(fallenStarSpot(s, WIESE), a);
  assert.equal(fallenStarSpot(s, MAPS.bucht), null);
});

test('Die Sternschnuppen liegen auf erreichbarem Sternengras', () => {
  assert.equal(WIESE.starSpots.length, 5);
  const map = createMap(WIESE, { openGates: (WIESE.gates ?? []).map(g => g.id) });
  const seen = reachable(map, WIESE.spawn);
  for (const p of WIESE.starSpots) {
    assert.equal(map.tileAt(p.x, p.y), 'startall', `${p.x},${p.y}`);
    assert.ok(seen.has(cellKey(p.x, p.y)), `${p.x},${p.y}`);
  }
});

test('In der Nähe einer Sternschnuppe sind seltene Wesen viel häufiger', () => {
  const s = { ...s0(), finale: { done: true } };
  const star = fallenStarSpot(s, WIESE);
  assert.equal(rareChanceAt(s, WIESE, star.x, star.y), 0.5);
  assert.equal(rareChanceAt(s, WIESE, star.x + 1, star.y + 1), 0.5);
  assert.equal(rareChanceAt(s, WIESE, star.x + 3, star.y), CONFIG.wild.rareChance);
  assert.equal(rareChanceAt(s0(), WIESE, star.x, star.y), CONFIG.wild.rareChance);
  const rng = createRng(7);
  const table = AREA_WILD[8];
  let rare = 0;
  for (let i = 0; i < 1000; i++) if (pickWild(table, rng, 0.5) === table.rare) rare++;
  assert.ok(rare > 400 && rare < 600, `${rare}`);
  for (const key of ['star.near']) assert.ok(textIn('de', key) && textIn('en', key));
});
