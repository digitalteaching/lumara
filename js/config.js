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
  // Endgegner Morrow (Design 7.4): Phasen, Energie je Phase, angezeigtes Level, Uhr wie Trainer timeAs
  // rememberFactor: XP des Erinnerungsduells nach dem ersten Sieg, 500 × 0,5 × (1 + 0,25·Stufe) (Design 6.3)
  boss: { phases: 3, energy: 6, level: 50, timeAs: 8, rememberFactor: 0.5 },
  // Revanchen (Design 7.5): Stufen 1 bis 5; Energie und Anzeige-Level je Stufe, Zeitfaktor je Stufe,
  // Grundzeit für Trainer ohne Uhr, kürzeste Zeit, XP-Aufschlag je Stufe
  rematch: { maxTier: 5, energyPerTier: 2, levelPerTier: 3, timeFactor: 0.9, baseSeconds: 40, minSeconds: 10, xpPerTier: 0.25 },
  duel: { critEvery: 3, critEveryFromStage3: 2, nixiEvery: 3, wrongMinMs: 1500 },
  // Zeitdruck (Design 7.4): Faktoren auf die Grundzeit des Trainers; lowShare: ab diesem Rest wird der Balken knapp.
  time: { fromArea: 4, typing: 1.5, tiles: 2, long: 2, flausch: 0.25, lowShare: 0.25 },
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
    starRareChance: 0.5, // nahe einer Sternschnuppe (Design 9)
    starRadius: 2,
    shinyChance: 1 / 64, // Glanzform (Design 6.4)
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
  world: { builtAreas: 8 }, // Gebiete, die diese Spielfassung schon hat (Nebelrand, Design 17)
  save: { autosaveMs: 30000 },
  bag: { foodMax: 10, foodMaxBag: 20 }, // mit Futterbeutel 20 (Design 8.1)
  quests: { xp: 50 }, // Belohnung für einen erledigten Auftrag (Design 5.6)
  food: { berry: 2, berryPieks: 4, bushRegrowMs: 300000, wildDropChance: 0.2, pieksFindChance: 0.5, maxFeedPerDuel: 2 },
  // tableTimed und rewardsTimed gelten ab Gebiet time.fromArea, wo Trainer Zeitdruck haben (Zeitstein).
  finds: { stepChance: 1 / 150, respawnMs: 600000, table: { farsight: 3, shine: 2, life: 1 }, tableTimed: { farsight: 3, shine: 2, life: 1, time: 3 } },
  notes: {
    xp: 15,
    rewardChance: 0.5,
    refillMs: 600000,
    rewards: { berry: 3, starfruit: 1, farsight: 2, shine: 1, life: 1 },
    rewardsTimed: { berry: 3, starfruit: 1, farsight: 2, shine: 1, life: 1, time: 2 },
  },
  // Entwicklung (Design 6.3): Aufleuchten, Wechsel der Gestalt, Ausklingen; zusammen 3,8 s.
  evolution: { glowMs: 900, swapMs: [450, 450, 380, 380, 340], fadeMs: 900 },
  beacons: {
    sceneMs: 2600,
    ringColors: ['#ffe08a', '#7fd17a', '#c69ae8', '#f2c26b', '#9fd8ef', '#e8a272', '#bfe9ff', '#f5f0a8'],
  },
  play: { idleMs: 120000 },
});
