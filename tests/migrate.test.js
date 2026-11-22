import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { decodeSave } from '../js/save/codec.js';
import { migrateState } from '../js/save/migrate.js';
import { emptyPackProgress } from '../js/state.js';
import { xpToNext, maxEnergy } from '../js/duel/progress.js';
import { BUCHT } from '../js/world/maps/bucht.js';
import { SPIELSTAND_V1 } from './fixtures/spielstand-v1.js';
import { SPIELSTAND_V2 } from './fixtures/spielstand-v2.js';
import { SPIELSTAND_V3 } from './fixtures/spielstand-v3.js';
import { SPIELSTAND_V4 } from './fixtures/spielstand-v4.js';
import { SPIELSTAND_V5 } from './fixtures/spielstand-v5.js';
const V5_EMPTY = { quests: {}, keys: [], secrets: {} };
const V6 = { version: 6, finale: { done: false } };
import { SPIELSTAND_V7 } from './fixtures/spielstand-v7.js';
// Format 7: jedes Paket hat Revanche-Stufen (tiers), ältere Stände bekommen leere.
// Format 8: Musik und Effekte, ältere Stände bekommen beides eingeschaltet.
const toV8 = s => ({ ...s, version: 8, settings: { ...s.settings, music: true, sfx: true } });
import { SPIELSTAND_V8 } from './fixtures/spielstand-v8.js';
// Format 9: Schätze und Album, ältere Stände bekommen beides leer.
const toV9 = s => ({ ...toV8(s), version: 9, treasures: {}, album: [] });
import { SPIELSTAND_V9 } from './fixtures/spielstand-v9.js';
// Format 10: Freunde, Begleiter, Aufgaben, Leckerli und Verstecke, ältere Stände bekommen alles leer.
const v9to10 = s => ({ ...s, version: 10, friends: {}, companion: null, tasks: [], bag: { ...s.bag, treat: 0 }, world: { ...s.world, hideouts: {} } });
const toV10 = s => v9to10(toV9(s));
import { SPIELSTAND_V10 } from './fixtures/spielstand-v10.js';
// Format 11: Aushang, Wünsche und Ereignisse, ältere Stände bekommen alles leer.
const v10to11 = s => ({ ...s, version: 11, board: null, wishes: {}, events: [] });
const toV11 = s => v10to11(toV10(s));
import { SPIELSTAND_V11 } from './fixtures/spielstand-v11.js';
const v7 = s => toV11({ ...s, version: 7, packs: Object.fromEntries(Object.entries(s.packs).map(([id, p]) => [id, { ...p, tiers: {} }])) });
import { SPIELSTAND_V6 } from './fixtures/spielstand-v6.js';
import { TRAINER_CREATURES } from '../js/data/species.js';
const bookOf = stones => Object.fromEntries(stones.map(n => [TRAINER_CREATURES[n].species, { beaten: true, shiny: false }]));
import { foodCount } from '../js/items/bag.js';
import { createMap } from '../js/world/map.js';

test('Spielstand der Fassung 1 bleibt für immer ladbar und wird zu Format 11', () => {
  const d = decodeSave(readFileSync(new URL('./fixtures/spielstand-v1.txt', import.meta.url), 'utf8'));
  assert.equal(d.ok, true);
  const m = migrateState(d.value);
  assert.equal(m.ok, true);
  assert.equal(m.state.version, 11);
  const { version, playMs, stones, lastStone, bag, shineActive, story, world, book, quests, keys, secrets, finale, treasures, album, friends, companion, tasks, ...rest } = m.state;
  assert.deepEqual({ quests, keys, secrets }, V5_EMPTY);
  assert.deepEqual(finale, { done: false });
  assert.deepEqual({ treasures, album }, { treasures: {}, album: [] });
  assert.deepEqual({ friends, companion, tasks }, { friends: {}, companion: null, tasks: [] });
  assert.deepEqual(book, { haeuschel: { beaten: true, shiny: false } }); // Maren war besiegt
  const { version: _v, ...v1 } = SPIELSTAND_V1;
  const { version: _w, treasures: _t, album: _a, friends: _f, companion: _c, tasks: _k, bag: _b, world: _o, ...v1Latest } = v7(v1);
  assert.deepEqual(rest, v1Latest);
  assert.deepEqual(stones, [1]); // Hüterin war mit ENQ9 besiegt → Stein 1 leuchtet
  assert.equal(lastStone, null);
  assert.equal(playMs, 5700000); // Spielzeit aus allen Paketen zusammen
  assert.deepEqual(bag, { berry: 0, starfruit: 0, farsight: 0, shine: 0, time: 0, treat: 0 });
  assert.equal(shineActive, false);
  assert.deepEqual(story, {});
  assert.deepEqual(world, { bushes: {}, notes: {}, finds: {}, hideouts: {} });
});

