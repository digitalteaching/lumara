// Geheimer Ort: oben auf dem Glasturm in den Spiegeldünen (Design 5.7), erreichbar mit dem
// Kletterhaken. Ein Boden aus Glas, der das Licht bricht, am Rand die Glaswand. Im Prismengras
// die Prismalibelle, oben rechts der Geschichtsstein, hinten ein Weitblickstein.

export const GLASTURM = {
  id: 'glasturm',
  name: 'Glasturm',
  genitive: 'des Glasturms',
  area: 4,
  secret: 'glasturm',
  ground: 'glassfloor',
  rows: [
    'WWWWWWWWWWWWWWWW',
    'WWGGGGGGGGGGGGWW',
    'WGGG,,,,GGGGGGGW',
    'WGG,,,,,,GGGGGGW',
    'WGG,,,,,,GGWWGGW',
    'WGGG,,,,GGGWWGGW',
    'WGGGGGGGGGGGGGGW',
    'WGGGGGGWWGGGGGGW',
    'WGGGGGGWWGGGGGGW',
    'WWGGGGGGGGGGGGWW',
    'WWWWWWWGGWWWWWWW',
    'WWWWWWWGWWWWWWWW',
  ],
  legend: { W: 'glasswall', G: 'glassfloor', ',': 'prismgrass' },
  objects: [{ type: 'storystone', id: 'geschichtsstein', place: 'glasturm', x: 12, y: 2 }],
  secretStone: { x: 13, y: 8, place: 'glasturm' },
  wild: { common: ['prismalibelle'], rare: 'prismalibelle' },
  exits: [{ x: 7, y: 11, w: 1, h: 1, to: 'duenen', at: { x: 15, y: 5, dir: 'down' } }],
  spawn: { x: 7, y: 10, dir: 'up' },
  respawn: { x: 7, y: 10, dir: 'up' },
  particles: ['glint'],
};
