import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePack } from '../js/pack/parser.js';
import { DEFAULT_LINES } from '../js/data/texts.js';
import { makePackText, fillerQuestions } from './helpers/fixtures.js';

const EXAMPLE = `# Kommentar
PAKET: Englisch Jahrgang 6 – Beispielpaket
KENNUNG: englisch6-beispiel
FACH: Englisch
ZEITDRUCK: normal

=== TRAINER 1 ===
NAME: Captain Maren
THEMA: Simple present
HALLO: Ahoy, traveller! Nobody passes my beach without a test.
HALLO: Show me what you know about the simple present!
SIEG: Well done! The first light is yours.

FRAGE: She ___ (play) tennis every Monday.
ANTWORT: plays
FALSCH: play | playing | played

FRAGE: Wie heißt „Schmetterling“ auf Englisch?
ANTWORT: butterfly

FRAGE: Bilde den Satz: „Er geht nie zu Fuß zur Schule.“
SATZ: He never walks to school.
EXTRA: walk | always

FRAGE: Which word means „oft“?
ANTWORT: often
FALSCH: never | sometimes | always
FORM: auswahl

` + fillerQuestions(4, 'F');

test('liest das Beispiel aus dem Design', () => {
  const r = parsePack(EXAMPLE), t = r.pack.trainers[0];
  assert.equal(r.ok, true);
  assert.deepEqual(r.errors, []);
  assert.equal(t.name, 'Captain Maren');
  assert.equal(t.topic, 'Simple present');
  assert.equal(t.hello.length, 2);
  assert.equal(t.loss, DEFAULT_LINES.loss);
  assert.deepEqual(t.questions.slice(0, 4).map(q => q.forms), [['choice', 'typing'], ['typing'], ['tiles'], ['choice']]);
  assert.deepEqual(t.questions[0].wrong, ['play', 'playing', 'played']);
  assert.deepEqual(t.questions[2].extra, ['walk', 'always']);
  assert.equal(t.questions[0].line, 14);
  assert.equal(r.pack.shortId, 'ENQ9');
  assert.equal(r.pack.timePressure, 'normal');
});

test('großzügig: BOM, CRLF, Groß-/Kleinschreibung, Leerzeichen vor dem Doppelpunkt', () => {
  const text = '﻿' + makePackText().replace(/\n/g, '\r\n').replace('PAKET:', 'paket :').replace(/ANTWORT:/g, 'Antwort:');
  assert.equal(parsePack(text).ok, true);
});

test('AUCH RICHTIG wird an | getrennt', () => {
  const r = parsePack(makePackText() + 'FRAGE: Farbe?\nANTWORT: color\nAUCH RICHTIG: colour |  Color \n');
  assert.deepEqual(r.pack.trainers[0].questions.at(-1).alsoCorrect, ['colour', 'Color']);
});

test('Fehler mit Zeilennummer', () => {
  const base = makePackText(), line = base.split('\n').length;
  assert.deepEqual(parsePack(base + 'FRAGE: Ohne Antwort\n').errors, [
    { line, message: `Zeile ${line}: Bei dieser Frage fehlt ANTWORT oder SATZ.` },
  ]);
  assert.match(
    parsePack(base + 'FRAGE: X\nANTWORT: a\nFALSCH: b | c\n').errors[0].message,
    /^Zeile \d+: Für die Auswahl braucht es mindestens 3 falsche Antworten\.$/,
  );
});

test('Trainer lückenlos ab 1, höchstens 8, mindestens 8 Fragen', () => {
  const t = makePackText({ trainers: 5 }).replace('=== TRAINER 4 ===', '=== TRAINER 6 ===');
  assert.ok(parsePack(t).errors.some(e => e.message === 'Trainer 4 fehlt, aber Trainer 5 ist vorhanden.'));
  assert.ok(parsePack(makePackText({ questions: 7 })).errors.some(e => e.message === 'Trainer 1 hat nur 7 Fragen. Es braucht mindestens 8.'));
  assert.match(parsePack(makePackText() + '=== TRAINER 9 ===\n').errors[0].message, /Es gibt nur Trainer 1 bis 8\./);
});

test('Hinweise blockieren nicht', () => {
  const r = parsePack(makePackText({ trainers: 3, questions: 9, kennung: null }) + 'ANTWROT: x\n');
  assert.equal(r.ok, true);
  const w = r.warnings.map(w => w.message);
  assert.ok(w.some(m => /Unbekanntes Schlüsselwort ‚ANTWROT‘\./.test(m)));
  assert.ok(w.includes('Trainer 3 hat nur 9 Fragen, empfohlen sind 20.'));
  assert.ok(w.includes('Das Paket enthält nur Trainer 1 bis 3. Die Wege ab Gebiet 4 bleiben im Nebel.'));
  assert.ok(w.includes('Keine KENNUNG angegeben. Jede Änderung an der Datei setzt die Statistik der Kinder zurück.'));
});

test('Prüffokus: falsche Antwort gleich der richtigen oder doppelt wird entfernt', () => {
  const r = parsePack(makePackText() + 'FRAGE: X\nANTWORT: often\nFALSCH: Often | never | never | sometimes | always\n');
  const qq = r.pack.trainers[0].questions.at(-1);
  assert.deepEqual(qq.wrong, ['never', 'sometimes', 'always']);
  assert.equal(r.warnings.filter(w => /gleich der richtigen|doppelt/.test(w.message)).length, 2);
  assert.equal(parsePack(makePackText() + 'FRAGE: X\nANTWORT: a\nFALSCH: A | b | c\n').ok, false);
});

test('Prüffokus: Word-, RTF- und Zip-Dateien werden klar abgelehnt', () => {
  for (const bad of ['{\\rtf1\\ansi PAKET: x', 'PK\u0003\u0004word/document.xml', 'P\u0000A\u0000K\u0000E\u0000T\u0000']) {
    assert.deepEqual(parsePack(bad).errors, [
      { line: null, message: 'Diese Datei ist keine reine Textdatei. Speichere sie im Texteditor als reinen Text (.txt, UTF-8).' },
    ]);
  }
});

test('zu groß', () => {
  assert.equal(parsePack('x'.repeat(1048577)).errors[0].message, 'Die Datei ist größer als 1 MB.');
});

test('FORM muss zur Frage passen', () => {
  assert.match(parsePack(makePackText() + 'FRAGE: X\nSATZ: I am.\nFORM: auswahl\n').errors[0].message, /FORM: auswahl passt nicht zu SATZ\./);
  assert.match(parsePack(makePackText() + 'FRAGE: X\nANTWORT: a\nFORM: quiz\n').errors[0].message, /FORM kennt nur auswahl, eintippen oder satzbau\./);
});

test('Vorlagen-KENNUNG und doppelte Fragen geben Hinweise', () => {
  assert.ok(parsePack(makePackText({ kennung: 'fach-jahrgang-name' })).warnings.some(w => /noch die aus der Vorlage/.test(w.message)));
  assert.ok(parsePack(makePackText() + 'FRAGE: T1 Frage 1\nANTWORT: z\n').warnings.some(w => /gibt es schon in Zeile \d+\./.test(w.message)));
});

test('Endgegner und Zettel werden gelesen', () => {
  const r = parsePack(makePackText() + '=== ENDGEGNER ===\nHALLO: Wer bist du?\nSIEG: Du erinnerst dich.\n\n=== ZETTEL ===\n' + fillerQuestions(3, 'Z'));
  assert.equal(r.ok, true);
  assert.deepEqual(r.pack.boss.hello, ['Wer bist du?']);
  assert.equal(r.pack.notes.length, 3);
});
