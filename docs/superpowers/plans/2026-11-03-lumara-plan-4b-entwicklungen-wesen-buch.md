# Lumara · Plan 4b: Entwicklungen und Wesen-Buch – Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Erreicht das eigene Wesen Stufe 2, 3 oder 4, verwandelt es sich sichtbar: Es leuchtet auf, wechselt die Gestalt und zeigt seinen neuen Namen und die neue Fähigkeit. Im Menü gibt es das Wesen-Buch mit 33 Einträgen, und wilde Wesen erscheinen selten in einer Glanzform.

**Architecture:**
- **Bilder:** 15 neue Bilder der Startwesen in `js/gfx/art/creatures.js`. Stufe 2 ist 40 px groß, Stufe 3 48 px, Stufe 4 64 px.
- **Entwicklung:**
  - Eine reine Zeitleiste `evolutionAt(ms, reducedMotion)` und eine Zeichenfunktion liegen in `js/gfx/evolution.js`.
  - Die Duell-Szene spielt die Entwicklung in der Arena ab, die Welt nach einem Zettel als Überlagerung.
  - XP laufen überall über `gainXp`. Bei einer Entwicklung füllt es die neuen Energiefelder gleich mit.
- **Wesen-Buch:**
  - Daten und Regeln liegen DOM-frei in `js/data/book.js`, die Menüseite in `js/menu/bookPage.js`.
  - Begegnungen trägt `applyDuelResult` ein, auch bei Flucht und Niederlage.
- **Glanzform:** `rollShiny(rng)` entscheidet beim wilden Wesen. Das Bild entsteht durch einen festen Farbtausch innerhalb der Palette (`js/gfx/art/shiny.js`).
- **Spielstand-Format 4:** Es kommt `state.book` dazu.

**Tech Stack:** wie Plan 1 bis 3c, ohne neue Bausteine.

**Spec:** `docs/superpowers/specs/2026-11-01-lernwelt-rpg-design.md` (im Folgenden „Design“), dazu 10.6 Spielsprache. Vorgänger: Plan 1 bis 3c und Plan 4a (Spielsprache) in `docs/superpowers/plans/`.

**Umfang:** Design 17, Schritt 6, erster Teil:
- **Entwicklungen:**
  - Bilder in den Größen aus Design 14
  - die Szene als „großer Moment“ (6.3)
  - die Fähigkeiten auf der Seite „Wesen“ (6.2, 13)
- **Wesen-Buch** mit 33 Einträgen (6.4, 13):
  - „gesehen“ mit Silhouette und Fundort
  - „besiegt“ mit Bild in Farbe und Beschreibung
  - Glanzform 1 zu 64, im Buch mit Stern

**Aufteilung von Plan 4 (Claude):**
- **4a:** Spielsprache
- **4b** (dieser Plan): Entwicklungen und Wesen-Buch
- **4c:**
  - Aufträge und Schlüsselgegenstände
  - der Futterbeutel
  - Aufträge im Tagebuch
  - die geheimen Orte der Gebiete 1 bis 5: die Hohle Eiche mit der Laterne und der Glasturm mit dem Kletterhaken
- **4d:**
  - die Aufträge 6 bis 8
  - die Nussschale für Gezeiteninsel und Irrlichtinsel
  - die Eisgrotte mit den Eiskufen und dem Rätsel „über Eis gleiten“
  - die Sternwarte mit der Sternkarte und dem Rätsel „Zahnräder drehen“

Die Buchplätze 25 bis 30 sind für die seltenen Arten der geheimen Orte (4c, 4d). Die Plätze 31 bis 33 gehören zu Höhle und Morrow (Finale).

**Bewusst noch nicht in diesem Plan:**
- Aufträge, Schlüsselgegenstände, geheime Orte: Plan 4c und 4d
- Höhle, Morrow, Revanchen, Leuchtturm-Aufstieg: Finale
- der Jingle zur Entwicklung: Musik und Ton

**Arbeitszweig:** `feature/wesen-buch`, abgezweigt von `feature/spielsprache` (Plan 4a). Der Plan liegt schon im ersten Commit von Plan 4a.

## Global Constraints

