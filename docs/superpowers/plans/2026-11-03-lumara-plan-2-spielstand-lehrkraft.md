# Lumara · Plan 2: Spielstand und Lehrkraft – Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein Kind spielt in der nächsten Stunde dort weiter, wo es aufgehört hat. Es kann seinen Spielstand samt Lernpaket als Datei sichern und auf ein anderes Gerät mitnehmen. Die Lehrkraft sieht auf einem Screenshot, wie viel und wie treffsicher das Kind geübt hat, und prüft die Angaben mit dem Prüfcode auf `lehrkraft.html`. Nach dem ersten Laden läuft das Spiel auch ohne Netz und bekommt Updates zuverlässig.

**Architecture:** Neue reine Module ohne DOM, in Node getestet:
- `js/save/`: Verschleierung, Format mit Umwandlung, Speicher mit Sicherung, automatisches Speichern, Spielzeit, Sicherungsdatei
- `js/teacher/`: Prüfcode, Statistik, Eingaben der Lehrkraft, Paketübersicht
- `js/app/`: Startweg, Plattform, Versionsvergleich

Darüber liegen dünne Browser-Teile:
- der Startablauf `js/scenes/start.js`
- ein bildschirmfüllendes Menü-Blatt `js/ui/sheet.js` mit Seiten in `js/menu/`
- die Seite `lehrkraft.html`
- ein klassischer Service Worker `sw.js`

**Tech Stack:** wie Plan 1. Neu dazu kommen:
- Web Share API
- Service Worker und Cache API
- `navigator.storage.persist()`
- Node `zlib`, aber nur im Werkzeug, das das App-Symbol erzeugt

**Spec:** `docs/superpowers/specs/2026-11-01-lernwelt-rpg-design.md` (im Folgenden „Design“, Abschnittsnummern wie dort). Vorgänger: `docs/superpowers/plans/2026-11-02-lumara-plan-1-spielbarer-kern.md` („Plan 1“).

**Umfang:** Design 17, Schritt 4 sowie die Abschnitte 10.1, 10.4, 11, 12, 13 (Menü und Einstellungen) und 16. Dazu kommt der offene Punkt M9 aus Plan 1: `window.lumara` nur auf localhost.

**Bewusst noch nicht in diesem Plan:**
- Gebiet 2 und die Leuchtsteine kommen mit Plan 3. Deshalb fehlen noch:
  - das Zeichen „neue Herausforderung“ an Trainern (10.4)
  - das Speichern bei Fund, Auftrag und Gebietswechsel
- Die Menüpunkte Rucksack, Wesen-Buch, Karte und Tagebuch kommen mit Plan 3 und 4.
- Musik und Effekte an/aus kommen mit Plan 6. Vorher gibt es keinen Ton.
- Den Leuchtturm-Aufstieg gibt es erst mit Plan 5. Die Statistik zeigt die Etage bis dahin als „–“.
- KI-Prompt und Anleitung kommen mit Plan 7. Die Lehrkraft-Seite verlinkt deshalb nur Vorlage und Beispielpaket.

Zu 17.4 („Ab hier lässt sich mit Gebiet 1 und 2 im Unterricht testen“): Gebiet 2 kommt erst mit Plan 3. Nach Plan 2 ist Gebiet 1 unterrichtstauglich. Ab Plan 2 gilt die Regel für spätere Spielfassungen aus Design 11: Spielstände der Version 1 müssen in jeder späteren Fassung ladbar bleiben.

**Arbeitszweig:** `feature/spielstand`, abgezweigt von `feature/kern`, weil PR #1 noch offen ist. Nach dem Merge von PR #1 wird der PR für Plan 2 auf `design/lumara` umgestellt.

## Global Constraints

- Die Global Constraints aus Plan 1 gelten weiter, vor allem:
  - keine Abhängigkeiten und keine Netzwerkanfragen außer zu eigenen Dateien
  - Spieltexte auf Deutsch, Bezeichner auf Englisch
  - alle Zahlen der Spielregeln in `js/config.js`
  - Tests mit `node --test`, erwartet am Ende jedes Tasks: `# fail 0`
  - Testdateien mit den Kopfzeilen `import { test } from 'node:test'; import assert from 'node:assert/strict';` (in den Blöcken unten weggelassen)
  - Commit-Nachrichten auf Deutsch, jede endet mit `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- Daten verlassen das Gerät nie von selbst. Eine Sicherungsdatei entsteht nur, wenn das Kind auf „Spielstand sichern“ tippt (Design 3, 11).
- Jeder Zugriff auf `localStorage`, `sessionStorage`, `navigator.storage`, `navigator.share` und den Service Worker steht in `try/catch` oder prüft vorher, ob es die Schnittstelle gibt. Ein Fehler darf das Spiel nie anhalten.
- Ein Spielstand, der beim Start nicht geladen werden konnte, wird nie überschrieben. Ausnahmen: Das Kind wählt ausdrücklich eine Sicherung, oder es bestätigt „Neues Spiel“ zweimal (Anti-Ziel in Design 2).
- Das Spielstand-Format Version 1 ist ab diesem Plan festgeschrieben. `tests/fixtures/spielstand-v1.txt` wird einmal erzeugt und danach nie mehr geändert. Jede spätere Formatänderung bekommt eine Umwandlung in `js/save/migrate.js` und eine eigene neue Fixture (Design 11).
- `hash32`, `mix32`, der Schlüsselstrom und die Salze der Verschleierung und des Prüfcodes werden nie geändert. Gespeicherte Stände und ausgegebene Prüfcodes hängen daran.
- Alle Pfade sind relativ (`sw.js`, `icons/…`, `version.json`), weil das Spiel unter `https://classtiles.de/lernwelt-rpg/` läuft.
- Der Service Worker wird auf `localhost` und `127.0.0.1` nur mit `?sw` registriert. Ohne `?sw` werden vorhandene Registrierungen dort entfernt, damit der Entwicklungsserver immer frische Dateien liefert.
- Die Entwickler-Abkürzungen (`?dev`, `?duell`, `?galerie`), die Probefrage (`?probe`) und `lehrkraft.html` speichern nie einen Spielstand. Nur der normale Startablauf schaltet `game.saveEnabled` ein.
- Die Statistik gehört zum Paket, alles andere gehört dem Kind (Design 10.4).

## Review Focus

1. **Das Kind schließt die App kurz nach einem Sieg.** Es wischt die Home-Bildschirm-App weg, schließt den Tab oder klappt das iPad zu. Beim nächsten Öffnen sind Sieg und XP da. → Tests in Task 3 (Speichern beim Verstecken und Schließen); Task 4 speichert nach jedem Duell.
2. **Der Spielstand ist kaputt oder der Speicher streikt.** Der Text ist abgeschnitten oder verändert, der Speicher ist voll oder der private Modus ist aktiv. Das Spiel stürzt nicht ab und bietet die Sicherung an. Der kaputte Stand wird beim Laden nicht überschrieben. → Tests in Task 1 und Task 3.
3. **Die Sicherungsdatei wurde unterwegs verändert oder falsch gewählt.** Typische Fälle:
   - per E-Mail mit Zeilenumbrüchen, mit Windows-Zeilenenden oder mit BOM
   - ein Lernpaket statt einer Sicherung
   - eine Sicherung aus einer neueren Fassung
   - eine Sicherung, die älter ist als der Stand auf dem Gerät

   Das Spiel gibt jeweils eine klare Meldung oder Warnung. → Tests in Task 6.
4. **„Neues Spiel“ oder „Spielstand laden“ und dann das Neuladen der Seite.** Beim Verlassen der Seite darf das automatische Speichern den alten Stand nicht wiederherstellen. → Tests in Task 5 und Task 6 (`reloadGame`).
5. **Die Lehrkraft tippt die Werte vom Screenshot ab.** Typische Abweichungen:
   - Kleinbuchstaben oder kein Bindestrich im Prüfcode
   - Name anders geschrieben
   - „87 %“ statt „87“
   - Spielzeit als „1:35“ oder als „95“ Minuten
   - Zeichen, die im Prüfcode nie vorkommen

   Das Ergebnis ist richtig oder es kommt ein hilfreicher Hinweis. Nie heißt es wegen der Schreibweise fälschlich „passt nicht“. → Tests in Task 9 und Task 10.

---

## Dateistruktur (neu und geändert)

```
index.html                    + Manifest, Apple-Symbol
lehrkraft.html                neu: Statistik prüfen, Lernpaket prüfen, Probefrage
manifest.webmanifest          neu
sw.js                         neu: Service Worker (VERSION, FILES)
version.json                  neu: { "version": "0.2.0" }
icons/icon-180.png, icon-192.png, icon-512.png   neu, erzeugt von tools/make-icons.mjs
css/spiel.css                 + Menü-Blatt, Menüknopf, Toast, Statistikseite, Installieren
css/lehrkraft.css             neu
js/version.js                 neu: APP_VERSION
js/config.js                  + save, play, text.speeds, world
js/main.js                    Speicher, Autosave, Spielzeit, Updates, Probefrage, M9
js/state.js                   + Statistik pro Paket, Einstellungen, textSpeedCps
js/core/hash.js               + mix32
js/save/codec.js              neu: Verschleierung
js/save/migrate.js            neu: Version prüfen, umwandeln, reparieren
js/save/store.js              neu: Hauptstand und Sicherung im localStorage
js/save/autosave.js           neu
js/save/playClock.js          neu
js/save/backup.js             neu: Sicherungsdatei
js/app/flow.js                neu: Weg nach dem Titel, Speichern, Neustart (rein)
js/app/platform.js            neu: iPad/iPhone, Home-Bildschirm, dauerhafter Speicher
js/app/update.js              neu: Versionsvergleich, Service Worker anmelden
js/pack/packId.js             ALPHABET exportieren
js/pack/parser.js             Frage bekommt trainer
js/pack/readFile.js           neu: Paketdatei lesen (aus pack.js herausgelöst)
js/duel/duel.js               Antworten tragen trainer
js/world/fogEdge.js           neu
js/world/maps/bucht.js        Nebelschild mit role
js/teacher/checkCode.js, stats.js, verify.js, overview.js, page.js   neu
js/ui/sheet.js, toast.js, share.js, format.js   neu
js/ui/dialog.js               Textgeschwindigkeit
js/menu/menu.js, settings.js, backupPages.js, packPage.js, homePage.js, teacherPage.js   neu
js/scenes/start.js, recover.js, install.js   neu
js/scenes/title.js, pack.js, worldEvents.js, duel.js   geändert
tools/png.js, tools/icon.js, tools/make-icons.mjs   neu (nicht Teil des Spiels)
tests/…                       neue Tests je Task, tests/fixtures/spielstand-v1.{js,txt}
```

## Gemeinsame Schnittstellen

```js
// Spielstand, Format Version 1 (ab diesem Plan festgeschrieben)
GameState = {
  version: 1,
  savedAt: number,                 // ms seit 1970, setzt createSaveStore().save()
  name: string,
  creature: { species, nickname: string | null, level, xpInLevel, energy, lifeStones },
  position: { map: 'bucht', x, y, dir },
  settings: { textSpeed: 'slow' | 'normal' | 'fast' },
  packs: { [shortId: string]: PackProgress },
}
PackProgress = {
  beaten: number[],                // mit diesem Paket besiegte Trainer
  boss: boolean,                   // Endgegner mit diesem Paket besiegt (ab Plan 5)
  history: { [questionKey]: { n, s, w } },
  stats: { wins, right, total, playMs, topics: { [trainerNumber]: { right, total } }, floor },
}
LoadResult = { status: 'none' } | { status: 'ok', state } | { status: 'backup', state }
           | { status: 'damaged' } | { status: 'newer' }

// Menü-Blatt
Page = { title: string, render(body: HTMLElement, nav: Nav): void }
Nav  = { push(page: Page), back(), close(), refresh() }

// game wächst um (main.js):
game.store: SaveStore          // Task 3
game.packStore: PackStore      // Task 4: createPackStore() aus Plan 1, jetzt am game
game.saveEnabled: boolean      // nur im normalen Startablauf true
game.save(): boolean | null    // null = nichts zu speichern (Task 4)
game.clock: PlayClock          // Task 3
game.version: string           // APP_VERSION (Task 5)
game.updateReady: boolean      // Task 11
game.probe: boolean            // Task 10
```

---

### Task 1: Spielstand verschleiern

**Files:**
- Create: `js/save/codec.js`
- Modify: `js/core/hash.js`
- Test: `tests/codec.test.js`, `tests/hash.test.js`

