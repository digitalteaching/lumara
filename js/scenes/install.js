// „Erst installieren, dann spielen“ (Design 11.1): auf iPad und iPhone im Browser und ohne
// Spielstand, vor dem Laden des Lernpakets.

import { el } from '../ui/dom.js';
import { createFreshGuard, guardClicks } from '../ui/freshGuard.js';
import { installSteps } from '../menu/homePage.js';
import { drawTitleArt } from './title.js';

export function createInstallScene(game, next) {
  let card = null;
  return {
    enter() {
      game.mode = 'screen';
      card = el(
        'div',
        { class: 'box screen-card install' },
        el('p', { class: 'recover-title' }, 'Bevor es losgeht'),
        el('p', {}, 'Leg Lumara auf deinen Home-Bildschirm. Dann bleibt dein Spielstand sicher gespeichert.'),
        installSteps(),
        el('button', { class: 'btn link', type: 'button', onclick: () => next() }, 'Trotzdem im Browser spielen'),
      );
      game.panel.append(card);
      guardClicks(card, createFreshGuard());
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
