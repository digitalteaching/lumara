// Geheimer Ort: die Irrlichtinsel im Pilzmoor (Design 5.7), erreichbar mit der Nussschale vom
// Pfahl am Südufer. Torf, Leuchtpilze und Schilf mit der Irrlichtfee, über allem tanzen Irrlichter;
// rechts in einer Nische der Geschichtsstein, links ein Zeitstein.

export const IRRLICHT = {
  id: 'irrlicht',
  name: 'Irrlichtinsel',
  genitive: 'der Irrlichtinsel',
  area: 3,
  secret: 'irrlicht',
  ground: 'peat',
  rows: [
    'BBBBBBBBBBBBBBBBBB',
    'BBBBBaaaaaaaBBBBBB',
    'BBBaaauaarrrraBBBB',
    'BBaaarrrrrrrraaBBB',
    'BBauarrrrrrraaaaBB',
    'BBaaaarrrraaaBaaBB',
    'BBBaaaaaaaaaBBBaBB',
    'BBaaaBBaaaaaaauaBB',
    'BBauaBBaaaaaaaaaBB',
    'BBBaaaaaaaaaaBBBBB',
    'BBBBBBBB=BBBBBBBBB',
    'BBBBBBBB=BBBBBBBBB',
  ],
  legend: { B: 'bog', a: 'peat', r: 'reed', u: 'glowshroom', '=': 'pier' },
  objects: [{ type: 'storystone', id: 'geschichtsstein', place: 'irrlicht', x: 15, y: 6 }],
  secretStone: { x: 2, y: 8, place: 'irrlicht' },
  wild: { common: ['irrlichtfee'], rare: 'irrlichtfee' },
  exits: [{ x: 8, y: 11, w: 1, h: 1, to: 'moor', at: { x: 7, y: 16, dir: 'down' } }],
  spawn: { x: 8, y: 10, dir: 'up' },
  respawn: { x: 8, y: 10, dir: 'up' },
  particles: ['wisp', 'spore'],
};
