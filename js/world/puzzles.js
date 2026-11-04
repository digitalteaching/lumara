// Rätsel an geheimen Orten (Design 5.7): kurz, ohne Lernfragen, jederzeit von vorn. In der Sternwarte
// zeigt der Stern jedes Zahnrads nach oben, rechts, unten oder links (0 bis 3); A dreht es eine
// Vierteldrehung weiter. Stehen alle wie auf der Sternkarte, ist das Rätsel gelöst und bleibt es.
// Der Stand liegt in state.secrets[ort] als gears und solved. DOM-frei.

import { SECRET_PLACES } from '../data/secrets.js';

const goalOf = place => SECRET_PLACES[place]?.gears ?? null;

export const gearsOf = (state, place) => [...(state.secrets?.[place]?.gears ?? goalOf(place)?.map(() => 0) ?? [])];

export const puzzleSolved = (state, place) => state.secrets?.[place]?.solved === true;

// Liefert die neue Stellung des Rads und ob das Rätsel genau mit dieser Drehung gelöst wurde.
export function turnGear(state, place, index) {
  const goal = goalOf(place);
  if (!goal || !Number.isInteger(index) || index < 0 || index >= goal.length) return null;
  state.secrets ??= {};
  const e = (state.secrets[place] ??= { story: false, stone: false });
  e.gears ??= goal.map(() => 0);
  e.solved ??= false;
  e.gears[index] = (e.gears[index] + 1) % 4;
  const match = e.gears.every((g, i) => g === goal[i]);
  const solvedNow = match && !e.solved;
  if (match) e.solved = true;
  return { dir: e.gears[index], solvedNow };
}
