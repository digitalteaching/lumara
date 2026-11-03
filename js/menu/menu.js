// Menü (Design 13): „Wesen“, „Rucksack“, „Karte“, „Tagebuch“ und „Einstellungen“; das Wesen-Buch
// kommt mit dem Plan, der es füllt.

import { el } from '../ui/dom.js';
import { openSheet } from '../ui/sheet.js';
import { speciesText, speciesName, displayName } from '../data/species.js';
import { xpToNext, maxEnergy, stageForLevel } from '../duel/progress.js';
import { settingsPage } from './settings.js';
import { bagPage } from './bagPage.js';
import { diaryPage } from './diaryPage.js';
import { mapPage } from './mapPage.js';
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
        ),
      );
    },
  };
}

function menuPage(game) {
  return {
    title: t('menu.title'),
    render(body, nav) {
      body.append(
        el('div', { class: 'sheet-list' },
          el('button', { class: 'btn', type: 'button', onclick: () => nav.push(creaturePage(game)) }, t('menu.creature')),
          el('button', { class: 'btn', type: 'button', onclick: () => nav.push(bagPage(game)) }, t('menu.bag')),
          el('button', { class: 'btn', type: 'button', onclick: () => nav.push(mapPage(game)) }, t('menu.map')),
          el('button', { class: 'btn', type: 'button', onclick: () => nav.push(diaryPage(game)) }, t('menu.diary')),
          el('button', { class: 'btn', type: 'button', onclick: () => nav.push(settingsPage(game)) }, t('menu.settings')),
          el('button', { class: 'btn primary', type: 'button', onclick: () => nav.close() }, t('menu.backToGame')),
        ),
      );
    },
  };
}

export function openMenu(game) {
  return openSheet(game, menuPage(game));
}
