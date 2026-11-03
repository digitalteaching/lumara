// Seite „Für die Lehrkraft“ (Design 12.1): groß und gut lesbar, damit ein Screenshot reicht.

import { el } from '../ui/dom.js';
import { formatDateTime } from '../ui/format.js';
import { buildTeacherStats } from '../teacher/stats.js';

function teacherUrl() {
  const u = new URL('lehrkraft.html', location.href);
  u.search = '';
  u.hash = '';
  return u.href;
}

export function teacherStatsPage(game) {
  return {
    title: 'Für die Lehrkraft',
    wide: true,
    render(body) {
      const t = buildTeacherStats(game.state, game.pack.data);
      const row = (label, value) => [el('dt', {}, label), el('dd', {}, value)];
      // Ohne Spitznamen heißt das Wesen wie seine Art, dann nicht doppelt nennen.
      const wesen = t.creature.name === t.creature.species ? t.creature.name : `${t.creature.name} (${t.creature.species})`;
      body.append(
        el('div', { class: 'teacher' },
          el('dl', { class: 'teacher-values' },
            row('Name', t.name),
            row('Wesen', `${wesen} · Level ${t.creature.level} · Stufe ${t.creature.stage}`),
            row('Lernpaket', `${t.pack.title} · Kennung ${t.pack.shortId}`),
            row('Gewonnene Duelle', String(t.wins)),
            row('Trefferquote', `${t.accuracy} %`),
            row('Spielzeit', t.playTime),
            row('Trainer besiegt', `${t.trainersBeaten} von ${t.trainerCount} · Endgegner: ${t.boss ? 'ja' : 'nein'}`),
            row('Höchste Etage im Leuchtturm', t.floor > 0 ? String(t.floor) : '–'),
          ),
          el('div', { class: 'teacher-side' },
            el('div', { class: 'teacher-code' }, el('span', {}, 'Prüfcode'), el('b', {}, t.code)),
            el('p', { class: 'teacher-topics-title' }, 'Trefferquote je Thema'),
            el('ol', { class: 'teacher-topics' }, t.topics.map(tp =>
              el('li', { value: tp.number }, `${tp.topic ?? `Thema ${tp.number}`}: `, el('b', {}, tp.accuracy === null ? '–' : `${tp.accuracy} %`), tp.total ? ` (${tp.total} Antworten)` : ''),
            )),
          ),
        ),
        el('p', { class: 'teacher-foot' }, `Stand: ${formatDateTime(Date.now())} · Prüfen auf ${teacherUrl()}`),
      );
    },
  };
}
