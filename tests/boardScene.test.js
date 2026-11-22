// Der Aushang in einer echten Weltszene (js/scenes/boardEvents.js): Meldungen, Sperre, Ilvys Hinweis,
// Besuch eines Gebiets, Tageswechsel, Tafel und Glitzern. Dialog, Toast und Seite sind hier
// Aufzeichnungen; wie sie im DOM aussehen, prüft der Controller im Browser.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createWorldScene } from '../js/scenes/world.js';
import { addBoard } from '../js/scenes/boardEvents.js';
import { MAPS, worldLines } from '../js/world/network.js';
import { BUCHT } from '../js/world/maps/bucht.js';
import { emit } from '../js/world/events.js';
import { newGameState } from '../js/state.js';
import { createRng } from '../js/core/rng.js';
import { xpToNext } from '../js/duel/progress.js';
import { setAudio } from '../js/audio/bus.js';
import { t } from '../js/i18n/i18n.js';

const DAY = '2026-11-22';
const PACK = { shortId: 'aushang-test', trainers: [{ number: 1 }], notes: [] };
const task = (kind, over = {}) => ({ kind, n: 2, area: null, progress: 0, done: false, rewarded: false, ...over });
const board = (tasks, over = {}) => ({ day: DAY, tasks, bonus: false, intro: true, ...over });
// Zwei Aufgaben sind erledigt, bei der dritten fehlt ein Zettel.
const almost = () => [task('streak', { n: 3, progress: 3, done: true, rewarded: true }), task('wildWins', { progress: 2, done: true, rewarded: true }), task('notes', { progress: 1 })];

const jingles = [];
setAudio({ jingle: id => jingles.push(id), sfx() {}, music() {} });

function setup({ map = 'bucht', state: given, b, reducedMotion = false, today = DAY, seed = 7, pack = PACK } = {}) {
  const def = MAPS[map];
  const state = given ?? newGameState({ name: 'A', species: 'nixi', nickname: null });
  state.position = { map, ...def.spawn };
  if (b !== undefined) state.board = b;
  const log = { toasts: [], toastArgs: [], says: [], sheets: [], saves: 0, levelUps: [] };
  const game = {
    state,
    reducedMotion,
    mode: 'walk',
    rng: createRng(seed),
    pack: { data: pack },
    save: () => log.saves++,
    input: { dir: () => null, pressed: () => false },
  };
  let day = today;
  const world = createWorldScene(game, def, {});
  addBoard(world, game, {
    levelUps: async (before, after) => log.levelUps.push([before, after]),
    say: async (g, lines, opts = {}) => log.says.push({ lines, speaker: opts.speaker }),
    toast: (text, ms, kind) => (log.toasts.push(text), log.toastArgs.push({ ms, kind })),
    sheet: async (g, page) => log.sheets.push(page),
    today: () => day,
  });
  jingles.length = 0;
  return { world, state, game, log, setDay: d => (day = d) };
}

const ticks = (world, ms) => {
  for (let i = 0; i < ms; i += 16) world.update(16);
};
const settle = () => new Promise(r => setImmediate(r));
const newsPrefix = key => t(key, { reward: '\u0000', xp: 0 }).split('\u0000')[0];

test('Ein Ereignis in der Welt führt zu genau einer Meldung mit Jingle, danach ist gespeichert', () => {
  const { world, state, log } = setup({ b: board([task('notes', { progress: 1 }), task('streak', { n: 3 }), task('wildWins')]) });
  const saves = log.saves;
  emit(state, 'note');
  world.update(16);
  assert.equal(log.toasts.length, 1);
  assert.ok(log.toasts[0].startsWith(newsPrefix('board.news.task')), log.toasts[0]);
  assert.deepEqual(jingles, ['board']);
  assert.deepEqual(log.toastArgs, [{ ms: 6000, kind: 'news' }], 'so lange wie jeder Toast, mit eigenem Platz');
  assert.equal(log.saves, saves + 1);
  assert.equal(state.board.tasks[0].done, true);
  ticks(world, 8000);
  assert.equal(log.toasts.length, 1, 'keine zweite Meldung');
  assert.deepEqual(jingles, ['board']);
  assert.deepEqual(state.events, []);
});

