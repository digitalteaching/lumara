import { language, mark } from '../i18n/i18n.js';
import { EN_QUEST_TEXT } from '../i18n/en-quests.js';

// Aufträge (Design 5.6, 5.7): je Gebiet einer. Annehmen geht jederzeit, abschließen erst, wenn der
// Leuchtstein des Gebiets leuchtet. Alles, was Auftrag k braucht, liegt in den Gebieten 1 bis k.
// Ein Auftrag ist eine Folge von Schritten: etwas aufheben (pickup) oder mit jemandem sprechen
// (talk). Der letzte Schritt ist immer das Gespräch mit dem Auftraggeber.

export const QUESTS = [
  {
    id: 'q1', area: 1, giver: { map: 'bucht', npc: 'bram' },
    steps: [{ kind: 'pickup', id: 'muschel', map: 'bucht', x: 6, y: 20 }, { kind: 'talk', map: 'bucht', npc: 'bram' }],
    reward: { key: 'foodbag' },
  },
  {
    id: 'q2', area: 2, giver: { map: 'wald', npc: 'fenna' },
    steps: [{ kind: 'talk', map: 'bucht', npc: 'oda' }, { kind: 'talk', map: 'wald', npc: 'fenna' }],
    reward: { item: 'life', n: 1 },
  },
  {
    id: 'q3', area: 3, giver: { map: 'moor', npc: 'jasper' },
    steps: [{ kind: 'talk', map: 'wald', npc: 'flo' }, { kind: 'talk', map: 'moor', npc: 'jasper' }],
    reward: { key: 'lantern' },
  },
  {
    id: 'q4', area: 4, giver: { map: 'duenen', npc: 'samir' },
    steps: [{ kind: 'pickup', id: 'glaskugel', map: 'duenen', x: 5, y: 24 }, { kind: 'talk', map: 'duenen', npc: 'samir' }],
    reward: { item: 'shine', n: 3 },
  },
  {
    id: 'q5', area: 5, giver: { map: 'klippen', npc: 'tamo' },
    steps: [{ kind: 'talk', map: 'duenen', npc: 'talia' }, { kind: 'talk', map: 'klippen', npc: 'tamo' }],
    reward: { key: 'hook' },
  },
];

// Bewohner, die nur während eines Schritts irgendwo stehen (etwa der gesuchte Lehrling).
export const GUESTS = [
  { id: 'flo', name: 'Flo', map: 'wald', x: 24, y: 13, dir: 'left', sprite: 'flo', quest: 'q3', step: 0 },
];

export const questById = id => QUESTS.find(q => q.id === id) ?? null;

