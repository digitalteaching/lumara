# Lumara · Plan 8: Abschluss – Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lumara ist fertig für den Unterricht. Lehrkräfte bekommen einen KI-Prompt für eigene Lernpakete und eine kurze Anleitung. Die offenen kleinen Fehler aus allen Plänen, die ein Kind oder eine Lehrkraft bemerken würde, sind behoben. Das Spiel ist auf dem iPad im Quer- und Hochformat geprüft. Spielfassung 1.0.0.

**Architecture:**
- **Material für Lehrkräfte:**
  - `pakete/KI-PROMPT-Lernpaket.md`: ein Prompt im Aufbau des Schwesterprojekts (`Lernspiele/PROMPT-Lernspiel-Generator.md`). Teil 1 passt die Lehrkraft an, Teil 2 enthält feste Vorgaben, Teil 3 eine Prüfliste.
  - `anleitung.html`: eine kurze Seite im Stil von `lehrkraft.html`.
  - Beide werden auf `lehrkraft.html` verlinkt und vom Service Worker zwischengespeichert.
- **Feinschliff:** kleine, getrennte Korrekturen in Szenen, Texten und Ton, jede mit eigenem Test.
- **iPad:** ein Browserlauf mit Touch-Ereignissen in iPad-Größen (1180×820 quer, 820×1180 hoch), dazu die Mindestgrößen der Steuerung als Test.

**Tech Stack:** wie bisher.

**Spec:** `docs/superpowers/specs/2026-11-01-lernwelt-rpg-design.md`, Abschnitte 10.5 (mitgelieferte Dateien), 12.3 (Seite für Lehrkräfte), 13 (Steuerung), 15 (Ton), 16 (Technik) und 17.9 (Abschluss). Vorgänger: Plan 7.

**Arbeitszweig:** `feature/abschluss`, abgezweigt von `feature/sprachen` nach dessen Abschlussprüfung.

## Global Constraints

- Alles für Lehrkräfte ist Deutsch.
- Keine Netzwerkanfragen außer zu den eigenen Dateien (16). Neue Dateien kommen in die Liste von `sw.js`; `tests/sw.test.js` prüft die genaue Menge.
- **Lizenzzeile (16):** (Lizenzhinweis mit Namen, am 4.11.2026 entfernt) auf jeder neuen Seite.
- **Steuerung (13):**
  - Das Steuerkreuz hat mindestens 140 px Durchmesser, A und B mindestens 64 px, alle Tippflächen mindestens 48 px.
  - Querformat: Die Steuerelemente liegen halbtransparent über den Ecken.
  - Hochformat: Das Spielbild ist oben, die Steuerung darunter.
- Neue Texte für Kinder kommen in alle vier Tabellen (de, en, fr, es). `tests/sprachen.test.js` prüft das.
- Die Spielstand-Fixtures `tests/fixtures/spielstand-v1..v8.*` ändern sich nicht.

## Review Focus

1. **Der KI-Prompt erzeugt gültige Pakete:**
   - Jedes Schlüsselwort des Parsers kommt im Prompt vor.
   - Das Musterpaket im Prompt lädt ohne Fehler.
   - Die Regeln „mindestens 8 Fragen“, „mindestens 3 FALSCH“ und „KENNUNG nie ändern“ stehen darin.
2. **Das Finale verrät den Namen nicht:** Bevor das Kind „Morrow“ sagt, darf er nirgends stehen, auch nicht als Sprecher über der Sprechblase.
3. **Töne ohne Fehler:**
   - Der Tipp-Ton wirft nie, auch nicht ohne `e.key` (Bildschirmtastatur).
   - Abbrechen klingt nicht wie Bestätigen.
   - Die Probefrage der Lehrkraft bleibt stumm.
4. **iPad-Hochformat:** Steuerkreuz und Knöpfe überdecken weder das Spielbild noch Antworten oder Textfenster.
5. **Offline:** Nach dem ersten Laden sind alle Dateien im Zwischenspeicher, auch die neuen Seiten für Lehrkräfte.

---

### Task 1: KI-Prompt für Lernpakete

**Files:**
- Create: `pakete/KI-PROMPT-Lernpaket.md`
- Modify: `sw.js` (Dateiliste), `tests/sw.test.js` (erwartete Menge)
- Test: `tests/kiPrompt.test.js`

