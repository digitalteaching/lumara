// Das Endduell gegen Morrow (Design 7.4): drei Phasen mit je 6 Energie, Fragen aus allen Themen,
// Uhr wie bei Trainer 8, angezeigtes Level 50. In jeder Phase eine andere Gestalt: erst der
// Nebelriese (Bild der Stufe 3), dann der Echoschwarm (Stufe 2), zuletzt der kleine Morrow (Stufe 1).
// DOM-frei.

import { CONFIG } from '../config.js';
import { poolFor } from './questions.js';

export const foeStageForPhase = phase => CONFIG.boss.phases + 1 - phase;

export function bossSetup(pack) {
  const b = CONFIG.boss;
  return {
    kind: 'boss',
    area: 8,
    arena: 'cave',
    foe: { species: 'morrow', stage: foeStageForPhase(1), level: b.level, maxEnergy: b.energy, phases: b.phases },
    pool: poolFor(pack, { kind: 'boss' }),
    time: { trainerNumber: b.timeAs, setting: pack.timePressure },
  };
}
