// Verstecke (Lumara 1.2, Spec 6.5): bereit oder leer, wer sie öffnet, was darin liegt und wann sie sich
// neu füllen. Die Orte stehen in js/data/hideouts.js. Öffnen kann nur der Begleiter mit der passenden
// Gabe. Ein Fund-Versteck kostet eine Frage aus dem Pool der Zettel (notePool): richtig gibt es XP und
// einen Gegenstand, falsch bleibt alles voll. Ein Wesen-Versteck ruft das versteckte Wesen des Gebiets
// zu einem wilden Duell. Danach ist das Versteck leer bis refillMs Spielzeit vergangen sind. DOM-frei.

import { CONFIG } from '../config.js';
import { HIDEOUTS } from '../data/hideouts.js';
import { HIDDEN_SPECIES } from '../data/species.js';
import { gainXp } from '../duel/progress.js';
import { companionGift } from '../friends/friends.js';
import { addItem } from '../items/bag.js';
import { AREA_TREASURES, addTreasure, rollTreasure } from '../items/treasures.js';
import { recordNoteAnswer } from '../state.js';
import { MAPS } from './network.js';
import { emit } from './events.js';

export const hideoutKey = h => `${h.map}:${h.x},${h.y}`;

const BY_CELL = new Map(HIDEOUTS.map(h => [hideoutKey(h), h]));

export const hideoutAt = (mapId, x, y) => BY_CELL.get(`${mapId}:${x},${y}`) ?? null;

export const hideoutsOn = mapId => HIDEOUTS.filter(h => h.map === mapId);

export const hideoutReady = (state, h) => (state.world.hideouts?.[hideoutKey(h)] ?? 0) <= state.playMs;

// Es zählt der Begleiter in diesem Moment: Wer im Menü wechselt, sieht das sofort.
export const canOpen = (state, h) => companionGift(state) === h.gift;

const distance = (h, x, y) => Math.abs(h.x - x) + Math.abs(h.y - y);

// Bereite Verstecke dieser Karte höchstens radius Felder entfernt (Manhattan), die nächsten zuerst.
export function nearHideouts(state, mapId, x, y, radius = CONFIG.hideouts.nearRadius) {
  return hideoutsOn(mapId)
    .filter(h => hideoutReady(state, h) && distance(h, x, y) <= radius)
    .sort((a, b) => distance(a, x, y) - distance(b, x, y));
}

// ---------- Was die Welt zeigt und was A tut (js/scenes/hideoutEvents.js) ----------

// A vor einem Versteck: 'empty' (gerade leer, das zählt zuerst), 'hint' (ohne passenden Begleiter)
// oder 'open'.
export function hideoutAction(state, h) {
  if (!hideoutReady(state, h)) return 'empty';
  return canOpen(state, h) ? 'open' : 'hint';
}

// Ein bereites Versteck sieht man schwach. Sternenspur-Verstecke nur mit einem Begleiter mit
// Sternenspur, wenn er oder die Figur höchstens nearRadius Felder entfernt ist (places: sein Feld und
// das der Figur). „!“ und sein Satz companion.near messen von der Figur aus; er steht ein Feld hinter
// ihr. So leuchtet die Spur immer, wenn er auf sie hinweist.
export function hideoutShown(state, h, ...places) {
  if (!hideoutReady(state, h)) return false;
  if (h.gift !== 'startrail') return true;
  return canOpen(state, h) && places.some(p => p && distance(h, p.x, p.y) <= CONFIG.hideouts.nearRadius);
}

// „!“ über dem Begleiter: ein bereites Versteck, das er öffnen kann, nahe der Figur bei (x, y).
export const companionAlert = (state, mapId, x, y) => nearHideouts(state, mapId, x, y).some(h => canOpen(state, h));

// Mit der Spürnase: alle bereiten Verstecke in sniffRadius, die nächsten zuerst. Sonst keine.
export function sniffedHideouts(state, mapId, x, y) {
  if (companionGift(state) !== 'sniff') return [];
  return nearHideouts(state, mapId, x, y, CONFIG.hideouts.sniffRadius);
}

function refill(state, h) {
  state.world.hideouts ??= {};
  state.world.hideouts[hideoutKey(h)] = state.playMs + CONFIG.hideouts.refillMs;
}

// Genau ein Zug aus rng für die Tabelle.
function pickReward(rng) {
  const table = Object.entries(CONFIG.hideouts.rewards);
  const total = table.reduce((n, [, w]) => n + w, 0);
  let r = rng.next() * total;
  for (const [k, w] of table) {
    if (r < w) return k;
    r -= w;
  }
  return table.at(-1)[0];
}

const NOTHING = () => ({ xp: 0, item: null, treasure: null, lost: null, evolved: false });

// Nach der Frage eines Fund-Verstecks. Falsch, abgebrochen (gar nicht aufgerufen) oder gerade leer
// (etwa bei einem Doppeltipp): nichts, das Versteck bleibt, wie es ist. Richtig: XP, ein Gegenstand
// aus der Tabelle und Nachfüllen erst nach refillMs. 'treasure' ist ein häufiger Schatz des Gebiets,
// 'rare' sein seltener. Passt Futter nicht mehr in den Rucksack, steht es in lost (wie bei Zetteln).
export function openFind(state, h, area, correct, rng) {
  if (!correct || h.kind !== 'find' || !hideoutReady(state, h)) return NOTHING();
  const xp = CONFIG.hideouts.xp;
  const r = gainXp(state.creature, xp);
  const reward = pickReward(rng);
  let item = reward;
  let treasure = null;
  let lost = null;
  if (reward === 'treasure' || reward === 'rare') {
    treasure = reward === 'rare' ? AREA_TREASURES[area].rare : rollTreasure(area, rng);
    addTreasure(state, treasure);
  } else if (addItem(state, reward) === 0) {
    item = null;
    lost = reward;
  }
  refill(state, h);
  emit(state, 'hideout');
  return { xp, item, treasure, lost, evolved: r.stageAfter > r.stageBefore };
}

// Die Antwort auf die Frage eines Fund-Verstecks verbuchen (settle für playNote, js/scenes/note.js):
// Sie zählt genau einmal wie die Antwort unter einem Zettel (Statistik und Wiederholung des Pakets
// shortId), dann öffnet openFind das Versteck, nur bei richtig. out: das Ergebnis von openFind; panel:
// was das Antwortfeld zeigt, nur die XP (den Fund sagt danach die Welt).
export function settleFind(state, shortId, h, answer, rng) {
  recordNoteAnswer(state, shortId, answer);
  const out = openFind(state, h, MAPS[h.map].area, answer.correct, rng);
  return { out, panel: { xp: out.xp, item: null, lost: null, story: null, evolved: out.evolved } };
}

// Ein Wesen-Versteck öffnet sich ohne Frage. Es ist sofort leer, damit ein Neustart mitten im Duell
// kein zweites Wesen bringt. Gibt das versteckte Wesen des Gebiets zurück, sonst null.
export function openCreature(state, h) {
  if (h.kind !== 'creature' || !hideoutReady(state, h)) return null;
  refill(state, h);
  emit(state, 'hideout');
  return HIDDEN_SPECIES[MAPS[h.map].area - 1];
}
