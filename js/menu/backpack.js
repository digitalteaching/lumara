// Der Rucksack im Spiel (Lumara 1.1, Spec 5.1): ein großer Pixel-Rucksack über dem ganzen Bildschirm.
// Er kommt von unten nach vorn, die Klappe klappt hoch, dann liegen vier Fächer offen (Futter, Steine,
// Schätze, Schlüssel). Antippen zeigt darunter eine Karte mit Name, Anzahl, Text und Handlung, bei
// einem Schatz dazu, wer ihn sich gerade wünscht (Lumara 1.3).
// Schließen mit ✕, B, Esc, R oder einem Tipp neben den Rucksack. Bei „Bewegung reduzieren“ ist er
// sofort offen, und nichts fliegt. Was die Fächer zeigen, kommt aus items/backpackView.js. Nur im Browser.

import { sound } from '../audio/bus.js';
import { el, clear, appendAll } from '../ui/dom.js';
import { createFreshGuard, guardClicks, FRESH_MS } from '../ui/freshGuard.js';
import { backpackView, itemName, itemText } from '../items/backpackView.js';
import { TREASURES } from '../items/treasures.js';
import { eat } from '../items/food.js';
import { useShine } from '../items/stones.js';
import { areaName, mapOfArea } from '../world/network.js';
import { displayName } from '../data/species.js';
import { itemCanvas, BAG_ART } from '../gfx/art/items.js';
import { spriteFrom } from '../gfx/canvasSprites.js';
import { COLOR, hexOf } from '../gfx/palette.js';
import { t } from '../i18n/i18n.js';

const OPEN_MS = 420; // von unten nach vorn, dann die Klappe (siehe css/spiel.css)
const CLOSE_MS = 180;
const FLY_MS = 420;
const FRAME_SCALE = 4; // Rahmen in vierfacher Größe: 8 px je Scheibe werden 32 px
const DIRS = ['up', 'down', 'left', 'right'];
const EATS = { berry: 'item.aBerry', starfruit: 'item.aStarfruit' };
const AREA_OF = Object.fromEntries(TREASURES.map(x => [x.id, x.area]));

const isTouch = () => document.body.classList.contains('touch');
const stillFor = game => game.reducedMotion || !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Ein Pixelbild als eigenes Canvas (dieselben Bilder stehen im Fach und auf der Karte).
function copy(src, scale = 1) {
  const c = document.createElement('canvas');
  c.width = src.width * scale;
  c.height = src.height * scale;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.drawImage(src, 0, 0, c.width, c.height);
  return c;
}

// Gegenstand oder Schatz; ein nie gefundener Schatz als graue Silhouette.
function picture(id, unknown, cls) {
  const c = copy(itemCanvas(id));
  if (unknown) {
    const g = c.getContext('2d');
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = hexOf(COLOR.mist);
    g.fillRect(0, 0, c.width, c.height);
  }
  c.className = cls;
  c.setAttribute('aria-hidden', 'true');
  return c;
}

let frameUrl = null;
const frameImage = () => (frameUrl ??= copy(spriteFrom('bag:frame', BAG_ART.frame), FRAME_SCALE).toDataURL());

// Kleiner Rucksack für den Knopf in der Welt (32 px, doppelt so groß wie das Bild).
export function bagIcon() {
  const c = copy(spriteFrom('bag:icon', BAG_ART.icon), 2);
  c.setAttribute('aria-hidden', 'true');
  return c;
}

