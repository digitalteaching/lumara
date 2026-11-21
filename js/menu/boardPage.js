// Der Aushang am Leuchtturm als Seite (Lumara 1.3, Spec 7.1): Datum, die drei Aufgaben des Tages mit
// Fortschritt und ✓, ein Satz, wenn alles erledigt ist. Die Liste der Aufgaben steht auch oben im
// Tagebuch (js/menu/diaryPage.js). Regeln und Texte der Aufgaben: js/world/board.js.

import { el } from '../ui/dom.js';
import { boardView } from '../world/board.js';
import { t, language } from '../i18n/i18n.js';

// 'JJJJ-MM-TT' als Datum in der Spielsprache, etwa „Sonntag, 22. November“. Ohne gültigen Tag ein
// leerer Text; kann das Gerät die Sprache nicht, steht der Tag so da, wie er gespeichert ist.
export function boardDate(day) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day ?? '');
  if (!m) return '';
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  try {
    return date.toLocaleDateString(language(), { weekday: 'long', day: 'numeric', month: 'long' });
  } catch {
    return day;
  }
}

// Die Aufgaben als Liste: ✓ und „Erledigt!“ oder ○ und „n von m“.
export function boardTaskList(view) {
  return el('ul', { class: 'quest-log board-tasks' }, view.tasks.map(x =>
    el('li', { class: x.done ? 'done' : 'open' },
      el('b', {}, `${x.done ? '✓' : '○'} ${x.text}`),
      el('span', { class: 'quest-hint' }, x.done ? t('board.done') : t('board.progress', { progress: x.progress, n: x.n })))));
}

export function boardPage(game) {
  return {
    title: t('board.title'),
    render(body) {
      const view = boardView(game.state);
      if (!view.tasks.length) {
        body.append(el('p', { class: 'sheet-text' }, t('board.empty')));
        return;
      }
      body.append(
        el('div', { class: 'sheet-section' },
          el('p', { class: 'small board-date' }, boardDate(view.day)),
          boardTaskList(view),
          view.allDone ? el('p', { class: 'sheet-text' }, t('board.allDone')) : null),
      );
    },
  };
}
