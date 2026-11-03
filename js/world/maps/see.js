// Gebiet 7: der Nordlichtsee (Design 5.3). 40 × 30 Felder.
// Ein gefrorener See mit Löchern aus offenem Wasser, verschneite Ufer und Tannen. Norden: Eingang aus
// den Uhrwerkruinen. Nordosten: offenes Wasser vor der Eisgrotte (zu sehen, aber noch nicht
// erreichbar, Plan 4). Mitten auf dem Eis die Eisfischerin. Süden: Nebel über dem Weg zur Sternenwiese.

export const SEE = {
  id: 'see',
  name: 'Nordlichtsee',
  genitive: 'des Nordlichtsees',
  area: 7,
  ground: 'snow',
  rows: [
    'PPPPPPPPPPPPPPPPPPssssPPPPPPPPPPPPPPPPPP',
    'PPPPPPPPPPPPPPPPPPssssPPPPPPPPPPPPPPPPPP',
    'PPsssssssssssssssssssssPPsssswwwwsssswPP',
    'PPsGGGGGGssssssssssssssPPsssswwwwsssswPP',
    'PPsGGGGGGsssssssssssssssssssswwwwsssswPP',
    'PPsGGGGGGsssssssssssssssssssswwwwwwwwwPP',
    'PPssssssssssssssssssssssssssswwwwwwwwwPP',
    'PPssssssssssssssssssssssssssswwwwwwwwwPP',
    'PPssssssiiiiiiiiiiiiiiiiiiiiiiiissssssPP',
    'PPsssssiiiiiiiiiiiiiiiiiiiiiiiiiisssssPP',
    'PPGGGsiiiiiiiiiiiiiiiiiiiiiwwiiiiissssPP',
    'PPGGGsiiiiwwiiiiiiiiiiiiiiiwwiiiiisPPsPP',
    'PPGGGsiiiiwwiiiiiiiiiiiiiiiiiiiiiisPPsPP',
    'PPGGGsiiiiiiiiiiiiiiiiiiiiiiiiiiiissssPP',
    'PPGGGsiiiiiiiiiiiiiiiiiiiiiiiiiiiissssPP',
    'PPGGGsiiiiiiiiiiiiiiiiiiiiiiiiiiiissssPP',
    'PPGGGsiiiiiiiiiiiiiiiiiiiiiiiiiiiissssPP',
    'PPGGGsiiiiiiiiiiiiiiiiiiiiiiiwwiiissssPP',
    'PPGGGsiiiiiiiiiiwwiiiiiiiiiiiiiiiissssPP',
    'PPssssiiiiiiiiiiwwiiiiiiiiiiiiiiiissssPP',
    'PPsssssiiiiiiiiiiiiiiiiiiiiiiiiiisssssPP',
    'PPPPssssiiiiiiiiiiiiiiiiiiiiiiiissssssPP',
    'PPPPssssssssssssssssssssssssssssssssssPP',
    'PPssssssssssssssssssssssssssssssssssssPP',
    'PPssssssssssssssssssssssssGGGGGGGGssssPP',
    'PPsssssssssssPPsssssssssssGGGGGGGGssssPP',
    'PPsssssssssssPPsssssssssssGGGGGGGGssssPP',
    'PPssssssssssssssssssssssssssssssssssssPP',
    'PPPPPPPPPPPPPPPPPP%%%%PPPPPPPPPPPPPPPPPP',
    'PPPPPPPPPPPPPPPPPP%%%%PPPPPPPPPPPPPPPPPP',
  ],
  legend: {
    s: 'snow',
    i: 'ice',
    w: 'icewater',
    P: 'snowpine',
    G: 'snowgrass',
    '%': 'fog',
  },
  objects: [
    { type: 'beacon', number: 7, x: 30, y: 22 },
    {
      type: 'trainer', number: 7, x: 24, y: 15, dir: 'left', sight: 4, sprite: 'trainer7',
      afterWin: 'Dein Leuchtstein strahlt. Sieh nur, das Nordlicht leuchtet heller!',
    },

    {
      type: 'npc', id: 'sven', name: 'Sven', x: 12, y: 6, dir: 'left', sprite: 'sven',
      lines: [
        'Ich bin Sven. Seit vierzig Wintern fische ich auf diesem See.',
        'In meinem Zelt ist es warm. Draußen bohre ich Löcher ins Eis und warte.',
        'Freya ist die Beste von uns allen. Sie steht mitten auf dem Eis.',
      ],
      linesLit: ['Der Stein leuchtet! Heute beißen die Fische, das spüre ich in den Knien.'],
    },
    {
      type: 'npc', id: 'mira', name: 'Mira', x: 28, y: 6, dir: 'right', sprite: 'mira',
      lines: [
        'Ich bin Mira und baue Figuren aus Schnee. Gefällt dir mein Eisvogel?',
        'Siehst du die Eisgrotte dort hinter dem offenen Wasser?',
        'Hin kommt nur, wer über das Eis gleiten kann. Ich kann es leider nicht.',
      ],
      linesLit: ['Seit der Stein leuchtet, glitzert die Eisgrotte wie ein Kristall.'],
    },
    {
      type: 'npc', id: 'ari', name: 'Ari', x: 8, y: 23, dir: 'right', sprite: 'ari',
      lines: [
        'Nachts tanzt das Nordlicht über dem See. Grün und lila! Hast du es gesehen?',
        'Unter manchen Steinen liegen Zettel. Ich habe schon zwei gefunden!',
      ],
      linesLit: ['Das Nordlicht ist heute so hell, dass ich ohne Laterne lesen kann!'],
    },

    { type: 'deco', id: 'zelt', x: 10, y: 6, prop: 'tent', lines: ['Svens Fischerzelt. Drinnen ist es warm und riecht nach Tee.'] },
    // Die Eisgrotte hinter dem offenen Wasser: zu sehen, aber noch nicht erreichbar (Plan 4)
    { type: 'deco', id: 'eisgrotte', x: 35, y: 4, prop: 'icecave' },

    { type: 'notestone', id: 'zettel-nord', x: 24, y: 5 },
    { type: 'notestone', id: 'zettel-ost', x: 36, y: 20 },
    { type: 'notestone', id: 'zettel-sued', x: 6, y: 26 },
    { type: 'bush', id: 'strauch-nord', x: 15, y: 3 },
    { type: 'bush', id: 'strauch-ost', x: 36, y: 15 },

    { type: 'sign', id: 'schild-eingang', x: 17, y: 2, lines: ['Nordlichtsee', 'Das Eis trägt. Um die Löcher bitte einen Bogen machen.'] },
    {
      // Nebelrand zur Sternenwiese (Design 10.4)
      type: 'sign', id: 'nebel-sued', role: 'fogEdge', x: 17, y: 27, gate: 7, leadsTo: 8, leadsToName: 'die Sternenwiese',
      lines: ['Der Nebel ist hier zu dicht.', 'Vielleicht weicht er, wenn der Leuchtstein des Sees wieder leuchtet.'],
      linesOpen: ['Süden: Sternenwiese', 'Der Nebel hat sich zurückgezogen. Der Weg ist frei.'],
    },
  ],
  gates: [{ id: 'sued', leadsTo: 8, x: 18, y: 28, w: 4, h: 2, ground: 'snow' }],
  exits: [
    { x: 18, y: 0, w: 4, h: 1, to: 'ruinen', at: { x: 19, y: 28, dir: 'up' } },
    { x: 18, y: 29, w: 4, h: 1, to: 'wiese', at: { x: 19, y: 1, dir: 'down' } },
  ],
  finds: [
    { id: 'glitzer-west', x: 3, y: 14 },
    { id: 'glitzer-sued', x: 30, y: 25 },
    { id: 'glitzer-nord', x: 5, y: 4 },
  ],
  spawn: { x: 19, y: 1, dir: 'down' },
  respawn: { x: 30, y: 23, dir: 'up' },
  particles: ['snow', 'aurora'], // Schnee und Nordlicht (Design 5.3)
};
