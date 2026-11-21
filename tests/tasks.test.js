// Spielaufgaben (Lumara 1.2, Spec 6.6): je Gebiet eine kleine Aufgabe ohne Lernfrage. Regeln
// (js/world/tasks.js), Daten (js/data/tasks.js), Kartenobjekte und die Anbindung an die Welt
// (js/scenes/taskEvents.js). Wege mit Dialog brauchen das DOM; sie prüft der Controller im Browser.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { newGameState } from '../js/state.js';
import { MAPS } from '../js/world/network.js';
import { cellKey, createMap, reachable, step, trainerSees } from '../js/world/map.js';
import { HIDEOUTS } from '../js/data/hideouts.js';
import { hideoutAt } from '../js/world/hideouts.js';
import { AREA_TREASURES } from '../js/items/treasures.js';
import { PROPS } from '../js/gfx/art/tiles.js';
import { parseSprite } from '../js/gfx/sprites.js';
import { TASKS, facing } from '../js/data/tasks.js';
import { act, createRun, foundCount, orderLit, solveTask, stationNow, taskOn, taskSolved, turnState } from '../js/world/tasks.js';
import { createWorldScene } from '../js/scenes/world.js';
import { addTasks } from '../js/scenes/taskEvents.js';
import { DE } from '../js/i18n/de.js';
import { EN } from '../js/i18n/en.js';
import { FR } from '../js/i18n/fr.js';
import { ES } from '../js/i18n/es.js';
import { KARTEN_1_1 } from './fixtures/karten-1.1.js';
import { stubContext } from './helpers/fixtures.js';
import { PALETTE } from '../js/gfx/palette.js';

const s0 = () => newGameState({ name: 'A', species: 'nixi', nickname: null });
const NEAR = [[0, -1], [1, 0], [0, 1], [-1, 0]];
const closed = def => createMap(def);
const inExit = (def, x, y) => (def.exits ?? []).some(e => x >= e.x && x < e.x + e.w && y >= e.y && y < e.y + e.h);
const taskObjects = (def, area) => def.objects.filter(o => o.type === 'task' && o.task === area);
const chebyshev = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

// ---------- Regeln ----------

test('collect: jedes Küken zählt einmal, die Mutter löst erst, wenn alle da sind', () => {
  const task = { area: 1, map: 'x', type: 'collect', items: 3 };
  const run = createRun(task);
  assert.deepEqual(act(run, task, { role: 'giver' }), { result: 'nothing', left: 3 }); // zu früh: Tipp, nichts geht verloren
  assert.deepEqual(act(run, task, { role: 'item', index: 2 }), { result: 'progress', index: 2, left: 2 });
  assert.deepEqual(act(run, task, { role: 'item', index: 2 }), { result: 'nothing', index: 2 }); // schon gefunden
  assert.equal(foundCount(run), 1);
  assert.deepEqual(act(run, task, { role: 'item', index: 0 }), { result: 'progress', index: 0, left: 1 });
  assert.deepEqual(act(run, task, { role: 'giver' }), { result: 'nothing', left: 1 });
  assert.equal(foundCount(run), 2, 'die Mutter zu früh anzusprechen setzt nichts zurück');
  assert.deepEqual(act(run, task, { role: 'item', index: 1 }), { result: 'progress', index: 1, left: 0 });
  assert.deepEqual(act(run, task, { role: 'item', index: 7 }), { result: 'nothing' }); // kein solches Küken
  assert.deepEqual(act(run, task, { role: 'giver' }), { result: 'solved' });
  assert.deepEqual(act(run, task, { role: 'giver' }), { result: 'nothing' }); // nur einmal gelöst
});

