import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inflateSync } from 'node:zlib';
import { encodePng } from '../tools/png.js';
import { renderIcon } from '../tools/icon.js';

test('PNG hat Signatur, Kopf und Größe', () => {
  const png = encodePng(2, 1, new Uint8Array([255, 0, 0, 255, 0, 0, 255, 128]));
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(png.readUInt32BE(16), 2);
  assert.equal(png.readUInt32BE(20), 1);
  assert.equal(png[24], 8);
  assert.equal(png[25], 6);
  assert.deepEqual([...png.subarray(-12)], [0, 0, 0, 0, 73, 69, 78, 68, 0xae, 0x42, 0x60, 0x82]);
});

test('Bilddaten lassen sich wieder entpacken', () => {
  const png = encodePng(2, 1, new Uint8Array([255, 0, 0, 255, 0, 0, 255, 128]));
  const i = png.indexOf('IDAT');
  const len = png.readUInt32BE(i - 4);
  assert.deepEqual([...inflateSync(png.subarray(i + 4, i + 4 + len))], [0, 255, 0, 0, 255, 0, 0, 255, 128]);
});

test('Symbol hat die gewünschte Größe und ist überall deckend', () => {
  const px = renderIcon(192);
  assert.equal(px.length, 192 * 192 * 4);
  for (let i = 3; i < px.length; i += 4) if (px[i] !== 255) assert.fail(`Pixel ${(i - 3) / 4} ist durchsichtig`);
});
