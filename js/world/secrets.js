// Geheime Orte (Design 5.7): Eingang nur mit dem passenden Schlüsselgegenstand; der Geschichtsstein
// und der seltene Stein gibt es je Ort genau einmal (state.secrets). DOM-frei.

import { CONFIG } from '../config.js';
import { SECRET_PLACES } from '../data/secrets.js';
import { secretStory } from '../data/story.js';
import { hasKey } from '../items/keys.js';
import { addItem } from '../items/bag.js';
import { cellKey } from './map.js';

export const secretOpen = (state, entrance) => hasKey(state, SECRET_PLACES[entrance.place]?.key);

const entry = (state, place) => {
  state.secrets ??= {};
  return (state.secrets[place] ??= { story: false, stone: false });
};

export function takeSecretStory(state, place) {
  if (!SECRET_PLACES[place]) return null;
  const e = entry(state, place);
  if (e.story) return null;
  e.story = true;
  return secretStory(place);
}

// Wirken schon alle Lebenssteine, wird aus einem Lebensstein ein Weitblickstein (wie bei Funden).
export function takeSecretStone(state, place) {
  const spot = SECRET_PLACES[place];
  if (!spot) return null;
  const e = entry(state, place);
  if (e.stone) return null;
  e.stone = true;
  const item = spot.stone === 'life' && state.creature.lifeStones >= CONFIG.creature.maxLifeStones ? 'farsight' : spot.stone;
  addItem(state, item);
  return item;
}

// Ein noch liegender seltener Stein belegt sein Feld: Wer darauf zu drückt, dreht sich zu ihm
// (wie zu jedem anderen Ding, das man ansprechen kann) und kann ihn mit A nehmen.
export function blockedCells(def, state) {
  const s = def.secretStone;
  return new Set(s && !state.secrets?.[s.place]?.stone ? [cellKey(s.x, s.y)] : []);
}
