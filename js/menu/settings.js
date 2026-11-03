// Einstellungen (Design 13). Spätere Tasks hängen hier ihre Einträge ein.

import { el } from '../ui/dom.js';
import { confirmPage } from '../ui/sheet.js';
import { reloadGame } from '../app/flow.js';
import { saveBackupPage, loadBackupPage } from './backupPages.js';
import { packSwitchPage } from './packPage.js';
import { homeScreenPage } from './homePage.js';
import { teacherStatsPage } from './teacherPage.js';
import { t } from '../i18n/i18n.js';

const SPEEDS = [['slow', 'settings.slow'], ['normal', 'settings.normal'], ['fast', 'settings.fast']];

function section(title, ...content) {
  return el('section', { class: 'sheet-section' }, el('h3', {}, title), ...content);
}

function textSpeed(game, nav) {
  const current = game.state.settings.textSpeed;
  return section(
    t('settings.textSpeed'),
    el('div', { class: 'row seg' }, SPEEDS.map(([id, label]) =>
      el('button', {
        class: 'btn',
        type: 'button',
        'aria-pressed': id === current ? 'true' : 'false',
        onclick: () => {
          game.state.settings.textSpeed = id;
          game.save();
          nav.refresh();
        },
      }, t(label)),
    )),
  );
}

function newGamePages(game) {
  const second = confirmPage({
    title: t('settings.newGame'),
    text: t('settings.newGameSure'),
    yes: t('recover.yesNew'),
    onYes: () => reloadGame(game),
  });
  return confirmPage({
    title: t('settings.newGame'),
    text: t('settings.newGameAsk'),
    yes: t('settings.yesGoOn'),
    onYes: nav => nav.push(second),
  });
}

const entry = (label, onclick) => el('button', { class: 'btn', type: 'button', onclick }, label);

export function settingsPage(game) {
  return {
    title: t('menu.settings'),
    render(body, nav) {
      body.append(
        textSpeed(game, nav),
        game.state && game.pack ? section(t('settings.pack'), el('div', { class: 'sheet-list' }, entry(t('settings.switchPack'), () => nav.push(packSwitchPage(game))))) : null,
        section(
          t('settings.savedGame'),
          el('div', { class: 'sheet-list' },
            game.state ? entry(t('settings.saveGame'), () => nav.push(saveBackupPage(game))) : null,
            entry(t('settings.loadGame'), () => nav.push(loadBackupPage(game))),
          ),
        ),
        game.state && game.pack ? section(t('settings.teacher'), el('div', { class: 'sheet-list' }, entry(t('menu.teacher'), () => nav.push(teacherStatsPage(game))))) : null,
        section(t('settings.device'), el('div', { class: 'sheet-list' }, entry(t('settings.homeScreen'), () => nav.push(homeScreenPage(game))))),
        section(t('settings.startOver'), el('button', { class: 'btn danger', type: 'button', onclick: () => nav.push(newGamePages(game)) }, t('settings.newGame'))),
        el('p', { class: 'sheet-foot' }, `${t('settings.version', { v: game.version })}${game.updateReady ? ` · ${t('app.updateReady')}` : ''}`),
      );
    },
  };
}
