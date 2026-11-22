import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { createFreshGuard, guardClicks, trackPointers, pointerHeld } from '../js/ui/freshGuard.js';

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

test('guardClicks mit heldAtShow: Der Klick des Fingers, der beim Erscheinen lag, zählt nie; ein neuer Tipp schon', () => {
  let now = 0;
  const node = guardedNode();
  const off = guardClicks(node, createFreshGuard(650, () => now), { heldAtShow: true });
  now = 900;
  assert.equal(node.fire('click').blocked, true, 'der Finger lag schon vorher: blockiert, auch nach der Schutzzeit');
  node.fire('pointerdown');
  assert.equal(node.fire('click').blocked, false, 'ein neuer Tipp gilt');
  off();
  assert.equal(node.count(), 0, 'alle Zuhörer gehen wieder weg');
});

test('guardClicks ohne Finger beim Erscheinen: nach der Schutzzeit zählt auch ein Klick ohne pointerdown (VoiceOver)', () => {
  let now = 0;
  const node = guardedNode();
  guardClicks(node, createFreshGuard(650, () => now), { heldAtShow: false });
  now = 400;
  assert.equal(node.fire('click').blocked, true);
  now = 700;
  assert.equal(node.fire('click').blocked, false);
});

// Ein Ziel, das Zuhörer mit ihrer Capture-Angabe aufschreibt, und ein Dokument mit hidden.
function pointerTarget() {
  const on = [];
  const add = (type, fn, opt) => on.push({ type, fn, capture: opt === true || !!opt?.capture });
  const remove = (type, fn) => on.splice(on.findIndex(l => l.type === type && l.fn === fn), 1);
  const target = { addEventListener: add, removeEventListener: remove };
  const doc = { hidden: false, addEventListener: add, removeEventListener: remove };
  const fire = (type, e = {}) => on.filter(l => l.type === type).forEach(l => l.fn({ target, isPrimary: true, ...e }));
  return { target, doc, on, fire };
}

test('trackPointers zählt aufliegende Finger nach pointerId; pointercancel hebt sie auf', () => {
  const { target, doc, on, fire } = pointerTarget();
  const off = trackPointers(target, doc);
  for (const type of ['pointerdown', 'pointerup', 'pointercancel']) assert.ok(on.some(l => l.type === type && l.capture), type);
  assert.equal(pointerHeld(), false);
  fire('pointerdown', { pointerId: 1 });
  fire('pointerdown', { pointerId: 2, isPrimary: false });
  fire('pointerup', { pointerId: 1 });
  assert.equal(pointerHeld(), true, 'Finger 2 liegt noch');
  fire('pointercancel', { pointerId: 2 });
  assert.equal(pointerHeld(), false);
  off();
  assert.equal(on.length, 0, 'alle Zuhörer gehen wieder weg');
});

// iOS: Verschwindet das Ziel beim Aufsetzen (say(), Titel), kann das pointerup verloren gehen.
test('trackPointers: Ein verlorenes pointerup hängt nicht fest; ein neuer erster Finger löst es', () => {
  const { target, doc, fire } = pointerTarget();
  const off = trackPointers(target, doc);
  fire('pointerdown', { pointerId: 1 }); // sein pointerup geht verloren
  fire('pointerdown', { pointerId: 2 }); // ein neuer erster Finger: Finger 1 liegt nicht mehr
  fire('pointerup', { pointerId: 2 });
  assert.equal(pointerHeld(), false, 'nur Finger 2 lag, und der ist los');
  // Ein zweiter Finger (nicht isPrimary) löscht den ersten nicht, etwa den Daumen auf dem Steuerkreuz.
  fire('pointerdown', { pointerId: 3 });
  fire('pointerdown', { pointerId: 4, isPrimary: false });
  fire('pointerup', { pointerId: 4 });
  assert.equal(pointerHeld(), true, 'der Daumen liegt noch');
  off();
});

test('trackPointers: Fokusverlust des Fensters und eine verdeckte App vergessen alle Finger, ein Knopf ohne Fokus nicht', () => {
  const { target, doc, on, fire } = pointerTarget();
  const off = trackPointers(target, doc);
  assert.ok(on.some(l => l.type === 'blur' && !l.capture), 'blur ohne Capture: nur das Fenster selbst');
  fire('pointerdown', { pointerId: 1 });
  fire('blur', { target: { tagName: 'BUTTON' } });
  assert.equal(pointerHeld(), true, 'ein Knopf verliert den Fokus: der Finger liegt noch');
  fire('blur');
  assert.equal(pointerHeld(), false, 'das Fenster verliert den Fokus');
  fire('pointerdown', { pointerId: 2 });
  fire('visibilitychange');
  assert.equal(pointerHeld(), true, 'sichtbar: nichts ändert sich');
  doc.hidden = true;
  fire('visibilitychange');
  assert.equal(pointerHeld(), false, 'verdeckt: alle vergessen');
  off();
});

test('main.js meldet trackPointers am Fenster an', () => {
  const src = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
  assert.match(src, /import\s*\{[^}]*trackPointers[^}]*\}\s*from\s*'\.\/ui\/freshGuard\.js'/);
  assert.match(src, /^trackPointers\(window\);$/m);
});
