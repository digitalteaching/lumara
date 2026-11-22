import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFreshGuard, guardClicks } from '../js/ui/freshGuard.js';

test('Prüffokus Doppeltipp: frisch erschienene Knöpfe nehmen 350 ms lang nichts an', () => {
  let now = 1000;
  const guard = createFreshGuard(350, () => now);
  assert.equal(guard.isFresh(), true);
  now = 1349;
  assert.equal(guard.isFresh(), true);
  now = 1350;
  assert.equal(guard.isFresh(), false);
  guard.reset();
  assert.equal(guard.isFresh(), true);
});

// Gefunden bei den Reel-Aufnahmen (04.11.2026): Der Tipp, der Ilvys letzten Satz schließt, landete auf
// „Next“ im gerade erschienenen Namensfeld. Das leere Formular wurde abgeschickt, und das Kind sah
// „Bitte gib einen Namen ein“, bevor es tippen konnte. Das Namensfeld braucht denselben Schutz wie
// Eier, Paket-Bildschirm und Installationshinweis.
test('Das Namensfeld nimmt frisch erschienen keinen Tipp an (Doppeltipp-Schutz)', async () => {
  const { readFileSync } = await import('node:fs');
  const src = readFileSync(new URL('../js/scenes/name.js', import.meta.url), 'utf8');
  assert.match(src, /import\s*\{[^}]*createFreshGuard[^}]*guardClicks[^}]*\}\s*from\s*'\.\.\/ui\/freshGuard\.js'/);
  assert.match(src, /guardClicks\(\s*form\s*,\s*createFreshGuard\(\)\s*\)/);
});

// Ein Knoten, der nur Capture-Zuhörer kennt (mehr braucht guardClicks nicht).
function guardedNode() {
  const on = {};
  const node = {
    addEventListener: (type, fn, capture) => (assert.equal(capture, true), (on[type] ??= new Set()).add(fn)),
    removeEventListener: (type, fn) => on[type]?.delete(fn),
    fire(type, detail = 1) {
      const e = { detail, blocked: false, preventDefault() {}, stopPropagation() { this.blocked = true; } };
      for (const fn of on[type] ?? []) fn(e);
      return e;
    },
    count: () => Object.values(on).reduce((n, s) => n + s.size, 0),
  };
  return node;
}

test('guardClicks wie bisher: in der Schutzzeit blockiert, danach zählt jeder Klick', () => {
  let now = 0;
  const node = guardedNode();
  guardClicks(node, createFreshGuard(350, () => now));
  assert.equal(node.fire('click').blocked, true);
  now = 400;
  assert.equal(node.fire('click').blocked, false, 'auch ohne pointerdown auf dem Knoten');
});

test('guardClicks mit ownPress: Ein Klick zählt nur, wenn sein Finger nach dem Erscheinen auf dem Knoten aufsetzte', () => {
  let now = 0;
  const node = guardedNode();
  const off = guardClicks(node, createFreshGuard(650, () => now), { ownPress: true });
  now = 900;
  assert.equal(node.fire('click').blocked, true, 'der Finger lag schon vorher: blockiert');
  assert.equal(node.fire('click', 0).blocked, false, 'Tastatur (detail 0) gilt');
  node.fire('pointerdown');
  assert.equal(node.fire('click').blocked, false, 'ein neuer Tipp gilt');
  off();
  assert.equal(node.count(), 0, 'alle Zuhörer gehen wieder weg');
});
