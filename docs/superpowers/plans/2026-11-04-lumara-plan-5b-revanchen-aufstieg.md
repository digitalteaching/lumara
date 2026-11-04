# Lumara · Plan 5b: Revanchen, Erinnerungsduell, Sternschnuppen und Leuchtturm-Aufstieg – Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Das Spiel geht nach dem Finale endlos weiter (Design 9).
- Besiegte Trainer fordern zur Revanche heraus und werden dabei Stufe für Stufe stärker.
- Morrow bietet am Leuchtturm das Erinnerungsduell an.
- Auf der Sternenwiese fallen Sternschnuppen, an denen seltene Wesen öfter auftauchen.
- Im Leuchtturm geht es Etage für Etage nach oben, so weit man kommt.

**Architecture:**
- **Spielstand Format 7:** `packs[id].tiers` ist eine Liste von Trainernummer (1 bis 8, dazu 9 für Morrow) auf die Zahl gewonnener Revanchen (0 bis 5). Sie gehört zum Paket (Design 10.4).
- **Stufen und Werte** stehen rein und testbar in `js/duel/rematch.js` und `js/duel/ascent.js`.
- **Die Uhr** bekommt neben der Trainernummer eine eigene Grundzeit in Sekunden (`time.seconds`). So lassen sich Revanche und Aufstieg mit denselben Faktoren rechnen (Antwortform, `ZEITDRUCK`, Flausch).
- **Ein Duell kennt `setup.rematch`** (Stufe) bzw. `kind: 'ascent'`. `applyDuelResult` rechnet XP und Stufen daraus.

**Tech Stack:** wie bisher.

**Spec:** `docs/superpowers/specs/2026-11-01-lernwelt-rpg-design.md`. Relevante Abschnitte:
- 6.3 (XP-Tabelle)
- 7.4 (Grundwerte)
- 7.5 (Revanchen)
- 9 (Erinnerungsduell, Sternschnuppen, Aufstieg)
- 10.4 (pro Paket)
- 12.1 (höchste Etage)

Vorgänger: Plan 5a.

**Arbeitszweig:** `feature/endlos`, abgezweigt von `feature/finale` nach dessen Abschlussprüfung.

## Global Constraints

- **Alles aus den Plänen 4c bis 5a gilt weiter:**
  - zwei Sprachen
  - echte Tasten in Browserprüfungen
  - `tests/faceable.test.js` für Ansprechbares
  - Fixtures v1 bis v6 bleiben unverändert, dazu kommt `spielstand-v7`
- **Revanche (7.5):**
  - Ein Trainer, der mit dem aktuellen Paket besiegt ist, bietet nach seinem Satz die Revanche an.
  - Sie läuft auf Stufe `s = min(T + 1, 5)`, wobei `T` die Zahl der gewonnenen Revanchen ist.
  - Energie: `CONFIG.trainers[k].energy + 2·s`.
  - Zeit: `Grundzeit × 0,9^s`, nie unter 10 s. Die Grundzeit ist die des Trainers, bei Trainer 1 bis 3 `40 s`.
  - XP: `(40 + 20·k) × (1 + 0,25·s)`, Makellos-Bonus und Glanzstein wie sonst.
  - Ein Sieg erhöht `T`, höchstens auf 5. Eine Niederlage ändert nichts. Der Leuchtstein ist schon entzündet.
- **Erinnerungsduell (9):**
  - Es steht nur zur Verfügung, wenn das Finale erledigt ist, das Paket die Trainer 1 bis 8 hat und alle 8 mit diesem Paket besiegt sind.
  - Ist `boss` für das Paket noch falsch, gelten die Werte aus 7.4 (Stufe 0), und der Sieg bringt 500 XP und `boss`.
  - Danach gilt Stufe `s = min(T9 + 1, 5)`: 3 Phasen mit je `6 + 2·s` Energie, Zeit `20 × 0,9^s` (≥ 10), XP `500 × 0,5 × (1 + 0,25·s)`.
- **Sternschnuppen (9):**
  - Nach dem Finale liegt auf der Sternenwiese eine gefallene Sternschnuppe auf einem Feld Sternengras.
  - Ihren Platz bestimmt `fallenStarSpot(state)` aus der gesamten Spielzeit: alle 10 Minuten Spielzeit ein neues Feld aus einer festen Liste.
  - Begegnungen bis 2 Felder entfernt haben die Chance auf die seltene Art `0,5` statt `0,1`.
  - Das Glitzern ist höchstens 1 Hz und steht bei „Bewegung reduzieren“ still.
