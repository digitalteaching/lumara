// Futter (Design 8): Beeren und Sternfrüchte geben Energie, Sträucher wachsen nach, wilde Wesen
// verlieren manchmal eine Beere. Pieks (Grüner Daumen) bekommt mehr aus Beeren und findet öfter
// welche. DOM-frei.

import { CONFIG } from '../config.js';
import { maxEnergy } from '../duel/progress.js';
import { addItem, takeItem } from './bag.js';

// Energie aus einem Stück Futter: eine Zahl oder 'full' (füllt ganz auf).
export function foodEnergy(species, item) {
  if (item === 'starfruit') return 'full';
  return species === 'pieks' ? CONFIG.food.berryPieks : CONFIG.food.berry;
}

// Außerhalb des Duells (Rucksack). Ist das Wesen schon satt, bleibt das Futter im Rucksack.
export function eat(state, item) {
  const c = state.creature;
  const room = maxEnergy(c) - c.energy;
  if (room <= 0 || !takeItem(state, item)) return { ok: false, gained: 0 };
  const v = foodEnergy(c.species, item);
  const gained = v === 'full' ? room : Math.min(v, room);
  c.energy += gained;
  return { ok: true, gained };
}

export const bushKey = (mapId, o) => `${mapId}:${o.x},${o.y}`;

// Ein Strauch trägt wieder, sobald die Spielzeit seinen Zeitpunkt erreicht (nie geerntet: sofort).
export const bushReady = (state, key) => (state.world.bushes[key] ?? 0) <= state.playMs;

export function harvest(state, key) {
  if (!bushReady(state, key)) return 'empty';
  if (!addItem(state, 'berry')) return 'full';
  state.world.bushes[key] = state.playMs + CONFIG.food.bushRegrowMs;
  return 'ok';
}

// Was nach einem Sieg gefunden wird, mit Herkunft: 'wild' (das wilde Wesen hat sie verloren) oder
// 'find' (Pieks hat sie gefunden). Beides kann zusammenkommen.
export function lootRolls(state, setup, rng) {
  const out = [];
  if (setup.kind === 'wild' && rng.next() < CONFIG.food.wildDropChance) out.push({ item: 'berry', source: 'wild' });
  if (state.creature.species === 'pieks' && rng.next() < CONFIG.food.pieksFindChance) out.push({ item: 'berry', source: 'find' });
  return out;
}

export const duelLoot = (state, setup, rng) => lootRolls(state, setup, rng).map(l => l.item);
