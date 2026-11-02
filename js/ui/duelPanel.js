// Das Antwort-Panel im Duell (Design 7.2): Frage, drei Antwortformen, Joker, Rückmeldung.
// Nach einer Antwort ist alles sofort gesperrt, damit ein Doppeltipp nur einmal zählt.

import { el, clear } from './dom.js';
import { createFreshGuard, guardClicks } from './freshGuard.js';

const isTouch = () => document.body.classList.contains('touch');

function choiceForm(p, onPick, disabledIndex) {
  const buttons = p.choices.options.map((opt, i) =>
    el(
      'button',
      { class: 'btn answer', type: 'button', disabled: i === disabledIndex, onclick: () => onPick(i) },
      el('span', { class: 'answer-key', 'aria-hidden': 'true' }, String(i + 1)),
      el('span', { class: 'answer-text' }, opt),
    ),
  );
  function onKey(e) {
    const n = Number(e.key);
    if (!(n >= 1 && n <= 4)) return;
    if (e.target?.closest?.('input, textarea')) return;
    if (buttons[n - 1].disabled) return;
    e.preventDefault();
    onPick(n - 1);
  }
  window.addEventListener('keydown', onKey);
  return {
    node: el('div', { class: 'answers' }, buttons),
    applyHint(h) {
      for (const i of h.removeIndices) {
        buttons[i].disabled = true;
        buttons[i].classList.add('struck');
      }
    },
    dispose: () => window.removeEventListener('keydown', onKey),
  };
}

function typingForm(p, onSubmit) {
  const input = el('input', {
    type: 'text',
    class: 'answer-input',
    autocomplete: 'off',
    autocorrect: 'off',
    autocapitalize: 'off',
    spellcheck: 'false',
    enterkeyhint: 'done',
    inputmode: 'text',
    'aria-label': 'Deine Antwort',
  });
  const hint = el('p', { class: 'answer-hint' });
  const submit = el('button', { class: 'btn primary', type: 'submit' }, 'Prüfen');
  const form = el('form', { class: 'typing', novalidate: true }, el('div', { class: 'typing-row' }, input, submit), hint);
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!input.value.trim()) return input.focus();
    onSubmit(input.value);
  });
  if (!isTouch()) setTimeout(() => input.focus(), 30);
  return {
    node: form,
    applyHint(h) {
      hint.textContent = `Tipp: Die Antwort beginnt mit „${h.firstLetter}“.`;
      if (!input.value) input.value = h.firstLetter;
      input.focus();
    },
    dispose() {},
  };
}

function tilesForm(p, onSubmit) {
  let placed = [];
  let locked = null; // vom Joker gelegtes Kärtchen
  const line = el('div', { class: 'tiles-line', 'aria-label': 'Dein Satz' });
  const pool = el('div', { class: 'tiles-pool' });
  const check = el('button', { class: 'btn primary', type: 'button', onclick: () => onSubmit(placed.map(i => p.tiles[i])) }, 'Prüfen');

  function render() {
    clear(line);
    clear(pool);
    if (!placed.length) line.append(el('span', { class: 'tiles-empty' }, 'Tippe die Wörter in der richtigen Reihenfolge an.'));
    placed.forEach(i => {
      line.append(el('button', {
        class: `btn tile placed${i === locked ? ' locked' : ''}`,
        type: 'button',
        disabled: i === locked,
        onclick: () => {
          placed = placed.filter(x => x !== i);
          render();
        },
      }, p.tiles[i]));
    });
    p.tiles.forEach((text, i) => {
      if (placed.includes(i)) return;
      pool.append(el('button', {
        class: 'btn tile',
        type: 'button',
        onclick: () => {
          placed.push(i);
          render();
        },
      }, text));
    });
    check.disabled = placed.length === 0;
  }
  render();

  return {
    node: el('div', { class: 'tiles' }, line, pool, el('div', { class: 'row' }, check)),
    applyHint(h) {
      const i = p.tiles.findIndex((t, idx) => t === h.firstTile && !placed.includes(idx)) ;
      const idx = i >= 0 ? i : p.tiles.findIndex(t => t === h.firstTile);
      locked = idx;
      placed = [idx, ...placed.filter(x => x !== idx)];
      render();
    },
    dispose() {},
  };
}