- **Leuchtturm-Aufstieg (9), Claude:**
  - Er steht nach dem Finale mit jedem Paket zur Verfügung. Man erreicht ihn über die Tür des Leuchtturms: Die Wahl lautet „Ausruhen“ oder „Aufstieg“.
  - Etage `e` (ab 1) ist ein Duell gegen ein zufälliges wildes Wesen aus allen Gebieten und der Höhle (keine geheimen Arten, kein Morrow).
  - Fragen aus allen Themen (`boss`-Pool).
  - Energie des Gegners: `min(15, 4 + floor(e / 3))`. Angezeigtes Level: `min(100, 10 + 3·e)`.
  - **Uhr ab Etage 5:** Grundzeit `max(15, 35 − (e − 5))` Sekunden, mit den Faktoren aus `timing.js`. Darunter keine Uhr.
  - **Energie:** Zwischen den Etagen gibt es keine Energie zurück. Nach jeder 5. Etage füllt ein Leuchtstein die Energie ganz auf.
  - Nach jedem Sieg wählt man „Weiter nach oben“ oder „Hinuntergehen“.
  - Eine Niederlage beendet den Aufstieg ohne Strafe.
  - XP je Etage: `20 + 2·e`, mit Makellos-Bonus.
  - `stats.floor` des Pakets hält die höchste geschaffte Etage.
  - Arena: `tower` (das Innere des Leuchtturms).
  - Der Aufstieg wird nicht gespeichert. Wer die App schließt, beginnt beim nächsten Mal wieder unten. Die Bestmarke bleibt.
- **Spielfassung** am Ende: `0.11.0`.

### Texte (Claude, Deutsch und Englisch, in den Tabellen)

- **`rematch.offer`:**
  - de: „Lust auf eine Revanche? Ich bin jetzt stärker. (Stufe {stage})“
  - en: „Fancy a rematch? I am stronger now. (Level {stage})“
- **`rematch.yes`:** de „Revanche!“, en „Rematch!“
- **`rematch.later`:** de „Später“, en „Later“
- **`rematch.max`:**
  - de: „Stärker werde ich nicht mehr. Aber du kannst mich immer wieder herausfordern!“
  - en: „I can’t get any stronger. But you can challenge me again and again!“
- **`remember.offer`:**
  - de: „Wollen wir unser Duell wiederholen? Ich erinnere mich an jede Frage! (Stufe {stage})“
  - en: „Shall we repeat our duel? I remember every question! (Level {stage})“
- **`remember.notYet`:**
  - de: „Wenn du alle acht Hüterinnen und Hüter mit diesem Lernpaket besiegt hast, spielen wir unser Duell noch einmal.“
  - en: „When you have beaten all eight keepers with this learning pack, we will play our duel again.“
- **`star.near`:**
  - de: „Hier ist eine Sternschnuppe ins Gras gefallen. Seltene Wesen sind ganz in der Nähe!“
  - en: „A shooting star has fallen into the grass here. Rare creatures are very close!“
- **`tower.door`:** de „Der Leuchtturm. Was möchtest du tun?“, en „The lighthouse. What would you like to do?“
- **`tower.rest`:** de „Ausruhen“, en „Rest“
- **`tower.climb`:** de „Aufstieg“, en „Climb“
- **`tower.floor`:**
  - de: „Etage {n}. Ein wildes Wesen wartet schon!“
  - en: „Floor {n}. A wild creature is already waiting!“
- **`tower.next`:** de „Weiter nach oben“, en „Keep climbing“
- **`tower.down`:** de „Hinuntergehen“, en „Go down“
- **`tower.beacon`:**
  - de: „Ein kleiner Leuchtstein auf dem Treppenabsatz füllt die Energie von {name} ganz auf.“
  - en: „A little light stone on the landing fills {name}’s energy completely.“
- **`tower.end`:**
  - de: „Du hast Etage {n} geschafft. Deine Bestmarke: Etage {best}.“
  - en: „You reached floor {n}. Your best: floor {best}.“
- **`tower.lost`:**
  - de: „{name} ist erschöpft. Ihr geht gemeinsam die Treppe hinunter.“
  - en: „{name} is exhausted. You walk down the stairs together.“

## Review Focus

