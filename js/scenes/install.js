// „Erst installieren, dann spielen“ (Design 11.1): auf iPad und iPhone im Browser und ohne
// Spielstand, vor dem Laden des Lernpakets.

import { el } from '../ui/dom.js';
import { createFreshGuard, guardClicks } from '../ui/freshGuard.js';
import { installSteps } from '../menu/homePage.js';
import { drawTitleArt } from './title.js';
import { t } from '../i18n/i18n.js';

export function createInstallScene(game, next) {
  let card = null;
  return {
    enter() {
      game.mode = 'screen';
      card = el(
        'div',
        { class: 'box screen-card install' },
        el('p', { class: 'recover-title' }, t('install.title')),
        el('p', {}, t('install.text')),
        installSteps(),
        el('button', { class: 'btn link', type: 'button', onclick: () => next() }, t('install.browser')),
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
