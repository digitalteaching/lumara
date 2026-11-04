# Lumara · Plan 1: Spielbarer Kern – Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein Kind lädt ein Lernpaket, wählt sein Wesen, läuft durch die Leuchtturmbucht, trifft im hohen Gras wilde Wesen und besiegt die Hüterin der Bucht in einem Duell mit Lernfragen in allen drei Antwortformen. Dafür bekommt es XP und steigt im Level auf.

**Architecture:** Reine Logik (Paket-Parser, Antwortprüfung, Fragenziehung, Duellregeln, XP, Kartenlogik) liegt in DOM-freien ES-Modulen und wird mit `node --test` geprüft. Darüber liegt eine dünne Browser-Schicht: ein 240 × 160 großer Canvas-Puffer, der scharf hochskaliert wird, eine Spielschleife mit festem Zeitschritt, Szenen (Titel, Paket, Intro, Name, Eier, Welt, Duell) und HTML-Kästen für alle Texte.

**Tech Stack:** Vanilla JavaScript (ES-Module), Canvas 2D, HTML/CSS, Node ≥ 22 nur für Tests (`node --test`, keine npm-Pakete), `python3 -m http.server` zum lokalen Testen.

**Spec:** `docs/superpowers/specs/2026-11-01-lernwelt-rpg-design.md` (im Folgenden „Design“, Abschnittsnummern wie dort)

**Umfang:** Design Abschnitt 17, Schritte 1 bis 3. Spätere Pläne: 2 Spielstand & Lehrkraft (Schritt 4) · 3 Welt (5, dazu Zeitdruck, Futter, Teilchen) · 4 Tiefe (6) · 5 Finale (7) · 6 Musik und Ton (8) · 7 Abschluss (9).

**Bewusst noch nicht in diesem Plan:** Spielstand speichern (jeder Neustart beginnt beim Titel, nur das Paket bleibt), Hinweis „Zum Home-Bildschirm“, Menü und Einstellungen, Zeitdruck und Zeitbalken (Trainer 1 und wilde Wesen in Gebiet 1 haben keinen), Futter, Steine und Zettel (Pieks’ *Grüner Daumen* wirkt deshalb erst ab Plan 3), Leuchtstein-Szene, Teilchen, Ton, Innenräume, Wesen-Buch, Glanzform, Entwicklungsanimation.

**Arbeitszweig:** `feature/kern`, abgezweigt von `design/lumara` (über superpowers:using-git-worktrees).

## Global Constraints

- Reines HTML, CSS und JavaScript als ES-Module. Kein Framework, kein Build-Schritt, keine Abhängigkeiten (Design 16).
- Keine externen Bibliotheken, keine Web-Fonts, keine fremden Bilder, Sounds oder Tracker. Keine Netzwerkanfragen außer zu eigenen Dateien (Design 3).
- Alles wird im Code gezeichnet. Sprites sind Pixelraster mit Farbpalette im Code (Design 14).
- Interne Auflösung 240 × 160, Felder 16 × 16, 15 × 10 sichtbar, scharf ohne Weichzeichnen hochskaliert (Design 14).
- Eigene Palette mit 32 Farben (Task 2). Kein typisches Handheld-Grün, keine Anlehnung an ein bestehendes Spiel, auch nicht in Namen oder Silhouetten der Wesen.
- Zielgeräte: Safari ab iPadOS 16, aktuelle Chrome und Edge. Deshalb kein `OffscreenCanvas` für 2D (erst ab Safari 16.4), sondern `document.createElement('canvas')`.
- Texte, Fragen und Menüs sind HTML über dem Spielbild, in Systemschrift (`system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`). Kästen sind cremefarben (`#f3ecd2`) mit braunem Rahmen (`#a8743a`) auf dunklem Blau (`#1d2b3a`). Fragen sind mindestens 18 px groß.
- Tippflächen mindestens 48 px, Steuerkreuz mindestens 140 px Durchmesser, Knöpfe A und B mindestens 64 px (Design 13).
- Rückmeldungen immer mit Symbol und Farbe zusammen (✓ grün, ✗ rot).
- Bei `prefers-reduced-motion: reduce` gibt es kein Wackeln und kein Gleiten, sondern Überblendungen. Nichts blinkt öfter als dreimal pro Sekunde.
- Kindgerecht: Wesen werden „erschöpft“, nicht verletzt. Alle Spieltexte sind auf Deutsch. Nur Trainerdialoge und Fragen kommen aus dem Paket.
- Alle Zahlen der Spielregeln stehen in `js/config.js`.
- Bezeichner im Code sind englisch, alles, was das Kind oder die Lehrkraft liest, ist deutsch (Claude).
- Entwickler-Abkürzungen (`?dev`, `?duell=…`, `?galerie`) wirken nur auf `localhost` und `127.0.0.1`.
- Tests: `node --test` im Repo-Wurzelordner. Erwartete Ausgabe am Ende jedes Tasks: `# fail 0`.
- Lokales Testen im Browser: `python3 -m http.server 8000` im Repo-Wurzelordner, dann `http://localhost:8000/`.
- Jede Testdatei beginnt mit `import { test } from 'node:test'; import assert from 'node:assert/strict';` und importiert die Module und Fixtures, die ihre Tests benutzen. In den Testblöcken unten sind diese Kopfzeilen weggelassen.
- Vor jedem Commit werden die im Task genannten Dateien mit `git add` hinzugefügt. Commit-Nachrichten sind auf Deutsch, wie im Repo üblich, und jede endet mit der Zeile `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Tippen im Eintippfeld:** Ein Kind tippt `w`, `a`, `s`, `d`, `m`, Leertaste oder Rücktaste in das Antwortfeld. Die Buchstaben landen im Feld, die Spielfigur läuft nicht und das Duell wird nicht abgebrochen. → Test in Task 3.
2. **Doppeltipp auf eine Antwort:** Kinder tippen oft zweimal schnell. Es zählt genau eine Antwort, der Gegner verliert nicht doppelt Energie. → Test in Task 13.
3. **iPad-Sonderzeichen:** Die iPad-Tastatur macht aus `'` ein `’` und setzt manchmal geschützte Leerzeichen. Die Antwort zählt trotzdem als richtig. → Test in Task 10.
4. **Paket aus Word, Pages oder TextEdit:** Die Lehrkraft speichert als RTF oder `.docx` und benennt in `.txt` um. Das Spiel zeigt eine klare Meldung statt Zeichensalat. → Test in Task 7.
5. **Tippfehler der Lehrkraft in `FALSCH`:** Eine falsche Antwort ist gleich der richtigen oder steht doppelt. Es gibt nie zwei gleiche Knöpfe und nie eine „falsche“ Antwort, die eigentlich richtig ist. → Tests in Task 7 und Task 10.

---

## Dateistruktur

```
index.html                  Einstieg: Canvas, #ui, #panel, #pad
package.json                nur "type": "module" und das Testskript, keine Abhängigkeiten
css/spiel.css               Layout quer/hoch, Kästen, Knöpfe, Steuerkreuz
js/main.js                  Start, game-Objekt, Szenenwechsel, Entwicklerabkürzungen
js/config.js                alle Zahlen
js/state.js                 Spielzustand im Speicher, Namen prüfen, Duellergebnis anwenden
js/core/rng.js              seedbarer Zufall
js/core/hash.js             FNV-1a (auch für den Prüfcode in Plan 2)
js/core/loop.js             Spielschleife
js/core/input.js            Tastatur und Steuerkreuz → logische Knöpfe
js/gfx/palette.js           32 Farben
js/gfx/sprites.js           Pixelraster lesen (rein, Node-tauglich)
js/gfx/canvasSprites.js     Pixelraster → Canvas, Zwischenspeicher (nur Browser)
js/gfx/screen.js            Puffer 240×160, Skalierung, CSS-Variablen
js/gfx/art/tiles.js         Kacheln und Gebäude
js/gfx/art/characters.js    Spielfigur, Ilvy, Trainerin, Bewohner
js/gfx/art/creatures.js     Wesen
js/gfx/art/eggs.js          Ei-Sprite mit Farben je Startwesen
js/data/species.js          Arten, Namen der Stufen, Besonderheiten
js/data/texts.js            Standardtexte der Trainer
js/pack/parser.js           Lernpaket lesen und prüfen
js/pack/packId.js           Paketkennung und Kurzform
js/pack/store.js            Paket im localStorage
js/duel/answers.js          Antworten prüfen, Auswahl und Kärtchen bauen
js/duel/questions.js        Fragenpool, Formwahl, gewichtetes Ziehen
js/duel/progress.js         XP, Level, Stufe, Energie
js/duel/duel.js             Duellregeln als Zustandsmaschine
js/world/map.js             Karten, Kollision, Trainerblick, Erreichbarkeit
js/world/encounters.js      Begegnungen im hohen Gras
js/world/player.js          Feldbewegung der Figur
js/world/maps/bucht.js      Leuchtturmbucht
js/ui/dom.js                kleine DOM-Helfer
js/ui/controls.js           Steuerkreuz und Knöpfe auf dem Bildschirm
js/ui/dialog.js             Textfenster und Auswahlfragen
js/ui/duelPanel.js          Antwortformen, Rückmeldung
js/scenes/title.js, pack.js, intro.js, name.js, eggs.js, world.js, duel.js, transition.js, gallery.js
pakete/vorlage.txt, pakete/englisch-6-beispiel.txt
tests/*.test.js, tests/helpers/fixtures.js
```

## Gemeinsame Schnittstellen

Diese Formen benutzen mehrere Tasks:

```js
// Szene
Scene = { enter?(): void, update(dtMs: number): void, render(ctx: CanvasRenderingContext2D, timeMs: number): void, exit?(): void }

// game (js/main.js), wächst über die Tasks
game = {
  config, rng, screen, input,          // Task 1–3
  ui: HTMLElement,                     // #ui, liegt genau über dem Spielbild
  panel: HTMLElement,                  // #panel, Textbereich: quer unten über dem Bild, hoch unter dem Bild
  reducedMotion: boolean,
  mode: 'walk' | 'dialog' | 'duel' | 'screen',  // setzt document.body.dataset.mode; Steuerkreuz nur bei 'walk'
  go(scene: Scene): void,              // ruft exit() der alten und enter() der neuen Szene
  overlay: { render(ctx, t): void } | null,     // Übergänge, Task 17
  pack: { text: string, data: Pack } | null,    // Task 9
  state: GameState | null,             // Task 15
}

// Frage (Ausgabe des Parsers, Task 7)
Question = { key: string, text: string, line: number, answer: string | null, sentence: string | null,
             alsoCorrect: string[], wrong: string[], extra: string[], forms: Form[] }
Form = 'choice' | 'typing' | 'tiles'
```

---

### Task 1: Gerüst, Konfiguration, Zufall

**Files:**
- Create: `package.json`, `js/config.js`, `js/core/rng.js`, `js/core/hash.js`
- Test: `tests/rng.test.js`, `tests/hash.test.js`

**Interfaces:**
- Produces: `CONFIG` (tief eingefroren), `createRng(seed: number) → { next(): number /*[0,1)*/, int(min, max): number /*beide inklusive*/, pick(arr), shuffle(arr) /*neues Array*/, weighted(items, weightFn) }`, `hash32(str: string) → number` (FNV-1a 32 Bit über UTF-8)

- [ ] **Step 1: Tests schreiben**

```js
// tests/rng.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../js/core/rng.js';

test('gleicher Seed ergibt gleiche Folge', () => {
  const a = createRng(42), b = createRng(42);
  for (let i = 0; i < 100; i++) assert.equal(a.next(), b.next());
});
test('int trifft beide Grenzen und nichts außerhalb', () => {
  const r = createRng(1), seen = new Set();
  for (let i = 0; i < 5000; i++) { const v = r.int(8, 25); assert.ok(v >= 8 && v <= 25); seen.add(v); }
  assert.equal(seen.size, 18);
});
test('shuffle lässt das Original unverändert', () => {
  const arr = [1, 2, 3, 4, 5], s = createRng(7).shuffle(arr);
  assert.deepEqual(arr, [1, 2, 3, 4, 5]);
  assert.deepEqual([...s].sort(), [1, 2, 3, 4, 5]);
});
test('weighted bevorzugt das höhere Gewicht', () => {
  const r = createRng(3); let a = 0;
  for (let i = 0; i < 4000; i++) if (r.weighted(['a', 'b'], x => (x === 'a' ? 3 : 1)) === 'a') a++;
  assert.ok(a > 2800 && a < 3200);
});

// tests/hash.test.js
import { hash32 } from '../js/core/hash.js';
test('FNV-1a Prüfwerte', () => {
  assert.equal(hash32(''), 0x811c9dc5);
  assert.equal(hash32('a'), 0xe40c292c);
  assert.equal(hash32('englisch6-beispiel'), 473995592);
});
```

- [ ] **Step 2: `node --test` ausführen.** Erwartet: FAIL, Module fehlen.

- [ ] **Step 3: Implementieren**
  - `package.json`: `{ "name": "lumara", "private": true, "type": "module", "scripts": { "test": "node --test" } }`
  - `rng.js`: mulberry32. `weighted` zieht proportional zu `weightFn(item)`.
  - `hash.js`: Startwert `0x811c9dc5`, pro Byte `h ^= b; h = Math.imul(h, 0x01000193) >>> 0`.
  - `config.js` mit genau diesen Werten (Design 6.2, 6.3, 6.4, 7.4, 10.2):

```js
export const CONFIG = deepFreeze({
  screen: { width: 240, height: 160, tile: 16 },
  walk: { msPerTile: 220 },
  text: { charsPerSecond: 40 },
  creature: { baseEnergy: 4, stageLevels: [1, 15, 35, 60], stageEnergyBonus: [0, 1, 2, 3],
              maxLifeStones: 3, kieselBonus: 1, maxLevel: 100 },
  xp: { levelBase: 10, levelPerLevel: 5, trainerBase: 40, trainerPerNumber: 20, bossFirst: 500,
        wildBase: 8, wildPerArea: 2, flawlessBonus: 0.25 },
  duel: { critEvery: 3, critEveryFromStage3: 2, nixiEvery: 3, wrongMinMs: 1500 },
  trainers: [ { energy: 5, time: null, level: 7 }, { energy: 6, time: null, level: 12 },
              { energy: 7, time: null, level: 17 }, { energy: 8, time: 40, level: 22 },
              { energy: 9, time: 35, level: 27 }, { energy: 10, time: 30, level: 32 },
              { energy: 11, time: 25, level: 37 }, { energy: 12, time: 20, level: 42 } ],
  wild: { energyByArea: [3, 3, 4, 4, 4, 5, 5, 5],
          levelByArea: [[2, 5], [5, 9], [9, 14], [14, 19], [19, 24], [24, 29], [29, 34], [34, 40]],
          rareChance: 0.1 },
  encounter: { minSteps: 8, maxSteps: 25, curve: 1.3 },
  questionWeights: { wrongLast: 3, neverAsked: 2, normal: 1, mastered: 0.5 },
  pack: { maxBytes: 1048576, minQuestions: 8, recommendedQuestions: 20, maxHello: 5,
          templateId: 'fach-jahrgang-name' },
  names: { maxLength: 12 },
});
```

  `levelByArea` (angezeigtes Level wilder Wesen) und `rareChance` sind Entscheidungen von Claude.

