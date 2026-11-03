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
import { MAPS as WORLD_MAPS } from '../world/network.js';
import { validateName, emptyPackProgress, emptyWorld } from '../state.js';
import { emptyBag, BAG_ITEMS } from '../items/bag.js';

export const CURRENT_VERSION = 3;

const MIGRATIONS = {
  // 1 → 2 (Plan 3a): Leuchtsteine, Rucksack, Geschichte, Uhren für das Nachwachsen, gesamte Spielzeit.
  // Wer schon einen Trainer besiegt hat, bekommt dessen Stein: Er hat ihn sich verdient.
  1(s) {
    const packs = isObject(s.packs) ? Object.values(s.packs) : [];
    const beaten = packs.flatMap(p => (Array.isArray(p?.beaten) ? p.beaten : []));
    const playMs = packs.reduce((sum, p) => sum + count(p?.stats?.playMs), 0);
    return { ...s, version: 2, playMs, stones: beaten, lastStone: null, bag: emptyBag(), shineActive: false, story: {}, world: emptyWorld() };
  },
  // 2 → 3 (Plan 3b): Der Rucksack bekommt Zeitsteine.
  2: s => ({ ...s, version: 3, bag: { ...s.bag, time: 0 } }),
};

const MAPS = WORLD_MAPS;
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
  // Alle Tore offen: Ob das Feld wirklich frei ist, entscheidet beim Start resolveStart mit dem Paket.
  if (!mapCache.has(mapId)) mapCache.set(mapId, createMap(def, { openGates: (def.gates ?? []).map(g => g.id) }));
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

function repairStones(raw) {
  return Array.isArray(raw) ? [...new Set(raw.filter(n => isInt(n) && n >= 1 && n <= 8))].sort((a, b) => a - b) : [];
}

// Futter höchstens foodMax: zuerst werden Sternfrüchte gekappt, dann Beeren.
function repairBag(raw) {
  const bag = emptyBag();
  if (!isObject(raw)) return bag;
  for (const k of BAG_ITEMS) bag[k] = isInt(raw[k]) && raw[k] > 0 ? raw[k] : 0;
  const max = CONFIG.bag.foodMax;
  bag.berry = Math.min(bag.berry, max);
  bag.starfruit = Math.min(bag.starfruit, max - bag.berry);
  return bag;
}

function repairStory(raw) {
  const out = {};
  if (!isObject(raw)) return out;
  for (const [k, v] of Object.entries(raw)) {
    const area = Number(k);
    if (isInt(area) && area >= 1 && area <= 8 && isInt(v) && v > 0) out[area] = Math.min(3, v);
  }
  return out;
}

const WORLD_KEY = /^[a-z]+:\d+,\d+$/;
function repairWorld(raw) {
  const out = emptyWorld();
  if (!isObject(raw)) return out;
  for (const part of Object.keys(out)) {
    if (!isObject(raw[part])) continue;
    for (const [k, v] of Object.entries(raw[part])) if (WORLD_KEY.test(k) && Number.isFinite(v) && v >= 0) out[part][k] = v;
  }
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
  const packs = repairPacks(s.packs);
  // Ein besiegter Hüter heißt: sein Stein leuchtet (Design 10.4), egal in welchem Paket.
  const beaten = Object.values(packs).flatMap(p => p.beaten);
  const stones = repairStones([...(Array.isArray(s.stones) ? s.stones : []), ...beaten]);

  return {
    ok: true,
    state: {
      version: CURRENT_VERSION,
      savedAt: count(s.savedAt),
      name: name.value,
      creature,
      position: repairPosition(s.position),
      settings: { textSpeed: TEXT_SPEEDS.includes(s.settings?.textSpeed) ? s.settings.textSpeed : 'normal' },
      packs,
      playMs: count(s.playMs),
      stones,
      lastStone: stones.includes(s.lastStone) ? s.lastStone : null,
      bag: repairBag(s.bag),
      shineActive: s.shineActive === true,
      story: repairStory(s.story),
      world: repairWorld(s.world),
    },
  };
}
