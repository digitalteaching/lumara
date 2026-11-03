// Gebiet 2: der Flüsterwald (Design 5.3). 40 × 30 Felder.
// Süden: Eingang von der Bucht. Mitte: ein Bach mit Brücke. Norden: Lichtung mit Leuchtstein und
// Waldläufer, dahinter Nebel über dem Weg zum Pilzmoor.

export const WALD = {
  id: 'wald',
  name: 'Flüsterwald',
  area: 2,
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
    'YYm;;;;;;;;mmmmmmm____mmmmmmmm;;;;;;mmYY',
    'YYmm;;;;;;mmmmmmmm____mmmmmmmmm;;;;mmmYY',
    'YYmmmmmmmmmmmmpmmm____mmmmmmmmmmmmmmmmYY',
    'YYmmmmmmmmmmmmmmmm____mmmmmmmpmmmmmmmmYY',
    'YYYmmmmmmmmmmmmmmm____mmmmmmmmmmmmmmmYYY',
    'YYYYmmmmmmmmmmmmmm____mmmmmmmmmmmmmmYYYY',
    'YYYYYmmmmmmmmmmmmm____mmmmmmmmmmmmmYYYYY',
    'YYYYYYYYYYYYYYYmmm____mmmYYYYYYYYYYYYYYY',
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
    { type: 'trainer', number: 2, x: 24, y: 6, dir: 'left', sight: 4, sprite: 'trainer2' },

    {
      type: 'npc', id: 'birk', name: 'Birk', x: 15, y: 26, dir: 'right', sprite: 'birk',
      lines: ['Willkommen im Flüsterwald!'],
    },
    {
      type: 'npc', id: 'fenna', name: 'Fenna', x: 8, y: 17, dir: 'down', sprite: 'fenna',
      lines: ['Im Farn wohnen wilde Wesen.'],
    },
    {
      type: 'npc', id: 'lio', name: 'Lio', x: 23, y: 17, dir: 'left', sprite: 'lio',
      lines: ['Ich suche Glühwürmchen.'],
    },

    { type: 'whisper', id: 'baum-sued', x: 16, y: 22, lines: ['… psst …'] },
    { type: 'whisper', id: 'baum-mitte', x: 24, y: 11, lines: ['… psst …'] },
    { type: 'whisper', id: 'baum-nord', x: 15, y: 8, lines: ['… psst …'] },
    { type: 'whisper', id: 'baum-farn', x: 23, y: 24, lines: ['… psst …'] },

    { type: 'notestone', id: 'zettel-farn', x: 5, y: 24 },
    { type: 'notestone', id: 'zettel-bach', x: 33, y: 16 },
    { type: 'notestone', id: 'zettel-lichtung', x: 12, y: 4 },
    { type: 'bush', id: 'strauch-sued', x: 27, y: 22 },
    { type: 'bush', id: 'strauch-west', x: 6, y: 11 },

    { type: 'sign', x: 17, y: 27, lines: ['Flüsterwald', 'Bleib auf dem Weg, dann hörst du die alten Bäume flüstern.'] },
    {
      // Nebelrand zum Pilzmoor (Design 10.4): Der Text hängt vom Stand ab, siehe world/fogEdge.js.
      type: 'sign', role: 'fogEdge', x: 17, y: 2, gate: 2, leadsTo: 3, leadsToName: 'das Pilzmoor',
      lines: ['Der Nebel ist hier zu dicht.', 'Vielleicht weicht er, wenn der Leuchtstein des Waldes wieder leuchtet.'],
    },
  ],
  gates: [{ id: 'nord', leadsTo: 3, x: 18, y: 0, w: 4, h: 2, ground: 'path' }],
  exits: [{ x: 18, y: 29, w: 4, h: 1, to: 'bucht', at: { x: 19, y: 1, dir: 'down' } }],
  finds: [
    { id: 'glitzer-farn', x: 6, y: 20 },
    { id: 'glitzer-nord', x: 33, y: 5 },
    { id: 'glitzer-ost', x: 33, y: 20 },
  ],
  spawn: { x: 19, y: 28, dir: 'up' },
  respawn: { x: 16, y: 5, dir: 'up' },
};
