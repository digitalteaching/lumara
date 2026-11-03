// Zeitdruck (Design 7.1, 7.4): Wie viel Zeit ein Kind für eine Frage hat. Nur Trainer mit Zeit in
// CONFIG.trainers haben eine Uhr (ab Trainer 4), wilde Wesen und Zettel nie. DOM-frei.

import { CONFIG } from '../config.js';

const FORM_FACTOR = { choice: 1, typing: CONFIG.time.typing, tiles: CONFIG.time.tiles };

// Grundzeit des Trainers × Antwortform × Paketeinstellung × Flausch, in ganzen Millisekunden.
// null: keine Uhr (kein Trainer, Trainer ohne Zeit oder ZEITDRUCK: aus).
export function questionTimeMs({ trainerNumber, form, setting, species }) {
  if (trainerNumber == null || setting === 'aus') return null;
  const base = CONFIG.trainers[trainerNumber - 1]?.time;
  if (!base) return null;
  let s = base * (FORM_FACTOR[form] ?? 1);
  if (setting === 'lang') s *= CONFIG.time.long;
  if (species === 'flausch') s *= 1 + CONFIG.time.flausch; // Flausch: Geduld (Design 6.1)
  return Math.round(s * 1000);
}

// Für createDuel({ timeFor }): setup.time = { trainerNumber, setting } oder fehlt (keine Uhr).
export function timerFor(setup, species) {
  const time = setup?.time;
  if (!time) return () => null;
  return presented => questionTimeMs({ trainerNumber: time.trainerNumber, form: presented.form, setting: time.setting, species });
}