test('Spielstand der Fassung 2 bleibt für immer ladbar und wird zu Format 11', () => {
  const d = decodeSave(readFileSync(new URL('./fixtures/spielstand-v2.txt', import.meta.url), 'utf8'));
  assert.deepEqual(migrateState(d.value), { ok: true, state: v7({ ...SPIELSTAND_V2, version: 5, bag: { ...SPIELSTAND_V2.bag, time: 0 }, book: bookOf(SPIELSTAND_V2.stones), ...V5_EMPTY, ...V6 }) });
});

test('Spielstand der Fassung 3 bleibt für immer ladbar', () => {
  const d = decodeSave(readFileSync(new URL('./fixtures/spielstand-v3.txt', import.meta.url), 'utf8'));
  assert.deepEqual(migrateState(d.value), { ok: true, state: v7({ ...SPIELSTAND_V3, version: 5, book: bookOf(SPIELSTAND_V3.stones), ...V5_EMPTY, ...V6 }) });
});

test('Format 3: unmögliche Zeitsteine werden 0', () => {
  for (const time of [-1, 'x', 1.5]) assert.equal(migrateState({ ...structuredClone(SPIELSTAND_V3), bag: { ...SPIELSTAND_V3.bag, time } }).state.bag.time, 0);
});

test('Format 2: unmögliche Werte werden repariert', () => {
  const m = migrateState({
    ...structuredClone(SPIELSTAND_V2),
    position: { map: 'bucht', x: 19, y: 24, dir: 'up' },
    stones: [3, 1, 1, 9, 'x'],
    lastStone: 7,
    bag: { berry: 99, starfruit: -1, farsight: 'zwei' },
    story: { 1: 9, 12: 1 },
    world: { bushes: { a: 'x', 'bucht:1,1': 5 } },
  });
  assert.equal(m.ok, true);
  assert.deepEqual(m.state.stones, [1, 3]);
  assert.equal(m.state.lastStone, null); // Stein 7 leuchtet nicht → null
  assert.equal(foodCount(m.state.bag), 10);
  assert.equal(m.state.bag.farsight, 0);
  assert.equal(m.state.bag.shine, 0);
  assert.deepEqual(m.state.story, { 1: 3 }); // höchstens 3 Stücke je Gebiet, nur Gebiete 1..8
  assert.deepEqual(m.state.world, { bushes: { 'bucht:1,1': 5 }, notes: {}, finds: {}, hideouts: {} });
});

test('Format 2: ein besiegter Hüter in irgendeinem Paket lässt seinen Leuchtstein leuchten', () => {
  const raw = structuredClone(SPIELSTAND_V2);
  raw.packs.GNEP = { ...structuredClone(raw.packs.ENQ9), beaten: [2] };
  const m = migrateState(raw);
  assert.deepEqual(m.state.stones, [1, 2]);
  assert.equal(m.state.lastStone, 1);
});

