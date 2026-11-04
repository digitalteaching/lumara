import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EICHE } from '../js/world/maps/eiche.js';
import { WALD } from '../js/world/maps/wald.js';
import { MAPS, resolveStart } from '../js/world/network.js';
import { createMap, reachable, cellKey } from '../js/world/map.js';
import { CREATURE_ART } from '../js/gfx/art/creatures.js';
import { SPECIES } from '../js/data/species.js';
import { BOOK_SLOTS } from '../js/data/book.js';
import { newGameState } from '../js/state.js';

test('Hohle Eiche: dunkler Gang, alles vom Eingang erreichbar, Ausgang zurück vor die Eiche', () => {
  assert.equal(MAPS.eiche, EICHE);
  assert.deepEqual([EICHE.area, EICHE.dark, EICHE.secret], [2, true, 'eiche']);
  const map = createMap(EICHE);
  const seen = reachable(map, EICHE.spawn);
  const nextTo = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has(cellKey(x + dx, y + dy)));
  const stone = EICHE.objects.find(o => o.type === 'storystone');
  assert.ok(stone && nextTo(stone.x, stone.y), 'Geschichtsstein erreichbar');
  assert.ok(seen.has(cellKey(EICHE.secretStone.x, EICHE.secretStone.y)) || nextTo(EICHE.secretStone.x, EICHE.secretStone.y), 'Stein erreichbar');
  assert.ok([...seen].some(k => { const [x, y] = k.split(',').map(Number); return map.isTallGrass(x, y); }), 'Wurzelmoos erreichbar');
  const exit = EICHE.exits[0];
  assert.ok(seen.has(cellKey(exit.x, exit.y)));
  assert.deepEqual([exit.to, exit.at.x, exit.at.y], ['wald', 5, 13]);
  assert.deepEqual(EICHE.wild, { common: ['wurzelgeist'], rare: 'wurzelgeist' });
});

test('Im Flüsterwald führt die hohle Eiche mit der Laterne in den Gang', () => {
  const oak = WALD.objects.find(o => o.type === 'secret');
  assert.deepEqual([oak.place, oak.x, oak.y, oak.prop], ['eiche', 5, 12, 'hollowoak']);
  assert.ok(createMap(WALD).canEnter(5, 13), 'man steht unter der Eiche');
  assert.deepEqual([oak.to.map, oak.to.x, oak.to.y], ['eiche', EICHE.spawn.x, EICHE.spawn.y]);
  assert.ok(oak.lines?.length && oak.linesOpen?.length);
});

test('Wurzelgeist: eigene Art für den Buchplatz 25, Bild 32 × 32 mit eigener Silhouette', () => {
  assert.equal(BOOK_SLOTS[24], 'wurzelgeist');
  assert.deepEqual([SPECIES.wurzelgeist.kind, SPECIES.wurzelgeist.area], ['secret', 2]);
  const rows = CREATURE_ART.wurzelgeist[1];
  assert.equal(rows.length, 32);
  const shape = r => r.map(x => x.replace(/[^.]/g, '#')).join('/');
  for (const [id, stages] of Object.entries(CREATURE_ART)) if (id !== 'wurzelgeist') assert.notEqual(shape(stages[1]), shape(rows), id);
});

test('Wer in der Eiche steht und ein Paket mit nur Trainer 1 lädt, landet am Leuchtturm', () => {
  const s = { ...newGameState({ name: 'A', species: 'nixi', nickname: null }), stones: [1], position: { map: 'eiche', ...EICHE.spawn } };
  const pack = { trainers: [{ number: 1 }] };
  assert.equal(resolveStart(s, pack).map, 'bucht');
  const pack2 = { trainers: [{ number: 1 }, { number: 2 }] };
  assert.deepEqual(resolveStart(s, pack2), s.position);
});
