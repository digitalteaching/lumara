// Leuchtsteine (Design 5.1): entzünden, reisen, aufwachen. DOM-frei.

import { packProgress, lightStone } from '../state.js';
import { BUCHT } from './maps/bucht.js';
import { areaOpen, beaconFront, mapOfBeacon, highestOpenStone, areaName } from './network.js';

// Entzündet wird im selben Schritt wie der Sieg (state.js, applyDuelResult).
export { lightStone };

export function visitStone(state, n) {
  if (state.stones.includes(n)) state.lastStone = n;
}

// Zu jedem entzündeten Stein in einem offenen Gebiet, aufsteigend.
export function travelTargets(state, pack) {
  return state.stones
    .map(n => ({ number: n, def: mapOfBeacon(n) }))
    .filter(t => t.def && areaOpen(state, pack, t.def.area))
    .map(t => ({ number: t.number, map: t.def.id, name: areaName(t.def) }));
}

// Vor dem zuletzt besuchten Stein, wenn sein Gebiet offen ist. Liegt es nach einem Paketwechsel im
// Nebel, vor dem höchsten entzündeten Stein in einem offenen Gebiet (wie beim Start), sonst am Leuchtturm.
export function respawnPoint(state, pack) {
  const def = state.lastStone ? mapOfBeacon(state.lastStone) : null;
  if (def && areaOpen(state, pack, def.area)) return { map: def.id, ...beaconFront(def, state.lastStone) };
  return highestOpenStone(state, pack) ?? { map: 'bucht', ...BUCHT.respawn };
}

// Der Stein leuchtet schon, aber mit diesem Paket ist der Trainer noch nicht besiegt (Design 10.4).
export function challengeMark(state, pack, number) {
  return state.stones.includes(number) && !packProgress(state, pack.shortId).beaten.includes(number);
}
