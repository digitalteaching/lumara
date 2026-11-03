// Paketkennung (Design 10.2): KENNUNG oder der Inhalt ohne Kommentare und Leerzeilen,
// daraus eine Kurzform aus 4 Zeichen ohne verwechselbare Zeichen. Nie ändern: Statistiken hängen daran.

import { hash32 } from '../core/hash.js';

// Ohne verwechselbare Zeichen (kein 0, O, 1, I, L). Auch für den Prüfcode (Design 12.2).
export const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

export function packIdentity(text, kennung) {
  if (kennung) return kennung;
  return text
    .split(/\r\n|\r|\n/)
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'))
    .join('\n');
}

export function shortId(identity) {
  let h = hash32(identity);
  let out = '';
  for (let i = 0; i < 4; i++) {
    out += ALPHABET[h % ALPHABET.length];
    h = Math.floor(h / ALPHABET.length);
  }
  return out;
}
