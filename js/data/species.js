// Arten der Wesen: Namen der Stufen, Beschreibungen und Besonderheiten (Design 6.1, 6.4).

import { stageForLevel } from '../duel/progress.js';
import { CONFIG } from '../config.js';
import { language, mark, t } from '../i18n/i18n.js';
import { EN_SPECIES } from '../i18n/en-species.js';

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

  // Gebiet 3: Pilzmoor
  tupfling: {
    id: 'tupfling',
    kind: 'wild',
    gender: 'm',
    area: 3,
    rarity: 'common',
    names: ['Tupfling', 'Schirmling'],
    description: 'Ein kleiner Pilz mit leuchtenden Tupfen, der beim Hüpfen Sporen wie Glitzer verstreut.',
  },
  irrfunke: {
    id: 'irrfunke',
    kind: 'wild',
    gender: 'm',
    area: 3,
    rarity: 'common',
    names: ['Irrfunke'],
    description: 'Ein Funke aus grünem Licht, der über dem Moor tanzt und allen den Weg zeigen will.',
  },
  nebelunke: {
    id: 'nebelunke',
    kind: 'wild',
    gender: 'f',
    area: 3,
    rarity: 'rare',
    names: ['Nebelunke'],
    description: 'Eine scheue Unke mit Haut wie Morgennebel, die nur ruft, wenn es ganz still ist.',
  },

  // Gebiet 4: Spiegeldünen
  glaskaefer: {
    id: 'glaskaefer',
    kind: 'wild',
    gender: 'm',
    area: 4,
    rarity: 'common',
    names: ['Glaskäfer', 'Spiegelkäfer'],
    description: 'Ein Käfer mit Flügeldecken aus Glas, in denen sich die Mittagssonne spiegelt.',
  },
  duenenhuepfer: {
    id: 'duenenhuepfer',
    kind: 'wild',
    gender: 'm',
    area: 4,
    rarity: 'common',
    names: ['Dünenhüpfer'],
    description: 'Ein flinker Hüpfer mit riesigen Ohren, der auf heißem Sand nie lange stehen bleibt.',
  },
  flimmerfuchs: {
    id: 'flimmerfuchs',
    kind: 'wild',
    gender: 'm',
    area: 4,
    rarity: 'rare',
    names: ['Flimmerfuchs'],
    description: 'Ein Fuchs aus flimmernder Luft, den man nur sieht, wenn man nicht zu genau hinschaut.',
  },

  // Gebiet 5: Windklippen
  drachling: {
    id: 'drachling',
    kind: 'wild',
    gender: 'm',
    area: 5,
    rarity: 'common',
    names: ['Drachling', 'Himmelsdrachling'],
    description: 'Ein kleiner Drache mit Flügeln wie Papierdrachen, der am liebsten gegen den Wind fliegt.',
  },
  klippbock: {
    id: 'klippbock',
    kind: 'wild',
    gender: 'm',
    area: 5,
    rarity: 'common',
    names: ['Klippbock'],
    description: 'Ein Bergbock mit eingerollten Hörnern, der auf den schmalsten Felsen balanciert.',
  },
  wolkenwal: {
    id: 'wolkenwal',
    kind: 'wild',
    gender: 'm',
    area: 5,
    rarity: 'rare',
    names: ['Wolkenwal'],
    description: 'Ein kleiner Wal aus Wolken, der langsam unter den Hängebrücken hindurchschwimmt.',
  },

  // Gebiet 6: Uhrwerkruinen
  zahnmaus: {
    id: 'zahnmaus',
    kind: 'wild',
    gender: 'f',
    area: 6,
    rarity: 'common',
    names: ['Zahnmaus', 'Uhrwerkmaus'],
    description: 'Eine Maus mit Ohren wie Zahnräder. Auf dem Rücken trägt sie einen kleinen Aufziehschlüssel.',
  },
  dampfkobold: {
    id: 'dampfkobold',
    kind: 'wild',
    gender: 'm',
    area: 6,
    rarity: 'common',
    names: ['Dampfkobold'],
    description: 'Ein Kobold aus Kupfer, rund wie ein Teekessel. Wenn er sich freut, pfeift Dampf aus seinem Hut.',
  },
  messingeule: {
    id: 'messingeule',
    kind: 'wild',
    gender: 'f',
    area: 6,
    rarity: 'rare',
    names: ['Messingeule'],
    description: 'Eine Eule aus Messing mit Augen wie Lupen. Sie sieht jedes Rädchen, das sich in den Ruinen dreht.',
  },

  // Gebiet 7: Nordlichtsee
  frostrobbe: {
    id: 'frostrobbe',
    kind: 'wild',
    gender: 'f',
    area: 7,
    rarity: 'common',
    names: ['Frostrobbe', 'Gletscherrobbe'],
    description: 'Eine weiße Robbe, die gern auf dem Eis rutscht. Wird sie größer, wachsen ihr Eiskristalle auf dem Rücken.',
  },
  flockenhase: {
    id: 'flockenhase',
    kind: 'wild',
    gender: 'm',
    area: 7,
    rarity: 'common',
    names: ['Flockenhase'],
    description: 'Ein Hase mit Fell so weiß wie Neuschnee. Auf der Stirn trägt er eine Schneeflocke.',
  },
  aurorafink: {
    id: 'aurorafink',
    kind: 'wild',
    gender: 'm',
    area: 7,
    rarity: 'rare',
    names: ['Aurorafink'],
    description: 'Ein kleiner Fink, dessen lange Schwanzfedern in den Farben des Nordlichts schimmern.',
  },

  // Gebiet 8: Sternenwiese
  schnuppling: {
    id: 'schnuppling',
    kind: 'wild',
    gender: 'm',
    area: 8,
    rarity: 'common',
    names: ['Schnuppling', 'Kometling'],
    description: 'Ein kleiner Stern, der vom Himmel gefallen ist. Hinter ihm leuchtet ein Schweif aus Sternenstaub.',
  },
  nachtschaf: {
    id: 'nachtschaf',
    kind: 'wild',
    gender: 'n',
    area: 8,
    rarity: 'common',
    names: ['Nachtschaf'],
    description: 'Ein Schaf mit Wolle wie eine Sommernacht. In seinem Fell funkeln kleine Sterne.',
  },
  sternhirsch: {
    id: 'sternhirsch',
    kind: 'wild',
    gender: 'm',
    area: 8,
    rarity: 'rare',
    names: ['Sternhirsch'],
    description: 'Ein Hirsch mit einem Geweih aus Sternenlicht. Man sieht ihn nur in klaren Nächten.',
  },

  // Geheime Orte (Design 5.7, 6.4): je eine seltene Art, Buchplätze 25 bis 30
  wurzelgeist: {
    id: 'wurzelgeist',
    kind: 'secret',
    gender: 'm',
    area: 2,
    rarity: 'rare',
    names: ['Wurzelgeist'],
    description: 'Ein kleiner Geist aus Wurzeln. Auf dem Kopf trägt er eine Blüte, die im Dunkeln leuchtet.',
  },
  prismalibelle: {
    id: 'prismalibelle',
    kind: 'secret',
    gender: 'f',
    area: 4,
    rarity: 'rare',
    names: ['Prismalibelle'],
    description: 'Eine Libelle mit Flügeln aus Glas. Wo sie fliegt, bricht sich das Licht in allen Farben des Regenbogens.',
  },
  perlkrabbe: {
    id: 'perlkrabbe',
    kind: 'secret',
    gender: 'f',
    area: 1,
    rarity: 'rare',
    names: ['Perlkrabbe'],
    description: 'Eine kleine Krabbe mit einem Panzer wie eine Perle. Bei Ebbe läuft sie durch die Tümpel und poliert die Steine.',
  },
  irrlichtfee: {
    id: 'irrlichtfee',
    kind: 'secret',
    gender: 'f',
    area: 3,
    rarity: 'rare',
    names: ['Irrlichtfee'],
    description: 'Eine winzige Fee aus Licht. Sie tanzt über dem Moor und zeigt allen, die sich verlaufen haben, den Weg nach Hause.',
  },
  kristallotter: {
    id: 'kristallotter',
    kind: 'secret',
    gender: 'm',
    area: 7,
    rarity: 'rare',
    names: ['Kristallotter'],
    description: 'Ein Otter mit Fell wie Raureif. Auf seinem Rücken wachsen kleine Eiskristalle, die im Nordlicht funkeln.',
  },
};

