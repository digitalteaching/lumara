// Die Seiten für Lehrkräfte (Design 10.5, 12.3): die Anleitung mit allen Abschnitten und die Links
// zu Vorlage, Beispielpaket, KI-Prompt und Anleitung. Jede verlinkte Datei gibt es.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = p => readFileSync(new URL(p, root), 'utf8');
const links = html => [...html.matchAll(/href="([^"#]+)"/g)].map(m => m[1]).filter(h => !/^[a-z]+:/.test(h));

test('Anleitung und Seite für Lehrkräfte: Abschnitte, Links und Lizenz', () => {
  const guide = read('anleitung.html');
  for (const h of ['Lernpaket erstellen', 'Lernpaket prüfen', 'An die Klasse verteilen', 'Statistik prüfen', 'Datenschutz']) {
    assert.match(guide, new RegExp(`<h2[^>]*>${h}</h2>`), h);
  }
  for (const f of ['pakete/vorlage.txt', 'pakete/englisch-6-beispiel.txt', 'pakete/KI-PROMPT-Lernpaket.md', 'lehrkraft.html']) assert.ok(links(guide).includes(f), f);
  assert.ok(guide.includes(''));
  assert.ok(!/(src|href)="https?:/.test(guide), 'keine Dateien von außen');
  assert.match(guide, /<html lang="de">/);

  const teacher = read('lehrkraft.html');
  for (const f of ['anleitung.html', 'pakete/KI-PROMPT-Lernpaket.md']) assert.ok(links(teacher).includes(f), f);

  for (const page of [guide, teacher]) for (const f of links(page)) assert.ok(existsSync(new URL(f === './' ? 'index.html' : f, root)), f);
});
