# Lumara · Plan 7: Französisch und Spanisch – Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ist das Lernpaket für Französisch oder Spanisch, läuft das ganze Spiel in dieser Sprache, mit eigenen, kindgerechten Namen für Gebiete und Wesen und auf A1-Niveau. Ohne Sprachfach bleibt es Deutsch.

**Architecture:**
- Die Sprachtechnik steht seit Plan 4a: `t()`/`tl()`/`textIn()`/`mark()`, Tabellen je Sprache und `LOCAL`-Zuordnungen in Welt, Wesen, Geschichte und Aufträgen.
- Plan 7 ergänzt je Sprache fünf Tabellen (`<l>.js`, `<l>-species.js`, `<l>-world.js`, `<l>-story.js`, `<l>-quests.js`), meldet sie an und schaltet `READY` auf alle vier Sprachen.
- Die Prüfungen in `tests/i18n.test.js` laufen künftig für jede fertige Fremdsprache, nicht nur für Englisch. Dazu kommen Regeln, die erst Französisch und Spanisch brauchen: grammatisches Geschlecht je Wesen, Einzahl/Mehrzahl der Gebiete auf den Nebelschildern und die Elision im Französischen.
- Antworten in Spanisch-Paketen: `¿` und `¡` zählen beim Prüfen nicht, `« »` gelten wie `" "`.

**Tech Stack:** wie bisher. Keine Bibliotheken, kein Netz.

**Spec:** `docs/superpowers/specs/2026-11-01-lernwelt-rpg-design.md`, Abschnitt 10.6 Spielsprache (dazu 7.3 Antworten prüfen). Vorgänger: Plan 6.

**Arbeitszweig:** `feature/sprachen`, abgezweigt von `feature/ton` nach dessen Abschlussprüfung.

## Global Constraints

- **Was übersetzt wird (10.6):** alles, was das Kind nach dem Laden des Pakets sieht: Oberfläche, Menüs, Duelle, Bewohner, Schilder, Geschichte, Namen der Gebiete und der Wesen, die Standardtexte der Trainer.
- **Was nicht übersetzt wird:** Eigennamen der Bewohner und Morrow, Name des Kindes und Spitzname, alles aus dem Paket.
- **Was Deutsch bleibt:** alles für die Lehrkraft (`lehrkraft.html`, „Für die Lehrkraft“ mit Prüfcode, Fehlerliste beim Laden, Vorlage, Anleitung) und alles vor dem Laden eines Pakets.
- **Niveau:** Französisch und Spanisch auf A1. Kurze Sätze, häufige Wörter, dieselbe Geschichte und derselbe Ton wie im Deutschen. Das Kind wird geduzt (tu/tú).
- **Paketwechsel:** Wechselt mit dem Paket die Sprache, ist das Spiel danach in der neuen Sprache. Der Spielstand hängt nicht an der Sprache. Die Spielstand-Fixtures `tests/fixtures/spielstand-v1..v8.*` ändern sich nicht.
- **Längen:**
  - Sprechblasen (Schlüssel `intro|eggs|world|duel|note|stone|cave|fog|trainer|recover`) höchstens 110 Zeichen je Zeile; Bewohner- und Auftragszeilen höchstens 130.
  - Wesennamen höchstens 16 Zeichen, Gebietsnamen höchstens 22.
- **Keine neuen Abhängigkeiten.** Neue Dateien kommen in die Liste von `sw.js` (die Prüfung `tests/sw.test.js` verlangt jede JS-Datei).

## Review Focus

1. **Grammatik mit Platzhaltern:** `{name}` kann ein Wesen, ein Spitzname oder das Kind sein. Kein Adjektiv darf mit `{name}` übereinstimmen müssen. Im Französischen darf vor einem Namen kein „de/que/le/la …“ stehen, sonst fehlt die Elision („de Anna“). Die Prüfung in Task 1 deckt beides ab.
2. **Wilde Wesen mit Artikel:** „Une Glimmqualle“ statt „Un“. Jedes Wesen hat auf Französisch und Spanisch ein eigenes `gender`. Kein französischer Wesenname beginnt mit Vokal oder h, sonst müsste „Le“ zu „L’“ werden.
3. **Nebelschild mit Einzahl/Mehrzahl:** Das Verb richtet sich nach `sign.leadsToPlural` aus der deutschen Karte. Darum müssen Spiegeldünen, Windklippen und Uhrwerkruinen auch auf Französisch und Spanisch Mehrzahl sein (les/los/las), alle anderen Einzahl.
4. **Längere Texte auf dem kleinen Schirm:** Französisch und Spanisch sind 15 bis 30 % länger. Knöpfe im Duell, Menüs, Tasche, Einstellungen und Wesen-Buch dürfen nicht überlaufen. Das zeigt nur der Browserlauf in Task 3.
5. **Spanische Antworten:** Ein Kind tippt „como te llamas“ für „¿Cómo te llamas?“. Das soll als „fast richtig“ gelten, weil nur ein Akzent fehlt, und nicht als falsch, nur weil das ¿ fehlt (Task 2).

