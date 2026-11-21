import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGameState } from '../js/state.js';
import { createRng } from '../js/core/rng.js';
import { emit, BOARD_KINDS } from '../js/world/events.js';
import { todayKey, ensureBoard, feasibleKinds, processEvents, taskText, boardView } from '../js/world/board.js';
import { setLanguage, t } from '../js/i18n/i18n.js';
import { FRIENDABLE } from '../js/friends/friends.js';
import { AREA_WILD } from '../js/data/species.js';
import { mapOfArea, areaName, areaAt, areaTo } from '../js/world/network.js';
import { giftOf } from '../js/friends/friends.js';
import { CONFIG } from '../js/config.js';

const pack = n => ({ trainers: Array.from({ length: n }, (_, i) => ({ number: i + 1 })) });
const st = (stones = []) => ({ ...newGameState({ name: 'A', species: 'nixi', nickname: null }), stones });
const task = (kind, over = {}) => ({ kind, n: 1, area: null, progress: 0, done: false, rewarded: false, ...over });
const withBoard = (s, tasks) => { s.board = { day: '2026-11-22', tasks, bonus: false, intro: false }; return s; };
const seq = (...v) => { let i = 0; const next = () => v[i++ % v.length]; return { next, int: (a, b) => a + Math.floor(next() * (b - a + 1)), pick: arr => arr[Math.floor(next() * arr.length)], weighted: (items, fn) => { const w = items.map(fn); let r = next() * w.reduce((x, y) => x + y, 0); for (let k = 0; k < items.length; k++) { r -= w[k]; if (r < 0) return items[k]; } return items[items.length - 1]; } }; };

test('todayKey: Ortszeit als JJJJ-MM-TT', () => {
  assert.equal(todayKey(new Date(2026, 0, 5, 23, 59)), '2026-01-05');
  assert.equal(todayKey(new Date(2026, 11, 31, 0, 0)), '2026-12-31');
});

test('Neuer Tag: drei verschiedene Aufgaben; gleicher Tag oder früheres Datum: nichts Neues', () => {
  const s = st([1, 2, 3]);
  s.board = null;
  assert.equal(ensureBoard(s, pack(8), '2026-11-22', createRng(1)), true);
  const kinds = s.board.tasks.map(x => x.kind);
  assert.equal(kinds.length, 3);
  assert.equal(new Set(kinds).size, 3);
  for (const x of s.board.tasks) { assert.ok(BOARD_KINDS.includes(x.kind)); assert.equal(x.progress, 0); assert.equal(x.done, false); assert.equal(x.rewarded, false); assert.ok(x.area === null || Number.isInteger(x.area)); }
  const before = JSON.stringify(s.board);
  assert.equal(ensureBoard(s, pack(8), '2026-11-22', createRng(2)), false);
  assert.equal(ensureBoard(s, pack(8), '2026-11-21', createRng(2)), false);
  assert.equal(JSON.stringify(s.board), before);
  s.board.intro = true;
  assert.equal(ensureBoard(s, pack(8), '2026-11-23', createRng(3)), true);
  assert.equal(s.board.day, '2026-11-23');
  assert.equal(s.board.intro, true);
  assert.equal(s.board.bonus, false);
});

test('Nur Machbares: nur Gebiet 1 offen, ohne Freunde, ohne Wünsche', () => {
  const s = st();
  assert.deepEqual(feasibleKinds(s, pack(1)).filter(k => !['streak', 'wildWins', 'notes', 'treasure', 'befriend'].includes(k)), []);
  for (let seed = 1; seed < 40; seed++) {
    s.board = null;
    ensureBoard(s, pack(1), '2026-11-22', createRng(seed));
    assert.equal(s.board.tasks.length, 3);
    for (const x of s.board.tasks) assert.ok(['streak', 'wildWins', 'notes', 'treasure', 'befriend'].includes(x.kind));
  }
});

test('Befreunde in Gebiet X nur, wenn dort noch eine Art fehlt', () => {
  const s = st();
  assert.ok(feasibleKinds(s, pack(1)).includes('befriend'));
  for (const id of [...AREA_WILD[1].common, AREA_WILD[1].rare]) if (FRIENDABLE.includes(id)) s.friends[id] = { shiny: false };
  assert.equal(feasibleKinds(s, pack(1)).includes('befriend'), false);
  const s2 = st([1]);
  for (const id of [...AREA_WILD[1].common, AREA_WILD[1].rare]) if (FRIENDABLE.includes(id)) s2.friends[id] = { shiny: false };
  for (let seed = 1; seed < 30; seed++) {
    s2.board = null;
    ensureBoard(s2, pack(2), '2026-11-22', createRng(seed));
    for (const x of s2.board.tasks.filter(x => x.kind === 'befriend')) assert.equal(x.area, 2);
  }
});

