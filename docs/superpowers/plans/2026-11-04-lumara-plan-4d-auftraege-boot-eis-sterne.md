# Lumara · Plan 4d: Aufträge 6 bis 8, Nussschale, Eisgrotte und Sternwarte – Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die Aufträge der Gebiete 6 bis 8 bringen die letzten Schlüsselgegenstände:
- die Nussschale, mit der man zur Gezeiteninsel vor der Bucht und zur Irrlichtinsel im Moor fährt
- die Eiskufen für die Eisgrotte am Nordlichtsee, mit einem Rätsel, bei dem man über das Eis gleitet
- die Sternkarte für die Sternwarte in den Uhrwerkruinen, mit einem Rätsel, bei dem man Zahnräder dreht

Damit sind alle 8 Aufträge, alle 6 geheimen Orte und die Buchplätze 25 bis 30 da.

**Architecture:**
- Die Aufträge 6 bis 8 sind Daten wie in Plan 4c: `QUESTS`, `QUEST_TEXT`, `EN_QUEST_TEXT` und `GUESTS`.
- Die vier neuen geheimen Orte sind eigene kleine Karten mit `secret`. Sie nutzen Eingang, Geschichtsstein, seltenen Stein und eigene wilde Wesen aus Plan 4c.
- **Gleiten auf Eis:** Kacheln `slideice` sind rutschig. Eine reine Funktion `slideIntent(map, player, inputDir)` sorgt dafür, dass die Figur weiterrutscht, bis etwas sie aufhält. `world.js` nutzt sie beim Laufen.
- **Zahnrad-Rätsel:** Drei Zahnräder (`type: 'gear'`) drehen sich bei jedem A eine Vierteldrehung weiter. Stehen alle wie auf der Sternkarte, öffnet sich ein Tor der Karte (`afterPuzzle`).
- Der Stand der Rätsel liegt in `state.secrets[ort]` als `solved` und `gears`.
- Kein neues Format: Format 5 bleibt. Die Reparatur kennt die neuen Felder.

**Tech Stack:** wie bisher.

**Spec:** `docs/superpowers/specs/2026-11-01-lernwelt-rpg-design.md` (5.5 bis 5.7, 6.4, 8.4, 10.4, 10.6, 14). Vorgänger: Plan 4c.

**Arbeitszweig:** `feature/geheimnisse`, abgezweigt von `feature/auftraege` (Plan 4c). Der erste Commit ist dieser Plan.

## Global Constraints

- **Alles aus Plan 4c gilt weiter:**
  - zweisprachig, über `t()`/`tr` und die englischen Tabellen
  - 50 XP je Auftrag über `gainXp`
  - Abschluss erst nach dem Stein des Gebiets
  - Orte eines Auftrags nur in den Gebieten 1 bis k
- **Format 5 bleibt.**
  - Die Fixtures v1 bis v5 bleiben unverändert und laden weiter.
  - `repairSecrets` behält bei `sternwarte` zusätzlich `gears` (drei ganze Zahlen 0 bis 3) und bei jedem Ort `solved` (boolean).
- **Rätsel (5.7):**
  - kurz und ohne Lernfragen
  - jederzeit von vorn: Beim Gleiten bringt einen der Ausgang zurück, und die Zahnräder lassen sich beliebig weiterdrehen
  - Ein gelöstes Rätsel bleibt gelöst.
- **Barrierefreiheit:**
  - Das Gleiten ist eine gleichmäßige Bewegung Feld für Feld.
  - Die Zahnräder zeigen ihre Stellung als Bild und als Text, zum Beispiel „Zahnrad 2: Stern zeigt nach rechts“.
  - Nichts blinkt öfter als dreimal pro Sekunde.
- **Spielfassung** am Ende: `0.9.0`.

### Aufträge 6 bis 8 (Claude)

| Nr. | Gebiet | Auftraggeber | Art | Schritte | Belohnung |
|---|---|---|---|---|---|
| 6 | Ruinen | Pino | etwas Verlorenes finden | Ruder im Schilf des Pilzmoors aufheben (Feld frei wählen, im Test geprüft) → zu Pino | Nussschale |
| 7 | See | Sven | etwas bringen | Kanne heißen Tee zu Greta in die Ruinen → zurück zu Sven | Eiskufen |
| 8 | Wiese | Selma | jemanden suchen | Sternzähler Jonte am Nordlichtsee (16, 24) finden → zurück zu Selma | Sternkarte |

