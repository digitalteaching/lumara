import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMap, reachable, cellKey, step } from '../js/world/map.js';
import { BUCHT } from '../js/world/maps/bucht.js';
import { HIDEOUTS } from '../js/data/hideouts.js';

test('Bucht: 40 × 30, fehlerfrei, Start und Aufwachpunkt begehbar', () => {
  const m = createMap(BUCHT);
  assert.equal(m.width, 40);
  assert.equal(m.height, 30);
  assert.ok(m.canEnter(BUCHT.spawn.x, BUCHT.spawn.y));
  assert.ok(m.canEnter(BUCHT.respawn.x, BUCHT.respawn.y));
});

test('vom Start erreichbar: Ilvy, Trainerin, jedes Schild, jeder Bewohner, Leuchtturmtür, mindestens 12 Grasfelder', () => {
  const m = createMap(BUCHT), r = reachable(m, BUCHT.spawn);
  const nextTo = (x, y) => [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => r.has(cellKey(x + dx, y + dy)));
  for (const o of BUCHT.objects.filter(o => o.type !== 'building')) assert.ok(nextTo(o.x, o.y), `${o.type} ${o.id ?? o.number}`);
  const lh = BUCHT.objects.find(o => o.id === 'leuchtturm');
  assert.equal(lh.onDoor, 'heal');
  assert.ok(nextTo(lh.x + lh.door.dx, lh.y + lh.door.dy));
  assert.ok([...r].filter(k => m.isTallGrass(...k.split(',').map(Number))).length >= 12);
  assert.ok(BUCHT.objects.some(o => o.type === 'npc' && o.id === 'ilvy'));
  assert.ok(BUCHT.objects.some(o => o.type === 'trainer' && o.number === 1));
});

test('Nebel schließt den Weg nach Norden, davor steht ein Schild', () => {
  const m = createMap(BUCHT), r = reachable(m, BUCHT.spawn);
  const fog = [];
  for (let y = 0; y < 3; y++) for (let x = 0; x < 40; x++) if (m.tileAt(x, y) === 'fog') fog.push([x, y]);
  assert.ok(fog.length >= 3);
  assert.ok(BUCHT.objects.some(o => o.type === 'sign' && r.has(cellKey(o.x, o.y + 1)) && m.tileAt(o.x, o.y - 1) === 'fog'));
});

test('Bucht: Leuchtstein 1, Nebeltor nach Norden, Ausgang in den Wald, Strauch, Zettelsteine und Fundstellen', () => {
  const m = createMap(BUCHT, { openGates: ['nord'] });
  const r = reachable(m, BUCHT.spawn);
  const nextTo = (x, y) => [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => r.has(cellKey(x + dx, y + dy)));
  assert.ok(BUCHT.objects.some(o => o.type === 'beacon' && o.number === 1));
  assert.deepEqual(BUCHT.gates.map(g => [g.id, g.leadsTo]), [['nord', 2], ['ost', 8]]);
  assert.ok(BUCHT.exits.some(e => e.to === 'wald' && r.has(cellKey(e.x, e.y))));
  assert.ok(BUCHT.objects.some(o => o.type === 'bush'));
  assert.ok(BUCHT.objects.filter(o => o.type === 'notestone').length >= 3);
  assert.ok(BUCHT.finds.length >= 2);
  for (const o of BUCHT.objects.filter(o => ['beacon', 'bush', 'notestone'].includes(o.type))) assert.ok(nextTo(o.x, o.y), `${o.type} ${o.id ?? o.number}`);
  for (const f of BUCHT.finds) assert.ok(r.has(cellKey(f.x, f.y)) && m.isTallGrass(f.x, f.y), `Fundstelle ${f.id}`);
  const t = BUCHT.objects.find(o => o.type === 'trainer');
  const b = BUCHT.objects.find(o => o.type === 'beacon');
  let p = { x: t.x, y: t.y };
  for (let i = 0; i < t.sight; i++) {
    p = step(p, t.dir);
    assert.ok(!(p.x === b.x && p.y === b.y + 1), 'Leuchtstein im Blickfeld der Trainerin');
  }
});