test('Eine gesperrte Welt meldet nichts; danach kommt die Meldung', async () => {
  const { world, state, log, game } = setup({ b: board([task('notes', { progress: 1 }), task('streak', { n: 3 }), task('wildWins')]) });
  let release;
  const held = world.lock(() => new Promise(r => (release = r)));
  emit(state, 'note');
  ticks(world, 2000);
  assert.deepEqual(log.toasts, []);
  assert.ok(state.events.some(e => e.type === 'note'), 'noch nicht gezählt');
  release();
  await held;
  game.mode = 'dialog';
  ticks(world, 2000);
  assert.deepEqual(log.toasts, [], 'nicht während eines Dialogs');
  game.mode = 'walk';
  game.overlay = { render() {} };
  ticks(world, 2000);
  assert.deepEqual(log.toasts, [], 'nicht während einer Überblendung');
  game.overlay = null;
  world.update(16);
  assert.equal(log.toasts.length, 1);
});

test('Zwei Meldungen kommen nacheinander, der Tagesbonus mit Level-Zeilen nur bei neuem Level', async () => {
  const s = newGameState({ name: 'A', species: 'nixi', nickname: null });
  const levelBefore = s.creature.level;
  s.creature.xpInLevel = xpToNext(levelBefore) - 1;
  const { world, state, log } = setup({ state: s, b: board(almost()) });
  emit(state, 'note');
  world.update(16);
  assert.equal(log.toasts.length, 1, 'erst die Aufgabe');
  assert.ok(log.toasts[0].startsWith(newsPrefix('board.news.task')));
  ticks(world, 1000);
  assert.equal(log.toasts.length, 1, 'die zweite wartet');
  const levelAfter = state.creature.level;
  assert.ok(levelAfter > levelBefore);
  state.creature.level += 1; // ein Duell dazwischen sagt seine eigenen Level
  ticks(world, 6000);
  assert.equal(log.toasts.length, 2);
  assert.ok(log.toasts[1].startsWith(newsPrefix('board.news.bonus')), log.toasts[1]);
  assert.deepEqual(jingles, ['board', 'board']);
  await settle();
  assert.deepEqual(log.levelUps, [[levelBefore, levelAfter]]);

  // Ohne neues Level keine Level-Zeilen
  const two = setup({ b: board(almost()) });
  Object.assign(two.state.creature, { level: 20, xpInLevel: 0 });
  assert.ok(xpToNext(20) > 30);
  emit(two.state, 'note');
  ticks(two.world, 8000);
  await settle();
  assert.equal(two.log.toasts.length, 2);
  assert.deepEqual(two.log.levelUps, []);
});

test('Ilvys Hinweis kommt nur einmal, in der Bucht und erst, wenn die Welt frei ist', async () => {
  const s = newGameState({ name: 'A', species: 'nixi', nickname: null });
  const elsewhere = setup({ map: 'wald', state: s, b: null });
  assert.equal(s.board.intro, false, 'der Aushang ist neu');
  ticks(elsewhere.world, 3000);
  assert.deepEqual(elsewhere.log.says, [], 'nicht im Wald');

  const { world, log, state } = setup({ state: s });
  let release;
  const held = world.lock(() => new Promise(r => (release = r)));
  ticks(world, 3000);
  assert.deepEqual(log.says, [], 'nicht während eines anderen Dialogs');
  release();
  await held;
  ticks(world, 3000);
  await settle();
  const ilvy = BUCHT.objects.find(o => o.id === 'ilvy');
  assert.deepEqual(log.says, [{ lines: worldLines(BUCHT, ilvy, 'linesBoard'), speaker: 'Ilvy' }]);
  assert.equal(log.says[0].lines.length, 2);
  assert.equal(state.board.intro, true);
  assert.ok(log.saves > 0);
  ticks(world, 3000);
  await settle();
  assert.equal(log.says.length, 1);
  const again = setup({ state });
  ticks(again.world, 3000);
  await settle();
  assert.deepEqual(again.log.says, [], 'auch nicht in einer neuen Welt');
});

test('Besuch eines Gebiets zählt; Garten und geheime Orte zählen nicht', () => {
  const visit = () => board([task('visit', { n: 1, area: 2 }), task('streak', { n: 3 }), task('wildWins')]);
  const { world, state, log } = setup({ map: 'wald', b: visit() });
  assert.deepEqual(state.events, [{ type: 'visit', area: 2 }]);
  world.update(16);
  assert.equal(state.board.tasks[0].done, true);
  assert.equal(log.toasts.length, 1);
  for (const map of ['garten', 'eiche', 'hoehle1']) {
    const other = setup({ map, b: visit() });
    assert.deepEqual(other.state.events, [], map);
  }
  assert.deepEqual(setup({ map: 'bucht', b: visit() }).state.events, [{ type: 'visit', area: 1 }]);
});

