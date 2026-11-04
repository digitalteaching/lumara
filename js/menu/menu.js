// Menü (Design 13): Wesen, Rucksack, Wesen-Buch, Karte, Tagebuch und Einstellungen (js/menu/items.js).

import { sound } from '../audio/bus.js';
import { el } from '../ui/dom.js';
import { openSheet } from '../ui/sheet.js';
import { speciesText, speciesName, displayName, abilityRows } from '../data/species.js';
import { creatureCanvas } from '../gfx/creatureImage.js';
import { xpToNext, maxEnergy, stageForLevel } from '../duel/progress.js';
import { settingsPage } from './settings.js';
import { bagPage } from './bagPage.js';
import { diaryPage } from './diaryPage.js';
import { mapPage } from './mapPage.js';
import { bookPage } from './bookPage.js';
import { MENU_ITEMS } from './items.js';
import { t } from '../i18n/i18n.js';

export function creaturePage(game) {
  return {
    title: t('menu.creature'),
    render(body) {
      const c = game.state.creature;
      const stage = stageForLevel(c.level);
      const need = xpToNext(c.level);
      const special = speciesText(c.species).special;
      const atMax = c.level >= game.config.creature.maxLevel;
      body.append(
        el('div', { class: 'creature-card' },
          el('div', { class: 'creature-portrait' }, creatureCanvas(c.species, stage, { scale: 2 })),
          el('p', { class: 'creature-name' }, displayName(c)),
          displayName(c) === speciesName(c.species, stage) ? null : el('p', { class: 'creature-species' }, speciesName(c.species, stage)),
          el('p', {}, t('creature.levelStage', { level: c.level, stage })),
          atMax
            ? el('p', {}, t('creature.maxLevel'))
            : [
              el('div', { class: 'xp-bar', role: 'img', 'aria-label': t('creature.xpAria', { xp: c.xpInLevel, need }) }, el('span', { style: { width: `${Math.round((c.xpInLevel / need) * 100)}%` } })),
              el('p', { class: 'small' }, t('creature.xpToNext', { xp: c.xpInLevel, need, next: c.level + 1 })),
            ],
          el('p', {}, t('common.energy', { n: c.energy, max: maxEnergy(c) })),
          el('p', { class: 'creature-special' }, el('b', {}, t('creature.specialLabel', { name: special.name })), special.text),
          // Fähigkeiten der Stufen (Design 6.2, 13): freigeschaltet mit ✓, sonst ab welchem Level
          el('h3', { class: 'creature-abilities-title' }, t('creature.abilities')),
          el('ul', { class: 'creature-abilities' }, abilityRows(c.level).map(r =>
            el('li', { class: r.unlocked ? 'on' : 'off' }, r.unlocked
              ? t('creature.abilityOn', { name: r.name, text: r.text })
              : t('creature.abilityOff', { level: r.fromLevel, name: r.name })))),
        ),
      );
    },
  };
}

const PAGES = {
  'menu.creature': creaturePage,
  'menu.bag': bagPage,
  'menu.book': bookPage,
  'menu.map': mapPage,
  'menu.diary': diaryPage,
  'menu.settings': settingsPage,
};

function menuPage(game) {
  return {
    title: t('menu.title'),
    render(body, nav) {
      body.append(
        el('div', { class: 'sheet-list' },
          MENU_ITEMS.map(key => el('button', { class: 'btn', type: 'button', onclick: () => nav.push(PAGES[key](game)) }, t(key))),
          el('button', { class: 'btn primary', type: 'button', onclick: () => nav.close() }, t('menu.backToGame')),
        ),
      );
    },
  };
}

export function openMenu(game) {
  sound('menu');
  return openSheet(game, menuPage(game));
}
