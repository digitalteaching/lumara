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
import { AREA_TREASURES, treasureName } from '../js/items/treasures.js';
import { PROPS } from '../js/gfx/art/tiles.js';
import { parseSprite } from '../js/gfx/sprites.js';
import { TASKS, facing } from '../js/data/tasks.js';
import { act, createRun, foundCount, orderLit, solveTask, stationNow, taskOn, taskSolved, turnState } from '../js/world/tasks.js';
import { createWorldScene } from '../js/scenes/world.js';
import { addTasks } from '../js/scenes/taskEvents.js';
import { t } from '../js/i18n/i18n.js';
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

// Jedes Teil liegt auf einem Feld, auf dem man in 1.1 nicht stehen konnte, hat ein Vorfeld außerhalb
// des Blicks der Trainer und nimmt keinem Versteck, keiner Fundstelle und keinem Ausgang den Platz.
// Platten sind Felder, auf denen man schon in 1.1 stand.
function checkPlacement(areas) {
  for (const area of areas) {
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
}

test('Aufgaben 1 bis 4: jedes Objekt erreichbar, auf einem Feld, das in 1.1 nicht begehbar war; Platten begehbar', () => {
  checkPlacement([1, 2, 3, 4]);
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

// Alle Felder auf einem kürzesten Weg zwischen Eingang, Aufwachpunkt vor dem Leuchtstein und den
// Ausgängen (alle Tore offen): Dort laufen Kinder, die nur durch das Gebiet wollen.
function corridor(def) {
  const map = createMap(def, { openGates: (def.gates ?? []).map(g => g.id) });
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
  const points = [def.spawn, def.respawn, ...(def.exits ?? []).map(e => ({ x: e.x + Math.floor(e.w / 2), y: e.y + Math.floor(e.h / 2) }))];
  const cells = new Set();
  for (const [i, a] of points.entries()) {
    for (const b of points.slice(i + 1)) {
      const da = dist(a), db = dist(b), total = da.get(cellKey(b.x, b.y));
      assert.ok(total != null, `${def.id}: ${a.x},${a.y} → ${b.x},${b.y}`);
      for (const [k, d] of da) if (db.get(k) === total - d) cells.add(k);
    }
  }
  return [...cells].map(k => k.split(',').map(Number)).map(([x, y]) => ({ x, y }));
}

test('Aufgaben 5 bis 8: Art, Karte und Gebiet', () => {
  assert.deepEqual([5, 6, 7, 8].map(a => [TASKS[a].area, TASKS[a].map, TASKS[a].type]), [
    [5, 'klippen', 'turn'],
    [6, 'ruinen', 'order'],
    [7, 'see', 'follow'],
    [8, 'wiese', 'order'],
  ]);
  assert.deepEqual(Object.keys(TASKS).map(Number), [1, 2, 3, 4, 5, 6, 7, 8], 'je Gebiet eine Aufgabe');
  for (const area of [5, 6, 7, 8]) assert.equal(taskOn(TASKS[area].map), TASKS[area]);
});

test('Aufgaben 5 bis 8: jedes Objekt erreichbar, auf einem Feld, das in 1.1 nicht begehbar war; Platten begehbar', () => {
  checkPlacement([5, 6, 7, 8]);
});

test('Aufgaben 5 bis 8: Daten und Kartenobjekte passen zusammen', () => {
  const roles = area => taskObjects(MAPS[TASKS[area].map], area);
  const of = (list, role) => list.filter(o => o.role === role).sort((a, b) => a.index - b.index);

  // Klippen: drei Windräder, zwei Wimpel an Stangen, ein Drachen. Alle Wimpel zeigen die eine
  // Windrichtung; ein Windrad steht richtig, wenn sein Wimpel genauso weht.
  const t5 = TASKS[5], o5 = roles(5);
  const mills = of(o5, 'switch');
  assert.deepEqual(mills.map(m => m.index), count(3));
  assert.deepEqual(t5.goal, [t5.wind, t5.wind, t5.wind]);
  assert.ok([0, 1, 2, 3].includes(t5.wind));
  assert.equal(t5.start.length, 3);
  t5.start.forEach((d, i) => {
    assert.notEqual(d, t5.goal[i], `Windrad ${i} steht schon im Wind`);
    assert.equal(mills[i].prop, `windwheel${d}`, 'Bild ohne Szene: die Anfangsstellung');
  });
  assert.equal(new Set(t5.start).size, 3, 'jedes Windrad braucht anders viele Drehungen');
  const pennants = o5.filter(o => o.role === 'clue');
  assert.ok(pennants.length >= 1);
  for (const p of pennants) assert.equal(p.prop, `pennant${t5.wind}`, `${p.id} zeigt die Windrichtung`);
  const kite = o5.filter(o => o.role === 'prize');
  assert.equal(kite.length, 1);
  assert.equal(kite[0].prop, 'kite');
  assert.equal(o5.length, mills.length + pennants.length + 1);
  for (const o of o5) assert.ok(chebyshev(o, mills[1]) <= 8, `${o.id}: alles auf einer Plattform`);
  // Die Windräder zum Anschauen bleiben, wie sie waren.
  const decoMills = MAPS.klippen.objects.filter(o => o.type === 'deco' && o.prop === 'windmill');
  assert.deepEqual(decoMills.map(o => [o.id, o.x, o.y, o.anim]), [
    ['windrad-west', 2, 12, true], ['windrad-nord', 13, 4, true], ['windrad-gipfel', 36, 10, true], ['windrad-sued', 23, 24, true],
  ]);

  // Ruinen: drei Hebel, eine Wandzeichnung; danach läuft ein Kanalstück leer (nur ein Bild).
  const t6 = TASKS[6], o6 = roles(6), ruinen = closed(MAPS.ruinen);
  const levers = of(o6, 'switch');
  assert.deepEqual(levers.map(l => l.index), count(3));
  assert.deepEqual([...t6.order].sort(), count(3));
  assert.notDeepEqual(t6.order, count(3), 'nicht einfach der Reihe nach');
  for (const l of levers) assert.equal(l.prop, `lever${l.index}`);
  const sketch = o6.filter(o => o.role === 'clue');
  assert.equal(sketch.length, 1);
  assert.equal(o6.length, 4);
  const { chamber } = t6;
  const chamberCells = [];
  for (let y = chamber.y; y < chamber.y + chamber.h; y++) for (let x = chamber.x; x < chamber.x + chamber.w; x++) chamberCells.push({ x, y });
  for (const c of chamberCells) {
    assert.equal(ruinen.tileAt(c.x, c.y), 'canal', `Kammer ${c.x},${c.y}: Die Kacheln bleiben Kanal`);
    assert.equal(ruinen.objectAt(c.x, c.y), null);
    assert.equal(hideoutAt('ruinen', c.x, c.y), null);
  }
  for (const l of levers) assert.ok(chamberCells.some(c => chebyshev(c, l) <= 3), `${l.id}: nah an der Kammer`);
  assert.ok(levers.every(l => chebyshev(l, sketch[0]) <= 5), 'Zeichnung und Hebel nah beieinander');

  // See: Pfotenspuren über den Schnee, am Ende die Hasenfamilie.
  const t7 = TASKS[7], o7 = roles(7), see = closed(MAPS.see), seen7 = reachable(see, MAPS.see.spawn);
  assert.equal(t7.guide, 'paws');
  assert.equal(t7.near, 1);
  assert.equal(t7.stations.length, 5);
  const giver = o7.find(o => o.role === 'giver');
  assert.ok(giver);
  assert.equal(giver.prop, 'rabbits');
  assert.equal(o7.length, 1);
  assert.deepEqual(t7.stations.at(-1), { x: giver.x, y: giver.y });
  for (const [i, st] of t7.stations.entries()) {
    if (i < t7.stations.length - 1) assert.equal(see.tileAt(st.x, st.y), 'snow', `Station ${i}: Spuren im Schnee`);
    const spots = [...seen7].map(k => k.split(',').map(Number)).filter(([x, y]) => chebyshev({ x, y }, st) <= t7.near && !see.isTallGrass(x, y));
    assert.ok(spots.length > 0, `Station ${i} ist nicht erreichbar`);
    if (i === 0) continue;
    const d = chebyshev(t7.stations[i - 1], st);
    assert.ok(d > t7.near + 1, `Station ${i} liegt zu nah an der vorigen`);
    assert.ok(d + t7.near < t7.lose, `Station ${i}: Die Spur verwehte gleich wieder`);
  }
  const tr7 = MAPS.see.objects.find(o => o.type === 'trainer');
  for (const st of t7.stations) {
    let p = { x: tr7.x, y: tr7.y };
    for (let i = 0; i < tr7.sight; i++) {
      p = step(p, tr7.dir);
      assert.ok(chebyshev(p, st) > t7.near, `Station ${st.x},${st.y} im Blick der Trainerin`);
    }
  }

  // Sternenwiese: vier flache Steine mit Zeichen, eine Tafel mit dem Sternbild.
  const t8 = TASKS[8], o8 = roles(8), wiese = closed(MAPS.wiese);
  assert.equal(t8.plates.length, 4);
  assert.deepEqual([...t8.order].sort(), count(4));
  assert.notDeepEqual(t8.order, count(4));
  const tablet = o8.filter(o => o.role === 'clue');
  assert.equal(tablet.length, 1);
  assert.equal(tablet[0].prop, 'startablet');
  assert.equal(o8.length, 1, 'die Steine sind Felder, keine Objekte');
  for (const [i, p] of t8.plates.entries()) {
    assert.equal(wiese.isTallGrass(p.x, p.y), false, `Stein ${i} im hohen Gras`);
    assert.equal(wiese.objectAt(p.x, p.y), null);
    assert.ok(!(MAPS.wiese.finds ?? []).some(f => f.x === p.x && f.y === p.y), `Stein ${i}: Fundstelle`);
    assert.ok(!(MAPS.wiese.starSpots ?? []).some(f => f.x === p.x && f.y === p.y), `Stein ${i}: Sternschnuppe`);
    assert.ok(!inExit(MAPS.wiese, p.x, p.y));
    for (const q of t8.plates.slice(i + 1)) assert.ok(chebyshev(p, q) >= 2, 'zwischen zwei Steinen ist Platz');
  }
  // Tafel und Steine passen zusammen auf den Bildschirm (15 × 10 Felder).
  const all = [...t8.plates, tablet[0]];
  const span = key => Math.max(...all.map(p => p[key])) - Math.min(...all.map(p => p[key]));
  assert.ok(span('x') < 15 && span('y') < 10, 'Tafel und Steine auf einem Bildschirm');
  // Von einem Stein zum nächsten kommt man, ohne auf einen anderen oder ins hohe Gras zu treten.
  const route = (from, to) => {
    const others = new Set(t8.plates.filter(p => p !== to && p !== from).map(p => cellKey(p.x, p.y)));
    const seen = new Set([cellKey(from.x, from.y)]);
    const queue = [from];
    while (queue.length) {
      const c = queue.shift();
      if (c.x === to.x && c.y === to.y) return true;
      for (const [dx, dy] of NEAR) {
        const n = { x: c.x + dx, y: c.y + dy }, k = cellKey(n.x, n.y);
        if (seen.has(k) || others.has(k) || !wiese.canEnter(n.x, n.y) || wiese.isTallGrass(n.x, n.y)) continue;
        seen.add(k);
        queue.push(n);
      }
    }
    return false;
  };
  t8.order.slice(1).forEach((p, i) => assert.ok(route(t8.plates[t8.order[i]], t8.plates[p]), `Weg zu Stein ${p}`));
});

test('See und Sternenwiese: Wer nur zwischen Eingang, Leuchtstein und Ausgängen läuft, startet nichts', () => {
  const [first] = TASKS[7].stations;
  for (const c of corridor(MAPS.see)) assert.ok(chebyshev(c, first) > TASKS[7].near + 2, `${c.x},${c.y} weckt die Spur`);
  const wiesePath = corridor(MAPS.wiese);
  for (const p of TASKS[8].plates) assert.ok(wiesePath.every(c => chebyshev(c, p) >= 2), `Stein ${p.x},${p.y} liegt am Weg`);
});

test('Bilder der Aufgaben 5 bis 8: 16 Pixel breit, bekannte Farben, mit allen Zuständen', () => {
  const ids = [
    ...[0, 1, 2, 3].flatMap(d => [`windwheel${d}`, `windwheel${d}Spin`, `pennant${d}`]), 'kite', 'kiteDone',
    ...[0, 1, 2].flatMap(i => [`lever${i}`, `lever${i}Lit`, `lever${i}Open`]), 'wallsketch',
    'rabbits', 'rabbitsDone',
    'startablet', ...[0, 1, 2, 3].flatMap(i => [`starplate${i}`, `starplate${i}Lit`]),
  ];
  for (const id of ids) {
    assert.ok(PROPS[id], id);
    const s = parseSprite(id, PROPS[id]); // wirft bei unbekannten Farben
    assert.equal(s.w, 16, id);
    assert.ok([16, 32].includes(s.h), id);
  }
  const differ = (list, what) => assert.equal(new Set(list.map(id => PROPS[id].join('|'))).size, list.length, what);
  differ([0, 1, 2, 3].map(d => `windwheel${d}`), 'jede Stellung des Windrads sieht anders aus');
  differ([0, 1, 2, 3].map(d => `pennant${d}`), 'jede Richtung des Wimpels sieht anders aus');
  for (const d of [0, 1, 2, 3]) assert.notDeepEqual(PROPS[`windwheel${d}`], PROPS[`windwheel${d}Spin`], 'es dreht sich');
  differ([0, 1, 2].map(i => `lever${i}`), 'jeder Hebel hat seine Farbe');
  for (const i of [0, 1, 2]) assert.notDeepEqual(PROPS[`lever${i}`], PROPS[`lever${i}Lit`], 'gezogen sieht anders aus');
  differ([0, 1, 2, 3].map(i => `starplate${i}`), 'jeder Stein hat sein Zeichen');
  for (const i of [0, 1, 2, 3]) assert.notDeepEqual(PROPS[`starplate${i}`], PROPS[`starplate${i}Lit`], 'leuchtet');
  assert.notDeepEqual(PROPS.kite, PROPS.kiteDone);
  assert.notDeepEqual(PROPS.rabbits, PROPS.rabbitsDone);
  // Die Windräder der Aufgabe sehen anders aus als die zum Anschauen.
  assert.notDeepEqual(PROPS.windwheel0, PROPS.windmill0);
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
const roleSet = task => new Set(taskObjects(MAPS[task.map], task.area).map(o => o.role));
const NEEDS = {
  collect: task => ['speaker', 'hurry', 'gone', ...count(task.items).flatMap(i => [`item.${i}`, `left.${i}`])],
  // Über eine helle Platte läuft man einfach weiter: Dafür gibt es keinen Satz (again).
  order: task => ['clue', 'progress', 'start', ...(task.plates ? [] : ['again']), ...count(task.order.length).flatMap(i => [`symbol.${i}`, `part.${i}`])],
  // set: ein Teil steht jetzt richtig; clue und prize nur, wenn es solche Teile gibt (Wimpel, Drachen).
  turn: task => ['turned', 'set', ...['clue', 'prize'].filter(r => roleSet(task).has(r))],
  follow: () => ['station', 'again', 'rest', 'back'],
};

test('Texte der Aufgaben: in allen vier Sprachen, kurz genug für eine Sprechblase', () => {
  const keys = Object.keys(DE).filter(k => k.startsWith('task.'));
  for (const area of [1, 2, 3, 4, 5, 6, 7, 8]) {
    for (const part of ['intro', 'tip', 'solved', 'done', ...NEEDS[TASKS[area].type](TASKS[area])]) assert.ok(keys.includes(`task.${area}.${part}`), `task.${area}.${part}`);
  }
  for (const [lang, table] of Object.entries({ de: DE, en: EN, fr: FR, es: ES })) {
    for (const k of keys) {
      assert.ok(k in table, `${lang}: ${k}`);
      for (const line of [table[k]].flat()) assert.ok(line.trim() && line.length <= 110, `${lang}: ${k}: ${line.length} Zeichen`);
    }
  }
  for (const task of Object.values(TASKS).filter(x => x.type === 'follow')) {
    assert.equal(DE[`task.${task.area}.station`].length, task.stations.length - 2, `${task.area}: ein Satz je Station zwischen Anfang und Ende`);
  }
  // Wimpel und Windrad nennen die Richtung mit denselben Wörtern wie die Statuen.
  assert.ok(DE['task.5.clue'].includes('{dir}') && DE['task.5.turned'].includes('{dir}'));
});

// ---------- In der Welt ----------

// Eine Weltszene mit Aufgabe. Sätze (say) und leises Flüstern schreibt sie mit, statt sie zu zeigen.
function world(mapId, state = s0(), { reducedMotion = true } = {}) {
  const def = MAPS[mapId];
  state.position = { map: mapId, ...def.spawn };
  const game = { state, reducedMotion, mode: 'walk', save: () => {}, input: { dir: () => null, pressed: () => false } };
  const w = createWorldScene(game, def, {});
  const said = [];
  const hushed = [];
  const io = { say: async (g, lines) => { said.push(...lines); }, whisper: text => hushed.push(text) };
  const run = addTasks(w, game, io);
  return { w, def, state, game, run, said, hushed };
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

// ---------- Gebiete 5 bis 8 in der Welt ----------

const solvedAll = () => Object.assign(s0(), { tasks: [1, 2, 3, 4, 5, 6, 7, 8] });
const partOf = (def, id) => def.objects.find(o => o.id === id);

test('In der Welt 5 bis 8: Bilder nach Stand, gelöst der Endzustand', () => {
  for (const mapId of ['klippen', 'ruinen', 'see', 'wiese']) {
    for (const state of [s0(), solvedAll()]) {
      const r = world(mapId, state);
      for (const o of r.def.objects.filter(x => x.type === 'task')) assert.ok(PROPS[r.w.propVariant.task(o)], `${o.id}: ${r.w.propVariant.task(o)}`);
    }
  }
  let { w, def } = world('klippen');
  assert.equal(variant(w, def, 'task5-switch0'), `windwheel${TASKS[5].start[0]}`);
  assert.equal(variant(w, def, 'task5-prize'), 'kite');
  ({ w, def } = world('klippen', solvedAll()));
  assert.equal(variant(w, def, 'task5-prize'), 'kiteDone', 'der Drachen fliegt');
  assert.equal(variant(w, def, 'task5-switch2'), `windwheel${TASKS[5].wind}`, 'steht im Wind; bei „Bewegung reduzieren“ still');
  const moving = world('klippen', solvedAll(), { reducedMotion: false });
  const frames = new Set();
  for (let i = 0; i < 8; i++) {
    moving.w.update(100);
    frames.add(variant(moving.w, moving.def, 'task5-switch0'));
  }
  assert.deepEqual([...frames].sort(), [`windwheel${TASKS[5].wind}`, `windwheel${TASKS[5].wind}Spin`], 'es dreht sich');

  ({ w, def } = world('ruinen', solvedAll()));
  const last = TASKS[6].order.at(-1), first = TASKS[6].order[0];
  assert.equal(variant(w, def, `task6-switch${last}`), `lever${last}Open`);
  assert.equal(variant(w, def, `task6-switch${first}`), `lever${first}Lit`);
  assert.equal(variant(w, def, 'task6-clue'), 'wallsketch');

  ({ w, def } = world('see'));
  assert.equal(variant(w, def, 'task7-giver'), 'rabbits');
  ({ w, def } = world('see', solvedAll()));
  assert.equal(variant(w, def, 'task7-giver'), 'rabbitsDone', 'sie haben ihren Fund verschenkt');
});

test('In der Welt: Ein Windrad, das richtig im Wind steht, sagt es; erst alle drei lösen', async () => {
  const { w, def, said, state } = world('klippen');
  const use = async id => {
    said.length = 0;
    assert.equal(await w.onInteract[0]({ target: partOf(def, id), x: 0, y: 0 }), true);
    return [...said];
  };
  const task = TASKS[5];
  const dir = d => t('gear.dir.' + d);
  // Der Wimpel an der Stange: Einleitung, dann die Windrichtung.
  assert.deepEqual(await use('task5-clue0'), [...DE['task.5.intro'], t('task.5.clue', { dir: dir(task.wind) })]);
  assert.deepEqual(await use('task5-prize'), [t('task.5.prize')]);
  // Windrad 1 steht eine Drehung vor dem Wind.
  assert.equal((task.start[1] + 1) % 4, task.goal[1]);
  assert.deepEqual(await use('task5-switch1'), [t('task.5.turned', { dir: dir(task.goal[1]) }), t('task.5.set')]);
  assert.deepEqual(await use('task5-switch1'), [t('task.5.turned', { dir: dir((task.goal[1] + 1) % 4) }), t('task.5.tip')], 'weg aus dem Wind: Tipp');
  for (let i = 0; i < 2; i++) assert.ok(!(await use('task5-switch1')).includes(t('task.5.set')));
  assert.ok((await use('task5-switch1')).includes(t('task.5.set')), 'wieder im Wind');
  const presses = i => (task.goal[i] - task.start[i] + 4) % 4;
  for (let n = 1; n < presses(0); n++) await use('task5-switch0');
  assert.ok((await use('task5-switch0')).includes(t('task.5.set')));
  for (let n = 1; n < presses(2); n++) await use('task5-switch2');
  assert.equal(taskSolved(state, 5), false);
  const end = await use('task5-switch2');
  assert.equal(taskSolved(state, 5), true);
  assert.ok(!end.includes(t('task.5.set')), 'gelöst: die Lösung sagt es');
  assert.deepEqual(end.slice(-3), [...DE['task.5.solved'], t('task.reward', { name: treasureName(AREA_TREASURES[5].rare) })]);
  assert.equal(variant(w, def, 'task5-prize'), 'kiteDone');
  assert.deepEqual(await use('task5-switch0'), [t('task.5.done')]);
});

test('In der Welt: Die Statuen der Dünen sagen es auch, wenn eine zum Leuchtstein schaut', async () => {
  const { w, def, said } = world('duenen');
  const task = TASKS[4];
  const i = [0, 1, 2].find(k => (task.start[k] + 1) % 4 === task.goal[k]) ?? 0;
  for (let n = 0; n < (task.goal[i] - task.start[i] + 4) % 4; n++) await w.onInteract[0]({ target: partOf(def, `task4-switch${i}`), x: 0, y: 0 });
  assert.equal(said.at(-1), t('task.4.set'));
});

test('In der Welt: Hebel der Ruinen: der falsche zuerst ist kein Fehler; richtig gezogen läuft das Kanalstück leer', async () => {
  const { w, def, said, run, state } = world('ruinen');
  const task = TASKS[6];
  const pull = async i => {
    said.length = 0;
    await w.onInteract[0]({ target: partOf(def, `task6-switch${i}`), x: 0, y: 0 });
    return [...said];
  };
  const list = task.order.map(i => t(`task.6.symbol.${i}`)).join(', ');
  const [a, b, c] = task.order;
  assert.deepEqual(await pull(b), [t(`task.6.part.${b}`), t('task.6.start', { list })]);
  assert.equal(run.step, 0);
  assert.deepEqual(await pull(a), [t(`task.6.part.${a}`), t('task.6.progress', { n: 1, of: 3 })]);
  assert.deepEqual(await pull(a), [t(`task.6.part.${a}`), t('task.6.again')]);
  assert.deepEqual(await pull(c), [t(`task.6.part.${c}`), t('task.6.tip', { list })], 'danach ist ein falscher Hebel ein Fehler');
  for (const i of [a, b]) await pull(i);
  const end = await pull(c);
  assert.equal(taskSolved(state, 6), true);
  assert.ok(end.includes(DE['task.6.solved'][0]));
});

test('In der Welt: Steine der Sternenwiese: ein falscher erster ist kein Fehler, ein falscher danach gibt einen Tipp', async () => {
  const { w, run, said, hushed, state } = world('wiese');
  const task = TASKS[8];
  const stepped = w.onStepped.at(-1);
  const on = i => stepped(task.plates[i].x, task.plates[i].y);
  const list = task.order.map(i => t(`task.8.symbol.${i}`)).join(', ');
  const [a, b, c, d] = task.order;

  assert.equal(stepped(task.plates[a].x, task.plates[a].y - 1), null, 'neben einem Stein: nichts');
  assert.deepEqual(hushed, []);
  assert.equal(on(c), null, 'nicht der erste: leise, ohne Sperre');
  assert.equal(orderLit(run, task, c), false);
  assert.deepEqual(hushed, [t('task.8.start', { list })]);

  assert.equal(on(a), null, 'der erste leuchtet, man läuft weiter');
  assert.equal(orderLit(run, task, a), true);
  assert.equal(hushed.at(-1), `${t(`task.8.part.${a}`)} ${t('task.8.progress', { n: 1, of: 4 })}`);
  const before = hushed.length;
  assert.equal(on(a), null, 'über einen hellen Stein läuft man einfach');
  assert.equal(hushed.length, before);

  const wrong = on(c);
  assert.equal(typeof wrong, 'function', 'falscher Stein nach dem ersten: Tipp unter Sperre');
  assert.equal(orderLit(run, task, a), false, 'alle erlöschen');
  await wrong();
  assert.deepEqual(said, [t(`task.8.part.${c}`), t('task.8.tip', { list })]);

  for (const i of [a, b, c]) assert.equal(on(i), null);
  const end = on(d);
  assert.equal(typeof end, 'function');
  await end();
  assert.equal(taskSolved(state, 8), true);
  assert.ok(said.includes(DE['task.8.solved'][0]));
  assert.equal(on(a), null, 'gelöst: nichts mehr');

  const done = world('wiese', solvedAll());
  assert.equal(done.w.onStepped.length, 0, 'gelöst: Steine ohne Handler');
});

test('In der Welt: Pfotenspuren im Schnee: am Anfang leise, nach der ersten Station ein Tipp, am Ende die Hasen', async () => {
  const { w, def, said, hushed, state } = world('see');
  const task = TASKS[7], st = task.stations;
  const stepped = w.onStepped.at(-1);
  const far = p => ({ x: p.x, y: p.y + task.lose + 1 });
  assert.equal(stepped(st[0].x + 3, st[0].y), null, 'nur in der Nähe: nichts');
  const intro = stepped(st[0].x, st[0].y);
  assert.equal(typeof intro, 'function', 'Einleitung unter Sperre');
  await intro();
  assert.deepEqual(said, DE['task.7.intro']);
  let f = far(st[1]);
  assert.equal(stepped(f.x, f.y), null, 'noch keiner Station gefolgt: leise zurück');
  assert.equal(hushed.at(-1), t('task.7.back'));
  assert.equal(stepped(st[0].x + 1, st[0].y), null, 'noch einmal: leise weiter');
  assert.equal(hushed.at(-1), t('task.7.again'));
  assert.equal(stepped(st[1].x, st[1].y), null);
  assert.equal(hushed.at(-1), DE['task.7.station'][0]);
  f = far(st[2]);
  const tip = stepped(f.x, f.y);
  assert.equal(typeof tip, 'function', 'jetzt ein Tipp');
  said.length = 0;
  await tip();
  assert.deepEqual(said, [t('task.7.tip')]);
  for (const p of st.slice(0, -1)) assert.equal(stepped(p.x, p.y), null);
  const last = st.at(-1);
  const end = stepped(last.x + 1, last.y);
  assert.equal(typeof end, 'function');
  await end();
  assert.equal(taskSolved(state, 7), true);
  assert.equal(variant(w, def, 'task7-giver'), 'rabbitsDone');
});

test('In der Welt: Pfotenspuren und Kanalstück in Farben der Palette, ohne Bewegung bei „Bewegung reduzieren“', () => {
  const hexes = new Set(PALETTE.map(p => p.hex));
  const draw = (w, cam) => {
    const ctx = stubContext();
    for (const fn of w.groundRender) fn(ctx, cam);
    return ctx.calls;
  };
  const camAt = (x, y) => ({ x: x * 16 - 112, y: y * 16 - 72 });
  // See: Spuren beim Zelt, dann bis zur ersten Station.
  const see = world('see');
  const [s0, s1] = TASKS[7].stations;
  const before = draw(see.w, camAt(s0.x, s0.y));
  const colors = before.filter(c => c[0] === 'set' && c[1] === 'fillStyle').map(c => c[2]);
  assert.ok(colors.length > 0, 'Spuren am Anfang zu sehen');
  for (const c of colors) assert.ok(hexes.has(c), c);
  for (let i = 0; i < 40; i++) see.w.update(16);
  assert.deepEqual(draw(see.w, camAt(s0.x, s0.y)), before, 'kein Flackern');
  see.w.onStepped.at(-1)(s0.x, s0.y);
  assert.ok(draw(see.w, camAt(s1.x, s1.y)).filter(c => c[0] === 'fillRect').length > before.filter(c => c[0] === 'fillRect').length, 'mehr Spuren, wenn man folgt');
  assert.equal(draw(world('see', solvedAll()).w, camAt(s0.x, s0.y)).filter(c => c[0] === 'fillRect').length, 0, 'gelöst: die Hasen sind daheim');

  // Ruinen: Schleuse über dem Kanal, nach dem Lösen ein trockenes Kanalstück.
  const { chamber } = TASKS[6];
  const cam = camAt(chamber.x, chamber.y);
  const wet = draw(world('ruinen').w, cam);
  const dry = draw(world('ruinen', solvedAll()).w, cam);
  for (const calls of [wet, dry]) for (const c of calls.filter(x => x[0] === 'set' && x[1] === 'fillStyle')) assert.ok(hexes.has(c[2]), c[2]);
  assert.ok(wet.some(c => c[0] === 'fillRect'), 'die Schleuse ist zu sehen');
  assert.ok(dry.filter(c => c[0] === 'fillRect').length > wet.filter(c => c[0] === 'fillRect').length, 'trockener Grund');
});