test('order: richtige Reihenfolge leuchtet, ein falscher Baum setzt mit wrong zurück, dann gelöst', () => {
  const task = { area: 2, map: 'x', type: 'order', order: [2, 1, 3, 0] };
  const run = createRun(task);
  assert.deepEqual(act(run, task, { role: 'clue' }), { result: 'nothing' });
  assert.deepEqual(act(run, task, { role: 'switch', index: 2 }), { result: 'progress', index: 2, step: 1 });
  assert.deepEqual(act(run, task, { role: 'switch', index: 1 }), { result: 'progress', index: 1, step: 2 });
  assert.deepEqual(act(run, task, { role: 'switch', index: 2 }), { result: 'nothing', index: 2 }); // leuchtet schon
  assert.equal(orderLit(run, task, 2), true);
  assert.equal(orderLit(run, task, 3), false);
  assert.deepEqual(act(run, task, { role: 'switch', index: 0 }), { result: 'wrong', index: 0 }); // 0 kommt erst zuletzt
  assert.equal(orderLit(run, task, 2), false, 'alles von vorn');
  for (const [i, n] of [[2, 1], [1, 2], [3, 3]]) assert.deepEqual(act(run, task, { role: 'switch', index: i }), { result: 'progress', index: i, step: n });
  assert.deepEqual(act(run, task, { role: 'switch', index: 0 }), { result: 'solved', index: 0, step: 4 });
  assert.deepEqual(act(run, task, { role: 'switch', index: 3 }), { result: 'nothing' });
});

test('order: Ein falscher Baum, bevor etwas leuchtet, ist kein Fehler, nur nicht der erste', () => {
  const task = { area: 2, map: 'x', type: 'order', order: [2, 1, 3, 0] };
  const run = createRun(task);
  for (const i of [0, 1, 3]) assert.deepEqual(act(run, task, { role: 'switch', index: i }), { result: 'nothing', index: i, notFirst: true });
  assert.equal(run.step, 0);
  assert.deepEqual(act(run, task, { role: 'switch', index: 2 }), { result: 'progress', index: 2, step: 1 });
  assert.deepEqual(act(run, task, { role: 'switch', index: 0 }), { result: 'wrong', index: 0 }, 'danach ist ein falscher Baum ein Fehler');
});

test('order mit Platten: Felder zählen wie Schalter, andere Felder tun nichts', () => {
  const task = { area: 8, map: 'x', type: 'order', order: [1, 0], plates: [{ x: 2, y: 2 }, { x: 5, y: 2 }] };
  const run = createRun(task);
  assert.deepEqual(act(run, task, { x: 3, y: 3 }), { result: 'nothing' });
  assert.deepEqual(act(run, task, { x: 2, y: 2 }), { result: 'nothing', index: 0, notFirst: true });
  assert.deepEqual(act(run, task, { x: 5, y: 2 }), { result: 'progress', index: 1, step: 1 });
  assert.deepEqual(act(run, task, { x: 5, y: 2 }), { result: 'nothing', index: 1 });
  assert.deepEqual(act(run, task, { x: 2, y: 2 }), { result: 'solved', index: 0, step: 2 });
});

test('turn: A dreht eine Statue weiter (0 bis 3), weg vom Ziel gibt einen Tipp, alle am Ziel lösen', () => {
  const task = { area: 4, map: 'x', type: 'turn', start: [3, 0], goal: [1, 0] };
  const run = createRun(task);
  assert.deepEqual([turnState(run, 0), turnState(run, 1)], [3, 0]);
  assert.deepEqual(act(run, task, { role: 'switch', index: 1 }), { result: 'progress', index: 1, dir: 1, away: true }); // stand schon richtig
  assert.deepEqual(act(run, task, { role: 'switch', index: 0 }), { result: 'progress', index: 0, dir: 0, away: false });
  assert.deepEqual(act(run, task, { role: 'switch', index: 0 }), { result: 'progress', index: 0, dir: 1, away: false });
  for (const dir of [2, 3]) assert.deepEqual(act(run, task, { role: 'switch', index: 1 }), { result: 'progress', index: 1, dir, away: false });
  assert.deepEqual(act(run, task, { role: 'switch', index: 1 }), { result: 'solved', index: 1, dir: 0, away: false });
  assert.deepEqual(act(run, task, { role: 'switch', index: 0 }), { result: 'nothing' });
  assert.deepEqual(act(createRun(task), task, { role: 'switch', index: 5 }), { result: 'nothing' });
});

