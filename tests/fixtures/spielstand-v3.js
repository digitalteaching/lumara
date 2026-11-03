// NIE ÄNDERN. Das ist der Inhalt von spielstand-v3.txt, einem Spielstand im Format 3.
// Jede spätere Spielfassung muss ihn laden können (Design 11).

import { SPIELSTAND_V2 } from './spielstand-v2.js';

export const SPIELSTAND_V3 = { ...structuredClone(SPIELSTAND_V2), version: 3, bag: { berry: 4, starfruit: 1, farsight: 2, shine: 0, time: 1 } };
