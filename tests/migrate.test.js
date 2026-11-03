import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { decodeSave } from '../js/save/codec.js';
import { migrateState } from '../js/save/migrate.js';
import { emptyPackProgress } from '../js/state.js';
import { xpToNext, maxEnergy } from '../js/duel/progress.js';
import { BUCHT } from '../js/world/maps/bucht.js';
import { SPIELSTAND_V1 } from './fixtures/spielstand-v1.js';

test('Spielstand der Fassung 1 bleibt für immer ladbar', () => {
  const text = readFileSync(new URL('./fixtures/spielstand-v1.txt', import.meta.url), 'utf8');
  const d = decodeSave(text);
  assert.equal(d.ok, true);
  assert.deepEqual(migrateState(d.value), { ok: true, state: SPIELSTAND_V1 });
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
  assert.deepEqual(migrateState({ ...SPIELSTAND_V1, version: 2 }), { ok: false, reason: 'newer' });
  const bad = [
    null, 'x', {}, { version: 1 },
    { ...SPIELSTAND_V1, name: '' },
    { ...SPIELSTAND_V1, creature: { ...SPIELSTAND_V1.creature, species: 'drache' } },
    { ...SPIELSTAND_V1, creature: { ...SPIELSTAND_V1.creature, level: 'zehn' } },
  ];
  for (const b of bad) assert.deepEqual(migrateState(b), { ok: false, reason: 'invalid' });
});
