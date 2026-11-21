import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGameState, validateName, packProgress, applyDuelResult, emptyPackProgress, textSpeedCps } from '../js/state.js';

test('Textgeschwindigkeit', () => {
  assert.equal(textSpeedCps(undefined), 40);
  assert.equal(textSpeedCps({ textSpeed: 'fast' }), 80);
  assert.equal(textSpeedCps({ textSpeed: 'slow' }), 25);
  assert.equal(textSpeedCps({ textSpeed: 'quatsch' }), 40);
});
import { BUCHT } from '../js/world/maps/bucht.js';
import { xpToNext } from '../js/duel/progress.js';

test('neues Spiel: Level 1, volle Energie, Start am Steg', () => {
  const s = newGameState({ name: 'Mia', species: 'kiesel', nickname: null });
  assert.equal(s.version, 10);
  assert.deepEqual([s.treasures, s.album], [{}, []]);
  assert.deepEqual([s.friends, s.companion, s.tasks, s.bag.treat, s.world.hideouts], [{}, null, [], 0, {}]);
  assert.equal(s.creature.level, 1);
  assert.equal(s.creature.xpInLevel, 0);
  assert.equal(s.creature.energy, 5);
  assert.deepEqual(s.position, { map: 'bucht', ...BUCHT.spawn });
});

test('Namen: nach dem Kürzen 1 bis 12 Zeichen', () => {
  assert.deepEqual(validateName('  Mia '), { ok: true, value: 'Mia' });
  assert.deepEqual(validateName('   '), { ok: false, message: 'Bitte gib einen Namen ein.' });
  assert.deepEqual(validateName('Maximilian-Jo'), { ok: false, message: 'Höchstens 12 Zeichen.' });
  assert.equal(validateName('Zoë🦊').ok, true);
});

const won = (answers = [{ key: 'a', correct: true }]) => ({ outcome: 'won', playerEnergy: 2, flawless: true, answers });
const T1 = { kind: 'trainer', area: 1, foe: { species: 'haeuschel', stage: 2, level: 7, maxEnergy: 5 }, trainer: { number: 1 }, pool: [] };

test('Trainersieg: XP, Level, besiegt, Energie bleibt', () => {
  const s = newGameState({ name: 'A', species: 'funki', nickname: null });
  const r = applyDuelResult(s, 'ENQ9', T1, { ...won(), flawless: false });
  assert.equal(r.xp, 60);
  assert.equal(s.creature.level, 4);
  assert.equal(s.creature.xpInLevel, 0);
  assert.equal(s.creature.energy, 2);
  assert.deepEqual(packProgress(s, 'ENQ9').beaten, [1]);
  assert.deepEqual(packProgress(s, 'ENQ9').history.a, { n: 1, s: 1, w: false });
});

test('Makelloser Trainersieg gibt 75 XP', () => {
  const s = newGameState({ name: 'A', species: 'funki', nickname: null });
  assert.equal(applyDuelResult(s, 'ENQ9', T1, won()).xp, 75);
  assert.equal(s.creature.xpInLevel, 15);
});

test('Trainersieg entzündet den Leuchtstein im selben Schritt wie „besiegt“', () => {
  // Wird die App beim Sieg geschlossen, darf der Stand nie „besiegt, Stein dunkel“ sein.
  const s = newGameState({ name: 'A', species: 'funki', nickname: null });
  assert.equal(applyDuelResult(s, 'ENQ9', T1, won()).stoneLit, true);
  assert.deepEqual(s.stones, [1]);
  assert.equal(s.lastStone, 1);
  assert.equal(applyDuelResult(s, 'ENQ9', T1, won()).stoneLit, false);
  assert.equal(applyDuelResult(s, 'ENQ9', { kind: 'wild', area: 1 }, won()).stoneLit, false);
  assert.deepEqual(s.stones, [1]);
});

