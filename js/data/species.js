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
    gender: 'm',
    area: 1,
    rarity: 'common',
    names: ['Gischtling', 'Brandungsgeist'],
    description: 'Ein kleiner Wellengeist aus Meeresschaum. Er trägt eine Krone aus Gischt.',
  },
  haeuschel: {
    id: 'haeuschel',
    kind: 'wild',
    gender: 'n',
    area: 1,
    rarity: 'common',
    names: ['Häuschel', 'Muschelturm'],
    description: 'Ein Einsiedlerkrebs in einem Schneckenhaus. Wird er größer, sieht sein Haus aus wie ein kleiner Leuchtturm.',
  },
  glimmqualle: {
    id: 'glimmqualle',
    kind: 'wild',
    gender: 'f',
    area: 1,
    rarity: 'rare',
    names: ['Glimmqualle'],
    description: 'Eine Qualle, die nachts über dem Wasser schwebt. Ihre Punkte leuchten wie Sterne.',
  },

  // Gebiet 2: Flüsterwald
  moosling: {
    id: 'moosling',
    kind: 'wild',
    gender: 'm',
    area: 2,
    rarity: 'common',
    names: ['Moosling', 'Moosmuffel'],
    description: 'Ein runder Moosballen mit Pilzhut. Er rollt lieber, als dass er läuft.',
  },
  eichhuscher: {
    id: 'eichhuscher',
    kind: 'wild',
    gender: 'm',
    area: 2,
    rarity: 'common',
    names: ['Eichhuscher', 'Kronenhuscher'],
    description: 'Ein Hörnchen aus Herbstlaub mit einer Eichel als Mütze. Es versteckt überall Vorräte.',
  },
  rindenwicht: {
    id: 'rindenwicht',
    kind: 'wild',
    gender: 'm',
    area: 2,
    rarity: 'rare',
    names: ['Rindenwicht'],
    description: 'Ein kleiner Geist aus Rinde. Seine Augen leuchten wie zwei Laternen im dunklen Wald.',
  },
};

export const AREA_WILD = {
  1: { common: ['gischtling', 'haeuschel'], rare: 'glimmqualle' },
  2: { common: ['moosling', 'eichhuscher'], rare: 'rindenwicht' },
};

export const TRAINER_CREATURES = {
  1: { species: 'haeuschel', stage: 2 },
  2: { species: 'eichhuscher', stage: 2 },
};

// „Ein wilder Eichhuscher“, „Die wilde Glimmqualle“: mit dem Artikel, der zum Wesen passt.
const WILD_ARTICLES = {
  a: { m: 'Ein wilder', f: 'Eine wilde', n: 'Ein wildes' },
  the: { m: 'Der wilde', f: 'Die wilde', n: 'Das wilde' },
};
export function wildName(speciesId, stage, form) {
  return `${WILD_ARTICLES[form][SPECIES[speciesId].gender ?? 'n']} ${speciesName(speciesId, stage)}`;
}

export function speciesName(speciesId, stage) {
  const names = SPECIES[speciesId].names;
  return names[Math.min(stage, names.length) - 1];
}

export function displayName(creature) {
  return creature.nickname || speciesName(creature.species, stageForLevel(creature.level));
}
