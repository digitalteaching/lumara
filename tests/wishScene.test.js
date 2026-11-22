// Wünsche in einer echten Weltszene (js/scenes/wishEvents.js): Ansprechen mit und ohne Schatz, Ja und
// Nein, Doppeltipp, Aufträge gehen vor, andere Bewohner und die Sprechblase. Dialog und Auswahl sind
// hier Aufzeichnungen; wie sie im DOM aussehen, prüft der Controller im Browser. Die Bilder entstehen
// in einem kleinen Canvas-Ersatz. Eigene Datei, eigener Prozess: document gilt nur hier.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stubContext } from './helpers/fixtures.js';

globalThis.document = {
  createElement: () => ({
    width: 0,
    height: 0,
    getContext: () => ({ createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }), putImageData() {} }),
  }),
};

const { createWorldScene } = await import('../js/scenes/world.js');
const { addWishes, bubbleSpot } = await import('../js/scenes/wishEvents.js');
const { MAPS, npcLines } = await import('../js/world/network.js');
const { newGameState } = await import('../js/state.js');
const { createRng } = await import('../js/core/rng.js');
const { addTreasure, treasureName } = await import('../js/items/treasures.js');
const { wishHint } = await import('../js/world/wishes.js');
const { itemCanvas } = await import('../js/gfx/art/items.js');
const { xpToNext } = await import('../js/duel/progress.js');
const { CONFIG } = await import('../js/config.js');
const { t, setLanguage } = await import('../js/i18n/i18n.js');

setLanguage('de');
const DAY = '2026-11-22';
const PACK = { shortId: 'wunsch-test', trainers: [{ number: 1 }], notes: [] };
const T = 16;

// Ein Zufall, der die Belohnung festlegt (sonst wie createRng).
const rewardRng = reward => ({ ...createRng(3), weighted: items => (items.includes(reward) ? reward : items[0]), pick: a => a[0] });

// Die Figur steht rechts neben dem Bewohner und schaut ihn an.
function setup({ map = 'bucht', npc = 'pim', wish = { treasure: 'glassshell', day: DAY, done: false }, has = 1, rng = createRng(3), reducedMotion = false, state: given, at, today = DAY } = {}) {
  const def = MAPS[map];
  const o = def.objects.find(x => x.id === npc);
  const state = given ?? newGameState({ name: 'A', species: 'nixi', nickname: null });
  state.position = { map, ...(at ?? { x: o.x + 1, y: o.y, dir: 'left' }) };
  state.wishes = wish ? { [npc]: wish } : {};
  if (wish && has) addTreasure(state, wish.treasure, has);
  state.events = [];
  const log = { says: [], asks: [], saves: 0, levelUps: [], turns: [] };
  let answer = 0;
  let hold = null; // eine Auswahl, die erst später antwortet
  let taps = 0;
  let walk = null; // eine Richtung für einen Takt
  const game = {
    state,
    reducedMotion,
    mode: 'walk',
    rng,
    pack: { data: PACK },
    save: () => log.saves++,
    input: { dir: () => walk, pressed: k => (k === 'a' && taps > 0 ? (taps--, true) : false) },
  };
  const world = createWorldScene(game, def, {});
  const turn = world.turnToward, reset = world.resetFacing;
  world.turnToward = (x, dir) => (log.turns.push([x.id, dir]), turn(x, dir));
  world.resetFacing = x => (log.turns.push([x.id, 'reset']), reset(x));
  addWishes(world, game, {
    levelUps: async before => log.levelUps.push(before),
    say: async (g, lines, opts = {}) => log.says.push({ lines, speaker: opts.speaker }),
    choose: async (g, prompt, options, opts = {}) => {
      log.asks.push({ prompt, options, cancelIndex: opts.cancelIndex });
      if (hold) return new Promise(r => (hold.release = () => r(answer)));
      return answer;
    },
    today: () => today,
  });
  // A drücken: ein Takt der Welt mit A, wie beim Tippen auf den A-Knopf.
  const tap = () => {
    taps = 1;
    world.update(16);
  };
  // Einen Schritt beginnen: ein Takt mit dieser Richtung.
  const go = dir => {
    walk = dir;
    world.update(16);
    walk = null;
  };
  return {
    world, state, game, log, o, tap, go,
    handler: world.onInteract[0],
    answer: a => (answer = a),
    holdChoice: () => (hold = {}),
    release: () => hold.release(),
  };
}

const settle = async () => {
  for (let i = 0; i < 5; i++) await new Promise(r => setImmediate(r));
};
const lines = log => log.says.flatMap(s => s.lines);
const ownLine = npc => t(`wish.${npc}.own`);
// Was der Bewohner ohne Wunsch sagen würde (wie der allgemeine Bewohner-Handler).
const normal = (o, state, map = 'bucht') => npcLines(o, state, MAPS[map].area, PACK);

