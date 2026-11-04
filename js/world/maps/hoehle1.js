// Die Höhle im Berg, obere Ebene (Design 5.3, Plan 5a). Eingang vom Höhlentor der Sternenwiese,
// Kristallmoos mit Echomäusen und Kristallraupen, zwei Echokristalle und rechts oben die Treppe
// hinab. Vor dem Finale wartet Ilvy am Eingang.

export const HOEHLE1 = {
  id: 'hoehle1',
  name: 'Höhle im Berg',
  genitive: 'der Höhle',
  area: 8,
  cave: 1,
  arena: 'cave',
  ground: 'cavefloor',
  rows: [
    'WWWWWWWWWWWWWWWWWWWW',
    'WW,,,....WWWW....vWW',
    'WW,,,,...WWW......WW',
    'WW,,,,.........,,.WW',
    'WWW,,......WW.,,,.WW',
    'WWWW.......WW..,,.WW',
    'WW.....WW.........WW',
    'WW.....WW......WWWWW',
    'WW,,,.........,,,.WW',
    'WW,,,,....WW..,,,.WW',
    'WWW,,.....WW.....WWW',
    'WWWW............WWWW',
    'WWWWW..........WWWWW',
    'WWWWWWWW....WWWWWWWW',
    'WWWWWWWWW.WWWWWWWWWW',
  ],
  legend: { W: 'cavewall', '.': 'cavefloor', ',': 'crystalmoss', v: 'stairsdown', '^': 'stairsup', '~': 'cavewater', '=': 'bridgev' },
  objects: [
    { type: 'npc', id: 'ilvy', name: 'Ilvy', x: 11, y: 12, dir: 'left', sprite: 'ilvy', when: 'beforeFinale' }, // spricht über ilvyCaveLines
    { type: 'deco', id: 'echo-1', x: 2, y: 6, prop: 'echocrystal', lines: ['Aus dem Kristall klingt ein leises Echo: „… und dann sang sie das Lied vom Meer …“'] },
    { type: 'deco', id: 'echo-2', x: 13, y: 9, prop: 'echocrystal', lines: ['Aus dem Kristall klingt ein leises Echo: „… wie hieß das noch gleich? …“'] },
  ],
  wild: { common: ['echomaus'], rare: 'kristallraupe' },
  exits: [
    { x: 9, y: 14, w: 1, h: 1, to: 'wiese', at: { x: 8, y: 8, dir: 'down' } },
    { x: 17, y: 1, w: 1, h: 1, to: 'hoehle2', at: { x: 2, y: 2, dir: 'down' } },
  ],
  spawn: { x: 9, y: 13, dir: 'up' },
  respawn: { x: 9, y: 13, dir: 'up' },
  particles: ['glimmer'],
};
