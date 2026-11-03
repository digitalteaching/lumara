# Lumara · Plan 3a: Welt-Grundlagen und Flüsterwald – Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nach dem Sieg über die Hüterin der Bucht leuchtet der erste Leuchtstein auf, der Nebel weicht, und das Kind läuft in den Flüsterwald weiter. Dort warten neue wilde Wesen, Bewohner, flüsternde Bäume und der Waldläufer als zweiter Trainer.

Unterwegs sammelt es:
- Beeren und Steine
- Zettel mit Aufgaben, die Stücke der Geschichte freilegen

Es reist zwischen entzündeten Leuchtsteinen und wacht nach einer Niederlage am zuletzt besuchten Stein auf.

**Architecture:**
- Neue reine Module, ohne DOM und in Node getestet:
  - `js/world/network.js`: Kartenverbund, Ausgänge, Nebeltore, welches Gebiet offen ist, Startposition
  - `js/world/beacons.js`: Leuchtsteine, Reiseziele, Aufwachpunkt
  - `js/items/bag.js`: Rucksack
  - `js/items/food.js`: Futter und Sträucher
  - `js/items/stones.js`: Fundstellen und Fundtabelle
  - `js/world/notes.js`: Zettel und Geschichtsstücke
  - `js/gfx/particles.js`: Teilchen
- Spielstand-Format 2 mit der ersten echten Umwandlung von Format 1.
- Darüber verallgemeinert `js/scenes/worldEvents.js` die Welt auf beliebige Gebiete: Trainer, wilde Wesen und Leuchtstein kommen aus der Karte.
- Neue Szenen bzw. Seiten: Leuchtstein-Szene, Reisen, Rucksack, Tagebuch, Zettel.

**Tech Stack:** wie Plan 1 und 2, ohne neue Bausteine.

**Spec:** `docs/superpowers/specs/2026-11-01-lernwelt-rpg-design.md` (im Folgenden „Design“, Abschnittsnummern wie dort). Vorgänger:
- `docs/superpowers/plans/2026-11-02-lumara-plan-1-spielbarer-kern.md` („Plan 1“)
- `docs/superpowers/plans/2026-11-03-lumara-plan-2-spielstand-lehrkraft.md` („Plan 2“)

**Umfang:** Design 17, Schritt 5, für die Gebiete 1 und 2:
- Nebel und Leuchtsteine (5.1)
- Reisen
- Futter (8.1, 7.6)
- seltene Steine (8.2): Lebensstein, Weitblickstein, Glanzstein
- Zettel unter Steinen (8.3)
- Geschichtsstücke für die Gebiete 1 und 2 (5.5)
- Teilchen und Wetter (5.3, 14)
- der Flüsterwald (5.3)
- dazu das Zeichen „neue Herausforderung“ (10.4), Pieks’ *Grüner Daumen* (6.1) und der Menüpunkt Rucksack und Tagebuch (13)

**Aufteilung von Plan 3** (Claude): Plan 3 aus der Liste in Plan 1 wird zu drei Plänen.
- **3a** (dieser Plan): alle Systeme der Welt und Gebiet 2. Damit sind Gebiet 1 und 2 vollständig, wie es Design 17.4 für den ersten Unterrichtstest vorsieht.
- **3b:** Gebiete 3 bis 5, dazu der Zeitdruck (er beginnt mit Trainer 4, Design 7.4) und der Zeitstein.
- **3c:** Gebiete 6 bis 8, der Ring zurück zur Bucht, das Höhlentor und der Menüpunkt Karte.

Die späteren Pläne heißen weiter 4 Tiefe, 5 Finale, 6 Musik und Ton, 7 Abschluss.

**Bewusst noch nicht in diesem Plan:**
- Zeitdruck und Zeitstein: Plan 3b, weil Trainer 1 bis 3 keinen haben.
- Aufträge, Schlüsselgegenstände, Futterbeutel, geheime Orte, Wesen-Buch, Glanzform (1 zu 64) und Entwicklungs-Animation: Plan 4.
- Revanchen: Plan 5. Ein besiegter Trainer sagt bis dahin nur einen Satz.
- Karte im Menü: Plan 3c.
- Innenräume: Die Häuser bleiben verschlossen.

