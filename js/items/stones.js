// Seltene Steine (Design 8.2): Weitblick, Glanz und Leben. Sie liegen an festen Fundstellen, die
// nach einer Weile Spielzeit wieder glitzern, oder werden selten im hohen Gras gefunden. DOM-frei.

import { CONFIG } from '../config.js';
import { addItem, takeItem } from './bag.js';

export const STONE_LINES = {
  farsight: () => 'Du findest einen Weitblickstein!',
  shine: () => 'Du findest einen Glanzstein!',
  life: name => `Ein Lebensstein! ${name} hat jetzt dauerhaft 1 Energie mehr.`,
};

// Aus der Fundtabelle. Wirken schon alle Lebenssteine, wird aus „Leben“ ein Weitblickstein.
export function rollStone(state, rng) {
  const table = Object.entries(CONFIG.finds.table);
  const total = table.reduce((n, [, w]) => n + w, 0);
  let r = rng.next() * total;
  let item = table.at(-1)[0];
  for (const [k, w] of table) {
    if (r < w) {
      item = k;
      break;
    }
    r -= w;
  }
  if (item === 'life' && state.creature.lifeStones >= CONFIG.creature.maxLifeStones) return 'farsight';
  return item;
}

export const findKey = (mapId, f) => `${mapId}:${f.x},${f.y}`;

export const findReady = (state, key) => (state.world.finds[key] ?? 0) <= state.playMs;

// Glitzert die Fundstelle gerade nicht (etwa bei einem Doppeltipp), gibt es nichts.
export function takeFind(state, key, rng) {
  if (!findReady(state, key)) return { item: null, added: 0 };
  const item = rollStone(state, rng);
  const added = addItem(state, item);
  state.world.finds[key] = state.playMs + CONFIG.finds.respawnMs;
  return { item, added };
}

// Glanzstein aus dem Rucksack einsetzen: doppelte XP beim nächsten Sieg. Nur einer zugleich.
export function useShine(state) {
  if (state.shineActive || !takeItem(state, 'shine')) return false;
  state.shineActive = true;
  return true;
}

// Bei jedem Schritt im hohen Gras: selten ein Stein, gleich im Rucksack (oder im Wesen).
export function stepFind(state, rng) {
  if (!(rng.next() < CONFIG.finds.stepChance)) return null;
  const item = rollStone(state, rng);
  addItem(state, item);
  return item;
}
