import { test } from 'node:test';
import assert from 'node:assert/strict';
import { packLanguage } from '../js/pack/language.js';

const lang = (subject, gameLanguage = null) => packLanguage({ subject, gameLanguage, gameLanguageLine: gameLanguage ? 5 : null });

test('Spielsprache aus dem Fach, auch mit Zusätzen und in anderer Schreibung', () => {
  for (const s of ['Englisch', 'ENGLISH', 'Englisch 6b', 'English (Year 6)']) assert.equal(lang(s).language, 'en', s);
  for (const s of ['Mathe', 'Deutsch als Zweitsprache', 'Biologie', '']) assert.equal(lang(s).language, 'de', s);
  assert.deepEqual(lang('Englisch').hints, []);
});

test('SPIELSPRACHE gewinnt vor dem Fach; Unbekanntes ist ein Hinweis mit Zeile', () => {
  assert.equal(lang('Mathe', 'Englisch').language, 'en');
  assert.equal(lang('Englisch', 'deutsch').language, 'de');
  const r = lang('Englisch', 'klingonisch');
  assert.equal(r.language, 'en'); // dann entscheidet das Fach
  assert.deepEqual(r.hints, [{ line: 5, message: 'Zeile 5: Unbekannte SPIELSPRACHE „klingonisch“. Möglich sind deutsch, englisch, französisch und spanisch.' }]);
});

test('Französisch und Spanisch laufen in ihrer Sprache; Latein läuft auf Deutsch', () => {
  assert.deepEqual(lang('Französisch'), { language: 'fr', requested: 'fr', hints: [] });
  assert.deepEqual(lang('Español'), { language: 'es', requested: 'es', hints: [] });
  assert.equal(lang('Mathe', 'spanisch').language, 'es');
  assert.equal(lang('Französisch 7b').language, 'fr');
  assert.deepEqual(lang('Latein').hints.map(h => h.message), ['Das Spiel gibt es noch nicht auf Latein. Es läuft auf Deutsch.']);
  assert.deepEqual(lang('Italian').hints.map(h => h.message), ['Das Spiel gibt es noch nicht auf Italienisch. Es läuft auf Deutsch.']);
  assert.equal(lang(null).language, 'de');
});

test('Ein kurzes Kürzel oder ein englischer Sprachname im Fach überstimmt die Fachsprache nicht', () => {
  for (const s of ['Englisch Vokabeln DE-EN', 'Englisch (DE → EN)', 'Englisch Unit 2 – German food', 'EN']) assert.equal(lang(s).language, 'en', s);
  assert.equal(lang('Französisch: Cours de français').requested, 'fr');
  assert.equal(lang('Les verbes en -er').language, 'de');
  assert.equal(lang('Deutsch als Zweitsprache').language, 'de');
  assert.equal(lang('German').language, 'de');
});
