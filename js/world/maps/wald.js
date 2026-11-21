// Gebiet 2: der Flüsterwald (Design 5.3). 40 × 30 Felder.
// Süden: Eingang von der Bucht. Mitte: ein Bach mit Brücke. Norden: Lichtung mit Leuchtstein und
// Waldläufer, dahinter das Nebeltor zum Pilzmoor.

export const WALD = {
  id: 'wald',
  name: 'Flüsterwald',
  genitive: 'des Flüsterwalds',
  area: 2,
  ground: 'moss', // Boden unter Bäumen und Pilzen am Rand
  rows: [
    'YYYYYYYYYYYYYYYYYY%%%%YYYYYYYYYYYYYYYYYY',
    'YYYYYYYYYYYYYYYYYY%%%%YYYYYYYYYYYYYYYYYY',
    'YYYYYYmmmmmmmmmmmm____mmmmmmmmmmmmmYYYYY',
    'YYYYmmmmmmmmmmmmmm____mmmmmmmm;;;;;;mYYY',
    'YYYmmmmpmmmmmmmmmm____mmmmmmmm;;;;;;mmYY',
    'YYmmmmmmmmmmmmmmmm____mmmmmmm;;;;;;;mmYY',
    'YYmmmmmmmmmmmmmmmm____mmmmmmm;;;;;;;mmYY',
    'YYmm;;;;;mmmmmmmmm____mmmpmmm;;;;;;;mmYY',
    'YYmm;;;;;;mmmmmmmm____mmmmmmmm;;;;;mmmYY',
    'YYmm;;;;;;mmmYmmmm____mmmmYmmmmmmmmmmmYY',
    'YYmmm;;;;mmmmmmmmm____mmmmmmmmmmmmmmmmYY',
    'YYmmmmmmmmmmmmmmmm____mmmmmmmmmmmmmpmmYY',
    'YYYmmmmmmmmpmmmmmm____mmmmmmmmmmmmmmmYYY',
    'YYYYmmmmmmmmmmmmmm____mmmmmmmmmmmmmmYYYY',
    '~~~~~~~~~~~~~~~~~~~==~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~==~~~~~~~~~~~~~~~~~~~',
    'YYYYmmmmmmmmmmmmmm____mmmmmmmmmmmmmmYYYY',
    'YYYmmmmmmmmmmmmmmm____mmmmmmmmmmmmmmmYYY',
    'YYmm;;;;;;;mmmmmmm____mmmmmmmmmmmmmmmmYY',
    'YYm;;;;;;;;;mmmmmm____mmmmmmmmm;;;;mmmYY',
    'YYm;;;;;;;;;mmmmmm____mmmmmmmm;;;;;;mmYY',
    'Ymm;;;;;;;;mmmmmmm____mmmmmmmm;;;;;;mmYY',
    'YYmm;;;;;;mmmmmmmm____mmmmmmmmm;;;;mmmYY',
    'YYmmmmmmmmmmmmpmmm____mmmmmmmmmmmmmmmmYY',
    'YYmmmmmmmmmmmmmmmm____mmmmmmmmmmmmmmmmYY',
    'YYYmmmmmmmmmmmmmmm____mmmmmmmmmmmmmmmmYY',
    'YYYmmmmmmmmmmmmmmm____mmmmmmmmmmmmmmYYYY',
    'YYYYYmmmmmmmmmmmmm____mmmmmmmmmmmmmYYYYY',
    'YYYYYYYYYYYYYYmmmm____mmmYYYYYYYYYYYYYYY',
    'YYYYYYYYYYYYYYYYYY____YYYYYYYYYYYYYYYYYY',
  ],
  legend: {
    m: 'moss',
    ';': 'fern',
    _: 'path',
    '~': 'water',
    '=': 'pier',
    Y: 'fortree',
    p: 'mushroom',
    '%': 'fog',
  },
  objects: [
    { type: 'beacon', number: 2, x: 16, y: 4 },
    {
      type: 'trainer', number: 2, x: 24, y: 6, dir: 'left', sight: 4, sprite: 'trainer2',
      afterWin: 'Dein Leuchtstein strahlt. Der Wald dankt dir.',
    },

    {
      type: 'npc', id: 'birk', name: 'Birk', x: 15, y: 26, dir: 'right', sprite: 'birk',
      linesAfter: ['Die Bäume flüstern nicht mehr. Sie singen!'],
      lines: [
        'Willkommen im Flüsterwald! Ich schnitze hier Figuren aus Fallholz.',
        'Siehst du die Steine mit dem hellen Zeichen? Darunter liegen Zettel mit Aufgaben.',
        'Wer sie löst, findet manchmal ein Stück der alten Geschichte.',
      ],
      linesLit: ['Der Leuchtstein des Waldes leuchtet! Meine Figuren werfen wieder Schatten.'],
    },
    {
      type: 'npc', id: 'fenna', name: 'Fenna', x: 8, y: 17, dir: 'down', sprite: 'fenna',
      linesAfter: ['Ohne Nebel wachsen meine Kräuter bis zum Himmel.'],
      lines: [
        'Im Farn wohnen wilde Wesen. Pass auf, wo du hintrittst!',
        'Die roten Beeren an den Sträuchern geben deinem Wesen Kraft. Sie wachsen wieder nach.',
      ],
      linesLit: ['Seit der Stein wieder leuchtet, duften meine Kräuter doppelt so stark.'],
    },
    {
      type: 'npc', id: 'lio', name: 'Lio', x: 23, y: 17, dir: 'left', sprite: 'lio',
      linesAfter: ['Ich habe Morrow ein Glühwürmchen geschenkt. Es leuchtet jetzt am Leuchtturm.'],
      lines: [
        'Ich suche Glühwürmchen für mein Glas.',
        'Die alten Bäume flüstern, wenn man an ihnen vorbeigeht. Hast du sie schon gehört?',
        'Der Waldläufer wohnt oben auf der Lichtung beim Leuchtstein. Ein Leuchtstein gibt Kraft!',
      ],
      linesLit: ['Die Glühwürmchen tanzen um den Leuchtstein! Komm, schau es dir an!'],
    },

    { type: 'whisper', id: 'baum-sued', x: 16, y: 22, lines: ['… so viele Wörter, vergessen … wir behalten sie für euch …', '… lerne, kleines Licht, lerne …'] },
    { type: 'whisper', id: 'baum-mitte', x: 24, y: 11, lines: ['… der Waldläufer wartet auf der Lichtung … er prüft, was du weißt …', '… ein Leuchtstein schenkt deinem Wesen neue Kraft …'] },
    { type: 'whisper', id: 'baum-nord', x: 15, y: 8, lines: ['… früher war der Wald hell … dann kam der Nebel vom Berg …', '… jemand im Berg ist sehr allein …'] },
    { type: 'whisper', id: 'baum-farn', x: 23, y: 24, lines: ['… im Farn glitzert manchmal etwas … schau genau hin …', '… Beeren wachsen wieder, wenn man Geduld hat …'] },

    // Geheimer Ort (Design 5.7): die hohle Eiche, nur mit der Laterne zu betreten
    {
      type: 'secret', id: 'hohle-eiche', place: 'eiche', prop: 'hollowoak', x: 5, y: 12,
      to: { map: 'eiche', x: 2, y: 10, dir: 'up' },
      lines: ['In der alten Eiche ist ein Loch, so groß wie eine Tür.', 'Drinnen ist es stockdunkel. Mit einer Laterne könntest du hineingehen.'],
      linesOpen: ['Du zündest die Laterne an und kletterst in die Eiche.'],
    },
    // Spielaufgabe (Lumara 1.2, js/data/tasks.js): vier Bäume mit eingeritzten Zeichen (index: 0 Raute,
    // 1 Dreieck, 2 Kreis, 3 Quadrat) und der Zeichenstein am Eingang. Sie stehen auf früheren
    // Baum- und Pilzfeldern.
    { type: 'task', id: 'task2-clue', task: 2, role: 'clue', prop: 'runestone', x: 14, y: 28 },
    { type: 'task', id: 'task2-switch0', task: 2, role: 'switch', index: 0, prop: 'runetree0', x: 1, y: 21 }, // am Westrand beim Farn
    { type: 'task', id: 'task2-switch1', task: 2, role: 'switch', index: 1, prop: 'runetree1', x: 29, y: 24 }, // im Südosten, wo ein Pilz stand
    { type: 'task', id: 'task2-switch2', task: 2, role: 'switch', index: 2, prop: 'runetree2', x: 37, y: 25 }, // am Ostrand
    { type: 'task', id: 'task2-switch3', task: 2, role: 'switch', index: 3, prop: 'runetree3', x: 3, y: 26 }, // im Südwesten
    { type: 'notestone', id: 'zettel-farn', x: 5, y: 24 },
    { type: 'notestone', id: 'zettel-bach', x: 33, y: 16 },
    { type: 'notestone', id: 'zettel-lichtung', x: 12, y: 4 },
    { type: 'bush', id: 'strauch-sued', x: 27, y: 22 },
    { type: 'bush', id: 'strauch-west', x: 6, y: 11 },

    { type: 'sign', id: 'schild-eingang', x: 17, y: 27, lines: ['Flüsterwald', 'Bleib auf dem Weg, dann hörst du die alten Bäume flüstern.'] },
    {
      // Nebelrand zum Pilzmoor (Design 10.4): Der Text hängt vom Stand ab, siehe world/fogEdge.js.
      type: 'sign', id: 'nebel-nord', role: 'fogEdge', x: 17, y: 2, gate: 2, leadsTo: 3, leadsToName: 'das Pilzmoor',
      lines: ['Der Nebel ist hier zu dicht.', 'Vielleicht weicht er, wenn der Leuchtstein des Waldes wieder leuchtet.'],
      linesOpen: ['Norden: Pilzmoor', 'Der Nebel hat sich zurückgezogen. Der Weg ist frei.'],
    },
  ],
  gates: [{ id: 'nord', leadsTo: 3, x: 18, y: 0, w: 4, h: 2, ground: 'path' }],
  exits: [
    { x: 18, y: 29, w: 4, h: 1, to: 'bucht', at: { x: 19, y: 1, dir: 'down' } },
    // Hinter dem Tor im Norden, nur begehbar, wenn es offen ist
    { x: 18, y: 0, w: 4, h: 1, to: 'moor', at: { x: 19, y: 28, dir: 'up' } },
  ],
  finds: [
    { id: 'glitzer-farn', x: 6, y: 20 },
    { id: 'glitzer-nord', x: 33, y: 5 },
    { id: 'glitzer-ost', x: 33, y: 20 },
  ],
  spawn: { x: 19, y: 28, dir: 'up' },
  respawn: { x: 16, y: 5, dir: 'up' },
  particles: ['firefly', 'leaf'], // Glühwürmchen und fallende Blätter (Design 5.3)
};
