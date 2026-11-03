// Verschleierung des Spielstands (Design 11): JSON → UTF-8 → XOR mit festem Schlüsselstrom → Base64,
// dazu eine gesalzene Prüfsumme. Das ist kein Schutz gegen Fachleute, nur eine Hürde gegen Herumbasteln.
// Schlüssel, Salz und Format nie ändern: Sonst lassen sich gespeicherte Stände nicht mehr laden.

import { hash32, mix32 } from '../core/hash.js';
import { createRng } from '../core/rng.js';

const KEY_SEED = 0x4c554d41; // „LUMA“
const SALT = 'Lumara·Spielstand·2026';
const CHUNK = 0x8000;

const encoder = new TextEncoder();

function keystreamXor(bytes) {
  const ks = createRng(KEY_SEED);
  const out = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) out[i] = bytes[i] ^ Math.floor(ks.next() * 256);
  return out;
}

function checksum(json) {
  return mix32(hash32(SALT + json)).toString(16).padStart(8, '0');
}

export function toBase64(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i += CHUNK) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  return btoa(bin);
}

export function fromBase64(text) {
  const bin = atob(text);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function encodeSave(value) {
  const json = JSON.stringify(value);
  return `${toBase64(keystreamXor(encoder.encode(json)))}.${checksum(json)}`;
}

export function decodeSave(text) {
  if (typeof text !== 'string') return { ok: false };
  try {
    const compact = text.replace(/\s+/g, '');
    const dot = compact.lastIndexOf('.');
    if (dot <= 0) return { ok: false };
    const bytes = keystreamXor(fromBase64(compact.slice(0, dot)));
    const json = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    if (checksum(json) !== compact.slice(dot + 1)) return { ok: false };
    return { ok: true, value: JSON.parse(json) };
  } catch {
    return { ok: false };
  }
}
