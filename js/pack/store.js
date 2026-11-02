// Das Lernpaket bleibt auf dem Gerät gespeichert (Design 10.1).
// Jeder Zugriff ist abgesichert: privater Modus oder voller Speicher dürfen nichts kaputt machen.

const KEY = 'lumara.paket.v1';

function defaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function createPackStore(storage = defaultStorage()) {
  return {
    load() {
      try {
        return storage?.getItem(KEY) ?? null;
      } catch {
        return null;
      }
    },
    save(text) {
      try {
        if (!storage) return false;
        storage.setItem(KEY, text);
        return true;
      } catch {
        return false;
      }
    },
    clear() {
      try {
        storage?.removeItem(KEY);
      } catch {
        // nichts zu tun
      }
    },
  };
}
