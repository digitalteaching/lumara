// NIE ÄNDERN. Das ist der Inhalt von spielstand-v9.txt, einem Spielstand im Format 9.
// Jede spätere Spielfassung muss ihn laden können (Design 11).
// Die Möwenfeder ist schon hergegeben, deshalb steht sie im Album ohne Anzahl.

import { SPIELSTAND_V8 } from './spielstand-v8.js';

export const SPIELSTAND_V9 = {
  ...structuredClone(SPIELSTAND_V8),
  version: 9,
  treasures: { glassshell: 2, acorncap: 1 },
  album: ['glassshell', 'gullfeather', 'acorncap'],
};
