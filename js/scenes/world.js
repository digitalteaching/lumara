// Weltszene: Laufen durch die Bucht, Kamera, Zeichnen, Gespräche und Ereignisse.

import { createMap, cellKey } from '../world/map.js';
import { createPlayer } from '../world/player.js';
import { isSliding } from '../world/slide.js';
import { BUCHT } from '../world/maps/bucht.js';
import { TILES, BUILDINGS, PROPS, OVERLAY_TILES } from '../gfx/art/tiles.js';
import { spriteFrom } from '../gfx/canvasSprites.js';
import { CHARACTERS } from '../gfx/art/characters.js';
import { say } from '../ui/dialog.js';
import { npcLines, worldLines } from '../world/network.js';
import { CONFIG } from '../config.js';
import { createParticles } from '../gfx/particles.js';
import { createRng } from '../core/rng.js';
import { t } from '../i18n/i18n.js';

const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };

const T = 16;
// Bildschirm in Spielpixeln. Auch die Teile der Welt (Garten, Verstecke, Spielaufgaben) rechnen damit,
// etwa um nur zu zeichnen, was zu sehen ist.
export const SCREEN_W = CONFIG.screen.width;
export const SCREEN_H = CONFIG.screen.height;

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
  const onBump = []; // (ev) – die Figur läuft gegen ein Feld, das man nicht betreten kann
  const onTick = []; // (dt) – läuft auch, während die Welt gesperrt ist
  const afterRender = []; // (ctx, cam) – z. B. Ausrufezeichen über Trainern
  const groundRender = []; // (ctx, cam) – auf dem Boden, unter Figuren, z. B. glitzernde Fundstellen
  const rustle = new Map();
  const facing = new Map(); // Figuren, die sich zur Spielfigur gedreht haben
  let locked = 0;
  let time = 0;

  // Nebelfelder; neu berechnet, wenn sich ein Tor öffnet. fogAlpha: einzelne Felder, die gerade weichen.
  let fogCells = [];
  const fogAlpha = new Map();
  const groundCache = new Map(); // Boden unter Überlagerungen, neu, wenn sich Felder ändern
  function refreshFog() {
    groundCache.clear();
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
    // Zierobjekte: Riesenpilze, Glasstatuen, Glasturm, Windräder. anim wechselt alle 300 ms das
    // Bild (Windradflügel), bei „Bewegung reduzieren“ steht es still.
    deco: o => (o.anim ? `${o.prop}${game.reducedMotion ? 0 : Math.floor(time / 300) % 2}` : o.prop),
    // Teile einer Spielaufgabe im Anfangszustand; js/scenes/taskEvents.js zeigt den Stand.
    task: o => o.prop,
    // Der Aushang am Leuchtturm (Lumara 1.3); js/scenes/boardEvents.js lässt ihn glitzern.
    board: () => 'noticeBoard',
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

  // Boden unter Steinen: der häufigste flache Boden der Nachbarfelder. Ohne einen solchen
  // (etwa eine Felsnadel mitten in den Wolken) die häufigste Nachbarkachel, die selbst Boden hat,
  // sonst der Grundboden der Karte (def.ground, etwa Torf im Moor).
  const GROUNDS = new Set(['grass', 'sand', 'path', 'flowers', 'moss', 'peat', 'glasssand', 'cliffrock', 'cobble', 'snow', 'ice', 'nightgrass', 'rootfloor', 'glassfloor']);
  // Eine Felsnadel ragt immer aus den Wolken.
  const FIXED_GROUND = { spire: 'clouds' };
  function groundAt(x, y) {
    const fixed = FIXED_GROUND[map.tileAt(x, y)];
    if (fixed) return fixed;
    const key = cellKey(x, y);
    if (groundCache.has(key)) return groundCache.get(key);
    const counts = {};
    const others = {};
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const k = map.tileAt(x + dx, y + dy);
      if (GROUNDS.has(k)) counts[k] = (counts[k] ?? 0) + 1;
      else if (k && !OVERLAY_TILES.has(k) && k !== 'fog') others[k] = (others[k] ?? 0) + 1;
    }
    const pick = c => Object.entries(c).sort((a, b) => b[1] - a[1])[0]?.[0];
    const best = pick(counts) ?? pick(others) ?? def.ground ?? 'grass';
    const ground = best === 'flowers' ? 'grass' : best;
    groundCache.set(key, ground);
    return ground;
  }

  // Heller Rand an Wasserfeldern, die an Land oder Eis grenzen (Meer und Löcher im Eis).
  function drawShore(ctx, x, y, sx, sy) {
    const kind = map.tileAt(x, y);
    const land = (nx, ny) => map.inBounds(nx, ny) && map.tileAt(nx, ny) !== kind;
    const wave = Math.floor(time / 600) % 2;
    ctx.fillStyle = '#a7dde8';
    if (land(x, y - 1)) for (let i = 0; i < 16; i += 2) ctx.fillRect(sx + i + wave, sy, 1, 1 + ((i + wave) % 4 === 0 ? 1 : 0));
    if (land(x - 1, y)) for (let i = 0; i < 16; i += 3) ctx.fillRect(sx, sy + i + wave, 1, 2);
    if (land(x + 1, y)) for (let i = 0; i < 16; i += 3) ctx.fillRect(sx + 15, sy + i + wave, 1, 2);
  }

  // Felskante über den Wolken: unten eine dunkle Felswand, an den Seiten ein schmaler Rand.
  function drawCliffEdge(ctx, x, y, sx, sy) {
    const sky = (nx, ny) => map.tileAt(nx, ny) === 'clouds' || map.tileAt(nx, ny) === 'spire';
    ctx.fillStyle = '#46496e';
    if (sky(x, y + 1)) {
      ctx.fillRect(sx, sy + 13, 16, 3);
      ctx.fillStyle = '#6b6f94';
      for (let i = 1; i < 16; i += 4) ctx.fillRect(sx + i, sy + 13, 2, 1);
      ctx.fillStyle = '#46496e';
    }
    if (sky(x - 1, y)) ctx.fillRect(sx, sy, 1, 16);
    if (sky(x + 1, y)) ctx.fillRect(sx + 15, sy, 1, 16);
    if (sky(x, y - 1)) {
      ctx.fillStyle = '#d4d6e6';
      ctx.fillRect(sx, sy, 16, 1);
    }
  }

  // Teilchen der Karte (Design 5.3). Ein eigener Zufall, damit Wetter das Spiel nicht beeinflusst.
  // Gischt entsteht an Wasserfeldern, die an Land grenzen, etwas zum Ufer hin.
  const shore = [];
  if (def.particles?.includes('spray')) {
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (map.tileAt(x, y) !== 'water') continue;
        const side = [[0, -1], [-1, 0], [1, 0], [0, 1]].find(([dx, dy]) => map.inBounds(x + dx, y + dy) && map.tileAt(x + dx, y + dy) !== 'water');
        if (side) shore.push([x * T + 8 + side[0] * 4, y * T + 8 + side[1] * 4]);
      }
    }
  }
  // Blasen steigen aus dem Moorwasser.
  const bubbles = [];
  if (def.particles?.includes('bubble')) {
    for (let y = 0; y < map.height; y++) for (let x = 0; x < map.width; x++) if (map.tileAt(x, y) === 'bog') bubbles.push([x * T + 8, y * T + 8]);
  }
  // Funken sprühen an den Zahnrädern der Ruinen (Mitte des Rads, oben auf dem Pfosten).
  const sparks = def.objects.filter(o => o.type === 'deco' && o.prop === 'gear').map(o => [o.x * T + 8, o.y * T - 8]);
  const particles = def.particles?.length
    ? createParticles(def.particles, {
      rng: createRng((Math.random() * 2 ** 32) >>> 0),
      reducedMotion: () => game.reducedMotion,
      width: SCREEN_W,
      height: SCREEN_H,
      anchors: { spray: shore, bubble: bubbles, spark: sparks },
    })
    : null;

  function drawParticles(ctx) {
    particles.each(p => {
      if (p.alpha <= 0.02) return;
      const x = Math.round(p.x + (p.sway ?? 0)), y = Math.round(p.y);
      ctx.globalAlpha = p.alpha;
      if (p.kind === 'gull') {
        // kleine „v“-Form, die Flügel schlagen
        const up = p.flap ? 1 : 0;
        ctx.fillStyle = '#3b3a52';
        ctx.fillRect(x, y, 1, 1);
        ctx.fillRect(x - 1, y - 1, 1, 1);
        ctx.fillRect(x + 1, y - 1, 1, 1);
        ctx.fillRect(x - 2, y - 1 - up, 1, 1);
        ctx.fillRect(x + 2, y - 1 - up, 1, 1);
      } else if (p.kind === 'firefly') {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * 0.3;
        ctx.fillRect(x - 1, y - 1, 3, 3);
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(x, y, 1, 1);
      } else if (p.kind === 'wisp') {
        // Irrlicht: weicher runder Schein, heller Kern
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * 0.22;
        ctx.fillRect(x - 2, y - 1, 5, 3);
        ctx.fillRect(x - 1, y - 2, 3, 5);
        ctx.globalAlpha = p.alpha * 0.6;
        ctx.fillRect(x - 1, y, 3, 1);
        ctx.fillRect(x, y - 1, 1, 3);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = '#effff8';
        ctx.fillRect(x, y, 1, 1);
      } else if (p.kind === 'bubble') {
        // kleiner Ring; kurz vor dem Platzen etwas größer
        ctx.fillStyle = p.color;
        if (p.size === 2) {
          ctx.fillRect(x - 1, y - 1, 3, 1);
          ctx.fillRect(x - 1, y + 1, 3, 1);
          ctx.fillRect(x - 1, y, 1, 1);
          ctx.fillRect(x + 1, y, 1, 1);
        } else {
          ctx.fillRect(x, y, 2, 2);
          ctx.fillStyle = '#e6fbf5';
          ctx.fillRect(x, y, 1, 1);
        }
      } else if (p.kind === 'glint') {
        // kurzer Glanz: ein Kreuz aus hellen Pixeln
        ctx.fillStyle = p.color;
        ctx.fillRect(x - 1, y, 3, 1);
        ctx.fillRect(x, y - 1, 1, 3);
      } else if (p.kind === 'cloud') {
        // weicher, blasser Fleck von 10 × 4 Pixeln
        ctx.fillStyle = p.color;
        ctx.fillRect(x + 2, y, 6, 1);
        ctx.fillRect(x, y + 1, 10, 2);
        ctx.fillRect(x + 2, y + 3, 6, 1);
      } else if (p.kind === 'spark') {
        // helles Kreuz mit warmem Schein
        ctx.fillStyle = '#e0705a';
        ctx.globalAlpha = p.alpha * 0.55;
        ctx.fillRect(x - 2, y, 5, 1);
        ctx.fillRect(x, y - 2, 1, 5);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(x - 1, y, 3, 1);
        ctx.fillRect(x, y - 1, 1, 3);
      } else if (p.kind === 'steam') {
        // blasses rundes Wölkchen
        ctx.fillStyle = p.color;
        ctx.fillRect(x - 1, y - 1, 3, 3);
        ctx.globalAlpha = p.alpha * 0.5;
        ctx.fillRect(x - 2, y, 5, 1);
        ctx.fillRect(x, y - 2, 1, 5);
      } else if (p.kind === 'aurora') {
        // langes weiches Band, das sich wellt
        ctx.fillStyle = p.color;
        for (let i = 0; i < p.len; i += 2) {
          const yy = y + Math.round(Math.sin((i / p.len) * Math.PI * 3 + p.phase) * 3);
          const edge = Math.min(1, i / 16, (p.len - i) / 16);
          ctx.globalAlpha = p.alpha * edge * 0.55;
          ctx.fillRect(x + i, yy, 2, 9);
          ctx.globalAlpha = p.alpha * edge;
          ctx.fillRect(x + i, yy + 1, 2, 3);
        }
      } else if (p.kind === 'fallingstar') {
        // kurzer schräger Strich, der Schweif wird blasser
        ctx.fillStyle = p.color;
        for (let i = 0; i < p.size; i++) {
          ctx.globalAlpha = p.alpha * (1 - i / p.size);
          ctx.fillRect(x + i * 2, y - i, 2, 1);
        }
      } else if (p.kind === 'snow') {
        ctx.fillStyle = p.color;
        ctx.fillRect(x, y, p.size, p.size);
      } else if (p.kind === 'glimmer') {
        ctx.fillStyle = p.color;
        ctx.fillRect(x, y, 1, 1);
        ctx.globalAlpha = p.alpha * 0.25;
        ctx.fillRect(x - 1, y - 1, 3, 3);
      } else if (p.kind === 'sand' || p.kind === 'windstreak') {
        // waagrechte Striche
        ctx.fillStyle = p.color;
        ctx.fillRect(x, y, p.size, 1);
      } else {
        // Gischt: ein Pixel; Blatt: zwei Pixel und eins schräg darunter
        ctx.fillStyle = p.color;
        ctx.fillRect(x, y, p.size, 1);
        if (p.size === 2) ctx.fillRect(x + 1, y + 1, 1, 1);
      }
    });
    ctx.globalAlpha = 1;
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
    mapId: def.id, // etwa für den Begleiter und die Verstecke dieser Karte
    map,
    player,
    onStepped,
    onInteract,
    onBump,
    onTick,
    afterRender,
    groundRender,
    // Weitere Figuren { z(), draw(ctx, cam) }, nach z (in Feldern) zwischen Gebäude, Bewohner und
    // Spielfigur sortiert, etwa der Begleiter (js/scenes/companion.js).
    actors: [],
    blocked: new Set(), // zusätzlich belegte Felder, etwa ein noch liegender seltener Stein
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
      scene.drawShadow(ctx, x, y);
      ctx.drawImage(spriteFrom(`char:${key}:${d}:${idx}`, frames[idx], { flip }), x, y);
    },
    // Schatten unter den Füßen eines 16 × 16-Bilds, das bei (x, y) beginnt.
    drawShadow(ctx, x, y) {
      ctx.fillStyle = 'rgba(27, 26, 46, 0.28)';
      ctx.fillRect(x + 4, y + 15, 8, 2);
      ctx.fillRect(x + 3, y + 16, 10, 1);
    },
    // Hohes Gras verdeckt die Füße: Steht auf dem Feld (x, y) hohes Gras, zeichnet das die unteren
    // 6 Pixel der Kachel noch einmal, über eine Figur, die gerade dort gezeichnet wurde (Spielfigur,
    // Begleiter, Freunde im Garten).
    grassOver(ctx, cam, x, y) {
      if (!map.isTallGrass(x, y)) return;
      const img = tileCanvas(map.tileAt(x, y), rustle.has(cellKey(x, y)) ? 1 : 0);
      ctx.drawImage(img, 0, 10, 16, 6, x * T - cam.x, y * T - cam.y + 10, 16, 6);
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
      particles?.update(dt, camera());
      for (const [k, ms] of rustle) {
        if (ms - dt <= 0) rustle.delete(k);
        else rustle.set(k, ms - dt);
      }
      for (const fn of [...onTick]) fn(dt);
      if (locked || opts.passive) return;
      // Auf Rutscheis gleitet die Figur weiter; Richtung und A zählen erst, wenn sie steht.
      const sliding = isSliding(map, player, scene.blocked);
      const pressedA = game.input.pressed('a');
      const intent = { dir: sliding ? player.dir : game.input.dir(), a: !sliding && pressedA };
      const events = player.update(dt, intent, map, scene.blocked);
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
        } else if (ev.type === 'bump') {
          for (const fn of onBump) fn(ev);
        }
      }
    },

    render(ctx) {
      const cam = camera();
      const x0 = Math.floor(cam.x / T), y0 = Math.floor(cam.y / T);
      const waterFrame = Math.floor(time / 600) % 2;
      // Bewegte Kacheln wechseln wie Wasser alle 600 ms das Bild; Wolken und Luftspiegelungen
      // stehen bei „Bewegung reduzieren“ still.
      const movingFrame = kind => {
        if (kind === 'water' || kind === 'bog' || kind === 'canal' || kind === 'icewater') return waterFrame;
        if (kind === 'clouds' || kind === 'mirage') return game.reducedMotion ? 0 : waterFrame;
        return null;
      };

      for (let y = y0; y <= y0 + 10 && y < map.height; y++) {
        for (let x = x0; x <= x0 + 15 && x < map.width; x++) {
          const kind = map.tileAt(x, y);
          const sx = x * T - cam.x, sy = y * T - cam.y;
          const frame = movingFrame(kind) ?? (map.isTallGrass(x, y) && rustle.has(cellKey(x, y)) ? 1 : 0);
          if (OVERLAY_TILES.has(kind)) {
            const ground = groundAt(x, y);
            ctx.drawImage(tileCanvas(ground, movingFrame(ground) ?? 0), sx, sy);
          }
          ctx.drawImage(tileCanvas(kind, frame), sx, sy);
          if (kind === 'water' || kind === 'icewater') drawShore(ctx, x, y, sx, sy);
          if (kind === 'cliffrock' || kind === 'windgrass') drawCliffEdge(ctx, x, y, sx, sy);
        }
      }

      for (const fn of groundRender) fn(ctx, cam);

      // Gebäude, Figuren, weitere Figuren (scene.actors) und Spielfigur nach unterer Kante sortiert
      const drawables = [];
      for (const o of def.objects) {
        if (o.id && hiddenIds.has(o.id)) continue;
        if (o.type === 'building') {
          const img = spriteFrom(`building:${o.sprite}`, BUILDINGS[o.sprite]);
          const bx = o.x * T - cam.x, by = (o.y + o.h) * T - img.height - cam.y;
          drawables.push({ z: o.y + o.h - 1, draw: () => ctx.drawImage(img, bx, by) });
        } else if (propVariant[o.type]) {
          // Leuchtsteine, Sträucher, Zettelsteine, Altbäume, Zierobjekte: unten auf ihrem Feld, hohe Bilder ragen nach oben
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
          // Hohes Gras verdeckt die Füße, ab der Hälfte eines Schritts die auf dem Zielfeld.
          if (!player.moving || player.progress > 0.5) scene.grassOver(ctx, cam, player.x, player.y);
        },
      });
      for (const a of scene.actors) drawables.push({ z: a.z(), draw: () => a.draw(ctx, cam) });
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
        // Ein farbiger Lichtring für jeden entzündeten Leuchtstein (Design 5.1), sanft pulsierend
        const stones = game.state?.stones ?? [];
        // Ein dunkler Schatten unter jedem Ring, damit er sich vom Lampenlicht und vom Gras abhebt.
        stones.forEach((n, i) => {
          const a = game.reducedMotion ? 0.85 : 0.7 + 0.25 * Math.sin(time / 900 + i);
          const ring = dy => {
            ctx.beginPath();
            ctx.ellipse(cx, cy + 1 + dy, 10 + i * 3, 3 + i, 0, 0, Math.PI * 2);
            ctx.stroke();
          };
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.45;
          ctx.strokeStyle = '#2a2140';
          ring(1);
          ctx.globalAlpha = a;
          ctx.strokeStyle = CONFIG.beacons.ringColors[n - 1];
          ring(0);
        });
        ctx.globalAlpha = 1;
      }

      // Nach den Figuren und vor dem Nebel
      if (particles) drawParticles(ctx);
      drawFog(ctx, cam);
      // Dunkle Gänge (Hohle Eiche): Nur um die Spielfigur leuchtet die Laterne. Ihr Licht flackert
      // leicht (unter 1 Hz), bei „Bewegung reduzieren“ steht es still.
      if (def.dark) {
        const cx = pp.x - cam.x + 8, cy = pp.y - cam.y + 6;
        const r = 40 + (game.reducedMotion ? 0 : Math.sin(time / 250) * 1.5);
        const g = ctx.createRadialGradient(cx, cy, r * 0.35, cx, cy, r);
        g.addColorStop(0, 'rgba(12, 10, 24, 0)');
        g.addColorStop(1, 'rgba(12, 10, 24, 0.86)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
      }
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
      await say(game, game.state ? npcLines(o, game.state, def.area, game.pack?.data) : o.lines, { speaker: o.name });
      scene.resetFacing(o);
      return true;
    }
    if (o.type === 'sign') {
      await say(game, worldLines(def, o, 'lines'));
      return true;
    }
    // Zierobjekte mit Inschrift (etwa Glasstatuen) spricht man an wie ein Schild.
    if (o.type === 'deco' && o.lines) {
      await say(game, worldLines(def, o, 'lines'));
      return true;
    }
    if (o.type === 'building') {
      // Jede Zelle der vorderen Reihe zählt als Tür, wenn man nach oben darauf schaut.
      const front = player.dir === 'up' && ev.y === o.y + o.h - 1;
      if (!front || o.onDoor === 'heal') return false;
      await say(game, worldLines(def, o, 'lines') ?? [t('world.doorLocked')]);
      return true;
    }
    return false;
  });

  return scene;
}