- [ ] **Step 4: `node --test` ausführen.** Erwartet: `# fail 0`.
- [ ] **Step 5: Commit** – `git add package.json js tests && git commit -m "Gerüst mit Konfiguration, Zufall und Hash anlegen"`

---

### Task 2: Bildschirm, Schleife, Palette, Sprites

**Files:**
- Create: `index.html`, `css/spiel.css`, `js/main.js`, `js/core/loop.js`, `js/gfx/palette.js`, `js/gfx/sprites.js`, `js/gfx/canvasSprites.js`, `js/gfx/screen.js`
- Test: `tests/sprites.test.js`

**Interfaces:**
- Produces:
  - `PALETTE: { char, name, hex }[]` (32 Einträge, Farbindex = Position + 1, 0 = durchsichtig), `CHARS: Record<char, index>`, `COLOR: Record<name, index>`, `hexOf(index) → string|null`
  - `rows(str: string) → string[]` (Vorlagen-String → Zeilen, ohne leere Rand-Zeilen und ohne gemeinsame Einrückung)
  - `parseSprite(name: string, rows: string[]) → { name, w, h, data: Uint8Array }`
  - `spriteCanvas(sprite, { flip = false } = {}) → HTMLCanvasElement` (zwischengespeichert pro Sprite und Spiegelung)
  - `createScreen(displayCanvas, stageEl) → { ctx /*Puffer 240×160*/, present(), resize() }`. Setzt auf `document.documentElement` die CSS-Variablen `--img-left`, `--img-top`, `--img-width`, `--img-height` (px) und `--gpx` (CSS-Pixel pro Spielpixel).
  - `startLoop({ update(dtMs), render(timeMs) }) → stop()`
  - DOM: `#stage > canvas#screen + #ui`, daneben `#panel` und `#pad`

- [ ] **Step 1: Tests schreiben**

```js
// tests/sprites.test.js
import { PALETTE, CHARS } from '../js/gfx/palette.js';
import { parseSprite, rows } from '../js/gfx/sprites.js';

test('Palette: 32 verschiedene Farben, 32 verschiedene Zeichen, kein Punkt', () => {
  assert.equal(PALETTE.length, 32);
  assert.equal(new Set(PALETTE.map(p => p.hex)).size, 32);
  assert.equal(new Set(PALETTE.map(p => p.char)).size, 32);
  assert.ok(!('.' in CHARS));
});
test('parseSprite liest Größe und Farbindizes', () => {
  const s = parseSprite('probe', ['.k', 'kc']);
  assert.equal(s.w, 2); assert.equal(s.h, 2);
  assert.deepEqual([...s.data], [0, CHARS.k, CHARS.k, CHARS.c]);
});
test('falsche Zeilenlänge nennt Sprite und Zeile', () => {
  assert.throws(() => parseSprite('baum', ['kk', 'k']), /baum.*Zeile 2/);
});
test('unbekanntes Zeichen wird genannt', () => {
  assert.throws(() => parseSprite('x', ['kq']), /'q'/);
});
test('rows entfernt Rand-Leerzeilen und Einrückung', () => {
  assert.deepEqual(rows('\n    .k\n    kc\n  '), ['.k', 'kc']);
});
```

- [ ] **Step 2: `node --test tests/sprites.test.js`.** Erwartet: FAIL.

- [ ] **Step 3: Palette und Sprite-Leser implementieren.** Palette (Claude), in dieser Reihenfolge:

| Zeichen | Name | Hex | Zeichen | Name | Hex | Zeichen | Name | Hex |
|---|---|---|---|---|---|---|---|---|
| k | ink | #1b1a2e | Y | sandlight | #f1ddb0 | A | foam | #a7dde8 |
| n | night | #2b2d4a | F | forest | #24493d | P | plum | #5e3a6e |
| d | dusk | #46496e | l | leaf | #3d7a55 | v | violet | #8f62a8 |
| s | slate | #6b6f94 | g | moss | #6aa55c | V | lilac | #c49ad9 |
| m | mist | #a3a7c4 | G | meadow | #9cc76a | R | rose | #e6a3c0 |
| f | fog | #d4d6e6 | T | mint | #b5e3c4 | e | ember | #b8412f |
| c | cream | #f3ecd2 | t | teal | #3f8f86 | C | coral | #e0705a |
| w | white | #fffaf0 | D | deep | #1f3f66 | p | peach | #f2a98a |
| b | bark | #4a3328 | S | sea | #2f6f9c | h | gold | #e8b64a |
| o | wood | #7a5236 | L | lagoon | #4fa3c4 | H | lamp | #ffe08a |
| r | frame | #a8743a | y | sand | #e2c48f | | | |

  `.` ist durchsichtig. Fehlermeldungen: `Sprite baum: Zeile 2 hat Länge 1 statt 2` und `Sprite x: unbekanntes Zeichen 'q' in Zeile 1`.

- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.

- [ ] **Step 5: Bildschirm, Schleife und Seite bauen**
  - `index.html`: `lang="de"`, Titel „Lumara – Das Land unter dem Nebel“, Viewport `width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no`, `apple-mobile-web-app-capable`, `<script type="module" src="js/main.js">`. Im `<noscript>` und im Fuß der Lizenzhinweis (Lizenzhinweis mit Namen, am 4.11.2026 entfernt) als HTML-Kommentar.
  - `screen.js`: Der sichtbare Canvas ist so groß wie `#stage` × `devicePixelRatio`. Er zeichnet den Puffer mit `imageSmoothingEnabled = false`, Maßstab `min(breite/240, höhe/160)`, zentriert (auch nicht ganzzahlig, Claude). Bei `resize` und `orientationchange` wird neu berechnet und die CSS-Variablen werden gesetzt.
  - `loop.js`: fester Schritt 1000/60 ms, höchstens 5 Schritte pro Frame. Pausiert bei `document.hidden` und setzt die Zeit danach zurück, damit nichts nachgeholt wird.
  - `spiel.css`: `100dvh`, kein Scrollen, `touch-action: manipulation`, `user-select: none` außer in Eingabefeldern, `overscroll-behavior: none`. **Quer:** `#stage` füllt den Bildschirm, `#ui` liegt über den CSS-Variablen des Bildrechtecks, `#panel` liegt `position: fixed` über dem unteren Teil des Bildes (Breite = Bildbreite, `max-height` 75 % der Bildhöhe, `overflow: auto`). **Hoch** (`orientation: portrait`): `#stage` oben im Seitenverhältnis 3 : 2, `#panel` und `#pad` füllen den Bereich darunter. Sichere Ränder über `env(safe-area-inset-*)`. Farbvariablen `--cream: #f3ecd2; --frame: #a8743a; --ink: #1d2b3a; --button: #2f4a5e; --ok: #3d8f4f; --bad: #c0392b`.
  - `main.js` vorerst: Es baut `game` (config, rng mit Seed aus `Date.now()`, screen, ui, panel, reducedMotion aus `matchMedia('(prefers-reduced-motion: reduce)')`, `go`) und zeichnet ein Testbild: ein Schachbrett aus 16er-Feldern, alle 32 Palettenfarben als Streifen und ein Test-Sprite.

- [ ] **Step 6: Im Browser prüfen.** Mit `http://localhost:8000/` sieht man das Testbild scharf und mit harten Pixelkanten, es füllt das Fenster mit Rändern und behält 3 : 2. Hochformat (Fenster schmal ziehen oder Gerätesimulation) zeigt das Bild oben. Keine Fehler in der Konsole.

- [ ] **Step 7: Commit** – `git commit -m "Bildschirm mit Skalierung, Schleife, Palette und Sprite-Leser"`

---

### Task 3: Eingabe – Tastatur und Steuerkreuz

**Files:**
- Create: `js/core/input.js`, `js/ui/controls.js`
- Modify: `css/spiel.css`, `js/main.js`, `index.html` (Inhalt von `#pad`)
- Test: `tests/input.test.js`

**Interfaces:**
- Produces:
  - `keyToButton(key: string, inTextField: boolean) → 'up'|'down'|'left'|'right'|'a'|'b'|'menu'|null`
  - `dpadDirection(dx: number, dy: number, deadzone: number) → 'up'|'down'|'left'|'right'|null`
  - `createInput({ target = window } = {}) → Input` mit `dir()` (zuletzt gedrückte, noch gehaltene Richtung), `held(btn)`, `pressed(btn)` (Flanke seit dem letzten `endFrame()`), `on(btn, fn) → off()` (sofort bei Flanke), `consume()` (löscht alle Flanken dieses Frames), `endFrame()`, `setVirtual(btn, down: boolean)` (für das Steuerkreuz)
  - `mountControls(padEl, input)` baut Steuerkreuz, A, B und den (noch versteckten) Menüknopf
  - `game.input`

- [ ] **Step 1: Tests schreiben**

```js
import { keyToButton, dpadDirection } from '../js/core/input.js';

test('Pfeile/WASD laufen, Enter/Leertaste = A, Esc/Rücktaste = B, M = Menü', () => {
  assert.equal(keyToButton('ArrowUp', false), 'up');
  assert.equal(keyToButton('a', false), 'left');
  assert.equal(keyToButton('D', false), 'right');
  assert.equal(keyToButton('Enter', false), 'a');
  assert.equal(keyToButton(' ', false), 'a');
  assert.equal(keyToButton('Escape', false), 'b');
  assert.equal(keyToButton('Backspace', false), 'b');
  assert.equal(keyToButton('m', false), 'menu');
  assert.equal(keyToButton('x', false), null);
});
test('Prüffokus: im Textfeld löst keine Taste eine Spielaktion aus', () => {
  for (const k of ['w', 'a', 's', 'd', 'm', ' ', 'Enter', 'Escape', 'Backspace', 'ArrowLeft'])
    assert.equal(keyToButton(k, true), null);
});
test('Steuerkreuz: stärkere Achse gewinnt, Gleichstand waagerecht, Mitte ist tot', () => {
  assert.equal(dpadDirection(30, 10, 12), 'right');
  assert.equal(dpadDirection(-5, -40, 12), 'up');
  assert.equal(dpadDirection(20, 20, 12), 'right');
  assert.equal(dpadDirection(4, 3, 12), null);
});
```

- [ ] **Step 2: `node --test tests/input.test.js`.** Erwartet: FAIL.
- [ ] **Step 3: `keyToButton` und `dpadDirection` implementieren.** Die tote Zone ist ein Kreis mit Radius `deadzone`.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: `createInput` und `mountControls` implementieren**
  - `keydown` und `keyup` auf `window`. `inTextField` ist wahr, wenn `event.target` ein `input`, `textarea` oder `contenteditable` ist. Nur bei erkanntem Knopf `preventDefault()`. Bei `blur` und `visibilitychange` werden alle gehaltenen Knöpfe losgelassen.
  - Steuerkreuz: Pointer-Events mit `setPointerCapture`, Richtung bei jedem `pointermove` über `dpadDirection` (tote Zone 15 % des Durchmessers), Gleiten zwischen Richtungen erlaubt. A und B sind eigene Pointer, mehrere Finger gleichzeitig funktionieren. Größen: Steuerkreuz 150 px, A 84 px, B 64 px (Claude).
  - Anordnung: quer halbtransparent über den unteren Ecken, Steuerkreuz rechts, A und B links (A größer, rechts oberhalb von B). Hoch: im Bereich unter dem Bild, gleiche Seiten.
  - Sichtbar nur bei `body.touch` **und** `body[data-mode="walk"]`. `body.touch` wird bei `matchMedia('(any-pointer: coarse)').matches` oder beim ersten `pointerdown` mit `pointerType === 'touch'` gesetzt.
  - `main.js` ruft `input.endFrame()` am Ende jedes `update`. Testbild vorerst: Ein 16er-Quadrat bewegt sich mit `input.dir()`, gedrückte Knöpfe stehen als Text in `#ui`.
- [ ] **Step 6: Im Browser prüfen.** Mit Tastatur läuft das Quadrat. In der Touch-Simulation erscheint das Steuerkreuz, Gleiten von oben nach rechts wechselt die Richtung, A und B gleichzeitig mit dem Steuerkreuz werden erkannt.
- [ ] **Step 7: Commit** – `git commit -m "Eingabe über Tastatur und Steuerkreuz"`

---

### Task 4: Kartenlogik und Begegnungen

**Files:**
- Create: `js/world/map.js`, `js/world/encounters.js`, `tests/helpers/fixtures.js` (mit `TEST_MAP_DEF`)
- Test: `tests/map.test.js`, `tests/encounters.test.js`

**Interfaces:**
- Produces:
  - Kartendefinition (Daten): `{ id, name, area, rows: string[], legend: Record<char, TileKind>, objects: MapObject[], spawn: {x, y, dir}, respawn: {x, y, dir} }`
  - `TileKind`: begehbar `'grass' | 'tallgrass' | 'path' | 'sand' | 'flowers' | 'pier'`, blockiert `'water' | 'tree' | 'rock' | 'fence' | 'fog' | 'cliff'`
  - `MapObject`: `{ type: 'npc', id, x, y, dir, sprite, lines: string[] }` · `{ type: 'trainer', number, x, y, dir, sight, sprite }` · `{ type: 'sign', x, y, lines }` · `{ type: 'building', id, x, y, w, h, sprite, door: {dx, dy}, onDoor: 'heal' | 'locked' }` (Gebäude blockieren ihre ganze Fläche)
  - `createMap(def) → GameMap { def, width, height, tileAt(x, y), isTallGrass(x, y), objectAt(x, y), doorAt(x, y) → building|null, canEnter(x, y, occupied?: Set<string>) }`
  - `step({x, y}, dir) → {x, y}`, `cellKey(x, y) → "x,y"`
  - `trainerSees(map, trainer, playerPos) → number | null` (Abstand in Feldern oder `null`)
  - `reachable(map, start) → Set<string>` (Breitensuche über begehbare Felder)
  - `nextThreshold(rng) → number`, `createEncounterCounter(rng) → { onStep(inTallGrass: boolean) → boolean }`
  - `pickWild(areaTable: { common: string[], rare: string }, rng) → string`, `wildLevel(area, rng) → number`

- [ ] **Step 1: Tests schreiben**

