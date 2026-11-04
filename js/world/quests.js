// Die Logik der Aufträge (Design 5.6): annehmen, Schritt für Schritt erfüllen, abschließen. Der
// Fortschritt gehört dem Kind (Design 10.4) und liegt in state.quests. DOM-frei.

import { CONFIG } from '../config.js';
import { QUESTS, GUESTS, questById } from '../data/quests.js';
import { gainXp } from '../duel/progress.js';
import { addItem } from '../items/bag.js';
import { giveKey } from '../items/keys.js';

const progressOf = (state, id) => state.quests?.[id] ?? null;
const open = (state, id) => {
  const p = progressOf(state, id);
  return p && !p.done ? p : null;
};
const isLast = (quest, i) => i === quest.steps.length - 1;
const sameNpc = (step, mapId, npcId) => step.kind === 'talk' && step.map === mapId && step.npc === npcId;

// Was ein Bewohner zu einem Auftrag zu sagen hat. Ein Schritt bei ihm geht vor seinem eigenen
// Angebot, ein Angebot vor der Erinnerung.
const PRIORITY = ['step', 'finish', 'locked', 'offer', 'remind', 'done'];
export function questFor(state, mapId, npcId) {
  const found = [];
  for (const quest of QUESTS) {
    const p = progressOf(state, quest.id);
    const giver = quest.giver.map === mapId && quest.giver.npc === npcId;
    if (!p) {
      if (giver) found.push({ quest, role: 'offer' });
      continue;
    }
    if (p.done) {
      if (giver) found.push({ quest, role: 'done' });
      continue;
    }
    const step = quest.steps[p.step];
    if (step && sameNpc(step, mapId, npcId)) {
      if (!isLast(quest, p.step)) found.push({ quest, role: 'step' });
      else found.push({ quest, role: state.stones.includes(quest.area) ? 'finish' : 'locked' });
    } else if (giver) {
      found.push({ quest, role: 'remind' });
    }
  }
  found.sort((a, b) => PRIORITY.indexOf(a.role) - PRIORITY.indexOf(b.role));
  return found[0] ?? null;
}

export function acceptQuest(state, id) {
  if (!questById(id) || progressOf(state, id)) return false;
  state.quests = { ...(state.quests ?? {}), [id]: { step: 0, done: false } };
  return true;
}

// Nur der aktuelle Schritt, und nie der letzte: Der ist der Abschluss (finishQuest).
export function advanceQuest(state, id, stepIndex) {
  const quest = questById(id);
  const p = open(state, id);
  if (!quest || !p || p.step !== stepIndex || isLast(quest, stepIndex)) return false;
  p.step++;
  return true;
}

// Erst wenn alle Schritte bis auf den letzten erfüllt sind und der Leuchtstein des Gebiets leuchtet.
export function finishQuest(state, id) {
  const quest = questById(id);
  const p = open(state, id);
  if (!quest || !p || !isLast(quest, p.step) || !state.stones.includes(quest.area)) return null;
  p.done = true;
  const xp = CONFIG.quests.xp;
  const report = gainXp(state.creature, xp);
  const out = { xp, item: null, n: 0, key: null, kept: true, report };
  const { reward } = quest;
  if (reward.key) {
    giveKey(state, reward.key);
    out.key = reward.key;
  } else {
    // Wirken schon alle Lebenssteine, wird daraus ein Weitblickstein (wie bei Funden).
    const item = reward.item === 'life' && state.creature.lifeStones >= CONFIG.creature.maxLifeStones ? 'farsight' : reward.item;
    const n = reward.n ?? 1;
    out.item = item;
    out.n = n;
    out.kept = addItem(state, item, n) === n;
  }
  return out;
}

export function activePickups(state, mapId) {
  return QUESTS.flatMap(quest => {
    const p = open(state, quest.id);
    const step = p && quest.steps[p.step];
    return step && step.kind === 'pickup' && step.map === mapId ? [{ ...step, quest: quest.id, index: p.step }] : [];
  });
}

export function activeGuests(state, mapId) {
  return GUESTS.filter(g => g.map === mapId && open(state, g.quest)?.step === g.step);
}
