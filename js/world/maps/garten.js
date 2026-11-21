// Der Garten am Leuchtturm (Lumara 1.2): Hier wohnen alle Freunde, die gerade nicht mitlaufen.
// Durch das Weidentor über dem Leuchtturm kommt man herein. Eine Wiese mit Blumen, links oben ein
// Teich für die Wasserwesen, ein Weg vom Tor bis zum Schild. Kein hohes Gras, keine Begegnungen.
// Die Freunde stellt js/scenes/gardenEvents.js auf die Wiese. 24 × 16 Felder.

export const GARTEN = {
  id: 'garten',
  name: 'Garten',
  genitive: 'des Gartens',
  area: 1, // Musik wie die Bucht
  garden: true,
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTTTTTTT',
    'TT..*......TT......*..TT',
    'T.......*.......*......T',
    'T..*.~~~........T...*..T',
    'T...~~~~~.*.......o....T',
    'T*..~~~~~.....*........T',
    'T....~~~..*.........*..T',
    'T.*..........*.....T...T',
    'T.......*..*.*.........T',
    'T..o.......___.....*...T',
    'T.....*....*_*.....o...T',
    'T.T........._....*.....T',
    'T.....*....._.......*..T',
    'TT..*......*_*.......TTT',
    'TTTTTTTTTTTT_TTTTTTTTTTT',
  ],
  legend: {
    '.': 'grass',
    _: 'path',
    '~': 'water',
    T: 'tree',
    o: 'rock',
    '*': 'flowers',
  },
  objects: [
    // Am Ende des Wegs: Das Schild zählt die Freunde (js/scenes/gardenEvents.js).
    {
      type: 'sign', id: 'garten-schild', role: 'friendCount', x: 12, y: 9,
      lines: ['Garten am Leuchtturm', 'Hier wohnen deine Freunde.'],
    },
  ],
  exits: [{ x: 12, y: 15, w: 1, h: 1, to: 'bucht', at: { x: 33, y: 10, dir: 'down' } }],
  spawn: { x: 12, y: 14, dir: 'up' },
  respawn: { x: 12, y: 14, dir: 'up' },
  particles: [],
};
