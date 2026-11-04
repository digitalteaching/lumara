# Lumara · Plan 5a: Die Höhle, Morrow und die Welt danach – Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:**
- Leuchten alle acht Steine und hat das Paket alle acht Trainer, öffnet sich das Höhlentor.
- Drei Ebenen führen hinunter zu Morrow. Das Endduell hat drei Phasen, und Morrow wechselt dabei die Gestalt.
- Nach dem Sieg sagt das Kind Morrows Namen. Dann löst sich der Nebel auf, die Bewohner sagen neue Sätze, und Morrow wohnt als Freund am Leuchtturm.
- Das Wesen-Buch ist mit den Plätzen 31 bis 33 voll.

**Architecture:**
- **Spielstand Format 6:** `state.finale = { done }` gehört dem Kind und bleibt beim Paketwechsel (10.4). `packs[id].boss` gibt es schon, für „Endgegner mit diesem Paket besiegt“.
- **Endduell:**
  - Die Duell-Zustandsmaschine (`js/duel/duel.js`) bekommt Phasen: `foe.phases`. Ist die Energie in einer Phase leer, füllt sie sich, und die nächste Phase beginnt.
  - Neu ist die Art `kind: 'boss'`. Man kann nicht fliehen, aufgeben geht wie beim Trainer.
  - Die Fragen kommen aus allen Themen (`poolFor` mit `boss`, gibt es schon). Die Uhr läuft wie bei Trainer 8.
- **Höhlenkarten:** `hoehle1` bis `hoehle3` sind eigene Karten.
  - Sie tragen `cave: 1 … 3` und `area: 8`, das ist für Wiederbeleben, wilde Energie und XP wie die Sternenwiese.
  - `mapOfArea` und `islandMap` lassen sie aus, wie die geheimen Orte.
  - Ihre Duelle zeigen eine eigene Arena (`arena: 'cave'`).
- **Die Welt danach:** `npcLines` nimmt nach dem Finale zuerst `linesAfter`. Morrow ist dann ein Bewohner der Bucht vor dem Leuchtturm. In der unteren Ebene steht nur noch ein Kristall.

**Tech Stack:** wie bisher.

**Spec:** `docs/superpowers/specs/2026-11-01-lernwelt-rpg-design.md`. Wichtig sind:
- 5.2, 5.3 (Höhle), 5.4 (Geschichte)
- 6.3 (500 XP), 6.4 (33 Einträge)
- 7.4 (Endgegner: 3 Phasen à 6, 20 s, Level 50)
- 9 (Welt danach), 10.4 (bleibt beim Paketwechsel; Höhle nur mit Paket mit 8 Trainern)
- 11 (Format), 12.1 (Endgegner ja/nein)

Vorgänger: Plan 4d.

**Arbeitszweig:** `feature/finale`, abgezweigt von `feature/geheimnisse` (Plan 4d nach seiner Abschlussprüfung). Der erste Commit ist dieser Plan.

## Global Constraints

- **Alles aus Plan 4c und 4d gilt weiter:**
  - zweisprachig über `t()`/`tr`, `worldLines` und die englischen Tabellen
  - `// i18n-ok` nur für Entwicklertexte
  - Dateien, in denen `t` ein eigener Name ist, importieren `{ t as tr }`
- **Ansprechbar mit echten Tasten:**
  - Alles, was man mit A anspricht (Morrow, der warme Kristall, Echokristalle, Ilvy, Treppen ausgenommen), steht in `tests/faceable.test.js`, mit den neuen Objekttypen in der Liste.
  - Die Figur dreht sich nicht auf der Stelle.
  - Browserprüfungen setzen die Figur nur an den Startplatz und laufen dann mit echten Pfeiltasten.
- **Format 6:**
  - Die Fixtures v1 bis v5 bleiben unverändert und laden weiter.
  - Neu kommt `tests/fixtures/spielstand-v6.{js,txt}` dazu.
  - Die Umwandlung 5 → 6 ergänzt nur `finale: { done: false }`.
- **Endgegner (7.4):**
  - 3 Phasen mit je 6 Energie, Zeit wie Trainer 8 (20 s bei `normal`, mit allen Faktoren aus `timing.js`), angezeigtes Level 50
  - Zwischen den Phasen gibt es keine Energie zurück. Füttern geht weiter, höchstens zweimal pro Duell (7.6).
