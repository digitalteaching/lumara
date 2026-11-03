// Seiten „Spielstand sichern“ und „Spielstand laden“ (Design 11.3, 11.4).

import { el, clear, appendAll } from '../ui/dom.js';
import { confirmPage } from '../ui/sheet.js';
import { shareOrDownload } from '../ui/share.js';
import { formatDateTime } from '../ui/format.js';
import { createBackupText, parseBackupText, backupFileName, compareWithDevice, backupMessage } from '../save/backup.js';
import { t } from '../i18n/i18n.js';
import { reloadGame } from '../app/flow.js';
import { readPlatform } from '../app/platform.js';

const MAX_BYTES = 4 * 1024 * 1024;

const okMsg = text => el('p', { class: 'msg ok' }, el('span', { 'aria-hidden': 'true' }, '✓'), ` ${text}`);
const badMsg = text => el('p', { class: 'msg bad' }, el('span', { 'aria-hidden': 'true' }, '✗'), ` ${text}`);

export function saveBackupPage(game) {
  return {
    title: t('settings.saveGame'),
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
          if (r !== 'cancelled') msg.append(okMsg(t('backup.saved', { name })));
        } catch {
          msg.append(badMsg(t('backup.failed')));
        } finally {
          busy = false;
        }
      }
      appendAll(body,
        el('p', { class: 'sheet-text' }, t('backup.saveText')),
        readPlatform().appleMobile ? el('p', { class: 'small' }, t('backup.tipFiles')) : null,
        el('button', { class: 'btn primary', type: 'button', onclick: run }, t('settings.saveGame')),
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
      title: t('backup.older'),
      text: t('backup.olderText', { bl: cmp.backup.level, bd: formatDateTime(cmp.backup.savedAt), dl: cmp.device.level, dd: formatDateTime(cmp.device.savedAt) }),
      yes: t('backup.loadAnyway'),
      onYes,
    });
  }
  return confirmPage({
    title: t('settings.loadGame'),
    text: t('backup.loadAsk', { name: parsed.state.name, level: parsed.state.creature.level, date: formatDateTime(parsed.state.savedAt) }),
    yes: t('backup.load'),
    onYes,
  });
}

export function loadBackupPage(game) {
  return {
    title: t('settings.loadGame'),
    render(body, nav) {
      const msg = el('div', { class: 'sheet-msg', role: 'alert' });
      const input = el('input', { type: 'file', accept: '.txt,text/plain', class: 'visually-hidden' });
      input.addEventListener('change', async () => {
        const file = input.files?.[0];
        input.value = '';
        if (!file) return;
        clear(msg);
        if (file.size > MAX_BYTES) return msg.append(badMsg(backupMessage('unknown')));
        let parsed;
        try {
          parsed = parseBackupText(await file.text());
        } catch {
          parsed = { ok: false, reason: 'unknown' };
        }
        if (!parsed.ok) return msg.append(badMsg(backupMessage(parsed.reason)));
        nav.push(restoreConfirm(game, parsed));
      });
      appendAll(body,
        el('p', { class: 'sheet-text' }, t('backup.chooseText')),
        el('label', { class: 'btn primary' }, t('backup.chooseFile'), input),
        msg,
      );
    },
  };
}