- **Aus Plan 1 bis 3c gilt weiter:**
  - keine Abhängigkeiten, alles im Code gezeichnet
  - Spieltexte auf Deutsch, Bezeichner englisch
  - Zahlen stehen in `js/config.js`
  - Tests mit `node --test` und `# fail 0`
  - Commit-Nachrichten auf Deutsch mit `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- **Spielstände:**
  - Das Format steigt auf 4.
  - `tests/fixtures/spielstand-v1.*`, `-v2.*` und `-v3.*` bleiben unverändert und laden weiter.
  - Neu ist `tests/fixtures/spielstand-v4.{js,txt}`. Auch diese Dateien werden ab diesem Plan nie mehr geändert.
- **Das Wesen-Buch gehört dem Kind** (Design 10.4). Es liegt oben im Spielstand, nicht in `packs`, und bleibt bei einem Paketwechsel erhalten.
- **Bilder:**
  - Größen: Stufe 2 ist 40 × 40, Stufe 3 ist 48 × 48, Stufe 4 ist 64 × 64 (Design 14).
  - nur Zeichen aus `js/gfx/palette.js`
  - Die Wesen schauen nach rechts.
  - Keines erinnert an ein Wesen aus einem bestehenden Spiel (Anti-Ziel, Design 2).
  - Die Namen der Stufen stehen schon in `SPECIES[*].names` (Design 6.1) und bleiben so.
- **Glanzform:** Chance 1 zu 64 (`CONFIG.wild.shinyChance = 1 / 64`), nur bei wilden Wesen.
- **Barrierefreiheit:**
  - Nichts wechselt oder blinkt öfter als dreimal pro Sekunde (Design 14).
  - Bei „Bewegung reduzieren“ blendet die Entwicklung nur über, und die Glanzform funkelt nicht.
  - Zustände im Buch stehen als Text mit Zeichen da, nicht nur als Farbe.
  - Tippflächen sind mindestens 48 px groß.
- **Spieltexte** haben je Zeile höchstens etwa 90 Zeichen.
- **Spielsprache (Design 10.6, Plan 4a):**
  - Jeder neue Text entsteht auf Deutsch und Englisch.
  - Oberflächentexte kommen über `t()` aus `js/i18n/de.js` und `en.js`, nach dem Glossar aus Plan 4a. Zusatzbegriffe: Glanzform → shiny form, Entwicklung → evolution, gesehen → seen, besiegt → beaten, Fundort → found in, Fähigkeit → ability, Schwung → Momentum, Schild → Shield.
  - Die Tests unten nennen die deutschen Texte. Dazu kommt jeweils eine englische Prüfung, und `tests/i18n.test.js` prüft, dass alle Schlüssel in beiden Sprachen da sind.
  - Neue Dateien kommen in `CONVERTED` von `tests/i18nLint.test.js`.
  - Namen der Arten kommen über `speciesText`, Gebietsnamen über `areaName`.
- **Service Worker:** Neue JS-Dateien kommen in dem Task in `FILES` in `sw.js`, der sie anlegt. `tests/sw.test.js` prüft das.
- **Spielfassung** am Ende: `0.7.0` an allen drei Stellen.

## Review Focus

1. **Mehrere Stufen auf einmal oder eine Entwicklung außerhalb eines Duells** (etwa nach einem Zettel):
   - Die Szene läuft einmal, von der alten zur neuen Stufe.
   - Alle neuen Fähigkeiten werden genannt, und die neuen Energiefelder sind gefüllt.
   - Mit Spitznamen heißt es „Blitz entwickelt sich zu Funkelflug!“.
   - Vor der Szene verrät kein Text und kein Schild den neuen Namen.
   - → Tests in Task 1 und Task 5, Browser in Task 5
2. **Begegnung ohne Sieg:**
   - Wer flieht oder verliert, hat das Wesen trotzdem gesehen, und eine Glanzform bekommt auch dann ihren Stern.
   - Ein Trainerwesen zählt für seine Art.
   - Ein „besiegt“ oder ein Stern wird nie zurückgenommen.
   - → Tests in Task 1
3. **Alte Spielstände** aus 0.2 bis 0.5:
   - Sie laden ohne Verlust.
   - Wer schon Trainer besiegt hat, findet deren Arten im Buch als besiegt.
   - Kaputte oder unbekannte Einträge im Buch fallen beim Laden heraus und verhindern das Laden nicht.
   - → Tests in Task 1
4. **Große Bilder auf kleinen Flächen:**
   - Ein Wesen der Stufe 4 (64 px) steht in der Arena ganz im Bild. Auf dem iPad verdeckt das Namensschild des Gegners seinen Kopf nicht, weder im Hoch- noch im Querformat.
   - Das Buch mit 33 Kästen lässt sich auf 390 px Breite und auf dem iPad bedienen. Jede Tippfläche ist mindestens 48 px groß, und die Pfeiltasten erreichen jeden bekannten Eintrag.
   - → Task 4 und Task 6, im Browser
5. **„Bewegung reduzieren“:**
   - Die Entwicklung blendet ruhig über, und die Glanzform funkelt nicht.
   - Nie wechselt etwas öfter als dreimal pro Sekunde.
   - → Test in Task 5, Browser in Task 2 und 5

---

## Dateistruktur (neu und geändert)

```
js/config.js                 + wild.shinyChance, evolution (Zeiten der Szene)
js/duel/progress.js          + gainXp(creature, amount)
js/state.js                  Format 4: book; applyDuelResult trägt Begegnungen ein und nutzt gainXp
js/world/notes.js            solveNote nutzt gainXp
js/save/migrate.js           CURRENT_VERSION 4, Umwandlung 3 → 4, repairBook
js/data/book.js              neu: Buchplätze, Eintragen, Ansicht, Zustandstexte
js/data/species.js           + STAGE_ABILITIES, abilityRows, nameAtStage, evolutionLines
js/world/encounters.js       + rollShiny(rng)
js/gfx/art/shiny.js          neu: Farbtausch für die Glanzform
js/gfx/art/creatures.js      + 15 Bilder der Startwesen (Stufe 2 bis 4)
js/gfx/canvasSprites.js      + whiteOf(img) (aus scenes/duel.js hierher verschoben)
js/gfx/evolution.js          neu: Zeitleiste und Zeichnen der Entwicklung
js/gfx/creatureImage.js      neu: Wesen als eigenes Canvas fürs Menü (Farbe, Silhouette, Glanz)
js/scenes/duel.js            Glanzform, Entwicklung in der Arena, alter Name bis zum Ende der Szene
js/scenes/evolution.js       neu: Entwicklung als Überlagerung der Welt
js/scenes/worldEvents.js     Entwicklung nach einem Zettel
js/scenes/gallery.js         ?galerie&glanz zeigt die Glanzformen
js/main.js                   ?dev&level=, ?duell=…&level=, ?duell=wild&glanz
js/menu/menu.js              + „Wesen-Buch“; Wesen-Seite mit Bild und Fähigkeiten
js/menu/bookPage.js          neu: Buchseite und Eintragsseite
css/spiel.css                Buch, Wesen-Seite, leere Zusatzzeile am Gegner-Schild
tests/…                      je Task, dazu tests/fixtures/spielstand-v4.{js,txt}
```

## Gemeinsame Schnittstellen

```js
// XP gutschreiben (Task 1): setzt level und xpInLevel. Steigt die Stufe, kommen die neuen
// Energiefelder gefüllt dazu (Differenz der stageEnergyBonus). Rückgabe wie addXp.
gainXp(creature, amount) → { level, xpInLevel, levelsGained, stageBefore, stageAfter }

// Wesen-Buch (Task 1)
BOOK_SIZE = 33
BOOK_SLOTS: (string | null)[]   // Nummer = Index + 1; 1–24 wilde Arten nach Gebiet, je häufig, häufig, selten; 25–33 null
state.book: { [speciesId]: { beaten: boolean, shiny: boolean } }   // Eintrag vorhanden = gesehen
recordSighting(state, speciesId, { beaten = false, shiny = false } = {}) → void   // nur Arten aus BOOK_SLOTS; nimmt nie etwas zurück
bookView(state) → {
  total: 33, seen: number, beaten: number,
  entries: [{ number, id: string|null, status: 'unknown'|'seen'|'beaten', shiny: boolean,
              name: string|null, place: string|null, description: string|null }],
}
bookLabels(entry) → string[]

// Glanzform (Task 2)
rollShiny(rng) → boolean          // rng.next() < CONFIG.wild.shinyChance
setup.foe.shiny: boolean          // nur bei kind 'wild'
shinyRows(rows: string[], speciesId?: string) → string[]

