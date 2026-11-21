import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGameState } from '../js/state.js';
import { createRng } from '../js/core/rng.js';
import { WISH_GIVER_IDS } from '../js/world/events.js';
import { WISH_GIVERS, ensureWishes, pickWishTreasure, wishOf, wishersOf, canGive, giveWish, wishHint } from '../js/world/wishes.js';
import { MAPS, mapOfArea, areaAt } from '../js/world/network.js';
import { TREASURES, AREA_TREASURES, addTreasure } from '../js/items/treasures.js';
import { setLanguage, t } from '../js/i18n/i18n.js';
import { treasureName } from '../js/items/treasures.js';
import { CONFIG } from '../js/config.js';

const pack = n => ({ trainers: Array.from({ length: n }, (_, i) => ({ number: i + 1 })) });
const st = (stones = []) => ({ ...newGameState({ name: 'A', species: 'nixi', nickname: null }), stones });
const TODAY = '2026-11-22';
const areaAtOf = id => areaAt(mapOfArea(area(id)));
const area = id => TREASURES.find(x => x.id === id).area;

test('Acht Bewohner, keiner gibt einen Auftrag, gleiche IDs wie in der Reparatur', () => {
  assert.deepEqual(Object.values(WISH_GIVERS).map(g => g.npc), WISH_GIVER_IDS);
  const questGivers = ['bram', 'fenna', 'jasper', 'samir', 'tamo', 'pino', 'sven', 'selma'];
  for (const [area, g] of Object.entries(WISH_GIVERS)) {
    const def = MAPS[g.map];
    assert.equal(def.area, Number(area));
    const o = def.objects.find(x => x.id === g.npc);
    assert.ok(o && o.type === 'npc', g.npc);
    assert.ok(!questGivers.includes(g.npc));
    assert.ok(!def.objects.some(x => x.id === g.npc && x.quest));
  }
});

test('Wünsche nur in offenen Gebieten, bevorzugt Schätze aus anderen Gebieten', () => {
  const s = st([1, 2]);
  const news = ensureWishes(s, pack(3), TODAY, createRng(1));
  assert.deepEqual(news, ['pim', 'lio', 'nele']);
  assert.equal(wishOf(s, 'ina'), null);
  assert.equal(wishOf(s, 'pim').done, false);
  assert.equal(wishOf(s, 'pim').day, TODAY);
  assert.deepEqual(ensureWishes(s, pack(3), TODAY, createRng(2)), []);
  let other = 0, own = 0;
  for (let i = 0; i < 400; i++) {
    const id = pickWishTreasure(st([1, 2, 3]), pack(4), 1, createRng(i));
    if (area(id) === 1) own++; else other++;
    assert.ok(area(id) <= 4);
  }
  assert.ok(other > own * 2, `${other} vs ${own}`);
  // selten kommt vor, aber selten
  let rare = 0;
  for (let i = 0; i < 600; i++) {
    const id = pickWishTreasure(st([1, 2]), pack(3), 1, createRng(i + 1000));
    if (TREASURES.find(x => x.id === id).rarity === 'rare') rare++;
  }
  assert.ok(rare > 0 && rare < 100, String(rare));
});

test('Nein oder ohne Schatz: nichts ändert sich', () => {
  const s = st();
  ensureWishes(s, pack(1), TODAY, createRng(3));
  const before = JSON.stringify(s);
  assert.equal(canGive(s, 'pim'), false);
  assert.equal(giveWish(s, 'pim', createRng(1)), null);
  assert.equal(giveWish(s, 'lio', createRng(1)), null);
  assert.equal(JSON.stringify(s), before);
});

test('Ja: Schatz weg, Album bleibt, eine Belohnung, Wunsch erfüllt, Ereignis wish', () => {
  const s = st();
  ensureWishes(s, pack(1), TODAY, createRng(3));
  const id = wishOf(s, 'pim').treasure;
  addTreasure(s, id);
  assert.deepEqual(wishersOf(s, id), ['pim']);
  assert.equal(canGive(s, 'pim'), true);
  const events = s.events.length;
  const r = giveWish(s, 'pim', createRng(4));
  assert.ok(['starfruit', 'stone', 'treats', 'xp'].includes(r.reward));
  assert.equal(r.levelBefore, 1);
  assert.equal(s.treasures[id], 0);
  assert.ok(s.album.includes(id));
  assert.equal(wishOf(s, 'pim').done, true);
  assert.equal(s.events.at(-1).type, 'wish');
  assert.equal(s.events.length, events + 1);
  assert.deepEqual(wishersOf(s, id), []);
  assert.equal(canGive(s, 'pim'), false);
});

