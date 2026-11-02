// Einstieg: baut das game-Objekt und startet die Schleife.

import { CONFIG } from './config.js';
import { createRng } from './core/rng.js';
import { startLoop } from './core/loop.js';
import { createScreen } from './gfx/screen.js';
import { createInput } from './core/input.js';
import { mountControls } from './ui/controls.js';
import { createWorldScene } from './scenes/world.js';

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

window.lumara = game;

// Vorläufig: direkt in die Bucht (der Spielstart kommt in Task 15).
game.go(createWorldScene(game));

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
