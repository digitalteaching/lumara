// Weltszene: Laufen durch die Bucht, Kamera, Zeichnen, Gespräche und Ereignisse.

import { createMap, cellKey } from '../world/map.js';
import { createPlayer } from '../world/player.js';
import { BUCHT } from '../world/maps/bucht.js';
import { TILES, BUILDINGS, PROPS, OVERLAY_TILES } from '../gfx/art/tiles.js';
import { spriteFrom } from '../gfx/canvasSprites.js';
import { CHARACTERS } from '../gfx/art/characters.js';
import { say } from '../ui/dialog.js';
import { npcLines } from '../world/network.js';

const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };

const T = 16;
const SCREEN_W = 240;
const SCREEN_H = 160;

function tileCanvas(kind, frame = 0) {
  const frames = TILES[kind];
  const f = frames[frame % frames.length];
  return spriteFrom(`tile:${kind}:${frame % frames.length}`, f);
}

// Weiche Nebeltextur (64×64), einmal erzeugt.
let fogTexture = null;
function getFogTexture() {
  if (fogTexture) return fogTexture;
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const g = c.getContext('2d');
  const blobs = [[10, 12, 16], [40, 8, 14], [28, 34, 18], [54, 40, 13], [8, 50, 14], [44, 58, 12]];
  for (const [x, y, r] of blobs) {
    for (const [ox, oy] of [[0, 0], [64, 0], [-64, 0], [0, 64], [0, -64]]) {
      const grad = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
      grad.addColorStop(0, 'rgba(240, 241, 250, 0.75)');
      grad.addColorStop(1, 'rgba(212, 214, 230, 0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
    }
  }
  fogTexture = c;
  return c;
}

// opts.hidePlayer, opts.hiddenIds und opts.passive braucht das Intro
// (Boot legt an, noch keine Spielfigur, Tasten bewegen nichts).
// opts.openGates: offene Nebeltore dieser Karte (Plan 3a).
export function createWorldScene(game, def = BUCHT, opts = {}) {
  const hiddenIds = new Set(opts.hiddenIds ?? []);
  const map = createMap(def, { openGates: opts.openGates ?? [] });
  const start = game.state?.position?.map === def.id ? game.state.position : def.spawn;
  const player = createPlayer(start);
  const onStepped = [];
  const onInteract = [];
  const onTick = []; // (dt) – läuft auch, während die Welt gesperrt ist
  const afterRender = []; // (ctx, cam) – z. B. Ausrufezeichen über Trainern
  const rustle = new Map();
  const facing = new Map(); // Figuren, die sich zur Spielfigur gedreht haben
  let locked = 0;
  let time = 0;

  // Nebelfelder; neu berechnet, wenn sich ein Tor öffnet. fogAlpha: einzelne Felder, die gerade weichen.
  let fogCells = [];
  const fogAlpha = new Map();
  function refreshFog() {
    fogCells = [];
    for (let y = 0; y < map.height; y++) for (let x = 0; x < map.width; x++) if (map.tileAt(x, y) === 'fog') fogCells.push([x, y]);
  }
  refreshFog();

  // Welches Bild ein Objekt der Welt gerade zeigt. worldEvents ersetzt die Einträge (Sträucher, Zettel).
  const propVariant = {
    beacon: o => (game.state?.stones?.includes(o.number) ? 'beaconLit' : 'beaconDark'),
    bush: () => 'bush',
    notestone: () => 'noteStone',
    whisper: () => 'oldtree',
  };

  async function lock(fn) {
    locked++;
    try {
      return await fn();
    } finally {
      locked--;
    }
  }

  async function handle(handlers, ...args) {
    for (const fn of handlers) {
      const handled = await fn(...args);
      if (handled) return true;
    }
    return false;
  }

  function camera() {
    const p = player.pixel();
    const maxX = map.width * T - SCREEN_W;
    const maxY = map.height * T - SCREEN_H;
    return {
      x: Math.max(0, Math.min(maxX, p.x + 8 - SCREEN_W / 2)),
      y: Math.max(0, Math.min(maxY, p.y + 8 - SCREEN_H / 2)),
    };
  }

  // Boden unter Steinen: der häufigste flache Boden der Nachbarfelder.
  const GROUNDS = new Set(['grass', 'sand', 'path', 'flowers', 'moss']);
  function groundAt(x, y) {
    const counts = {};
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const k = map.tileAt(x + dx, y + dy);
      if (GROUNDS.has(k)) counts[k] = (counts[k] ?? 0) + 1;
    }
    const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return best ? (best[0] === 'flowers' ? 'grass' : best[0]) : 'grass';
  }

  function drawShore(ctx, x, y, sx, sy) {
    const land = (nx, ny) => map.inBounds(nx, ny) && map.tileAt(nx, ny) !== 'water';
    const wave = Math.floor(time / 600) % 2;
    ctx.fillStyle = '#a7dde8';
    if (land(x, y - 1)) for (let i = 0; i < 16; i += 2) ctx.fillRect(sx + i + wave, sy, 1, 1 + ((i + wave) % 4 === 0 ? 1 : 0));
    if (land(x - 1, y)) for (let i = 0; i < 16; i += 3) ctx.fillRect(sx, sy + i + wave, 1, 2);
    if (land(x + 1, y)) for (let i = 0; i < 16; i += 3) ctx.fillRect(sx + 15, sy + i + wave, 1, 2);
  }

  function drawFog(ctx, cam) {
    if (!fogCells.length) return;
    ctx.save();
    ctx.beginPath();
    for (const [x, y] of fogCells) if (!fogAlpha.has(cellKey(x, y))) ctx.rect(x * T - cam.x, y * T - cam.y, T, T + 6);
    ctx.clip();
    const tex = getFogTexture();
    const still = game.reducedMotion;
    const layers = [
      { dx: still ? 0 : time / 160, dy: 0, alpha: 0.85 },
      { dx: still ? 20 : -time / 230, dy: still ? 10 : time / 900, alpha: 0.6 },
    ];
    for (const l of layers) {
      ctx.globalAlpha = l.alpha;
      const ox = (((-cam.x + l.dx) % 64) + 64) % 64 - 64;
      const oy = (((-cam.y + l.dy) % 64) + 64) % 64 - 64;
      for (let y = oy; y < SCREEN_H; y += 64) for (let x = ox; x < SCREEN_W; x += 64) ctx.drawImage(tex, Math.round(x), Math.round(y));
    }
    ctx.restore();
  }

  function npcSprite(o) {
    const dir = facing.get(o) ?? o.dir;
    return { dir, key: o.sprite };
  }

  const scene = {
    map,
    player,
    onStepped,
    onInteract,
    onTick,
    afterRender,
    lock,
    camera,
    refreshFog,
    fogAlpha,
    propVariant,
    get time() {
      return time;
    },
    get locked() {
      return locked > 0;
    },
    // step: 0 steht, 1 und 2 sind abwechselnde Schritte
    drawCharacter(ctx, key, dir, step, x, y) {
      const set = CHARACTERS[key];
      if (!set) return;
      const d = dir === 'left' || dir === 'right' ? 'side' : dir;
      const frames = set[d];
      let idx = 0;
      let flip = dir === 'left';
      if (step) {
        idx = Math.min(1, frames.length - 1);
        if (d !== 'side' && step === 2) flip = !flip;
      }
      ctx.fillStyle = 'rgba(27, 26, 46, 0.28)';
      ctx.fillRect(x + 4, y + 15, 8, 2);
      ctx.fillRect(x + 3, y + 16, 10, 1);
      ctx.drawImage(spriteFrom(`char:${key}:${d}:${idx}`, frames[idx], { flip }), x, y);
    },
    turnToward(o, dir) {
      facing.set(o, dir);
    },
    resetFacing(o) {
      facing.delete(o);
    },

    enter() {
      game.mode = 'walk';
    },

    update(dt) {
      time += dt;
      for (const [k, ms] of rustle) {
        if (ms - dt <= 0) rustle.delete(k);
        else rustle.set(k, ms - dt);
      }
      for (const fn of [...onTick]) fn(dt);
      if (locked || opts.passive) return;
      const intent = { dir: game.input.dir(), a: game.input.pressed('a') };
      const events = player.update(dt, intent, map);
      for (const ev of events) {
        if (ev.type === 'stepped') {
          if (map.isTallGrass(ev.x, ev.y)) rustle.set(cellKey(ev.x, ev.y), 220);
          if (game.state) game.state.position = { map: def.id, x: ev.x, y: ev.y, dir: player.dir };
          // Handler entscheiden sofort: null oder eine Aktion, die unter Sperre läuft.
          for (const fn of onStepped) {
            const action = fn(ev.x, ev.y);
            if (action) {
              player.cancelMove();
              lock(action);
              break;
            }
          }
        } else if (ev.type === 'interact') {
          if (onInteract.length) lock(() => handle(onInteract, ev));
        }
      }
    },

    render(ctx) {
      const cam = camera();
      const x0 = Math.floor(cam.x / T), y0 = Math.floor(cam.y / T);
      const waterFrame = Math.floor(time / 600) % 2;

      for (let y = y0; y <= y0 + 10 && y < map.height; y++) {
        for (let x = x0; x <= x0 + 15 && x < map.width; x++) {
          const kind = map.tileAt(x, y);
          const sx = x * T - cam.x, sy = y * T - cam.y;
          const frame = kind === 'water' ? waterFrame : map.isTallGrass(x, y) && rustle.has(cellKey(x, y)) ? 1 : 0;
          if (OVERLAY_TILES.has(kind)) ctx.drawImage(tileCanvas(groundAt(x, y)), sx, sy);
          ctx.drawImage(tileCanvas(kind, frame), sx, sy);
          if (kind === 'water') drawShore(ctx, x, y, sx, sy);
        }
      }

      // Gebäude, Figuren und Spielfigur nach unterer Kante sortiert
      const drawables = [];
      for (const o of def.objects) {
        if (o.id && hiddenIds.has(o.id)) continue;
        if (o.type === 'building') {
          const img = spriteFrom(`building:${o.sprite}`, BUILDINGS[o.sprite]);
          const bx = o.x * T - cam.x, by = (o.y + o.h) * T - img.height - cam.y;
          drawables.push({ z: o.y + o.h - 1, draw: () => ctx.drawImage(img, bx, by) });
        } else if (propVariant[o.type]) {
          // Leuchtsteine, Sträucher, Zettelsteine, Altbäume: unten auf ihrem Feld, hohe Bilder ragen nach oben
          const img = spriteFrom(`prop:${propVariant[o.type](o)}`, PROPS[propVariant[o.type](o)]);
          const px = o.x * T - cam.x, py = (o.y + 1) * T - img.height - cam.y;
          drawables.push({ z: o.y, draw: () => ctx.drawImage(img, px, py) });
        } else if (o.type === 'sign') {
          drawables.push({ z: o.y, draw: () => ctx.drawImage(spriteFrom('prop:sign', PROPS.sign), o.x * T - cam.x, o.y * T - cam.y) });
        } else if (o.type === 'npc' || o.type === 'trainer') {
          const pos = o.pixel ? o.pixel() : { x: o.x * T, y: o.y * T };
          const s = npcSprite(o);
          const step = o.walking ? (Math.floor(time / 130) % 2) + 1 : 0;
          drawables.push({ z: pos.y / T, draw: () => scene.drawCharacter(ctx, s.key, s.dir, step, pos.x - cam.x, pos.y - cam.y - 2) });
        }
      }
      const pp = player.pixel();
      if (!opts.hidePlayer) drawables.push({
        z: pp.y / T + 0.01,
        draw: () => {
          const step = player.moving && player.progress < 0.6 ? (player.frame ? 1 : 2) : 0;
          scene.drawCharacter(ctx, 'player', player.dir, step, pp.x - cam.x, pp.y - cam.y - 2);
          // Hohes Gras verdeckt die Füße
          const onGrass = map.isTallGrass(player.x, player.y) && (!player.moving || player.progress > 0.5);
          if (onGrass) {
            const img = tileCanvas(map.tileAt(player.x, player.y), rustle.has(cellKey(player.x, player.y)) ? 1 : 0);
            ctx.drawImage(img, 0, 10, 16, 6, player.x * T - cam.x, player.y * T - cam.y + 10, 16, 6);
          }
        },
      });
      drawables.sort((a, b) => a.z - b.z);
      for (const d of drawables) d.draw();

      // Licht der Leuchtturmlampe
      const lh = def.objects.find(o => o.id === 'leuchtturm');
      if (lh) {
        const cx = lh.x * T + 16 - cam.x, cy = (lh.y + lh.h) * T - 64 + 10 - cam.y;
        const pulse = game.reducedMotion ? 0.35 : 0.3 + 0.12 * Math.sin((time / 2400) * Math.PI * 2);
        const grad = ctx.createRadialGradient(cx, cy, 1, cx, cy, 22);
        grad.addColorStop(0, `rgba(255, 224, 138, ${pulse})`);
        grad.addColorStop(1, 'rgba(255, 224, 138, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(cx - 22, cy - 22, 44, 44);
      }

      drawFog(ctx, cam);
      for (const fn of afterRender) fn(ctx, cam);
    },
  };

  // Gespräche mit Bewohnern, Schilder und verschlossene Türen.
  // Trainer und die Leuchtturmtür übernehmen spätere Handler (Task 17).
  onInteract.push(async ev => {
    const o = ev.target;
    if (!o) return false;
    if (o.type === 'npc') {
      scene.turnToward(o, OPPOSITE[player.dir]);
      await say(game, game.state ? npcLines(o, game.state, def.area) : o.lines, { speaker: o.name });
      scene.resetFacing(o);
      return true;
    }
    if (o.type === 'sign') {
      await say(game, o.lines);
      return true;
    }
    if (o.type === 'building') {
      // Jede Zelle der vorderen Reihe zählt als Tür, wenn man nach oben darauf schaut.
      const front = player.dir === 'up' && ev.y === o.y + o.h - 1;
      if (!front || o.onDoor === 'heal') return false;
      await say(game, o.lines ?? ['Die Tür ist verschlossen.']);
      return true;
    }
    return false;
  });

  return scene;
}