- **XP (6.3):**
  - 500 für den ersten Sieg gegen den Endgegner mit dem aktuellen Paket (`packs[id].boss` wird wahr)
  - Ein späterer Sieg mit einem Paket, mit dem er schon besiegt ist, gibt hier nichts, denn das Endduell im Berg gibt es nur einmal. Das Erinnerungsduell kommt in Plan 5b.
  - Glanzstein und Makellos-Bonus wirken wie bei Trainern.
- **Kindgerecht (5.4):**
  - Morrow wird „erschöpft“ und dann erinnert, nie zerstört.
  - Eine Niederlage ist ohne Strafe: volle Energie, Neustart am Eingang der unteren Ebene.
- **Zugang (10.4):**
  - Das Tor öffnet sich, wenn `stones` 1 bis 8 enthält und das aktuelle Paket alle 8 Trainer hat.
  - Leuchten alle acht Steine, aber das Paket hat weniger Trainer, sagt das Tor `cave.needPack`.
- **Ruling (Claude):** Die Torregel aus 10.4 geht vor.
  - Enthält das aktuelle Paket weniger als 8 Trainer, bleiben dessen fehlende Gebiete auch nach dem Finale im Nebel. Das ist der Weg der Lehrkraft.
  - „Der Nebel ist weg“ heißt hier: Alle Tore mit einem vollen Paket sind offen, die Bewohner reden vom hellen Himmel, die Inselkarte zeigt keinen Nebel mehr, und Morrow wohnt am Leuchtturm.
- **Barrierefreiheit:**
  - Der Gestaltwechsel ist ein Überblenden, kein Blitzen, und steht bei „Bewegung reduzieren“ still.
  - Die Auflösung des Nebels ist eine sanfte Aufhellung von 2 s, ohne Flackern.
- **Spielfassung** am Ende: `0.10.0`.

### Die Höhle (Claude)

| Karte | Größe | Inhalt | Verbindungen |
|---|---|---|---|
| `hoehle1` Obere Ebene | 20 × 15 | Kristallmoos (hohes Gras) mit wilden Wesen, 2 Echokristalle, Ilvy (nur vor dem Finale) | Eingang unten ↔ Höhlentor der Sternenwiese (Tür (8, 7), Ankunft (8, 8) Blick nach unten); Treppe hinab → `hoehle2` |
| `hoehle2` Mittlere Ebene | 20 × 15 | Kristallmoos, 2 Echokristalle, ein Wasserlauf mit Brücke | Treppe hinauf ↔ `hoehle1`; Treppe hinab → `hoehle3` |
| `hoehle3` Untere Ebene | 16 × 12 | ein warmer Kristall (füllt die Energie auf), Morrow in der Mitte, nach dem Finale nur noch sein Kristall | Treppe hinauf ↔ `hoehle2` |

- **Neue Kacheln:**
  - `cavefloor` (Boden)
  - `cavewall` (blockiert)
  - `crystalmoss` (hohes Gras)
  - `stairsdown` und `stairsup` (begehbar, Ausgänge)
  - `cavewater` (blockiert)
- **Requisiten:**
  - `echocrystal`: Zierobjekt mit `lines`
  - `warmcrystal`: Objekt `type: 'heal'`
  - `morrowmist`: Morrow in der Höhle, Objekt `type: 'boss'`
- **Teilchen:** `drip` (Tropfen) und `glint`. Häufigkeit unter 3 pro Sekunde und Bildschirm.
- **Arena:** `cave`, dunkler Fels mit Kristallen und Teilchen wie in der Karte.

### Neue Arten (Claude)

| Platz | id | Deutsch / Englisch | Art | Beschreibung (de) |
|---|---|---|---|---|
| 31 | `echomaus` | Echomaus / Echomouse | häufig in der Höhle | Eine kleine Maus mit großen Ohren. Sie wiederholt jedes Geräusch, das sie hört, ganz leise. |
| 32 | `kristallraupe` | Kristallraupe / Gemcrawler | selten in der Höhle | Eine Raupe, deren Rücken aus bunten Kristallen besteht. Sie frisst nur Steine, die im Dunkeln leuchten. |
| 33 | `morrow` | Morrow / Morrow | Endgegner (`kind: 'boss'`) | Ein kleines Wesen aus Nebel und Sternenstaub. Es sammelte die Echos vergessener Wörter, bis jemand seinen Namen sagte. |

