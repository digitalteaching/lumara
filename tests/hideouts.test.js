import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGameState } from '../js/state.js';
import { CONFIG } from '../js/config.js';
import { BLOCKED, cellKey, createMap, reachable, trainerSees } from '../js/world/map.js';
import { MAPS } from '../js/world/network.js';
import { GIFTS, makeFriend, setCompanion } from '../js/friends/friends.js';
import { CAVE_SPECIES, HIDDEN_SPECIES } from '../js/data/species.js';
import { AREA_TREASURES } from '../js/items/treasures.js';
import { xpToNext } from '../js/duel/progress.js';
import { GIFT_TILES, HIDEOUTS } from '../js/data/hideouts.js';
import { canOpen, hideoutAt, hideoutKey, hideoutReady, hideoutsOn, nearHideouts, openCreature, openFind, settleFind } from '../js/world/hideouts.js';
import { packProgress } from '../js/state.js';
import { KARTEN_1_1 } from './fixtures/karten-1.1.js';

const AREA_MAPS = ['bucht', 'wald', 'moor', 'duenen', 'klippen', 'ruinen', 'see', 'wiese'];
const OPENING = GIFTS.filter(g => g !== 'sniff');
const NEIGHBOURS = [[0, -1], [1, 0], [0, 1], [-1, 0]];

const s0 = () => newGameState({ name: 'A', species: 'nixi', nickname: null });
const seq = (...v) => {
  let i = 0;
  return { next: () => v[i++ % v.length] };
};
const closed = def => createMap(def);
const open = def => createMap(def, { openGates: (def.gates ?? []).map(g => g.id) });
const inExit = (def, x, y) => (def.exits ?? []).some(e => x >= e.x && x < e.x + e.w && y >= e.y && y < e.y + e.h);
const areaOf = h => MAPS[h.map].area;

test('Versteckwerte aus der Einstellung', () => {
  assert.deepEqual(CONFIG.hideouts, {
    refillMs: 600000,
    xp: 15,
    nearRadius: 3,
    sniffRadius: 6,
    sceneMs: 1500,
    sceneMsReduced: 500,
    rewards: { treasure: 5, treat: 4, berry: 3, starfruit: 1, farsight: 2, shine: 1, rare: 1 },
  });
});

test('40 Verstecke, 5 je Gebiet, Verteilung nach Spec 6.5', () => {
  assert.equal(HIDEOUTS.length, 40);
  assert.equal(new Set(HIDEOUTS.map(h => h.id)).size, 40);
  assert.equal(new Set(HIDEOUTS.map(hideoutKey)).size, 40);
  for (const h of HIDEOUTS) {
    assert.match(h.id, /^[a-z]+-[a-z]+$/);
    assert.ok(['find', 'creature'].includes(h.kind), h.id);
    assert.ok(OPENING.includes(h.gift), h.id); // die Spürnase öffnet nichts
    assert.ok(AREA_MAPS.includes(h.map), h.id); // nicht an geheimen Orten, in der Höhle oder im Garten
    assert.equal(hideoutKey(h), `${h.map}:${h.x},${h.y}`);
    assert.match(hideoutKey(h), /^[a-z]+:\d+,\d+$/); // wie repairWorld es behält
  }
  AREA_MAPS.forEach((mapId, i) => {
    const area = i + 1;
    const own = GIFTS[i];
    assert.equal(MAPS[mapId].area, area);
    const list = hideoutsOn(mapId);
    assert.equal(list.length, 5, mapId);
    assert.deepEqual(list.filter(h => h.kind === 'creature').map(h => h.gift), [own], mapId);
    const finds = list.filter(h => h.kind === 'find');
    assert.equal(finds.length, 4, mapId);
    assert.ok(finds.some(h => h.gift === own), `${mapId}: Fund mit der eigenen Gabe`);
    const foreign = finds.filter(h => h.gift !== own).map(h => GIFTS.indexOf(h.gift) + 1);
    assert.ok(foreign.length >= 2, `${mapId}: Funde mit fremden Gaben`);
    const earlier = foreign.filter(a => a < area).length;
    const later = foreign.filter(a => a > area).length;
    if (area === 1) assert.ok(later >= 2, mapId);
    else if (area === 8) assert.ok(earlier >= 2, mapId);
    else assert.ok(earlier >= 1 && later >= 1, `${mapId}: eine frühere und eine spätere Gabe`);
  });
  for (const gift of OPENING) {
    const areas = new Set(HIDEOUTS.filter(h => h.gift === gift).map(areaOf));
    assert.ok(areas.size >= 2, `${gift} öffnet nur in ${[...areas]}`);
  }
  assert.deepEqual(hideoutsOn('garten'), []);
  assert.deepEqual(hideoutsOn('hoehle1'), []);
});