// Wo das Schatzbild gezeichnet wurde: [x, y] je Bild.
const pictures = (world, treasure) => {
  const ctx = stubContext();
  for (const fn of world.afterRender) fn(ctx, world.camera());
  const img = itemCanvas(treasure);
  return ctx.calls.filter(c => c[0] === 'drawImage' && c[1] === img).map(c => [c[2], c[3]]);
};

test('Der Wunsch-Handler kommt zuerst und antwortet nur dem Wunsch-Bewohner', async () => {
  const { world, handler, log } = setup();
  assert.equal(world.onInteract[0], handler);
  const oda = MAPS.bucht.objects.find(x => x.id === 'oda');
  assert.equal(await handler({ target: oda, x: oda.x, y: oda.y }), false, 'Oda redet wie immer');
  const sign = MAPS.bucht.objects.find(x => x.type === 'sign');
  assert.equal(await handler({ target: sign, x: sign.x, y: sign.y }), false);
  assert.equal(await handler({ target: null, x: 0, y: 0 }), false);
  assert.deepEqual(log.says, []);
  assert.deepEqual(log.turns, []);
});

test('Ja tauscht einmal: erst gespeichert, dann Abgabe, Dank und was es gibt', async () => {
  const { state, log, tap, world, o } = setup({ rng: rewardRng('stone') });
  const treasure = treasureName('glassshell');
  tap();
  await settle();
  assert.equal(world.locked, false, 'danach ist die Welt wieder frei');
  assert.deepEqual(log.says[0], { lines: [ownLine('pim'), t('wish.want', { treasure })], speaker: 'Pim' });
  assert.deepEqual(log.asks, [{ prompt: t('wish.ask', { treasure }), options: [t('common.yes'), t('common.no')], cancelIndex: 1 }]);
  assert.equal(state.treasures.glassshell, 0, 'der Schatz ist weg');
  assert.ok(state.album.includes('glassshell'), 'das Album behält ihn');
  assert.equal(state.wishes.pim.done, true);
  assert.equal(state.bag.farsight, 1);
  assert.equal(log.saves, 1);
  assert.ok(state.events.some(e => e.type === 'wish'), 'zählt für den Aushang');
  assert.deepEqual(lines(log).slice(2), [t('wish.give', { treasure }), t('wish.thanks.stone'), t('wish.got', { item: t('item.farsight.name') })]);
  assert.equal(log.says.find(s => s.lines[0] === t('wish.thanks.stone')).speaker, 'Pim');
  assert.deepEqual(log.turns, [['pim', 'right'], ['pim', 'reset']], 'er schaut die Figur an, solange er redet');
  assert.deepEqual(log.levelUps, [], 'kein neues Level');
  // Noch einmal A: seine normalen Sätze, dann: Heute hat er keinen Wunsch mehr.
  tap();
  await settle();
  assert.deepEqual(log.says.at(-1), { lines: [...normal(o, state), t('wish.nextDay')], speaker: 'Pim' });
  assert.equal(log.asks.length, 1);
  assert.equal(log.saves, 1);
});

// Ein Wunsch von vorgestern, heute erfüllt: „Komm morgen wieder!“ stimmt, heute kommt kein neuer.
test('Der Tausch merkt sich den heutigen Tag', async () => {
  const { state, log, tap, o } = setup({ wish: { treasure: 'glassshell', day: '2026-11-20', done: false }, today: DAY, rng: rewardRng('stone') });
  tap();
  await settle();
  assert.deepEqual(state.wishes.pim, { treasure: 'glassshell', day: DAY, done: true });
  tap();
  await settle();
  assert.deepEqual(log.says.at(-1), { lines: [...normal(o, state), t('wish.nextDay')], speaker: 'Pim' });
});

test('Doppeltipp tauscht nicht zweimal', async () => {
  const { state, log, tap, handler, holdChoice, release, o } = setup({ has: 2, rng: rewardRng('treats') });
  holdChoice();
  tap();
  tap(); // die Welt ist gesperrt: kein zweites A
  const again = handler({ target: o, x: o.x, y: o.y }); // und falls doch eins ankommt
  assert.equal(await again, true, 'schon in Arbeit');
  await settle();
  assert.equal(log.asks.length, 1, 'nur eine Frage');
  release();
  await settle();
  assert.equal(state.treasures.glassshell, 1, 'genau einer weg');
  assert.equal(state.bag.treat, CONFIG.wishes.treats);
  assert.equal(log.saves, 1);
  assert.equal(lines(log).filter(l => l === t('wish.give', { treasure: treasureName('glassshell') })).length, 1);
});

