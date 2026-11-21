// Spielaufgaben in der Welt (Lumara 1.2, Spec 6.6). Regeln: js/world/tasks.js, Daten und Orte:
// js/data/tasks.js, Texte: i18n task.<gebiet>.*, Zeichnungen ohne Kartenobjekt: js/gfx/taskDraw.js.
// Jede Aufgabe hat intro, tip, solved und done, dazu je Art (tests/tasks.test.js prüft das):
// - collect: speaker (wer belohnt), hurry, gone, item.<i>, left.<n> (n Teile fehlen noch)
// - order:   clue ({list}), progress ({n}, {of}), again (nicht bei Platten), start ({list}, falsches
//            erstes Teil), symbol.<i> (Namen für die Liste), part.<i>
// - turn:    turned ({dir} aus gear.dir.<0 bis 3>), set (ein Teil steht jetzt richtig); gibt es Teile
//            mit role clue oder prize (Wimpel, Drachen), auch clue ({dir}: die Windrichtung) und prize
// - follow:  station (ein Satz je Station zwischen Anfang und Ende), again, rest (Teil am Ende),
//            back (leise: verloren, bevor man einmal gefolgt ist)
// Bilder: collect giver <prop ohne Zahl><gefunden>, item <prop>Done; order switch <prop>Lit und für
// das letzte Teil <prop>Open; turn switch <prop ohne Zahl><stellung>, mit spin am Ziel im Wechsel mit
// <…>Spin; prize und ein giver außerhalb von collect gelöst <prop>Done.
// - Bilder: propVariant.task wählt das Bild eines Teils nach Stand (gefunden, leuchtet, Stellung);
//   eine gelöste Aufgabe zeigt immer ihren Endzustand (Küken im Nest, Astloch offen, Statuen schauen
//   zum Leuchtstein, das Irrlicht schläft, Windräder drehen sich, der Drachen fliegt, die Hasen haben
//   ihren Fund verschenkt).
// - A vor einem Teil: ein Satz zum Teil, nach einem Fehler ein Tipp. Gelöst: Fund-Jingle, der seltene
//   Schatz des Gebiets und ein Leckerli, sofort gespeichert. Danach sagt jedes Teil nur noch done.
// - Platten (order mit plates, Sternenwiese): Wer auf einen Stein tritt, läuft weiter; Leuchten und
//   Zählen kommen leise. Erst ein falscher Stein, wenn schon einer leuchtet, hält mit einem Tipp an.
// - Folgen (Irrlicht im Moor, Pfotenspuren am See): Nach jedem Schritt prüft onStepped den Abstand zur
//   aktuellen Station. Die Sätze unterwegs erscheinen leise wie das Flüstern der Bäume, ohne die Figur
//   anzuhalten.
// - Schleuse (order mit chamber, Ruinen): Mit jedem richtigen Hebel sinkt das Wasser hinter dem Tor,
//   gelöst ist das Kanalstück leer. Nur ein Bild: Die Kacheln bleiben Kanal.
// Der Fortschritt lebt nur in dieser Weltszene; wer die Karte verlässt, fängt neu an.

import { act, createRun, foundCount, isFound, orderLit, solveTask, taskOn, taskSolved, turnState } from '../world/tasks.js';
import { treasureName } from '../items/treasures.js';
import { sound, jingle } from '../audio/bus.js';
import { say } from '../ui/dialog.js';
import { el } from '../ui/dom.js';
import { t, tl } from '../i18n/i18n.js';
import { PROPS } from '../gfx/art/tiles.js';
import { spriteFrom } from '../gfx/canvasSprites.js';
import { drawChamber, drawPaw, drawPlateGlow, drawWisp } from '../gfx/taskDraw.js';
import { cellKey } from '../world/map.js';

const T = 16;
const FLY_MS = 700; // so lange fliegt das Irrlicht zur nächsten Station
const WHISPER_MS = 3000;
const SPIN_MS = 300; // ein Bild des Windrads, das sich dreht (wie die Windräder zum Anschauen)
const STUB = 3; // so viele Spuren sieht man am Anfang, bevor man ihnen folgt
const onScreen = (x, y, w = T, h = T) => x > -w && y > -h && x < 240 && y < 160;

// Das Bild mit einer anderen Zahl am Ende: gullnest0 → gullnest3, glassstatue3 → glassstatue1.
const numbered = (prop, n) => `${prop.replace(/\d+$/, '')}${n}`;

