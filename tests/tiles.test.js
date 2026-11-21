import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSprite } from '../js/gfx/sprites.js';
import { readFileSync } from 'node:fs';
import { TILES, BUILDINGS, PROPS, CAVE_SOCKETS, OVERLAY_TILES, TASK_ART } from '../js/gfx/art/tiles.js';
import { WALKABLE, BLOCKED } from '../js/world/map.js';
import { TASKS } from '../js/data/tasks.js';

test('jede Kachelart hat Bilder zu 16 × 16', () => {
  for (const kind of [...WALKABLE, ...BLOCKED]) {
    assert.ok(TILES[kind]?.length, kind);
    TILES[kind].forEach((f, i) => {
      const s = parseSprite(`${kind}.${i}`, f);
      assert.equal(s.w, 16);
      assert.equal(s.h, 16);
    });
  }
});

test('Gebäude und Gegenstände haben ihre Größe', () => {
  const size = { lighthouse: [32, 64], house: [48, 48], houseTeal: [48, 48], housePlum: [48, 48], boat: [32, 16] };
  for (const [id, [w, h]] of Object.entries(size)) {
    const s = parseSprite(id, BUILDINGS[id]);
    assert.equal(s.w, w, id);
    assert.equal(s.h, h, id);
  }
  assert.equal(parseSprite('sign', PROPS.sign).w, 16);
});

test('Gegenstände der Welt aus Plan 3a haben ihre Größe', () => {
  const size = { bush: [16, 16], bushEmpty: [16, 16], noteStone: [16, 16], noteStoneDone: [16, 16], beaconDark: [16, 32], beaconLit: [16, 32], oldtree: [16, 32] };
  for (const [id, [w, h]] of Object.entries(size)) {
    const s = parseSprite(id, PROPS[id]);
    assert.equal(s.w, w, id);
    assert.equal(s.h, h, id);
  }
  assert.equal(TILES.fern.length, 2);
});

test('Kacheln der Gebiete 3 bis 5: 16 × 16, bekannte Farben, richtige Bildzahl', () => {
  const frames = { peat: 1, reed: 2, bog: 2, glowshroom: 1, glasssand: 1, dunegrass: 2, dune: 1, mirage: 2, cliffrock: 1, windgrass: 2, clouds: 2, bridge: 1, bridgev: 1, spire: 1 };
  for (const [k, n] of Object.entries(frames)) {
    assert.equal(TILES[k].length, n, k);
    TILES[k].forEach((f, i) => {
      const s = parseSprite(`${k}.${i}`, f); // wirft bei unbekannten Farben
      assert.equal(s.w, 16, k);
      assert.equal(s.h, 16, k);
    });
  }
  for (const [k, h] of Object.entries({ bigshroom: 32, statue: 32, glasstower: 48, windmill0: 32, windmill1: 32 })) {
    const s = parseSprite(k, PROPS[k]);
    assert.equal(s.w, 16, k);
    assert.equal(s.h, h, k);
  }
  assert.notDeepEqual(PROPS.windmill0, PROPS.windmill1); // die Flügel stehen anders
});

test('Kacheln der Gebiete 6 bis 8: 16 × 16, bekannte Farben, richtige Bildzahl', () => {
  const frames = { cobble: 1, canal: 2, ruinwall: 1, ivy: 2, snow: 1, ice: 1, icewater: 2, snowpine: 1, snowgrass: 2, nightgrass: 1, nightrock: 1, nightcliff: 1, startall: 2, nightstone: 1 };
  for (const [k, n] of Object.entries(frames)) {
    assert.equal(TILES[k]?.length, n, k);
    TILES[k].forEach((f, i) => {
      const s = parseSprite(`${k}.${i}`, f); // wirft bei unbekannten Farben
      assert.equal(s.w, 16, k);
      assert.equal(s.h, 16, k);
    });
  }
  for (const k of ['canal', 'icewater', 'ivy', 'snowgrass', 'startall']) assert.notDeepEqual(TILES[k][0], TILES[k][1], k);
  for (const k of ['snowpine', 'nightrock']) assert.ok(OVERLAY_TILES.has(k), k);
  for (const [k, h] of Object.entries({ gear0: 32, gear1: 32, observatory: 48, icecave: 32, tent: 32 })) {
    const s = parseSprite(k, PROPS[k]);
    assert.equal(s.w, 16, k);
    assert.equal(s.h, h, k);
  }
  assert.notDeepEqual(PROPS.gear0, PROPS.gear1); // das Zahnrad steht anders
  const gate = parseSprite('cavegate', BUILDINGS.cavegate);
  assert.equal(gate.w, 48);
  assert.equal(gate.h, 48);
  assert.equal(CAVE_SOCKETS.length, 8);
  assert.ok(CAVE_SOCKETS.every(([x, y]) => x >= 0 && x < 48 && y >= 0 && y < 48));
  assert.equal(new Set(CAVE_SOCKETS.map(p => p.join(','))).size, 8); // acht verschiedene Fassungen
});

// Die Bilder der Spielaufgaben lesen Reihenfolge und Lage aus einer Abschrift, damit die Kacheln keine
// Karte mitladen. Die Quelle bleibt js/data/tasks.js.
test('Kacheln: Abschrift der Aufgaben gleicht js/data/tasks.js, ohne Import von Daten oder Karten', () => {
  assert.deepEqual(TASK_ART.runeOrder, TASKS[2].order);
  assert.deepEqual(TASK_ART.leverOrder, TASKS[6].order);
  assert.deepEqual(TASK_ART.starTablet, { order: TASKS[8].order, plates: TASKS[8].plates });
  const src = readFileSync(new URL('../js/gfx/art/tiles.js', import.meta.url), 'utf8');
  assert.doesNotMatch(src, /^import /m);
});

// Die Zeichenbäume der Waldaufgabe sehen den Flüsterbäumen sonst sehr ähnlich: Ihre Krone ist golden,
// ohne die Grüntöne des Flüsterbaums.
test('Zeichenbäume: goldene Krone, nicht grün wie der Flüsterbaum', () => {
  const crown = rows => rows.slice(0, 15).join('').replace(/[.k]/g, '');
  const green = /[Flg]/;
  assert.match(crown(PROPS.oldtree), green);
  for (let i = 0; i < 4; i++) {
    for (const v of ['', 'Lit', 'Open']) {
      const c = crown(PROPS[`runetree${i}${v}`]);
      assert.doesNotMatch(c, green, `runetree${i}${v}`);
      assert.ok([...c].filter(ch => ch === 'h').length > c.length / 3, `runetree${i}${v}: golden`);
    }
  }
});

test('Aushang (Lumara 1.3): eigenes Bild 16 × 16 mit Glanz-Bild, das sich nur im Glanz unterscheidet', () => {
  const a = parseSprite('noticeBoard', PROPS.noticeBoard);
  const b = parseSprite('noticeBoardGlint', PROPS.noticeBoardGlint);
  assert.deepEqual([a.w, a.h, b.w, b.h], [16, 16, 16, 16]);
  const diff = [...a.data].filter((v, i) => v !== b.data[i]).length;
  assert.ok(diff > 0 && diff <= 5, `${diff} Pixel anders`);
});
