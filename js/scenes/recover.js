// Wenn der Spielstand beim Start nicht geladen werden kann (Design 11): Sicherung anbieten,
// nie still überschreiben. „Neues Spiel“ braucht zwei Bestätigungen.

import { el } from '../ui/dom.js';
import { choose } from '../ui/dialog.js';
import { createFreshGuard, guardClicks } from '../ui/freshGuard.js';
import { formatDateTime } from '../ui/format.js';
import { drawTitleArt } from './title.js';
import { t } from '../i18n/i18n.js';

export async function confirmNewGame(game) {
  const first = await choose(game, t('recover.newGameAsk'), [t('common.no'), t('common.yes')], { cancelIndex: 0 });
  if (first !== 1) return false;
  const second = await choose(game, t('recover.newGameSure'), [t('common.no'), t('recover.yesNew')], { cancelIndex: 0 });
  return second === 1;
}

// loaded: LoadResult mit status 'backup' | 'damaged' | 'newer'
// extraButtons: zusätzliche Knöpfe (ab Task 6 „Spielstand-Datei laden“)
export function createRecoverScene(game, { loaded, onUseBackup, onNewGame, extraButtons = () => [] }) {
  let card = null;
  let busy = false;

  async function newGame() {
    if (busy) return;
    busy = true;
    // Herausnehmen statt verstecken: .screen-card setzt display und würde hidden überstimmen,
    // und der fokussierte Knopf darf Enter nicht noch einmal bekommen.
    card.remove();
    const yes = await confirmNewGame(game);
    busy = false;
    if (yes) return onNewGame();
    game.panel.append(card);
  }

  function build() {
    const parts = [];
    if (loaded.status === 'newer') {
      parts.push(
        el('p', { class: 'recover-title' }, t('recover.newer')),
        el('p', {}, t('recover.reloadHint')),
        el('button', { class: 'btn primary big', type: 'button', onclick: () => location.reload() }, t('recover.reload')),
      );
    } else if (loaded.status === 'backup') {
      const s = loaded.state;
      parts.push(
        el('p', { class: 'recover-title' }, t('recover.damaged')),
        el('p', {}, t('recover.backupInfo', { name: s.name, level: s.creature.level, date: formatDateTime(s.savedAt) })),
        el('button', { class: 'btn primary big', type: 'button', onclick: () => onUseBackup(s) }, t('recover.useBackup')),
        ...extraButtons(),
        el('button', { class: 'btn link', type: 'button', onclick: newGame }, t('recover.newGame')),
      );
    } else {
      parts.push(
        el('p', { class: 'recover-title' }, t('recover.broken')),
        el('p', {}, t('recover.fileHint')),
        ...extraButtons(),
        el('button', { class: 'btn link', type: 'button', onclick: newGame }, t('recover.newGame')),
      );
    }
    card = el('div', { class: 'box screen-card recover', role: 'alert' }, parts);
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