// io ersetzt in Tests say (Dialog) und whisper (leiser Satz). Gibt den Lauf dieses Besuchs zurück.
export function addTasks(world, game, io = {}) {
  const task = taskOn(world.mapId);
  if (!task) return null;
  const { area } = task;
  const run = createRun(task);
  const solved = () => taskSolved(game.state, area);
  const speak = io.say ?? say;
  // Texte dieser Aufgabe: task.<gebiet>.<teil>, als Zeile (say1) oder als Liste von Zeilen (lines).
  const say1 = (part, params) => t(`task.${area}.${part}`, params);
  const lines = part => tl(`task.${area}.${part}`);
  let introSeen = false; // die Einleitung kommt einmal je Besuch
  const introOnce = () => {
    if (introSeen) return [];
    introSeen = true;
    return lines('intro');
  };

  // Leise Sätze (wie das Flüstern der Bäume): drei Sekunden, ohne Sperre.
  let node = null;
  let timer = null;
  const whisper = io.whisper ?? (text => {
    if (!game.ui) return;
    node?.remove();
    clearTimeout(timer);
    node = el('div', { class: 'whisper passive', 'aria-live': 'polite' }, text);
    game.ui.append(node);
    timer = setTimeout(() => node?.remove(), WHISPER_MS);
  });
  const baseExit = world.exit;
  world.exit = () => {
    baseExit?.();
    node?.remove();
  };

  // ---------- Bilder ----------

  function look(o) {
    const done = solved();
    if (o.role === 'prize' || (o.role === 'giver' && task.type !== 'collect')) return done ? `${o.prop}Done` : o.prop;
    if (task.type === 'collect') {
      if (o.role === 'giver') return numbered(o.prop, done ? task.items : foundCount(run));
      return done || isFound(run, o.index) ? `${o.prop}Done` : o.prop;
    }
    if (task.type === 'order' && o.role === 'switch') {
      if (done) return `${o.prop}${o.index === task.order.at(-1) ? 'Open' : 'Lit'}`;
      return orderLit(run, task, o.index) ? `${o.prop}Lit` : o.prop;
    }
    if (task.type === 'turn' && o.role === 'switch') {
      const dir = done ? task.goal[o.index] : turnState(run, o.index);
      // Steht ein Windrad richtig im Wind, dreht es sich: zwei Bilder im Wechsel, bei „Bewegung
      // reduzieren“ steht es still.
      const turning = task.spin && dir === task.goal[o.index] && !game.reducedMotion && Math.floor(world.time / SPIN_MS) % 2 === 1;
      return `${numbered(o.prop, dir)}${turning ? 'Spin' : ''}`;
    }
    return o.prop;
  }
  world.propVariant.task = o => (o.task === area ? look(o) : o.prop);

  // ---------- Lösen ----------

  // Erst speichern, dann erzählen: Auch wer den Dialog wegtippt, behält den Fund.
  async function finish(text, opts) {
    const out = solveTask(game.state, area);
    if (out) game.save();
    await speak(game, text, opts);
    if (!out) return;
    jingle('find');
    await speak(game, [t('task.reward', { name: treasureName(out.treasure) })]);
  }

  // ---------- A vor einem Teil ----------

  async function useCollect(o) {
    const speaker = say1('speaker');
    const r = act(run, task, { role: o.role, index: o.index });
    if (o.role === 'item') {
      if (r.result !== 'progress') return speak(game, [say1('gone')]);
      sound('confirm');
      return speak(game, [say1(`item.${o.index}`), say1(`left.${r.left}`)]);
    }
    if (r.result === 'solved') return finish(lines('solved'), { speaker });
    // Beim ersten Gespräch die Bitte (oder, wenn schon ein Teil gefunden ist, der Tipp) und die
    // Warnung, dass beim Verlassen der Karte alles wieder versteckt ist.
    const out = foundCount(run) === 0 && !introSeen ? lines('intro') : [say1('tip')];
    if (!introSeen) out.push(say1('hurry'));
    introSeen = true;
    return speak(game, out, { speaker });
  }

  const orderList = () => task.order.map(i => say1(`symbol.${i}`)).join(', ');

  async function useOrder(o) {
    if (o.role === 'clue') return speak(game, [...introOnce(), say1('clue', { list: orderList() })]);
    const r = act(run, task, { role: o.role, index: o.index });
    const part = say1(`part.${o.index}`);
    if (r.result === 'solved') return finish([part, ...lines('solved')]);
    if (r.result === 'progress') {
      sound('confirm');
      return speak(game, [part, say1('progress', { n: r.step, of: task.order.length })]);
    }
    if (r.result === 'wrong') {
      sound('wrong');
      return speak(game, [part, say1('tip', { list: orderList() })]);
    }
    // Noch nichts angefangen und nicht das erste Teil: kein Fehler, nur ein freundlicher Hinweis.
    if (r.notFirst) return speak(game, [part, say1('start', { list: orderList() })]);
    return speak(game, [part, say1('again')]);
  }

  async function useTurn(o) {
    // Wimpel an der Stange (clue) und Drachen (prize): ein Satz, beim ersten Mal nach der Einleitung.
    if (o.role !== 'switch') return speak(game, [...introOnce(), say1(o.role, { dir: t(`gear.dir.${task.wind}`) })]);
    const r = act(run, task, { role: o.role, index: o.index });
    if (r.result === 'nothing') return;
    const set = r.dir === task.goal[r.index];
    sound(set ? 'confirm' : 'tile');
    const out = [...introOnce(), say1('turned', { dir: t(`gear.dir.${r.dir}`) })];
    if (r.away) out.push(say1('tip'));
    if (r.result === 'solved') return finish([...out, ...lines('solved')]);
    // Ein Teil steht jetzt richtig: Das sagt ein kurzer Satz, die anderen fehlen vielleicht noch. {n}:
    // so viele stehen gerade richtig, {of}: so viele gibt es (die Dünen zählen mit).
    const n = task.goal.filter((g, i) => turnState(run, i) === g).length;
    if (set) out.push(say1('set', { n, of: task.goal.length }));
    return speak(game, out);
  }

  const USE = {
    collect: useCollect,
    order: useOrder,
    turn: useTurn,
    follow: () => speak(game, [say1('rest')]),
  };

  // Vor allen anderen Handlern: Ein Teil einer Aufgabe ist sonst nichts.
  world.onInteract.unshift(async ev => {
    const o = ev.target;
    if (o?.type !== 'task' || o.task !== area) return false;
    if (solved()) await speak(game, [say1('done')]);
    else await USE[task.type](o);
    return true;
  });

  // ---------- Steine zum Betreten (Sternenwiese) ----------

  if (task.plates) {
    world.groundRender.push((ctx, cam) => {
      const done = solved();
      task.plates.forEach((p, i) => {
        const x = p.x * T - cam.x, y = p.y * T - cam.y;
        if (!onScreen(x, y)) return;
        const lit = done || orderLit(run, task, i);
        if (lit) drawPlateGlow(ctx, x, y, game.reducedMotion ? 0 : world.time);
        const name = `starplate${i}${lit ? 'Lit' : ''}`;
        ctx.drawImage(spriteFrom(`prop:${name}`, PROPS[name]), x, y);
      });
    });
    if (!solved()) {
      world.onStepped.push((x, y) => {
        const i = task.plates.findIndex(p => p.x === x && p.y === y);
        if (i < 0 || solved()) return null;
        const r = act(run, task, { x, y });
        const part = say1(`part.${i}`);
        if (r.result === 'progress') {
          sound('confirm');
          whisper(`${part} ${say1('progress', { n: r.step, of: task.order.length })}`);
          return null;
        }
        if (r.result === 'solved') return () => finish([part, ...lines('solved')]);
        if (r.result === 'wrong') {
          return async () => {
            sound('wrong');
            await speak(game, [part, say1('tip', { list: orderList() })]);
          };
        }
        // Noch keiner leuchtet: kein Fehler, nur leise, womit man anfängt. Ein heller Stein: nichts.
        if (r.notFirst) whisper(say1('start', { list: orderList() }));
        return null;
      });
    }
  }

  // ---------- Schleuse (Ruinen) ----------

  if (task.chamber) {
    const c = task.chamber;
    world.groundRender.push((ctx, cam) => {
      const x = c.x * T - cam.x, y = c.y * T - cam.y;
      if (!onScreen(x, y, c.w * T, c.h * T)) return;
      drawChamber(ctx, x, y, c, solved() ? 1 : run.step / task.order.length);
    });
  }

  if (task.type === 'follow') addFollow(world, game, { task, run, solved, finish, say1, lines, speak, whisper, firstTime: () => !introSeen && (introSeen = true) });
  return run;
}

