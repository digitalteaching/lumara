// Freunde (Lumara 1.2): wer sich befreunden lässt, welche Gabe er hat, Begleiter. DOM-frei.
// Man befreundet Wesen, man fängt sie nicht. IDs sind englisch, Texte stehen in i18n/.

import { SPECIES } from '../data/species.js';
import { BOOK_SLOTS } from '../data/book.js';
import { t } from '../i18n/i18n.js';

export const FRIEND_KINDS = new Set(['wild', 'secret', 'cave', 'hidden']);
export const FRIENDABLE = BOOK_SLOTS.filter(id => id && FRIEND_KINDS.has(SPECIES[id].kind));
export const GIFTS = ['beachcomb', 'climb', 'glow', 'clearsight', 'updraft', 'tinker', 'dive', 'startrail', 'sniff'];
export const WATER_FRIENDS = new Set(['gischtling', 'haeuschel', 'glimmqualle', 'nebelunke', 'frostrobbe', 'perlkrabbe', 'kristallotter', 'flaschling', 'eisflosse']);

export function giftOf(speciesId) {
  if (!FRIENDABLE.includes(speciesId)) return null;
  const sp = SPECIES[speciesId];
  return sp.kind === 'cave' ? 'sniff' : GIFTS[sp.area - 1];
}

export const isFriend = (state, id) => !!state.friends?.[id];

// Der Begleiter aus dem Spielstand, wenn er ein Freund mit Gabe ist, sonst null. Ein alter oder
// kaputter Spielstand kann einen nennen, der kein Freund ist: Der läuft nicht mit und öffnet nichts.
export function companionOf(state) {
  const id = state?.companion ?? null;
  return id && isFriend(state, id) && giftOf(id) ? id : null;
}

// Die Gabe des Begleiters (companionOf), sonst null.
export const companionGift = state => giftOf(companionOf(state));

export function friendList(state) {
  return FRIENDABLE.filter(id => isFriend(state, id)).map(id => ({
    species: id,
    shiny: !!state.friends[id].shiny,
    gift: giftOf(id),
    companion: state.companion === id,
  }));
}

export function befriendOffer(state, setup, outcome) {
  if (outcome !== 'won' || setup?.kind !== 'wild') return null;
  const species = setup.foe?.species;
  if (!FRIENDABLE.includes(species)) return null;
  const shiny = !!setup.foe.shiny;
  if (!isFriend(state, species)) return { species, shiny, upgrade: false };
  if (!state.friends[species].shiny && shiny) return { species, shiny, upgrade: true };
  return null;
}

export function makeFriend(state, species, shiny) {
  if (!state.friends) state.friends = {};
  const old = state.friends[species];
  state.friends[species] = { shiny: !!(old?.shiny || shiny) };
  return { upgrade: !!old };
}

export function setCompanion(state, species) {
  const before = state.companion ?? null;
  if (species === null) {
    if (before === null) return false;
    state.companion = null;
    return true;
  }
  if (!isFriend(state, species) || before === species) return false;
  state.companion = species;
  return true;
}

export const giftName = gift => t(`gift.${gift}.name`);
export const giftText = gift => t(`gift.${gift}.text`);
