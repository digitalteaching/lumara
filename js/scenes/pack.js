// Lernpaket laden (Design 10.1, 10.3): Datei auswählen oder das Beispielpaket ausprobieren.
// Kinder sehen nur eine kurze Meldung, die Details für die Lehrkraft sind aufklappbar.

import { CONFIG } from '../config.js';
import { parsePack } from '../pack/parser.js';
import { createPackStore } from '../pack/store.js';
import { el, clear } from '../ui/dom.js';
import { drawTitleArt } from './title.js';

const EXAMPLE_URL = 'pakete/englisch-6-beispiel.txt';

export function createPackScene(game, next) {
  const store = createPackStore();
  let card = null;
  let message = null;
  let busy = false;

  function fileButton(label, className) {
    const input = el('input', { type: 'file', accept: '.txt,text/plain', class: 'visually-hidden' });
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      input.value = '';
      if (file) handleFile(file);
    });
    return el('label', { class: className }, label, input);
  }

  function showErrors(details) {
    clear(message);
    message.append(
      el('p', { class: 'msg bad' }, el('span', { class: 'icon', 'aria-hidden': 'true' }, '✗'), ' Diese Datei ist kein gültiges Lernpaket. Frag deine Lehrkraft.'),
      el(
        'details',
        { class: 'details' },
        el('summary', {}, 'Details für die Lehrkraft'),
        el('ul', {}, details.map(d => el('li', {}, d))),
      ),
    );
  }

  function accept(text) {
    const r = parsePack(text);
    if (!r.ok) return showErrors(r.errors.map(e => e.message));
    game.pack = { text, data: r.pack };
    if (store.save(text)) return next();
    clear(message);
    message.append(
      el('p', { class: 'msg' }, 'Das Paket konnte auf diesem Gerät nicht gespeichert werden. Beim nächsten Start musst du es neu laden.'),
      el('button', { class: 'btn primary', type: 'button', onclick: () => next() }, 'Weiter'),
    );
  }

  async function handleFile(file) {
    if (busy) return;
    if (file.size > CONFIG.pack.maxBytes) return showErrors(['Die Datei ist größer als 1 MB.']);
    busy = true;
    try {
      accept(await file.text());
    } catch {
      showErrors(['Die Datei konnte nicht gelesen werden.']);
    } finally {
      busy = false;
    }
  }

  async function loadExample() {
    if (busy) return;
    busy = true;
    try {
      const res = await fetch(EXAMPLE_URL);
      if (!res.ok) throw new Error(String(res.status));
      accept(await res.text());
    } catch {
      clear(message);
      message.append(el('p', { class: 'msg bad' }, '✗ Das Beispielpaket konnte nicht geladen werden. Prüfe die Internetverbindung.'));
    } finally {
      busy = false;
    }
  }

  function build() {
    const storedText = store.load();
    const stored = storedText ? parsePack(storedText) : null;
    message = el('div', { class: 'pack-message', role: 'alert' });

    if (stored?.ok) {
      card = el(
        'div',
        { class: 'box screen-card' },
        el('p', { class: 'pack-name' }, 'Lernpaket: ', el('b', {}, stored.pack.title), ` (${stored.pack.subject})`),
        el('button', {
          class: 'btn primary big',
          type: 'button',
          onclick: () => {
            game.pack = { text: storedText, data: stored.pack };
            next();
          },
        }, 'Los geht’s'),
        fileButton('Anderes Lernpaket laden', 'btn link'),
        message,
      );
    } else {
      card = el(
        'div',
        { class: 'box screen-card' },
        el('p', { class: 'pack-intro' }, 'Lade das Lernpaket, das du von deiner Lehrkraft bekommen hast.'),
        fileButton('Lernpaket laden', 'btn primary big'),
        el('button', { class: 'btn link', type: 'button', onclick: loadExample }, 'Ohne eigenes Paket ausprobieren'),
        message,
      );
    }
    game.panel.append(card);
  }

  return {
    enter() {
      game.mode = 'screen';
      build();
    },
    exit() {
      card?.remove();
    },
    update() {},
    render(ctx, t) {
      drawTitleArt(ctx, t, game.reducedMotion);
    },
  };
}