// Texte der Aufträge auf Deutsch (Design 5.6: Bewohnertexte gehören zum Spiel). Englisch in
// js/i18n/en-quests.js. steps[i]: was beim Schritt i gesagt wird (Fund oder Gespräch).
export const QUEST_TEXT = {
  "q1": {
    "title": "Brams Glücksmuschel",
    "offer": [
      "Ach je, meine Glücksmuschel ist weg!",
      "Ich hatte sie immer dabei, wenn ich rausgefahren bin.",
      "Bestimmt liegt sie irgendwo am Strand."
    ],
    "remind": [
      "Hast du meine Glücksmuschel gefunden? Schau mal am Strand im Westen."
    ],
    "hint": "Bram sucht seine Glücksmuschel. Sie liegt am Strand im Westen.",
    "steps": [
      [
        "Im Sand glänzt etwas: eine gestreifte Muschel.",
        "Das muss Brams Glücksmuschel sein!"
      ]
    ],
    "locked": [
      "Meine Muschel! Danke!",
      "Zeig erst der Hüterin der Bucht, was du kannst. Dann habe ich etwas für dich."
    ],
    "finish": [
      "Meine Glücksmuschel! Danke!",
      "Nimm diesen Beutel aus altem Fischernetz. Da passt doppelt so viel Futter hinein."
    ]
  },
  "q2": {
    "title": "Kräuter für Oda",
    "offer": [
      "Oda in der Bucht hat einen schlimmen Husten.",
      "Bringst du ihr diesen Beutel mit Kräutern? Daraus kann sie Tee kochen."
    ],
    "remind": [
      "Hast du Oda schon die Kräuter gebracht? Sie wohnt in der Bucht."
    ],
    "hint": "Fenna schickt Kräuter für Oda in der Bucht.",
    "steps": [
      [
        "Kräuter von Fenna? Wie lieb von ihr!",
        "Sag ihr vielen Dank. Mein Husten ist bestimmt bald weg."
      ]
    ],
    "locked": [
      "Oda hat sich gefreut? Wie schön!",
      "Ich habe noch etwas für dich, wenn der Leuchtstein des Waldes leuchtet."
    ],
    "finish": [
      "Oda hat sich gefreut? Wie schön!",
      "Diesen Stein habe ich unter den Wurzeln gefunden. Er macht dein Wesen stärker."
    ]
  },
  "q3": {
    "title": "Wo ist Flo?",
    "offer": [
      "Mein Lehrling Flo wollte im Flüsterwald Bretter holen.",
      "Er ist schon so lange weg. Kannst du ihn suchen?"
    ],
    "remind": [
      "Hast du Flo gefunden? Er wollte in den Flüsterwald, zum Bach."
    ],
    "hint": "Jaspers Lehrling Flo ist im Flüsterwald, am Bach.",
    "steps": [
      [
        "Oh, hallo! Ich habe mich verlaufen. Die Bäume flüstern so komisch.",
        "Jasper sucht mich? Dann gehe ich sofort heim!"
      ]
    ],
    "guest": [
      "Ich gehe jetzt heim zu Jasper. Danke!"
    ],
    "locked": [
      "Flo ist wieder da! Danke!",
      "Ich habe etwas für dich, wenn der Leuchtstein des Moors leuchtet."
    ],
    "finish": [
      "Flo ist wieder da! Ich bin so froh.",
      "Nimm diese Laterne. Damit findest du auch im dunkelsten Gang den Weg."
    ]
  },
  "q4": {
    "title": "Samirs Glaskugel",
    "offer": [
      "Meine schönste Glaskugel ist weg! Der Wind hat sie ins Dünengras getragen.",
      "Siehst du sie irgendwo glitzern? Vielleicht im Südwesten?"
    ],
    "remind": [
      "Hast du meine Glaskugel gefunden? Sie muss im Dünengras im Südwesten liegen."
    ],
    "hint": "Samirs Glaskugel liegt im Dünengras im Südwesten.",
    "steps": [
      [
        "Zwischen den Halmen glitzert eine Kugel aus Glas.",
        "Das ist Samirs Glaskugel!"
      ]
    ],
    "locked": [
      "Meine Glaskugel! Danke!",
      "Hol dir erst den Leuchtstein der Dünen. Dann bekommst du etwas von mir."
    ],
    "finish": [
      "Meine Glaskugel! Sie ist ganz geblieben.",
      "Hier sind drei Glanzsteine. Jeder verdoppelt die XP deines nächsten Siegs."
    ]
  },
  "q5": {
    "title": "Ein Brief für Talia",
    "offer": [
      "Bringst du Talia in den Spiegeldünen einen Brief?",
      "Der Wind trägt keine Nachrichten mehr. Sie soll wissen, dass mein Drache wieder fliegt."
    ],
    "remind": [
      "Hast du Talia meinen Brief gebracht? Sie zeichnet Karten im Süden der Dünen."
    ],
    "hint": "Tamo schickt einen Brief an Talia in den Spiegeldünen.",
    "steps": [
      [
        "Ein Brief von Tamo? Wie schön!",
        "Sag ihm, ich zeichne seinen Drachen auf meine nächste Karte."
      ]
    ],
    "locked": [
      "Talia hat geantwortet? Toll!",
      "Ich habe etwas für dich, wenn der Leuchtstein der Klippen leuchtet."
    ],
    "finish": [
      "Talia zeichnet meinen Drachen? Toll!",
      "Nimm meinen Kletterhaken. Damit kommst du an jeder steilen Wand hinauf."
    ]
  }
};

// Die Texte eines Auftrags in der Spielsprache (Design 10.6).
const LOCAL_TEXT = { en: EN_QUEST_TEXT };
const deepMark = v => (Array.isArray(v) ? v.map(deepMark) : typeof v === 'string' ? mark(v) : v);
export function questText(id) {
  const src = LOCAL_TEXT[language()]?.[id] ?? QUEST_TEXT[id];
  return Object.fromEntries(Object.entries(src).map(([k, v]) => [k, deepMark(v)]));
}
