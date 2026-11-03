// Menü (Design 13): „Wesen“, „Rucksack“, „Karte“, „Tagebuch“ und „Einstellungen“; das Wesen-Buch
// kommt mit dem Plan, der es füllt.

import { el } from '../ui/dom.js';
import { openSheet } from '../ui/sheet.js';
import { SPECIES, speciesName, displayName } from '../data/species.js';
import { xpToNext, maxEnergy, stageForLevel } from '../duel/progress.js';
import { settingsPage } from './settings.js';
import { bagPage } from './bagPage.js';
import { diaryPage } from './diaryPage.js';
import { mapPage } from './mapPage.js';

export function creaturePage(game) {
  return {
    title: 'Wesen',
    render(body) {
      const c = game.state.creature;
      const stage = stageForLevel(c.level);
      const need = xpToNext(c.level);
      const special = SPECIES[c.species].special;
      const atMax = c.level >= game.config.creature.maxLevel;
      body.append(
        el('div', { class: 'creature-card' },
          el('p', { class: 'creature-name' }, displayName(c)),
          displayName(c) === speciesName(c.species, stage) ? null : el('p', { class: 'creature-species' }, speciesName(c.species, stage)),
          el('p', {}, `Level ${c.level} · Stufe ${stage}`),
          atMax
            ? el('p', {}, 'Höchstes Level erreicht.')
            : [
              el('div', { class: 'xp-bar', role: 'img', 'aria-label': `${c.xpInLevel} von ${need} XP` }, el('span', { style: { width: `${Math.round((c.xpInLevel / need) * 100)}%` } })),
              el('p', { class: 'small' }, `${c.xpInLevel} / ${need} XP bis Level ${c.level + 1}`),
            ],
          el('p', {}, `Energie ${c.energy} / ${maxEnergy(c)}`),
          el('p', { class: 'creature-special' }, el('b', {}, `Besonderheit: ${special.name}. `), special.text),
        ),
      );
    },
  };
}

function menuPage(game) {
  return {
    title: 'Menü',
    render(body, nav) {
      body.append(
        el('div', { class: 'sheet-list' },
          el('button', { class: 'btn', type: 'button', onclick: () => nav.push(creaturePage(game)) }, 'Wesen'),
          el('button', { class: 'btn', type: 'button', onclick: () => nav.push(bagPage(game)) }, 'Rucksack'),
          el('button', { class: 'btn', type: 'button', onclick: () => nav.push(mapPage(game)) }, 'Karte'),
          el('button', { class: 'btn', type: 'button', onclick: () => nav.push(diaryPage(game)) }, 'Tagebuch'),
          el('button', { class: 'btn', type: 'button', onclick: () => nav.push(settingsPage(game)) }, 'Einstellungen'),
          el('button', { class: 'btn primary', type: 'button', onclick: () => nav.close() }, 'Zurück zum Spiel'),
        ),
      );
    },
  };
}

export function openMenu(game) {
  return openSheet(game, menuPage(game));
}
