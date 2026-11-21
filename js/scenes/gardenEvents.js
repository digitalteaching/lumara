// Der Garten am Leuchtturm in der Welt (Lumara 1.2): Die Freunde, die nicht mitlaufen, stehen als
// Kleinbilder auf der Wiese. Jeder ruht eine Weile und geht dann langsam ein Feld weiter, die
// Wasserwesen nur am Teich. Ihre Felder stehen in world.blocked. A auf einen Freund öffnet seine
// Freundeskarte, das Schild sagt seine Zeilen und zählt die Freunde. Befreundete Wesen kämpfen nie.

import { CONFIG } from '../config.js';
import { cellKey, step } from '../world/map.js';
import { gardenFriends, placeFriends, wanderTarget } from '../world/garden.js';
import { worldLines } from '../world/network.js';
import { GARTEN } from '../world/maps/garten.js';
import { FRIENDABLE, WATER_FRIENDS, friendList } from '../friends/friends.js';
import { miniImages } from '../gfx/miniImages.js';
import { friendCard } from '../menu/friendsPage.js';
import { openSheet } from '../ui/sheet.js';
import { say } from '../ui/dialog.js';
import { createRng } from '../core/rng.js';
import { t } from '../i18n/i18n.js';

const T = 16;
const HOP_MS = 130; // wie beim Begleiter
const RETRY_MS = 1000; // fand ein Freund keinen Platz, sucht er so oft wieder
const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };
const NEIGHBOURS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

// Was das Schild am Ende des Wegs sagt: erst seine eigenen Zeilen in der Spielsprache, dann wie viele
// Freunde es gibt (alle, auch den Begleiter), ohne Freunde noch, wie man einen findet.
export function friendCountLines(state, sign) {
  const n = friendList(state).length;
  const lines = [...(worldLines(GARTEN, sign, 'lines') ?? []), t('garden.count', { n, max: FRIENDABLE.length })];
  if (!n) lines.push(t('friends.none'));
  return lines;
}

