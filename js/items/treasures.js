// Schätze (Lumara 1.1): 24 Sammelstücke, je Gebiet zwei häufige und ein seltener. Sie liegen im
// Rucksack (Anzahl) und im Album (einmal gefunden, bleibt). IDs sind englisch, Texte stehen in i18n/. DOM-frei.

import { t } from '../i18n/i18n.js';

const SETS = [
  [1, 'glassshell', 'gullfeather', 'amber'],
  [2, 'acorncap', 'goldleaf', 'whispercone'],
  [3, 'sporeball', 'dragonflywing', 'wispglass'],
  [4, 'sandrose', 'mirrorshard', 'sunprism'],
  [5, 'cloudwool', 'cliffcrystal', 'stormfeather'],
  [6, 'brassgear', 'clockspring', 'pocketwatch'],
  [7, 'frostflower', 'snowstone', 'aurorapearl'],
  [8, 'stardust', 'nightwool', 'cometshard'],
];

export const TREASURES = SETS.flatMap(([area, a, b, rare]) => [
  { id: a, area, rarity: 'common' },
  { id: b, area, rarity: 'common' },
  { id: rare, area, rarity: 'rare' },
]);

export const AREA_TREASURES = Object.fromEntries(SETS.map(([area, a, b, rare]) => [area, { common: [a, b], rare }]));

const IDS = TREASURES.map(x => x.id);

export const isTreasure = id => IDS.includes(id);

// Gibt zurück, wie viele wirklich dazukamen. Das Album bleibt in TREASURES-Reihenfolge.
export function addTreasure(state, id, n = 1) {
  if (!isTreasure(id) || !(n > 0)) return 0;
  state.treasures ??= {};
  state.album ??= [];
  state.treasures[id] = (state.treasures[id] ?? 0) + n;
  if (!state.album.includes(id)) state.album = IDS.filter(x => x === id || state.album.includes(x));
  return n;
}

export function takeTreasure(state, id) {
  if (!((state.treasures?.[id] ?? 0) > 0)) return false;
  state.treasures[id] -= 1;
  return true;
}

// Immer ein häufiger Schatz des Gebiets; die seltenen kommen von Fundstellen und Zetteln.
export function rollTreasure(area, rng) {
  const { common } = AREA_TREASURES[area];
  return common[Math.min(common.length - 1, Math.floor(rng.next() * common.length))];
}

export const treasureName = id => t(`treasure.${id}.name`);
export const treasureText = id => t(`treasure.${id}.text`);
