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