- **Englische Beschreibungen:**
  - echomaus: „A little mouse with big ears. It repeats every sound it hears, very quietly.“
  - kristallraupe: „A caterpillar whose back is made of colourful crystals. It only eats stones that glow in the dark.“
  - morrow: „A little creature made of mist and stardust. It collected the echoes of forgotten words until someone said its name.“
- **Morrow hat drei Bilder:**
  - Phase 1 (Stufe 3, 48 px): ein Nebelriese
  - Phase 2 (Stufe 2, 40 px): ein Schwarm aus Echos
  - Phase 3 (Stufe 1, 32 px): der kleine Morrow
  - Das Buch zeigt den kleinen Morrow.
- Glanzformen gibt es für beide Höhlenarten, nicht für Morrow.

### Texte (Claude, Deutsch und Englisch, in den Tabellen)

- **`boss.hello` (Morrow vor dem Duell):**
  - de: „Wer bist du? Hier unten kommt nie jemand hin.“ / „Ich habe alles gesammelt, was ihr vergessen habt. Jedes Wort, jedes Lied.“ / „Willst du es zurück? Dann zeig mir, was du weißt!“
  - en: „Who are you? Nobody ever comes down here.“ / „I have collected everything you forgot. Every word, every song.“ / „Do you want it back? Then show me what you know!“
- **`boss.phase`:**
  - de: „Morrow verwandelt sich!“
  - en: „Morrow is changing shape!“
- **`boss.lost`:**
  - de: „Der Nebel wird dichter. Du ruhst dich am Eingang aus und versuchst es noch einmal.“
  - en: „The mist grows thicker. You rest at the entrance and try again.“
- **`finale.ask` (der kleine Morrow nach dem Sieg):**
  - de: „Ich … ich weiß nicht mehr, wie ich heiße. Niemand hat mich je gerufen.“
  - en: „I … I don’t remember my name. Nobody has ever called me.“
- **`finale.sayName` (Knopf):** de „„Morrow!““, en „“Morrow!”“
- **`finale.after`:**
  - de: „Morrow? … Ja! So heiße ich!“ / „Der Nebel löst sich auf. Überall auf der Insel wird es hell.“ / „Morrow kommt mit dir zum Leuchtturm. Dort ist niemand mehr allein.“
  - en: „Morrow? … Yes! That is my name!“ / „The mist melts away. All over the island, it is getting bright.“ / „Morrow comes with you to the lighthouse. Nobody is alone there any more.“
- **Ilvy in der oberen Ebene, wenn das Stück 8.3 fehlt:**
  - de: „Da bist du ja! Ich bin dir nachgekommen.“ / „In einem alten Buch habe ich den Namen des Wesens im Berg gefunden: Morrow.“ / „Vergiss ihn nicht. Wer seinen Namen sagt, erinnert sich an ihn.“
  - en: „There you are! I followed you.“ / „In an old book I found the name of the creature in the mountain: Morrow.“ / „Don’t forget it. Whoever says its name remembers it.“
- **Ilvy, wenn das Stück 8.3 gefunden ist:**
  - de: „Du kennst seinen Namen schon, oder? Morrow. Sag ihn, wenn es so weit ist.“
  - en: „You already know its name, don’t you? Morrow. Say it when the time comes.“
- **Echokristalle** (Zierobjekte mit `lines`, je ein Satz):
  - de: „Aus dem Kristall klingt ein leises Echo: „… und dann sang sie das Lied vom Meer …““, „… wie hieß das noch gleich? …“, „… vergiss mich nicht …“, „… morgen erzähle ich dir den Rest …“
  - en: dieselben Sätze auf Englisch
- **Warmer Kristall:**
  - de: „Der Kristall ist ganz warm. {name} ist wieder voller Energie.“
  - en: „The crystal is warm. {name} is full of energy again.“
- **`cave.needPack`:**
  - de: „Alle acht Fassungen leuchten. Das Tor öffnet sich, sobald deine Lehrkraft alle acht Themen freigibt.“
  - en: „All eight sockets glow. The gate opens as soon as your teacher unlocks all eight topics.“
