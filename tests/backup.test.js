import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBackupText, parseBackupText, backupFileName, compareWithDevice } from '../js/save/backup.js';
import { encodeSave } from '../js/save/codec.js';
import { migrateState } from '../js/save/migrate.js';
import { newGameState } from '../js/state.js';
import { makePackText } from './helpers/fixtures.js';

const PACK = makePackText();
const state = { ...newGameState({ name: 'Mia', species: 'nixi', nickname: null }), savedAt: new Date(2026, 10, 3, 9, 10).getTime() };

test('Sicherung enthält Spielstand und Paket und lässt sich zurückholen', () => {
  const text = createBackupText(state, PACK);
  assert.ok(text.startsWith('LUMARA-SICHERUNG 1\n'));
  assert.ok(text.includes('# Spielstand von Mia · Level 1 · gesichert am 03.11.2026, 09:10'));
  assert.ok(!text.includes('Testpaket'));
  assert.deepEqual(parseBackupText(text), { ok: true, state: migrateState(state).state, packText: PACK });
});

test('übersteht Windows-Zeilenenden, BOM und Umbrüche aus E-Mails', () => {
  const lines = createBackupText(state, PACK).split('\n');
  const wrapped = [...lines.slice(0, 3), lines[3].replace(/(.{76})/g, '$1\n')].join('\r\n');
  assert.equal(parseBackupText('﻿' + wrapped + '\r\n').ok, true);
});

test('erkennt falsche Dateien', () => {
  const head = 'LUMARA-SICHERUNG 1\n';
  assert.deepEqual(parseBackupText(PACK), { ok: false, reason: 'pack' });
  assert.deepEqual(parseBackupText('Hallo'), { ok: false, reason: 'unknown' });
  assert.deepEqual(parseBackupText(''), { ok: false, reason: 'unknown' });
  assert.deepEqual(parseBackupText('LUMARA-SICHERUNG 2\nabc'), { ok: false, reason: 'newer' });
  assert.deepEqual(parseBackupText(head + 'kaputt'), { ok: false, reason: 'damaged' });
  assert.deepEqual(parseBackupText(head + encodeSave({ state: { ...state, version: 9 }, pack: PACK })), { ok: false, reason: 'newer' });
  assert.deepEqual(parseBackupText(head + encodeSave({ state: { version: 1 }, pack: PACK })), { ok: false, reason: 'damaged' });
  assert.deepEqual(parseBackupText(head + encodeSave({ state, pack: 42 })), { ok: false, reason: 'damaged' });
});

test('Dateiname', () => {
  const t = new Date(2026, 10, 3).getTime();
  assert.equal(backupFileName('Mia', t), 'Lumara-Mia-2026-11-03.txt');
  assert.equal(backupFileName('Lea Marie', t), 'Lumara-Lea-Marie-2026-11-03.txt');
  assert.equal(backupFileName('Jo/Ann: <3', t), 'Lumara-JoAnn-3-2026-11-03.txt');
  assert.equal(backupFileName('Jürgen', t), 'Lumara-Jürgen-2026-11-03.txt');
  assert.equal(backupFileName('  ', t), 'Lumara-Spielstand-2026-11-03.txt');
});

test('warnt, wenn die Sicherung älter ist als der Stand auf dem Gerät', () => {
  const device = { ...state, savedAt: 2000, creature: { ...state.creature, level: 8 } };
  assert.deepEqual(compareWithDevice(device, { ...state, savedAt: 1000 }), { older: true, device: { level: 8, savedAt: 2000 }, backup: { level: 1, savedAt: 1000 } });
  assert.equal(compareWithDevice(null, state).older, false);
  assert.equal(compareWithDevice({ ...state, savedAt: 1000 }, { ...state, savedAt: 2000 }).older, false);
});