test('Beute nach einem Sieg landet im Rucksack, gemeldet wird, was hineinpasste', () => {
  const s = newGameState({ name: 'A', species: 'pieks', nickname: null });
  const always = { next: () => 0 };
  const wild = { kind: 'wild', area: 1 };
  assert.deepEqual(applyDuelResult(s, 'ENQ9', wild, won(), always).loot, [
    { item: 'berry', source: 'wild', kept: true },
    { item: 'berry', source: 'find', kept: true },
    { item: 'treasure', treasure: 'glassshell', source: 'wild', kept: true },
  ]);
  assert.equal(s.bag.berry, 2);
  s.bag.berry = 9;
  assert.deepEqual(applyDuelResult(s, 'ENQ9', wild, won(), always).loot.map(l => l.kept), [true, false, true]);
  assert.equal(s.bag.berry, 10);
  assert.equal(s.treasures.glassshell, 2);
  const fled = { outcome: 'fled', playerEnergy: 3, flawless: true, answers: [] };
  assert.deepEqual(applyDuelResult(s, 'ENQ9', wild, fled, always).loot, []);
  assert.deepEqual(applyDuelResult(s, 'ENQ9', wild, won()).loot, []); // ohne Zufall keine Beute
});

test('Glanzstein verdoppelt die XP des nächsten Siegs', () => {
  const s = newGameState({ name: 'A', species: 'funki', nickname: null });
  s.shineActive = true;
  const r = applyDuelResult(s, 'ENQ9', { kind: 'wild', area: 2 }, { outcome: 'won', playerEnergy: 3, flawless: true, answers: [] });
  assert.equal(r.xp, Math.round((8 + 2 * 2) * 1.25) * 2);
  assert.equal(r.shine, true);
  assert.equal(s.shineActive, false);
});

test('Glanzstein bleibt aktiv nach einer Niederlage oder Flucht', () => {
  const s = newGameState({ name: 'A', species: 'funki', nickname: null });
  s.shineActive = true;
  const lost = applyDuelResult(s, 'ENQ9', { kind: 'wild', area: 1 }, { outcome: 'lost', playerEnergy: 0, flawless: false, answers: [] });
  assert.equal(lost.shine, false);
  applyDuelResult(s, 'ENQ9', { kind: 'wild', area: 1 }, { outcome: 'fled', playerEnergy: 3, flawless: true, answers: [] });
  assert.equal(s.shineActive, true);
});

test('Niederlage: keine XP, volle Energie, Historie trotzdem', () => {
  const s = newGameState({ name: 'A', species: 'kiesel', nickname: null });
  const r = applyDuelResult(s, 'ENQ9', T1, { outcome: 'lost', playerEnergy: 0, flawless: false, answers: [{ key: 'b', correct: false }] });
  assert.equal(r.xp, 0);
  assert.equal(s.creature.energy, 5);
  assert.deepEqual(packProgress(s, 'ENQ9').beaten, []);
  assert.equal(packProgress(s, 'ENQ9').history.b.w, true);
});

test('Flucht: keine XP, Energie wie im Duell', () => {
  const s = newGameState({ name: 'A', species: 'funki', nickname: null });
  applyDuelResult(s, 'ENQ9', { ...T1, kind: 'wild' }, { outcome: 'fled', playerEnergy: 1, flawless: true, answers: [] });
  assert.equal(s.creature.energy, 1);
  assert.equal(s.creature.level, 1);
});

const EMPTY = { beaten: [], boss: false, tiers: {}, history: {}, stats: { wins: 0, right: 0, total: 0, playMs: 0, topics: {}, floor: 0 } };

test('neuer Spielstand hat Version, Einstellungen und leeren Fortschritt', () => {
  const s = newGameState({ name: 'Mia', species: 'nixi', nickname: null });
  assert.equal(s.version, 10);
  assert.equal(s.savedAt, 0);
  assert.deepEqual(s.settings, { textSpeed: 'normal', music: true, sfx: true });
  assert.deepEqual(packProgress(s, 'ENQ9'), EMPTY);
  assert.deepEqual(emptyPackProgress(), EMPTY);
});

test('Duell zählt Siege, Antworten und Trefferquote je Thema', () => {
  const s = newGameState({ name: 'Mia', species: 'nixi', nickname: null });
  const answers = [{ key: 'a', correct: true, trainer: 1 }, { key: 'b', correct: false, trainer: 2 }, { key: 'c', correct: true, trainer: 1 }];
  applyDuelResult(s, 'ENQ9', { kind: 'wild', area: 1 }, { outcome: 'won', playerEnergy: 3, flawless: false, answers });
  applyDuelResult(s, 'ENQ9', { kind: 'wild', area: 1 }, { outcome: 'lost', playerEnergy: 0, flawless: false, answers: [{ key: 'a', correct: false, trainer: 1 }] });
  const st = packProgress(s, 'ENQ9').stats;
  assert.equal(st.wins, 1);
  assert.equal(st.right, 2);
  assert.equal(st.total, 4);
  assert.deepEqual(st.topics, { 1: { right: 2, total: 3 }, 2: { right: 0, total: 1 } });
});

