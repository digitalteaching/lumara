// NIE ÄNDERN. Das ist der Inhalt von spielstand-v8.txt, einem Spielstand im Format 8.
// Jede spätere Spielfassung muss ihn laden können (Design 11).

import { SPIELSTAND_V7 } from './spielstand-v7.js';

const v7 = structuredClone(SPIELSTAND_V7);
export const SPIELSTAND_V8 = {
  ...v7,
  version: 8,
  settings: { ...v7.settings, music: false, sfx: true },
};
