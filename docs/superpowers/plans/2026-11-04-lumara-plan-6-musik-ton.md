# Lumara · Plan 6: Musik und Ton – Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lumara klingt wie ein alter Handheld. Jedes Gebiet, die Höhle, die Duelle, der Endgegner und der Aufstieg haben eine kurze eigene Musikschleife. Dazu kommen Jingles für die großen Momente und Effekte für Menü, Antworten und Treffer. Alles wird im Browser erzeugt. Musik und Effekte lassen sich getrennt ausschalten.

**Architecture:**
- **Klangerzeugung (`js/audio/synth.js`):** dünn über die Web Audio API, mit zwei Rechteck-Stimmen, einer Dreieck-Stimme und Rauschen. Sie bekommt einen Context von außen und lässt sich in Node mit einem Fake-Context testen.
- **Notenschrift und Sequencer (`js/audio/notes.js`, `js/audio/sequencer.js`):** rein und testbar. Eine kompakte Notenschrift wird zu Ereignissen mit Zeit und Dauer. Der Sequencer plant Schleifen mit Vorlauf ein.
- **Musik (`js/audio/songs.js`):** die Stücke als Notendaten, alle selbst komponiert.
- **Effekte (`js/audio/sfx.js`):** jeder Effekt ist ein kurzes Rezept aus Frequenzverlauf, Hüllkurve und Stimme.
- **Steuerung (`js/audio/audio.js`):** `createAudio({ makeContext, settings })` liefert `{ unlock(), music(id), stopMusic(), jingle(id), sfx(id), setMusicOn(b), setSfxOn(b) }`.
  - Erst nach der ersten Berührung oder Taste wird ein Context erzeugt (iOS).
  - Ist der Ton aus oder fehlt die API, passiert nichts.
- **Einbindung:** `game.audio` wird in `main.js` erzeugt. Szenen rufen `music`/`jingle`/`sfx` auf. Welt, Duell, Titel und Szenen wählen ihre Musik nach Karte (`def.music`, sonst `area<n>`), Höhle und Duellart.
- **Spielstand Format 8:** `settings.music` und `settings.sfx`, beide boolean, Standard `true`. Die Umwandlung 7 → 8 ergänzt sie.

**Tech Stack:** wie bisher, Web Audio API. Keine Dateien, kein Netz.

**Spec:** `docs/superpowers/specs/2026-11-01-lernwelt-rpg-design.md` (15 Musik und Ton, 13 Steuerung, 11 Spielstand). Vorgänger: Plan 5b.

**Arbeitszweig:** `feature/ton`, abgezweigt von `feature/endlos` nach dessen Abschlussprüfung.

## Global Constraints

- **Keine Audiodateien, keine Bibliotheken.** Nur `OscillatorNode` (square, triangle), ein Rauschpuffer, `GainNode`. Alles in `js/audio/`.
- **Stimmen (15):** Rechteck 1 (Melodie), Rechteck 2 (Begleitung, eine Oktave tiefer oder Akkordtöne), Dreieck (Bass), Rauschen (Schlagzeug: kurz `k` tief, `s` hell, `h` sehr kurz).
- **Lautstärke:**
  - Die Musik startet leise: Gesamtlautstärke 0,18, die Effekte 0,35.
  - Kein Klick: Jede Note bekommt eine kurze Hüllkurve mit 5 ms Anstieg und 30 ms Ausklang.
- **iOS (15):** Der AudioContext entsteht erst bei der ersten `pointerdown`- oder `keydown`-Geste (`unlock`). Musik, die vorher gewünscht war, beginnt dann.
- **Ein und aus (15):**
  - Musik und Effekte lassen sich unter *Einstellungen* getrennt schalten, mit zwei Knöpfen mit Zustand („Musik: an/aus“, „Effekte: an/aus“, `aria-pressed`).
  - Die Wahl wird gespeichert.
  - Musik aus heißt: sofort Stille, und bei Musikwechseln wird nichts gestartet.
