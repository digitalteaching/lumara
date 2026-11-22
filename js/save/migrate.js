// Spielstand prüfen, umwandeln und reparieren (Design 11).
// Jeder Stand ab Format 1 muss in jeder späteren Fassung ladbar bleiben. Für jede Formatänderung
// kommt hier eine Umwandlung MIGRATIONS[alt] → alt + 1 dazu, mit eigener Testdatei in tests/fixtures/.
// Danach wird alles repariert, was ein Kind nicht kaputt machen soll: Werte begrenzen statt ablehnen.
// Abgelehnt wird nur, was sich nicht sinnvoll reparieren lässt (Name, Wesen, Level).

import { CONFIG } from '../config.js';
import { STARTERS, TRAINER_CREATURES } from '../data/species.js';
import { BOOK_SLOTS } from '../data/book.js';
import { QUESTS } from '../data/quests.js';
import { SECRET_PLACES } from '../data/secrets.js';
import { KEY_ITEMS } from '../items/keys.js';
import { xpToNext, maxEnergy } from '../duel/progress.js';
import { createMap } from '../world/map.js';
import { BUCHT } from '../world/maps/bucht.js';
import { MAPS as WORLD_MAPS } from '../world/network.js';
import { validateName, emptyPackProgress, emptyWorld } from '../state.js';
import { emptyBag, BAG_ITEMS } from '../items/bag.js';
import { TREASURES, isTreasure } from '../items/treasures.js';
import { FRIENDABLE } from '../friends/friends.js';
import { EVENT_TYPES, BOARD_KINDS, WISH_GIVER_IDS } from '../world/events.js';

export const CURRENT_VERSION = 11;

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
  // 3 → 4 (Plan 4b): das Wesen-Buch. Wer schon Trainer besiegt hat, hat ihre Wesen gesehen und besiegt.
  3: s => ({
    ...s,
    version: 4,
    book: Object.fromEntries((Array.isArray(s.stones) ? s.stones : []).filter(n => TRAINER_CREATURES[n]).map(n => [TRAINER_CREATURES[n].species, { beaten: true, shiny: false }])),
  }),
  // 4 → 5 (Plan 4c): Aufträge, Schlüsselgegenstände und Funde an geheimen Orten.
  4: s => ({ ...s, version: 5, quests: {}, keys: [], secrets: {} }),
  // 5 → 6 (Plan 5a): der Zustand nach dem Finale, noch nicht erreicht.
  5: s => ({ ...s, version: 6, finale: { done: false } }),
  // 6 → 7 (Plan 5b): Revanche-Stufen je Paket; die Reparatur gibt jedem Paket leere tiers.
  6: s => ({ ...s, version: 7 }),
  // 7 → 8 (Plan 6): Musik und Effekte ein und aus; die Reparatur schaltet beides ein, wenn nichts da ist.
  7: s => ({ ...s, version: 8 }),
  // 8 → 9 (Lumara 1.1): Schätze im Rucksack und das Album, beides zunächst leer.
  8: s => ({ ...s, version: 9, treasures: {}, album: [] }),
  // 9 → 10 (Lumara 1.2): Freunde, Begleiter, gelöste Spielaufgaben, Leckerli im Rucksack, Verstecke.
  // Rucksack und Welt kommen unverändert mit; ist eines kaputt, baut die Reparatur es neu auf.
  9: s => ({
    ...s,
    version: 10,
    friends: {},
    companion: null,
    tasks: [],
    bag: { ...(isObject(s.bag) ? s.bag : {}), treat: 0 },
    world: { ...(isObject(s.world) ? s.world : {}), hideouts: {} },
  }),
  // 10 → 11 (Lumara 1.3): Aushang, Wünsche und Ereignisse, zunächst leer.
  10: s => ({ ...s, version: 11, board: null, wishes: {}, events: [] }),
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
  p.tiers = repairTiers(raw.tiers);
  p.history = repairHistory(raw.history);
  p.stats = repairStats(raw.stats);
  return p;
}