test('follow: nah heran geht das Irrlicht weiter, zu weit weg fliegt es zurück, nach der letzten Station gelöst', () => {
  const task = { area: 3, map: 'x', type: 'follow', near: 1, lose: 8, stations: [{ x: 5, y: 5 }, { x: 9, y: 5 }, { x: 9, y: 9 }] };
  const run = createRun(task);
  assert.deepEqual(stationNow(run, task), { x: 5, y: 5 });
  assert.deepEqual(act(run, task, { x: 20, y: 20 }), { result: 'nothing' }); // am Anfang wartet es
  assert.deepEqual(act(run, task, { x: 6, y: 6 }), { result: 'progress', index: 1 }); // schräg daneben zählt
  assert.deepEqual(stationNow(run, task), { x: 9, y: 5 });
  assert.deepEqual(act(run, task, { x: 7, y: 5 }), { result: 'nothing' });
  assert.deepEqual(act(run, task, { x: 18, y: 5 }), { result: 'wrong' }); // 9 Felder weg
  assert.deepEqual(stationNow(run, task), { x: 5, y: 5 });
  assert.deepEqual(act(run, task, { x: 5, y: 4 }), { result: 'progress', index: 1 });
  assert.deepEqual(act(run, task, { x: 9, y: 6 }), { result: 'progress', index: 2 });
  assert.deepEqual(act(run, task, { x: 8, y: 9 }), { result: 'solved', index: 2 });
  assert.equal(stationNow(run, task), null);
  assert.deepEqual(act(run, task, { x: 9, y: 9 }), { result: 'nothing' });
});

test('solveTask: seltener Schatz und Leckerli, nur einmal', () => {
  const s = s0();
  for (const area of [1, 2, 3, 4]) {
    const before = s.bag.treat ?? 0;
    assert.equal(taskSolved(s, area), false);
    const rare = AREA_TREASURES[area].rare;
    assert.deepEqual(solveTask(s, area), { treasure: rare, treat: true });
    assert.equal(s.treasures[rare], 1);
    assert.ok(s.album.includes(rare));
    assert.equal(s.bag.treat, before + 1);
    assert.equal(taskSolved(s, area), true);
    assert.equal(solveTask(s, area), null);
    assert.equal(s.treasures[rare], 1);
    assert.equal(s.bag.treat, before + 1);
  }
  assert.deepEqual(s.tasks, [1, 2, 3, 4]);
  const t = s0();
  t.tasks = [3];
  solveTask(t, 1);
  assert.deepEqual(t.tasks, [1, 3], 'sortiert wie migrate es repariert');
  assert.equal(solveTask(t, 9), null);
});

// ---------- Daten und Karten ----------

test('Aufgaben 1 bis 4: Art, Karte und Gebiet; je Karte höchstens eine Aufgabe', () => {
  assert.deepEqual([1, 2, 3, 4].map(a => [TASKS[a].area, TASKS[a].map, TASKS[a].type]), [
    [1, 'bucht', 'collect'],
    [2, 'wald', 'order'],
    [3, 'moor', 'follow'],
    [4, 'duenen', 'turn'],
  ]);
  for (const task of Object.values(TASKS)) {
    assert.equal(MAPS[task.map].area, task.area, task.map);
    assert.equal(taskOn(task.map), task);
  }
  assert.equal(new Set(Object.values(TASKS).map(t => t.map)).size, Object.keys(TASKS).length);
  assert.equal(taskOn('garten'), null);
  assert.equal(taskOn('hoehle1'), null);
});