- **Stücke (15, Claude):** jeweils eine Schleife von 8 bis 16 Takten, Dur oder modal, kindgerecht und ruhig genug für das Lernen.
  - `title`
  - `area1` (Bucht, Seemannslied in G-Dur, 6/8)
  - `area2` (Wald, Flöte über Bordun, D-Dorisch)
  - `area3` (Moor, verschmitzt, A-Moll mit Staccato)
  - `area4` (Dünen, D-Phrygisch mit Rauschen als Wind)
  - `area5` (Klippen, weit, F-Lydisch)
  - `area6` (Ruinen, tickender Bass, C-Dur)
  - `area7` (See, langsam mit Dreieck-Glocken, E-Moll)
  - `area8` (Wiese, sanfter Walzer, Bb-Dur)
  - `cave` (tief, viel Hall durch Echo-Noten, C-Moll)
  - `wild` (fröhliches Duell)
  - `trainer` (stärkeres Duell)
  - `boss` (Morrow, drängend, aber nicht bedrohlich, D-Moll → D-Dur am Ende der Schleife)
  - `ascent` (aufsteigend, E-Dur)
- **Jingles (einmal, Claude):**
  - `victory`, `defeat` (sanft, nie spöttisch)
  - `levelup`, `evolution`
  - `find` (Fund oder Stein)
  - `beacon` (Leuchtstein)
  - `finale` (Morrow erinnert)
- **Effekte (15):**
  - `menu`, `confirm`
  - `correct`, `wrong` (sanft)
  - `hit`, `crit`
  - `tile` (Kärtchen legen), `type` (Tippen)
  - `lift` (Stein anheben)
  - `transition`, `fog` (Nebel weicht)
- **Musik nach Ort:**
  - Jede Gebietskarte spielt `area<n>`.
  - Geheime Orte spielen die Musik ihres Gebiets; die Eisgrotte darf `area7` nutzen.
  - Die Höhlenkarten spielen `cave`, der Leuchtturm-Aufstieg spielt `ascent`.
  - Duelle: `wild`, `trainer` (auch Revanche), `boss` (auch Erinnerungsduell).
  - Ein Musikwechsel auf dasselbe Stück startet nicht neu.
- **Barrierefreiheit:** Kein Ton trägt Information allein. Jede Rückmeldung bleibt auch als Text und Bild da.
- **Spielfassung** am Ende: `0.12.0`.

### Notenschrift (Claude)

- **Eine Stimme ist eine Zeichenkette aus Tokens**, getrennt durch Leerzeichen:
  - `c4/8` ist c in Oktave 4 als Achtel.
  - `g#3/4.` ist eine punktierte Viertel.
  - `-/2` ist eine halbe Pause.
  - Beim Rauschen steht `k/8`, `s/8` oder `h/16`.
  - `|` ist ein Taktstrich und wird ignoriert, hilft aber beim Lesen.
- **Längen:** `1, 2, 4, 8, 16`, dazu Punkt. Bei 6/8-Stücken gilt dieselbe Schrift, das Tempo bezieht sich auf die Viertel.
- **Ein Stück:** `{ tempo, voices: { sq1, sq2, tri, noise } }`. Alle Stimmen einer Schleife sind gleich lang, das prüft ein Test.

## Review Focus

1. **Kein Ton vor der ersten Geste und keiner, wenn ausgeschaltet.** Ein Fake-Context zählt die gestarteten Oszillatoren. → Tests in Task 3
2. **Musikwechsel:**
   - Gleiches Stück: kein Neustart.
   - Neues Stück: das alte stoppt sauber und hängt nicht weiter in der Warteschlange.
   - Jingle: die Schleife pausiert und läuft danach weiter.
   - → Tests in Task 3
3. **Notendaten:**
   - Jedes Stück lässt sich lesen.
   - Die Stimmen sind gleich lang.
   - Alle Töne liegen zwischen 55 Hz und 2,1 kHz, also ohne schrille Töne.
   - → Tests in Task 2 und 4
