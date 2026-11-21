// Freundeskarte (js/menu/friendsPage.js) und Wesen-Buch (js/menu/bookPage.js) mit einem kleinen DOM im
// Speicher. Eigene Datei, eigener Prozess: Die Globalen document und Node gelten nur hier.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

class FakeNode {
  constructor(tag = '#text', text = '') {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.className = '';
    this.dataset = {};
    this.style = {};
    this.attrs = {};
    this.text = text;
  }
  append(...nodes) {
    for (const n of nodes) this.children.push(n instanceof FakeNode ? n : new FakeNode('#text', String(n)));
  }
  setAttribute(k, v) {
    this.attrs[k] = String(v);
  }
  addEventListener() {}
  // Ein Canvas, auf das man zeichnen kann, ohne dass etwas passiert.
  getContext() {
    return new Proxy({}, { get: (t, k) => (k === 'createImageData' ? (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }) : () => {}) });
  }
  get textContent() {
    return this.tagName === '#TEXT' ? this.text : this.children.map(c => c.textContent).join('');
  }
  find(cls) {
    if (this.className.split(' ').includes(cls)) return this;
    for (const c of this.children) {
      const hit = c.find(cls);
      if (hit) return hit;
    }
    return null;
  }
}
globalThis.Node = FakeNode;
globalThis.document = { createElement: tag => new FakeNode(tag) };

const { friendCard, friendsPage } = await import('../js/menu/friendsPage.js');
const { bookPage } = await import('../js/menu/bookPage.js');
const { makeFriend, setCompanion } = await import('../js/friends/friends.js');
const { recordSighting } = await import('../js/data/book.js');
const { speciesName } = await import('../js/data/species.js');
const { newGameState } = await import('../js/state.js');
const { t, setLanguage } = await import('../js/i18n/i18n.js');
const { boardPage, boardDate } = await import('../js/menu/boardPage.js');
const { diaryPage } = await import('../js/menu/diaryPage.js');
const { taskText } = await import('../js/world/board.js');
const { wishHint } = await import('../js/world/wishes.js');
const { treasureName } = await import('../js/items/treasures.js');

const render = page => {
  const body = new FakeNode('div');
  page.render(body, { push() {}, refresh() {} });
  return body;
};

test('Freundeskarte eines Wesens, das kein Freund ist: ein kurzer Satz statt einer leeren Seite', () => {
  const game = { state: { friends: {}, companion: null } };
  const body = render(friendCard(game, 'flaschling'));
  assert.equal(body.children.length, 1);
  assert.equal(body.children[0].tagName, 'P');
  assert.equal(body.textContent, t('friends.notYet', { name: speciesName('flaschling', 1) }));
});

test('Freundeskarte eines Freunds: Bild, Gabe und der Knopf zum Mitnehmen', () => {
  const state = { friends: {}, companion: null };
  makeFriend(state, 'flaschling', false);
  const body = render(friendCard({ state }, 'flaschling'));
  assert.ok(body.find('friend-card'));
  assert.ok(body.textContent.includes(t('friends.takeAlong')));
  setCompanion(state, 'flaschling');
  assert.ok(render(friendCard({ state }, 'flaschling')).textContent.includes(t('friends.backToGarden')));
  // Ohne Freunde sagt die Liste, wie man einen findet.
  assert.equal(render(friendsPage({ state: { friends: {}, companion: null } })).textContent, t('friends.none'));
});

test('Wesen-Buch: Herz, Nummer und Stern liegen nebeneinander in der Kopfzeile, nie übereinander', () => {
  const state = newGameState({ name: 'A', species: 'nixi', nickname: null });
  recordSighting(state, 'kometwiesel', { beaten: true, shiny: true }); // Nummer 41
  makeFriend(state, 'kometwiesel', true);
  const cells = render(bookPage({ state })).find('book-grid').children;
  const top = cell => cell.children[0];
  const classes = cell => top(cell).children.map(c => c.className);
  assert.equal(top(cells[40]).className, 'book-top');
  assert.deepEqual(classes(cells[40]), ['book-heart', 'book-no', 'book-star']);
  assert.equal(top(cells[40]).children[1].textContent, t('book.no', { n: 41 }));
  assert.deepEqual(classes(cells[0]), ['book-no'], 'unbekannt: nur die Nummer');
  // Im Raster: Herz links, Nummer in der Mitte, Stern rechts, keins absolut über den anderen.
  const css = readFileSync(new URL('../css/spiel.css', import.meta.url), 'utf8');
  const rule = sel => css.match(new RegExp(`^\\${sel} \\{([^}]*)\\}`, 'm'))?.[1] ?? '';
  assert.match(rule('.book-top'), /display: grid; grid-template-columns: 1fr auto 1fr/);
  for (const [sel, col] of [['.book-heart', 1], ['.book-no', 2], ['.book-star', 3]]) {
    assert.match(rule(sel), new RegExp(`grid-column: ${col}; grid-row: 1;`), sel);
    assert.doesNotMatch(rule(sel), /position: absolute/, sel);
  }
});

