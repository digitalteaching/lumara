// Der Aushang in der Welt (Lumara 1.3, Spec 7.1). Regeln: js/world/board.js, Wünsche:
// js/world/wishes.js, Seite an der Tafel: js/menu/boardPage.js.
// - Beim Aufbau jeder Welt: Ist ein neuer Tag, zählen erst die Ereignisse für den alten Aushang, dann
//   kommen neue Wünsche und danach neue Aufgaben (so kann schon am ersten Tag „Erfülle einen Wunsch“
//   dabei sein). Wünsche bekommt jedes offene Gebiet. „Besuche …“ nennt nie das Gebiet dieser Welt.
//   In einem Gebiet (nicht im Garten, in der Höhle oder an einem geheimen Ort) zählt der Besuch.
// - Nur wenn die Welt frei ist (keine Sperre, Laufen, keine Überblendung), prüft jeder Takt den Tag
//   und zählt die Ereignisse. Jede Meldung kommt einzeln als Toast mit Jingle (Art 'news': auf
//   schmalen Bildern unter der Anzeige und den Knöpfen oben, css/spiel.css). Bringt der Tagesbonus
//   ein neues Level, folgen die Level-Zeilen der Welt unter ihrer Sperre, sobald die Meldung gelesen
//   ist (NEWS_READ_MS).
// - Ist die Welt nicht mehr frei (Sperre, Menü, Rucksack, Seite, Dialog, Duell), geht eine sichtbare
//   Meldung sofort weg. War sie kürzer als NEWS_READ_MS zu sehen, kommt sie vorn wieder in die Reihe
//   und erscheint noch einmal, sobald die Welt frei ist. Nur ein Kartenwechsel (game.traveling, aus
//   travelTo in js/scenes/worldEvents.js) lässt sie stehen; die nächste Welt übernimmt sie.
// - Hat Ilvy noch nicht vom Aushang erzählt (board.intro === false): In der Bucht wartet jede Meldung,
//   bis sie fertig ist. Anderswo kommt vor der ersten Meldung des Spiels einmal „Neu: …“
//   (board.news.first); intro bleibt dabei false, Ilvy erzählt trotzdem.
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

const NEWS_MS = 6000; // so lange steht eine Meldung da (wie jeder Toast)
const NEWS_READ_MS = 2500; // so lange zu sehen, gilt eine Meldung als gelesen
const NEWS_GAP_MS = 400; // dann eine kleine Pause bis zur nächsten
const INTRO_DELAY_MS = 800; // so lange läuft man frei in der Bucht, bevor Ilvy erzählt
const GLINT_EVERY_MS = 2400; // alle so viele Millisekunden ein Glanz auf der Tafel …
const GLINT_MS = 240; // … der so lange bleibt

// Meldungen, die noch kommen, je Spiel. Sie überstehen einen Kartenwechsel: Jede Welt macht weiter,
// wo die vorige aufgehört hat. wait: so lange steht die letzte Meldung noch da. shown: die Meldung,
// die gerade zu sehen ist ({ news, node, ms, levels }; levels: noch offene Level-Zeilen des Bonus).
// first: „Neu: …“ ist in diesem Spiel schon gekommen (einmal pro Spielstart).
const queues = new WeakMap();
function queueOf(game) {
  let q = queues.get(game);
  if (!q) queues.set(game, (q = { items: [], wait: 0, shown: null, first: false }));
  return q;
}

const rewardName = reward => (reward.item === 'treasure' ? treasureName(reward.treasure) : t(`item.${reward.item}.name`));

export function newsText(news) {
  if (news.kind === 'first') return t('board.news.first');
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
  const here = def.area ?? null; // „Besuche …“ nennt nie dieses Gebiet

  // Ein neuer Tag (oder noch gar kein Aushang): Erst zählen die Ereignisse für den alten Aushang, dann
  // kommen neue Wünsche und danach neue Aufgaben, damit „Erfülle einen Wunsch“ die neuen Wünsche
  // schon kennt. Was die Belohnungen von gestern melden (ein Schatz), zählt nicht mehr für heute. Ein
  // früheres Datum ändert nichts (js/world/board.js).
  function newDay(day) {
    const s = game.state;
    if (s.board && !(day > s.board.day)) return false;
    if (s.board) {
      take(processEvents(s, game.rng, pack()));
      s.events = [];
    }
    ensureWishes(s, pack(), day, game.rng);
    ensureBoard(s, pack(), day, game.rng, here);
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
    const levels = n.kind === 'bonus' && n.levelAfter > n.levelBefore ? [n.levelBefore, n.levelAfter] : null;
    queue.shown = { news: n, node: toast(newsText(n), NEWS_MS, 'news'), ms: 0, levels };
    jingle('board');
    queue.wait = NEWS_MS + NEWS_GAP_MS;
  }

  // Die Welt ist nicht mehr frei: Die Meldung geht weg. Ungelesen (oder mit noch offenen Level-Zeilen)
  // kommt sie vorn wieder in die Reihe, gleich wenn die Welt wieder frei ist.
  function hide() {
    const s = queue.shown;
    if (!s) return;
    queue.shown = null;
    s.node?.remove();
    if (s.ms < NEWS_READ_MS || s.levels) queue.items.unshift(s.news);
    queue.wait = 0;
  }

  // Die nächste Meldung, wenn eine dran ist. Hat Ilvy noch nicht vom Aushang erzählt, wartet in der
  // Bucht jede Meldung auf sie; anderswo kommt vor der ersten einmal „Neu: …“.
  function nextNews() {
    if (!queue.items.length || queue.wait > 0) return null;
    const untold = game.state.board?.intro === false;
    if (!untold && queue.items[0].kind === 'first') queue.items.shift(); // Ilvy hat inzwischen erzählt
    if (untold && introLines?.length) return null;
    if (untold && !queue.first) {
      queue.first = true;
      return { kind: 'first' };
    }
    return queue.items.shift() ?? null;
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
    const shown = queue.shown;
    if (shown) {
      shown.ms += dt;
      if (shown.ms >= NEWS_MS && !shown.levels) queue.shown = null; // von selbst weg
    }
    if (world.locked || game.mode !== 'walk' || game.overlay) {
      freeMs = 0;
      if (!game.traveling) hide();
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
    // Der Bonus ist gelesen: jetzt seine Level-Zeilen. Die Sperre nimmt die Meldung weg, gelesen.
    if (shown?.levels && shown.ms >= NEWS_READ_MS) {
      const [before, after] = shown.levels;
      shown.levels = null;
      return world.lock(() => levelUps(before, after));
    }
    const next = nextNews();
    if (next) announce(next);
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