test('Nein lässt alles, wie es war', async () => {
  const { state, log, tap, answer } = setup({ rng: rewardRng('xp') });
  answer(1);
  const before = JSON.stringify(state);
  tap();
  await settle();
  assert.equal(JSON.stringify(state), before);
  assert.equal(log.saves, 0);
  assert.deepEqual(log.says.at(-1), { lines: [t('wish.waiting', { treasure: treasureName('glassshell') })], speaker: 'Pim' });
  assert.equal(log.asks.length, 1);
});

test('Ohne den Schatz: erst seine normalen Sätze, dann sein Satz, der Wunsch und wo man ihn findet', async () => {
  const { state, log, tap, o } = setup({ has: 0 });
  const before = JSON.stringify(state);
  tap();
  await settle();
  const usual = normal(o, state);
  assert.deepEqual(usual, o.lines, 'ein neues Spiel: die ersten Sätze aus der Karte');
  assert.ok(usual.some(l => l.includes('B')), 'Pims Tipp zum Fliehen mit B');
  assert.deepEqual(log.says, [{ lines: [...usual, ownLine('pim'), t('wish.want', { treasure: treasureName('glassshell') }), wishHint('glassshell')], speaker: 'Pim' }]);
  assert.deepEqual(log.asks, []);
  assert.equal(JSON.stringify(state), before);
});

test('Erfüllt: seine normalen Sätze (je nach Stand), dann kommt morgen ein neuer Wunsch', async () => {
  const s = newGameState({ name: 'A', species: 'nixi', nickname: null });
  s.stones = [1]; // der Stein der Bucht leuchtet: Pim sagt linesLit
  const { log, tap, o } = setup({ state: s, wish: { treasure: 'glassshell', day: DAY, done: true }, has: 0 });
  tap();
  await settle();
  assert.deepEqual(log.says, [{ lines: [...o.linesLit, t('wish.nextDay')], speaker: 'Pim' }]);
  assert.deepEqual(log.asks, []);
});

test('Ohne Wunsch (Gebiet zu) redet der Bewohner wie immer', async () => {
  const { log, handler, o } = setup({ wish: null });
  assert.equal(await handler({ target: o, x: o.x, y: o.y }), false);
  assert.deepEqual(log.says, []);
  assert.deepEqual(log.turns, []);
});

test('XP als Belohnung: die XP-Zeile und Level-Zeilen nur bei neuem Level', async () => {
  const s = newGameState({ name: 'A', species: 'nixi', nickname: null });
  s.creature.xpInLevel = xpToNext(1) - 1;
  const { state, log, tap } = setup({ state: s, rng: rewardRng('xp') });
  tap();
  await settle();
  assert.ok(state.creature.level > 1);
  assert.deepEqual(log.levelUps, [1]);
  assert.ok(lines(log).some(l => l.includes(String(CONFIG.wishes.xp)) && l.includes('XP')), lines(log).join(' | '));
  assert.ok(lines(log).includes(t('wish.thanks.xp')));
});

test('Ein Schritt eines Auftrags bei ihm geht vor, und so lange zeigt er keine Sprechblase', async () => {
  const s = newGameState({ name: 'A', species: 'nixi', nickname: null });
  s.quests = { q5: { step: 0, done: false } }; // Tamo schickt einen zu Talia
  const { log, handler, o, world } = setup({ map: 'duenen', npc: 'talia', wish: { treasure: 'amber', day: DAY, done: false }, state: s });
  assert.equal(await handler({ target: o, x: o.x, y: o.y }), false);
  assert.deepEqual(log.says, []);
  assert.deepEqual(pictures(world, 'amber'), [], 'keine Blase, die A nicht hält');
  s.quests.q5.step = 1; // erledigt bei Talia: jetzt wieder ihr Wunsch
  assert.equal(pictures(world, 'amber').length, 1);
  assert.equal(await handler({ target: o, x: o.x, y: o.y }), true);
  assert.equal(log.says[0].speaker, 'Talia');
  assert.equal(log.says[0].lines[0], ownLine('talia'));
});

test('Sprechblase: das Schatzbild über dem Kopf, solange der Wunsch offen ist', async () => {
  const { world, o, holdChoice, release, tap } = setup({ rng: rewardRng('treats') });
  const cam = world.camera();
  const shown = pictures(world, 'glassshell');
  assert.equal(shown.length, 1);
  const [x, y] = shown[0];
  const head = o.y * T - cam.y - 2; // dort beginnt das Bild des Bewohners
  assert.ok(y + T <= head, `über dem Kopf (${y})`);
  assert.ok(Math.abs(x - (o.x * T - cam.x)) <= 1, 'mittig über ihm');
  // Im Gespräch (Sperre) ist sie weg, nach dem Tausch auch.
  holdChoice();
  tap();
  await settle();
  assert.deepEqual(pictures(world, 'glassshell'), []);
  release();
  await settle();
  assert.equal(world.locked, false);
  assert.deepEqual(pictures(world, 'glassshell'), [], 'gleich nach dem Tausch weg');
});

