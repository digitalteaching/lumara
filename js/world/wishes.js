// Wünsche der Bewohner (Lumara 1.3, Spec 7.2): Acht Bewohner wünschen sich je einen Schatz. Gibt das
// Kind ihn her, gibt es eine Belohnung. Ein Wunsch bleibt offen, bis er erfüllt ist; der nächste
// kommt am nächsten Kalendertag. DOM-frei. Der Tag kommt immer als Argument.

import { CONFIG } from '../config.js';
import { t } from '../i18n/i18n.js';
import { emit } from './events.js';
import { areaOpen, mapOfArea, areaAt } from './network.js';
import { TREASURES, AREA_TREASURES, takeTreasure } from '../items/treasures.js';
import { addItem } from '../items/bag.js';
import { gainXp } from '../duel/progress.js';

// Gebiet → Karte und Bewohner. Keiner von ihnen gibt einen Auftrag.
export const WISH_GIVERS = {
  1: { map: 'bucht', npc: 'pim' },
  2: { map: 'wald', npc: 'lio' },
  3: { map: 'moor', npc: 'nele' },
  4: { map: 'duenen', npc: 'talia' },
  5: { map: 'klippen', npc: 'ina' },
  6: { map: 'ruinen', npc: 'greta' },
  7: { map: 'see', npc: 'ari' },
  8: { map: 'wiese', npc: 'kai' },
};

const AREAS = Object.keys(WISH_GIVERS).map(Number);
const areaOfNpc = npc => AREAS.find(a => WISH_GIVERS[a].npc === npc);
const open = (state, pack) => AREAS.filter(a => areaOpen(state, pack, a));

export const wishOf = (state, npc) => state.wishes?.[npc] ?? null;

// Wer wünscht sich diesen Schatz gerade noch?
export const wishersOf = (state, treasureId) =>
  Object.entries(state.wishes ?? {}).filter(([, w]) => w && w.done === false && w.treasure === treasureId).map(([npc]) => npc);

// Häufige Schätze aller offenen Gebiete (die aus anderen Gebieten mit otherAreaWeight), dazu selten
// ein seltener (Gewicht 1 zusammen). Nie einer, den sich ein anderer Bewohner gerade wünscht, solange es Alternativen gibt.
export function pickWishTreasure(state, pack, area, rng) {
  const areas = open(state, pack);
  const taken = new Set(Object.entries(state.wishes ?? {}).filter(([npc, w]) => w?.done === false && npc !== WISH_GIVERS[area]?.npc).map(([, w]) => w.treasure));
  const w = CONFIG.wishes.otherAreaWeight;
  const rares = areas.map(a => AREA_TREASURES[a].rare);
  let cands = [
    ...areas.flatMap(a => AREA_TREASURES[a].common.map(id => ({ id, weight: a === area ? 1 : w }))),
    ...rares.map(id => ({ id, weight: 1 / rares.length })),
  ];
  const free = cands.filter(c => !taken.has(c.id));
  if (free.length) cands = free;
  return rng.weighted(cands, c => c.weight).id;
}

// Gibt die Bewohner zurück, die einen neuen Wunsch bekommen haben.
export function ensureWishes(state, pack, today, rng) {
  state.wishes ??= {};
  const news = [];
  for (const area of open(state, pack)) {
    const { npc } = WISH_GIVERS[area];
    const w = state.wishes[npc];
    if (w && !(w.done && w.day < today)) continue;
    state.wishes[npc] = { treasure: pickWishTreasure(state, pack, area, rng), day: today, done: false };
    news.push(npc);
  }
  return news;
}

export const canGive = (state, npc) => {
  const w = wishOf(state, npc);
  return !!w && w.done === false && (state.treasures?.[w.treasure] ?? 0) > 0;
};

// Nimmt den Schatz (das Album behält ihn) und gibt eine Belohnung. Null, wenn nichts zu geben ist.
export function giveWish(state, npc, rng) {
  if (!canGive(state, npc)) return null;
  const w = state.wishes[npc];
  const levelBefore = state.creature.level;
  takeTreasure(state, w.treasure);
  const R = CONFIG.wishes;
  let reward = rng.weighted(Object.keys(R.rewards), k => R.rewards[k]);
  const out = { reward, levelBefore };
  if (reward === 'starfruit') {
    if (addItem(state, 'starfruit', 1) > 0) out.item = 'starfruit';
    else reward = out.reward = 'stone';
  }
  if (reward === 'stone') {
    out.item = rng.pick(['farsight', 'shine']);
    addItem(state, out.item, 1);
  } else if (reward === 'treats') {
    out.item = 'treat';
    addItem(state, 'treat', R.treats);
  } else if (reward === 'xp') {
    out.xp = R.xp;
    gainXp(state.creature, R.xp);
  }
  w.done = true;
  emit(state, 'wish');
  return out;
}

// Wo man den Schatz findet: häufige im Gras, an Glitzerstellen und unter Zetteln, seltene in Verstecken und bei der Spielaufgabe.
export function wishHint(treasureId) {
  const tr = TREASURES.find(x => x.id === treasureId);
  const where = areaAt(mapOfArea(tr.area));
  return t(tr.rarity === 'rare' ? 'wish.hint.rare' : 'wish.hint.common', { area: where });
}
