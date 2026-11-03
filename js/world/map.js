// Karten: Kacheln, Objekte, Kollision, Trainerblick, Erreichbarkeit. DOM-frei.

export const WALKABLE = new Set([
  'grass', 'tallgrass', 'path', 'sand', 'flowers', 'pier', 'moss', 'fern',
  'peat', 'reed', 'glasssand', 'dunegrass', 'cliffrock', 'windgrass', 'bridge', 'bridgev',
]);
// Luftspiegelungen sehen aus wie ein Weg, sind aber blockiert (Design 5.3).
export const BLOCKED = new Set([
  'water', 'tree', 'rock', 'fence', 'fog', 'cliff', 'fortree', 'mushroom',
  'bog', 'glowshroom', 'dune', 'mirage', 'clouds', 'spire',
]);
// Hohes Gras, in dem wilde Wesen und Steine warten: Farn im Wald, Schilf im Moor, Dünengras und Windgras.
export const TALL_GRASS = new Set(['tallgrass', 'fern', 'reed', 'dunegrass', 'windgrass']);

const DELTA = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

export const cellKey = (x, y) => `${x},${y}`;

export function step({ x, y }, dir) {
  const [dx, dy] = DELTA[dir];
  return { x: x + dx, y: y + dy };
}

// openGates: IDs der Nebeltore (def.gates), deren Felder statt Nebel ihren Boden bekommen.
export function createMap(def, { openGates = [] } = {}) {
  const height = def.rows.length;
  const width = height ? def.rows[0].length : 0;
  const tiles = [];

  def.rows.forEach((row, y) => {
    if (row.length !== width) {
      throw new Error(`Karte ${def.name}: Zeile ${y + 1} hat Länge ${row.length} statt ${width}`);
    }
    for (const ch of row) {
      const kind = def.legend[ch];
      if (!kind || !(WALKABLE.has(kind) || BLOCKED.has(kind))) {
        throw new Error(`Karte ${def.name}: unbekanntes Zeichen '${ch}' in Zeile ${y + 1}`);
      }
      tiles.push(kind);
    }
  });

  for (const g of def.gates ?? []) {
    if (!openGates.includes(g.id)) continue;
    for (let y = g.y; y < g.y + g.h; y++) for (let x = g.x; x < g.x + g.w; x++) tiles[y * width + x] = g.ground;
  }

  // Jede Zelle, die ein Objekt belegt (Gebäude belegen ihre ganze Fläche).
  const occupant = new Map();
  for (const o of def.objects ?? []) {
    if (o.type === 'building') {
      for (let dy = 0; dy < o.h; dy++) for (let dx = 0; dx < o.w; dx++) occupant.set(cellKey(o.x + dx, o.y + dy), o);
    } else {
      occupant.set(cellKey(o.x, o.y), o);
    }
  }

  const inBounds = (x, y) => x >= 0 && y >= 0 && x < width && y < height;
  const tileAt = (x, y) => (inBounds(x, y) ? tiles[y * width + x] : null);

  return {
    def,
    width,
    height,
    inBounds,
    tileAt,
    setTile(x, y, kind) {
      if (inBounds(x, y)) tiles[y * width + x] = kind;
    },
    isTallGrass: (x, y) => TALL_GRASS.has(tileAt(x, y)),
    objectAt: (x, y) => occupant.get(cellKey(x, y)) ?? null,
    doorAt(x, y) {
      const o = occupant.get(cellKey(x, y));
      return o && o.type === 'building' && o.x + o.door.dx === x && o.y + o.door.dy === y ? o : null;
    },
    canEnter(x, y, occupied) {
      if (!inBounds(x, y)) return false;
      if (!WALKABLE.has(tiles[y * width + x])) return false;
      if (occupant.has(cellKey(x, y))) return false;
      if (occupied && occupied.has(cellKey(x, y))) return false;
      return true;
    },
  };
}

// Abstand in Feldern, wenn der Trainer die Figur geradeaus sieht, sonst null.
export function trainerSees(map, trainer, playerPos) {
  let p = { x: trainer.x, y: trainer.y };
  for (let i = 1; i <= trainer.sight; i++) {
    p = step(p, trainer.dir);
    if (p.x === playerPos.x && p.y === playerPos.y) return i;
    if (!map.canEnter(p.x, p.y)) return null;
  }
  return null;
}

export function reachable(map, start) {
  const seen = new Set([cellKey(start.x, start.y)]);
  const queue = [{ x: start.x, y: start.y }];
  while (queue.length) {
    const cur = queue.shift();
    for (const dir of Object.keys(DELTA)) {
      const n = step(cur, dir);
      const k = cellKey(n.x, n.y);
      if (!seen.has(k) && map.canEnter(n.x, n.y)) {
        seen.add(k);
        queue.push(n);
      }
    }
  }
  return seen;
}
