// Kartenverbund (Design 5.1, 5.2, 10.4): welche Gebiete es gibt, wie sie verbunden sind, welche
// Nebeltore offen sind und wo man nach einem Paketwechsel sicher landet. DOM-frei.

import { CONFIG } from '../config.js';
import { createMap } from './map.js';
import { BUCHT } from './maps/bucht.js';
import { WALD } from './maps/wald.js';
import { MOOR } from './maps/moor.js';
import { DUENEN } from './maps/duenen.js';
import { KLIPPEN } from './maps/klippen.js';

export const MAPS = { bucht: BUCHT, wald: WALD, moor: MOOR, duenen: DUENEN, klippen: KLIPPEN };

const hasTrainer = (pack, n) => pack.trainers.some(t => t.number === n);

// Gebiet 1 ist immer offen. Jedes weitere braucht den Stein davor, das Thema im Paket und muss in
// dieser Spielfassung schon gebaut sein. Auch mit anderem Paket entzündete Steine öffnen ein Gebiet
// nur, wenn das aktuelle Paket sein Thema hat.
export function areaOpen(state, pack, area) {
  if (area > CONFIG.world.builtAreas) return false;
  if (area === 1) return true;
  return state.stones.includes(area - 1) && hasTrainer(pack, area);
}

export function openGatesFor(def, state, pack) {
  return (def.gates ?? []).filter(g => areaOpen(state, pack, g.leadsTo)).map(g => g.id);
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
  if (o.linesOpen && pack && areaOpen(state, pack, area + 1)) return o.linesOpen;
  return o.linesLit && state.stones.includes(area) ? o.linesLit : o.lines;
}

export function mapOfBeacon(number) {
  return Object.values(MAPS).find(d => beaconOf(d, number)) ?? null;
}

// Alles, was die Welt beim Aufbau aus dem Paket liest: die Kurzform (Fortschritt) und welche
// Trainer es gibt (offene Gebiete und Tore). Eine neue Fassung desselben Pakets (gleiche KENNUNG)
// mit einem Thema mehr hat dieselbe Kurzform, aber einen anderen Schlüssel (Design 10.4).
export const packWorldKey = pack => `${pack.shortId}|${pack.trainers.map(t => t.number).sort((a, b) => a - b).join(',')}`;

// Gilt die gespeicherte Position noch? Sonst der höchste entzündete Stein in einem offenen Gebiet,
// sonst der Leuchtturm.
export function resolveStart(state, pack) {
  const pos = state.position;
  const def = MAPS[pos?.map];
  // Auch das Feld selbst muss frei sein: Ein Tor kann sich mit einem anderen Paket wieder schließen.
  if (def && areaOpen(state, pack, def.area) && createMap(def, { openGates: openGatesFor(def, state, pack) }).canEnter(pos.x, pos.y)) return pos;
  for (const n of [...state.stones].sort((a, b) => b - a)) {
    const d = mapOfBeacon(n);
    if (d && areaOpen(state, pack, d.area)) return { map: d.id, ...beaconFront(d, n) };
  }
  return { map: 'bucht', ...BUCHT.respawn };
}
