// Einstieg: baut das game-Objekt, startet die Schleife und den Startablauf.

import { CONFIG } from './config.js';
import { createRng } from './core/rng.js';
import { startLoop } from './core/loop.js';
import { createScreen } from './gfx/screen.js';
import { createInput } from './core/input.js';
import { mountControls } from './ui/controls.js';
import { showToast } from './ui/toast.js';
import { createGameWorld } from './scenes/worldEvents.js';
import { createGalleryScene } from './scenes/gallery.js';
import { startFlow } from './scenes/start.js';
import { newGameState, packProgress } from './state.js';
import { STARTERS } from './data/species.js';
import { parsePack } from './pack/parser.js';
import { createPackStore } from './pack/store.js';
import { createSaveStore } from './save/store.js';
import { createAutosave } from './save/autosave.js';
import { createPlayClock } from './save/playClock.js';
import { makeSaver, watchOtherTabs } from './app/flow.js';
import { APP_VERSION } from './version.js';
import { requestPersist } from './app/platform.js';
import { bootUpdates, removeServiceWorkers } from './app/update.js';
import { createDuelScene, makeWildSetup, makeTrainerSetup, makeProbeSetup } from './scenes/duel.js';
import { maxEnergy } from './duel/progress.js';
import { MAPS } from './world/network.js';
import { el } from './ui/dom.js';

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
  store: createSaveStore(),
  packStore: createPackStore(),
  clock: createPlayClock(),
  saveEnabled: false, // nur der normale Startablauf speichert
  save: null,
  version: APP_VERSION,
  probe: false, // Probefrage für Lehrkräfte
  updateReady: false,
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
game.save = makeSaver(game, { onFirstSave: requestPersist });

// Automatisch speichern: alle 30 s Spielzeit, beim Verstecken und beim Schließen der Seite.
const autosave = createAutosave({
  save: () => game.save(),
  onFail: () => showToast('Dein Spielstand kann auf diesem Gerät gerade nicht gespeichert werden. Sichere ihn über Menü → Einstellungen → Spielstand sichern.', 9000),
});
autosave.attach(document, window);

// Zwei offene Tabs: Hat ein anderer Tab gespeichert, speichert dieser nicht mehr und bietet das
// Neuladen an, damit kein Fortschritt überschrieben wird.
watchOtherTabs(game, window, {
  onTakenOver() {
    if (game.probe) return;
    game.input.releaseAll();
    const card = el(
      'div',
      { class: 'box sheet-card taken', role: 'alertdialog' },
      el('p', { class: 'recover-title' }, 'Lumara ist in einem anderen Fenster offen.'),
      el('p', {}, 'Dort wurde gerade weitergespielt. Damit nichts verloren geht, wird hier nicht mehr gespeichert.'),
      el('button', { class: 'btn primary', type: 'button', onclick: () => location.reload() }, 'Hier weiterspielen'),
    );
    document.body.append(el('div', { class: 'sheet' }, card));
  },
});

// Spielzeit für die Lehrkraft: jede Eingabe zählt als „das Kind ist dabei“.
const markActivity = () => game.clock.activity(performance.now());
window.addEventListener('keydown', markActivity, { capture: true });
window.addEventListener('pointerdown', markActivity, { capture: true });

// Entwickler-Abkürzungen nur auf dem eigenen Rechner.
const params = new URLSearchParams(location.search);
const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
if (isLocal) window.lumara = game;

// Paket aus dem Speicher, sonst das Beispielpaket (nur für Entwickler-Abkürzungen).
async function devPack() {
  const stored = game.packStore.load();
  const r = stored ? parsePack(stored) : null;
  if (r?.ok) return { text: stored, data: r.pack };
  const text = await (await fetch('pakete/englisch-6-beispiel.txt')).text();
  return { text, data: parsePack(text).pack };
}

