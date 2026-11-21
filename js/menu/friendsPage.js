// Freunde im Menü (Lumara 1.2): Liste der Freunde mit Gabe und Freundeskarte, auf der man den
// Begleiter wechselt. Die Karte ist eine eigene Seite; der Garten öffnet sie ebenfalls.

import { el, appendAll } from '../ui/dom.js';
import { t } from '../i18n/i18n.js';
import { sound } from '../audio/bus.js';
import { speciesName } from '../data/species.js';
import { creatureCanvas } from '../gfx/creatureImage.js';
import { FRIENDABLE, friendList, setCompanion, giftName, giftText } from '../friends/friends.js';

export function friendsPage(game) {
  return {
    title: t('menu.friends'),
    render(body, nav) {
      const list = friendList(game.state);
      if (!list.length) return appendAll(body, el('p', { class: 'sheet-text' }, t('friends.none')));
      appendAll(body,
        el('p', { class: 'small' }, t('friends.count', { n: list.length, max: FRIENDABLE.length })),
        el('div', { class: 'friend-list' }, list.map(f => el('button', {
          class: 'friend-row',
          type: 'button',
          onclick: () => nav.push(friendCard(game, f.species)),
        },
        creatureCanvas(f.species, 1, { look: f.shiny ? 'shiny' : 'color', scale: 1 }),
        el('span', { class: 'friend-text' },
          el('b', {}, speciesName(f.species, 1)),
          el('span', {}, giftName(f.gift)),
          f.companion ? el('span', { class: 'friend-with' }, t('friends.withYou')) : null)))));
    },
  };
}

export function friendCard(game, species) {
  return {
    title: speciesName(species, 1),
    render(body, nav) {
      const f = friendList(game.state).find(x => x.species === species);
      const name = speciesName(species, 1);
      // Kein Freund (kommt im Spiel nicht vor, etwa ein kaputter Spielstand): ein Satz statt einer leeren Seite.
      if (!f) return appendAll(body, el('p', { class: 'sheet-text' }, t('friends.notYet', { name })));
      const button = el('button', {
        class: 'btn primary',
        type: 'button',
        onclick: () => {
          button.disabled = true;
          setCompanion(game.state, f.companion ? null : species);
          game.save?.();
          sound('confirm');
          nav.refresh();
        },
      }, t(f.companion ? 'friends.backToGarden' : 'friends.takeAlong'));
      appendAll(body, el('div', { class: 'friend-card' },
        creatureCanvas(species, 1, { look: f.shiny ? 'shiny' : 'color', scale: 2 }),
        el('p', { class: 'creature-name' }, name),
        el('p', {}, t('friends.gift', { gift: giftName(f.gift) })),
        el('p', { class: 'sheet-text' }, giftText(f.gift)),
        f.companion ? el('p', {}, t('friends.isWithYou', { name })) : null,
        button));
    },
  };
}