test('Aufgaben 1 bis 4: jedes Objekt erreichbar, auf einem Feld, das in 1.1 nicht begehbar war; Platten begehbar', () => {
  for (const area of [1, 2, 3, 4]) {
    const task = TASKS[area];
    const def = MAPS[task.map];
    const map = closed(def);
    const open = createMap(def, { openGates: (def.gates ?? []).map(g => g.id) });
    const seen = reachable(map, def.spawn);
    const trainers = def.objects.filter(o => o.type === 'trainer');
    const objs = taskObjects(def, area);
    assert.ok(objs.length >= 1, `${def.id}: Objekte`); // beim Folgen nur der Wurzelstock, die Stationen sind Felder
    assert.equal(def.objects.filter(o => o.type === 'task').length, objs.length, `${def.id}: nur Objekte dieser Aufgabe`);
    for (const o of objs) {
      const where = `${o.id} bei ${o.x},${o.y}`;
      assert.equal(o.id, `task${area}-${o.role}${o.index ?? ''}`, where);
      assert.ok(PROPS[o.prop], `${where}: Bild ${o.prop}`);
      assert.ok(!KARTEN_1_1[def.id].includes(cellKey(o.x, o.y)), `${where}: in 1.1 begehbar`);
      for (const m of [map, open]) {
        assert.equal(m.canEnter(o.x, o.y), false, where);
        assert.equal(m.objectAt(o.x, o.y), o, `${where}: teilt sein Feld`);
      }
      assert.equal(hideoutAt(def.id, o.x, o.y), null, `${where}: Versteck`);
      assert.ok(!(def.finds ?? []).some(f => f.x === o.x && f.y === o.y), `${where}: Fundstelle`);
      assert.ok(!inExit(def, o.x, o.y), `${where}: Ausgang`);
      const fronts = NEAR.map(([dx, dy]) => ({ x: o.x + dx, y: o.y + dy })).filter(p => seen.has(cellKey(p.x, p.y)) && !inExit(def, p.x, p.y));
      assert.ok(fronts.length > 0, `${where}: kein Vorfeld`);
      assert.ok(fronts.some(p => trainers.every(tr => trainerSees(map, tr, p) === null)), `${where}: jedes Vorfeld im Blick eines Trainers`);
    }
    // Kein Versteck verliert sein Vorfeld (sie liegen auf Feldern, auf denen man steht).
    for (const h of HIDEOUTS.filter(x => x.map === def.id)) {
      assert.ok(NEAR.some(([dx, dy]) => seen.has(cellKey(h.x + dx, h.y + dy))), h.id);
    }
    for (const p of task.plates ?? []) {
      assert.ok(open.canEnter(p.x, p.y) && KARTEN_1_1[def.id].includes(cellKey(p.x, p.y)), `${def.id}: Platte ${p.x},${p.y}`);
    }
  }
});

test('Aufgaben 1 bis 4: Daten und Kartenobjekte passen zusammen', () => {
  const roles = area => taskObjects(MAPS[TASKS[area].map], area);
  const indexes = (list, role) => list.filter(o => o.role === role).map(o => o.index).sort((a, b) => a - b);
  const count = n => Array.from({ length: n }, (_, i) => i);

  // Bucht: drei Küken und die Möwenmutter
  const t1 = TASKS[1], o1 = roles(1);
  assert.equal(t1.items, 3);
  assert.deepEqual(indexes(o1, 'item'), count(3));
  assert.equal(o1.filter(o => o.role === 'giver').length, 1);
  assert.equal(o1.length, 4);

  // Wald: vier Zeichenbäume und ein Zettelstein
  const t2 = TASKS[2], o2 = roles(2);
  assert.deepEqual([...t2.order].sort(), count(4));
  assert.notDeepEqual(t2.order, count(4), 'nicht einfach der Reihe nach');
  assert.deepEqual(indexes(o2, 'switch'), count(4));
  assert.equal(o2.filter(o => o.role === 'clue').length, 1);
  assert.equal(o2.length, 5);

  // Moor: fünf Stationen, am Ende der Wurzelstock
  const t3 = TASKS[3], o3 = roles(3), moor = closed(MAPS.moor), seen = reachable(moor, MAPS.moor.spawn);
  assert.equal(t3.stations.length, 5);
  assert.equal(t3.near, 1);
  const rest = o3.find(o => o.role === 'rest');
  assert.ok(rest);
  assert.equal(o3.length, 1);
  assert.deepEqual(t3.stations.at(-1), { x: rest.x, y: rest.y });
  for (const [i, st] of t3.stations.entries()) {
    assert.ok(moor.inBounds(st.x, st.y), `Station ${i}`);
    // Man kommt heran, ohne in hohes Gras zu müssen (kein wildes Duell mitten in der Aufgabe).
    const spots = [...seen].map(k => k.split(',').map(Number)).filter(([x, y]) => chebyshev({ x, y }, st) <= t3.near && !moor.isTallGrass(x, y));
    assert.ok(spots.length > 0, `Station ${i} ist nicht erreichbar`);
    if (i === 0) continue;
    const d = chebyshev(t3.stations[i - 1], st);
    assert.ok(d > t3.near + 1, `Station ${i} liegt zu nah an der vorigen`);
    assert.ok(d + t3.near < t3.lose, `Station ${i}: Das Irrlicht flöge gleich wieder zurück`);
  }

  // Dünen: drei Statuen; das Ziel ergibt sich aus ihrer Lage zum Leuchtstein
  const t4 = TASKS[4], o4 = roles(4);
  const beacon = MAPS.duenen.objects.find(o => o.type === 'beacon' && o.number === 4);
  const statues = o4.filter(o => o.role === 'switch').sort((a, b) => a.index - b.index);
  assert.equal(statues.length, 3);
  assert.equal(o4.length, 3);
  assert.deepEqual(statues.map(s => s.index), count(3));
  assert.deepEqual(t4.goal, statues.map(s => facing(s, beacon)));
  for (const s of statues) assert.notEqual(Math.abs(beacon.x - s.x), Math.abs(beacon.y - s.y), `${s.id}: schräg, Blickrichtung unklar`);
  assert.equal(t4.start.length, 3);
  t4.start.forEach((d, i) => {
    assert.notEqual(d, t4.goal[i], `Statue ${i} schaut schon zum Leuchtstein`);
    assert.equal(statues[i].prop, `glassstatue${d}`, 'Bild ohne Szene: die Anfangsstellung');
  });
  assert.deepEqual([facing({ x: 0, y: 5 }, { x: 0, y: 0 }), facing({ x: 0, y: 0 }, { x: 4, y: 1 }), facing({ x: 0, y: 0 }, { x: 1, y: 3 }), facing({ x: 5, y: 0 }, { x: 0, y: 2 })], [0, 1, 2, 3]);
});