test('Jedes Versteck liegt auf einem nicht begehbaren Feld, das zu seiner Gabe passt, und kein Objekt steht darauf', () => {
  assert.deepEqual(Object.keys(GIFT_TILES).sort(), [...OPENING].sort());
  const kinds = new Set(AREA_MAPS.flatMap(id => Object.values(MAPS[id].legend)));
  for (const [gift, tiles] of Object.entries(GIFT_TILES)) {
    for (const k of tiles) {
      assert.ok(BLOCKED.has(k) && k !== 'fog', `${gift}: ${k}`);
      assert.ok(kinds.has(k), `${gift}: ${k} gibt es auf keiner Gebietskarte`);
    }
  }
  for (const h of HIDEOUTS) {
    const def = MAPS[h.map];
    for (const map of [closed(def), open(def)]) {
      const kind = map.tileAt(h.x, h.y);
      assert.ok(GIFT_TILES[h.gift].includes(kind), `${h.id}: ${kind} passt nicht zu ${h.gift}`);
      assert.equal(map.canEnter(h.x, h.y), false, h.id);
      assert.equal(map.objectAt(h.x, h.y), null, h.id);
    }
    const at = p => p.x === h.x && p.y === h.y;
    assert.ok(!(def.finds ?? []).some(at), `${h.id}: Fundstelle`);
    assert.ok(!(def.starSpots ?? []).some(at), `${h.id}: Sternschnuppe`);
    assert.ok(!(def.secretStone && at(def.secretStone)), `${h.id}: geheimer Stein`);
    assert.ok(!inExit(def, h.x, h.y), `${h.id}: Ausgang`);
    assert.ok(!KARTEN_1_1[h.map].includes(cellKey(h.x, h.y)), `${h.id}: in 1.1 begehbar`);
    assert.equal(hideoutAt(h.map, h.x, h.y), h);
  }
  assert.equal(hideoutAt('bucht', 19, 24), null); // der Start auf dem Steg
  assert.equal(hideoutAt('garten', 1, 1), null);
});

// Eine Kachelart, die keins der Verstecke nutzt, würde den Test oben schwächen: Ein Versteck könnte
// auf sie rücken, ohne dass es auffällt (etwa Aufwind auf einer Düne).
test('GIFT_TILES nennt je Gabe genau die Kachelarten ihrer Verstecke', () => {
  for (const [gift, tiles] of Object.entries(GIFT_TILES)) {
    const used = new Set(HIDEOUTS.filter(h => h.gift === gift).map(h => closed(MAPS[h.map]).tileAt(h.x, h.y)));
    assert.deepEqual([...tiles].sort(), [...used].sort(), gift);
  }
  assert.ok(!GIFT_TILES.updraft.includes('dune')); // Aufwind: Felsnadeln und Simse über Wolken (Spec 6.4)
});

