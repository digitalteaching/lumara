// Alle Zahlen der Spielregeln an einer Stelle (Design 6.2, 6.3, 6.4, 7.4, 10.2).
// Feintuning passiert hier, nicht im Code.

function deepFreeze(obj) {
  for (const v of Object.values(obj)) if (v && typeof v === 'object') deepFreeze(v);
  return Object.freeze(obj);
}

export const CONFIG = deepFreeze({
  screen: { width: 240, height: 160, tile: 16 },
  walk: { msPerTile: 220 },
  text: { speeds: { slow: 25, normal: 40, fast: 80 } }, // Zeichen pro Sekunde
  creature: {
    baseEnergy: 4,
    stageLevels: [1, 15, 35, 60],
    stageEnergyBonus: [0, 1, 2, 3],
    maxLifeStones: 3,
    kieselBonus: 1,
    maxLevel: 100,
  },
  xp: {
    levelBase: 10,
    levelPerLevel: 5,
    trainerBase: 40,
    trainerPerNumber: 20,
    bossFirst: 500,
    wildBase: 8,
    wildPerArea: 2,
    flawlessBonus: 0.25,
  },
  duel: { critEvery: 3, critEveryFromStage3: 2, nixiEvery: 3, wrongMinMs: 1500 },
  trainers: [
    { energy: 5, time: null, level: 7 },
    { energy: 6, time: null, level: 12 },
    { energy: 7, time: null, level: 17 },
    { energy: 8, time: 40, level: 22 },
    { energy: 9, time: 35, level: 27 },
    { energy: 10, time: 30, level: 32 },
    { energy: 11, time: 25, level: 37 },
    { energy: 12, time: 20, level: 42 },
  ],
  wild: {
    energyByArea: [3, 3, 4, 4, 4, 5, 5, 5],
    levelByArea: [[2, 5], [5, 9], [9, 14], [14, 19], [19, 24], [24, 29], [29, 34], [34, 40]],
    rareChance: 0.1,
  },
  encounter: { minSteps: 8, maxSteps: 25, curve: 1.3 },
  questionWeights: { wrongLast: 3, neverAsked: 2, normal: 1, mastered: 0.5 },
  pack: {
    maxBytes: 1048576,
    minQuestions: 8,
    recommendedQuestions: 20,
    maxHello: 5,
    templateId: 'fach-jahrgang-name',
  },
  names: { maxLength: 12 },
  world: { builtAreas: 2 }, // Gebiete, die diese Spielfassung schon hat (Nebelrand, Design 17)
  save: { autosaveMs: 30000 },
  bag: { foodMax: 10 },
  play: { idleMs: 120000 },
});
