import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decodePackBytes } from '../js/pack/decode.js';

const bytes = arr => new Uint8Array(arr).buffer;

test('UTF-8 (auch mit BOM) wird normal gelesen', () => {
  const utf8 = new TextEncoder().encode('FRAGE: Wie heißt „Möwe“?');
  assert.equal(decodePackBytes(utf8.buffer), 'FRAGE: Wie heißt „Möwe“?');
  assert.equal(decodePackBytes(bytes([0xef, 0xbb, 0xbf, 0x41])), 'A');
});

test('Prüffokus: „ANSI“/Windows-1252 aus Word oder dem Editor ergibt richtige Umlaute', () => {
  // „Wie heißt Übung?“ in Windows-1252: ß = 0xDF, Ü = 0xDC, „ = 0x84, “ = 0x93
  const cp1252 = bytes([0x57, 0x69, 0x65, 0x20, 0x68, 0x65, 0x69, 0xdf, 0x74, 0x20, 0x84, 0xdc, 0x62, 0x75, 0x6e, 0x67, 0x93]);
  assert.equal(decodePackBytes(cp1252), 'Wie heißt „Übung“');
});

test('UTF-16 mit Bytefolge-Markierung wird erkannt', () => {
  assert.equal(decodePackBytes(bytes([0xff, 0xfe, 0x50, 0x00, 0xe4, 0x00])), 'Pä');
  assert.equal(decodePackBytes(bytes([0xfe, 0xff, 0x00, 0x50, 0x00, 0xe4])), 'Pä');
});
