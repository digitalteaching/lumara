// Gemeinsame Testdaten.

export const TEST_MAP_DEF = {
  id: 't',
  name: 'Test',
  area: 1,
  rows: ['######', '#..,,#', '#..,.#', '#.~o.#', '######'],
  legend: { '#': 'tree', '.': 'grass', ',': 'tallgrass', '~': 'water', o: 'rock' },
  objects: [{ type: 'trainer', number: 1, x: 1, y: 1, dir: 'right', sight: 4, sprite: 'trainer1' }],
  spawn: { x: 1, y: 2, dir: 'down' },
  respawn: { x: 1, y: 2, dir: 'down' },
};
