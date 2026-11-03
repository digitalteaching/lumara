// Spielsprache (Design 10.6): In Dateien, die schon auf das Textmodul umgestellt sind, steht kein
// deutscher Text mehr im Code. Alles Sichtbare kommt über t() aus js/i18n/. Die Liste wächst mit
// jedem Task von Plan 4a.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

export const CONVERTED = [
  'js/scenes/title.js',
  'js/scenes/intro.js',
  'js/scenes/eggs.js',
  'js/scenes/name.js',
  'js/scenes/recover.js',
  'js/scenes/install.js',
  'js/scenes/start.js',
  'js/scenes/duel.js',
  'js/scenes/note.js',
  'js/ui/duelPanel.js',
  'js/duel/answers.js',
  'js/items/stones.js',
  'js/items/food.js',
  'js/data/texts.js',
  'js/scenes/worldEvents.js',
  'js/scenes/world.js',
  'js/scenes/beacon.js',
  'js/world/fogEdge.js',
  'js/world/caveGate.js',
  'js/world/islandMap.js',
  'js/world/beacons.js',
];

const GERMAN = /[äöüÄÖÜß]|\b(der|die|das|und|nicht|du|dein|deine|ist|mit|noch|Zurück|Ja|Nein)\b/;

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
  }
});