test('fehlende Teile werden ergänzt, unmögliche Werte begrenzt', () => {
  const m = migrateState({ version: 1, name: 'Mia', creature: { species: 'nixi', level: 7, xpInLevel: 9999, energy: 99 }, packs: { ENQ9: { beaten: [1, 1, 'x', 12] }, kaputt: 5 } });
  assert.equal(m.ok, true);
  const c = m.state.creature;
  assert.equal(c.xpInLevel, xpToNext(7) - 1);
  assert.equal(c.energy, maxEnergy(c));
  assert.equal(c.lifeStones, 0);
  assert.equal(c.nickname, null);
  assert.deepEqual(m.state.settings, { textSpeed: 'normal', music: true, sfx: true });
  assert.deepEqual(m.state.position, { map: 'bucht', ...BUCHT.spawn });
  assert.deepEqual(m.state.packs, { ENQ9: { ...emptyPackProgress(), beaten: [1] } });
  assert.equal(m.state.savedAt, 0);
});

test('Position in einer Wand oder außerhalb der Karte wird zum Startpunkt', () => {
  const m = migrateState({ ...structuredClone(SPIELSTAND_V1), position: { map: 'bucht', x: 0, y: 0, dir: 'up' } });
  assert.deepEqual(m.state.position, { map: 'bucht', ...BUCHT.spawn });
});

test('aus einer neueren Fassung oder unbrauchbar', () => {
  assert.deepEqual(migrateState({ ...SPIELSTAND_V11, version: 12 }), { ok: false, reason: 'newer' });
  const bad = [
    null, 'x', {}, { version: 1 },
    { ...SPIELSTAND_V1, name: '' },
    { ...SPIELSTAND_V1, creature: { ...SPIELSTAND_V1.creature, species: 'drache' } },
    { ...SPIELSTAND_V1, creature: { ...SPIELSTAND_V1.creature, level: 'zehn' } },
  ];
  for (const b of bad) assert.deepEqual(migrateState(b), { ok: false, reason: 'invalid' });
});

test('Der neue Pfad der Bucht macht keine gespeicherte Position ungültig', () => {
  const m = createMap(BUCHT);
  for (const [x, y] of [[22, 8], [BUCHT.spawn.x, BUCHT.spawn.y], [BUCHT.respawn.x, BUCHT.respawn.y]]) assert.ok(m.canEnter(x, y));
  for (let y = 5; y <= 8; y++) for (const x of [38, 39]) assert.equal(m.tileAt(x, y), 'fog');
  assert.equal(migrateState(structuredClone(SPIELSTAND_V1)).state.position.map, 'bucht');
});

test('Spielstand der Fassung 4 bleibt für immer ladbar', () => {
  const d = decodeSave(readFileSync(new URL('./fixtures/spielstand-v4.txt', import.meta.url), 'utf8'));
  assert.deepEqual(migrateState(d.value), { ok: true, state: v7({ ...SPIELSTAND_V4, ...V5_EMPTY, ...V6 }) });
});

test('Format 4: kaputte oder unbekannte Einträge im Buch fallen heraus', () => {
  const book = { moosling: { beaten: 'ja', shiny: true }, funki: { beaten: true, shiny: false }, quatsch: { beaten: true, shiny: true }, gischtling: 5 };
  assert.deepEqual(migrateState({ ...structuredClone(SPIELSTAND_V4), book }).state.book, { moosling: { beaten: false, shiny: true } });
  assert.deepEqual(migrateState({ ...structuredClone(SPIELSTAND_V4), book: 'x' }).state.book, {});
});

test('Spielstand der Fassung 5 bleibt für immer ladbar', () => {
  const d = decodeSave(readFileSync(new URL('./fixtures/spielstand-v5.txt', import.meta.url), 'utf8'));
  assert.deepEqual(migrateState(d.value), { ok: true, state: v7({ ...SPIELSTAND_V5, ...V6 }) });
});

test('Spielstand der Fassung 6 bleibt für immer ladbar', () => {
  const d = decodeSave(readFileSync(new URL('./fixtures/spielstand-v6.txt', import.meta.url), 'utf8'));
  assert.deepEqual(migrateState(d.value), { ok: true, state: v7(SPIELSTAND_V6) });
});

