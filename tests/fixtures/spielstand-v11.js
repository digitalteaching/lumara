// NIE ÄNDERN. Das ist der Inhalt von spielstand-v11.txt, einem Spielstand im Format 11.
// Jede spätere Spielfassung muss ihn laden können (Design 11).
// Aushang mit drei Aufgaben, ein offener Wunsch und ein Ereignis.

import { SPIELSTAND_V10 } from './spielstand-v10.js';

export const SPIELSTAND_V11 = {
  ...structuredClone(SPIELSTAND_V10),
  version: 11,
  board: {
    day: '2026-11-22',
    tasks: [
      { kind: 'notes', n: 2, area: null, progress: 1, done: false, rewarded: false },
      { kind: 'visit', n: 1, area: 2, progress: 1, done: true, rewarded: true },
      { kind: 'streak', n: 3, area: null, progress: 0, done: false, rewarded: false },
    ],
    bonus: false,
    intro: true,
  },
  wishes: { pim: { treasure: 'acorncap', day: '2026-11-22', done: false } },
  events: [{ type: 'answer', correct: true }],
};