test('Trainerin 1 blickt über mindestens 2 begehbare Felder', () => {
  const m = createMap(BUCHT), t = BUCHT.objects.find(o => o.type === 'trainer');
  let p = { x: t.x, y: t.y }, n = 0;
  for (let i = 0; i < t.sight; i++) {
    p = step(p, t.dir);
    if (m.canEnter(p.x, p.y)) n++;
    else break;
  }
  assert.ok(n >= 2);
});

test('Bucht: Spielaufgabe – die Möwenmutter brütet am Steg, drei Küken stecken im Dorf und am Strand', () => {
  const m = createMap(BUCHT), r = reachable(m, BUCHT.spawn);
  const parts = BUCHT.objects.filter(o => o.type === 'task' && o.task === 1);
  const mother = parts.find(o => o.role === 'giver');
  assert.equal(m.tileAt(mother.x, mother.y), 'water');
  assert.ok([[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => m.tileAt(mother.x + dx, mother.y + dy) === 'pier'), 'am Steg');
  const chicks = parts.filter(o => o.role === 'item');
  assert.deepEqual(chicks.map(o => o.prop).sort(), ['chickboat', 'chickbush', 'chickcrate']);
  for (const o of chicks) assert.ok([[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => r.has(cellKey(o.x + dx, o.y + dy))), o.id);
});

// Lumara 1.3: Der Aushang steht wie das Gartentor auf einem Feld, das man nie betreten konnte (dort
// war ein Zaunstück, die Kartenzeile hat jetzt Boden darunter). Man liest ihn von vorn (unten).
test('Bucht: Der Aushang steht höchstens 4 Felder vom Leuchtturm, sein Vorfeld ist erreichbar', () => {
  const m = createMap(BUCHT), r = reachable(m, BUCHT.spawn);
  const boards = BUCHT.objects.filter(o => o.type === 'board');
  assert.equal(boards.length, 1);
  const b = boards[0];
  assert.equal(b.id, 'aushang');
  assert.equal(m.tileAt(b.x, b.y), 'grass', 'Boden unter der Tafel');
  assert.equal(m.objectAt(b.x, b.y), b, 'kein anderes Objekt auf dem Feld');
  assert.ok(!m.canEnter(b.x, b.y));
  assert.ok(r.has(cellKey(b.x, b.y + 1)), 'Vorfeld unter der Tafel');
  const lh = BUCHT.objects.find(o => o.id === 'leuchtturm');
  const dx = Math.max(lh.x - b.x, 0, b.x - (lh.x + lh.w - 1));
  const dy = Math.max(lh.y - b.y, 0, b.y - (lh.y + lh.h - 1));
  assert.ok(dx + dy <= 4, `Abstand ${dx + dy}`);
  // Sie verstellt keinem anderen Objekt das letzte Vorfeld.
  const m0 = createMap({ ...BUCHT, objects: BUCHT.objects.filter(o => o !== b) });
  const r0 = reachable(m0, BUCHT.spawn);
  const fronts = (o, rr) => [[0, 1], [0, -1], [1, 0], [-1, 0]].filter(([ddx, ddy]) => rr.has(cellKey(o.x + ddx, o.y + ddy))).length;
  for (const o of BUCHT.objects.filter(o => o !== b && o.type !== 'building')) assert.equal(fronts(o, r), fronts(o, r0), `${o.type} ${o.id ?? o.number}`);
  for (const h of HIDEOUTS.filter(h => h.map === 'bucht')) {
    assert.ok(h.x !== b.x || h.y !== b.y, h.id);
    assert.equal(fronts(h, r), fronts(h, r0), h.id);
  }
});
