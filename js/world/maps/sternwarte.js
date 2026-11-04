// Geheimer Ort: die Sternwarte in den Uhrwerkruinen (Design 5.7), erreichbar mit der Sternkarte
// über die Tafel am Kanal. Unten die Brücke, dann der Zahnradraum mit drei Rädern und einer Tafel,
// die mit der Sternkarte verrät, wohin ihre Sterne zeigen müssen. Stehen alle richtig, öffnet sich
// das Tor zur Kuppel: dort Sternengras mit der Zeitschnecke, der Geschichtsstein und ein Weitblickstein.

export const STERNWARTE = {
  id: 'sternwarte',
  name: 'Sternwarte',
  genitive: 'der Sternwarte',
  area: 6,
  secret: 'sternwarte',
  ground: 'cobble',
  rows: [
    'WWWWWWWWWWWWWWWWWWW',
    'WWW,,,,,...,,,,,WWW',
    'WWW,,,.......,,,WWW',
    'WWWW...........WWWW',
    'WWWWWWWWGGGWWWWWWWW',
    'WW...............WW',
    'WW...............WW',
    'WW...............WW',
    'WWWWWWWWW.WWWWWWWWW',
    '~~~~~~~~~=~~~~~~~~~',
    '~~~~~~~~~=~~~~~~~~~',
    '~~~~~~~~~=~~~~~~~~~',
  ],
  legend: { W: 'ruinwall', '.': 'cobble', ',': 'startall', G: 'domegate', '~': 'canal', '=': 'bridgev' },
  gates: [{ id: 'kuppel', afterPuzzle: 'sternwarte', x: 8, y: 4, w: 3, h: 1, ground: 'cobble' }],
  objects: [
    { type: 'gear', id: 'rad-1', index: 0, x: 5, y: 6 },
    { type: 'gear', id: 'rad-2', index: 1, x: 9, y: 6 },
    { type: 'gear', id: 'rad-3', index: 2, x: 13, y: 6 },
    { type: 'gearhint', id: 'sterntafel', x: 11, y: 7 },
    { type: 'storystone', id: 'geschichtsstein', place: 'sternwarte', x: 9, y: 1 },
  ],
  secretStone: { x: 13, y: 3, place: 'sternwarte' },
  wild: { common: ['zeitschnecke'], rare: 'zeitschnecke' },
  exits: [{ x: 9, y: 11, w: 1, h: 1, to: 'ruinen', at: { x: 27, y: 7, dir: 'left' } }],
  spawn: { x: 9, y: 10, dir: 'up' },
  respawn: { x: 9, y: 10, dir: 'up' },
  particles: ['glint'],
};
