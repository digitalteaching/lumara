// Menü-Blatt (Design 13): ein Kasten über dem ganzen Bildschirm mit Seiten, die man vor- und
// zurückblättert. B, Esc und „Zurück“ gehen eine Seite zurück, M schließt, Pfeil hoch und runter
// bewegen den Fokus. Jede neue Seite nimmt kurz keine Tipps an (Doppeltipp-Schutz).
//
// Page = { title: string, wide?: boolean, render(body: HTMLElement, nav: Nav): void }
// Nav  = { push(page), back(), close(), refresh() }

import { el, clear } from './dom.js';
import { createFreshGuard, guardClicks } from './freshGuard.js';

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]):not([type="hidden"]), a[href]';
const isTouch = () => document.body.classList.contains('touch');

export function openSheet(game, page) {
  return new Promise(resolve => {
    const prevMode = game.mode;
    game.mode = 'screen';
    const stack = [];
    let closed = false;

    const title = el('h2', { class: 'sheet-title' });
    const backBtn = el('button', { class: 'btn sheet-back', type: 'button', onclick: () => nav.back() }, '‹ Zurück');
    const body = el('div', { class: 'sheet-body' });
    const card = el('div', { class: 'box sheet-card', role: 'dialog', 'aria-modal': 'true' }, el('div', { class: 'sheet-head' }, title, backBtn), body);
    const root = el('div', { class: 'sheet' }, card);
    document.body.append(root);
    const guard = createFreshGuard();
    guardClicks(card, guard);

    function focusables() {
      return [backBtn, ...body.querySelectorAll(FOCUSABLE)].filter(n => n.offsetParent !== null || n === backBtn);
    }

    function moveFocus(d) {
      const list = focusables();
      const i = list.indexOf(document.activeElement);
      const next = list[(i + d + list.length) % list.length];
      next?.focus();
    }

    function show() {
      const p = stack.at(-1);
      clear(body);
      title.textContent = p.title;
      card.classList.toggle('wide', !!p.wide);
      p.render(body, nav);
      body.scrollTop = 0;
      guard.reset();
      if (!isTouch()) (body.querySelector(FOCUSABLE) ?? backBtn).focus();
    }

    function close() {
      if (closed) return;
      closed = true;
      offs.forEach(off => off());
      root.remove();
      game.mode = prevMode;
      game.input.consume();
      resolve();
    }

    const nav = {
      push(p) {
        stack.push(p);
        show();
      },
      back() {
        if (stack.length > 1) {
          stack.pop();
          show();
        } else close();
      },
      close,
      refresh: show,
    };

    const offs = [
      game.input.on('b', () => nav.back()),
      game.input.on('menu', () => nav.close()),
      game.input.on('up', () => moveFocus(-1)),
      game.input.on('down', () => moveFocus(1)),
    ];

    nav.push(page);
  });
}

// Sicherheitsfrage als eigene Seite. Der Fokus liegt auf „Nein“.
export function confirmPage({ title, text, yes, no = 'Nein', onYes }) {
  return {
    title,
    render(body, nav) {
      body.append(
        el('p', { class: 'sheet-text' }, text),
        el(
          'div',
          { class: 'row sheet-confirm' },
          el('button', { class: 'btn', type: 'button', onclick: () => nav.back() }, no),
          el('button', { class: 'btn danger', type: 'button', onclick: () => onYes(nav) }, yes),
        ),
      );
    },
  };
}
