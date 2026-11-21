// Befreunden nach dem Duell (Lumara 1.2, Spec 6.1): was das Antwort-Panel beim Befreunden zeigt,
// Vertrauensring und Herz in der Arena, und wie die Duellszene den Ablauf einbindet. Den Ablauf
// selbst (Dialoge, Panel) prüft der Browser.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { panelRules } from '../js/ui/duelPanel.js';
import { RING, ringArcs, ringFill, heartPose, heartMs, drawTrustRing, drawHeart } from '../js/gfx/trustRing.js';
import { PALETTE } from '../js/gfx/palette.js';
import { ARENA } from '../js/gfx/arena.js';
import { stubContext } from './helpers/fixtures.js';

const src = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('Panel beim Befreunden: nur Weitblick und „Weiterziehen“, keine Fähigkeiten der Startwesen', () => {
  assert.deepEqual(panelRules('befriend'), { leave: 'moveon', leaveLabel: 'befriend.moveOn', abilities: false, farsight: true });
  assert.deepEqual(panelRules('note'), { leave: 'later', leaveLabel: 'duel.later', abilities: false, farsight: false });
  assert.deepEqual(panelRules('wild'), { leave: 'flee', leaveLabel: 'duel.flee', abilities: true, farsight: true });
  assert.deepEqual(panelRules('trainer'), { leave: 'surrender', leaveLabel: 'duel.surrender', abilities: true, farsight: true });
  assert.equal(panelRules('boss').leave, 'surrender');
});

test('Ring: drei Bögen zu je 120° mit 12° Lücke, der erste beginnt oben', () => {
  const arcs = ringArcs();
  assert.equal(arcs.length, 3);
  assert.deepEqual(arcs.map(a => a.to - a.from), [108, 108, 108]);
  assert.equal(arcs[0].from, -84);
  for (let i = 1; i < 3; i++) assert.equal(arcs[i].from - arcs[i - 1].to, 12);
  assert.equal(arcs[0].from + 360 - arcs[2].to, 12);
  assert.deepEqual([RING.r, RING.width, RING.fillMs], [22, 2, 250]);
});

test('Ring: ein neues Feld füllt sich in 250 ms, bei „Bewegung reduzieren“ sofort', () => {
  const ring = { filled: 1, since: [1000] };
  assert.equal(ringFill(ring, 0, 1000, false), 0);
  assert.equal(ringFill(ring, 0, 1125, false), 0.5);
  assert.equal(ringFill(ring, 0, 1250, false), 1);
  assert.equal(ringFill(ring, 0, 9000, false), 1);
  assert.equal(ringFill(ring, 0, 1000, true), 1);
  assert.equal(ringFill(ring, 1, 9000, false), 0, 'noch leeres Feld');
  assert.equal(ringFill(ring, 1, 9000, true), 0);
});

test('Herz: steigt in 1,2 s 20 px auf und verblasst; bei „Bewegung reduzieren“ steht es 1 s still', () => {
  assert.deepEqual([heartMs(false), heartMs(true)], [1200, 1000]);
  assert.deepEqual(heartPose(0, false), { dy: 0, alpha: 1 });
  assert.equal(heartPose(600, false).dy, -10);
  assert.ok(heartPose(1199, false).dy >= -20 && heartPose(1199, false).alpha < 0.05);
  assert.equal(heartPose(1200, false), null);
  assert.equal(heartPose(-1, false), null);
  for (const ms of [0, 500, 999]) assert.deepEqual(heartPose(ms, true), { dy: 0, alpha: 1 }, `${ms} ms`);
  assert.equal(heartPose(1000, true), null);
});

test('Ring und Herz: nur Farben der Palette, leer #46496e, voll #ffe08a, alles im Bild', () => {
  const hexes = new Set(PALETTE.map(p => p.hex));
  const ctx = stubContext();
  drawTrustRing(ctx, { filled: 2, since: [0, 100] }, ARENA.foe.x, ARENA.foe.y - 16, 225, false);
  drawHeart(ctx, ARENA.foe.x, ARENA.foe.y - 16, 1);
  const colors = ctx.calls.filter(c => c[0] === 'set' && c[1] === 'fillStyle').map(c => c[2]);
  for (const c of colors) assert.ok(hexes.has(c), c);
  assert.ok(colors.includes('#46496e') && colors.includes('#ffe08a'));
  for (const [, x, y, w, h] of ctx.calls.filter(c => c[0] === 'fillRect')) {
    assert.ok(x >= 0 && y >= 0 && x + w <= 240 && y + h <= 160, `${x},${y}`);
    assert.ok(Number.isInteger(x) && Number.isInteger(y), 'ganze Pixel');
  }
});