test('Tageswechsel: Erst zählen die Ereignisse von gestern, dann kommen neue Aufgaben und Wünsche', async () => {
  const s = newGameState({ name: 'A', species: 'nixi', nickname: null });
  s.board = board([task('notes', { progress: 1 }), task('streak', { n: 3 }), task('wildWins')], { day: '2026-11-21' });
  s.wishes = { pim: { treasure: 'glassshell', day: '2026-11-21', done: true } };
  emit(s, 'note');
  const { world, state, log, setDay } = setup({ state: s });
  assert.equal(state.board.day, DAY, 'beim Aufbau');
  assert.equal(state.board.intro, true, 'Ilvy hat schon davon erzählt');
  assert.equal(state.wishes.pim.day, DAY, 'ein neuer Wunsch');
  assert.equal(state.wishes.pim.done, false);
  world.update(16);
  assert.equal(log.toasts.length, 1, 'die Zettel-Aufgabe von gestern');

  // Mitten im Spiel über Mitternacht, während eines Dialogs: Der Zettel zählt noch für gestern.
  state.board = board([task('notes', { progress: 1 }), task('streak', { n: 3 }), task('wildWins')]);
  let release;
  const held = world.lock(() => new Promise(r => (release = r)));
  emit(state, 'note');
  setDay('2026-11-23');
  ticks(world, 7000);
  assert.equal(state.board.day, DAY, 'nicht während der Sperre');
  release();
  await held;
  const saves = log.saves;
  world.update(16);
  world.update(16);
  assert.equal(state.board.day, '2026-11-23');
  // Auch ein Schatz als Belohnung von gestern zählt nicht für heute.
  assert.ok(state.board.tasks.every(x => !x.done && x.progress === 0));
  assert.deepEqual(state.events, []);
  assert.ok(log.saves > saves);
  assert.equal(log.toasts.length, 2, 'die Zettel-Aufgabe von gestern');
  // Ein früheres Datum ändert nichts.
  const before = JSON.stringify(state.board);
  setDay('2026-11-20');
  ticks(world, 1000);
  assert.equal(JSON.stringify(state.board), before);
});

// Ein Spielstand aus 1.2.1 hat noch keinen Aushang und keine Wünsche: Erst kommen die Wünsche, dann die
// Aufgaben, so kann schon am ersten Tag „Erfülle einen Wunsch“ dabei sein.
test('Erster Tag: erst die Wünsche, dann die Aufgaben', () => {
  let withWish = 0;
  for (let seed = 1; seed <= 30; seed++) {
    const s = newGameState({ name: 'A', species: 'nixi', nickname: null });
    s.board = null;
    s.wishes = {};
    const { state } = setup({ state: s, seed });
    assert.equal(state.wishes.pim.done, false, 'Pim hat einen Wunsch');
    if (state.board.tasks.some(x => x.kind === 'wish')) withWish++;
  }
  assert.ok(withWish > 0, String(withWish));
  // Auch beim Tageswechsel mitten im Spiel: Pims Wunsch von gestern ist erfüllt, der neue zählt schon.
  let later = 0;
  for (let seed = 1; seed <= 30; seed++) {
    const s = newGameState({ name: 'A', species: 'nixi', nickname: null });
    s.board = board([task('notes'), task('streak', { n: 3 }), task('wildWins')], { day: DAY });
    s.wishes = { pim: { treasure: 'glassshell', day: DAY, done: true } };
    const { world, state, setDay } = setup({ state: s, seed });
    setDay('2026-11-23');
    world.update(16);
    assert.equal(state.board.day, '2026-11-23');
    assert.equal(state.wishes.pim.done, false);
    if (state.board.tasks.some(x => x.kind === 'wish')) later++;
  }
  assert.ok(later > 0, String(later));
});

