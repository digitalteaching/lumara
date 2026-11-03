// Spielstand im localStorage (Design 11): ein Hauptstand und der vorige Stand als Sicherung.
// Beim Laden wird nie geschrieben. Ein kaputter Hauptstand wird beim Speichern nicht in die
// Sicherung kopiert, damit er eine gute Sicherung nicht verdrängt.

import { encodeSave, decodeSave } from './codec.js';
import { migrateState } from './migrate.js';

export const SAVE_KEYS = Object.freeze({ main: 'lumara.spielstand.v1', backup: 'lumara.spielstand.v1.vorher' });

function defaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

// → { status: 'none' } | { status: 'ok' | 'newer' | 'invalid', state? }
function readSlot(storage, key) {
  let text = null;
  try {
    text = storage?.getItem(key) ?? null;
  } catch {
    return { status: 'none' };
  }
  if (text === null) return { status: 'none' };
  const d = decodeSave(text);
  if (!d.ok) return { status: 'invalid' };
  const m = migrateState(d.value);
  if (!m.ok) return { status: m.reason };
  return { status: 'ok', state: m.state };
}

export function createSaveStore(storage = defaultStorage(), { now = Date.now } = {}) {
  return {
    load() {
      const main = readSlot(storage, SAVE_KEYS.main);
      if (main.status === 'ok') return { status: 'ok', state: main.state };
      if (main.status === 'newer') return { status: 'newer' };
      const backup = readSlot(storage, SAVE_KEYS.backup);
      if (backup.status === 'ok') return { status: 'backup', state: backup.state };
      if (main.status === 'none' && backup.status === 'none') return { status: 'none' };
      return { status: 'damaged' };
    },
    save(state) {
      if (!storage) return false;
      try {
        state.savedAt = now();
        const prev = storage.getItem(SAVE_KEYS.main);
        if (prev !== null && decodeSave(prev).ok) storage.setItem(SAVE_KEYS.backup, prev);
        storage.setItem(SAVE_KEYS.main, encodeSave(state));
        return true;
      } catch {
        return false;
      }
    },
    clear() {
      try {
        storage?.removeItem(SAVE_KEYS.main);
        storage?.removeItem(SAVE_KEYS.backup);
      } catch {
        // nichts zu tun
      }
    },
  };
}