- **`cave.open`:**
  - de: „Das Tor steht offen. Kühle Luft weht aus dem Berg.“
  - en: „The gate is open. Cool air blows out of the mountain.“
- **Morrow am Leuchtturm (`linesAfter`, vorerst ohne Duell):**
  - de: „Hier sehe ich die ganze Insel. Und jeden Tag kommt jemand vorbei!“ / „Danke, dass du dich an mich erinnert hast.“
  - en: „From here I can see the whole island. And every day someone comes by!“ / „Thank you for remembering me.“
- **Alle Bewohner** bekommen einen `linesAfter`-Satz zum hellen Himmel oder zu Morrow, je einen auf Deutsch und Englisch. Ihre Aufträge bleiben, wie sie sind.

## Review Focus

1. **Paketwechsel nach dem Finale:** Ein Paket mit 3 Trainern hat Morrow am Leuchtturm und die neuen Sätze, aber die Gebiete 4 bis 8 liegen im Nebel. Die Höhle bleibt zu und sagt `cave.needPack`. Ein Spielstand, der in der Höhle steht, landet am Leuchtturm. → Tests in Task 1, 5 und 6
2. **Endduell:**
   - Die Phasen zählen richtig: 6 + 6 + 6, und die letzte Phase gewinnt.
   - Ein Volltreffer am Ende einer Phase springt nicht über die nächste.
   - Füttern höchstens zweimal pro Duell.
   - Keine Flucht. Aufgeben ist eine Niederlage ohne Strafe.
   - → Tests in Task 2
3. **Einmaligkeit:**
   - Das Finale läuft genau einmal.
   - Neu laden während der Szene nach dem Sieg schaltet das Finale trotzdem ein, denn der Stand wird vor der Szene gespeichert.
   - Nach dem Finale steht in der unteren Ebene kein Morrow mehr.
   - → Tests in Task 5
4. **Spielstände:** Format 5 wird zu 6 mit `finale.done = false`. Kaputtes `finale` wird repariert. Positionen in den Höhlenkarten bleiben gültig. → Test in Task 1
5. **Zwei Sprachen** für alle neuen Texte, auch für alle `linesAfter`. → Tests in Task 4 bis 6

---

### Task 1: Spielstand Format 6 mit dem Zustand nach dem Finale

**Files:**
- Modify: `js/state.js`, `js/save/migrate.js`
- Create: `tests/fixtures/spielstand-v6.js`, `tests/fixtures/spielstand-v6.txt`, `js/world/finale.js`
- Test: `tests/migrate.test.js`, `tests/finale.test.js`

**Interfaces:**
- `newGameState` liefert `version: 6`, `finale: { done: false }`.
- `finaleDone(state)` (in `js/world/finale.js`) liefert `state.finale?.done === true`.
- Die Migration 5 → 6 ergänzt `finale`. `repairFinale(raw)` gibt `{ done: raw?.done === true }` zurück.

- [ ] **Step 1: Tests**
  - v5-Fixture → `finale: { done: false }`, sonst gleich (bis auf `version`).
  - v6-Fixture lädt genau so.
  - `finale: 'x'` → `{ done: false }`.
  - `finale: { done: true, extra: 1 }` → `{ done: true }`.
  - Alle älteren Fixtures laden weiter.
- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Umsetzen.** Die v6-Fixture ist eine Kopie von v5 mit `version: 6` und `finale: { done: true }`, damit der Test den Wert sieht. Die `.txt` ist die verschlüsselte Fassung, erzeugt mit `encodeSave` wie bei v5.
- [ ] **Step 4: `# fail 0`.**
- [ ] **Step 5: Commit**: `Spielstand-Format 6: der Zustand nach dem Finale`

### Task 2: Endduell mit Phasen

**Files:**
- Modify: `js/duel/duel.js`, `js/duel/progress.js` (XP für `boss`), `js/state.js` (`applyDuelResult` für `boss`), `js/scenes/duel.js` (`makeBossSetup`), `js/config.js` (`boss: { phases: 3, energy: 6, level: 50, timeAs: 8, xp: 500 }`)
- Test: `tests/duel.test.js`, `tests/progress.test.js`, `tests/state.test.js`