test('Das Vorfeld jedes Verstecks ist vom Start der Karte erreichbar, auch wenn alle Tore zu sind', () => {
  for (const id of AREA_MAPS) {
    const def = MAPS[id];
    const map = closed(def);
    const seen = reachable(map, def.spawn);
    const trainers = def.objects.filter(o => o.type === 'trainer');
    for (const h of hideoutsOn(id)) {
      const fronts = NEIGHBOURS.map(([dx, dy]) => ({ x: h.x + dx, y: h.y + dy })).filter(p => seen.has(cellKey(p.x, p.y)));
      assert.ok(fronts.length > 0, `${h.id}: kein Vorfeld`);
      for (const p of fronts) {
        assert.equal(map.objectAt(p.x, p.y), null, `${h.id}: Objekt auf ${p.x},${p.y}`);
        assert.equal(inExit(def, p.x, p.y), false, `${h.id}: Vorfeld ${p.x},${p.y} ist ein Ausgang`);
        for (const tr of trainers) assert.equal(trainerSees(map, tr, p), null, `${h.id}: Vorfeld ${p.x},${p.y} im Blick von Trainer ${tr.number}`);
      }
    }
  }
});

test('Öffnen nur mit dem Begleiter der passenden Gabe; Wechsel des Begleiters wirkt sofort', () => {
  const s = s0();
  const beach = hideoutsOn('bucht').find(h => h.gift === 'beachcomb');
  const tree = HIDEOUTS.find(h => h.gift === 'climb');
  assert.equal(canOpen(s, beach), false); // ohne Begleiter
  makeFriend(s, 'gischtling', false); // Gebiet 1: Strandgut
  makeFriend(s, 'moosling', false); // Gebiet 2: Klettern
  makeFriend(s, CAVE_SPECIES[0], false); // Höhle: Spürnase
  assert.ok(setCompanion(s, 'gischtling'));
  assert.equal(canOpen(s, beach), true);
  assert.equal(canOpen(s, tree), false);
  assert.ok(setCompanion(s, 'moosling'));
  assert.equal(canOpen(s, beach), false);
  assert.equal(canOpen(s, tree), true);
  assert.ok(setCompanion(s, CAVE_SPECIES[0]));
  assert.equal(HIDEOUTS.some(h => canOpen(s, h)), false); // die Spürnase öffnet nichts
  s.companion = 'flaschling'; // kein Freund, etwa ein kaputter Spielstand
  assert.equal(canOpen(s, beach), false);
  assert.ok(setCompanion(s, null));
  assert.equal(canOpen(s, beach), false);
});

test('In der Nähe: nur bereite Verstecke dieser Karte, nach Abstand', () => {
  const s = s0();
  s.playMs = 1000;
  const [a, b] = hideoutsOn('bucht');
  assert.deepEqual(nearHideouts(s, 'bucht', a.x, a.y, 0), [a]);
  const far = Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  const both = nearHideouts(s, 'bucht', a.x, a.y, far);
  assert.equal(both[0], a);
  assert.ok(both.includes(b));
  for (let i = 1; i < both.length; i++) {
    const d = h => Math.abs(h.x - a.x) + Math.abs(h.y - a.y);
    assert.ok(d(both[i - 1]) <= d(both[i]));
  }
  assert.deepEqual(nearHideouts(s, 'bucht', a.x, a.y, far - 1).includes(b), false);
  assert.deepEqual(nearHideouts(s, 'wald', a.x, a.y, 0).includes(a), false);
  assert.deepEqual(nearHideouts(s, 'bucht', a.x, a.y, CONFIG.hideouts.nearRadius), nearHideouts(s, 'bucht', a.x, a.y));
  s.world.hideouts[hideoutKey(a)] = 2000; // leer bis 2000
  assert.deepEqual(nearHideouts(s, 'bucht', a.x, a.y, 0), []);
  s.playMs = 2000;
  assert.deepEqual(nearHideouts(s, 'bucht', a.x, a.y, 0), [a]);
});

test('Falsch oder abgebrochen: das Versteck bleibt voll', () => {
  const s = s0();
  s.playMs = 1000;
  const h = hideoutsOn('wald').find(x => x.kind === 'find');
  const before = structuredClone(s);
  const nothing = { xp: 0, item: null, treasure: null, lost: null, evolved: false };
  assert.deepEqual(openFind(s, h, 2, false, seq(0)), nothing);
  assert.deepEqual(s, before);
  assert.equal(hideoutReady(s, h), true);
  // Ein Wesen-Versteck gibt nie einen Fund, auch richtig beantwortet nicht.
  assert.deepEqual(openFind(s, hideoutsOn('wald').find(x => x.kind === 'creature'), 2, true, seq(0)), nothing);
  assert.deepEqual(s, before);
});

