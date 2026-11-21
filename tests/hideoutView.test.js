// Was die Welt an Verstecken zeigt und was A dort tut (js/scenes/hideoutEvents.js), als reine Regeln
// aus js/world/hideouts.js.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FRIENDABLE, companionGift, giftOf, makeFriend } from '../js/friends/friends.js';
import { HIDEOUTS } from '../js/data/hideouts.js';
import { companionAlert, hideoutAction, hideoutKey, hideoutShown, sniffedHideouts } from '../js/world/hideouts.js';
import { CONFIG } from '../js/config.js';
import { SCENE, alertSpot, foundLine, scenePose } from '../js/scenes/hideoutEvents.js';
import { companionLine } from '../js/scenes/companion.js';
import { treasureName } from '../js/items/treasures.js';
import { setLanguage, t } from '../js/i18n/i18n.js';

const friendWith = gift => FRIENDABLE.find(id => giftOf(id) === gift);
const byId = id => HIDEOUTS.find(h => h.id === id);
const R = CONFIG.hideouts.nearRadius;

function state(gift = null) {
  const s = { friends: {}, companion: null, playMs: 1000, world: { hideouts: {} } };
  if (gift) {
    const id = friendWith(gift);
    makeFriend(s, id, false);
    s.companion = id;
  }
  return s;
}
const empty = (s, h) => {
  s.world.hideouts[hideoutKey(h)] = s.playMs + 1;
};

test('Begleiter mit Gabe: nur ein Freund zählt', () => {
  assert.equal(companionGift(state()), null);
  assert.equal(companionGift(state('dive')), 'dive');
  const s = state('dive');
  s.companion = FRIENDABLE.find(id => !s.friends[id]); // kein Freund, etwa ein alter Spielstand
  assert.equal(companionGift(s), null);
});

test('A vor einem Versteck: leer, Hinweis oder öffnen, je nach Begleiter in diesem Moment', () => {
  const h = byId('see-icehole'); // Tauchen
  const s = state('dive');
  assert.equal(hideoutAction(s, h), 'open');
  empty(s, h);
  assert.equal(hideoutAction(s, h), 'empty', 'leer zählt vor dem Begleiter');
  s.playMs += 1;
  assert.equal(hideoutAction(s, h), 'open');
  // Begleiter im Menü gewechselt: Die Regel richtet sich sofort nach dem neuen.
  const climber = friendWith('climb');
  makeFriend(s, climber, false);
  s.companion = climber;
  assert.equal(hideoutAction(s, h), 'hint');
  s.companion = null;
  assert.equal(hideoutAction(s, h), 'hint');
  assert.equal(hideoutAction(state('sniff'), h), 'hint', 'die Spürnase öffnet nichts');
});

test('Bereite Verstecke sieht man, leere nicht', () => {
  const h = byId('ruinen-crate');
  const s = state();
  assert.equal(hideoutShown(s, h, { x: 0, y: 0 }), true);
  empty(s, h);
  assert.equal(hideoutShown(s, h, { x: 0, y: 0 }), false);
});

test('Sternenspur-Verstecke sieht man nur mit einem Sternenspur-Begleiter in nearRadius', () => {
  const h = byId('wiese-boulder'); // Sternenspur bei (14,11)
  const near = { x: h.x + R, y: h.y };
  const far = { x: h.x + R + 1, y: h.y };
  assert.equal(hideoutShown(state(), h, near), false, 'ohne Begleiter');
  assert.equal(hideoutShown(state('updraft'), h, near), false, 'mit anderer Gabe');
  assert.equal(hideoutShown(state('sniff'), h, near), false, 'mit der Spürnase (sie zeigt das Zeichen)');
  const s = state('startrail');
  assert.equal(hideoutShown(s, h, near), true);
  assert.equal(hideoutShown(s, h, far), false);
  empty(s, h);
  assert.equal(hideoutShown(s, h, near), false, 'leer');
});

// Der Begleiter steht ein Feld hinter der Figur: Bleibt sie genau nearRadius Felder vor der Spur
// stehen, ist er oft nearRadius + 1 entfernt. „!“ und sein Satz messen von der Figur aus, also muss
// die Spur dann auch leuchten.
test('Sternenspur: Figur 3 Felder entfernt, Begleiter 4: Die Spur leuchtet, wie „!“ und Satz sagen', () => {
  setLanguage('de');
  const h = byId('wiese-boulder'); // (14,11)
  const s = state('startrail');
  const player = { x: h.x + R, y: h.y };
  const companion = { x: h.x + R + 1, y: h.y };
  assert.equal(companionAlert(s, 'wiese', player.x, player.y), true);
  assert.equal(companionLine(s, 'wiese', player.x, player.y, 0), t('companion.near.startrail'));
  assert.equal(hideoutShown(s, h, companion, player), true);
  assert.equal(hideoutShown(s, h, companion), false, 'vom Begleiter allein zu weit');
  assert.equal(hideoutShown(s, h, companion, { x: h.x + R + 2, y: h.y }), false, 'beide zu weit');
  assert.equal(hideoutShown(state('updraft'), h, companion, player), false, 'nur mit Sternenspur');
});