**Arbeitszweig:** `feature/welt`, abgezweigt von `feature/spielstand` (PR #2 ist noch offen).

## Global Constraints

- Die Global Constraints aus Plan 1 und Plan 2 gelten weiter, vor allem:
  - keine Abhängigkeiten
  - alles im Code gezeichnet
  - Spieltexte auf Deutsch, Bezeichner englisch
  - Zahlen in `js/config.js`
  - Tests mit `node --test` und `# fail 0`
  - Commit-Nachrichten auf Deutsch mit `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- **Spielstände:** Format 1 muss ladbar bleiben.
  - `tests/fixtures/spielstand-v1.txt` bleibt unverändert und muss sich in Format 2 umwandeln lassen.
  - Format 2 bekommt eine eigene feste Testdatei `tests/fixtures/spielstand-v2.{js,txt}`, die ab diesem Plan ebenfalls nie mehr geändert wird.
- **Neue Felder im Spielstand** brauchen eine Reparaturregel in `migrateState`, sonst gehen sie beim Laden verloren. `migrateState` verwirft unbekannte Felder (Hinweis aus der Prüfung von Plan 2).
- **Wem was gehört (Design 10.4):**
  - Dem Kind gehören Leuchtsteine, Rucksack, Geschichtsstücke, Fundstellen, Strauch- und Zettel-Uhren sowie die gesamte Spielzeit.
  - Zum Paket gehören besiegte Trainer und die Statistik.
- **Nachwachsen** (Sträucher, Zettel, Fundstellen) richtet sich nach der echten Spielzeit `state.playMs`, nie nach der Uhrzeit. Diese Zeit zählt nur bei Sichtbarkeit und Eingabe, wie die Statistik.
- **Spieltexte aus dem Spiel**, also Bewohner, Geschichtsstücke, flüsternde Bäume und Schilder, sind kindgerecht, kurz (eine Zeile höchstens etwa 90 Zeichen) und ohne Gewalt. Wesen werden „erschöpft“.
- **Bewegung reduzieren:** weniger Teilchen (höchstens ein Viertel), kein Wackeln. Die Leuchtstein-Szene blendet über, statt zu blitzen. Nichts blinkt öfter als dreimal pro Sekunde.
- **Spielfassung** am Ende dieses Plans: `0.3.0`, an allen drei Stellen (`version.json`, `js/version.js`, `sw.js`). Neue Dateien kommen in `FILES` in `sw.js`, das prüft `tests/sw.test.js`.

## Review Focus

1. **Paketwechsel, während das Kind im Flüsterwald steht.** Lädt das Kind ein Paket nur mit Trainer 1 oder startet das Spiel mit einem solchen Paket, liegt der Wald im Nebel (Design 10.4). Das Kind steht dann nicht im Nebel fest, sondern wacht am höchsten offenen Leuchtstein auf oder am Leuchtturm. → Test in Task 2 (`resolveStart`), Einbindung in Task 3.
2. **Niederlage im Wald.** Das Kind wacht am zuletzt besuchten Leuchtstein auf, im Wald, wenn es Stein 2 schon besucht hat. Es landet nicht in der Bucht und nicht vor dem Trainer. → Test in Task 5 (`respawnPoint`).
3. **Rucksack voll.** Bei 10 Futter bleibt die Beere am Strauch bzw. die Beute liegt nicht verloren herum. Das Kind sieht „Dein Rucksack ist voll.“ → Tests in Task 1 (`addItem`) und Task 6.
4. **Nachwachsen über Neuladen und Pausen.** Ein abgeernteter Strauch ist nach 5 Minuten Spielzeit wieder voll, auch wenn dazwischen neu geladen wurde. Eine Nacht mit geschlossener App zählt nicht. → Test in Task 6 (`bushReady`).
5. **Zettel ohne Abschnitt `ZETTEL` im Paket, und Zettel falsch beantwortet.**
   - Ohne Abschnitt kommen Fragen wie bei wilden Wesen.
   - Bei falscher Antwort gibt es nichts, und der Zettel bleibt liegen.
   - Ein Doppeltipp zählt nur einmal.
   - → Tests in Task 8 (`notePool`, `solveNote`).

---

## Dateistruktur (neu und geändert)

```
js/config.js                    + bag, food, finds, notes, world.builtAreas = 2, beacons
js/state.js                     + neue Felder in newGameState, Rucksack-Helfer über items/bag.js
js/save/migrate.js              Format 2, Umwandlung 1 → 2, Reparaturregeln
js/items/bag.js                 neu: Rucksack (Futter-Platz 10)
js/items/food.js                neu: Beeren, Sternfrucht, Sträucher, Pieks
js/items/stones.js              neu: Fundstellen, Fund beim Schritt, Fundtabelle
js/world/network.js             neu: MAPS, Ausgänge, Nebeltore, areaOpen, resolveStart
js/world/beacons.js             neu: Leuchtstein entzünden, Reiseziele, Aufwachpunkt
js/world/notes.js               neu: Zettel, Belohnung, Geschichtsstücke
js/world/map.js                 createMap(def, { openGates }) und setTile
js/world/maps/bucht.js          Nebeltor, Ausgang, Leuchtstein 1, Strauch, Zettelsteine, Fundstellen, Texte je Fortschritt
js/world/maps/wald.js           neu: Flüsterwald 40 × 30
js/data/species.js              + drei Waldarten, AREA_WILD[2], TRAINER_CREATURES[2]
js/data/story.js                neu: Geschichtsstücke Gebiet 1 und 2
js/gfx/art/tiles.js             + Waldboden, Altbaum, Pilz, Strauch, Zettelstein, Leuchtstein
js/gfx/art/characters.js        + trainer2 (Waldläufer), Waldbewohner
js/gfx/art/creatures.js         + Moosling, Eichhuscher, Kronenhuscher, Rindenwicht
js/gfx/arena.js                 + Waldarena, Auswahl nach Gebiet
js/gfx/particles.js             neu: Teilchen je Gebiet
js/duel/duel.js                 + feed(), useFarsight()
js/ui/duelPanel.js              + Knöpfe „Füttern“ und „Weitblick“
js/scenes/worldEvents.js        verallgemeinert: Gebiet aus der Karte, Ausgänge, Tore, Funde, Sträucher, Zettel, Leuchtstein
js/scenes/beacon.js             neu: Leuchtstein-Szene und Reisen
js/scenes/note.js               neu: Zettel mit einer Aufgabe
js/scenes/duel.js               Arena nach Gebiet, Glanzstein, Beute, Pieks
js/menu/menu.js                 + Rucksack, Tagebuch
js/menu/bagPage.js, js/menu/diaryPage.js   neu
tests/…                         je Task, dazu tests/fixtures/spielstand-v2.{js,txt}
```

## Gemeinsame Schnittstellen

```js
// Spielstand Format 2 = Format 1 und dazu (alles gehört dem Kind):
GameState v2 = {
  version: 2,
  playMs: number,              // gesamte echte Spielzeit, für Nachwachsen
  stones: number[],            // entzündete Leuchtsteine 1..8, aufsteigend
  lastStone: number | null,    // zuletzt besuchter Leuchtstein (Aufwachen nach Niederlage)
  bag: { berry, starfruit, farsight, shine },   // ganze Zahlen ≥ 0
  shineActive: boolean,        // Glanzstein eingesetzt: doppelte XP beim nächsten Sieg
  story: { [area: number]: number },            // gefundene Geschichtsstücke je Gebiet
  world: {
    bushes: { [key: string]: number },          // key `${map}:${x},${y}` → readyAt (playMs)
    notes:  { [key: string]: number },          // Zettelstein → readyAt
    finds:  { [key: string]: number },          // Fundstelle → readyAt
  },
  …Format 1 (name, creature, position, settings, packs, savedAt)
}
Item = 'berry' | 'starfruit' | 'farsight' | 'shine' | 'life'   // 'life' wirkt sofort (creature.lifeStones)

// Kartendefinition (zusätzlich zu Plan 1)
MapDef.area: number
MapDef.exits = [{ x, y, w, h, to: mapId, at: { x, y, dir } }]       // Betreten → anderes Gebiet
MapDef.gates = [{ id, leadsTo: area, x, y, w, h, ground: tileKind }] // Nebelfelder, die sich öffnen
MapDef.objects += { type: 'beacon', number, x, y }                   // Leuchtstein (blockiert)
                | { type: 'bush', id, x, y }                          // Beerenstrauch (blockiert)
                | { type: 'notestone', id, x, y }                     // Zettelstein (blockiert)
                | { type: 'whisper', x, y, lines }                    // flüsternder Baum (blockiert)
MapDef.finds = [{ id, x, y }]   // Fundstellen im hohen Gras (begehbar, A beim Draufschauen)
npc.linesLit?: string[]         // Bewohner-Sätze, sobald der Stein dieses Gebiets leuchtet
```

---

### Task 1: Spielstand-Format 2 und Rucksack

**Files:**
- Create: `js/items/bag.js`, `tests/fixtures/spielstand-v2.js`, `tests/fixtures/spielstand-v2.txt` (erzeugt)
- Modify: `js/state.js`, `js/save/migrate.js`, `js/config.js`, `js/main.js` (Spielzeit auch in `state.playMs`), `tests/migrate.test.js`
- Test: `tests/bag.test.js`, `tests/migrate.test.js`, `tests/state.test.js`

**Interfaces:**
- Consumes: `migrateState`, `CURRENT_VERSION` (Plan 2), `emptyPackProgress` (Plan 2)
- Produces:
  - `CURRENT_VERSION = 2`, `MIGRATIONS[1]` (1 → 2)
  - `newGameState` liefert die neuen Felder mit Startwerten: `playMs 0`, `stones []`, `lastStone null`, Rucksack mit Nullen, `shineActive false`, `story {}`, `world` mit drei leeren Objekten.
  - `FOOD = ['berry', 'starfruit']`
  - `foodCount(bag) → number`
  - `addItem(state, item, n = 1) → number`: Gibt die Anzahl zurück, die wirklich dazukam.
    - Futter darf zusammen nicht mehr als `CONFIG.bag.foodMax` (10) werden.
    - `'life'` erhöht `creature.lifeStones` bis 3. Dabei steigt auch `creature.energy` um 1 (neue Höchstenergie).
  - `takeItem(state, item) → boolean`
  - `CONFIG.bag = { foodMax: 10 }`

- [ ] **Step 1: Tests schreiben**

```js
// tests/fixtures/spielstand-v2.js – NIE ÄNDERN. Inhalt von spielstand-v2.txt.
export const SPIELSTAND_V2 = {
  ...structuredClone(SPIELSTAND_V1), version: 2,
  position: { map: 'wald', x: 19, y: 27, dir: 'up' },
  playMs: 9000000, stones: [1], lastStone: 1,
  bag: { berry: 4, starfruit: 1, farsight: 2, shine: 0 }, shineActive: false,
  story: { 1: 2 },
  world: { bushes: { 'bucht:6,13': 9300000 }, notes: { 'bucht:3,12': 9600000 }, finds: {} },
};
// (SPIELSTAND_V1 aus ./spielstand-v1.js importieren; Position im Wald muss in wald.js begehbar sein,
//  deshalb wird diese Datei erst in Task 2 erzeugt, siehe Step 6.)

// tests/bag.test.js
const s0 = () => newGameState({ name: 'Mia', species: 'nixi', nickname: null });
test('Futter passt höchstens zu zehnt in den Rucksack, Steine ohne Grenze', () => {
  const s = s0();
  assert.equal(addItem(s, 'berry', 8), 8); assert.equal(addItem(s, 'starfruit', 3), 2); assert.equal(addItem(s, 'berry'), 0);
  assert.equal(foodCount(s.bag), 10); assert.equal(addItem(s, 'farsight', 5), 5); assert.equal(s.bag.farsight, 5);
});
test('Lebensstein wirkt sofort, höchstens dreimal', () => {
  const s = s0(); const e = s.creature.energy;
  assert.equal(addItem(s, 'life', 2), 2); assert.equal(s.creature.lifeStones, 2); assert.equal(s.creature.energy, e + 2);
  assert.equal(addItem(s, 'life', 5), 1); assert.equal(s.creature.lifeStones, 3);
});
test('Gegenstand nehmen', () => {
  const s = s0(); addItem(s, 'berry');
  assert.equal(takeItem(s, 'berry'), true); assert.equal(takeItem(s, 'berry'), false); assert.equal(s.bag.berry, 0);
});

// tests/migrate.test.js – der Test für Format 1 bleibt, vergleicht aber mit der Umwandlung:
test('Spielstand der Fassung 1 bleibt für immer ladbar und wird zu Format 2', () => {
  const d = decodeSave(readFileSync(new URL('./fixtures/spielstand-v1.txt', import.meta.url), 'utf8'));
  const m = migrateState(d.value);
  assert.equal(m.ok, true); assert.equal(m.state.version, 2);
  const { version, playMs, stones, lastStone, bag, shineActive, story, world, ...rest } = m.state;
  const { version: _v, ...v1 } = SPIELSTAND_V1;
  assert.deepEqual(rest, v1);
  assert.deepEqual(stones, [1]);          // Hüterin war mit ENQ9 besiegt → Stein 1 leuchtet
  assert.equal(lastStone, null); assert.equal(playMs, 5700000);  // Spielzeit aus allen Paketen zusammen
  assert.deepEqual(bag, { berry: 0, starfruit: 0, farsight: 0, shine: 0 }); assert.equal(shineActive, false);
  assert.deepEqual(story, {}); assert.deepEqual(world, { bushes: {}, notes: {}, finds: {} });
});
test('Spielstand der Fassung 2 bleibt für immer ladbar', () => {
  const d = decodeSave(readFileSync(new URL('./fixtures/spielstand-v2.txt', import.meta.url), 'utf8'));
  assert.deepEqual(migrateState(d.value), { ok: true, state: SPIELSTAND_V2 });
});
test('Format 2: unmögliche Werte werden repariert', () => {
  const m = migrateState({ ...structuredClone(SPIELSTAND_V2), stones: [3, 1, 1, 9, 'x'], lastStone: 7,
    bag: { berry: 99, starfruit: -1, farsight: 'zwei' }, story: { 1: 9, 12: 1 }, world: { bushes: { a: 'x', 'bucht:1,1': 5 } } });
  assert.deepEqual(m.state.stones, [1, 3]); assert.equal(m.state.lastStone, null); // nicht entzündet → null
  assert.equal(foodCount(m.state.bag), 10); assert.equal(m.state.bag.farsight, 0);
  assert.deepEqual(m.state.story, { 1: 3 }); // höchstens 3 Stücke je Gebiet, Gebiete 1..8
  assert.deepEqual(m.state.world.bushes, { 'bucht:1,1': 5 });
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL, weil `bag.js` fehlt und die Version noch 1 ist.
- [ ] **Step 3: Implementieren**
  - `MIGRATIONS[1](s)`:
    - Felder ergänzen, `version: 2`.
    - `stones` = sortierte Vereinigung aller `packs[*].beaten`. Wer in Plan 2 die Hüterin besiegt hat, bekommt seinen ersten Stein.
    - `playMs` = Summe aller `packs[*].stats.playMs`.
  - Reparatur von Format 2 (zusätzlich zu Plan 2):
    - `stones`: eindeutige ganze Zahlen von 1 bis 8, sortiert.
    - `lastStone`: muss in `stones` stehen, sonst `null`.
    - `bag`: ganze Zahlen ≥ 0 (sonst 0). Futter wird bei `foodMax` gekappt, zuerst die Sternfrüchte, dann die Beeren.
    - `shineActive`: Boolean.
    - `story`: Gebiete 1 bis 8, Werte 0 bis 3.
    - `world.*`: nur Einträge mit Schlüssel nach `/^[a-z]+:\d+,\d+$/` und endlicher Zahl ≥ 0.
    - `playMs`: endlich und ≥ 0.
    - `position`: wird gegen `MAPS[position.map]` geprüft statt nur gegen die Bucht, siehe Task 2. Bis dahin gilt die Bucht.
  - `main.js`: Die Spielzeit zählt zusätzlich in `game.state.playMs`, unter derselben Bedingung wie die Paketstatistik.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`, bis auf den Test für Format 2, der die Datei aus Step 6 braucht. Dieser Test bleibt bis Task 2 mit `{ todo: 'Fixture ab Task 2' }` markiert.
- [ ] **Step 5: Commit**: `git commit -m "Spielstand-Format 2 mit Rucksack, Leuchtsteinen und Spielzeit"`
- [ ] **Step 6 (am Ende von Task 2):** Die Fixture für Format 2 mit demselben Befehl wie in Plan 2 erzeugen. Quelle ist `SPIELSTAND_V2`, Ziel `spielstand-v2.txt`. Danach die Markierung `todo` entfernen und mit Task 2 committen.

---

### Task 2: Kartenverbund, Nebeltore und die Karte des Flüsterwalds

**Files:**
- Create: `js/world/network.js`, `js/world/maps/wald.js`
- Modify: `js/world/map.js`, `js/world/maps/bucht.js`, `js/gfx/art/tiles.js`, `js/save/migrate.js`, `js/config.js`
- Test: `tests/network.test.js`, `tests/wald.test.js`, `tests/bucht.test.js`, `tests/tiles.test.js`

**Interfaces:**
- Consumes: `createMap`, `reachable`, `cellKey` (Plan 1)
- Produces:
  - `createMap(def, { openGates = [] } = {})`: Felder offener Tore bekommen `gate.ground` statt Nebel.
  - `map.setTile(x, y, kind)`
  - `MAPS = { bucht: BUCHT, wald: WALD }`
  - `CONFIG.world.builtAreas = 2`
  - `areaOpen(state, pack, area) → boolean` ist wahr, wenn alle drei gelten:
    - `area === 1`, oder Stein `area − 1` leuchtet und das Paket hat Trainer `area`
    - `area ≤ CONFIG.world.builtAreas`
  - `openGatesFor(def, state, pack) → string[]` (Tor-IDs)
  - `exitAt(def, x, y) → exit | null`
  - `resolveStart(state, pack) → { map, x, y, dir }`:
    - Ist das Gebiet der gespeicherten Position offen, bleibt sie.
    - Sonst gilt der Platz vor dem höchsten entzündeten Leuchtstein in einem offenen Gebiet.
    - Gibt es keinen, gilt `BUCHT.respawn`.
  - `beaconFront(def, number) → { x, y, dir }`: das Feld unter dem Leuchtstein, Blick nach oben.
  - Neue Kachelarten:
    - `moss` (Waldboden, begehbar)
    - `fern` (hohes Gras im Wald, begehbar, zählt als hohes Gras)
    - `oldtree` (Baum mit Gesicht, blockiert)
    - `mushroom` (Überlagerung wie `rock`, blockiert)
    - `brook` (Bach, blockiert)
    - `bridge` (begehbar)

- [ ] **Step 1: Tests schreiben**

```js
// tests/network.test.js
const pack = n => ({ trainers: Array.from({ length: n }, (_, i) => ({ number: i + 1 })) });
const st = (stones = [], position = { map: 'bucht', x: 19, y: 24, dir: 'up' }) => ({ ...newGameState({ name: 'A', species: 'nixi', nickname: null }), stones, position });
test('Gebiet 2 ist offen, wenn Stein 1 leuchtet und das Paket Trainer 2 hat', () => {
  assert.equal(areaOpen(st([]), pack(2), 2), false);
  assert.equal(areaOpen(st([1]), pack(2), 2), true);
  assert.equal(areaOpen(st([1]), pack(1), 2), false);          // Paket ohne Thema 2 (Design 10.4)
  assert.equal(areaOpen(st([1, 2]), pack(8), 3), false);       // Gebiet 3 ist noch nicht gebaut
  assert.equal(areaOpen(st([]), pack(1), 1), true);
});
test('Nebeltor der Bucht öffnet sich nur mit offenem Wald', () => {
  assert.deepEqual(openGatesFor(BUCHT, st([1]), pack(2)), ['nord']);
  assert.deepEqual(openGatesFor(BUCHT, st([1]), pack(1)), []);
  const m = createMap(BUCHT, { openGates: ['nord'] }), g = BUCHT.gates[0];
  for (let y = g.y; y < g.y + g.h; y++) for (let x = g.x; x < g.x + g.w; x++) assert.notEqual(m.tileAt(x, y), 'fog');
  assert.equal(createMap(BUCHT).tileAt(g.x, g.y), 'fog');
});
test('Ausgänge führen auf begehbare Felder und zurück', () => {
  for (const def of Object.values(MAPS)) for (const e of def.exits) {
    const target = MAPS[e.to];
    assert.ok(target, e.to);
    const open = createMap(target, { openGates: target.gates.map(g => g.id) });
    assert.ok(open.canEnter(e.at.x, e.at.y), `${def.id} → ${e.to}`);
    assert.ok(target.exits.some(back => back.to === def.id), `kein Rückweg von ${e.to}`);
  }
});
test('Startposition: im Nebel liegendes Gebiet → höchster offener Leuchtstein, sonst Leuchtturm', () => {
  const inWald = { map: 'wald', x: 19, y: 27, dir: 'up' };
  assert.deepEqual(resolveStart(st([1], inWald), pack(2)), inWald);
  assert.deepEqual(resolveStart(st([1], inWald), pack(1)), { map: 'bucht', ...beaconFront(BUCHT, 1) });
  assert.deepEqual(resolveStart(st([], inWald), pack(1)), { map: 'bucht', ...BUCHT.respawn });
  assert.deepEqual(resolveStart(st([], { map: 'mond', x: 1, y: 1, dir: 'up' }), pack(1)), { map: 'bucht', ...BUCHT.respawn });
});

// tests/wald.test.js
test('Wald: 40 × 30, Gebiet 2, alles Wichtige ist vom Eingang aus erreichbar', () => {
  const m = createMap(WALD, { openGates: [] }), r = reachable(m, WALD.spawn);
  assert.equal(m.width, 40); assert.equal(m.height, 30); assert.equal(WALD.area, 2);
  const nextTo = (x, y) => [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => r.has(cellKey(x + dx, y + dy)));
  for (const o of WALD.objects.filter(o => o.type !== 'building')) assert.ok(nextTo(o.x, o.y), `${o.type} ${o.id ?? o.number}`);
  for (const f of WALD.finds) assert.ok(r.has(cellKey(f.x, f.y)) && m.isTallGrass(f.x, f.y), `Fundstelle ${f.id}`);
  assert.ok(WALD.objects.some(o => o.type === 'trainer' && o.number === 2));
  assert.ok(WALD.objects.some(o => o.type === 'beacon' && o.number === 2));
  assert.ok(WALD.objects.filter(o => o.type === 'npc').length >= 2 && WALD.objects.filter(o => o.type === 'npc').length <= 4);
  assert.ok(WALD.objects.filter(o => o.type === 'whisper').length >= 3);
  assert.ok(WALD.objects.filter(o => o.type === 'notestone').length >= 3 && WALD.objects.some(o => o.type === 'bush'));
  assert.ok([...r].filter(k => m.isTallGrass(...k.split(',').map(Number))).length >= 12);
  assert.ok(WALD.objects.some(o => o.type === 'sign' && o.role === 'fogEdge' && o.leadsTo === 3));
});

// tests/bucht.test.js (ergänzen): Bucht hat Leuchtstein 1, Tor 'nord' (leadsTo 2), Ausgang nach 'wald',
//   einen Strauch, mindestens 3 Zettelsteine und 2 Fundstellen, alles vom Start aus erreichbar
//   (das Tor dafür geöffnet). Der Leuchtstein liegt nicht im Blickfeld der Trainerin.
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Implementieren**
  - `map.js`:
    - Option `openGates`.
    - `setTile` ändert eine Zelle, damit sich das Tor während der Leuchtstein-Szene öffnen kann.
    - `isTallGrass` gilt für `tallgrass` und `fern`.
  - `network.js` laut Interfaces.
    - `resolveStart` nimmt den Leuchtstein mit der höchsten Nummer, dessen Gebiet offen ist und der in einer bekannten Karte steht.
  - `migrate.js`: Die Position wird mit `MAPS` geprüft.
  - Bucht:
    - Die Nebelfelder der Zeilen 0 bis 2 über dem Weg (Spalten 18 bis 21) werden das Tor `nord` mit `ground: 'path'` und `leadsTo: 2`.
    - Ausgang Zeile 0, Spalten 18 bis 21 → `wald` am südlichen Eingang.
    - Leuchtstein 1 steht neben dem Nordweg. Das Schild vom Nebelrand bleibt, sein Text kommt weiter aus `fogEdgeLines`.
    - Dazu ein Beerenstrauch, 3 Zettelsteine und 2 Fundstellen im hohen Gras.
  - Wald (`wald.js`):
    - Eingang im Süden mit Ausgang zur Bucht, Weg nach Norden, zwei Grasflächen mit Farn, ein Bach mit Brücke.
    - Lichtung mit Leuchtstein 2 und Trainer 2. Er blickt über den Weg, Sichtweite 4.
    - 3 Bewohner, mindestens 3 flüsternde Altbäume, 3 Zettelsteine, 2 Sträucher und 3 Fundstellen.
    - Im Norden ein Nebeltor `nord` mit `leadsTo: 3` und davor ein Schild mit `role: 'fogEdge'`, `gate: 2`, `leadsTo: 3`, `leadsToName: 'das Pilzmoor'`.
    - `spawn` liegt am südlichen Eingang, `respawn` an Leuchtstein 2.
  - Kacheln:
    - Waldboden in tiefen Grün- und Brauntönen, Farn mit 2 Bildern wie das hohe Gras.
    - Altbaum mit freundlichem Rindengesicht, Pilz, Bach mit 2 Bildern.
    - Dazu Requisiten (`PROPS`) für Strauch (mit und ohne Beeren), Zettelstein (Stein mit hellem Zeichen) und Leuchtstein (dunkel / leuchtend).
    - Alles aus der Palette, `tests/tiles.test.js` prüft Größe und Zeichen.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0` (Fixture für Format 2 noch `todo`).
- [ ] **Step 5: Task 1, Step 6 ausführen** (Fixture erzeugen, `todo` entfernen). Erwartet: `node --test` ergibt `# fail 0` ohne `todo`.
- [ ] **Step 6: Commit**: `git commit -m "Kartenverbund mit Nebeltoren und die Karte des Flüsterwalds"`

---

### Task 3: Wege zwischen den Gebieten

**Files:**
- Modify: `js/scenes/worldEvents.js`, `js/scenes/world.js`, `js/scenes/start.js`, `js/scenes/duel.js` (`makeWildSetup`/Arena nach Gebiet)
- Test: `tests/worldArea.test.js`

**Interfaces:**
- Consumes: `MAPS`, `exitAt`, `openGatesFor`, `resolveStart`, `areaOpen` (Task 2)
- Produces:
  - `createGameWorld(game)`: Die Karte kommt aus `game.state.position.map`, die Tore aus `openGatesFor`.
  - `areaConfig(def) → { area, trainerNumber, beacon }` (in `network.js`, rein)
  - `travelTo(game, { map, x, y, dir }, style = 'fade')`: Überblendung, Position setzen, `game.save()` und neue Weltszene.

- [ ] **Step 1: Test schreiben**

```js
// tests/worldArea.test.js
test('Gebiet, Trainer und Leuchtstein kommen aus der Karte', () => {
  assert.deepEqual(areaConfig(BUCHT), { area: 1, trainerNumber: 1, beacon: 1 });
  assert.deepEqual(areaConfig(WALD), { area: 2, trainerNumber: 2, beacon: 2 });
});
```

- [ ] **Step 2: `node --test tests/worldArea.test.js`.** Erwartet: FAIL.
- [ ] **Step 3: Implementieren.** `node --test` ergibt danach `# fail 0`.
  - `worldEvents.js` arbeitet ohne feste Nummer 1. Trainer, Trainer-Zeilen, „besiegt“ und die wilden Wesen (`makeWildSetup(game, def.area)`) kommen aus `areaConfig(def)` und dem Paket.
  - `onStepped`: Ein Ausgang (`exitAt`) führt per `travelTo` ins andere Gebiet. Das zählt vor den Begegnungen im Gras.
  - Nach dem Sieg über einen Trainer folgt bis Task 5 nur ein Satz statt der Leuchtstein-Szene: „Der Leuchtstein leuchtet wieder!“ Dazu `lightStone` aus Task 5 bzw. vorerst `state.stones.push(n)`.
  - `start.js`: Weiterspielen beginnt bei `resolveStart(state, pack)`. Gab es eine Änderung, steht Ilvy dort mit dem Satz „Der Nebel ist zurückgekommen. Ich habe dich hierher gebracht.“
  - Nach einem Paketwechsel prüft `packPage.js` dasselbe. Liegt das aktuelle Gebiet nun im Nebel, folgt `travelTo` mit demselben Satz.
  - Duell-Arena: `drawArena(ctx, area, t, reducedMotion)` wählt nach `setup.area`. Gebiet 1 bleibt die Bucht, Gebiet 2 ist der Wald (ab Task 4, bis dahin die Bucht).
- [ ] **Step 4: Im Browser prüfen**
  - Mit Stein 1 und dem Beispielpaket ist der Nebel im Norden der Bucht weg.
  - Hinauflaufen führt in den Wald, Zurücklaufen in die Bucht.
  - Ein Paket nur mit Trainer 1 laden, während man im Wald steht: Erwartet wird das Aufwachen am Leuchtstein der Bucht mit Ilvys Satz.
  - Neu laden: Man steht dort, wo man zuletzt war.
- [ ] **Step 5: Commit**: `git commit -m "Wege zwischen den Gebieten und Start im offenen Gebiet"`

---

### Task 4: Der Flüsterwald lebt

**Files:**
- Modify: `js/data/species.js`, `js/gfx/art/creatures.js`, `js/gfx/art/characters.js`, `js/gfx/arena.js`, `js/world/maps/wald.js`, `js/world/maps/bucht.js`, `js/scenes/worldEvents.js`, `js/scenes/gallery.js`
- Test: `tests/species.test.js`, `tests/creatures.test.js`, `tests/characters.test.js`, `tests/whisper.test.js`

**Interfaces:**
- Produces:
  - Arten (Design 6.4, Claude), jede mit Beschreibung in einem Satz:
    - `moosling`: Gebiet 2, häufig, Namen `['Moosling', 'Moosmuffel']`. Ein runder Moosballen mit Pilzhut.
    - `eichhuscher`: Gebiet 2, häufig, Namen `['Eichhuscher', 'Kronenhuscher']`. Ein Hörnchen aus Herbstlaub mit Eichelkappe.
    - `rindenwicht`: Gebiet 2, selten, Namen `['Rindenwicht']`. Ein kleiner Geist aus Rinde mit Laternenaugen.
  - `AREA_WILD[2] = { common: ['moosling', 'eichhuscher'], rare: 'rindenwicht' }`
  - `TRAINER_CREATURES[2] = { species: 'eichhuscher', stage: 2 }`
  - Figuren:
    - `CHARACTERS.trainer2`: Waldläufer mit Kapuze und Moosumhang
    - `fenna`: Kräutersammlerin mit Korb
    - `birk`: alter Holzschnitzer mit Bart
    - `lio`: Kind mit Glas für Glühwürmchen
  - `whisperLine(o, passCount) → string`: Die Zeilen eines Baums der Reihe nach, danach wieder von vorn (in `network.js`, rein).
  - `npcLines(o, state, area) → string[]`: `o.linesLit`, wenn der Stein des Gebiets leuchtet und es `linesLit` gibt, sonst `o.lines`.

- [ ] **Step 1: Tests schreiben**

```js
// tests/species.test.js (ergänzen)
test('Gebiet 2 hat zwei häufige und eine seltene Art, die Trainer-Art ist weiterentwickelt', () => {
  assert.deepEqual(AREA_WILD[2], { common: ['moosling', 'eichhuscher'], rare: 'rindenwicht' });
  for (const id of ['moosling', 'eichhuscher', 'rindenwicht']) { assert.equal(SPECIES[id].area, 2); assert.ok(SPECIES[id].description.length > 20); }
  assert.equal(speciesName('eichhuscher', 2), 'Kronenhuscher');
  assert.deepEqual(TRAINER_CREATURES[2], { species: 'eichhuscher', stage: 2 });
});
// tests/creatures.test.js (ergänzen): Sprite für moosling 1, eichhuscher 1 und 2, rindenwicht 1 in der
//   Größe aus STAGE_SIZE, nur Palettenzeichen, mit Umriss (wie die bestehenden Tests der Wesen).
// tests/characters.test.js (ergänzen): trainer2, fenna, birk, lio mit allen Richtungen und Schrittbildern.
// tests/whisper.test.js
test('flüsternde Bäume sagen ihre Zeilen der Reihe nach', () => {
  const o = { lines: ['a', 'b'] };
  assert.deepEqual([0, 1, 2].map(i => whisperLine(o, i)), ['a', 'b', 'a']);
});
test('Bewohner sagen etwas anderes, sobald der Stein leuchtet', () => {
  const o = { lines: ['vorher'], linesLit: ['nachher'] };
  const s = { stones: [2] };
  assert.deepEqual(npcLines(o, s, 2), ['nachher']); assert.deepEqual(npcLines(o, { stones: [] }, 2), ['vorher']);
  assert.deepEqual(npcLines({ lines: ['x'] }, s, 2), ['x']);
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Inhalte und Zeichnungen**
  - **Wesen:** aus Formen erzeugt wie in Plan 1, in den Farben des Waldes.
    - Kronenhuscher ist größer und trägt eine Krone aus Eichenblättern.
    - In der Galerie (`?galerie`) erscheinen alle neuen Wesen.
  - **Waldarena:** Waldboden mit Lichtflecken, Stämme im Hintergrund, keine Wolken.
  - **Texte im Wald** (Claude, im Rahmen von Design 5.6):
    - Fenna, Birk und Lio haben je 2 bis 3 Zeilen vor dem Sieg und 1 bis 2 Zeilen danach (`linesLit`).
    - Die Hinweise verraten: Farn ist hohes Gras, Sträucher wachsen nach, unter markierten Steinen liegen Zettel, Leuchtsteine heilen.
    - Die Altbäume haben je 2 bis 3 geflüsterte Zeilen. Sie deuten die Geschichte an, ohne Morrows Namen zu nennen, und geben einen Hinweis auf den Waldläufer.
  - **Flüstern:** Läuft die Figur an einem Altbaum vorbei (Nachbarfeld), erscheint `whisperLine` für 3 Sekunden als blasser Text oben im Bild.
    - Der Text blockiert nichts. Es gibt eine CSS-Klasse `whisper` in `#ui`, kursiv, halbtransparent.
    - Höchstens einmal pro Baum und Vorbeigehen.
  - **Bucht:** Ilvy, Bram, Pim und Oda bekommen `linesLit` (1 bis 2 Zeilen) für die Zeit, wenn Stein 1 leuchtet, etwa „Hast du den Nebel im Norden gesehen? Er ist weg!“
  - **Hüterin nach dem Sieg:** Der Satz `AFTER_WIN` lautet dann „Dein Leuchtstein strahlt. Der Weg in den Flüsterwald ist frei.“ Gilt das für ein Paket ohne Trainer 2, kommt stattdessen `fogEdgeLines`.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Im Browser prüfen**
  - Im Wald alle Bewohner ansprechen.
  - An den Altbäumen vorbeigehen: Das Flüstern erscheint und verschwindet wieder.
  - Im Farn tauchen Moosling, Eichhuscher und selten der Rindenwicht auf, in der Waldarena.
  - Der Waldläufer entdeckt einen und kämpft mit dem Kronenhuscher.
  - `?galerie` zeigt die neuen Wesen.
- [ ] **Step 6: Commit**: `git commit -m "Flüsterwald: Wesen, Waldläufer, Bewohner und flüsternde Bäume"`

---

### Task 5: Leuchtsteine – entzünden, reisen, aufwachen

**Files:**
- Create: `js/world/beacons.js`, `js/scenes/beacon.js`
- Modify: `js/scenes/worldEvents.js`, `js/scenes/world.js` (Lichtringe, Zeichen „neue Herausforderung“), `js/state.js`, `js/config.js`
- Test: `tests/beacons.test.js`

**Interfaces:**
- Consumes: `areaOpen`, `beaconFront`, `MAPS` (Task 2), `travelTo` (Task 3)
- Produces:
  - `lightStone(state, n) → boolean`: wahr, wenn der Stein neu leuchtet. Setzt außerdem `lastStone = n`.
  - `visitStone(state, n)`: setzt `lastStone`, aber nur für entzündete Steine.
  - `travelTargets(state, pack) → [{ number, map, name }]`: entzündete Steine in offenen Gebieten, aufsteigend. `name` ist der Gebietsname der Karte.
  - `respawnPoint(state, pack) → { map, x, y, dir }`: vor `lastStone`, wenn dessen Gebiet offen ist, sonst `BUCHT.respawn`.
  - `challengeMark(state, pack, number) → boolean`: Der Stein leuchtet, aber der Trainer ist mit diesem Paket noch nicht besiegt (Design 10.4).
  - `CONFIG.beacons = { sceneMs: 2600, ringColors: ['#ffe08a', '#7fd17a', '#c69ae8', '#f2c26b', '#9fd8ef', '#e8a272', '#bfe9ff', '#f5f0a8'] }`

- [ ] **Step 1: Tests schreiben**

```js
// tests/beacons.test.js
const pack = n => ({ shortId: 'ENQ9', trainers: Array.from({ length: n }, (_, i) => ({ number: i + 1 })) });
const s0 = () => newGameState({ name: 'A', species: 'nixi', nickname: null });
test('Stein entzünden: einmal neu, merkt sich den letzten Stein', () => {
  const s = s0();
  assert.equal(lightStone(s, 1), true); assert.equal(lightStone(s, 1), false);
  assert.deepEqual(s.stones, [1]); assert.equal(s.lastStone, 1);
  visitStone(s, 2); assert.equal(s.lastStone, 1);   // Stein 2 leuchtet noch nicht
});
test('Reiseziele: nur entzündete Steine in offenen Gebieten', () => {
  const s = s0(); lightStone(s, 1); lightStone(s, 2);
  assert.deepEqual(travelTargets(s, pack(2)).map(t => t.number), [1, 2]);
  assert.deepEqual(travelTargets(s, pack(1)).map(t => t.number), [1]);   // Wald liegt mit diesem Paket im Nebel
  assert.equal(travelTargets(s, pack(2))[1].name, 'Flüsterwald');
});
test('Aufwachen nach Niederlage: am zuletzt besuchten Stein, sonst am Leuchtturm', () => {
  const s = s0();
  assert.deepEqual(respawnPoint(s, pack(2)), { map: 'bucht', ...BUCHT.respawn });
  lightStone(s, 1); lightStone(s, 2);
  assert.deepEqual(respawnPoint(s, pack(2)), { map: 'wald', ...beaconFront(WALD, 2) });
  visitStone(s, 1);
  assert.deepEqual(respawnPoint(s, pack(2)), { map: 'bucht', ...beaconFront(BUCHT, 1) });
  s.lastStone = 2;
  assert.deepEqual(respawnPoint(s, pack(1)), { map: 'bucht', ...BUCHT.respawn });
});
test('Zeichen „neue Herausforderung“', () => {
  const s = s0(); lightStone(s, 1);
  assert.equal(challengeMark(s, pack(2), 1), true);
  packProgress(s, 'ENQ9').beaten.push(1);
  assert.equal(challengeMark(s, pack(2), 1), false);
  assert.equal(challengeMark(s, pack(2), 2), false);
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Implementieren**
  - **Leuchtstein-Szene** (`playBeaconScene(game, world, number)` in `scenes/beacon.js`), Dauer `CONFIG.beacons.sceneMs` (Design 5.1):
    1. Die Kamera bleibt.
    2. Der Stein flammt auf: ein Lichtkreis wächst und wird wieder kleiner.
    3. Die Nebelfelder des Tors, das zu diesem Stein gehört, werden durchsichtig.
    4. `map.setTile` setzt ihren Boden.
    5. Am Ende steht „Der Leuchtstein der {Gebietsname} leuchtet wieder! Der Nebel weicht.“, etwa „der Leuchtturmbucht“. Ist das nächste Gebiet in dieser Fassung noch nicht gebaut oder fehlt im Paket, kommt stattdessen „Der Leuchtstein leuchtet wieder!“ und danach `fogEdgeLines`.
    - Bei „Bewegung reduzieren“ wird ohne Wachsen nur übergeblendet.
  - **Wann:** nach dem ersten Sieg über den Trainer des Gebiets, wenn `lightStone` neu ist. Leuchtet der Stein schon (anderes Paket), gibt es keine Szene, aber volle Erst-Sieg-XP (das ist schon so).
  - **Ansprechen eines Leuchtsteins:**
    - Ist er dunkel: „Ein erloschener Leuchtstein. Seine Hüterin oder sein Hüter ist ganz in der Nähe.“
    - Leuchtet er:
      1. Energie voll und `visitStone`.
      2. „{Wesen} tankt neues Licht.“
      3. Gibt es mehr als ein Reiseziel, die Frage `choose(game, 'Wohin möchtest du reisen?', [Ziele…, 'Hierbleiben'])`.
      4. Danach `travelTo` vor den Zielstein mit der Überblendung `'fade'`.
  - **Niederlage:** Aufwachen an `respawnPoint` statt immer in der Bucht.
    - Liegt der Punkt in einem anderen Gebiet, gilt `travelTo`.
    - Der Satz lautet „Du bist am Leuchtstein aufgewacht. {Wesen} hat sich erholt.“, ohne Stein „… am Leuchtturm …“.
  - **Lichtringe:** Für jeden entzündeten Stein zeichnet die Bucht einen farbigen Ring um die Lampe des Leuchtturms (`ringColors[n−1]`). Die Ringe pulsieren sanft, bei „Bewegung reduzieren“ stehen sie still.
  - **Zeichen „neue Herausforderung“:** ein kleiner weißer Stern über dem Trainer, wenn `challengeMark` gilt.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Im Browser prüfen**
  - Hüterin besiegen: Die Szene läuft, der Nebel im Norden zieht ab, ein Ring erscheint am Leuchtturm.
  - Im Wald den Waldläufer besiegen: Die Szene läuft, das Schild im Norden nennt das Pilzmoor.
  - Am Leuchtstein im Wald zur Bucht reisen und zurück.
  - Im Wald verlieren, nachdem Stein 2 besucht wurde: Aufwachen am Stein im Wald.
  - Mit einem zweiten Paket: Stern über der Hüterin.
- [ ] **Step 6: Commit**: `git commit -m "Leuchtsteine: entzünden, Lichtringe, reisen und aufwachen"`

---

### Task 6: Futter – Beeren, Sternfrüchte und der Grüne Daumen

**Files:**
- Create: `js/items/food.js`, `js/menu/bagPage.js`
- Modify: `js/duel/duel.js`, `js/ui/duelPanel.js`, `js/scenes/duel.js`, `js/scenes/worldEvents.js`, `js/state.js` (`applyDuelResult` liefert Beute), `js/menu/menu.js`, `js/world/maps/*.js` (Sträucher), `js/config.js`
- Test: `tests/food.test.js`, `tests/duel.test.js`, `tests/state.test.js`

**Interfaces:**
- Consumes: `addItem`, `takeItem` (Task 1)
- Produces:
  - `CONFIG.food = { berry: 2, berryPieks: 4, bushRegrowMs: 300000, wildDropChance: 0.2, pieksFindChance: 0.5, maxFeedPerDuel: 2 }`
  - `foodEnergy(species, item) → number | 'full'`: `berry` gibt 2, bei Pieks 4. `starfruit` gibt `'full'`.
  - `eat(state, item) → { ok, gained }`: Nicht essen, wenn die Energie schon voll ist (`ok: false`).
  - `bushKey(mapId, o) → string`
  - `bushReady(state, key) → boolean`: `(world.bushes[key] ?? 0) <= state.playMs`
  - `harvest(state, key) → 'ok' | 'full' | 'empty'`: Bei `ok` gibt es eine Beere, und `readyAt = playMs + bushRegrowMs`.
  - `duelLoot(state, setup, rng) → Item[]`:
    - nach einem Sieg gegen ein wildes Wesen mit 20 % eine Beere
    - bei Pieks nach jedem Sieg mit 50 % eine Beere
    - Beides kann zusammenkommen. Das Ergebnis geht durch `addItem`, und `applyDuelResult` meldet `report.loot` mit dem, was wirklich in den Rucksack passte.
  - Duell:
    - `duel.canFeed()`
    - `duel.feed(amount | 'full') → number`: Höchstens zweimal pro Duell. Nur im Zustand `question`, danach `ready`. Niemand verliert Energie.

- [ ] **Step 1: Tests schreiben**

```js
// tests/food.test.js
const s0 = (species = 'nixi') => newGameState({ name: 'A', species, nickname: null });
test('Beere +2, bei Pieks +4, Sternfrucht füllt ganz auf, nicht über das Maximum', () => {
  assert.equal(foodEnergy('nixi', 'berry'), 2); assert.equal(foodEnergy('pieks', 'berry'), 4); assert.equal(foodEnergy('nixi', 'starfruit'), 'full');
  const s = s0(); s.creature.energy = 1; addItem(s, 'berry', 2);
  assert.deepEqual(eat(s, 'berry'), { ok: true, gained: 2 }); assert.equal(s.creature.energy, 3);
  assert.deepEqual(eat(s, 'berry'), { ok: true, gained: 1 }); assert.equal(s.creature.energy, 4);
  addItem(s, 'berry'); assert.deepEqual(eat(s, 'berry'), { ok: false, gained: 0 }); assert.equal(s.bag.berry, 1);
});
test('Strauch: ernten, nach 5 Minuten Spielzeit wieder voll, voller Rucksack lässt die Beere hängen', () => {
  const s = s0(); s.playMs = 1000;
  assert.equal(harvest(s, 'bucht:6,13'), 'ok'); assert.equal(s.bag.berry, 1);
  assert.equal(harvest(s, 'bucht:6,13'), 'empty');
  s.playMs = 1000 + 299999; assert.equal(bushReady(s, 'bucht:6,13'), false);
  s.playMs = 1000 + 300000; assert.equal(bushReady(s, 'bucht:6,13'), true);
  addItem(s, 'berry', 20); assert.equal(harvest(s, 'bucht:6,13'), 'full'); assert.equal(bushReady(s, 'bucht:6,13'), true);
});
test('Beute nach dem Duell', () => {
  const always = { next: () => 0 }, never = { next: () => 0.99 };
  assert.deepEqual(duelLoot(s0(), { kind: 'wild' }, always), ['berry']);
  assert.deepEqual(duelLoot(s0('pieks'), { kind: 'wild' }, always), ['berry', 'berry']);
  assert.deepEqual(duelLoot(s0('pieks'), { kind: 'trainer' }, always), ['berry']);
  assert.deepEqual(duelLoot(s0(), { kind: 'wild' }, never), []);
});
// tests/duel.test.js (ergänzen)
test('Füttern statt antworten: höchstens zweimal, niemand verliert Energie', () => {
  const d = mk({ energy: 2, maxEnergy: 4 });
  d.ask(); assert.equal(d.canFeed(), true); assert.equal(d.feed(2), 2); assert.equal(d.playerEnergy, 4); assert.equal(d.state, 'ready');
  d.ask(); assert.equal(d.feed('full'), 0); d.ask(); assert.equal(d.canFeed(), false); assert.equal(d.feed(2), 0);
  assert.equal(d.foeEnergy, 5);
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Implementieren**
  - **Sträucher in der Welt:**
    - Ein voller Strauch zeigt rote Beeren, ein leerer nur Blätter.
    - Ansprechen mit A führt zu `harvest`:
      - `ok`: „Du pflückst eine Beere.“
      - `full`: „Dein Rucksack ist voll.“
      - `empty`: „Hier wachsen bald neue Beeren.“
  - **Duell:**
    - Hat der Rucksack Futter und ist `canFeed()` wahr, erscheint der Knopf „Füttern“ in der Seitenleiste, fest an seinem Platz wie die anderen Fähigkeiten.
    - Ein Tipp öffnet bei Beere und Sternfrucht eine kleine Auswahl, sonst wird die einzige Sorte gleich genommen.
    - Danach kommen `takeItem`, `duel.feed` und die Rückmeldung „{Wesen} isst eine Beere. +2 Energie“. Es folgt die nächste Frage.
    - Doppeltipp-Schutz wie bei den Antworten.
  - **Beute:** nach einem Sieg, nach den XP: „{Wesen} findet eine Beere.“ bzw. „Das wilde … hat eine Beere verloren.“ Ist kein Platz: „Dein Rucksack ist voll.“
  - **Rucksack-Seite** (Menü → Rucksack):
    - Listet Beeren x/10 (zusammen mit Sternfrüchten), Sternfrüchte, Weitblicksteine, Glanzsteine und „Lebenssteine im Wesen: n von 3“.
    - Bei Futter steht „Füttern“ und dahinter `eat` mit Meldung. Ist die Energie voll: „{Wesen} ist schon satt.“
    - Weitblick- und Glanzstein bekommen ihre Knöpfe in Task 7.
  - **Menü:** „Wesen“, „Rucksack“, „Tagebuch“ (ab Task 8), „Einstellungen“, „Zurück zum Spiel“.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Im Browser prüfen**
  - Den Strauch in der Bucht ernten.
  - Im Duell füttern: Erst nach zweimal ist der Knopf gesperrt.
  - Mit Pieks gewinnen: Hin und wieder kommt eine Beere.
  - Rucksack voll, dann am Strauch: Die Meldung erscheint.
- [ ] **Step 6: Commit**: `git commit -m "Futter: Sträucher, Füttern im Duell und im Rucksack, Grüner Daumen"`

---

### Task 7: Seltene Steine im hohen Gras

**Files:**
- Create: `js/items/stones.js`
- Modify: `js/duel/duel.js`, `js/ui/duelPanel.js`, `js/scenes/worldEvents.js`, `js/scenes/world.js` (Glitzern), `js/menu/bagPage.js`, `js/state.js` (Glanzstein in `applyDuelResult`), `js/config.js`
- Test: `tests/stones.test.js`, `tests/duel.test.js`, `tests/state.test.js`

**Interfaces:**
- Produces:
  - `CONFIG.finds = { stepChance: 1 / 150, respawnMs: 600000, table: { farsight: 3, shine: 2, life: 1 } }`
  - `rollStone(state, rng) → Item`: aus der Tabelle. `life` wird zu `farsight`, wenn schon 3 Lebenssteine wirken.
  - `findKey(mapId, f) → string`
  - `findReady(state, key) → boolean`
  - `takeFind(state, key, rng) → { item, added }`: setzt `readyAt = playMs + respawnMs`.
  - `stepFind(state, rng) → Item | null`: Bei jedem Schritt im hohen Gras gibt es mit 1/150 einen Stein (Design 8.2).
  - Duell:
    - `duel.canFarsight()` gilt nur ohne schon gezeigten Hinweis für die aktuelle Frage.
    - `duel.useFarsight() → hint`: dasselbe Ergebnis wie `jokerHint`.
  - `applyDuelResult`: Bei einem Sieg mit `state.shineActive` werden die XP verdoppelt (nach dem Makellos-Bonus), dann `shineActive = false`, und `report.shine = true`.

- [ ] **Step 1: Tests schreiben**

```js
// tests/stones.test.js
const s0 = () => newGameState({ name: 'A', species: 'nixi', nickname: null });
const seq = (...v) => { let i = 0; return { next: () => v[i++ % v.length] } };
test('Fundtabelle: Weitblick 3, Glanz 2, Leben 1; mit 3 Lebenssteinen kein weiterer', () => {
  assert.equal(rollStone(s0(), seq(0)), 'farsight'); assert.equal(rollStone(s0(), seq(0.55)), 'shine'); assert.equal(rollStone(s0(), seq(0.9)), 'life');
  const s = s0(); s.creature.lifeStones = 3; assert.equal(rollStone(s, seq(0.9)), 'farsight');
});
test('Fundstelle: einmal aufheben, nach 10 Minuten Spielzeit wieder da', () => {
  const s = s0(); s.playMs = 0;
  assert.equal(findReady(s, 'wald:5,6'), true);
  assert.equal(takeFind(s, 'wald:5,6', seq(0)).item, 'farsight'); assert.equal(s.bag.farsight, 1);
  assert.equal(findReady(s, 'wald:5,6'), false); s.playMs = 600000; assert.equal(findReady(s, 'wald:5,6'), true);
});
test('Fund beim Schritt im Gras: 1 zu 150', () => {
  assert.equal(stepFind(s0(), seq(1 / 150 - 1e-9, 0)), 'farsight'); assert.equal(stepFind(s0(), seq(1 / 150)), null);
});
// tests/state.test.js (ergänzen)
test('Glanzstein verdoppelt die XP des nächsten Siegs', () => {
  const s = newGameState({ name: 'A', species: 'funki', nickname: null }); s.shineActive = true;
  const r = applyDuelResult(s, 'ENQ9', { kind: 'wild', area: 2 }, { outcome: 'won', playerEnergy: 3, flawless: true, answers: [] });
  assert.equal(r.xp, Math.round((8 + 2 * 2) * 1.25) * 2); assert.equal(r.shine, true); assert.equal(s.shineActive, false);
});
// tests/duel.test.js (ergänzen): Weitblick einmal pro Frage, liefert dieselbe Form wie jokerHint,
//   auch wenn Funkis Erleuchtung schon verbraucht ist.
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Implementieren**
  - **Glitzern:** Fundstellen, die bereit sind, glitzern im Gras. Ein heller Punkt blinkt höchstens zweimal pro Sekunde, bei „Bewegung reduzieren“ leuchtet er nur still.
  - **Aufheben:** Steht die Figur davor und drückt A (Ziel ist die Zelle davor ohne Objekt), folgt `takeFind` mit Meldung, etwa „Du findest einen Weitblickstein!“ oder „Ein Lebensstein! {Wesen} hat jetzt dauerhaft 1 Energie mehr.“
  - **Fund beim Schritt** (`stepFind`): dieselbe Meldung. Es zählt vor der Begegnung im Gras: Dann gibt es in diesem Schritt kein Duell.
  - **Duell:** Knopf „Weitblick (n)“ in der Seitenleiste, wenn welche im Rucksack sind. Er setzt `takeItem` und `applyHint` ein, wie Funkis Erleuchtung.
  - **Rucksack:** Beim Glanzstein steht „Einsetzen“, danach „Glanzstein leuchtet: doppelte XP beim nächsten Sieg.“ Ist schon einer aktiv, ist der Knopf gesperrt.
  - **XP-Satz bei Glanz:** „{Wesen} bekommt {xp} XP. Der Glanzstein verdoppelt sie!“
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Im Browser prüfen.** Glitzern finden und aufheben, Weitblick im Duell einsetzen, Glanzstein einsetzen und gewinnen.
- [ ] **Step 6: Commit**: `git commit -m "Seltene Steine: Fundstellen, Weitblick, Glanz und Lebenssteine"`

---

### Task 8: Zettel unter Steinen, Geschichtsstücke und Tagebuch

**Files:**
- Create: `js/world/notes.js`, `js/data/story.js`, `js/scenes/note.js`, `js/menu/diaryPage.js`
- Modify: `js/scenes/worldEvents.js`, `js/scenes/world.js` (Zettelsteine zeichnen), `js/menu/menu.js`, `js/config.js`
- Test: `tests/notes.test.js`, `tests/story.test.js`

**Interfaces:**
- Consumes: `createDeck`, `pickForm`, `buildChoices`, `buildTiles`, `checkTyped`, `checkTiles` (Plan 1); `createDuelPanel` (Plan 1, für die Antwortformen); `addItem`, `addXp`
- Produces:
  - `CONFIG.notes = { xp: 15, rewardChance: 0.5, refillMs: 600000, rewards: { berry: 3, starfruit: 1, farsight: 2, shine: 1, life: 1 } }`
  - `STORY = { 1: [Text, Text, Text], 2: [Text, Text, Text] }` (genau so, siehe unten)
  - `notePool(pack, beaten) → Question[]`: der Abschnitt `ZETTEL`, ohne ihn `poolFor(pack, { kind: 'wild', beaten })`.
  - `noteReady(state, key) → boolean`
  - `solveNote(state, key, area, correct, rng) → { xp, item, story: string | null }`:
    - Bei `correct = false` passiert nichts, der Zettel bleibt.
    - Bei `correct = true`: 15 XP über `addXp`, mit 50 % ein Gegenstand aus `rewards`, das nächste Geschichtsstück des Gebiets (solange es noch eins gibt) und `readyAt = playMs + refillMs`.
  - `storyFound(state) → [{ area, index, text }]`: in Gebiets- und Fundreihenfolge.

- [ ] **Step 1: Tests schreiben**

```js
// tests/notes.test.js
const s0 = () => newGameState({ name: 'A', species: 'nixi', nickname: null });
const seq = (...v) => { let i = 0; return { next: () => v[i++ % v.length] } };
test('Zettel ohne ZETTEL-Abschnitt nehmen Fragen wie wilde Wesen', () => {
  const r = parsePack(makePackText({ trainers: 2 })).pack;
  assert.deepEqual(notePool(r, []).map(q => q.trainer), Array(8).fill(1));
  const withNotes = parsePack(makePackText({ trainers: 1 }) + '=== ZETTEL ===\n' + fillerQuestions(2, 'Z')).pack;
  assert.equal(notePool(withNotes, []).length, 2);
});
test('falsch: nichts, der Zettel bleibt liegen', () => {
  const s = s0(); s.playMs = 0;
  assert.deepEqual(solveNote(s, 'bucht:3,12', 1, false, seq(0)), { xp: 0, item: null, story: null });
  assert.equal(noteReady(s, 'bucht:3,12'), true); assert.equal(s.creature.xpInLevel, 0);
});
test('richtig: 15 XP, das nächste Geschichtsstück, mit 50 % ein Gegenstand, nach 10 Minuten neu', () => {
  const s = s0(); s.playMs = 0;
  const a = solveNote(s, 'bucht:3,12', 1, true, seq(0.4, 0));
  assert.equal(a.xp, 15); assert.equal(a.item, 'berry'); assert.equal(a.story, STORY[1][0]);
  assert.equal(noteReady(s, 'bucht:3,12'), false);
  const b = solveNote(s, 'bucht:4,12', 1, true, seq(0.6));
  assert.equal(b.item, null); assert.equal(b.story, STORY[1][1]);
  solveNote(s, 'bucht:5,12', 1, true, seq(0.6));
  assert.equal(solveNote(s, 'bucht:6,12', 1, true, seq(0.6)).story, null);   // nur 3 Stücke je Gebiet
  s.playMs = 600000; assert.equal(noteReady(s, 'bucht:3,12'), true);
  assert.deepEqual(storyFound(s).map(x => x.index), [0, 1, 2]);
});
// tests/story.test.js: STORY hat für Gebiet 1 und 2 je 3 Stücke, jedes 60–240 Zeichen, kein „Morrow“.
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Geschichtsstücke** (Claude, genau so, Design 5.4 und 5.5; Morrows Name kommt erst später):
  - **Gebiet 1:**
    1. „Vor langer Zeit trugen die Menschen von Lumara alles, was sie lernten, zu den acht Leuchtsteinen. Je mehr sie wussten, desto heller leuchteten die Steine.“
    2. „Jeder Stein hatte eine Hüterin oder einen Hüter. Sie kannten jeden Weg der Insel und luden alle ein, ihr Wissen mit ihnen zu teilen.“
    3. „Eines Winters wurden die Steine trüb. Ein feiner Nebel zog vom Berg herab, und die Leute vergaßen erst kleine Dinge, dann ganze Lieder.“
  - **Gebiet 2:**
    1. „Die alten Bäume im Flüsterwald erinnern sich noch. Sie flüstern Wörter, die niemand mehr sagt, damit sie nicht ganz verloren gehen.“
    2. „Die Hüterinnen und Hüter zogen sich in ihre Gebiete zurück. Sie warten darauf, dass jemand kommt und ihnen zeigt, was er gelernt hat.“
    3. „Manche sagen, der Nebel komme aus einer Höhle tief im Berg. Wer dort lebt, weiß niemand mehr. Vielleicht hat man es einfach vergessen.“
- [ ] **Step 4: Zettel in der Welt**
  - **Zettelstein:** Ist er bereit, trägt er ein helles Zeichen, sonst ist er ein grauer Stein.
  - **Ansprechen:**
    1. „Unter dem Stein liegt ein Zettel. Möchtest du die Aufgabe lösen?“ mit [„Ja“, „Später“].
    2. Bei „Ja“ folgt `createNoteScene`: das Panel aus dem Duell mit genau einer Frage aus `notePool`, ohne Arena, über der Welt, ohne Fliehen-Knopf und mit „Später“ als B.
    3. Bei richtiger Antwort: ✓ mit „Richtig! +15 XP“, gegebenenfalls „Du findest außerdem …“, dann das Geschichtsstück als Textfenster unter dem Titel „Ein Stück Geschichte“.
    4. Bei falscher Antwort: ✗ mit der richtigen Antwort und „Der Zettel bleibt hier liegen.“
  - Das Ergebnis zählt in die Statistik des Pakets und in die Fragenhistorie, wie eine Antwort im Duell, aber nicht als Sieg.
  - Danach `game.save()`.
  - **Tagebuch** (Menü → Tagebuch): „Geschichte“ mit allen gefundenen Stücken, gruppiert nach Gebiet. Fehlende Stücke erscheinen als „Noch nicht gefunden“. Aufträge kommen mit Plan 4.
- [ ] **Step 5: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 6: Im Browser prüfen**
  - Drei Zettel in der Bucht lösen: Die Stücke erscheinen der Reihe nach im Tagebuch.
  - Eine falsche Antwort: Der Zettel bleibt.
  - Mit einem Paket ohne `ZETTEL` kommen Fragen aus Thema 1.
- [ ] **Step 7: Commit**: `git commit -m "Zettel unter Steinen, Geschichtsstücke und Tagebuch"`

---

### Task 9: Teilchen und Wetter

**Files:**
- Create: `js/gfx/particles.js`
- Modify: `js/scenes/world.js`, `js/world/maps/bucht.js`, `js/world/maps/wald.js`
- Test: `tests/particles.test.js`

**Interfaces:**
- Produces:
  - `createParticles(kinds: string[], { rng, reducedMotion, width = 240, height = 160 }) → { update(dt, cam), each(fn) }`
  - Arten (Design 5.3):
    - `'gull'`: Möwen ziehen selten über das Bild.
    - `'spray'`: Gischt glitzert am Ufer.
    - `'firefly'`: Glühwürmchen schweben und glimmen.
    - `'leaf'`: Blätter fallen und taumeln.
  - `MapDef.particles = ['gull', 'spray']` bzw. `['firefly', 'leaf']`
  - `PARTICLE_LIMITS = { gull: 2, spray: 12, firefly: 14, leaf: 10 }`; bei `reducedMotion` je höchstens ein Viertel, aufgerundet.

- [ ] **Step 1: Tests schreiben**

```js
// tests/particles.test.js
test('nie mehr Teilchen als erlaubt, bei Bewegung reduzieren höchstens ein Viertel', () => {
  const p = createParticles(['firefly', 'leaf'], { rng: createRng(1), reducedMotion: false });
  for (let i = 0; i < 600; i++) p.update(16, { x: 0, y: 0 });
  const count = k => { let n = 0; p.each(q => { if (q.kind === k) n++; }); return n; };
  assert.ok(count('firefly') <= 14 && count('firefly') > 0); assert.ok(count('leaf') <= 10);
  const r = createParticles(['firefly'], { rng: createRng(1), reducedMotion: true });
  for (let i = 0; i < 600; i++) r.update(16, { x: 0, y: 0 });
  let n = 0; r.each(() => n++); assert.ok(n <= 4);
});
test('Glühwürmchen glimmen langsam, höchstens dreimal pro Sekunde', () => {
  const p = createParticles(['firefly'], { rng: createRng(2), reducedMotion: false });
  p.update(16, { x: 0, y: 0 });
  p.each(q => assert.ok(q.blinkHz <= 3));
});
```

- [ ] **Step 2: `node --test tests/particles.test.js`.** Erwartet: FAIL.
- [ ] **Step 3: Implementieren**
  - Die Teilchen leben in Bildkoordinaten. Blätter und Glühwürmchen bleiben grob dort, wo sie sind, wenn die Kamera wandert (Parallaxe 0,5).
  - Gezeichnet wird nach den Figuren und vor dem Nebel: Pixel mit 1 bis 2 Pixel Größe, Möwen als kleine „v“-Form.
  - Bei „Bewegung reduzieren“ bewegen sie sich langsamer und blinken nicht.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Im Browser prüfen.** Bucht und Wald einmal mit und einmal ohne reduzierte Bewegung ansehen (Chrome: DevTools-Emulation oder `game.reducedMotion = true` in der Konsole). Die Bildrate bleibt flüssig.
- [ ] **Step 6: Commit**: `git commit -m "Teilchen und Wetter in Bucht und Wald"`

---

### Task 10: Abschluss von Plan 3a

**Files:**
- Modify: `version.json`, `js/version.js`, `sw.js`, `README.md`, `pakete/vorlage.txt` (wenn nötig)

- [ ] **Step 1: Spielfassung `0.3.0`** an allen drei Stellen setzen und neue Dateien in `FILES` eintragen. Erwartet: `node --test` ergibt `# fail 0`, `sw.test.js` eingeschlossen.
- [ ] **Step 2: README**
  - Status Plan 3a mit Link auf diesen Plan.
  - Kurz, was neu ist.
  - Hinweis, dass Format 2 jetzt festgeschrieben ist und die Fixture für Format 2 nie geändert wird.
- [ ] **Step 3: Gesamtdurchlauf in Chrome**
  1. Neues Spiel und die Hüterin besiegen: Leuchtstein-Szene.
  2. In den Wald und dort Zettel, Strauch und Fundstelle.
  3. Den Waldläufer besiegen.
  4. Zurückreisen und neu laden: Alles ist noch da.
  5. Paket nur mit Trainer 1: Aufwachen in der Bucht.
  6. Einen Spielstand aus Plan 2 (Format 1, in der Konsole aus der Fixture erzeugt) laden: Stein 1 leuchtet.
- [ ] **Step 4: Commit**: `git commit -m "Plan 3a abschließen: Spielfassung 0.3.0 und README"`
