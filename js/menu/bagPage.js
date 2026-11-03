// Rucksack-Seite (Design 8, 13): Futter, Steine und die Lebenssteine im Wesen.
// Weitblick- und Zeitsteine wirken im Duell, Glanzsteine werden hier eingesetzt.

import { el } from '../ui/dom.js';
import { CONFIG } from '../config.js';
import { foodCount } from '../items/bag.js';
import { eat } from '../items/food.js';
import { useShine } from '../items/stones.js';
import { displayName } from '../data/species.js';
import { maxEnergy } from '../duel/progress.js';
import { t } from '../i18n/i18n.js';

const NAMES = { berry: 'bag.berries', starfruit: 'bag.starfruits', farsight: 'bag.farsights', shine: 'bag.shines', time: 'bag.times' };
const EATS = { berry: 'item.aBerry', starfruit: 'item.aStarfruit' };

export function bagPage(game) {
  let message = '';
  return {
    title: t('menu.bag'),
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
            message = r.ok ? t('bag.eats', { name: displayName(c), what: t(EATS[item]), n: r.gained }) : t('bag.notHungry', { name: displayName(c) });
            if (r.ok) game.save();
            nav.refresh();
          },
        }, t('duel.feed'));
      const shineButton = el('button', {
        class: 'btn',
        type: 'button',
        disabled: s.shineActive || !(bag.shine > 0),
        onclick: () => {
          message = '';
          if (useShine(s)) game.save();
          nav.refresh();
        },
      }, t('bag.use'));
      const row = (item, action = null, note = null) =>
        el('div', { class: 'bag-row' },
          el('span', { class: 'bag-name' }, t(NAMES[item]), note ? el('span', { class: 'bag-note' }, note) : null),
          el('span', { class: 'bag-count' }, String(bag[item])),
          action);

      body.append(...[
        el('p', {}, t('common.energy', { n: c.energy, max: maxEnergy(c) })),
        el('p', { class: 'small' }, t('bag.foodSlots', { n: foodCount(bag), max: CONFIG.bag.foodMax })),
        el('div', { class: 'bag-list' },
          row('berry', feedButton('berry')),
          row('starfruit', feedButton('starfruit')),
          row('farsight', null, t('bag.farsightNote')),
          row('shine', shineButton),
          row('time', null, t('bag.timeNote')),
        ),
        s.shineActive ? el('p', { class: 'bag-shine' }, t('bag.shineActive')) : null,
        el('p', {}, t('bag.lifeStones', { n: c.lifeStones, max: CONFIG.creature.maxLifeStones })),
        el('p', { class: 'bag-message', role: 'status' }, message),
      ].filter(Boolean));
    },
  };
}