export function openBackpack(game) {
  return new Promise(resolve => {
    const prevMode = game.mode;
    game.mode = 'screen';
    const still = stillFor(game);
    let closed = false;
    let selected = null; // { pocket, id }
    let message = '';
    let shownEnergy = null; // während das Futter fliegt, zeigt der Balken noch den alten Wert
    const timers = [];

    const closeBtn = el('button', { class: 'btn bp-close', type: 'button', 'aria-label': t('bag.close'), dataset: { focus: 'close' }, onclick: () => close() }, '✕');
    const energyBox = el('div', { class: 'bp-energy' });
    const foodText = el('p', { class: 'bp-food' });
    const head = el('div', { class: 'bp-head' }, energyBox, foodText, closeBtn);
    const pockets = el('div', { class: 'bp-pockets' });
    const card = el('div', { class: 'bp-card', role: 'status', 'aria-live': 'polite' });
    const body = el('div', { class: 'bp-body' }, head, pockets, card);
    const flap = still ? null : el('div', { class: 'bp-flap', 'aria-hidden': 'true' }, copy(spriteFrom('bag:flap', BAG_ART.flap)));
    const bag = el('div', { class: 'bp-bag', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('menu.bag') }, flap, body);
    const root = el('div', { class: `backpack ${still ? 'open' : 'anim'}` }, bag);
    root.style.setProperty('--bp-frame', `url("${frameImage()}")`);
    document.body.append(root);

    // Doppeltipp-Schutz wie im Menü: Was gerade unter dem Finger erschien, nimmt kurz nichts an,
    // auch nicht der Rand neben dem Rucksack (sonst schlösse ihn der zweite Tipp auf den Knopf gleich).
    // Nach dem Schließen nimmt nichts darin mehr einen Tipp an, solange er noch daliegt.
    const guard = createFreshGuard();
    guardClicks(root, { isFresh: () => closed || guard.isFresh() });
    root.addEventListener('click', e => {
      if (e.target === root && !guard.isFresh()) close();
    });

    function renderHead(view) {
      const c = game.state.creature;
      const energy = shownEnergy ?? view.energy;
      const bar = el('div', { class: 'plate-bar', 'aria-hidden': 'true' },
        Array.from({ length: view.maxEnergy }, (_, i) => el('span', { class: `seg${i < energy ? ' on' : ''}` })));
      bar.classList.toggle('low', energy <= Math.max(1, Math.floor(view.maxEnergy / 4)));
      clear(energyBox);
      energyBox.append(
        el('div', { class: 'plate-head' }, el('span', {}, displayName(c)), el('span', { class: 'plate-lv' }, t('common.energy', { n: energy, max: view.maxEnergy }))),
        bar,
      );
      foodText.textContent = t('bag.foodSlots', view.food);
    }

    function slot(pocketId, entry) {
      const name = entry.known ? itemName(entry) : t('bag.unknown');
      const counted = entry.known && entry.kind !== 'key';
      const isSelected = selected?.pocket === pocketId && selected.id === entry.id;
      const cls = ['bp-slot', !entry.known && 'unknown', counted && entry.count === 0 && 'none', isSelected && 'selected'].filter(Boolean).join(' ');
      return el('button', {
        class: cls,
        type: 'button',
        'aria-label': counted ? `${name}: ${entry.count}` : name,
        'aria-current': isSelected ? 'true' : null,
        dataset: { focus: `${pocketId}:${entry.id}` },
        onclick: () => pick(pocketId, entry.id),
      },
      picture(entry.id, !entry.known, 'bp-img'),
      entry.known ? null : el('span', { class: 'bp-q', 'aria-hidden': 'true' }, '?'),
      counted ? el('span', { class: 'bp-count', 'aria-hidden': 'true' }, String(entry.count)) : null);
    }

    // Zwei Reihen mit je zwei Fächern: Futter und Steine, darunter Schätze und Schlüssel.
    function renderPockets(view) {
      const scroll = pockets.querySelector('.bp-album')?.scrollTop ?? 0;
      clear(pockets);
      const rows = [el('div', { class: 'bp-row' }), el('div', { class: 'bp-row bp-row-big' })];
      view.pockets.forEach((p, i) => {
        const title = p.id === 'treasures'
          ? [t('bag.pocket.treasures'), ' ', el('span', { class: 'bp-album-count' }, t('bag.album', { n: p.found, max: p.total }))]
          : t(`bag.pocket.${p.id}`);
        const slots = p.items.length
          ? el('div', { class: p.id === 'treasures' ? 'bp-slots bp-album' : 'bp-slots' }, p.items.map(e => slot(p.id, e)))
          : el('p', { class: 'bp-note bp-empty' }, t('bag.noKeys'));
        const notes = p.id === 'stones'
          ? [el('p', { class: 'bp-note' }, t('bag.lifeStones', view.lifeStones)), view.shineActive ? el('p', { class: 'bp-note bp-shine' }, t('bag.shineActive')) : null]
          : [];
        rows[i < 2 ? 0 : 1].append(el('section', { class: `bp-pocket bp-${p.id}` }, el('h3', { class: 'bp-pocket-title' }, title), slots, notes));
      });
      pockets.append(...rows);
      const album = pockets.querySelector('.bp-album');
      if (album) album.scrollTop = scroll;
    }

    function action(entry) {
      if (entry.action === 'feed') {
        return el('button', { class: 'btn primary bp-act', type: 'button', disabled: entry.disabled, dataset: { focus: 'act' }, onclick: () => feed(entry.id) }, t('duel.feed'));
      }
      if (entry.action === 'shine') {
        return el('button', { class: 'btn primary bp-act', type: 'button', disabled: entry.disabled, dataset: { focus: 'act' }, onclick: () => shine() }, t('bag.use'));
      }
      if (entry.action === 'duel') return el('p', { class: 'bp-act bp-in-duel' }, t('bag.inDuel'));
      if (entry.action === 'befriend') return el('p', { class: 'bp-act bp-in-duel' }, t('bag.forFriends'));
      return null;
    }

    function renderCard(view) {
      clear(card);
      const entry = selected && view.pockets.find(p => p.id === selected.pocket)?.items.find(e => e.id === selected.id);
      if (!entry) {
        card.append(el('p', { class: 'bp-hint' }, t('bag.pick')));
        return;
      }
      // Fundort nur bei schon gefundenen Schätzen (seltene gibt es in 1.1 noch nirgends).
      const place = entry.kind === 'treasure' && entry.known ? mapOfArea(AREA_OF[entry.id]) : null;
      // appendAll: Schätze und Schlüssel haben keine Handlung (null fiele sonst als Text „null“ hinein).
      appendAll(card,
        picture(entry.id, !entry.known, 'bp-card-img'),
        el('div', { class: 'bp-card-text' },
          el('p', { class: 'bp-card-name' },
            entry.known ? itemName(entry) : t('bag.unknown'),
            entry.known && entry.kind !== 'key' ? el('span', { class: 'bp-card-count' }, `× ${entry.count}`) : null),
          entry.known ? el('p', {}, itemText(entry, game.state)) : null,
          place ? el('p', { class: 'bp-card-place' }, t('bag.foundIn', { place: areaName(place) })) : null,
          entry.wishers?.length ? el('p', { class: 'bp-card-wish' }, t('bag.wishedBy', { names: entry.wishers.join(', ') })) : null,
          message ? el('p', { class: 'bp-msg' }, message) : null),
        action(entry),
      );
    }

    // Neu zeichnen und dabei den Fokus und die Stelle im Album behalten.
    function render() {
      const view = backpackView(game.state);
      const focusKey = root.contains(document.activeElement) ? document.activeElement.dataset.focus : null;
      renderHead(view);
      renderPockets(view);
      renderCard(view);
      if (!focusKey) return;
      const again = root.querySelector(`[data-focus="${focusKey}"]:not([disabled])`) ?? root.querySelector('.bp-slot.selected');
      again?.focus({ preventScroll: true });
    }

    function pick(pocketId, id) {
      selected = { pocket: pocketId, id };
      message = '';
      render();
      // Untereinander (schmaler Bildschirm) kann die Karte unter dem Rand liegen.
      if (body.scrollHeight > body.clientHeight) card.scrollIntoView?.({ block: 'nearest' });
    }

    // Das Futter fliegt von der Karte zur Energieanzeige; erst dann füllt sich der Balken.
    function fly(id, from) {
      const to = energyBox.querySelector('.plate-bar')?.getBoundingClientRect();
      const img = picture(id, false, 'bp-fly');
      Object.assign(img.style, { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px` });
      root.append(img);
      const dx = to.left + to.width / 2 - (from.left + from.width / 2);
      const dy = to.top + to.height / 2 - (from.top + from.height / 2);
      img.animate?.([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 70}px) scale(0.8)`, opacity: 1, offset: 0.5 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.3)`, opacity: 0.4 },
      ], { duration: FLY_MS, easing: 'ease-in', fill: 'forwards' });
      timers.push(setTimeout(() => {
        img.remove();
        shownEnergy = null;
        renderHead(backpackView(game.state));
      }, FLY_MS));
    }

    function feed(id) {
      const s = game.state;
      const c = s.creature;
      const before = c.energy;
      const from = card.querySelector('.bp-card-img')?.getBoundingClientRect();
      const r = eat(s, id);
      message = r.ok ? t('bag.eats', { name: displayName(c), what: t(EATS[id]), n: r.gained }) : t('bag.notHungry', { name: displayName(c) });
      if (r.ok) {
        game.save();
        sound('confirm');
      }
      guard.reset(); // ein Doppeltipp füttert nicht zweimal
      const flies = r.ok && !still && !!from && !!energyBox.querySelector('.plate-bar');
      if (flies) shownEnergy = before;
      render();
      if (flies) fly(id, from);
    }

    function shine() {
      if (useShine(game.state)) {
        game.save();
        sound('confirm');
        message = t('bag.shineActive');
      }
      guard.reset();
      render();
    }

    // Pfeile und Steuerkreuz bewegen den Fokus zum nächsten Knopf in dieser Richtung.
    function moveFocus(dir) {
      const list = [...root.querySelectorAll('button:not([disabled])')].filter(n => n.offsetParent !== null);
      const cur = document.activeElement;
      if (!list.includes(cur)) {
        list[0]?.focus();
        return;
      }
      const a = cur.getBoundingClientRect();
      const ax = a.left + a.width / 2, ay = a.top + a.height / 2;
      let best = null, bestScore = Infinity;
      for (const n of list) {
        if (n === cur) continue;
        const b = n.getBoundingClientRect();
        const dx = b.left + b.width / 2 - ax, dy = b.top + b.height / 2 - ay;
        const along = { left: -dx, right: dx, up: -dy, down: dy }[dir];
        const across = dir === 'left' || dir === 'right' ? Math.abs(dy) : Math.abs(dx);
        if (along < 8) continue;
        const score = along + across * 2;
        if (score < bestScore) [best, bestScore] = [n, score];
      }
      best?.focus();
    }

    function close() {
      if (closed) return;
      closed = true;
      offs.forEach(off => off());
      timers.forEach(clearTimeout);
      sound('bagClose');
      // Der Fokus geht ans Spiel zurück, nicht auf den Rucksack-Knopf: Dort öffnete Enter ihn
      // sofort wieder, statt in der Welt als A zu wirken (wie beim Menü-Blatt).
      if (root.contains(document.activeElement)) document.activeElement.blur();
      game.mode = prevMode;
      game.input.consume();
      // Er rutscht weg (ohne Bewegung: ist sofort unsichtbar) und fängt dann unsichtbar noch Tipps ab,
      // bis die Doppeltipp-Zeit vorbei ist (FRESH_MS, länger als CLOSE_MS). So landet ein Doppeltipp
      // auf ✕ nicht auf dem Rucksack-Knopf darunter und öffnet ihn gleich wieder. Modus und Sperre der
      // Welt sind schon jetzt zurück; Tasten wirken sofort.
      root.classList.add('closing');
      setTimeout(() => root.remove(), Math.max(CLOSE_MS, FRESH_MS));
      resolve();
    }

    const offs = [
      game.input.on('b', close),
      game.input.on('bag', close),
      ...DIRS.map(d => game.input.on(d, () => moveFocus(d))),
    ];

    sound('bagOpen');
    render();
    if (!still) timers.push(setTimeout(() => root.classList.add('open'), OPEN_MS));
    if (!isTouch()) root.querySelector('.bp-slot')?.focus({ preventScroll: true });
  });
}