test('„!“ über dem Begleiter: ein bereites Versteck seiner Gabe höchstens nearRadius von der Figur', () => {
  const h = byId('bucht-bottle'); // Strandgut bei (6,23)
  const s = state('beachcomb');
  assert.equal(companionAlert(s, 'bucht', h.x + R, h.y), true);
  assert.equal(companionAlert(s, 'bucht', h.x + R + 1, h.y), false);
  assert.equal(companionAlert(s, 'wald', h.x, h.y), false, 'andere Karte');
  assert.equal(companionAlert(state('dive'), 'bucht', h.x, h.y + 1), false, 'andere Gabe');
  assert.equal(companionAlert(state('sniff'), 'bucht', h.x, h.y + 1), false, 'die Spürnase öffnet nichts');
  assert.equal(companionAlert(state(), 'bucht', h.x, h.y + 1), false, 'ohne Begleiter');
  empty(s, h);
  assert.equal(companionAlert(s, 'bucht', h.x, h.y + 1), false, 'leer');
});

test('Spürnase: jedes bereite Versteck in sniffRadius, auch Sternenspur, die nächsten zuerst', () => {
  const S = CONFIG.hideouts.sniffRadius;
  const h = byId('wiese-boulder'); // (14,11)
  const s = state('sniff');
  const found = sniffedHideouts(s, 'wiese', h.x, h.y + 1);
  assert.equal(found[0], h);
  for (const x of found) assert.ok(Math.abs(x.x - h.x) + Math.abs(x.y - h.y - 1) <= S, x.id);
  assert.ok(sniffedHideouts(s, 'wiese', h.x + S, h.y).includes(h), 'genau sniffRadius');
  assert.ok(!sniffedHideouts(s, 'wiese', h.x + S + 1, h.y).includes(h), 'zu weit');
  assert.deepEqual(sniffedHideouts(state('startrail'), 'wiese', h.x, h.y + 1), [], 'nur mit der Spürnase');
  empty(s, h);
  assert.ok(!sniffedHideouts(s, 'wiese', h.x, h.y + 1).includes(h), 'leer');
});

// ---------- Szene und Fundzeile (js/scenes/hideoutEvents.js) ----------

test('Szene: der Begleiter läuft hin, bleibt beim Versteck und kommt zurück', () => {
  const from = { x: 64, y: 80 }, to = { x: 96, y: 76 };
  assert.deepEqual(scenePose(from, to, 0), { x: 64, y: 80, walking: true, side: 'right' });
  assert.deepEqual(scenePose(from, to, SCENE.go), { x: 96, y: 76, walking: false, side: 'right' });
  assert.deepEqual(scenePose(from, to, 0.6), { x: 96, y: 76, walking: false, side: 'right' });
  const back = scenePose(from, to, (SCENE.back + 1) / 2);
  assert.deepEqual([back.x, back.y, back.walking, back.side], [80, 78, true, 'left']);
  assert.deepEqual(scenePose(from, to, 1), { x: 64, y: 80, walking: true, side: 'left' });
  // Gerade nach oben: Er behält seine Seite (side fehlt).
  assert.equal(scenePose({ x: 64, y: 80 }, { x: 64, y: 52 }, 0.2).side, undefined);
});

test('Fundzeile: für jeden Gegenstand der Tabelle ein eigener Satz, auch bei vollem Rucksack', () => {
  setLanguage('de');
  const lines = new Set();
  for (const item of Object.keys(CONFIG.hideouts.rewards)) {
    const out = item === 'treasure' || item === 'rare' ? { item, treasure: 'glassshell', lost: null } : { item, treasure: null, lost: null };
    const line = foundLine(out);
    assert.ok(line && !line.includes('{') && !line.includes('undefined'), `${item}: ${line}`);
    lines.add(line);
  }
  assert.equal(lines.size, Object.keys(CONFIG.hideouts.rewards).length - 1, 'Schatz und seltener Schatz sagen beide ihren Namen');
  assert.equal(foundLine({ item: 'treat', treasure: null, lost: null }), t('hideout.foundTreat'));
  assert.equal(foundLine({ item: 'berry', treasure: null, lost: null }), t('hideout.found', { item: t('item.aBerry') }));
  assert.equal(foundLine({ item: null, treasure: null, lost: 'starfruit' }), t('hideout.foundFull', { item: t('item.aStarfruit') }));
  assert.equal(foundLine({ item: 'rare', treasure: 'glassshell', lost: null }), t('hideout.foundTreasure', { name: treasureName('glassshell') }));
});

test('„!“ steht über dem Begleiter oder seitlich neben ihm, nie auf der Figur', () => {
  const p = { x: 160, y: 160 };
  assert.deepEqual(alertSpot({ x: 160, y: 144 }, p), { x: 165, y: 132 }, 'über ihr: oben drüber');
  assert.deepEqual(alertSpot({ x: 144, y: 160 }, p), { x: 149, y: 148 }, 'links: oben drüber');
  assert.deepEqual(alertSpot({ x: 176, y: 160 }, p), { x: 181, y: 148 }, 'rechts: oben drüber');
  assert.deepEqual(alertSpot({ x: 160, y: 176 }, p), { x: 176, y: 168 }, 'direkt dahinter: rechts daneben');
  assert.ok(alertSpot({ x: 152, y: 168 }, p).x <= p.x - 6, 'halb links dahinter: links daneben');
  // Die Figur belegt x … x+15 und y-2 … y+13, das „!“ 6 × 10 Pixel. Alle Lagen, auch mitten im Schritt.
  for (let dx = -16; dx <= 16; dx += 2) {
    for (let dy = -16; dy <= 16; dy += 2) {
      const b = alertSpot({ x: p.x + dx, y: p.y + dy }, p);
      const overlap = b.x < p.x + 16 && b.x + 6 > p.x && b.y < p.y + 14 && b.y + 10 > p.y - 2;
      assert.ok(!overlap, `Begleiter bei ${dx},${dy}: „!“ bei ${b.x},${b.y}`);
    }
  }
});
