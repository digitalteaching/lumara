import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../js/core/rng.js';
import {
  normalizeTyped, checkTyped, sentenceTokens, checkTiles, buildChoices, buildTiles, jokerHint,
  acceptedAnswers, correctText,
} from '../js/duel/answers.js';
import { q } from './helpers/fixtures.js';

test('Eintippen: Leerzeichen, Großschreibung, Satzzeichen am Ende', () => {
  assert.equal(normalizeTyped('  She   PLAYS tennis!! '), 'she plays tennis');
  assert.equal(checkTyped(' Plays.', ['plays']).correct, true);
});

test('Prüffokus: iPad-Apostrophe und geschützte Leerzeichen', () => {
  assert.equal(checkTyped('don’t', ["don't"]).correct, true);
  assert.equal(checkTyped('don`t', ["don't"]).correct, true);
  assert.equal(checkTyped(' ice cream ', ['ice cream']).correct, true);
});

test('Spanische Frage- und Ausrufezeichen zählen nicht, französische Anführungszeichen wie gerade', () => {
  assert.deepEqual(checkTyped('como te llamas', ['¿Cómo te llamas?']), { correct: false, almost: true });
  assert.equal(checkTyped('¿Cómo te llamas?', ['Cómo te llamas']).correct, true);
  assert.equal(checkTyped('cómo te llamas', ['¿Cómo te llamas?']).correct, true);
  assert.equal(checkTyped('¡Hola!', ['hola']).correct, true);
  assert.equal(checkTyped('hola que tal', ['Hola, ¿qué tal?']).correct, false);
  assert.equal(normalizeTyped('« oui »'), normalizeTyped('"oui"'));
  assert.equal(checkTyped('Ça va ?', ['ça va']).correct, true);
});

test('Zahlen: Komma und Punkt sind gleich', () => {
  assert.equal(checkTyped('3,5', ['3.5']).correct, true);
  assert.equal(checkTyped('3.5', ['3,5']).correct, true);
  assert.equal(checkTyped('35', ['3,5']).correct, false);
});

test('Rechtschreibung zählt, AUCH RICHTIG zählt', () => {
  assert.equal(checkTyped('colour', ['color', 'colour']).correct, true);
  assert.equal(checkTyped('colr', ['color']).correct, false);
});

test('Fast richtig bei einem Buchstaben oder einer Vertauschung', () => {
  assert.deepEqual(checkTyped('butterfy', ['butterfly']), { correct: false, almost: true });
  assert.deepEqual(checkTyped('buttrefly', ['butterfly']), { correct: false, almost: true });
  assert.deepEqual(checkTyped('butter', ['butterfly']), { correct: false, almost: false });
});

test('kein „Fast“ bei bekannter falscher Antwort oder Antworten unter 4 Zeichen', () => {
  assert.equal(checkTyped('play', ['plays'], ['play', 'playing', 'played']).almost, false);
  assert.equal(checkTyped('in', ['is']).almost, false);
});

test('Satzbau: Satzzeichen hängen am Wort davor, Prüfung genau', () => {
  assert.deepEqual(sentenceTokens('He never walks to school.'), ['He', 'never', 'walks', 'to', 'school.']);
  assert.equal(checkTiles(['He', 'never', 'walks', 'to', 'school.'], ['He never walks to school.']), true);
  assert.equal(checkTiles(['he', 'never', 'walks', 'to', 'school.'], ['He never walks to school.']), false);
  assert.equal(checkTiles(['The', 'dog', 'sees', 'the', 'cat.'], ['The cat sees the dog.', 'The dog sees the cat.']), true);
});

test('buildTiles: Satz und EXTRA gemischt, nie schon richtig geordnet', () => {
  const qq = q({ answer: null, sentence: 'I am here.', extra: ['is'], forms: ['tiles'] });
  for (let s = 0; s < 30; s++) {
    const t = buildTiles(qq, createRng(s));
    assert.deepEqual([...t].sort(), ['I', 'am', 'here.', 'is'].sort());
    assert.notEqual(t.filter(x => x !== 'is').join(' '), 'I am here.');
  }
});

test('Prüffokus: Auswahl hat immer vier verschiedene Knöpfe, genau einer richtig', () => {
  for (let s = 0; s < 50; s++) {
    const { options, correctIndex } = buildChoices(q({ wrong: ['a', 'b', 'c', 'd', 'e'] }), createRng(s));
    assert.equal(options.length, 4);
    assert.equal(new Set(options).size, 4);
    assert.equal(options[correctIndex], 'plays');
  }
});

test('Joker je Form', () => {
  const qq = q(), rng = createRng(1), choices = buildChoices(qq, rng);
  const h = jokerHint({ question: qq, form: 'choice', choices }, rng);
  assert.equal(h.removeIndices.length, 2);
  assert.ok(!h.removeIndices.includes(choices.correctIndex));
  assert.deepEqual(jokerHint({ question: qq, form: 'typing' }, rng), { firstLetter: 'p' });
  const s = q({ answer: null, sentence: 'He is.', forms: ['tiles'] });
  assert.deepEqual(jokerHint({ question: s, form: 'tiles', tiles: ['is.', 'He'] }, rng), { firstTile: 'He' });
});

test('Joker bleibt bei weniger als vier Knöpfen innerhalb der vorhandenen Knöpfe', () => {
  const qq = q();
  for (let s = 0; s < 100; s++) {
    const choices = { options: ['plays', 'play', 'playing'], correctIndex: 0 };
    const h = jokerHint({ question: qq, form: 'choice', choices }, createRng(s));
    assert.ok(h.removeIndices.every(i => i >= 1 && i <= 2));
  }
});

test('akzeptierte Antworten und Anzeige der richtigen Antwort', () => {
  assert.deepEqual(acceptedAnswers(q({ alsoCorrect: ['does play'] })), ['plays', 'does play']);
  assert.equal(correctText(q({ answer: null, sentence: 'I am here.' })), 'I am here.');
});