- [ ] **Step 1: Test** `'KI-Prompt: jedes Schlüsselwort, die Pflichtregeln und ein Musterpaket, das ohne Fehler lädt'`:
  - Jedes Schlüsselwort aus `PAKET, KENNUNG, FACH, ZEITDRUCK, SPIELSPRACHE, TRAINER, NAME, THEMA, HALLO, SIEG, NIEDERLAGE, REVANCHE, FRAGE, ANTWORT, SATZ, AUCH RICHTIG, FALSCH, EXTRA, FORM, ENDGEGNER, ZETTEL` steht im Prompt.
  - Der Text zwischen `<<<MUSTER` und `MUSTER>>>` ergibt mit `parsePack` `ok: true`, ohne Fehler. Die Hinweise auf zu wenige Fragen pro Trainer sind dabei erlaubt.
  - Der Prompt enthält „mindestens 8“, „mindestens 3“ und „KENNUNG“ mit „nie“ oder „nicht ändern“.
- [ ] **Step 2:** Run `node --test tests/kiPrompt.test.js` → FAIL (Datei fehlt).
- [ ] **Step 3: Prompt schreiben.** Er folgt dem Aufbau des Schwesterprojekts, auf Deutsch:
  - **Teil 1, hier anpassen:** Fach, Jahrgang, Schulform, Spielsprache, bis zu 8 Themen (Trainer 1 bis 8, je Gebiet), Zeitdruck, Niveau.
  - **Teil 2, feste Vorgaben:**
    - A Dateiformat (aus `vorlage.txt`, jedes Schlüsselwort)
    - B Fragen: mindestens 20 je Trainer in allen drei Formen, Ablenker als typische Fehler, kein Lehrwerkstext
    - C Trainertexte in der Spielsprache, kurz
    - D Endgegner und 20 Zettel
    - E Ausgabe nur als Textdatei, ohne Einleitung
  - **Teil 3, Prüfliste vor der Antwort.**
  - Das Musterpaket steht zwischen `<<<MUSTER`/`MUSTER>>>`.
  - `sw.js` und `tests/sw.test.js` bekommen die Datei.
- [ ] **Step 4:** Run `node --test tests/kiPrompt.test.js tests/sw.test.js` → PASS; `npm test` grün. Commit.

### Task 2: Anleitung für Lehrkräfte und Links

**Files:**
- Create: `anleitung.html` (nutzt `css/lehrkraft.css`)
- Modify: `lehrkraft.html` (Links zu KI-Prompt und Anleitung), `sw.js`, `tests/sw.test.js`
- Test: `tests/teacherPages.test.js`

- [ ] **Step 1: Test** `'Anleitung und Seite für Lehrkräfte: Abschnitte, Links und Lizenz'`:
  - `anleitung.html` hat die Überschriften „Lernpaket erstellen“, „Lernpaket prüfen“, „An die Klasse verteilen“, „Statistik prüfen“ und „Datenschutz“.
  - Sie verlinkt `pakete/vorlage.txt`, `pakete/englisch-6-beispiel.txt`, `pakete/KI-PROMPT-Lernpaket.md` und `lehrkraft.html`.
  - Sie trägt die Lizenzzeile und lädt kein externes `http`.
  - `lehrkraft.html` verlinkt `anleitung.html` und `pakete/KI-PROMPT-Lernpaket.md`.
  - Jede lokale Datei, auf die eine der beiden Seiten verweist, gibt es.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Seite schreiben, kurz und konkret:
  - Erstellen: mit der Vorlage oder dem KI-Prompt.
  - Prüfen: auf `lehrkraft.html`, mit Probefrage.
  - Verteilen: Datei per Lernplattform oder AirDrop; im Spiel „Lernpaket laden“.
  - Thema für Thema freigeben: neue Fassung mit gleicher KENNUNG.
  - Statistik und Prüfcode prüfen.
  - Spielsprache.
  - Home-Bildschirm.
  - Datenschutz: keine Daten, nichts verlässt das Gerät.
  - Links auf `lehrkraft.html`, Dateiliste in `sw.js`.
- [ ] **Step 4:** Run → PASS; `npm test` grün. Commit.

### Task 3: Feinschliff an Geschichte und Texten

**Files:**
- Modify: `js/scenes/finale.js`, `js/scenes/worldEvents.js` (Turm verloren, Kuppeltor), `js/world/islandMap.js` (Höhle), Tabellen `js/i18n/{de,en,fr,es}.js`, `js/i18n/en-quests.js` (englische Feinheiten aus Plan 4c)
- Test: `tests/finale.test.js`, `tests/ascent.test.js`, `tests/sternwarte.test.js`, `tests/islandMap.test.js` (oder die bestehenden Testdateien zu diesen Modulen)

