// Statistik prüfen (Design 12.3): Die Lehrkraft tippt die Werte vom Screenshot ab.
// Großzügig beim Lesen, klar bei Fehlern, damit nie wegen der Schreibweise „passt nicht“ kommt.

import { ALPHABET } from '../pack/packId.js';
import { checkCode, normalizeCodeInput } from './checkCode.js';

const PACK_ID = new RegExp(`^[${ALPHABET}]{4}$`);
const FORBIDDEN = /[01OIL]/;

function intIn(raw, min, max) {
  const s = String(raw ?? '').trim();
  if (!/^\d+$/.test(s)) return null;
  const n = Number(s);
  return n >= min && n <= max ? n : null;
}

function minutesOf(raw) {
  const s = String(raw ?? '').trim();
  const hm = s.match(/^(\d+)[:.](\d{2})$/);
  if (hm) return Number(hm[2]) < 60 ? Number(hm[1]) * 60 + Number(hm[2]) : null;
  return /^\d+$/.test(s) ? Number(s) : null;
}

export function parseStatsForm(raw) {
  const problems = [];
  const name = String(raw.name ?? '').trim();
  if (!name) problems.push('Bitte gib den Namen ein.');
  const packId = String(raw.packId ?? '').trim().toUpperCase();
  if (!PACK_ID.test(packId)) problems.push('Die Paketkennung hat 4 Zeichen, zum Beispiel K7PX.');
  const level = intIn(raw.level, 1, 100);
  if (level === null) problems.push('Bitte gib das Level als Zahl ein.');
  const stage = intIn(raw.stage, 1, 4);
  if (stage === null) problems.push('Die Stufe ist eine Zahl von 1 bis 4.');
  const wins = intIn(raw.wins, 0, Number.MAX_SAFE_INTEGER);
  if (wins === null) problems.push('Bitte gib die gewonnenen Duelle als Zahl ein.');
  const accuracy = intIn(String(raw.accuracy ?? '').replace(/[%\s]/g, ''), 0, 100);
  if (accuracy === null) problems.push('Die Trefferquote ist eine Zahl von 0 bis 100.');
  const minutes = minutesOf(raw.playTime);
  if (minutes === null) problems.push('Spielzeit bitte wie im Spiel angeben, zum Beispiel 1:05.');
  const beaten = intIn(raw.trainers, 0, 8);
  if (beaten === null) problems.push('Die Zahl der besiegten Trainer ist 0 bis 8.');
  if (problems.length) return { ok: false, problems };
  return { ok: true, stats: { name, packId, level, stage, wins, accuracy, minutes, trainers: beaten + (raw.boss ? 1 : 0) } };
}

export function verifyCode(stats, rawCode) {
  const code = normalizeCodeInput(rawCode);
  if (FORBIDDEN.test(code)) return { ok: false, problem: 'Im Prüfcode kommen 0, O, 1, I und L nie vor. Schau noch einmal genau hin.' };
  if (code.length !== 6) return { ok: false, problem: 'Der Prüfcode hat 6 Zeichen, zum Beispiel K7P-3QX.' };
  return { ok: true, match: code === checkCode(stats) };
}
