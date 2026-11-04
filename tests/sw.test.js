import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { APP_VERSION } from '../js/version.js';

const root = new URL('../', import.meta.url);
const read = p => readFileSync(new URL(p, root), 'utf8');
const walk = dir => readdirSync(new URL(dir + '/', root))
  .filter(f => !f.startsWith('.'))
  .flatMap(f => (statSync(new URL(`${dir}/${f}`, root)).isDirectory() ? walk(`${dir}/${f}`) : [`${dir}/${f}`]));

test('die Version steht überall gleich', () => {
  assert.equal(read('sw.js').match(/const VERSION = '([^']+)'/)[1], APP_VERSION);
  assert.equal(JSON.parse(read('version.json')).version, APP_VERSION);
});

test('der Service Worker speichert genau die Dateien des Spiels', () => {
  const files = JSON.parse(read('sw.js').match(/const FILES = (\[[\s\S]*?\]);/)[1]);
  const expected = [...walk('js'), ...walk('css'), ...walk('icons'), 'index.html', 'lehrkraft.html', 'anleitung.html', 'manifest.webmanifest', 'version.json', 'pakete/vorlage.txt', 'pakete/englisch-6-beispiel.txt', 'pakete/KI-PROMPT-Lernpaket.md'];
  assert.deepEqual([...files].sort(), expected.sort());
  for (const f of files) assert.ok(existsSync(new URL(f, root)), f);
});

test('GitHub Pages ohne Jekyll: .nojekyll, sobald der Service Worker eine .md-Datei speichert', () => {
  const files = JSON.parse(read('sw.js').match(/const FILES = (\[[\s\S]*?\]);/)[1]);
  if (files.some(f => f.endsWith('.md'))) assert.ok(existsSync(new URL('.nojekyll', root)), '.nojekyll fehlt: Pages machte aus .md eine .html-Seite');
});