- [ ] **Step 1: Tests:**
  - `'Finale: Vor dem Namen steht nirgends „Morrow“'`: Das erste `say` von `playFinale` hat als Sprecher `t('finale.unknown')` („???“ in allen Sprachen), nicht den Artnamen.
  - `'Aufstieg verloren: kein doppeltes „erschöpft“'`: Nach einer Niederlage im Turm wiederholt `tower.lost` nicht `duel.ownTired`.
  - `'Kuppeltor geschlossen: ein Satz, der auf die Zahnräder zeigt'`: Läuft das Kind gegen das Tor oder drückt A davor, kommt `gear.domeClosed`, solange das Rätsel offen ist.
  - `'Karte in der Höhle: „Du bist hier“ beim Berg, nicht auf der Sternenwiese'`
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Umsetzen. Neue Schlüssel (`finale.unknown`, `gear.domeClosed`) kommen in alle vier Tabellen. Dazu die englischen Feinheiten aus dem Plan-4c-Protokoll (q4 locked, Oda, quest.gotKey).
- [ ] **Step 4:** Run → PASS; `npm test` grün. Commit.

### Task 4: Feinschliff am Ton

**Files:**
- Modify: `js/audio/audio.js`, `js/ui/dialog.js`, `js/ui/duelPanel.js`, `js/scenes/worldEvents.js`, `js/scenes/beacon.js`, `js/main.js`
- Test: `tests/audio.test.js`, `tests/audioWire.test.js`

- [ ] **Step 1: Tests:**
  - `'stopMusic während eines Jingles sperrt die Musik nicht'`
  - `'Musik und Effekte aus: der Ton schläft (Akku)'`: `setMusicOn(false)` und `setSfxOn(false)` führen zu `ctx.suspend()`; schaltet man eines wieder ein, folgt `resume()`.
  - `'Jingles bleiben bei Musik aus still; Effekte vor dem Entsperren still'`
  - `'Tonstimmen enthalten keine Schlagzeugzeichen'` (über alle `SONGS`)
  - `'Der Tipp-Ton wirft nie'`: Der Tipp-Handler in `duelPanel.js` nutzt das `input`-Ereignis mit `inputType === 'insertText'`. Ein Ereignis ohne `key` wirft nicht.
  - `'Abbrechen klingt nach Menü, nicht nach Bestätigen'`: `choose()` mit B oder `closeDialogs()` spielt `menu` bzw. nichts.
  - `'Die Probefrage der Lehrkraft bleibt stumm'`: Mit `game.probe` gesetzt ruft `main.js` `setMusicOn(false)` und `setSfxOn(false)` auf. Prüfung über eine kleine reine Funktion `probeAudio(game)` oder über die Quelle.
  - `'Fund im hohen Gras, Level und Entwicklung außerhalb des Duells mit Jingle'`
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Umsetzen. Dazu kommt der Nebel-Ton bei 35 % der Leuchtstein-Szene. Die Aufstiegsmusik bleibt über alle Etagen.
- [ ] **Step 4:** Run → PASS; `npm test` grün. Commit.

### Task 5: iPad und Spielfassung 1.0.0

**Files:**
- Modify: `css/spiel.css`/`js/ui/controls.js` nur, wenn der Lauf Fehler zeigt; `js/version.js`, `sw.js`, `version.json` (1.0.0), `README.md`
- Test: `tests/controls.test.js` (Mindestgrößen aus der CSS oder der Konfiguration)

- [ ] **Step 1: Test** `'Steuerung: Steuerkreuz mindestens 140 px, A/B mindestens 64 px, Tippflächen mindestens 48 px'`. Die Werte kommen aus der Stelle, an der die Größen festgelegt sind (CSS-Variablen oder `CONFIG`).
- [ ] **Step 2: Browserlauf iPad quer (1180×820) und hoch (820×1180), mit Touch-Ereignissen:**
  - Die Steuerung erscheint.
  - Laufen mit dem Steuerkreuz, A spricht, B bricht ab.
  - Im Duell tippt man direkt auf Antworten; Textfenster gehen mit Tippen weiter.
  - Hochformat: Das Spielbild ist oben, die Steuerung darunter, nichts verdeckt Antworten oder Text.
  - Einstellungen zeigen den Hinweis zum Home-Bildschirm.
  - Offline: Nach dem Laden sind alle Dateien aus `sw.js` im Cache (`caches.match`).
- [ ] **Step 3:** Fehler aus dem Lauf beheben, jeder mit Test.
- [ ] **Step 4: Fassung 1.0.0:**
  - README: Status „fertig“, Plan 8, Hinweise für Lehrkräfte.
  - `npm test` grün. Commit „Plan 8 abschließen: Spielfassung 1.0.0“.
