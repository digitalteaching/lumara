// Spielzustand im Speicher, Format Version 7 (Design 10.4, 11). Was dem Kind gehört (Name, Wesen,
// Position, Einstellungen, Leuchtsteine, Rucksack, Geschichte, Spielzeit), liegt oben; was zum
// Lernpaket gehört, liegt in packs[Kurzform].
// Änderungen am Format brauchen eine Umwandlung in js/save/migrate.js.

import { CONFIG } from './config.js';
import { maxEnergy, gainXp, xpForWin } from './duel/progress.js';
import { recordSighting } from './data/book.js';
import { recordAnswer } from './duel/questions.js';
import { BUCHT } from './world/maps/bucht.js';
import { emptyBag, addItem } from './items/bag.js';
import { lootRolls } from './items/food.js';
import { t } from './i18n/i18n.js';
import { finishFinale } from './world/finale.js';
import { raiseTier } from './duel/rematch.js';

export function emptyWorld() {
  return { bushes: {}, notes: {}, finds: {} };
}

export function newGameState({ name, species, nickname }) {
  const creature = { species, nickname: nickname || null, level: 1, xpInLevel: 0, energy: 0, lifeStones: 0 };
  creature.energy = maxEnergy(creature);
  return {
    version: 7,
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
    book: {},
    quests: {},
    keys: [],
    secrets: {},
    finale: { done: false },
  };
}

// Zeichen pro Sekunde im Textfenster, nach der Einstellung des Kindes (Design 13).
export function textSpeedCps(settings) {
  return CONFIG.text.speeds[settings?.textSpeed] ?? CONFIG.text.speeds.normal;
}

export function emptyPackProgress() {
  // tiers: gewonnene Revanchen je Trainer (1 bis 8) und Morrow (9), höchstens 5 (Design 7.5).
  return { beaten: [], boss: false, tiers: {}, history: {}, stats: { wins: 0, right: 0, total: 0, playMs: 0, topics: {}, floor: 0 } };
}

export function validateName(raw) {
  const value = raw.normalize('NFC').trim().replace(/\s+/g, ' ');
  if (!value) return { ok: false, message: t('name.empty') };
  if ([...value].length > CONFIG.names.maxLength) return { ok: false, message: t('name.tooLong', { max: CONFIG.names.maxLength }) };
  return { ok: true, value };
}

export function packProgress(state, shortId) {
  const empty = emptyPackProgress();
  const p = (state.packs[shortId] ??= empty);
  p.beaten ??= empty.beaten;
  p.boss ??= empty.boss;
  p.tiers ??= empty.tiers;
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
    const topic = (stats.topics[a.trainer] ??= { right: 0, total: 0 });
    topic.total++;
    if (a.correct) topic.right++;
  }
}

// Eine Antwort auf einen Zettel zählt in Statistik und Fragenhistorie wie im Duell, aber nicht
// als Sieg (Design 12.1). answer = { key, correct, trainer }
export function recordNoteAnswer(state, shortId, answer) {
  const progress = packProgress(state, shortId);
  recordAnswer(progress.history, answer.key, answer.correct);
  countAnswers(progress.stats, [answer]);
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
// direkt beim Sieg schließt. Mit rng gibt es nach einem Sieg Beute (report.loot: was gefunden
// wurde, kept: ob es in den Rucksack passte).
export function applyDuelResult(state, shortId, setup, summary, rng = null) {
  const progress = packProgress(state, shortId);
  for (const a of summary.answers) recordAnswer(progress.history, a.key, a.correct);
  countAnswers(progress.stats, summary.answers);
  if (summary.outcome === 'won') progress.stats.wins++;
  // Wesen-Buch (Design 6.4): gesehen bei jedem Ausgang, besiegt nur nach einem Sieg. Trainerwesen
  // zählen für ihre Art, Glanzformen gibt es nur bei wilden Wesen.
  if (setup.foe) recordSighting(state, setup.foe.species, { beaten: summary.outcome === 'won', shiny: setup.kind === 'wild' && setup.foe.shiny === true });

  const c = state.creature;
  const report = {
    outcome: summary.outcome,
    stoneLit: false,
    loot: [],
    shine: false,
    xp: 0,
    flawless: summary.flawless,
    levelsGained: 0,
    levelAfter: c.level,
    stageBefore: null,
    stageAfter: null,
  };

  if (summary.outcome === 'won') {
    report.xp = xpForWin({ kind: setup.kind, area: setup.area, trainerNumber: setup.trainer?.number, flawless: summary.flawless, rematch: setup.rematch ?? 0 });
    // Der Endgegner bringt seine 500 XP nur beim ersten Sieg mit dem aktuellen Paket (Design 6.3).
    if (setup.kind === 'boss') {
      // Erinnerungsduell: nach dem ersten Sieg mit dem Paket steigt Morrows Stufe (tiers[9]).
      if (setup.remember) {
        if (progress.boss) raiseTier(progress, 9);
      } else if (progress.boss) report.xp = 0;
      progress.boss = true;
      // Das Endduell im Berg: Das Finale steht im selben Speichern wie der Sieg, samt Platz am
      // Leuchtturm. Wer die App gleich nach dem Sieg schließt, muss Morrow nicht noch einmal besiegen.
      if (!setup.remember && finishFinale(state)) state.position = { map: 'bucht', ...BUCHT.respawn };
    }
    // Ein eingesetzter Glanzstein verdoppelt die XP des nächsten Siegs (nach dem Makellos-Bonus).
    if (state.shineActive && report.xp > 0) {
      report.xp *= 2;
      report.shine = true;
      state.shineActive = false;
    }
    // Erst die Energie aus dem Duell, dann die XP: Eine Entwicklung füllt ihre neuen Felder dazu.
    c.energy = summary.playerEnergy;
    const r = gainXp(c, report.xp);
    Object.assign(report, { levelsGained: r.levelsGained, levelAfter: r.level, stageBefore: r.stageBefore, stageAfter: r.stageAfter });
    if (setup.kind === 'trainer' && setup.rematch) raiseTier(progress, setup.trainer.number); // Revanche gewonnen
    if (setup.kind === 'trainer') {
      if (!progress.beaten.includes(setup.trainer.number)) progress.beaten.push(setup.trainer.number);
      report.stoneLit = lightStone(state, setup.trainer.number);
    }
    if (rng) report.loot = lootRolls(state, setup, rng).map(l => ({ ...l, kept: addItem(state, l.item) > 0 }));
  } else if (summary.outcome === 'lost') {
    c.energy = maxEnergy(c);
  } else {
    c.energy = summary.playerEnergy;
  }
  return report;
}
