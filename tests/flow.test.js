import { test } from 'node:test';
import assert from 'node:assert/strict';
import { routeAfterTitle, makeSaver, reloadGame } from '../js/app/flow.js';
import { createSaveStore } from '../js/save/store.js';
import { createPackStore } from '../js/pack/store.js';
import { newGameState } from '../js/state.js';
import { fakeStorage } from './helpers/fixtures.js';

test('Weg nach dem Titel', () => {
  assert.equal(routeAfterTitle({ status: 'ok', storedPackOk: true }), 'world');
  assert.equal(routeAfterTitle({ status: 'ok', storedPackOk: false }), 'pack-world');
  assert.equal(routeAfterTitle({ status: 'backup', storedPackOk: true }), 'recover');
  assert.equal(routeAfterTitle({ status: 'damaged', storedPackOk: true }), 'recover');
  assert.equal(routeAfterTitle({ status: 'newer', storedPackOk: true }), 'newer');
  assert.equal(routeAfterTitle({ status: 'none', storedPackOk: false }), 'new-game');
});

test('makeSaver speichert nur im normalen Spiel', () => {
  const game = { saveEnabled: false, state: newGameState({ name: 'Mia', species: 'nixi', nickname: null }), store: createSaveStore(fakeStorage()) };
  const save = makeSaver(game);
  assert.equal(save(), null);
  game.saveEnabled = true;
  assert.equal(save(), true);
  game.state = null;
  assert.equal(save(), null);
});

test('Neues Spiel: Stand gelöscht, und das Speichern beim Schließen bringt ihn nicht zurück', () => {
  const game = { saveEnabled: true, state: newGameState({ name: 'Mia', species: 'nixi', nickname: null }), store: createSaveStore(fakeStorage()) };
  game.save = makeSaver(game);
  game.save();
  let reloaded = false;
  reloadGame(game, {}, { reload: () => { reloaded = true; } });
  assert.equal(game.save(), null);
  assert.deepEqual(game.store.load(), { status: 'none' });
  assert.ok(reloaded);
});

test('Sicherung laden: Stand und Paket gespeichert, das Speichern beim Schließen überschreibt nichts', () => {
  const mem = fakeStorage();
  const game = { saveEnabled: true, state: newGameState({ name: 'Alt', species: 'funki', nickname: null }), store: createSaveStore(mem), packStore: createPackStore(mem) };
  game.save = makeSaver(game);
  const restored = newGameState({ name: 'Mia', species: 'nixi', nickname: null });
  reloadGame(game, { state: restored, packText: 'PAKET: X' }, { reload: () => {} });
  assert.equal(game.save(), null);
  assert.equal(game.store.load().state.name, 'Mia');
  assert.equal(game.packStore.load(), 'PAKET: X');
});

test('makeSaver meldet nur das erste erfolgreiche Speichern', () => {
  let first = 0;
  const game = { saveEnabled: true, state: newGameState({ name: 'Mia', species: 'nixi', nickname: null }), store: createSaveStore(fakeStorage()) };
  const save = makeSaver(game, { onFirstSave: () => first++ });
  save();
  save();
  assert.equal(first, 1);
});
