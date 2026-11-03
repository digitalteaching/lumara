// Lernpaket wechseln (Design 10.1, 10.4). Alles, was dem Kind gehört, bleibt. Fortschritt,
// Statistik und besiegte Trainer hängen an der Paketkennung und kommen mit demselben Paket zurück.

import { el, clear, appendAll } from '../ui/dom.js';
import { parsePack } from '../pack/parser.js';
import { readPackFile } from '../pack/readFile.js';
import { setGamePack } from '../app/gamePack.js';
import { t, language } from '../i18n/i18n.js';
import { showToast } from '../ui/toast.js';

const EXAMPLE_URL = 'pakete/englisch-6-beispiel.txt';

export function packSwitchPage(game) {
  return {
    title: t('settings.switchPack'),
    render(body, nav) {
      const msg = el('div', { class: 'sheet-msg', role: 'alert' });
      let busy = false;

      function done(text, data) {
        const same = data.shortId === game.pack?.data.shortId;
        const langBefore = language();
        setGamePack(game, { text, data });
        game.packStore.save(text);
        game.save();
        const note = same ? t('pack.sameNewVersion') : t('pack.newPack', { title: data.title });
        // Neue Sprache (Design 10.6): Menü zu, die Welt baut sich in der neuen Sprache neu auf.
        if (language() !== langBefore) {
          nav.close();
          showToast(`✓${note}`, 5000);
          return;
        }
        clear(msg);
        msg.append(
          el('p', { class: 'msg ok' }, el('span', { 'aria-hidden': 'true' }, '✓'), note),
          el('button', { class: 'btn primary', type: 'button', onclick: () => nav.close() }, t('menu.backToGame')),
        );
      }

      function fail(details) {
        clear(msg);
        msg.append(
          el('p', { class: 'msg bad' }, el('span', { 'aria-hidden': 'true' }, '✗'), t('pack.invalid')),
          el('details', { class: 'details' }, el('summary', {}, t('pack.details')), el('ul', {}, details.map(d => el('li', {}, d)))),
        );
      }

      async function fromFile(file) {
        if (busy) return;
        busy = true;
        try {
          const r = await readPackFile(file);
          if (r.ok) done(r.text, r.data);
          else fail(r.details);
        } finally {
          busy = false;
        }
      }

      async function example() {
        if (busy) return;
        busy = true;
        try {
          const res = await fetch(EXAMPLE_URL);
          if (!res.ok) throw new Error(String(res.status));
          const text = await res.text();
          const r = parsePack(text);
          if (r.ok) done(text, r.pack);
          else fail(r.errors.map(e => e.message));
        } catch {
          clear(msg);
          msg.append(el('p', { class: 'msg bad' }, t('pack.exampleFailed')));
        } finally {
          busy = false;
        }
      }

      const input = el('input', { type: 'file', accept: '.txt,text/plain', class: 'visually-hidden' });
      input.addEventListener('change', () => {
        const file = input.files?.[0];
        input.value = '';
        if (file) fromFile(file);
      });
      const p = game.pack?.data;
      appendAll(body,
        el('p', { class: 'sheet-text' }, t('pack.switchText')),
        p ? el('p', { class: 'small' }, t('pack.current', { title: p.title, subject: p.subject, id: p.shortId })) : null,
        el('label', { class: 'btn primary' }, t('pack.chooseFile'), input),
        el('button', { class: 'btn link sheet-link', type: 'button', onclick: example }, t('pack.example')),
        msg,
      );
    },
  };
}