**Interfaces:**
- Consumes: `hash32` (Plan 1), `createRng` (Plan 1)
- Produces:
  - `mix32(h: number) → number` (Murmur-Endmischung, vorzeichenlos)
  - `toBase64(bytes: Uint8Array) → string`
  - `fromBase64(text) → Uint8Array` (wirft bei ungültigem Text)
  - `encodeSave(value) → string`
  - `decodeSave(text) → { ok: true, value } | { ok: false }`

- [ ] **Step 1: Tests schreiben**

```js
// tests/hash.test.js (ergänzen)
test('mix32 ist fest', () => {
  assert.equal(mix32(0), 0);
  assert.equal(mix32(1), 0x514e28b7);
});

// tests/codec.test.js
test('Kodierung ist fest (nie ändern, sonst lassen sich alte Spielstände nicht mehr laden)', () => {
  assert.equal(encodeSave({ a: 1, b: 'ä' }), 'MY+9ZqEEfi3kQzeJW2YgaQ==.51f319ef');
});
test('hin und zurück, auch mit Umlauten, Emoji und großen Daten', () => {
  for (const v of [{ name: 'Jürgen 🐉' }, { big: 'x'.repeat(1_400_000) }, [1, 2, 3]]) {
    assert.deepEqual(decodeSave(encodeSave(v)), { ok: true, value: v });
  }
});
test('der Name steht nicht im Klartext darin', () => {
  const s = encodeSave({ name: 'Mia' });
  assert.ok(!s.includes('Mia'));
  assert.ok(!atob(s.split('.')[0]).includes('Mia'));
});
test('beschädigt oder verändert ergibt ok: false und nie eine Ausnahme', () => {
  const s = encodeSave({ level: 5 });
  const flipped = (s[0] === 'A' ? 'B' : 'A') + s.slice(1);
  for (const bad of [s.slice(0, -3), s.slice(0, 10), flipped, s.replace(/\.[0-9a-f]+$/, '.00000000'), '', 'Hallo', '%%%.1234abcd', null, undefined, 42]) {
    assert.deepEqual(decodeSave(bad), { ok: false });
  }
});
test('Leerraum und Zeilenumbrüche im Text stören nicht', () => {
  const s = encodeSave({ level: 5 });
  assert.deepEqual(decodeSave(`  ${s.replace(/(.{4})/g, '$1\r\n ')}\n`), { ok: true, value: { level: 5 } });
});
```

- [ ] **Step 2: `node --test tests/codec.test.js tests/hash.test.js`.** Erwartet: FAIL, weil `mix32` und das Modul fehlen.
- [ ] **Step 3: Implementieren**
  - `mix32`: `h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16; return h >>> 0`.
  - `encodeSave` läuft so:
    1. `json = JSON.stringify(value)`, dann als UTF-8 in Bytes umwandeln.
    2. Jedes Byte mit dem Schlüsselstrom verknüpfen (XOR). Den Strom liefert `createRng(0x4c554d41)`, Byte i ist `Math.floor(next() * 256)`.
    3. Das Ergebnis in Base64 umwandeln, in Blöcken zu 32 KB über `String.fromCharCode` und `btoa`.
    4. Prüfsumme: `mix32(hash32('Lumara·Spielstand·2026' + json))` als 8 Hex-Ziffern in Kleinbuchstaben.
    5. Ausgabe: `<base64>.<prüfsumme>`.
  - `decodeSave` läuft so:
    1. Ist der Eingang kein String, ist das Ergebnis `{ ok: false }`.
    2. Allen Leerraum entfernen und am letzten `.` trennen.
    3. Base64 zurückwandeln und das XOR wieder aufheben.
    4. Mit `new TextDecoder('utf-8', { fatal: true })` dekodieren.
    5. `JSON.parse` ausführen und die Prüfsumme vergleichen.
    6. Jeder Fehler auf diesem Weg ergibt `{ ok: false }`.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Commit**: `git commit -m "Spielstand verschleiern: XOR-Strom, Base64 und Prüfsumme"`

---

### Task 2: Spielstand-Format Version 1 und Statistik pro Paket

**Files:**
- Create: `js/save/migrate.js`, `tests/fixtures/spielstand-v1.js`, `tests/fixtures/spielstand-v1.txt` (erzeugt)
- Modify: `js/state.js`, `js/pack/parser.js`, `js/duel/duel.js`, `tests/helpers/fixtures.js`, `tests/state.test.js`
- Test: `tests/migrate.test.js`, `tests/state.test.js`, `tests/parser.test.js`, `tests/duel.test.js`

**Interfaces:**
- Consumes: `decodeSave` (Task 1), `xpToNext`, `maxEnergy` (Plan 1), `BUCHT`, `createMap` (Plan 1), `validateName` (Plan 1)
- Produces:
  - `newGameState(...)` liefert zusätzlich `savedAt: 0, settings: { textSpeed: 'normal' }`.
  - `emptyPackProgress() → PackProgress`
  - `packProgress(state, shortId) → PackProgress` legt fehlende Teile an.
  - `applyDuelResult(...)` zählt zusätzlich `stats`.
  - Frage (Parser): neues Feld `trainer: number | null` (`null` bei Zetteln).
  - Duell-Zusammenfassung: `answers: [{ key, correct, trainer }]`.
  - `CURRENT_VERSION = 1`
  - `migrateState(raw) → { ok: true, state: GameState } | { ok: false, reason: 'newer' | 'invalid' }`

- [ ] **Step 1: Tests schreiben**