test('Bilder der Aufgaben: 16 Pixel breit, bekannte Farben, mit allen Zuständen', () => {
  const ids = [
    'chickcrate', 'chickcrateDone', 'chickbush', 'chickbushDone', 'chickboat', 'chickboatDone',
    ...[0, 1, 2, 3].map(n => `gullnest${n}`),
    ...[0, 1, 2, 3].flatMap(i => [`runetree${i}`, `runetree${i}Lit`, `runetree${i}Open`]),
    'runestone', 'wispstump',
    ...[0, 1, 2, 3].map(d => `glassstatue${d}`),
  ];
  for (const id of ids) {
    const s = parseSprite(id, PROPS[id]); // wirft bei unbekannten Farben
    assert.equal(s.w, 16, id);
    assert.ok([16, 32].includes(s.h), id);
  }
  assert.equal(new Set([0, 1, 2, 3].map(d => PROPS[`glassstatue${d}`].join('|'))).size, 4, 'jede Blickrichtung sieht anders aus');
  assert.equal(new Set([0, 1, 2, 3].map(i => PROPS[`runetree${i}`].join('|'))).size, 4, 'jedes Zeichen sieht anders aus');
  assert.notDeepEqual(PROPS.chickcrate, PROPS.chickcrateDone);
  assert.notDeepEqual(PROPS.gullnest0, PROPS.gullnest3);
});

// Welche Texte eine Aufgabe je Art braucht (wie js/scenes/taskEvents.js sie liest).
const count = n => Array.from({ length: n }, (_, i) => i);
const NEEDS = {
  collect: task => ['speaker', 'hurry', 'gone', ...count(task.items).flatMap(i => [`item.${i}`, `left.${i}`])],
  order: task => ['clue', 'progress', 'again', 'start', ...count(task.order.length).flatMap(i => [`symbol.${i}`, `part.${i}`])],
  turn: () => ['turned'],
  follow: () => ['station', 'again', 'rest', 'back'],
};

test('Texte der Aufgaben: in allen vier Sprachen, kurz genug für eine Sprechblase', () => {
  const keys = Object.keys(DE).filter(k => k.startsWith('task.'));
  for (const area of [1, 2, 3, 4]) {
    for (const part of ['intro', 'tip', 'solved', 'done', ...NEEDS[TASKS[area].type](TASKS[area])]) assert.ok(keys.includes(`task.${area}.${part}`), `task.${area}.${part}`);
  }
  for (const [lang, table] of Object.entries({ de: DE, en: EN, fr: FR, es: ES })) {
    for (const k of keys) {
      assert.ok(k in table, `${lang}: ${k}`);
      for (const line of [table[k]].flat()) assert.ok(line.trim() && line.length <= 110, `${lang}: ${k}: ${line.length} Zeichen`);
    }
  }
  assert.equal(DE['task.3.station'].length, TASKS[3].stations.length - 2, 'ein Satz je Station zwischen Anfang und Ende');
});

