import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFreshGuard } from '../js/ui/freshGuard.js';

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
