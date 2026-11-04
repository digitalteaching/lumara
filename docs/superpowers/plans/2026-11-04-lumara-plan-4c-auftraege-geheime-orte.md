# Lumara · Plan 4c: Aufträge, Schlüsselgegenstände und die geheimen Orte der Gebiete 1 bis 5 – Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** In den Gebieten 1 bis 5 gibt jeweils ein Bewohner einen Auftrag. Die Belohnung ist ein Gegenstand, darunter die ersten Schlüsselgegenstände: Laterne und Kletterhaken. Mit ihnen öffnen sich die ersten beiden geheimen Orte, die Hohle Eiche im Flüsterwald und der Glasturm in den Spiegeldünen. Jeder geheime Ort hat eine seltene Wesenart, ein Geschichtsstück und einen seltenen Stein.

**Architecture:**
- **Aufträge** sind Daten in `js/data/quests.js`. Jeder Auftrag ist eine Folge von Schritten (`pickup`, `talk`). Die Logik in `js/world/quests.js` ist DOM-frei: annehmen, Schritt erfüllen, abschließen.
- **In der Welt** hängt `worldEvents.js` die Aufträge an Bewohner, Fundstücke und Gast-Bewohner, ähnlich wie Fundstellen und Zettel.
- **Schlüsselgegenstände** liegen in `state.keys` und werden nie verbraucht.
- **Geheime Orte** sind kleine eigene Karten in `js/world/maps/`. Man erreicht sie über ein Eingangsobjekt (`type: 'secret'`), das einen Schlüsselgegenstand verlangt. Jede dieser Karten hat eine eigene Tabelle wilder Wesen, einen Geschichtsstein und einen seltenen Stein, beide nur einmal.
- **Spielstand-Format 5:** `quests`, `keys` und `secrets`.

**Tech Stack:** wie Plan 1 bis 4b.

**Spec:** `docs/superpowers/specs/2026-11-01-lernwelt-rpg-design.md` (5.5, 5.6, 5.7, 6.3, 6.4, 8.1, 8.4, 10.4, 10.6, 11, 13). Vorgänger: Plan 1 bis 4b.

**Umfang:**
- Aufträge 1 bis 5 mit den Belohnungen aus Design 5.7: Futterbeutel, Lebensstein, Laterne, 3 Glanzsteine, Kletterhaken
- der Futterbeutel als Platz für 20 statt 10 Futter (8.1)
- Schlüsselgegenstände im Rucksack (8.4)
- Aufträge im Tagebuch (13)
- die geheimen Orte Hohle Eiche (Laterne) und Glasturm (Kletterhaken), mit den Buchplätzen 25 und 26 und den Geheimstücken 1 und 2 der Geschichte (5.5)

**Bewusst noch nicht:**
- Aufträge 6 bis 8, Nussschale (Gezeiteninsel, Irrlichtinsel), Eiskufen (Eisgrotte), Sternkarte (Sternwarte) und die Rätsel: Plan 4d
- Höhle und Morrow: Finale

**Arbeitszweig:** `feature/auftraege`, abgezweigt von `feature/wesen-buch` (Plan 4b). Der erste Commit ist dieser Plan.

## Global Constraints

- **Aus Plan 1 bis 4b gilt weiter**, vor allem die Spielsprache:
  - Jeder neue Text entsteht auf Deutsch und Englisch, über `t()` oder die englischen Datentabellen.
  - Die Tests in `tests/i18n.test.js` prüfen die Vollständigkeit.
  - In `worldEvents.js`, `duel.js` und den anderen Dateien mit eigenem `t` heißt die Textfunktion `tr`.
- **Spielstände:**
  - Das Format steigt auf 5.
  - Die Fixtures v1 bis v4 bleiben unverändert und laden weiter. Neu ist `tests/fixtures/spielstand-v5.{js,txt}`.
- **Was dem Kind gehört (Design 10.4):** Aufträge, Schlüsselgegenstände und die Funde an geheimen Orten bleiben bei einem Paketwechsel erhalten.
- **Belohnung (5.6):** Jeder erledigte Auftrag bringt 50 XP über `gainXp` (mit Entwicklung, wenn sie fällig ist) und seinen Gegenstand.
- **Abschluss erst nach dem Gebietstrainer (5.6):**
  - Angenommen und bis zum letzten Schritt gebracht werden kann ein Auftrag jederzeit.
  - Abgeschlossen wird er erst, wenn der Stein seines Gebiets leuchtet. Das kann auch mit einem anderen Paket geschehen sein.