// ---------- In der Welt ----------

function world(mapId, state = s0()) {
  const def = MAPS[mapId];
  state.position = { map: mapId, ...def.spawn };
  const game = { state, reducedMotion: true, mode: 'walk', save: () => {}, input: { dir: () => null, pressed: () => false } };
  const w = createWorldScene(game, def, {});
  addTasks(w, game);
  return { w, def, state };
}
const variant = (w, def, id) => w.propVariant.task(def.objects.find(o => o.id === id));

test('In der Welt: Bilder nach Stand, gelöst der Endzustand', () => {
  let { w, def } = world('bucht');
  assert.equal(variant(w, def, 'task1-giver'), 'gullnest0');
  assert.equal(variant(w, def, 'task1-item0'), 'chickcrate');
  const done = s0();
  done.tasks = [1, 2, 3, 4];
  ({ w, def } = world('bucht', done));
  assert.equal(variant(w, def, 'task1-giver'), 'gullnest3', 'Küken im Nest');
  assert.equal(variant(w, def, 'task1-item1'), 'chickbushDone');

  ({ w, def } = world('wald'));
  assert.equal(variant(w, def, 'task2-switch1'), 'runetree1');
  assert.equal(variant(w, def, 'task2-clue'), 'runestone');
  ({ w, def } = world('wald', done));
  const last = TASKS[2].order.at(-1), first = TASKS[2].order[0];
  assert.equal(variant(w, def, `task2-switch${last}`), `runetree${last}Open`, 'Astloch offen');
  assert.equal(variant(w, def, `task2-switch${first}`), `runetree${first}Lit`);

  ({ w, def } = world('duenen'));
  assert.equal(variant(w, def, 'task4-switch0'), `glassstatue${TASKS[4].start[0]}`);
  ({ w, def } = world('duenen', done));
  assert.equal(variant(w, def, 'task4-switch1'), `glassstatue${TASKS[4].goal[1]}`, 'schaut zum Leuchtstein');

  ({ w, def } = world('moor'));
  assert.equal(variant(w, def, 'task3-rest'), 'wispstump');
  for (const mapId of ['bucht', 'wald', 'moor', 'duenen']) {
    const r = world(mapId);
    for (const o of r.def.objects.filter(x => x.type === 'task')) assert.ok(PROPS[r.w.propVariant.task(o)], `${o.id}: ${r.w.propVariant.task(o)}`);
  }
});

test('In der Welt: Ohne Aufgabe auf der Karte kommt kein Handler dazu; A auf ein fremdes Objekt geht weiter', async () => {
  const { w } = world('garten');
  assert.equal(w.propVariant.task?.({ prop: 'chickcrate' }), 'chickcrate'); // Grundbild aus world.js
  const r = world('bucht');
  const handler = r.w.onInteract[0];
  assert.equal(await handler({ target: { type: 'npc' }, x: 0, y: 0 }), false);
  assert.equal(await handler({ target: null, x: 0, y: 0 }), false);
});

test('In der Welt: Das Irrlicht wartet an der ersten Station; nah heran beginnt die Aufgabe', () => {
  const { w } = world('moor');
  const stepped = w.onStepped.at(-1);
  const [first] = TASKS[3].stations;
  assert.equal(stepped(first.x + 4, first.y), null);
  assert.equal(typeof stepped(first.x, first.y - 1), 'function', 'Einleitung unter Sperre');
  const done = s0();
  done.tasks = [3];
  const solved = world('moor', done);
  assert.equal(solved.w.onStepped.length, 0, 'gelöst: kein Folgen mehr');
});

