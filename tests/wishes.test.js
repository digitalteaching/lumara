import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGameState } from '../js/state.js';
import { createRng } from '../js/core/rng.js';
import { WISH_GIVER_IDS } from '../js/world/events.js';
import { WISH_GIVERS, ensureWishes, pickWishTreasure, wishOf, wishersOf, canGive, giveWish, wishHint, wishReachable } from '../js/world/wishes.js';
import { feasibleKinds } from '../js/world/board.js';
import { solveTask } from '../js/world/tasks.js';
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
  giveWish(s, 'pim', createRng(4), TODAY);
  assert.deepEqual(ensureWishes(s, pack(1), TODAY, createRng(5)), []);
  assert.equal(wishOf(s, 'pim').done, true);
  assert.deepEqual(ensureWishes(s, pack(1), '2026-11-23', createRng(5)), ['pim']);
  assert.equal(wishOf(s, 'pim').done, false);
  assert.equal(wishOf(s, 'pim').day, '2026-11-23');
  // ein offener Wunsch bleibt, auch Tage später
  assert.deepEqual(ensureWishes(s, pack(1), '2026-12-30', createRng(6)), []);
});

// „Komm morgen wieder!“ stimmt auch, wenn der Wunsch schon Tage offen war: Es zählt der Tag des Tauschs.
test('Nach dem Tausch kommt der nächste Wunsch erst am Tag danach, auch bei einem alten Wunsch', () => {
  const s = st();
  ensureWishes(s, pack(1), '2026-11-20', createRng(3));
  assert.equal(wishOf(s, 'pim').day, '2026-11-20');
  addTreasure(s, wishOf(s, 'pim').treasure);
  giveWish(s, 'pim', createRng(4), '2026-11-22');
  assert.equal(wishOf(s, 'pim').day, '2026-11-22', 'der Tag des Tauschs');
  assert.deepEqual(ensureWishes(s, pack(1), '2026-11-22', createRng(5)), []);
  assert.equal(wishOf(s, 'pim').done, true);
  assert.deepEqual(ensureWishes(s, pack(1), '2026-11-23', createRng(5)), ['pim']);
  assert.equal(wishOf(s, 'pim').done, false);
});

// Seltene Schätze: die Spielaufgabe des Gebiets bringt ihn sicher. Nach dem Lösen gäbe es ihn nur noch
// selten in Verstecken, darum wünscht ihn sich dann keiner mehr, es sei denn, das Kind hat ihn schon.
test('Ein seltener Schatz nur, solange die Spielaufgabe seines Gebiets offen ist oder das Kind ihn hat', () => {
  const picks = s => new Set(Array.from({ length: 400 }, (_, i) => pickWishTreasure(s, pack(1), 1, createRng(i))));
  const s = st();
  assert.ok(picks(s).has('amber'), 'Aufgabe offen: kommt vor');
  solveTask(s, 1); // bringt den Bernstein
  assert.equal(s.treasures.amber, 1);
  assert.ok(picks(s).has('amber'), 'gelöst, aber im Rucksack: kommt vor');
  s.treasures.amber = 0; // etwa einem anderen Bewohner gegeben
  assert.deepEqual([...picks(s)].sort(), [...AREA_TREASURES[1].common].sort(), 'gelöst und weg: nie');
  // mehrere Gebiete: nur die seltenen der Gebiete mit offener Aufgabe
  const m = st([1, 2, 3]);
  m.tasks = [1, 3];
  const many = new Set(Array.from({ length: 2000 }, (_, i) => pickWishTreasure(m, pack(4), 2, createRng(i))));
  const rares = [...many].filter(id => TREASURES.find(x => x.id === id).rarity === 'rare');
  assert.deepEqual(rares.sort(), [AREA_TREASURES[2].rare, AREA_TREASURES[4].rare].sort());
});