test('Spielstand der Fassung 7 bleibt für immer ladbar', () => {
  const d = decodeSave(readFileSync(new URL('./fixtures/spielstand-v7.txt', import.meta.url), 'utf8'));
  assert.deepEqual(migrateState(d.value), { ok: true, state: toV11(SPIELSTAND_V7) });
});

test('Spielstand der Fassung 8 bleibt für immer ladbar', () => {
  const d = decodeSave(readFileSync(new URL('./fixtures/spielstand-v8.txt', import.meta.url), 'utf8'));
  assert.deepEqual(migrateState(d.value), { ok: true, state: v10to11(v9to10({ ...SPIELSTAND_V8, version: 9, treasures: {}, album: [] })) });
});

test('Spielstand der Fassung 9 bleibt für immer ladbar', () => {
  const d = decodeSave(readFileSync(new URL('./fixtures/spielstand-v9.txt', import.meta.url), 'utf8'));
  assert.deepEqual(migrateState(d.value), { ok: true, state: v10to11(v9to10(SPIELSTAND_V9)) });
});

test('Spielstand der Fassung 10 bleibt für immer ladbar', () => {
  const d = decodeSave(readFileSync(new URL('./fixtures/spielstand-v10.txt', import.meta.url), 'utf8'));
  assert.deepEqual(migrateState(d.value), { ok: true, state: v10to11(SPIELSTAND_V10) });
});

test('Format 10: Freunde, Begleiter, Aufgaben, Leckerli und Verstecke werden repariert', () => {
  const base = () => ({ ...structuredClone(SPIELSTAND_V10), keys: [] }); // ohne Futterbeutel: 10 Futterplätze
  const m = migrateState({ ...base(), friends: { gischtling: { shiny: true }, funki: {}, morrow: {}, moosling: 'x', drache: {} }, companion: 'moosling' });
  assert.deepEqual(m.state.friends, { gischtling: { shiny: true } });
  assert.equal(m.state.companion, null); // kein Freund mehr
  assert.equal(migrateState({ ...base(), friends: { gischtling: {} }, companion: 'gischtling' }).state.companion, 'gischtling');
  assert.deepEqual(migrateState({ ...base(), friends: { gischtling: { shiny: 'ja' } } }).state.friends, { gischtling: { shiny: false } });
  assert.deepEqual(migrateState({ ...base(), friends: [1], companion: 5 }).state.friends, {});
  assert.equal(migrateState({ ...base(), companion: 5 }).state.companion, null);
  assert.deepEqual(migrateState({ ...base(), tasks: [3, 1, 3, 9, 'x', 0, 2.5] }).state.tasks, [1, 3]);
  assert.deepEqual(migrateState({ ...base(), tasks: 'x' }).state.tasks, []);
  assert.equal(migrateState({ ...base(), bag: { ...base().bag, treat: -2 } }).state.bag.treat, 0);
  assert.equal(migrateState({ ...base(), bag: { ...base().bag, berry: 10, starfruit: 5, treat: 7 } }).state.bag.treat, 7);
  assert.equal(foodCount(migrateState({ ...base(), bag: { ...base().bag, berry: 10, starfruit: 5, treat: 7 } }).state.bag), 10);
  assert.deepEqual(migrateState({ ...base(), world: { ...base().world, hideouts: { 'wald:3,4': 5, quatsch: 3, 'see:1,1': -1 } } }).state.world.hideouts, { 'wald:3,4': 5 });
});

test('Spielstand der Fassung 11 bleibt für immer ladbar', () => {
  const d = decodeSave(readFileSync(new URL('./fixtures/spielstand-v11.txt', import.meta.url), 'utf8'));
  assert.deepEqual(migrateState(d.value), { ok: true, state: SPIELSTAND_V11 });
});

