// Das Endduell gegen Morrow (Design 7.4): drei Phasen mit je 6 Energie, Fragen aus allen Themen,
// Uhr wie bei Trainer 8, angezeigtes Level 50. In jeder Phase eine andere Gestalt: erst der
// Nebelriese (Bild der Stufe 3), dann der Echoschwarm (Stufe 2), zuletzt der kleine Morrow (Stufe 1).
// DOM-frei.

import { CONFIG } from '../config.js';
import { poolFor } from './questions.js';
import { finaleDone } from '../world/finale.js';
import { tl, mark } from '../i18n/i18n.js';

// Morrows Zeilen: aus dem Abschnitt ENDGEGNER des Pakets (Design 10.2), sonst die festen Texte
// in der Spielsprache. win und loss sind leer, wenn das Paket keine hat.
export function bossLines(pack) {
  const b = pack?.boss;
  return {
    hello: b?.hello?.length ? b.hello.map(mark) : tl('boss.hello'),
    win: b?.win ? [mark(b.win)] : [],
    loss: b?.loss ? [mark(b.loss)] : [],
  };
}

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

// Erinnerungsduell mit Morrow am Leuchtturm (Design 9): nach dem Finale, mit einem Paket, das alle acht
// Trainer hat und mit dem alle acht besiegt sind.
const ALL = [1, 2, 3, 4, 5, 6, 7, 8];
export function rememberAvailable(state, pack) {
  const beaten = state.packs?.[pack.shortId]?.beaten ?? [];
  return finaleDone(state) && ALL.every(n => pack.trainers.some(t => t.number === n) && beaten.includes(n));
}

// Erst die Werte aus 7.4 (Stufe 0); ist der Endgegner mit dem Paket besiegt, Stufen wie bei Revanchen:
// je Phase 6 + 2·s Energie, Zeit 20 × 0,9^s (nie unter 10 s). Morrow ist in tiers die Nummer 9.
export function rememberSetup(pack, progress) {
  const R = CONFIG.rematch;
  const stage = progress.boss ? Math.min((progress.tiers?.[9] ?? 0) + 1, R.maxTier) : 0;
  const base = bossSetup(pack);
  const seconds = Math.max(R.minSeconds, CONFIG.trainers[CONFIG.boss.timeAs - 1].time * R.timeFactor ** stage);
  return {
    ...base,
    remember: true,
    rematch: stage,
    foe: { ...base.foe, level: CONFIG.boss.level + R.levelPerTier * stage, maxEnergy: CONFIG.boss.energy + R.energyPerTier * stage },
    time: { seconds, setting: pack.timePressure },
  };
}

// Warum das Erinnerungsduell noch nicht geht: Dem Paket fehlen Themen, oder es sind noch nicht alle
// Hüterinnen und Hüter damit besiegt. null: es geht.
export function rememberBlock(state, pack) {
  if (!ALL.every(n => pack.trainers.some(t => t.number === n))) return 'remember.needPack';
  return rememberAvailable(state, pack) ? null : 'remember.notYet';
}
