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
import { setGamePack } from './app/gamePack.js';
import { setPseudo, t } from './i18n/i18n.js';
import { createAudio } from './audio/audio.js';
import { FRIENDABLE, makeFriend, setCompanion } from './friends/friends.js';
import { SONGS } from './audio/songs.js';
import { setAudio } from './audio/bus.js';

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
  traveling: false, // während eines Kartenwechsels (travelTo in js/scenes/worldEvents.js)
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
  onFail: () => showToast(t('app.saveFailed'), 9000),
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
      el('p', { class: 'recover-title' }, t('app.otherWindow')),
      el('p', {}, t('app.otherWindowText')),
      el('button', { class: 'btn primary', type: 'button', onclick: () => location.reload() }, t('app.playHere')),
    );
    document.body.append(el('div', { class: 'sheet' }, card));
  },
});

// Musik und Ton (Design 15): im Browser erzeugt, erst nach der ersten Berührung oder Taste (iOS).
// Ist die App verdeckt, pausiert der Ton.
const AudioCtor = window.AudioContext || window.webkitAudioContext;
// Bis der Stand übernommen ist (nach dem Titel), gelten die Einstellungen des gespeicherten Stands.
let bootSettings = null;
game.audio = createAudio({ makeContext: () => (AudioCtor ? new AudioCtor() : null), settings: () => game.state?.settings ?? bootSettings, songs: SONGS });
setAudio(game.audio);
// iOS lässt den Ton erst bei einer echten Berührung laufen (pointerup, touchend, click), nicht schon
// beim Aufsetzen des Fingers. Jede Eingabe versucht es, bis er läuft.
const unlockAudio = () => game.audio.unlock();
for (const type of ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown']) window.addEventListener(type, unlockAudio, { capture: true });
document.addEventListener('visibilitychange', () => (document.hidden ? game.audio.suspend() : game.audio.resume()));

// Spielzeit für die Lehrkraft: jede Eingabe zählt als „das Kind ist dabei“.
const markActivity = () => game.clock.activity(performance.now());
window.addEventListener('keydown', markActivity, { capture: true });
window.addEventListener('pointerdown', markActivity, { capture: true });

// Entwickler-Abkürzungen nur auf dem eigenen Rechner.
const params = new URLSearchParams(location.search);
const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
// Prüfmodus der Spielsprache (Design 10.6): jeder übersetzte Text steht in ⟦ ⟧.
if (isLocal && params.get('sprache') === 'xx') setPseudo(true);
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

// &level=n: das Wesen gleich auf Level n (1 bis 100), mit voller Energie.
function devLevel(state) {
  const n = Number(params.get('level'));
  if (!Number.isInteger(n) || n < 1) return;
  state.creature.level = Math.min(n, CONFIG.creature.maxLevel);
  state.creature.energy = maxEnergy(state.creature);
}
// &leckerli=n: n Leckerli im Rucksack, zum Befreunden mit einem Feld im Ring vorab.
function devTreats(state) {
  const n = Number(params.get('leckerli'));
  if (Number.isInteger(n) && n > 0) state.bag.treat = n;
}
// &freunde=n: die ersten n befreundbaren Wesen sind Freunde, das erste läuft als Begleiter mit.
function devFriends(state) {
  const n = Number(params.get('freunde'));
  if (!Number.isInteger(n) || n < 1) return;
  for (const id of FRIENDABLE.slice(0, n)) makeFriend(state, id, false);
  setCompanion(state, FRIENDABLE[0]);
}
async function devStart() {
  setGamePack(game, await devPack());
  const species = STARTERS.includes(params.get('wesen')) ? params.get('wesen') : 'funki';
  game.state = newGameState({ name: 'Test', species, nickname: null });
  devLevel(game.state);
  devTreats(game.state);
  devFriends(game.state);
  // ?dev&gebiet=wald (moor, …): gleich am Eingang des Gebiets, alle Steine davor leuchten.
  // ?dev&gebiet=garten (mit &freunde=12): gleich im Garten am Leuchtturm.
  const def = MAPS[params.get('gebiet')];
  if (def && (def.area > 1 || def.garden)) {
    game.state.stones = Array.from({ length: def.area - 1 }, (_, i) => i + 1);
    game.state.position = { map: def.id, ...def.spawn };
  }
  game.go(createGameWorld(game));
}

async function devDuel(kind) {
  setGamePack(game, await devPack());
  const species = STARTERS.includes(params.get('wesen')) ? params.get('wesen') : 'funki';
  game.state = newGameState({ name: 'Test', species, nickname: null });
  devLevel(game.state);
  devTreats(game.state);
  devFriends(game.state);
  const again = () => {
    game.state.creature.energy = Math.max(game.state.creature.energy, 1);
    const setup = kind === 'trainer' ? makeTrainerSetup(game, 1) : makeWildSetup(game, 1);
    if (kind !== 'trainer' && params.has('glanz')) setup.foe.shiny = true; // ?duell=wild&glanz
    game.go(createDuelScene(game, setup, again));
  };
  again();
}

// Probefrage im Rahmen der Seite für Lehrkräfte (Design 12.3). Wirkt auf jedem Host, speichert nie.
async function probeStart() {
  game.probe = true;
  // Die Probefrage läuft auf der Seite der Lehrkraft, oft am Beamer: ohne Musik und Effekte.
  game.audio.setMusicOn(false);
  game.audio.setSfxOn(false);
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
  setGamePack(game, { text, data: r.pack });
  game.state = newGameState({ name: 'Probe', species: 'kiesel', nickname: null });
  const trainer = Number(msg.trainer) || 1;
  const again = () => {
    game.state.creature.energy = maxEnergy(game.state.creature);
    game.go(createDuelScene(game, makeProbeSetup(game, trainer), again));
  };
  again();
}

if (params.has('probe')) probeStart();
else if (isLocal && params.has('galerie')) game.go(createGalleryScene(game, { shiny: params.has('glanz'), mini: params.has('klein') }));
else if (isLocal && params.has('duell')) devDuel(params.get('duell'));
else if (isLocal && params.has('dev')) devStart();
else {
  const loaded = game.store.load();
  bootSettings = loaded.state?.settings ?? null;
  startFlow(game, loaded);
}

// Offline und Updates (Design 16). Auf dem eigenen Rechner nur mit ?sw, sonst immer frische Dateien.
const UPDATE_TEXT = () => t('app.updateReady');
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
      showToast(UPDATE_TEXT());
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
  render(ms) {
    game.scene?.render(screen.ctx, ms);
    game.overlay?.render(screen.ctx, ms);
    screen.present();
  },
});
