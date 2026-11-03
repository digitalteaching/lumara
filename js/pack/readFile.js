// Eine Paketdatei lesen und prüfen (Design 10.1, 10.3). Benutzt vom Lade-Bildschirm, von
// „Lernpaket wechseln“ und von der Seite für Lehrkräfte. Liefert für Kinder nur ok/Fehlerliste;
// die Hinweise liest, wer sie braucht, direkt aus parsePack.

import { CONFIG } from '../config.js';
import { parsePack } from './parser.js';
import { decodePackBytes } from './decode.js';

export async function readPackFile(file) {
  if (file.size > CONFIG.pack.maxBytes) return { ok: false, details: ['Die Datei ist größer als 1 MB.'] };
  let text;
  try {
    text = decodePackBytes(await file.arrayBuffer());
  } catch {
    return { ok: false, details: ['Die Datei konnte nicht gelesen werden.'] };
  }
  const r = parsePack(text);
  if (!r.ok) return { ok: false, details: r.errors.map(e => e.message) };
  return { ok: true, text, data: r.pack };
}