// Entwicklung (Task 5)
CONFIG.evolution = { glowMs: 900, swapMs: [450, 450, 380, 380, 340], fadeMs: 900 }   // zusammen 3800 ms
evolutionAt(ms, reducedMotion) → { form: 'from'|'to', mix: number, white: number, sparkle: number, done: boolean }
drawEvolution(ctx, ms, { fromImg, toImg }, base: { x, y }, reducedMotion) → void   // base = Füße, wie ARENA.own
STAGE_ABILITIES = { 2: { name, text }, 3: { name, text }, 4: { name, text } }
abilityRows(level) → [{ stage, name, text, fromLevel, unlocked }]
nameAtStage(creature, stage) → string   // Spitzname oder Name der Art auf dieser Stufe
evolutionLines(creature, from, to) → string[]
playEvolution(game, world, { species, from, to }) → Promise<void>
creatureCanvas(speciesId, stage, { look = 'color' | 'silhouette' | 'shiny', scale = 2 } = {}) → HTMLCanvasElement
```

---

### Task 1: Spielstand-Format 4, XP mit Entwicklung und die Daten des Wesen-Buchs

**Files:**
- Create: `js/data/book.js`, `tests/book.test.js`, `tests/fixtures/spielstand-v4.js`, `tests/fixtures/spielstand-v4.txt`
- Modify: `js/duel/progress.js`, `js/state.js`, `js/world/notes.js`, `js/save/migrate.js`, `sw.js`
- Test: `tests/book.test.js`, `tests/progress.test.js`, `tests/state.test.js`, `tests/notes.test.js`, `tests/migrate.test.js`

**Interfaces:**
- Produces:
  - `gainXp`, `BOOK_SIZE`, `BOOK_SLOTS`, `recordSighting`, `bookView`, `bookLabels` (siehe Gemeinsame Schnittstellen)
  - `state.book`, `newGameState` mit `version: 4` und `book: {}`
- Regeln:
  - `bookView`:
    - `place` ist der Name der Karte zum Gebiet der Art (`MAPS`, etwa „Flüsterwald“).
    - `name` ist `SPECIES[id].names[0]`.
    - `name` und `place` gibt es ab „gesehen“, `description` erst ab „besiegt“.
    - Plätze mit `id: null` sind immer `unknown`.
  - `applyDuelResult` trägt bei jedem Ausgang ein:
    - wild: `recordSighting(state, setup.foe.species, { beaten: outcome === 'won', shiny: setup.foe.shiny === true })`
    - Trainer: dasselbe ohne Glanz
  - XP: `applyDuelResult` setzt zuerst `c.energy = summary.playerEnergy` und ruft danach `gainXp`. `solveNote` nutzt `gainXp` statt `addXp`.
  - Umwandlung 3 → 4: `book` aus den Steinen. Für jeden Stein `n` mit `TRAINER_CREATURES[n]` gilt `book[TRAINER_CREATURES[n].species] = { beaten: true, shiny: false }`. Diese Ergänzung macht nur die Umwandlung, nicht die Reparatur.
  - `repairBook(raw)`:
    - Es behält nur Schlüssel aus `BOOK_SLOTS` mit einem Objekt als Wert.
    - `beaten` und `shiny` werden `true` nur bei genau `true`, sonst `false`.

- [ ] **Step 1: Tests schreiben**

```js
// tests/book.test.js
test('Das Buch hat 33 Plätze: 1 bis 24 die wilden Arten nach Gebiet, 25 bis 33 kommen später', () => {
  assert.equal(BOOK_SIZE, 33);
  assert.equal(BOOK_SLOTS.length, 33);
  assert.deepEqual(BOOK_SLOTS.slice(0, 24), [1, 2, 3, 4, 5, 6, 7, 8].flatMap(a => [...AREA_WILD[a].common, AREA_WILD[a].rare]));
  assert.deepEqual(BOOK_SLOTS.slice(24), Array(9).fill(null));
});

test('Eintragen: erst gesehen, dann besiegt und Glanz, nichts wird zurückgenommen', () => {
  const s = newGameState({ name: 'A', species: 'nixi', nickname: null });
  recordSighting(s, 'moosling');
  assert.deepEqual(s.book.moosling, { beaten: false, shiny: false });
  recordSighting(s, 'moosling', { beaten: true });
  recordSighting(s, 'moosling', { shiny: true });
  recordSighting(s, 'moosling');
  assert.deepEqual(s.book.moosling, { beaten: true, shiny: true });
  recordSighting(s, 'funki', { beaten: true }); // Startwesen stehen nicht im Buch
  recordSighting(s, 'gibtsnicht');
  assert.deepEqual(Object.keys(s.book), ['moosling']);
});

test('Ansicht: Zähler, Zustand, und Name, Fundort, Beschreibung erst, wenn man sie kennt', () => {
  const s = { ...newGameState({ name: 'A', species: 'nixi', nickname: null }), book: { gischtling: { beaten: true, shiny: false }, rindenwicht: { beaten: false, shiny: true } } };
  const v = bookView(s);
  assert.deepEqual([v.total, v.seen, v.beaten], [33, 2, 1]);
  assert.deepEqual(v.entries[0], { number: 1, id: 'gischtling', status: 'beaten', shiny: false, name: 'Gischtling', place: 'Leuchtturmbucht', description: SPECIES.gischtling.description });
  assert.deepEqual(v.entries[5], { number: 6, id: 'rindenwicht', status: 'seen', shiny: true, name: 'Rindenwicht', place: 'Flüsterwald', description: null });
  assert.deepEqual(v.entries[1], { number: 2, id: 'haeuschel', status: 'unknown', shiny: false, name: null, place: null, description: null });
  assert.deepEqual(v.entries[32], { number: 33, id: null, status: 'unknown', shiny: false, name: null, place: null, description: null });
});

test('Jeder Eintrag sagt seinen Zustand mit Text, nicht nur mit Farbe', () => {
  assert.deepEqual(bookLabels({ status: 'unknown', shiny: false }), ['? Noch nicht gesehen']);
  assert.deepEqual(bookLabels({ status: 'seen', shiny: false }), ['◐ Gesehen']);
  assert.deepEqual(bookLabels({ status: 'beaten', shiny: true }), ['● Besiegt', '✦ Glanzform gesehen']);
});

// tests/progress.test.js
test('gainXp: Eine Entwicklung füllt die neuen Energiefelder, auch über zwei Stufen', () => {
  const c = { species: 'funki', level: 14, xpInLevel: 0, energy: 1, lifeStones: 0 };
  const r = gainXp(c, xpToNext(14));
  assert.deepEqual([r.stageBefore, r.stageAfter, c.level, c.xpInLevel, c.energy], [1, 2, 15, 0, 2]);
  const d = { species: 'kiesel', level: 3, xpInLevel: 0, energy: 2, lifeStones: 0 };
  gainXp(d, 5);
  assert.equal(d.energy, 2); // ohne Entwicklung bleibt die Energie
  const e = { species: 'nixi', level: 14, xpInLevel: 0, energy: 3, lifeStones: 0 };
  let sum = 0;
  for (let l = 14; l < 35; l++) sum += xpToNext(l);
  assert.deepEqual([gainXp(e, sum).stageAfter, e.level, e.energy], [3, 35, 5]);
});

