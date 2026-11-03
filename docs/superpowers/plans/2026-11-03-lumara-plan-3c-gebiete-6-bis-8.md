# Lumara · Plan 3c: Uhrwerkruinen, Nordlichtsee, Sternenwiese und die Karte – Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hinter den Windklippen geht die Reise durch die letzten drei Gebiete weiter: Uhrwerkruinen, Nordlichtsee und Sternenwiese, jedes mit Hüterin oder Hüter, Bewohnern und drei wilden Arten. Nach dem achten Sieg führt ein Pfad von der Sternenwiese zurück in die Bucht, und der Ring der Insel ist geschlossen. Im Menü gibt es eine Karte der Insel.

**Architecture:**
- Die drei Gebiete sind Karten wie die aus Plan 3b (`js/world/maps/*.js`). Die Systeme aus Plan 3a und 3b tragen sie ohne Umbau: Kartenverbund, Tore, Leuchtsteine, Futter, Steine, Zettel, Zierobjekte, Teilchen und Zeitdruck.
- Neu für die Welt:
  - Tore, die sich erst nach einem bestimmten Sieg öffnen (`afterStone`), für den Pfad zwischen Sternenwiese und Bucht
  - das Höhlentor am Berg, dessen acht Fassungen mit den Leuchtsteinen aufleuchten. Die Höhle selbst bleibt zu (Finale).
- Die Karte im Menü ist eine reine Funktion `islandMap(state, pack)` plus eine Menüseite. Sie zeigt den Ring aus Design 5.2.
- Kein neues Spielstand-Format: Format 3 bleibt.

**Tech Stack:** wie Plan 1 bis 3b, ohne neue Bausteine.

**Spec:** `docs/superpowers/specs/2026-11-01-lernwelt-rpg-design.md` (im Folgenden „Design“). Vorgänger:
- `docs/superpowers/plans/2026-11-03-lumara-plan-3b-gebiete-3-bis-5.md` („Plan 3b“)
- dazu Plan 1, 2 und 3a

**Umfang:** Design 17, Schritt 5, für die Gebiete 6 bis 8:
- die Gebiete selbst (5.2, 5.3, 5.6: 2 bis 4 Bewohner je Gebiet)
- der Pfad von der Sternenwiese hinunter zur Bucht nach dem Sieg über Trainer 8, und das Höhlentor mit acht Fassungen (5.2)
- wilde Arten (6.4: 2 häufige, 1 seltene je Gebiet)
- Trainer 6 bis 8 mit 30, 25 und 20 s pro Frage (7.4)
- Geschichtsstücke für die Gebiete 6 bis 8 (5.5). Das letzte verrät Morrows Namen (5.4).
- Teilchen und Wetter (5.3)
- die Karte im Menü, „Gebiete im Nebel grau“ (13)
- Beispielpaket mit den Themen 6 bis 8 (10.5)
- die Kleinigkeiten aus der Abschlussprüfung von Plan 3b

**Bewusst noch nicht in diesem Plan:**
- Aufträge, Schlüsselgegenstände, geheime Orte und das Wesen-Buch: Plan 4. Die Karten lassen den Platz dafür aber schon frei:
  - Die Sternwarte in den Uhrwerkruinen ist zu sehen, aber nicht erreichbar.
  - Die Eisgrotte am Nordlichtsee ist zu sehen, aber nicht erreichbar.
- Höhle, Morrow als Endgegner, veränderte Welt, Revanchen, Leuchtturm-Aufstieg: Finale (Design 17, Schritt 7). Das Höhlentor bleibt zu, auch wenn alle acht Fassungen leuchten.
- Musik und Ton: Plan 6

