// Namen eingeben (Design 4, Schritt 4). Das Formular dient auch für den Spitznamen des Wesens.

import { validateName } from '../state.js';
import { el } from '../ui/dom.js';
import { drawTitleArt } from './title.js';

// Fragt einen Namen ab. Mit allowEmpty darf das Feld leer bleiben (Ergebnis null).
export function askName(game, { prompt, allowEmpty = false, skipLabel = null }) {
  return new Promise(resolve => {
    const input = el('input', {
      type: 'text',
      class: 'name-input',
      maxlength: String(game.config.names.maxLength),
      autocomplete: 'off',
      autocorrect: 'off',
      autocapitalize: 'words',
      spellcheck: 'false',
      enterkeyhint: 'done',
      'aria-label': prompt,
    });
    const msg = el('p', { class: 'msg bad', role: 'alert' });
    const form = el(
      'form',
      { class: 'box name-form', novalidate: true },
      el('label', { class: 'name-prompt' }, prompt),
      input,
      msg,
      el(
        'div',
        { class: 'row' },
        skipLabel ? el('button', { class: 'btn', type: 'button', onclick: () => done(null) }, skipLabel) : null,
        el('button', { class: 'btn primary', type: 'submit' }, 'Weiter'),
      ),
    );
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (allowEmpty && !input.value.trim()) return done(null);
      const r = validateName(input.value);
      if (!r.ok) {
        msg.textContent = `✗ ${r.message}`;
        return;
      }
      done(r.value);
    });

    let finished = false;
    function done(value) {
      if (finished) return;
      finished = true;
      input.blur();
      form.remove();
      game.input.consume();
      resolve(value);
    }

    game.panel.append(form);
    if (!document.body.classList.contains('touch')) setTimeout(() => input.focus(), 50);
  });
}

export function createNameScene(game, next) {
  let active = true;
  return {
    enter() {
      game.mode = 'screen';
      askName(game, { prompt: 'Wie heißt du?' }).then(name => {
        if (active) next(name);
      });
    },
    exit() {
      active = false;
    },
    update() {},
    render(ctx, t) {
      drawTitleArt(ctx, t, game.reducedMotion);
    },
  };
}
