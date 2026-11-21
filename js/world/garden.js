// Der Garten am Leuchtturm (Lumara 1.2): wer dort wohnt, wo Platz ist und wohin ein Freund als
// Nächstes geht. Wasserwesen bleiben am Teich, niemand steht auf dem Weg. DOM-frei.

import { CONFIG } from '../config.js';
import { cellKey } from './map.js';
import { exitAt } from './network.js';
import { friendList, WATER_FRIENDS } from '../friends/friends.js';

const NEIGHBOURS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const NONE = new Set();

// Alle Freunde außer dem Begleiter, der hinter der Figur herläuft.
export function gardenFriends(state) {
  return friendList(state).filter(f => !f.companion).map(({ species, shiny }) => ({ species, shiny }));
}

// free: begehbare Felder ohne Weg, Ausgang und Ankunft. pond: die Felder aus free, die im
// Schachbrett-Abstand bis pondRadius an Wasser liegen. Einmal je Karte berechnet, nicht verändern.
const cache = new WeakMap();
function cellsOf(map) {
  let cells = cache.get(map);
  if (cells) return cells;
  const { def } = map;
  const r = CONFIG.garden.pondRadius;
  const nearWater = (x, y) => {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (map.tileAt(x + dx, y + dy) === 'water') return true;
    return false;
  };
  const free = [];
  const pond = new Set();
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      if (!map.canEnter(x, y) || map.tileAt(x, y) === 'path' || exitAt(def, x, y)) continue;
      if (x === def.spawn.x && y === def.spawn.y) continue;
      free.push({ x, y });
      if (nearWater(x, y)) pond.add(cellKey(x, y));
    }
  }
  cells = { free, pond, keys: new Set(free.map(c => cellKey(c.x, c.y))) };
  cache.set(map, cells);
  return cells;
}

export function gardenCells(map) {
  const { free, pond } = cellsOf(map);
  return { free, pond };
}

// Verschiedene Felder aus free für die Freunde, ohne die Felder in avoid (etwa die der Figur).
// Wasserwesen nur am Teich, und sie wählen zuerst; die übrigen zuerst außerhalb des Teichs.
// Wer keinen Platz findet, fehlt in der Antwort.
export function placeFriends(map, friends, rng, avoid = NONE) {
  const { free, pond } = cellsOf(map);
  const open = rng.shuffle(free.filter(c => !avoid.has(cellKey(c.x, c.y))));
  const atPond = open.filter(c => pond.has(cellKey(c.x, c.y)));
  const away = open.filter(c => !pond.has(cellKey(c.x, c.y)));
  const placed = new Map();
  const put = (f, c) => c && placed.set(f.species, { x: c.x, y: c.y });
  for (const f of friends) if (WATER_FRIENDS.has(f.species)) put(f, atPond.pop());
  for (const f of friends) if (!WATER_FRIENDS.has(f.species)) put(f, away.pop() ?? atPond.pop());
  return placed;
}

// Ein zufälliges freies Nachbarfeld (für Wasserwesen nur am Teich), das nicht in occupied liegt, sonst null.
export function wanderTarget(map, pos, rng, { occupied = NONE, water = false } = {}) {
  const { pond, keys } = cellsOf(map);
  const options = [];
  for (const [dx, dy] of NEIGHBOURS) {
    const x = pos.x + dx, y = pos.y + dy;
    const k = cellKey(x, y);
    if (!keys.has(k) || occupied.has(k) || (water && !pond.has(k))) continue;
    options.push({ x, y });
  }
  return options.length ? options[Math.floor(rng.next() * options.length)] : null;
}