### Die vier geheimen Orte (Claude)

| Ort | Eingang (Objekt `secret`) | Schlüssel | Karte | Rätsel | Seltene Art (Buch) | Stein |
|---|---|---|---|---|---|---|
| Gezeiteninsel | Bucht, Bootssteg (19, 27), von (19, 26) nach unten | Nussschale | `gezeiten`, Insel mit Gezeitentümpeln | – | `perlkrabbe` Perlkrabbe / Pearlcrab (27) | Glanzstein |
| Irrlichtinsel | Moor, Pfahl am Ufer (7, 15), von (7, 16) nach oben | Nussschale | `irrlicht`, Pilzinsel voller Irrlichter | – | `irrlichtfee` Irrlichtfee / Wispfairy (28) | Zeitstein |
| Eisgrotte | See, Eiskante (29, 4), von (28, 4) nach rechts | Eiskufen | `eisgrotte`, Grotte mit Rutscheis | über Eis gleiten bis zum Kristall | `kristallotter` Kristallotter / Crystalotter (29) | Lebensstein |
| Sternwarte | Ruinen, Sternentafel am Kanal (28, 7), von (27, 7) nach rechts | Sternkarte | `sternwarte`, Brücke, Zahnradraum, Kuppel | drei Zahnräder wie auf der Sternkarte | `zeitschnecke` Zeitschnecke / Clocksnail (30) | Weitblickstein |

### Geheimstücke 3 bis 6 (Claude, Deutsch und Englisch)

- **gezeiten:**
  - de: „Bei Ebbe zeigt die Insel alte Steine mit Zeichen. Die Fischer sagen, dort wurde der erste Leuchtstein gefunden, ganz klein und kalt, wie eine Muschel.“
  - en: „At low tide, the island shows old stones with signs. The fishers say the first light stone was found here, tiny and cold, like a shell.“
- **irrlicht:**
  - de: „Die Irrlichter waren früher die Laternen der Moorleute. Als niemand mehr sang, wurden sie zu kleinen Lichtern, die allein über das Wasser tanzen.“
  - en: „The will-o’-the-wisps were once the lanterns of the marsh people. When nobody sang any more, they became little lights that dance over the water alone.“
- **eisgrotte:**
  - de: „Im Eis der Grotte sind Wörter eingeschlossen wie Blasen. Wer genau hinsieht, kann manche noch lesen. Eines heißt ‚Freund‘.“
  - en: „Words are frozen in the ice of the cave like bubbles. If you look closely, you can still read some. One of them says ‘friend’.“
- **sternwarte:**
  - de: „Die Sternwarte zeichnete jede Nacht auf, wer auf der Insel etwas Neues lernte. Die letzte Seite ist leer. Darunter steht: ‚Vergiss niemanden.‘“
  - en: „Every night, the observatory wrote down who on the island had learned something new. The last page is empty. Underneath it says: ‘Forget nobody.’“

## Review Focus

1. **Gleiten:** Man kann nicht im Eis feststecken. Jede Stelle, auf der man stehen bleibt, hat einen Weg zurück zum Ausgang. Der Kristall ist nur durch Gleiten erreichbar. → Test mit einer Suche über alle Rutschwege in Task 4
2. **Zahnräder:** Jede Stellung ist erreichbar. Gelöst öffnet sich die Kuppel sofort und bleibt nach Neuladen offen. Bei falscher Stellung ist die Kuppel zu, ohne Strafe. → Tests in Task 5
3. **Beide Inseln mit derselben Nussschale**, und Rückkehr vom Ort in sein Gebiet. → Tests in Task 3
4. **Spielstände mit Rätselstand**, auch kaputtem: `gears: [9, 'x']` wird `[0, 0, 0]`. → Test in Task 1
5. **Zwei Sprachen** für alle neuen Texte, einschließlich der Zahnrad-Beschreibung. → Tests in Task 2 bis 5

---