test('Richtig: 15 XP, ein Gegenstand, Nachfüllen nach 10 Minuten Spielzeit', () => {
  const h = hideoutsOn('duenen').find(x => x.kind === 'find');
  const key = hideoutKey(h);
  // Tabelle: treasure 5, treat 4, berry 3, starfruit 1, farsight 2, shine 1, rare 1 (zusammen 17)
  const at = n => (n + 0.5) / 17;
  const cases = [
    [at(0), 'treasure', AREA_TREASURES[4].common[0]],
    [at(5), 'treat', null],
    [at(9), 'berry', null],
    [at(12), 'starfruit', null],
    [at(13), 'farsight', null],
    [at(15), 'shine', null],
    [at(16), 'rare', AREA_TREASURES[4].rare],
  ];
  for (const [r, item, treasure] of cases) {
    const s = s0();
    s.playMs = 5000;
    const res = openFind(s, h, 4, true, seq(r, 0));
    assert.deepEqual(res, { xp: 15, item, treasure, lost: null, evolved: false }, item);
    assert.deepEqual([s.creature.level, s.creature.xpInLevel], [2, 0]); // Level 1 braucht genau 15 XP
    if (treasure) {
      assert.equal(s.treasures[treasure], 1);
      assert.ok(s.album.includes(treasure));
    } else {
      assert.equal(s.bag[item], 1, item);
    }
    assert.equal(s.world.hideouts[key], 5000 + 600000);
    assert.equal(hideoutReady(s, h), false);
    // Doppeltipp: Ein leeres Versteck gibt nichts.
    assert.deepEqual(openFind(s, h, 4, true, seq(r, 0)), { xp: 0, item: null, treasure: null, lost: null, evolved: false });
    s.playMs = 604999;
    assert.equal(hideoutReady(s, h), false);
    s.playMs = 605000;
    assert.equal(hideoutReady(s, h), true);
  }
  // Der zweite häufige Schatz
  const s = s0();
  assert.equal(openFind(s, h, 4, true, seq(at(0), 0.99)).treasure, AREA_TREASURES[4].common[1]);
  // Futter voll: Die Beere ist verloren, XP und Nachfüllen gibt es trotzdem.
  const full = s0();
  full.playMs = 100;
  full.bag.berry = CONFIG.bag.foodMax;
  assert.deepEqual(openFind(full, h, 4, true, seq(at(9))), { xp: 15, item: null, treasure: null, lost: 'berry', evolved: false });
  assert.equal(full.bag.berry, CONFIG.bag.foodMax);
  assert.equal(full.world.hideouts[key], 600100);
  // Leckerli haben keine Grenze.
  full.playMs = 600100;
  full.bag.treat = 99;
  assert.equal(openFind(full, h, 4, true, seq(at(5))).item, 'treat');
  assert.equal(full.bag.treat, 100);
  // Mit den 15 XP in die nächste Stufe: evolved
  const grow = s0();
  grow.creature.level = 14;
  grow.creature.xpInLevel = xpToNext(14) - 15;
  assert.equal(openFind(grow, h, 4, true, seq(at(13))).evolved, true);
  assert.equal(grow.creature.level, 15);
});

test('Wesen-Versteck: das neue Wesen des Gebiets, sofort leer bis zum Nachfüllen', () => {
  AREA_MAPS.forEach((mapId, i) => {
    const h = hideoutsOn(mapId).find(x => x.kind === 'creature');
    const s = s0();
    s.playMs = 7000;
    assert.equal(hideoutReady(s, h), true);
    assert.equal(openCreature(s, h), HIDDEN_SPECIES[i]);
    assert.equal(s.world.hideouts[hideoutKey(h)], 607000);
    assert.equal(hideoutReady(s, h), false);
    assert.equal(openCreature(s, h), null); // Doppeltipp: kein zweites Duell
    assert.equal(s.world.hideouts[hideoutKey(h)], 607000);
    s.playMs = 607000;
    assert.equal(hideoutReady(s, h), true);
    assert.equal(s.creature.xpInLevel, 0); // ohne Frage, ohne XP
  });
  const s = s0();
  assert.equal(openCreature(s, hideoutsOn('bucht').find(x => x.kind === 'find')), null);
  assert.deepEqual(s.world.hideouts, {});
});