**Arbeitszweig:** `feature/gebiete-6-8`, abgezweigt von `feature/gebiete` (PR #4 ist noch offen). Erster Commit ist dieser Plan.

## Global Constraints

- Die Global Constraints aus Plan 1 bis 3b gelten weiter, vor allem:
  - keine Abhängigkeiten, alles im Code gezeichnet
  - Spieltexte auf Deutsch, Bezeichner englisch
  - Zahlen in `js/config.js`
  - Tests mit `node --test` und `# fail 0`
  - Commit-Nachrichten auf Deutsch mit `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- **Spielstände:** Das Format bleibt 3. Die Fixtures `tests/fixtures/spielstand-v1.*`, `-v2.*` und `-v3.*` bleiben unverändert und laden weiter. An der Karte der Bucht dürfen sich nur Felder ändern, die vorher blockiert waren, damit jede gespeicherte Position gültig bleibt.
- **Zeitdruck (Design 7.4):** Trainer 6 hat 30 s, Trainer 7 hat 25 s, Trainer 8 hat 20 s, mit den Faktoren aus Plan 3b. Die Werte stehen schon in `CONFIG.trainers`.
- **Barrierefreiheit:**
  - Bei „Bewegung reduzieren“ stehen Zahnräder, Nordlicht und Dampf still, Sternschnuppen fallen nicht, und es gibt höchstens ein Viertel der Teilchen.
  - Nichts blinkt öfter als dreimal pro Sekunde (Design 14). Glimmen und Funken bleiben bei höchstens 1 Hz.
  - Die Karte im Menü zeigt „im Nebel“ mit Text und Farbe zusammen.
- **Spieltexte** (Bewohner, Schilder, Inschriften) sind kindgerecht, ohne Gewalt und je Zeile höchstens etwa 90 Zeichen lang.
- **Morrows Name** kommt genau einmal vor: im letzten Geschichtsstück der Sternenwiese, `STORY[8][2]` (Design 5.4, 5.5).
- **Gebaute Gebiete:** `CONFIG.world.builtAreas` steigt mit den Karten-Tasks auf 6, 7 und 8.
- **Spielfassung** am Ende: `0.5.0` an allen drei Stellen. Neue Dateien kommen in `FILES` in `sw.js`.

## Review Focus

1. **Der Pfad zwischen Sternenwiese und Bucht:** Er ist von beiden Seiten zu, solange Trainer 8 nicht besiegt ist oder das Paket weniger als 8 Trainer hat. Nach dem Sieg ist er von beiden Seiten offen. Wer nach einem Paketwechsel auf dem Pfad steht, sitzt nicht im Nebel fest. → Tests in Task 2 und Task 8.
2. **Reisemenü mit bis zu sieben Zielen:** Es passt auf ein iPad im Querformat und auf ein Handy im Hochformat. Jeder Knopf bleibt erreichbar und mindestens 48 px hoch. → Task 9, im Browser.
3. **Karte im Menü mit einem Paket mit weniger Trainern oder mit Steinen aus einem anderen Paket:** Im Nebel ist, was mit diesem Paket nicht offen ist, auch wenn der Stein leuchtet. „Du bist hier“ stimmt nach jeder Reise und nach einem Umzug durch Ilvy. → Tests in Task 9.
4. **Spielstände und Positionen in der Bucht** aus den Fassungen 0.2 bis 0.4 bleiben gültig, obwohl die Bucht einen neuen Pfad bekommt. → Test in Task 2.
5. **Eine Karte mit zwei Nebelschildern (die Bucht):** Der Satz nach dem Sieg und die Leuchtstein-Szene nehmen das Schild, dessen Tor zu diesem Trainer gehört, nicht einfach das erste. → Test in Task 2.

---

## Dateistruktur (neu und geändert)

```
js/config.js                 world.builtAreas 5 → 8
js/items/stones.js           Fundtabelle auch nach ZEITDRUCK
js/world/notes.js            Belohnungstabelle auch nach ZEITDRUCK
js/world/network.js          + ruinen, see, wiese in MAPS; Tore mit afterStone; npcLines mit linesNoClock
js/world/fogEdge.js          + fogSignFor(def, trainerNumber)
js/world/caveGate.js         neu: Texte und Fassungen des Höhlentors
js/world/islandMap.js        neu: die Karte der Insel als Daten
js/world/maps/ruinen.js, see.js, wiese.js   neu
js/world/maps/bucht.js       + Nebeltor und Pfad im Osten zur Sternenwiese
js/world/maps/klippen.js     + Ausgang nach Osten in die Ruinen
js/world/maps/duenen.js, klippen.js   Talia und Tamo mit linesNoClock
js/duel/duel.js              kein Füttern, solange ein Zeitstein wirkt
js/ui/duelPanel.js           Füttern-Knopf nach Zeitstein gesperrt; Zeitbalken sticky
js/ui/dialog.js              Auswahl mit vielen Einträgen in zwei Spalten
js/scenes/duel.js            feed.enabled als Funktion; Probefrage ohne Rückfall
js/scenes/worldEvents.js     Nebelschild je Trainer, Höhlentor, Schutz für leere Funde, ZEITDRUCK an Funde und Zettel
js/scenes/world.js           + Anker für Funken, Zeichnen der neuen Teilchen
js/menu/mapPage.js           neu: Menüseite „Karte“
js/menu/menu.js              + Karte zwischen Rucksack und Tagebuch
js/data/species.js           + neun Arten, AREA_WILD[6..8], TRAINER_CREATURES[6..8]
js/data/story.js             + STORY[6], STORY[7], STORY[8]
js/gfx/art/tiles.js          + Kacheln, Requisiten und Höhlentor
js/gfx/art/characters.js     + trainer6 bis trainer8 und acht Bewohner
js/gfx/art/creatures.js      + zwölf Bilder (neun Arten, drei Stufe-2-Formen)
js/gfx/arena.js              + Ruinen-, See- und Wiesenarena
js/gfx/particles.js          + spark, steam, snow, aurora, fallingstar, glimmer
css/spiel.css                Karte, zweispaltige Auswahl, sticky Zeitbalken
pakete/englisch-6-beispiel.txt   + Trainer 6 bis 8, weitere Zettel
tests/…                      je Task
```

## Gemeinsame Schnittstellen

```js
// Tore (Task 2): wie bisher, dazu afterStone. Offen ist ein Tor, wenn das Gebiet dahinter offen ist
// und, falls angegeben, der Stein afterStone leuchtet.
{ id, leadsTo, x, y, w, h, ground, afterStone?: number }

// Nebelschild eines Trainers (Task 2): das Schild mit gate === trainerNumber, sonst null
fogSignFor(def, trainerNumber) → sign | null

// Höhlentor (Task 8)
caveGateLines(lit: number) → string[]     // lit = Anzahl entzündeter Leuchtsteine, 0 bis 8

// Karte der Insel (Task 9), Ring wie Design 5.2
islandMap(state, pack) → {
  areas: [{ area, name, col, row, open: boolean, lit: boolean, here: boolean }],   // nach area sortiert
  cave: { col: 2, row: 3, lit: number },
}

// Funde und Zettel (Task 1): Zeitsteine nur ab Gebiet 4 und nicht bei ZEITDRUCK: aus
rollStone(state, rng, area = 1, timePressure = 'normal')
takeFind(state, key, rng, area = 1, timePressure = 'normal')
stepFind(state, rng, area = 1, timePressure = 'normal')
solveNote(state, key, area, correct, rng, timePressure = 'normal')
```

---

### Task 1: Kleinigkeiten aus der Abschlussprüfung von Plan 3b

**Files:**
- Modify: `js/items/stones.js`, `js/world/notes.js`, `js/scenes/worldEvents.js`, `js/duel/duel.js`, `js/ui/duelPanel.js`, `js/scenes/duel.js`, `js/world/network.js` (`npcLines`), `js/world/maps/duenen.js` (Talia), `js/world/maps/klippen.js` (Tamo), `css/spiel.css`
- Test: `tests/stones.test.js`, `tests/notes.test.js`, `tests/duel.test.js`, `tests/network.test.js`

**Interfaces:**
- Produces:
  - Funde und Zettel wie im Block „Gemeinsame Schnittstellen“. Die Tabelle mit Zeitsteinen gilt, wenn `area >= CONFIG.time.fromArea` und `timePressure !== 'aus'`.
  - `duel.canFeed()` ist `false`, solange `frozen` gilt.
  - `ctx.feed = { show, enabled: () => boolean }` (vorher ein Wert). Das Antwortfeld fragt `enabled()` beim Zeichnen und nach jedem Zeitstein neu ab.
  - `npcLines(o, state, area, pack)`: Hat das Paket `timePressure === 'aus'` und der Bewohner `linesNoClock`, ersetzen diese `lines`. `linesLit` und `linesOpen` bleiben, wie sie sind.

- [ ] **Step 1: Tests schreiben**

```js
// tests/stones.test.js
test('Mit ZEITDRUCK: aus gibt es keine Zeitsteine, mit lang schon', () => {
  assert.equal(rollStone(s0(), seq(0.95), 4, 'aus'), 'life');
  assert.equal(rollStone(s0(), seq(0.95), 4, 'lang'), 'time');
  assert.equal(stepFind(s0(), seq(0, 0.95), 5, 'aus'), 'life');
});
// tests/notes.test.js
test('Zettel mit ZEITDRUCK: aus bringen keinen Zeitstein', () => {
  assert.equal(solveNote(s0(), 'duenen:1,1', 4, true, seq(0, 0.95), 'aus').item, 'life');
});
// tests/duel.test.js
test('Solange ein Zeitstein wirkt, wird nicht gefüttert', () => {
  const d = timed(); d.ask(); d.freezeTime();
  assert.equal(d.canFeed(), false); assert.equal(d.feed(2), 0); assert.equal(d.state, 'question');
});
// tests/network.test.js
test('Bewohner ohne Uhr: linesNoClock bei ZEITDRUCK: aus', () => {
  const o = { lines: ['Uhr!'], linesNoClock: ['ohne Uhr'], linesLit: ['lit'] };
  assert.deepEqual(npcLines(o, st([]), 4, { ...pack(5), timePressure: 'aus' }), ['ohne Uhr']);
  assert.deepEqual(npcLines(o, st([]), 4, { ...pack(5), timePressure: 'normal' }), ['Uhr!']);
  assert.deepEqual(npcLines(o, st([4]), 4, { ...pack(4), timePressure: 'aus' }), ['lit']);
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL (die vier neuen Tests).
- [ ] **Step 3: Umsetzen**
  - **Funde und Zettel:** wie im Interfaces-Block. `worldEvents` übergibt `game.pack.data.timePressure`.
  - **Füttern:** In `duelPanel` wird der Füttern-Knopf nach einem Zeitstein mit `feed.enabled()` neu gesperrt.
  - **Talia und Tamo** bekommen `linesNoClock`: dieselben Sätze, aber ohne Uhr und ohne Zeitstein.
  - **`foundStone(item)`** tut bei `item == null` nichts.
  - **Zeitbalken:** `.timebar` bekommt `position: sticky; top: 0; z-index: 1`. So bleibt er sichtbar, wenn das Panel bei offener iPad-Tastatur scrollt.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Im Browser prüfen**
  - Duell gegen Trainer 4: Zeitstein einsetzen. Danach ist „Füttern“ gesperrt.
  - Paket mit `ZEITDRUCK: aus`: Talia spricht nicht von einer Uhr.
- [ ] **Step 6: Commit**: `git commit -m "Kleinigkeiten aus Plan 3b: Zeitsteine bei ZEITDRUCK aus, Füttern nach Zeitstein, Bewohner ohne Uhr"`

---

### Task 2: Tore, die erst nach einem Sieg aufgehen, und der Pfad im Osten der Bucht

**Files:**
- Modify: `js/world/network.js` (`openGatesFor`), `js/world/fogEdge.js` (`fogSignFor`), `js/scenes/worldEvents.js` (`afterStoneLit`, `afterWinLines`), `js/world/maps/bucht.js`
- Test: `tests/network.test.js`, `tests/fogEdge.test.js`, `tests/migrate.test.js`

**Interfaces:**
- Produces:
  - **`openGatesFor`:** Ein Tor ist offen, wenn `areaOpen(state, pack, g.leadsTo)` gilt und, falls angegeben, `state.stones.includes(g.afterStone)`.
  - **`fogSignFor(def, trainerNumber)`** wie im Block „Gemeinsame Schnittstellen“. `afterStoneLit` und `afterWinLines` nutzen es statt „erstes Nebelschild der Karte“.
  - **Bucht:**
    - Die Felder `x = 38..39`, `y = 5..8` werden von `T` zu `%`. Sonst ändert sich an den Zeilen nichts.
    - Neues Tor `{ id: 'ost', leadsTo: 8, afterStone: 8, x: 38, y: 5, w: 2, h: 4, ground: 'path' }`. Der Ausgang dahinter kommt in Task 8.
    - Neues Nebelschild bei `(37, 9)`:
      - `{ type: 'sign', role: 'fogEdge', gate: 8, leadsTo: 8, leadsToName: 'die Sternenwiese' }`
      - `lines: ['Ein steiler Pfad führt nach oben, doch der Nebel ist zu dicht.', 'Man sagt, er weicht erst, wenn der letzte Leuchtstein wieder leuchtet.']`
      - `linesOpen: ['Osten: Sternenwiese', 'Der Nebel hat sich zurückgezogen. Der Pfad ist frei.']`

- [ ] **Step 1: Tests schreiben**

```js
// tests/network.test.js
test('Tor mit afterStone: erst offen, wenn der Stein leuchtet und das Gebiet dahinter offen ist', () => {
  const def = { gates: [{ id: 'x', leadsTo: 2, afterStone: 3 }] };
  assert.deepEqual(openGatesFor(def, st([1]), pack(3)), []);
  assert.deepEqual(openGatesFor(def, st([1, 3]), pack(3)), ['x']);
  assert.deepEqual(openGatesFor(def, st([1, 3]), pack(1)), []);   // Gebiet 2 mit diesem Paket im Nebel
});
test('Bucht: Der Pfad im Osten bleibt vor Stein 8 im Nebel', () => {
  assert.deepEqual(openGatesFor(BUCHT, st([1, 2, 3, 4, 5, 6, 7]), pack(8)), ['nord']);
});
// tests/fogEdge.test.js (den Test „die Bucht hat genau ein Nebelschild“ umstellen)
test('Die Bucht hat zwei Nebelschilder; jeder Trainer hat sein eigenes', () => {
  assert.deepEqual(BUCHT.objects.filter(o => o.role === 'fogEdge').map(o => [o.gate, o.leadsTo]), [[1, 2], [8, 8]]);
  assert.equal(fogSignFor(BUCHT, 1).leadsTo, 2);
  assert.equal(fogSignFor(BUCHT, 8).leadsTo, 8);
  assert.equal(fogSignFor(BUCHT, 5), null);
});
// tests/migrate.test.js
test('Der neue Pfad der Bucht macht keine gespeicherte Position ungültig', () => {
  const m = createMap(BUCHT);
  for (const [x, y] of [[22, 8], [BUCHT.spawn.x, BUCHT.spawn.y], [BUCHT.respawn.x, BUCHT.respawn.y]]) assert.ok(m.canEnter(x, y));
  for (let y = 5; y <= 8; y++) for (const x of [38, 39]) assert.equal(m.tileAt(x, y), 'fog');
  assert.equal(migrateState(structuredClone(SPIELSTAND_V1)).state.position.map, 'bucht');
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Umsetzen** wie im Interfaces-Block.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Im Browser prüfen**
  - In der Bucht ist der Nebel im Osten zu sehen. Das Schild sagt „Ein steiler Pfad führt nach oben …“.
  - Maren nennt nach dem Sieg weiter den Flüsterwald.
- [ ] **Step 6: Commit**: `git commit -m "Tore nach einem Sieg und der Pfad im Osten der Bucht"`

---

### Task 3: Beispielpaket – Themen 6 bis 8

**Files:**
- Modify: `pakete/englisch-6-beispiel.txt`
- Test: `tests/pakete.test.js`

**Interfaces:**
- Produces:
  - Das Beispielpaket hat die Trainer 1 bis 8 und mindestens 24 Zettel.
  - Die `KENNUNG` bleibt `englisch6-beispiel`.
  - Der Teilpaket-Hinweis entfällt.

- [ ] **Step 1: Tests anpassen**

```js
// Test „lädt ohne Fehler“: warnings jetzt []
test('Beispielpaket: Trainer 1 bis 8 mit den Themen aus Design 10.5', () => {
  const p = parsePack(read('englisch-6-beispiel.txt')).pack;
  assert.deepEqual(p.trainers.map(t => t.name), ['Maren', 'Rowan', 'Hazel', 'Karim', 'Skye', 'Otto', 'Freya', 'Luna']);
  assert.ok(p.notes.length >= 24);
});
```
  Der bestehende Test für die Trainer 3 bis 5 (mindestens 22 Fragen, mindestens 6 je Form, HALLO 2 bis 3, SIEG, NIEDERLAGE, REVANCHE) gilt jetzt für die Trainer 3 bis 8.

- [ ] **Step 2: `node --test tests/pakete.test.js`.** Erwartet: FAIL.
- [ ] **Step 3: Paket schreiben** (Claude). Englisch auf Niveau A2, im Stil der Trainer 1 bis 5:
  - **Trainer 6, Otto** (Erfinder mit Lupenbrille und Werkzeuggürtel): Simple past der unregelmäßigen Verben und Zeitangaben (*yesterday, last week, ago*)
  - **Trainer 7, Freya** (Eisfischerin im Pelzmantel): Zukunft mit *going to* und *will*
  - **Trainer 8, Luna** (Sternendeuterin mit Fernrohr): Modalverben (*can, must, mustn't, needn't*) und Fragewörter
  - Je Trainer mindestens 22 Fragen: mindestens 6 Auswahl, 6 Eintippen und 6 Satzbau. Bei der Auswahl darf keine falsche Antwort auch richtig sein (Lehre aus „Preis/prize“ in Plan 3b).
  - 3 neue Zettel zu den Themen 6 bis 8
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`, das Paket ohne Fehler und ohne Hinweis.
- [ ] **Step 5: Commit**: `git commit -m "Beispielpaket: Themen 6 bis 8"`

---

### Task 4: Kacheln, Requisiten und Teilchen der Gebiete 6 bis 8

**Files:**
- Modify: `js/gfx/art/tiles.js`, `js/world/map.js`, `js/scenes/world.js`, `js/gfx/particles.js`
- Test: `tests/tiles.test.js`, `tests/map.test.js`, `tests/particles.test.js`

**Interfaces:**
- Produces:
  - **Neue Kacheln** (16 × 16), dazu ihre Begehbarkeit in `js/world/map.js`:

    | Gebiet | begehbar | blockiert | hohes Gras |
    |---|---|---|---|
    | Ruinen | `cobble` (Pflaster) | `canal` (Kanalwasser, 2 Bilder), `ruinwall` (Mauerrest) | `ivy` (Efeu, 2 Bilder) |
    | See | `snow`, `ice` (Eis des Sees) | `icewater` (offenes Wasser, 2 Bilder), `snowpine` (verschneite Tanne, Überlagerung) | `snowgrass` (2 Bilder) |
    | Wiese | `nightgrass` | `nightrock` (Felsblock, Überlagerung), `nightcliff` (Felskante) | `startall` (Sternengras, 2 Bilder) |

    - Brücken über Kanäle sind der vorhandene `pier`.
    - `GROUNDS` bekommt `cobble`, `snow`, `ice` und `nightgrass`.
    - `canal` und `icewater` wechseln wie Wasser alle 600 ms das Bild.
  - **Neue Requisiten**, von unten gezeichnet:
    - `gear0`, `gear1` (16 × 32, Zahnrad auf einem Pfosten, zwei Stellungen)
    - `observatory` (16 × 48, Sternwarte mit Kuppel)
    - `icecave` (16 × 32, Eingang der Eisgrotte)
    - `tent` (16 × 32, Fischerzelt)
  - **Neues Gebäude** `BUILDINGS.cavegate` (48 × 48): Tor im Fels mit acht leeren Fassungen in einem Bogen. Die Lage der Fassungen steht in `CAVE_SOCKETS` (8 Punkte `[x, y]` im Bild), exportiert aus `js/gfx/art/tiles.js`.
  - **Neue Teilchen:**
    - `PARTICLE_LIMITS += { spark: 10, steam: 6, snow: 16, aurora: 3, fallingstar: 2, glimmer: 12 }`
    - `spark`: an Ankern (die Zahnräder der Karte), kurz und hell, steigt auf
    - `steam`: blasse Wölkchen, steigen langsam auf
    - `snow`: Flocken, fallen mit leichtem Taumeln
    - `aurora`: drei lange, weiche Bänder oben im Bild, die sich langsam wellen
    - `fallingstar`: kurzer schräger Strich, schnell. Bei „Bewegung reduzieren“ entstehen keine.
    - `glimmer`: Punkte im Gras, glimmen mit höchstens 1 Hz
    - Bei „Bewegung reduzieren“ stehen `aurora` und `steam` still.
    - `world.js` sammelt die Anker für `spark` aus allen Zierobjekten mit `prop === 'gear'`.
  - **Farbstimmung** (Design 5.3 und 14, eigene Palette):
    - Ruinen: Messing und Kupfer, grünlicher Stein, dunkles Kanalwasser
    - See: Weiß, Eisblau, Tannengrün, Nordlicht in Grün und Violett
    - Wiese: Nachtblau, Sternengold, dunkles Wiesengrün

- [ ] **Step 1: Tests schreiben**

```js
// tests/tiles.test.js
test('Kacheln der Gebiete 6 bis 8: 16 × 16, bekannte Farben, richtige Bildzahl', () => {
  const frames = { cobble: 1, canal: 2, ruinwall: 1, ivy: 2, snow: 1, ice: 1, icewater: 2, snowpine: 1, snowgrass: 2, nightgrass: 1, nightrock: 1, nightcliff: 1, startall: 2 };
  // wie in Plan 3b: Bildzahl, parseSprite, 16 × 16
  for (const [k, h] of Object.entries({ gear0: 32, gear1: 32, observatory: 48, icecave: 32, tent: 32 })) { /* Höhe h, Breite 16 */ }
  assert.equal(parseSprite('cavegate', BUILDINGS.cavegate).w, 48);
  assert.equal(CAVE_SOCKETS.length, 8);
  assert.ok(CAVE_SOCKETS.every(([x, y]) => x >= 0 && x < 48 && y >= 0 && y < 48));
});
// tests/map.test.js
test('Begehbar, blockiert und hohes Gras der Kacheln 6 bis 8', () => {
  for (const k of ['cobble', 'snow', 'ice', 'nightgrass']) assert.ok(WALKABLE.has(k), k);
  for (const k of ['canal', 'ruinwall', 'icewater', 'snowpine', 'nightrock', 'nightcliff']) assert.ok(BLOCKED.has(k), k);
  for (const k of ['ivy', 'snowgrass', 'startall']) { assert.ok(TALL_GRASS.has(k), k); assert.ok(WALKABLE.has(k), k); }
});
// tests/particles.test.js
test('Teilchen 6 bis 8: Grenzen, ein Viertel, still und ohne Sternschnuppen bei Bewegung reduzieren', () => {
  // wie in Plan 3b für steam, snow, aurora, fallingstar, glimmer: > 0 und ≤ Grenze; reduziert ≤ ceil(Grenze / 4)
  const f = createParticles(['fallingstar'], { rng: createRng(3), reducedMotion: true });
  for (let i = 0; i < 900; i++) f.update(16, { x: 0, y: 0 });
  assert.equal(count(f), 0);
  const s = createParticles(['spark'], { rng: createRng(4), reducedMotion: false, anchors: { spark: [[40, 40]] } });
  for (let i = 0; i < 300; i++) s.update(16, { x: 0, y: 0 });
  assert.ok(count(s) > 0); s.each(q => assert.ok(Math.abs(q.x - 40) <= 8 && q.y <= 48));
  const a = createParticles(['aurora'], { rng: createRng(5), reducedMotion: true });
  for (let i = 0; i < 200; i++) a.update(16, { x: 0, y: 0 });
  const before = []; a.each(q => before.push([q.x, q.y, q.phase]));
  for (let i = 0; i < 100; i++) a.update(16, { x: 0, y: 0 });
  const after = []; a.each(q => after.push([q.x, q.y, q.phase]));
  assert.deepEqual(after.slice(0, before.length), before);
  const g = createParticles(['glimmer', 'spark'], { rng: createRng(6), reducedMotion: false, anchors: { spark: [[40, 40]] } });
  for (let i = 0; i < 300; i++) g.update(16, { x: 0, y: 0 });
  g.each(q => assert.ok((q.blinkHz ?? 0) <= 1, q.kind));
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Kacheln, Requisiten, Höhlentor und Teilchen umsetzen**, wie im Interfaces-Block.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Im Browser prüfen.**
  - Eine Testkarte in der Konsole zeigt alle neuen Kacheln, Requisiten, das Höhlentor und die Teilchen, wie in Plan 3b.
  - Das Zahnrad dreht sich und steht bei „Bewegung reduzieren“ still.
- [ ] **Step 6: Commit**: `git commit -m "Kacheln, Requisiten und Teilchen für Ruinen, See und Wiese"`

---

### Task 5: Wesen und Arenen der Gebiete 6 bis 8

**Files:**
- Modify: `js/data/species.js`, `js/gfx/art/creatures.js`, `js/gfx/arena.js`, `js/scenes/duel.js` (`makeProbeSetup` ohne Rückfall)
- Test: `tests/species.test.js`, `tests/arena.test.js`

**Interfaces:**
- Produces:
  - **Arten** (Felder wie in Plan 3b):

    | Gebiet | häufig | häufig | selten |
    |---|---|---|---|
    | 6 Ruinen | `zahnmaus` f: Zahnmaus → Uhrwerkmaus | `dampfkobold` m: Dampfkobold | `messingeule` f: Messingeule |
    | 7 See | `frostrobbe` f: Frostrobbe → Gletscherrobbe | `flockenhase` m: Flockenhase | `aurorafink` m: Aurorafink |
    | 8 Wiese | `schnuppling` m: Schnuppling → Kometling | `nachtschaf` n: Nachtschaf | `sternhirsch` m: Sternhirsch |

  - `TRAINER_CREATURES[6] = { species: 'zahnmaus', stage: 2 }`, `[7] = { species: 'frostrobbe', stage: 2 }`, `[8] = { species: 'schnuppling', stage: 2 }`
  - Bilder: Stufe 1 hat 32 × 32, Stufe 2 hat 40 × 40. Jede Art hat eine eigene Silhouette in den Farben ihres Gebiets.
  - `ARENAS[6]` (Zahnräder im Hintergrund, Kanal, Plattformen aus Pflaster), `ARENAS[7]` (Eisfläche, Nordlicht am Himmel), `ARENAS[8]` (Nachthimmel mit Mond und Sternen, Plattformen aus Gras). Bei „Bewegung reduzieren“ stehen sie still.
  - `makeProbeSetup` nimmt immer `TRAINER_CREATURES[n]` und `ARENAS[n]`. Den Rückfall auf Trainer 1 gibt es nicht mehr.

- [ ] **Step 1: Tests schreiben**
  - Der Test für die Gebiete 3 bis 5 aus Plan 3b wird auf `[3, 4, 5, 6, 7, 8]` erweitert, mit den Tabellen oben.
  - Dazu `wildName('nachtschaf', 1, 'a') === 'Ein wildes Nachtschaf'` und `wildName('messingeule', 1, 'the') === 'Die wilde Messingeule'`.
  - Die beiden Arena-Tests gelten für die Gebiete 1 bis 8, und `ARENAS` hat 7 verschiedene Funktionen (2 bis 8).
- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Umsetzen.**
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Im Browser prüfen**
  - `?galerie` zeigt alle zwölf neuen Bilder.
  - Die Probefrage für Trainer 6 bis 8 auf der Lehrkraft-Seite zeigt die richtige Arena, das richtige Wesen und 30, 25 bzw. 20 s bei der Auswahl.
- [ ] **Step 6: Commit**: `git commit -m "Wesen und Arenen für Ruinen, See und Wiese"`

---

### Task 6: Die Uhrwerkruinen

**Files:**
- Create: `js/world/maps/ruinen.js`
- Modify: `js/world/maps/klippen.js` (Ausgang nach Osten), `js/world/network.js` (`MAPS`), `js/data/story.js` (`STORY[6]`), `js/gfx/art/characters.js`, `js/config.js` (`builtAreas: 6`), `sw.js`
- Test: `tests/ruinen.test.js`, `tests/network.test.js`, `tests/story.test.js`

**Interfaces:**
- Consumes: Kacheln, Requisiten und Teilchen (Task 4), Arten (Task 5)
- Produces:
  - `RUINEN`:
    - `id: 'ruinen'`, `name: 'Uhrwerkruinen'`, `genitive: 'der Uhrwerkruinen'`, `area: 6`, 40 × 30, `ground: 'cobble'`
    - `particles: ['spark', 'steam']`
  - **Verbindungen:**
    - Klippen: Ausgang `{ x: 39, y: 13, w: 1, h: 4, to: 'ruinen', at: { x: 1, y: 14, dir: 'right' } }` in den Zellen des Tors `ost`
    - Ruinen: Ausgang `{ x: 0, y: 13, w: 1, h: 4, to: 'klippen', at: { x: 38, y: 14, dir: 'left' } }`, dazu `spawn: { x: 1, y: 14, dir: 'right' }`
    - Ruinen: Tor `sued` mit `{ x: 18, y: 28, w: 4, h: 2, leadsTo: 7, ground: 'cobble' }`. Der Ausgang dahinter kommt in Task 7.
  - **Objekte:**
    - Leuchtstein 6, `respawn` gleich `beaconFront(RUINEN, 6)`
    - Trainer 6 mit `sprite: 'trainer6'` und `afterWin: 'Dein Leuchtstein strahlt. Hörst du? Alle Zahnräder ticken wieder im Takt.'`
      - Er blickt über eine Brücke (`pier`) über einen Kanal.
    - 3 Bewohner, jeweils mit `lines` und `linesLit`:
      - **Greta**, Mechanikerin: Zahnräder, die sich noch drehen, Kanäle
      - **Pino**, Fährmann ohne Boot: Die Sternwarte steht auf einer Insel im Kanal, hin kommt man nur mit einem Boot.
      - **Bo**, Kind: Funken an den Zahnrädern, Zettelsteine
    - mindestens 3 Zettelsteine, 2 Sträucher, 3 Fundstellen im Efeu, mindestens 3 Zahnräder (`deco`, `prop: 'gear'`, `anim: true`)
    - die **Sternwarte** (`deco`, `prop: 'observatory'`, `id: 'sternwarte'`) auf einer Insel im Kanal, sichtbar und unerreichbar (Platz für Plan 4)
    - Ortsschild
    - Nebelschild nach Süden:
      - `{ role: 'fogEdge', gate: 6, leadsTo: 7, leadsToName: 'der Nordlichtsee' }`
      - `linesOpen: ['Süden: Nordlichtsee', 'Der Nebel hat sich zurückgezogen. Der Weg ist frei.']`
  - `STORY[6]`, genau so:
    1. „In der Stadt der Zahnräder bauten die Leute Uhren, die sich alles merkten. Jede Uhr schlug einmal, wenn jemand etwas Neues gelernt hatte.“
    2. „Als der Nebel kam, liefen die Kanäle über, und die Stadt versank. Die Zahnräder drehen sich bis heute, aber niemand weiß mehr, wofür.“
    3. „In der alten Sternwarte zeichnete jemand eine Karte vom Berg. Darauf ist ein Tor mit acht Fassungen zu sehen, eine für jeden Leuchtstein.“
  - **Figuren:** `trainer6` (Lupenbrille über einem Auge, Werkzeuggürtel) sowie `greta`, `pino` und `bo`

- [ ] **Step 1: Tests schreiben**
  - `tests/ruinen.test.js` nach dem Muster von `tests/moor.test.js` aus Plan 3b:
    - erreichbar, Aufwachpunkt, Blickfeld mit `pier`, Stein nicht im Blick
    - Spieltexte höchstens 90 Zeichen, ohne „Morrow“
    - dazu: Die Sternwarte ist unerreichbar, und es gibt mindestens 3 Zahnräder mit `anim`.
  - `tests/network.test.js`:
    - Die Klippen führen nach Osten in die Ruinen und zurück.
    - Mit 5 Trainern auf den Ruinen stehen führt zum Aufwachen auf den Klippen.
    - **Erwartete Umstellungen (mit Ruling):**
      - Der Test „Gebiet 6 ist noch nicht gebaut“ prüft jetzt `areaOpen(…, 9) === false`.
      - `openGatesFor(MAPS.klippen, Steine 1–5, pack(8))` ergibt `['ost']`.
  - `tests/story.test.js`: Schlüssel `'1'` bis `'6'`, genauer Text von `STORY[6][0]`
- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Karte, Figuren und Texte umsetzen, `builtAreas: 6`.**
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Im Browser prüfen** (`?dev&gebiet=ruinen` und von den Klippen aus)
  - Skye besiegen: Der Weg nach Osten öffnet sich.
  - In den Ruinen sind Funken an den Zahnrädern und Dampf zu sehen.
  - Otto besiegen, mit 30 s pro Frage bei der Auswahl.
  - Das Schild im Süden sagt „Hinter dem Nebel liegt der Nordlichtsee … entsteht gerade“.
- [ ] **Step 6: Commit**: `git commit -m "Die Uhrwerkruinen: Kanäle, Zahnräder und Otto"`

---

### Task 7: Der Nordlichtsee

**Files:**
- Create: `js/world/maps/see.js`
- Modify: `js/world/maps/ruinen.js` (Ausgang nach Süden), `js/world/network.js`, `js/data/story.js` (`STORY[7]`), `js/gfx/art/characters.js`, `js/config.js` (`builtAreas: 7`), `sw.js`
- Test: `tests/see.test.js`, `tests/network.test.js`, `tests/story.test.js`

**Interfaces:**
- Produces:
  - `SEE`:
    - `id: 'see'`, `name: 'Nordlichtsee'`, `genitive: 'des Nordlichtsees'`, `area: 7`, 40 × 30, `ground: 'snow'`
    - `particles: ['snow', 'aurora']`
  - **Verbindungen:**
    - Ruinen: Ausgang `{ x: 18, y: 29, w: 4, h: 1, to: 'see', at: { x: 19, y: 1, dir: 'down' } }`
    - See: Ausgang `{ x: 18, y: 0, w: 4, h: 1, to: 'ruinen', at: { x: 19, y: 28, dir: 'up' } }`, `spawn: { x: 19, y: 1, dir: 'down' }`
    - See: Tor `sued` mit `{ x: 18, y: 28, w: 4, h: 2, leadsTo: 8, ground: 'snow' }`. Der Ausgang dahinter kommt in Task 8.
  - **Landschaft:**
    - Ein gefrorener See (`ice`) mit Löchern aus offenem Wasser (`icewater`)
    - verschneite Tannen am Ufer
    - ein Fischerzelt (`deco`, `prop: 'tent'`, mit einer Zeile wie ein Schild)
  - **Objekte:**
    - Leuchtstein 7
    - Trainer 7 mit `sprite: 'trainer7'` und `afterWin: 'Dein Leuchtstein strahlt. Sieh nur, das Nordlicht leuchtet heller!'`
      - Sie blickt über das Eis (`ice`).
    - 3 Bewohner, jeweils mit `lines` und `linesLit`:
      - **Sven**, alter Eisfischer: das Zelt, Löcher im Eis, Freya
      - **Mira**, Schneebildhauerin: Die Eisgrotte jenseits des offenen Wassers erreicht nur, wer über Eis gleiten kann.
      - **Ari**, Kind: Nordlicht, Zettelsteine
    - Zettelsteine, Sträucher, Fundstellen im Schneegras und Ortsschild wie in den Ruinen
    - die **Eisgrotte** (`deco`, `prop: 'icecave'`, `id: 'eisgrotte'`) hinter offenem Wasser, sichtbar und unerreichbar (Platz für Plan 4)
    - Nebelschild nach Süden:
      - `{ role: 'fogEdge', gate: 7, leadsTo: 8, leadsToName: 'die Sternenwiese' }`
      - `linesOpen: ['Süden: Sternenwiese', 'Der Nebel hat sich zurückgezogen. Der Weg ist frei.']`
  - `STORY[7]`, genau so:
    1. „Über dem See tanzt das Nordlicht. Die Eisfischer sagen, es sind die Lieder der Leuchtsteine, die der Himmel noch nicht vergessen hat.“
    2. „Unter dem Eis liegen Wörter, die niemand mehr sagt. Wer ganz still ist, hört sie manchmal knistern wie frischen Schnee.“
    3. „Das Wesen im Berg sammelt nicht aus Bosheit. Es ist so lange allein, dass es glaubt, irgendwer müsse sich an all das Vergessene erinnern.“
  - **Figuren:** `trainer7` (Pelzmantel mit heller Kapuze) sowie `sven`, `mira` und `ari`

- [ ] **Step 1: Tests schreiben**
  - `tests/see.test.js` wie in den Ruinen:
    - erreichbar, Aufwachpunkt, Blickfeld mit `ice`, Texte
    - dazu: Die Eisgrotte ist unerreichbar, mindestens 4 Felder `icewater`, und das Zelt hat eine Zeile.
  - `tests/network.test.js`:
    - Die Ruinen führen nach Süden an den See und zurück.
    - Mit 6 Trainern am See stehen führt zum Aufwachen in den Ruinen.
  - `tests/story.test.js`: Schlüssel bis `'7'`, genauer Text von `STORY[7][0]`
- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Umsetzen, `builtAreas: 7`.**
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Im Browser prüfen**
  - Schnee fällt, das Nordlicht wellt sich oben im Bild.
  - Bei „Bewegung reduzieren“ steht das Nordlicht, und es fällt weniger Schnee.
  - Freya besiegen, mit 25 s pro Frage.
  - Das Schild im Süden nennt die Sternenwiese.
- [ ] **Step 6: Commit**: `git commit -m "Der Nordlichtsee: Eis, Nordlicht und Freya"`

---

### Task 8: Die Sternenwiese, das Höhlentor und der Ring

**Files:**
- Create: `js/world/maps/wiese.js`, `js/world/caveGate.js`
- Modify: `js/world/maps/see.js` (Ausgang nach Süden), `js/world/maps/bucht.js` (Ausgang nach Osten), `js/world/network.js`, `js/scenes/worldEvents.js` (Höhlentor), `js/data/story.js` (`STORY[8]`), `js/gfx/art/characters.js`, `js/config.js` (`builtAreas: 8`), `sw.js`
- Test: `tests/wiese.test.js`, `tests/caveGate.test.js`, `tests/network.test.js`, `tests/story.test.js`

**Interfaces:**
- Consumes:
  - `afterStone` und `fogSignFor` (Task 2)
  - `BUILDINGS.cavegate` und `CAVE_SOCKETS` (Task 4)
- Produces:
  - `WIESE`:
    - `id: 'wiese'`, `name: 'Sternenwiese'`, `genitive: 'der Sternenwiese'`, `area: 8`, 40 × 30, `ground: 'nightgrass'`
    - `particles: ['fallingstar', 'glimmer']`
  - **Verbindungen:**
    - See: Ausgang `{ x: 18, y: 29, w: 4, h: 1, to: 'wiese', at: { x: 19, y: 1, dir: 'down' } }`
    - Wiese: Ausgang `{ x: 18, y: 0, w: 4, h: 1, to: 'see', at: { x: 19, y: 28, dir: 'up' } }`, `spawn: { x: 19, y: 1, dir: 'down' }`
    - **Pfad zur Bucht (Design 5.2):**
      - Wiese: Tor `bucht` mit `{ x: 0, y: 20, w: 2, h: 4, leadsTo: 1, afterStone: 8, ground: 'nightgrass' }`
      - Wiese: Ausgang `{ x: 0, y: 20, w: 1, h: 4, to: 'bucht', at: { x: 38, y: 6, dir: 'left' } }`
      - Bucht: Ausgang `{ x: 39, y: 5, w: 1, h: 4, to: 'wiese', at: { x: 1, y: 21, dir: 'right' } }`
  - **Objekte:**
    - Leuchtstein 8
    - Trainer 8 mit `sprite: 'trainer8'` und `afterWin: 'Dein Leuchtstein strahlt. Der Pfad hinunter zur Bucht ist frei.'`
    - 2 Bewohner, jeweils mit `lines` und `linesLit`:
      - **Selma**, Sternsammlerin: Sternschnuppen, Wünsche
      - **Kai**, Hirte der Nachtschafe: das Tor im Berg, die acht Fassungen
    - Zettelsteine, Sträucher, Fundstellen im Sternengras und Ortsschild
    - **Höhlentor:**
      - `{ type: 'building', id: 'hoehlentor', w: 3, h: 3, sprite: 'cavegate', door: { dx: 1, dy: 2 }, onDoor: 'locked' }`, im Nordwesten am Fuß des Bergs
    - Nebelschild am Pfad nach Westen:
      - `{ role: 'fogEdge', gate: 8, leadsTo: 1, leadsToName: 'die Leuchtturmbucht' }`
      - `lines: ['Ein Pfad führt hinunter zur Bucht, doch der Nebel ist zu dicht.', 'Vielleicht weicht er, wenn der Leuchtstein der Wiese wieder leuchtet.']`
      - `linesOpen: ['Westen: Leuchtturmbucht', 'Der Nebel hat sich zurückgezogen. Der Pfad führt hinunter zur Bucht.']`
  - **`caveGateLines(lit)`:**
    - immer zuerst `'Ein großes Tor im Berg mit acht Fassungen.'`
    - bei 0: `'Keine davon leuchtet.'`, bei 1: `'Eine davon leuchtet.'`, bei 2 bis 7: `` `${lit} davon leuchten.` ``
    - bei 0 bis 7 danach: `'Vielleicht öffnet es sich, wenn alle acht Leuchtsteine wieder leuchten.'`
    - bei 8: `'Alle acht leuchten!'`, `'Hinter dem Tor ist es still. Der Weg hinein entsteht gerade.'` und `'In einer der nächsten Spielfassungen kannst du hindurch.'`
    - `worldEvents` zeigt die Zeilen beim Höhlentor (vor dem allgemeinen Gebäude-Handler) mit `lit = state.stones.length`.
    - Über das Torbild zeichnet `worldEvents` mit `afterRender` an den `CAVE_SOCKETS`:
      - für jeden entzündeten Stein n eine Fassung in `CONFIG.beacons.ringColors[n - 1]`
      - die übrigen dunkel
  - `STORY[8]`, genau so:
    1. „Auf der Sternenwiese ist immer Nacht. Fällt ein Stern ins Gras, wünschen sich die Leute, dass nie wieder jemand vergessen wird.“
    2. „Am Rand der Wiese liegt das Tor zur Höhle im Berg. Es öffnet sich erst, wenn alle acht Leuchtsteine wieder leuchten.“
    3. „Das kleine Wesen im Berg hat einen Namen, den alle vergessen haben: Morrow. Wer ihn ausspricht, erinnert sich, und Morrow ist nicht mehr allein.“
  - **Figuren:** `trainer8` (Fernrohr in der Hand, Umhang mit Sternen) sowie `selma` und `kai`

- [ ] **Step 1: Tests schreiben**

```js
// tests/caveGate.test.js
test('Höhlentor: die Zahl der leuchtenden Fassungen, bei acht „entsteht gerade“', () => {
  assert.deepEqual(caveGateLines(0).slice(1), ['Keine davon leuchtet.', 'Vielleicht öffnet es sich, wenn alle acht Leuchtsteine wieder leuchten.']);
  assert.equal(caveGateLines(1)[1], 'Eine davon leuchtet.');
  assert.equal(caveGateLines(5)[1], '5 davon leuchten.');
  assert.deepEqual(caveGateLines(8), ['Ein großes Tor im Berg mit acht Fassungen.', 'Alle acht leuchten!', 'Hinter dem Tor ist es still. Der Weg hinein entsteht gerade.', 'In einer der nächsten Spielfassungen kannst du hindurch.']);
});
// tests/network.test.js
test('Der Ring schließt sich: Pfad zwischen Sternenwiese und Bucht erst nach Stein 8 und nur mit 8 Trainern', () => {
  const all = st([1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(openGatesFor(MAPS.bucht, all, pack(8)), ['nord', 'ost']);
  assert.equal(openGatesFor(MAPS.wiese, all, pack(8)).includes('bucht'), true);
  assert.equal(openGatesFor(MAPS.wiese, st([1, 2, 3, 4, 5, 6, 7]), pack(8)).includes('bucht'), false);
  assert.deepEqual(openGatesFor(MAPS.bucht, all, pack(7)), ['nord']);
  assert.equal(exitAt(MAPS.bucht, 39, 6)?.to, 'wiese');
  assert.equal(exitAt(MAPS.wiese, 0, 21)?.to, 'bucht');
});
test('Auf dem Pfad der Bucht stehen und ein Paket mit 7 Trainern laden: nicht im Nebel festsitzen', () => {
  const r = resolveStart(st([1, 2, 3, 4, 5, 6, 7, 8], { map: 'bucht', x: 38, y: 6, dir: 'right' }), pack(7));
  assert.notDeepEqual([r.map, r.x, r.y], ['bucht', 38, 6]);
});
// tests/story.test.js (den Test „Morrows Name kommt erst später vor“ ersetzen)
test('Morrows Name steht genau einmal, im letzten Stück der Sternenwiese', () => {
  const all = Object.values(STORY).flat();
  assert.deepEqual(all.filter(t => /morrow/i.test(t)), [STORY[8][2]]);
});
```
  - `tests/wiese.test.js` wie in den Ruinen:
    - erreichbar, Aufwachpunkt, Blickfeld, Texte
    - dazu: Das Höhlentor liegt am Rand eines erreichbaren Felds. Mit offenem Tor `bucht` erreicht man den Ausgang nach Westen.
  - `tests/story.test.js`: Schlüssel `'1'` bis `'8'`, genauer Text von `STORY[8][0]`
- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Umsetzen, `builtAreas: 8`.** Ab jetzt gibt es keinen Nebelrand „entsteht gerade“ mehr, nur noch das Höhlentor.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Im Browser prüfen**
  - Sternschnuppen fallen und das Gras glimmt. Bei „Bewegung reduzieren“ fallen keine Sternschnuppen.
  - Am Höhlentor leuchten so viele Fassungen wie Steine, in den Farben der Ringe am Leuchtturm.
  - Luna besiegen, mit 20 s pro Frage. Die Leuchtstein-Szene öffnet den Pfad nach Westen.
  - Den Pfad hinunter laufen: Ankunft in der Bucht am Pfad im Osten.
  - In der Bucht ist der Nebel im Osten weg, das Schild sagt „Osten: Sternenwiese“.
  - Ein Zettel bringt der Reihe nach `STORY[8]` bis zu Morrows Namen.
- [ ] **Step 6: Commit**: `git commit -m "Die Sternenwiese: Höhlentor, Luna und der Pfad zurück zur Bucht"`

---

### Task 9: Die Karte im Menü und ein Reisemenü für viele Ziele

**Files:**
- Create: `js/world/islandMap.js`, `js/menu/mapPage.js`
- Modify: `js/menu/menu.js`, `js/ui/dialog.js` (`choose`), `css/spiel.css`, `sw.js`
- Test: `tests/islandMap.test.js`

**Interfaces:**
- Consumes: `areaOpen`, `MAPS` (network)
- Produces:
  - **`islandMap(state, pack)`** wie im Block „Gemeinsame Schnittstellen“. Lage im Raster mit 3 Spalten × 5 Zeilen, wie Design 5.2:

    | area | 5 | 4 | 6 | 3 | 7 | 2 | 8 | 1 | Berg |
    |---|---|---|---|---|---|---|---|---|---|
    | `[col, row]` | `[2, 1]` | `[1, 2]` | `[3, 2]` | `[1, 3]` | `[3, 3]` | `[1, 4]` | `[3, 4]` | `[2, 5]` | `[2, 3]` |

    - `open` = `areaOpen(state, pack, area)`
    - `lit` = Stein leuchtet
    - `here` = `MAPS[state.position.map].area === area`
    - `cave.lit` = Anzahl entzündeter Steine
  - **`mapPage(game)`**, Titel „Karte“: ein Raster mit 9 Kästen.
    - Jeder Kasten zeigt den Namen des Gebiets und eine Zeile Zustand, immer mit Text:
      - „✦ Leuchtstein leuchtet“
      - „○ Leuchtstein dunkel“
      - „☁ Im Nebel“, dazu grau
    - Wo das Kind gerade ist, steht zusätzlich „● Du bist hier“.
    - Der Berg zeigt „Berg mit Höhle“ und `` `${lit} von 8 Fassungen leuchten` ``.
    - Das Raster hat `role="list"`, jeder Kasten `role="listitem"`.
  - **Menü:** Wesen, Rucksack, Karte, Tagebuch, Einstellungen
  - **`choose`:** Bei mehr als 5 Einträgen bekommt die Liste die Klasse `many`.
    - `.choice.many` zeigt zwei Spalten. Der letzte Eintrag („Hierbleiben“) geht über beide Spalten.
    - Hoch und Runter wandern wie bisher der Reihe nach.

- [ ] **Step 1: Tests schreiben**

```js
// tests/islandMap.test.js
test('Karte: Ring wie Design 5.2, Nebel nach Paket, Steine und „Du bist hier“', () => {
  const s = { ...st([1, 2, 3, 4, 5]), position: { map: 'moor', x: 19, y: 20, dir: 'up' } };
  const m = islandMap(s, pack(3));
  assert.deepEqual(m.areas.map(a => a.area), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(m.areas.filter(a => a.open).map(a => a.area), [1, 2, 3]);   // Stein 4 und 5 leuchten, aber das Paket hat nur 3 Trainer
  assert.deepEqual(m.areas.filter(a => a.lit).map(a => a.area), [1, 2, 3, 4, 5]);
  assert.deepEqual(m.areas.filter(a => a.here).map(a => a.area), [3]);
  assert.deepEqual([m.areas[4].col, m.areas[4].row], [2, 1]);   // Windklippen oben
  assert.deepEqual([m.areas[0].col, m.areas[0].row], [2, 5]);   // Bucht unten
  assert.deepEqual(m.cave, { col: 2, row: 3, lit: 5 });
  assert.equal(m.areas[2].name, 'Pilzmoor');
});
test('Karte: Nach einem Umzug durch Ilvy steht „Du bist hier“ am neuen Ort', () => {
  const s = st([1, 2, 3, 4, 5], { map: 'klippen', x: 20, y: 18, dir: 'up' });
  s.position = resolveStart(s, pack(4));
  assert.deepEqual(islandMap(s, pack(4)).areas.filter(a => a.here).map(a => a.area), [4]);
});
```

- [ ] **Step 2: `node --test tests/islandMap.test.js`.** Erwartet: FAIL (Modul fehlt).
- [ ] **Step 3: `islandMap`, `mapPage`, den Menüeintrag und `choose … many` umsetzen.**
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Im Browser prüfen**
  - Menü → Karte mit dem vollen Paket und mit einem Paket bis Thema 3: Gebiete im Nebel sind grau und tragen „Im Nebel“.
  - Nach einer Reise steht „Du bist hier“ am neuen Ort.
  - Reisemenü mit allen acht Steinen:
    - Im Querformat (1024 × 768) und im Hochformat (390 × 844) sind alle Knöpfe sichtbar, ohne Scrollen, mindestens 48 px hoch.
    - Mit den Pfeiltasten erreicht man jeden Knopf.
- [ ] **Step 6: Commit**: `git commit -m "Karte der Insel im Menü und Reisemenü in zwei Spalten"`

---

### Task 10: Abschluss von Plan 3c

**Files:**
- Modify: `version.json`, `js/version.js`, `sw.js`, `README.md`

- [ ] **Step 1: Spielfassung `0.5.0`** an allen drei Stellen setzen und `FILES` vollständig halten. Erwartet: `node --test` ergibt `# fail 0`.
- [ ] **Step 2: README**
  - Status Plan 3c mit Link auf diesen Plan
  - kurz, was neu ist
  - Die Liste unter `?dev&gebiet=` nennt jetzt alle Gebiete.
- [ ] **Step 3: Gesamtdurchlauf in Chrome ohne `?dev`** mit dem vollständigen Beispielpaket und einem eingespielten Spielstand (Steine 1 bis 5, auf den Klippen):
  1. Nach Osten in die Ruinen, Otto besiegen (30 s).
  2. Nach Süden an den See, Freya besiegen (25 s), eine Frage ablaufen lassen.
  3. Nach Süden auf die Wiese, Luna besiegen (20 s). Den Pfad hinunter in die Bucht laufen.
  4. Neu laden: Alles ist noch da. Zwischen allen acht Steinen reisen. Die Karte zeigt alle acht Gebiete offen und den Berg mit „8 von 8 Fassungen leuchten“.
  5. Auf der Wiese ein Paket mit nur sieben Trainern laden: Ilvy bringt das Kind zum Stein am See. Die Karte zeigt die Wiese im Nebel.
  6. Die Spielstände aus den Fixtures für Format 1, 2 und 3 laden: kein Verlust.
- [ ] **Step 4: Commit**: `git commit -m "Plan 3c abschließen: Spielfassung 0.5.0 und README"`