test('Jede Belohnung wirkt', () => {
  const run = (reward, check) => {
    const s = st();
    s.wishes = { pim: { treasure: 'amber', day: TODAY, done: false } };
    addTreasure(s, 'amber');
    const w = CONFIG.wishes.rewards;
    const order = Object.keys(w);
    const x = order.slice(0, order.indexOf(reward)).reduce((a, k) => a + w[k], 0) + 0.01;
    const total = order.reduce((a, k) => a + w[k], 0);
    const r = giveWish(s, 'pim', { ...createRng(1), weighted: (items, fn) => items[order.indexOf(reward)], next: () => x / total, pick: a => a[0] });
    assert.equal(r.reward, reward);
    check(s, r);
  };
  run('starfruit', (s, r) => { assert.equal(s.bag.starfruit, 1); assert.equal(r.item, 'starfruit'); });
  run('stone', (s, r) => { assert.ok(['farsight', 'shine'].includes(r.item)); assert.equal(s.bag[r.item], 1); assert.equal(s.creature.lifeStones, 0); });
  run('treats', (s, r) => { assert.equal(s.bag.treat, CONFIG.wishes.treats); assert.equal(r.item, 'treat'); });
  run('xp', (s, r) => { assert.equal(r.xp, CONFIG.wishes.xp); assert.ok(s.creature.level > 1 || s.creature.xpInLevel > 0); });
});

test('Nächster Wunsch erst am nächsten Kalendertag', () => {
  const s = st();
  ensureWishes(s, pack(1), TODAY, createRng(3));
  addTreasure(s, wishOf(s, 'pim').treasure);
  giveWish(s, 'pim', createRng(4));
  assert.deepEqual(ensureWishes(s, pack(1), TODAY, createRng(5)), []);
  assert.equal(wishOf(s, 'pim').done, true);
  assert.deepEqual(ensureWishes(s, pack(1), '2026-11-23', createRng(5)), ['pim']);
  assert.equal(wishOf(s, 'pim').done, false);
  assert.equal(wishOf(s, 'pim').day, '2026-11-23');
  // ein offener Wunsch bleibt, auch Tage später
  assert.deepEqual(ensureWishes(s, pack(1), '2026-12-30', createRng(6)), []);
});

test('Sternfrucht bei vollem Futter wird ein Stein', () => {
  const s = st();
  s.bag.berry = 99;
  s.wishes = { pim: { treasure: 'amber', day: TODAY, done: false } };
  addTreasure(s, 'amber');
  const r = giveWish(s, 'pim', { ...createRng(1), weighted: items => items[0], pick: a => a[0] });
  assert.equal(r.reward, 'stone');
  assert.ok(['farsight', 'shine'].includes(r.item));
  assert.equal(s.bag.starfruit, 0);
});

test('Zwei Bewohner wünschen sich nicht denselben Schatz, solange es anders geht', () => {
  for (let seed = 0; seed < 200; seed++) {
    const s = st([1, 2, 3, 4, 5, 6, 7]);
    ensureWishes(s, pack(8), TODAY, createRng(seed));
    const ids = Object.values(s.wishes).map(w => w.treasure);
    assert.equal(new Set(ids).size, ids.length, `seed ${seed}`);
  }
});

test('Texte in jeder Sprache', () => {
  const bareFr = x => /[^\s  ][:;?!]/.test(x);
  for (const lang of ['de', 'en', 'fr', 'es']) {
    setLanguage(lang);
    for (const npc of WISH_GIVER_IDS) {
      const x = t(`wish.${npc}.own`);
      assert.ok(x && !/[{}]/.test(x), `${lang} ${npc}`);
      if (lang === 'fr') assert.ok(!bareFr(x), x);
    }
    for (const r of ['starfruit', 'stone', 'treats', 'xp']) assert.ok(!/[{}]/.test(t(`wish.thanks.${r}`)), r);
    assert.ok(t('wish.nextDay') && !/[{}]/.test(t('wish.nextDay')));
    for (const tr of TREASURES) {
      const name = treasureName(tr.id);
      const withName = ['wish.want', 'wish.ask', 'wish.give', 'wish.waiting'].map(k => t(k, { treasure: name }));
      const texts = [...withName, wishHint(tr.id)];
      for (const x of texts) {
        assert.ok(!/[{}]/.test(x) && !/undefined|Text fehlt/.test(x), `${lang} ${tr.id}: ${x}`);
        if (lang === 'es') {
          assert.equal((x.match(/¿/g) ?? []).length, (x.match(/\?/g) ?? []).length, x);
          assert.equal((x.match(/¡/g) ?? []).length, (x.match(/!/g) ?? []).length, x);
        }
      }
      for (const x of withName) assert.ok(x.includes(name), x);
      if (lang === 'fr') for (const x of texts) assert.ok(!bareFr(x.split(name).join('X')), x);
      // Der Hinweis nennt das Gebiet des Schatzes
      assert.ok(wishHint(tr.id).includes(areaAtOf(tr.id)), wishHint(tr.id));
      // Deutsch: der Schatz steht nur hinter einem Doppelpunkt oder in Klammern, nie nach „mir“ oder „dir“
      if (lang === 'de') for (const x of withName) assert.ok(!/\b(mir|dir|uns)\s+\S*\s*$/.test(x.split(name)[0].trim() + ' ') || /[:(]\s*$/.test(x.split(name)[0]), x);
      if (lang === 'de') for (const x of withName) assert.ok(/(:|\()\s*$/.test(x.split(name)[0]) || x.split(name)[0].endsWith('– '), x);
    }
  }
  setLanguage('de');
});