// Ein Zufall, der mitzählt, wie oft gezogen wird.
const counting = (...v) => {
  const r = seq(...v);
  const c = { calls: 0, next: () => (c.calls++, r.next()) };
  return c;
};

test('Belohnung: genau ein Zug aus der Tabelle, nur ein häufiger Schatz zieht noch einmal (welcher)', () => {
  const h = hideoutsOn('duenen').find(x => x.kind === 'find');
  const total = Object.values(CONFIG.hideouts.rewards).reduce((a, b) => a + b, 0);
  let start = 0;
  for (const [reward, weight] of Object.entries(CONFIG.hideouts.rewards)) {
    const s = s0();
    s.playMs = 100;
    const rng = counting((start + weight / 2) / total, 0);
    const out = openFind(s, h, 4, true, rng);
    assert.equal(out.item, reward);
    assert.equal(rng.calls, reward === 'treasure' ? 2 : 1, reward);
    start += weight;
  }
  // Falsch, leer oder ein Wesen-Versteck: kein Zug.
  const s = s0();
  const none = counting(0);
  openFind(s, h, 4, false, none);
  openFind(s, hideoutsOn('duenen').find(x => x.kind === 'creature'), 4, true, none);
  s.world.hideouts[hideoutKey(h)] = s.playMs + 1;
  openFind(s, h, 4, true, none);
  assert.equal(none.calls, 0);
});

test('settleFind: Die Antwort zählt genau einmal wie ein Zettel, nachgefüllt wird nur bei richtig', () => {
  const h = hideoutsOn('wald').find(x => x.kind === 'find');
  const key = hideoutKey(h);
  const answer = correct => ({ key: 'q1', correct, trainer: 2 });

  // Falsch: gezählt, das Versteck bleibt voll, das Antwortfeld zeigt keine XP.
  const s = s0();
  s.playMs = 1000;
  const wrong = settleFind(s, 'paket', h, answer(false), counting(0));
  const p = packProgress(s, 'paket');
  assert.deepEqual([p.stats.total, p.stats.right, p.stats.topics[2]], [1, 0, { right: 0, total: 1 }]);
  assert.deepEqual(p.history.q1, { n: 1, s: 0, w: true });
  assert.equal(hideoutReady(s, h), true);
  assert.deepEqual(wrong.out, { xp: 0, item: null, treasure: null, lost: null, evolved: false });
  assert.deepEqual(wrong.panel, { xp: 0, item: null, lost: null, story: null, evolved: false });

  // Richtig: noch einmal genau einmal gezählt, 15 XP, Nachfüllen nach 10 Minuten. Den Fund nennt das
  // Antwortfeld nicht (item null), den sagt danach die Welt.
  const right = settleFind(s, 'paket', h, answer(true), counting(0.5 / 17, 0));
  assert.deepEqual([p.stats.total, p.stats.right, p.stats.topics[2]], [2, 1, { right: 1, total: 2 }]);
  assert.deepEqual(p.history.q1, { n: 2, s: 1, w: false });
  assert.equal(s.world.hideouts[key], 1000 + CONFIG.hideouts.refillMs);
  assert.equal(right.out.xp, 15);
  assert.equal(right.out.item, 'treasure');
  assert.deepEqual(right.panel, { xp: 15, item: null, lost: null, story: null, evolved: false });

  // Gleich danach noch einmal richtig (Doppeltipp): gezählt, aber leer, nichts gefunden.
  const again = settleFind(s, 'paket', h, answer(true), counting(0));
  assert.equal(p.stats.total, 3);
  assert.equal(again.out.xp, 0);
  assert.equal(s.world.hideouts[key], 1000 + CONFIG.hideouts.refillMs);
});