**Interfaces:**
- **`createDuel({ … foe: { maxEnergy, phases } })`:**
  - `d.phase` (1 …) und `d.phases`.
  - Ist ein richtiger Treffer die letzte Energie einer Phase und es folgt noch eine, gilt `r.phaseCleared = true`, `d.phase++`, `d.foeEnergy = foe.maxEnergy` und `d.state = 'feedback'`.
  - Überschüssiger Schaden eines Volltreffers verfällt.
  - `won` erst in der letzten Phase.
- **`kind: 'boss'`:** `flee()` gibt `false`, `surrender()` verliert.
- **`makeBossSetup(game)` liefert:**
  - `{ kind: 'boss', area: 8, arena: 'cave', foe: { species: 'morrow', level: 50, maxEnergy: 6, phases: 3 }, pool: poolFor(pack, { kind: 'boss' }), time: { trainerNumber: 8, setting } }`
  - Die Duellszene zeigt das Bild nach `foeStageForPhase = 4 - phase` (3, 2, 1).
- **`xpForWin({ kind: 'boss' })`:** `CONFIG.boss.xp`. `applyDuelResult` setzt dafür zuerst `progress.boss = true` und gibt die XP nur, wenn `progress.boss` vorher falsch war.

- [ ] **Step 1: Tests**
  - Drei Phasen: 17 richtige Antworten ohne Volltreffer → noch `feedback` in Phase 3, die 18. → `won`.
  - Ein Volltreffer bei 1 Rest-Energie in Phase 1 → Phase 2 mit 6.
  - Fliehen geht nicht. Aufgeben → `lost`.
  - Füttern bleibt bei 2 pro Duell.
  - `applyDuelResult` (boss, gewonnen): 500 XP und `boss` wahr. Ein zweiter Sieg mit demselben Paket: 0 XP.
  - Der Pool mischt alle Themen.
  - Die Uhr: 20 s bei Auswahl.
- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Umsetzen.**
- [ ] **Step 4: `# fail 0`.**
- [ ] **Step 5: Commit**: `Das Endduell mit drei Phasen`

### Task 3: Bilder für Morrow und die Höhlenarten, Kacheln und Arena der Höhle

**Files:**
- Modify:
  - `js/gfx/art/creatures.js` (`echomaus` 1, `kristallraupe` 1, `morrow` 1–3)
  - `js/data/species.js` (`CAVE_SPECIES`, `BOSS_SPECIES = ['morrow']`, Arten), `js/i18n/en-species.js`
  - `js/data/book.js` (Plätze 31 bis 33)
  - `js/gfx/art/tiles.js` (Kacheln und Requisiten aus der Tabelle), `js/world/map.js`
  - `js/gfx/arena.js` (`cave`), `js/gfx/art/shiny.js` (falls nötig)
- Test: `tests/book.test.js`, `tests/species.test.js`, `tests/shiny.test.js`, `tests/tiles.test.js`, `tests/arena.test.js` (falls vorhanden, sonst in `tests/cave.test.js`)

**Interfaces:**
- `BOOK_SLOTS` hat keine `null` mehr: 24 + 6 + 2 + 1 = 33.
- `CREATURE_ART.morrow` hat die Stufen 1, 2 und 3 in 32, 40 und 48 px.
- `ARENAS.cave` gibt es.

- [ ] **Step 1: Tests**
  - Buch: `BOOK_SLOTS.slice(30)` = `['echomaus', 'kristallraupe', 'morrow']`, ohne `null`.
  - Bilder haben ihre Größe und eine eigene Silhouette.
  - Die Glanzform weicht bei den Höhlenarten zu mindestens 25 % ab.
  - Englische Namen und Beschreibungen gibt es.
  - Kacheln stehen in WALKABLE/BLOCKED/TALL_GRASS.
- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Umsetzen.** Für `morrow` gilt der Glanzform-Test nicht, Morrow erscheint nie glänzend. Der Test nimmt `kind: 'boss'` aus.
- [ ] **Step 4: `# fail 0`.**
- [ ] **Step 5: Browser.** `?galerie` zeigt alle neuen Bilder, `?galerie&glanz` die Glanzformen.
- [ ] **Step 6: Commit**: `Bilder für Morrow, die Höhlenarten und die Höhle`

