// Einstieg: baut das game-Objekt und startet die Schleife.

import { CONFIG } from './config.js';
import { createRng } from './core/rng.js';
import { startLoop } from './core/loop.js';
import { createScreen } from './gfx/screen.js';
import { createInput } from './core/input.js';
import { mountControls } from './ui/controls.js';
import { createWorldScene } from './scenes/world.js';
import { createTitleScene } from './scenes/title.js';
import { createPackScene } from './scenes/pack.js';
import { createGalleryScene } from './scenes/gallery.js';
import { createIntroScene } from './scenes/intro.js';
import { createNameScene } from './scenes/name.js';
import { createEggScene } from './scenes/eggs.js';
import { newGameState } from './state.js';
import { STARTERS } from './data/species.js';
import { parsePack } from './pack/parser.js';
import { createPackStore } from './pack/store.js';

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

// Entwickler-Abkürzungen nur auf dem eigenen Rechner.
const params = new URLSearchParams(location.search);
const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);

// Ablauf: Titel → Lernpaket → Intro → Name → Eiwahl → Bucht.
function startFlow() {
  game.go(createTitleScene(game, () =>
    game.go(createPackScene(game, () =>
      game.go(createIntroScene(game, () =>
        game.go(createNameScene(game, name =>
          game.go(createEggScene(game, name, (species, nickname) => {
            game.state = newGameState({ name, species, nickname });
            game.go(createWorldScene(game));
          })),
        )),
      )),
    )),
  ));
}

// Paket aus dem Speicher, sonst das Beispielpaket (nur für Entwickler-Abkürzungen).
async function devPack() {
  const stored = createPackStore().load();
  const r = stored ? parsePack(stored) : null;
  if (r?.ok) return { text: stored, data: r.pack };
  const text = await (await fetch('pakete/englisch-6-beispiel.txt')).text();
  return { text, data: parsePack(text).pack };
}

async function devStart() {
  game.pack = await devPack();
  const species = STARTERS.includes(params.get('wesen')) ? params.get('wesen') : 'funki';
  game.state = newGameState({ name: 'Test', species, nickname: null });
  game.go(createWorldScene(game));
}

if (isLocal && params.has('galerie')) game.go(createGalleryScene(game));
else if (isLocal && params.has('dev')) devStart();
else startFlow();

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
