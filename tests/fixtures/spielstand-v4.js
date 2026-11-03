// NIE ÄNDERN. Das ist der Inhalt von spielstand-v4.txt, einem Spielstand im Format 4.
// Jede spätere Spielfassung muss ihn laden können (Design 11).

import { SPIELSTAND_V3 } from './spielstand-v3.js';

export const SPIELSTAND_V4 = {
  ...structuredClone(SPIELSTAND_V3),
  version: 4,
  book: { haeuschel: { beaten: true, shiny: false }, moosling: { beaten: false, shiny: true } },
};
