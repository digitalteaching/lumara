import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAutosave } from '../js/save/autosave.js';

test('speichert alle 30 Sekunden', () => {
  let n = 0;
  const a = createAutosave({ save: () => (n++, true), intervalMs: 30000 });
  a.tick(29999);
  assert.equal(n, 0);
  a.tick(1);
  assert.equal(n, 1);
  a.tick(30000);
  assert.equal(n, 2);
});

test('saveNow setzt die Uhr zurück', () => {
  let n = 0;
  const a = createAutosave({ save: () => (n++, true), intervalMs: 30000 });
  a.tick(20000);
  a.saveNow();
  a.tick(20000);
  assert.equal(n, 1);
  a.tick(10000);
  assert.equal(n, 2);
});

test('speichert beim Verstecken und beim Schließen der Seite', () => {
  let n = 0;
  const a = createAutosave({ save: () => (n++, true) });
  const doc = new EventTarget();
  doc.hidden = false;
  const win = new EventTarget();
  const off = a.attach(doc, win);
  doc.dispatchEvent(new Event('visibilitychange'));
  assert.equal(n, 0);
  doc.hidden = true;
  doc.dispatchEvent(new Event('visibilitychange'));
  assert.equal(n, 1);
  win.dispatchEvent(new Event('pagehide'));
  assert.equal(n, 2);
  off();
  win.dispatchEvent(new Event('pagehide'));
  assert.equal(n, 2);
});

test('meldet einen Fehlschlag nur einmal; nichts zu speichern ist kein Fehlschlag', () => {
  let fails = 0;
  let result = null;
  const a = createAutosave({ save: () => result, onFail: () => fails++ });
  a.saveNow();
  assert.equal(fails, 0);
  result = false;
  a.saveNow();
  a.saveNow();
  assert.equal(fails, 1);
});
