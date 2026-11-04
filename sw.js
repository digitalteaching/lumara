// Service Worker (Design 16): speichert alle Dateien des Spiels, damit es auch bei schlechtem WLAN
// im Klassenraum läuft. Klassischer Worker (kein Modul), damit ältere iPads ihn sicher verstehen.
//
// Bei jeder Veröffentlichung VERSION hier, in version.json und in js/version.js gleich erhöhen.
// Neue Dateien des Spiels gehören in FILES (tests/sw.test.js prüft beides).

const VERSION = '1.0.3';
const CACHE = `lumara-${VERSION}`;
const FILES = [
  "index.html",
  "lehrkraft.html",
  "anleitung.html",
  "manifest.webmanifest",
  "version.json",
  "pakete/vorlage.txt",
  "pakete/englisch-6-beispiel.txt",
  "pakete/KI-PROMPT-Lernpaket.md",
  "css/lehrkraft.css",
  "css/spiel.css",
  "icons/icon-180.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "js/app/flow.js",
  "js/app/gamePack.js",
  "js/app/platform.js",
  "js/app/update.js",
  "js/config.js",
  "js/audio/notes.js",
  "js/audio/audio.js",
  "js/audio/bus.js",
  "js/audio/choose.js",
  "js/audio/sequencer.js",
  "js/audio/sfx.js",
  "js/audio/songs.js",
  "js/audio/synth.js",
  "js/core/hash.js",
  "js/core/input.js",
  "js/core/loop.js",
  "js/core/rng.js",
  "js/data/book.js",
  "js/data/quests.js",
  "js/data/secrets.js",
  "js/data/species.js",
  "js/data/story.js",
  "js/data/texts.js",
  "js/duel/answers.js",
  "js/duel/duel.js",
  "js/duel/boss.js",
  "js/duel/rematch.js",
  "js/duel/ascent.js",
  "js/duel/plates.js",
  "js/duel/progress.js",
  "js/duel/questions.js",
  "js/duel/timing.js",
  "js/gfx/arena.js",
  "js/gfx/art/characters.js",
  "js/gfx/art/creatures.js",
  "js/gfx/art/eggs.js",
  "js/gfx/art/shiny.js",
  "js/gfx/art/tiles.js",
  "js/gfx/canvasSprites.js",
  "js/gfx/creatureImage.js",
  "js/gfx/evolution.js",
  "js/gfx/palette.js",
  "js/gfx/particles.js",
  "js/gfx/screen.js",
  "js/gfx/sprites.js",
  "js/i18n/de.js",
  "js/i18n/en-quests.js",
  "js/i18n/en-species.js",
  "js/i18n/en-story.js",
  "js/i18n/en-world.js",
  "js/i18n/en.js",
  "js/i18n/es-quests.js",
  "js/i18n/es-species.js",
  "js/i18n/es-story.js",
  "js/i18n/es-world.js",
  "js/i18n/es.js",
  "js/i18n/fr-quests.js",
  "js/i18n/fr-species.js",
  "js/i18n/fr-story.js",
  "js/i18n/fr-world.js",
  "js/i18n/fr.js",
  "js/i18n/i18n.js",
  "js/items/bag.js",
  "js/items/food.js",
  "js/items/keys.js",
  "js/items/stones.js",
  "js/main.js",
  "js/menu/backupPages.js",
  "js/menu/bagPage.js",
  "js/menu/bookPage.js",
  "js/menu/diaryPage.js",
  "js/menu/homePage.js",
  "js/menu/items.js",
  "js/menu/mapPage.js",
  "js/menu/menu.js",
  "js/menu/packPage.js",
  "js/menu/settings.js",
  "js/menu/teacherPage.js",
  "js/pack/decode.js",
  "js/pack/language.js",
  "js/pack/packId.js",
  "js/pack/parser.js",
  "js/pack/readFile.js",
  "js/pack/store.js",
  "js/save/autosave.js",
  "js/save/backup.js",
  "js/save/codec.js",
  "js/save/migrate.js",
  "js/save/playClock.js",
  "js/save/store.js",
  "js/scenes/beacon.js",
  "js/scenes/duel.js",
  "js/scenes/evolution.js",
  "js/scenes/finale.js",
  "js/scenes/eggs.js",
  "js/scenes/gallery.js",
  "js/scenes/install.js",
  "js/scenes/intro.js",
  "js/scenes/name.js",
  "js/scenes/note.js",
  "js/scenes/pack.js",
  "js/scenes/recover.js",
  "js/scenes/start.js",
  "js/scenes/title.js",
  "js/scenes/transition.js",
  "js/scenes/world.js",
  "js/scenes/worldEvents.js",
  "js/state.js",
  "js/teacher/checkCode.js",
  "js/teacher/overview.js",
  "js/teacher/page.js",
  "js/teacher/stats.js",
  "js/teacher/verify.js",
  "js/ui/controls.js",
  "js/ui/dialog.js",
  "js/ui/dom.js",
  "js/ui/duelPanel.js",
  "js/ui/format.js",
  "js/ui/freshGuard.js",
  "js/ui/share.js",
  "js/ui/sheet.js",
  "js/ui/toast.js",
  "js/version.js",
  "js/world/beacons.js",
  "js/world/caveGate.js",
  "js/world/encounters.js",
  "js/world/fogEdge.js",
  "js/world/islandMap.js",
  "js/world/map.js",
  "js/world/maps/bucht.js",
  "js/world/maps/duenen.js",
  "js/world/maps/eiche.js",
  "js/world/maps/glasturm.js",
  "js/world/maps/gezeiten.js",
  "js/world/maps/irrlicht.js",
  "js/world/maps/eisgrotte.js",
  "js/world/maps/sternwarte.js",
  "js/world/maps/hoehle1.js",
  "js/world/maps/hoehle2.js",
  "js/world/maps/hoehle3.js",
  "js/world/maps/klippen.js",
  "js/world/maps/moor.js",
  "js/world/maps/ruinen.js",
  "js/world/maps/see.js",
  "js/world/maps/wiese.js",
  "js/world/maps/wald.js",
  "js/world/network.js",
  "js/world/notes.js",
  "js/world/quests.js",
  "js/world/secrets.js",
  "js/world/puzzles.js",
  "js/world/finale.js",
  "js/world/stars.js",
  "js/world/slide.js",
  "js/world/player.js"
];