test('Jeder neue Wunsch ist erfüllbar, und der Hinweis stimmt', () => {
  for (let seed = 0; seed < 300; seed++) {
    const r = createRng(seed);
    const s = st([1, 2, 3, 4, 5, 6, 7]);
    s.tasks = [1, 2, 3, 4, 5, 6, 7, 8].filter(() => r.next() < 0.5);
    for (const a of s.tasks) if (r.next() < 0.3) addTreasure(s, AREA_TREASURES[a].rare);
    ensureWishes(s, pack(8), TODAY, r);
    for (const [npc, w] of Object.entries(s.wishes)) {
      const tr = TREASURES.find(x => x.id === w.treasure);
      assert.ok(wishReachable(s, pack(8), npc), `seed ${seed} ${npc} ${w.treasure}`);
      if (tr.rarity === 'rare') {
        assert.ok(!s.tasks.includes(tr.area) || s.treasures[tr.id] > 0, `seed ${seed} ${w.treasure}`);
        assert.equal(wishHint(w.treasure), t('wish.hint.rare', { area: areaAtOf(w.treasure) }));
      }
    }
    assert.ok(feasibleKinds(s, pack(8)).includes('wish'));
  }
});

test('Erfüllbar: nicht erfüllt, Bewohner und Schatz in offenen Gebieten, selten nur mit offener Aufgabe oder im Rucksack', () => {
  const s = st();
  assert.equal(wishReachable(s, pack(1), 'pim'), false, 'kein Wunsch');
  s.wishes = { pim: { treasure: 'glassshell', day: TODAY, done: false } };
  assert.equal(wishReachable(s, pack(1), 'pim'), true);
  s.wishes.pim.done = true;
  assert.equal(wishReachable(s, pack(1), 'pim'), false, 'schon erfüllt');
  s.wishes = { pim: { treasure: 'acorncap', day: TODAY, done: false } };
  assert.equal(wishReachable(s, pack(1), 'pim'), false, 'der Wald ist zu');
  addTreasure(s, 'acorncap');
  assert.equal(wishReachable(s, pack(1), 'pim'), true, 'aber im Rucksack');
  s.wishes = { lio: { treasure: 'glassshell', day: TODAY, done: false } };
  assert.equal(wishReachable(s, pack(1), 'lio'), false, 'Lio wohnt im Wald, der ist zu');
  s.wishes = { pim: { treasure: 'amber', day: TODAY, done: false } };
  assert.equal(wishReachable(s, pack(1), 'pim'), true, 'die Spielaufgabe der Bucht ist offen');
  s.tasks = [1];
  assert.equal(wishReachable(s, pack(1), 'pim'), false, 'gelöst und nicht im Rucksack');
  addTreasure(s, 'amber');
  assert.equal(wishReachable(s, pack(1), 'pim'), true);
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
    // Der Dank nennt die Zahl der Leckerli (CONFIG.wishes.treats) und das Wort des Spiels dafür.
    assert.equal(CONFIG.wishes.treats, 2);
    const two = { de: 'zwei', en: 'two', fr: 'deux', es: 'dos' }[lang];
    assert.ok(t('wish.thanks.treats').toLowerCase().includes(`${two} ${t('item.treat.name').toLowerCase().slice(0, 7)}`), t('wish.thanks.treats'));
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

// Die Frage nennt den Schatz hinter einem Doppelpunkt, nie in Klammern (alle vier Sprachen).
test('wish.ask: der Schatz hinter einem Doppelpunkt, ohne Klammern', () => {
  for (const lang of ['de', 'en', 'fr', 'es']) {
    setLanguage(lang);
    const x = t('wish.ask', { treasure: 'X' });
    assert.ok(!/[()]/.test(x), `${lang}: ${x}`);
    assert.match(x, /:\s?X\s?\?$/u, `${lang}: ${x}`);
    if (lang === 'fr') assert.ok(x.includes(' :') && x.includes(' ?'), x);
    if (lang === 'es') assert.ok(x.startsWith('¿'), x);
  }
  setLanguage('de');
});
