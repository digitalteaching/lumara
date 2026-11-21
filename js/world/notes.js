// Zettel unter Steinen (Design 5.4, 8): eine Aufgabe, bei richtiger Antwort XP, manchmal ein
// Gegenstand und das nächste Geschichtsstück des Gebiets. Nach einer Weile Spielzeit liegt ein
// neuer Zettel unter dem Stein. DOM-frei.

import { CONFIG } from '../config.js';
import { emit } from './events.js';
import { gainXp } from '../duel/progress.js';
import { poolFor } from '../duel/questions.js';
import { addItem } from '../items/bag.js';
import { addTreasure, rollTreasure } from '../items/treasures.js';
import { timedArea } from '../items/stones.js';
import { storyPieces } from '../data/story.js';

// Fragen aus dem Abschnitt ZETTEL; ohne ihn dieselben wie bei wilden Wesen.
export const notePool = (pack, beaten) => poolFor(pack, { kind: 'note', beaten });

export const noteKey = (mapId, o) => `${mapId}:${o.x},${o.y}`;

export const noteReady = (state, key) => (state.world.notes[key] ?? 0) <= state.playMs;

function pickReward(state, rng, area, timePressure) {
  const table = Object.entries(timedArea(area, timePressure) ? CONFIG.notes.rewardsTimed : CONFIG.notes.rewards);
  const total = table.reduce((n, [, w]) => n + w, 0);
  let r = rng.next() * total;
  let item = table.at(-1)[0];
  for (const [k, w] of table) {
    if (r < w) {
      item = k;
      break;
    }
    r -= w;
  }
  if (item === 'life' && state.creature.lifeStones >= CONFIG.creature.maxLifeStones) return 'farsight';
  return item;
}

const NOTHING = () => ({ xp: 0, item: null, lost: null, story: null, evolved: false });

// Falsch: nichts, der Zettel bleibt. Richtig: XP, mit rewardChance ein Gegenstand (passt er nicht
// mehr in den Rucksack, steht er in lost), das nächste Geschichtsstück und ein neuer Zettel erst
// später. Liegt gerade kein Zettel unter dem Stein (etwa bei einem Doppeltipp), passiert nichts.
export function solveNote(state, key, area, correct, rng, timePressure = 'normal') {
  if (!correct || !noteReady(state, key)) return NOTHING();
  emit(state, 'note');
  const c = state.creature;
  const xp = CONFIG.notes.xp;
  const r = gainXp(c, xp);

  let item = null;
  let lost = null;
  let treasure = null;
  if (rng.next() < CONFIG.notes.rewardChance) {
    const reward = pickReward(state, rng, area, timePressure);
    if (addItem(state, reward) > 0) item = reward;
    else lost = reward;
  } else if (rng.next() < CONFIG.treasures.noteChance) {
    treasure = rollTreasure(area, rng);
    addTreasure(state, treasure);
  }

  let story = null;
  const pieces = storyPieces(area);
  const found = state.story[area] ?? 0;
  if (found < pieces.length) {
    story = pieces[found];
    state.story[area] = found + 1;
  }

  state.world.notes[key] = state.playMs + CONFIG.notes.refillMs;
  const result = { xp, item, lost, story, evolved: r.stageAfter > r.stageBefore };
  return treasure ? { ...result, item: 'treasure', treasure } : result;
}

// Alle gefundenen Stücke, nach Gebiet und Fundreihenfolge.
export function storyFound(state) {
  const out = [];
  const areas = Object.keys(state.story).map(Number).sort((a, b) => a - b);
  for (const area of areas) {
    const pieces = storyPieces(area);
    for (let index = 0; index < Math.min(state.story[area], pieces.length); index++) out.push({ area, index, text: pieces[index] });
  }
  return out;
}
