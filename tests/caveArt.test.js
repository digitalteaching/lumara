import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BOOK_SLOTS, BOOK_SIZE, recordSighting } from '../js/data/book.js';
import { SPECIES, CAVE_SPECIES, BOSS_SPECIES } from '../js/data/species.js';
import { EN_SPECIES } from '../js/i18n/en-species.js';
import { CREATURE_ART, STAGE_SIZE } from '../js/gfx/art/creatures.js';
import { shinyRows } from '../js/gfx/art/shiny.js';
import { TILES, PROPS } from '../js/gfx/art/tiles.js';
import { WALKABLE, BLOCKED, TALL_GRASS } from '../js/world/map.js';
import { ARENAS } from '../js/gfx/arena.js';
import { newGameState } from '../js/state.js';

const shape = r => r.map(x => x.replace(/[^.]/g, '#')).join('/');

test('Das Buch ist voll: Plätze 31 bis 33 für die Höhle und Morrow', () => {
  assert.equal(BOOK_SLOTS.length, BOOK_SIZE);
  assert.deepEqual(BOOK_SLOTS.slice(30, 33), ['echomaus', 'kristallraupe', 'morrow']);
  assert.ok(BOOK_SLOTS.every(Boolean), 'keine leeren Plätze mehr');
  assert.deepEqual([CAVE_SPECIES, BOSS_SPECIES], [['echomaus', 'kristallraupe'], ['morrow']]);
  const s = newGameState({ name: 'A', species: 'nixi', nickname: null });
  recordSighting(s, 'morrow', { beaten: true });
  assert.deepEqual(s.book.morrow, { beaten: true, shiny: false });
});

test('Höhlenarten und Morrow: Bilder in ihrer Größe, eigene Silhouetten, Texte auf Englisch', () => {
  assert.deepEqual(SPECIES.morrow.kind, 'boss');
  for (const id of ['echomaus', 'kristallraupe']) assert.equal(SPECIES[id].kind, 'cave');
  const own = [['echomaus', 1], ['kristallraupe', 1], ['morrow', 1], ['morrow', 2], ['morrow', 3]];
  for (const [id, stage] of own) {
    const rows = CREATURE_ART[id][stage];
    assert.equal(rows.length, STAGE_SIZE[stage], `${id}.${stage}`);
    for (const [other, stages] of Object.entries(CREATURE_ART)) {
      for (const [st, r] of Object.entries(stages)) if (!(other === id && Number(st) === stage) && r.length === rows.length) assert.notEqual(shape(r), shape(rows), `${id}.${stage} wie ${other}.${st}`);
    }
  }
  for (const id of ['echomaus', 'kristallraupe', 'morrow']) assert.ok(EN_SPECIES[id]?.names?.[0] && EN_SPECIES[id].description, id);
  assert.equal(EN_SPECIES.morrow.names[0], 'Morrow');
});

test('Glanzformen der Höhlenarten sind deutlich anders', () => {
  for (const id of CAVE_SPECIES) {
    const rows = CREATURE_ART[id][1];
    const out = shinyRows(rows, id);
    let filled = 0, changed = 0;
    rows.forEach((r, y) => [...r].forEach((ch, x) => { if (ch === '.' || ch === 'k') return; filled++; if (out[y][x] !== ch) changed++; }));
    assert.ok(changed / filled >= 0.25, id);
  }
});

test('Kacheln, Requisiten und Arena der Höhle', () => {
  for (const k of ['cavefloor', 'crystalmoss', 'stairsdown', 'stairsup']) assert.ok(WALKABLE.has(k) && TILES[k], k);
  for (const k of ['cavewall', 'cavewater']) assert.ok(BLOCKED.has(k) && TILES[k], k);
  assert.ok(TALL_GRASS.has('crystalmoss'));
  for (const k of ['echocrystal', 'warmcrystal', 'morrowmist']) assert.ok(PROPS[k], k);
  assert.equal(typeof ARENAS.cave, 'function');
});
