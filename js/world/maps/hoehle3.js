// Die Höhle im Berg, untere Ebene (Plan 5a): Hier wohnt Morrow. Davor ein warmer Kristall, der die
// Energie auffüllt. Nach dem Finale steht an Morrows Platz nur noch sein Kristall (when).

export const HOEHLE3 = {
  id: 'hoehle3',
  name: 'Höhle im Berg',
  genitive: 'der Höhle',
  area: 8,
  cave: 3,
  arena: 'cave',
  ground: 'cavefloor',
  rows: [
    'WWWWWWWWWWWWWWWW',
    'WWWW........WWWW',
    'WWW..........WWW',
    'WW............WW',
    'WW............WW',
    'WW............WW',
    'WWW..........WWW',
    'WWWW...~~...WWWW',
    'WWWW........WWWW',
    'WWWWW......WWWWW',
    'WWWWWW....WWWWWW',
    'WWWWWWWW^WWWWWWW',
  ],
  legend: { W: 'cavewall', '.': 'cavefloor', ',': 'crystalmoss', v: 'stairsdown', '^': 'stairsup', '~': 'cavewater', '=': 'bridgev' },
  objects: [
    { type: 'boss', id: 'morrow', x: 8, y: 3, when: 'beforeFinale' },
    { type: 'deco', id: 'morrows-kristall', x: 8, y: 3, prop: 'echocrystal', when: 'afterFinale', lines: ['Hier hat Morrow gewohnt. Der Kristall summt jetzt ein fröhliches Lied.'] },
    { type: 'heal', id: 'warmer-kristall', x: 4, y: 8 },
  ],
  exits: [
    { x: 8, y: 11, w: 1, h: 1, to: 'hoehle2', at: { x: 17, y: 12, dir: 'up' } },
  ],
  spawn: { x: 8, y: 10, dir: 'up' },
  respawn: { x: 8, y: 10, dir: 'up' },
  particles: ['glimmer'],
};
