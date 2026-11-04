// Spielsprache (Design 10.6): die aktive Sprache und die Texte der Oberfläche. Die Sprache kommt
// immer aus dem Lernpaket; ohne Paket ist sie Deutsch. Fehlt ein Text in einer Sprache, gilt der
// deutsche. Im Prüfmodus (?sprache=xx) steht jeder übersetzte Text in ⟦ ⟧, damit vergessene
// Texte sofort auffallen. DOM-frei.

import { LANGUAGES, READY } from '../pack/language.js';
import { DE } from './de.js';
import { EN } from './en.js';
import { FR } from './fr.js';
import { ES } from './es.js';

export { LANGUAGES, READY };

const TABLES = { de: DE, en: EN, fr: FR, es: ES };
let current = 'de';
let pseudo = false;

// Nicht fertige oder unbekannte Sprachen laufen auf Deutsch. Gibt die aktive Sprache zurück.
export function setLanguage(lang) {
  current = READY.includes(lang) && TABLES[lang] ? lang : 'de';
  return current;
}

export const language = () => current;

export function setPseudo(on) {
  pseudo = !!on;
}

// Für Texte aus Daten (Bewohner, Wesen, Geschichte): im Prüfmodus markiert wie alle anderen.
export const mark = s => (pseudo ? `⟦${s}⟧` : s);

function lookup(key) {
  const v = TABLES[current][key] ?? DE[key];
  if (v === undefined) throw new Error(`Text fehlt: ${key}`);
  return v;
}

const fill = (s, params) => s.replace(/\{(\w+)\}/g, (m, k) => (k in params ? String(params[k]) : m));

export function t(key, params = {}) {
  const v = lookup(key);
  return mark(fill(Array.isArray(v) ? v.join(' ') : v, params));
}

// Ein Text in einer bestimmten Sprache, unabhängig von der aktiven (etwa für Standardtexte eines
// Pakets beim Einlesen). Nicht fertige Sprachen geben Deutsch, ohne Prüfmodus-Markierung.
export function textIn(lang, key, params = {}) {
  const table = READY.includes(lang) && TABLES[lang] ? TABLES[lang] : DE;
  const v = table[key] ?? DE[key];
  if (v === undefined) throw new Error(`Text fehlt: ${key}`);
  return fill(Array.isArray(v) ? v.join(' ') : v, params);
}

// Zeilenlisten (etwa mehrere Sprechblasen nacheinander).
export function tl(key, params = {}) {
  const v = lookup(key);
  return (Array.isArray(v) ? v : [v]).map(s => mark(fill(s, params)));
}