// ---------- Folgen (Irrlicht, Pfotenspuren) ----------

function addFollow(world, game, { task, run, solved, finish, say1, lines, speak, whisper, firstTime }) {
  const { stations } = task;
  const guide = task.guide === 'paws' ? addPaws(world, task, run, solved) : addWisp(world, game, task, run, solved);
  if (solved()) return;
  world.onStepped.push((x, y) => {
    if (solved()) return null;
    const from = run.station;
    const r = act(run, task, { x, y });
    if (r.result === 'progress') {
      if (from === 0 && firstTime()) {
        return async () => {
          await speak(game, lines('intro'));
          guide.moveTo(r.index);
        };
      }
      guide.moveTo(r.index);
      whisper(from === 0 ? say1('again') : lines('station')[r.index - 2]);
      return null;
    }
    if (r.result === 'wrong') {
      guide.moveTo(0, { jump: true });
      // Noch keiner Station gefolgt (from 1: nur angefangen): leise zurück, ohne Fehlerton und Dialog.
      if (from < 2) {
        whisper(say1('back'));
        return null;
      }
      return async () => {
        sound('wrong');
        await speak(game, [say1('tip')]);
      };
    }
    if (r.result === 'solved') {
      guide.moveTo(stations.length - 1);
      return () => finish(lines('solved'));
    }
    return null;
  });
}

