// Spielzustand im Speicher. Ab Plan 2 wird er gespeichert, deshalb schon jetzt mit Versionsnummer
// und mit dem Fortschritt pro Lernpaket (Design 10.4, 11).

import { CONFIG } from './config.js';
import { maxEnergy, addXp, xpForWin } from './duel/progress.js';
import { recordAnswer } from './duel/questions.js';
import { BUCHT } from './world/maps/bucht.js';

export function newGameState({ name, species, nickname }) {
  const creature = { species, nickname: nickname || null, level: 1, xpInLevel: 0, energy: 0, lifeStones: 0 };
  creature.energy = maxEnergy(creature);
  return {
    version: 1,
    name,
    creature,
    position: { map: 'bucht', ...BUCHT.spawn },
    packs: {},
  };
}

export function validateName(raw) {
  const value = raw.normalize('NFC').trim().replace(/\s+/g, ' ');
  if (!value) return { ok: false, message: 'Bitte gib einen Namen ein.' };
  if ([...value].length > CONFIG.names.maxLength) return { ok: false, message: `Höchstens ${CONFIG.names.maxLength} Zeichen.` };
  return { ok: true, value };
}

export function packProgress(state, shortId) {
  state.packs[shortId] ??= { beaten: [], history: {} };
  return state.packs[shortId];
}

// Ergebnis eines Duells in den Spielzustand übernehmen (Design 6.3, 7.1).
export function applyDuelResult(state, shortId, setup, summary) {
  const progress = packProgress(state, shortId);
  for (const a of summary.answers) recordAnswer(progress.history, a.key, a.correct);

  const c = state.creature;
  const report = {
    outcome: summary.outcome,
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
    if (setup.kind === 'trainer' && !progress.beaten.includes(setup.trainer.number)) progress.beaten.push(setup.trainer.number);
  } else if (summary.outcome === 'lost') {
    c.energy = maxEnergy(c);
  } else {
    c.energy = summary.playerEnergy;
  }
  return report;
}