// Die seltenen Arten der geheimen Orte in der Reihenfolge des Wesen-Buchs (Plätze 25 bis 30).
export const SECRET_SPECIES = ['wurzelgeist', 'prismalibelle', 'perlkrabbe', 'irrlichtfee', 'kristallotter'];

export const AREA_WILD = {
  1: { common: ['gischtling', 'haeuschel'], rare: 'glimmqualle' },
  2: { common: ['moosling', 'eichhuscher'], rare: 'rindenwicht' },
  3: { common: ['tupfling', 'irrfunke'], rare: 'nebelunke' },
  4: { common: ['glaskaefer', 'duenenhuepfer'], rare: 'flimmerfuchs' },
  5: { common: ['drachling', 'klippbock'], rare: 'wolkenwal' },
  6: { common: ['zahnmaus', 'dampfkobold'], rare: 'messingeule' },
  7: { common: ['frostrobbe', 'flockenhase'], rare: 'aurorafink' },
  8: { common: ['schnuppling', 'nachtschaf'], rare: 'sternhirsch' },
};

export const TRAINER_CREATURES = {
  1: { species: 'haeuschel', stage: 2 },
  2: { species: 'eichhuscher', stage: 2 },
  3: { species: 'tupfling', stage: 2 },
  4: { species: 'glaskaefer', stage: 2 },
  5: { species: 'drachling', stage: 2 },
  6: { species: 'zahnmaus', stage: 2 },
  7: { species: 'frostrobbe', stage: 2 },
  8: { species: 'schnuppling', stage: 2 },
};

