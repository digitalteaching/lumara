// NIE ÄNDERN. Das ist der Inhalt von spielstand-v10.txt, einem Spielstand im Format 10.
// Jede spätere Spielfassung muss ihn laden können (Design 11).
// Zwei Freunde (einer glänzend), einer davon begleitet das Kind; Leckerli und ein Versteck sind dabei.

import { SPIELSTAND_V9 } from './spielstand-v9.js';

export const SPIELSTAND_V10 = {
  ...structuredClone(SPIELSTAND_V9),
  version: 10,
  friends: { gischtling: { shiny: false }, moosling: { shiny: true } },
  companion: 'moosling',
  tasks: [1],
  bag: { ...SPIELSTAND_V9.bag, treat: 2 },
  world: { ...SPIELSTAND_V9.world, hideouts: { 'bucht:3,4': 1200000 } },
};
