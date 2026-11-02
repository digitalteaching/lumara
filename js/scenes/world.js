// Weltszene: Laufen durch die Bucht, Kamera, Zeichnen, Gespräche und Ereignisse.

import { createMap, cellKey } from '../world/map.js';
import { createPlayer } from '../world/player.js';
import { BUCHT } from '../world/maps/bucht.js';
import { TILES, BUILDINGS, PROPS, OVERLAY_TILES } from '../gfx/art/tiles.js';
import { spriteFrom } from '../gfx/canvasSprites.js';

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

export function createWorldScene(game, def = BUCHT) {
  const map = createMap(def);
  const start = game.state?.position?.map === def.id ? game.state.position : def.spawn;
  const player = createPlayer(start);
  const onStepped = [];
  const onInteract = [];
  const rustle = new Map();
  const facing = new Map(); // Figuren, die sich zur Spielfigur gedreht haben
  let locked = 0;
  let time = 0;

  const fogCells = [];
  for (let y = 0; y < map.height; y++) for (let x = 0; x < map.width; x++) if (map.tileAt(x, y) === 'fog') fogCells.push([x, y]);

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
  const GROUNDS = new Set(['grass', 'sand', 'path', 'flowers']);
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
    for (const [x, y] of fogCells) ctx.rect(x * T - cam.x, y * T - cam.y, T, T + 6);
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
    lock,
    get locked() {
      return locked > 0;
    },
    // Wird von späteren Tasks ersetzt (Figuren-Sprites).
    drawCharacter(ctx, key, dir, frame, x, y) {
      const colors = { ilvy: '#2f6f9c', fischer: '#7a5236', kind: '#e8b64a', netz: '#8f62a8', trainer1: '#e0705a', player: '#3f8f86' };
      ctx.fillStyle = '#1b1a2e';
      ctx.fillRect(x + 2, y + 1, 12, 15);
      ctx.fillStyle = colors[key] ?? '#f3ecd2';
      ctx.fillRect(x + 3, y + 2, 10, 13);
      ctx.fillStyle = '#f3ecd2';
      const ex = dir === 'left' ? 4 : dir === 'right' ? 9 : 6;
      if (dir !== 'up') ctx.fillRect(x + ex, y + 5, 3, 2);
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
      if (locked) return;
      const intent = { dir: game.input.dir(), a: game.input.pressed('a') };
      const events = player.update(dt, intent, map);
      for (const ev of events) {
        if (ev.type === 'stepped') {
          if (map.isTallGrass(ev.x, ev.y)) rustle.set(cellKey(ev.x, ev.y), 220);
          if (game.state) game.state.position = { map: def.id, x: ev.x, y: ev.y, dir: player.dir };
          if (onStepped.length) lock(() => handle(onStepped, ev.x, ev.y));
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
          const frame = kind === 'water' ? waterFrame : kind === 'tallgrass' && rustle.has(cellKey(x, y)) ? 1 : 0;
          if (OVERLAY_TILES.has(kind)) ctx.drawImage(tileCanvas(groundAt(x, y)), sx, sy);
          ctx.drawImage(tileCanvas(kind, frame), sx, sy);
          if (kind === 'water') drawShore(ctx, x, y, sx, sy);
        }
      }

      // Gebäude, Figuren und Spielfigur nach unterer Kante sortiert
      const drawables = [];
      for (const o of def.objects) {
        if (o.type === 'building') {
          const img = spriteFrom(`building:${o.sprite}`, BUILDINGS[o.sprite]);
          const bx = o.x * T - cam.x, by = (o.y + o.h) * T - img.height - cam.y;
          drawables.push({ z: o.y + o.h - 1, draw: () => ctx.drawImage(img, bx, by) });
        } else if (o.type === 'sign') {
          drawables.push({ z: o.y, draw: () => ctx.drawImage(spriteFrom('prop:sign', PROPS.sign), o.x * T - cam.x, o.y * T - cam.y) });
        } else if (o.type === 'npc' || o.type === 'trainer') {
          const pos = o.pixel ? o.pixel() : { x: o.x * T, y: o.y * T };
          const s = npcSprite(o);
          drawables.push({ z: pos.y / T, draw: () => scene.drawCharacter(ctx, s.key, s.dir, 0, pos.x - cam.x, pos.y - cam.y - 2) });
        }
      }
      const pp = player.pixel();
      drawables.push({
        z: pp.y / T + 0.01,
        draw: () => {
          scene.drawCharacter(ctx, 'player', player.dir, player.moving ? player.frame : 0, pp.x - cam.x, pp.y - cam.y - 2);
          // Hohes Gras verdeckt die Füße
          const onGrass = map.isTallGrass(player.x, player.y) && (!player.moving || player.progress > 0.5);
          if (onGrass) {
            const img = tileCanvas('tallgrass', rustle.has(cellKey(player.x, player.y)) ? 1 : 0);
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
    },
  };

  return scene;
}