// tests/state.test.js (der Test „neues Spiel“ erwartet jetzt version 4 und book {})
const W = shiny => ({ kind: 'wild', area: 2, foe: { species: 'moosling', stage: 1, level: 5, maxEnergy: 3, shiny }, pool: [] });
const ended = outcome => ({ outcome, playerEnergy: 3, flawless: false, answers: [] });

test('Wildes Wesen: gesehen auch bei Flucht und Niederlage, besiegt nur nach einem Sieg', () => {
  const s = newGameState({ name: 'A', species: 'funki', nickname: null });
  applyDuelResult(s, 'ENQ9', W(false), ended('fled'));
  assert.deepEqual(s.book.moosling, { beaten: false, shiny: false });
  applyDuelResult(s, 'ENQ9', W(true), ended('lost'));
  assert.deepEqual(s.book.moosling, { beaten: false, shiny: true });
  applyDuelResult(s, 'ENQ9', W(false), won());
  assert.deepEqual(s.book.moosling, { beaten: true, shiny: true });
});

test('Ein Trainerwesen zählt für seine Art im Buch', () => {
  const s = newGameState({ name: 'A', species: 'funki', nickname: null });
  applyDuelResult(s, 'ENQ9', T1, won());
  assert.deepEqual(s.book, { haeuschel: { beaten: true, shiny: false } });
});

test('Sieg mit Entwicklung: Die Energie aus dem Duell bleibt, das neue Feld ist gefüllt', () => {
  const s = newGameState({ name: 'A', species: 'funki', nickname: null });
  Object.assign(s.creature, { level: 14, xpInLevel: xpToNext(14) - 1 });
  const r = applyDuelResult(s, 'ENQ9', T1, won());
  assert.deepEqual([r.stageBefore, r.stageAfter, s.creature.energy], [1, 2, 3]); // playerEnergy 2 + 1
});

// tests/notes.test.js
test('Ein Zettel mit Entwicklung füllt das neue Energiefeld', () => {
  // Spielstand mit einem Zettel, der bereitliegt, wie in den anderen Zetteltests dieser Datei
  Object.assign(s.creature, { level: 14, xpInLevel: xpToNext(14) - CONFIG.notes.xp, energy: 2 });
  const out = solveNote(s, key, 1, true, rngWith(0.99), 'normal'); // 0.99: keine Belohnung
  assert.equal(out.evolved, true);
  assert.equal(s.creature.energy, 3);
});

// tests/migrate.test.js
// Die Tests für Format 1, 2 und 3 erwarten jetzt version 4 und dazu
//   book: Object.fromEntries(stones.map(n => [TRAINER_CREATURES[n].species, { beaten: true, shiny: false }]))
// (für Format 1 also { haeuschel: { beaten: true, shiny: false } }). Sonst ändert sich an ihnen nichts.
test('Spielstand der Fassung 4 bleibt für immer ladbar', () => {
  const d = decodeSave(readFileSync(new URL('./fixtures/spielstand-v4.txt', import.meta.url), 'utf8'));
  assert.deepEqual(migrateState(d.value), { ok: true, state: SPIELSTAND_V4 });
});

