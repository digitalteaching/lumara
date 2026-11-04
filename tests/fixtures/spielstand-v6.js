// NIE ÄNDERN. Das ist der Inhalt von spielstand-v6.txt, einem Spielstand im Format 6.
// Jede spätere Spielfassung muss ihn laden können (Design 11).

import { SPIELSTAND_V5 } from './spielstand-v5.js';

export const SPIELSTAND_V6 = {
  ...structuredClone(SPIELSTAND_V5),
  version: 6,
  finale: { done: true },
};