1. **Stufen:**
   - Die erste Revanche ist nie leichter als der erste Sieg, auch bei Trainer 1 bis 3, die vorher keine Uhr hatten.
   - Stufe 5 bleibt Stufe 5.
   - Eine Niederlage senkt nichts.
   - Ein anderes Paket hat eigene Stufen.
   - → Tests in Task 2
2. **Erinnerungsduell:**
   - Nicht verfügbar mit einem Paket, das weniger als 8 Trainer hat oder nicht alle besiegt.
   - Der erste Sieg gibt 500 XP und „Endgegner besiegt“, danach XP nach Stufe.
   - → Tests in Task 4
3. **Aufstieg:**
   - Energie wird nur nach jeder 5. Etage aufgefüllt.
   - Eine Niederlage auf Etage 1 schreibt keine Bestmarke.
   - Die Bestmarke sinkt nie.
   - Die Uhr erst ab Etage 5, nie unter 15 s Grundzeit.
   - → Tests in Task 6
4. **Spielstände:** Format 6 wird zu 7 mit leeren `tiers`. Kaputte Stufen (−1, 9, 'x') werden repariert. → Test in Task 1
5. **Zwei Sprachen** für alle neuen Texte. → Tests in Task 3 bis 6

---

### Task 1: Spielstand Format 7 mit den Revanche-Stufen

**Files:**
- Modify: `js/state.js` (`emptyPackProgress` mit `tiers: {}`, Version 7), `js/save/migrate.js`
- Create: `tests/fixtures/spielstand-v7.{js,txt}`
- Test: `tests/migrate.test.js`, `tests/state.test.js`

- [ ] **Step 1: Tests**
  - v6 → 7: jedes Paket bekommt `tiers: {}`.
  - v7-Fixture lädt.
  - `tiers: { 1: 3, 2: -1, 9: 7, x: 2, 4: 'a' }` → `{ 1: 3, 9: 5 }`. Werte 1 bis 5 bleiben, über 5 wird 5, ungültige fallen weg, Schlüssel nur 1 bis 9.
- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Umsetzen.**
- [ ] **Step 4: `# fail 0`.**
- [ ] **Step 5: Commit**: `Spielstand-Format 7: Revanche-Stufen pro Paket`

### Task 2: Regeln der Revanche und eigene Grundzeiten der Uhr

**Files:**
- Create: `js/duel/rematch.js`, `tests/rematch.test.js`
- Modify: `js/duel/timing.js` (`time.seconds`), `js/state.js` (`applyDuelResult`), `js/duel/progress.js` (`xpForWin` mit `rematch`)

**Interfaces:**
- **Stufe:** `rematchStage(progress, n)` liefert `min((progress.tiers[n] ?? 0) + 1, 5)`.
- **Setup:** `rematchSetup(pack, n, stage)` liefert ein Trainer-Setup mit:
  - `rematch: stage`
  - `foe.maxEnergy = base + 2·stage`
  - `foe.level = cfg.level + 3·stage` (Anzeige)
  - `time: { seconds: max(10, base × 0.9^stage), setting }`, wobei `base` die Zeit aus 7.4 ist, bei Trainer 1 bis 3 40 s
- **`questionTimeMs({ seconds, … })`:** Ist `seconds` gesetzt, ersetzt es die Trainerzeit. `ZEITDRUCK: aus` heißt weiter: keine Uhr.
- **`applyDuelResult` bei einem Revanche-Sieg:**
  - XP `(40 + 20k) × (1 + 0,25·s)`, gerundet, dazu Makellos und Glanzstein
  - `tiers[n] = min(5, tiers[n] + 1)`
  - kein `beaten`-Wechsel, kein Stein

- [ ] **Step 1: Tests**
  - Trainer 1, Stufe 1: Energie 7, Zeit 36 s (Auswahl), XP 75 (ohne Makellos).
  - Trainer 8, Stufe 5: Energie 22, Zeit `20 × 0,9⁵ = 11,8 s`.
  - Trainer 4, Stufe 5: Zeit `40 × 0,59 = 23,6 s`. Stufe 5 nie unter 10.
  - `ZEITDRUCK: aus` → keine Uhr.
  - Sieg auf Stufe 5 lässt 5. Niederlage ändert nichts. Ein anderes Paket hat eigene Stufen.
- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Umsetzen.**
- [ ] **Step 4: `# fail 0`.**
- [ ] **Step 5: Commit**: `Regeln der Revanche`

### Task 3: Revanchen in der Welt

