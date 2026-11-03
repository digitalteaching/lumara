import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parsePack } from '../js/pack/parser.js';

const read = f => readFileSync(new URL(`../pakete/${f}`, import.meta.url), 'utf8');

test('Beispielpaket lädt ohne Fehler, nur mit dem Teilpaket-Hinweis', () => {
  const r = parsePack(read('englisch-6-beispiel.txt'));
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.warnings.map(w => w.message), ['Das Paket enthält nur Trainer 1 bis 5. Die Wege ab Gebiet 6 bleiben im Nebel.']);
  assert.equal(r.pack.kennung, 'englisch6-beispiel');
});

test('je Trainer mindestens 20 Fragen und jede Form mindestens 5-mal', () => {
  for (const t of parsePack(read('englisch-6-beispiel.txt')).pack.trainers) {
    assert.ok(t.questions.length >= 20, t.topic);
    for (const f of ['choice', 'typing', 'tiles']) {
      assert.ok(t.questions.filter(q => q.forms.includes(f)).length >= 5, `${t.number} ${f}`);
    }
    for (const q of t.questions.filter(q => q.sentence)) {
      for (const x of q.extra) assert.ok(!q.sentence.split(' ').includes(x), q.text);
    }
  }
});

test('Beispielpaket: Trainer 1 bis 5 mit den Themen aus Design 10.5', () => {
  const p = parsePack(read('englisch-6-beispiel.txt')).pack;
  assert.deepEqual(p.trainers.map(t => [t.number, t.name]), [[1, 'Maren'], [2, 'Rowan'], [3, 'Hazel'], [4, 'Karim'], [5, 'Skye']]);
  for (const t of p.trainers.filter(t => t.number >= 3)) {
    assert.ok(t.questions.length >= 22, `${t.number}`);
    for (const f of ['choice', 'typing', 'tiles']) assert.ok(t.questions.filter(q => q.forms.includes(f)).length >= 6, `${t.number} ${f}`);
    assert.ok(t.hello.length >= 2 && t.hello.length <= 3, `${t.number} HALLO`);
    assert.ok(t.win && t.loss && t.rematch, `${t.number} SIEG/NIEDERLAGE/REVANCHE`);
  }
});

test('mindestens 20 Zettel und ein ENDGEGNER-Abschnitt', () => {
  const p = parsePack(read('englisch-6-beispiel.txt')).pack;
  assert.ok(p.notes.length >= 20);
  assert.ok(p.boss.hello.length >= 1);
});

test('Vorlage erklärt jedes Schlüsselwort und beschreibt alle 8 Trainerfiguren', () => {
  const v = read('vorlage.txt');
  for (const k of ['PAKET:', 'KENNUNG:', 'FACH:', 'ZEITDRUCK:', 'NAME:', 'THEMA:', 'HALLO:', 'SIEG:', 'NIEDERLAGE:', 'REVANCHE:', 'FRAGE:', 'ANTWORT:', 'AUCH RICHTIG:', 'FALSCH:', 'EXTRA:', 'FORM:', 'SATZ:', '=== ENDGEGNER ===', '=== ZETTEL ===']) {
    assert.ok(v.includes(k), k);
  }
  for (const fig of ['Fischerin', 'Waldläufer', 'Pilzsammlerin', 'Karawanenführer', 'Drachenfliegerin', 'Erfinder', 'Eisfischerin', 'Sternendeuterin']) {
    assert.ok(v.includes(fig), fig);
  }
  assert.ok(v.includes('KENNUNG: fach-jahrgang-name'));
  assert.ok(!parsePack(v).warnings.some(w => /Unbekanntes Schlüsselwort/.test(w.message)));
});

test('Beispielpaket: „Preis“ (was etwas kostet) hat keine richtige Übersetzung unter den falschen Antworten', () => {
  const p = parsePack(read('englisch-6-beispiel.txt')).pack;
  const q = p.trainers.flatMap(t => t.questions).find(x => x.text.includes('„Preis“'));
  assert.ok(q);
  assert.equal(q.answer, 'price');
  assert.ok(!q.wrong.includes('prize'), q.wrong.join(' | ')); // „Preis“ heißt auch „prize“ (Gewinn)
  assert.match(q.text, /kostet/);
});
