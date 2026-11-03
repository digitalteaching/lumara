// Spielzustand im Speicher, Format Version 2 (Design 10.4, 11). Was dem Kind gehört (Name, Wesen,
// Position, Einstellungen, Leuchtsteine, Rucksack, Geschichte, Spielzeit), liegt oben; was zum
// Lernpaket gehört, liegt in packs[Kurzform].
// Änderungen am Format brauchen eine Umwandlung in js/save/migrate.js.

import { CONFIG } from './config.js';
import { maxEnergy, addXp, xpForWin } from './duel/progress.js';
import { recordAnswer } from './duel/questions.js';
import { BUCHT } from './world/maps/bucht.js';
import { emptyBag } from './items/bag.js';

export function emptyWorld() {
  return { bushes: {}, notes: {}, finds: {} };
}

export function newGameState({ name, species, nickname }) {
  const creature = { species, nickname: nickname || null, level: 1, xpInLevel: 0, energy: 0, lifeStones: 0 };
  creature.energy = maxEnergy(creature);
  return {
    version: 2,
    savedAt: 0,
    name,
    creature,
    position: { map: 'bucht', ...BUCHT.spawn },
    settings: { textSpeed: 'normal' },
    packs: {},
    playMs: 0,
    stones: [],
    lastStone: null,
    bag: emptyBag(),
    shineActive: false,
    story: {},
    world: emptyWorld(),
  };
}

// Zeichen pro Sekunde im Textfenster, nach der Einstellung des Kindes (Design 13).
export function textSpeedCps(settings) {
  return CONFIG.text.speeds[settings?.textSpeed] ?? CONFIG.text.speeds.normal;
}

export function emptyPackProgress() {
  return { beaten: [], boss: false, history: {}, stats: { wins: 0, right: 0, total: 0, playMs: 0, topics: {}, floor: 0 } };
}

export function validateName(raw) {
  const value = raw.normalize('NFC').trim().replace(/\s+/g, ' ');
  if (!value) return { ok: false, message: 'Bitte gib einen Namen ein.' };
  if ([...value].length > CONFIG.names.maxLength) return { ok: false, message: `Höchstens ${CONFIG.names.maxLength} Zeichen.` };
  return { ok: true, value };
}

export function packProgress(state, shortId) {
  const empty = emptyPackProgress();
  const p = (state.packs[shortId] ??= empty);
  p.beaten ??= empty.beaten;
  p.boss ??= empty.boss;
  p.history ??= empty.history;
  p.stats ??= empty.stats;
  for (const [k, v] of Object.entries(empty.stats)) p.stats[k] ??= v;
  return p;
}

// Statistik für die Lehrkraft (Design 12.1): jede Antwort zählt, je Thema nach Trainernummer.
function countAnswers(stats, answers) {
  for (const a of answers) {
    stats.total++;
    if (a.correct) stats.right++;
    if (a.trainer == null) continue;
    const t = (stats.topics[a.trainer] ??= { right: 0, total: 0 });
    t.total++;
    if (a.correct) t.right++;
  }
}

// Leuchtstein n entzünden (Design 5.1). Wahr, wenn er neu leuchtet. Der zuletzt entzündete Stein
// ist auch der zuletzt besuchte.
export function lightStone(state, n) {
  if (state.stones.includes(n)) return false;
  state.stones = [...state.stones, n].sort((a, b) => a - b);
  state.lastStone = n;
  return true;
}

// Ergebnis eines Duells in den Spielzustand übernehmen (Design 6.3, 7.1). Ein Trainersieg entzündet
// den Leuchtstein gleich mit: Beides landet in derselben Speicherung, auch wenn das Kind die App
// direkt beim Sieg schließt.
export function applyDuelResult(state, shortId, setup, summary) {
  const progress = packProgress(state, shortId);
  for (const a of summary.answers) recordAnswer(progress.history, a.key, a.correct);
  countAnswers(progress.stats, summary.answers);
  if (summary.outcome === 'won') progress.stats.wins++;

  const c = state.creature;
  const report = {
    outcome: summary.outcome,
    stoneLit: false,
    xp: 0,
    flawless: summary.flawless,
    levelsGained: 0,
    levelAfter: c.level,
    stageBefore: null,
    stageAfter: null,
  };

  if (summary.outcome === 'won') {
    report.xp = xpForWin({ kind: setup.kind, area: setup.area, trainerNumber: setup.trainer?.number, flawless: summary.flawless });
    const r = addXp(c, report.xp);
    c.level = r.level;
    c.xpInLevel = r.xpInLevel;
    c.energy = summary.playerEnergy;
    Object.assign(report, { levelsGained: r.levelsGained, levelAfter: r.level, stageBefore: r.stageBefore, stageAfter: r.stageAfter });
    if (setup.kind === 'trainer') {
      if (!progress.beaten.includes(setup.trainer.number)) progress.beaten.push(setup.trainer.number);
      report.stoneLit = lightStone(state, setup.trainer.number);
    }
  } else if (summary.outcome === 'lost') {
    c.energy = maxEnergy(c);
  } else {
    c.energy = summary.playerEnergy;
  }
  return report;
}