test('Sprechblase: keine bei erfülltem Wunsch, auf anderen Karten oder ohne Wunsch', () => {
  assert.deepEqual(pictures(setup({ wish: { treasure: 'amber', day: DAY, done: true } }).world, 'amber'), []);
  assert.deepEqual(pictures(setup({ wish: null }).world, 'glassshell'), []);
  // Lios Wunsch steht im Wald, nicht in der Bucht.
  const s = newGameState({ name: 'A', species: 'nixi', nickname: null });
  const { world, state } = setup({ state: s });
  state.wishes.lio = { treasure: 'goldleaf', day: DAY, done: false };
  assert.deepEqual(pictures(world, 'goldleaf'), []);
});

test('Sprechblase wippt langsam, bei „Bewegung reduzieren“ nie', () => {
  const heights = world => {
    const ys = new Set();
    for (let ms = 0; ms < 3000; ms += 50) {
      world.update(50);
      ys.add(pictures(world, 'glassshell')[0][1]);
    }
    return ys.size;
  };
  assert.equal(heights(setup({ reducedMotion: true }).world), 1);
  assert.equal(heights(setup().world), 2, 'ein Pixel auf und ab');
});

// Eine Figur belegt x … x+15 und y-2 … y+13 ihres Felds, die Blase 18 × 20.
const touches = (b, p) => b.x < p.x + T && b.x + 18 > p.x && b.y < p.y + T - 2 && b.y + 20 > p.y - 2;

test('Sprechblase rückt zur Seite, wenn die Figur oder der Begleiter über dem Bewohner steht', () => {
  const n = { x: 160, y: 128 };
  const above = bubbleSpot(n, [{ x: 176, y: 128 }]); // Figur rechts daneben
  assert.ok(above.x <= n.x && above.x + 18 >= n.x + T && above.y < n.y - 16, JSON.stringify(above));
  for (const p of [{ x: 160, y: 112 }, { x: 144, y: 112 }, { x: 176, y: 112 }, { x: 160, y: 96 }]) {
    const b = bubbleSpot(n, [p]);
    assert.equal(touches(b, p), false, `${JSON.stringify(p)} → ${JSON.stringify(b)}`);
  }
  // Die Figur rechts daneben, der Begleiter über dem Bewohner: zur Seite, ohne einen von beiden.
  const figures = [{ x: 176, y: 128 }, { x: 160, y: 112 }];
  const b = bubbleSpot(n, figures);
  assert.ok(figures.every(f => !touches(b, f)), JSON.stringify(b));
  assert.ok(b.x !== above.x);
});

test('Sprechblase: nach dem Feld der Figur, sie springt nicht mitten im Schritt', () => {
  // Die Figur läuft oberhalb von Pim von rechts nach links auf das Feld schräg über ihm.
  const { world, o, go } = setup({ at: { x: 13, y: 7, dir: 'left' } });
  const xs = () => pictures(world, 'glassshell')[0][0] + world.camera().x;
  assert.equal(xs(), o.x * T, 'erst mittig über ihm');
  go('left');
  assert.ok(world.player.moving);
  const during = new Set();
  while (world.player.moving) {
    during.add(xs());
    world.update(16);
  }
  during.add(xs());
  assert.equal(during.size, 1, [...during].join(', '));
  assert.notEqual([...during][0], o.x * T, 'zur Seite, sobald der Schritt beginnt');
});

test('Sprechblase meidet den Begleiter (sein Feld aus world.companion)', () => {
  const { world, o } = setup();
  const xs = () => pictures(world, 'glassshell')[0][0] + world.camera().x;
  assert.equal(xs(), o.x * T);
  world.companion = { cell: () => ({ x: o.x, y: o.y - 1 }) };
  assert.notEqual(xs(), o.x * T);
  world.companion = { cell: () => null }; // ohne Begleiter
  assert.equal(xs(), o.x * T);
});

test('In createGameWorld: die Wünsche nach dem Aushang und vor Garten und Begleiter', () => {
  const src = readFileSync(new URL('../js/scenes/worldEvents.js', import.meta.url), 'utf8');
  const body = src.slice(src.indexOf('export function createGameWorld'));
  const at = body.indexOf('addWishes(world, game, { levelUps });');
  assert.ok(at > body.indexOf('addBoard(world, game, { levelUps });'));
  assert.ok(at < body.indexOf('addGarden(world, game)'));
  assert.ok(at < body.indexOf('addCompanion(world, game)'));
});
