// Prüfcode (Design 12.2): 6 Zeichen ohne verwechselbare Zeichen, gesalzener Hash über die Werte
// der Statistikseite. Bewusst nur eine einfache Hürde. Salz und Rechnung nie ändern, sonst passen
// ausgegebene Codes nicht mehr.
//
// CheckStats = { name, packId, level, stage, wins, accuracy, minutes, trainers }

import { hash32, mix32 } from '../core/hash.js';
import { ALPHABET } from '../pack/packId.js';

const SALT = 'Lumara·Prüfcode·2026';
const RANGE = ALPHABET.length ** 6; // 31^6 = 887503681

// Die Lehrkraft tippt den Namen vom Screenshot ab: Groß- und Kleinschreibung, Leerzeichen und die
// Form des Apostrophs (das iPad macht aus ' ein ’) zählen nicht.
export function normalizeName(name) {
  return String(name ?? '').normalize('NFC').trim().replace(/\s+/g, ' ').replace(/[’‘`´]/g, "'").toLowerCase();
}

export function checkCode(s) {
  const payload = [normalizeName(s.name), String(s.packId).toUpperCase(), s.level, s.stage, s.wins, s.accuracy, s.minutes, s.trainers].join('|');
  let h = mix32(hash32(`${SALT}|${payload}`)) % RANGE;
  let out = '';
  for (let i = 0; i < 6; i++) {
    out = ALPHABET[h % ALPHABET.length] + out;
    h = Math.floor(h / ALPHABET.length);
  }
  return out;
}

export const formatCode = code => `${code.slice(0, 3)}-${code.slice(3)}`;

export const normalizeCodeInput = raw => String(raw ?? '').toUpperCase().replace(/[^0-9A-Z]/g, '');