```js
// tests/helpers/fixtures.js
export const TEST_MAP_DEF = { id: 't', name: 'Test', area: 1,
  rows: ['######', '#..,,#', '#..,.#', '#.~o.#', '######'],
  legend: { '#': 'tree', '.': 'grass', ',': 'tallgrass', '~': 'water', 'o': 'rock' },
  objects: [{ type: 'trainer', number: 1, x: 1, y: 1, dir: 'right', sight: 4, sprite: 'trainer1' }],
  spawn: { x: 1, y: 2, dir: 'down' }, respawn: { x: 1, y: 2, dir: 'down' } };

// tests/map.test.js
const DEF = TEST_MAP_DEF;

test('createMap liest Größe und Kacheln', () => {
  const m = createMap(DEF);
  assert.equal(m.width, 6); assert.equal(m.height, 5);
  assert.equal(m.tileAt(3, 1), 'tallgrass'); assert.equal(m.isTallGrass(3, 2), true);
});
test('Bäume, Wasser, Steine, Figuren und Kartenrand blockieren', () => {
  const m = createMap(DEF);
  assert.equal(m.canEnter(0, 0), false); assert.equal(m.canEnter(2, 3), false);
  assert.equal(m.canEnter(3, 3), false); assert.equal(m.canEnter(1, 1), false);
  assert.equal(m.canEnter(-1, 2), false); assert.equal(m.canEnter(2, 1), true);
  assert.equal(m.canEnter(2, 1, new Set(['2,1'])), false);
});
test('Fehler nennen Karte und Zeile', () => {
  assert.throws(() => createMap({ ...DEF, rows: ['###', '#.'] }), /Test.*Zeile 2/);
  assert.throws(() => createMap({ ...DEF, rows: ['#?#'] }), /Test.*'\?'/);
});
test('Trainer sieht geradeaus bis zur Sichtweite, nicht nach hinten, nicht durch Hindernisse', () => {
  const m = createMap(DEF), t = DEF.objects[0];
  assert.equal(trainerSees(m, t, { x: 3, y: 1 }), 2);
  assert.equal(trainerSees(m, t, { x: 1, y: 2 }), null);
  assert.equal(trainerSees(m, { ...t, x: 4, y: 3, dir: 'left', sight: 4 }, { x: 1, y: 3 }), null);
});
test('reachable findet alle begehbaren Felder vom Start', () => {
  assert.equal(reachable(createMap(DEF), DEF.spawn).has('4,3'), true);
});

// tests/encounters.test.js
test('Schwellen zwischen 8 und 25, im Mittel 14 bis 16', () => {
  const r = createRng(5); let sum = 0;
  for (let i = 0; i < 20000; i++) { const t = nextThreshold(r); assert.ok(t >= 8 && t <= 25); sum += t; }
  assert.ok(sum / 20000 >= 14 && sum / 20000 <= 16);
});
test('nur Grasschritte zählen, nie zwei Begegnungen unter 8 Grasschritten', () => {
  const c = createEncounterCounter(createRng(9)); let since = 0;
  for (let i = 0; i < 5000; i++) {
    assert.equal(c.onStep(false), false);
    since++;
    if (c.onStep(true)) { assert.ok(since >= 8); since = 0; }
  }
});
test('seltene Art in etwa 10 % der Fälle', () => {
  const r = createRng(2); let rare = 0;
  for (let i = 0; i < 10000; i++) if (pickWild({ common: ['a', 'b'], rare: 'c' }, r) === 'c') rare++;
  assert.ok(rare > 800 && rare < 1200);
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Implementieren.** `nextThreshold = minSteps + floor((maxSteps − minSteps + 1) · u^curve)` mit `u = rng.next()`. Der Zähler zieht nach jeder Begegnung eine neue Schwelle und fängt bei 0 an. `trainerSees`: Alle Felder zwischen Trainer und Spieler müssen `canEnter` erfüllen. `wildLevel` nimmt `rng.int` über `CONFIG.wild.levelByArea[area − 1]`. Fehlermeldungen: `Karte Test: Zeile 2 hat Länge 2 statt 3`, `Karte Test: unbekanntes Zeichen '?' in Zeile 1`.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Commit** – `git commit -m "Kartenlogik mit Kollision, Trainerblick und Begegnungen"`

---

### Task 5: Leuchtturmbucht – Kacheln, Karte, Laufen

**Files:**
- Create: `js/gfx/art/tiles.js`, `js/world/maps/bucht.js`, `js/world/player.js`, `js/scenes/world.js`
- Modify: `js/main.js` (startet vorerst direkt die Weltszene)
- Test: `tests/player.test.js`, `tests/bucht.test.js`

**Interfaces:**
- Consumes: `createMap`, `step`, `reachable`, `trainerSees` (Task 4), `parseSprite`, `rows`, `spriteCanvas` (Task 2), `game.input` (Task 3)
- Produces:
  - `TILES: Record<TileKind, string[][]>` (Bilder pro Kachel, je 16 × 16, `water` hat 2 Bilder, `tallgrass` hat 2 Bilder: ruhig, bewegt), `BUILDINGS: { lighthouse /*32×64*/, house /*48×48*/, boat /*32×16*/ }` als `string[]`
  - `BUCHT` (Kartendefinition)
  - `createPlayer({ x, y, dir }) → { x, y, dir, moving, progress /*0..1*/, frame /*0|1*/, update(dtMs, intent: { dir, a }, map, occupied?) → Event[], teleport(x, y, dir) }` mit `Event = { type: 'stepped', x, y } | { type: 'interact', x, y, target: MapObject | null }`
  - `createWorldScene(game) → Scene & { player, map, lock(fn: () => Promise<void>): Promise<void>, onStepped: ((x, y) => Promise<void>|void)[] , onInteract: ((ev) => Promise<void>|void)[] }`. Solange `lock` läuft, bewegt sich die Figur nicht.

- [ ] **Step 1: Tests schreiben**

```js
// tests/player.test.js  (TEST_MAP_DEF aus Task 4)
test('gehaltene Richtung: nach msPerTile genau ein Feld und ein stepped-Ereignis', () => {
  const m = createMap(TEST_MAP_DEF), p = createPlayer({ x: 1, y: 2, dir: 'up' });
  assert.deepEqual(p.update(100, { dir: 'down', a: false }, m), []);
  assert.equal(p.moving, true);
  assert.deepEqual(p.update(120, { dir: null, a: false }, m), [{ type: 'stepped', x: 1, y: 3 }]);
  assert.equal(p.moving, false); assert.equal(p.dir, 'down');
});
test('gegen Wasser dreht sich die Figur nur um', () => {
  const m = createMap(TEST_MAP_DEF), p = createPlayer({ x: 1, y: 3, dir: 'down' });
  p.update(16, { dir: 'right', a: false }, m);
  assert.equal(p.dir, 'right'); assert.equal(p.moving, false); assert.equal(p.x, 1);
});
test('A meldet das Feld und das Objekt in Blickrichtung', () => {
  const m = createMap(TEST_MAP_DEF), p = createPlayer({ x: 1, y: 2, dir: 'up' });
  const [ev] = p.update(16, { dir: null, a: true }, m);
  assert.equal(ev.type, 'interact'); assert.equal(ev.target.type, 'trainer');
});

