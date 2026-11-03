// Lernpaket laden (Design 10.1, 10.3): Datei auswählen oder das Beispielpaket ausprobieren.
// Kinder sehen nur eine kurze Meldung, die Details für die Lehrkraft sind aufklappbar.

import { parsePack } from '../pack/parser.js';
import { createPackStore } from '../pack/store.js';
import { readPackFile } from '../pack/readFile.js';
import { el, clear } from '../ui/dom.js';
import { createFreshGuard, guardClicks } from '../ui/freshGuard.js';
import { drawTitleArt } from './title.js';
import { openSheet } from '../ui/sheet.js';
import { loadBackupPage } from '../menu/backupPages.js';
import { setGamePack } from '../app/gamePack.js';
import { t } from '../i18n/i18n.js';

const EXAMPLE_URL = 'pakete/englisch-6-beispiel.txt';

// offerRestore: Bei einem neuen Spiel gibt es den Weg „Ich habe eine Sicherungsdatei“
// (zum Beispiel beim ersten Start der Home-Bildschirm-App, Design 11).
export function createPackScene(game, next, { offerRestore = false } = {}) {
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
      el('p', { class: 'msg bad' }, el('span', { class: 'icon', 'aria-hidden': 'true' }, '✗'), t('pack.invalid')),
      el(
        'details',
        { class: 'details' },
        el('summary', {}, t('pack.details')),
        el('ul', {}, details.map(d => el('li', {}, d))),
      ),
    );
  }

  function accept(text) {
    const r = parsePack(text);
    if (!r.ok) return showErrors(r.errors.map(e => e.message));
    setGamePack(game, { text, data: r.pack });
    if (store.save(text)) return next();
    clear(message);
    message.append(
      el('p', { class: 'msg' }, t('pack.notStored')),
      el('button', { class: 'btn primary', type: 'button', onclick: () => next() }, t('common.next')),
    );
  }

  async function handleFile(file) {
    if (busy) return;
    busy = true;
    try {
      const r = await readPackFile(file);
      if (!r.ok) return showErrors(r.details);
      accept(r.text);
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
      message.append(el('p', { class: 'msg bad' }, t('pack.exampleFailed')));
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
        el('p', { class: 'pack-name' }, t('pack.storedLabel'), el('b', {}, stored.pack.title), ` (${stored.pack.subject})`),
        el('button', {
          class: 'btn primary big',
          type: 'button',
          onclick: () => {
            setGamePack(game, { text: storedText, data: stored.pack });
            next();
          },
        }, t('pack.go')),
        fileButton(t('pack.loadOther'), 'btn link'),
        message,
      );
    } else {
      card = el(
        'div',
        { class: 'box screen-card' },
        el('p', { class: 'pack-intro' }, t('pack.intro')),
        fileButton(t('pack.load'), 'btn primary big'),
        el('button', { class: 'btn link', type: 'button', onclick: loadExample }, t('pack.tryExample')),
        message,
      );
    }
    if (offerRestore) {
      card.insertBefore(
        el('button', { class: 'btn link', type: 'button', onclick: () => openSheet(game, loadBackupPage(game)) }, t('pack.haveBackup')),
        message,
      );
    }
    game.panel.append(card);
    guardClicks(card, createFreshGuard());
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
