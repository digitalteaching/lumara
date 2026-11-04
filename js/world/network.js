// Kartenverbund (Design 5.1, 5.2, 10.4): welche Gebiete es gibt, wie sie verbunden sind, welche
// Nebeltore offen sind und wo man nach einem Paketwechsel sicher landet. DOM-frei.

import { CONFIG } from '../config.js';
import { createMap } from './map.js';
import { BUCHT } from './maps/bucht.js';
import { WALD } from './maps/wald.js';
import { MOOR } from './maps/moor.js';
import { DUENEN } from './maps/duenen.js';
import { KLIPPEN } from './maps/klippen.js';
import { RUINEN } from './maps/ruinen.js';
import { SEE } from './maps/see.js';
import { WIESE } from './maps/wiese.js';
import { EICHE } from './maps/eiche.js';
import { GLASTURM } from './maps/glasturm.js';
import { GEZEITEN } from './maps/gezeiten.js';
import { IRRLICHT } from './maps/irrlicht.js';
import { language, mark } from '../i18n/i18n.js';
import { EN_WORLD } from '../i18n/en-world.js';

// Die Gebiete, dahinter die geheimen Orte (secret: eigene kleine Karten, Design 5.7).
export const MAPS = { bucht: BUCHT, wald: WALD, moor: MOOR, duenen: DUENEN, klippen: KLIPPEN, ruinen: RUINEN, see: SEE, wiese: WIESE, eiche: EICHE, glasturm: GLASTURM, gezeiten: GEZEITEN, irrlicht: IRRLICHT };

const hasTrainer = (pack, n) => pack.trainers.some(t => t.number === n);

// Gebiet 1 ist immer offen. Jedes weitere braucht den Stein davor, das Thema im Paket und muss in
// dieser Spielfassung schon gebaut sein. Auch mit anderem Paket entzündete Steine öffnen ein Gebiet
// nur, wenn das aktuelle Paket sein Thema hat.
export function areaOpen(state, pack, area) {
  if (area > CONFIG.world.builtAreas) return false;
  if (area === 1) return true;
  return state.stones.includes(area - 1) && hasTrainer(pack, area);
}

// Ein Tor mit afterStone öffnet sich erst, wenn auch dieser Stein leuchtet (der Pfad zwischen
// Sternenwiese und Bucht nach dem Sieg über Trainer 8, Design 5.2).
export function openGatesFor(def, state, pack) {
  return (def.gates ?? [])
    .filter(g => areaOpen(state, pack, g.leadsTo) && (g.afterStone == null || state.stones.includes(g.afterStone)))
    .map(g => g.id);
}

export function exitAt(def, x, y) {
  return (def.exits ?? []).find(e => x >= e.x && x < e.x + e.w && y >= e.y && y < e.y + e.h) ?? null;
}

export function beaconOf(def, number) {
  return def.objects.find(o => o.type === 'beacon' && o.number === number) ?? null;
}

// Das Feld vor (unter) dem Leuchtstein, Blick zum Stein.
export function beaconFront(def, number) {
  const b = beaconOf(def, number);
  return { x: b.x, y: b.y + 1, dir: 'up' };
}

// Jede Karte ist ein Gebiet mit genau einem Trainer und einem Leuchtstein.
export function areaConfig(def) {
  const trainer = def.objects.find(o => o.type === 'trainer');
  const beacon = def.objects.find(o => o.type === 'beacon');
  return { area: def.area, trainerNumber: trainer?.number ?? null, beacon: beacon?.number ?? null };
}

// Flüsternde Bäume sagen ihre Zeilen der Reihe nach, dann wieder von vorn.
export function whisperLine(o, passCount) {
  return o.lines[passCount % o.lines.length];
}