// Namen, Beschreibung und Besonderheit in der Spielsprache (Design 10.6). Deutsch steht in SPECIES,
// jede andere Sprache in js/i18n/<sprache>-species.js. Das grammatische Geschlecht hängt an der
// Sprache; ohne eigenes gilt das deutsche.
const LOCAL = { en: EN_SPECIES };
export function speciesText(speciesId) {
  const sp = SPECIES[speciesId];
  const local = LOCAL[language()]?.[speciesId];
  const src = local ?? sp;
  return {
    names: src.names.map(mark),
    gender: local?.gender ?? sp.gender ?? 'n',
    description: mark(src.description),
    special: src.special ? { name: mark(src.special.name), text: mark(src.special.text) } : undefined,
  };
}

// „Ein wilder Eichhuscher“, „Die wilde Glimmqualle“, „A wild Oakscamper“: mit dem Artikel, der zum
// Wesen und zur Sprache passt.
export function wildName(speciesId, stage, form) {
  const { gender } = speciesText(speciesId);
  return t(`wild.${form}.${gender}`, { name: speciesName(speciesId, stage) });
}

export function speciesName(speciesId, stage) {
  const names = speciesText(speciesId).names;
  return names[Math.min(stage, names.length) - 1];
}

export function displayName(creature) {
  return creature.nickname || speciesName(creature.species, stageForLevel(creature.level));
}

// ---------- Entwicklung (Design 6.1, 6.2) ----------

// Die Fähigkeiten der Stufen 2 bis 4. Namen und Texte in der Spielsprache.
export const STAGE_ABILITIES = {
  2: { nameKey: 'ability.2.name', textKey: 'ability.2.text' },
  3: { nameKey: 'ability.3.name', textKey: 'ability.3.text' },
  4: { nameKey: 'ability.4.name', textKey: 'ability.4.text' },
};

// Für die Seite „Wesen“: jede Fähigkeit mit dem Level, ab dem sie gilt.
export function abilityRows(level) {
  return [2, 3, 4].map(stage => ({
    stage,
    name: t(STAGE_ABILITIES[stage].nameKey),
    text: t(STAGE_ABILITIES[stage].textKey),
    fromLevel: CONFIG.creature.stageLevels[stage - 1],
    unlocked: level >= CONFIG.creature.stageLevels[stage - 1],
  }));
}

// Spitzname oder der Name der Art auf dieser Stufe. Bis die Szene vorbei ist, zeigt das Spiel so
// noch den alten Namen.
export const nameAtStage = (creature, stage) => creature.nickname || speciesName(creature.species, stage);

// Was nach der Entwicklung gesagt wird: neuer Name, jede neue Fähigkeit, die Energie dazu.
export function evolutionLines(creature, from, to) {
  const lines = [t('evo.becomes', { name: nameAtStage(creature, from), next: speciesName(creature.species, to) })];
  for (let s = from + 1; s <= to; s++) {
    lines.push(t('evo.newAbility', { ability: t(STAGE_ABILITIES[s].nameKey) }), t(STAGE_ABILITIES[s].textKey));
  }
  const bonus = CONFIG.creature.stageEnergyBonus[to - 1] - CONFIG.creature.stageEnergyBonus[from - 1];
  lines.push(t('evo.energy', { name: nameAtStage(creature, to), n: bonus }));
  return lines;
}
