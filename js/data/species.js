// Arten der Wesen: Namen der Stufen, Beschreibungen und Besonderheiten (Design 6.1, 6.4).

import { stageForLevel } from '../duel/progress.js';

export const STARTERS = ['funki', 'kiesel', 'nixi', 'flausch', 'pieks'];

export const SPECIES = {
  funki: {
    id: 'funki',
    kind: 'starter',
    names: ['Funki', 'Funkelflug', 'Laternenfalter', 'Nordlichtfalter'],
    description: 'Eine kleine Leuchtmotte. Ihr Hinterleib glimmt wie eine winzige Laterne.',
    special: {
      name: 'Erleuchtung',
      text: 'Einmal pro Duell hilft dir Funkis Licht: Zwei falsche Antworten verschwinden, du siehst den ersten Buchstaben oder das erste Kärtchen liegt schon richtig.',
    },
  },
  kiesel: {
    id: 'kiesel',
    kind: 'starter',
    names: ['Kiesel', 'Findling', 'Felsenwächter', 'Bergherz'],
    description: 'Ein runder Steinkobold mit Moosbüscheln. Er ist ruhig und lässt sich nicht umwerfen.',
    special: { name: 'Standfest', text: 'Kiesel ist zäh und hat immer 1 Energie mehr als die anderen.' },
  },
  nixi: {
    id: 'nixi',
    kind: 'starter',
    names: ['Nixi', 'Quellnix', 'Strudelnix', 'Gezeitennix'],
    description: 'Ein Axolotl mit Flossenkamm. Wenn Nixi sich freut, blubbert es Wasserblasen.',
    special: { name: 'Quelle', text: 'Nach 3 richtigen Antworten in Folge holt sich Nixi 1 Energie zurück.' },
  },
  flausch: {
    id: 'flausch',
    kind: 'starter',
    names: ['Flausch', 'Wolkenkauz', 'Sturmeule', 'Himmelsuhu'],
    description: 'Eine Wolkeneule mit Federn so weich wie Watte. Sie schwebt mehr, als sie fliegt.',
    special: {
      name: 'Rückenwind',
      text: 'Einmal pro Duell darfst du eine Frage gegen eine andere tauschen. Bei Zeitdruck hast du außerdem mehr Zeit.',
    },
  },
  pieks: {
    id: 'pieks',
    kind: 'starter',
    names: ['Pieks', 'Dornigel', 'Blütenigel', 'Waldhüter'],
    description: 'Ein Samenigel mit Stacheln aus Blättern. Wo Pieks schläft, wächst am nächsten Morgen Klee.',
    special: {
      name: 'Grüner Daumen',
      text: 'Beeren geben Pieks doppelt so viel Energie. Nach einem Sieg findet Pieks oft eine Beere.',
    },
  },

  // Gebiet 1: Leuchtturmbucht
  gischtling: {
    id: 'gischtling',
    kind: 'wild',
    area: 1,
    rarity: 'common',
    names: ['Gischtling', 'Brandungsgeist'],
    description: 'Ein kleiner Wellengeist aus Meeresschaum. Er trägt eine Krone aus Gischt.',
  },
  haeuschel: {
    id: 'haeuschel',
    kind: 'wild',
    area: 1,
    rarity: 'common',
    names: ['Häuschel', 'Muschelturm'],
    description: 'Ein Einsiedlerkrebs in einem Schneckenhaus. Wird er größer, sieht sein Haus aus wie ein kleiner Leuchtturm.',
  },
  glimmqualle: {
    id: 'glimmqualle',
    kind: 'wild',
    area: 1,
    rarity: 'rare',
    names: ['Glimmqualle'],
    description: 'Eine Qualle, die nachts über dem Wasser schwebt. Ihre Punkte leuchten wie Sterne.',
  },
};

export const AREA_WILD = {
  1: { common: ['gischtling', 'haeuschel'], rare: 'glimmqualle' },
};

export const TRAINER_CREATURES = {
  1: { species: 'haeuschel', stage: 2 },
};

export function speciesName(speciesId, stage) {
  const names = SPECIES[speciesId].names;
  return names[Math.min(stage, names.length) - 1];
}

export function displayName(creature) {
  return creature.nickname || speciesName(creature.species, stageForLevel(creature.level));
}
