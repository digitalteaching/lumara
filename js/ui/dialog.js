// Textfenster und Auswahlfragen im Pixel-Stil (Design 13, 14).
// A, Enter, Leertaste oder ein Tipp: erst die ganze Zeile zeigen, dann weiter.

import { sound } from '../audio/bus.js';
import { el } from './dom.js';
import { CHOICE_FRESH_MS, createFreshGuard, guardClicks, pointerHeld } from './freshGuard.js';
import { textSpeedCps } from '../state.js';

// Offene Fenster, damit ein Szenenwechsel sie sauber schließen kann.
const active = new Set();

export function closeDialogs() {
  for (const close of [...active]) close();
}

function isOtherControl(target, box) {
  const ctl = target?.closest?.('button, input, a, label, textarea, select');
  return ctl && !box.contains(ctl);
}

function enterDialogMode(game) {
  const prev = game.mode;
  game.mode = 'dialog';
  return () => {
    game.mode = prev === 'dialog' ? 'walk' : prev;
  };
}

export function say(game, lines, { speaker } = {}) {
  return new Promise(resolve => {
    const restore = enterDialogMode(game);
    const text = el('span', { class: 'dialog-text' });
    const more = el('span', { class: 'dialog-more', 'aria-hidden': 'true' }, '▼');
    const box = el(
      'div',
      { class: 'box dialog', role: 'status', 'aria-live': 'polite' },
      speaker ? el('span', { class: 'dialog-speaker' }, speaker) : null,
      text,
      more,
    );
    game.panel.append(box);

    const perChar = 1000 / textSpeedCps(game.state?.settings);
    let index = 0;
    let shown = 0;
    let full = false;
    let timer = null;
    let done = false;

    function showLine() {
      const line = lines[index];
      shown = 0;
      full = false;
      more.hidden = true;
      text.textContent = '';
      const started = performance.now();
      clearInterval(timer);
      timer = setInterval(() => {
        shown = Math.min(line.length, Math.floor((performance.now() - started) / perChar));
        text.textContent = line.slice(0, shown);
        if (shown >= line.length) completeLine();
      }, 20);
    }

    function completeLine() {
      clearInterval(timer);
      text.textContent = lines[index];
      full = true;
      more.hidden = false;
    }

    function advance() {
      if (done) return;
      if (!full) return completeLine();
      index++;
      if (index < lines.length) return showLine();
      finish();
    }

    function onPointer(e) {
      if (isOtherControl(e.target, box)) return;
      e.preventDefault();
      advance();
    }

    const offA = game.input.on('a', advance);
    window.addEventListener('pointerdown', onPointer);
    active.add(finish);

    function finish() {
      if (done) return;
      done = true;
      active.delete(finish);
      clearInterval(timer);
      offA();
      window.removeEventListener('pointerdown', onPointer);
      box.remove();
      restore();
      game.input.consume();
      resolve();
    }

    if (!lines.length) finish();
    else showLine();
  });
}

// selected: vorausgewählte Möglichkeit (bei riskanten Fragen wie „Aufgeben?“ die sichere).
// Eine Frage nimmt CHOICE_FRESH_MS lang weder Tipp noch A an, und ein Finger, der beim Erscheinen schon
// auflag, wählt nie eine Antwort (freshGuard.js). B bricht sofort ab: Abbrechen ist sicher.
export function choose(game, prompt, options, { cancelIndex = options.length - 1, selected: initial = 0 } = {}) {
  return new Promise(resolve => {
    const restore = enterDialogMode(game);
    const fresh = createFreshGuard(CHOICE_FRESH_MS);
    let selected = initial;
    const buttons = options.map((label, i) =>
      el('button', { class: 'btn', type: 'button', onclick: () => pick(i) }, label),
    );
    const box = el(
      'div',
      { class: 'box dialog choice-box' },
      prompt ? el('div', { class: 'dialog-text' }, prompt) : null,
      // Viele Einträge (etwa acht Reiseziele) stehen in zwei Spalten, der letzte über beide.
      el('div', { class: options.length > 5 ? 'choice many' : 'choice' }, buttons),
    );
    game.panel.append(box);
    guardClicks(box, fresh, { heldAtShow: pointerHeld() });

    function highlight() {
      buttons.forEach((b, i) => b.classList.toggle('selected', i === selected));
    }
    highlight();

    const offs = [
      game.input.on('up', () => { selected = (selected + options.length - 1) % options.length; highlight(); }),
      game.input.on('down', () => { selected = (selected + 1) % options.length; highlight(); }),
      game.input.on('a', () => {
        if (!fresh.isFresh()) pick(selected);
      }),
      game.input.on('b', () => pick(cancelIndex, 'back')),
    ];

    let done = false;
    const cancel = () => pick(cancelIndex, 'close');
    active.add(cancel);
    // how: 'pick' (gewählt), 'back' (B: klingt nach Menü) oder 'close' (das Spiel schließt, still).
    function pick(i, how = 'pick') {
      if (done) return;
      done = true;
      if (how === 'pick') sound('confirm');
      else if (how === 'back') sound('menu');
      active.delete(cancel);
      offs.forEach(off => off());
      box.remove();
      restore();
      game.input.consume();
      resolve(i);
    }
  });
}
