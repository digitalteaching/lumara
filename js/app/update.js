// Updates zuverlässig ausliefern (Design 16): Die Versionsdatei kommt immer zuerst übers Netz.
// Eine neue Fassung lädt der Service Worker im Hintergrund und übernimmt sofort; das laufende
// Spiel lädt aber nie selbst neu. Die neue Fassung ist beim nächsten Öffnen aktiv, nie mitten im Duell.

const parse = v => (typeof v === 'string' && /^\d+\.\d+\.\d+$/.test(v) ? v.split('.').map(Number) : null);

export function isNewer(a, b) {
  const x = parse(a);
  const y = parse(b);
  if (!x || !y) return false;
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i];
  return false;
}

// version: laufende Fassung; onReady: eine neue Fassung liegt für den nächsten Start bereit.
export async function bootUpdates({ version, onReady }) {
  const sw = navigator.serviceWorker;
  if (!sw) return;
  try {
    // Nur wenn schon eine Fassung lief, ist ein neuer Worker ein Update (sonst die erste Installation).
    const hadController = !!sw.controller;
    let told = false;
    const ready = () => {
      if (told || !hadController) return;
      told = true;
      onReady();
    };
    const watch = worker => worker?.addEventListener('statechange', () => {
      if (worker.state === 'installed' || worker.state === 'activated') ready();
    });

    const reg = await sw.register('sw.js', { updateViaCache: 'none' });
    reg.addEventListener('updatefound', () => watch(reg.installing));
    // Der Browser prüft beim Anmelden selbst; die neue Fassung kann schon unterwegs oder fertig sein.
    watch(reg.installing);
    if (reg.waiting) ready();

    const res = await fetch('version.json', { cache: 'no-store' });
    const remote = (await res.json())?.version;
    if (isNewer(remote, version)) {
      if (!reg.installing && !reg.waiting) await reg.update();
      // Kein Worker mehr in Arbeit: Die neue Fassung ist schon übernommen und startet beim nächsten Öffnen.
      if (!reg.installing) ready();
    }
  } catch {
    // ohne Netz oder ohne Service Worker spielt man einfach mit der vorhandenen Fassung
  }
}

// Auf dem eigenen Rechner ohne ?sw: Registrierungen entfernen, damit immer frische Dateien kommen.
export async function removeServiceWorkers() {
  try {
    const regs = (await navigator.serviceWorker?.getRegistrations()) ?? [];
    await Promise.all(regs.map(r => r.unregister()));
  } catch {
    // nichts zu tun
  }
}