export function createDuelPanel(game) {
  const root = el('div', { class: 'duel-panel' });
  game.panel.append(root);
  let disposeForm = () => {};
  // Jede neu gezeigte Frage oder Rückmeldung nimmt kurz keine Tipps an (Doppeltipp-Schutz).
  const fresh = createFreshGuard();
  guardClicks(root, fresh);
  const species = game.state?.creature?.species;

  function reset() {
    disposeForm();
    disposeForm = () => {};
    clear(root);
  }

  // Zeigt die aktuelle Frage. Ergebnis: { type: 'answer', response } | { type: 'flee' } | { type: 'surrender' }
  function ask(duel, { disabledIndex = null, notice = null } = {}) {
    return new Promise(resolve => {
      let done = false;
      let form = null;

      function finish(value) {
        if (done) return;
        done = true;
        root.querySelectorAll('button, input').forEach(b => {
          b.disabled = true;
        });
        offB();
        resolve(value);
      }

      const offB = game.input.on('b', () => finish({ type: duel.kind === 'wild' ? 'flee' : 'surrender' }));

      function render() {
        reset();
        fresh.reset();
        const p = duel.current;
        if (p.form === 'choice') form = choiceForm(p, i => finish({ type: 'answer', response: { index: i } }), disabledIndex);
        else if (p.form === 'typing') form = typingForm(p, text => finish({ type: 'answer', response: { text } }));
        else form = tilesForm(p, tokens => finish({ type: 'answer', response: { tokens } }));
        disposeForm = form.dispose;

        // Fähigkeitsknöpfe bleiben an ihrem Platz und werden nach Gebrauch nur gesperrt,
        // damit „Fliehen“ nie unter den Finger rutscht.
        const side = el('div', { class: 'duel-side' });
        if (species === 'funki') {
          const b = el('button', {
            class: 'btn side',
            type: 'button',
            disabled: !duel.canJoker(),
            onclick: () => {
              const hint = duel.useJoker();
              if (hint) form.applyHint(hint);
              b.disabled = true;
            },
          }, '✦ Erleuchtung');
          side.append(b);
        }
        if (species === 'flausch') {
          side.append(el('button', {
            class: 'btn side',
            type: 'button',
            disabled: !duel.canSwap(),
            onclick: () => {
              if (!duel.swap()) return;
              disabledIndex = null;
              render();
            },
          }, '↻ Rückenwind'));
        }
        side.append(
          duel.kind === 'wild'
            ? el('button', { class: 'btn side', type: 'button', onclick: () => finish({ type: 'flee' }) }, 'Fliehen')
            : el('button', { class: 'btn side', type: 'button', onclick: () => finish({ type: 'surrender' }) }, 'Aufgeben'),
        );

        if (notice) root.append(el('p', { class: 'duel-notice' }, notice));
        root.append(el('div', { class: 'duel-top' }, el('div', { class: 'box duel-question' }, p.question.text), side), form.node);
      }
      render();
    });
  }

  // Rückmeldung mit Symbol und Farbe. Wartet mindestens minMs, dann auf Tipp oder A (oder autoMs).
  function feedback({ ok, title, lines = [], minMs = 0, autoMs = null }) {
    return new Promise(resolve => {
      reset();
      fresh.reset();
      const box = el(
        'div',
        { class: `box duel-feedback ${ok ? 'ok' : 'bad'}`, role: 'status' },
        el('p', { class: 'feedback-title' }, el('span', { class: 'feedback-icon', 'aria-hidden': 'true' }, ok ? '✓' : '✗'), ` ${title}`),
        lines.map(l => el('p', { class: 'feedback-line' }, l)),
        el('p', { class: 'feedback-more' }, 'Weiter ▼'),
      );
      root.append(box);
      const start = performance.now();
      let done = false;
      const more = box.querySelector('.feedback-more');
      more.hidden = minMs > 0;
      const reveal = setTimeout(() => { more.hidden = false; }, minMs);
      const auto = autoMs ? setTimeout(() => finish(true), autoMs) : null;

      function finish(force = false) {
        if (done) return;
        if (!force && (performance.now() - start < minMs || fresh.isFresh())) return;
        done = true;
        clearTimeout(reveal);
        clearTimeout(auto);
        offA();
        window.removeEventListener('pointerdown', onPointer);
        game.input.consume();
        resolve();
      }
      function onPointer(e) {
        if (e.target?.closest?.('#pad')) return;
        finish();
      }
      const offA = game.input.on('a', () => finish());
      // Den Tipp, der die Antwort abgeschickt hat, wertet der Frische-Schutz nicht als „Weiter“.
      window.addEventListener('pointerdown', onPointer);
    });
  }

  return {
    ask,
    feedback,
    clear: reset,
    remove() {
      reset();
      root.remove();
    },
  };
}
