// Spielzustand im Speicher. Ab Plan 2 wird er gespeichert, deshalb schon jetzt mit Versionsnummer
// und mit dem Fortschritt pro Lernpaket (Design 10.4, 11).

import { CONFIG } from './config.js';
import { maxEnergy } from './duel/progress.js';
import { BUCHT } from './world/maps/bucht.js';

export function newGameState({ name, species, nickname }) {
  const creature = { species, nickname: nickname || null, level: 1, xpInLevel: 0, energy: 0, lifeStones: 0 };
  creature.energy = maxEnergy(creature);
  return {
    version: 1,
    name,
    creature,
    position: { map: 'bucht', ...BUCHT.spawn },
    packs: {},
  };
}

export function validateName(raw) {
  const value = raw.normalize('NFC').trim().replace(/\s+/g, ' ');
  if (!value) return { ok: false, message: 'Bitte gib einen Namen ein.' };
  if ([...value].length > CONFIG.names.maxLength) return { ok: false, message: `Höchstens ${CONFIG.names.maxLength} Zeichen.` };
  return { ok: true, value };
}

export function packProgress(state, shortId) {
  state.packs[shortId] ??= { beaten: [], history: {} };
  return state.packs[shortId];
}