4. **Spielstände:** Format 7 → 8 mit `music: true`, `sfx: true`. Kaputte Werte werden `true`. → Test in Task 1
5. **Zwei Sprachen** für die Einstellungs-Knöpfe. → Test in Task 5

---

### Task 1: Spielstand Format 8 mit den Toneinstellungen

**Files:** `js/state.js`, `js/save/migrate.js`, `tests/fixtures/spielstand-v8.{js,txt}`, `tests/migrate.test.js`, `tests/state.test.js`

- [ ] **Step 1: Tests**
  - v7 → 8: `settings: { textSpeed, music: true, sfx: true }`.
  - v8-Fixture (Musik aus) lädt.
  - `music: 'nein'` → `true`.
  - `sfx: false` bleibt `false`.
- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Umsetzen.**
- [ ] **Step 4: `# fail 0`.**
- [ ] **Step 5: Commit**: `Spielstand-Format 8: Musik und Effekte ein und aus`

### Task 2: Notenschrift und Sequencer

**Files:** Create `js/audio/notes.js`, `js/audio/sequencer.js`, `tests/audioNotes.test.js`

**Interfaces:**
- **`noteFreq('a4')`** gibt 440 zurück, gleichstufig. Mit `#` und `b` (`bb3`).
- **`parseVoice(text, tempo)`** gibt `{ events: [{ t, dur, freq | drum }], length }` zurück, Zeiten in Sekunden. Eine Viertel dauert `60 / tempo`.
- **`parseSong(song)`** gibt `{ voices: { name: events }, length }` zurück. Haben die Stimmen ungleiche Längen, wirft sie einen Fehler.
- **`createSequencer({ now, schedule, lookahead = 0.12 })`:**
  - `play(parsed, { loop })`, `stop()`, `tick()`.
  - `tick()` plant alle Ereignisse bis `now() + lookahead` über `schedule(voice, event, when)`.
  - Bei `loop` geht es mit Versatz `length` weiter.
  - `stop()` verwirft alles, was noch nicht geplant ist.

- [ ] **Step 1: Tests**
  - `a4` = 440, `c4` ≈ 261,63, `bb3` ≈ 233,08.
  - `"c4/4 -/4 e4/8. g4/16"` bei Tempo 120 ergibt Zeiten 0, 0,5 (Pause, kein Ereignis), 1,0 und 1,375; die Länge ist 1,5.
  - Fehler bei unbekanntem Token, mit Position.
  - Der Sequencer mit Fake-Uhr plant genau die Ereignisse im Fenster, wiederholt bei `loop` und plant nach `stop` nichts mehr.
- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Umsetzen.**
- [ ] **Step 4: `# fail 0`.**
- [ ] **Step 5: Commit**: `Notenschrift und Sequencer für die Musik`

### Task 3: Klangerzeugung, Effekte und Steuerung

**Files:** Create `js/audio/synth.js`, `js/audio/sfx.js`, `js/audio/audio.js`, `tests/audio.test.js` (mit Fake-Context: zählt `createOscillator`, `start`, `stop`, Gain-Werte)

**Interfaces:**
- **`createSynth(ctx, { musicGain, sfxGain })`:**
  - `note(voice, freq, when, dur, gain)` für die Stimmen `sq1`, `sq2`, `tri`
  - `drum(kind, when)` für das Rauschen
  - `sweep({ type, from, to, when, dur, gain })` für Effekte
- **`SFX`:** je Effekt ein Rezept. `playSfx(synth, id, when)`.
- **`createAudio({ makeContext, settings, songs })`:**
  - Ohne `unlock()` gibt es keinen Context.
  - `music(id)` merkt sich das Stück und beginnt nach `unlock`.
  - `setMusicOn(false)` setzt die Musik stumm und stoppt den Sequencer. `setMusicOn(true)` spielt das gemerkte Stück weiter.
  - `jingle(id)`: Die Schleife pausiert, der Jingle spielt, danach läuft die Schleife von vorn weiter.
  - `sfx(id)` nur bei eingeschalteten Effekten.