test('In der Welt: Wer das Irrlicht verliert, bevor er ihm gefolgt ist, bekommt keinen Fehler; danach einen Tipp', () => {
  const { w } = world('moor');
  const stepped = w.onStepped.at(-1);
  const [s0, s1] = TASKS[3].stations;
  const far = { x: s1.x + TASKS[3].lose + 1, y: s1.y };
  assert.equal(typeof stepped(s0.x + 1, s0.y), 'function', 'Einleitung');
  assert.equal(stepped(far.x, far.y), null, 'nur angefangen, dann weggegangen: leise zurück');
  assert.equal(stepped(s0.x - 1, s0.y), null, 'noch einmal: leise weiter');
  assert.equal(stepped(s1.x, s1.y + 1), null, 'einer Station gefolgt');
  const s2 = TASKS[3].stations[2];
  assert.equal(typeof stepped(s2.x + TASKS[3].lose + 1, s2.y), 'function', 'jetzt Fehlerton und Tipp');
});

test('Moor: Wer nur vom Eingang zum Steg geht, kommt dem wartenden Irrlicht nicht nahe', () => {
  const def = MAPS.moor, map = closed(def);
  const [s0] = TASKS[3].stations;
  // Alle Felder auf einem kürzesten Weg vom Eingang zu einem der beiden Stegfelder am Südufer.
  const dist = from => {
    const d = new Map([[cellKey(from.x, from.y), 0]]);
    const queue = [from];
    while (queue.length) {
      const c = queue.shift();
      for (const [dx, dy] of NEAR) {
        const n = { x: c.x + dx, y: c.y + dy };
        if (!map.canEnter(n.x, n.y) || d.has(cellKey(n.x, n.y))) continue;
        d.set(cellKey(n.x, n.y), d.get(cellKey(c.x, c.y)) + 1);
        queue.push(n);
      }
    }
    return d;
  };
  const fromSpawn = dist(def.spawn);
  const piers = [];
  for (let x = 0; x < map.width; x++) if (map.tileAt(x, 15) === 'pier') piers.push({ x, y: 15 });
  assert.equal(piers.length, 2);
  for (const pier of piers) {
    const toPier = dist(pier), total = fromSpawn.get(cellKey(pier.x, pier.y));
    for (const [k, d] of fromSpawn) {
      if (d + toPier.get(k) !== total) continue;
      const [x, y] = k.split(',').map(Number);
      assert.ok(chebyshev({ x, y }, s0) > TASKS[3].near + 2, `${k} auf dem Weg zum Steg startet das Irrlicht`);
    }
  }
});

test('In der Welt: Das Irrlicht leuchtet nur in Farben der Palette; bei „Bewegung reduzieren“ steht es still', () => {
  const { w } = world('moor');
  const draw = () => {
    const ctx = stubContext();
    for (const fn of w.afterRender) fn(ctx, w.camera());
    return ctx.calls;
  };
  const first = draw();
  const colors = first.filter(c => c[0] === 'set' && c[1] === 'fillStyle').map(c => c[2]);
  assert.ok(colors.length > 0, 'am Eingang zu sehen');
  const hexes = new Set(PALETTE.map(p => p.hex));
  for (const c of colors) assert.ok(hexes.has(c), c);
  for (let i = 0; i < 40; i++) w.update(16);
  assert.deepEqual(draw(), first, 'kein Schweben');
});

test('createGameWorld: addTasks kommt vor Garten und Begleiter', () => {
  const src = readFileSync(new URL('../js/scenes/worldEvents.js', import.meta.url), 'utf8');
  const body = src.slice(src.indexOf('export function createGameWorld'));
  const at = s => body.indexOf(s);
  assert.ok(at('addTasks(world, game);') > 0);
  assert.ok(at('addTasks(world, game);') > at('addHideouts(world, game'));
  assert.ok(at('addTasks(world, game);') < at('addGarden(world, game)'));
  assert.ok(at('addTasks(world, game);') < at('addCompanion(world, game);'));
});

test('Keine Station des Irrlichts liegt im Blick der Hüterin des Moors', () => {
  const tr = MAPS.moor.objects.find(o => o.type === 'trainer');
  for (const st of TASKS[3].stations) {
    let p = { x: tr.x, y: tr.y };
    for (let i = 0; i < tr.sight; i++) {
      p = step(p, tr.dir);
      assert.ok(chebyshev(p, st) > TASKS[3].near, `Station ${st.x},${st.y} im Blick`);
    }
  }
});
