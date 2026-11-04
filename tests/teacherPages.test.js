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
  assert.ok(!/(src|href)="https?:/.test(guide), 'keine Dateien von außen');
  assert.match(guide, /<html lang="de">/);

  const teacher = read('lehrkraft.html');
  for (const f of ['anleitung.html', 'pakete/KI-PROMPT-Lernpaket.md']) assert.ok(links(teacher).includes(f), f);

  for (const page of [guide, teacher]) for (const f of links(page)) assert.ok(existsSync(new URL(f === './' ? 'index.html' : f, root)), f);
});

test('Anleitung: erst zum Home-Bildschirm, dann das Paket laden; der eigene Speicher steht da', () => {
  const guide = read('anleitung.html');
  const share = guide.slice(guide.indexOf('An die Klasse verteilen'), guide.indexOf('Thema für Thema'));
  assert.ok(share.indexOf('Home-Bildschirm') < share.indexOf('„Lernpaket laden“'), 'Home-Bildschirm vor „Lernpaket laden“');
  assert.match(share, /eigenen Speicher/);
});

test('Der KI-Prompt öffnet sich im Browser (kein download-Attribut), damit man den Text kopieren kann', () => {
  for (const page of ['anleitung.html', 'lehrkraft.html']) {
    assert.ok(!/href="pakete\/KI-PROMPT-Lernpaket\.md"[^>]*download/.test(read(page)), page);
  }
});

test('Kein Copyright-Hinweis: weder in den Dateien des Spiels noch im README, in den Plänen oder im PDF-Werkzeug', () => {
  const served = JSON.parse(read('sw.js').match(/const FILES = (\[[\s\S]*?\]);/)[1]).filter(f => !f.endsWith('.png'));
  const docs = ['docs/superpowers/specs/2026-11-01-lernwelt-rpg-design.md', 'docs/superpowers/plans/2026-11-02-lumara-plan-1-spielbarer-kern.md',
    'docs/superpowers/plans/2026-11-04-lumara-plan-8-abschluss.md'];
  for (const f of [...served, 'sw.js', 'README.md', 'tools/kurzanleitung/bauen.py', ...docs]) {
    const text = read(f);
    assert.ok(!text.includes('©') && !text.includes('Alle Rechte vorbehalten'), f);
  }
});

test('Die Kurzanleitung als PDF: auf beiden Seiten verlinkt, öffnet im Browser, nicht im Offline-Speicher', () => {
  const pdf = 'pakete/Lumara-Kurzanleitung.pdf';
  assert.equal(readFileSync(new URL(pdf, root)).subarray(0, 5).toString(), '%PDF-');
  for (const page of ['anleitung.html', 'lehrkraft.html']) {
    const html = read(page);
    assert.ok(links(html).includes(pdf), page);
    assert.match(html, /href="pakete\/Lumara-Kurzanleitung\.pdf" target="_blank" rel="noopener"/, page);
  }
  // Nur für Lehrkräfte: Die iPads der Kinder laden die 0,7 MB nicht mit in den Zwischenspeicher.
  assert.ok(!read('sw.js').includes(pdf));
});
