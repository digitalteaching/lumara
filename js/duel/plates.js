// Was das eigene Namensschild an Energie zeigt. Während des Duells die Werte des Duells; ist es vorbei
// (etwa nach einer Entwicklung mit neuem Energiefeld), die des Wesens selbst. DOM-frei.

import { maxEnergy } from './progress.js';

export function ownEnergyShown(duel, creature, over) {
  return over ? { energy: creature.energy, max: maxEnergy(creature) } : { energy: duel.playerEnergy, max: duel.playerMax };
}