// Das Irrlicht im Moor: Es wartet an seiner Station und fliegt zur nächsten (bei „Bewegung reduzieren“
// springt es). Gelöst schläft es auf dem Wurzelstock.
function addWisp(world, game, task, run, solved) {
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
  return {
    moveTo(i, { jump = false } = {}) {
      flight.from = jump || game.reducedMotion ? null : position();
      flight.to = stations[i];
      flight.ms = 0;
    },
  };
}

// Pfotenspuren am See: Am Anfang sieht man ein paar Spuren beim Zelt. Wer ihnen folgt, sieht die Spur
// bis zur nächsten Station; frühere Stücke bleiben blass. Gelöst sind die Hasen daheim, ohne Spur.
// Die Spuren liegen auf einem kürzesten Weg ohne hohes Gras, am liebsten über Schnee.
function addPaws(world, task, run, solved) {
  const paths = pawPaths(world.map, task);
  world.groundRender.push((ctx, cam) => {
    if (solved() || run.solved) return;
    const pieces = run.station === 0 ? [[paths[0].slice(0, STUB), 1]] : paths.slice(0, run.station).map((p, i) => [p, i === run.station - 1 ? 1 : 0.45]);
    for (const [cells, alpha] of pieces) {
      for (const c of cells) {
        const x = c.x * T - cam.x + 8, y = c.y * T - cam.y + 8;
        if (onScreen(x, y)) drawPaw(ctx, x, y, c.dir, { alpha, side: (c.x + c.y) % 2 ? 1 : -1 });
      }
    }
  });
  return { moveTo() {} }; // die Spuren folgen dem Lauf (run.station) von selbst
}

// Die Stücke der Spur: von jeder Station zur nächsten (tests/tasks.test.js prüft, dass keins leer ist).
export const pawPaths = (map, { stations }) => stations.slice(1).map((to, i) => trail(map, stations[i], to));

const STEPS = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // nach Richtung 0 oben, 1 rechts, 2 unten, 3 links

// Ein kürzester Weg von from bis zu to (oder neben to, wenn dort etwas steht) über begehbare Felder
// ohne hohes Gras; Schnee kostet weniger als Eis. Jedes Feld mit der Richtung, in die die Spur läuft.
function trail(map, from, to) {
  const goal = (x, y) => (map.canEnter(to.x, to.y) ? x === to.x && y === to.y : Math.abs(x - to.x) + Math.abs(y - to.y) === 1);
  const cost = new Map([[cellKey(from.x, from.y), 0]]);
  const prev = new Map();
  const open = [{ x: from.x, y: from.y, c: 0 }];
  let end = null;
  while (open.length) {
    open.sort((a, b) => a.c - b.c);
    const cur = open.shift();
    if (cur.c > cost.get(cellKey(cur.x, cur.y))) continue;
    if (goal(cur.x, cur.y)) {
      end = cur;
      break;
    }
    STEPS.forEach(([dx, dy], dir) => {
      const x = cur.x + dx, y = cur.y + dy, k = cellKey(x, y);
      if (!map.canEnter(x, y) || map.isTallGrass(x, y)) return;
      const c = cur.c + (map.tileAt(x, y) === 'snow' ? 1 : 3);
      if (cost.has(k) && cost.get(k) <= c) return;
      cost.set(k, c);
      prev.set(k, { x: cur.x, y: cur.y, dir });
      open.push({ x, y, c });
    });
  }
  if (!end) return [];
  const cells = [];
  for (let c = { x: end.x, y: end.y }; c; ) {
    const p = prev.get(cellKey(c.x, c.y));
    cells.unshift({ x: c.x, y: c.y, dir: p?.dir });
    c = p ? { x: p.x, y: p.y } : null;
  }
  // Das erste Feld zeigt schon zum zweiten.
  if (cells.length > 1) cells[0].dir = cells[1].dir;
  else if (cells.length) cells[0].dir = 1;
  return cells;
}
