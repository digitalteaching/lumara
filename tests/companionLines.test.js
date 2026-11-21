import { test } from 'node:test';
import assert from 'node:assert/strict';
import { companionLine } from '../js/scenes/companion.js';
import { FRIENDABLE, GIFTS, giftOf, makeFriend } from '../js/friends/friends.js';
import { HIDEOUTS } from '../js/data/hideouts.js';
import { hideoutKey } from '../js/world/hideouts.js';
import { CONFIG } from '../js/config.js';
import { setLanguage, t, tl } from '../js/i18n/i18n.js';
import { DE } from '../js/i18n/de.js';
import { EN } from '../js/i18n/en.js';
import { FR } from '../js/i18n/fr.js';
import { ES } from '../js/i18n/es.js';

const OPENING = GIFTS.filter(g => g !== 'sniff');
const friendWith = gift => FRIENDABLE.find(id => giftOf(id) === gift);
const byId = id => HIDEOUTS.find(h => h.id === id);

function withCompanion(gift) {
  const state = { friends: {}, companion: null, playMs: 50000, world: { hideouts: {} } };
  const id = friendWith(gift);
  makeFriend(state, id, false);
  state.companion = id;
  return state;
}
const emptyAll = state => {
  for (const h of HIDEOUTS) state.world.hideouts[hideoutKey(h)] = state.playMs + 1;
};

test.afterEach(() => setLanguage('de'));

test('Neben einem bereiten Versteck seiner Gabe sagt der Begleiter seinen Satz companion.near', () => {
  for (const gift of OPENING) {
    const h = HIDEOUTS.find(x => x.gift === gift);
    const state = withCompanion(gift);
    for (const i of [0, 1, 2]) assert.equal(companionLine(state, h.map, h.x, h.y + 1, i), t(`companion.near.${gift}`), gift);
  }
});

test('Sonst wechseln die beiden allgemeinen Sätze der Gabe ab', () => {
  for (const gift of GIFTS) {
    const state = withCompanion(gift);
    const [a, b] = tl(`companion.${gift}`);
    assert.deepEqual([0, 1, 2, 3].map(i => companionLine(state, 'garten', 5, 5, i)), [a, b, a, b], gift);
  }
});

test('Ein leeres Versteck zählt nicht, eins mit anderer Gabe auch nicht', () => {
  const h = byId('see-icehole'); // Tauchen
  const diver = withCompanion('dive');
  emptyAll(diver);
  assert.equal(companionLine(diver, h.map, h.x, h.y - 1, 0), tl('companion.dive')[0]);
  diver.playMs += 1; // wieder voll
  assert.equal(companionLine(diver, h.map, h.x, h.y - 1, 0), t('companion.near.dive'));
  // Ein Kletterer am Eisloch: Das nächste Kletterversteck auf der Karte ist weit weg.
  const climber = withCompanion('climb');
  assert.equal(companionLine(climber, h.map, h.x, h.y - 1, 1), tl('companion.climb')[1]);
});

test('Höchstens nearRadius Felder, nur auf derselben Karte', () => {
  const h = byId('bucht-bottle'); // Strandgut bei (6,23)
  const state = withCompanion('beachcomb');
  const r = CONFIG.hideouts.nearRadius;
  assert.equal(companionLine(state, 'bucht', h.x + r, h.y, 0), t('companion.near.beachcomb'));
  assert.equal(companionLine(state, 'bucht', h.x + r + 1, h.y, 0), tl('companion.beachcomb')[0]);
  assert.equal(companionLine(state, 'wald', h.x, h.y, 0), tl('companion.beachcomb')[0]);
});

test('Die Spürnase riecht jedes bereite Versteck in der Nähe, egal welche Gabe es braucht', () => {
  const h = byId('ruinen-crate');
  const state = withCompanion('sniff');
  assert.equal(companionLine(state, h.map, h.x, h.y + 1, 0), t('companion.near.sniff'));
  emptyAll(state);
  assert.equal(companionLine(state, h.map, h.x, h.y + 1, 0), tl('companion.sniff')[0]);
});

test('Satz in der Nähe: einer je Gabe, kurz, in jeder Sprache', () => {
  for (const [lang, table] of Object.entries({ de: DE, en: EN, fr: FR, es: ES })) {
    for (const gift of GIFTS) {
      const line = table[`companion.near.${gift}`];
      assert.equal(typeof line, 'string', `${lang}: companion.near.${gift}`);
      assert.ok(line.trim() && line.length <= 60, `${lang}: ${line} (${line.length} Zeichen)`);
    }
  }
});

// Die allgemeinen Sätze kommen überall, auch weit weg von jedem Versteck: Sie versprechen nichts.
test('Die allgemeinen Sätze versprechen keinen Fund und kein Graben', () => {
  const PROMISE = {
    de: /graben\?|hier ist etwas versteckt|ich rieche wasser/i,
    en: /shall we dig|something is hidden here|i can smell water/i,
    fr: /on creuse|quelque chose est caché ici|je sens l’eau/i,
    es: /¿cavamos|aquí hay algo escondido|huelo agua/i,
  };
  for (const [lang, table] of Object.entries({ de: DE, en: EN, fr: FR, es: ES })) {
    for (const gift of GIFTS) for (const line of table[`companion.${gift}`]) assert.ok(!PROMISE[lang].test(line), `${lang}: ${line}`);
  }
});

test('In einer anderen Sprache kommt der Satz aus deren Tabelle', () => {
  setLanguage('en');
  const h = HIDEOUTS.find(x => x.gift === 'dive');
  assert.equal(companionLine(withCompanion('dive'), h.map, h.x, h.y + 1, 0), EN['companion.near.dive']);
});