### Task 1: Reparatur der Rätselstände und die Logik des Zahnrad-Rätsels

**Files:**
- Create: `js/world/puzzles.js`, `tests/puzzles.test.js`
- Modify: `js/data/secrets.js` (die vier neuen Orte), `js/save/migrate.js`, `sw.js`

**Interfaces:**
- **`SECRET_PLACES`** erweitert um:
  - `gezeiten: { area: 1, key: 'nutshell', stone: 'shine' }`
  - `irrlicht: { area: 3, key: 'nutshell', stone: 'time' }`
  - `eisgrotte: { area: 7, key: 'skates', stone: 'life' }`
  - `sternwarte: { area: 6, key: 'starmap', stone: 'farsight', gears: [2, 1, 3] }`
- **`turnGear(state, place, index)`** dreht ein Rad weiter: `(g + 1) % 4`. Danach gilt `solved = gears` gleich dem Ziel. Ist der Ort einmal gelöst, bleibt er es.
- **`puzzleSolved(state, place)`** liefert `true`, wenn der Ort gelöst ist.
- **Die vier Stellungen** heißen `oben`, `rechts`, `unten`, `links`. Die Texte dazu stehen in der Tabelle (`gear.dir.0` bis `.3`).

- [ ] **Step 1: Tests schreiben**
  - `turnGear` dreht von 0 über 1, 2 und 3 zurück auf 0.
  - Nach den Drehungen 2, 1 und 3 ist der Ort gelöst.
  - Dreht man danach weiter, bleibt `solved` wahr.
  - Reparatur: `secrets: { sternwarte: { story: false, stone: false, solved: 'ja', gears: [9, 'x'] } }` → `{ story: false, stone: false, solved: false, gears: [0, 0, 0] }`. Andere Orte bekommen kein `gears`.
- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Umsetzen.**
- [ ] **Step 4: `# fail 0`.**
- [ ] **Step 5: Commit**: `Rätselstand im Spielstand und Logik der Zahnräder`

### Task 2: Aufträge 6 bis 8

**Files:**
- Modify: `js/data/quests.js`, `js/i18n/en-quests.js`, `js/gfx/art/characters.js` (Jonte)
- Test: `tests/quests.test.js`

**Interfaces:**
- **`q6` (Pino, Ruinen):**
  - pickup `ruder` im Moor auf einem freien Schilf- oder Torffeld
  - talk Pino
  - Belohnung: Nussschale
- **`q7` (Sven, See):**
  - talk Greta in den Ruinen
  - talk Sven
  - Belohnung: Eiskufen
- **`q8` (Selma, Wiese):**
  - talk `jonte` (Gast am See, (16, 24), Blick nach oben)
  - talk Selma
  - Belohnung: Sternkarte
- **Texte:** Deutsch und Englisch in der Art von Plan 4c. Pinos Satz zur Belohnung erklärt, dass die Nussschale zu kleinen Inseln trägt. Svens Satz sagt, dass man mit den Eiskufen über das Eis gleitet. Selmas Satz sagt, dass die Sternkarte in der alten Sternwarte hilft.
- **Pino, Mira und Jasper** bekommen `linesLit`- und `linesOpen`-Sätze, die auf Boot und Eis hinweisen, soweit noch nicht vorhanden. Alle Zeilen gibt es auch auf Englisch.

- [ ] **Step 1: Tests.** Die bestehenden Tests aus Plan 4c gelten für alle 8 Aufträge, mit `QUESTS.length === 8`.
- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Umsetzen.**
- [ ] **Step 4: `# fail 0`.**
- [ ] **Step 5: Browser.** Auftrag 8 ganz spielen, mit Jonte am See. Danach ein wildes Duell in der Welt mit Rückkehr.
- [ ] **Step 6: Commit**: `Die Aufträge der Gebiete 6 bis 8`

### Task 3: Gezeiteninsel und Irrlichtinsel