// Eine neue Fassung wird sofort aktiv, sobald alle Dateien geladen sind. Das laufende Spiel lädt
// trotzdem nie neu: Es hat seinen ganzen Code schon im Speicher und arbeitet damit weiter.
// Die neue Fassung startet beim nächsten Öffnen (Design 16: „beim nächsten Start aktiv“).
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(FILES.map(f => new Request(f, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('lumara-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Die Versionsdatei immer zuerst übers Netz, ohne Netz aus dem Zwischenspeicher.
  if (url.pathname.endsWith('/version.json')) {
    event.respondWith(fetch(req, { cache: 'no-store' }).catch(() => caches.match('version.json', { ignoreSearch: true })));
    return;
  }

  // Seitenaufrufe: die gespeicherte Seite, egal mit welchem Suchteil (?probe, ?sw …).
  // Nur für Seiten, nicht für Dateien wie pakete/vorlage.txt.
  if (req.mode === 'navigate' && (url.pathname.endsWith('/') || url.pathname.endsWith('.html'))) {
    const page = url.pathname.endsWith('/lehrkraft.html') ? 'lehrkraft.html' : 'index.html';
    event.respondWith(caches.open(CACHE).then(c => c.match(page)).then(hit => hit || fetch(req)));
    return;
  }

  event.respondWith(caches.open(CACHE).then(c => c.match(req)).then(hit => hit || fetch(req)));
});
