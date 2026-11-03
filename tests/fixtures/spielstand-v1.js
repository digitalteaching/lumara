// NIE ÄNDERN. Das ist der Inhalt von spielstand-v1.txt, einem Spielstand im Format 1.
// Jede spätere Spielfassung muss ihn laden können (Design 11). Ein neues Format bekommt
// eine eigene Datei (spielstand-v2.*) und eine Umwandlung in js/save/migrate.js.

export const SPIELSTAND_V1 = {
  version: 1, savedAt: Date.UTC(2026, 10, 3, 8, 10), name: 'Mia',
  creature: { species: 'nixi', nickname: 'Blubb', level: 12, xpInLevel: 30, energy: 3, lifeStones: 0 },
  position: { map: 'bucht', x: 22, y: 8, dir: 'up' },
  settings: { textSpeed: 'fast' },
  packs: { ENQ9: {
    beaten: [1], boss: false,
    history: { 'he ___ (play) football.': { n: 3, s: 2, w: false } },
    stats: { wins: 23, right: 87, total: 100, playMs: 5700000, topics: { 1: { right: 80, total: 90 }, 2: { right: 7, total: 10 } }, floor: 0 },
  } },
};
