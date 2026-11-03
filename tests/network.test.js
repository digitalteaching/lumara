import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAPS, areaOpen, openGatesFor, exitAt, resolveStart, beaconFront, packWorldKey, npcLines } from '../js/world/network.js';
import { createMap } from '../js/world/map.js';
import { parsePack } from '../js/pack/parser.js';
import { makePackText } from './helpers/fixtures.js';
import { BUCHT } from '../js/world/maps/bucht.js';
import { newGameState } from '../js/state.js';

const pack = n => ({ trainers: Array.from({ length: n }, (_, i) => ({ number: i + 1 })) });
const st = (stones = [], position = { map: 'bucht', x: 19, y: 24, dir: 'up' }) => ({ ...newGameState({ name: 'A', species: 'nixi', nickname: null }), stones, position });

test('Gebiet 2 ist offen, wenn Stein 1 leuchtet und das Paket Trainer 2 hat', () => {
  assert.equal(areaOpen(st([]), pack(2), 2), false);
  assert.equal(areaOpen(st([1]), pack(2), 2), true);
  assert.equal(areaOpen(st([1]), pack(1), 2), false); // Paket ohne Thema 2 (Design 10.4)
  assert.equal(areaOpen(st([1, 2]), pack(8), 3), false); // Gebiet 3 ist noch nicht gebaut
  assert.equal(areaOpen(st([]), pack(1), 1), true);
});

test('Nebeltor der Bucht öffnet sich nur mit offenem Wald', () => {
  assert.deepEqual(openGatesFor(BUCHT, st([1]), pack(2)), ['nord']);
  assert.deepEqual(openGatesFor(BUCHT, st([1]), pack(1)), []);
  const m = createMap(BUCHT, { openGates: ['nord'] });
  const g = BUCHT.gates[0];
  for (let y = g.y; y < g.y + g.h; y++) for (let x = g.x; x < g.x + g.w; x++) assert.notEqual(m.tileAt(x, y), 'fog');
  assert.equal(createMap(BUCHT).tileAt(g.x, g.y), 'fog');
});

test('setTile ändert eine Zelle', () => {
  const m = createMap(BUCHT);
  const g = BUCHT.gates[0];
  m.setTile(g.x, g.y, 'path');
  assert.equal(m.tileAt(g.x, g.y), 'path');
  assert.ok(m.canEnter(g.x, g.y));
});

test('Ausgänge führen auf begehbare Felder und zurück', () => {
  for (const def of Object.values(MAPS)) {
    for (const e of def.exits) {
      const target = MAPS[e.to];
      assert.ok(target, e.to);
      const open = createMap(target, { openGates: target.gates.map(g => g.id) });
      assert.ok(open.canEnter(e.at.x, e.at.y), `${def.id} → ${e.to}`);
      assert.equal(exitAt(target, e.at.x, e.at.y), null, `Ankunft auf einem Ausgang: ${e.to}`);
      assert.ok(target.exits.some(back => back.to === def.id), `kein Rückweg von ${e.to}`);
      assert.equal(exitAt(def, e.x, e.y), e);
    }
  }
});

test('Startposition: im Nebel liegendes Gebiet → höchster offener Leuchtstein, sonst Leuchtturm', () => {
  const inWald = { map: 'wald', x: 19, y: 27, dir: 'up' };
  assert.deepEqual(resolveStart(st([1], inWald), pack(2)), inWald);
  assert.deepEqual(resolveStart(st([1], inWald), pack(1)), { map: 'bucht', ...beaconFront(BUCHT, 1) });
  assert.deepEqual(resolveStart(st([], inWald), pack(1)), { map: 'bucht', ...BUCHT.respawn });
  assert.deepEqual(resolveStart(st([], { map: 'mond', x: 1, y: 1, dir: 'up' }), pack(1)), { map: 'bucht', ...BUCHT.respawn });
});

test('Startposition auf einem Nebeltor, das wieder zu ist: nicht im Nebel feststecken', () => {
  const onGate = { map: 'bucht', x: 19, y: 1, dir: 'down' };
  assert.deepEqual(resolveStart(st([1], onGate), pack(2)), onGate);
  assert.deepEqual(resolveStart(st([1], onGate), pack(1)), { map: 'bucht', ...beaconFront(BUCHT, 1) });
});

test('neue Fassung desselben Pakets (gleiche KENNUNG) mit einem Thema mehr: Die Welt wird neu gebaut', () => {
  const one = parsePack(makePackText({ trainers: 1 })).pack;
  const two = parsePack(makePackText({ trainers: 2 })).pack;
  assert.equal(one.shortId, two.shortId); // dieselbe KENNUNG, dieselbe Kurzform
  assert.notEqual(packWorldKey(one), packWorldKey(two));
  assert.equal(packWorldKey(two), packWorldKey(parsePack(makePackText({ trainers: 2 })).pack));
});

test('Bewohner: Sätze zum offenen Weg erst, wenn das nächste Gebiet wirklich offen ist', () => {
  const o = { lines: ['a'], linesLit: ['lit'], linesOpen: ['offen'] };
  assert.deepEqual(npcLines(o, st([]), 1, pack(2)), ['a']);
  assert.deepEqual(npcLines(o, st([1]), 1, pack(1)), ['lit']); // Stein leuchtet, Wald liegt im Nebel
  assert.deepEqual(npcLines(o, st([1]), 1, pack(2)), ['offen']);
  assert.deepEqual(npcLines({ lines: ['a'], linesLit: ['lit'] }, st([1]), 1, pack(2)), ['lit']);
});
