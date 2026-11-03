// Das Antwort-Panel im Duell (Design 7.2): Frage, drei Antwortformen, Joker, Rückmeldung.
// Nach einer Antwort ist alles sofort gesperrt, damit ein Doppeltipp nur einmal zählt.
// Mit Zeitdruck (Design 7.4) steht oben ein Zeitbalken, auch bei offener iPad-Tastatur sichtbar.

import { CONFIG } from '../config.js';
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

// Bildschirmtastatur (iPad): Das Panel rückt über die Tastatur, solange sie offen ist.
// Gibt eine Funktion zurück, die das Beobachten beendet.
export function watchKeyboard() {
  const vv = window.visualViewport;
  if (!vv) return () => {};
  const onViewport = () => {
    document.body.classList.toggle('kbd', vv.height < window.innerHeight * 0.75);
    document.documentElement.style.setProperty('--vv-top', `${vv.offsetTop}px`);
    document.documentElement.style.setProperty('--vv-height', `${vv.height}px`);
  };
  vv.addEventListener('resize', onViewport);
  vv.addEventListener('scroll', onViewport);
  return () => {
    vv.removeEventListener('resize', onViewport);
    vv.removeEventListener('scroll', onViewport);
    document.body.classList.remove('kbd');
  };
}

// Zeitbalken: volle Breite, ohne Blinken. Knapp (unter lowShare) heißt orange-rot und gestreift,
// angehalten heißt blau mit Beschriftung. aria-valuenow ändert sich nur beim Sekundenwechsel.
function timeBar(lowShare) {
  const fill = el('div', { class: 'timebar-fill' });
  const label = el('span', { class: 'timebar-label' });
  const node = el('div', { class: 'timebar', role: 'progressbar', 'aria-label': 'Zeit', 'aria-valuemin': '0' }, fill, label);
  let shownSec = null;
  let shownFrozen = null;
  return {
    node,
    set(left, limit, frozen) {
      const share = limit > 0 ? Math.max(0, Math.min(1, left / limit)) : 0;
      fill.style.width = `${(share * 100).toFixed(2)}%`;
      node.classList.toggle('low', !frozen && share < lowShare);
      node.classList.toggle('frozen', frozen);
      const sec = Math.ceil(left / 1000);
      if (sec === shownSec && frozen === shownFrozen) return;
      shownSec = sec;
      shownFrozen = frozen;
      node.setAttribute('aria-valuemax', String(Math.ceil(limit / 1000)));
      node.setAttribute('aria-valuenow', String(sec));
      node.setAttribute('aria-valuetext', frozen ? `Die Zeit steht still. Noch ${sec} Sekunden.` : `Noch ${sec} Sekunden`);
      label.textContent = frozen ? 'Die Zeit steht still.' : `${sec} s`;
    },
  };
}

