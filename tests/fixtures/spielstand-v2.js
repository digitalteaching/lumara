// NIE ÄNDERN. Das ist der Inhalt von spielstand-v2.txt, einem Spielstand im Format 2.
// Jede spätere Spielfassung muss ihn laden können (Design 11).

import { SPIELSTAND_V1 } from './spielstand-v1.js';

export const SPIELSTAND_V2 = {
  ...structuredClone(SPIELSTAND_V1),
  version: 2,
  position: { map: 'wald', x: 19, y: 27, dir: 'up' },
  playMs: 9000000,
  stones: [1],
  lastStone: 1,
  bag: { berry: 4, starfruit: 1, farsight: 2, shine: 0 },
  shineActive: false,
  story: { 1: 2 },
  world: { bushes: { 'bucht:6,13': 9300000 }, notes: { 'bucht:3,12': 9600000 }, finds: {} },
};
