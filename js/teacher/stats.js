// Statistik für die Lehrkraft (Design 12.1), jeweils für das aktuelle Lernpaket.

import { packProgress } from '../state.js';
import { stageForLevel } from '../duel/progress.js';
import { displayName, speciesName } from '../data/species.js';
import { formatPlayTime } from '../ui/format.js';
import { checkCode, formatCode } from './checkCode.js';

const percent = (right, total) => (total ? Math.round((right / total) * 100) : null);

export function buildTeacherStats(state, pack) {
  const progress = packProgress(state, pack.shortId);
  const st = progress.stats;
  const c = state.creature;
  const stage = stageForLevel(c.level);
  const numbers = new Set(pack.trainers.map(t => t.number));
  const trainersBeaten = progress.beaten.filter(n => numbers.has(n)).length;
  const accuracy = percent(st.right, st.total) ?? 0;
  const minutes = Math.floor(st.playMs / 60000);
  const code = checkCode({
    name: state.name,
    packId: pack.shortId,
    level: c.level,
    stage,
    wins: st.wins,
    accuracy,
    minutes,
    trainers: trainersBeaten + (progress.boss ? 1 : 0),
  });
  return {
    name: state.name,
    creature: { name: displayName(c), species: speciesName(c.species, stage), level: c.level, stage },
    pack: { title: pack.title, shortId: pack.shortId },
    wins: st.wins,
    accuracy,
    playTime: formatPlayTime(st.playMs),
    minutes,
    trainersBeaten,
    trainerCount: pack.trainers.length,
    boss: progress.boss,
    topics: pack.trainers.map(t => {
      const tp = st.topics[t.number] ?? { right: 0, total: 0 };
      return { number: t.number, topic: t.topic, accuracy: percent(tp.right, tp.total), total: tp.total };
    }),
    floor: st.floor,
    code: formatCode(code),
  };
}
