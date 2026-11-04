// Geheimer Ort: die Gezeiteninsel vor der Leuchtturmbucht (Design 5.7), erreichbar mit der
// Nussschale vom Pfahl am Ende des Stegs. Sand, Gezeitentümpel und Seegras mit der Perlkrabbe;
// oben rechts der Geschichtsstein zwischen alten Steinen, rechts ein Glanzstein.

export const GEZEITEN = {
  id: 'gezeiten',
  name: 'Gezeiteninsel',
  genitive: 'der Gezeiteninsel',
  area: 1,
  secret: 'gezeiten',
  ground: 'sand',
  rows: [
    '~~~~~~~~~~~~~~~~~~',
    '~~~~~::::::::~~~~~',
    '~~~:::,,,,:::::~~~',
    '~~::,,,,,,,:pp::~~',
    '~~::,,,,,,::pp:o~~',
    '~::::,,,,::::::::~',
    '~:o:::::::::pp:::~',
    '~~:pp::::::::pp:~~',
    '~~:pp::::o::::::~~',
    '~~~:::::::::::~~~~',
    '~~~~~~~~=~~~~~~~~~',
    '~~~~~~~~=~~~~~~~~~',
  ],
  legend: { '~': 'water', ':': 'sand', '=': 'pier', o: 'rock', p: 'tidepool', ',': 'tidegrass' },
  objects: [{ type: 'storystone', id: 'geschichtsstein', place: 'gezeiten', x: 14, y: 2 }],
  secretStone: { x: 16, y: 6, place: 'gezeiten' },
  wild: { common: ['perlkrabbe'], rare: 'perlkrabbe' },
  exits: [{ x: 8, y: 11, w: 1, h: 1, to: 'bucht', at: { x: 19, y: 27, dir: 'up' } }],
  spawn: { x: 8, y: 10, dir: 'up' },
  respawn: { x: 8, y: 10, dir: 'up' },
  particles: ['gull'],
};