export function addGarden(world, game) {
  const { map, player } = world;
  const { stepMs, restMinMs, restMaxMs } = CONFIG.garden;
  // Ein eigener Zufall: Wohin die Freunde gehen, ändert nichts am übrigen Spiel.
  const rng = createRng((Math.random() * 2 ** 32) >>> 0);
  const restTime = () => restMinMs + rng.next() * (restMaxMs - restMinMs);
  const friends = new Map(); // Art → Freund, zugleich sein Actor in world.actors
  let pending = false; // ein Freund hat noch keinen Platz
  let retry = RETRY_MS;

  // Der Begleiter steht auf dem Feld, das die Figur zuletzt verlassen hat, oder hinter ihr.
  const behind = step(player, OPPOSITE[player.dir]);
  let trailX = behind.x, trailY = behind.y;
  function playerCells() {
    const back = step(player, OPPOSITE[player.dir]);
    return new Set([cellKey(player.x, player.y), cellKey(player.fromX, player.fromY), cellKey(trailX, trailY), cellKey(back.x, back.y)]);
  }

  // Position in Spielpixeln, beim Gehen weich zwischen den zwei Feldern.
  const progressOf = f => (f.moving ? Math.min(1, f.progress / stepMs) : 1);
  const pixelX = f => Math.round((f.fromX + (f.x - f.fromX) * progressOf(f)) * T);
  const pixelY = f => Math.round((f.fromY + (f.y - f.fromY) * progressOf(f)) * T);

  function createFriend(species, shiny, x, y) {
    const f = {
      species,
      shiny,
      x,
      y,
      fromX: x,
      fromY: y,
      moving: false,
      progress: 0,
      rest: restTime(),
      side: rng.next() < 0.5 ? 'left' : 'right', // die Bilder schauen nach rechts
      z: () => pixelY(f) / T,
      draw(ctx, cam) {
        const sx = pixelX(f) - cam.x, sy = pixelY(f) - cam.y - 2;
        if (sx < -T || sy < -T || sx > 240 || sy > 160) return;
        // Ein Kleinbild, das sich nicht bauen lässt, fehlt nur (js/gfx/miniImages.js warnt einmal).
        const images = miniImages(f.species, f.shiny);
        if (!images) return;
        const hop = f.moving && !game.reducedMotion ? Math.floor(world.time / HOP_MS) % 2 : 0;
        world.drawShadow(ctx, sx, sy);
        ctx.drawImage(images[f.side][hop], sx, sy);
      },
    };
    return f;
  }

  function remove(f) {
    world.blocked.delete(cellKey(f.x, f.y));
    if (f.moving) world.blocked.delete(cellKey(f.fromX, f.fromY));
    friends.delete(f.species);
    const i = world.actors.indexOf(f);
    if (i >= 0) world.actors.splice(i, 1);
  }

  // Wer im Garten wohnt, hängt am Begleiter und an den Freunden im Spielstand. Ändert sich das (Karte
  // oder Menü), bleiben alle, die schon da sind, auf ihrem Feld; Neue kommen auf ein freies Feld.
  let seenCompanion, seenFriends, seenCount;
  function changed() {
    const s = game.state;
    let n = 0;
    if (s.friends) for (const id in s.friends) if (s.friends[id]) n++;
    if (s.companion === seenCompanion && s.friends === seenFriends && n === seenCount) return false;
    seenCompanion = s.companion;
    seenFriends = s.friends;
    seenCount = n;
    return true;
  }

  function rebuild() {
    changed();
    const list = gardenFriends(game.state);
    const wanted = new Map(list.map(f => [f.species, f]));
    for (const f of [...friends.values()]) {
      const w = wanted.get(f.species);
      if (!w) remove(f);
      else if (w.shiny !== f.shiny) f.shiny = w.shiny;
    }
    const newcomers = list.filter(f => !friends.has(f.species));
    pending = false;
    if (!newcomers.length) return;
    // Neue Freunde stellen sich auch nicht direkt neben die Figur: Sonst könnten sie sie bei
    // reduzierter Bewegung, wenn niemand weitergeht, für immer einschließen.
    const avoid = new Set([...world.blocked, ...playerCells()]);
    for (const [dx, dy] of NEIGHBOURS) avoid.add(cellKey(player.x + dx, player.y + dy));
    const placed = placeFriends(map, newcomers, rng, avoid);
    for (const n of newcomers) {
      const at = placed.get(n.species);
      if (!at) {
        pending = true;
        continue;
      }
      const f = createFriend(n.species, n.shiny, at.x, at.y);
      friends.set(n.species, f);
      world.actors.push(f);
      world.blocked.add(cellKey(at.x, at.y));
    }
  }

  // Ein Schritt belegt das neue Feld sofort und gibt das alte erst frei, wenn der Freund angekommen ist.
  function walk(f) {
    const occupied = playerCells();
    const to = wanderTarget(map, f, rng, { occupied: { has: k => world.blocked.has(k) || occupied.has(k) }, water: WATER_FRIENDS.has(f.species) });
    f.rest = restTime();
    if (!to) return;
    if (to.x !== f.x) f.side = to.x < f.x ? 'left' : 'right';
    f.fromX = f.x;
    f.fromY = f.y;
    f.x = to.x;
    f.y = to.y;
    f.moving = true;
    f.progress = 0;
    world.blocked.add(cellKey(to.x, to.y));
  }

  function arrive(f) {
    world.blocked.delete(cellKey(f.fromX, f.fromY));
    f.fromX = f.x;
    f.fromY = f.y;
    f.moving = false;
    f.progress = 0;
    f.rest = restTime();
  }

  // Läuft auch, während die Welt gesperrt ist: Ein angefangener Schritt endet, ein neuer beginnt erst danach.
  world.onTick.push(dt => {
    if (changed()) rebuild();
    else if (pending && (retry -= dt) <= 0) {
      retry = RETRY_MS;
      rebuild();
    }
    if (player.moving) {
      trailX = player.fromX;
      trailY = player.fromY;
    }
    for (const f of friends.values()) {
      if (f.moving) {
        f.progress += dt;
        if (f.progress >= stepMs) arrive(f);
      } else if (!game.reducedMotion && !world.locked && (f.rest -= dt) <= 0) {
        walk(f);
      }
    }
  });

  const friendAt = (x, y) => {
    for (const f of friends.values()) if ((f.x === x && f.y === y) || (f.moving && f.fromX === x && f.fromY === y)) return f;
    return null;
  };

  // A auf einen Freund: Er schaut zur Figur, dann seine Freundeskarte. Danach neu aufbauen, denn auf
  // der Karte kann man ihn mitnehmen oder den Begleiter zurückschicken. Vor dem Begleiter-Handler.
  world.onInteract.unshift(async ev => {
    if (ev.target) return false;
    const f = friendAt(ev.x, ev.y);
    if (!f) return false;
    if (player.x !== f.x) f.side = player.x < f.x ? 'left' : 'right';
    await openSheet(game, friendCard(game, f.species));
    rebuild();
    return true;
  });

  // Das Schild am Ende des Wegs zählt alle Freunde, auch den Begleiter. Vor dem allgemeinen Schild.
  world.onInteract.unshift(async ev => {
    const o = ev.target;
    if (o?.type !== 'sign' || o.role !== 'friendCount') return false;
    await say(game, friendCountLines(game.state, o));
    return true;
  });

  rebuild();
}
