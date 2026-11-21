import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSprite } from '../js/gfx/sprites.js';
import { CREATURE_ART, STAGE_SIZE, creatureRows } from '../js/gfx/art/creatures.js';
import { shinyRows } from '../js/gfx/art/shiny.js';
import { STARTERS, AREA_WILD, TRAINER_CREATURES, HIDDEN_SPECIES } from '../js/data/species.js';

test('jedes Startwesen und jede wilde Art von Gebiet 1 hat Stufe 1, das Trainerwesen seine Stufe', () => {
  for (const id of [...STARTERS, ...AREA_WILD[1].common, AREA_WILD[1].rare]) assert.ok(CREATURE_ART[id]?.[1], id);
  const t = TRAINER_CREATURES[1];
  assert.ok(CREATURE_ART[t.species][t.stage]);
});

test('jede wilde Art von Gebiet 2 hat Stufe 1, der Kronenhuscher Stufe 2', () => {
  for (const id of [...AREA_WILD[2].common, AREA_WILD[2].rare]) assert.ok(CREATURE_ART[id]?.[1], id);
  const t = TRAINER_CREATURES[2];
  assert.ok(CREATURE_ART[t.species][t.stage]);
});

test('Größe passt zur Stufe, Bild ist ausgefüllt und bunt genug', () => {
  for (const [id, stages] of Object.entries(CREATURE_ART)) {
    for (const [st, r] of Object.entries(stages)) {
      const s = parseSprite(`${id}.${st}`, r), n = STAGE_SIZE[st];
      assert.equal(s.w, n);
      assert.equal(s.h, n);
      const filled = s.data.filter(c => c !== 0).length / s.data.length;
      assert.ok(filled > 0.2 && filled < 0.85, `${id}.${st}: ${filled}`);
      assert.ok(new Set(s.data).size >= 5, `${id}.${st} Farben`);
    }
  }
});

test('creatureRows fällt auf die höchste vorhandene Stufe zurück', () => {
  assert.equal(creatureRows('gischtling', 3), CREATURE_ART.gischtling[1]);
  assert.equal(creatureRows('haeuschel', 4), CREATURE_ART.haeuschel[2]);
});

const STAGES = [1, 2, 3, 4];
const mainColor = rows => {
  const n = {};
  for (const ch of rows.join('')) if (ch !== '.' && ch !== 'k') n[ch] = (n[ch] ?? 0) + 1;
  return Object.entries(n).sort((a, b) => b[1] - a[1])[0][0];
};

test('Jedes Startwesen hat Bilder für seine Stufen in der richtigen Größe', () => {
  for (const id of STARTERS) for (const s of STAGES) assert.equal(CREATURE_ART[id]?.[s]?.length, STAGE_SIZE[s], `${id}.${s}`);
});

test('Die Startwesen einer Stufe haben verschiedene Silhouetten', () => {
  for (const s of STAGES.slice(1)) {
    const shapes = STARTERS.map(id => CREATURE_ART[id][s].map(r => r.replace(/[^.]/g, '#')).join('/'));
    assert.equal(new Set(shapes).size, STARTERS.length, `Stufe ${s}`);
  }
});

test('Jede Stufe trägt die Hauptfarbe ihres Startwesens', () => {
  for (const id of STARTERS) {
    const main = mainColor(CREATURE_ART[id][1]);
    for (const s of STAGES.slice(1)) {
      const px = CREATURE_ART[id][s].join('').replace(/[.k]/g, '');
      assert.ok([...px].filter(c => c === main).length / px.length >= 0.08, `${id}.${s} ohne ${main}`);
    }
  }
});

const shape = rows => rows.map(r => r.replace(/[^.]/g, '#')).join('/');

test('Jedes neue Wesen hat ein Bild in 32 × 32', () => {
  for (const id of HIDDEN_SPECIES) {
    const rows = CREATURE_ART[id]?.[1];
    assert.equal(rows?.length, 32, id);
    for (const r of rows) assert.equal(r.length, 32, id);
    // Von Hand gezeichnet wie die übrigen Wesen: eigene Silhouette, Augen und Details in mindestens sieben Farben.
    assert.ok(new Set(rows.join('').replace(/\./g, '')).size >= 7, `${id}: zu wenig Farben`);
    for (const [other, stages] of Object.entries(CREATURE_ART)) {
      if (other !== id && stages[1]) assert.notEqual(shape(stages[1]), shape(rows), `${id} wie ${other}`);
    }
  }
});

test('Glanzform unterscheidet sich in mindestens 20 % der Pixel', () => {
  for (const id of HIDDEN_SPECIES) {
    const rows = CREATURE_ART[id][1];
    const out = shinyRows(rows, id);
    let filled = 0, changed = 0;
    rows.forEach((r, y) => [...r].forEach((ch, x) => {
      if (ch === '.' || ch === 'k') return;
      filled++;
      if (out[y][x] !== ch) changed++;
    }));
    assert.ok(changed / filled >= 0.2, `${id}: nur ${Math.round((100 * changed) / filled)} % anders`);
  }
});
