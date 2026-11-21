import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGameState } from '../js/state.js';
import { FRIENDABLE, GIFTS, giftOf, befriendOffer, makeFriend, setCompanion, friendList, giftName, giftText } from '../js/friends/friends.js';
import { BOOK_SLOTS } from '../js/data/book.js';
import { setLanguage, LANGUAGES } from '../js/i18n/i18n.js';

const s0 = () => newGameState({ name: 'Test', species: 'funki' });
const wild = (species, shiny = false) => ({ kind: 'wild', foe: { species, shiny } });

test('32 befreundbare Arten: wilde, geheime Orte, Höhle; nie Startwesen oder Morrow', () => {
  assert.equal(FRIENDABLE.length, 32);
  for (const id of ['gischtling', 'wurzelgeist', 'echomaus']) assert.ok(FRIENDABLE.includes(id), id);
  assert.ok(!FRIENDABLE.includes('funki'));
  assert.ok(!FRIENDABLE.includes('morrow'));
});

test('Gaben: eine je Gebiet, Spürnase für die Höhle', () => {
  assert.equal(giftOf('gischtling'), 'beachcomb');
  assert.equal(giftOf('perlkrabbe'), 'beachcomb');
  assert.equal(giftOf('wurzelgeist'), 'climb');
  assert.equal(giftOf('kristallotter'), 'dive');
  assert.equal(giftOf('sternhirsch'), 'startrail');
  assert.equal(giftOf('kristallraupe'), 'sniff');
  assert.equal(giftOf('funki'), null);
});

test('Angebot: nur nach Sieg über ein wildes Wesen, jede Art einmal, Glanzform wertet auf', () => {
  const s = s0();
  assert.deepEqual(befriendOffer(s, wild('moosling'), 'won'), { species: 'moosling', shiny: false, upgrade: false });
  assert.equal(befriendOffer(s, wild('moosling'), 'fled'), null);
  assert.equal(befriendOffer(s, { kind: 'trainer', foe: { species: 'haeuschel' } }, 'won'), null);
  makeFriend(s, 'moosling', false);
  assert.equal(befriendOffer(s, wild('moosling'), 'won'), null);
  assert.deepEqual(befriendOffer(s, wild('moosling', true), 'won'), { species: 'moosling', shiny: true, upgrade: true });
});

test('Abgebrochen heißt nicht befreundet: Das Angebot kommt wieder', () => {
  const s = s0();
  const a = befriendOffer(s, wild('moosling'), 'won');
  assert.deepEqual(befriendOffer(s, wild('moosling'), 'won'), a);
  assert.equal(s.friends, undefined);
});

test('Glanz eines Begleiters: Er bleibt Begleiter und glänzt', () => {
  const s = s0();
  makeFriend(s, 'moosling', false);
  setCompanion(s, 'moosling');
  assert.deepEqual(makeFriend(s, 'moosling', true), { upgrade: true });
  assert.equal(s.companion, 'moosling');
  assert.equal(s.friends.moosling.shiny, true);
});

test('Begleiter: nur Freunde, Doppeltipp ändert nichts', () => {
  const s = s0();
  assert.equal(setCompanion(s, 'gischtling'), false);
  assert.equal(setCompanion(s, null), false);
  assert.deepEqual(makeFriend(s, 'gischtling', false), { upgrade: false });
  assert.equal(setCompanion(s, 'gischtling'), true);
  assert.equal(setCompanion(s, 'gischtling'), false);
  assert.equal(setCompanion(s, null), true);
  assert.equal(setCompanion(s, null), false);
});

test('Freundesliste in Buchreihenfolge mit Gabe und Begleiter', () => {
  const s = s0();
  makeFriend(s, 'wurzelgeist', false);
  makeFriend(s, 'gischtling', true);
  setCompanion(s, 'wurzelgeist');
  const list = friendList(s);
  assert.deepEqual(list, [
    { species: 'gischtling', shiny: true, gift: 'beachcomb', companion: false },
    { species: 'wurzelgeist', shiny: false, gift: 'climb', companion: true },
  ]);
  assert.ok(BOOK_SLOTS.indexOf('gischtling') < BOOK_SLOTS.indexOf('wurzelgeist'));
});

test('Namen der Gaben in jeder Sprache', () => {
  try {
    for (const lang of LANGUAGES) {
      setLanguage(lang);
      for (const g of GIFTS) {
        for (const v of [giftName(g), giftText(g)]) assert.ok(v && !v.includes('Text fehlt'), `${lang} ${g}`);
      }
    }
  } finally {
    setLanguage('de');
  }
});
