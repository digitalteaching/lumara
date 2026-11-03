// Sicherungsdatei (Design 11): verschleierter Spielstand samt Lernpaket in einer Textdatei.
// So kommt ein Kind von Safari in die Home-Bildschirm-App, auf ein neues Gerät oder nach dem
// Löschen der Browserdaten zurück zu seinem Spiel. Format nie ändern, höchstens neu nummerieren.

import { encodeSave, decodeSave } from './codec.js';
import { migrateState } from './migrate.js';
import { t } from '../i18n/i18n.js';
import { formatDateTime, isoDate } from '../ui/format.js';

const HEADER = 'LUMARA-SICHERUNG';
const VERSION = 1;

// Warum eine Sicherung nicht geladen wird, in der Spielsprache: pack, unknown, damaged oder newer.
export const backupMessage = kind => t(`backup.msg.${kind}`);

// Kommentarzeilen bleiben kurz, damit ein Mailprogramm sie nicht umbricht.
export function createBackupText(state, packText) {
  return [
    `${HEADER} ${VERSION}`,
    `# ${t('backup.fileTitle', { name: state.name })}`,
    `# ${t('backup.fileLevel', { level: state.creature.level, date: formatDateTime(state.savedAt) })}`,
    `# ${t('backup.fileHow1')}`,
    `# ${t('backup.fileHow2')}`,
    encodeSave({ state, pack: packText }),
    '',
  ].join('\n');
}

const looksLikePack = text => /^\s*(PAKET|KENNUNG|FACH)\s*:/im.test(text) || /===\s*TRAINER/i.test(text);

export function parseBackupText(text) {
  const lines = String(text ?? '').replace(/^﻿/, '').replace(/\r/g, '').split('\n');
  const first = lines.findIndex(l => l.trim());
  const head = first >= 0 ? lines[first].trim().match(new RegExp(`^${HEADER} (\\d+)$`)) : null;
  if (!head) return { ok: false, reason: looksLikePack(text ?? '') ? 'pack' : 'unknown' };
  if (Number(head[1]) > VERSION) return { ok: false, reason: 'newer' };
  if (Number(head[1]) !== VERSION) return { ok: false, reason: 'unknown' };

  // Umgebrochene Kommentarzeilen hinterlassen Bruchstücke ohne # vor den Daten. Die werden
  // nacheinander verworfen; die Prüfsumme sorgt dafür, dass nur die echten Daten passen.
  const rest = lines.slice(first + 1).filter(l => !l.trim().startsWith('#'));
  let d = { ok: false };
  for (let skip = 0; skip <= 8 && skip < rest.length && !d.ok; skip++) d = decodeSave(rest.slice(skip).join(''));
  if (!d.ok || typeof d.value?.pack !== 'string') return { ok: false, reason: 'damaged' };
  const m = migrateState(d.value.state);
  if (!m.ok) return { ok: false, reason: m.reason === 'newer' ? 'newer' : 'damaged' };
  return { ok: true, state: m.state, packText: d.value.pack };
}

export function backupFileName(name, ms) {
  const safe = String(name ?? '')
    .normalize('NFC')
    .trim()
    .replace(/[\\/:*?"<>|\u0000-\u001f\u007f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `Lumara-${safe || 'Spielstand'}-${isoDate(ms)}.txt`;
}

// Warnung vor einer älteren Sicherung (Design 11.4): beide Daten und Level nennen.
export function compareWithDevice(deviceState, backupState) {
  const backup = { level: backupState.creature.level, savedAt: backupState.savedAt };
  if (!deviceState) return { older: false, device: null, backup };
  const device = { level: deviceState.creature.level, savedAt: deviceState.savedAt };
  return { older: backup.savedAt < device.savedAt, device, backup };
}