test('Antworten ohne Thema (Zettel) zählen nur in der Summe', () => {
  const s = newGameState({ name: 'Mia', species: 'nixi', nickname: null });
  applyDuelResult(s, 'ENQ9', { kind: 'wild', area: 1 }, { outcome: 'fled', playerEnergy: 3, flawless: true, answers: [{ key: 'z', correct: true, trainer: null }] });
  const st = packProgress(s, 'ENQ9').stats;
  assert.equal(st.total, 1);
  assert.deepEqual(st.topics, {});
});

test('Paket wechseln und zurück: Fortschritt hängt an der Kurzform, das Wesen bleibt', () => {
  const s = newGameState({ name: 'Mia', species: 'nixi', nickname: null });
  const w = { outcome: 'won', playerEnergy: 3, flawless: true, answers: [{ key: 'a', correct: true, trainer: 1 }] };
  applyDuelResult(s, 'ENQ9', { kind: 'trainer', area: 1, trainer: { number: 1 } }, w);
  const level = s.creature.level;
  applyDuelResult(s, 'GNEP', { kind: 'wild', area: 1 }, w);
  assert.deepEqual(packProgress(s, 'GNEP').beaten, []);
  assert.equal(packProgress(s, 'GNEP').stats.wins, 1);
  assert.deepEqual(packProgress(s, 'ENQ9').beaten, [1]);
  assert.equal(packProgress(s, 'ENQ9').stats.wins, 1);
  assert.ok(s.creature.level >= level);
});

test('packProgress ergänzt fehlende Teile eines alten Eintrags', () => {
  const s = newGameState({ name: 'Mia', species: 'nixi', nickname: null });
  s.packs.ENQ9 = { beaten: [1], history: {} };
  assert.deepEqual(packProgress(s, 'ENQ9'), { ...EMPTY, beaten: [1] });
});

test('Fortschritt wird pro Paket angelegt und wiedergefunden', () => {
  const s = newGameState({ name: 'A', species: 'funki', nickname: null });
  packProgress(s, 'ENQ9').beaten.push(1);
  assert.deepEqual(packProgress(s, 'ENQ9').beaten, [1]);
  assert.deepEqual(packProgress(s, 'GNEP').beaten, []);
});

const W = shiny => ({ kind: 'wild', area: 2, foe: { species: 'moosling', stage: 1, level: 5, maxEnergy: 3, shiny }, pool: [] });
const ended = outcome => ({ outcome, playerEnergy: 3, flawless: false, answers: [] });

test('Wildes Wesen: gesehen auch bei Flucht und Niederlage, besiegt nur nach einem Sieg', () => {
  const s = newGameState({ name: 'A', species: 'funki', nickname: null });
  assert.deepEqual(s.book, {});
  applyDuelResult(s, 'ENQ9', W(false), ended('fled'));
  assert.deepEqual(s.book.moosling, { beaten: false, shiny: false });
  applyDuelResult(s, 'ENQ9', W(true), ended('lost'));
  assert.deepEqual(s.book.moosling, { beaten: false, shiny: true });
  applyDuelResult(s, 'ENQ9', W(false), won());
  assert.deepEqual(s.book.moosling, { beaten: true, shiny: true });
});

test('Ein Trainerwesen zählt für seine Art im Buch', () => {
  const s = newGameState({ name: 'A', species: 'funki', nickname: null });
  applyDuelResult(s, 'ENQ9', T1, won());
  assert.deepEqual(s.book, { haeuschel: { beaten: true, shiny: false } });
});

test('Sieg mit Entwicklung: Die Energie aus dem Duell bleibt, das neue Feld ist gefüllt', () => {
  const s = newGameState({ name: 'A', species: 'funki', nickname: null });
  Object.assign(s.creature, { level: 14, xpInLevel: xpToNext(14) - 1 });
  const r = applyDuelResult(s, 'ENQ9', T1, won());
  assert.deepEqual([r.stageBefore, r.stageAfter, s.creature.energy], [1, 2, 3]); // playerEnergy 2 + 1
});

test('Neues Spiel: keine Aufträge, keine Schlüsselgegenstände, keine Funde an geheimen Orten', () => {
  const s = newGameState({ name: 'A', species: 'nixi', nickname: null });
  assert.deepEqual([s.quests, s.keys, s.secrets], [{}, [], {}]);
});
