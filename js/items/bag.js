// Rucksack (Design 8): Futter hat zusammen höchstens 10 Plätze, Steine unbegrenzt.
// Ein Lebensstein wird nicht getragen, er wirkt sofort auf das Wesen (höchstens 3).

import { CONFIG } from '../config.js';

export const FOOD = ['berry', 'starfruit'];
export const BAG_ITEMS = ['berry', 'starfruit', 'farsight', 'shine', 'time'];

export const foodCount = bag => FOOD.reduce((n, k) => n + (bag[k] ?? 0), 0);

export function emptyBag() {
  return { berry: 0, starfruit: 0, farsight: 0, shine: 0, time: 0 };
}

// Gibt zurück, wie viele wirklich dazukamen.
export function addItem(state, item, n = 1) {
  if (item === 'life') {
    const c = state.creature;
    const add = Math.max(0, Math.min(n, CONFIG.creature.maxLifeStones - c.lifeStones));
    c.lifeStones += add;
    c.energy += add; // die Höchstenergie steigt, das neue Feld ist gleich gefüllt
    return add;
  }
  const bag = state.bag;
  const room = FOOD.includes(item) ? Math.max(0, CONFIG.bag.foodMax - foodCount(bag)) : Infinity;
  const add = Math.max(0, Math.min(n, room));
  bag[item] = (bag[item] ?? 0) + add;
  return add;
}

export function takeItem(state, item) {
  if (!(state.bag[item] > 0)) return false;
  state.bag[item]--;
  return true;
}