---

### Task 1: Vier Sprachen: Tabellen, Anmeldung und Prüfungen

**Files:**
- Create: `js/i18n/fr.js`, `js/i18n/fr-species.js`, `js/i18n/fr-world.js`, `js/i18n/fr-story.js`, `js/i18n/fr-quests.js` (Exporte `FR`, `FR_SPECIES`, `FR_WORLD`, `FR_STORY` + `FR_SECRET_STORY`, `FR_QUEST_TEXT`) und dieselben fünf für `es` (`ES…`)
- Modify: `js/pack/language.js` (`READY = ['de', 'en', 'fr', 'es']`), `js/i18n/i18n.js` (`TABLES`), `js/world/network.js` (`LOCAL_WORLD`), `js/data/species.js` (`LOCAL`), `js/data/story.js` (`LOCAL_STORY`, `LOCAL_SECRET`), `js/data/quests.js` (`LOCAL_TEXT`), `sw.js` (Dateiliste)
- Test: `tests/i18n.test.js`, `tests/language.test.js`

**Interfaces:**
- Produces: `setLanguage('fr'|'es')` aktiviert die Sprache; `speciesText(id).gender` ist auf fr/es immer `'m'` oder `'f'`; `areaName`/`areaOf`/`destinationName`, `worldLines`, `storyPieces`, `secretStory`, `questText` liefern fr/es.

- [ ] **Step 1: Die Prüfungen für jede Fremdsprache schreiben**

In `tests/i18n.test.js` laufen die bisherigen Englisch-Prüfungen in einer Schleife über `FOREIGN = { en, fr, es }`:
  - gleiche Schlüssel, gleiche Art (Liste/Text) und gleiche Platzhalter wie `DE`; keine Schlüssel zu viel
  - nicht leer; Sprechblasen höchstens 110 Zeichen je Zeile
  - jede Karte: `areas[id]` mit `name`/`of`/`the`; jedes Textfeld in `FIELDS = ['lines', 'linesLit', 'linesOpen', 'linesNoClock', 'linesAfter', 'afterWin']` (neu: `linesAfter`) mit Übersetzung derselben Art, keine Objekt-ids zu viel, Zeilen höchstens 130 Zeichen
  - Geschichte: gleich viele Stücke je Gebiet, jeder geheime Ort
  - Aufträge: gleiche ids und Felder; `steps` und `hints` gleich lang
  - Wesen: jedes Wesen, gleich viele Stufennamen, Namen höchstens 16 Zeichen, keine Namen doppelt zwischen Wesen

Neue Prüfungen nur für fr und es:
  - `'Französisch und Spanisch: jedes Wesen hat ein grammatisches Geschlecht'` (`gender` ∈ `m`, `f`)
  - `'Nebelschilder: Einzahl und Mehrzahl wie im Deutschen'`: Für jedes Schild mit `leadsTo` beginnt `areas[ziel].the` genau dann mit `les ` (fr) bzw. `los `/`las ` (es), wenn `leadsToPlural` gesetzt ist.
  - `'Französisch: Elision vor Namen'`: Kein Text in fr.js, fr-world.js oder fr-quests.js enthält `/(^|\s)(de|que|le|la|je|ne|se|ce|me|te)\s+\{(name|wild|item|title|place|what|ability)\}/i`, und kein französischer Wesenname beginnt mit Vokal oder h.
  - `'Wilde Wesen und Gebiete auf Französisch und Spanisch'`: `wildName('glimmqualle', 1, 'a')` beginnt in fr mit „Une “ bzw. in es mit „Una “, wenn `gender` dort `f` ist; `t('world.beaconRelit', { of: areaOf(MOOR) })` enthält `areaOf(MOOR)`; `fogEdgeLines(sign, …, DUENEN)[0]` für das Schild `nebel-ost` nutzt `fog.beyondMany` mit `destinationName(sign)`.

`'Sprachen: nur fertige werden aktiv'`: `setLanguage('fr') === 'fr'`, `setLanguage('es') === 'es'`, `setLanguage('xy') === 'de'`.