**Files:**
- Modify: `js/scenes/worldEvents.js` (Trainer, der mit diesem Paket besiegt ist), `js/i18n/de.js`, `js/i18n/en.js`
- Test: `tests/rematch.test.js` (Texte)

**Interfaces:**
- Nach `afterWinLines` kommt `rematch.offer` mit `{ stage }` und der Wahl `rematch.yes`/`rematch.later`.
- Bei Ja: `runDuel(rematchSetup(...), 'trainer')`. Der Trainer sagt zu Beginn seinen `rematch`-Satz aus dem Paket.
- Nach dem Duell geht es zurück wie bei jedem Trainerduell.
- Auf Stufe 5 nach einem Sieg sagt der Trainer einmal `rematch.max` und bietet weiter Stufe 5 an.

- [ ] **Step 1: Tests**
  - Die Texte gibt es auf Deutsch und Englisch, mit `{stage}`.
  - Die Logik `rematchOffer(progress, n)` liefert `null`, solange der Trainer nicht besiegt ist, sonst `{ stage, max }`.
- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Umsetzen.**
- [ ] **Step 4: `# fail 0`.**
- [ ] **Step 5: Browser (Englisch, echte Tasten).** Trainer 1 nach dem Sieg ansprechen, Revanche auf Stufe 1 gewinnen. Danach bietet er Stufe 2 an. Einmal „Später“.
- [ ] **Step 6: Commit**: `Revanchen gegen besiegte Trainer`

### Task 4: Das Erinnerungsduell mit Morrow

**Files:**
- Modify: `js/duel/boss.js` (`rememberSetup(pack, stage)`, `rememberAvailable(state, pack)`), `js/state.js` (XP und Stufe 9), `js/scenes/worldEvents.js` (Morrow am Leuchtturm), Texte
- Test: `tests/boss.test.js`

**Interfaces:**
- **`rememberAvailable(state, pack)`:** `finaleDone` und Trainer 1 bis 8 im Paket und alle in `beaten`.
- **`rememberSetup(pack, progress)`:**
  - Stufe 0, solange `progress.boss` falsch ist, sonst `min(T9 + 1, 5)`.
  - `foe.maxEnergy = 6 + 2·s`, `phases: 3`
  - Zeit `max(10, 20 × 0,9^s)`
  - `kind: 'boss'`, `rematch: s`, `remember: true`
- **XP:** Stufe 0 und `boss` falsch → 500. Sonst `500 × 0,5 × (1 + 0,25·s)`. Ein Sieg mit `boss` wahr erhöht `tiers[9]`.
- **Morrow am Leuchtturm:**
  - verfügbar → `remember.offer` mit Wahl
  - nicht verfügbar → seine Sätze und `remember.notYet`

- [ ] **Step 1: Tests**
  - Nicht verfügbar: ohne Finale; mit 3 Trainern; mit 8 Trainern, aber nur 7 besiegt.
  - Erster Sieg: 500 XP und `boss`.
  - Zweiter Sieg: Stufe 1, 312 XP (`500 × 0,5 × 1,25 = 312,5` → gerundet 313), `tiers[9]` wird 1.
  - Energie auf Stufe 2: 10 je Phase.
- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Umsetzen.**
- [ ] **Step 4: `# fail 0`.**
- [ ] **Step 5: Browser.** Morrow mit einem Paket ansprechen, mit dem nicht alle Trainer besiegt sind (Satz), dann mit allen besiegt (Duell).
- [ ] **Step 6: Commit**: `Das Erinnerungsduell mit Morrow`

### Task 5: Sternschnuppen auf der Sternenwiese

**Files:**
- Create: `js/world/stars.js`, `tests/stars.test.js`
- Modify: `js/world/encounters.js` (`pickWild(table, rng, rareChance)`), `js/scenes/worldEvents.js` (Glitzern, Satz beim ersten Betreten des Umkreises, Begegnung mit erhöhter Chance), `js/world/maps/wiese.js` (`starSpots`: 5 Felder Sternengras), Texte

**Interfaces:**
- `fallenStarSpot(state)` liefert `null` vor dem Finale, sonst `starSpots[Math.floor(playMs / 600000) % 5]`.
- `rareChanceAt(state, def, x, y)` liefert `0.5` im Umkreis von 2 Feldern (Manhattan-Abstand), sonst `CONFIG.wild.rareChance`.

