// NIE ÄNDERN. Das ist der Inhalt von spielstand-v7.txt, einem Spielstand im Format 7.
// Jede spätere Spielfassung muss ihn laden können (Design 11).

import { SPIELSTAND_V6 } from './spielstand-v6.js';

const v6 = structuredClone(SPIELSTAND_V6);
export const SPIELSTAND_V7 = {
  ...v6,
  version: 7,
  packs: Object.fromEntries(Object.entries(v6.packs).map(([id, p]) => [id, { ...p, tiers: { 1: 2, 9: 1 } }])),
};
