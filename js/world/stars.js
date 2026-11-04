// Sternschnuppen auf der Sternenwiese (Design 9): Nach dem Finale liegt eine gefallene Sternschnuppe
// im Sternengras. Alle 10 Minuten Spielzeit fällt sie woanders hin (def.starSpots). Wer in ihrer Nähe
// (2 Felder) auf ein wildes Wesen trifft, trifft viel öfter die seltene Art. DOM-frei.

import { CONFIG } from '../config.js';
import { finaleDone } from './finale.js';

const EVERY_MS = 10 * 60 * 1000;

export function fallenStarSpot(state, def) {
  if (!finaleDone(state) || !def.starSpots?.length) return null;
  return def.starSpots[Math.floor((state.playMs ?? 0) / EVERY_MS) % def.starSpots.length];
}

export const nearStar = (star, x, y) => !!star && Math.abs(star.x - x) + Math.abs(star.y - y) <= CONFIG.wild.starRadius;

export function rareChanceAt(state, def, x, y) {
  return nearStar(fallenStarSpot(state, def), x, y) ? CONFIG.wild.starRareChance : CONFIG.wild.rareChance;
}