// tests/bucht.test.js
test('Bucht: 40 × 30, fehlerfrei, Start und Aufwachpunkt begehbar', () => {
  const m = createMap(BUCHT);
  assert.equal(m.width, 40); assert.equal(m.height, 30);
  assert.ok(m.canEnter(BUCHT.spawn.x, BUCHT.spawn.y));
  assert.ok(m.canEnter(BUCHT.respawn.x, BUCHT.respawn.y));
});
test('vom Start erreichbar: Ilvy, Trainerin, jedes Schild, jeder Bewohner, Leuchtturmtür, mindestens 12 Grasfelder', () => {
  const m = createMap(BUCHT), r = reachable(m, BUCHT.spawn);
  const nextTo = (x, y) => [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => r.has(cellKey(x + dx, y + dy)));
  for (const o of BUCHT.objects.filter(o => o.type !== 'building')) assert.ok(nextTo(o.x, o.y), `${o.type} ${o.id ?? o.number}`);
  const lh = BUCHT.objects.find(o => o.id === 'leuchtturm');
  assert.equal(lh.onDoor, 'heal'); assert.ok(nextTo(lh.x + lh.door.dx, lh.y + lh.door.dy));
  assert.ok([...r].filter(k => m.isTallGrass(...k.split(',').map(Number))).length >= 12);
  assert.ok(BUCHT.objects.some(o => o.type === 'npc' && o.id === 'ilvy'));
  assert.ok(BUCHT.objects.some(o => o.type === 'trainer' && o.number === 1));
});
test('Nebel schließt den Weg nach Norden, davor steht ein Schild', () => {
  const m = createMap(BUCHT), r = reachable(m, BUCHT.spawn);
  const fog = []; for (let y = 0; y < 3; y++) for (let x = 0; x < 40; x++) if (m.tileAt(x, y) === 'fog') fog.push([x, y]);
  assert.ok(fog.length >= 3);
  assert.ok(BUCHT.objects.some(o => o.type === 'sign' && r.has(cellKey(o.x, o.y + 1)) && m.tileAt(o.x, o.y - 1) === 'fog'));
});
test('Trainerin 1 blickt über mindestens 2 begehbare Felder', () => {
  const m = createMap(BUCHT), t = BUCHT.objects.find(o => o.type === 'trainer');
  let p = { x: t.x, y: t.y }, n = 0;
  for (let i = 0; i < t.sight; i++) { p = step(p, t.dir); if (m.canEnter(p.x, p.y)) n++; else break; }
  assert.ok(n >= 2);
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: `createPlayer` implementieren.** Ist die Figur nicht in Bewegung und wird eine Richtung gehalten, schaut sie dorthin. Ist das Feld frei, beginnt sie zu laufen. Übrige Zeit wird in den nächsten Schritt übernommen, damit gehaltenes Laufen flüssig bleibt. Das Laufbild wechselt pro Schritt. A wirkt nur im Stand.
- [ ] **Step 4: Kacheln und Karte zeichnen** (Pixel-Art liegt beim Builder, Design 18):
  - Stimmung Bucht: Sand, Meer (deep/sea/lagoon/foam), Gras (leaf/moss/meadow), warmes Holz. Wasserkanten bekommen beim Zeichnen eine Schaumlinie (foam), wo Land angrenzt. Dafür ist keine eigene Kantenkachel nötig.
  - `BUCHT` (40 × 30): Süden Strand und Meer mit Steg und Boot (Gebäude `boot`, `onDoor: 'locked'`). In der Mitte das Fischerdorf mit Ilvys Haus und zwei weiteren Häusern (`onDoor: 'locked'`, Text „Die Tür ist verschlossen.“). Im Osten auf einer Landzunge der Leuchtturm (`id: 'leuchtturm'`, `onDoor: 'heal'`). Im Westen und Norden mindestens zwei Flächen hohes Gras. Am Nordrand eine Nebelwand (2 bis 3 Reihen `fog`) über dem Weg zum Flüsterwald. Davor ein Schild: „Der Nebel ist hier zu dicht. Vielleicht weicht er, wenn der Leuchtstein der Bucht wieder leuchtet.“ Die Trainerin steht am Nordweg vor dem Nebel. Außerdem ein Ortsschild „Leuchtturmbucht“. `spawn` liegt am Steg, `respawn` vor der Leuchtturmtür.
  - Bewohner kommen in Task 6. Hier stehen schon `npc`-Objekte mit `lines`: Ilvy am Leuchtturm und 3 Bewohner (Claude: Fischer am Steg, Kind am hohen Gras, Netzflickerin vor ihrem Haus).
- [ ] **Step 5: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 6: Weltszene bauen.** Die Kamera folgt der Figur (interpolierte Position) und bleibt im Kartenrand. Zeichenreihenfolge: Kacheln, dann Gebäude, Figuren und Spielfigur nach y sortiert. Wasser wechselt alle 600 ms das Bild. Hohes Gras zeigt beim Betreten 200 ms das bewegte Bild. Der Nebel ist eine wabernde, halbtransparente Schicht aus zwei gegeneinander verschobenen weichen Fleckenmustern (fog/mist, Alpha 0,6 bis 0,85), bei reduzierter Bewegung unbewegt. Die Leuchtturmlampe glimmt langsam (Periode ≥ 2 s). Platzhalter für Figuren sind farbige Quadrate, die kommen in Task 6. `main.js` startet vorerst direkt `createWorldScene` mit `game.mode = 'walk'`.
- [ ] **Step 7: Im Browser prüfen.** Laufen mit Tastatur und Steuerkreuz, Kollision mit Wasser, Häusern, Bäumen und Nebel, die Kamera stoppt am Rand, Wasser bewegt sich, der Nebel wabert, 60 fps (Chrome-Performance-Panel: keine langen Frames beim Laufen).
- [ ] **Step 8: Commit** – `git commit -m "Leuchtturmbucht mit Kacheln, Karte und Laufen"`

---

### Task 6: Textfenster, Figuren, Bewohner

**Files:**
- Create: `js/ui/dom.js`, `js/ui/dialog.js`, `js/gfx/art/characters.js`
- Modify: `js/scenes/world.js`, `js/world/maps/bucht.js`, `css/spiel.css`
- Test: `tests/characters.test.js`

**Interfaces:**
- Consumes: `game.panel`, `game.input.on/consume`, Weltszene `lock`, `onInteract` (Task 5)
- Produces:
  - `el(tag, props?, ...children) → HTMLElement`, `clear(node)`
  - `say(game, lines: string[], { speaker?: string } = {}) → Promise<void>`
  - `choose(game, prompt: string, options: string[], { cancelIndex = options.length - 1 } = {}) → Promise<number>` (B wählt `cancelIndex`)
  - `CHARACTERS: Record<string, { down: string[][], up: string[][], side: string[][] }>` (je Richtung Bilder zu 16 × 16, `side` schaut nach rechts und wird für links gespiegelt). `player` hat 2 Bilder pro Richtung, alle anderen mindestens 1.

- [ ] **Step 1: Test schreiben**

```js
import { CHARACTERS } from '../js/gfx/art/characters.js';
import { BUCHT } from '../js/world/maps/bucht.js';

test('alle Figurenbilder sind 16 × 16 und lesbar', () => {
  for (const [id, dirs] of Object.entries(CHARACTERS))
    for (const [d, frames] of Object.entries(dirs))
      frames.forEach((f, i) => { const s = parseSprite(`${id}.${d}.${i}`, f); assert.equal(s.w, 16); assert.equal(s.h, 16); });
  for (const d of ['down', 'up', 'side']) assert.equal(CHARACTERS.player[d].length, 2);
});
test('jede Figur der Bucht hat Bilder und Text, jede Zeile höchstens 100 Zeichen', () => {
  for (const o of BUCHT.objects.filter(o => o.type === 'npc' || o.type === 'trainer')) assert.ok(CHARACTERS[o.sprite], o.sprite);
  for (const o of BUCHT.objects.filter(o => o.lines)) { assert.ok(o.lines.length >= 1); for (const l of o.lines) assert.ok(l.length <= 100, l); }
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Figuren zeichnen.** Spielfigur: neutrale Figur mit Kapuzenumhang (Design 14). Ilvy: Leuchtturmwärterin mit Laterne. `trainer1`: junge Fischerin mit Netz und Kopftuch (Design 5.3). Dazu 3 Bewohner. Je Figur eine eigene, gut unterscheidbare Hauptfarbe.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Textfenster und Gespräche bauen**
  - `say`: Kasten im Pixel-Stil (cream/frame), Schrift ≥ 18 px, darüber der Sprechername. Die Schreibmaschinenschrift läuft mit `CONFIG.text.charsPerSecond`. A oder ein Tipp auf den Kasten zeigt zuerst die ganze Zeile, dann die nächste. Ein ▼ zeigt an, dass es weitergeht. Während des Fensters gilt `game.mode = 'dialog'`, danach wieder der vorige Modus. **Vor dem Auflösen `game.input.consume()`**, damit dasselbe A das Gespräch nicht sofort wieder startet.
  - `choose`: Kasten mit Frage und Knöpfen (≥ 48 px) untereinander. Hoch/Runter und A wählen, Tippen wählt direkt, B wählt `cancelIndex`.
  - Weltszene: Bei `interact` auf eine Figur dreht sie sich zur Spielfigur, dann `lock(() => say(game, o.lines, { speaker: Name }))`. Schilder und verschlossene Türen zeigen ihren Text. Die Leuchtturmtür bleibt bis Task 17 ohne Wirkung.
  - Bewohnertexte (Claude, im Rahmen von Design 5.6): Ilvy erzählt vom Nebel und sagt, dass das Licht des Leuchtturms Wesen neue Kraft gibt. Der Fischer erzählt von der Hüterin am Nordweg. Das Kind warnt vor wilden Wesen im hohen Gras und verrät, dass man mit B fliehen kann. Die Netzflickerin erzählt von den erloschenen Leuchtsteinen.
- [ ] **Step 6: Im Browser prüfen.** Jede Figur ansprechen: Sie dreht sich um, der Text läuft und lässt sich überspringen. Nach dem letzten Fenster startet das Gespräch nicht neu. Im Hochformat erscheint der Kasten unter dem Bild und das Steuerkreuz ist währenddessen verborgen.
- [ ] **Step 7: Commit** – `git commit -m "Textfenster, Figuren und Bewohner der Bucht"`

---

### Task 7: Lernpaket-Parser und Prüfung

**Files:**
- Create: `js/pack/parser.js`, `js/pack/packId.js`, `js/data/texts.js`
- Modify: `tests/helpers/fixtures.js` (aus Task 4)
- Test: `tests/parser.test.js`, `tests/packId.test.js`

**Interfaces:**
- Consumes: `hash32` (Task 1), `CONFIG.pack`
- Produces:
  - `parsePack(text: string) → { ok: boolean, errors: Issue[], warnings: Issue[], pack: Pack | null }` mit `Issue = { line: number | null, message: string }`
  - `Pack = { title, subject, kennung: string | null, identity: string, shortId: string, timePressure: 'normal' | 'lang' | 'aus', trainers: Trainer[], boss: { hello: string[], win, loss } | null, notes: Question[] }`
  - `Trainer = { number, name, topic, hello: string[], win, loss, rematch, questions: Question[] }` (fehlende Zeilen sind mit `DEFAULT_LINES` gefüllt)
  - `packIdentity(text, kennung) → string`, `shortId(identity) → string`
  - `DEFAULT_LINES = { hello: 'Zeig mir, was du gelernt hast!', win: 'Gut gemacht! Du hast gewonnen.', loss: 'Diesmal nicht. Übe noch ein bisschen und komm wieder!', rematch: 'Du bist zurück? Diesmal bin ich vorbereitet!' }`
  - Fixtures (zusätzlich zu `TEST_MAP_DEF`): `makePackText({ trainers = 1, questions = 8, kennung = 'test-paket' } = {}) → string` (Kopf mit `PAKET: Testpaket`, `KENNUNG` nur wenn nicht `null`, `FACH: Englisch`; je Trainer `NAME`, `THEMA`, eine `HALLO`-Zeile und Fragen `FRAGE: T{t} Frage {i}` / `ANTWORT: a{i}` / `FALSCH: b | c | d`, jede Frage mit Leerzeile danach), `fillerQuestions(n, prefix) → string` (`FRAGE: {prefix} Frage {i}` / `ANTWORT: x{i}` / Leerzeile), `q(overrides) → Question` (Standard: `text 'Frage'`, `answer 'plays'`, `wrong ['play', 'playing', 'played']`, `forms ['choice', 'typing']`, `key` = `text` in Kleinbuchstaben, auch wenn `text` überschrieben wird)

- [ ] **Step 1: Tests schreiben.** Die Meldungen stehen wörtlich in der Tabelle unter Step 3.

```js
const EXAMPLE = `# Kommentar
PAKET: Englisch Jahrgang 6 – Beispielpaket
KENNUNG: englisch6-beispiel
FACH: Englisch
ZEITDRUCK: normal

=== TRAINER 1 ===
NAME: Captain Maren
THEMA: Simple present
HALLO: Ahoy, traveller! Nobody passes my beach without a test.
HALLO: Show me what you know about the simple present!
SIEG: Well done! The first light is yours.

FRAGE: She ___ (play) tennis every Monday.
ANTWORT: plays
FALSCH: play | playing | played

FRAGE: Wie heißt „Schmetterling“ auf Englisch?
ANTWORT: butterfly

FRAGE: Bilde den Satz: „Er geht nie zu Fuß zur Schule.“
SATZ: He never walks to school.
EXTRA: walk | always

FRAGE: Which word means „oft“?
ANTWORT: often
FALSCH: never | sometimes | always
FORM: auswahl

` + fillerQuestions(4, 'F');

test('liest das Beispiel aus dem Design', () => {
  const r = parsePack(EXAMPLE), t = r.pack.trainers[0];
  assert.equal(r.ok, true); assert.deepEqual(r.errors, []);
  assert.equal(t.name, 'Captain Maren'); assert.equal(t.topic, 'Simple present');
  assert.equal(t.hello.length, 2); assert.equal(t.loss, DEFAULT_LINES.loss);
  assert.deepEqual(t.questions.slice(0, 4).map(q => q.forms), [['choice', 'typing'], ['typing'], ['tiles'], ['choice']]);
  assert.deepEqual(t.questions[0].wrong, ['play', 'playing', 'played']);
  assert.deepEqual(t.questions[2].extra, ['walk', 'always']);
  assert.equal(t.questions[0].line, 14);
  assert.equal(r.pack.shortId, 'ENQ9'); assert.equal(r.pack.timePressure, 'normal');
});
test('großzügig: BOM, CRLF, Groß-/Kleinschreibung, Leerzeichen vor dem Doppelpunkt', () => {
  const text = '﻿' + makePackText().replace(/\n/g, '\r\n').replace('PAKET:', 'paket :').replace(/ANTWORT:/g, 'Antwort:');
  assert.equal(parsePack(text).ok, true);
});
test('AUCH RICHTIG wird an | getrennt', () => {
  const r = parsePack(makePackText() + 'FRAGE: Farbe?\nANTWORT: color\nAUCH RICHTIG: colour |  Color \n');
  assert.deepEqual(r.pack.trainers[0].questions.at(-1).alsoCorrect, ['colour', 'Color']);
});
test('Fehler mit Zeilennummer', () => {
  const base = makePackText(), line = base.split('\n').length;
  assert.deepEqual(parsePack(base + 'FRAGE: Ohne Antwort\n').errors, [{ line, message: `Zeile ${line}: Bei dieser Frage fehlt ANTWORT oder SATZ.` }]);
  assert.match(parsePack(base + 'FRAGE: X\nANTWORT: a\nFALSCH: b | c\n').errors[0].message, /^Zeile \d+: Für die Auswahl braucht es mindestens 3 falsche Antworten\.$/);
});
test('Trainer lückenlos ab 1, höchstens 8, mindestens 8 Fragen', () => {
  const t = makePackText({ trainers: 5 }).replace('=== TRAINER 4 ===', '=== TRAINER 6 ===');
  assert.ok(parsePack(t).errors.some(e => e.message === 'Trainer 4 fehlt, aber Trainer 5 ist vorhanden.'));
  assert.ok(parsePack(makePackText({ questions: 7 })).errors.some(e => e.message === 'Trainer 1 hat nur 7 Fragen. Es braucht mindestens 8.'));
  assert.match(parsePack(makePackText() + '=== TRAINER 9 ===\n').errors[0].message, /Es gibt nur Trainer 1 bis 8\./);
});
test('Hinweise blockieren nicht', () => {
  const r = parsePack(makePackText({ trainers: 3, questions: 9, kennung: null }) + 'ANTWROT: x\n');
  assert.equal(r.ok, true);
  const w = r.warnings.map(w => w.message);
  assert.ok(w.some(m => /Unbekanntes Schlüsselwort ‚ANTWROT‘\./.test(m)));
  assert.ok(w.includes('Trainer 3 hat nur 9 Fragen, empfohlen sind 20.'));
  assert.ok(w.includes('Das Paket enthält nur Trainer 1 bis 3. Die Wege ab Gebiet 4 bleiben im Nebel.'));
  assert.ok(w.includes('Keine KENNUNG angegeben. Jede Änderung an der Datei setzt die Statistik der Kinder zurück.'));
});
test('Prüffokus: falsche Antwort gleich der richtigen oder doppelt wird entfernt', () => {
  const r = parsePack(makePackText() + 'FRAGE: X\nANTWORT: often\nFALSCH: Often | never | never | sometimes | always\n');
  const qq = r.pack.trainers[0].questions.at(-1);
  assert.deepEqual(qq.wrong, ['never', 'sometimes', 'always']);
  assert.equal(r.warnings.filter(w => /gleich der richtigen|doppelt/.test(w.message)).length, 2);
  assert.equal(parsePack(makePackText() + 'FRAGE: X\nANTWORT: a\nFALSCH: A | b | c\n').ok, false);
});
test('Prüffokus: Word-, RTF- und Zip-Dateien werden klar abgelehnt', () => {
  for (const bad of ['{\\rtf1\\ansi PAKET: x', 'PK\u0003\u0004word/document.xml', 'P\u0000A\u0000K\u0000E\u0000T\u0000'])
    assert.deepEqual(parsePack(bad).errors, [{ line: null, message: 'Diese Datei ist keine reine Textdatei. Speichere sie im Texteditor als reinen Text (.txt, UTF-8).' }]);
});
test('zu groß', () => {
  assert.equal(parsePack('x'.repeat(1048577)).errors[0].message, 'Die Datei ist größer als 1 MB.');
});
test('FORM muss zur Frage passen', () => {
  assert.match(parsePack(makePackText() + 'FRAGE: X\nSATZ: I am.\nFORM: auswahl\n').errors[0].message, /FORM: auswahl passt nicht zu SATZ\./);
  assert.match(parsePack(makePackText() + 'FRAGE: X\nANTWORT: a\nFORM: quiz\n').errors[0].message, /FORM kennt nur auswahl, eintippen oder satzbau\./);
});
test('Vorlagen-KENNUNG und doppelte Fragen geben Hinweise', () => {
  assert.ok(parsePack(makePackText({ kennung: 'fach-jahrgang-name' })).warnings.some(w => /noch die aus der Vorlage/.test(w.message)));
  assert.ok(parsePack(makePackText() + 'FRAGE: T1 Frage 1\nANTWORT: z\n').warnings.some(w => /gibt es schon in Zeile \d+\./.test(w.message)));
});

// tests/packId.test.js
test('Kurzform: 4 Zeichen ohne 0 O 1 I L, stabil', () => {
  assert.equal(shortId('englisch6-beispiel'), 'ENQ9');
  assert.equal(shortId('englisch6-unit1-4'), 'GNEP');
  assert.match(shortId('irgendwas'), /^[2-9A-HJKMNP-Z]{4}$/);
});
test('Identität: KENNUNG gewinnt, sonst Inhalt ohne Kommentare und Leerzeilen', () => {
  assert.equal(packIdentity('x', 'abc'), 'abc');
  assert.equal(packIdentity('# k\n\nPAKET: A\n  FACH: B  \n', null), packIdentity('PAKET: A\nFACH: B', null));
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL.

- [ ] **Step 3: Implementieren.** Regeln aus Design 10.2 und 10.3, dazu:
  - Vorprüfung vor allem anderen: Größe in UTF-8-Bytes > `maxBytes` → `tooBig`. Enthält der Text `\u0000`, beginnt er mit `{\rtf` oder mit `PK\u0003\u0004` → `binary`. In beiden Fällen gibt es nur diesen einen Fehler.
  - BOM entfernen, `\r\n` und `\r` zu `\n`. Die Zeilennummern zählen ab 1 im Originaltext.
  - Abschnitt: `/^={2,}\s*(.+?)\s*={2,}$/`, Name normalisiert: `TRAINER n`, `ENDGEGNER`, `ZETTEL`.
  - Schlüsselwort = Text vor dem **ersten** `:`, normalisiert mit `trim`, Großschreibung, Ä→AE, Ö→OE, Ü→UE, ß→SS, `[\s_-]+` → ein Leerzeichen. Bekannt sind: `PAKET KENNUNG FACH ZEITDRUCK NAME THEMA HALLO SIEG NIEDERLAGE REVANCHE FRAGE ANTWORT SATZ AUCH RICHTIG FALSCH EXTRA FORM`.
  - Listen an `|` trennen, trimmen, leere Einträge weglassen.
  - `FALSCH` wird bereinigt: Einträge, die nach `normalizeKey` gleich `ANTWORT` oder `AUCH RICHTIG` sind, fallen weg (`wrongIsRight`), Dubletten ebenso (`wrongDup`). Erst danach wird gezählt.
  - Formen: `FORM` gesetzt → genau diese. `ANTWORT` mit ≥ 3 `FALSCH` → `['choice', 'typing']`. `ANTWORT` ohne `FALSCH` → `['typing']`. `ANTWORT` mit 1–2 `FALSCH` → Fehler `fewWrong`. `SATZ` → `['tiles']`.
  - `key = normalizeKey(text)` = trim, Mehrfach-Leerzeichen zu einem, Kleinbuchstaben.
  - `identity = packIdentity(text, kennung)`; `shortId`: `hash32(identity)`, dann 4 Ziffern zur Basis 31 im Alphabet `23456789ABCDEFGHJKMNPQRSTUVWXYZ`, niedrigste zuerst.

  **Meldungen** (`{z}` = Zeile, `{n}`/`{m}` = Zahl, `{F}` = Feld):

| Art | Fall | Text |
|---|---|---|
| Fehler | `binary` | Diese Datei ist keine reine Textdatei. Speichere sie im Texteditor als reinen Text (.txt, UTF-8). |
| Fehler | `tooBig` | Die Datei ist größer als 1 MB. |
| Fehler | kein Titel / kein Fach | Es fehlt PAKET: mit dem Titel des Pakets. · Es fehlt FACH: mit dem Fach. |
| Fehler | kein Trainer 1 | Trainer 1 fehlt. Jedes Paket braucht mindestens === TRAINER 1 ===. |
| Fehler | Lücke | Trainer {n} fehlt, aber Trainer {m} ist vorhanden. |
| Fehler | Nummer > 8 | Zeile {z}: Es gibt nur Trainer 1 bis 8. |
| Fehler | doppelt | Zeile {z}: Trainer {n} gibt es schon in Zeile {y}. |
| Fehler | unbekannter Abschnitt | Zeile {z}: Unbekannter Abschnitt ‚{Name}‘. |
| Fehler | NAME/THEMA fehlt | Trainer {n} hat keinen NAME:. · Trainer {n} hat kein THEMA:. |
| Fehler | zu wenige Fragen | Trainer {n} hat nur {k} Fragen. Es braucht mindestens 8. |
| Fehler | Frage vor Abschnitt | Zeile {z}: Fragen gehören in einen Abschnitt wie === TRAINER 1 ===. |
| Fehler | Feld ohne FRAGE | Zeile {z}: {F} gehört zu einer Frage, davor fehlt FRAGE:. |
| Fehler | weder noch | Zeile {z}: Bei dieser Frage fehlt ANTWORT oder SATZ. ({z} = Zeile der FRAGE) |
| Fehler | beides | Zeile {z}: Eine Frage hat entweder ANTWORT oder SATZ, nicht beides. |
| Fehler | Feld doppelt | Zeile {z}: Diese Frage hat schon {F}. Weitere richtige Antworten gehören zu AUCH RICHTIG. |
| Fehler | `fewWrong` | Zeile {z}: Für die Auswahl braucht es mindestens 3 falsche Antworten. |
| Fehler | FORM-Wert | Zeile {z}: FORM kennt nur auswahl, eintippen oder satzbau. |
| Fehler | FORM-Konflikt | Zeile {z}: FORM: {wert} passt nicht zu {ANTWORT\|SATZ}. |
| Hinweis | unbekannt | Zeile {z}: Unbekanntes Schlüsselwort ‚{KEY}‘. |
| Hinweis | ohne Doppelpunkt | Zeile {z}: Diese Zeile wird nicht verstanden und übersprungen. |
| Hinweis | < 20 Fragen | Trainer {n} hat nur {k} Fragen, empfohlen sind 20. |
| Hinweis | Teilpaket | Das Paket enthält nur Trainer 1 bis {n}. Die Wege ab Gebiet {n+1} bleiben im Nebel. (bei n = 1: Das Paket enthält nur Trainer 1. Die Wege ab Gebiet 2 bleiben im Nebel.) |
| Hinweis | keine KENNUNG | Keine KENNUNG angegeben. Jede Änderung an der Datei setzt die Statistik der Kinder zurück. |
| Hinweis | Vorlagen-KENNUNG | Die KENNUNG ist noch die aus der Vorlage. Wähle einen eigenen Namen, zum Beispiel englisch6-unit1-4. |
| Hinweis | ZEITDRUCK-Wert | Zeile {z}: ZEITDRUCK kennt nur normal, lang oder aus. Es gilt normal. |
| Hinweis | > 5 HALLO | Trainer {n} hat mehr als 5 HALLO-Zeilen. Nur die ersten 5 werden gezeigt. |
| Hinweis | Zeile doppelt | Zeile {z}: {F} steht hier schon einmal. Es gilt die erste Zeile. (NAME, THEMA, SIEG, NIEDERLAGE, REVANCHE, Kopffelder) |
| Hinweis | `wrongIsRight` | Zeile {z}: Eine falsche Antwort ist gleich der richtigen und wird ignoriert. |
| Hinweis | `wrongDup` | Zeile {z}: Eine falsche Antwort steht doppelt und wird nur einmal benutzt. |
| Hinweis | Frage doppelt | Zeile {z}: Diese Frage gibt es schon in Zeile {y}. (gleicher `key` im selben Abschnitt) |
| Hinweis | Feld passt nicht | Zeile {z}: Im Abschnitt {ENDGEGNER\|ZETTEL} wird {F} nicht benutzt. |

- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Commit** – `git commit -m "Lernpaket-Parser mit verständlichen Meldungen"`

---

### Task 8: Vorlage und Beispielpaket

**Files:**
- Create: `pakete/vorlage.txt`, `pakete/englisch-6-beispiel.txt`
- Test: `tests/pakete.test.js`

**Interfaces:**
- Consumes: `parsePack` (Task 7)
- Produces: die beiden Dateien. Das Beispielpaket wird in Task 9 per `fetch('pakete/englisch-6-beispiel.txt')` geladen.

- [ ] **Step 1: Tests schreiben**

```js
const read = f => readFileSync(new URL(`../pakete/${f}`, import.meta.url), 'utf8');

test('Beispielpaket lädt ohne Fehler, nur mit dem Teilpaket-Hinweis', () => {
  const r = parsePack(read('englisch-6-beispiel.txt'));
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.warnings.map(w => w.message), ['Das Paket enthält nur Trainer 1 bis 2. Die Wege ab Gebiet 3 bleiben im Nebel.']);
  assert.equal(r.pack.kennung, 'englisch6-beispiel');
});
test('je Trainer mindestens 20 Fragen und jede Form mindestens 5-mal', () => {
  for (const t of parsePack(read('englisch-6-beispiel.txt')).pack.trainers) {
    assert.ok(t.questions.length >= 20, t.topic);
    for (const f of ['choice', 'typing', 'tiles']) assert.ok(t.questions.filter(q => q.forms.includes(f)).length >= 5, `${t.number} ${f}`);
    for (const q of t.questions.filter(q => q.sentence)) for (const x of q.extra) assert.ok(!q.sentence.split(' ').includes(x), q.text);
  }
});
test('mindestens 10 Zettel und ein ENDGEGNER-Abschnitt', () => {
  const p = parsePack(read('englisch-6-beispiel.txt')).pack;
  assert.ok(p.notes.length >= 10); assert.ok(p.boss.hello.length >= 1);
});
test('Vorlage erklärt jedes Schlüsselwort und beschreibt alle 8 Trainerfiguren', () => {
  const v = read('vorlage.txt');
  for (const k of ['PAKET:', 'KENNUNG:', 'FACH:', 'ZEITDRUCK:', 'NAME:', 'THEMA:', 'HALLO:', 'SIEG:', 'NIEDERLAGE:', 'REVANCHE:', 'FRAGE:', 'ANTWORT:', 'AUCH RICHTIG:', 'FALSCH:', 'EXTRA:', 'FORM:', 'SATZ:', '=== ENDGEGNER ===', '=== ZETTEL ==='])
    assert.ok(v.includes(k), k);
  for (const fig of ['Fischerin', 'Waldläufer', 'Pilzsammlerin', 'Karawanenführer', 'Drachenfliegerin', 'Erfinder', 'Eisfischerin', 'Sternendeuterin']) assert.ok(v.includes(fig), fig);
  assert.ok(v.includes('KENNUNG: fach-jahrgang-name'));
  assert.ok(!parsePack(v).warnings.some(w => /Unbekanntes Schlüsselwort/.test(w.message)));
});
```

- [ ] **Step 2: `node --test tests/pakete.test.js`.** Erwartet: FAIL.
- [ ] **Step 3: Dateien schreiben**
  - Beispielpaket: Trainer 1 Bucht „Simple present und Häufigkeitsadverbien“, Trainer 2 Wald „Present progressive oder simple present“ (Design 10.5). Trainernamen passen zur Figur (junge Fischerin, Waldläufer). Dialoge in einfachem Englisch (A2), an kein Lehrbuch gebunden. Je Trainer mindestens 22 Fragen gemischt, darunter einige mit `AUCH RICHTIG` (zum Beispiel Kurzformen). Dazu 10 Zettelfragen und ein `ENDGEGNER`-Abschnitt mit `HALLO`, `SIEG` und `NIEDERLAGE`.
  - Vorlage: Jedes Schlüsselwort wird in `#`-Kommentaren erklärt. Das Aussehen aller 8 Trainerfiguren steht als Kommentar über ihrem Abschnitt (Design 5.3). `KENNUNG: fach-jahrgang-name` steht vorausgefüllt da, mit dem Hinweis, einen eigenen Namen zu wählen und ihn danach nie mehr zu ändern. Der Hinweis zu `KENNUNG` aus Design 10.2 ist deutlich. Pro Trainer gibt es eine auskommentierte Beispielfrage je Form.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Commit** – `git commit -m "Vorlage und Beispielpaket Englisch 6 mit zwei Themen"`

---

### Task 9: Paketspeicher, Titel, Lernpaket laden

**Files:**
- Create: `js/pack/store.js`, `js/scenes/title.js`, `js/scenes/pack.js`
- Modify: `js/main.js`, `css/spiel.css`
- Test: `tests/store.test.js`

**Interfaces:**
- Consumes: `parsePack` (Task 7), `BUILDINGS.lighthouse` (Task 5), `el` (Task 6)
- Produces:
  - `createPackStore(storage = globalThis.localStorage) → { load(): string | null, save(text): boolean, clear(): void }`, Schlüssel `lumara.paket.v1`
  - `createTitleScene(game, next: () => void) → Scene`
  - `createPackScene(game, next: () => void) → Scene` setzt `game.pack = { text, data }`

- [ ] **Step 1: Tests schreiben**

```js
const fake = () => { const m = new Map(); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) }; };

test('speichert, lädt und löscht den Paket-Text', () => {
  const s = createPackStore(fake());
  assert.equal(s.load(), null); assert.equal(s.save('PAKET: A'), true);
  assert.equal(s.load(), 'PAKET: A'); s.clear(); assert.equal(s.load(), null);
});
test('kaputter oder fehlender Speicher bricht nichts', () => {
  const bad = { getItem() { throw new Error('SecurityError'); }, setItem() { throw new Error('QuotaExceededError'); }, removeItem() { throw new Error('x'); } };
  const s = createPackStore(bad);
  assert.equal(s.load(), null); assert.equal(s.save('x'), false); s.clear();
  assert.equal(createPackStore(undefined).load(), null);
});
```

- [ ] **Step 2: `node --test tests/store.test.js`.** Erwartet: FAIL.
- [ ] **Step 3: `createPackStore` implementieren.** Jeder Zugriff steht in `try/catch`.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Titel und Lade-Bildschirm bauen**
  - Titel: Nachthimmel, Meer mit Wellenlinien, der Leuchtturm aus `BUILDINGS.lighthouse` auf einer Klippe, Nebelschwaden und ein langsam kreisender, halbtransparenter Lichtstrahl (bei reduzierter Bewegung steht er still). Der Schriftzug „Lumara“ und darunter „Das Land unter dem Nebel“ ist HTML in `game.ui`. „Tippe, um zu beginnen“ pulsiert langsam (Periode ≥ 1,5 s). A, Tippen oder Klick → `next()`.
  - Paket-Bildschirm (`game.mode = 'screen'`):
    - Liefert der Speicher ein gültiges Paket: „Lernpaket: {Titel} ({Fach})“, großer Knopf „Los geht’s“, darunter klein „Anderes Lernpaket laden“.
    - Sonst: großer Knopf „Lernpaket laden“ (ein `<label>` um `<input type="file" accept=".txt,text/plain" hidden>`), darunter klein der Link „Ohne eigenes Paket ausprobieren“, der das Beispielpaket per `fetch` lädt.
    - Datei: `file.size > CONFIG.pack.maxBytes` → Meldung, ohne die Datei zu lesen. Sonst `await file.text()` → `parsePack`.
    - Bei Fehlern: „Diese Datei ist kein gültiges Lernpaket. Frag deine Lehrkraft.“ und darunter `<details><summary>Details für die Lehrkraft</summary>` mit allen Fehlern. Hinweise sieht das Kind nicht.
    - Bei Erfolg `store.save(text)`. Liefert das `false`: Hinweis „Das Paket konnte auf diesem Gerät nicht gespeichert werden. Beim nächsten Start musst du es neu laden.“ und trotzdem weiter.
  - `main.js`: Titel → Paket → vorerst Weltszene.
- [ ] **Step 6: Im Browser prüfen.** Mit leerem localStorage laden: „Ohne eigenes Paket ausprobieren“ führt in die Bucht. Neu laden: Der Bildschirm nennt das gespeicherte Paket. Eine Datei mit `FRAGE: x` und ohne Kopf zeigt die Kinder-Meldung, und die Details listen die Fehler mit Zeilen. Eine umbenannte `.rtf` zeigt die Textdatei-Meldung.
- [ ] **Step 7: Commit** – `git commit -m "Titelbildschirm, Lernpaket laden und auf dem Gerät speichern"`

---

### Task 10: Antwortprüfung

**Files:**
- Create: `js/duel/answers.js`
- Test: `tests/answers.test.js`

**Interfaces:**
- Consumes: `Question`, `q()` aus den Fixtures, `createRng`
- Produces:
  - `normalizeTyped(s) → string`
  - `checkTyped(input, accepted: string[], knownWrong: string[] = []) → { correct: boolean, almost: boolean }`
  - `oneEditApart(a, b) → boolean` (Einfügen, Löschen, Ersetzen oder Vertauschen zweier Nachbarn)
  - `sentenceTokens(s) → string[]`, `checkTiles(placed: string[], sentences: string[]) → boolean`
  - `buildChoices(q, rng) → { options: string[4], correctIndex }`, `buildTiles(q, rng) → string[]`
  - `Presented = { question, form, choices?, tiles? }`, `jokerHint(presented, rng) → { removeIndices: [i, j] } | { firstLetter } | { firstTile }`
  - `acceptedAnswers(q) → string[]` (answer bzw. sentence plus alsoCorrect), `correctText(q) → string`

- [ ] **Step 1: Tests schreiben**

```js
test('Eintippen: Leerzeichen, Großschreibung, Satzzeichen am Ende', () => {
  assert.equal(normalizeTyped('  She   PLAYS tennis!! '), 'she plays tennis');
  assert.equal(checkTyped(' Plays.', ['plays']).correct, true);
});
test('Prüffokus: iPad-Apostrophe und geschützte Leerzeichen', () => {
  assert.equal(checkTyped('don’t', ["don't"]).correct, true);
  assert.equal(checkTyped('don`t', ["don't"]).correct, true);
  assert.equal(checkTyped(' ice cream ', ['ice cream']).correct, true);
});
test('Zahlen: Komma und Punkt sind gleich', () => {
  assert.equal(checkTyped('3,5', ['3.5']).correct, true);
  assert.equal(checkTyped('3.5', ['3,5']).correct, true);
  assert.equal(checkTyped('35', ['3,5']).correct, false);
});
test('Rechtschreibung zählt, AUCH RICHTIG zählt', () => {
  assert.equal(checkTyped('colour', ['color', 'colour']).correct, true);
  assert.equal(checkTyped('colr', ['color']).correct, false);
});
test('Fast richtig bei einem Buchstaben oder einer Vertauschung', () => {
  assert.deepEqual(checkTyped('butterfy', ['butterfly']), { correct: false, almost: true });
  assert.deepEqual(checkTyped('buttrefly', ['butterfly']), { correct: false, almost: true });
  assert.deepEqual(checkTyped('butter', ['butterfly']), { correct: false, almost: false });
});
test('kein „Fast“ bei bekannter falscher Antwort oder Antworten unter 4 Zeichen', () => {
  assert.equal(checkTyped('play', ['plays'], ['play', 'playing', 'played']).almost, false);
  assert.equal(checkTyped('in', ['is']).almost, false);
});
test('Satzbau: Satzzeichen hängen am Wort davor, Prüfung genau', () => {
  assert.deepEqual(sentenceTokens('He never walks to school.'), ['He', 'never', 'walks', 'to', 'school.']);
  assert.equal(checkTiles(['He', 'never', 'walks', 'to', 'school.'], ['He never walks to school.']), true);
  assert.equal(checkTiles(['he', 'never', 'walks', 'to', 'school.'], ['He never walks to school.']), false);
  assert.equal(checkTiles(['The', 'dog', 'sees', 'the', 'cat.'], ['The cat sees the dog.', 'The dog sees the cat.']), true);
});
test('buildTiles: Satz und EXTRA gemischt, nie schon richtig geordnet', () => {
  const qq = q({ answer: null, sentence: 'I am here.', extra: ['is'], forms: ['tiles'] });
  for (let s = 0; s < 30; s++) {
    const t = buildTiles(qq, createRng(s));
    assert.deepEqual([...t].sort(), ['I', 'am', 'here.', 'is'].sort());
    assert.notEqual(t.filter(x => x !== 'is').join(' '), 'I am here.');
  }
});
test('Prüffokus: Auswahl hat immer vier verschiedene Knöpfe, genau einer richtig', () => {
  for (let s = 0; s < 50; s++) {
    const { options, correctIndex } = buildChoices(q({ wrong: ['a', 'b', 'c', 'd', 'e'] }), createRng(s));
    assert.equal(options.length, 4); assert.equal(new Set(options).size, 4);
    assert.equal(options[correctIndex], 'plays');
  }
});
test('Joker je Form', () => {
  const qq = q(), rng = createRng(1), choices = buildChoices(qq, rng);
  const h = jokerHint({ question: qq, form: 'choice', choices }, rng);
  assert.equal(h.removeIndices.length, 2); assert.ok(!h.removeIndices.includes(choices.correctIndex));
  assert.deepEqual(jokerHint({ question: qq, form: 'typing' }, rng), { firstLetter: 'p' });
  const s = q({ answer: null, sentence: 'He is.', forms: ['tiles'] });
  assert.deepEqual(jokerHint({ question: s, form: 'tiles', tiles: ['is.', 'He'] }, rng), { firstTile: 'He' });
});
```

- [ ] **Step 2: `node --test tests/answers.test.js`.** Erwartet: FAIL.
- [ ] **Step 3: Implementieren.** `normalizeTyped`: `normalize('NFC')`, alle Unicode-Leerzeichen (`\s` und `   `) zu ` `, trim, Mehrfach-Leerzeichen zu einem, Kleinbuchstaben, `’ ‘ ‛ ` ´` → `'`, `“ ” „` → `"`, am Ende `[.!?]+` entfernen und erneut trimmen. Zahlenregel, wenn die akzeptierte Antwort `/^-?\d+([.,]\d+)?$/` erfüllt: beide Seiten `,` → `.`. „Fast“ nur, wenn nicht richtig, die Eingabe nicht leer ist, keine `knownWrong` nach Normalisierung trifft und `oneEditApart` mit einer akzeptierten Antwort von mindestens 4 Zeichen gilt (Claude). `buildTiles` mischt bis zu 10-mal neu, solange die Satz-Kärtchen in richtiger Reihenfolge liegen. Liegen sie danach immer noch richtig, werden die ersten zwei verschiedenen Satz-Kärtchen getauscht (bei nur einem Kärtchen oder lauter gleichen egal).
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Commit** – `git commit -m "Antwortprüfung für alle drei Antwortformen"`

---

### Task 11: Fragen ziehen

**Files:**
- Create: `js/duel/questions.js`
- Test: `tests/questions.test.js`

**Interfaces:**
- Consumes: `Pack`, `Question`, `CONFIG.questionWeights`, `createRng`
- Produces:
  - `HistoryEntry = { n: number /*gestellt*/, s: number /*richtig in Folge*/, w: boolean /*zuletzt falsch*/ }`, `History = Record<questionKey, HistoryEntry>`
  - `questionWeight(entry?: HistoryEntry) → number`, `recordAnswer(history, key, correct) → void` (verändert `history`)
  - `pickForm(forms: Form[], recent: Form[], rng) → Form`
  - `createDeck(questions: Question[], history: History, rng) → { draw(): Question }`
  - `poolFor(pack, { kind: 'trainer' | 'wild' | 'note' | 'boss', trainerNumber?, beaten: number[] }) → Question[]`

- [ ] **Step 1: Tests schreiben**

```js
test('Gewichte: nie gestellt 2, zuletzt falsch 3, normal 1, zweimal richtig 0,5', () => {
  assert.equal(questionWeight(undefined), 2);
  assert.equal(questionWeight({ n: 3, s: 0, w: true }), 3);
  assert.equal(questionWeight({ n: 3, s: 1, w: false }), 1);
  assert.equal(questionWeight({ n: 3, s: 2, w: false }), 0.5);
});
test('recordAnswer führt Anzahl, Serie und „zuletzt falsch“', () => {
  const h = {}; recordAnswer(h, 'k', true); recordAnswer(h, 'k', true);
  assert.deepEqual(h.k, { n: 2, s: 2, w: false });
  recordAnswer(h, 'k', false); assert.deepEqual(h.k, { n: 3, s: 0, w: true });
});
test('Deck wiederholt keine Frage, bis alle dran waren', () => {
  const qs = Array.from({ length: 6 }, (_, i) => q({ text: `F${i}` })), d = createDeck(qs, {}, createRng(4));
  assert.equal(new Set(Array.from({ length: 6 }, () => d.draw().key)).size, 6);
});
test('zuletzt falsch beantwortete Fragen kommen deutlich öfter zuerst', () => {
  const qs = [q({ text: 'A' }), q({ text: 'B' })], h = { a: { n: 1, s: 0, w: true }, b: { n: 1, s: 1, w: false } };
  let a = 0; for (let s = 0; s < 3000; s++) if (createDeck(qs, h, createRng(s)).draw().key === 'a') a++;
  assert.ok(a > 2050 && a < 2450);
});
test('dieselbe Form nie dreimal hintereinander, wenn es eine Alternative gibt', () => {
  const r = createRng(8), recent = [];
  for (let i = 0; i < 1000; i++) {
    const f = pickForm(['choice', 'typing'], recent, r); recent.push(f);
    if (recent.length >= 3) assert.ok(!(recent.at(-1) === recent.at(-2) && recent.at(-2) === recent.at(-3)));
  }
  assert.equal(pickForm(['tiles'], ['tiles', 'tiles'], r), 'tiles');
});
test('Pool für wilde Wesen: besiegte Themen plus das nächste, vorher nur Thema 1', () => {
  const pack = parsePack(makePackText({ trainers: 3 })).pack, topics = p => new Set(p.map(x => x.text.split(' ')[0]));
  assert.deepEqual(topics(poolFor(pack, { kind: 'wild', beaten: [] })), new Set(['T1']));
  assert.deepEqual(topics(poolFor(pack, { kind: 'wild', beaten: [1] })), new Set(['T1', 'T2']));
  assert.deepEqual(topics(poolFor(pack, { kind: 'wild', beaten: [1, 2, 3] })), new Set(['T1', 'T2', 'T3']));
  assert.deepEqual(topics(poolFor(pack, { kind: 'trainer', trainerNumber: 2, beaten: [] })), new Set(['T2']));
  assert.equal(poolFor(pack, { kind: 'note', beaten: [] }).length, 8);
});
```

(`makePackText` schreibt Fragetexte als `T{t} Frage {i}`.)

- [ ] **Step 2: `node --test tests/questions.test.js`.** Erwartet: FAIL.
- [ ] **Step 3: Implementieren.** Reihenfolge der Gewichtsregeln: `n === 0` → 2, `w` → 3, `s >= 2` → 0,5, sonst 1 (Werte aus `CONFIG.questionWeights`). Das Deck zieht gewichtet ohne Zurücklegen. Ist es leer, füllt es sich neu, und die zuletzt gezogene Frage kommt nicht direkt wieder (bei mehr als einer Frage). Gewichte werden beim Ziehen frisch aus `history` gelesen. `pickForm` schließt X aus, wenn die letzten zwei Einträge von `recent` beide X sind und es eine andere erlaubte Form gibt. `note`: `pack.notes`, wenn nicht leer, sonst wie `wild`.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Commit** – `git commit -m "Fragen gewichtet ziehen, Fehler kommen wieder"`

---

### Task 12: Wesen-Daten und Fortschritt

**Files:**
- Create: `js/data/species.js`, `js/duel/progress.js`
- Test: `tests/progress.test.js`, `tests/species.test.js`

**Interfaces:**
- Consumes: `CONFIG.creature`, `CONFIG.xp`
- Produces:
  - `STARTERS = ['funki', 'kiesel', 'nixi', 'flausch', 'pieks']`
  - `SPECIES: Record<id, { id, names: string[] /*Name je Stufe*/, kind: 'starter' | 'wild', description: string, special?: { name, text }, area?: number, rarity?: 'common' | 'rare' }>`
  - `AREA_WILD = { 1: { common: ['gischtling', 'haeuschel'], rare: 'glimmqualle' } }`
  - `TRAINER_CREATURES = { 1: { species: 'haeuschel', stage: 2 } }`
  - `displayName(creature: { species, nickname?, level }) → string` (Spitzname oder Name der aktuellen Stufe)
  - `xpToNext(level) → number` (0 ab `maxLevel`), `stageForLevel(level) → 1..4`, `maxEnergy({ species, level, lifeStones }) → number`
  - `addXp({ level, xpInLevel }, amount) → { level, xpInLevel, levelsGained, stageBefore, stageAfter }`
  - `xpForWin({ kind: 'wild' | 'trainer', area?, trainerNumber?, flawless }) → number`

- [ ] **Step 1: Tests schreiben**

```js
const total = L => { let s = 0; for (let l = 1; l < L; l++) s += xpToNext(l); return s; };

test('XP-Kurve wie im Design: 665, 3315, 9440, 25740', () => {
  assert.equal(xpToNext(1), 15);
  assert.deepEqual([total(15), total(35), total(60), total(100)], [665, 3315, 9440, 25740]);
  assert.equal(xpToNext(100), 0);
});
test('Stufen ab Level 15, 35, 60', () => {
  assert.deepEqual([1, 14, 15, 34, 35, 59, 60, 100].map(stageForLevel), [1, 1, 2, 2, 3, 3, 4, 4]);
});
test('Energie 4 + Stufe + Lebenssteine (höchstens 3) + Kiesel', () => {
  assert.equal(maxEnergy({ species: 'funki', level: 1, lifeStones: 0 }), 4);
  assert.equal(maxEnergy({ species: 'kiesel', level: 1, lifeStones: 0 }), 5);
  assert.equal(maxEnergy({ species: 'kiesel', level: 60, lifeStones: 5 }), 11);
});
test('addXp über mehrere Level, Deckel bei 100', () => {
  assert.deepEqual(addXp({ level: 1, xpInLevel: 0 }, 60), { level: 4, xpInLevel: 0, levelsGained: 3, stageBefore: 1, stageAfter: 1 });
  assert.equal(addXp({ level: 14, xpInLevel: 70 }, 10).stageAfter, 2);
  assert.deepEqual(addXp({ level: 100, xpInLevel: 0 }, 999), { level: 100, xpInLevel: 0, levelsGained: 0, stageBefore: 4, stageAfter: 4 });
});
test('XP für Siege', () => {
  assert.equal(xpForWin({ kind: 'trainer', trainerNumber: 1, flawless: false }), 60);
  assert.equal(xpForWin({ kind: 'trainer', trainerNumber: 8, flawless: false }), 200);
  assert.equal(xpForWin({ kind: 'wild', area: 1, flawless: false }), 10);
  assert.equal(xpForWin({ kind: 'wild', area: 1, flawless: true }), 13);
});

// tests/species.test.js
test('fünf Startwesen mit je 4 Stufennamen und Besonderheit', () => {
  assert.deepEqual(SPECIES.funki.names, ['Funki', 'Funkelflug', 'Laternenfalter', 'Nordlichtfalter']);
  for (const id of STARTERS) { assert.equal(SPECIES[id].names.length, 4); assert.ok(SPECIES[id].special.name); }
});
test('Tabellen verweisen nur auf vorhandene Arten', () => {
  for (const t of Object.values(AREA_WILD)) for (const id of [...t.common, t.rare]) assert.ok(SPECIES[id], id);
  for (const t of Object.values(TRAINER_CREATURES)) assert.ok(SPECIES[t.species].names[t.stage - 1]);
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Implementieren.** Die Stufennamen der Startwesen und ihre Besonderheiten stehen wörtlich in Design 6.1. Die Besonderheiten werden in kindgerechten Sätzen für die Eiwahl beschrieben. Wilde Arten in Gebiet 1 (Claude): **Gischtling** (häufig, kleiner Wellengeist aus Meeresschaum mit Schaumkrone), **Häuschel** → Stufe 2 **Muschelturm** (häufig, Einsiedlerkrebs in einem Schneckenhaus, das bei Stufe 2 wie ein kleiner Leuchtturm aussieht; Wesen der Trainerin), **Glimmqualle** (selten, schwebende Qualle mit Leuchtpunkten). Makellos: `Math.round(basis × (1 + flawlessBonus))`.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Commit** – `git commit -m "Wesen-Daten, XP-Kurve, Stufen und Energie"`

---

### Task 13: Duell-Regeln

**Files:**
- Create: `js/duel/duel.js`
- Test: `tests/duel.test.js`

**Interfaces:**
- Consumes: `buildChoices`, `buildTiles`, `checkTyped`, `checkTiles`, `jokerHint`, `acceptedAnswers`, `correctText` (Task 10), `pickForm` (Task 11), `CONFIG.duel`
- Produces:

```js
createDuel({ kind: 'wild' | 'trainer',
             player: { species, stage, energy, maxEnergy },
             foe: { maxEnergy },
             deck: { draw(): Question }, rng }) → Duel

Duel = {
  state: 'ready' | 'question' | 'feedback' | 'won' | 'lost' | 'fled',
  playerEnergy, foeEnergy, streak,
  current: Presented | null,
  ask(): Presented,                 // nur in 'ready', sonst Error
  canJoker(): boolean, useJoker(): Hint,     // Funki, einmal pro Duell
  canSwap(): boolean,  swap(): Presented,    // Flausch, einmal pro Duell, ohne Nachteil
  answer(response: { index } | { text } | { tokens: string[] }): AnswerResult | null,  // null außerhalb von 'question'
  next(): void,                     // 'feedback' → 'ready'
  flee(): boolean,                  // nur wild, sonst false
  surrender(): void,                // nur Trainer → 'lost'
  summary(): { outcome: 'won' | 'lost' | 'fled', playerEnergy, flawless, answers: { key, correct }[] },
}
AnswerResult = { correct, almost, crit, foeDamage, playerDamage, healed, shielded, secondChance, correctText, state }
```

- [ ] **Step 1: Tests schreiben**

```js
const deckOf = qs => { let i = 0; return { draw: () => qs[i++ % qs.length] }; };
const mk = (p = {}, f = {}, kind = 'wild') => createDuel({ kind, rng: createRng(1),
  player: { species: 'kiesel', stage: 1, energy: 4, maxEnergy: 4, ...p }, foe: { maxEnergy: 5, ...f },
  deck: deckOf(['A', 'B', 'C', 'D'].map(t => q({ text: t, forms: ['typing'] }))) });
const reply = (d, ok) => d.answer({ text: ok ? d.current.question.answer : 'xxxx' });
const play = (d, ok) => { d.ask(); const r = reply(d, ok); if (d.state === 'feedback') d.next(); return r; };

test('richtig kostet den Gegner 1, jede dritte richtige in Folge 2', () => {
  const d = mk(), rs = [play(d, true), play(d, true), play(d, true)];
  assert.deepEqual(rs.map(r => r.foeDamage), [1, 1, 2]); assert.deepEqual(rs.map(r => r.crit), [false, false, true]);
  assert.equal(d.foeEnergy, 1);
});
test('falsch kostet das eigene Wesen 1 und setzt die Serie zurück', () => {
  const d = mk(); play(d, true); play(d, true); play(d, false);
  assert.equal(play(d, true).crit, false); assert.equal(d.playerEnergy, 3);
});
test('ab Stufe 3 Volltreffer schon nach 2', () => {
  const d = mk({ stage: 3 }); assert.deepEqual([play(d, true), play(d, true)].map(r => r.foeDamage), [1, 2]);
});
test('Sieg und Niederlage bei 0 Energie', () => {
  const w = mk({}, { maxEnergy: 3 }); play(w, true); play(w, true); play(w, true);
  assert.equal(w.state, 'won'); assert.equal(w.foeEnergy, 0);
  const l = mk({ energy: 1 }); play(l, false); assert.equal(l.state, 'lost');
});
test('Prüffokus: zweite Antwort auf dieselbe Frage wird ignoriert', () => {
  const d = mk(); d.ask(); reply(d, true);
  assert.equal(reply(d, true), null); assert.equal(d.foeEnergy, 4);
});
test('Flucht nur bei wilden Wesen, Aufgeben nur bei Trainern', () => {
  const w = mk(); assert.equal(w.flee(), true); assert.equal(w.state, 'fled');
  const t = mk({}, {}, 'trainer'); assert.equal(t.flee(), false); t.surrender(); assert.equal(t.state, 'lost');
});
test('Nixi: +1 Energie bei 3, 6, 9 richtigen in Folge, höchstens bis zum Maximum', () => {
  const d = mk({ species: 'nixi', energy: 2 }, { maxEnergy: 20 });
  assert.deepEqual([1, 2, 3].map(() => play(d, true).healed), [0, 0, 1]); assert.equal(d.playerEnergy, 3);
  const full = mk({ species: 'nixi' }, { maxEnergy: 20 }); [1, 2].forEach(() => play(full, true));
  assert.equal(play(full, true).healed, 0);
});
test('Zweite Chance ab Stufe 2: einmal, ohne Energieverlust, dieselbe Frage', () => {
  const d = mk({ stage: 2 }); d.ask(); const key = d.current.question.key, r = reply(d, false);
  assert.equal(r.secondChance, true); assert.equal(r.playerDamage, 0);
  assert.equal(d.state, 'question'); assert.equal(d.current.question.key, key);
  assert.equal(reply(d, true).foeDamage, 1); d.next();
  assert.equal(play(d, false).playerDamage, 1);
});
test('Schild ab Stufe 4: erste falsche Antwort kostet nichts, danach Zweite Chance', () => {
  const d = mk({ stage: 4, energy: 7, maxEnergy: 7 });
  const r1 = play(d, false); assert.equal(r1.shielded, true); assert.equal(r1.playerDamage, 0);
  d.ask(); assert.equal(reply(d, false).secondChance, true); reply(d, true); d.next();
  assert.equal(play(d, false).playerDamage, 1);
});
test('Funki: Joker einmal pro Duell, andere Wesen nicht', () => {
  const f = mk({ species: 'funki' }); f.ask();
  assert.equal(f.canJoker(), true); assert.ok(f.useJoker().firstLetter); assert.equal(f.canJoker(), false);
  const k = mk(); k.ask(); assert.equal(k.canJoker(), false);
});
test('Flausch: Frage einmal tauschen, ohne Nachteil', () => {
  const d = mk({ species: 'flausch' }); d.ask(); const before = d.current.question.key;
  assert.notEqual(d.swap().question.key, before);
  assert.equal(d.playerEnergy, 4); assert.equal(d.streak, 0); assert.equal(d.canSwap(), false);
});
test('Makellos nur ohne jede falsche Antwort, summary listet jeden Versuch', () => {
  const d = mk({ stage: 2 }, { maxEnergy: 1 }); d.ask(); reply(d, false); reply(d, true);
  assert.deepEqual(d.summary(), { outcome: 'won', playerEnergy: 4, flawless: false, answers: [{ key: 'a', correct: false }, { key: 'a', correct: true }] });
});
```

- [ ] **Step 2: `node --test tests/duel.test.js`.** Erwartet: FAIL.
- [ ] **Step 3: Implementieren.** `ask()` zieht eine Frage, wählt die Form mit `pickForm` (die Duell-Historie der Formen liegt im Duell) und baut `choices` oder `tiles`. Richtig: `streak++`, Volltreffer, wenn `streak % (stage >= 3 ? 2 : 3) === 0`. Nixi: +1, wenn `streak % 3 === 0` und Energie unter dem Maximum. Falsch: `streak = 0`, dann der Reihe nach: Schild (Stufe 4, erste falsche Antwort im Duell) → keine Energie, `'feedback'`; sonst Zweite Chance (Stufe ≥ 2, noch frei) → keine Energie, bleibt in `'question'`; sonst −1 Energie. Energien fallen nicht unter 0. `'won'` oder `'lost'` werden sofort gesetzt. `flawless` = kein einziger falscher Versuch. Auswertung: `choice` über `correctIndex`, `typing` über `checkTyped(text, acceptedAnswers(q), q.wrong)`, `tiles` über `checkTiles(tokens, acceptedAnswers(q))`.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Commit** – `git commit -m "Duellregeln mit Volltreffer, Fähigkeiten und Besonderheiten"`

---

### Task 14: Wesen-Sprites

**Files:**
- Create: `js/gfx/art/creatures.js`, `js/scenes/gallery.js`
- Modify: `js/main.js` (`?galerie`)
- Test: `tests/creatures.test.js`

**Interfaces:**
- Consumes: `SPECIES`, `STARTERS`, `AREA_WILD`, `TRAINER_CREATURES` (Task 12), `parseSprite` (Task 2)
- Produces: `CREATURE_ART: Record<speciesId, Partial<Record<1|2|3|4, string[]>>>`, `STAGE_SIZE = { 1: 32, 2: 40, 3: 48, 4: 64 }`, `creatureRows(speciesId, stage) → string[]` (nimmt die höchste vorhandene Stufe ≤ der gewünschten)

- [ ] **Step 1: Test schreiben**

```js
test('jedes Startwesen und jede wilde Art von Gebiet 1 hat Stufe 1, das Trainerwesen seine Stufe', () => {
  for (const id of [...STARTERS, ...AREA_WILD[1].common, AREA_WILD[1].rare]) assert.ok(CREATURE_ART[id]?.[1], id);
  const t = TRAINER_CREATURES[1]; assert.ok(CREATURE_ART[t.species][t.stage]);
});
test('Größe passt zur Stufe, Bild ist ausgefüllt und bunt genug', () => {
  for (const [id, stages] of Object.entries(CREATURE_ART)) for (const [st, r] of Object.entries(stages)) {
    const s = parseSprite(`${id}.${st}`, r), n = STAGE_SIZE[st];
    assert.equal(s.w, n); assert.equal(s.h, n);
    const filled = s.data.filter(c => c !== 0).length / s.data.length;
    assert.ok(filled > 0.2 && filled < 0.85, `${id}.${st}: ${filled}`);
    assert.ok(new Set(s.data).size >= 5, `${id}.${st} Farben`);
  }
});
test('creatureRows fällt auf die höchste vorhandene Stufe zurück', () => {
  assert.equal(creatureRows('funki', 3), CREATURE_ART.funki[1]);
});
```

- [ ] **Step 2: `node --test tests/creatures.test.js`.** Erwartet: FAIL.
- [ ] **Step 3: Sprites zeichnen.** Alle Wesen schauen nach rechts (der Gegner wird gespiegelt). Stil: weiche, runde Formen, eine dunkle Umrisslinie (ink oder night), 2 bis 3 Abstufungen je Farbton, große freundliche Augen mit Lichtpunkt. Die Silhouetten sollen klar unterscheidbar sein und an kein bekanntes Spielwesen erinnern. Aussehen laut Design 6.1 und Task 12. Eine Bewegung beim Stehen und beim Angriff entsteht später im Code (Wippen, Vorstoßen), deshalb gibt es nur ein Bild pro Stufe (Claude).
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Galerie.** `?galerie` (nur localhost) zeigt alle Wesen in Originalgröße auf dem Hintergrund der Bucht-Arena, dazu den Namen klein darunter.
- [ ] **Step 6: Im Browser prüfen.** `http://localhost:8000/?galerie`: Alle Wesen sind gut lesbar, eigenständig, ohne Pixelfehler an den Rändern.
- [ ] **Step 7: Commit** – `git commit -m "Wesen-Sprites für Startwesen und Gebiet 1"`

---

### Task 15: Spielstart – Intro, Name, Eiwahl

**Files:**
- Create: `js/state.js`, `js/scenes/intro.js`, `js/scenes/name.js`, `js/scenes/eggs.js`, `js/gfx/art/eggs.js`
- Modify: `js/main.js` (Ablauf und `?dev`), `js/scenes/world.js` (Startposition aus `game.state`)
- Test: `tests/state.test.js`

**Interfaces:**
- Consumes: `maxEnergy` (Task 12), `BUCHT.spawn` (Task 5), `say`, `choose` (Task 6), `CREATURE_ART` (Task 14)
- Produces:
  - `GameState = { version: 1, name, creature: { species, nickname: string | null, level, xpInLevel, energy, lifeStones }, position: { map, x, y, dir }, packs: Record<shortId, { beaten: number[], history: History }> }`
  - `newGameState({ name, species, nickname }) → GameState`
  - `validateName(raw: string) → { ok: true, value } | { ok: false, message }`
  - `packProgress(state, shortId) → { beaten, history }` (legt bei Bedarf an)
  - `EGG_ROWS: string[]` (16 × 20), `EGG_TINTS: Record<starterId, Record<char, char>>` (Zeichentausch pro Startwesen)

- [ ] **Step 1: Tests schreiben**

```js
test('neues Spiel: Level 1, volle Energie, Start am Steg', () => {
  const s = newGameState({ name: 'Mia', species: 'kiesel', nickname: null });
  assert.equal(s.version, 1); assert.equal(s.creature.level, 1); assert.equal(s.creature.xpInLevel, 0);
  assert.equal(s.creature.energy, 5); assert.deepEqual(s.position, { map: 'bucht', ...BUCHT.spawn });
});
test('Namen: nach dem Kürzen 1 bis 12 Zeichen', () => {
  assert.deepEqual(validateName('  Mia '), { ok: true, value: 'Mia' });
  assert.deepEqual(validateName('   '), { ok: false, message: 'Bitte gib einen Namen ein.' });
  assert.deepEqual(validateName('Maximilian-Jo'), { ok: false, message: 'Höchstens 12 Zeichen.' });
  assert.equal(validateName('Zoë🦊').ok, true);
});
test('Fortschritt wird pro Paket angelegt und wiedergefunden', () => {
  const s = newGameState({ name: 'A', species: 'funki', nickname: null });
  packProgress(s, 'ENQ9').beaten.push(1);
  assert.deepEqual(packProgress(s, 'ENQ9').beaten, [1]); assert.deepEqual(packProgress(s, 'GNEP').beaten, []);
});
```

- [ ] **Step 2: `node --test tests/state.test.js`.** Erwartet: FAIL.
- [ ] **Step 3: `state.js` implementieren.** Zeichen werden mit `[...s].length` gezählt.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Szenen bauen** (Design 4)
  - Intro: Die Bucht wird gezeichnet, das Boot gleitet an den Steg (bei reduzierter Bewegung ist es sofort da). Ilvy spricht 4 Textfenster über die Insel, die erloschenen Leuchtsteine und den Nebel des Vergessens, ohne Morrow zu verraten. Ein Knopf „Überspringen“ (≥ 48 px, oben rechts) oder B springt zum Namen.
  - Name: „Wie heißt du?“, `<input maxlength="12" autocomplete="off" autocorrect="off" autocapitalize="words" spellcheck="false" enterkeyhint="done">`, Knopf „Weiter“, Meldung von `validateName` unter dem Feld.
  - Eier: Ilvy: „Diese fünf Eier hat das Meer heute Morgen angespült …“. Fünf leuchtende Eier liegen nebeneinander am Strand, jedes mit sanft pulsierendem Schein in der Farbe seines Wesens. Links/Rechts oder Tippen wählt. Im Panel stehen Name, Beschreibung und Besonderheit. „Dieses Ei wählen“ → `choose('Bist du sicher?', ['Ja', 'Nein'])` → Schlüpfen: Das Ei wackelt dreimal (bei reduzierter Bewegung blendet es über), wird hell, und das Wesen erscheint mit „{Art} ist geschlüpft!“. Danach `choose('Möchtest du ihm einen Spitznamen geben?', ['Ja', 'Nein'])` mit Namensfeld wie oben, Spitzname 0 bis 12 Zeichen.
  - Ablauf in `main.js`: Titel → Paket → Intro → Name → Eier → `game.state = newGameState(…)` → Welt.
  - `?dev` (nur localhost): überspringt alles bis zur Welt, Name „Test“, Wesen aus `&wesen=` (Standard `funki`), Paket aus dem Speicher oder das Beispielpaket.
- [ ] **Step 6: Im Browser prüfen.** Ganzer Ablauf von Titel bis Bucht auf PC und in der Touch-Simulation. Leerer Name zeigt die Meldung. Jedes Ei zeigt den richtigen Text. Überspringen funktioniert. `?dev&wesen=nixi` startet direkt mit Nixi.
- [ ] **Step 7: Commit** – `git commit -m "Spielstart mit Intro, Namen und Eiwahl"`

---

### Task 16: Duell-Ansicht

**Files:**
- Create: `js/ui/duelPanel.js`, `js/scenes/duel.js`
- Modify: `js/state.js` (`applyDuelResult`), `js/main.js` (`?duell=wild|trainer`), `css/spiel.css`
- Test: `tests/state.test.js` (erweitern)

**Interfaces:**
- Consumes: `createDuel` (Task 13), `createDeck`, `recordAnswer` (Task 11), `addXp`, `xpForWin`, `maxEnergy`, `displayName`, `SPECIES` (Task 12), `creatureRows` (Task 14), `say`, `choose` (Task 6), `packProgress` (Task 15)
- Produces:
  - `DuelSetup = { kind: 'wild' | 'trainer', area, foe: { species, stage, level, maxEnergy }, trainer?: { number, name, lines: { hello, win, loss } }, pool: Question[] }`
  - `createDuelScene(game, setup, onEnd: (report) => void) → Scene`
  - `applyDuelResult(state, shortId, setup, summary) → { outcome, xp, flawless, levelsGained, levelAfter, stageBefore, stageAfter }`: schreibt die Historie, setzt bei Sieg XP/Level und die Energie aus `summary`, bei Trainersieg `beaten`, bei Flucht nur die Energie, bei Niederlage die volle Energie.

- [ ] **Step 1: Tests schreiben**

```js
const won = (answers = [{ key: 'a', correct: true }]) => ({ outcome: 'won', playerEnergy: 2, flawless: true, answers });
const T1 = { kind: 'trainer', area: 1, foe: { species: 'haeuschel', stage: 2, level: 7, maxEnergy: 5 }, trainer: { number: 1 }, pool: [] };

test('Trainersieg: XP, Level, besiegt, Energie bleibt', () => {
  const s = newGameState({ name: 'A', species: 'funki', nickname: null });
  const r = applyDuelResult(s, 'ENQ9', T1, { ...won(), flawless: false });
  assert.equal(r.xp, 60); assert.equal(s.creature.level, 4); assert.equal(s.creature.xpInLevel, 0);
  assert.equal(s.creature.energy, 2); assert.deepEqual(packProgress(s, 'ENQ9').beaten, [1]);
  assert.deepEqual(packProgress(s, 'ENQ9').history.a, { n: 1, s: 1, w: false });
});
test('Makelloser Trainersieg gibt 75 XP', () => {
  const s = newGameState({ name: 'A', species: 'funki', nickname: null });
  assert.equal(applyDuelResult(s, 'ENQ9', T1, won()).xp, 75); assert.equal(s.creature.xpInLevel, 15);
});
test('Niederlage: keine XP, volle Energie, Historie trotzdem', () => {
  const s = newGameState({ name: 'A', species: 'kiesel', nickname: null });
  const r = applyDuelResult(s, 'ENQ9', T1, { outcome: 'lost', playerEnergy: 0, flawless: false, answers: [{ key: 'b', correct: false }] });
  assert.equal(r.xp, 0); assert.equal(s.creature.energy, 5); assert.deepEqual(packProgress(s, 'ENQ9').beaten, []);
  assert.equal(packProgress(s, 'ENQ9').history.b.w, true);
});
test('Flucht: keine XP, Energie wie im Duell', () => {
  const s = newGameState({ name: 'A', species: 'funki', nickname: null });
  applyDuelResult(s, 'ENQ9', { ...T1, kind: 'wild' }, { outcome: 'fled', playerEnergy: 1, flawless: true, answers: [] });
  assert.equal(s.creature.energy, 1); assert.equal(s.creature.level, 1);
});
```

- [ ] **Step 2: `node --test tests/state.test.js`.** Erwartet: FAIL.
- [ ] **Step 3: `applyDuelResult` implementieren.** Wird die Höchstenergie durch einen Aufstieg größer, bleibt die aktuelle Energie gleich.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Arena und Panel bauen** (Design 7.1, 7.2 und der Entwurf `docs/entwuerfe/duell-antwortformen.html`)
  - **Arena (Canvas):** im oberen Teil des Bildes (etwa y 0 bis 92). Hintergrund der Bucht: Himmelsverlauf, Meer, Sandboden mit zwei ovalen Plattformen. Das eigene Wesen steht links, der Gegner rechts und gespiegelt. Beim Stehen wippen beide um 1 px (Periode ≥ 1 s). Angriff: 8 px Vorstoß in 150 ms und zurück. Beim Treffer blinkt der Getroffene zweimal in 400 ms, bei reduzierter Bewegung gibt es statt Vorstoß und Blinken eine kurze Aufhellung.
  - **Namensschilder (HTML in `game.ui`):** Name, „Lv {n}“ und eine Energieleiste mit einem Abschnitt pro Energiepunkt. Das Schild des Gegners steht oben links, das eigene über dem eigenen Wesen rechts. Die Serie wird als 3 Punkte (bei Stufe ≥ 3 als 2) angezeigt, und „Volltreffer bereit!“ erscheint, wenn die nächste richtige Antwort ein Volltreffer ist.
  - **Panel (`game.panel`, `game.mode = 'duel'`):** Die Frage steht in einem cremefarbenen Kasten (≥ 18 px). Darunter die Antwortform:
    - *Auswahl:* 2 × 2 Knöpfe (≥ 48 px hoch), Tasten 1 bis 4.
    - *Eintippen:* `<input type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="done">` und „Prüfen“, Enter schickt ab. Am PC bekommt das Feld den Fokus. Leere Eingabe wird nicht abgeschickt.
    - *Satzbau:* oben die Satzzeile, unten die Kärtchen (≥ 48 px hoch). Ein Tipp legt ein Kärtchen in die Satzzeile, ein Tipp auf ein gelegtes Kärtchen legt es zurück. Kärtchen werden über ihre Position im Pool verfolgt, damit gleiche Wörter sauber hin und her wandern. „Prüfen“ geht erst mit mindestens einem gelegten Kärtchen.
    - *Seitenknöpfe:* „Erleuchtung“ (Funki, `canJoker`), „Rückenwind“ (Flausch, `canSwap`), „Fliehen“ (wild) bzw. „Aufgeben“ (Trainer, mit `choose('Aufgeben?', ['Ja', 'Nein'])`). B löst Fliehen bzw. Aufgeben aus.
  - **Rückmeldung:** Richtig → grüner Rahmen, ✓ „Richtig!“ (bei Volltreffer „Volltreffer!“), das eigene Wesen greift an, die Leiste des Gegners sinkt. Falsch → roter Rahmen, ✗ „Leider falsch.“ bzw. „Fast! Achte auf die Schreibweise.“ und darunter „Richtig ist: {correctText}“. Das bleibt mindestens `CONFIG.duel.wrongMinMs` stehen und dann bis zum Tipp oder A. Danach greift der Gegner an und die eigene Leiste sinkt. Eigene Meldungen für Schild („Der Schild schützt dein Wesen.“), Zweite Chance („Zweite Chance! Versuch es noch einmal.“) und Quelle („Quelle: +1 Energie“). Während Rückmeldung und Animation sind alle Antwortknöpfe gesperrt.
  - **Ablauf:** Wild: „Ein wildes {Art} taucht auf!“ → `choose('Was tust du?', ['Duell', 'Fliehen'])`. Trainer: direkt los. Ende: Sieg (bei Trainern deren `win`-Zeile) → „{Wesen} bekommt {xp} XP.“ (makellos: „Makellos! +25 %“) → für jedes gewonnene Level „{Wesen} erreicht Level {n}!“ mit kurzem Funkeln → bei neuer Stufe vorerst nur der Text „{Wesen} wird stärker!“. Niederlage: bei Trainern deren `loss`-Zeile, sonst „{Wesen} ist erschöpft.“. Dann `applyDuelResult` und `onEnd(report)`.
  - **Tastatur auf dem iPad:** Über `visualViewport` (`resize`, `scroll`) wird `body.kbd` gesetzt, wenn `visualViewport.height < innerHeight × 0,75`. Mit `body.kbd` liegt das Panel oben im sichtbaren Bereich (`top: visualViewport.offsetTop`), und Frage, Feld und „Prüfen“ bleiben sichtbar.
  - `?duell=wild` und `?duell=trainer` (nur localhost) starten direkt ein Duell mit Testzustand und Beispielpaket. `onEnd` startet dann einfach ein neues Duell.
- [ ] **Step 6: Im Browser prüfen.** `?duell=wild` am PC: Alle drei Formen kommen vor, Tasten 1 bis 4 und Enter funktionieren, `w`/`a`/`s`/`d`/Rücktaste landen im Feld. Doppelklick auf eine Antwort wertet nur einmal. Falsche Antworten zeigen die richtige mindestens 1,5 s. Volltreffer bei der dritten richtigen Antwort in Folge. Fliehen beendet das Duell. `?duell=trainer`: Aufgeben fragt nach. In Hoch- und Querformat ist nichts abgeschnitten. **Auf einem iPad** (oder im Safari-Simulator): Beim Eintippen öffnet sich die Tastatur, Frage und Feld bleiben sichtbar, Autokorrektur greift nicht.
- [ ] **Step 7: Commit** – `git commit -m "Duell-Ansicht mit Arena, drei Antwortformen und Rückmeldung"`

---

### Task 17: Duelle in der Welt

**Files:**
- Create: `js/scenes/transition.js`
- Modify: `js/scenes/world.js`, `js/main.js`, `css/spiel.css`

**Interfaces:**
- Consumes: `createEncounterCounter`, `pickWild`, `wildLevel`, `trainerSees` (Task 4), `poolFor` (Task 11), `AREA_WILD`, `TRAINER_CREATURES`, `displayName`, `maxEnergy` (Task 12), `createDuelScene` (Task 16), `packProgress` (Task 15), Weltszene `lock`, `onStepped`, `onInteract` (Task 5)
- Produces: `playTransition(game, style: 'wild' | 'trainer' | 'fade') → Promise<void>` (setzt `game.overlay` für 500 ms, bei reduzierter Bewegung immer `'fade'`)

- [ ] **Step 1: Wilde Begegnungen.** Nach jedem Schritt (`stepped`) meldet die Weltszene dem Zähler, ob die Figur im hohen Gras steht. Bei einer Begegnung: `lock` → `playTransition('wild')` → `createDuelScene` mit `{ kind: 'wild', area: 1, foe: { species: pickWild(AREA_WILD[1]), stage: 1, level: wildLevel(1), maxEnergy: CONFIG.wild.energyByArea[0] }, pool: poolFor(pack, { kind: 'wild', beaten }) }` → nach `onEnd` zurück in dieselbe Weltszene (`game.go(world)` setzt nichts zurück) mit `playTransition('fade')`.
- [ ] **Step 2: Trainerin.** `t = game.pack.data.trainers[0]`. Nach jedem Schritt und beim Betreten der Welt: Ist Trainer 1 mit dem aktuellen Paket noch nicht besiegt und sieht er die Figur (`trainerSees`), dann `lock` → „!“-Blase über dem Trainer (600 ms) → der Trainer läuft Feld für Feld bis vor die Figur → beide schauen sich an → `say(hello, { speaker: name })` → `playTransition('trainer')` → Duell mit `{ kind: 'trainer', area: 1, foe: { ...TRAINER_CREATURES[1], level: CONFIG.trainers[0].level, maxEnergy: CONFIG.trainers[0].energy }, trainer: { number: 1, name: t.name, lines: { hello: t.hello, win: t.win, loss: t.loss } }, pool: poolFor(pack, { kind: 'trainer', trainerNumber: 1, beaten }) }`. Dasselbe passiert beim Ansprechen mit A. Nach einem Sieg sagt der Trainer beim Ansprechen nur noch: „Der Leuchtstein der Bucht wartet darauf, wieder zu leuchten. Bald ist es so weit.“ (bis Plan 3).
- [ ] **Step 3: Niederlage und Leuchtturm.** Nach einer Niederlage: `playTransition('fade')` → die Figur steht an `BUCHT.respawn` und schaut nach unten → `say(['Du bist am Leuchtturm aufgewacht. {Wesen} hat sich erholt.'])`. Der Trainer steht wieder auf seinem Platz. Die Leuchtturmtür (`onDoor: 'heal'`) füllt die Energie auf: „Das Licht des Leuchtturms gibt {Wesen} neue Kraft.“ (Claude: Der Leuchtturm wirkt in Plan 1 wie ein Leuchtstein, Design 5.1.)
- [ ] **Step 4: Kleine Anzeige.** Oben links in `game.ui` (nur im Modus `walk`) zeigt ein Kasten „{Wesen} Lv {n}“ und die Energie als Abschnitte (Claude, bis das Menü in Plan 2 kommt).
- [ ] **Step 5: Im Browser prüfen** (`?dev`, PC und Touch-Simulation):
  - Im hohen Gras kommt im Schnitt etwa alle 15 Schritte ein wildes Wesen, nie direkt nacheinander. Außerhalb des Grases kommt keins.
  - Vor dem ersten Trainersieg kommen bei wilden Wesen nur Fragen aus Thema 1, danach auch aus Thema 2.
  - Die Trainerin bemerkt einen, wenn man in ihre Blickrichtung läuft, und kommt heran. Bei einer Niederlage wacht man am Leuchtturm auf und kann sie erneut herausfordern. Nach einem Sieg gibt es 60 XP (makellos 75) und Level 4.
  - Die Energie bleibt zwischen Duellen erhalten, die Anzeige stimmt, und der Leuchtturm füllt sie auf.
  - Mit `?dev&wesen=funki` und `?dev&wesen=flausch` erscheinen die Knöpfe ihrer Besonderheit, bei `kiesel` startet die Energie bei 5.
- [ ] **Step 6: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 7: Commit** – `git commit -m "Wilde Wesen und Hüterin der Bucht in der Welt"`

---

### Task 18: Abschluss von Plan 1

**Files:**
- Modify: `README.md`

- [ ] **Step 1: README aktualisieren.** Status („Plan 1 gebaut: spielbarer Kern mit Leuchtturmbucht, Lernpaket und Duellen. Noch kein Spielstand.“), lokal starten (`python3 -m http.server 8000`), Tests (`node --test`), Entwickler-Abkürzungen, Link auf diesen Plan, Lizenz (Lizenzhinweis mit Namen, am 4.11.2026 entfernt).
- [ ] **Step 2: Gesamtprüfung.** `node --test` → `# fail 0`. Dann einmal den ganzen Weg ohne Abkürzungen durchspielen, am PC in Chrome und Safari und auf einem iPad in Safari: Titel → Beispielpaket → Intro → Name → Ei → Bucht → wildes Wesen in allen drei Formen → Trainerin besiegen. Dabei prüfen: keine Netzwerkanfragen außer zu eigenen Dateien (Netzwerk-Panel), keine Konsolenfehler, Hoch- und Querformat, Drehen mitten im Duell, Steuerkreuz mit zwei Fingern (laufen und A), Bewegung reduzieren in den Systemeinstellungen.
- [ ] **Step 3: Commit** – `git commit -m "Plan 1 abschließen: README und Gesamtprüfung"`
