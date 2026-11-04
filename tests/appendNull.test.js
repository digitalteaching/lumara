import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Gefunden bei den Reel-Aufnahmen (04.11.2026): Auf der Seite für Lehrkräfte stand unter dem Paketnamen
// „null“, weil ein natives node.append(…, bedingung ? null : …) null als Text einfügt. Für bedingte
// Kinder gibt es appendAll (js/ui/dom.js) oder el(), die null überspringen.

function jsFiles(dir) {
  return readdirSync(dir).flatMap(name => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? jsFiles(p) : p.endsWith('.js') ? [p] : [];
  });
}

/** Argumente jedes `.append(`-Aufrufs, bis zur passenden schließenden Klammer. */
function appendCalls(src) {
  const calls = [];
  let i = 0;
  while ((i = src.indexOf('.append(', i)) !== -1) {
    let depth = 0;
    let j = i + '.append'.length;
    for (; j < src.length; j++) {
      if (src[j] === '(') depth++;
      else if (src[j] === ')' && --depth === 0) break;
    }
    calls.push(src.slice(i, j + 1));
    i = j;
  }
  return calls;
}

/** Bedingungen auf oberster Ebene des Aufrufs (nicht in verschachtelten Klammern wie el(…)). */
function topLevelNullBranch(call) {
  const inner = call.slice(call.indexOf('(') + 1, -1);
  let depth = 0;
  let flat = '';
  for (const ch of inner) {
    if ('([{'.includes(ch)) depth++;
    else if (')]}'.includes(ch)) depth--;
    else if (depth === 0) flat += ch;
  }
  return /\?\s*null\b|:\s*null\b/.test(flat);
}

test('Kein natives append mit einem Zweig, der null ergibt (sonst steht „null“ auf der Seite)', () => {
  const bad = [];
  for (const file of jsFiles(fileURLToPath(new URL('../js', import.meta.url)))) {
    for (const call of appendCalls(readFileSync(file, 'utf8'))) {
      if (topLevelNullBranch(call)) bad.push(`${file}: ${call.slice(0, 120).replace(/\s+/g, ' ')}`);
    }
  }
  assert.deepEqual(bad, []);
});
