// Datum, Uhrzeit und Spielzeit auf Deutsch, in Ortszeit. Ohne Intl, damit es überall gleich aussieht.

const pad = n => String(n).padStart(2, '0');

export function formatDate(ms) {
  const d = new Date(ms);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

export function formatDateTime(ms) {
  const d = new Date(ms);
  return `${formatDate(ms)}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function isoDate(ms) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Spielzeit als h:mm, angefangene Minuten zählen nicht.
export function formatPlayTime(ms) {
  const minutes = Math.floor(ms / 60000);
  return `${Math.floor(minutes / 60)}:${pad(minutes % 60)}`;
}
