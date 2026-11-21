// Spielaufgaben (Lumara 1.2, Spec 6.6): die Regeln. Ein Run ist der Fortschritt eines Besuchs der
// Karte und wird nie gespeichert; wer die Karte verlässt, fängt beim nächsten Mal von vorn an. Wer
// scheitert, verliert nichts außer dem Fortschritt des Runs. Gespeichert wird nur state.tasks, die
// Gebiete mit gelöster Aufgabe. Die Arten und Daten stehen in js/data/tasks.js. DOM-frei.
//
// act(run, task, what) → { result: 'progress' | 'wrong' | 'solved' | 'nothing', … }
// what ist ein Teil { role, index } (A vor einem Objekt) oder ein Feld { x, y } (Platte betreten,
// beim Folgen das Feld der Figur).

import { TASKS } from '../data/tasks.js';
import { addItem } from '../items/bag.js';
import { AREA_TREASURES, addTreasure } from '../items/treasures.js';

export const taskOn = mapId => Object.values(TASKS).find(t => t.map === mapId) ?? null;

export const taskSolved = (state, area) => (state.tasks ?? []).includes(area);

export function createRun(task) {
  const run = { solved: false };
  if (task.type === 'collect') run.found = [];
  else if (task.type === 'order') run.step = 0;
  else if (task.type === 'turn') run.dirs = [...task.start];
  else if (task.type === 'follow') run.station = 0;
  return run;
}

export const foundCount = run => run.found?.length ?? 0;
export const isFound = (run, index) => !!run.found?.includes(index);
// Ein Teil der Reihenfolge leuchtet, solange es im laufenden Versuch schon dran war.
export const orderLit = (run, task, index) => task.order.indexOf(index) < run.step;
export const turnState = (run, index) => run.dirs[index];
export const stationNow = (run, task) => (run.solved ? null : task.stations[run.station]);

const NOTHING = { result: 'nothing' };
const distance = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
const validIndex = (index, n) => Number.isInteger(index) && index >= 0 && index < n;

function collect(run, task, { role, index }) {
  if (role === 'giver') {
    if (run.found.length < task.items) return { result: 'nothing', left: task.items - run.found.length };
    run.solved = true;
    return { result: 'solved' };
  }
  if (role !== 'item' || !validIndex(index, task.items)) return NOTHING;
  if (run.found.includes(index)) return { result: 'nothing', index };
  run.found.push(index);
  return { result: 'progress', index, left: task.items - run.found.length };
}

function order(run, task, what) {
  let index = what.index;
  if (what.role == null) {
    index = (task.plates ?? []).findIndex(p => p.x === what.x && p.y === what.y);
    if (index < 0) return NOTHING;
  } else if (what.role !== 'switch') {
    return NOTHING;
  }
  if (!validIndex(index, task.order.length)) return NOTHING;
  if (task.order[run.step] === index) {
    run.step++;
    if (run.step < task.order.length) return { result: 'progress', index, step: run.step };
    run.solved = true;
    return { result: 'solved', index, step: run.step };
  }
  // Schon im laufenden Versuch dran (etwa zweimal A am selben Baum): kein Fehler.
  if (orderLit(run, task, index)) return { result: 'nothing', index };
  // Noch nichts angefangen: kein Fehler, nur nicht das erste Teil (die Szene sagt, womit man anfängt).
  if (run.step === 0) return { result: 'nothing', index, notFirst: true };
  run.step = 0;
  return { result: 'wrong', index };
}

function turn(run, task, { role, index }) {
  if (role !== 'switch' || !validIndex(index, task.goal.length)) return NOTHING;
  const away = run.dirs[index] === task.goal[index];
  const dir = (run.dirs[index] = (run.dirs[index] + 1) % 4);
  if (run.dirs.every((d, i) => d === task.goal[i])) {
    run.solved = true;
    return { result: 'solved', index, dir, away };
  }
  return { result: 'progress', index, dir, away };
}

function follow(run, task, at) {
  if (!Number.isInteger(at.x) || !Number.isInteger(at.y)) return NOTHING;
  const station = task.stations[run.station];
  const d = distance(station, at);
  if (d <= task.near) {
    run.station++;
    if (run.station < task.stations.length) return { result: 'progress', index: run.station };
    run.station = task.stations.length - 1;
    run.solved = true;
    return { result: 'solved', index: run.station };
  }
  if (run.station > 0 && d > task.lose) {
    run.station = 0;
    return { result: 'wrong' };
  }
  return NOTHING;
}

const RULES = { collect, order, turn, follow };

export function act(run, task, what) {
  if (run.solved || !what) return NOTHING;
  return RULES[task.type]?.(run, task, what) ?? NOTHING;
}

// Beim ersten Lösen: der seltene Schatz des Gebiets und ein Leckerli (ohne Obergrenze). Danach null.
export function solveTask(state, area) {
  if (!AREA_TREASURES[area] || taskSolved(state, area)) return null;
  state.tasks = [...(state.tasks ?? []), area].sort((a, b) => a - b);
  const treasure = AREA_TREASURES[area].rare;
  addTreasure(state, treasure);
  addItem(state, 'treat');
  return { treasure, treat: true };
}
