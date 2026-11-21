// Der Aushang (Lumara 1.3, Spec 7.1): jeden Tag drei machbare Aufgaben, je eine Belohnung und ein
// Tagesbonus, wenn alle drei erledigt sind. DOM-frei. Der Tag kommt immer als Argument.

import { CONFIG } from '../config.js';
import { t } from '../i18n/i18n.js';
import { BOARD_KINDS } from './events.js';
import { MAPS, areaOpen, mapOfArea, areaWithArticle } from './network.js';
import { AREA_WILD } from '../data/species.js';
import { FRIENDABLE, isFriend, giftOf } from '../friends/friends.js';
import { HIDEOUTS } from '../data/hideouts.js';
import { rollTreasure, addTreasure } from '../items/treasures.js';
import { addItem } from '../items/bag.js';
import { gainXp } from '../duel/progress.js';

const AREAS = [1, 2, 3, 4, 5, 6, 7, 8];
const SINGLE = new Set(['befriend', 'treasure', 'visit', 'wish']);
// Ereignis, das eine Aufgabe voranbringt (befriend und visit zusätzlich mit passendem Gebiet, streak extra).
const EVENT_OF = { befriend: 'befriend', hideouts: 'hideout', wildWins: 'wildWin', notes: 'note', treasure: 'treasure', visit: 'visit', wish: 'wish' };

// 'JJJJ-MM-TT' in Ortszeit.
export function todayKey(date = new Date()) {
  const p = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

const openAreas = (state, pack) => AREAS.filter(a => (pack
  ? areaOpen(state, pack, a)
  : a <= CONFIG.world.builtAreas && (a === 1 || state.stones.includes(a - 1))) && mapOfArea(a));

// Gebiete, in denen noch eine Art fehlt, die man befreunden kann.
const befriendAreas = (state, pack) => openAreas(state, pack).filter(a => {
  const w = AREA_WILD[a];
  return w && [...w.common, w.rare].some(id => FRIENDABLE.includes(id) && !isFriend(state, id));
});

const openWishes = state => Object.values(state.wishes ?? {}).filter(w => w && w.done === false);

// Alle Arten, die das Kind jetzt schaffen kann.
export function feasibleKinds(state, pack) {
  const open = openAreas(state, pack);
  const gifts = new Set(FRIENDABLE.filter(id => isFriend(state, id)).map(giftOf).filter(g => g && g !== 'sniff'));
  const ok = {
    befriend: () => befriendAreas(state, pack).length > 0,
    hideouts: () => HIDEOUTS.some(h => gifts.has(h.gift) && open.includes(MAPS[h.map].area)),
    visit: () => open.some(a => a !== 1),
    wish: () => openWishes(state).length > 0,
  };
  return BOARD_KINDS.filter(k => (ok[k] ? ok[k]() : true));
}

function makeTask(kind, state, pack, rng) {
  const range = CONFIG.board.counts[kind];
  const n = SINGLE.has(kind) ? 1 : rng.int(range[0], range[1]);
  let area = null;
  if (kind === 'befriend') area = rng.pick(befriendAreas(state, pack));
  if (kind === 'visit') area = rng.pick(openAreas(state, pack).filter(a => a !== 1));
  return { kind, n, area, progress: 0, done: false, rewarded: false };
}

// Legt einen neuen Aushang an, wenn keiner da ist oder der Tag später ist als der des alten.
export function ensureBoard(state, pack, today, rng) {
  if (state.board && !(today > state.board.day)) return false;
  const pool = [...feasibleKinds(state, pack)];
  const tasks = [];
  while (tasks.length < 3 && pool.length) {
    const kind = rng.pick(pool);
    pool.splice(pool.indexOf(kind), 1);
    tasks.push(makeTask(kind, state, pack, rng));
  }
  state.board = { day: today, tasks, bonus: false, intro: state.board?.intro === true };
  return true;
}

function advance(task, ev) {
  if (task.done) return;
  if (task.kind === 'streak') {
    if (ev.type !== 'answer') return;
    task.progress = ev.correct ? task.progress + 1 : 0;
  } else if (ev.type === EVENT_OF[task.kind]) {
    if ((task.kind === 'befriend' || task.kind === 'visit') && ev.area !== task.area) return;
    task.progress += 1;
  } else return;
  if (task.progress >= task.n) { task.progress = task.n; task.done = true; }
}

function rewardTask(state, pack, rng) {
  const kind = rng.weighted(['treat', 'treasure'], k => CONFIG.board.rewards[k]);
  if (kind === 'treasure') {
    const areas = openAreas(state, pack);
    const treasure = rollTreasure(rng.pick(areas.length ? areas : [1]), rng);
    addTreasure(state, treasure); // meldet 'treasure': zählt erst beim nächsten Durchgang
    return { item: 'treasure', treasure };
  }
  addItem(state, 'treat');
  return { item: 'treat' };
}

// Zählt die Ereignisse, vergibt Belohnungen und den Tagesbonus. Ereignisse, die dabei entstehen,
// kommen erst beim nächsten Aufruf dran.
export function processEvents(state, rng, pack = null) {
  const events = Array.isArray(state.events) ? state.events : [];
  state.events = [];
  const board = state.board;
  const news = [];
  if (!board) return news;
  for (const ev of events) for (const task of board.tasks) advance(task, ev);
  board.tasks.forEach((task, index) => {
    if (!task.done || task.rewarded) return;
    task.rewarded = true;
    news.push({ kind: 'task', index, reward: rewardTask(state, pack, rng) });
  });
  if (!board.bonus && board.tasks.length > 0 && board.tasks.every(x => x.done)) {
    board.bonus = true;
    const starfruit = addItem(state, 'starfruit') > 0;
    if (!starfruit) addItem(state, 'farsight');
    const levelBefore = state.creature.level;
    gainXp(state.creature, CONFIG.board.bonusXp);
    news.push({ kind: 'bonus', starfruit, xp: CONFIG.board.bonusXp, levelBefore });
  }
  return news;
}

// Der Text einer Aufgabe; der gesuchte Ort steht mit Artikel darin.
export function taskText(task) {
  return t(`board.task.${task.kind}`, { n: task.n, area: task.area ? areaWithArticle(task.area) : '' });
}

export function boardView(state) {
  const b = state.board;
  if (!b) return { day: null, tasks: [], allDone: false };
  return {
    day: b.day,
    tasks: b.tasks.map(x => ({ text: taskText(x), progress: x.progress, n: x.n, done: x.done })),
    allDone: b.tasks.length > 0 && b.tasks.every(x => x.done),
  };
}