// Die Abkürzungen speichern nie, damit der echte Spielstand auf dem Rechner bleibt.
async function devStart() {
  game.pack = await devPack();
  const species = STARTERS.includes(params.get('wesen')) ? params.get('wesen') : 'funki';
  game.state = newGameState({ name: 'Test', species, nickname: null });
  // ?dev&gebiet=wald (moor, …): gleich am Eingang des Gebiets, alle Steine davor leuchten
  const def = MAPS[params.get('gebiet')];
  if (def && def.area > 1) {
    game.state.stones = Array.from({ length: def.area - 1 }, (_, i) => i + 1);
    game.state.position = { map: def.id, ...def.spawn };
  }
  game.go(createGameWorld(game));
}

async function devDuel(kind) {
  game.pack = await devPack();
  const species = STARTERS.includes(params.get('wesen')) ? params.get('wesen') : 'funki';
  game.state = newGameState({ name: 'Test', species, nickname: null });
  const again = () => {
    game.state.creature.energy = Math.max(game.state.creature.energy, 1);
    const setup = kind === 'trainer' ? makeTrainerSetup(game, 1) : makeWildSetup(game, 1);
    game.go(createDuelScene(game, setup, again));
  };
  again();
}

// Probefrage im Rahmen der Seite für Lehrkräfte (Design 12.3). Wirkt auf jedem Host, speichert nie.
async function probeStart() {
  game.probe = true;
  if (window.parent === window) {
    game.panel.append(el('div', { class: 'box screen-card' }, el('p', {}, 'Diese Ansicht gehört zur Seite für Lehrkräfte.')));
    return;
  }
  const msg = await new Promise(resolve => {
    window.addEventListener('message', function onMessage(e) {
      if (e.origin !== location.origin || e.source !== window.parent || e.data?.type !== 'lumara-probe') return;
      window.removeEventListener('message', onMessage);
      resolve(e.data);
    });
    window.parent.postMessage({ type: 'lumara-probe-ready' }, location.origin);
  });
  const text = String(msg.packText ?? '');
  const r = parsePack(text);
  if (!r.ok) {
    game.panel.append(el('div', { class: 'box screen-card' }, el('p', {}, 'Dieses Lernpaket hat Fehler. Prüfe es zuerst auf der Seite.')));
    return;
  }
  game.pack = { text, data: r.pack };
  game.state = newGameState({ name: 'Probe', species: 'kiesel', nickname: null });
  const trainer = Number(msg.trainer) || 1;
  const again = () => {
    game.state.creature.energy = maxEnergy(game.state.creature);
    game.go(createDuelScene(game, makeProbeSetup(game, trainer), again));
  };
  again();
}

if (params.has('probe')) probeStart();
else if (isLocal && params.has('galerie')) game.go(createGalleryScene(game));
else if (isLocal && params.has('duell')) devDuel(params.get('duell'));
else if (isLocal && params.has('dev')) devStart();
else startFlow(game, game.store.load());

// Offline und Updates (Design 16). Auf dem eigenen Rechner nur mit ?sw, sonst immer frische Dateien.
const UPDATE_TEXT = 'Neue Version da – beim nächsten Start aktiv';
let updateToastPending = false;
if (!game.probe) {
  if (isLocal && !params.has('sw')) removeServiceWorkers();
  else {
    bootUpdates({
      version: APP_VERSION,
      onReady: () => {
        game.updateReady = true;
        updateToastPending = true;
      },
    });
  }
}

startLoop({
  update(dt) {
    // Den Hinweis auf eine neue Fassung nie mitten im Duell zeigen.
    if (updateToastPending && game.mode !== 'duel') {
      updateToastPending = false;
      showToast(UPDATE_TEXT);
    }
    game.scene?.update(dt);
    autosave.tick(dt);
    const add = game.clock.step(performance.now(), !document.hidden);
    if (add && game.saveEnabled && game.state && game.pack) {
      packProgress(game.state, game.pack.data.shortId).stats.playMs += add;
      game.state.playMs += add; // gesamte Spielzeit des Kindes, für Sträucher, Zettel und Fundstellen
    }
    input.endFrame();
  },
  render(t) {
    game.scene?.render(screen.ctx, t);
    game.overlay?.render(screen.ctx, t);
    screen.present();
  },
});