- [ ] **Step 1: Tests**
  - Vor dem Finale: kein Stern.
  - Nach 10 Minuten Spielzeit ein anderes Feld.
  - Alle `starSpots` sind Sternengras und erreichbar.
  - `pickWild` mit 0,5 liefert bei vielen Würfen etwa die Hälfte selten, geprüft mit festem rng: zwischen 40 und 60 %.
- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Umsetzen.**
- [ ] **Step 4: `# fail 0`.**
- [ ] **Step 5: Browser.** Nach dem Finale auf der Wiese den Stern sehen, den Satz lesen und in seiner Nähe auf eine seltene Art treffen.
- [ ] **Step 6: Commit**: `Sternschnuppen auf der Sternenwiese`

### Task 6: Der Leuchtturm-Aufstieg

**Files:**
- Create: `js/duel/ascent.js`, `tests/ascent.test.js`, `js/scenes/ascent.js` (Ablauf Etage für Etage)
- Modify:
  - `js/scenes/worldEvents.js` (Leuchtturmtür nach dem Finale: Wahl)
  - `js/state.js` (`applyDuelResult` für `ascent`: XP, keine Beute außer Pieks)
  - `js/gfx/arena.js` (`tower`)
  - Texte, `sw.js`

**Interfaces:**
- **Etage:**
  - `ascentFoe(floor, rng)` liefert `{ species, stage: 1, level: min(100, 10 + 3·floor), maxEnergy: min(15, 4 + floor(floor / 3)) }`.
  - Die Art kommt aus allen `AREA_WILD`-Arten (häufig und selten) und den `CAVE_SPECIES`.
- **Uhr:** `ascentSeconds(floor)` liefert `null` unter Etage 5, sonst `max(15, 35 − (floor − 5))`.
- **XP:** `ascentXp(floor, flawless)` liefert `round((20 + 2·floor) × (flawless ? 1.25 : 1))`.
- **Energie:** `refillAfter(floor)` ist wahr, wenn `floor % 5 === 0`.
- **Bestmarke:** `recordFloor(progress, floor)` setzt `stats.floor = max(stats.floor, floor)`.
- **Ablauf in `js/scenes/ascent.js`:** `climb(game, world)`:
  1. Etage 1: `tower.floor`.
  2. Duell.
  3. Bei einem Sieg: XP, `recordFloor`. Ist `refillAfter`, folgt `tower.beacon` mit voller Energie. Dann die Wahl weiter oder hinunter.
  4. Bei einer Niederlage: `tower.lost`, volle Energie, `tower.end`.
  5. Hinunter: `tower.end`.
  6. Zum Schluss geht es zurück vor die Leuchtturmtür.

- [ ] **Step 1: Tests**
  - Energie der Etagen 1, 3, 30 und 40: 4, 5, 14, 15.
  - Uhr bei Etage 4, 5 und 30: null, 35, 15.
  - XP der Etage 10: 40.
  - Auffüllen nach den Etagen 5 und 10, nicht nach 4.
  - Die Bestmarke sinkt nicht.
  - Arten: nie geheim, nie Morrow.
  - Texte in beiden Sprachen.
- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Umsetzen.**
- [ ] **Step 4: `# fail 0`.**
- [ ] **Step 5: Browser (echte Tasten).**
  - Nach dem Finale an der Tür „Aufstieg“ wählen und zwei Etagen schaffen, dann hinunter.
  - Die Lehrkraft-Seite zeigt „Höchste Etage: 2“.
  - Ein zweiter Aufstieg, absichtlich verloren auf Etage 1: Die Bestmarke bleibt 2.
- [ ] **Step 6: Commit**: `Der Leuchtturm-Aufstieg`

### Task 7: Abschluss von Plan 5b

- [ ] **Step 1:** Spielfassung `0.11.0`, README, `FILES`. `node --test` → `# fail 0`.
- [ ] **Step 2: Gesamtdurchlauf ohne `?dev`.**
  1. Format-6-Stand laden, er wird zu 7.
  2. Revanche gegen einen Trainer spielen.
  3. Das Erinnerungsduell mit einem Paket, mit dem alle besiegt sind.
  4. Eine Sternschnuppe auf der Wiese finden.
  5. Drei Etagen im Leuchtturm schaffen.
  6. Neu laden: Stufen und Bestmarke sind da.
- [ ] **Step 3: Commit**: `Plan 5b abschließen: Spielfassung 0.11.0 und README`
