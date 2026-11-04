import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GEZEITEN } from '../js/world/maps/gezeiten.js';
import { IRRLICHT } from '../js/world/maps/irrlicht.js';
import { MAPS } from '../js/world/network.js';
import { createMap, reachable, cellKey } from '../js/world/map.js';
import { CREATURE_ART } from '../js/gfx/art/creatures.js';
import { PROPS } from '../js/gfx/art/tiles.js';
import { SPECIES, SECRET_SPECIES } from '../js/data/species.js';
import { EN_SPECIES } from '../js/i18n/en-species.js';
import { EN_WORLD } from '../js/i18n/en-world.js';
import { BOOK_SLOTS } from '../js/data/book.js';
import { secretOpen } from '../js/world/secrets.js';
import { giveKey } from '../js/items/keys.js';
import { newGameState } from '../js/state.js';

// [Karte, Ort, Gebiet, Art, Buchplatz, Ufer-Karte, Eingang (x, y), Stehplatz (x, y)]
const ISLANDS = [
  [GEZEITEN, 'gezeiten', 1, 'perlkrabbe', 27, 'bucht', [19, 28], [19, 27]],
  [IRRLICHT, 'irrlicht', 3, 'irrlichtfee', 28, 'moor', [7, 15], [7, 16]],
];

test('Beide Inseln: alles vom Steg erreichbar, Geschichtsstein, Stein, hohes Gras und Rückweg ans Ufer', () => {
  for (const [def, place, area, species, , shore, , [sx, sy]] of ISLANDS) {
    assert.equal(MAPS[place], def);
    assert.deepEqual([def.area, def.secret, !!def.dark], [area, place, false]);
    const map = createMap(def);
    const seen = reachable(map, def.spawn);
    const nextTo = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has(cellKey(x + dx, y + dy)));
    const stone = def.objects.find(o => o.type === 'storystone');
    assert.ok(stone && stone.place === place && nextTo(stone.x, stone.y), `${place}: Geschichtsstein`);
    assert.ok(seen.has(cellKey(def.secretStone.x, def.secretStone.y)), `${place}: Stein`);
    assert.equal(def.secretStone.place, place);
    assert.ok([...seen].some(k => { const [x, y] = k.split(',').map(Number); return map.isTallGrass(x, y); }), `${place}: hohes Gras`);
    assert.deepEqual(def.wild, { common: [species], rare: species });
    const exit = def.exits[0];
    assert.ok(seen.has(cellKey(exit.x, exit.y)), `${place}: Ausgang`);
    assert.deepEqual([exit.to, exit.at.x, exit.at.y], [shore, sx, sy]);
    assert.equal(def.rows.length, 12);
    for (const r of def.rows) assert.equal(r.length, 18, place);
  }
  assert.ok(IRRLICHT.particles.includes('wisp'));
});

test('Am Ufer ein Pfahl mit Seil: mit der Nussschale zu beiden Inseln, Stehplatz frei, Texte auf Englisch', () => {
  const s = newGameState({ name: 'A', species: 'nixi', nickname: null });
  for (const [def, place, , , , shore, [ex, ey], [sx, sy]] of ISLANDS) {
    const post = MAPS[shore].objects.find(o => o.type === 'secret' && o.place === place);
    assert.deepEqual([post.x, post.y, post.prop], [ex, ey, 'boatpost'], place);
    assert.equal(MAPS[shore].objects.filter(o => o.x === ex && o.y === ey).length, 1, `${place}: Feld nur für den Pfahl`);
    assert.ok(createMap(MAPS[shore]).canEnter(sx, sy), `${place}: Stehplatz`);
    assert.deepEqual([post.to.map, post.to.x, post.to.y], [place, def.spawn.x, def.spawn.y]);
    assert.ok(post.lines.length && post.linesOpen.length);
    const en = EN_WORLD.objects[shore][post.id];
    assert.deepEqual([en.lines.length, en.linesOpen.length], [post.lines.length, post.linesOpen.length]);
    assert.ok(EN_WORLD.areas[place]?.name, place);
    assert.equal(secretOpen(s, post), false);
  }
  giveKey(s, 'nutshell');
  for (const [, place, , , , shore] of ISLANDS) assert.equal(secretOpen(s, MAPS[shore].objects.find(o => o.place === place)), true);
  assert.equal(PROPS.boatpost.length, 16);
});

test('Perlkrabbe und Irrlichtfee: Buchplätze 27 und 28, Bild 32 × 32 mit eigener Silhouette, Texte auf Englisch', () => {
  assert.deepEqual(SECRET_SPECIES.slice(2, 4), ['perlkrabbe', 'irrlichtfee']);
  const shape = r => r.map(x => x.replace(/[^.]/g, '#')).join('/');
  for (const [, place, area, species, slot] of ISLANDS) {
    assert.equal(BOOK_SLOTS[slot - 1], species);
    assert.deepEqual([SPECIES[species].kind, SPECIES[species].area], ['secret', area], place);
    assert.ok(EN_SPECIES[species]?.names?.[0] && EN_SPECIES[species].description);
    const rows = CREATURE_ART[species][1];
    assert.equal(rows.length, 32);
    for (const [id, stages] of Object.entries(CREATURE_ART)) if (id !== species) assert.notEqual(shape(stages[1]), shape(rows), `${species} wie ${id}`);
  }
});
