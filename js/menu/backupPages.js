// Seiten „Spielstand sichern“ und „Spielstand laden“ (Design 11.3, 11.4).

import { el, clear } from '../ui/dom.js';
import { confirmPage } from '../ui/sheet.js';
import { shareOrDownload } from '../ui/share.js';
import { formatDateTime } from '../ui/format.js';
import { createBackupText, parseBackupText, backupFileName, compareWithDevice, BACKUP_MESSAGES } from '../save/backup.js';
import { reloadGame } from '../app/flow.js';
import { readPlatform } from '../app/platform.js';

const MAX_BYTES = 4 * 1024 * 1024;

const okMsg = text => el('p', { class: 'msg ok' }, el('span', { 'aria-hidden': 'true' }, '✓'), ` ${text}`);
const badMsg = text => el('p', { class: 'msg bad' }, el('span', { 'aria-hidden': 'true' }, '✗'), ` ${text}`);

export function saveBackupPage(game) {
  return {
    title: 'Spielstand sichern',
    render(body) {
      const msg = el('div', { class: 'sheet-msg', role: 'status' });
      let busy = false;
      async function run() {
        if (busy) return;
        busy = true;
        clear(msg);
        game.save();
        // Text und Name synchron, damit das Teilen-Menü noch als Antwort auf den Tipp gilt.
        const name = backupFileName(game.state.name, Date.now());
        const text = createBackupText(game.state, game.pack.text);
        try {
          const r = await shareOrDownload(name, text);
          if (r !== 'cancelled') msg.append(okMsg(`Gesichert: ${name}`));
        } catch {
          msg.append(badMsg('Das Sichern hat nicht geklappt. Versuche es noch einmal.'));
        } finally {
          busy = false;
        }
      }
      body.append(
        el('p', { class: 'sheet-text' }, 'Sichere deinen Spielstand als Datei. Damit kannst du auf einem anderen Gerät weiterspielen oder nach dem Löschen der Browserdaten alles zurückholen. Die Datei enthält auch dein Lernpaket.'),
        readPlatform().appleMobile ? el('p', { class: 'small' }, 'Tipp: Wähle „In Dateien sichern“.') : null,
        el('button', { class: 'btn primary', type: 'button', onclick: run }, 'Spielstand sichern'),
        msg,
      );
    },
  };
}

function restoreConfirm(game, parsed) {
  const device = game.state ?? game.store.load().state ?? null;
  const cmp = compareWithDevice(device, parsed.state);
  const onYes = () => reloadGame(game, { state: parsed.state, packText: parsed.packText });
  if (cmp.older) {
    return confirmPage({
      title: 'Ältere Sicherung',
      text: `Diese Sicherung ist älter als dein Spielstand auf diesem Gerät.\nSicherung: Level ${cmp.backup.level}, gesichert am ${formatDateTime(cmp.backup.savedAt)}\nAuf diesem Gerät: Level ${cmp.device.level}, gespeichert am ${formatDateTime(cmp.device.savedAt)}\nWenn du sie lädst, gilt der ältere Stand.`,
      yes: 'Trotzdem laden',
      onYes,
    });
  }
  return confirmPage({
    title: 'Spielstand laden',
    text: `Spielstand von ${parsed.state.name} laden? Level ${parsed.state.creature.level}, gesichert am ${formatDateTime(parsed.state.savedAt)}.`,
    yes: 'Laden',
    onYes,
  });
}

export function loadBackupPage(game) {
  return {
    title: 'Spielstand laden',
    render(body, nav) {
      const msg = el('div', { class: 'sheet-msg', role: 'alert' });
      const input = el('input', { type: 'file', accept: '.txt,text/plain', class: 'visually-hidden' });
      input.addEventListener('change', async () => {
        const file = input.files?.[0];
        input.value = '';
        if (!file) return;
        clear(msg);
        if (file.size > MAX_BYTES) return msg.append(badMsg(BACKUP_MESSAGES.unknown));
        let parsed;
        try {
          parsed = parseBackupText(await file.text());
        } catch {
          parsed = { ok: false, reason: 'unknown' };
        }
        if (!parsed.ok) return msg.append(badMsg(BACKUP_MESSAGES[parsed.reason]));
        nav.push(restoreConfirm(game, parsed));
      });
      body.append(
        el('p', { class: 'sheet-text' }, 'Wähle die Sicherungsdatei aus, zum Beispiel „Lumara-Name-Datum.txt“. Dein Lernpaket kommt mit.'),
        el('label', { class: 'btn primary' }, 'Sicherungsdatei auswählen', input),
        msg,
      );
    },
  };
}