// Bewohner reagieren auf den Fortschritt (Design 5.6): eigene Sätze, sobald der Weg ins nächste
// Gebiet wirklich offen ist, sonst sobald der Stein ihres Gebiets leuchtet.
export function npcLines(o, state, area, pack) {
  const def = mapOfArea(area);
  if (o.linesOpen && pack && areaOpen(state, pack, area + 1)) return worldLines(def, o, 'linesOpen');
  if (o.linesLit && state.stones.includes(area)) return worldLines(def, o, 'linesLit');
  // Bewohner, die von der Uhr erzählen, schweigen davon, wenn das Paket keine Uhr hat.
  return worldLines(def, o, o.linesNoClock && pack?.timePressure === 'aus' ? 'linesNoClock' : 'lines');
}

// ---------- Spielsprache (Design 10.6) ----------
// Die deutschen Texte stehen in den Karten, jede andere Sprache in js/i18n/<sprache>-world.js.
const LOCAL_WORLD = { en: EN_WORLD };
const localWorld = () => LOCAL_WORLD[language()] ?? null;

export const mapOfArea = area => Object.values(MAPS).find(d => d.area === area && !d.secret) ?? null;

// Ein Textfeld eines Objekts (lines, linesLit, linesOpen, linesNoClock, afterWin) in der Spielsprache.
export function worldLines(def, o, field) {
  const id = o.type === 'trainer' ? 'trainer' : o.id;
  const v = (def && localWorld()?.objects[def.id]?.[id]?.[field]) ?? o[field];
  if (v == null) return v;
  return Array.isArray(v) ? v.map(mark) : mark(v);
}

export const areaName = def => mark(localWorld()?.areas[def.id]?.name ?? def.name);
// Im Satz „Der Leuchtstein der Bucht …“ / „The light stone of Lighthouse Bay …“
export const areaOf = def => mark(localWorld()?.areas[def.id]?.of ?? def.genitive);
// Ziel hinter einem Nebelschild, mit Artikel: „die Windklippen“ / „the Windy Cliffs“.
export function destinationName(sign) {
  const target = mapOfArea(sign.leadsTo);
  const local = target && localWorld()?.areas[target.id]?.the;
  return mark(local ?? sign.leadsToName);
}

export function mapOfBeacon(number) {
  return Object.values(MAPS).find(d => beaconOf(d, number)) ?? null;
}

// Alles, was die Welt beim Aufbau aus dem Paket liest: die Kurzform (Fortschritt) und welche
// Trainer es gibt (offene Gebiete und Tore). Eine neue Fassung desselben Pakets (gleiche KENNUNG)
// mit einem Thema mehr hat dieselbe Kurzform, aber einen anderen Schlüssel (Design 10.4).
export const packWorldKey = pack => `${pack.shortId}|${pack.trainers.map(t => t.number).sort((a, b) => a - b).join(',')}`;

// Vor dem höchsten entzündeten Stein in einem offenen Gebiet, oder null.
export function highestOpenStone(state, pack) {
  for (const n of [...state.stones].sort((a, b) => b - a)) {
    const d = mapOfBeacon(n);
    if (d && areaOpen(state, pack, d.area)) return { map: d.id, ...beaconFront(d, n) };
  }
  return null;
}

// Gilt die gespeicherte Position noch? Ist das Gebiet offen, nur das Feld nicht (ein Tor hat sich mit
// einem anderen Paket wieder geschlossen, etwa der Pfad im Osten der Bucht), bleibt das Kind auf
// dieser Karte: vor ihrem Stein, wenn er leuchtet, sonst am Aufwachpunkt der Karte. Liegt das ganze
// Gebiet im Nebel, der höchste entzündete Stein in einem offenen Gebiet, sonst der Leuchtturm.
export function resolveStart(state, pack) {
  const pos = state.position;
  const def = MAPS[pos?.map];
  if (def && areaOpen(state, pack, def.area)) {
    if (createMap(def, { openGates: openGatesFor(def, state, pack) }).canEnter(pos.x, pos.y)) return pos;
    const own = beaconOf(def, def.area) && state.stones.includes(def.area);
    return { map: def.id, ...(own ? beaconFront(def, def.area) : def.respawn) };
  }
  return highestOpenStone(state, pack) ?? { map: 'bucht', ...BUCHT.respawn };
}