- **Orte eines Auftrags:** Alles, was Auftrag k braucht, liegt in den Gebieten 1 bis k. So ist es erreichbar, sobald Gebiet k offen ist.
- **Geheime Orte:**
  - Die Rätsel sind kurz und ohne Lernfragen (5.7). Die Orte von Plan 4c haben kein Rätsel.
  - Die Wesen dort kämpfen mit den Fragen wie wilde Wesen und haben die Werte ihres Gebiets.
- **Bilder:** Seltene Arten sind 32 × 32 groß. Neue Kacheln sind 16 × 16, Requisiten passen ins Raster. Alles im Code gezeichnet.
- **Barrierefreiheit:**
  - Der dunkle Gang der Hohle Eiche wird mit der Laterne hell. Bei „Bewegung reduzieren“ flackert ihr Licht nicht.
  - Nichts blinkt öfter als dreimal pro Sekunde.
- **Spielfassung** am Ende: `0.8.0`.

### Die Aufträge (Claude)

| Nr. | Gebiet | Auftraggeber | Art | Schritte | Belohnung |
|---|---|---|---|---|---|
| 1 | Bucht | Bram | etwas Verlorenes finden | Glücksmuschel am Strand (6, 20) aufheben → zu Bram | Futterbeutel (Schlüsselgegenstand) |
| 2 | Wald | Fenna | etwas bringen | Kräuterbeutel zu Oda in die Bucht → zurück zu Fenna | Lebensstein |
| 3 | Moor | Jasper | jemanden suchen | Lehrling Flo im Flüsterwald (24, 13) finden → zurück zu Jasper | Laterne (Schlüsselgegenstand) |
| 4 | Dünen | Samir | etwas Verlorenes finden | Glaskugel im Dünengras (5, 24) aufheben → zu Samir | 3 Glanzsteine |
| 5 | Klippen | Tamo | etwas bringen | Brief zu Talia in die Dünen → zurück zu Tamo | Kletterhaken (Schlüsselgegenstand) |

- Ein Fundstück glitzert nur, solange sein Schritt dran ist.
- Flo steht nur im Wald, solange sein Schritt dran ist.

### Die geheimen Orte dieses Plans (Claude)

| Ort | Eingang | Schlüssel | Karte | Seltene Art (Buch) | Stein |
|---|---|---|---|---|---|
| Hohle Eiche | Flüsterwald, eine alte hohle Eiche bei (5, 12), von (5, 13) nach oben | Laterne | `eiche`, 20 × 12, ein dunkler Gang aus Wurzeln | `wurzelgeist`, Wurzelgeist / Rootling (25) | Lebensstein |
| Glasturm | Spiegeldünen, eine Öse an der Glaswand bei (15, 4), von (15, 5) nach oben | Kletterhaken | `glasturm`, 16 × 12, oben auf dem Turm | `prismalibelle`, Prismalibelle / Prismfly (26) | Weitblickstein |

## Review Focus

1. **Reihenfolge und Paketwechsel:**
   - Ein Auftrag wird angenommen, bevor der Stein leuchtet. Er bleibt nach einem Paketwechsel und nach dem Neuladen auf dem richtigen Schritt.
   - Mit einem Paket, in dem sein Gebiet im Nebel liegt, ist er nicht verloren.
   - Ein zweites Gespräch bringt nie eine zweite Belohnung.
   - → Tests in Task 2
2. **Voller Rucksack bei einer Belohnung:**
   - 3 Glanzsteine passen immer, ein Lebensstein bei drei wirksamen Steinen wird nicht verschluckt.
   - Der Futterbeutel erhöht die Grenze sofort.
   - → Tests in Task 1 und Task 2