**Files:**
- Create: `js/world/maps/gezeiten.js`, `js/world/maps/irrlicht.js`, `tests/inseln.test.js`
- Modify:
  - `js/world/maps/bucht.js` (Eingang auf dem Steg) und `js/world/maps/moor.js` (Eingang am Ufer, bei der Irrlichtinsel)
  - `js/world/network.js`, `js/gfx/art/tiles.js` (Requisit `boatpost`; Kacheln `tidepool` (blockiert) und `tidegrass` (hohes Gras))
  - `js/world/map.js`, `js/data/species.js`, `js/i18n/en-species.js`, `js/gfx/art/creatures.js` (Perlkrabbe, Irrlichtfee)
  - `js/data/story.js`, `js/i18n/en-story.js`, `js/i18n/en-world.js`, `sw.js`
- Test: `tests/inseln.test.js`, `tests/species.test.js`, `tests/book.test.js`, `tests/i18n.test.js`, `tests/secrets.test.js`

**Interfaces:**
- **Beide Inseln** sind etwa 18 × 12 groß:
  - Rand aus Wasser
  - ein Feld hohes Gras mit der Art
  - Geschichtsstein, seltener Stein und ein Ausgang zurück ans Ufer
- **Irrlichtinsel:** Die Teilchen `wisp` gehören dazu, die Insel ist nicht dunkel.
- **Eingangstexte**, Deutsch und Englisch, zum Beispiel:
  - ohne Nussschale: „Ein Pfahl mit einem alten Seil. Mit einem kleinen Boot käme man zur Insel hinüber.“
  - mit Nussschale: „Du setzt die Nussschale aufs Wasser und ruderst hinüber.“

- [ ] **Step 1: Tests**
  - Karten wie bei der Eiche: alles erreichbar, Ausgang zurück.
  - Eingänge vor freien Feldern.
  - Arten mit Bild, eigener Silhouette und Buchplätzen 27 und 28.
  - Geheimstücke in beiden Sprachen.
- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Umsetzen.**
- [ ] **Step 4: `# fail 0`.**
- [ ] **Step 5: Browser.** Mit der Nussschale auf beide Inseln, je Art, Stück und Stein.
- [ ] **Step 6: Commit**: `Gezeiteninsel und Irrlichtinsel`

### Task 4: Die Eisgrotte und das Gleiten

**Files:**
- Create: `js/world/slide.js`, `js/world/maps/eisgrotte.js`, `tests/slide.test.js`
- Modify:
  - `js/scenes/world.js` (beim Laufen `slideIntent`)
  - `js/world/map.js` (`slideice` begehbar, `isSlippery`)
  - `js/gfx/art/tiles.js` (`slideice`, `icecrystal` als Requisit)
  - `js/world/maps/see.js` (Eingang), `js/world/network.js`
  - Art Kristallotter, Geheimstück, Texte, `sw.js`

**Interfaces:**
- **`slideIntent(map, player, inputDir)`** gibt die Richtung zurück, in die die Figur geht.
  - Steht sie auf `slideice` und das nächste Feld in ihrer Richtung ist frei, behält sie ihre Richtung. Eingaben zählen dann nicht.
  - Sonst gilt `inputDir`.
  - Während des Rutschens drückt A nichts.
- **`slideStops(map, start)`** sucht über alle Rutschwege (Breitensuche, ein Zug = ein Schritt in eine Richtung samt Rutschen) und liefert eine `Map` von `cellKey` jedes Felds, auf dem man stehen bleiben kann, auf die kleinste Zahl Züge. Der Test nutzt es.
- **Karte `eisgrotte`** (etwa 16 × 12):
  - Der Eingang liegt auf festem Schnee.
  - Dahinter ein Feld aus Rutscheis mit Eissäulen, gebaut aus `nightrock`, umgefärbt als Eiskacheln (`icepillar`, blockiert).
  - Der Kristall mit dem Geschichtsstein liegt auf einer Schneeinsel, die man nur durch Gleiten in der richtigen Reihenfolge erreicht. Gedacht sind mindestens drei Rutschzüge.
  - Hohes Schneegras mit dem Kristallotter liegt am festen Rand.
  - Ausgang zurück zur Eiskante.

- [ ] **Step 1: Tests**
  - `slideIntent`: auf Eis mit freiem Feld vorne → eigene Richtung; vor einer Säule → Eingabe.
  - `slideStops` vom Eingang aus: Die Kristallinsel ist dabei, und von jedem Halteplatz ist der Eingang wieder erreichbar (kein Feststecken).
  - Das Rätsel ist eins: `slideStops` liefert zu jedem Halteplatz die kleinste Zahl Rutschzüge (`Map` von `cellKey` auf Zahl). Für die Kristallinsel sind es mindestens 3.
- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Umsetzen.**
- [ ] **Step 4: `# fail 0`.**
- [ ] **Step 5: Browser.** Mit Eiskufen hinein, zum Kristall gleiten. Unterwegs einmal falsch abbiegen und über den Ausgang neu anfangen.
- [ ] **Step 6: Commit**: `Die Eisgrotte: über das Eis gleiten`

### Task 5: Die Sternwarte und die Zahnräder

**Files:**
- Create: `js/world/maps/sternwarte.js`, `tests/sternwarte.test.js`
- Modify:
  - `js/world/network.js` (`openGatesFor` mit `afterPuzzle`)
  - `js/scenes/worldEvents.js` (Objekt `gear`: drehen, Satz, Tor öffnen wie bei der Leuchtstein-Szene)
  - `js/gfx/art/tiles.js` (Requisiten `gear0` bis `gear3` als Stellungen, `starplaque`)
  - `js/world/maps/ruinen.js` (Eingang Sternentafel)
  - Art Zeitschnecke, Geheimstück, Texte, `sw.js`

**Interfaces:**
- **Karte `sternwarte`** (etwa 18 × 12):
  - Brücke vom Eingang
  - der Zahnradraum mit drei Rädern
  - eine Tafel mit den Sternbildern, die die Sternkarte erklärt: „Stern über dem ersten Rad nach unten, …“, Deutsch und Englisch
  - das Tor `kuppel` mit `afterPuzzle: 'sternwarte'` zur Kuppel
  - in der Kuppel Geschichtsstein, Stein und hohes Gras mit der Zeitschnecke
- **Zahnrad ansprechen:**
  - Eine Vierteldrehung, dann der Satz „Zahnrad {n}: Der Stern zeigt nach {Richtung}.“
  - Ist das Rätsel gelöst: „Mit einem tiefen Klicken öffnet sich die Kuppel!“, und das Tor öffnet sich sofort (Felder setzen, `refreshFog`).
- **`openGatesFor`:** Ein Tor mit `afterPuzzle` öffnet sich, wenn `puzzleSolved` wahr ist.

- [ ] **Step 1: Tests**
  - `openGatesFor` mit `afterPuzzle`: zu, dann nach `turnGear`-Folge offen.
  - Karte: Ohne gelöstes Rätsel ist die Kuppel nicht erreichbar, mit gelöstem schon. Geschichtsstein und Stein liegen in der Kuppel.
  - Die Zahnrad-Sätze gibt es in beiden Sprachen.
- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Umsetzen.**
- [ ] **Step 4: `# fail 0`.**
- [ ] **Step 5: Browser.**
  - Mit der Sternkarte hinein, Räder falsch, dann richtig.
  - Kuppel öffnet sich, Zeitschnecke, Stück, Stein.
  - Neu laden: Kuppel offen.
- [ ] **Step 6: Commit**: `Die Sternwarte: Zahnräder nach der Sternkarte`

### Task 6: Abschluss von Plan 4d

- [ ] **Step 1:** Spielfassung `0.9.0`, README, `FILES`. `node --test` → `# fail 0`.
- [ ] **Step 2: Gesamtdurchlauf ohne `?dev`** (8766, harter Neuladen). Format-5-Stand mit allen Steinen auf Level 40.
  1. Die Aufträge 6, 7 und 8 erledigen.
  2. Mit der Nussschale auf beide Inseln, mit den Eiskufen in die Eisgrotte (Gleiten), mit der Sternkarte in die Sternwarte (Zahnräder).
  3. Das Buch zeigt die Plätze 25 bis 30 als gesehen oder besiegt. Das Tagebuch zeigt alle 8 Aufträge und 6 Geheimstücke.
  4. Neu laden: alles da. Prüfmodus für die neuen Texte. Ein Duell in der Welt mit Rückkehr.
- [ ] **Step 3: Commit**: `Plan 4d abschließen: Spielfassung 0.9.0 und README`
