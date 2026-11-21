import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAPS } from '../js/world/network.js';
import { createMap, step, cellKey } from '../js/world/map.js';
import { blockedCells } from '../js/world/secrets.js';
import { QUESTS } from '../js/data/quests.js';
import { newGameState } from '../js/state.js';

const DIRS = ['up', 'down', 'left', 'right'];

// Alle Ruhestellungen (Feld und Blickrichtung), die ein Kind mit echten Tastendrücken erreicht:
// Ist das Feld in Tastenrichtung frei, läuft die Figur (und gleitet auf Rutscheis weiter);
// sonst dreht sie sich nur dorthin (js/world/player.js, js/world/slide.js).
function restStates(map, spawn, occupied) {
  const key = s => `${s.x},${s.y},${s.dir}`;
  const seen = new Map([[key(spawn), spawn]]);
  const queue = [spawn];
  while (queue.length) {
    const s = queue.shift();
    for (const dir of DIRS) {
      let next = step(s, dir);
      let to;
      if (map.canEnter(next.x, next.y, occupied)) {
        while (map.isSlippery(next.x, next.y)) {
          const n = step(next, dir);
          if (!map.canEnter(n.x, n.y, occupied)) break;
          next = n;
        }
        to = { x: next.x, y: next.y, dir };
      } else {
        to = { x: s.x, y: s.y, dir };
      }
      if (!seen.has(key(to))) {
        seen.set(key(to), to);
        queue.push(to);
      }
    }
  }
  return [...seen.values()];
}

const faces = (states, x, y) => states.some(s => { const f = step(s, s.dir); return f.x === x && f.y === y; });

test('An jedem Ort kann man sich zu Stein, Geschichtsstein, Fundstück und Spielaufgabe drehen und sie mit A nehmen', () => {
  const state = newGameState({ name: 'A', species: 'nixi', nickname: null });
  for (const def of Object.values(MAPS)) {
    const map = createMap(def, { openGates: (def.gates ?? []).map(g => g.id) });
    const occupied = blockedCells(def, state);
    const states = restStates(map, { ...def.spawn }, occupied);
    const targets = [
      ...(def.secretStone ? [['Stein', def.secretStone]] : []),
      ...def.objects.filter(o => ['storystone', 'gear', 'gearhint', 'notestone', 'npc', 'boss', 'heal', 'task', 'board'].includes(o.type) || (o.type === 'deco' && o.lines)).map(o => [`${o.type} ${o.id}`, o]),
      ...QUESTS.flatMap(q => q.steps).filter(st => st.kind === 'pickup' && st.map === def.id).map(st => [st.id, st]),
    ];
    for (const [what, at] of targets) assert.ok(faces(states, at.x, at.y), `${def.id}: ${what} bei (${at.x}, ${at.y}) lässt sich nicht ansehen`);
  }
});

test('Ein aufgehobener Stein gibt sein Feld frei', () => {
  const state = newGameState({ name: 'A', species: 'nixi', nickname: null });
  const def = MAPS.eisgrotte;
  assert.deepEqual([...blockedCells(def, state)], [cellKey(def.secretStone.x, def.secretStone.y)]);
  state.secrets = { eisgrotte: { story: false, stone: true } };
  assert.deepEqual([...blockedCells(def, state)], []);
  assert.deepEqual([...blockedCells(MAPS.bucht, state)], []);
});
