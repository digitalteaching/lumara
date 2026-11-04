// Der KI-Prompt für Lernpakete (Design 10.5): Er nennt jedes Schlüsselwort des Pakets, die
// Pflichtregeln, und sein Musterpaket lädt ohne Fehler. So erzeugt eine KI gültige Dateien.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parsePack } from '../js/pack/parser.js';

const prompt = readFileSync(new URL('../pakete/KI-PROMPT-Lernpaket.md', import.meta.url), 'utf8');
const KEYWORDS = ['PAKET', 'KENNUNG', 'FACH', 'ZEITDRUCK', 'SPIELSPRACHE', 'TRAINER', 'NAME', 'THEMA', 'HALLO', 'SIEG', 'NIEDERLAGE', 'REVANCHE', 'FRAGE', 'ANTWORT', 'SATZ', 'AUCH RICHTIG', 'FALSCH', 'EXTRA', 'FORM', 'ENDGEGNER', 'ZETTEL'];

test('KI-Prompt: jedes Schlüsselwort, die Pflichtregeln und ein Musterpaket, das ohne Fehler lädt', () => {
  for (const k of KEYWORDS) assert.ok(prompt.includes(k), k);
  assert.match(prompt, /mindestens 8/);
  assert.match(prompt, /mindestens 3/);
  assert.match(prompt, /KENNUNG[^\n]*\n?[^\n]*(nie|nicht ändern)/);
  const muster = prompt.match(/<<<MUSTER\n([\s\S]*?)\nMUSTER>>>/);
  assert.ok(muster, 'Musterpaket zwischen <<<MUSTER und MUSTER>>>');
  const r = parsePack(muster[1]);
  assert.equal(r.ok, true, JSON.stringify(r.errors));
  assert.deepEqual(r.errors ?? [], []);
  assert.ok(r.pack.trainers[0].questions.length >= 8);
  assert.ok(r.pack.boss && r.pack.notes.length > 0, 'Muster zeigt Endgegner und Zettel');
});

test('KI-Prompt: die acht Gebiete und Trainerfiguren wie in der Vorlage', () => {
  const vorlage = readFileSync(new URL('../pakete/vorlage.txt', import.meta.url), 'utf8');
  for (const m of vorlage.matchAll(/^# Gebiet (\d), ([^:]+): (.+)$/gm)) {
    assert.ok(prompt.includes(`${m[1]} ${m[2]}: ${m[3]}`), `Gebiet ${m[1]}`);
  }
});
