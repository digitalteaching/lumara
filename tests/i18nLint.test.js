// Spielsprache (Design 10.6): In Dateien, die schon auf das Textmodul umgestellt sind, steht kein
// deutscher Text mehr im Code. Alles Sichtbare kommt über t() aus js/i18n/. Die Liste wächst mit
// jedem Task von Plan 4a.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

// Alle Dateien mit Texten für das Kind: scenes, ui, menu (ohne die Seite für die Lehrkraft), items,
// world (ohne die Karten, deren Texte tests/i18n.test.js prüft) und die Standardtexte.
const DIRS = ['js/scenes', 'js/ui', 'js/menu', 'js/items', 'js/world', 'js/friends'];
const SKIP = new Set(['js/menu/teacherPage.js']);
export const CONVERTED = [
  ...DIRS.flatMap(d => readdirSync(new URL(`../${d}`, import.meta.url)).filter(f => f.endsWith('.js')).map(f => `${d}/${f}`)),
  'js/data/texts.js',
  'js/save/backup.js',
].filter(f => !SKIP.has(f));

// Deutsche Merkmale: Umlaute, häufige Wörter und typische Wörter der Oberfläche ohne Umlaut.
const GERMAN = /[äöüÄÖÜß]|\b(der|die|das|und|nicht|du|dein|deine|ist|mit|noch|Zurück|Ja|Nein|Weiter|Volltreffer|bereit|Duell|Fliehen|Aufgeben|Laden|Einsetzen|Spielstand|Wesen|Rucksack|Karte|Tagebuch|Einstellungen|Leuchtstein|Zettel|Beere|Energie|Stufe|Frage|Antwort|Richtig|Falsch|Zeit|Sicherung|Lernpaket|Neues|Spiel)\b/;

// Zeichenketten außerhalb von Kommentaren. Schlüssel von t()/tl() und import-Pfade zählen nicht.
function literals(source) {
  const out = [];
  const code = source.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, '')).split('\n').map(l => l.replace(/^\s*\/\/.*$/, '').replace(/\s\/\/.*$/, ''));
  const raw = source.split('\n');
  code.forEach((line, i) => {
    if (/^\s*import\s/.test(line)) return;
    if (/\/\/ i18n-ok/.test(raw[i] ?? '')) return; // bewusst deutsch, etwa Trennstellen deutscher Namen
    for (const m of line.matchAll(/(['"`])((?:\\.|(?!\1).)*)\1/g)) {
      const before = line.slice(0, m.index);
      if (/\b(t|tl)\(\s*$/.test(before)) continue;
      out.push({ line: i + 1, text: m[2] });
    }
  });
  return out;
}

test('Umgestellte Dateien enthalten keinen deutschen Text mehr', () => {
  for (const file of CONVERTED) {
    const src = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
    const bad = literals(src).filter(l => GERMAN.test(l.text));
    assert.deepEqual(bad, [], file);
    // Beschriftungen für Bildschirmleser kommen immer aus dem Textmodul, auch einzelne Wörter.
    const aria = src.split('\n').map((l, i) => [i + 1, l.trim()]).filter(([, l]) => /'aria-label':\s*['"`]/.test(l));
    assert.deepEqual(aria, [], `${file}: aria-label`);
  }
});

// Wer t() aus dem Textmodul nutzt, darf keinen eigenen Namen t haben (etwa eine Zeitvariable
// „let t = 0“): Sonst ist t() dort keine Funktion mehr, und die Szene bricht ab.
test('Kein eigener Name t verdeckt die Textfunktion t()', () => {
  const files = readdirSync(new URL('../js', import.meta.url), { recursive: true }).filter(f => f.endsWith('.js')).map(f => `js/${f}`);
  const shadow = /\b(let|const|var)\s+t\s*=|\bfunction\s*\w*\s*\(([^)]*,\s*)?t\s*[,)=]|\(\s*t\s*[,)]|[,(]\s*t\s*\)\s*=>|(^|[^\w.])t\s*=>/;
  for (const file of files) {
    const src = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
    const spec = src.match(/import\s*\{([^}]*)\}\s*from\s*'[^']*i18n\/i18n\.js'/)?.[1] ?? '';
    // Mit „t as tr“ gibt es t() dort nicht: Jeder Aufruf t(…) wäre ein Fehler zur Laufzeit.
    if (spec.split(',').some(x => /^t\s+as\s+\w+$/.test(x.trim()))) {
      const calls = src.split('\n').map((l, i) => [i + 1, l.trim()]).filter(([, l]) => !l.startsWith('//') && /(^|[^\w.])t\(/.test(l));
      assert.deepEqual(calls, [], `${file}: t() aufgerufen, aber als tr importiert`);
    }
    if (!spec.split(',').some(x => x.trim() === 't')) continue;
    const bad = src.split('\n').map((l, i) => [i + 1, l.trim()]).filter(([, l]) => !l.startsWith('//') && shadow.test(l.replace(/\bt\(/g, 'T(')));
    assert.deepEqual(bad, [], file);
  }
});
