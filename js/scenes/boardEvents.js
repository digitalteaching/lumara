// Der Aushang in der Welt (Lumara 1.3, Spec 7.1). Regeln: js/world/board.js, Wünsche:
// js/world/wishes.js, Seite an der Tafel: js/menu/boardPage.js.
// - Beim Aufbau jeder Welt: Ist ein neuer Tag, zählen erst die Ereignisse für den alten Aushang, dann
//   kommen neue Aufgaben. Wünsche bekommt jedes offene Gebiet. In einem Gebiet (nicht im Garten, in
//   der Höhle oder an einem geheimen Ort) zählt der Besuch.
// - Nur wenn die Welt frei ist (keine Sperre, Laufen, keine Überblendung), prüft jeder Takt den Tag
//   und zählt die Ereignisse. Jede Meldung kommt einzeln als Toast mit Jingle. Bringt der Tagesbonus
//   ein neues Level, folgen die Level-Zeilen der Welt unter ihrer Sperre.
// - Die Tafel in der Bucht: A öffnet die Seite des Aushangs. Solange eine Aufgabe offen ist, blitzt
//   ab und zu ein Glanz auf, bei „Bewegung reduzieren“ nie.
// - Ilvy erzählt einmal vom Aushang, sobald man in der Bucht eine Weile frei laufen kann.

import { emit } from '../world/events.js';
import { todayKey, ensureBoard, processEvents } from '../world/board.js';
import { ensureWishes } from '../world/wishes.js';
import { mapOfArea, worldLines } from '../world/network.js';
import { treasureName } from '../items/treasures.js';
import { boardPage } from '../menu/boardPage.js';
import { showToast } from '../ui/toast.js';
import { openSheet } from '../ui/sheet.js';
import { say } from '../ui/dialog.js';
import { sound, jingle } from '../audio/bus.js';
import { t } from '../i18n/i18n.js';

const NEWS_MS = 4000; // so lange steht eine Meldung da
const NEWS_GAP_MS = 400; // dann eine kleine Pause bis zur nächsten
const INTRO_DELAY_MS = 800; // so lange läuft man frei in der Bucht, bevor Ilvy erzählt
const GLINT_EVERY_MS = 2400; // alle so viele Millisekunden ein Glanz auf der Tafel …
const GLINT_MS = 240; // … der so lange bleibt

// Meldungen, die noch kommen, je Spiel. Sie überstehen einen Kartenwechsel: Jede Welt macht weiter,
// wo die vorige aufgehört hat. wait: so lange steht die letzte Meldung noch da.
const queues = new WeakMap();
function queueOf(game) {
  let q = queues.get(game);
  if (!q) queues.set(game, (q = { items: [], wait: 0 }));
  return q;
}

const rewardName = reward => (reward.item === 'treasure' ? treasureName(reward.treasure) : t(`item.${reward.item}.name`));

export function newsText(news) {
  if (news.kind === 'task') return t('board.news.task', { reward: rewardName(news.reward) });
  return t('board.news.bonus', { reward: t(`item.${news.starfruit ? 'starfruit' : 'farsight'}.name`), xp: news.xp });
}

// io ersetzt in Tests Dialog (say), Toast, Seite (sheet) und den Kalendertag (today).
export function addBoard(world, game, { levelUps = async () => {}, say: speak = say, toast = showToast, sheet = openSheet, today = () => todayKey() } = {}) {
  const def = world.map.def;
  const pack = () => game.pack.data;
  const queue = queueOf(game);
  const hasBoard = def.objects.some(o => o.type === 'board');
  const ilvy = def.objects.find(o => o.type === 'npc' && o.id === 'ilvy') ?? null;

  // Ein neuer Tag (oder noch gar kein Aushang): Erst zählen die Ereignisse für den alten Aushang, dann
  // kommen neue Aufgaben und Wünsche. Was die Belohnungen von gestern melden (ein Schatz), zählt nicht
  // mehr für heute. Ein früheres Datum ändert nichts (js/world/board.js).
  function newDay(day) {
    const s = game.state;
    if (s.board && !(day > s.board.day)) return false;
    if (s.board) {
      take(processEvents(s, game.rng, pack()));
      s.events = [];
    }
    ensureBoard(s, pack(), day, game.rng);
    ensureWishes(s, pack(), day, game.rng);
    return true;
  }

  // Die Level stehen gleich beim Zählen fest: Kommt vor der Meldung noch ein Duell, sagt es seine
  // eigenen Level, und die Meldung sagt nur die des Bonus.
  function take(news) {
    for (const n of news) queue.items.push(n.kind === 'bonus' ? { ...n, levelAfter: game.state.creature.level } : n);
  }

  // ---------- Beim Aufbau ----------

  const day = today();
  const fresh = newDay(day);
  const wished = ensureWishes(game.state, pack(), day, game.rng).length > 0;
  if (fresh || wished) game.save();
  if (def.area && mapOfArea(def.area)?.id === def.id) emit(game.state, 'visit', { area: def.area });

  // ---------- Melden ----------

  function announce(n) {
    toast(newsText(n), NEWS_MS);
    jingle('board');
    queue.wait = NEWS_MS + NEWS_GAP_MS;
    if (n.kind === 'bonus' && n.levelAfter > n.levelBefore) world.lock(() => levelUps(n.levelBefore, n.levelAfter));
  }

  // ---------- Ilvy erzählt einmal vom Aushang ----------

  let freeMs = 0;
  let introRunning = false;
  const introLines = hasBoard && ilvy ? worldLines(def, ilvy, 'linesBoard') : null;
  const introDue = () => !!introLines?.length && !introRunning && game.state.board?.intro === false && freeMs >= INTRO_DELAY_MS;

  function introduce() {
    introRunning = true;
    world.lock(async () => {
      try {
        await speak(game, introLines, { speaker: ilvy.name });
        if (game.state.board) game.state.board.intro = true;
        game.save();
      } finally {
        introRunning = false;
      }
    });
  }

  world.onTick.push(dt => {
    queue.wait = Math.max(0, queue.wait - dt);
    if (world.locked || game.mode !== 'walk' || game.overlay) {
      freeMs = 0;
      return;
    }
    freeMs += dt;
    const s = game.state;
    let changed = newDay(today());
    if (s.events?.length) {
      take(processEvents(s, game.rng, pack()));
      changed = true;
    }
    if (changed) game.save();
    if (introDue()) return introduce();
    if (queue.items.length && queue.wait === 0) announce(queue.items.shift());
  });

  // ---------- Die Tafel ----------

  world.propVariant.board = () => {
    const b = game.state.board;
    const open = !!b && b.tasks.some(x => !x.done);
    return open && !game.reducedMotion && world.time % GLINT_EVERY_MS < GLINT_MS ? 'noticeBoardGlint' : 'noticeBoard';
  };

  if (hasBoard) {
    world.onInteract.unshift(async ev => {
      if (ev.target?.type !== 'board') return false;
      sound('menu');
      await sheet(game, boardPage(game));
      return true;
    });
  }
}
