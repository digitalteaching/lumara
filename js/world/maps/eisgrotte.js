// Geheimer Ort: die Eisgrotte am Nordlichtsee (Design 5.7), erreichbar mit den Eiskufen von der
// Eiskante. Unten fester Schnee mit dem Ausgang und links Schneegras mit dem Kristallotter.
// Dahinter Rutscheis mit Eissäulen: Wer darauf tritt, gleitet, bis etwas ihn aufhält. Oben rechts
// liegt der Kristall mit dem Geschichtsstück auf einer Schneeinsel; oben links, am Ende einer
// Rutschbahn, ein Lebensstein (er hält das Gleiten auf, bis man ihn nimmt).
// Der kürzeste Weg braucht drei Rutschzüge, solange der Stein liegt, danach fünf (tests/slide.test.js);
// feststecken kann man nirgends.

export const EISGROTTE = {
  id: 'eisgrotte',
  name: 'Eisgrotte',
  genitive: 'der Eisgrotte',
  area: 7,
  secret: 'eisgrotte',
  ground: 'snow',
  rows: [
    'WWWWWWWWWWWWWWWW',
    'WWiiiiiiXiiXsssW',
    'WWiiiiiiiiiiiXWW',
    'WWiiXiiiiiiiiiWW',
    'WWiiiiiiiXiiiiWW',
    'WWiiiiiiiiiiXiWW',
    'WWiiXiiiiiiiiiWW',
    'WWiiiiiiiiiXiiWW',
    'WW,,WiiiXiiiiiWW',
    'WW,,WiiiiiiiiiWW',
    'WW,,ssssssssssWW',
    'WWWWWWWsWWWWWWWW',
  ],
  legend: { W: 'icewall', X: 'icepillar', i: 'slideice', s: 'snow', ',': 'snowgrass' },
  objects: [{ type: 'storystone', id: 'kristall', place: 'eisgrotte', prop: 'icecrystal', x: 14, y: 1 }],
  secretStone: { x: 2, y: 1, place: 'eisgrotte' },
  wild: { common: ['kristallotter'], rare: 'kristallotter' },
  exits: [{ x: 7, y: 11, w: 1, h: 1, to: 'see', at: { x: 28, y: 4, dir: 'left' } }],
  spawn: { x: 7, y: 10, dir: 'up' },
  respawn: { x: 7, y: 10, dir: 'up' },
  particles: ['glint'],
};
