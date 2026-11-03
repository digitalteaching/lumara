import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, statSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

// Die Browser-Module (Szenen, Menü, Oberfläche) laufen nicht in Node. Dieser Test prüft wenigstens,
// dass jede Datei fehlerfrei lesbar ist, damit ein Tippfehler nicht erst als schwarzer Bildschirm auffällt.

const root = fileURLToPath(new URL('../', import.meta.url));
const run = promisify(execFile);

function walk(dir) {
  return readdirSync(root + dir)
    .filter(f => !f.startsWith('.'))
    .flatMap(f => (statSync(`${root}${dir}/${f}`).isDirectory() ? walk(`${dir}/${f}`) : f.endsWith('.js') ? [`${dir}/${f}`] : []));
}

test('alle Spieldateien sind syntaktisch korrekt', async () => {
  const files = walk('js');
  assert.ok(files.length > 30);
  const results = await Promise.all(files.map(f => run(process.execPath, ['--check', root + f]).then(() => null, e => `${f}: ${e.stderr.split('\n').slice(0, 4).join(' ')}`)));
  assert.deepEqual(results.filter(Boolean), []);
});
