import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAPS, npcLines } from '../js/world/network.js';
import { withFinale } from '../js/world/finale.js';
import { createMap } from '../js/world/map.js';
import { EN_WORLD } from '../js/i18n/en-world.js';
import { CHARACTERS } from '../js/gfx/art/characters.js';
import { newGameState } from '../js/state.js';
import { setLanguage } from '../js/i18n/i18n.js';

const AREAS = ['bucht', 'wald', 'moor', 'duenen', 'klippen', 'ruinen', 'see', 'wiese'];
const s0 = () => newGameState({ name: 'A', species: 'nixi', nickname: null });
const pack = n => ({ trainers: Array.from({ length: n }, (_, i) => ({ number: i + 1 })) });

test('Jeder Bewohner hat nach dem Finale einen neuen Satz, auf Deutsch und Englisch', () => {
  for (const id of AREAS) {
    for (const o of MAPS[id].objects.filter(x => x.type === 'npc' && !x.when)) {
      assert.ok(o.linesAfter?.length, `${id}.${o.id}`);
      assert.equal(EN_WORLD.objects[id]?.[o.id]?.linesAfter?.length, o.linesAfter.length, `${id}.${o.id} (en)`);
      for (const l of [...o.linesAfter, ...EN_WORLD.objects[id][o.id].linesAfter]) assert.ok(l.length <= 100, l);
    }
  }
});

test('Nach dem Finale sagen die Bewohner ihre neuen Sätze, vorher die alten', () => {
  const s = { ...s0(), stones: [1, 2, 3, 4, 5, 6, 7, 8] };
  const bram = MAPS.bucht.objects.find(o => o.id === 'bram');
  assert.notDeepEqual(npcLines(bram, s, 1, pack(8)), bram.linesAfter);
  s.finale.done = true;
  assert.deepEqual(npcLines(bram, s, 1, pack(8)), bram.linesAfter);
  setLanguage('en');
  try {
    assert.deepEqual(npcLines(bram, s, 1, pack(8)), EN_WORLD.objects.bucht.bram.linesAfter);
  } finally {
    setLanguage('de');
  }
});

test('Morrow wohnt nach dem Finale am Leuchtturm, auch mit einem Paket mit weniger Trainern', () => {
  const s = s0();
  assert.equal(withFinale(MAPS.bucht, s).objects.some(o => o.id === 'morrow'), false);
  s.finale.done = true;
  s.packs = { MATH: {} };
  const morrow = withFinale(MAPS.bucht, s).objects.find(o => o.id === 'morrow');
  assert.ok(morrow && morrow.type === 'npc' && CHARACTERS[morrow.sprite]);
  const others = MAPS.bucht.objects.filter(o => o !== morrow);
  const m = createMap({ ...MAPS.bucht, objects: others });
  assert.ok([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => m.canEnter(morrow.x + dx, morrow.y + dy)), 'man kann Morrow ansprechen');
  assert.equal(EN_WORLD.objects.bucht.morrow?.lines?.length, morrow.lines.length);
});
