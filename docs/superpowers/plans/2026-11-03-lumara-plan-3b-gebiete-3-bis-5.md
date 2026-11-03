# Lumara · Plan 3b: Pilzmoor, Spiegeldünen, Windklippen und Zeitdruck – Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hinter dem Waldläufer geht die Reise weiter durch drei neue Gebiete: das Pilzmoor, die Spiegeldünen und die Windklippen, jedes mit Hüterin oder Hüter, Bewohnern und drei wilden Arten. Ab Trainer 4 läuft im Duell eine Uhr, und der Zeitstein kann sie für eine Frage anhalten.

**Architecture:**
- Der Zeitdruck ist ein reines Modul `js/duel/timing.js` (Zeit pro Frage aus Trainer, Antwortform, Paketeinstellung und Wesen). Dazu kommt eine Uhr in der Duell-Zustandsmaschine `js/duel/duel.js`, die nur über `tick(ms)` aus der Spielschleife läuft.
- Die drei Gebiete sind Karten wie der Flüsterwald (`js/world/maps/*.js`). Die Systeme aus Plan 3a tragen sie ohne Umbau: Kartenverbund, Tore, Leuchtsteine, Futter, Steine, Zettel und Teilchen.
- Neu für die Welt sind:
  - Zierobjekte (`type: 'deco'`) für Riesenpilze, Glasstatuen und Windräder
  - Luftspiegelungen: Kacheln, die wie ein Weg aussehen, und ein „Anstoßen“-Ereignis der Spielfigur
- Spielstand-Format 3: Der Rucksack bekommt den Zeitstein.

**Tech Stack:** wie Plan 1 bis 3a, ohne neue Bausteine.

**Spec:** `docs/superpowers/specs/2026-11-01-lernwelt-rpg-design.md` (im Folgenden „Design“). Vorgänger:
- `docs/superpowers/plans/2026-11-03-lumara-plan-3a-welt-fluesterwald.md` („Plan 3a“)
- dazu Plan 1 und Plan 2

**Umfang:** Design 17, Schritt 5, für die Gebiete 3 bis 5:
- die Gebiete selbst (5.3, 5.6: 2 bis 4 Bewohner je Gebiet)
- wilde Arten (6.4: 2 häufige, 1 seltene je Gebiet)
- Trainer 3 bis 5 (7.4)
- Zeitdruck (7.1, 7.4) und Zeitstein (7.6, 8.2)
- Geschichtsstücke für die Gebiete 3 bis 5 (5.5)
- Teilchen (5.3)
- Beispielpaket mit den Themen 3 bis 5 und 20 Zetteln (10.5)
- die fünf Kleinigkeiten aus der Abschlussprüfung von Plan 3a

**Bewusst noch nicht in diesem Plan:**
- Revanchen und ihre Zeiten: Plan 5
- Aufträge, Schlüsselgegenstände und geheime Orte: Plan 4. Die Karten lassen den Platz dafür aber schon frei:
  - Die Irrlichtinsel im Pilzmoor ist zu sehen, aber nicht erreichbar.
  - Der Glasturm in den Spiegeldünen ist zu sehen, aber nicht erreichbar.
- Gebiete 6 bis 8 und die Karte im Menü: Plan 3c. Hinter den Windklippen bleibt der Nebelrand mit dem Schild „entsteht gerade“.
- Musik und Ton: Plan 6

