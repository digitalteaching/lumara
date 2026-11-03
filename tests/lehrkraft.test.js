import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../lehrkraft.html', import.meta.url), 'utf8');
const inputTag = name => html.match(new RegExp(`<input[^>]*name="${name}"[^>]*>`))?.[0] ?? '';

// Auf dem iPad der Lehrkraft würde die Autokorrektur Namen oder Codes still ändern
// und so ein falsches „passt nicht“ erzeugen.
test('Name, Paketkennung und Prüfcode ohne Autokorrektur und Rechtschreibprüfung', () => {
  for (const name of ['name', 'packId', 'code']) {
    const tag = inputTag(name);
    assert.ok(tag, name);
    assert.match(tag, /autocorrect="off"/, `${name}: autocorrect`);
    assert.match(tag, /spellcheck="false"/, `${name}: spellcheck`);
  }
  assert.match(inputTag('name'), /autocapitalize="off"/);
});
