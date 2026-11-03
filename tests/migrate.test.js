import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { decodeSave } from '../js/save/codec.js';
import { migrateState } from '../js/save/migrate.js';
import { emptyPackProgress } from '../js/state.js';
import { xpToNext, maxEnergy } from '../js/duel/progress.js';
import { BUCHT } from '../js/world/maps/bucht.js';
import { SPIELSTAND_V1 } from './fixtures/spielstand-v1.js';
import { SPIELSTAND_V2 } from './fixtures/spielstand-v2.js';
import { SPIELSTAND_V3 } from './fixtures/spielstand-v3.js';
import { foodCount } from '../js/items/bag.js';
import { createMap } from '../js/world/map.js';

test('Spielstand der Fassung 1 bleibt für immer ladbar und wird zu Format 3', () => {
  const d = decodeSave(readFileSync(new URL('./fixtures/spielstand-v1.txt', import.meta.url), 'utf8'));
  assert.equal(d.ok, true);
  const m = migrateState(d.value);
  assert.equal(m.ok, true);
  assert.equal(m.state.version, 3);
  const { version, playMs, stones, lastStone, bag, shineActive, story, world, ...rest } = m.state;
  const { version: _v, ...v1 } = SPIELSTAND_V1;
  assert.deepEqual(rest, v1);
  assert.deepEqual(stones, [1]); // Hüterin war mit ENQ9 besiegt → Stein 1 leuchtet
  assert.equal(lastStone, null);
  assert.equal(playMs, 5700000); // Spielzeit aus allen Paketen zusammen
  assert.deepEqual(bag, { berry: 0, starfruit: 0, farsight: 0, shine: 0, time: 0 });
  assert.equal(shineActive, false);
  assert.deepEqual(story, {});
  assert.deepEqual(world, { bushes: {}, notes: {}, finds: {} });
});

test('Spielstand der Fassung 2 bleibt für immer ladbar und wird zu Format 3', () => {
  const d = decodeSave(readFileSync(new URL('./fixtures/spielstand-v2.txt', import.meta.url), 'utf8'));
  assert.deepEqual(migrateState(d.value), { ok: true, state: { ...SPIELSTAND_V2, version: 3, bag: { ...SPIELSTAND_V2.bag, time: 0 } } });
});

test('Spielstand der Fassung 3 bleibt für immer ladbar', () => {
  const d = decodeSave(readFileSync(new URL('./fixtures/spielstand-v3.txt', import.meta.url), 'utf8'));
  assert.deepEqual(migrateState(d.value), { ok: true, state: SPIELSTAND_V3 });
});

test('Format 3: unmögliche Zeitsteine werden 0', () => {
  for (const time of [-1, 'x', 1.5]) assert.equal(migrateState({ ...structuredClone(SPIELSTAND_V3), bag: { ...SPIELSTAND_V3.bag, time } }).state.bag.time, 0);
});

test('Format 2: unmögliche Werte werden repariert', () => {
  const m = migrateState({
    ...structuredClone(SPIELSTAND_V2),
    position: { map: 'bucht', x: 19, y: 24, dir: 'up' },
    stones: [3, 1, 1, 9, 'x'],
    lastStone: 7,
    bag: { berry: 99, starfruit: -1, farsight: 'zwei' },
    story: { 1: 9, 12: 1 },
    world: { bushes: { a: 'x', 'bucht:1,1': 5 } },
  });
  assert.equal(m.ok, true);
  assert.deepEqual(m.state.stones, [1, 3]);
  assert.equal(m.state.lastStone, null); // Stein 7 leuchtet nicht → null
  assert.equal(foodCount(m.state.bag), 10);
  assert.equal(m.state.bag.farsight, 0);
  assert.equal(m.state.bag.shine, 0);
  assert.deepEqual(m.state.story, { 1: 3 }); // höchstens 3 Stücke je Gebiet, nur Gebiete 1..8
  assert.deepEqual(m.state.world, { bushes: { 'bucht:1,1': 5 }, notes: {}, finds: {} });
});

test('Format 2: ein besiegter Hüter in irgendeinem Paket lässt seinen Leuchtstein leuchten', () => {
  const raw = structuredClone(SPIELSTAND_V2);
  raw.packs.GNEP = { ...structuredClone(raw.packs.ENQ9), beaten: [2] };
  const m = migrateState(raw);
  assert.deepEqual(m.state.stones, [1, 2]);
  assert.equal(m.state.lastStone, 1);
});

test('fehlende Teile werden ergänzt, unmögliche Werte begrenzt', () => {
  const m = migrateState({ version: 1, name: 'Mia', creature: { species: 'nixi', level: 7, xpInLevel: 9999, energy: 99 }, packs: { ENQ9: { beaten: [1, 1, 'x', 12] }, kaputt: 5 } });
  assert.equal(m.ok, true);
  const c = m.state.creature;
  assert.equal(c.xpInLevel, xpToNext(7) - 1);
  assert.equal(c.energy, maxEnergy(c));
  assert.equal(c.lifeStones, 0);
  assert.equal(c.nickname, null);
  assert.deepEqual(m.state.settings, { textSpeed: 'normal' });
  assert.deepEqual(m.state.position, { map: 'bucht', ...BUCHT.spawn });
  assert.deepEqual(m.state.packs, { ENQ9: { ...emptyPackProgress(), beaten: [1] } });
  assert.equal(m.state.savedAt, 0);
});

test('Position in einer Wand oder außerhalb der Karte wird zum Startpunkt', () => {
  const m = migrateState({ ...structuredClone(SPIELSTAND_V1), position: { map: 'bucht', x: 0, y: 0, dir: 'up' } });
  assert.deepEqual(m.state.position, { map: 'bucht', ...BUCHT.spawn });
});

test('aus einer neueren Fassung oder unbrauchbar', () => {
  assert.deepEqual(migrateState({ ...SPIELSTAND_V3, version: 4 }), { ok: false, reason: 'newer' });
  const bad = [
    null, 'x', {}, { version: 1 },
    { ...SPIELSTAND_V1, name: '' },
    { ...SPIELSTAND_V1, creature: { ...SPIELSTAND_V1.creature, species: 'drache' } },
    { ...SPIELSTAND_V1, creature: { ...SPIELSTAND_V1.creature, level: 'zehn' } },
  ];
  for (const b of bad) assert.deepEqual(migrateState(b), { ok: false, reason: 'invalid' });
});

test('Der neue Pfad der Bucht macht keine gespeicherte Position ungültig', () => {
  const m = createMap(BUCHT);
  for (const [x, y] of [[22, 8], [BUCHT.spawn.x, BUCHT.spawn.y], [BUCHT.respawn.x, BUCHT.respawn.y]]) assert.ok(m.canEnter(x, y));
  for (let y = 5; y <= 8; y++) for (const x of [38, 39]) assert.equal(m.tileAt(x, y), 'fog');
  assert.equal(migrateState(structuredClone(SPIELSTAND_V1)).state.position.map, 'bucht');
});
