// Gebiet 3: das Pilzmoor (Design 5.3). 40 × 30 Felder.
// Süden: Eingang aus dem Flüsterwald und die Marsch mit Schilf. Mitte: ein Moorsee, über den ein
// Steg führt; im Westen liegt die Irrlichtinsel (zu sehen, aber ohne Boot nicht erreichbar, Plan 4).
// Norden: Torfplateau mit Leuchtstein und Pilzsammlerin, dahinter Nebel über dem Weg zu den Spiegeldünen.

export const MOOR = {
  id: 'moor',
  name: 'Pilzmoor',
  genitive: 'des Pilzmoors',
  area: 3,
  ground: 'peat', // Boden unter Bäumen und Pilzen am Rand
  rows: [
    'YYYYYYYYYYYYYYYYYY%%%%YYYYYYYYYYYYYYYYYY',
    'YYYYYYYYYYYYYYYYYY%%%%YYYYYYYYYYYYYYYYYY',
    'YYYYYaaaaaaauaaaaaaaaaaaaaaaaaaaaaaYYYYY',
    'YYYauaaaaaaaaaaaaaaaaaaaaaaarrrrrrraaYYY',
    'YYYaaaaaaaaaaaaaaaaaaaaaaaaarrrrrrruaYYY',
    'YYYarrrrrraaaaaaaaaaaaaaaaaarrrrrrraaYYY',
    'YYYarrrrrraaaaaaaaaaaaaaaaaarrrrrrraaYYY',
    'YYYarrrrrraaaaaaaaaaaaaaaaaaaaaaaaaaaYYY',
    'YYBBBBBBBBBBBBBBBBB==BBBBBBBBBBBBBBBBBYY',
    'YYBBBBBBBBBBBBBBBBB==BBBBBBBBBBBBBBBBBYY',
    'YYBBBBaauaBBBBBBBBB==BBBBBBBBBBBBBBBBBYY',
    'YYBBBBaaaaBBBBBBBBB==BBBBBBBBBBBBBBBBBYY',
    'YYBBBBaaaaBBBBBBBBB==BBBBBBBBBBBBBBBBBYY',
    'YYBBBBBBBBBBBBBBBBB==BBBBBBBBBBBBBBBBBYY',
    'YYBBBBBBBBBBBBBBBBB==BBBBBBBBBBBBBBBBBYY',
    'YYBBBBBBBBBBBBBBBBB==BBBBBBBBBBBBBBBBBYY',
    'YYaaaaaaaaaaaaaaaaaaaaaaaaaaaaaBBBBaaaYY',
    'YYauaaaaaaaaaaaaaaaaaaaaaaaaaaaBBBBaaaYY',
    'YYaarrrrrrrraaaaaaaaaaaaaaaaaaaaaaaaaaYY',
    'YYaarrrrrrrraaaaaaaaaaaaaaarrrrrrrraaaYY',
    'YYaarrrrrrrraaaaaaaaaaaaaaarrrrrrrraaaYY',
    'YYaarrrrrrrraaaaaaaaaaaaaaarrrrrrrrauaYY',
    'YYaarrrrrrrraaaaaaaaaaaaaaarrrrrrrraaaYY',
    'YYaaaaaaaaaaaaaaaaaaaaaaaaarrrrrrrraaaYY',
    'YYaaaaBBBBaaaaaaaaaaaaaaaaarrrrrrrraaaYY',
    'YYaaaaBBBBaaaauaaaaaaaaaaaaaaaaaaaaaaaYY',
    'YYYYaaaaaaaaaaaaaaaaaaaaauaYYYYYYYYYYYYY',
    'YYYYYYYYYYYYaaaaaaaaaaaaaaaaYYYYYYYYYYYY',
    'YYYYYYYYYYYYYYYYYYaaaaYYYYYYYYYYYYYYYYYY',
    'YYYYYYYYYYYYYYYYYYaaaaYYYYYYYYYYYYYYYYYY',
  ],
  legend: {
    a: 'peat',
    r: 'reed',
    B: 'bog',
    '=': 'pier',
    u: 'glowshroom',
    Y: 'fortree',
    '%': 'fog',
  },
  objects: [
    { type: 'beacon', number: 3, x: 16, y: 4 },
    {
      type: 'trainer', number: 3, x: 20, y: 7, dir: 'down', sight: 4, sprite: 'trainer3',
      afterWin: 'Dein Leuchtstein strahlt. Die Pilze leuchten heller als je zuvor.',
    },

    {
      type: 'npc', id: 'wenke', name: 'Wenke', x: 13, y: 19, dir: 'right', sprite: 'wenke',
      lines: [
        'Willkommen im Pilzmoor! Ich koche die beste Pilzsuppe der ganzen Insel.',
        'Die leuchtenden Pilze isst man nicht. Sie zeigen nur im Dunkeln den Weg.',
        'Auch im Moor wachsen Beeren. Schau bei den Sträuchern am Rand nach!',
      ],
      linesLit: ['Der Leuchtstein des Moors strahlt! Heute koche ich eine Festsuppe.'],
    },
    {
      type: 'npc', id: 'jasper', name: 'Jasper', x: 22, y: 16, dir: 'left', sprite: 'jasper',
      lines: [
        'Ich baue die Stege übers Moor. Bleib immer schön auf dem Holz!',
        'Siehst du die kleine Insel im Westen? Dort tanzen nachts die Irrlichter.',
        'Ohne Boot kommt da niemand hin. Vielleicht findet sich eines Tages eins.',
      ],
      linesLit: ['Seit der Stein wieder leuchtet, knarren meine Stege richtig fröhlich.'],
    },
    {
      type: 'npc', id: 'nele', name: 'Nele', x: 24, y: 21, dir: 'down', sprite: 'nele',
      lines: [
        'Hast du die Irrlichter gesehen? Sie flackern, wenn man ihnen zuwinkt!',
        'Unter den Steinen mit dem hellen Zeichen liegen Zettel. Ich hab schon zwei gelöst!',
      ],
      linesLit: ['Die Irrlichter tanzen jetzt um den Leuchtstein. Komm, wir schauen zu!'],
      linesOpen: [
        'Die Irrlichter tanzen jetzt um den Leuchtstein!',
        'Im Norden ist der Nebel weg. Dahinter sollen Dünen aus Glas liegen!',
      ],
    },

    { type: 'notestone', id: 'zettel-nord', x: 24, y: 3 },
    { type: 'notestone', id: 'zettel-marsch', x: 14, y: 22 },
    { type: 'notestone', id: 'zettel-tuempel', x: 10, y: 24 },
    { type: 'bush', id: 'strauch-west', x: 3, y: 24 },
    { type: 'bush', id: 'strauch-ost', x: 36, y: 18 },

    { type: 'deco', id: 'pilz-nordwest', x: 11, y: 3, prop: 'bigshroom' },
    { type: 'deco', id: 'pilz-nordost', x: 25, y: 4, prop: 'bigshroom' },
    { type: 'deco', id: 'pilz-tuempel', x: 35, y: 17, prop: 'bigshroom' },
    { type: 'deco', id: 'pilz-sued', x: 16, y: 24, prop: 'bigshroom' },
    // Die Irrlichtinsel: sichtbar, aber unerreichbar (Platz für Plan 4)
    { type: 'deco', id: 'irrlichtinsel', x: 7, y: 11, prop: 'bigshroom' },

    { type: 'sign', id: 'schild-eingang', x: 17, y: 26, lines: ['Pilzmoor', 'Bleib auf dem Torf und den Stegen. Das Moorwasser ist tief.'] },
    {
      // Nebelrand zu den Spiegeldünen (Design 10.4): Der Text hängt vom Stand ab, siehe world/fogEdge.js.
      type: 'sign', id: 'nebel-nord', role: 'fogEdge', x: 17, y: 2, gate: 3, leadsTo: 4, leadsToName: 'die Spiegeldünen', leadsToPlural: true,
      lines: ['Der Nebel ist hier zu dicht.', 'Vielleicht weicht er, wenn der Leuchtstein des Moors wieder leuchtet.'],
      linesOpen: ['Norden: Spiegeldünen', 'Der Nebel hat sich zurückgezogen. Der Weg ist frei.'],
    },
  ],
  gates: [{ id: 'nord', leadsTo: 4, x: 18, y: 0, w: 4, h: 2, ground: 'peat' }],
  exits: [
    { x: 18, y: 29, w: 4, h: 1, to: 'wald', at: { x: 19, y: 1, dir: 'down' } },
    // Hinter dem Tor im Norden, nur begehbar, wenn es offen ist
    { x: 18, y: 0, w: 4, h: 1, to: 'duenen', at: { x: 19, y: 28, dir: 'up' } },
  ],
  finds: [
    { id: 'glitzer-nordwest', x: 6, y: 6 },
    { id: 'glitzer-nordost', x: 31, y: 4 },
    { id: 'glitzer-suedost', x: 30, y: 22 },
  ],
  spawn: { x: 19, y: 28, dir: 'up' },
  respawn: { x: 16, y: 5, dir: 'up' },
  particles: ['spore', 'bubble', 'wisp'], // Sporen, Blasen auf dem Moorwasser, Irrlichter (Design 5.3)
};
