// Bytes einer Paketdatei in Text umwandeln. Lehrkräfte speichern oft aus Word oder dem Windows-Editor
// als „ANSI“ (Windows-1252); dann wären alle Umlaute kaputt. Deshalb: UTF-16 an der Markierung erkennen,
// sonst streng UTF-8, und wenn das nicht passt, Windows-1252.

// Windows-1252, Bytes 0x80–0x9F (übrige Bytes entsprechen direkt Unicode). Lücken bleiben wie im Standard.
const CP1252_HIGH = [
  0x20ac, 0x81, 0x201a, 0x192, 0x201e, 0x2026, 0x2020, 0x2021, 0x2c6, 0x2030, 0x160, 0x2039, 0x152, 0x8d, 0x17d, 0x8f,
  0x90, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014, 0x2dc, 0x2122, 0x161, 0x203a, 0x153, 0x9d, 0x17e, 0x178,
];

function decodeCp1252(bytes) {
  let out = '';
  for (const b of bytes) out += String.fromCharCode(b >= 0x80 && b < 0xa0 ? CP1252_HIGH[b - 0x80] : b);
  return out;
}

export function decodePackBytes(buffer) {
  const b = new Uint8Array(buffer);
  if (b[0] === 0xff && b[1] === 0xfe) return new TextDecoder('utf-16le').decode(b.subarray(2));
  if (b[0] === 0xfe && b[1] === 0xff) return new TextDecoder('utf-16be').decode(b.subarray(2));
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(b);
  } catch {
    return decodeCp1252(b);
  }
}
