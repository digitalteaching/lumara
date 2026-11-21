// Spielaufgaben in der Welt (Lumara 1.2, Spec 6.6). Regeln: js/world/tasks.js, Daten und Orte:
// js/data/tasks.js, Texte: i18n task.<gebiet>.*. Jede Aufgabe hat intro, tip, solved und done, dazu je
// Art (tests/tasks.test.js prüft das):
// - collect: speaker (wer belohnt), hurry, gone, item.<i>, left.<n> (n Teile fehlen noch)
// - order:   clue ({list}), progress ({n}, {of}), again, symbol.<i> (Namen für die Liste), part.<i>
// - turn:    turned ({dir} aus gear.dir.<0 bis 3>)
// - follow:  station (ein Satz je Station zwischen Anfang und Ende), again, rest (Teil am Ende)
// Bilder: collect giver <prop ohne Zahl><gefunden>, item <prop>Done; order switch <prop>Lit und für
// das letzte Teil <prop>Open; turn switch <prop ohne Zahl><stellung>.
// - Bilder: propVariant.task wählt das Bild eines Teils nach Stand (gefunden, leuchtet, Stellung);
//   eine gelöste Aufgabe zeigt immer ihren Endzustand (Küken im Nest, Astloch offen, Statuen schauen
//   zum Leuchtstein, das Irrlicht schläft auf dem Wurzelstock).
// - A vor einem Teil: ein Satz zum Teil, nach einem Fehler ein Tipp. Gelöst: Fund-Jingle, der seltene
//   Schatz des Gebiets und ein Leckerli, sofort gespeichert. Danach sagt jedes Teil nur noch done.
// - Folgen (Irrlicht): Nach jedem Schritt prüft onStepped den Abstand zur aktuellen Station. Die
//   Sätze unterwegs erscheinen leise wie das Flüstern der Bäume, ohne die Figur anzuhalten.
// Der Fortschritt lebt nur in dieser Weltszene; wer die Karte verlässt, fängt neu an.

import { act, createRun, foundCount, isFound, orderLit, solveTask, taskOn, taskSolved, turnState } from '../world/tasks.js';
import { treasureName } from '../items/treasures.js';
import { sound, jingle } from '../audio/bus.js';
import { say } from '../ui/dialog.js';
import { el } from '../ui/dom.js';
import { t, tl } from '../i18n/i18n.js';

const T = 16;
const FLY_MS = 700; // so lange fliegt das Irrlicht zur nächsten Station
const WHISPER_MS = 3000;

// Das Bild mit einer anderen Zahl am Ende: gullnest0 → gullnest3, glassstatue3 → glassstatue1.
const numbered = (prop, n) => `${prop.replace(/\d+$/, '')}${n}`;

