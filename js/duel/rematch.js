// Revanchen (Design 7.5): Besiegte Trainer werden mit jeder gewonnenen Revanche eine Stufe stärker,
// höchstens Stufe 5. Auf Stufe s: Energie +2·s, Zeit Grundzeit × 0,9^s (nie unter 10 s; Trainer 1 bis 3
// haben in Revanchen eine Grundzeit von 40 s), XP Grundwert × (1 + 0,25·s). Die Stufen gehören zum
// Lernpaket (packs[id].tiers). DOM-frei.

import { CONFIG } from '../config.js';
import { poolFor } from './questions.js';
import { TRAINER_CREATURES } from '../data/species.js';

const R = () => CONFIG.rematch;

export const rematchStage = (progress, n) => Math.min((progress.tiers?.[n] ?? 0) + 1, R().maxTier);

// Ab der Revanche: null, solange der Trainer mit diesem Paket nicht besiegt ist.
export function rematchOffer(progress, n) {
  if (!progress.beaten?.includes(n)) return null;
  return { stage: rematchStage(progress, n), max: (progress.tiers?.[n] ?? 0) >= R().maxTier };
}

export function rematchSeconds(n, stage) {
  const base = CONFIG.trainers[n - 1]?.time ?? R().baseSeconds;
  return Math.max(R().minSeconds, base * R().timeFactor ** stage);
}

export function rematchSetup(pack, n, stage) {
  const t = pack.trainers.find(x => x.number === n);
  const cfg = CONFIG.trainers[n - 1];
  return {
    kind: 'trainer',
    area: n,
    rematch: stage,
    foe: { ...TRAINER_CREATURES[n], level: cfg.level + R().levelPerTier * stage, maxEnergy: cfg.energy + R().energyPerTier * stage },
    trainer: { number: n, name: t.name, lines: { hello: [t.rematch], win: t.win, loss: t.loss } },
    pool: poolFor(pack, { kind: 'trainer', trainerNumber: n }),
    time: { seconds: rematchSeconds(n, stage), setting: pack.timePressure },
  };
}

// Nach einem Revanche-Sieg: eine Stufe mehr, höchstens 5.
export function raiseTier(progress, n) {
  progress.tiers ??= {};
  progress.tiers[n] = Math.min(R().maxTier, (progress.tiers[n] ?? 0) + 1);
}
