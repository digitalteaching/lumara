// Einstellungen (Design 13). Spätere Tasks hängen hier ihre Einträge ein.

import { el, appendAll } from '../ui/dom.js';
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

// Musik und Effekte getrennt ein und aus (Design 15); der Zustand steht am Knopf (aria-pressed).
function sound(game, nav) {
  const toggle = (key, label, apply) => {
    const on = game.state.settings[key] !== false;
    return el('button', {
      class: 'btn',
      type: 'button',
      'aria-pressed': on ? 'true' : 'false',
      onclick: () => {
        game.state.settings[key] = !on;
        apply(!on);
        game.save();
        nav.refresh();
      },
    }, t('settings.toggle', { what: t(label), state: t(on ? 'settings.on' : 'settings.off') }));
  };
  return section(
    t('settings.sound'),
    el('div', { class: 'row seg' },
      toggle('music', 'settings.music', on => game.audio?.setMusicOn(on)),
      toggle('sfx', 'settings.sfx', on => game.audio?.setSfxOn(on))),
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
      appendAll(body,
        textSpeed(game, nav),
        sound(game, nav),
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