export function createDuelPanel(game) {
  const root = el('div', { class: 'duel-panel' });
  game.panel.append(root);
  let disposeForm = () => {};
  let finishOpen = null; // beendet ein offenes ask (Zeitablauf)
  let bar = null;
  // Jede neu gezeigte Frage oder Rückmeldung nimmt kurz keine Tipps an (Doppeltipp-Schutz).
  const fresh = createFreshGuard();
  guardClicks(root, fresh);
  const species = game.state?.creature?.species;

  function reset() {
    disposeForm();
    disposeForm = () => {};
    bar = null;
    clear(root);
  }

  // Zeigt die aktuelle Frage.
  // Ergebnis: { type: 'answer', response } | { type: 'feed' } | { type: 'flee' } | { type: 'surrender' }
  //   | { type: 'later' } (nur bei einem Zettel)
  // feed: { show, enabled() } – „Füttern“ steht das ganze Duell an seinem Platz, wenn zu Beginn
  // Futter im Rucksack war, und ist gesperrt, wenn gerade nicht gefüttert werden kann (auch nach
  // einem Zeitstein: Dann bleibt es bei der Antwort).
  // farsight: { label(), enabled(), use() → hint | null } – Weitblickstein, wirkt wie die Erleuchtung.
  // time: { label(), enabled(), use() → boolean } – Zeitstein, hält die Uhr für diese Frage an.
  //   Ein Zeitablauf beendet ask über interrupt({ type: 'timeout', result }).
  function ask(duel, { disabledIndex = null, notice = null, feed = null, farsight = null, time = null } = {}) {
    return new Promise(resolve => {
      let done = false;
      let form = null;

      function finish(value) {
        if (done) return;
        done = true;
        finishOpen = null;
        root.querySelectorAll('button, input').forEach(b => {
          b.disabled = true;
        });
        offB();
        resolve(value);
      }
      finishOpen = finish;

      // Ein Zettel (kind 'note') ist kein Duell: keine Fähigkeiten, „Später“ statt Fliehen.
      const note = duel.kind === 'note';
      const leave = { wild: 'flee', trainer: 'surrender', note: 'later' }[duel.kind] ?? 'surrender';
      const offB = game.input.on('b', () => finish({ type: leave }));

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
        // Nach einem Hinweis (Erleuchtung oder Weitblick) sind beide für diese Frage gesperrt.
        let jokerBtn = null;
        let farBtn = null;
        const afterHint = () => {
          if (jokerBtn) jokerBtn.disabled = !duel.canJoker();
          if (farBtn) {
            farBtn.disabled = !farsight.enabled();
            farBtn.textContent = farsight.label();
          }
        };
        if (species === 'funki' && !note) {
          jokerBtn = el('button', {
            class: 'btn side',
            type: 'button',
            disabled: !duel.canJoker(),
            onclick: () => {
              const hint = duel.useJoker();
              if (hint) form.applyHint(hint);
              afterHint();
            },
          }, '✦ Erleuchtung');
          side.append(jokerBtn);
        }
        if (farsight && !note) {
          farBtn = el('button', {
            class: 'btn side',
            type: 'button',
            disabled: !farsight.enabled(),
            onclick: () => {
              const hint = farsight.use();
              if (hint) form.applyHint(hint);
              afterHint();
            },
          }, farsight.label());
          side.append(farBtn);
        }
        if (species === 'flausch' && !note) {
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
        let feedBtn = null;
        if (time && !note) {
          const timeBtn = el('button', {
            class: 'btn side',
            type: 'button',
            disabled: !time.enabled(),
            onclick: () => {
              time.use();
              timeBtn.disabled = !time.enabled();
              timeBtn.textContent = time.label();
              if (feedBtn) feedBtn.disabled = !feed.enabled();
              bar?.set(duel.timeLeft, duel.timeLimit, duel.frozen);
            },
          }, time.label());
          side.append(timeBtn);
        }
        if (feed?.show && !note) {
          feedBtn = el('button', { class: 'btn side', type: 'button', disabled: !feed.enabled(), onclick: () => finish({ type: 'feed' }) }, 'Füttern');
          side.append(feedBtn);
        }
        const leaveLabel = { flee: 'Fliehen', surrender: 'Aufgeben', later: 'Später' }[leave];
        side.append(el('button', { class: 'btn side', type: 'button', onclick: () => finish({ type: leave }) }, leaveLabel));

        if (duel.timeLimit != null) {
          bar = timeBar(CONFIG.time.lowShare);
          bar.set(duel.timeLeft, duel.timeLimit, duel.frozen);
          root.append(bar.node);
        }
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
    // Beendet eine offene Frage von außen (Zeitablauf). Ohne offene Frage passiert nichts.
    interrupt(value) {
      finishOpen?.(value);
    },
    // Zeichnet den Zeitbalken der offenen Frage neu (aus der Spielschleife).
    setTime(left, limit, frozen) {
      bar?.set(left, limit, frozen);
    },
    clear: reset,
    remove() {
      reset();
      root.remove();
    },
  };
}
