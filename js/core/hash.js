// FNV-1a, 32 Bit, über die UTF-8-Bytes eines Strings.
// Wird für die Paketkennung und später für den Prüfcode benutzt. Nie ändern:
// gespeicherte Werte hängen daran.

const encoder = new TextEncoder();

export function hash32(str) {
  let h = 0x811c9dc5;
  for (const b of encoder.encode(str)) {
    h ^= b;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

// Endmischung (wie bei Murmur3): verteilt kleine Unterschiede auf alle Bits.
// Für Prüfcode und Spielstand-Prüfsumme. Nie ändern.
export function mix32(h) {
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}