// Lange Namen („Jinglefeather“) brachen mitten im Wort ohne Bindestrich um. Sie trennen jetzt an
// Silbengrenzen in der Spielsprache (html lang); hart umbrechen nur, wenn kein Trennpunkt passt.
test('Namen im Buch, in der Freundesliste und auf der Rucksack-Karte trennen an Silbengrenzen', () => {
  const css = readFileSync(new URL('../css/spiel.css', import.meta.url), 'utf8');
  const rule = sel => css.match(new RegExp(`^\\${sel} \\{([^}]*)\\}`, 'm'))?.[1] ?? '';
  for (const sel of ['.book-name', '.friend-text', '.bp-card-name']) {
    assert.match(rule(sel), /hyphens: auto; -webkit-hyphens: auto; overflow-wrap: break-word;/, sel);
    assert.doesNotMatch(rule(sel), /anywhere|hyphens: manual/, sel);
  }
  // Ortsnamen auf der Karte und Knöpfe mit vielen Zielen trennen weiter nur an ihren festen Stellen.
  assert.match(css, /\.map-cell \.map-name, \.choice\.many \.btn \{ hyphens: manual; -webkit-hyphens: manual; \}/);
});

// Lumara 1.3: die Seite an der Tafel und die zwei neuen Abschnitte oben im Tagebuch.
const bTask = (kind, over = {}) => ({ kind, n: 2, area: null, progress: 0, done: false, rewarded: false, ...over });
const todayBoard = tasks => ({ day: '2026-11-22', tasks, bonus: false, intro: true });

test('Aushang-Seite: Datum, drei Aufgaben mit „n von m“ und ✓, ein Satz erst, wenn alles erledigt ist', () => {
  const state = newGameState({ name: 'A', species: 'nixi', nickname: null });
  const tasks = [bTask('notes', { progress: 1 }), bTask('streak', { n: 3, progress: 3, done: true, rewarded: true }), bTask('wildWins')];
  state.board = todayBoard(tasks);
  const page = boardPage({ state });
  assert.equal(page.title, t('board.title'));
  const text = render(page).textContent;
  assert.ok(boardDate('2026-11-22').includes('22'), boardDate('2026-11-22'));
  assert.ok(text.includes(boardDate('2026-11-22')));
  for (const x of tasks) assert.ok(text.includes(taskText(x)), taskText(x));
  assert.ok(text.includes(t('board.progress', { progress: 1, n: 2 })));
  assert.ok(text.includes(t('board.progress', { progress: 0, n: 2 })));
  assert.ok(text.includes(`✓ ${taskText(tasks[1])}`));
  assert.ok(text.includes(t('board.done')));
  assert.ok(!text.includes(t('board.allDone')));
  for (const x of tasks) Object.assign(x, { progress: x.n, done: true, rewarded: true });
  assert.ok(render(boardPage({ state })).textContent.includes(t('board.allDone')));
  state.board = null;
  assert.equal(render(boardPage({ state })).textContent, t('board.empty'));
});

test('Datum am Aushang in der Spielsprache, ein kaputter Tag stört nicht', () => {
  setLanguage('fr');
  assert.match(boardDate('2026-11-22'), /novembre/);
  setLanguage('de');
  assert.match(boardDate('2026-11-22'), /November/);
  assert.equal(boardDate('kaputt'), '');
  assert.equal(boardDate(null), '');
});

test('Tagebuch: oben „Heute am Aushang“, darunter die offenen Wünsche mit Hinweis', () => {
  const state = newGameState({ name: 'A', species: 'nixi', nickname: null });
  const tasks = [bTask('notes', { progress: 1 }), bTask('streak', { n: 3, progress: 3, done: true, rewarded: true }), bTask('treasure', { n: 1 })];
  state.board = todayBoard(tasks);
  state.wishes = { pim: { treasure: 'glassshell', day: '2026-11-22', done: false }, lio: { treasure: 'goldleaf', day: '2026-11-22', done: true } };
  const body = render(diaryPage({ state }));
  assert.ok(body.children[0].className.includes('diary-board'), 'der Aushang steht ganz oben');
  assert.ok(body.children[1].className.includes('diary-wishes'));
  const top = body.children[0].textContent;
  assert.ok(top.startsWith(t('diary.board')));
  for (const x of tasks) assert.ok(top.includes(taskText(x)), taskText(x));
  assert.ok(top.includes(`✓ ${taskText(tasks[1])}`));
  const wishes = body.children[1].textContent;
  assert.ok(wishes.startsWith(t('diary.wishes')));
  assert.ok(wishes.includes(t('wish.diary', { name: 'Pim', treasure: treasureName('glassshell') })));
  assert.ok(wishes.includes(wishHint('glassshell')));
  assert.ok(!wishes.includes(treasureName('goldleaf')), 'ein erfüllter Wunsch steht nicht da');

  const empty = newGameState({ name: 'A', species: 'nixi', nickname: null });
  const none = render(diaryPage({ state: empty }));
  assert.ok(none.children[0].textContent.includes(t('diary.noBoard')));
  assert.ok(none.children[1].textContent.includes(t('diary.noWishes')));
});