export function addTasks(world, game) {
  const task = taskOn(world.mapId);
  if (!task) return;
  const { area } = task;
  const run = createRun(task);
  const solved = () => taskSolved(game.state, area);
  // Texte dieser Aufgabe: task.<gebiet>.<teil>, als Zeile (say) oder als Liste von Zeilen (lines).
  const say1 = (part, params) => t(`task.${area}.${part}`, params);
  const lines = part => tl(`task.${area}.${part}`);
  let introSeen = false; // die Einleitung kommt einmal je Besuch

  // ---------- Bilder ----------

  function look(o) {
    const done = solved();
    if (task.type === 'collect') {
      if (o.role === 'giver') return numbered(o.prop, done ? task.items : foundCount(run));
      return done || isFound(run, o.index) ? `${o.prop}Done` : o.prop;
    }
    if (task.type === 'order' && o.role === 'switch') {
      if (done) return `${o.prop}${o.index === task.order.at(-1) ? 'Open' : 'Lit'}`;
      return orderLit(run, task, o.index) ? `${o.prop}Lit` : o.prop;
    }
    if (task.type === 'turn' && o.role === 'switch') return numbered(o.prop, done ? task.goal[o.index] : turnState(run, o.index));
    return o.prop;
  }
  world.propVariant.task = o => (o.task === area ? look(o) : o.prop);

  // ---------- Lösen ----------

  // Erst speichern, dann erzählen: Auch wer den Dialog wegtippt, behält den Fund.
  async function finish(lines, opts) {
    const out = solveTask(game.state, area);
    if (out) game.save();
    await say(game, lines, opts);
    if (!out) return;
    jingle('find');
    await say(game, [t('task.reward', { name: treasureName(out.treasure) })]);
  }

  // ---------- A vor einem Teil ----------

  async function useCollect(o) {
    const speaker = say1('speaker');
    const r = act(run, task, { role: o.role, index: o.index });
    if (o.role === 'item') {
      if (r.result !== 'progress') return say(game, [say1('gone')]);
      sound('confirm');
      return say(game, [say1(`item.${o.index}`), say1(`left.${r.left}`)]);
    }
    if (r.result === 'solved') return finish(lines('solved'), { speaker });
    // Beim ersten Gespräch die Bitte (oder, wenn schon ein Teil gefunden ist, der Tipp) und die
    // Warnung, dass beim Verlassen der Karte alles wieder versteckt ist.
    const out = foundCount(run) === 0 && !introSeen ? lines('intro') : [say1('tip')];
    if (!introSeen) out.push(say1('hurry'));
    introSeen = true;
    return say(game, out, { speaker });
  }

  const orderList = () => task.order.map(i => say1(`symbol.${i}`)).join(', ');

  async function useOrder(o) {
    if (o.role === 'clue') {
      const out = [...(introSeen ? [] : lines('intro')), say1('clue', { list: orderList() })];
      introSeen = true;
      return say(game, out);
    }
    const r = act(run, task, { role: o.role, index: o.index });
    const part = say1(`part.${o.index}`);
    if (r.result === 'solved') return finish([part, ...lines('solved')]);
    if (r.result === 'progress') {
      sound('confirm');
      return say(game, [part, say1('progress', { n: r.step, of: task.order.length })]);
    }
    if (r.result === 'wrong') {
      sound('wrong');
      return say(game, [part, say1('tip', { list: orderList() })]);
    }
    return say(game, [part, say1('again')]);
  }

  async function useTurn(o) {
    const r = act(run, task, { role: o.role, index: o.index });
    if (r.result === 'nothing') return;
    sound('tile');
    const out = introSeen ? [] : lines('intro');
    introSeen = true;
    out.push(say1('turned', { dir: t(`gear.dir.${r.dir}`) }));
    if (r.away) out.push(say1('tip'));
    if (r.result === 'solved') return finish([...out, ...lines('solved')]);
    return say(game, out);
  }

  const USE = {
    collect: useCollect,
    order: useOrder,
    turn: useTurn,
    follow: () => say(game, [say1('rest')]),
  };

  // Vor allen anderen Handlern: Ein Teil einer Aufgabe ist sonst nichts.
  world.onInteract.unshift(async ev => {
    const o = ev.target;
    if (o?.type !== 'task' || o.task !== area) return false;
    if (solved()) await say(game, [say1('done')]);
    else await USE[task.type](o);
    return true;
  });

  if (task.type === 'follow') addWisp(world, game, { task, run, solved, finish, say1, lines, firstTime: () => !introSeen && (introSeen = true) });
}

// ---------- Das Irrlicht (follow) ----------

