import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GIFT_ART, HIDEOUT_ART } from '../js/gfx/art/gifts.js';
import { parseSprite } from '../js/gfx/sprites.js';
import { GIFTS } from '../js/friends/friends.js';
import { HIDEOUTS } from '../js/data/hideouts.js';

const OPENING = GIFTS.filter(g => g !== 'sniff');
const size = (name, lines) => {
  const s = parseSprite(name, lines);
  return [s.w, s.h];
};
const shape = lines => lines.map(r => r.replace(/[^.]/g, '#')).join('/');

test('Jede der neun Gaben hat ein Zeichen in 8 × 8', () => {
  assert.deepEqual(Object.keys(GIFT_ART).sort(), [...GIFTS].sort());
  for (const gift of GIFTS) assert.deepEqual(size(`gift:${gift}`, GIFT_ART[gift]), [8, 8], gift);
});

test('Jede der acht öffnenden Gaben hat ein Versteckbild in 16 × 16, die Spürnase keins', () => {
  assert.deepEqual(Object.keys(HIDEOUT_ART).sort(), [...OPENING].sort());
  for (const gift of OPENING) assert.deepEqual(size(`hideout:${gift}`, HIDEOUT_ART[gift]), [16, 16], gift);
  for (const h of HIDEOUTS) assert.ok(HIDEOUT_ART[h.gift], h.id);
});

// Mehrere Gaben teilen sich Kachelarten (Wolken, Düne, Wasser, Fels): Man muss die Bilder
// auseinanderhalten können, schon am Umriss.
test('Versteckbilder und Gabenzeichen haben je einen eigenen Umriss', () => {
  for (const art of [HIDEOUT_ART, GIFT_ART]) {
    const ids = Object.keys(art);
    for (const a of ids) for (const b of ids) if (a < b) assert.notEqual(shape(art[a]), shape(art[b]), `${a} wie ${b}`);
  }
});

// Das Aufwind-Zeichen liegt auf Wolken, Klippen und Felsnadeln (auch dunkle Nachtklippen). Mit nur
// weißen Strichen verschwände es auf den weißen Wolken: Es braucht helle und dunkle Pixel.
test('Aufwind-Versteck: helle und dunkle Striche, damit es auf Wolken und Fels sichtbar bleibt', () => {
  const px = HIDEOUT_ART.updraft.join('');
  const count = ch => [...px].filter(c => c === ch).length;
  assert.ok(count('w') >= 8, 'helle Oberkanten');
  assert.ok(count('d') >= 8, 'dunkle Schatten');
});