In `tests/language.test.js` gibt `lang('Französisch')` jetzt `{ language: 'fr', requested: 'fr', hints: [] }`; `lang('Latein')` bleibt Deutsch mit dem Hinweis „Das Spiel gibt es noch nicht auf Latein. Es läuft auf Deutsch.“

- [ ] **Step 2: Laufen lassen**

Run: `node --test tests/i18n.test.js tests/language.test.js`
Expected: FAIL (fr/es-Tabellen fehlen, `setLanguage('fr')` gibt `'de'`).

- [ ] **Step 3: Tabellen einsetzen und anmelden**

Die zehn Dateien kommen von den Übersetzern (Brief: eigene Namen, A1, Glossar, Prüfskript). Danach Anmeldung in `TABLES`/`LOCAL…`, `READY` auf vier Sprachen, `sw.js`-Liste. Der Hinweis „kommt in einer späteren Spielfassung“ entfällt damit von selbst; der Kommentar in `language.js` wird angepasst.

- [ ] **Step 4: Laufen lassen**

Run: `node --test tests/i18n.test.js tests/language.test.js tests/sw.test.js`
Expected: PASS

- [ ] **Step 5: Gesamte Suite und Commit**

Run: `npm test` → alle grün. Commit: „Französisch und Spanisch: Tabellen, Anmeldung und Prüfungen für jede Sprache“.

### Task 2: Antworten in Französisch- und Spanisch-Paketen

**Files:**
- Modify: `js/duel/answers.js` (`normalizeTyped`)
- Test: `tests/answers.test.js`

- [ ] **Step 1: Test schreiben** – `'Spanische Frage- und Ausrufezeichen zählen nicht, französische Anführungszeichen wie gerade'`:
  - `checkTyped('como te llamas', ['¿Cómo te llamas?'])` → `{ correct: false, almost: true }`
  - `checkTyped('¿Cómo te llamas?', ['Cómo te llamas'])` → `correct: true`
  - `checkTyped('hola que tal', ['Hola, ¿qué tal?'])`: nicht korrekt (Komma und Akzent fehlen). Hier geht es nur darum, dass der Vergleich nicht abstürzt.
  - `checkTyped('¡Hola!', ['hola'])` → `correct: true`
  - `normalizeTyped('« oui »')` === `normalizeTyped('"oui"')`, mit Leerzeichen innen wie im Französischen
  - `checkTyped('Ça va ?', ['ça va'])` → `correct: true`
- [ ] **Step 2: Laufen lassen**, Expected: FAIL bei ¿/¡ und « ».
- [ ] **Step 3: `normalizeTyped`** entfernt `¿` und `¡` überall und macht aus `«`/`»` ein `"`, das Leerzeichen innen fällt weg. Alles andere bleibt, wie es ist (Akzente zählen weiter: ein fehlender Akzent ist „fast richtig“).
- [ ] **Step 4: Laufen lassen**, Expected: PASS; `npm test` grün. Commit.

### Task 3: Im Browser auf Französisch und Spanisch, Spielfassung 0.13.0

**Files:**
- Modify: `js/version.js`, `sw.js`, `version.json` (0.13.0), `README.md`, `pakete/vorlage.txt` (Hinweis „kommen in einer späteren Spielfassung“ entfällt)

- [ ] **Step 1: Browserlauf Französisch:** ein kleines Paket mit `FACH: Französisch` laden (nur Testdatei im Notizordner). Mit echten Tasten durchspielen:
  - Einleitung, Ei-Wahl, Name, Bucht mit Bewohnern und Schildern, ein wildes Duell (Knöpfe, Rückmeldung, Sieg)
  - Menü: Tasche, Wesen, Wesen-Buch, Tagebuch, Karte, Einstellungen
  - Nebelschild nach Osten
  Nichts läuft über oder wird abgeschnitten, nirgends steht Deutsch oder Englisch. Prüfmodus `?sprache=fr` zeigt nur ⟦ ⟧-Texte.
- [ ] **Step 2: Browserlauf Spanisch:** derselbe Weg mit `FACH: Spanisch`.
- [ ] **Step 3: Paketwechsel:** Spanisch → Englisch → Mathe (Deutsch). Das Spiel wechselt jedes Mal die Sprache, der Spielstand bleibt.
- [ ] **Step 4: Fassung 0.13.0 und Texte:** README (Plan 7), Vorlage. `npm test` grün. Commit „Plan 7 abschließen: Spielfassung 0.13.0“.