3. **Geheimer Ort ohne Schlüssel:** Man kommt nicht hinein, bekommt einen Hinweis, und der Ort öffnet sich, sobald man den Schlüssel hat. Geschichtsstein und Stein gibt es einmal, auch nach dem Neuladen. → Tests in Task 5
4. **Spielstände aus 0.2 bis 0.7** laden ohne Verlust. Kaputte Einträge in quests, keys und secrets fallen heraus. → Tests in Task 1
5. **Zwei Sprachen:** Jeder Satz der Aufträge, der Orte und der neuen Arten gibt es auf Deutsch und Englisch. Fundstücke, Gast-Bewohner und Eingänge haben ids. → Tests in Task 3, 6 und 7

---

## Gemeinsame Schnittstellen

```js
// Spielstand (Task 1)
state.quests: { [questId]: { step: number, done: boolean } }   // vorhanden = angenommen
state.keys: string[]                                          // 'foodbag', 'lantern', 'hook', … nie verbraucht
state.secrets: { [placeId]: { story: boolean, stone: boolean } }
hasKey(state, key) → boolean;  giveKey(state, key) → boolean (neu?)
foodMax(state) → 10 | 20                                      // CONFIG.bag.foodMax, mit Futterbeutel CONFIG.bag.foodMaxBag

// Auftragsdaten (Task 3), js/data/quests.js
QUESTS: [{ id, area, giver: { map, npc }, steps: [Step], reward: { item, n? } | { key } }]
Step = { kind: 'pickup', id, map, x, y } | { kind: 'talk', map, npc }   // npc: id auf der Karte, oder eine Gast-id aus GUESTS
GUESTS: [{ id, map, x, y, dir, sprite, quest, step }]                    // nur sichtbar, solange quest auf step steht

// Auftragslogik (Task 2), js/world/quests.js, DOM-frei
questFor(state, mapId, npcId) → { quest, role: 'offer'|'remind'|'step'|'finish'|'locked'|'done' } | null
acceptQuest(state, id) → boolean
advanceQuest(state, id, stepIndex) → boolean                  // nur der aktuelle Schritt
finishQuest(state, id) → { xp, item, n, key, kept, report } | null   // nur, wenn Stein leuchtet und alle Schritte erfüllt
activePickups(state, mapId) → Step[];  activeGuests(state, mapId) → Guest[]
questLog(state) → [{ id, title, done, hint }]                 // für das Tagebuch

// Geheime Orte (Task 5)
{ type: 'secret', id, place, key, x, y, w?, h?, to: { map, x, y, dir } }   // Eingangsobjekt auf der Gebietskarte
secretOpen(state, entrance) → boolean
takeSecretStory(state, place) → string | null;  takeSecretStone(state, place) → item | null
def.wild = { common: [id], rare: id }                            // eigene Tabelle der Karte, sonst AREA_WILD[def.area]
```

---

### Task 1: Spielstand-Format 5, Schlüsselgegenstände und Futterbeutel

**Files:**
- Create: `js/items/keys.js`, `tests/keys.test.js`, `tests/fixtures/spielstand-v5.{js,txt}`
- Modify: `js/state.js`, `js/save/migrate.js`, `js/items/bag.js`, `js/config.js`, `js/menu/bagPage.js`, `js/i18n/de.js`, `en.js`, `sw.js`
- Test: `tests/keys.test.js`, `tests/migrate.test.js`, `tests/bag.test.js`, `tests/state.test.js`

**Interfaces:**
- **Schlüsselgegenstände** `KEY_ITEMS = ['foodbag', 'lantern', 'hook', 'nutshell', 'skates', 'starmap']`, mit `hasKey` und `giveKey` (keine doppelten).
- **Futter:** `CONFIG.bag.foodMaxBag = 20`. `addItem` und die Reparatur beim Laden nutzen `foodMax(state)`.
- **Umwandlung 4 → 5:** `quests: {}, keys: [], secrets: {}`.
- **Reparatur:**
  - quests: nur bekannte Auftrags-ids, `step` als ganze Zahl ≥ 0, `done` als boolean. Bis Task 3 kennt `QUESTS` die ids `q1` bis `q5`, und die Reparatur liest sie dort.
  - keys: nur aus `KEY_ITEMS`, ohne doppelte.
  - secrets: nur bekannte Orte (`SECRET_PLACES` aus Task 5, bis dahin `['eiche', 'glasturm']` in `js/data/secrets.js`).
