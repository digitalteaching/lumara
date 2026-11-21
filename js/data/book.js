// Das Wesen-Buch (Design 6.4): 33 Einträge. Ein Eintrag ist „gesehen“ nach der ersten Begegnung
// (Silhouette und Fundort) und „besiegt“ nach dem ersten Sieg (Bild in Farbe und Beschreibung).
// Eine gesehene Glanzform bekommt einen Stern. Das Buch gehört dem Kind (Design 10.4). DOM-frei.

import { AREA_WILD, SECRET_SPECIES, CAVE_SPECIES, BOSS_SPECIES, speciesText } from './species.js';
import { MAPS, mapOfArea, areaName } from '../world/network.js';
import { t } from '../i18n/i18n.js';
import { SPECIES } from './species.js';

export const BOOK_SIZE = 33;

// Nummer = Platz + 1. 1–24: wilde Arten nach Gebiet (häufig, häufig, selten). 25–30: die seltenen
// Arten der geheimen Orte (Plan 4c, 4d). 31–32: die Arten der Höhle, 33: Morrow (Finale).
export const BOOK_SLOTS = [
  ...[1, 2, 3, 4, 5, 6, 7, 8].flatMap(a => [...AREA_WILD[a].common, AREA_WILD[a].rare]),
  ...SECRET_SPECIES,
  ...CAVE_SPECIES,
  ...BOSS_SPECIES,
  ...Array(Math.max(0, BOOK_SIZE - 24 - SECRET_SPECIES.length - CAVE_SPECIES.length - BOSS_SPECIES.length)).fill(null),
];
const IN_BOOK = new Set(BOOK_SLOTS.filter(Boolean));

// Eine Begegnung eintragen. Was einmal besiegt oder als Glanzform gesehen ist, bleibt es.
export function recordSighting(state, speciesId, { beaten = false, shiny = false } = {}) {
  if (!IN_BOOK.has(speciesId)) return;
  state.book ??= {};
  const e = (state.book[speciesId] ??= { beaten: false, shiny: false });
  if (beaten) e.beaten = true;
  if (shiny) e.shiny = true;
}

export function bookView(state) {
  const book = state.book ?? {};
  const friends = state.friends ?? {};
  const entries = BOOK_SLOTS.map((id, i) => {
    const e = id ? book[id] : null;
    const status = !e ? 'unknown' : e.beaten ? 'beaten' : 'seen';
    const text = e ? speciesText(id) : null;
    // Fundort: die eigene Karte der Art (etwa die Höhle), sonst die Karte ihres Gebiets.
    const place = e ? (MAPS[SPECIES[id].home] ?? mapOfArea(SPECIES[id].area)) : null;
    return {
      number: i + 1,
      id,
      status,
      shiny: !!e?.shiny,
      friend: !!(id && friends[id]),
      name: text ? text.names[0] : null,
      place: place ? areaName(place) : null,
      description: e?.beaten ? text.description : null,
    };
  });
  return {
    total: BOOK_SIZE,
    seen: entries.filter(x => x.status !== 'unknown').length,
    beaten: entries.filter(x => x.status === 'beaten').length,
    friends: entries.filter(x => x.friend).length,
    entries,
  };
}

export function bookLabels({ status, shiny, friend }) {
  const out = [t(`book.${status}`)];
  if (friend) out.push(t('book.friend'));
  if (shiny) out.push(t('book.shinySeen'));
  return out;
}
