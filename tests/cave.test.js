import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HOEHLE1 } from '../js/world/maps/hoehle1.js';
import { HOEHLE2 } from '../js/world/maps/hoehle2.js';
import { HOEHLE3 } from '../js/world/maps/hoehle3.js';
import { MAPS, mapOfArea } from '../js/world/network.js';
import { createMap, reachable, cellKey } from '../js/world/map.js';
import { caveOpen, caveGateLines, ilvyCaveLines } from '../js/world/caveGate.js';
import { withFinale } from '../js/world/finale.js';
import { islandMap } from '../js/world/islandMap.js';
import { bookView } from '../js/data/book.js';
import { EN_WORLD } from '../js/i18n/en-world.js';
import { newGameState } from '../js/state.js';
import { setLanguage } from '../js/i18n/i18n.js';

const CAVES = [HOEHLE1, HOEHLE2, HOEHLE3];
const s0 = () => newGameState({ name: 'A', species: 'nixi', nickname: null });
const pack = n => ({ trainers: Array.from({ length: n }, (_, i) => ({ number: i + 1 })) });
const landing = (exit, def) => [exit.to, exit.at.x, exit.at.y, createMap(MAPS[exit.to]).canEnter(exit.at.x, exit.at.y)];

test('Drei Ebenen im Berg: alles erreichbar, Treppen in beide Richtungen, Ausgang auf die Sternenwiese', () => {
  CAVES.forEach((def, i) => {
    assert.equal(MAPS[def.id], def);
    assert.deepEqual([def.cave, def.area, def.arena], [i + 1, 8, 'cave']);
    const map = createMap(def);
    const seen = reachable(map, def.spawn);
    for (const e of def.exits) assert.ok(seen.has(cellKey(e.x, e.y)), `${def.id}: Ausgang (${e.x}, ${e.y})`);
  });
  const up = e => e.to;
  assert.deepEqual(HOEHLE1.exits.map(up).sort(), ['hoehle2', 'wiese']);
  assert.deepEqual(HOEHLE2.exits.map(up).sort(), ['hoehle1', 'hoehle3']);
  assert.deepEqual(HOEHLE3.exits.map(up), ['hoehle2']);
  assert.deepEqual(landing(HOEHLE1.exits.find(e => e.to === 'wiese')), ['wiese', 8, 8, true]);
  for (const def of CAVES) for (const e of def.exits) assert.equal(landing(e)[3], true, `${def.id} → ${e.to}`);
  const tall = def => { const m = createMap(def); return def.rows.some((r, y) => [...r].some((_, x) => m.isTallGrass(x, y))); };
  assert.deepEqual(CAVES.map(tall), [true, true, false]);
  for (const def of [HOEHLE1, HOEHLE2]) assert.deepEqual(def.wild, { common: ['echomaus'], rare: 'kristallraupe' });
});

test('Unten: Morrow und davor der warme Kristall; nach dem Finale nur noch sein Kristall', () => {
  const s = s0();
  const before = withFinale(HOEHLE3, s).objects;
  assert.ok(before.some(o => o.type === 'boss'));
  assert.ok(before.some(o => o.type === 'heal'));
  s.finale.done = true;
  const after = withFinale(HOEHLE3, s).objects;
  assert.equal(after.some(o => o.type === 'boss'), false);
  assert.ok(after.some(o => o.type === 'deco' && o.lines));
  assert.equal(withFinale(HOEHLE1, s).objects.some(o => o.id === 'ilvy'), false);
});

test('Das Höhlentor öffnet sich mit allen acht Steinen und einem Paket mit allen acht Trainern', () => {
  const s = s0();
  s.stones = [1, 2, 3, 4, 5, 6, 7];
  assert.equal(caveOpen(s, pack(8)), false);
  s.stones = [1, 2, 3, 4, 5, 6, 7, 8];
  assert.equal(caveOpen(s, pack(3)), false);
  assert.equal(caveOpen(s, pack(8)), true);
  assert.deepEqual(caveGateLines(8, { packFull: true }), ['Das Tor steht offen. Kühle Luft weht aus dem Berg.']);
  assert.deepEqual(caveGateLines(8, { packFull: false }), ['Ein großes Tor im Berg mit acht Fassungen.', 'Alle acht Fassungen leuchten. Das Tor öffnet sich, sobald deine Lehrkraft alle acht Themen freigibt.']);
  setLanguage('en');
  try {
    assert.deepEqual(caveGateLines(8, { packFull: true }), ['The gate is open. Cool air blows out of the mountain.']);
  } finally {
    setLanguage('de');
  }
});

test('Ilvy wartet oben, nur vor dem Finale; ohne das letzte Stück der Wiese nennt sie den Namen', () => {
  const s = s0();
  const ilvy = withFinale(HOEHLE1, s).objects.find(o => o.id === 'ilvy');
  assert.ok(ilvy && ilvy.type === 'npc');
  assert.ok(ilvyCaveLines(s).some(l => l.includes('Morrow')));
  assert.equal(ilvyCaveLines(s).length, 3);
  s.story = { 8: 3 };
  assert.equal(ilvyCaveLines(s).length, 1);
  setLanguage('en');
  try {
    assert.ok(ilvyCaveLines(s0())[1].includes('Morrow') && ilvyCaveLines(s0())[0].startsWith('There you are'));
  } finally {
    setLanguage('de');
  }
});

test('Die Höhle ist kein eigenes Gebiet: Karte der Insel und Gebiet 8 bleiben die Sternenwiese', () => {
  assert.equal(mapOfArea(8).id, 'wiese');
  const ids = JSON.stringify(islandMap(s0(), pack(8)));
  assert.equal(/hoehle/.test(ids), false);
  for (const def of CAVES) assert.ok(EN_WORLD.areas[def.id]?.name, def.id);
  const s = s0();
  s.book = { echomaus: { beaten: false, shiny: false } };
  assert.equal(bookView(s).entries[30].place, 'Höhle im Berg');
});

test('Echokristalle sprechen auf Deutsch und Englisch', () => {
  const echoes = CAVES.flatMap(def => def.objects.filter(o => o.type === 'deco' && o.prop === 'echocrystal' && o.lines).map(o => [def.id, o]));
  assert.ok(echoes.length >= 4);
  for (const [id, o] of echoes) assert.equal(EN_WORLD.objects[id]?.[o.id]?.lines?.length, o.lines.length, `${id}.${o.id}`);
});
