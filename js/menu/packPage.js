// Lernpaket wechseln (Design 10.1, 10.4). Alles, was dem Kind gehört, bleibt. Fortschritt,
// Statistik und besiegte Trainer hängen an der Paketkennung und kommen mit demselben Paket zurück.

import { el, clear } from '../ui/dom.js';
import { parsePack } from '../pack/parser.js';
import { readPackFile } from '../pack/readFile.js';
import { setGamePack } from '../app/gamePack.js';

const EXAMPLE_URL = 'pakete/englisch-6-beispiel.txt';

export function packSwitchPage(game) {
  return {
    title: 'Lernpaket wechseln',
    render(body, nav) {
      const msg = el('div', { class: 'sheet-msg', role: 'alert' });
      let busy = false;

      function done(text, data) {
        const same = data.shortId === game.pack?.data.shortId;
        setGamePack(game, { text, data });
        game.packStore.save(text);
        game.save();
        clear(msg);
        msg.append(
          el('p', { class: 'msg ok' }, el('span', { 'aria-hidden': 'true' }, '✓'), same
            ? ' Das ist dasselbe Lernpaket in einer neuen Fassung. Dein Fortschritt bleibt.'
            : ` Neues Lernpaket: ${data.title}`),
          el('button', { class: 'btn primary', type: 'button', onclick: () => nav.close() }, 'Zurück zum Spiel'),
        );
      }

      function fail(details) {
        clear(msg);
        msg.append(
          el('p', { class: 'msg bad' }, el('span', { 'aria-hidden': 'true' }, '✗'), ' Diese Datei ist kein gültiges Lernpaket. Frag deine Lehrkraft.'),
          el('details', { class: 'details' }, el('summary', {}, 'Details für die Lehrkraft'), el('ul', {}, details.map(d => el('li', {}, d)))),
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
          msg.append(el('p', { class: 'msg bad' }, '✗ Das Beispielpaket konnte nicht geladen werden. Prüfe die Internetverbindung.'));
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
      body.append(
        el('p', { class: 'sheet-text' }, 'Dein Wesen und alles, was du gesammelt hast, bleiben. Die Trainer fordern dich mit den neuen Fragen neu heraus.'),
        p ? el('p', { class: 'small' }, `Jetzt: ${p.title} (${p.subject}) · Kennung ${p.shortId}`) : null,
        el('label', { class: 'btn primary' }, 'Lernpaket-Datei auswählen', input),
        el('button', { class: 'btn link sheet-link', type: 'button', onclick: example }, 'Beispielpaket Englisch 6'),
        msg,
      );
    },
  };
}