### Task 4: Die drei Ebenen der Höhle und das Höhlentor

**Files:**
- Create: `js/world/maps/hoehle1.js`, `js/world/maps/hoehle2.js`, `js/world/maps/hoehle3.js`, `tests/cave.test.js`
- Modify:
  - `js/world/network.js` (MAPS; `mapOfArea`/`islandMap` ohne `cave`)
  - `js/world/islandMap.js`
  - `js/world/caveGate.js` (`caveOpen(state, pack)`, Zeilen `cave.open`/`cave.needPack`)
  - `js/world/maps/wiese.js` (Tor: `onDoor: 'cave'`)
  - `js/scenes/worldEvents.js` (Tür `cave` → `travelTo`; Echokristalle als `deco` mit `lines`; `heal`)
  - `js/world/encounters.js` (eigene Tabelle der Höhle)
  - `js/data/quests.js` (`GUESTS`: Ilvy in `hoehle1`, nur vor dem Finale)
  - `js/i18n/*`, `sw.js`
- Test: `tests/cave.test.js`, `tests/network.test.js`, `tests/islandMap.test.js`

**Interfaces:**
- `caveOpen(state, pack)` ist wahr, wenn alle 8 Steine leuchten und das Paket die Trainer 1 bis 8 hat.
- **Gäste:** `GUESTS` bekommt eine Bedingung statt Auftrag und Schritt.
  - `{ id: 'ilvy-hoehle', name: 'Ilvy', map: 'hoehle1', x, y, dir, sprite: 'ilvy', when: 'beforeFinale' }`
  - `activeGuests` kennt `when`. Ilvys Satz hängt daran, ob `state.story[8] >= 3` gilt: Ist das Stück gefunden, sagt sie den kurzen Satz, sonst nennt sie den Namen.

- [ ] **Step 1: Tests**
  - Alle drei Ebenen sind vom Eingang aus erreichbar, mit Treppen in beide Richtungen.
  - Ausgang von `hoehle1` → Sternenwiese (8, 8).
  - Hohes Gras liegt in `hoehle1` und `hoehle2`, keins in `hoehle3`.
  - Der warme Kristall liegt vor Morrow.
  - `caveOpen`: 7 Steine → zu. 8 Steine und ein Paket mit 3 Trainern → zu. 8 und 8 → offen.
  - `caveGateLines` sagt passend `cave.needPack` oder `cave.open`.
  - `mapOfArea(8)` ist weiter die Wiese.
  - Ilvy steht nur vor dem Finale da und sagt den passenden Satz in beiden Sprachen.
  - Echokristalle haben englische Sätze.
- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Umsetzen.**
- [ ] **Step 4: `# fail 0`.**
- [ ] **Step 5: Browser.**
  - Mit allen Steinen durch das Tor hinunter, ein wildes Duell in der Höhle, Ilvy sprechen.
  - Zurück nach oben auf die Wiese.
- [ ] **Step 6: Commit**: `Die drei Ebenen der Höhle`

### Task 5: Das Endduell im Berg und das Finale

**Files:**
- Create: `js/scenes/finale.js` (Aufhellen und Texte)
- Modify: `js/world/maps/hoehle3.js` (Objekt `boss`), `js/scenes/worldEvents.js`, `js/scenes/duel.js` (Phasenwechsel: Satz `boss.phase`, Überblenden auf die neue Gestalt), `js/world/finale.js` (`finishFinale(state)`)
- Test: `tests/finale.test.js`

**Interfaces:**
- `finishFinale(state)` setzt `finale.done = true`. Ist das Finale schon erledigt, gibt sie `false` zurück, sonst `true`.
- **Ablauf beim Ansprechen von Morrow (nur vor dem Finale und nur, wenn `caveOpen`):**
  1. `boss.hello`
  2. das Duell
  3. Bei einer Niederlage: `boss.lost`, volle Energie, an `hoehle3.respawn`.
  4. Bei einem Sieg zuerst `finishFinale` und speichern, dann `finale.ask`.
  5. Ein Knopf `finale.sayName`.
  6. Die Szene hellt auf, dazu `finale.after`.
  7. `travelTo` zur Bucht vor den Leuchtturm.
- `resolveStart`: Wer in einer Höhlenkarte steht und `caveOpen` ist falsch (anderes Paket), startet am Leuchtturm.