test('Ein neuer Tag im Wald: „Besuche …“ nennt nie den Wald', () => {
  const two = { ...PACK, trainers: [{ number: 1 }, { number: 2 }] };
  for (let seed = 1; seed <= 30; seed++) {
    const s = newGameState({ name: 'A', species: 'nixi', nickname: null });
    s.stones = [1]; // Bucht und Wald offen: kein Ziel übrig
    s.board = board([task('notes'), task('streak', { n: 3 }), task('wildWins')], { day: '2026-11-21' });
    const { world, state, log } = setup({ map: 'wald', state: s, seed, pack: two });
    assert.equal(state.board.day, DAY);
    assert.ok(!state.board.tasks.some(x => x.kind === 'visit'), `seed ${seed}`);
    world.update(16);
    assert.ok(state.board.tasks.every(x => !x.done), 'nichts gleich beim ersten Takt erledigt');
    assert.deepEqual(log.toasts, []);
  }
});

test('Meldungen stehen auf schmalen Bildern unter Anzeige und Knöpfen und halten keinen Finger auf', () => {
  const css = readFileSync(new URL('../css/spiel.css', import.meta.url), 'utf8');
  const base = css.slice(css.indexOf('.toast {'), css.indexOf('}', css.indexOf('.toast {')));
  assert.match(base, /pointer-events:\s*none/);
  const at = css.indexOf('@media (max-width: 1199px), (max-height: 799px) {\n  .toast.news {');
  assert.ok(at > 0, 'eigene Regel für schmale Bilder');
  const rule = css.slice(at, css.indexOf('}', at));
  assert.match(rule, /top:\s*calc\(var\(--img-top\) \+ var\(--gpx\) \* 4 \+ 64px\)/);
  assert.ok(!/pointer-events/.test(rule), 'bleibt wie jeder Toast ohne Fingertipp');
  // Anzeige und Knöpfe oben: beginnen gpx × 4 unter dem Bild-Oberrand, Knöpfe 52 px hoch (+ 3 px Schatten)
  for (const sel of ['.hud {', '.menu-btn {', '.bag-btn {']) {
    const r = css.slice(css.indexOf(sel), css.indexOf('}', css.indexOf(sel)));
    assert.match(r, /top:\s*calc\(var\(--gpx\) \* 4\)/, sel);
  }
  for (const sel of ['.menu-btn {', '.bag-btn {']) assert.match(css.slice(css.indexOf(sel), css.indexOf('}', css.indexOf(sel))), /height:\s*52px/, sel);
});

test('A auf die Tafel öffnet die Seite des Aushangs; andere Felder gehen weiter', async () => {
  const { world, log } = setup({ b: board(almost()) });
  const b = BUCHT.objects.find(o => o.type === 'board');
  const handler = world.onInteract[0];
  assert.equal(await handler({ target: b, x: b.x, y: b.y }), true);
  assert.equal(log.sheets.length, 1);
  assert.equal(log.sheets[0].title, t('board.title'));
  assert.equal(await handler({ target: null, x: b.x, y: b.y + 1 }), false);
  assert.equal(await handler({ target: BUCHT.objects.find(o => o.id === 'ilvy'), x: 35, y: 16 }), false);
});

test('Die Tafel glitzert, solange etwas offen ist, bei „Bewegung reduzieren“ nie', () => {
  const b = BUCHT.objects.find(o => o.type === 'board');
  const seen = world => {
    const out = new Set();
    for (let ms = 0; ms < 6000; ms += 16) {
      world.update(16);
      out.add(world.propVariant.board(b));
    }
    return [...out].sort();
  };
  assert.deepEqual(seen(setup({ b: board(almost()) }).world), ['noticeBoard', 'noticeBoardGlint']);
  assert.deepEqual(seen(setup({ b: board(almost()), reducedMotion: true }).world), ['noticeBoard']);
  const done = almost();
  done[2] = task('notes', { progress: 2, done: true, rewarded: true });
  assert.deepEqual(seen(setup({ b: board(done, { bonus: true }) }).world), ['noticeBoard']);
});

test('In createGameWorld: der Aushang vor Garten und Begleiter, mit den Level-Zeilen der Welt', () => {
  const src = readFileSync(new URL('../js/scenes/worldEvents.js', import.meta.url), 'utf8');
  const body = src.slice(src.indexOf('export function createGameWorld'));
  const at = body.indexOf('addBoard(world, game, { levelUps });');
  assert.ok(at > 0);
  assert.ok(at < body.indexOf('addGarden(world, game)'));
  assert.ok(at < body.indexOf('addCompanion(world, game)'));
});