```js
// tests/fixtures/spielstand-v1.js – NIE ÄNDERN. Inhalt von spielstand-v1.txt.
export const SPIELSTAND_V1 = {
  version: 1, savedAt: Date.UTC(2026, 10, 3, 8, 10), name: 'Mia',
  creature: { species: 'nixi', nickname: 'Blubb', level: 12, xpInLevel: 30, energy: 3, lifeStones: 0 },
  position: { map: 'bucht', x: 22, y: 8, dir: 'up' },
  settings: { textSpeed: 'fast' },
  packs: { ENQ9: {
    beaten: [1], boss: false,
    history: { 'he ___ (play) football.': { n: 3, s: 2, w: false } },
    stats: { wins: 23, right: 87, total: 100, playMs: 5700000, topics: { 1: { right: 80, total: 90 }, 2: { right: 7, total: 10 } }, floor: 0 },
  } },
};

// tests/state.test.js (ergänzen; bestehende Vergleiche des ganzen Fortschritts anpassen)
const EMPTY = { beaten: [], boss: false, history: {}, stats: { wins: 0, right: 0, total: 0, playMs: 0, topics: {}, floor: 0 } };
test('neuer Spielstand hat Version, Einstellungen und leeren Fortschritt', () => {
  const s = newGameState({ name: 'Mia', species: 'nixi', nickname: null });
  assert.equal(s.version, 1); assert.equal(s.savedAt, 0);
  assert.deepEqual(s.settings, { textSpeed: 'normal' });
  assert.deepEqual(packProgress(s, 'ENQ9'), EMPTY);
});
test('Duell zählt Siege, Antworten und Trefferquote je Thema', () => {
  const s = newGameState({ name: 'Mia', species: 'nixi', nickname: null });
  const answers = [{ key: 'a', correct: true, trainer: 1 }, { key: 'b', correct: false, trainer: 2 }, { key: 'c', correct: true, trainer: 1 }];
  applyDuelResult(s, 'ENQ9', { kind: 'wild', area: 1 }, { outcome: 'won', playerEnergy: 3, flawless: false, answers });
  applyDuelResult(s, 'ENQ9', { kind: 'wild', area: 1 }, { outcome: 'lost', playerEnergy: 0, flawless: false, answers: [{ key: 'a', correct: false, trainer: 1 }] });
  const st = packProgress(s, 'ENQ9').stats;
  assert.equal(st.wins, 1); assert.equal(st.right, 2); assert.equal(st.total, 4);
  assert.deepEqual(st.topics, { 1: { right: 2, total: 3 }, 2: { right: 0, total: 1 } });
});
test('Paket wechseln und zurück: Fortschritt hängt an der Kurzform, das Wesen bleibt', () => {
  const s = newGameState({ name: 'Mia', species: 'nixi', nickname: null });
  const won = { outcome: 'won', playerEnergy: 3, flawless: true, answers: [{ key: 'a', correct: true, trainer: 1 }] };
  applyDuelResult(s, 'ENQ9', { kind: 'trainer', area: 1, trainer: { number: 1 } }, won);
  const level = s.creature.level;
  applyDuelResult(s, 'GNEP', { kind: 'wild', area: 1 }, won);
  assert.deepEqual(packProgress(s, 'GNEP').beaten, []); assert.equal(packProgress(s, 'GNEP').stats.wins, 1);
  assert.deepEqual(packProgress(s, 'ENQ9').beaten, [1]); assert.equal(packProgress(s, 'ENQ9').stats.wins, 1);
  assert.ok(s.creature.level >= level);
});

// tests/parser.test.js (ergänzen)
test('jede Frage kennt ihren Trainer, Zettel haben keinen', () => {
  const r = parsePack(makePackText({ trainers: 2 }) + '=== ZETTEL ===\n' + fillerQuestions(2, 'Z'));
  assert.equal(r.pack.trainers[1].questions[0].trainer, 2);
  assert.equal(r.pack.notes[0].trainer, null);
});

// tests/duel.test.js (ergänzen): Zusammenfassung mit Deck aus q({ trainer: 3 })
//   → summary().answers[0].trainer === 3 nach einer Antwort.

// tests/migrate.test.js
import { readFileSync } from 'node:fs';
test('Spielstand der Fassung 1 bleibt für immer ladbar', () => {
  const text = readFileSync(new URL('./fixtures/spielstand-v1.txt', import.meta.url), 'utf8');
  const d = decodeSave(text);
  assert.equal(d.ok, true);
  assert.deepEqual(migrateState(d.value), { ok: true, state: SPIELSTAND_V1 });
});
test('fehlende Teile werden ergänzt, unmögliche Werte begrenzt', () => {
  const m = migrateState({ version: 1, name: 'Mia', creature: { species: 'nixi', level: 7, xpInLevel: 9999, energy: 99 }, packs: { ENQ9: { beaten: [1, 1, 'x', 12] }, kaputt: 5 } });
  assert.equal(m.ok, true);
  const c = m.state.creature;
  assert.equal(c.xpInLevel, xpToNext(7) - 1); assert.equal(c.energy, maxEnergy(c)); assert.equal(c.lifeStones, 0); assert.equal(c.nickname, null);
  assert.deepEqual(m.state.settings, { textSpeed: 'normal' });
  assert.deepEqual(m.state.position, { map: 'bucht', ...BUCHT.spawn });
  assert.deepEqual(m.state.packs, { ENQ9: { ...emptyPackProgress(), beaten: [1] } });
  assert.equal(m.state.savedAt, 0);
});
test('Position in einer Wand oder außerhalb der Karte wird zum Startpunkt', () => {
  const m = migrateState({ ...structuredClone(SPIELSTAND_V1), position: { map: 'bucht', x: 0, y: 0, dir: 'up' } });
  assert.deepEqual(m.state.position, { map: 'bucht', ...BUCHT.spawn });
});
test('aus einer neueren Fassung oder unbrauchbar', () => {
  assert.deepEqual(migrateState({ ...SPIELSTAND_V1, version: 2 }), { ok: false, reason: 'newer' });
  const bad = [null, 'x', {}, { version: 1 }, { ...SPIELSTAND_V1, name: '' }, { ...SPIELSTAND_V1, creature: { ...SPIELSTAND_V1.creature, species: 'drache' } }, { ...SPIELSTAND_V1, creature: { ...SPIELSTAND_V1.creature, level: 'zehn' } }];
  for (const b of bad) assert.deepEqual(migrateState(b), { ok: false, reason: 'invalid' });
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL in den neuen Tests, weil Felder, `migrate.js` und die Fixture fehlen.
- [ ] **Step 3: `state.js`, Parser und Duell anpassen**
  - `newGameState` bekommt `savedAt: 0` und `settings: { textSpeed: 'normal' }`.
  - `emptyPackProgress()` liefert die Form von `EMPTY`.
  - `packProgress` ergänzt fehlende Teile eines vorhandenen Eintrags.
  - `applyDuelResult` zählt jede Antwort in `stats.total`, `stats.right` und `stats.topics[trainer]`. Antworten mit `trainer === null` zählen nur in der Summe. Bei `won` steigt `stats.wins` um eins.
  - Parser: Beim Abschließen einer Frage wird `trainer` gesetzt, nämlich die Nummer des Abschnitts `TRAINER n`, sonst `null`.
  - `duel.js`: `answers.push({ key, correct, trainer: question.trainer ?? null })`.
  - Fixture `q()`: Standardwert `trainer: 1`.
- [ ] **Step 4: `migrateState` in `js/save/migrate.js`**
  - Ist `version` keine ganze Zahl oder fehlt sie, ist der Stand `invalid`.
  - Ist `version > CURRENT_VERSION`, ist der Stand `newer`.
  - Ist `version < CURRENT_VERSION`, wird Schritt für Schritt `MIGRATIONS[v]` angewendet. Die Tabelle ist noch leer, und eine fehlende Umwandlung bedeutet `invalid`.
  - Danach wird der Stand wie folgt repariert. Was nicht genannt ist, fällt weg.
    - `name` muss `validateName` bestehen, sonst `invalid`.
    - `species` muss in `STARTERS` stehen, sonst `invalid`.
    - `level` ist eine ganze Zahl von 1 bis `CONFIG.creature.maxLevel`, sonst `invalid`.
    - `xpInLevel` wird auf 0 bis `xpToNext(level) − 1` begrenzt (Standard 0).
    - `lifeStones` wird auf 0 bis `maxLifeStones` begrenzt.
    - `energy` wird auf 0 bis `maxEnergy` begrenzt (Standard: voll).
    - `nickname` ist ein String mit höchstens 12 Zeichen, sonst `null`.
    - Für `position` muss `map === 'bucht'` gelten und `createMap(BUCHT).canEnter(x, y)` zutreffen, sonst gilt `BUCHT.spawn`. `dir` ist eine der vier Richtungen.
    - `settings.textSpeed` muss in `['slow', 'normal', 'fast']` stehen, sonst `'normal'`.
    - Für `packs` gelten nur Schlüssel nach `/^[2-9A-HJKMNP-Z]{4}$/`. Jeder Eintrag wird repariert:
      - `beaten`: eindeutige ganze Zahlen von 1 bis 8, aufsteigend sortiert
      - `boss`: ein Boolean
      - `history`: nur Einträge mit Zahlen `n`, `s` und Boolean `w`
      - `stats`: endliche Zahlen ≥ 0, sonst 0
      - `topics`: nur Schlüssel 1 bis 8
    - `savedAt` ist eine endliche Zahl ≥ 0, sonst 0.
- [ ] **Step 5: Fixture einmal erzeugen**

```bash
node --input-type=module -e "import { encodeSave } from './js/save/codec.js'; import { SPIELSTAND_V1 } from './tests/fixtures/spielstand-v1.js'; import { writeFileSync } from 'node:fs'; writeFileSync('tests/fixtures/spielstand-v1.txt', encodeSave(SPIELSTAND_V1) + '\n');"
```

- [ ] **Step 6: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 7: Commit**: `git commit -m "Spielstand-Format 1 mit Umwandlung, Statistik pro Paket und fester Testdatei"`

---

### Task 3: Speicher, automatisches Speichern, Spielzeit

**Files:**
- Create: `js/save/store.js`, `js/save/autosave.js`, `js/save/playClock.js`
- Modify: `js/config.js`, `tests/helpers/fixtures.js` (`fakeStorage()`: der Map-Speicher aus `tests/store.test.js`, dort dann von hier importiert)
- Test: `tests/saveStore.test.js`, `tests/autosave.test.js`, `tests/playClock.test.js`

**Interfaces:**
- Consumes: `encodeSave`, `decodeSave` (Task 1), `migrateState` (Task 2)
- Produces:
  - `SAVE_KEYS = { main: 'lumara.spielstand.v1', backup: 'lumara.spielstand.v1.vorher' }`
  - `createSaveStore(storage = defaultStorage(), { now = Date.now } = {}) → { load(): LoadResult, save(state): boolean, clear(): void }`
  - `createAutosave({ save: () => boolean | null, intervalMs = CONFIG.save.autosaveMs, onFail = () => {} }) → { tick(dtMs), saveNow(): boolean | null, attach(doc, win): () => void }`
  - `createPlayClock({ idleMs = CONFIG.play.idleMs, maxStepMs = 1000 } = {}) → { activity(nowMs), step(nowMs, visible: boolean): number }`
  - `CONFIG.save = { autosaveMs: 30000 }`, `CONFIG.play = { idleMs: 120000 }`

- [ ] **Step 1: Tests schreiben**

```js
// tests/saveStore.test.js – fakeStorage() aus tests/helpers/fixtures.js (Map mit getItem/setItem/removeItem)
const mia = level => { const s = newGameState({ name: 'Mia', species: 'nixi', nickname: null }); s.creature.level = level; return s; };
test('ohne Stand: none; speichern setzt savedAt, laden liefert denselben Stand', () => {
  const st = createSaveStore(fakeStorage(), { now: () => 1000 });
  assert.deepEqual(st.load(), { status: 'none' });
  const s = mia(3);
  assert.equal(st.save(s), true); assert.equal(s.savedAt, 1000);
  assert.deepEqual(st.load(), { status: 'ok', state: s });
});
test('der vorige Stand bleibt als Sicherung erhalten', () => {
  const mem = fakeStorage(); const st = createSaveStore(mem);
  st.save(mia(1)); st.save(mia(2));
  assert.equal(migrateState(decodeSave(mem.getItem(SAVE_KEYS.backup)).value).state.creature.level, 1);
});
test('kaputter Hauptstand: Sicherung wird angeboten, beim Laden wird nichts geschrieben', () => {
  const mem = fakeStorage(); const st = createSaveStore(mem);
  st.save(mia(1)); st.save(mia(2)); mem.setItem(SAVE_KEYS.main, 'kaputt');
  const writes = []; const orig = mem.setItem; mem.setItem = (k, v) => { writes.push(k); orig(k, v); };
  const r = st.load();
  assert.equal(r.status, 'backup'); assert.equal(r.state.creature.level, 1); assert.deepEqual(writes, []);
});
test('kaputter Hauptstand verdrängt beim Speichern nicht die gute Sicherung', () => {
  const mem = fakeStorage(); const st = createSaveStore(mem);
  st.save(mia(1)); st.save(mia(2)); mem.setItem(SAVE_KEYS.main, 'kaputt'); st.save(mia(3));
  assert.equal(migrateState(decodeSave(mem.getItem(SAVE_KEYS.backup)).value).state.creature.level, 1);
});
test('beides kaputt: damaged; neuere Fassung: newer, auch wenn die Sicherung gut ist', () => {
  const mem = fakeStorage(); const st = createSaveStore(mem);
  mem.setItem(SAVE_KEYS.main, 'x'); mem.setItem(SAVE_KEYS.backup, 'y');
  assert.deepEqual(st.load(), { status: 'damaged' });
  st.clear(); st.save(mia(1)); mem.setItem(SAVE_KEYS.main, encodeSave({ ...mia(1), version: 99 }));
  assert.deepEqual(st.load(), { status: 'newer' });
});
test('voller Speicher oder privater Modus: false, keine Ausnahme', () => {
  const bad = { getItem() { throw new Error('SecurityError'); }, setItem() { throw new Error('QuotaExceededError'); }, removeItem() { throw new Error('x'); } };
  const st = createSaveStore(bad);
  assert.deepEqual(st.load(), { status: 'none' }); assert.equal(st.save(mia(1)), false); st.clear();
  assert.equal(createSaveStore(undefined).save(mia(1)), false);
});

// tests/autosave.test.js
test('speichert alle 30 Sekunden', () => {
  let n = 0; const a = createAutosave({ save: () => (n++, true), intervalMs: 30000 });
  a.tick(29999); assert.equal(n, 0); a.tick(1); assert.equal(n, 1); a.tick(30000); assert.equal(n, 2);
});
test('saveNow setzt die Uhr zurück', () => {
  let n = 0; const a = createAutosave({ save: () => (n++, true), intervalMs: 30000 });
  a.tick(20000); a.saveNow(); a.tick(20000); assert.equal(n, 1); a.tick(10000); assert.equal(n, 2);
});
test('speichert beim Verstecken und beim Schließen der Seite', () => {
  let n = 0; const a = createAutosave({ save: () => (n++, true) });
  const doc = new EventTarget(); doc.hidden = false; const win = new EventTarget();
  const off = a.attach(doc, win);
  doc.dispatchEvent(new Event('visibilitychange')); assert.equal(n, 0);
  doc.hidden = true; doc.dispatchEvent(new Event('visibilitychange')); assert.equal(n, 1);
  win.dispatchEvent(new Event('pagehide')); assert.equal(n, 2);
  off(); win.dispatchEvent(new Event('pagehide')); assert.equal(n, 2);
});
test('meldet einen Fehlschlag nur einmal; nichts zu speichern ist kein Fehlschlag', () => {
  let fails = 0; let result = null;
  const a = createAutosave({ save: () => result, onFail: () => fails++ });
  a.saveNow(); assert.equal(fails, 0);
  result = false; a.saveNow(); a.saveNow(); assert.equal(fails, 1);
});

