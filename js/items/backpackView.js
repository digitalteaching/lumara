// Was der Rucksack zeigt (Lumara 1.1): vier Fächer (Futter, Steine, Schätze, Schlüssel) als reine
// Daten, ohne DOM. Die Rucksack-Seite zeichnet daraus die Taschen. Texte kommen aus i18n.

import { CONFIG } from '../config.js';
import { t } from '../i18n/i18n.js';
import { foodCount, foodMax } from './bag.js';
import { KEY_ITEMS, hasKey } from './keys.js';
import { TREASURES, treasureName, treasureText } from './treasures.js';
import { foodEnergy } from './food.js';
import { maxEnergy } from '../duel/progress.js';

export const POCKETS = ['food', 'stones', 'treasures', 'keys'];

const FOOD_ITEMS = ['berry', 'starfruit', 'treat'];
const STONE_ACTIONS = { farsight: 'duel', shine: 'shine', time: 'duel' };

const item = (state, id, action, disabled) => ({ id, kind: 'item', count: state.bag[id] ?? 0, known: true, action, disabled });

export function backpackView(state) {
  const c = state.creature;
  const shineActive = !!state.shineActive;
  const album = state.album ?? [];
  const treasures = state.treasures ?? {};

  const food = FOOD_ITEMS.map(id => id === 'treat'
    ? item(state, id, 'befriend', false)
    : item(state, id, 'feed', !(state.bag[id] > 0)));
  const stones = Object.entries(STONE_ACTIONS).map(([id, action]) =>
    item(state, id, action, id === 'shine' && (shineActive || !(state.bag[id] > 0))));
  const treasureItems = TREASURES.map(({ id }) => {
    const known = album.includes(id);
    return { id, kind: 'treasure', count: treasures[id] ?? 0, known, action: known ? 'view' : null, disabled: false };
  });
  const keys = KEY_ITEMS.filter(k => hasKey(state, k))
    .map(id => ({ id, kind: 'key', count: 1, known: true, action: null, disabled: false }));

  return {
    energy: c.energy,
    maxEnergy: maxEnergy(c),
    food: { n: foodCount(state.bag), max: foodMax(state) },
    lifeStones: { n: c.lifeStones, max: CONFIG.creature.maxLifeStones },
    shineActive,
    pockets: [
      { id: 'food', items: food },
      { id: 'stones', items: stones },
      { id: 'treasures', items: treasureItems, found: album.length, total: TREASURES.length },
      { id: 'keys', items: keys },
    ],
  };
}

// Der Rucksack geht nur beim Laufen auf, nicht in Duell, Dialog oder Menü, nicht, solange die
// Welt gesperrt ist (etwa während eines Gesprächs), und nicht während einer Überblendung (fading):
// Eine neue Welt ist beim Aufblenden noch nicht gesperrt, danach kann gleich ein Dialog kommen.
export const canOpenBackpack = ({ mode, locked, fading = false }) => mode === 'walk' && !locked && !fading;

export function itemName(entry) {
  if (entry.kind === 'treasure') return treasureName(entry.id);
  if (entry.kind === 'key') return t(`key.${entry.id}.name`);
  return t(`item.${entry.id}.name`);
}

export function itemText(entry, state) {
  if (entry.kind === 'treasure') return treasureText(entry.id);
  if (entry.kind === 'key') return t(`key.${entry.id}.text`);
  if (entry.id === 'berry') return t('item.berry.text', { n: foodEnergy(state.creature.species, 'berry') });
  return t(`item.${entry.id}.text`);
}