test('Format 11: Aushang, Wünsche und Ereignisse werden repariert', () => {
  const base = () => structuredClone(SPIELSTAND_V11);
  const task = { kind: 'notes', n: 2, area: null, progress: 1, done: false, rewarded: false };
  const board = patch => ({ ...base().board, ...patch });
  const fix = patch => migrateState({ ...base(), ...patch }).state;
  assert.equal(fix({ board: board({ day: '22.11.2026' }) }).board, null);
  assert.equal(fix({ board: 'x' }).board, null);
  assert.equal(fix({ board: null }).board, null);
  assert.deepEqual(fix({ board: board({ tasks: [{ ...task, kind: 'fliegen' }, task, { ...task, n: 9 }, { ...task, area: 9 }, { ...task, n: 2.5 }] }) }).board.tasks, [task]);
  assert.deepEqual(fix({ board: board({ tasks: [{ ...task, progress: 7 }, { ...task, progress: -1, done: 'ja', rewarded: 1 }] }) }).board.tasks, [{ ...task, progress: 2 }, { ...task, progress: 0 }]);
  assert.equal(fix({ board: board({ tasks: [task, task, task, task, task] }) }).board.tasks.length, 3);
  // befriend und visit nur mit Gebiet 1 bis 8, alle anderen Arten nur ohne (null)
  const visit = { kind: 'visit', n: 1, area: 4, progress: 0, done: false, rewarded: false };
  const befriend = { ...visit, kind: 'befriend', area: 8 };
  const { area: _, ...noArea } = task;
  assert.deepEqual(fix({ board: board({ tasks: [{ ...visit, area: null }, { ...befriend, area: 0 }, visit] }) }).board.tasks, [visit]);
  assert.deepEqual(fix({ board: board({ tasks: [{ ...befriend, area: '3' }, befriend, { ...visit, area: 2.5 }] }) }).board.tasks, [befriend]);
  assert.deepEqual(fix({ board: board({ tasks: [{ ...task, area: 3 }, noArea, { ...task, kind: 'wish', n: 1, area: 1 }, { ...task, kind: 'streak', area: null }] }) }).board.tasks, [{ ...task, kind: 'streak' }]);
  assert.deepEqual(fix({ board: board({ tasks: 'x', bonus: 'ja', intro: 1 }) }).board, { day: '2026-11-22', tasks: [], bonus: false, intro: false });
  const w = { treasure: 'acorncap', day: '2026-11-22', done: true };
  assert.deepEqual(fix({ wishes: { pim: w, fremder: w, lio: { ...w, treasure: 'gold' }, nele: { ...w, day: 'heute' }, ari: 'x', kai: { ...w, done: 'ja' } } }).wishes, { pim: w, kai: { ...w, done: false } });
  assert.deepEqual(fix({ wishes: [1] }).wishes, {});
  const many = Array.from({ length: 150 }, (_, i) => ({ type: 'answer', correct: i >= 50 }));
  const ev = fix({ events: many }).events;
  assert.equal(ev.length, 100);
  assert.deepEqual(ev[0], { type: 'answer', correct: true });
  assert.deepEqual(fix({ events: [{ type: 'quatsch' }, null, 5, { type: 'answer', correct: 'ja' }, { type: 'visit', area: 3, extra: 1 }, { type: 'visit', area: 9 }, { type: 'befriend', area: 'x' }, { type: 'wish' }] }).events,
    [{ type: 'answer', correct: false }, { type: 'visit', area: 3 }, { type: 'visit' }, { type: 'befriend' }, { type: 'wish' }]);
  assert.deepEqual(fix({ events: 'x' }).events, []);
});

test('Format 10: ein kaputter Rucksack oder eine kaputte Welt in einem Stand der Fassung 9 geht nicht verloren', () => {
  for (const broken of ['x', null, 5, []]) {
    const m = migrateState({ ...structuredClone(SPIELSTAND_V9), bag: broken, world: broken });
    assert.equal(m.ok, true);
    assert.deepEqual(m.state.bag, { berry: 0, starfruit: 0, farsight: 0, shine: 0, time: 0, treat: 0 });
    assert.deepEqual(m.state.world, { bushes: {}, notes: {}, finds: {}, hideouts: {} });
  }
});

