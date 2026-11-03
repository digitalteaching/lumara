// Das Wesen-Buch im Menü (Design 6.4, 13): 33 Kästen mit Nummer, Bild und Name. Gesehen zeigt die
// Silhouette, besiegt das Bild in Farbe, unbekannt ein „?“. Nur Einträge, hinter denen etwas steht,
// sind Knöpfe; so erreichen die Pfeiltasten nur sie. Der Zustand steht immer auch als Text da.

import { el, appendAll } from '../ui/dom.js';
import { t } from '../i18n/i18n.js';
import { bookView, bookLabels } from '../data/book.js';
import { creatureCanvas } from '../gfx/creatureImage.js';

export function bookPage(game) {
  return {
    title: t('menu.book'),
    wide: true,
    render(body, nav) {
      const v = bookView(game.state);
      const cells = v.entries.map(e => {
        const labels = bookLabels(e);
        if (e.status === 'unknown') {
          return el('div', { class: 'book-cell unknown', role: 'img', 'aria-label': t('book.unknownAria', { n: e.number }) },
            el('span', { class: 'book-no' }, t('book.no', { n: e.number })),
            el('span', { class: 'book-q', 'aria-hidden': 'true' }, '?'),
            el('span', { class: 'book-name' }, '???'));
        }
        return el('button', {
          class: `book-cell ${e.status}`,
          type: 'button',
          'aria-label': t('book.cellAria', { n: e.number, name: e.name, labels: labels.join(', ') }),
          onclick: () => nav.push(bookEntryPage(game, e.number)),
        },
        el('span', { class: 'book-no' }, t('book.no', { n: e.number })),
        creatureCanvas(e.id, 1, { look: e.status === 'beaten' ? 'color' : 'silhouette', scale: 1 }),
        el('span', { class: 'book-name' }, e.name),
        e.shiny ? el('span', { class: 'book-star', 'aria-hidden': 'true' }, '✦') : null);
      });
      appendAll(body,
        el('p', { class: 'small' }, t('book.counts', { seen: v.seen, total: v.total, beaten: v.beaten })),
        el('div', { class: 'book-grid' }, cells));
    },
  };
}

export function bookEntryPage(game, number) {
  const e = bookView(game.state).entries[number - 1];
  return {
    title: t('book.entryTitle', { n: e.number, name: e.name ?? '???' }),
    render(body) {
      const pictures = el('div', { class: 'book-pictures' },
        el('figure', {}, creatureCanvas(e.id, 1, { look: e.status === 'beaten' ? 'color' : 'silhouette', scale: 3 })),
        e.shiny ? el('figure', {}, creatureCanvas(e.id, 1, { look: 'shiny', scale: 3 }), el('figcaption', {}, t('duel.shinyMark'))) : null);
      appendAll(body,
        pictures,
        el('ul', { class: 'book-labels' }, bookLabels(e).map(l => el('li', {}, l))),
        el('p', {}, t('book.place', { place: e.place })),
        el('p', { class: 'sheet-text' }, e.description ?? t('book.beatToLearn')));
    },
  };
}
