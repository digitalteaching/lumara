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
  {
    id: 'q6', area: 6, giver: { map: 'ruinen', npc: 'pino' },
    steps: [{ kind: 'pickup', id: 'boot', map: 'moor', x: 6, y: 23 }, { kind: 'talk', map: 'ruinen', npc: 'pino' }],
    reward: { key: 'nutshell' },
  },
  {
    id: 'q7', area: 7, giver: { map: 'see', npc: 'sven' },
    steps: [{ kind: 'talk', map: 'ruinen', npc: 'greta' }, { kind: 'talk', map: 'see', npc: 'sven' }],
    reward: { key: 'skates' },
  },
  {
    id: 'q8', area: 8, giver: { map: 'wiese', npc: 'selma' },
    steps: [{ kind: 'talk', map: 'see', npc: 'jonte' }, { kind: 'talk', map: 'wiese', npc: 'selma' }],
    reward: { key: 'starmap' },
  },
];

// Bewohner, die nur während eines Schritts irgendwo stehen (etwa der gesuchte Lehrling).
export const GUESTS = [
  { id: 'flo', name: 'Flo', map: 'wald', x: 24, y: 13, dir: 'left', sprite: 'flo', quest: 'q3', step: 0 },
  { id: 'jonte', name: 'Jonte', map: 'see', x: 16, y: 24, dir: 'up', sprite: 'jonte', quest: 'q8', step: 0 },
];

export const questById = id => QUESTS.find(q => q.id === id) ?? null;

// Texte der Aufträge auf Deutsch (Design 5.6: Bewohnertexte gehören zum Spiel). Englisch in
// js/i18n/en-quests.js. steps[i]: was beim Schritt i gesagt wird (Fund oder Gespräch);
// hints[i]: was das Tagebuch zeigt, solange Schritt i offen ist.
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
    "hints": [
      "Bram sucht seine Glücksmuschel. Sie liegt am Strand im Westen.",
      "Bring die Muschel zurück zu Bram in der Bucht."
    ],
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
    "hints": [
      "Fenna schickt Kräuter für Oda in der Bucht.",
      "Oda freut sich über die Kräuter. Erzähl es Fenna im Flüsterwald."
    ],
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
    "hints": [
      "Jaspers Lehrling Flo ist im Flüsterwald, am Bach.",
      "Flo ist auf dem Heimweg. Sag Jasper im Pilzmoor Bescheid."
    ],
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
    "hints": [
      "Samirs Glaskugel liegt im Dünengras im Südwesten.",
      "Bring die Glaskugel zurück zu Samir in den Spiegeldünen."
    ],
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
    "hints": [
      "Tamo schickt einen Brief an Talia in den Spiegeldünen.",
      "Talia hat den Brief. Geh zurück zu Tamo auf die Windklippen."
    ],
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
  },
  "q6": {
    "title": "Pinos Boot",
    "offer": [
      "Mein Boot ist davongeschwommen, eine kleine Nussschale aus Holz.",
      "Die Kanäle fließen bis ins Pilzmoor. Vielleicht ist es dort hängen geblieben?"
    ],
    "remind": [
      "Hast du mein Boot gesehen? Schau im Schilf im Südwesten des Pilzmoors."
    ],
    "hints": [
      "Pinos Boot ist ins Pilzmoor getrieben, ins Schilf im Südwesten.",
      "Bring das Boot zurück zu Pino in die Uhrwerkruinen."
    ],
    "steps": [
      [
        "Zwischen Schilf und Wasser schaukelt ein kleines Boot, rund wie eine Nussschale.",
        "Auf dem Rand steht „Pino“. Du ziehst es heraus."
      ]
    ],
    "locked": [
      "Mein Boot! Danke!",
      "Ich habe etwas für dich, wenn der Leuchtstein der Ruinen leuchtet."
    ],
    "finish": [
      "Mein Boot! Weißt du was? Behalte die Nussschale. Ich baue mir eine größere Fähre.",
      "Mit ihr kommst du zu kleinen Inseln: vor der Bucht und mitten im Pilzmoor."
    ]
  },
  "q7": {
    "title": "Tee für Greta",
    "offer": [
      "Greta in den Uhrwerkruinen friert immer, wenn ein Zahnrad stehen bleibt.",
      "Bringst du ihr meine Kanne Tee? Sie hält lange warm."
    ],
    "remind": [
      "Hast du Greta den Tee gebracht? Sie ölt die Zahnräder im Süden der Ruinen."
    ],
    "hints": [
      "Sven schickt Greta in den Uhrwerkruinen eine Kanne Tee.",
      "Greta hat den Tee. Geh zurück zu Sven an den Nordlichtsee."
    ],
    "steps": [
      [
        "Tee von Sven? Der alte Fischer denkt immer an mich!",
        "Sag ihm, er wärmt mich bis in die Zehen."
      ]
    ],
    "locked": [
      "Greta hat sich gefreut? Gut!",
      "Ich habe etwas für dich, wenn der Leuchtstein des Sees leuchtet."
    ],
    "finish": [
      "Greta hat sich gefreut? Gut! Nimm meine alten Eiskufen.",
      "Damit gleitest du über das Eis, bis dich etwas aufhält. Probier es an der Eisgrotte!"
    ]
  },
  "q8": {
    "title": "Wo ist Jonte?",
    "offer": [
      "Mein Freund Jonte zählt jede Nacht die Sterne.",
      "Gestern ist er zum Nordlichtsee gegangen und nicht wiedergekommen. Suchst du ihn?"
    ],
    "remind": [
      "Hast du Jonte gefunden? Er wollte am Nordlichtsee die Sterne zählen."
    ],
    "hints": [
      "Selmas Freund Jonte zählt Sterne am Nordlichtsee.",
      "Jonte ist auf dem Heimweg. Sag Selma auf der Sternenwiese Bescheid."
    ],
    "steps": [
      [
        "Oh! Ich habe die Sterne über dem See gezählt und ganz die Zeit vergessen.",
        "Selma wartet? Dann gehe ich sofort heim!"
      ]
    ],
    "guest": [
      "Ich gehe jetzt heim zu Selma. Danke!"
    ],
    "locked": [
      "Jonte ist wieder da! Danke!",
      "Ich habe etwas für dich, wenn der Leuchtstein der Wiese leuchtet."
    ],
    "finish": [
      "Jonte ist wieder da! Hier, seine Sternkarte. Er hat sie selbst gezeichnet.",
      "Sie zeigt die Sterne über der alten Sternwarte. Vielleicht öffnet sie dir die Tür."
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