test('Format 9: kaputte Schätze und Album werden repariert', () => {
  const m = migrateState({ ...structuredClone(SPIELSTAND_V9), treasures: { glassshell: 3, drache: 2, goldleaf: -1, sandrose: 1.5, amber: 'x' }, album: ['quatsch', 'amber', 'amber', 7] });
  assert.deepEqual(m.state.treasures, { glassshell: 3 });
  // Ein Schatz mit Anzahl > 0 kommt immer ins Album; Reihenfolge wie TREASURES, ohne Doppelte und Unbekannte.
  assert.deepEqual(m.state.album, ['glassshell', 'amber']);
  const n = migrateState({ ...structuredClone(SPIELSTAND_V9), treasures: 'x', album: null });
  assert.deepEqual([n.state.treasures, n.state.album], [{}, []]);
});

test('Format 8: kaputte Toneinstellungen werden eingeschaltet, ein klares Aus bleibt aus', () => {
  const m = migrateState({ ...structuredClone(SPIELSTAND_V8), settings: { textSpeed: 'fast', music: 'nein', sfx: false } });
  assert.deepEqual(m.state.settings, { textSpeed: 'fast', music: true, sfx: false });
});

test('Format 7: kaputte Revanche-Stufen werden repariert', () => {
  const s = structuredClone(SPIELSTAND_V7);
  const id = Object.keys(s.packs)[0];
  s.packs[id].tiers = { 1: 3, 2: -1, 9: 7, x: 2, 4: 'a', 10: 1, 5: 0 };
  assert.deepEqual(migrateState(s).state.packs[id].tiers, { 1: 3, 9: 5 });
  s.packs[id].tiers = 'kaputt';
  assert.deepEqual(migrateState(s).state.packs[id].tiers, {});
});

test('Format 6: ein kaputter Zustand nach dem Finale wird repariert', () => {
  assert.deepEqual(migrateState({ ...structuredClone(SPIELSTAND_V6), finale: 'x' }).state.finale, { done: false });
  assert.deepEqual(migrateState({ ...structuredClone(SPIELSTAND_V6), finale: { done: 'ja' } }).state.finale, { done: false });
  assert.deepEqual(migrateState({ ...structuredClone(SPIELSTAND_V6), finale: { done: true, extra: 1 } }).state.finale, { done: true });
});

test('Format 5: kaputte Aufträge, Schlüsselgegenstände und geheime Orte fallen heraus', () => {
  const m = migrateState({
    ...structuredClone(SPIELSTAND_V5),
    quests: { q1: { step: 1, done: false }, q9: { step: 0, done: false }, q2: { step: -1, done: false }, q3: 'x' },
    keys: ['lantern', 'lantern', 'besen', 7],
    secrets: { eiche: { story: true, stone: 'x' }, mond: { story: true, stone: true } },
  });
  assert.deepEqual(m.state.quests, { q1: { step: 1, done: false } });
  assert.deepEqual(m.state.keys, ['lantern']);
  assert.deepEqual(m.state.secrets, { eiche: { story: true, stone: false } });
});

test('Format 5: ein Schritt hinter dem letzten wird auf den letzten Schritt gesetzt', () => {
  const m = migrateState({ ...structuredClone(SPIELSTAND_V5), quests: { q1: { step: 7, done: false }, q2: { step: 2, done: true } } });
  assert.deepEqual(m.state.quests, { q1: { step: 1, done: false }, q2: { step: 1, done: true } });
});

test('Mit Futterbeutel bleiben beim Laden bis zu 20 Futter', () => {
  const m = migrateState({ ...structuredClone(SPIELSTAND_V5), keys: ['foodbag'], bag: { ...SPIELSTAND_V5.bag, berry: 14, starfruit: 4 } });
  assert.deepEqual([m.state.bag.berry, m.state.bag.starfruit], [14, 4]);
});
