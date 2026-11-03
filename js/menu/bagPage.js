// Rucksack-Seite (Design 8, 13): Futter, Steine und die Lebenssteine im Wesen.
// Weitblicksteine wirken im Duell, Glanzsteine werden hier eingesetzt.

import { el } from '../ui/dom.js';
import { CONFIG } from '../config.js';
import { foodCount } from '../items/bag.js';
import { eat } from '../items/food.js';
import { useShine } from '../items/stones.js';
import { displayName } from '../data/species.js';
import { maxEnergy } from '../duel/progress.js';

const NAMES = { berry: 'Beeren', starfruit: 'Sternfrüchte', farsight: 'Weitblicksteine', shine: 'Glanzsteine' };
const EATS = { berry: 'eine Beere', starfruit: 'eine Sternfrucht' };

export function bagPage(game) {
  let message = '';
  return {
    title: 'Rucksack',
    render(body, nav) {
      const s = game.state;
      const c = s.creature;
      const bag = s.bag;

      const feedButton = item =>
        el('button', {
          class: 'btn',
          type: 'button',
          disabled: !(bag[item] > 0),
          onclick: () => {
            const r = eat(s, item);
            message = r.ok ? `${displayName(c)} isst ${EATS[item]}. +${r.gained} Energie` : `${displayName(c)} ist schon satt.`;
            if (r.ok) game.save();
            nav.refresh();
          },
        }, 'Füttern');
      const shineButton = el('button', {
        class: 'btn',
        type: 'button',
        disabled: s.shineActive || !(bag.shine > 0),
        onclick: () => {
          message = '';
          if (useShine(s)) game.save();
          nav.refresh();
        },
      }, 'Einsetzen');
      const row = (item, action = null, note = null) =>
        el('div', { class: 'bag-row' },
          el('span', { class: 'bag-name' }, NAMES[item], note ? el('span', { class: 'bag-note' }, note) : null),
          el('span', { class: 'bag-count' }, String(bag[item])),
          action);

      body.append(...[
        el('p', {}, `Energie ${c.energy} / ${maxEnergy(c)}`),
        el('p', { class: 'small' }, `Futter: ${foodCount(bag)} von ${CONFIG.bag.foodMax} Plätzen belegt`),
        el('div', { class: 'bag-list' },
          row('berry', feedButton('berry')),
          row('starfruit', feedButton('starfruit')),
          row('farsight', null, 'Im Duell: zeigt einen Hinweis.'),
          row('shine', shineButton),
        ),
        s.shineActive ? el('p', { class: 'bag-shine' }, 'Glanzstein leuchtet: doppelte XP beim nächsten Sieg.') : null,
        el('p', {}, `Lebenssteine im Wesen: ${c.lifeStones} von ${CONFIG.creature.maxLifeStones}`),
        el('p', { class: 'bag-message', role: 'status' }, message),
      ].filter(Boolean));
    },
  };
}
