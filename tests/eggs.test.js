import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSprite } from '../js/gfx/sprites.js';
import { EGG_ROWS, EGG_TINTS, eggRows } from '../js/gfx/art/eggs.js';
import { STARTERS } from '../js/data/species.js';

test('Ei ist 16 × 20 und für jedes Startwesen eingefärbt', () => {
  const s = parseSprite('egg', EGG_ROWS);
  assert.equal(s.w, 16);
  assert.equal(s.h, 20);
  for (const id of STARTERS) {
    assert.ok(EGG_TINTS[id], id);
    const tinted = parseSprite(`egg.${id}`, eggRows(id));
    assert.equal(tinted.w, 16);
  }
  assert.notDeepEqual(eggRows('funki'), eggRows('kiesel'));
});