// Farben der Pixel, die drawTrustRing setzt, in der Reihenfolge der Aufrufe.
function ringColors(ring, t, reducedMotion) {
  const ctx = stubContext();
  drawTrustRing(ctx, ring, ARENA.foe.x, ARENA.foe.y - 16, t, reducedMotion);
  let color = null;
  const out = [];
  for (const c of ctx.calls) {
    if (c[0] === 'set' && c[1] === 'fillStyle') color = c[2];
    if (c[0] === 'fillRect') out.push(color);
  }
  return out;
}

test('Ring: leer ohne einen hellen Pixel, voll ohne einen dunklen', () => {
  for (const rm of [false, true]) {
    const empty = ringColors({ filled: 0, since: [] }, 5000, rm);
    assert.ok(empty.length > 0);
    assert.ok(empty.every(c => c === '#46496e'), `leer, reducedMotion=${rm}`);
    const full = ringColors({ filled: 3, since: [0, 0, 0] }, 5000, rm);
    assert.equal(full.length, empty.length, 'gleich viele Pixel');
    assert.ok(full.every(c => c === '#ffe08a'), `voll, reducedMotion=${rm}`);
  }
  // Ein Feld voll (Leckerli), die anderen beiden ganz dunkel: genau ein Drittel hell.
  const one = ringColors({ filled: 1, since: [0] }, 5000, false);
  assert.equal(one.filter(c => c === '#ffe08a').length * 3, one.length);
  // Ein neues Feld beginnt dunkel, auch ganz am Anfang des Bogens.
  const starting = ringColors({ filled: 1, since: [1000] }, 1000, false);
  assert.ok(starting.every(c => c === '#46496e'));
});

test('Ring bei „Bewegung reduzieren“: gleich, egal wie spät', () => {
  const ring = { filled: 2, since: [0, 100] };
  const early = stubContext();
  const late = stubContext();
  drawTrustRing(early, ring, 184, 39, 101, true);
  drawTrustRing(late, ring, 184, 39, 5000, true);
  assert.deepEqual(late.calls, early.calls);
});

test('Duellszene: Angebot gleich nach dem Ergebnis, Befreunden nach der Beute und vor onEnd', () => {
  const duel = src('js/scenes/duel.js');
  const apply = duel.indexOf('applyDuelResult(game.state');
  const offer = duel.indexOf('befriendOffer(game.state, setup, s.outcome)');
  const loot = duel.indexOf('for (const l of report.loot)');
  const play = duel.indexOf('await playBefriend(game, setup, offer, view)');
  const end = duel.lastIndexOf('onEnd(report)');
  assert.ok(apply > 0 && offer > apply && loot > offer && play > loot && end > play);
  assert.ok(src('sw.js').includes('"js/scenes/befriend.js"'));
});

test('Befreunden: speichert nach jeder Antwort und zählt sie wie einen Zettel', () => {
  const scene = src('js/scenes/befriend.js');
  const loop = scene.slice(scene.indexOf('recordNoteAnswer('));
  assert.ok(loop.indexOf('trustAnswer(') > 0 && loop.indexOf('game.save') > 0 && loop.indexOf('game.save') < loop.indexOf('feedback('));
  assert.ok(!/fang|catch\w*Creature/i.test(scene.replace(/\/\/.*$/gm, '')), 'man befreundet, man fängt nicht');
});

test('Entwickler-Schalter &leckerli=n nur auf dem eigenen Rechner', () => {
  const main = src('js/main.js');
  assert.match(main, /params\.get\('leckerli'\)/);
  assert.match(main, /bag\.treat = /);
  const fn = main.slice(main.indexOf('function devTreats'), main.indexOf('async function devStart'));
  assert.ok(fn.includes('bag.treat'), 'eigene Funktion vor devStart');
});