// tests/playClock.test.js
test('zählt nur, solange in den letzten 2 Minuten etwas eingegeben wurde', () => {
  const c = createPlayClock({ idleMs: 120000, maxStepMs: 1000 });
  assert.equal(c.step(0, true), 0);
  c.activity(0);
  let sum = 0; for (let t = 1000; t <= 200000; t += 1000) sum += c.step(t, true);
  assert.equal(sum, 120000);
});
test('zählt nicht, solange das Spiel unsichtbar ist', () => {
  const c = createPlayClock(); c.activity(0); c.step(0, true);
  assert.equal(c.step(1000, false), 0); assert.equal(c.step(2000, true), 1000);
});
test('eine lange Pause zählt höchstens einen Schritt', () => {
  const c = createPlayClock({ maxStepMs: 1000 }); c.activity(0); c.step(0, true);
  c.activity(600000); assert.ok(c.step(600000, true) <= 1000);
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL, weil die Module fehlen.
- [ ] **Step 3: Implementieren**
  - `load()` liest den Hauptstand, dann `decodeSave` und `migrateState`:
    - Ist er gut, ist das Ergebnis `ok`.
    - Ist er `newer`, ist das Ergebnis `newer`.
    - Fehlt er oder ist er kaputt, wird die Sicherung genauso geprüft. Ist sie gut, ist das Ergebnis `backup`, sonst `damaged`.
    - Fehlen beide Schlüssel, ist das Ergebnis `none`.
  - `save(state)` läuft so:
    1. `state.savedAt = now()` setzen.
    2. Den bisherigen Hauptstand in die Sicherung kopieren, aber nur, wenn er sich dekodieren lässt.
    3. Den neuen Hauptstand schreiben.
  - Jeder Speicherzugriff steht in `try/catch`.
  - Autosave:
    - `tick` sammelt die Zeit.
    - Ab `intervalMs` ruft es `saveNow()` auf.
    - `saveNow` setzt die Zeit auf 0 zurück.
    - `onFail` kommt nur beim ersten `false`.
  - Spielzeit, `step`:

```js
const from = prev ?? now; prev = now;
if (!visible || lastActivity === null) return 0;
const start = Math.max(from, now - maxStepMs), end = Math.min(now, lastActivity + idleMs);
return Math.max(0, end - start);
```

- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Commit**: `git commit -m "Spielstand speichern mit Sicherung, automatisch und mit Spielzeit"`

---

### Task 4: Weiterspielen nach dem Neustart

**Files:**
- Create: `js/app/flow.js`, `js/scenes/start.js`, `js/scenes/recover.js`, `js/ui/toast.js`, `js/ui/format.js`
- Modify: `js/main.js`, `js/scenes/title.js`, `js/scenes/worldEvents.js`, `css/spiel.css`
- Test: `tests/flow.test.js`, `tests/format.test.js`

**Interfaces:**
- Consumes: `createSaveStore`, `createAutosave`, `createPlayClock` (Task 3), `packProgress` (Task 2)
- Produces:
  - `routeAfterTitle({ status, storedPackOk, installFirst = false }) → 'world' | 'pack-world' | 'recover' | 'newer' | 'install' | 'new-game'` (in `flow.js`, rein)
  - `makeSaver(game, { onFirstSave = () => {} } = {}) → () => boolean | null` (in `flow.js`): gibt `null` zurück, wenn `!game.saveEnabled || !game.state`, sonst `game.store.save(game.state)`
  - `startFlow(game, loaded: LoadResult)` (in `start.js`)
  - `createRecoverScene(game, { loaded, onUseBackup, onNewGame }) → Scene`
  - `createTitleScene(game, next, { hint = 'Tippe, um zu beginnen' } = {})`
  - `showToast(text, ms = 6000)` hängt an `document.body` an.
  - Formate: `formatDateTime(ms) → '03.11.2026, 09:10'`, `formatDate(ms) → '03.11.2026'`, `isoDate(ms) → '2026-11-03'`, `formatPlayTime(ms) → 'h:mm'`, alle in Ortszeit.

- [ ] **Step 1: Tests schreiben**

```js
// tests/flow.test.js
test('Weg nach dem Titel', () => {
  assert.equal(routeAfterTitle({ status: 'ok', storedPackOk: true }), 'world');
  assert.equal(routeAfterTitle({ status: 'ok', storedPackOk: false }), 'pack-world');
  assert.equal(routeAfterTitle({ status: 'backup', storedPackOk: true }), 'recover');
  assert.equal(routeAfterTitle({ status: 'damaged', storedPackOk: true }), 'recover');
  assert.equal(routeAfterTitle({ status: 'newer', storedPackOk: true }), 'newer');
  assert.equal(routeAfterTitle({ status: 'none', storedPackOk: false }), 'new-game');
});
test('makeSaver speichert nur im normalen Spiel', () => {
  const game = { saveEnabled: false, state: newGameState({ name: 'Mia', species: 'nixi', nickname: null }), store: createSaveStore(fakeStorage()) };
  const save = makeSaver(game);
  assert.equal(save(), null); game.saveEnabled = true; assert.equal(save(), true);
  game.state = null; assert.equal(save(), null);
});

// tests/format.test.js
test('Datum, Uhrzeit und Spielzeit', () => {
  const t = new Date(2026, 10, 3, 9, 5).getTime();
  assert.equal(formatDateTime(t), '03.11.2026, 09:05'); assert.equal(formatDate(t), '03.11.2026'); assert.equal(isoDate(t), '2026-11-03');
  assert.equal(formatPlayTime(0), '0:00'); assert.equal(formatPlayTime(95 * 60000 + 59000), '1:35'); assert.equal(formatPlayTime(600 * 60000), '10:00');
});
```

- [ ] **Step 2: `node --test tests/flow.test.js tests/format.test.js`.** Erwartet: FAIL.
- [ ] **Step 3: Implementieren.** `node --test` ergibt danach `# fail 0`.
  - `main.js`:
    - erzeugt `game.store`, `game.packStore = createPackStore()`, `game.clock`, `game.saveEnabled = false` und `game.save = makeSaver(game)`
    - setzt den Autosave mit `onFail`, der einen Toast zeigt (Text unten), und `autosave.attach(document, window)`
    - ruft in `update(dt)` erst `autosave.tick(dt)` auf, dann die Spielzeit:

      ```js
      const add = game.clock.step(performance.now(), !document.hidden);
      if (add && game.saveEnabled && game.state && game.pack) packProgress(game.state, game.pack.data.shortId).stats.playMs += add;
      ```

    - meldet `keydown` und `pointerdown` (Capture) an `window` als `game.clock.activity(performance.now())`
    - ruft `startFlow(game, game.store.load())` auf
    - **M9:** setzt `window.lumara = game` nur, wenn `isLocal`
  - Toast-Text bei Speicherfehler: „Dein Spielstand kann auf diesem Gerät gerade nicht gespeichert werden. Sichere ihn über Menü → Einstellungen → Spielstand sichern.“
  - `startFlow` zeigt den Titel. Der Hinweis lautet „Tippe, um weiterzuspielen“, wenn `status === 'ok'`. Danach folgt `routeAfterTitle`:
    - `world`: `game.state = loaded.state`, gespeichertes Paket setzen, `saveEnabled = true`, `game.go(createGameWorld(game))`
    - `pack-world`: wie `world`, aber zuerst `createPackScene`
    - `new-game`: Paket → Intro → Name → Eier wie in Plan 1, dann `game.state = newGameState(...)`, `saveEnabled = true`, `game.save()` und Welt
    - `recover`: `createRecoverScene`
      - „Sicherung laden“ setzt `game.state = loaded.state` und `saveEnabled = true`. Dann folgt `game.save()`, und es geht weiter wie `world` (mit oder ohne Paket).
      - „Neues Spiel beginnen“ hat zwei `choose`-Fragen mit „Nein“ vorausgewählt. Danach `game.store.clear()` und weiter wie `new-game`.
    - `newer`: Hinweis und der Knopf „Neu laden“, der `location.reload()` aufruft
  - Texte im Wiederherstellen-Bildschirm (`screen-card` im Panel):
    - `backup`:
      - Überschrift „Dein Spielstand ist beschädigt.“
      - Text „Auf diesem Gerät gibt es noch eine Sicherung: {Name}, Level {n}, gespeichert am {formatDateTime}.“
      - Knöpfe „Sicherung laden“ (primär) und „Neues Spiel beginnen“ (Link)
    - `damaged`:
      - „Dein Spielstand ist beschädigt und lässt sich nicht laden.“
      - „Wenn du eine Sicherungsdatei hast, kannst du sie laden.“
      - Knopf „Neues Spiel beginnen“
    - `newer`: „Dieser Spielstand stammt aus einer neueren Fassung von Lumara. Lade die Seite neu, dann geht es weiter.“
    - Die zwei Fragen zu „Neues Spiel“:
      1. „Neues Spiel beginnen? Dein bisheriges Spiel ist dann weg.“ mit [„Nein“, „Ja“]
      2. „Wirklich? Das lässt sich nicht rückgängig machen.“ mit [„Nein“, „Ja, neu beginnen“]
  - `worldEvents.js`: In `backToWorld` folgt nach jedem Duell `game.save()`.
  - Entwickler-Abkürzungen lassen `saveEnabled = false`.
- [ ] **Step 4: Im Browser prüfen**
  - Spiel beginnen, ein Duell gewinnen, Seite neu laden.
    - Erwartet wird zuerst der Titel mit „Tippe, um weiterzuspielen“.
    - Danach steht die Figur in der Bucht am letzten Feld, mit demselben Level.
  - In der Konsole `localStorage.setItem('lumara.spielstand.v1', 'x')` eingeben und neu laden.
    - Erwartet wird der Bildschirm mit der Sicherung.
    - „Sicherung laden“ führt in die Welt.
  - Beide Schlüssel zerstören.
    - Erwartet wird „beschädigt“.
    - „Neues Spiel beginnen“ verlangt zwei Bestätigungen.
  - `window.lumara` gibt es auf `127.0.0.1`, unter dem LAN-Namen des Rechners nicht.
- [ ] **Step 5: Commit**: `git commit -m "Weiterspielen nach dem Neustart, Wiederherstellen und Speichern nach jedem Duell"`

---

### Task 5: Menü, Wesen und Einstellungen

**Files:**
- Create: `js/version.js`, `js/ui/sheet.js`, `js/menu/menu.js`, `js/menu/settings.js`
- Modify: `js/app/flow.js`, `js/scenes/worldEvents.js`, `js/ui/dialog.js`, `js/state.js`, `js/config.js`, `css/spiel.css`
- Test: `tests/state.test.js`, `tests/flow.test.js`

**Interfaces:**
- Consumes: `game.save`, `game.store` (Task 4), `xpToNext`, `maxEnergy`, `stageForLevel` (Plan 1), `SPECIES`, `speciesName`, `displayName` (Plan 1)
- Produces:
  - `APP_VERSION = '0.2.0'` in `js/version.js`; `game.version = APP_VERSION`
  - `CONFIG.text.speeds = { slow: 25, normal: 40, fast: 80 }` ersetzt `text.charsPerSecond`
  - `textSpeedCps(settings) → number` (state.js); `dialog.js` nutzt `textSpeedCps(game.state?.settings)`
  - `openSheet(game, page: Page) → Promise<void>`, `confirmPage({ title, text, yes, no = 'Nein', onYes }) → Page` (sheet.js)
  - `openMenu(game) → Promise<void>`, `creaturePage(game) → Page` (menu.js)
  - `settingsPage(game) → Page` (settings.js). Spätere Tasks hängen ihre Einträge hier ein.
  - `reloadGame(game, { state = null, packText = null } = {}, { reload = () => location.reload() } = {})` (flow.js). In diesem Task gibt es nur den Fall ohne `state`: `saveEnabled = false`, `game.state = null`, `game.store.clear()` und dann `reload()`.

- [ ] **Step 1: Tests schreiben**

```js
// tests/state.test.js
test('Textgeschwindigkeit', () => {
  assert.equal(textSpeedCps(undefined), 40); assert.equal(textSpeedCps({ textSpeed: 'fast' }), 80);
  assert.equal(textSpeedCps({ textSpeed: 'slow' }), 25); assert.equal(textSpeedCps({ textSpeed: 'quatsch' }), 40);
});
// tests/flow.test.js
test('Neues Spiel: Stand gelöscht, und das Speichern beim Schließen bringt ihn nicht zurück', () => {
  const game = { saveEnabled: true, state: newGameState({ name: 'Mia', species: 'nixi', nickname: null }), store: createSaveStore(fakeStorage()) };
  game.save = makeSaver(game); game.save();
  let reloaded = false;
  reloadGame(game, {}, { reload: () => { reloaded = true; } });
  assert.equal(game.save(), null); assert.deepEqual(game.store.load(), { status: 'none' }); assert.ok(reloaded);
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Blatt und Menü bauen**
  - `openSheet` ist ein fester Bereich über dem ganzen Fenster: `div.sheet` mit halbtransparentem Nachthimmel und darin `div.box.sheet-card` (höchstens 760 px breit, scrollbar).
    - Der Kopf enthält den Titel und den Knopf „Zurück“.
    - Während das Blatt offen ist, gilt `game.mode = 'screen'`. Danach wird der alte Wert zurückgesetzt.
    - Bedienung:
      - B, Esc und „Zurück“ gehen eine Seite zurück. Auf der ersten Seite schließen sie das Blatt.
      - M schließt das Blatt.
      - Pfeil hoch und runter bewegen den Fokus zwischen den Knöpfen.
    - Auf Geräten ohne Touch bekommt der erste Knopf den Fokus.
    - Jede neu gezeigte Seite bekommt einen frischen `createFreshGuard` (Doppeltipp-Schutz aus Plan 1).
  - Menüknopf: `button.menu-btn` „☰“ mit `aria-label="Menü"` oben rechts in `game.ui`, mindestens 48 px groß und nur bei `body[data-mode="walk"]` sichtbar.
    - Tippen auf den Knopf oder die Taste M öffnet `world.lock(() => openMenu(game))`, aber nur, wenn `game.mode === 'walk'` und die Welt nicht gesperrt ist.
  - Menü: „Wesen“, „Einstellungen“, „Zurück zum Spiel“.
  - Wesen-Seite:
    - `displayName` und darunter klein `speciesName(species, stage)`
    - „Level {n} · Stufe {s}“
    - ein XP-Balken mit „{xpInLevel} / {xpToNext(level)} XP bis Level {n+1}“
    - „Energie {e} / {max}“
    - die Besonderheit: `SPECIES[species].special.name` und `.text`
  - Einstellungen in diesem Task:
    - „Textgeschwindigkeit“ mit den drei Knöpfen „Langsam“, „Normal“ und „Schnell“ (`aria-pressed`). Die Wahl setzt `game.state.settings.textSpeed` und ruft `game.save()` auf.
    - „Neues Spiel“ mit zwei Bestätigungen per `confirmPage`, beide mit Fokus auf „Nein“:
      1. Titel „Neues Spiel“, Text „Möchtest du wirklich ein neues Spiel beginnen? Dein Wesen und alles, was du erreicht hast, gehen verloren.“, Knopf „Ja, weiter“
      2. Text „Bist du ganz sicher? Das lässt sich nicht rückgängig machen. Tipp: Sichere vorher deinen Spielstand.“, Knopf „Ja, neu beginnen“. Danach `reloadGame(game)`.
    - Am Ende steht klein „Spielfassung {game.version}“.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Im Browser prüfen**
  - Menü mit M und mit dem Knopf öffnen.
  - Mit der Tastatur zur Wesen-Seite und zurück navigieren. Esc schließt.
  - „Langsam“ verlangsamt das nächste Gespräch.
  - Nach dem Neuladen ist die Wahl noch gesetzt.
  - „Neues Spiel“ zweimal bestätigen.
    - Danach beginnt das Spiel beim Titel.
    - Nach Tippen kommt das Paket bzw. das Intro, nicht die alte Welt.
  - Hochformat (Fenster schmal): Das Blatt passt, nichts verschwindet hinter dem Steuerkreuz.
- [ ] **Step 6: Commit**: `git commit -m "Menü mit Wesen und Einstellungen, Textgeschwindigkeit, Neues Spiel"`

---

### Task 6: Spielstand als Datei sichern und laden

**Files:**
- Create: `js/save/backup.js`, `js/ui/share.js`, `js/menu/backupPages.js`
- Modify: `js/app/flow.js`, `js/menu/settings.js`, `js/scenes/pack.js`, `js/scenes/recover.js`, `css/spiel.css`
- Test: `tests/backup.test.js`, `tests/flow.test.js`

**Interfaces:**
- Consumes: `encodeSave`, `decodeSave` (Task 1), `migrateState` (Task 2), `formatDateTime`, `isoDate` (Task 4), `openSheet`, `confirmPage`, `reloadGame` (Task 5)
- Produces:
  - `createBackupText(state, packText) → string`
  - `parseBackupText(text) → { ok: true, state, packText } | { ok: false, reason: 'pack' | 'unknown' | 'damaged' | 'newer' }`
  - `BACKUP_MESSAGES: { [reason]: string }`
  - `backupFileName(name, ms) → string`
  - `compareWithDevice(deviceState | null, backupState) → { older: boolean, device: { level, savedAt } | null, backup: { level, savedAt } }`
  - `shareOrDownload(fileName, text) → Promise<'shared' | 'downloaded' | 'cancelled'>` (Browser)
  - `saveBackupPage(game) → Page`, `loadBackupPage(game) → Page`
  - `reloadGame` mit `state`: Der Ablauf ist `saveEnabled = false`, `game.state = null`, dann `packStore.save(packText)` (wenn `packText` gegeben ist), dann `store.save(state)` und `reload()`.

- [ ] **Step 1: Tests schreiben**

```js
// tests/backup.test.js
const PACK = makePackText();
const state = { ...newGameState({ name: 'Mia', species: 'nixi', nickname: null }), savedAt: new Date(2026, 10, 3, 9, 10).getTime() };
test('Sicherung enthält Spielstand und Paket und lässt sich zurückholen', () => {
  const text = createBackupText(state, PACK);
  assert.ok(text.startsWith('LUMARA-SICHERUNG 1\n'));
  assert.ok(text.includes('# Spielstand von Mia · Level 1 · gesichert am 03.11.2026, 09:10'));
  assert.ok(!text.includes('Testpaket'));
  assert.deepEqual(parseBackupText(text), { ok: true, state: migrateState(state).state, packText: PACK });
});
test('übersteht Windows-Zeilenenden, BOM und Umbrüche aus E-Mails', () => {
  const lines = createBackupText(state, PACK).split('\n');
  const wrapped = [...lines.slice(0, 3), lines[3].replace(/(.{76})/g, '$1\n')].join('\r\n');
  assert.equal(parseBackupText('﻿' + wrapped + '\r\n').ok, true);
});
test('erkennt falsche Dateien', () => {
  const head = 'LUMARA-SICHERUNG 1\n';
  assert.deepEqual(parseBackupText(PACK), { ok: false, reason: 'pack' });
  assert.deepEqual(parseBackupText('Hallo'), { ok: false, reason: 'unknown' });
  assert.deepEqual(parseBackupText('LUMARA-SICHERUNG 2\nabc'), { ok: false, reason: 'newer' });
  assert.deepEqual(parseBackupText(head + 'kaputt'), { ok: false, reason: 'damaged' });
  assert.deepEqual(parseBackupText(head + encodeSave({ state: { ...state, version: 9 }, pack: PACK })), { ok: false, reason: 'newer' });
  assert.deepEqual(parseBackupText(head + encodeSave({ state: { version: 1 }, pack: PACK })), { ok: false, reason: 'damaged' });
});
test('Dateiname', () => {
  const t = new Date(2026, 10, 3).getTime();
  assert.equal(backupFileName('Mia', t), 'Lumara-Mia-2026-11-03.txt');
  assert.equal(backupFileName('Lea Marie', t), 'Lumara-Lea-Marie-2026-11-03.txt');
  assert.equal(backupFileName('Jo/Ann: <3', t), 'Lumara-JoAnn-3-2026-11-03.txt');
  assert.equal(backupFileName('Jürgen', t), 'Lumara-Jürgen-2026-11-03.txt');
  assert.equal(backupFileName('  ', t), 'Lumara-Spielstand-2026-11-03.txt');
});
test('warnt, wenn die Sicherung älter ist als der Stand auf dem Gerät', () => {
  const device = { ...state, savedAt: 2000, creature: { ...state.creature, level: 8 } };
  assert.deepEqual(compareWithDevice(device, { ...state, savedAt: 1000 }), { older: true, device: { level: 8, savedAt: 2000 }, backup: { level: 1, savedAt: 1000 } });
  assert.equal(compareWithDevice(null, state).older, false);
  assert.equal(compareWithDevice({ ...state, savedAt: 1000 }, { ...state, savedAt: 2000 }).older, false);
});

// tests/flow.test.js
test('Sicherung laden: Stand und Paket gespeichert, das Speichern beim Schließen überschreibt nichts', () => {
  const mem = fakeStorage();
  const game = { saveEnabled: true, state: newGameState({ name: 'Alt', species: 'funki', nickname: null }), store: createSaveStore(mem), packStore: createPackStore(mem) };
  game.save = makeSaver(game);
  const restored = newGameState({ name: 'Mia', species: 'nixi', nickname: null });
  reloadGame(game, { state: restored, packText: 'PAKET: X' }, { reload: () => {} });
  assert.equal(game.save(), null);
  assert.equal(game.store.load().state.name, 'Mia'); assert.equal(game.packStore.load(), 'PAKET: X');
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: `backup.js` implementieren**
  - Dateiaufbau (genau so):

    ```
    LUMARA-SICHERUNG 1
    # Spielstand von {name} · Level {level} · gesichert am {formatDateTime(savedAt)}
    # Zum Wiederherstellen: Lumara öffnen → Menü → Einstellungen → Spielstand laden.
    {encodeSave({ state, pack: packText })}
    ```

    Zeilenende ist `\n`. Der Paketname steht nicht im Klartext darin.
  - Lesen läuft so:
    1. BOM und `\r` entfernen.
    2. Die erste nicht leere Zeile prüfen:
       - `LUMARA-SICHERUNG 1`: gültige Sicherung
       - `LUMARA-SICHERUNG n` mit n > 1: `newer`
       - sonst `pack`, wenn `/^\s*(PAKET|KENNUNG|FACH)\s*:/im` oder `/===\s*TRAINER/i` passt, sonst `unknown`
    3. Den Inhalt aus allen weiteren Zeilen zusammensetzen, die nicht mit `#` beginnen, und an `decodeSave` geben. Ist er kaputt, folgt `damaged`.
    4. `migrateState(value.state)` anwenden: `newer` bleibt `newer`, `invalid` wird `damaged`. Ist `value.pack` kein String, ist das Ergebnis ebenfalls `damaged`.
  - Dateiname: NFC und trimmen. Die Zeichen `\ / : * ? " < > |` und Steuerzeichen entfernen, Leerraum durch `-` ersetzen, `-` am Rand entfernen. Leer ergibt `Spielstand`.
  - `BACKUP_MESSAGES` (genau so):
    - `pack`: „Das ist ein Lernpaket, kein Spielstand. Ein Lernpaket lädst du unter „Lernpaket wechseln“.“
    - `unknown`: „Diese Datei ist keine Lumara-Sicherung.“
    - `damaged`: „Diese Sicherung ist beschädigt und lässt sich nicht laden.“
    - `newer`: „Diese Sicherung stammt aus einer neueren Fassung von Lumara. Lade die Seite neu und versuche es dann noch einmal.“
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Seiten und Teilen bauen**
  - `shareOrDownload`: Teilen nur bei `matchMedia('(pointer: coarse)')` und `navigator.canShare?.({ files: [file] })`. **(Claude)** Am PC gibt es immer einen Download, weil das Teilen-Menü am Mac keine Datei ablegen kann.
    - Bricht das Kind ab (`AbortError`), ist das Ergebnis `cancelled`.
    - Jeder andere Fehler beim Teilen führt zum Download.
    - Der Download läuft über `URL.createObjectURL` und `a[download]`. Nach einer Sekunde folgt `revokeObjectURL`.
  - Seite „Spielstand sichern“:
    - Text: „Sichere deinen Spielstand als Datei. Damit kannst du auf einem anderen Gerät weiterspielen oder nach dem Löschen der Browserdaten alles zurückholen. Die Datei enthält auch dein Lernpaket.“
    - Auf Apple-Geräten zusätzlich: „Tipp: Wähle „In Dateien sichern“.“ (die Erkennung folgt in Task 8, bis dahin immer zeigen)
    - Der Knopf „Spielstand sichern“ ruft `game.save()` auf. Text und Dateiname entstehen synchron, dann folgt `shareOrDownload`.
    - Bei Erfolg: „✓ Gesichert: {Dateiname}“.
  - Seite „Spielstand laden“:
    - Knopf „Sicherungsdatei auswählen“ (`label.btn` um `input type=file accept=".txt,text/plain"`).
    - Ist die Datei größer als 4 MB, erscheint `unknown`. Sonst wird sie mit `await file.text()` gelesen und an `parseBackupText` gegeben. Ein Fehler erscheint als ✗ mit der Meldung.
    - Gerätestand ist `game.state ?? (game.store.load().state ?? null)`.
    - Ist die Sicherung älter, folgt `confirmPage`:
      - Titel „Ältere Sicherung“
      - Text „Diese Sicherung ist älter als dein Spielstand auf diesem Gerät.\nSicherung: Level {b}, gesichert am {Datum}\nAuf diesem Gerät: Level {d}, gespeichert am {Datum}\nWenn du sie lädst, gilt der ältere Stand.“
      - Knopf „Trotzdem laden“
    - Sonst: „Spielstand von {Name} laden? Level {n}, gesichert am {Datum}.“ mit dem Knopf „Laden“.
    - Danach `reloadGame(game, { state, packText })`.
  - Einstiege:
    - Einstellungen bekommen „Spielstand sichern“ (nur wenn `game.state` vorhanden ist) und „Spielstand laden“.
    - Im Paket-Bildschirm eines neuen Spiels steht klein der Link „Ich habe eine Sicherungsdatei“. Dafür bekommt `createPackScene` die Option `{ offerRestore: true }`.
    - Im Wiederherstellen-Bildschirm steht der Knopf „Spielstand-Datei laden“. Beide öffnen `openSheet(game, loadBackupPage(game))`.
- [ ] **Step 6: Im Browser prüfen**
  - In Chrome sichern: Eine Datei `Lumara-<Name>-<Datum>.txt` wird heruntergeladen.
  - Neues Spiel beginnen, dann über „Ich habe eine Sicherungsdatei“ diese Datei laden: Erwartet wird der alte Stand mit Paket.
  - Eine ältere Sicherung über einen neueren Stand laden: Erwartet wird die Warnung mit beiden Daten.
  - `pakete/vorlage.txt` als Sicherung wählen: Erwartet wird die Lernpaket-Meldung.
- [ ] **Step 7: Commit**: `git commit -m "Spielstand samt Lernpaket als Datei sichern und wieder laden"`

---

### Task 7: Lernpaket wechseln und Nebelrand mit Schild

**Files:**
- Create: `js/pack/readFile.js`, `js/world/fogEdge.js`, `js/menu/packPage.js`
- Modify: `js/scenes/pack.js`, `js/menu/settings.js`, `js/world/maps/bucht.js`, `js/scenes/worldEvents.js`, `js/config.js`
- Test: `tests/readFile.test.js`, `tests/fogEdge.test.js`

**Interfaces:**
- Consumes: `decodePackBytes`, `parsePack`, `createPackStore` (Plan 1), `packProgress` (Task 2), `openSheet` (Task 5)
- Produces:
  - `readPackFile(file: { size, arrayBuffer() }) → Promise<{ ok: true, text, data } | { ok: false, details: string[] }>`. Die Paket-Szene benutzt ab jetzt diese Funktion.
  - `fogEdgeLines(sign, { gateBeaten, packHasNext, builtAreas }) → string[] | null`
  - `CONFIG.world = { builtAreas: 1 }`
  - Nebelschild in `BUCHT`: `{ type: 'sign', role: 'fogEdge', x: 17, y: 3, gate: 1, leadsTo: 2, leadsToName: 'der Flüsterwald', lines: [wie bisher] }`
  - `packSwitchPage(game) → Page`

- [ ] **Step 1: Tests schreiben**

```js
// tests/readFile.test.js
test('liest und prüft eine Paketdatei', async () => {
  const good = await readPackFile(new File([makePackText()], 'p.txt'));
  assert.equal(good.ok, true); assert.equal(good.data.title, 'Testpaket'); assert.equal(good.text, makePackText());
  const bad = await readPackFile(new File(['FRAGE: x'], 'p.txt'));
  assert.equal(bad.ok, false); assert.ok(bad.details.length > 0);
});
test('eine zu große Datei wird gar nicht erst gelesen', async () => {
  const big = { size: CONFIG.pack.maxBytes + 1, arrayBuffer() { throw new Error('darf nicht gelesen werden'); } };
  assert.deepEqual(await readPackFile(big), { ok: false, details: ['Die Datei ist größer als 1 MB.'] });
});

// tests/fogEdge.test.js
const sign = { role: 'fogEdge', gate: 1, leadsTo: 2, leadsToName: 'der Flüsterwald', lines: ['Der Nebel ist hier zu dicht.'] };
test('vor dem Sieg: die eigenen Zeilen des Schilds', () => {
  assert.deepEqual(fogEdgeLines(sign, { gateBeaten: false, packHasNext: true, builtAreas: 1 }), sign.lines);
});
test('Paket ohne nächstes Thema: Hinweis auf die Lehrkraft (Design 10.4)', () => {
  assert.deepEqual(fogEdgeLines(sign, { gateBeaten: true, packHasNext: false, builtAreas: 1 }), ['Dieser Weg öffnet sich, sobald deine Lehrkraft das nächste Thema freigibt.']);
});
test('Gebiet in dieser Fassung noch nicht gebaut', () => {
  assert.deepEqual(fogEdgeLines(sign, { gateBeaten: true, packHasNext: true, builtAreas: 1 }), ['Hinter dem Nebel liegt der Flüsterwald.', 'Der Weg dorthin entsteht gerade. In einer der nächsten Spielfassungen kannst du hindurch.']);
});
test('Weg offen', () => assert.equal(fogEdgeLines(sign, { gateBeaten: true, packHasNext: true, builtAreas: 2 }), null));
test('die Bucht hat genau ein Nebelschild, und es führt zum Flüsterwald', () => {
  const s = BUCHT.objects.filter(o => o.role === 'fogEdge');
  assert.equal(s.length, 1); assert.equal(s[0].gate, 1); assert.equal(s[0].leadsTo, 2);
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Implementieren.** `node --test` ergibt danach `# fail 0`.
  - `readPackFile` ist die Logik aus `pack.js`: zuerst die Größe prüfen, dann `decodePackBytes(await file.arrayBuffer())` und `parsePack`. Die Fehlerliste besteht aus den `errors.map(e => e.message)`. Lässt sich die Datei nicht lesen, lautet sie `['Die Datei konnte nicht gelesen werden.']`.
  - Nebelschild in `worldEvents.js` per `world.onInteract.unshift(…)`, damit es vor dem Standard-Schild-Handler läuft:
    - `gateBeaten = packProgress(...).beaten.includes(sign.gate)`
    - `packHasNext = pack.trainers.some(t => t.number === sign.leadsTo)`
    - Die Zeilen sind `fogEdgeLines(...) ?? sign.lines`.
  - Seite „Lernpaket wechseln“:
    - Zuerst der Text aus Design 10.1: „Dein Wesen und alles, was du gesammelt hast, bleiben. Die Trainer fordern dich mit den neuen Fragen neu heraus.“
    - Darunter „Jetzt: {Titel} ({Fach}) · Kennung {shortId}“.
    - Knöpfe „Lernpaket-Datei auswählen“ und als Link „Beispielpaket Englisch 6“.
    - Bei Erfolg:
      - `game.pack = { text, data }`, `game.packStore.save(text)`, `game.save()`
      - Meldung „✓ Neues Lernpaket: {Titel}“
      - Hat das Paket dieselbe `shortId` wie vorher, lautet die Meldung stattdessen „✓ Das ist dasselbe Lernpaket in einer neuen Fassung. Dein Fortschritt bleibt.“
      - Dazu der Knopf „Zurück zum Spiel“ (schließt das Blatt).
    - Bei Fehler: die Kinder-Meldung aus Plan 1 mit aufklappbaren Details.
- [ ] **Step 4: Im Browser prüfen**
  - Hüterin besiegen und das Schild am Nebel lesen: Erwartet wird „Hinter dem Nebel liegt der Flüsterwald …“.
  - Ein Paket nur mit Trainer 1 laden: Erwartet wird der Satz über die Lehrkraft.
  - Ein anderes Paket laden: Die Hüterin fordert erneut heraus, Level und Wesen bleiben gleich.
  - Das Beispielpaket wieder laden: Die Hüterin gilt wieder als besiegt.
- [ ] **Step 5: Commit**: `git commit -m "Lernpaket wechseln im Spiel und Nebelrand mit Schild"`

---

### Task 8: Erst installieren, Home-Bildschirm, Manifest und Symbol

**Files:**
- Create: `js/app/platform.js`, `js/scenes/install.js`, `js/menu/homePage.js`, `tools/png.js`, `tools/icon.js`, `tools/make-icons.mjs`, `icons/icon-180.png`, `icons/icon-192.png`, `icons/icon-512.png`, `manifest.webmanifest`
- Modify: `index.html`, `js/app/flow.js`, `js/scenes/start.js`, `js/menu/settings.js`, `js/menu/backupPages.js`, `js/main.js`, `css/spiel.css`
- Test: `tests/platform.test.js`, `tests/png.test.js`, `tests/flow.test.js`

**Interfaces:**
- Consumes: `routeAfterTitle` (Task 4), `BUILDINGS.lighthouse`, `parseSprite`, `PALETTE` (Plan 1)
- Produces:
  - `isAppleMobile({ userAgent, maxTouchPoints }) → boolean`
  - `isStandalone({ navigatorStandalone, displayModeStandalone }) → boolean`
  - `readPlatform() → { appleMobile, standalone }` (Browser)
  - `requestPersist() → Promise<void>` (ruft `navigator.storage?.persist?.()` auf und schluckt Fehler)
  - `createInstallScene(game, next) → Scene`
  - `homeScreenPage(game) → Page`
  - `encodePng(width, height, rgba: Uint8Array) → Buffer`
  - `renderIcon(size) → Uint8Array` (RGBA, deckend)
  - Weg: `installFirst = appleMobile && !standalone && status === 'none'` ergibt `'install'`.

- [ ] **Step 1: Tests schreiben**

```js
// tests/platform.test.js
const IPAD = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
test('iPad, iPhone, Mac und andere', () => {
  assert.equal(isAppleMobile({ userAgent: IPAD, maxTouchPoints: 5 }), true);
  assert.equal(isAppleMobile({ userAgent: IPAD, maxTouchPoints: 0 }), false);
  assert.equal(isAppleMobile({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1', maxTouchPoints: 5 }), true);
  assert.equal(isAppleMobile({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0 Safari/537.36', maxTouchPoints: 0 }), false);
  assert.equal(isAppleMobile({ userAgent: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36', maxTouchPoints: 5 }), false);
});
test('vom Home-Bildschirm gestartet', () => {
  assert.equal(isStandalone({ navigatorStandalone: true, displayModeStandalone: false }), true);
  assert.equal(isStandalone({ navigatorStandalone: undefined, displayModeStandalone: true }), true);
  assert.equal(isStandalone({ navigatorStandalone: false, displayModeStandalone: false }), false);
});
// tests/flow.test.js
test('erst installieren nur ohne Spielstand', () => {
  assert.equal(routeAfterTitle({ status: 'none', storedPackOk: false, installFirst: true }), 'install');
  assert.equal(routeAfterTitle({ status: 'ok', storedPackOk: true, installFirst: true }), 'world');
});
// tests/png.test.js
import { inflateSync } from 'node:zlib';
test('PNG hat Signatur, Kopf und Größe', () => {
  const png = encodePng(2, 1, new Uint8Array([255, 0, 0, 255, 0, 0, 255, 128]));
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(png.readUInt32BE(16), 2); assert.equal(png.readUInt32BE(20), 1); assert.equal(png[24], 8); assert.equal(png[25], 6);
  assert.deepEqual([...png.subarray(-12)], [0, 0, 0, 0, 73, 69, 78, 68, 0xae, 0x42, 0x60, 0x82]);
});
test('Bilddaten lassen sich wieder entpacken', () => {
  const png = encodePng(2, 1, new Uint8Array([255, 0, 0, 255, 0, 0, 255, 128]));
  const i = png.indexOf('IDAT'); const len = png.readUInt32BE(i - 4);
  assert.deepEqual([...inflateSync(png.subarray(i + 4, i + 4 + len))], [0, 255, 0, 0, 255, 0, 0, 255, 128]);
});
test('Symbol hat die gewünschte Größe und ist überall deckend', () => {
  const px = renderIcon(192);
  assert.equal(px.length, 192 * 192 * 4);
  for (let i = 3; i < px.length; i += 4) if (px[i] !== 255) assert.fail(`Pixel ${(i - 3) / 4} ist durchsichtig`);
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Implementieren.** `node --test` ergibt danach `# fail 0`.
  - `isAppleMobile` ist wahr, wenn `/iPhone|iPad|iPod/` passt oder wenn `Macintosh` mit `maxTouchPoints > 1` zusammenkommt.
  - `encodePng`:
    - Kopfblock IHDR (8 Bit, Farbtyp 6).
    - Datenblock IDAT: Filterbyte 0 je Zeile, gepackt mit `zlib.deflateSync`.
    - Endblock IEND.
    - Jeder Block bekommt eine CRC32 nach der Standardtabelle.
  - `renderIcon(size)`:
    - Hintergrund: senkrechter Verlauf von `#12111f` nach `#2f3a5c`.
    - In der Mitte der Leuchtturm aus `BUILDINGS.lighthouse` (32 × 64), ganzzahlig skaliert mit `Math.floor(size * 0.75 / 64)` und mindestens Faktor 2.
    - Um die Lampe ein weicher gelber Schein (`#ffe08a`, nach außen auslaufend).
    - Kein Text.
  - `tools/make-icons.mjs` schreibt `icons/icon-{180,192,512}.png`. Einmal ausführen (`node tools/make-icons.mjs`) und die Bilder ansehen.
  - `manifest.webmanifest`:

```json
{
  "name": "Lumara – Das Land unter dem Nebel", "short_name": "Lumara", "lang": "de",
  "start_url": "./", "scope": "./", "display": "standalone", "orientation": "any",
  "background_color": "#12111f", "theme_color": "#12111f",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

  - `index.html`: `<link rel="manifest" href="manifest.webmanifest">` und `<link rel="apple-touch-icon" href="icons/icon-180.png">`.
  - Installieren-Bildschirm (`screen-card`):
    - Überschrift „Bevor es losgeht“
    - Text „Leg Lumara auf deinen Home-Bildschirm. Dann bleibt dein Spielstand sicher gespeichert.“
    - Schritte:
      1. „Tippe auf Teilen“ mit einem kleinen Teilen-Symbol als Inline-SVG: Quadrat mit Pfeil nach oben, selbst gezeichnet
      2. „Wähle „Zum Home-Bildschirm“.“
      3. „Öffne Lumara dort über das neue Symbol.“
    - Klein darunter der Link „Trotzdem im Browser spielen“, der zum Weg `new-game` führt.
  - Seite „Zum Home-Bildschirm“ in den Einstellungen:
    - Läuft das Spiel schon vom Home-Bildschirm: „Lumara läuft schon vom Home-Bildschirm.“
    - Auf iPad und iPhone:
      - die drei Schritte von oben
      - dazu „Wichtig: Die App auf dem Home-Bildschirm hat einen eigenen Speicher. Sichere vorher deinen Spielstand und lade ihn dort mit „Spielstand laden“.“
    - Sonst: „Im Menü des Browsers findest du „App installieren“ oder „Zum Startbildschirm hinzufügen“.“
  - Den Tipp „In Dateien sichern“ (Task 6) gibt es jetzt nur noch, wenn `appleMobile` zutrifft.
  - `requestPersist()` wird einmal aufgerufen, beim ersten erfolgreichen Speichern über `makeSaver(game, { onFirstSave: requestPersist })`.
- [ ] **Step 4: Im Browser prüfen**
  - Ohne Spielstand mit iPad-Kennung starten. Dazu in der Konsole vor dem Start `Object.defineProperty(navigator, 'maxTouchPoints', { value: 5 })` setzen oder die Gerätesimulation von Chrome verwenden.
    - Erwartet wird der Installieren-Bildschirm.
    - „Trotzdem im Browser spielen“ führt zum Paket.
  - Unter Application → Manifest zeigt Chrome Namen und Symbole ohne Fehler.
- [ ] **Step 5: Commit**: `git commit -m "Erst installieren auf iPad und iPhone, Manifest und App-Symbol"`

---

### Task 9: Statistik und Prüfcode im Spiel

**Files:**
- Create: `js/teacher/checkCode.js`, `js/teacher/stats.js`, `js/menu/teacherPage.js`
- Modify: `js/pack/packId.js` (`export const ALPHABET`), `js/menu/settings.js`, `css/spiel.css`
- Test: `tests/checkCode.test.js`, `tests/stats.test.js`

**Interfaces:**
- Consumes: `hash32`, `mix32` (Task 1), `ALPHABET`, `packProgress` (Task 2), `stageForLevel`, `displayName`, `speciesName` (Plan 1), `formatPlayTime`, `formatDateTime` (Task 4)
- Produces:
  - `CheckStats = { name, packId, level, stage, wins, accuracy, minutes, trainers }`
  - `normalizeName(name) → string`: NFC, trimmen, Leerraum zusammenfassen, Kleinbuchstaben
  - `checkCode(stats: CheckStats) → string` (6 Zeichen)
  - `formatCode(code) → 'XXX-XXX'`
  - `normalizeCodeInput(raw) → string`: Großbuchstaben, nur `0-9A-Z`
  - `buildTeacherStats(state, pack) → { name, creature: { name, species, level, stage }, pack: { title, shortId }, wins, accuracy, playTime, minutes, trainersBeaten, trainerCount, boss, topics: [{ number, topic, accuracy: number | null, total }], floor, code }`, wobei `code` formatiert ist

- [ ] **Step 1: Tests schreiben**

```js
// tests/checkCode.test.js
const base = { name: 'Mia', packId: 'ENQ9', level: 12, stage: 1, wins: 23, accuracy: 87, minutes: 95, trainers: 1 };
test('Prüfcode ist fest (nie ändern, sonst passen ausgegebene Codes nicht mehr)', () => {
  assert.equal(checkCode(base), 'U3KXXT');
  assert.equal(checkCode({ name: 'Ben', packId: 'GNEP', level: 1, stage: 1, wins: 0, accuracy: 0, minutes: 0, trainers: 0 }), '2PYBBQ');
});
test('Name und Kennung: Schreibweise egal', () => {
  assert.equal(checkCode({ ...base, name: '  mIa ' }), 'U3KXXT'); assert.equal(checkCode({ ...base, packId: 'enq9' }), 'U3KXXT');
});
test('jede einzelne Zahl ändert den Code', () => {
  const codes = ['level', 'stage', 'wins', 'accuracy', 'minutes', 'trainers'].map(k => checkCode({ ...base, [k]: base[k] + 1 }));
  assert.equal(new Set([...codes, 'U3KXXT']).size, 7);
  assert.notEqual(checkCode({ ...base, name: 'Mio' }), 'U3KXXT');
});
test('nur Zeichen ohne Verwechslungsgefahr, Anzeige mit Bindestrich', () => {
  assert.match(checkCode(base), /^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/);
  assert.equal(formatCode('U3KXXT'), 'U3K-XXT'); assert.equal(normalizeCodeInput(' u3k-xxt '), 'U3KXXT');
});

// tests/stats.test.js
test('Statistik für die Lehrkraft', () => {
  const s = newGameState({ name: 'Mia', species: 'nixi', nickname: 'Blubb' }); s.creature.level = 12;
  const p = packProgress(s, 'ENQ9'); p.beaten = [1];
  Object.assign(p.stats, { wins: 23, right: 87, total: 100, playMs: 95 * 60000 + 59000, topics: { 1: { right: 80, total: 90 }, 2: { right: 7, total: 10 } } });
  const pack = { title: 'Englisch 6', shortId: 'ENQ9', trainers: [{ number: 1, topic: 'Simple present' }, { number: 2, topic: 'Present progressive' }] };
  const t = buildTeacherStats(s, pack);
  assert.equal(t.accuracy, 87); assert.equal(t.playTime, '1:35'); assert.equal(t.minutes, 95);
  assert.equal(t.trainersBeaten, 1); assert.equal(t.trainerCount, 2); assert.equal(t.boss, false);
  assert.deepEqual(t.topics, [{ number: 1, topic: 'Simple present', accuracy: 89, total: 90 }, { number: 2, topic: 'Present progressive', accuracy: 70, total: 10 }]);
  assert.deepEqual(t.creature, { name: 'Blubb', species: speciesName('nixi', 1), level: 12, stage: 1 });
  assert.equal(t.code, 'U3K-XXT');
});
test('ohne Antworten: 0 %, Themen ohne Antworten mit null', () => {
  const s = newGameState({ name: 'Ben', species: 'funki', nickname: null });
  const t = buildTeacherStats(s, { title: 'X', shortId: 'GNEP', trainers: [{ number: 1, topic: 'A' }] });
  assert.equal(t.accuracy, 0); assert.equal(t.playTime, '0:00'); assert.equal(t.topics[0].accuracy, null); assert.equal(t.code, '2PY-BBQ');
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Implementieren**
  - `checkCode`:

```js
const payload = [normalizeName(s.name), s.packId.toUpperCase(), s.level, s.stage, s.wins, s.accuracy, s.minutes, s.trainers].join('|');
let h = mix32(hash32(`Lumara·Prüfcode·2026|${payload}`)) % 887503681; // 31^6
// 6 Stellen zur Basis 31 aus ALPHABET, höchste Stelle zuerst
```

  - `buildTeacherStats`:
    - `accuracy = total ? Math.round(right / total * 100) : 0`
    - `minutes = Math.floor(playMs / 60000)`
    - `trainersBeaten` ist die Zahl der besiegten Trainer, die es im Paket gibt.
    - Für den Code gilt `trainers = trainersBeaten + (boss ? 1 : 0)` und `stage = stageForLevel(level)`.
    - Je Trainer des Pakets gibt es eine Zeile für das Thema.
  - Seite „Für die Lehrkraft“ (in den Einstellungen):
    - groß und mit kräftigem Kontrast, alles ohne Scrollen auf einem iPad im Querformat (Screenshot)
    - Zeilen:
      - „Name“
      - „Wesen: {Name} ({Art}) · Level {n} · Stufe {s}“
      - „Lernpaket: {Titel} · Kennung {shortId}“
      - „Gewonnene Duelle“
      - „Trefferquote {n} %“
      - „Spielzeit {h:mm}“
      - „Trainer besiegt: {x} von {n} · Endgegner: ja/nein“
      - „Höchste Etage im Leuchtturm: –“ (Zahl, sobald `floor > 0` ist)
      - die Liste „Trefferquote je Thema“ mit „{Nr} {Thema}: {n} % ({total} Antworten)“ oder „–“
      - „Prüfcode“ groß in `ui-monospace`
      - „Stand: {formatDateTime(jetzt)}“
    - Darunter klein: „Prüfen auf {Adresse von lehrkraft.html}“, also `new URL('lehrkraft.html', location.href)` ohne Suchteil.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Im Browser prüfen.** Ein paar Duelle spielen und die Seite öffnen.
  - Die Werte passen zur Erfahrung.
  - Die Seite passt bei 1024 × 768 ohne Scrollen.
- [ ] **Step 6: Commit**: `git commit -m "Statistik für die Lehrkraft mit Prüfcode"`

---

### Task 10: Seite für Lehrkräfte (`lehrkraft.html`) mit Probefrage

**Files:**
- Create: `lehrkraft.html`, `css/lehrkraft.css`, `js/teacher/verify.js`, `js/teacher/overview.js`, `js/teacher/page.js`
- Modify: `js/main.js` (Probefrage), `js/scenes/duel.js` (`makeProbeSetup`)
- Test: `tests/verify.test.js`, `tests/overview.test.js`

**Interfaces:**
- Consumes: `checkCode`, `normalizeCodeInput` (Task 9), `readPackFile` (Task 7), `parsePack` (Plan 1), `createDuelScene` (Plan 1)
- Produces:
  - `parseStatsForm(raw: { name, packId, level, stage, wins, accuracy, playTime, trainers, boss: boolean }) → { ok: true, stats: CheckStats } | { ok: false, problems: string[] }`
  - `verifyCode(stats, rawCode) → { ok: true, match: boolean } | { ok: false, problem: string }`
  - `packOverview(pack) → { title, subject, shortId, hasKennung, trainers: [{ number, name, topic, questions, choice, typing, tiles }], notes: number, boss: boolean }`
  - `makeProbeSetup(game, number) → DuelSetup`: wie `makeTrainerSetup`, nimmt aber `TRAINER_CREATURES[number] ?? TRAINER_CREATURES[1]`, weil es Wesen für Trainer 2 bis 8 erst ab Plan 3 gibt.
  - Probefrage-Ablauf:
    1. Der iframe `index.html?probe` sendet `{ type: 'lumara-probe-ready' }` an `window.parent`.
    2. Die Seite antwortet mit `{ type: 'lumara-probe', packText, trainer }`.
    3. Beide prüfen `event.origin === location.origin`, der iframe zusätzlich `event.source === window.parent`.

- [ ] **Step 1: Tests schreiben**

```js
// tests/verify.test.js
const raw = { name: ' mia ', packId: 'enq9', level: '12', stage: '1', wins: '23', accuracy: '87 %', playTime: '1:35', trainers: '1', boss: false };
test('echter Prüfcode passt, auch klein, ohne Bindestrich oder mit Leerzeichen', () => {
  const r = parseStatsForm(raw); assert.equal(r.ok, true);
  for (const c of ['U3K-XXT', 'u3kxxt', ' U3K XXT ']) assert.deepEqual(verifyCode(r.stats, c), { ok: true, match: true });
});
test('eine geänderte Zahl passt nicht', () => {
  assert.deepEqual(verifyCode(parseStatsForm({ ...raw, wins: '24' }).stats, 'U3K-XXT'), { ok: true, match: false });
});
test('der Endgegner zählt als neunter Trainer', () => {
  assert.equal(parseStatsForm({ ...raw, trainers: '8', boss: true }).stats.trainers, 9);
});
test('Spielzeit als h:mm, h.mm oder in Minuten', () => {
  for (const [t, m] of [['1:35', 95], ['1.35', 95], ['95', 95], ['0:07', 7]]) assert.equal(parseStatsForm({ ...raw, playTime: t }).stats.minutes, m);
  assert.equal(parseStatsForm({ ...raw, playTime: '1:75' }).ok, false);
});
test('verständliche Hinweise bei falschen Eingaben', () => {
  const r = parseStatsForm({ ...raw, level: '', playTime: 'abc', packId: 'ENQ' });
  assert.equal(r.ok, false);
  assert.deepEqual(r.problems, ['Die Paketkennung hat 4 Zeichen, zum Beispiel K7PX.', 'Bitte gib das Level als Zahl ein.', 'Spielzeit bitte wie im Spiel angeben, zum Beispiel 1:05.']);
  const stats = parseStatsForm(raw).stats;
  assert.deepEqual(verifyCode(stats, 'U3K-XX'), { ok: false, problem: 'Der Prüfcode hat 6 Zeichen, zum Beispiel K7P-3QX.' });
  assert.deepEqual(verifyCode(stats, 'U3K-XX0'), { ok: false, problem: 'Im Prüfcode kommen 0, O, 1, I und L nie vor. Schau noch einmal genau hin.' });
});

// tests/overview.test.js
test('Übersicht pro Trainer', () => {
  const r = parsePack(makePackText({ trainers: 2, questions: 8 }) + '=== ZETTEL ===\n' + fillerQuestions(3, 'Z'));
  const o = packOverview(r.pack);
  assert.equal(o.shortId, r.pack.shortId); assert.equal(o.hasKennung, true); assert.equal(o.notes, 3); assert.equal(o.boss, false);
  assert.deepEqual(o.trainers[0], { number: 1, name: 'Trainer 1', topic: 'Thema 1', questions: 8, choice: 8, typing: 8, tiles: 0 });
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: `verify.js` und `overview.js` implementieren.** `node --test` ergibt danach `# fail 0`.
  - Die Felder werden in dieser Reihenfolge geprüft, mit je einem Hinweis (genau so):
    - Name leer: „Bitte gib den Namen ein.“
    - Paketkennung nicht 4 Zeichen aus `ALPHABET`: „Die Paketkennung hat 4 Zeichen, zum Beispiel K7PX.“
    - Level keine ganze Zahl von 1 bis 100: „Bitte gib das Level als Zahl ein.“
    - Stufe nicht 1 bis 4: „Die Stufe ist eine Zahl von 1 bis 4.“
    - Siege keine ganze Zahl ≥ 0: „Bitte gib die gewonnenen Duelle als Zahl ein.“
    - Trefferquote nicht 0 bis 100: „Die Trefferquote ist eine Zahl von 0 bis 100.“ Vorher werden „%“ und Leerzeichen entfernt.
    - Spielzeit weder `h:mm`, `h.mm` (Minuten < 60) noch ganze Minuten: „Spielzeit bitte wie im Spiel angeben, zum Beispiel 1:05.“
    - Trainer nicht 0 bis 8: „Die Zahl der besiegten Trainer ist 0 bis 8.“
  - `verifyCode` prüft zuerst auf `[01OIL]`, dann auf die Länge 6.
- [ ] **Step 4: Probefrage im Spiel**
  - `main.js`: `?probe` wirkt auf jedem Host und wird vor den Entwickler-Abkürzungen geprüft.
    - Ist `window.parent === window`, erscheint nur der Text „Diese Ansicht gehört zur Seite für Lehrkräfte.“
    - Sonst gilt `game.probe = true`, und `saveEnabled` bleibt `false`. Der Service Worker wird nicht angemeldet.
    - Dann wird die Bereitschaft gemeldet, und das Spiel wartet auf das Paket.
    - Mit dem Paket: `game.pack` setzen, `game.state = newGameState({ name: 'Probe', species: 'kiesel', nickname: null })`.
    - Danach laufen Duelle mit `makeProbeSetup(game, trainer)` in Schleife wie bei `?duell`.
- [ ] **Step 5: `lehrkraft.html` bauen**
  - Normale, scrollbare Seite mit Systemschrift, Hintergrund `#f3ecd2` und Rahmen `#a8743a`, ohne `spiel.css`. Fußzeile mit dem Urheberrecht wie in `index.html`.
  - Kopf: „Lumara · Für Lehrkräfte“.
  - **Statistik prüfen:**
    - Felder in derselben Reihenfolge wie auf der Statistikseite: Name, Paketkennung, Level, Stufe, Gewonnene Duelle, Trefferquote (%), Spielzeit (h:mm), Trainer besiegt, Endgegner besiegt (Kästchen), Prüfcode.
    - Knopf „Prüfen“.
    - Ergebnis mit Symbol und Farbe: „✓ Die Angaben sind echt.“ oder „✗ Die Angaben passen nicht zum Prüfcode.“ (Design 12.3). Bei Eingabefehlern stattdessen die Hinweisliste.
    - Klein darunter: „Der Prüfcode ist eine einfache Hürde und nicht fälschungssicher.“
  - **Lernpaket prüfen:**
    - Datei auswählen, dann `readPackFile` und, wenn das Lesen klappt, die Fehler und Hinweise aus `parsePack`.
    - Fehler als rote ✗-Liste, Hinweise als ⚠-Liste, jeweils mit „Zeile n:“.
    - Darunter Titel, Fach und „Kennung {shortId}“. Fehlt `KENNUNG`, steht dort die Warnung aus Design 10.2 in Kurzform.
    - Tabelle je Trainer: Nr., Name, Thema, Fragen, Auswahl, Eintippen, Kärtchen.
    - Anzahl der Zettel und ob es einen Endgegner gibt.
    - Je Trainer ein Knopf „Probefrage“: Er setzt `iframe.src = 'index.html?probe&t=' + Date.now()` und antwortet auf die Bereitschaftsnachricht mit Paket und Trainer.
    - Der iframe hat `aspect-ratio: 3 / 2`, `width: 100%` und höchstens 720 px Breite.
  - **Material:** Links zu `pakete/vorlage.txt` und `pakete/englisch-6-beispiel.txt`.
- [ ] **Step 6: Im Browser prüfen**
  - Werte von der Statistikseite (Task 9) abtippen.
    - Erwartet wird ✓.
    - Eine Zahl ändern, dann wird ✗ erwartet.
    - „0“ im Code führt zum Hinweis.
  - Das Beispielpaket wählen: Erwartet wird die Tabelle mit zwei Trainern.
    - „Probefrage“ bei Trainer 2 zeigt im Rahmen ein Duell mit Fragen aus Thema 2.
    - Antworten und weitere Fragen funktionieren.
  - `Object.keys(localStorage)` ist vor und nach der Probefrage gleich.
- [ ] **Step 7: Commit**: `git commit -m "Seite für Lehrkräfte: Statistik prüfen, Lernpaket prüfen, Probefrage"`

---

### Task 11: Service Worker, Offline und Updates

**Files:**
- Create: `sw.js`, `version.json`, `js/app/update.js`
- Modify: `js/main.js`, `js/menu/settings.js`
- Test: `tests/update.test.js`, `tests/sw.test.js`

**Interfaces:**
- Consumes: `APP_VERSION` (Task 5), `showToast` (Task 4)
- Produces:
  - `isNewer(a, b) → boolean` für Versionen der Form `x.y.z`. Ungültig ist nie neuer.
  - `bootUpdates({ version, onReady, canReload }) → Promise<void>` (Browser)
  - `sw.js` mit `const VERSION = '0.2.0';` und `const FILES = [ … ];` (JSON-Strings in doppelten Anführungszeichen)
  - `version.json`: `{ "version": "0.2.0" }`
  - `game.updateReady`

- [ ] **Step 1: Tests schreiben**

```js
// tests/update.test.js
test('Versionen vergleichen', () => {
  assert.ok(isNewer('0.2.1', '0.2.0')); assert.ok(isNewer('0.10.0', '0.9.9')); assert.ok(isNewer('1.0.0', '0.99.99'));
  assert.ok(!isNewer('0.2.0', '0.2.0')); assert.ok(!isNewer('0.1.9', '0.2.0')); assert.ok(!isNewer('kaputt', '0.2.0')); assert.ok(!isNewer(undefined, '0.2.0'));
});
// tests/sw.test.js
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const read = p => readFileSync(new URL(p, root), 'utf8');
const walk = dir => readdirSync(new URL(dir + '/', root)).filter(f => !f.startsWith('.')).flatMap(f => statSync(new URL(`${dir}/${f}`, root)).isDirectory() ? walk(`${dir}/${f}`) : [`${dir}/${f}`]);
test('die Version steht überall gleich', () => {
  assert.equal(read('sw.js').match(/const VERSION = '([^']+)'/)[1], APP_VERSION);
  assert.equal(JSON.parse(read('version.json')).version, APP_VERSION);
});
test('der Service Worker speichert genau die Dateien des Spiels', () => {
  const files = JSON.parse(read('sw.js').match(/const FILES = (\[[\s\S]*?\]);/)[1]);
  const expected = [...walk('js'), ...walk('css'), ...walk('icons'), 'index.html', 'lehrkraft.html', 'manifest.webmanifest', 'version.json', 'pakete/vorlage.txt', 'pakete/englisch-6-beispiel.txt'];
  assert.deepEqual([...files].sort(), expected.sort());
  for (const f of files) assert.ok(existsSync(new URL(f, root)), f);
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: `sw.js` schreiben** (klassischer Worker, kein Modul)
  - `install`: `caches.open('lumara-' + VERSION)` und `addAll(FILES.map(f => new Request(f, { cache: 'reload' })))`.
  - `activate`: alte Zwischenspeicher `lumara-*` löschen, dann `clients.claim()`.
  - `message`: `'skip-waiting'` führt zu `self.skipWaiting()`.
  - `fetch` (nur GET, nur eigene Herkunft):
    - `version.json` immer zuerst übers Netz (`cache: 'no-store'`), ohne Netz aus dem Zwischenspeicher.
    - Seitenaufrufe (`mode === 'navigate'`) bekommen die zwischengespeicherte `lehrkraft.html`, wenn der Pfad darauf endet, sonst `index.html` (Suchteil egal). Fehlt sie, geht die Anfrage ans Netz.
    - Alles andere kommt zuerst aus dem Zwischenspeicher, dann aus dem Netz, ohne neu zu speichern.
- [ ] **Step 4: `update.js` und Einbindung**
  - `bootUpdates`:
    1. Gibt es `navigator.serviceWorker` nicht, ist nichts zu tun.
    2. **Nächster Start:** Hat `getRegistration()` einen wartenden Worker, gibt es einen `controller`, gilt `canReload()` und ist das Flag `lumara.sw-reload` in `sessionStorage` nicht gesetzt, dann:
       - Flag setzen
       - einmalig auf `controllerchange` mit `location.reload()` reagieren
       - `waiting.postMessage('skip-waiting')` senden
       - fertig
    3. Sonst:
       - Flag entfernen
       - `register('sw.js', { updateViaCache: 'none' })`
       - Bei `updatefound` wird der neue Worker beobachtet. Ist er `installed` und gibt es einen `controller`, folgt `onReady()`.
       - `fetch('version.json', { cache: 'no-store' })`: Ist die Version neuer (`isNewer(remote, version)`), folgt `reg.update()`.
    4. Alle Fehler werden geschluckt.
  - `main.js`:
    - Auf localhost ohne `?sw` werden alle Registrierungen entfernt (`getRegistrations` → `unregister`), sonst folgt `bootUpdates`.
    - `canReload = () => game.scene` ist noch die Titelszene.
    - `onReady`:
      - `game.updateReady = true`
      - Toast „Neue Version da – beim nächsten Start aktiv“, wenn `game.mode !== 'duel'`
      - sonst den Toast beim nächsten Wechsel nach `walk` zeigen
  - Einstellungen: „Spielfassung {version}“. Bei `updateReady` dahinter „· Neue Version da – beim nächsten Start aktiv“.
  - Regel für Veröffentlichungen, steht als Kommentar oben in `sw.js` und `js/version.js`: Bei jeder Veröffentlichung wird die Version in `version.json`, `js/version.js` und `sw.js` gleich erhöht. Der Test prüft das.
- [ ] **Step 5: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 6: Im Browser prüfen (Chrome, `http://127.0.0.1:<port>/?sw`)**
  - Application → Service Workers: aktiviert. Cache Storage enthält `lumara-0.2.0` mit allen Dateien aus `FILES`.
  - Server anhalten und neu laden: Spiel und `lehrkraft.html` laden trotzdem.
  - Server wieder starten. Vorübergehend die Version in allen drei Dateien auf `0.2.1` setzen und neu laden.
    - Erwartet wird der Toast.
    - Nach einem weiteren Neuladen zeigen die Einstellungen „Spielfassung 0.2.1“.
  - Die Erhöhung zurücknehmen, nicht committen.
  - Ohne `?sw` laden: Die Registrierung ist entfernt.
  - Die Netzwerkliste zeigt nur eigene Dateien.
- [ ] **Step 7: Commit**: `git commit -m "Offline mit Service Worker und verlässliche Updates"`

---

### Task 12: Abschluss von Plan 2

**Files:**
- Modify: `README.md`

- [ ] **Step 1: README aktualisieren**
  - Status: Plan 2 ist gebaut. Das Spiel speichert, lässt sich sichern und laden, hat eine Statistik mit Prüfcode, die Seite `lehrkraft.html` und läuft offline.
  - Link auf diesen Plan.
  - In der Tabelle der Abkürzungen:
    - `?sw`: Service Worker auf localhost einschalten
    - Hinweis: `?dev`, `?duell` und `?galerie` speichern nichts
  - Abschnitt „Für Lehrkräfte“ mit dem Link auf `lehrkraft.html`.
  - Abschnitt „Veröffentlichen“:
    - Version in drei Dateien gleich erhöhen.
    - `tests/fixtures/spielstand-v1.txt` nie ändern.
    - Jede Formatänderung bekommt eine Umwandlung mit eigener Fixture.
  - Offene Prüfpunkte für das iPad:
    - Installieren
    - Spielstand vom Browser in die Home-Bildschirm-App mitnehmen
    - Teilen-Menü beim Sichern
    - Bildschirmtastatur auf `lehrkraft.html`
- [ ] **Step 2: Gesamtprüfung**
  - `node --test` ergibt `# fail 0`.
  - Ein voller Durchlauf in Chrome, quer und hoch:
    1. neues Spiel und ein Sieg
    2. neu laden und weiterspielen
    3. Spielstand sichern, „Neues Spiel“, dann die Sicherung laden
    4. Paket wechseln und zurück
    5. Statistik öffnen und auf `lehrkraft.html` prüfen
    6. offline mit `?sw`
- [ ] **Step 3: Commit**: `git commit -m "Plan 2 abschließen: README"`