test('Fortschritt: Antworten in Folge, falsch setzt zurück', () => {
  const s = withBoard(st(), [task('streak', { n: 3 }), task('notes', { n: 2 }), task('treasure')]);
  const r = createRng(5);
  emit(s, 'answer', { correct: true }); emit(s, 'answer', { correct: true }); emit(s, 'answer', { correct: false }); emit(s, 'answer', { correct: true });
  processEvents(s, r, pack(8));
  assert.equal(s.board.tasks[0].progress, 1);
  assert.deepEqual(s.events, []);
  emit(s, 'answer', { correct: true }); emit(s, 'answer', { correct: true });
  const news = processEvents(s, r, pack(8));
  assert.equal(s.board.tasks[0].done, true);
  assert.equal(news.filter(x => x.kind === 'task').length, 1);
  emit(s, 'answer', { correct: true });
  processEvents(s, r, pack(8));
  assert.equal(s.board.tasks[0].progress, 3);
  emit(s, 'note');
  processEvents(s, r, pack(8));
  assert.equal(s.board.tasks[1].progress, 1);
});

test('Befreunden und Besuchen zählen nur mit passendem Gebiet', () => {
  const s = withBoard(st([1]), [task('befriend', { area: 2 }), task('visit', { area: 2 }), task('wish')]);
  emit(s, 'befriend', { area: 1 }); emit(s, 'visit', { area: 1 });
  processEvents(s, createRng(1), pack(8));
  assert.equal(s.board.tasks[0].done, false);
  assert.equal(s.board.tasks[1].done, false);
  emit(s, 'befriend', { area: 2 }); emit(s, 'visit', { area: 2 }); emit(s, 'wish');
  processEvents(s, createRng(1), pack(8));
  assert.deepEqual(s.board.tasks.map(x => x.done), [true, true, true]);
});

test('Jede Aufgabe belohnt genau einmal, der Tagesbonus auch, auch wenn alle drei im selben Durchgang fertig werden', () => {
  const s = withBoard(st(), [task('notes'), task('wildWins'), task('wish')]);
  const hp = s.creature.level;
  emit(s, 'note'); emit(s, 'wildWin'); emit(s, 'wish');
  const news = processEvents(s, createRng(7), pack(8));
  assert.equal(news.filter(x => x.kind === 'task').length, 3);
  const bonus = news.filter(x => x.kind === 'bonus');
  assert.equal(bonus.length, 1);
  assert.equal(bonus[0].starfruit, true);
  assert.equal(bonus[0].xp, CONFIG.board.bonusXp);
  assert.equal(bonus[0].levelBefore, hp);
  assert.equal(s.bag.starfruit, 1);
  assert.ok(s.board.tasks.every(x => x.rewarded));
  assert.equal(s.board.bonus, true);
  emit(s, 'note'); emit(s, 'wildWin'); emit(s, 'wish');
  assert.deepEqual(processEvents(s, createRng(8), pack(8)), []);
  assert.equal(s.bag.starfruit, 1);
});

test('Ein Schatz als Belohnung erfüllt die Schatz-Aufgabe erst beim nächsten Durchgang', () => {
  const s = withBoard(st(), [task('notes'), task('treasure'), task('wish')]);
  emit(s, 'note');
  // Gewicht 1:1, 0.9 wählt den Schatz; danach Gebiet und Schatz
  const news = processEvents(s, seq(0.9, 0, 0), pack(8));
  assert.equal(news[0].reward.item, 'treasure');
  assert.equal(s.board.tasks[1].done, false);
  assert.equal(s.events.length, 1);
  assert.equal(s.events[0].type, 'treasure');
  const more = processEvents(s, seq(0.1), pack(8));
  assert.equal(s.board.tasks[1].done, true);
  assert.equal(more.filter(x => x.kind === 'task').length, 1);
});

test('Bonus bei vollem Futter: Weitblickstein statt Sternfrucht', () => {
  const s = withBoard(st(), [task('notes'), task('wildWins'), task('wish')]);
  s.bag.berry = 99;
  emit(s, 'note'); emit(s, 'wildWin'); emit(s, 'wish');
  const news = processEvents(s, createRng(3), pack(8));
  const bonus = news.find(x => x.kind === 'bonus');
  assert.equal(bonus.starfruit, false);
  assert.equal(s.bag.farsight, 1);
  assert.equal(s.bag.starfruit, 0);
});

