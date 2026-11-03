// Wenn der Spielstand beim Start nicht geladen werden kann (Design 11): Sicherung anbieten,
// nie still überschreiben. „Neues Spiel“ braucht zwei Bestätigungen.

import { el } from '../ui/dom.js';
import { choose } from '../ui/dialog.js';
import { createFreshGuard, guardClicks } from '../ui/freshGuard.js';
import { formatDateTime } from '../ui/format.js';
import { drawTitleArt } from './title.js';

export async function confirmNewGame(game) {
  const first = await choose(game, 'Neues Spiel beginnen? Dein bisheriges Spiel ist dann weg.', ['Nein', 'Ja'], { cancelIndex: 0 });
  if (first !== 1) return false;
  const second = await choose(game, 'Wirklich? Das lässt sich nicht rückgängig machen.', ['Nein', 'Ja, neu beginnen'], { cancelIndex: 0 });
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
        el('p', { class: 'recover-title' }, 'Dieser Spielstand stammt aus einer neueren Fassung von Lumara.'),
        el('p', {}, 'Lade die Seite neu, dann geht es weiter.'),
        el('button', { class: 'btn primary big', type: 'button', onclick: () => location.reload() }, 'Neu laden'),
      );
    } else if (loaded.status === 'backup') {
      const s = loaded.state;
      parts.push(
        el('p', { class: 'recover-title' }, 'Dein Spielstand ist beschädigt.'),
        el('p', {}, `Auf diesem Gerät gibt es noch eine Sicherung: ${s.name}, Level ${s.creature.level}, gespeichert am ${formatDateTime(s.savedAt)}.`),
        el('button', { class: 'btn primary big', type: 'button', onclick: () => onUseBackup(s) }, 'Sicherung laden'),
        ...extraButtons(),
        el('button', { class: 'btn link', type: 'button', onclick: newGame }, 'Neues Spiel beginnen'),
      );
    } else {
      parts.push(
        el('p', { class: 'recover-title' }, 'Dein Spielstand ist beschädigt und lässt sich nicht laden.'),
        el('p', {}, 'Wenn du eine Sicherungsdatei hast, kannst du sie laden.'),
        ...extraButtons(),
        el('button', { class: 'btn link', type: 'button', onclick: newGame }, 'Neues Spiel beginnen'),
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