function addWisp(world, game, { task, run, solved, finish, say1, lines, firstTime }) {
  const { stations } = task;
  const last = stations.at(-1);
  // Wo es gezeichnet wird: im Flug von from nach to, sonst an to (in Feldern).
  const flight = { from: null, to: stations[run.station], ms: 0 };
  const position = () => {
    if (!flight.from) return flight.to;
    const f = Math.min(1, flight.ms / FLY_MS);
    const ease = f * f * (3 - 2 * f);
    return { x: flight.from.x + (flight.to.x - flight.from.x) * ease, y: flight.from.y + (flight.to.y - flight.from.y) * ease };
  };
  const flyTo = (st, { jump = false } = {}) => {
    flight.from = jump || game.reducedMotion ? null : position();
    flight.to = st;
    flight.ms = 0;
  };
  world.onTick.push(dt => {
    if (!flight.from) return;
    flight.ms += dt;
    if (flight.ms >= FLY_MS) flight.from = null;
  });

  world.afterRender.push((ctx, cam) => {
    const resting = solved() || run.solved;
    const p = resting && !flight.from ? last : position();
    const bob = resting || game.reducedMotion ? 0 : Math.round(Math.sin(world.time / 450) * 1.5);
    const x = Math.round(p.x * T - cam.x + 8), y = Math.round(p.y * T - cam.y + (resting ? 3 : 1) + bob);
    if (x < -12 || y < -12 || x > 252 || y > 172) return;
    drawWisp(ctx, x, y, resting);
  });

  // Leise Sätze unterwegs (wie das Flüstern der Bäume): drei Sekunden, ohne Sperre.
  let node = null;
  let timer = null;
  function whisper(text) {
    node?.remove();
    clearTimeout(timer);
    node = el('div', { class: 'whisper passive', 'aria-live': 'polite' }, text);
    game.ui?.append(node);
    timer = setTimeout(() => node?.remove(), WHISPER_MS);
  }
  const baseExit = world.exit;
  world.exit = () => {
    baseExit?.();
    node?.remove();
  };

  if (solved()) return;
  world.onStepped.push((x, y) => {
    if (solved()) return null;
    const from = run.station;
    const r = act(run, task, { x, y });
    if (r.result === 'progress') {
      if (from === 0 && firstTime()) {
        return async () => {
          await say(game, lines('intro'));
          flyTo(stations[r.index]);
        };
      }
      flyTo(stations[r.index]);
      whisper(from === 0 ? say1('again') : lines('station')[r.index - 2]);
      return null;
    }
    if (r.result === 'wrong') {
      flyTo(stations[0], { jump: true });
      return async () => {
        sound('wrong');
        await say(game, [say1('tip')]);
      };
    }
    if (r.result === 'solved') {
      flyTo(last);
      return () => finish(lines('solved'));
    }
    return null;
  });
}

// Ein kleines Irrlicht: weicher Schein, mintgrüner Körper mit hellem Kern, zwei Augen und eine kleine
// Flamme obendrauf. Schlafend leuchtet es schwächer und hat die Augen zu. (x, y): Mitte auf dem Schirm.
function drawWisp(ctx, x, y, resting) {
  ctx.fillStyle = '#b5e3c4';
  ctx.globalAlpha = resting ? 0.18 : 0.28;
  ctx.fillRect(x - 5, y - 3, 11, 7);
  ctx.fillRect(x - 3, y - 5, 7, 11);
  ctx.globalAlpha = resting ? 0.75 : 1;
  ctx.fillRect(x - 1, y - 3, 3, 1);
  ctx.fillRect(x - 2, y - 2, 5, 4);
  ctx.fillRect(x - 1, y + 2, 3, 1);
  ctx.fillRect(x, y - 4, 1, 1); // Flamme
  ctx.fillStyle = '#a7dde8';
  ctx.fillRect(x + 1, y - 5, 1, 1);
  ctx.fillStyle = '#fffaf0';
  ctx.fillRect(x - 1, y - 2, 2, 1);
  ctx.fillStyle = '#1b1a2e';
  if (resting) {
    ctx.fillRect(x - 1, y, 1, 1);
    ctx.fillRect(x + 1, y, 1, 1);
  } else {
    ctx.fillRect(x - 1, y - 1, 1, 2);
    ctx.fillRect(x + 1, y - 1, 1, 2);
  }
  ctx.globalAlpha = 1;
}
