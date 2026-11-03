import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readPackFile } from '../js/pack/readFile.js';
import { CONFIG } from '../js/config.js';
import { makePackText } from './helpers/fixtures.js';

test('liest und prüft eine Paketdatei', async () => {
  const good = await readPackFile(new File([makePackText()], 'p.txt'));
  assert.equal(good.ok, true);
  assert.equal(good.data.title, 'Testpaket');
  assert.equal(good.text, makePackText());
  const bad = await readPackFile(new File(['FRAGE: x'], 'p.txt'));
  assert.equal(bad.ok, false);
  assert.ok(bad.details.length > 0);
});

test('eine zu große Datei wird gar nicht erst gelesen', async () => {
  const big = { size: CONFIG.pack.maxBytes + 1, arrayBuffer() { throw new Error('darf nicht gelesen werden'); } };
  assert.deepEqual(await readPackFile(big), { ok: false, details: ['Die Datei ist größer als 1 MB.'] });
});

test('eine unlesbare Datei ergibt eine Meldung statt eines Absturzes', async () => {
  const broken = { size: 10, async arrayBuffer() { throw new Error('NotReadableError'); } };
  assert.deepEqual(await readPackFile(broken), { ok: false, details: ['Die Datei konnte nicht gelesen werden.'] });
});
