// Begegnungen im hohen Gras (Design 6.4): im Schnitt alle 15 Schritte, zwischen 8 und 25.

import { CONFIG } from '../config.js';

export function nextThreshold(rng) {
  const { minSteps, maxSteps, curve } = CONFIG.encounter;
  return minSteps + Math.floor((maxSteps - minSteps + 1) * Math.pow(rng.next(), curve));
}

export function createEncounterCounter(rng) {
  let count = 0;
  let threshold = nextThreshold(rng);
  return {
    onStep(inTallGrass) {
      if (!inTallGrass) return false;
      count++;
      if (count < threshold) return false;
      count = 0;
      threshold = nextThreshold(rng);
      return true;
    },
  };
}

// Glanzform (Design 6.4): selten, nur bei wilden Wesen.
export const rollShiny = rng => rng.next() < CONFIG.wild.shinyChance;

export function pickWild(areaTable, rng) {
  if (rng.next() < CONFIG.wild.rareChance) return areaTable.rare;
  return rng.pick(areaTable.common);
}

export function wildLevel(area, rng) {
  const [min, max] = CONFIG.wild.levelByArea[area - 1];
  return rng.int(min, max);
}
