// Leuchtturm-Aufstieg (Design 9): Etage für Etage ein Duell gegen ein zufälliges wildes Wesen, die
// Fragen aus allen Themen. Gegner-Energie 4 + Etage/3 (höchstens 15), Uhr ab Etage 5, Energie nur
// nach jeder fünften Etage zurück. Die höchste Etage steht pro Paket in stats.floor. DOM-frei.

import { CONFIG } from '../config.js';
import { AREA_WILD, CAVE_SPECIES } from '../data/species.js';
import { poolFor } from './questions.js';
import { xpForWin } from './progress.js';

const A = () => CONFIG.ascent;

// Alle wilden Arten der acht Gebiete und der Höhle, ohne geheime Arten und ohne Morrow (beim ersten
// Gebrauch gebaut, damit sich die Module beim Laden nicht im Kreis brauchen).
let speciesPool = null;
const SPECIES_POOL = () => (speciesPool ??= [...new Set([...[1, 2, 3, 4, 5, 6, 7, 8].flatMap(a => [...AREA_WILD[a].common, AREA_WILD[a].rare]), ...CAVE_SPECIES])]);

export const ascentEnergy = floor => Math.min(A().energyMax, A().energyBase + Math.floor(floor / A().energyPer));
export const ascentSeconds = floor => (floor < A().clockFrom ? null : Math.max(A().secondsMin, A().secondsStart - (floor - A().clockFrom)));
export const ascentXp = (floor, flawless) => xpForWin({ kind: 'ascent', floor, flawless });
export const refillAfter = floor => floor % A().refillEvery === 0;
// Volle Energie vor der ersten Etage (fairer Start) und nach jeder fünften.
export const refillBefore = floor => floor === 1 || refillAfter(floor - 1);

export function recordFloor(progress, floor) {
  progress.stats.floor = Math.max(progress.stats.floor ?? 0, floor);
}

export function ascentFoe(floor, rng) {
  return {
    species: rng.pick(SPECIES_POOL()),
    stage: 1,
    level: Math.min(CONFIG.creature.maxLevel, A().levelBase + A().levelPer * floor),
    maxEnergy: ascentEnergy(floor),
  };
}

export function ascentSetup(pack, floor, rng) {
  const seconds = ascentSeconds(floor);
  return {
    kind: 'ascent',
    area: 1,
    arena: 'tower',
    floor,
    foe: ascentFoe(floor, rng),
    pool: poolFor(pack, { kind: 'boss' }),
    ...(seconds ? { time: { seconds, setting: pack.timePressure } } : {}),
  };
}
