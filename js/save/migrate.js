// Spielstand prüfen, umwandeln und reparieren (Design 11).
// Jeder Stand ab Format 1 muss in jeder späteren Fassung ladbar bleiben. Für jede Formatänderung
// kommt hier eine Umwandlung MIGRATIONS[alt] → alt + 1 dazu, mit eigener Testdatei in tests/fixtures/.
// Danach wird alles repariert, was ein Kind nicht kaputt machen soll: Werte begrenzen statt ablehnen.
// Abgelehnt wird nur, was sich nicht sinnvoll reparieren lässt (Name, Wesen, Level).

import { CONFIG } from '../config.js';
import { STARTERS } from '../data/species.js';
import { xpToNext, maxEnergy } from '../duel/progress.js';
import { createMap } from '../world/map.js';
import { BUCHT } from '../world/maps/bucht.js';
import { validateName, emptyPackProgress } from '../state.js';

export const CURRENT_VERSION = 1;

const MIGRATIONS = {};

const MAPS = { bucht: BUCHT };
const DIRS = ['up', 'down', 'left', 'right'];
const TEXT_SPEEDS = ['slow', 'normal', 'fast'];
const SHORT_ID = /^[2-9A-HJKMNP-Z]{4}$/;

const isObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const isInt = v => Number.isInteger(v);
const clampInt = (v, min, max, fallback) => (isInt(v) ? Math.min(max, Math.max(min, v)) : fallback);
const count = v => (Number.isFinite(v) && v >= 0 ? v : 0);

let mapCache = null;
function canStand(mapId, x, y) {
  const def = MAPS[mapId];
  if (!def || !isInt(x) || !isInt(y)) return false;
  mapCache ??= new Map();
  if (!mapCache.has(mapId)) mapCache.set(mapId, createMap(def));
  return mapCache.get(mapId).canEnter(x, y);
}

function repairCreature(raw) {
  if (!isObject(raw) || !STARTERS.includes(raw.species)) return null;
  if (!isInt(raw.level) || raw.level < 1 || raw.level > CONFIG.creature.maxLevel) return null;
  const c = {
    species: raw.species,
    nickname: typeof raw.nickname === 'string' && raw.nickname && [...raw.nickname].length <= CONFIG.names.maxLength ? raw.nickname : null,
    level: raw.level,
    xpInLevel: clampInt(raw.xpInLevel, 0, xpToNext(raw.level) - 1, 0),
    energy: 0,
    lifeStones: clampInt(raw.lifeStones, 0, CONFIG.creature.maxLifeStones, 0),
  };
  const max = maxEnergy(c);
  c.energy = clampInt(raw.energy, 0, max, max);
  return c;
}

function repairPosition(raw) {
  if (isObject(raw) && canStand(raw.map, raw.x, raw.y)) {
    return { map: raw.map, x: raw.x, y: raw.y, dir: DIRS.includes(raw.dir) ? raw.dir : 'down' };
  }
  return { map: 'bucht', ...BUCHT.spawn };
}

function repairHistory(raw) {
  const out = {};
  if (!isObject(raw)) return out;
  for (const [key, e] of Object.entries(raw)) {
    if (isObject(e) && Number.isFinite(e.n) && Number.isFinite(e.s) && typeof e.w === 'boolean') out[key] = { n: e.n, s: e.s, w: e.w };
  }
  return out;
}

function repairStats(raw) {
  const s = emptyPackProgress().stats;
  if (!isObject(raw)) return s;
  for (const k of ['wins', 'right', 'total', 'playMs']) s[k] = count(raw[k]);
  s.floor = isInt(raw.floor) && raw.floor > 0 ? raw.floor : 0;
  if (isObject(raw.topics)) {
    for (const [k, t] of Object.entries(raw.topics)) {
      const n = Number(k);
      if (isInt(n) && n >= 1 && n <= 8 && isObject(t)) s.topics[n] = { right: count(t.right), total: count(t.total) };
    }
  }
  return s;
}

function repairPack(raw) {
  const p = emptyPackProgress();
  if (!isObject(raw)) return p;
  if (Array.isArray(raw.beaten)) p.beaten = [...new Set(raw.beaten.filter(n => isInt(n) && n >= 1 && n <= 8))].sort((a, b) => a - b);
  p.boss = raw.boss === true;
  p.history = repairHistory(raw.history);
  p.stats = repairStats(raw.stats);
  return p;
}

function repairPacks(raw) {
  const out = {};
  if (!isObject(raw)) return out;
  for (const [id, p] of Object.entries(raw)) if (SHORT_ID.test(id)) out[id] = repairPack(p);
  return out;
}

export function migrateState(raw) {
  if (!isObject(raw) || !isInt(raw.version)) return { ok: false, reason: 'invalid' };
  if (raw.version > CURRENT_VERSION) return { ok: false, reason: 'newer' };
  let s = raw;
  while (s.version < CURRENT_VERSION) {
    const step = MIGRATIONS[s.version];
    if (!step) return { ok: false, reason: 'invalid' };
    s = step(s);
  }

  const name = typeof s.name === 'string' ? validateName(s.name) : { ok: false };
  const creature = repairCreature(s.creature);
  if (!name.ok || !creature) return { ok: false, reason: 'invalid' };

  return {
    ok: true,
    state: {
      version: CURRENT_VERSION,
      savedAt: count(s.savedAt),
      name: name.value,
      creature,
      position: repairPosition(s.position),
      settings: { textSpeed: TEXT_SPEEDS.includes(s.settings?.textSpeed) ? s.settings.textSpeed : 'normal' },
      packs: repairPacks(s.packs),
    },
  };
}
