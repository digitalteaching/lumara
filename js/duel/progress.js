// Level, Erfahrung, Entwicklungsstufen und Energie (Design 6.2, 6.3). DOM-frei.
// Gespeichert werden Level und XP innerhalb des Levels, nicht die Gesamt-XP (Design 11).

import { CONFIG } from '../config.js';

const C = CONFIG.creature;
const X = CONFIG.xp;

export function xpToNext(level) {
  if (level >= C.maxLevel) return 0;
  return X.levelBase + X.levelPerLevel * level;
}

export function stageForLevel(level) {
  let stage = 1;
  C.stageLevels.forEach((from, i) => {
    if (level >= from) stage = i + 1;
  });
  return stage;
}

export function maxEnergy({ species, level, lifeStones = 0 }) {
  const stage = stageForLevel(level);
  return (
    C.baseEnergy +
    C.stageEnergyBonus[stage - 1] +
    Math.min(lifeStones, C.maxLifeStones) +
    (species === 'kiesel' ? C.kieselBonus : 0)
  );
}

export function addXp({ level, xpInLevel }, amount) {
  const stageBefore = stageForLevel(level);
  let lvl = level;
  let xp = xpInLevel + amount;
  let gained = 0;
  while (lvl < C.maxLevel && xp >= xpToNext(lvl)) {
    xp -= xpToNext(lvl);
    lvl++;
    gained++;
  }
  if (lvl >= C.maxLevel) xp = 0;
  return { level: lvl, xpInLevel: xp, levelsGained: gained, stageBefore, stageAfter: stageForLevel(lvl) };
}

export function xpForWin({ kind, area, trainerNumber, flawless }) {
  const base = kind === 'trainer' ? X.trainerBase + X.trainerPerNumber * trainerNumber : X.wildBase + X.wildPerArea * area;
  return flawless ? Math.round(base * (1 + X.flawlessBonus)) : base;
}
