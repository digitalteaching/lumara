import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMap, reachable, cellKey, step } from '../js/world/map.js';
import { WIESE } from '../js/world/maps/wiese.js';
import { beaconFront } from '../js/world/network.js';
import { CHARACTERS } from '../js/gfx/art/characters.js';

const NEAR = [[0, 1], [0, -1], [1, 0], [-1, 0]];

test('Wiese: 40 × 30, Gebiet 8, alles Wichtige ist vom Eingang aus erreichbar', () => {
  const m = createMap(WIESE, { openGates: [] });
  const r = reachable(m, WIESE.spawn);
  assert.equal(m.width, 40);
  assert.equal(m.height, 30);
  assert.equal(WIESE.area, 8);
  assert.equal(WIESE.ground, 'nightgrass');
  assert.equal(WIESE.genitive, 'der Sternenwiese');
  const nextTo = (x, y) => NEAR.some(([dx, dy]) => r.has(cellKey(x + dx, y + dy)));
  for (const o of WIESE.objects.filter(o => o.type !== 'building')) assert.ok(nextTo(o.x, o.y), `${o.type} ${o.id ?? o.number}`);
  for (const f of WIESE.finds) assert.ok(r.has(cellKey(f.x, f.y)) && m.isTallGrass(f.x, f.y), `Fundstelle ${f.id}`);
  assert.ok(WIESE.objects.some(o => o.type === 'trainer' && o.number === 8 && o.sprite === 'trainer8' && o.afterWin));
  assert.ok(WIESE.objects.some(o => o.type === 'beacon' && o.number === 8));
  const npcs = WIESE.objects.filter(o => o.type === 'npc');
  assert.deepEqual(npcs.map(n => n.name), ['Selma', 'Kai']);
  for (const n of npcs) assert.ok(n.lines.length && n.linesLit.length, n.id);
  for (const o of [...npcs, ...WIESE.objects.filter(o => o.type === 'trainer')]) assert.ok(CHARACTERS[o.sprite], o.sprite);
  assert.ok(WIESE.objects.filter(o => o.type === 'notestone').length >= 3);
  assert.ok(WIESE.objects.filter(o => o.type === 'bush').length >= 2);
  assert.equal(WIESE.finds.length, 3);
  assert.ok([...r].filter(k => m.isTallGrass(...k.split(',').map(Number))).length >= 12);
  assert.ok(WIESE.objects.some(o => o.type === 'sign' && !o.role));
  const fog = WIESE.objects.find(o => o.type === 'sign' && o.role === 'fogEdge');
  assert.deepEqual([fog.gate, fog.leadsTo, fog.leadsToName], [8, 1, 'die Leuchtturmbucht']);
  assert.deepEqual(fog.lines, ['Ein Pfad führt hinunter zur Bucht, doch der Nebel ist zu dicht.', 'Vielleicht weicht er, wenn der Leuchtstein der Wiese wieder leuchtet.']);
  assert.deepEqual(fog.linesOpen, ['Westen: Leuchtturmbucht', 'Der Nebel hat sich zurückgezogen. Der Pfad führt hinunter zur Bucht.']);
  assert.deepEqual(WIESE.gates, [{ id: 'bucht', leadsTo: 1, afterStone: 8, x: 0, y: 20, w: 2, h: 4, ground: 'nightgrass' }]);
  assert.deepEqual(WIESE.particles, ['fallingstar', 'glimmer']);
});

test('Wiese: Aufwachpunkt vor dem Leuchtstein, Luna blickt über die Wiese, Stein nicht in ihrem Blick', () => {
  const m = createMap(WIESE);
  assert.deepEqual(WIESE.respawn, beaconFront(WIESE, 8));
  assert.ok(m.canEnter(WIESE.spawn.x, WIESE.spawn.y));
  const t = WIESE.objects.find(o => o.type === 'trainer');
  const seen = [];
  let p = { x: t.x, y: t.y };
  for (let i = 0; i < t.sight; i++) {
    p = step(p, t.dir);
    if (!m.canEnter(p.x, p.y)) break;
    seen.push(p);
  }
  assert.ok(seen.length >= 3, 'Luna sieht über die Wiese');
  const b = beaconFront(WIESE, 8);
  assert.ok(!seen.some(c => c.x === b.x && c.y === b.y));
});

test('Wiese: Das Höhlentor steht am Berg, man erreicht es von vorn; mit offenem Tor führt der Pfad nach Westen', () => {
  const m = createMap(WIESE);
  const r = reachable(m, WIESE.spawn);
  const gate = WIESE.objects.find(o => o.id === 'hoehlentor');
  assert.deepEqual([gate.type, gate.w, gate.h, gate.sprite, gate.onDoor], ['building', 3, 3, 'cavegate', 'locked']);
  assert.ok(r.has(cellKey(gate.x + gate.door.dx, gate.y + gate.h)), 'vor dem Tor');
  assert.ok(!r.has(cellKey(0, 21)), 'ohne Stein 8 bleibt der Pfad im Nebel');
  const open = reachable(createMap(WIESE, { openGates: ['bucht'] }), WIESE.spawn);
  assert.ok(open.has(cellKey(0, 21)), 'mit offenem Tor erreicht man den Ausgang');
});

test('Wiese: Spieltexte sind kurz und nennen Morrow nicht', () => {
  for (const o of WIESE.objects) {
    for (const l of [...(o.lines ?? []), ...(o.linesLit ?? []), ...(o.linesOpen ?? []), ...(o.afterWin ? [o.afterWin] : [])]) {
      assert.ok(l.length <= 90, l);
      assert.equal(/morrow/i.test(l), false, l);
    }
  }
});

test('Wiese: Sterntafel und flache Steine liegen im Süden der Wiese, nicht im Sternengras', async () => {
  const { TASKS } = await import('../js/data/tasks.js');
  const m = createMap(WIESE);
  const tablet = WIESE.objects.find(o => o.id === 'task8-clue');
  assert.ok(tablet.y >= 24);
  for (const p of TASKS[8].plates) {
    assert.ok(p.y >= 24, `Stein ${p.x},${p.y} im Süden`);
    assert.equal(m.tileAt(p.x, p.y), 'nightgrass');
  }
});
