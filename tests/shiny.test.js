import { test } from 'node:test';
import { SPECIES } from '../js/data/species.js';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/config.js';
import { rollShiny } from '../js/world/encounters.js';
import { shinyRows } from '../js/gfx/art/shiny.js';
import { CREATURE_ART } from '../js/gfx/art/creatures.js';
import { BOOK_SLOTS } from '../js/data/book.js';

test('Glanzform: 1 zu 64', () => {
  assert.equal(CONFIG.wild.shinyChance, 1 / 64);
  assert.equal(rollShiny({ next: () => 0.0156 }), true);
  assert.equal(rollShiny({ next: () => 0.0157 }), false);
});

test('Jede Art im Buch sieht als Glanzform deutlich anders aus; Umriss und Leere bleiben', () => {
  for (const id of BOOK_SLOTS.filter(id => id && SPECIES[id].kind !== 'boss')) { // Morrow glänzt nie
    for (const [stage, rows] of Object.entries(CREATURE_ART[id])) {
      const out = shinyRows(rows, id);
      assert.equal(out.length, rows.length);
      let filled = 0, changed = 0;
      rows.forEach((r, y) => [...r].forEach((ch, x) => {
        const o = out[y][x];
        if (ch === '.' || ch === 'k') return assert.equal(o, ch, `${id}.${stage} (${x},${y})`);
        filled++;
        if (o !== ch) changed++;
      }));
      assert.ok(changed / filled >= 0.25, `${id}.${stage}: nur ${Math.round((100 * changed) / filled)} % anders`);
    }
  }
});

test('Grautöne bleiben ohne eigene Regel, wie sie sind', () => {
  assert.deepEqual(shinyRows(['kndsmfcw.']), ['kndsmfcw.']);
});
