// Einstellungen (Design 13). Spätere Tasks hängen hier ihre Einträge ein.

import { el } from '../ui/dom.js';
import { confirmPage } from '../ui/sheet.js';
import { reloadGame } from '../app/flow.js';
import { saveBackupPage, loadBackupPage } from './backupPages.js';
import { packSwitchPage } from './packPage.js';
import { homeScreenPage } from './homePage.js';
import { teacherStatsPage } from './teacherPage.js';

const SPEEDS = [['slow', 'Langsam'], ['normal', 'Normal'], ['fast', 'Schnell']];

function section(title, ...content) {
  return el('section', { class: 'sheet-section' }, el('h3', {}, title), ...content);
}

function textSpeed(game, nav) {
  const current = game.state.settings.textSpeed;
  return section(
    'Textgeschwindigkeit',
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
      }, label),
    )),
  );
}

function newGamePages(game) {
  const second = confirmPage({
    title: 'Neues Spiel',
    text: 'Bist du ganz sicher? Das lässt sich nicht rückgängig machen. Tipp: Sichere vorher deinen Spielstand.',
    yes: 'Ja, neu beginnen',
    onYes: () => reloadGame(game),
  });
  return confirmPage({
    title: 'Neues Spiel',
    text: 'Möchtest du wirklich ein neues Spiel beginnen? Dein Wesen und alles, was du erreicht hast, gehen verloren.',
    yes: 'Ja, weiter',
    onYes: nav => nav.push(second),
  });
}

const entry = (label, onclick) => el('button', { class: 'btn', type: 'button', onclick }, label);

export function settingsPage(game) {
  return {
    title: 'Einstellungen',
    render(body, nav) {
      body.append(
        textSpeed(game, nav),
        game.state && game.pack ? section('Lernpaket', el('div', { class: 'sheet-list' }, entry('Lernpaket wechseln', () => nav.push(packSwitchPage(game))))) : null,
        section(
          'Spielstand',
          el('div', { class: 'sheet-list' },
            game.state ? entry('Spielstand sichern', () => nav.push(saveBackupPage(game))) : null,
            entry('Spielstand laden', () => nav.push(loadBackupPage(game))),
          ),
        ),
        game.state && game.pack ? section('Lehrkraft', el('div', { class: 'sheet-list' }, entry('Für die Lehrkraft', () => nav.push(teacherStatsPage(game))))) : null,
        section('Gerät', el('div', { class: 'sheet-list' }, entry('Zum Home-Bildschirm', () => nav.push(homeScreenPage(game))))),
        section('Neu anfangen', el('button', { class: 'btn danger', type: 'button', onclick: () => nav.push(newGamePages(game)) }, 'Neues Spiel')),
        el('p', { class: 'sheet-foot' }, `Spielfassung ${game.version}`),
      );
    },
  };
}