// Revanche-Stufen: Schlüssel 1 bis 9, Werte ab 1, höchstens 5; alles andere fällt heraus.
function repairTiers(raw) {
  const out = {};
  if (!isObject(raw)) return out;
  for (const [k, v] of Object.entries(raw)) {
    const n = Number(k);
    if (isInt(n) && n >= 1 && n <= 9 && isInt(v) && v >= 1) out[n] = Math.min(5, v);
  }
  return out;
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
function repairBag(raw, keys = []) {
  const bag = emptyBag();
  if (!isObject(raw)) return bag;
  for (const k of BAG_ITEMS) bag[k] = isInt(raw[k]) && raw[k] > 0 ? raw[k] : 0;
  const max = keys.includes('foodbag') ? CONFIG.bag.foodMaxBag : CONFIG.bag.foodMax;
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

// Ein Schritt hinter dem letzten (kaputt oder aus einer anderen Fassung) wird der letzte Schritt.
const LAST_STEP = Object.fromEntries(QUESTS.map(q => [q.id, q.steps.length - 1]));
function repairQuests(raw) {
  const out = {};
  if (!isObject(raw)) return out;
  for (const [id, q] of Object.entries(raw)) {
    if (id in LAST_STEP && isObject(q) && isInt(q.step) && q.step >= 0) out[id] = { step: Math.min(q.step, LAST_STEP[id]), done: q.done === true };
  }
  return out;
}

const repairKeys = raw => (Array.isArray(raw) ? [...new Set(raw.filter(k => KEY_ITEMS.includes(k)))] : []);

// Orte mit Zahnrad-Rätsel behalten solved und gears (drei Stellungen 0 bis 3, sonst alle 0).
const isGear = g => isInt(g) && g >= 0 && g <= 3;
function repairSecrets(raw) {
  const out = {};
  if (!isObject(raw)) return out;
  for (const [id, e] of Object.entries(raw)) {
    if (!SECRET_PLACES[id] || !isObject(e)) continue;
    out[id] = { story: e.story === true, stone: e.stone === true };
    const goal = SECRET_PLACES[id].gears;
    if (!goal) continue;
    const ok = Array.isArray(e.gears) && e.gears.length === goal.length && e.gears.every(isGear);
    Object.assign(out[id], { solved: e.solved === true, gears: ok ? [...e.gears] : goal.map(() => 0) });
  }
  return out;
}

// Nur Arten, die im Buch stehen; beaten und shiny sind wahr nur bei genau true.
const IN_BOOK = new Set(BOOK_SLOTS.filter(Boolean));
function repairBook(raw) {
  const out = {};
  if (!isObject(raw)) return out;
  for (const [id, e] of Object.entries(raw)) if (IN_BOOK.has(id) && isObject(e)) out[id] = { beaten: e.beaten === true, shiny: e.shiny === true };
  return out;
}

// Nur bekannte Schätze mit ganzzahliger Anzahl über 0.
function repairTreasures(raw) {
  const out = {};
  if (!isObject(raw)) return out;
  for (const [id, n] of Object.entries(raw)) if (isTreasure(id) && isInt(n) && n > 0) out[id] = n;
  return out;
}

// Ein Schatz im Rucksack gehört immer ins Album; Reihenfolge wie in TREASURES, ohne Doppelte und Unbekannte.
function repairAlbum(raw, treasures) {
  const seen = new Set(Array.isArray(raw) ? raw.filter(isTreasure) : []);
  return TREASURES.map(x => x.id).filter(id => seen.has(id) || id in treasures);
}

// Nur Arten, die man befreunden kann; shiny ist wahr nur bei genau true.
const FRIEND_IDS = new Set(FRIENDABLE);
function repairFriends(raw) {
  const out = {};
  if (!isObject(raw)) return out;
  for (const [id, e] of Object.entries(raw)) if (FRIEND_IDS.has(id) && isObject(e)) out[id] = { shiny: e.shiny === true };
  return out;
}

// Der Begleiter muss ein Freund sein, sonst läuft keiner mit.
const repairCompanion = (raw, friends) => (typeof raw === 'string' && Object.hasOwn(friends, raw) ? raw : null);

const repairTasks = raw => (Array.isArray(raw) ? [...new Set(raw.filter(n => isInt(n) && n >= 1 && n <= 8))].sort((a, b) => a - b) : []);

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const isDay = v => typeof v === 'string' && DAY.test(v);

// Der Aushang: null oder ein Tag mit höchstens drei brauchbaren Aufgaben. Eine kaputte Aufgabe fällt weg,
// auch eine mit falschem Gebiet: befriend und visit brauchen eins von 1 bis 8, alle anderen Arten null.
const AREA_KINDS = ['befriend', 'visit'];
function repairBoardTask(t) {
  if (!isObject(t) || !BOARD_KINDS.includes(t.kind) || !isInt(t.n) || t.n < 1 || t.n > 5) return null;
  const areaOk = AREA_KINDS.includes(t.kind) ? isInt(t.area) && t.area >= 1 && t.area <= 8 : t.area === null;
  if (!areaOk) return null;
  return { kind: t.kind, n: t.n, area: t.area, progress: clampInt(t.progress, 0, t.n, 0), done: t.done === true, rewarded: t.rewarded === true };
}

function repairBoard(raw) {
  if (!isObject(raw) || !isDay(raw.day)) return null;
  const tasks = (Array.isArray(raw.tasks) ? raw.tasks : []).map(repairBoardTask).filter(Boolean).slice(0, 3);
  return { day: raw.day, tasks, bonus: raw.bonus === true, intro: raw.intro === true };
}

// Wünsche: nur bekannte Bewohner, mit bekanntem Schatz und Tag.
function repairWishes(raw) {
  const out = {};
  if (!isObject(raw)) return out;
  for (const id of WISH_GIVER_IDS) {
    const w = raw[id];
    if (isObject(w) && isTreasure(w.treasure) && isDay(w.day)) out[id] = { treasure: w.treasure, day: w.day, done: w.done === true };
  }
  return out;
}

// Ereignisse: höchstens maxEvents, nur bekannte Typen, correct nur bool, area nur 1 bis 8.
function repairEvents(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const e of raw) {
    if (!isObject(e) || !EVENT_TYPES.includes(e.type)) continue;
    const ev = { type: e.type };
    if (e.type === 'answer') ev.correct = e.correct === true;
    if ((e.type === 'befriend' || e.type === 'visit') && isInt(e.area) && e.area >= 1 && e.area <= 8) ev.area = e.area;
    out.push(ev);
  }
  return out.slice(-CONFIG.board.maxEvents);
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

  const treasures = repairTreasures(s.treasures);
  const friends = repairFriends(s.friends);

  return {
    ok: true,
    state: {
      version: CURRENT_VERSION,
      savedAt: count(s.savedAt),
      name: name.value,
      creature,
      position: repairPosition(s.position),
      settings: {
        textSpeed: TEXT_SPEEDS.includes(s.settings?.textSpeed) ? s.settings.textSpeed : 'normal',
        music: s.settings?.music !== false,
        sfx: s.settings?.sfx !== false,
      },
      packs,
      playMs: count(s.playMs),
      stones,
      lastStone: stones.includes(s.lastStone) ? s.lastStone : null,
      bag: repairBag(s.bag, repairKeys(s.keys)),
      shineActive: s.shineActive === true,
      story: repairStory(s.story),
      world: repairWorld(s.world),
      book: repairBook(s.book),
      quests: repairQuests(s.quests),
      keys: repairKeys(s.keys),
      secrets: repairSecrets(s.secrets),
      finale: { done: s.finale?.done === true },
      treasures,
      album: repairAlbum(s.album, treasures),
      friends,
      companion: repairCompanion(s.companion, friends),
      tasks: repairTasks(s.tasks),
      board: repairBoard(s.board),
      wishes: repairWishes(s.wishes),
      events: repairEvents(s.events),
    },
  };
}
