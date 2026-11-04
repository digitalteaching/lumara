// Geheimer Ort: die Hohle Eiche im Flüsterwald (Design 5.7). Ein dunkler Gang zwischen Wurzeln,
// erreichbar mit der Laterne. Unten links der Ausgang, in der Mitte das Wurzelmoos mit dem
// Wurzelgeist, hinten rechts der Geschichtsstein und am Ende des Seitengangs ein Lebensstein.

export const EICHE = {
  id: 'eiche',
  name: 'Hohle Eiche',
  genitive: 'der Hohlen Eiche',
  area: 2,
  secret: 'eiche',
  dark: true, // nur das Licht der Laterne um die Spielfigur
  ground: 'rootfloor',
  rows: [
    'RRRRRRRRRRRRRRRRRRRR',
    'RRRRRRRRRRRR....RRRR',
    'RRRRR,,,,RRR.....RRR',
    'RRRR,,,,,,.........R',
    'RRRR,,,,,,RRRRRR...R',
    'RRRRR,,,,RRRRRRR...R',
    'RRRRRR..RRRRRRR...RR',
    'RRRRRR..RRRRRR...RRR',
    'RRR.....RRRRR...RRRR',
    'RRR..RRRRRRRR..RRRRR',
    'RR...RRRRRRRRRRRRRRR',
    'RR.RRRRRRRRRRRRRRRRR',
  ],
  legend: { R: 'rootwall', '.': 'rootfloor', ',': 'rootmoss' },
  objects: [{ type: 'storystone', id: 'geschichtsstein', place: 'eiche', x: 14, y: 1 }],
  secretStone: { x: 14, y: 9, place: 'eiche' },
  wild: { common: ['wurzelgeist'], rare: 'wurzelgeist' },
  exits: [{ x: 2, y: 11, w: 1, h: 1, to: 'wald', at: { x: 5, y: 13, dir: 'down' } }],
  spawn: { x: 2, y: 10, dir: 'up' },
  respawn: { x: 2, y: 10, dir: 'up' },
  particles: [],
};
