// NIE ÄNDERN. Das ist der Inhalt von spielstand-v5.txt, einem Spielstand im Format 5.
// Jede spätere Spielfassung muss ihn laden können (Design 11).

import { SPIELSTAND_V4 } from './spielstand-v4.js';

export const SPIELSTAND_V5 = {
  ...structuredClone(SPIELSTAND_V4),
  version: 5,
  quests: { q1: { step: 1, done: false } },
  keys: ['foodbag'],
  secrets: {},
};