- [ ] **Step 1: Tests**
  - Vor `unlock`: 0 Oszillatoren.
  - Nach `unlock` und `music('area1')` und einem `tick`: Oszillatoren entstehen.
  - Musik aus: keine neuen.
  - Gleiches Stück zweimal: kein Neustart (Startzeit gleich).
  - `sfx('correct')` bei Effekten aus: 0.
  - Jingle, danach Schleife weiter.
  - `makeContext` wirft (keine Web Audio API): alles bleibt stumm, ohne Fehler.
- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Umsetzen.**
- [ ] **Step 4: `# fail 0`.**
- [ ] **Step 5: Commit**: `Klangerzeugung, Effekte und Steuerung`

### Task 4: Die Musikstücke und Jingles

**Files:** Create `js/audio/songs.js`, `tests/songs.test.js`

- [ ] **Step 1: Tests**
  - Es gibt alle 14 Stücke und 7 Jingles aus den Global Constraints.
  - Jedes lässt sich lesen, die Stimmen sind gleich lang.
  - Schleifen dauern 6 bis 40 s, Jingles höchstens 4 s.
  - Alle Frequenzen liegen zwischen 55 und 2100 Hz.
  - Tempo zwischen 60 und 180.
- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Komponieren und umsetzen** (Charakter je Stück wie in den Global Constraints).
- [ ] **Step 4: `# fail 0`.**
- [ ] **Step 5: Commit**: `Musik für alle Orte und Duelle`

### Task 5: Einbinden: Welt, Duelle, Szenen und Einstellungen

**Files:**
- `js/main.js` (`game.audio`, `unlock` bei der ersten Geste)
- `js/scenes/worldEvents.js` (Musik nach Karte, Effekte bei Fund, Stein, Nebel)
- `js/scenes/duel.js` (Duellmusik, `correct`/`wrong`/`hit`/`crit`, Jingles für Sieg, Niederlage, Level, Entwicklung)
- `js/ui/duelPanel.js` (`tile`, `type`)
- `js/ui/dialog.js` (`confirm`)
- `js/menu/menu.js` (`menu`)
- `js/scenes/title.js` (`title`)
- `js/scenes/beacon.js` (`beacon`, `fog`)
- `js/scenes/finale.js` (`finale`)
- `js/scenes/transition.js` (`transition`)
- `js/menu/settings.js` (zwei Knöpfe)
- Texte, `sw.js`

**Interfaces:**
- **`musicFor(def)`:**
  - `def.cave` → `cave`
  - `def.music` → dieses
  - sonst `area<def.area>`
- **`duelMusic(setup)`:**
  - `boss` → `boss`
  - `ascent` → `ascent`
  - `trainer` → `trainer`
  - sonst `wild`
- **Texte:**
  - `settings.music`: de „Musik“, en „Music“
  - `settings.sfx`: de „Effekte“, en „Sound effects“
  - `settings.on`: de „an“, en „on“
  - `settings.off`: de „aus“, en „off“

- [ ] **Step 1: Tests** für `musicFor` und `duelMusic`, die Texte in beiden Sprachen, die Einstellungen, die in den Spielstand geschrieben werden, und `sw.js` FILES.
- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Umsetzen.**
- [ ] **Step 4: `# fail 0`.**
- [ ] **Step 5: Browser.**
  - Musik nach der ersten Taste.
  - Wechsel Bucht → Wald, ein Duell und zurück.
  - Ein Leuchtstein mit Jingle.
  - Musik aus, Effekte an: nur Effekte.
  - Neu laden: Einstellung bleibt.
- [ ] **Step 6: Commit**: `Musik und Ton im Spiel`

### Task 6: Abschluss von Plan 6

- [ ] **Step 1:** Spielfassung `0.12.0`, README, `FILES`. `node --test` → `# fail 0`.
- [ ] **Step 2: Gesamtdurchlauf ohne `?dev`.** Alle acht Gebiete kurz betreten (Musik wechselt), Höhle, ein Duell jeder Art, Aufstieg, beide Schalter.
- [ ] **Step 3: Commit**: `Plan 6 abschließen: Spielfassung 0.12.0 und README`