- [ ] **Step 1: Tests**
  - `finishFinale` wirkt genau einmal.
  - Ist das Finale erledigt, steht in `hoehle3` kein Objekt `boss` mehr (die Welt wird aus dem Zustand gebaut, `withFinale(def, state)`).
  - `resolveStart` in `hoehle2` mit einem Paket mit 3 Trainern → Bucht. Mit einem vollen Paket bleibt die Position.
- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Umsetzen.**
- [ ] **Step 4: `# fail 0`.**
- [ ] **Step 5: Browser (Englisch).**
  - Gegen Morrow alle drei Phasen spielen, mit Gestaltwechsel und einmal Füttern.
  - Danach den Namen sagen, die Szene ansehen und in der Bucht ankommen.
  - Einmal absichtlich verlieren: Neustart vor Morrow mit voller Energie.
  - Neu laden direkt nach dem Sieg: Das Finale ist erledigt.
- [ ] **Step 6: Commit**: `Das Endduell gegen Morrow und das Finale`

### Task 6: Die Welt danach

**Files:**
- Modify:
  - alle Karten mit Bewohnern (`linesAfter`), `js/i18n/en-world.js`
  - `js/world/network.js` (`npcLines`: `linesAfter` vor `linesLit`)
  - `js/world/maps/bucht.js` (Morrow als Bewohner, nur nach dem Finale über `withFinale`)
  - `js/world/islandMap.js` (nach dem Finale kein „Im Nebel“ für offene Gebiete)
  - `js/world/caveGate.js`, `js/menu/teacherPage.js` (falls nötig)
- Test: `tests/finale.test.js`, `tests/network.test.js`, `tests/i18n.test.js` (Vollständigkeit `linesAfter`)

**Interfaces:**
- **`npcLines(o, state, area, pack)`:**
  - Nach dem Finale gilt zuerst `linesAfter`, dann wie bisher.
  - Aufträge gehen weiterhin vor, das regelt der Handler davor.
- **Bucht nach dem Finale:** `{ type: 'npc', id: 'morrow', name: 'Morrow', x: 33, y: 17, dir: 'down', sprite: 'morrow', linesAfter: [...] }`. Feld frei, im Test geprüft.
- **Sprite `morrow` in `characters.js`:** eine kleine Nebelfigur, aus dem Bild der Stufe 1 auf 16 × 16 abgeleitet oder eigens gezeichnet.

- [ ] **Step 1: Tests**
  - Jeder Bewohner auf jeder Gebietskarte hat `linesAfter`, auch auf Englisch, mit gleich vielen Zeilen.
  - Nach dem Finale nennt `npcLines` `linesAfter`.
  - Morrow steht nur nach dem Finale in der Bucht, auf einem freien Feld.
  - Nach einem Paketwechsel auf ein Paket mit 3 Trainern ist das Finale noch erledigt, und Morrow steht noch da.
- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Umsetzen.**
- [ ] **Step 4: `# fail 0`.**
- [ ] **Step 5: Browser.**
  - Nach dem Finale mit drei Bewohnern in drei Gebieten sprechen und mit Morrow am Leuchtturm.
  - Die Inselkarte ansehen.
  - Prüfmodus `?sprache=xx` für die neuen Sätze.
- [ ] **Step 6: Commit**: `Die Welt nach dem Finale`

### Task 7: Abschluss von Plan 5a

- [ ] **Step 1:** Spielfassung `0.10.0`, README, `FILES`. `node --test` → `# fail 0`.
- [ ] **Step 2: Gesamtdurchlauf ohne `?dev`** (harter Neuladen, nach jedem Neuladen 3 s warten).
  1. Format-5-Stand mit allen Steinen laden, er wird zu Format 6.
  2. Durch die Höhle, Ilvy, Morrow mit drei Phasen, Namen sagen, Finale.
  3. Die Bewohner sagen neue Sätze, Morrow am Leuchtturm.
  4. Teacher-Seite: Endgegner ja.
  5. Buch: 33 von 33 möglich, die neuen gesehen oder besiegt.
  6. Neu laden: alles da.
- [ ] **Step 3: Commit**: `Plan 5a abschließen: Spielfassung 0.10.0 und README`
