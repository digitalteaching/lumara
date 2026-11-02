// Einstieg: baut das game-Objekt und startet die Schleife.

import { CONFIG } from './config.js';
import { createRng } from './core/rng.js';
import { startLoop } from './core/loop.js';
import { createScreen } from './gfx/screen.js';
import { PALETTE } from './gfx/palette.js';
import { rows } from './gfx/sprites.js';
import { spriteFrom } from './gfx/canvasSprites.js';
import { createInput } from './core/input.js';
import { mountControls } from './ui/controls.js';

const screen = createScreen(document.getElementById('screen'), document.getElementById('stage'));
const input = createInput();
mountControls(document.getElementById('pad'), input);

const game = {
  config: CONFIG,
  rng: createRng((Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0),
  screen,
  input,
  ui: document.getElementById('ui'),
  panel: document.getElementById('panel'),
  reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
  scene: null,
  overlay: null,
  pack: null,
  state: null,
  get mode() {
    return document.body.dataset.mode;
  },
  set mode(m) {
    document.body.dataset.mode = m;
  },
  go(scene) {
    this.scene?.exit?.();
    this.scene = scene;
    scene.enter?.();
  },
};

// Vorläufiges Testbild (Task 2): Schachbrett, Palette, ein Test-Sprite.
const TEST = rows(`
  ....kkkk....
  ..kkHHHHkk..
  .kHHHwwHHHk.
  .kHHwwHHHHk.
  kHHHHHHHHHHk
  kHhHHHHHHhHk
  kHHhhhhhhHHk
  .kHHHHHHHHk.
  .khHHHHHHhk.
  ..kkhhhhkk..
  ....kkkk....
  ............
`);

// Vorläufiger Eingabetest (Task 3): Quadrat folgt input.dir(), Knöpfe als Text.
const probe = { x: 112, y: 72 };
const label = document.createElement('div');
label.className = 'passive';
label.style.cssText = 'position:absolute;left:8px;top:8px;font-size:18px;color:#fff;text-shadow:0 1px 2px #000';
game.ui.appendChild(label);
game.mode = 'walk';

game.go({
  update() {
    const d = input.dir();
    if (d === 'left') probe.x -= 1;
    if (d === 'right') probe.x += 1;
    if (d === 'up') probe.y -= 1;
    if (d === 'down') probe.y += 1;
    const held = ['up', 'down', 'left', 'right', 'a', 'b', 'menu'].filter(b => input.held(b));
    label.textContent = `dir=${d ?? '-'} held=${held.join(',') || '-'}`;
  },
  render(ctx, t) {
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 15; x++) {
        ctx.fillStyle = (x + y) % 2 ? '#2b2d4a' : '#46496e';
        ctx.fillRect(x * 16, y * 16, 16, 16);
      }
    }
    PALETTE.forEach((p, i) => {
      ctx.fillStyle = p.hex;
      ctx.fillRect(i * 7 + 8, 140, 7, 12);
    });
    const bob = Math.round(Math.sin(t / 400) * 2);
    ctx.drawImage(spriteFrom('test', TEST), 114, 60 + bob);
    ctx.fillStyle = '#e0705a';
    ctx.fillRect(probe.x, probe.y, 16, 16);
  },
});

window.lumara = game;

startLoop({
  update(dt) {
    game.scene?.update(dt);
    input.endFrame();
  },
  render(t) {
    game.scene?.render(screen.ctx, t);
    game.overlay?.render(screen.ctx, t);
    screen.present();
  },
});