- **Rucksack:** Abschnitt „Schlüsselgegenstände“ mit Name und einem Satz je Gegenstand (de/en), nur wenn das Kind welche hat.
  - de: Futterbeutel „Mehr Platz für Futter: 20 statt 10.“ / en: Food bag „More room for food: 20 instead of 10.“
  - de: Laterne „Leuchtet in dunklen Gängen.“ / en: Lantern „Lights up dark tunnels.“
  - de: Kletterhaken „Damit kommst du an steilen Wänden hinauf.“ / en: Climbing hook „Helps you climb steep walls.“
  - de/en für `nutshell`, `skates`, `starmap` stehen schon da: Nussschale „Ein kleines Boot für ruhiges Wasser.“ / Nutshell boat „A small boat for calm water.“; Eiskufen „Damit gleitest du über das Eis.“ / Ice skates „Let you glide over the ice.“; Sternkarte „Zeigt, wie die Sterne stehen.“ / Star map „Shows where the stars are.“

- [ ] **Step 1: Tests schreiben**
  - `newGameState` hat `version: 5` und dazu `quests: {}`, `keys: []`, `secrets: {}`.
  - `giveKey(s, 'lantern')` liefert beim ersten Mal true, beim zweiten false; `hasKey(s, 'lantern')`; `giveKey(s, 'besen') === false`.
  - Futterbeutel: Mit 10 Beeren passt keine weitere; nach `giveKey(s, 'foodbag')` passen 10 mehr, bei 20 ist Schluss.
  - Umwandlung: v1 bis v4 werden zu Format 5 mit leeren Feldern. Der neue Test „Spielstand der Fassung 5 bleibt für immer ladbar“ mit der Fixture.
  - Reparatur: `quests: { q1: { step: 1, done: false }, q9: {…}, q2: { step: -1 } }` → `{ q1: { step: 1, done: false } }`; `keys: ['lantern', 'lantern', 'besen']` → `['lantern']`; `secrets: { eiche: { story: true, stone: 'x' }, mond: {…} }` → `{ eiche: { story: true, stone: false } }`.
  - Ein Stand mit `keys: ['foodbag']` und 18 Futter behält beim Laden alle 18.
- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Umsetzen.**
  - Die Fixture: `SPIELSTAND_V5 = { ...SPIELSTAND_V4, version: 5, quests: { q1: { step: 1, done: false } }, keys: ['foodbag'], secrets: {} }`. Die `.txt` mit `encodeSave`.
  - Die neuen Dateien kommen in `FILES`.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`, und die Fixtures v1 bis v4 sind unverändert.
- [ ] **Step 5: Commit**: `Spielstand-Format 5: Aufträge, Schlüsselgegenstände, Futterbeutel`

---

### Task 2: Die Logik der Aufträge

**Files:**
- Create: `js/world/quests.js`, `tests/quests.test.js`
- Modify: `js/data/quests.js` (bis Task 3 nur `q1` bis `q5` mit Schritten und Belohnung, ohne Texte), `sw.js`

**Interfaces:**
- **`questFor(state, mapId, npcId)`** sagt, was ein Bewohner zu einem Auftrag zu sagen hat. Es gibt höchstens einen Auftrag je Bewohner und Rolle.
  - `offer`: Er ist Auftraggeber, der Auftrag ist noch nicht angenommen.
  - `remind`: Der Auftrag ist angenommen, der nächste Schritt ist kein Gespräch mit ihm.
  - `step`: Der nächste Schritt ist ein Gespräch mit ihm, und es ist nicht der letzte.
  - `finish`: Es ist der letzte Schritt beim Auftraggeber, und der Stein leuchtet.
  - `locked`: wie `finish`, aber der Stein leuchtet noch nicht.
  - `done`: Der Auftrag ist erledigt.
- **`finishQuest`:**
  - setzt `done`
  - gibt 50 XP über `gainXp`
  - gibt den Gegenstand über `addItem` (Lebensstein) oder `giveKey` (Schlüsselgegenstand)
  - liefert `report` mit `stageBefore`, `stageAfter` und `levelsGained`, für Level-Zeilen und Entwicklung
  - Passt Futter nicht mehr, steht `kept: false` (gilt für Plan 4d).

- [ ] **Step 1: Tests schreiben**

```js
test('Ein Auftrag: annehmen, Schritt für Schritt, Abschluss erst nach dem Stein, nur einmal Belohnung', () => {
  const s = newGameState({ name: 'A', species: 'nixi', nickname: null });
  assert.deepEqual(questFor(s, 'bucht', 'bram'), { quest: QUESTS[0], role: 'offer' });
  assert.equal(acceptQuest(s, 'q1'), true);
  assert.equal(acceptQuest(s, 'q1'), false);
  assert.equal(questFor(s, 'bucht', 'bram').role, 'remind');
  assert.deepEqual(activePickups(s, 'bucht').map(p => p.id), ['muschel']);
  assert.equal(advanceQuest(s, 'q1', 0), true);
  assert.deepEqual(activePickups(s, 'bucht'), []);
  assert.equal(questFor(s, 'bucht', 'bram').role, 'locked'); // Stein 1 leuchtet noch nicht
  assert.equal(finishQuest(s, 'q1'), null);
  s.stones = [1];
  assert.equal(questFor(s, 'bucht', 'bram').role, 'finish');
  const r = finishQuest(s, 'q1');
  assert.deepEqual([r.xp, r.key, hasKey(s, 'foodbag')], [50, 'foodbag', true]);
  assert.equal(finishQuest(s, 'q1'), null);
  assert.equal(questFor(s, 'bucht', 'bram').role, 'done');
});

