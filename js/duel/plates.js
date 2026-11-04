// Was das eigene Namensschild an Energie zeigt. Während des Duells die Werte des Duells; ist es vorbei
// (etwa nach einer Entwicklung mit neuem Energiefeld), die des Wesens selbst. DOM-frei.

import { maxEnergy } from './progress.js';

// Deckkraft eines Wesens im Duell: Erschöpfen (faint: Startzeit, 600 ms) mal Überblenden (fade 0 bis 1).
export function creatureAlpha(faint, t, fade = 1) {
  const a = faint === null ? 1 : Math.max(0, 1 - (t - faint) / 600);
  return a * fade;
}

// Der Balken des Endgegners: Nach dem letzten Treffer einer Phase bleibt er leer, bis die neue Gestalt
// erscheint, sonst sähe der Treffer aus wie eine Heilung.
export const foeEnergyShown = (duel, holding) => (holding ? 0 : duel.foeEnergy);

export function ownEnergyShown(duel, creature, over) {
  return over ? { energy: creature.energy, max: maxEnergy(creature) } : { energy: duel.playerEnergy, max: duel.playerMax };
}