test('Texte und Ansicht', () => {
  setLanguage('de');
  const s = withBoard(st(), [task('befriend', { area: 2 }), task('streak', { n: 4, progress: 1 }), task('treasure', { done: true, progress: 1 })]);
  assert.equal(taskText(s.board.tasks[1]), 'Beantworte 4 Fragen hintereinander richtig.');
  assert.equal(taskText(s.board.tasks[0]), 'Freunde dich im Flüsterwald mit einem Wesen an.');
  assert.equal(taskText(task('visit', { area: 2 })), 'Besuche den Flüsterwald.');
  assert.equal(taskText(task('befriend', { area: 4 })), 'Freunde dich in den Spiegeldünen mit einem Wesen an.');
  assert.equal(taskText(task('visit', { area: 4 })), 'Besuche die Spiegeldünen.');
  const v = boardView(s);
  assert.equal(v.day, '2026-11-22');
  assert.equal(v.allDone, false);
  assert.deepEqual(v.tasks.map(x => [x.progress, x.n, x.done]), [[0, 1, false], [1, 4, false], [1, 1, true]]);
});

test('Texte in jeder Sprache ohne Text fehlt', () => {
  const kinds = BOARD_KINDS;
  for (const lang of ['de', 'en', 'fr', 'es']) {
    setLanguage(lang);
    for (const k of kinds) for (const area of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const text = taskText(task(k, { n: 3, area: k === 'befriend' || k === 'visit' ? area : null }));
      assert.ok(text.trim() && !/\{\w+\}/.test(text) && !/Text fehlt/.test(text), `${lang} ${k}: ${text}`);
    }
    assert.ok(t('board.done') && t('board.progress', { progress: 1, n: 2 }).includes('1'));
  }
  setLanguage('fr');
  assert.match(t('board.done'), / !$/);
  setLanguage('de');
});

test('Nur die vier immer machbaren Arten: trotzdem drei verschiedene', () => {
  const s = st();
  for (const id of [...AREA_WILD[1].common, AREA_WILD[1].rare]) if (FRIENDABLE.includes(id)) s.friends[id] = { shiny: false };
  assert.deepEqual(feasibleKinds(s, pack(1)).filter(k => k !== 'hideouts'), ['streak', 'wildWins', 'notes', 'treasure']); // die neuen Freunde öffnen Verstecke
  s.board = null;
  ensureBoard(s, pack(1), '2026-11-22', createRng(4));
  assert.equal(new Set(s.board.tasks.map(x => x.kind)).size, 3);
});

test('Verstecke: machbar mit Strandgut-Freund, nicht nur mit Spürnase', () => {
  const s = st();
  assert.equal(feasibleKinds(s, pack(1)).includes('hideouts'), false);
  const sniffer = FRIENDABLE.find(id => giftOf(id) === 'sniff');
  s.friends[sniffer] = { shiny: false };
  assert.equal(feasibleKinds(s, pack(1)).includes('hideouts'), false);
  const beach = FRIENDABLE.find(id => giftOf(id) === 'beachcomb');
  s.friends[beach] = { shiny: false };
  assert.equal(feasibleKinds(s, pack(1)).includes('hideouts'), true);
});

test('Wunsch: nur mit offenem Wunsch machbar', () => {
  const s = st();
  assert.equal(feasibleKinds(s, pack(1)).includes('wish'), false);
  s.wishes = { pim: { treasure: 'seashell', day: '2026-11-22', done: true } };
  assert.equal(feasibleKinds(s, pack(1)).includes('wish'), false);
  s.wishes.lio = { treasure: 'seashell', day: '2026-11-22', done: false };
  assert.equal(feasibleKinds(s, pack(1)).includes('wish'), true);
});

test('Jedes Gebiet hat Ort und Ziel in allen Sprachen', () => {
  for (const lang of ['de', 'en', 'fr', 'es']) {
    setLanguage(lang);
    for (const area of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const def = mapOfArea(area);
      assert.ok(areaAt(def).trim() && areaAt(def) !== areaName(def), `${lang} at ${area}`);
      assert.ok(areaTo(def).trim(), `${lang} to ${area}`);
    }
  }
  setLanguage('de');
});