test('Gast-Bewohner und Zwischenschritte: Flo steht nur im Wald, solange er gesucht wird', () => {
  const s = newGameState({ name: 'A', species: 'nixi', nickname: null });
  assert.deepEqual(activeGuests(s, 'wald'), []);
  acceptQuest(s, 'q3');
  assert.deepEqual(activeGuests(s, 'wald').map(g => g.id), ['flo']);
  assert.equal(questFor(s, 'wald', 'flo').role, 'step');
  advanceQuest(s, 'q3', 0);
  assert.deepEqual(activeGuests(s, 'wald'), []);
});

test('Belohnungen: Lebensstein bei drei wirkenden wird nicht verschluckt, 3 Glanzsteine passen immer', () => {
  // q2 (Lebensstein) mit creature.lifeStones = 3 → report.item === 'farsight' (wie rollStone), kept true
  // q4 → bag.shine += 3
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Umsetzen.**
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Commit**: `Aufträge: Annehmen, Schritte, Abschluss nach dem Leuchtstein`

---

### Task 3: Die fünf Aufträge in der Welt

**Files:**
- Modify: `js/data/quests.js` (Texte), `js/i18n/en-world.js` oder neu `js/i18n/en-quests.js`, `js/scenes/worldEvents.js`, `js/scenes/world.js` (Gast-Bewohner zeichnen), `js/gfx/art/characters.js` (Flo), `js/gfx/art/tiles.js` (Requisit `questItem`, ein Glitzern wie die Fundstellen)
- Test: `tests/quests.test.js`, `tests/i18n.test.js`

**Interfaces:**
- **Texte je Auftrag**, auf Deutsch in `quests.js` und auf Englisch in `en-quests.js`:
  - `title`, `offer` (Zeilen), `remind`, `hint` (für das Tagebuch)
  - je Schritt `lines`
  - `locked` und `finish` (Zeilen beim Auftraggeber)
- **Gespräch mit dem Auftraggeber bei `offer`:** Die Zeilen, dann die Wahl `Ja, ich helfe!` oder `Später` (en: `Yes, I will help!` / `Later`).
- **Vorrang:** Ein Auftrag geht vor den normalen Zeilen. Danach sagt der Bewohner wieder seine Zeilen aus der Karte.
- **Fundstück:**
  - Requisit `questItem`, glitzert wie eine Fundstelle (höchstens 1 Hz)
  - Aufheben mit A vom Nachbarfeld, mit dem Satz `stepLines`
- **Abschluss:**
  - Zeilen `finish`, dann `+50 XP` (`quest.reward`).
  - Dann der Gegenstand: `Du bekommst den Futterbeutel!` und ähnlich, in der Sprache des Spiels.
  - Dann die Level-Zeilen und gegebenenfalls `playEvolution` mit `evolutionLines` (wie nach einem Zettel).
- Das Kind spricht im Text als „du“. Bewohner duzen.

- [ ] **Step 1: Tests schreiben**
  - Jeder Auftrag hat Texte auf Deutsch und Englisch, mit gleich vielen Schritten. Jede Zeile ist höchstens etwa 90 Zeichen lang.
  - Jedes `pickup` liegt auf einem begehbaren Feld seiner Karte, das kein Objekt belegt. Jeder Gast steht auf so einem Feld.
  - Jedes `talk` nennt einen Bewohner, den es auf der Karte gibt, oder einen Gast.
  - Alle Orte eines Auftrags liegen in den Gebieten 1 bis k.
- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Umsetzen.**
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Im Browser.** Mit `?dev&gebiet=duenen` (Steine 1 bis 3):
  - Auftrag 1 ganz spielen: annehmen, Muschel aufheben, bei Bram abschließen. Der Rucksack zeigt den Futterbeutel, Englisch mit dem Beispielpaket.
  - Auftrag 3 bis zu Flo.
  - Danach ein wildes Duell in der Welt: Rückkehr in die Welt.
- [ ] **Step 6: Commit**: `Die Aufträge der Gebiete 1 bis 5`

---

### Task 4: Aufträge im Tagebuch

**Files:**
- Modify: `js/menu/diaryPage.js`, `css/spiel.css`, `js/i18n/de.js`, `en.js`
- Test: `tests/quests.test.js`

**Interfaces:**
- `questLog(state)`: angenommene Aufträge in der Reihenfolge von `QUESTS`, mit `title` und `done`. Für offene Aufträge kommt `hint` dazu, der Satz zum nächsten Schritt.
- **Tagebuch:**
  - oben der Abschnitt „Aufträge“ (en „Tasks“), offen mit „○“ und Hinweis, erledigt mit „✓“
  - Ohne angenommenen Auftrag steht dort „Noch keine Aufträge. Sprich mit den Leuten auf der Insel!“
  - darunter wie bisher „Geschichte“

- [ ] **Step 1: Test schreiben.** `questLog` nach `acceptQuest('q1')` und Abschluss von `q3`: Reihenfolge, `done`, `hint`.
- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Umsetzen.**
- [ ] **Step 4: `# fail 0`.**
- [ ] **Step 5: Commit**: `Aufträge im Tagebuch`

---

### Task 5: Geheime Orte: Eingang, Schlüssel, Geschichte und Stein

**Files:**
- Create: `js/data/secrets.js`, `tests/secrets.test.js`
- Modify:
  - `js/world/network.js` (`MAPS` um geheime Karten; `areaOpen` und Reisen behandeln sie wie ihr Gebiet)
  - `js/scenes/worldEvents.js` (Eingang, Geschichtsstein, Stein, eigene Tabelle wilder Wesen)
  - `js/scenes/duel.js` (`makeWildSetup` nimmt `def.wild`, wenn es sie gibt)
  - `js/menu/diaryPage.js` (Geheimstücke unter „Geschichte“)
  - `js/save/migrate.js` (`canStand` kennt die neuen Karten)
- Test: `tests/secrets.test.js`, `tests/network.test.js`

**Interfaces:**
- **`SECRET_PLACES`:**
  - `{ eiche: { area: 2, key: 'lantern', stone: 'life', story: {…} }, glasturm: { area: 4, key: 'hook', stone: 'farsight', story: {…} } }`
  - Die Geheimstücke der Geschichte stehen in `js/data/story.js` als `SECRET_STORY` und auf Englisch in `en-story.js`.
- **Eingang ohne Schlüssel:** Die Zeilen `lockedLines` des Eingangs, etwa „Im Inneren ist es stockdunkel. Mit einer Laterne könntest du hineingehen.“ (en: „It is pitch dark inside. With a lantern you could go in.“).
- **Eingang mit Schlüssel:** ein Satz, etwa „Du zündest die Laterne an und gehst hinein.“, dann `travelTo` in die Karte.
- **Geheime Karten:**
  - `area` wie ihr Gebiet, also offen, wenn das Gebiet offen ist
  - `respawn` vor dem Ausgang
  - kein Leuchtstein, Reisen nur zu Fuß hinein und hinaus
- **Geschichtsstein** `type: 'storystone'`: Beim ersten Mal das Geheimstück mit der Überschrift „Ein Stück Geschichte“, danach „Die Inschrift kennst du schon.“ Das Tagebuch zeigt die Geheimstücke unter „Geheime Orte“.
- **Stein** `type: 'secretstone'`: glitzert, bis er aufgehoben ist. Danach ist er weg, auch nach dem Neuladen.
- **Paketwechsel:** Liegt das Gebiet im Nebel, landet man wie bisher am höchsten offenen Stein (`resolveStart`).

- [ ] **Step 1: Tests schreiben**
  - `secretOpen` ohne und mit Schlüssel.
  - `takeSecretStory` gibt beim ersten Mal den Text, beim zweiten null. Dasselbe für `takeSecretStone`: Lebensstein bei 3 wirkenden wird `farsight`.
  - `resolveStart` für eine Position in der Eiche bei einem Paket mit nur Trainer 1 ergibt den Leuchtturm.
  - `makeWildSetup` auf einer geheimen Karte zieht die eigene Art. Das wird über die reine Hilfsfunktion `wildTableFor(def)` in `encounters.js` getestet.
- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Umsetzen.**
- [ ] **Step 4: `# fail 0`.**
- [ ] **Step 5: Commit**: `Geheime Orte: Eingang mit Schlüssel, Geschichtsstein und seltener Stein`

---

### Task 6: Die Hohle Eiche

**Files:**
- Create: `js/world/maps/eiche.js`, `tests/eiche.test.js`
- Modify:
  - `js/world/maps/wald.js` (hohle Eiche bei (5, 12) als Requisit `hollowoak` mit Eingang)
  - `js/gfx/art/tiles.js` (Kacheln `rootwall` (blockiert), `rootfloor`, `rootmoss` (hohes Gras); Requisit `hollowoak`)
  - `js/world/map.js`, `js/scenes/world.js` (Dunkelheit mit Lichtkreis der Laterne)
  - `js/data/species.js`, `js/i18n/en-species.js`, `js/gfx/art/creatures.js` (Wurzelgeist), `js/data/book.js` (Platz 25)
  - `js/i18n/en-world.js`, `sw.js`
- Test: `tests/eiche.test.js`, `tests/species.test.js`, `tests/i18n.test.js`, `tests/book.test.js`

**Interfaces:**
- **Karte `eiche`** (20 × 12, Gebiet 2):
  - Eingang unten links, ein gewundener Gang zwischen Wurzeln
  - ein Feld `rootmoss` mit dem Wurzelgeist
  - hinten der Geschichtsstein und der Lebensstein
  - Ausgang zurück vor die Eiche (5, 13)
- **Dunkelheit:**
  - Über der Karte liegt `rgba(12, 10, 24, 0.86)`, um die Spielfigur ein weicher Lichtkreis mit Radius 40 px.
  - Er flackert leicht mit höchstens 2 Hz, bei „Bewegung reduzieren“ steht er still.
  - Die Karte hat dafür `dark: true`.
- **Wurzelgeist / Rootling:**
  - `kind: 'secret'`, `area: 2`, Buchplatz 25
  - ein kleiner Geist aus Wurzeln mit einer Laternenblume auf dem Kopf
  - Farben des Waldes, Glanzform wie alle
- **Geheimstück 1 (Claude):**
  - de: „Unter der Eiche schliefen früher die Kinder des Dorfes, wenn sie Geschichten hören wollten. Die Wurzeln merkten sich jedes Wort. Seit dem Nebel flüstern sie nur noch, wenn Licht in den Gang fällt.“
  - en: „Long ago, the village children slept under the oak when they wanted to hear stories. The roots remembered every word. Since the mist came, they only whisper when light falls into the tunnel.“
- Alle Texte der Karte auf Deutsch und Englisch.

- [ ] **Step 1: Tests schreiben**
  - Karte: Alles ist vom Eingang aus erreichbar, Ausgang und Ziele stimmen, der Eingang im Wald liegt vor der Eiche.
  - Art: Bild 32 × 32, eigene Silhouette, Name auf Deutsch und Englisch, Platz 25 im Buch.
  - i18n: die Texte der Karte auf Englisch.
- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Umsetzen.**
- [ ] **Step 4: `# fail 0`.**
- [ ] **Step 5: Im Browser**
  - Ohne Laterne: der Hinweis.
  - Mit Laterne (`?dev&gebiet=wald`, Laterne über die Konsole): hinein, Lichtkreis, Wurzelgeist im Wurzelmoos.
  - Geschichtsstein, Lebensstein, hinaus. Neu laden, wieder hinein: Stein und Stück sind weg.
- [ ] **Step 6: Commit**: `Die Hohle Eiche`

---

### Task 7: Der Glasturm

**Files:**
- Create: `js/world/maps/glasturm.js`, `tests/glasturm.test.js`
- Modify: `js/world/maps/duenen.js` (Öse bei (15, 4)), `js/gfx/art/tiles.js` (Kacheln `glassfloor`, `glasswall` (blockiert), `prismgrass` (hohes Gras); Requisit `hookring`), `js/world/map.js`, `js/data/species.js`, `js/i18n/en-species.js`, `js/gfx/art/creatures.js` (Prismalibelle), `js/data/book.js` (Platz 26), `js/i18n/en-world.js`, `sw.js`
- Test: `tests/glasturm.test.js`, `tests/species.test.js`, `tests/i18n.test.js`, `tests/book.test.js`

**Interfaces:**
- **Karte `glasturm`** (16 × 12, Gebiet 4):
  - die Plattform oben auf dem Turm, Glasboden mit Lichtbrechungen
  - am Rand der Himmel
  - ein Feld `prismgrass` mit der Prismalibelle
  - Geschichtsstein, Weitblickstein, Ausgang zurück zur Öse
- **Prismalibelle / Prismfly:**
  - `kind: 'secret'`, `area: 4`, Buchplatz 26
  - eine Libelle mit Flügeln aus Glas, die das Licht in Regenbogenfarben bricht
- **Geheimstück 2 (Claude):**
  - de: „Oben im Glasturm sammelte sich alles Licht der Dünen. Wer hinaufstieg, konnte die ganze Insel sehen und alle acht Leuchtsteine zugleich. Heute sieht man von hier nur den Nebel über dem Berg.“
  - en: „At the top of the glass tower, all the light of the dunes came together. From up here you could see the whole island and all eight light stones at once. Today you only see the mist over the mountain.“

- [ ] **Step 1: Tests** wie in Task 6.
- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Umsetzen.**
- [ ] **Step 4: `# fail 0`.**
- [ ] **Step 5: Im Browser**
  - Ohne Haken: der Hinweis.
  - Mit Haken: hinauf, die Prismalibelle, Stück und Stein, hinunter.
- [ ] **Step 6: Commit**: `Der Glasturm`

---

### Task 8: Abschluss von Plan 4c

- [ ] **Step 1:** Spielfassung `0.8.0`, README (Status, was neu ist), `FILES` vollständig. `node --test` ergibt `# fail 0`.
- [ ] **Step 2: Gesamtdurchlauf in Chrome ohne `?dev`** (frischer Cache, Port 8766). Stand im Format 4 einspielen: Steine 1 bis 5, Wesen Level 20, in den Klippen.
  1. Laden: Format 5, nichts verloren.
  2. Auftrag 5 annehmen und abschließen. Mit dem Kletterhaken in den Glasturm, die Prismalibelle im Buch als gesehen.
  3. Auftrag 3 abschließen. Mit der Laterne in die Hohle Eiche, das Geschichtsstück im Tagebuch.
  4. Auftrag 1: Futterbeutel. Der Rucksack zeigt „von 20 Plätzen“.
  5. Neu laden: alles da.
  6. Prüfmodus `?sprache=xx`: die Auftrags-Dialoge und die geheimen Orte ohne Text außerhalb von ⟦ ⟧.
  7. Ein wildes Duell in der Welt und in der Eiche: Rückkehr klappt.
- [ ] **Step 3: Commit**: `Plan 4c abschließen: Spielfassung 0.8.0 und README`