**Arbeitszweig:** `feature/gebiete`, abgezweigt von `feature/welt` (PR #3 ist noch offen). Erster Commit ist dieser Plan.

## Global Constraints

- Die Global Constraints aus Plan 1, 2 und 3a gelten weiter, vor allem:
  - keine Abhängigkeiten, alles im Code gezeichnet
  - Spieltexte auf Deutsch, Bezeichner englisch
  - Zahlen in `js/config.js`
  - Tests mit `node --test` und `# fail 0`
  - Commit-Nachrichten auf Deutsch mit `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- **Spielstände:**
  - Format 1 und Format 2 müssen ladbar bleiben. `tests/fixtures/spielstand-v1.*` und `spielstand-v2.*` bleiben unverändert und müssen sich in Format 3 umwandeln lassen.
  - Format 3 bekommt `tests/fixtures/spielstand-v3.{js,txt}`. Diese Datei wird ab diesem Plan ebenfalls nie mehr geändert.
  - Neue Felder brauchen eine Reparaturregel in `migrateState`.
- **Zeitdruck (Design 7.4):**
  - Es gilt nur für Trainer mit Zeit in `CONFIG.trainers`, also ab Trainer 4. Wilde Wesen und Zettel haben nie Zeitdruck.
  - Zeit pro Frage: Grundzeit des Trainers, beim Eintippen ×1,5, beim Satzbau ×2. Bei `ZEITDRUCK: lang` gilt ×2, bei `aus` gibt es nie Zeitdruck. Flausch bekommt +25 % (Design 6.1).
  - Abgelaufene Zeit zählt als falsch (Design 7.1).
  - Die Uhr läuft nur, solange eine Frage zu sehen ist. Sie steht während Rückmeldungen und Textfenstern, bei der Futterauswahl, bei „Aufgeben?“ und solange die App verdeckt ist.
- **Barrierefreiheit:**
  - Der Zeitbalken blinkt nie.
  - Wenn die Zeit knapp wird, zeigt er das mit Farbe und Muster zusammen, nicht mit Farbe allein.
  - Bei „Bewegung reduzieren“ bewegen sich Luftspiegelungen, Wolken und Windräder nicht, und es gibt höchstens ein Viertel der Teilchen.
- **Spieltexte** (Bewohner, Schilder, Inschriften, Geschichtsstücke) sind kindgerecht, ohne Gewalt und je Zeile höchstens etwa 90 Zeichen lang. Morrows Name kommt in diesem Plan nicht vor (Design 5.4).
- **Gebaute Gebiete:** `CONFIG.world.builtAreas` steigt mit den Karten-Tasks auf 3, 4 und 5.
- **Spielfassung** am Ende: `0.4.0` an allen drei Stellen. Neue Dateien kommen in `FILES` in `sw.js`.

## Review Focus

1. **Die Uhr läuft, obwohl das Kind gar keine Frage vor sich hat:** bei der Futterauswahl, bei „Aufgeben?“, in der Rückmeldung oder wenn die App im Hintergrund ist. Erwartet wird, dass die Uhr steht und das Kind danach dieselbe Restzeit hat. → Test in Task 4 (`tick` außerhalb von `question`), Einbindung in Task 6.
2. **Antwort und Zeitablauf im selben Augenblick:** Es zählt genau eines, nie beides und nie doppelt. → Test in Task 4.
3. **Pakete mit `ZEITDRUCK: aus` oder `lang`**, Flausch, Eintippen und Satzbau: Erwartet werden nie eine Uhr bzw. die richtigen Zeiten, auch in Kombination. → Tests in Task 3.
4. **Spielstände aus Fassung 0.2 und 0.3:** Sie öffnen sich in 0.4.0 an ihrem Ort, mit 0 Zeitsteinen und ohne Verlust. → Tests in Task 2.
5. **Paket mit weniger Trainern, während das Kind im Moor, in den Dünen oder auf den Klippen steht:** Erwartet wird, dass das Kind am höchsten offenen Leuchtstein aufwacht und nicht im Nebel festsitzt. → Tests in Task 9 und Task 10 (`resolveStart`).

---

## Dateistruktur (neu und geändert)

```
js/config.js                 + time, finds.tableTimed, notes.rewardsTimed, world.builtAreas 3 → 5
js/state.js, js/save/migrate.js   Format 3 (bag.time), Umwandlung 2 → 3
js/items/bag.js              + 'time' in BAG_ITEMS
js/items/stones.js           Fundtabelle je Gebiet, Zeitstein-Text, Schutz vor Doppelaufruf
js/world/notes.js            Belohnung je Gebiet, verlorene Belohnung, Entwicklung, Schutz vor Doppelaufruf
js/world/network.js          + moor, duenen, klippen in MAPS; npcLines mit linesOpen
js/world/player.js           + Ereignis 'bump' (Anstoßen)
js/world/maps/moor.js, duenen.js, klippen.js   neu
js/world/maps/wald.js        + Ausgang nach Norden ins Moor
js/duel/timing.js            neu: Zeit pro Frage
js/duel/duel.js              + Uhr: tick, timeLeft, freezeTime
js/ui/duelPanel.js           + Zeitbalken, Zeitstein-Knopf, interrupt()
js/scenes/duel.js            Uhr aus der Spielschleife, Zeitablauf, Zeitstein
js/scenes/world.js           + Zierobjekte, bewegte Kacheln, Anker für Teilchen
js/scenes/worldEvents.js     + Luftspiegelungs-Hinweis, Zierobjekt-Inschriften, Gebiet an Funde und Zettel
js/data/species.js           + neun Arten, AREA_WILD[3..5], TRAINER_CREATURES[3..5]
js/data/story.js             + STORY[3], STORY[4], STORY[5]
js/gfx/art/tiles.js          + Kacheln und Requisiten der drei Gebiete
js/gfx/art/characters.js     + trainer3, trainer4, trainer5 und sieben Bewohner
js/gfx/art/creatures.js      + zwölf Bilder (neun Arten, drei Stufe-2-Formen)
js/gfx/arena.js              + Moor-, Dünen- und Klippenarena
js/gfx/particles.js          + spore, bubble, wisp, sand, glint, windstreak, cloud; Anker je Art
js/menu/bagPage.js           + Zeitsteine
pakete/englisch-6-beispiel.txt   + Trainer 3 bis 5, mindestens 20 Zettel
tests/…                      je Task, dazu tests/fixtures/spielstand-v3.{js,txt}
```

## Gemeinsame Schnittstellen

```js
// Spielstand Format 3 = Format 2, aber der Rucksack hat einen Zeitstein-Zähler:
GameState v3 = { ...GameState v2, version: 3, bag: { berry, starfruit, farsight, shine, time } }

// Zeitdruck (Task 3)
questionTimeMs({ trainerNumber: number | null, form: 'choice'|'typing'|'tiles',
                 setting: 'normal'|'lang'|'aus', species: string }) → number | null   // Millisekunden
timerFor(setup, species) → (presented) => number | null   // setup.time = { trainerNumber, setting } oder fehlt

// Duell (Task 4), zusätzlich zu Plan 1 bis 3a
createDuel({ ..., timeFor?: (presented) => number | null })
duel.timeLimit: number | null, duel.timeLeft: number | null, duel.frozen: boolean
duel.tick(ms) → AnswerResult | null     // AnswerResult wie bei answer(), dazu timedOut: true
duel.canFreeze() → boolean, duel.freezeTime() → boolean

// Kartenobjekte (Task 7)
{ type: 'deco', id?, x, y, prop: string, anim?: boolean, lines?: string[] }   // blockiert, wird von unten gezeichnet
NPC { ..., lines, linesLit?, linesOpen? }   // linesOpen: wenn das nächste Gebiet offen ist (Task 1)

// Teilchen (Task 7)
createParticles(kinds, { rng, reducedMotion, width, height, shore?, anchors?: { [kind]: [wx, wy][] } })
```

---

### Task 1: Kleinigkeiten aus der Abschlussprüfung von Plan 3a

**Files:**
- Modify: `js/world/network.js` (`npcLines`), `js/world/maps/bucht.js` (Bram, Ilvy), `js/world/notes.js`, `js/items/stones.js`, `js/scenes/note.js`, `js/scenes/worldEvents.js` (`AFTER_WIN`, Entwicklung nach Zettel)
- Test: `tests/network.test.js`, `tests/notes.test.js`, `tests/stones.test.js`, `tests/worldArea.test.js`

**Interfaces:**
- Produces:
  - `npcLines(o, state, area, pack) → string[]`:
    1. `o.linesOpen`, wenn `areaOpen(state, pack, area + 1)`
    2. sonst `o.linesLit`, wenn `state.stones.includes(area)`
    3. sonst `o.lines`
  - `solveNote(...) → { xp, item, lost, story, evolved }`:
    - `lost`: die gezogene Belohnung, die nicht mehr in den Rucksack passte, sonst `null`
    - `evolved`: `true`, wenn die Stufe gestiegen ist
    - Ist der Zettel nicht bereit, wird nichts verändert.
  - `takeFind(...)` gibt bei einer nicht bereiten Fundstelle `{ item: null, added: 0 }` zurück und verändert nichts.

- [ ] **Step 1: Tests schreiben**

```js
// tests/network.test.js
test('Bewohner: Sätze zum offenen Weg erst, wenn das nächste Gebiet wirklich offen ist', () => {
  const o = { lines: ['a'], linesLit: ['lit'], linesOpen: ['offen'] };
  assert.deepEqual(npcLines(o, st([]), 1, pack(2)), ['a']);
  assert.deepEqual(npcLines(o, st([1]), 1, pack(1)), ['lit']);   // Stein leuchtet, Wald liegt im Nebel
  assert.deepEqual(npcLines(o, st([1]), 1, pack(2)), ['offen']);
  assert.deepEqual(npcLines({ lines: ['a'], linesLit: ['lit'] }, st([1]), 1, pack(2)), ['lit']);
});
// tests/notes.test.js (den bestehenden Test für „falsch“ auf die neue Form umstellen)
assert.deepEqual(solveNote(s, 'bucht:3,12', 1, false, seq(0)), { xp: 0, item: null, lost: null, story: null, evolved: false });
test('Zettel zweimal gelöst (Doppeltipp): Nur das erste Mal zählt', () => {
  const s = s0(); s.playMs = 0;
  solveNote(s, 'bucht:3,12', 1, true, seq(0.6));
  assert.deepEqual(solveNote(s, 'bucht:3,12', 1, true, seq(0.6)), { xp: 0, item: null, lost: null, story: null, evolved: false });
  assert.equal(s.story[1], 1);
});
test('Belohnung bei vollem Rucksack wird gemeldet, nicht verschluckt', () => {
  const s = s0(); s.bag.berry = 10;
  const r = solveNote(s, 'bucht:1,1', 1, true, seq(0, 0));
  assert.equal(r.item, null); assert.equal(r.lost, 'berry');
});
test('Zettel-XP lassen das Wesen sich entwickeln: evolved', () => {
  const s = s0(); s.creature.level = 14; s.creature.xpInLevel = xpToNext(14) - 5;
  assert.equal(solveNote(s, 'bucht:1,1', 1, true, seq(0.6)).evolved, true);
});
// tests/stones.test.js
test('Fundstelle zweimal aufgehoben: beim zweiten Mal nichts', () => {
  const s = s0(); takeFind(s, 'wald:5,6', seq(0));
  assert.deepEqual(takeFind(s, 'wald:5,6', seq(0)), { item: null, added: 0 });
  assert.equal(s.bag.farsight, 1);
});
// tests/worldArea.test.js
test('Jeder Trainer jeder Karte hat einen Satz nach dem Sieg (afterWin)', () => {
  for (const def of Object.values(MAPS)) for (const t of def.objects.filter(o => o.type === 'trainer')) assert.ok(t.afterWin, def.id);
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL (die neuen Tests und der umgestellte Test für „falsch“).
- [ ] **Step 3: Umsetzen**
  - **`npcLines`:** wie im Interfaces-Block oben. `worldEvents` ruft die Funktion mit `game.pack.data` auf.
  - **Bucht:**
    - Brams Satz „Hast du den Nebel im Norden gesehen? Er ist weg!“ wandert nach `linesOpen`. Bei `linesLit` sagt Bram dann: „Der Leuchtstein strahlt! Jetzt fange ich wieder Fische bei Nacht.“
    - Auch Ilvys Satz über den Weg nach Norden wandert nach `linesOpen`.
  - **Zettel:**
    - Passt die gezogene Belohnung nicht in den Rucksack, steht sie in `lost`. Das Zettel-Fenster zeigt dann „Du findest außerdem {Gegenstand}. Dein Rucksack ist voll.“
    - Bei `evolved` folgt nach den Level-Zeilen „{Wesen} wird stärker!“, wie im Duell.
  - **`AFTER_WIN`:** entfällt. Statt `t.afterWin ?? AFTER_WIN` heißt es nur noch `t.afterWin`, das der Test für jede Karte verlangt.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Im Browser prüfen** (`?dev`, Paket nur mit Trainer 1)
  - Hüterin besiegen. Danach spricht Bram nicht mehr vom verschwundenen Nebel.
  - Mit dem vollständigen Paket sagt er ihn.
- [ ] **Step 6: Commit**: `git commit -m "Kleinigkeiten aus Plan 3a: Bewohner, Zettel-Belohnung, Entwicklung, Doppelaufruf"`

---

### Task 2: Spielstand-Format 3 und der Zeitstein im Rucksack

**Files:**
- Modify: `js/items/bag.js`, `js/state.js`, `js/save/migrate.js`, `js/items/stones.js` (`STONE_LINES.time`), `js/menu/bagPage.js`
- Create: `tests/fixtures/spielstand-v3.js`, `tests/fixtures/spielstand-v3.txt`
- Test: `tests/migrate.test.js`, `tests/bag.test.js`, `tests/state.test.js`, `tests/stones.test.js`

**Interfaces:**
- Produces:
  - `BAG_ITEMS = ['berry', 'starfruit', 'farsight', 'shine', 'time']`. `emptyBag()` hat `time: 0`.
  - `CURRENT_VERSION = 3`. `MIGRATIONS[2] = s => ({ ...s, version: 3, bag: { ...s.bag, time: 0 } })`.
  - `newGameState` gibt `version: 3` zurück.
  - `STONE_LINES.time = () => 'Du findest einen Zeitstein!'`

- [ ] **Step 1: Tests schreiben**

```js
// tests/fixtures/spielstand-v3.js – NIE ÄNDERN
export const SPIELSTAND_V3 = { ...structuredClone(SPIELSTAND_V2), version: 3, bag: { berry: 4, starfruit: 1, farsight: 2, shine: 0, time: 1 } };
// tests/migrate.test.js
// Test „Fassung 1“: erwartet jetzt version 3 und bag { berry: 0, starfruit: 0, farsight: 0, shine: 0, time: 0 }
test('Spielstand der Fassung 2 bleibt für immer ladbar und wird zu Format 3', () => {
  const d = decodeSave(readFileSync(new URL('./fixtures/spielstand-v2.txt', import.meta.url), 'utf8'));
  assert.deepEqual(migrateState(d.value), { ok: true, state: { ...SPIELSTAND_V2, version: 3, bag: { ...SPIELSTAND_V2.bag, time: 0 } } });
});
test('Spielstand der Fassung 3 bleibt für immer ladbar', () => {
  const d = decodeSave(readFileSync(new URL('./fixtures/spielstand-v3.txt', import.meta.url), 'utf8'));
  assert.deepEqual(migrateState(d.value), { ok: true, state: SPIELSTAND_V3 });
});
test('Format 3: unmögliche Zeitsteine werden 0', () => {
  for (const time of [-1, 'x', 1.5]) assert.equal(migrateState({ ...structuredClone(SPIELSTAND_V3), bag: { ...SPIELSTAND_V3.bag, time } }).state.bag.time, 0);
});
// tests/bag.test.js: Zeitsteine zählen nicht als Futter und haben keine Grenze
test('Zeitsteine: unbegrenzt, kein Futter', () => {
  const s = newGameState({ name: 'A', species: 'nixi', nickname: null });
  assert.equal(addItem(s, 'time', 25), 25); assert.equal(foodCount(s.bag), 0);
});
```

- [ ] **Step 2: Die Datei `tests/fixtures/spielstand-v3.txt`** einmalig mit `encodeSave(SPIELSTAND_V3)` erzeugen (kleines Node-Skript im Scratchpad, nicht im Repo). Danach `node --test`. Erwartet: FAIL, weil die Umwandlung 2 → 3 fehlt.
- [ ] **Step 3: Umsetzen**
  - Umwandlung und Reparatur wie im Interfaces-Block oben. `repairBag` deckt `time` über `BAG_ITEMS` ab.
  - **Rucksack-Seite:** Neue Zeile „Zeitsteine“ mit dem Hinweis „Im Duell mit Zeitdruck: hält die Zeit für eine Frage an.“ Sie hat keinen Knopf.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`, auch für die Fixtures von Format 1 und 2.
- [ ] **Step 5: Commit**: `git commit -m "Spielstand-Format 3 mit dem Zeitstein im Rucksack"`

---

### Task 3: Zeit pro Frage

**Files:**
- Create: `js/duel/timing.js`
- Modify: `js/config.js`
- Test: `tests/timing.test.js`

**Interfaces:**
- Produces:
  - `CONFIG.time = { fromArea: 4, typing: 1.5, tiles: 2, long: 2, flausch: 0.25, lowShare: 0.25 }`
  - `questionTimeMs({ trainerNumber, form, setting, species }) → number | null`:
    1. Grundzeit `CONFIG.trainers[trainerNumber − 1].time` Sekunden
    2. × Formfaktor (choice 1, typing `typing`, tiles `tiles`)
    3. × `long` bei `setting === 'lang'`
    4. × (1 + `flausch`) bei Flausch
    5. auf ganze Millisekunden gerundet
    - `null`, wenn es keinen Trainer gibt, der Trainer keine Zeit hat oder `setting === 'aus'`.
  - `timerFor(setup, species) → (presented) => number | null`: liest `setup.time = { trainerNumber, setting }`. Fehlt `setup.time`, gibt es keine Uhr.

- [ ] **Step 1: Tests schreiben**

```js
const t = (trainerNumber, form = 'choice', setting = 'normal', species = 'nixi') => questionTimeMs({ trainerNumber, form, setting, species });
test('Trainer 4: 40 s, Eintippen 60 s, Satzbau 80 s', () => {
  assert.equal(t(4), 40000); assert.equal(t(4, 'typing'), 60000); assert.equal(t(4, 'tiles'), 80000);
});
test('Trainer 1 bis 3, wilde Wesen und ZEITDRUCK: aus haben keine Uhr', () => {
  for (const n of [1, 2, 3]) assert.equal(t(n), null);
  assert.equal(t(null), null); assert.equal(t(5, 'tiles', 'aus'), null);
});
test('ZEITDRUCK: lang verdoppelt, Flausch bekommt 25 % mehr, beides zusammen', () => {
  assert.equal(t(5, 'choice', 'lang'), 70000);
  assert.equal(t(4, 'choice', 'normal', 'flausch'), 50000);
  assert.equal(t(4, 'tiles', 'lang', 'flausch'), 200000);
  assert.equal(t(8, 'typing'), 30000);
});
test('timerFor: Uhr nur mit setup.time', () => {
  assert.equal(timerFor({ kind: 'wild' }, 'nixi')({ form: 'choice' }), null);
  assert.equal(timerFor({ kind: 'trainer', time: { trainerNumber: 4, setting: 'normal' } }, 'nixi')({ form: 'typing' }), 60000);
});
```

- [ ] **Step 2: `node --test tests/timing.test.js`.** Erwartet: FAIL (Modul fehlt).
- [ ] **Step 3: `js/duel/timing.js` und `CONFIG.time` umsetzen**, mit den Werten aus dem Interfaces-Block oben.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Commit**: `git commit -m "Zeitdruck: Zeit pro Frage nach Trainer, Form, Paket und Wesen"`

---

### Task 4: Die Uhr im Duell

**Files:**
- Modify: `js/duel/duel.js`
- Test: `tests/duel.test.js`

**Interfaces:**
- Consumes: `timeFor` aus `timerFor` (Task 3)
- Produces:
  - **Neue Frage:** Bei `ask()` und `swap()` gilt `timeLimit = timeLeft = timeFor(current)` und `frozen = false`. Ohne `timeFor` bleiben `timeLimit` und `timeLeft` `null`.
  - **`tick(ms)`:**
    - Es wirkt nur im Zustand `question`, mit Uhr und ohne `frozen`. Sonst gibt es `null` zurück und verändert nichts.
    - Es zieht `ms` ab. Bei ≤ 0 setzt es `timeLeft = 0` und gibt das Ergebnis einer falschen Antwort zurück, mit `timedOut: true`.
  - **Zeitablauf:** Er zählt wie eine falsche Antwort. Es gelten Schild, zweite Chance und Energieverlust, und die Antwort wird in `answers` vermerkt.
    - Nach einer zweiten Chance, egal ob durch Zeitablauf oder falsche Antwort, läuft die volle Zeit von vorn.
    - `frozen` bleibt für diese Frage bestehen.
  - **Zeitstein:** `canFreeze()` gilt im Zustand `question` mit Uhr und ohne `frozen`. `freezeTime()` setzt `frozen` und gibt `true` zurück, sonst `false`.

- [ ] **Step 1: Tests schreiben** (`mk` aus der bestehenden Datei, ergänzt um `timeFor`)

```js
const timed = (p = {}, ms = 1000) => createDuel({ kind: 'trainer', rng: createRng(1), timeFor: () => ms,
  player: { species: 'kiesel', stage: 1, energy: 4, maxEnergy: 4, ...p }, foe: { maxEnergy: 5 },
  deck: deckOf(['A', 'B', 'C'].map(t => q({ text: t, forms: ['typing'] }))) });
test('Zeit abgelaufen: zählt als falsch, Serie weg, 1 Energie', () => {
  const d = timed(); d.ask(); reply(d, true); d.next(); d.ask();
  assert.equal(d.tick(400), null); assert.equal(d.timeLeft, 600);
  const r = d.tick(700);
  assert.equal(r.correct, false); assert.equal(r.timedOut, true); assert.equal(d.timeLeft, 0);
  assert.equal(d.playerEnergy, 3); assert.equal(d.streak, 0); assert.equal(d.summary().answers.at(-1).correct, false);
});
test('Die Uhr steht außerhalb einer offenen Frage', () => {
  const d = timed(); assert.equal(d.tick(5000), null);            // ready
  d.ask(); reply(d, false);                                       // feedback
  assert.equal(d.tick(5000), null); assert.equal(d.state, 'feedback');
});
test('Antwort und Zeitablauf zugleich: Es zählt nur eines', () => {
  const d = timed(); d.ask(); d.tick(1500);
  assert.equal(d.answer({ text: d.current.question.answer }), null);
  const e = timed(); e.ask(); reply(e, true); assert.equal(e.tick(1500), null);
  assert.equal(e.summary().answers.length, 1);
});
test('Zeitstein hält die Uhr für diese Frage an, die nächste läuft wieder', () => {
  const d = timed(); d.ask(); assert.equal(d.canFreeze(), true); assert.equal(d.freezeTime(), true);
  assert.equal(d.tick(1e9), null); assert.equal(d.canFreeze(), false);
  reply(d, true); d.next(); d.ask(); assert.equal(d.frozen, false); assert.equal(d.timeLeft, 1000);
});
test('Zweite Chance nach Zeitablauf: volle Zeit von vorn', () => {
  const d = timed({ stage: 2 }); d.ask(); const r = d.tick(1000);
  assert.equal(r.secondChance, true); assert.equal(d.state, 'question'); assert.equal(d.timeLeft, 1000);
});
test('Ohne Zeitdruck keine Uhr', () => {
  const d = mk(); d.ask(); assert.equal(d.timeLimit, null); assert.equal(d.tick(1e9), null); assert.equal(d.canFreeze(), false);
});
```

- [ ] **Step 2: `node --test tests/duel.test.js`.** Erwartet: FAIL (`tick` fehlt).
- [ ] **Step 3: Uhr in `createDuel` umsetzen.** Zeitablauf und falsche Antwort teilen sich einen Zweig für „falsch“. Die Antwortprüfung wird dafür nicht doppelt geschrieben.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Commit**: `git commit -m "Duell: Uhr pro Frage, Zeitablauf zählt als falsch, Zeitstein hält sie an"`

---

### Task 5: Beispielpaket – Themen 3 bis 5 und 20 Zettel

**Files:**
- Modify: `pakete/englisch-6-beispiel.txt`
- Test: `tests/pakete.test.js`

**Interfaces:**
- Produces: Das Beispielpaket hat die Trainer 1 bis 5 und mindestens 20 Zettel. Die `KENNUNG` bleibt `englisch6-beispiel`.

- [ ] **Step 1: Tests anpassen**

```js
// Hinweis jetzt: 'Das Paket enthält nur Trainer 1 bis 5. Die Wege ab Gebiet 6 bleiben im Nebel.'
test('Beispielpaket: Trainer 1 bis 5 mit den Themen aus Design 10.5', () => {
  const p = parsePack(read('englisch-6-beispiel.txt')).pack;
  assert.deepEqual(p.trainers.map(t => [t.number, t.name]), [[1, 'Maren'], [2, 'Rowan'], [3, 'Hazel'], [4, 'Karim'], [5, 'Skye']]);
  assert.ok(p.notes.length >= 20);
});
```
  Der bestehende Test „je Trainer mindestens 20 Fragen und jede Form mindestens 5-mal“ gilt jetzt auch für die Trainer 3 bis 5.
- [ ] **Step 2: `node --test tests/pakete.test.js`.** Erwartet: FAIL.
- [ ] **Step 3: Paket schreiben** (Claude). Englisch auf Niveau A2, Dialoge in einfachem Englisch, im Stil der Trainer 1 und 2:
  - **Trainer 3, Hazel** (Pilzsammlerin mit großem Korb und Pilzhut): Wortschatz Essen und Einkaufen, *some* und *any*
  - **Trainer 4, Karim** (Karawanenführer mit Turban und Spiegel): Steigerung von Adjektiven (*-er/-est*, *more/most*, *good/better/best*, *bad/worse/worst*)
  - **Trainer 5, Skye** (Drachenfliegerin mit Schutzbrille): Simple past der regelmäßigen Verben (Schreibung *-ed*, *-ied*, Doppelkonsonant)
  - Je Trainer mindestens 22 Fragen: mindestens 6 Auswahl, 6 Eintippen und 6 Satzbau. Dazu jeweils `HALLO` (2 bis 3 Zeilen), `SIEG`, `NIEDERLAGE` und `REVANCHE`.
  - 9 neue Zettelaufgaben (also mindestens 20), gemischt aus den Themen 1 bis 5.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`, das Paket ohne Fehler und nur mit dem Hinweis „Trainer 1 bis 5“.
- [ ] **Step 5: Commit**: `git commit -m "Beispielpaket: Themen 3 bis 5 und mehr Zettel"`

---

### Task 6: Zeitbalken und Zeitstein im Duell

**Files:**
- Modify: `js/scenes/duel.js` (auch `makeProbeSetup` für die Probefrage der Lehrkraft), `js/ui/duelPanel.js`, `css/spiel.css`, `js/items/stones.js`, `js/world/notes.js`, `js/scenes/worldEvents.js`, `js/config.js`
- Test: `tests/stones.test.js`, `tests/notes.test.js`

**Interfaces:**
- Consumes: `timerFor` (Task 3), Uhr (Task 4), `bag.time` (Task 2)
- Produces:
  - `makeTrainerSetup` und `makeProbeSetup` liefern `time: { trainerNumber, setting: pack.timePressure }`. `makeWildSetup` liefert kein `time`.
  - Neue Werte in der Einstellung:
    - `CONFIG.finds.tableTimed = { farsight: 3, shine: 2, life: 1, time: 3 }`
    - `CONFIG.notes.rewardsTimed = { berry: 3, starfruit: 1, farsight: 2, shine: 1, life: 1, time: 2 }`
    - Beide gelten ab Gebiet `CONFIG.time.fromArea`.
  - Funktionen mit Gebiet:
    - `rollStone(state, rng, area = 1)`, `takeFind(state, key, rng, area = 1)`, `stepFind(state, rng, area = 1)`
    - `solveNote` nutzt sein `area` auch für die Belohnungstabelle.
    - `worldEvents` übergibt dafür `def.area`.
  - `panel.interrupt(value)` beendet ein offenes `ask` mit `value`. `panel.setTime(left, limit, frozen)` zeichnet den Balken.

- [ ] **Step 1: Tests schreiben**

```js
// tests/stones.test.js
test('Zeitsteine gibt es erst ab Gebiet 4, wo Trainer Zeitdruck haben', () => {
  assert.equal(rollStone(s0(), seq(0.95), 3), 'life');
  assert.equal(rollStone(s0(), seq(0.95), 4), 'time');
  assert.equal(rollStone(s0(), seq(0.95)), 'life');   // ohne Gebiet wie bisher
});
// tests/notes.test.js
test('Zettel ab Gebiet 4 können einen Zeitstein bringen', () => {
  const s = s0(); assert.equal(solveNote(s, 'duenen:1,1', 4, true, seq(0, 0.95)).item, 'time');
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Umsetzen**
  - **Uhr in der Szene:**
    - `createDuel` bekommt `timeFor: timerFor(setup, c.species)`.
    - Im `update(dt)` der Duell-Szene wird `duel.tick(dt)` nur aufgerufen, solange `panel.ask` die Frage zeigt (Flag `asking`). Bei der Futterauswahl, bei „Aufgeben?“ und in Rückmeldungen läuft die Uhr also nicht. Ist die App verdeckt, steht die Spielschleife ohnehin.
    - Gibt `tick` ein Ergebnis zurück, beendet `panel.interrupt({ type: 'timeout', result })` die Frage. Danach folgt die Rückmeldung wie bei „falsch“, mit dem Titel „Die Zeit ist um.“ und „Richtig ist: …“.
  - **Zeitbalken:**
    - Er steht oben im Antwort-Panel über der Frage, damit er auch bei offener iPad-Tastatur zu sehen ist.
    - Er ist eine volle Breite mit `role="progressbar"`. `aria-valuenow` gibt die Restsekunden an und wird nur beim Sekundenwechsel aktualisiert.
    - Unter `lowShare` wird er orange-rot und bekommt Querstreifen (Farbe und Muster).
    - Bei `frozen` ist er blau und trägt die Beschriftung „Die Zeit steht still.“
    - Er blinkt nie. Ohne Uhr gibt es keinen Balken.
  - **Zeitstein-Knopf:**
    - „Zeitstein (n)“ in der Seitenleiste, nach derselben Regel wie Weitblick: Er steht das ganze Duell an seinem Platz, wenn das Duell eine Uhr hat und zu Beginn ein Zeitstein im Rucksack war.
    - Er ist gesperrt, wenn `!duel.canFreeze()` gilt oder keiner mehr da ist.
    - Ein Tipp führt `takeItem(state, 'time')` und `duel.freezeTime()` aus.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Im Browser prüfen**
  - In der Konsole ein Duell gegen Trainer 4 starten: `lumara.go(createDuelScene(lumara, makeTrainerSetup(lumara, 4), () => {}))`.
  - Der Balken läuft. Die Futterauswahl hält ihn an.
  - Eine Frage ablaufen lassen: „Die Zeit ist um.“
  - Ein Zeitstein hält den Balken an.
  - Ein Paket mit `ZEITDRUCK: aus` hat keinen Balken, eines mit `lang` die doppelte Zeit.
  - Wilde Wesen haben nie eine Uhr.
- [ ] **Step 6: Commit**: `git commit -m "Zeitbalken und Zeitstein im Duell, Zeitsteine ab Gebiet 4"`

---

### Task 7: Kacheln, Zierobjekte und Teilchen der Gebiete 3 bis 5

**Files:**
- Modify: `js/gfx/art/tiles.js`, `js/world/map.js`, `js/scenes/world.js`, `js/scenes/worldEvents.js`, `js/gfx/particles.js`
- Test: `tests/tiles.test.js`, `tests/particles.test.js`, `tests/map.test.js`

**Interfaces:**
- Produces:
  - **Neue Kacheln** (16 × 16), dazu ihre Begehbarkeit in `js/world/map.js`:

    | Gebiet | begehbar | blockiert | hohes Gras |
    |---|---|---|---|
    | Moor | `peat` (Torfboden) | `bog` (dunkles Wasser, 2 Bilder), `glowshroom` (Leuchtpilz, Überlagerung) | `reed` (Schilf, 2 Bilder) |
    | Dünen | `glasssand` | `dune` (Sandkamm), `mirage` (Luftspiegelung, 2 Bilder) | `dunegrass` (2 Bilder) |
    | Klippen | `cliffrock`, `bridge` (Hängebrücke waagrecht), `bridgev` (senkrecht) | `clouds` (Wolken unter einem, 2 Bilder), `spire` (Felsnadel, Überlagerung) | `windgrass` (2 Bilder) |

    - Der Steg im Moor ist der vorhandene `pier`.
    - `GROUNDS` für Überlagerungen bekommt `peat`, `glasssand` und `cliffrock`.
  - **Neue Requisiten**, von unten gezeichnet:
    - `bigshroom` (16 × 32)
    - `statue` (16 × 32)
    - `glasstower` (16 × 48)
    - `windmill0` und `windmill1` (16 × 32, Flügel in zwei Stellungen)
  - **Zierobjekt** `{ type: 'deco', prop, anim?, lines? }`:
    - Es blockiert sein Feld.
    - Mit `anim` wechselt es alle 300 ms zwischen `${prop}0` und `${prop}1`. Bei „Bewegung reduzieren“ steht es auf `0`.
    - Mit `lines` spricht man es an wie ein Schild.
  - **Bewegte Kacheln:**
    - `bog`, `clouds` und `mirage` wechseln wie Wasser alle 600 ms das Bild.
    - Bei „Bewegung reduzieren“ stehen `clouds` und `mirage` still.
    - Die Schilf- und Grasarten rascheln wie `tallgrass`.
  - **Neue Teilchen:**
    - `PARTICLE_LIMITS += { spore: 14, bubble: 8, wisp: 3, sand: 12, glint: 10, windstreak: 8, cloud: 4 }`
    - `spore`: steigt langsam auf, grünlich-gelb
    - `bubble`: an Ankern auf `bog`-Feldern, steigt auf und platzt nach 0,6 bis 1,2 s
    - `wisp`: Irrlicht, treibt langsam, glimmt mit höchstens 1 Hz
    - `sand`: kurze waagrechte Striche, schnell
    - `glint`: kurzes Aufblitzen mit höchstens 2 Hz
    - `windstreak`: 6 bis 10 px lange Striche, schnell von rechts nach links
    - `cloud`: weiche, blasse Flecken von 10 × 4 px, langsam
  - **Anker:**
    - `createParticles(..., { anchors: { bubble: [[wx, wy], …] } })`. `shore` bleibt als Kurzform für `anchors.spray`.
    - `world.js` sammelt die Anker für `bubble` aus allen `bog`-Feldern.

- [ ] **Step 1: Tests schreiben**

```js
// tests/tiles.test.js (im Stil der bestehenden Kacheltests)
test('Kacheln der Gebiete 3 bis 5: 16 × 16, bekannte Farben, richtige Bildzahl', () => {
  for (const [k, n] of Object.entries({ peat: 1, reed: 2, bog: 2, glowshroom: 1, glasssand: 1, dunegrass: 2, dune: 1, mirage: 2, cliffrock: 1, windgrass: 2, clouds: 2, bridge: 1, bridgev: 1, spire: 1 })) {
    assert.equal(TILES[k].length, n, k);
    for (const f of TILES[k]) { assert.equal(f.length, 16); assert.ok(f.every(r => r.length === 16), k); }
  }
  for (const [k, h] of Object.entries({ bigshroom: 32, statue: 32, glasstower: 48, windmill0: 32, windmill1: 32 })) assert.equal(PROPS[k].length, h, k);
});
// tests/map.test.js
test('Begehbar, blockiert und hohes Gras der neuen Kacheln', () => {
  for (const k of ['peat', 'glasssand', 'cliffrock', 'bridge', 'bridgev', 'pier']) assert.ok(WALKABLE.has(k), k);
  for (const k of ['bog', 'glowshroom', 'dune', 'mirage', 'clouds', 'spire']) assert.ok(BLOCKED.has(k), k);
  for (const k of ['reed', 'dunegrass', 'windgrass']) { assert.ok(TALL_GRASS.has(k), k); assert.ok(WALKABLE.has(k), k); }
});
// tests/particles.test.js
test('Neue Teilchen: Grenzen, ein Viertel bei Bewegung reduzieren, Blasen nur an Ankern', () => {
  for (const k of ['spore', 'wisp', 'sand', 'glint', 'windstreak', 'cloud']) {
    const p = createParticles([k], { rng: createRng(5), reducedMotion: false });
    for (let i = 0; i < 900; i++) p.update(16, { x: 0, y: 0 });
    assert.ok(count(p) > 0 && count(p) <= PARTICLE_LIMITS[k], k);
  }
  const b = createParticles(['bubble'], { rng: createRng(6), reducedMotion: false, anchors: { bubble: [[50, 60]] } });
  for (let i = 0; i < 300; i++) b.update(16, { x: 0, y: 0 });
  b.each(q => assert.ok(Math.abs(q.x - 50) <= 8 && q.y <= 60 + 8));
  const w = createParticles(['wisp', 'glint'], { rng: createRng(7), reducedMotion: false });
  for (let i = 0; i < 300; i++) w.update(16, { x: 0, y: 0 });
  w.each(q => assert.ok((q.blinkHz ?? 0) <= (q.kind === 'wisp' ? 1 : 2)));
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Umsetzen** (Pixel-Art nach Design 14, eigene Palette, Farbstimmung nach Design 5.3):
  - Moor: dunkles Türkis, Moosgrün, Pilzleuchten in Gelb und Rosa
  - Dünen: helles Sandgold, Glas-Cyan, Spiegelweiß
  - Klippen: Felsgrau, Himmelblau, Wolkenweiß, Holzbraun
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Im Browser prüfen.** `?galerie` oder eine Testkarte in der Konsole zeigt alle Kacheln und Requisiten. Das Windrad dreht sich und steht bei „Bewegung reduzieren“ still.
- [ ] **Step 6: Commit**: `git commit -m "Kacheln, Zierobjekte und Teilchen für Moor, Dünen und Klippen"`

---

### Task 8: Wesen und Arenen der Gebiete 3 bis 5

**Files:**
- Modify: `js/data/species.js`, `js/gfx/art/creatures.js`, `js/gfx/arena.js`, `js/scenes/duel.js` (Kommentar und Rückfall der Probefrage), `js/scenes/gallery.js` (neue Bilder in der Galerie), `tests/helpers/fixtures.js` (`stubContext`)
- Create: `tests/arena.test.js`
- Test: `tests/species.test.js`, `tests/creatures.test.js`, `tests/arena.test.js`

**Interfaces:**
- Produces:
  - **Arten** (Felder wie bei den Waldarten: `id`, `kind: 'wild'`, `gender`, `area`, `rarity`, `names`, `description` mit einem Satz):

    | Gebiet | häufig | häufig | selten |
    |---|---|---|---|
    | 3 Moor | `tupfling` m: Tupfling → Schirmling | `irrfunke` m: Irrfunke | `nebelunke` f: Nebelunke |
    | 4 Dünen | `glaskaefer` m: Glaskäfer → Spiegelkäfer | `duenenhuepfer` m: Dünenhüpfer | `flimmerfuchs` m: Flimmerfuchs |
    | 5 Klippen | `drachling` m: Drachling → Himmelsdrachling | `klippbock` m: Klippbock | `wolkenwal` m: Wolkenwal |

  - `AREA_WILD[3..5]` in der vorhandenen Form `{ common: [id, id], rare: id }`.
  - `stubContext()` in `tests/helpers/fixtures.js`: ein Proxy, bei dem jede Methode nichts tut und `createRadialGradient` bzw. `createLinearGradient` ein Objekt mit `addColorStop` liefern. Damit lassen sich Arenen ohne Canvas zeichnen.
  - `TRAINER_CREATURES[3] = { species: 'tupfling', stage: 2 }`, `[4] = { species: 'glaskaefer', stage: 2 }`, `[5] = { species: 'drachling', stage: 2 }`
  - Bilder: Stufe 1 hat 32 × 32, Stufe 2 hat 40 × 40 (Design 14).
  - `ARENAS[3]` (Moorstege, Pilze), `ARENAS[4]` (Glasdünen, Spiegelung), `ARENAS[5]` (Felsplattform, Wolken). Bei „Bewegung reduzieren“ stehen sie still.

- [ ] **Step 1: Tests schreiben**

```js
test('Gebiete 3 bis 5: je zwei häufige und eine seltene Art, Trainer mit Stufe 2', () => {
  for (const a of [3, 4, 5]) {
    const ids = [...AREA_WILD[a].common, AREA_WILD[a].rare];
    assert.equal(AREA_WILD[a].common.length, 2);
    assert.equal(SPECIES[AREA_WILD[a].rare].rarity, 'rare');
    assert.ok(ids.every(id => SPECIES[id].area === a), `${a}`);
    const t = TRAINER_CREATURES[a]; assert.equal(t.stage, 2); assert.equal(SPECIES[t.species].area, a);
    for (const id of ids) assert.ok(creatureRows(id, 1).length === 32, id);
    assert.equal(creatureRows(t.species, 2).length, 40);
  }
  assert.equal(wildName('nebelunke', 1, 'a'), 'Eine wilde Nebelunke');
  assert.equal(wildName('tupfling', 1, 'the'), 'Der wilde Tupfling');
});
test('Arenen für die Gebiete 1 bis 5 lassen sich zeichnen', () => {
  const ctx = stubContext();   // zählt fillRect usw., kein Canvas nötig
  for (const a of [1, 2, 3, 4, 5]) assert.doesNotThrow(() => drawArena(ctx, a, 0, false));
});
```
- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Umsetzen.** Jede Art hat eine eigene Silhouette und die Farben ihres Gebiets. `makeProbeSetup` nutzt jetzt `TRAINER_CREATURES[n]` und fällt nur für die Trainer 6 bis 8 auf Trainer 1 zurück.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Im Browser prüfen.** `?galerie` zeigt alle zwölf neuen Bilder. Die Probefrage für Trainer 3 bis 5 auf der Lehrkraft-Seite zeigt die richtige Arena und das richtige Wesen.
- [ ] **Step 6: Commit**: `git commit -m "Wesen und Arenen für Moor, Dünen und Klippen"`

---

### Task 9: Das Pilzmoor

**Files:**
- Create: `js/world/maps/moor.js`
- Modify: `js/world/maps/wald.js` (Ausgang nach Norden), `js/world/network.js` (`MAPS`), `js/world/fogEdge.js` (Mehrzahl), `js/data/story.js` (`STORY[3]`), `js/gfx/art/characters.js`, `js/config.js` (`builtAreas: 3`), `js/main.js` (`?dev&gebiet=moor`), `sw.js`
- Test: `tests/moor.test.js`, `tests/network.test.js`, `tests/fogEdge.test.js`, `tests/story.test.js`

**Interfaces:**
- Consumes: Kacheln, Zierobjekte und Teilchen (Task 7), Arten (Task 8)
- Produces:
  - `MOOR`:
    - `id: 'moor'`, `name: 'Pilzmoor'`, `genitive: 'des Pilzmoors'`, `area: 3`, 40 × 30
    - `particles: ['spore', 'bubble', 'wisp']`
  - **Verbindungen:**
    - Wald: neuer Ausgang `{ x: 18, y: 0, w: 4, h: 1, to: 'moor', at: { x: 19, y: 28, dir: 'up' } }`, nur erreichbar, wenn das Tor `nord` des Waldes offen ist
    - Moor: Ausgang `{ x: 18, y: 29, w: 4, h: 1, to: 'wald', at: { x: 19, y: 1, dir: 'down' } }`
    - Moor: `spawn: { x: 19, y: 28, dir: 'up' }`
    - Moor: Tor `nord` mit `{ x: 18, y: 0, w: 4, h: 2, leadsTo: 4, ground: 'peat' }`. Der Ausgang dahinter kommt erst in Task 10, wenn es die Dünen gibt, denn ein Ausgang darf nur auf eine vorhandene Karte zeigen (`tests/network.test.js`).
  - **Mehrzahl am Nebelrand:**
    - Ein Nebelschild mit `leadsToPlural: true` sagt „Hinter dem Nebel liegen {Name}.“ statt „liegt“.
    - Spiegeldünen, Windklippen und Uhrwerkruinen setzen das.
    - Dafür wird `fogEdgeLines` in `js/world/fogEdge.js` geändert.
  - **Objekte:**
    - Leuchtstein 3, `respawn` gleich `beaconFront(MOOR, 3)`
    - Trainer 3 mit `sprite: 'trainer3'` und `afterWin: 'Dein Leuchtstein strahlt. Die Pilze leuchten heller als je zuvor.'`
    - 3 Bewohner, jeweils mit `lines` und `linesLit`:
      - **Wenke**, Pilzköchin: Welche Pilze leuchten? Beeren im Moor.
      - **Jasper**, Stegbauer: Bleib auf den Stegen. Auf der Insel tanzen Irrlichter, ohne Boot kommt da niemand hin.
      - **Nele**, Kind: Irrlichter, Zettelsteine.
    - mindestens 3 Zettelsteine, 2 Sträucher, 3 Fundstellen im Schilf, mindestens 4 `bigshroom`-Zierobjekte
    - die **Irrlichtinsel**: Moorfelder um eine Torf-Insel mit Zierobjekt, sichtbar und unerreichbar (Platz für Plan 4)
    - Ortsschild
    - Nebelschild mit `{ role: 'fogEdge', gate: 3, leadsTo: 4, leadsToName: 'die Spiegeldünen', leadsToPlural: true, linesOpen: ['Norden: Spiegeldünen', 'Der Nebel hat sich zurückgezogen. Der Weg ist frei.'] }`
  - `STORY[3]`, genau so (Design 5.5):
    1. „Im Moor leuchten die Pilze, damit sich niemand verirrt. Früher stellten die Leute Laternen auf die Stege und sangen dabei Lieder über das Licht.“
    2. „Als der Nebel kam, gingen die Laternen eine nach der anderen aus. Nur die Irrlichter blieben. Sie suchen bis heute nach den Liedern von damals.“
    3. „Ein altes Lied erzählt von einem kleinen Wesen tief im Berg, das Echos sammelt. Es hört jedes Wort, das irgendwo auf der Insel vergessen wird.“
  - **Figuren:** `trainer3` (Pilzhut als breite Krempe, Korb) sowie `wenke`, `jasper` und `nele` über `character(...)`.

- [ ] **Step 1: Tests schreiben** (`tests/moor.test.js` nach dem Muster von `tests/wald.test.js`)

```js
test('Moor: 40 × 30, Gebiet 3, alles Wichtige vom Eingang aus erreichbar', () => { /* wie Wald: Objekte daneben erreichbar, Fundstellen im hohen Gras, 2–4 Bewohner, ≥ 3 Zettelsteine, Strauch, ≥ 12 Felder hohes Gras, Nebelschild leadsTo 4 gate 3 */ });
test('Moor: Aufwachpunkt vor dem Leuchtstein, Hüterin blickt über den Steg, Stein nicht in ihrem Blick', () => { /* wie Wald */ });
test('Moor: Die Irrlichtinsel ist zu sehen, aber nicht erreichbar', () => {
  const m = createMap(MOOR, { openGates: ['nord'] }); const r = reachable(m, MOOR.spawn);
  const isle = MOOR.objects.find(o => o.id === 'irrlichtinsel');
  assert.ok(isle); assert.ok(![[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => r.has(cellKey(isle.x + dx, isle.y + dy))));
});
// tests/network.test.js
test('Gebiet 3 ist offen mit Stein 2 und Trainer 3; der Wald führt dann nach Norden ins Moor', () => {
  assert.equal(areaOpen(st([1, 2]), pack(3), 3), true);
  assert.equal(areaOpen(st([1, 2]), pack(2), 3), false);
  assert.equal(exitAt(MAPS.wald, 19, 0)?.to, 'moor');
});
test('Im Moor stehen und ein Paket mit 2 Trainern laden: Aufwachen am Stein im Wald', () => {
  assert.deepEqual(resolveStart(st([1, 2, 3], { map: 'moor', x: 19, y: 20, dir: 'up' }), pack(2)), { map: 'wald', ...beaconFront(MAPS.wald, 2) });
});
// tests/fogEdge.test.js
test('Mehrzahl am Nebelrand: „Hinter dem Nebel liegen die Spiegeldünen.“', () => {
  const s = MOOR.objects.find(o => o.role === 'fogEdge');
  assert.equal(fogEdgeLines(s, { gateBeaten: true, packHasNext: true, builtAreas: 3 })[0], 'Hinter dem Nebel liegen die Spiegeldünen.');
  assert.equal(fogEdgeLines(WALD.objects.find(o => o.role === 'fogEdge'), { gateBeaten: true, packHasNext: true, builtAreas: 2 })[0], 'Hinter dem Nebel liegt das Pilzmoor.');
});
// tests/story.test.js: Schlüssel jetzt ['1', '2', '3'], dazu der genaue Text von STORY[3][0]
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Karte, Figuren und Texte umsetzen, `builtAreas: 3`.** Tests, die bisher `builtAreas = 2` vorausgesetzt haben (etwa das Schild „Pilzmoor entsteht gerade“), werden mit einer Ruling umgestellt.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Im Browser prüfen**
  - Mit dem vollständigen Beispielpaket im Wald Rowan besiegen: Der Nebel im Norden weicht, und das Schild nennt das Pilzmoor als offen.
  - Ins Moor gehen. Teilchen, Irrlichter und Blasen sind zu sehen.
  - Ein wildes Wesen im Schilf bekommt die Moorarena.
  - Hazel besiegen: kein Zeitbalken, Leuchtstein-Szene, Schild nach Norden „entsteht gerade“.
  - Zettel lösen bringt STORY[3].
  - Zwischen den Steinen 1 bis 3 reisen.
  - `?dev&gebiet=moor` funktioniert.
- [ ] **Step 6: Commit**: `git commit -m "Das Pilzmoor: Karte, Bewohner, Hazel und Geschichte"`

---

### Task 10: Die Spiegeldünen

**Files:**
- Create: `js/world/maps/duenen.js`
- Modify: `js/world/player.js` (Ereignis `bump`), `js/scenes/worldEvents.js` (Hinweis bei Luftspiegelung), `js/world/maps/moor.js` (Ausgang nach Norden), `js/world/network.js`, `js/data/story.js` (`STORY[4]`), `js/gfx/art/characters.js`, `js/config.js` (`builtAreas: 4`), `js/main.js` (`?dev&gebiet=duenen`), `sw.js`
- Test: `tests/player.test.js`, `tests/duenen.test.js`, `tests/network.test.js`, `tests/story.test.js`

**Interfaces:**
- Produces:
  - **Ereignis `bump`:**
    - `player.update` liefert `{ type: 'bump', x, y }`, wenn die Figur steht, eine Richtung gedrückt ist und das Zielfeld nicht betreten werden kann.
    - Das passiert einmal pro Drücken gegen dasselbe Feld. Erst nach einem Schritt, einem Richtungswechsel oder dem Loslassen kommt das Ereignis wieder.
  - **Luftspiegelung:**
    - `worldEvents` zeigt bei `bump` gegen eine `mirage`-Kachel den leisen Hinweis „Nur eine Luftspiegelung!“.
    - Er nutzt dasselbe Element wie das Flüstern und blockiert nichts.
  - `DUENEN`:
    - `id: 'duenen'`, `name: 'Spiegeldünen'`, `genitive: 'der Spiegeldünen'`, `area: 4`, 40 × 30
    - `particles: ['sand', 'glint']`
  - **Verbindungen:**
    - Moor: Ausgang `{ x: 18, y: 0, w: 4, h: 1, to: 'duenen', at: { x: 19, y: 28, dir: 'up' } }`
    - Dünen: Ausgang `{ x: 18, y: 29, w: 4, h: 1, to: 'moor', at: { x: 19, y: 1, dir: 'down' } }`
    - Dünen: `spawn: { x: 19, y: 28, dir: 'up' }`
    - Dünen: Tor `ost` mit `{ x: 38, y: 13, w: 2, h: 4, leadsTo: 5, ground: 'glasssand' }`. Der Ausgang dahinter kommt in Task 11.
  - **Objekte:**
    - Leuchtstein 4
    - Trainer 4 mit `sprite: 'trainer4'` und `afterWin: 'Dein Leuchtstein strahlt. Die Spiegel zeigen wieder echte Wege.'`
    - 2 Bewohner, jeweils mit `lines` und `linesLit`:
      - **Samir**, Glasbläser: Luftspiegelungen täuschen Wege vor.
      - **Talia**, Kartenzeichnerin: Karim ist schnell, ein Zeitstein hilft. Der Glasturm ist zu hoch zum Klettern.
    - mindestens 6 `mirage`-Felder, die wie Wege aussehen und in Sackgassen führen
    - mindestens 3 Glasstatuen (`statue`) mit kurzen Inschriften als `lines`
    - der **Glasturm** (`glasstower`, `id: 'glasturm'`) auf einem unerreichbaren Plateau (Platz für Plan 4)
    - Zettelsteine, Sträucher, Fundstellen und Ortsschild wie im Moor
    - Nebelschild nach Osten mit `{ gate: 4, leadsTo: 5, leadsToName: 'die Windklippen', leadsToPlural: true, linesOpen: ['Osten: Windklippen', 'Der Nebel hat sich zurückgezogen. Der Weg ist frei.'] }`
  - `STORY[4]`, genau so:
    1. „Die Dünen waren einmal ein weiter Strand. Der Sand wurde zu Glas, als der Leuchtstein hier so hell strahlte wie die Mittagssonne.“
    2. „In den Glasstatuen spiegelte sich, was die Menschen wussten. Seit dem Nebel zeigen die Spiegel nur noch Wege, die es gar nicht gibt.“
    3. „Ein Händler wanderte einmal bis zur Höhle im Berg. Er hörte dort ein leises Summen, wie von jemandem, der ganz allein ein Lied übt.“
  - **Figuren:** `trainer4` (Turban, Spiegel-Lichtpunkt an der Hand) sowie `samir` und `talia`.

- [ ] **Step 1: Tests schreiben**

```js
// tests/player.test.js
test('Anstoßen: einmal pro Drücken gegen dasselbe Feld', () => {
  const map = createMap(TEST_MAP_DEF); const p = createPlayer({ x: 2, y: 1, dir: 'up' });   // oben steht ein Baum
  const bumps = () => p.update(16, { dir: 'up', a: false }, map).filter(e => e.type === 'bump');
  assert.equal(bumps().length, 1); assert.equal(bumps().length, 0); assert.equal(bumps().length, 0);
  p.update(16, { dir: null, a: false }, map);
  assert.equal(bumps().length, 1);
});
// tests/duenen.test.js: wie Moor (erreichbar, Aufwachpunkt, Blickfeld), dazu:
test('Dünen: Luftspiegelungen sehen aus wie Wege, sind aber blockiert; der Glasturm ist unerreichbar', () => {
  const m = createMap(DUENEN, { openGates: ['ost'] }); const r = reachable(m, DUENEN.spawn);
  const mirages = []; for (let y = 0; y < 30; y++) for (let x = 0; x < 40; x++) if (m.tileAt(x, y) === 'mirage') mirages.push([x, y]);
  assert.ok(mirages.length >= 6);
  assert.ok(mirages.some(([x, y]) => [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => r.has(cellKey(x + dx, y + dy)))));  // man kommt an eine heran
  const t = DUENEN.objects.find(o => o.id === 'glasturm');
  assert.ok(![[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => r.has(cellKey(t.x + dx, t.y + dy))));
});
// tests/network.test.js
test('In den Dünen stehen und ein Paket mit 3 Trainern laden: Aufwachen am Stein im Moor', () => {
  assert.deepEqual(resolveStart(st([1, 2, 3, 4], { map: 'duenen', x: 19, y: 20, dir: 'up' }), pack(3)), { map: 'moor', ...beaconFront(MAPS.moor, 3) });
});
// tests/story.test.js: Schlüssel ['1', '2', '3', '4'], genauer Text von STORY[4][0]
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Umsetzen, `builtAreas: 4`.**
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Im Browser prüfen**
  - Gegen eine Luftspiegelung laufen: Der Hinweis kommt einmal, nicht bei jedem Bild.
  - Eine Statue ansprechen zeigt die Inschrift.
  - Karim besiegen, mit Zeitbalken (40 s). Eine Frage ablaufen lassen, einen Zeitstein einsetzen.
  - Eine Fundstelle kann einen Zeitstein bringen.
  - Nach dem Sieg nennt das Schild im Osten die Windklippen.
- [ ] **Step 6: Commit**: `git commit -m "Die Spiegeldünen: Luftspiegelungen, Statuen, Karim mit Zeitdruck"`

---

### Task 11: Die Windklippen

**Files:**
- Create: `js/world/maps/klippen.js`
- Modify: `js/world/maps/duenen.js` (Ausgang nach Osten), `js/world/network.js`, `js/data/story.js` (`STORY[5]`), `js/gfx/art/characters.js`, `js/config.js` (`builtAreas: 5`), `js/main.js` (`?dev&gebiet=klippen`), `sw.js`
- Test: `tests/klippen.test.js`, `tests/network.test.js`, `tests/fogEdge.test.js`, `tests/story.test.js`

**Interfaces:**
- Produces:
  - `KLIPPEN`:
    - `id: 'klippen'`, `name: 'Windklippen'`, `genitive: 'der Windklippen'`, `area: 5`, 40 × 30
    - `particles: ['windstreak', 'cloud']`
  - **Verbindungen:**
    - Dünen: Ausgang `{ x: 39, y: 13, w: 1, h: 4, to: 'klippen', at: { x: 1, y: 14, dir: 'right' } }`, in den Zellen des Tors `ost`
    - Klippen: Ausgang `{ x: 0, y: 13, w: 1, h: 4, to: 'duenen', at: { x: 38, y: 14, dir: 'left' } }`
    - `spawn: { x: 1, y: 14, dir: 'right' }`
    - Tor `ost` mit `{ x: 38, y: 13, w: 2, h: 4, leadsTo: 6, ground: 'cliffrock' }`, dahinter kein Ausgang (Gebiet 6 ist noch nicht gebaut)
  - **Landschaft:**
    - Felsplattformen aus `cliffrock` auf `clouds`, verbunden durch Hängebrücken (`bridge`, `bridgev`)
    - Felsnadeln (`spire`)
    - mindestens 3 Windräder als Zierobjekte mit `anim: true`
  - **Objekte:**
    - Leuchtstein 5
    - Trainer 5 mit `sprite: 'trainer5'` und `afterWin: 'Dein Leuchtstein strahlt. Spürst du den Wind? Er trägt wieder Grüße.'`
    - 3 Bewohner, jeweils mit `lines` und `linesLit`:
      - **Ole**, Windmüller: Windräder, der Wind war lange still.
      - **Ina**, Wolkenforscherin: Wolken unter den Brücken, nicht hinunterschauen.
      - **Tamo**, Kind mit Drachen: Skye fliegt am höchsten, Zeitstein.
    - Zettelsteine, Sträucher, Fundstellen und Ortsschild
    - Nebelschild nach Osten mit `{ gate: 5, leadsTo: 6, leadsToName: 'die Uhrwerkruinen', leadsToPlural: true, linesOpen: ['Osten: Uhrwerkruinen', 'Der Nebel hat sich zurückgezogen. Der Weg ist frei.'] }`. Weil Gebiet 6 noch nicht gebaut ist, sagt es nach dem Sieg „Hinter dem Nebel liegen die Uhrwerkruinen.“ und „Der Weg dorthin entsteht gerade …“.
  - `STORY[5]`, genau so:
    1. „Auf den Klippen drehen sich die Windräder schon seit hundert Jahren. Früher trug der Wind Nachrichten von einem Gebiet zum nächsten.“
    2. „Mit dem Nebel wurde der Wind still. Niemand schickte mehr Grüße über die Insel, und viele vergaßen, wer auf der anderen Seite wohnt.“
    3. „Weht der Wind vom Berg her, klingt er wie ein Seufzen. Die Drachenflieger sagen, im Berg wartet jemand darauf, dass man an ihn denkt.“
  - **Figuren:** `trainer5` (Schutzbrille auf der Stirn, Schal) sowie `ole`, `ina` und `tamo`.

- [ ] **Step 1: Tests schreiben**
  - `tests/klippen.test.js` wie Moor: erreichbar, Aufwachpunkt, Blickfeld. Dazu zwei Prüfungen:
    - Jede Plattform mit einem wichtigen Objekt ist nur über Brücken erreichbar, und alle Brückenfelder sind betretbar.
    - Es gibt mindestens 3 Windräder.
  - `tests/fogEdge.test.js`:

```js
test('Nebelrand hinter den Klippen: Uhrwerkruinen entstehen gerade', () => {
  const s = KLIPPEN.objects.find(o => o.role === 'fogEdge');
  assert.deepEqual(fogEdgeLines(s, { gateBeaten: true, packHasNext: true, builtAreas: 5 }), [
    'Hinter dem Nebel liegen die Uhrwerkruinen.',
    'Der Weg dorthin entsteht gerade. In einer der nächsten Spielfassungen kannst du hindurch.',
  ]);
});
```
  - `tests/network.test.js`: Die Dünen führen nach Osten in die Klippen und zurück. Auf den Klippen stehen und ein Paket mit 4 Trainern laden führt zum Aufwachen in den Dünen.
  - `tests/story.test.js`: Schlüssel `['1', '2', '3', '4', '5']`, genauer Text von `STORY[5][0]`. Kein Stück enthält „Morrow“.
- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Umsetzen, `builtAreas: 5`.**
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Im Browser prüfen**
  - Über die Brücken laufen. Die Windräder drehen sich, Windstreifen und Wolken ziehen.
  - Skye besiegen, mit 35 s pro Frage.
  - Das Schild im Osten sagt „Hinter dem Nebel liegen die Uhrwerkruinen.“
  - Zwischen allen fünf Steinen reisen.
- [ ] **Step 6: Commit**: `git commit -m "Die Windklippen: Brücken, Windräder und Skye"`

---

### Task 12: Abschluss von Plan 3b

**Files:**
- Modify: `version.json`, `js/version.js`, `sw.js`, `README.md`, `pakete/vorlage.txt` (beim Schlüsselwort `ZEITDRUCK` der Satz „Zeitdruck gibt es ab Trainer 4. Mit `lang` gilt doppelte Zeit, mit `aus` nie eine Uhr.“)

- [ ] **Step 1: Spielfassung `0.4.0`** an allen drei Stellen setzen und `FILES` vollständig halten. Erwartet: `node --test` ergibt `# fail 0`.
- [ ] **Step 2: README**
  - Status Plan 3b mit Link auf diesen Plan
  - kurz, was neu ist
  - Format 3 ist festgeschrieben, die Fixture für Format 3 wird nie geändert
- [ ] **Step 3: Gesamtdurchlauf in Chrome** mit dem vollständigen Beispielpaket:
  1. `?dev&gebiet=wald`: Rowan besiegen, ins Moor gehen, Hazel besiegen (ohne Uhr).
  2. In den Dünen eine Frage ablaufen lassen und einen Zeitstein einsetzen, dann Karim besiegen.
  3. Auf den Klippen Skye besiegen. Der Nebelrand im Osten sagt „entsteht gerade“.
  4. Neu laden: Alles ist noch da. Zwischen allen fünf Steinen reisen.
  5. In den Dünen ein Paket mit nur drei Trainern laden: Ilvy bringt das Kind zum Stein im Moor.
  6. Ein Paket mit `ZEITDRUCK: aus` hat keinen Zeitbalken, eines mit `lang` die doppelte Zeit.
  7. Die Spielstände aus den Fixtures für Format 1 und 2 laden: kein Verlust, 0 Zeitsteine.
- [ ] **Step 4: Commit**: `git commit -m "Plan 3b abschließen: Spielfassung 0.4.0 und README"`