test('Format 4: kaputte oder unbekannte Einträge im Buch fallen heraus', () => {
  const book = { moosling: { beaten: 'ja', shiny: true }, funki: { beaten: true, shiny: false }, quatsch: { beaten: true, shiny: true }, gischtling: 5 };
  assert.deepEqual(migrateState({ ...structuredClone(SPIELSTAND_V4), book }).state.book, { moosling: { beaten: false, shiny: true } });
  assert.deepEqual(migrateState({ ...structuredClone(SPIELSTAND_V4), book: 'x' }).state.book, {});
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL (`gainXp`, `js/data/book.js` und die Fixture fehlen).
- [ ] **Step 3: Umsetzen**, mit diesen Dateien:
  - `progress.js`, `book.js`, `state.js`, `notes.js`, `migrate.js` (`CURRENT_VERSION = 4`, `MIGRATIONS[3]`, `repairBook`)
  - `js/data/book.js` in `FILES` von `sw.js`
  - die Fixture:

```js
// tests/fixtures/spielstand-v4.js – NIE ÄNDERN. Inhalt von spielstand-v4.txt (Format 4).
import { SPIELSTAND_V3 } from './spielstand-v3.js';
export const SPIELSTAND_V4 = {
  ...structuredClone(SPIELSTAND_V3),
  version: 4,
  book: { haeuschel: { beaten: true, shiny: false }, moosling: { beaten: false, shiny: true } },
};
```

  Die `.txt` entsteht einmalig mit `encodeSave(SPIELSTAND_V4)` aus `js/save/codec.js`, zum Beispiel über ein kleines Skript im Scratchpad, das die Ausgabe in die Datei schreibt.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`. Dazu prüfen, dass `git diff --stat tests/fixtures/` nur die beiden neuen v4-Dateien zeigt.
- [ ] **Step 5: Commit**: `git commit -m "Spielstand-Format 4: Wesen-Buch und XP mit Entwicklung"`

---

### Task 2: Glanzform

**Files:**
- Create: `js/gfx/art/shiny.js`, `tests/shiny.test.js`
- Modify: `js/config.js`, `js/world/encounters.js`, `js/scenes/duel.js`, `js/scenes/gallery.js`, `js/main.js`, `css/spiel.css`, `sw.js`
- Test: `tests/shiny.test.js`, `tests/encounters.test.js`

**Interfaces:**
- Consumes: `BOOK_SLOTS` (Task 1), `CREATURE_ART`
- Produces: `rollShiny`, `setup.foe.shiny`, `shinyRows(rows, speciesId)`, `CONFIG.wild.shinyChance = 1 / 64`
- **Farbtausch** `SHINY_SWAP` in `shiny.js`. Jede Familie rückt eine weiter, hell und dunkel bleiben in der Reihenfolge:

  | von | nach |
  |---|---|
  | Grün `F l g G T` | `P v V R f` |
  | Violett `P v V R` | `D S L A` |
  | Blau `D S L A` | `F t g T` |
  | Holz `b o r y Y` | `n d s m f` (Silber) |
  | Warm `e C p h H` | `P v V T A` |
  | Türkis `t` | `C` |
  | unverändert | `k n d s m f c w` |

  - `SHINY_OVERRIDE[speciesId]` darf für einzelne Arten Zeichen anders tauschen, auch Grautöne, nie aber `k`. Das braucht es nur, wenn eine Art sonst den Test unten nicht schafft.
- **Duell:**
  - `makeWildSetup` setzt `foe.shiny = rollShiny(game.rng)`.
  - Das Bild des Gegners nutzt `shinyRows` unter dem Schlüssel `creature:<id>:<stufe>:glanz`.
  - Nach „… taucht auf!“ folgt die Zeile „✦ Es schimmert in einer seltenen Farbe!“.
  - Die Zusatzzeile des Gegner-Schilds zeigt „✦ Glanzform“.
  - In den ersten 1200 ms funkeln vier helle Punkte um den Gegner, einmal und ohne Wiederholung. Bei „Bewegung reduzieren“ fehlt das Funkeln.
- **CSS:** `.plate-extra:empty { display: none; }`. Das Schild des Gegners wird dadurch ohne Glanz flacher, das hilft auch Task 4.
- **Entwickler-Adressen** (nur localhost):
  - `?duell=wild&glanz` macht jedes wilde Wesen zur Glanzform.
  - `?galerie&glanz` zeigt alle Bilder als Glanzform: `createGalleryScene(game, { shiny: true })`.

- [ ] **Step 1: Tests schreiben**

```js
test('Glanzform: 1 zu 64', () => {
  assert.equal(CONFIG.wild.shinyChance, 1 / 64);
  assert.equal(rollShiny({ next: () => 0.0156 }), true);
  assert.equal(rollShiny({ next: () => 0.0157 }), false);
});

test('Jede Art im Buch sieht als Glanzform deutlich anders aus; Umriss und Leere bleiben', () => {
  for (const id of BOOK_SLOTS.filter(Boolean)) {
    for (const [stage, rows] of Object.entries(CREATURE_ART[id])) {
      const out = shinyRows(rows, id);
      assert.equal(out.length, rows.length);
      let filled = 0, changed = 0;
      rows.forEach((r, y) => [...r].forEach((ch, x) => {
        const o = out[y][x];
        if (ch === '.' || ch === 'k') return assert.equal(o, ch, `${id}.${stage} (${x},${y})`);
        filled++;
        if (o !== ch) changed++;
      }));
      assert.ok(changed / filled >= 0.25, `${id}.${stage}: nur ${Math.round((100 * changed) / filled)} % anders`);
    }
  }
});

test('Grautöne bleiben ohne eigene Regel, wie sie sind', () => {
  assert.deepEqual(shinyRows(['kndsmfcw.']), ['kndsmfcw.']);
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL (`rollShiny` und `shiny.js` fehlen).
- [ ] **Step 3: Umsetzen.** Schafft eine Art den 25-%-Test nicht, bekommt sie eine eigene Regel in `SHINY_OVERRIDE`. Die allgemeine Tabelle bleibt dabei unverändert. `shiny.js` kommt in `FILES`.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Im Browser prüfen**
  - `?galerie&glanz`: Jede Art ist wiederzuerkennen und sieht deutlich anders aus. Keine wirkt matschig oder unlesbar, sonst eine Regel in `SHINY_OVERRIDE`.
  - `?duell=wild&glanz` zeigt die Zeile, „✦ Glanzform“ am Schild und das Funkeln. Mit „Bewegung reduzieren“ (Chrome DevTools, Rendering) fehlt das Funkeln.
  - Ohne Glanz hat das Gegner-Schild keine leere Zusatzzeile mehr.
- [ ] **Step 6: Commit**: `git commit -m "Glanzform für wilde Wesen"`

---

### Task 3: Startwesen auf Stufe 2 und 3

**Files:**
- Modify: `js/gfx/art/creatures.js`, `js/main.js`
- Test: `tests/creatures.test.js`

**Interfaces:**
- Produces:
  - `CREATURE_ART[id][2]` (40 × 40) und `[3]` (48 × 48) für alle fünf Startwesen
  - die Entwickler-Adresse `&level=n`: Bei `?dev` und `?duell` hat das Wesen Level `n` (1 bis 100) und volle Energie.
- **Bilder (Claude):** Jede Stufe behält die Hauptfarbe und die Grundform ihres Wesens und wird größer und eindrucksvoller (Design 6.1).

  | Startwesen | Stufe 2 (40 px) | Stufe 3 (48 px) |
  |---|---|---|
  | Funki | **Funkelflug:** größere Flügel mit hellen Funkenpunkten, Fühler mit Leuchtspitzen, Hinterleib heller | **Laternenfalter:** Hinterleib wie eine kleine Laterne mit goldenem Rahmen und warmem Licht, Flügel mit Adern wie Pergament |
  | Kiesel | **Findling:** größer und breiter, ein Moosmantel über dem Rücken, ein kleiner Kristall auf dem Kopf | **Felsenwächter:** aufrecht, Arme aus Steinplatten, Moos mit kleinen Blüten auf den Schultern |
  | Nixi | **Quellnix:** längerer Flossenkamm, Kiemenkrone mit Wasserperlen | **Strudelnix:** schlanker, die Schwanzflosse dreht sich zu einem Strudel, Kiemen wie Wellen |
  | Flausch | **Wolkenkauz:** Wolkenbüschel als Federohren, rundere Brust | **Sturmeule:** breite Flügel, ein goldenes Blitzmuster auf der Brust |
  | Pieks | **Dornigel:** zwischen den Blattstacheln Dornranken | **Blütenigel:** zwischen den Stacheln Blüten in Rosa und Flieder |

- [ ] **Step 1: Tests schreiben**

```js
const mainColor = rows => {
  const n = {};
  for (const ch of rows.join('')) if (ch !== '.' && ch !== 'k') n[ch] = (n[ch] ?? 0) + 1;
  return Object.entries(n).sort((a, b) => b[1] - a[1])[0][0];
};

test('Jedes Startwesen hat Bilder für die Stufen 1 bis 3 in der richtigen Größe', () => {
  for (const id of STARTERS) for (const s of [1, 2, 3]) assert.equal(CREATURE_ART[id]?.[s]?.length, STAGE_SIZE[s], `${id}.${s}`);
});

test('Die Startwesen einer Stufe haben verschiedene Silhouetten', () => {
  for (const s of [2, 3]) {
    const shapes = STARTERS.map(id => CREATURE_ART[id][s].map(r => r.replace(/[^.]/g, '#')).join('/'));
    assert.equal(new Set(shapes).size, STARTERS.length, `Stufe ${s}`);
  }
});

test('Jede Stufe trägt die Hauptfarbe ihres Startwesens', () => {
  for (const id of STARTERS) {
    const main = mainColor(CREATURE_ART[id][1]);
    for (const s of [2, 3]) {
      const px = CREATURE_ART[id][s].join('').replace(/[.k]/g, '');
      assert.ok([...px].filter(c => c === main).length / px.length >= 0.08, `${id}.${s} ohne ${main}`);
    }
  }
});
```

  - Der bestehende Test „creatureRows fällt auf die höchste vorhandene Stufe zurück“ nimmt jetzt wilde Arten: `creatureRows('gischtling', 3) === CREATURE_ART.gischtling[1]` und `creatureRows('haeuschel', 4) === CREATURE_ART.haeuschel[2]`.
- [ ] **Step 2: `node --test`.** Erwartet: FAIL (Stufe 2 und 3 fehlen).
- [ ] **Step 3: Umsetzen.** Den Kommentar über `creatureRows` anpassen: Jetzt fehlt nur noch Stufe 4.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`. Der allgemeine Test zu Größe, Füllung und Farben prüft die neuen Bilder mit.
- [ ] **Step 5: Im Browser prüfen**
  - `?galerie`: Jede Stufe ist als dasselbe Wesen wiederzuerkennen, nur größer.
  - `?duell=wild&level=20&wesen=…` und `&level=40` für alle fünf: Das eigene Wesen steht auf seiner Plattform.
- [ ] **Step 6: Commit**: `git commit -m "Startwesen auf Stufe 2 und 3"`

---

### Task 4: Startwesen auf Stufe 4

**Files:**
- Modify: `js/gfx/art/creatures.js`, `css/spiel.css` (nur falls Step 5 es verlangt)
- Test: `tests/creatures.test.js`

**Interfaces:**
- Produces: `CREATURE_ART[id][4]` (64 × 64) für alle fünf Startwesen
- **Bilder (Claude):**

  | Startwesen | Stufe 4 (64 px) |
  |---|---|
  | Funki | **Nordlichtfalter:** weit ausgebreitete Flügel mit Bändern in Mint, Lagune und Flieder wie Nordlicht, lange Fühler, eine kleine Krone aus Licht |
  | Kiesel | **Bergherz:** ein kleiner Berg mit Gesicht und Schneekappe, in der Brust eine glühende Ader, auf den Schultern zwei Bäumchen |
  | Nixi | **Gezeitennix:** ein großer Axolotl mit Muschelkrone, Wellenflossen und einem Mondzeichen auf der Stirn |
  | Flausch | **Himmelsuhu:** ein großer Uhu mit Sternenhimmel im Gefieder (Nacht, Violett, Sternpunkte), weite Schwingen |
  | Pieks | **Waldhüter:** ein großer Igel mit einem kleinen Baum auf dem Rücken und einem Bart aus Moos |

- [ ] **Step 1: Tests erweitern.** Die drei Tests aus Task 3 gelten jetzt für die Stufen `[1, 2, 3, 4]` bzw. `[2, 3, 4]`. Der Kommentar über `creatureRows` sagt nur noch, dass wilde Arten auf ihre höchste Stufe zurückfallen.
- [ ] **Step 2: `node --test`.** Erwartet: FAIL (Stufe 4 fehlt).
- [ ] **Step 3: Umsetzen.**
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Im Browser prüfen** mit `?duell=trainer&level=60` für alle fünf Wesen, bei 1024 × 707, 768 × 1024 und 1366 × 1024:
  - Das Wesen steht ganz im Bild.
  - Sein Kopf liegt nicht unter dem Namensschild der Hüterin.
  - Falls doch, gilt diese Regel: `.plate.foe` bekommt `top` und `left` von `calc(var(--gpx) * 3)` statt 6.
  - Reicht auch das bei 768 × 1024 nicht, kommt der Fall als offener Punkt in den Ledger und in die Abschlussprüfung. Er wird nicht still hingenommen.
  - Auf dem Handy (390 × 844) darf das Schild den Kopf teilweise verdecken, denn Zielgeräte sind Tablet und PC (Design 3). Auch das kommt in den Ledger.
- [ ] **Step 6: Commit**: `git commit -m "Startwesen auf Stufe 4"`

---

### Task 5: Die Entwicklung als großer Moment

**Files:**
- Create: `js/gfx/evolution.js`, `js/scenes/evolution.js`, `js/gfx/creatureImage.js`, `tests/evolution.test.js`
- Modify:
  - `js/config.js`, `js/data/species.js`, `js/gfx/canvasSprites.js` (bekommt `whiteOf` aus `scenes/duel.js`)
  - `js/scenes/duel.js`, `js/scenes/worldEvents.js`
  - `js/menu/menu.js` (Seite „Wesen“), `css/spiel.css`, `sw.js`
- Test: `tests/evolution.test.js`, `tests/species.test.js`

**Interfaces:**
- Consumes: `gainXp`/`report.stageBefore`/`stageAfter` (Task 1), Bilder (Task 3, 4)
- Produces: `CONFIG.evolution`, `evolutionAt`, `drawEvolution`, `STAGE_ABILITIES`, `abilityRows`, `nameAtStage`, `evolutionLines`, `playEvolution`, `creatureCanvas`
- **Zeitleiste** `evolutionAt(ms, reducedMotion)`:

  | Phase | Zeit | form | mix | white | sparkle |
  |---|---|---|---|---|---|
  | Aufleuchten | 0 bis 900 ms | `from` | 0 | 0 → 1 | 0 |
  | Wechsel | 900 bis 2900 ms, Abschnitte `swapMs` | `to`, `from`, `to`, `from`, `to` | 1 bei `to`, sonst 0 | 1 | 0 |
  | Ausklingen | 2900 bis 3800 ms | `to` | 1 | 1 → 0 | 0 → 1 |

  - Ab 3800 ms ist `done: true`, mit `form` = `to` und `white` = 0.
  - Bei `reducedMotion` gibt es in der Wechselphase keinen Wechsel. `mix` steigt dort gleichmäßig von 0 auf 1 (Überblendung), `form` ist `to` ab `mix >= 0.5`, und `sparkle` bleibt immer 0.
- **Zeichnen** `drawEvolution`:
  - beide Bilder nach `form`, bei `reducedMotion` übereinander nach `mix`
  - darüber `whiteOf(img)` mit Deckkraft `white`
  - bei `sparkle > 0` acht helle Punkte auf einem Kreis mit Radius `10 + 24 · sparkle`, Deckkraft `1 − sparkle`
- **Fähigkeiten** (nach Design 6.2, kindgerecht):

  | Stufe | `name` | `text` |
  |---|---|---|
  | 2 | Zweite Chance | Einmal pro Duell darfst du nach einer falschen Antwort noch einmal antworten. |
  | 3 | Schwung | Ein Volltreffer kommt schon nach 2 richtigen Antworten in Folge. |
  | 4 | Schild | Die erste falsche Antwort in jedem Duell kostet keine Energie. |

- **`evolutionLines(creature, from, to)`:**
  - `${nameAtStage(c, from)} entwickelt sich zu ${speciesName(c.species, to)}!`
  - je neuer Stufe `Neue Fähigkeit: ${name}!` und `${text}`
  - zuletzt `${nameAtStage(c, to)} hat jetzt ${bonus} Energie mehr.` (`bonus` = Differenz der `stageEnergyBonus`)
- **Duell:**
  - Bis die Szene vorbei ist, zeigen alle Texte und das eigene Schild den alten Namen: `nameAtStage(c, shownStage)`, mit `shownStage` als Stufe zu Duellbeginn. Das gilt auch für die Zeilen „… bekommt … XP“ und „… erreicht Level …“.
  - Nach den Level-Zeilen läuft bei `report.stageAfter > report.stageBefore` die Szene an `ARENA.own`.
  - Danach zeigt das eigene Wesen das neue Bild, `shownStage` wird `stageAfter`, die Schilder werden neu gesetzt, und es folgen die `evolutionLines`.
  - Die Zeile „… wird stärker!“ entfällt.
- **Welt:**
  - Nach einem Zettel mit `result.evolved` spielt `playEvolution` die Szene über der Welt.
  - Der Grund ist `rgba(27, 26, 46, 0.82)` über dem ganzen Bild, das Wesen steht in der Mitte mit den Füßen bei (120, 104).
  - Dann folgen die `evolutionLines`. Auch hier sagen die Level-Zeilen vorher den alten Namen.
  - Ablauf wie `playBeaconScene`: Einträge in `world.onTick` und `world.afterRender`, die sich selbst wieder entfernen.
- **Seite „Wesen“:**
  - oben das Bild `creatureCanvas(c.species, stage, { scale: 2 })`, scharf hochskaliert (`image-rendering: pixelated`)
  - unter der Besonderheit der Abschnitt „Fähigkeiten“ aus `abilityRows(c.level)`: freigeschaltet `✓ Zweite Chance: …`, sonst `○ Ab Level 35: Schwung`

- [ ] **Step 1: Tests schreiben**

```js
// tests/evolution.test.js
const frames = reduced => Array.from({ length: 381 }, (_, i) => evolutionAt(i * 10, reduced));
const changes = list => list.flatMap((f, i) => (i && f.form !== list[i - 1].form ? [i * 10] : []));

test('Entwicklung: beginnt mit der alten Gestalt, endet nach 3,8 s mit der neuen', () => {
  assert.deepEqual([evolutionAt(0, false).form, evolutionAt(0, false).white], ['from', 0]);
  assert.equal(evolutionAt(3799, false).done, false);
  assert.deepEqual([evolutionAt(3800, false).done, evolutionAt(3800, false).form, evolutionAt(3800, false).white], [true, 'to', 0]);
});

test('Entwicklung: Wechselspiel, aber höchstens drei Wechsel pro Sekunde', () => {
  const at = changes(frames(false));
  assert.ok(at.length >= 4);
  for (const t of at) assert.ok(at.filter(u => u >= t && u < t + 1000).length <= 3, `ab ${t} ms`);
});

test('Bewegung reduzieren: ruhige Überblendung, ein Wechsel, kein Funkeln', () => {
  const f = frames(true);
  assert.equal(changes(f).length, 1);
  assert.ok(f.every(x => x.sparkle === 0));
  assert.ok(f.every((x, i) => !i || x.mix >= f[i - 1].mix));
});

// tests/species.test.js
test('Entwicklungstexte nennen alten und neuen Namen, jede neue Fähigkeit und die Energie', () => {
  assert.deepEqual(evolutionLines({ species: 'funki', nickname: null }, 1, 2), [
    'Funki entwickelt sich zu Funkelflug!',
    'Neue Fähigkeit: Zweite Chance!',
    'Einmal pro Duell darfst du nach einer falschen Antwort noch einmal antworten.',
    'Funkelflug hat jetzt 1 Energie mehr.',
  ]);
  assert.deepEqual(evolutionLines({ species: 'kiesel', nickname: 'Rocky' }, 1, 3), [
    'Rocky entwickelt sich zu Felsenwächter!',
    'Neue Fähigkeit: Zweite Chance!',
    'Einmal pro Duell darfst du nach einer falschen Antwort noch einmal antworten.',
    'Neue Fähigkeit: Schwung!',
    'Ein Volltreffer kommt schon nach 2 richtigen Antworten in Folge.',
    'Rocky hat jetzt 2 Energie mehr.',
  ]);
});

test('Fähigkeiten auf der Seite „Wesen“: freigeschaltet ab dem Level der Stufe', () => {
  assert.deepEqual(abilityRows(34).map(r => [r.stage, r.fromLevel, r.unlocked]), [[2, 15, true], [3, 35, false], [4, 60, false]]);
  assert.equal(abilityRows(60).every(r => r.unlocked), true);
  assert.equal(nameAtStage({ species: 'pieks', nickname: null }, 4), 'Waldhüter');
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL (`evolution.js`, `evolutionLines` und `abilityRows` fehlen).
- [ ] **Step 3: Umsetzen.** Die drei neuen Dateien kommen in `FILES`.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Im Browser prüfen**
  - **Duell:** `?duell=wild&level=14`. Vor dem Duell XP knapp vor Level 15 setzen, über die Konsole: `game.state.creature.xpInLevel = 39`.
    - Nach dem Sieg kommen erst die XP und „Funki erreicht Level 15!“, beides mit altem Namen.
    - Dann die Szene: Aufleuchten, Wechsel, Ausklingen.
    - Danach Funkelflug auf der Plattform, „Funkelflug“ auf dem Schild, die drei Zeilen und ein neues gefülltes Energiefeld.
  - **Dasselbe mit Spitznamen und über zwei Stufen:** Level 14 → 35 über die Konsole mit `game.state.creature.xpInLevel` und einem Zettel-Gewinn.
  - **Welt:** `?dev&level=14`, XP knapp vor 15, einen Zettel lösen. Die Szene erscheint über der Welt, danach geht es weiter.
  - **„Bewegung reduzieren“:** ruhige Überblendung, kein Funkeln.
  - **Menü → Wesen:** Bild, Besonderheit, Fähigkeiten mit ✓ und ○.
- [ ] **Step 6: Commit**: `git commit -m "Entwicklung als großer Moment und Fähigkeiten auf der Seite Wesen"`

---

### Task 6: Das Wesen-Buch im Menü

**Files:**
- Create: `js/menu/bookPage.js`
- Modify: `js/menu/menu.js`, `css/spiel.css`, `sw.js`
- Test: `tests/book.test.js`

**Interfaces:**
- Consumes: `bookView`, `bookLabels` (Task 1), `creatureCanvas` (Task 5)
- Produces:
  - `bookPage(game)` und `bookEntryPage(game, number)`
  - `MENU_ITEMS` in `menu.js`: die Reihenfolge der Knöpfe
- **Menü:**
  - Reihenfolge nach Design 13: Wesen, Rucksack, Wesen-Buch, Karte, Tagebuch, Einstellungen, dazu „Zurück zum Spiel“.
  - Der Kommentar oben in `menu.js` sagt nicht mehr, dass das Buch fehlt.
- **Buchseite:**
  - Titel „Wesen-Buch“, darunter `Gesehen: ${seen} von 33 · Besiegt: ${beaten}`.
  - Darunter ein Raster `.book-grid` mit 33 Kästen, mindestens 72 × 88 px, Abstand 8 px. Auf 390 px passen vier Spalten.
  - Jeder Kasten zeigt `Nr. n`, ein Bild und den Namen.
  - Gesehen: Silhouette (`look: 'silhouette'`). Besiegt: Farbe. Unbekannt: ein großes „?“ und „???“.
  - Mit Glanz steht ein „✦“ in der Ecke.
  - Gesehene und besiegte Kästen sind Knöpfe mit `aria-label` `Nr. 6: Rindenwicht, ◐ Gesehen, ✦ Glanzform gesehen`.
  - Unbekannte Kästen sind keine Knöpfe (`aria-label` `Nr. 2: unbekannt`). So erreichen die Pfeiltasten nur Einträge, hinter denen etwas steht.
- **Eintragsseite:**
  - Titel `Nr. n · Name`.
  - Bild mit `scale: 3`, darunter die `bookLabels` als Liste und `Fundort: ${place}`.
  - Bei „besiegt“ kommt die Beschreibung dazu, bei „gesehen“ der Satz „Besiege es einmal, um mehr zu erfahren.“
  - Mit Glanz steht daneben das Glanzbild (`look: 'shiny'`) mit „✦ Glanzform“.

- [ ] **Step 1: Test schreiben**

```js
test('Menü in der Reihenfolge aus Design 13, mit dem Wesen-Buch', () => {
  assert.deepEqual(MENU_ITEMS, ['Wesen', 'Rucksack', 'Wesen-Buch', 'Karte', 'Tagebuch', 'Einstellungen']);
});
```

  `menu.js` importiert DOM-Hilfen. Läuft der Import in Node nicht, kommt `MENU_ITEMS` in eine eigene DOM-freie Datei `js/menu/items.js`, und `menu.js` baut die Knöpfe daraus.
- [ ] **Step 2: `node --test`.** Erwartet: FAIL (`MENU_ITEMS` fehlt).
- [ ] **Step 3: Umsetzen.** `bookPage.js` (und gegebenenfalls `items.js`) kommen in `FILES`.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Im Browser prüfen**
  - **Mit einem Stand mit gesehenen, besiegten und Glanz-Einträgen:**
    - Zähler, Silhouette, Farbe, Stern und Eintragsseite stimmen.
    - Nach einem Paketwechsel ist das Buch unverändert.
  - **Größen:**
    - Bei 1024 × 707, 768 × 1024 und im 390 × 844-Rahmen sind alle Kästen erreichbar und mindestens 48 px groß.
    - Es gibt keinen waagrechten Bildlauf.
  - **Tastatur:** Pfeil hoch und runter erreicht jeden bekannten Eintrag, Enter öffnet ihn, B führt zurück.
- [ ] **Step 6: Commit**: `git commit -m "Wesen-Buch im Menü"`

---

### Task 7: Abschluss von Plan 4b

**Files:**
- Modify: `version.json`, `js/version.js`, `sw.js`, `README.md`

- [ ] **Step 1: Spielfassung `0.7.0`** an allen drei Stellen setzen und `FILES` vollständig halten. Erwartet: `node --test` ergibt `# fail 0`.
- [ ] **Step 2: README aktualisieren**
  - Status Plan 4b mit Link auf diesen Plan
  - kurz, was neu ist
  - in der Tabelle der Entwickler-Adressen `&level=`, `?duell=wild&glanz` und `?galerie&glanz`
- [ ] **Step 3: Gesamtdurchlauf in Chrome ohne `?dev`** mit dem vollständigen Beispielpaket:
  1. **Stand einspielen:** einen Format-3-Spielstand wie aus 0.5, Nixi auf Level 14 knapp vor Level 15, Steine 1 bis 3, im Moor.
     - Laden: Das Buch zeigt Häuschel, Eichhuscher und Tupfling als besiegt.
     - Nach dem nächsten Speichern ist der Stand Format 4.
  2. Vor einem wilden Wesen fliehen: Es steht als „◐ Gesehen“ mit Silhouette und Fundort im Buch.
  3. **Ein wildes Wesen besiegen:**
     - Die Entwicklung läuft in der Arena, bis zum Ende mit altem Namen.
     - Danach kommen die drei Zeilen, und ein gefülltes neues Energiefeld ist da.
     - Die Seite „Wesen“ zeigt Quellnix und „✓ Zweite Chance“.
  4. Neu laden: Alles ist noch da.
  5. Mit einem Stand auf Level 34 knapp vor 35 einen Zettel lösen: Die Entwicklung erscheint über der Welt.
  6. Die Spielstände aus den Fixtures für Format 1 bis 4 laden: kein Verlust.
  7. „Bewegung reduzieren“: Die Entwicklung blendet ruhig über.
  8. Dasselbe kurz mit einem Mathe-Paket: Buch, Entwicklung und Glanzform sind auf Deutsch; mit dem Beispielpaket auf Englisch (`Sparkwing`, `Creature Book`).
- [ ] **Step 4: Commit**: `git commit -m "Plan 4b abschließen: Spielfassung 0.7.0 und README"`
