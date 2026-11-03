# Lumara · Plan 4a: Die Spielsprache (Deutsch und Englisch) – Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ist das Lernpaket für Englisch, ist das ganze Spiel auf Englisch. Das gilt für Oberfläche, Duelle, Bewohner, Schilder, Geschichte und die Namen von Gebieten und Wesen. Jedes andere Paket läuft wie bisher auf Deutsch.

**Architecture:**
- **Erkennung:** `js/pack/language.js` bestimmt die Sprache aus `SPIELSPRACHE` oder `FACH`. Der Parser legt sie als `pack.language` ab.
- **Textmodul** `js/i18n/i18n.js`:
  - die aktive Sprache und `t(key, params)` mit Rückfall auf Deutsch
  - ein Prüfmodus `?sprache=xx`, der jeden übersetzten Text in ⟦ ⟧ setzt. So fällt jeder vergessene Text sofort auf.
- **Oberflächentexte** stehen in flachen Tabellen `js/i18n/de.js` und `js/i18n/en.js`.
- **Inhalte:**
  - Bewohner, Schilder, Geschichte und Wesen bleiben auf Deutsch dort, wo sie heute stehen. Das ist die Quelle.
  - Die englische Fassung liegt daneben in `js/i18n/en-world.js`, `en-story.js` und `en-species.js`.
  - Kleine Zugriffsfunktionen wählen die Sprache.
  - Ein Vollständigkeitstest sorgt dafür, dass zu jedem deutschen Text der englische existiert.
- **Sprache setzen:** Ein einziger Weg setzt das Paket und damit die Sprache: `setGamePack(game, pack)`.
- Kein neues Spielstand-Format.

**Tech Stack:** wie Plan 1 bis 3c, ohne neue Bausteine.

**Spec:** `docs/superpowers/specs/2026-11-01-lernwelt-rpg-design.md` (im Folgenden „Design“), vor allem der neue Abschnitt **10.6 Spielsprache**. Vorgänger: Plan 1 bis 3c.

**Umfang:**
- Design 10.6 für Deutsch und Englisch
- Französisch und Spanisch erkennt das Spiel schon, sie laufen aber bis zu ihrem eigenen Plan auf Deutsch, mit Hinweis.

**Reihenfolge der weiteren Pläne (Claude):**
- 4a: Spielsprache
- 4b: Entwicklungen und Wesen-Buch
- 4c: Aufträge, Schlüsselgegenstände und geheime Orte der Gebiete 1 bis 5
- 4d: Aufträge 6 bis 8, Boot, Eisgrotte und Sternwarte
- 5: Finale
- 6: Musik und Ton
- 7: Französisch und Spanisch
- 8: Abschluss

Ab Plan 4b entsteht jeder neue Text gleich auf Deutsch und Englisch.

**Arbeitszweig:** `feature/spielsprache`, abgezweigt von `feature/gebiete-6-8` (PR #5 ist noch offen). Der erste Commit enthält diesen Plan, Plan 4b und die Ergänzung des Designs.

## Global Constraints

- **Aus Plan 1 bis 3c gilt weiter:**
  - keine Abhängigkeiten
  - Bezeichner englisch
  - Zahlen in `js/config.js`
  - Tests mit `node --test` und `# fail 0`
  - Commit-Nachrichten auf Deutsch mit `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- **Spielstände:**
  - Das Format bleibt 3.
  - Die Fixtures bleiben unverändert und laden weiter.
  - Die Sprache wird nicht gespeichert. Sie kommt immer aus dem Paket, auch aus dem Paket in einer Sicherung.
- **Deutsch bleibt Wort für Wort, wie es ist.** Die deutschen Texte wandern in Tabellen, ohne Änderung. Bestehende Tests mit deutschen Texten laufen weiter, weil Deutsch die Sprache ist, solange kein Paket etwas anderes sagt.
- **Englisch:**
  - Niveau A1 bis A2: kurze Sätze, häufige Wörter
  - dieselbe Bedeutung und derselbe Ton wie im Deutschen
  - je Zeile höchstens etwa 90 Zeichen
  - Begriffe nach dem Glossar unten
- **Auf Deutsch bleiben** (Design 10.6):
  - `lehrkraft.html`
  - die Seite „Für die Lehrkraft“ im Spiel mit dem Prüfcode (`js/menu/teacherPage.js`). Ihr Knopf im Menü folgt der Spielsprache.
  - die Fehler- und Hinweisliste des Parsers
  - alles, bevor ein Paket geladen ist
- **Tests mit Englisch** stellen die Sprache danach wieder auf Deutsch zurück, mit `test.afterEach(() => setLanguage('de'))` oder `try/finally`.
- **Service Worker:** Neue Dateien kommen in dem Task in `FILES`, der sie anlegt.
- **Spielfassung** am Ende: `0.6.0` an allen drei Stellen.

### Glossar Deutsch → Englisch (verbindlich)

| Deutsch | Englisch |
|---|---|
| Lumara – Das Land unter dem Nebel | Lumara – The Land Beneath the Mist |
| Nebel des Vergessens | Mist of Forgetting |
| Leuchtstein | light stone |
| Leuchtturm | lighthouse |
| Hüterin / Hüter | keeper |
| Wesen | creature |
| Wesen-Buch | Creature Book |
| Lernpaket | learning pack |
| Lehrkraft | teacher |
| Zettel / Zettelstein | note / note stone |
| Duell | duel |
| Volltreffer | power hit |
| Zweite Chance | Second Chance |
| Energie | energy |
| Futter | food |
| Beere | berry |
| Sternfrucht | starfruit |
| Rucksack | backpack |
| Weitblickstein | farsight stone |
| Zeitstein | time stone |
| Glanzstein | shine stone |
| Lebensstein | life stone |
| Tagebuch | diary |
| Karte | map |
| Einstellungen | settings |
| Spielstand | saved game |
| Prüfen | Check |
| Fliehen | Run |
| Aufgeben | Give up |
| Füttern | Feed |
| Makellos | Flawless |

### Englische Namen (Claude)

**Gebiete:** `name` ist der Name, `of` die Form in „The light stone of …“.

| Karte | name | of |
|---|---|---|
| bucht | Lighthouse Bay | of Lighthouse Bay |
| wald | Whispering Woods | of the Whispering Woods |
| moor | Mushroom Marsh | of the Mushroom Marsh |
| duenen | Mirror Dunes | of the Mirror Dunes |
| klippen | Windy Cliffs | of the Windy Cliffs |
| ruinen | Clockwork Ruins | of the Clockwork Ruins |
| see | Aurora Lake | of Aurora Lake |
| wiese | Starlight Meadow | of the Starlight Meadow |

**Startwesen** (Stufe 1 → 2 → 3 → 4):

| Wesen | Stufen auf Englisch |
|---|---|
| Funki | Funki → Sparkwing → Lanternmoth → Auroramoth |
| Kiesel | Pebble → Boulderling → Rockwarden → Mountainheart |
| Nixi | Nixi → Springnix → Swirlnix → Tidenix |
| Flausch | Fluff → Cloudhoot → Stormowl → Skyhoot |
| Pieks | Prickle → Thornhog → Bloomhog → Woodwarden |

**Besonderheiten:**
- Funki: Enlightenment
- Kiesel: Steadfast
- Nixi: Spring
- Flausch: Tailwind
- Pieks: Green Thumb

**Wilde Arten** (mit Stufe-2-Form):

| Gebiet | Arten auf Englisch |
|---|---|
| 1 | gischtling Sprayling → Surfspirit · haeuschel Shellhut → Shelltower · glimmqualle Glimmerjelly |
| 2 | moosling Mossling · eichhuscher Oakscamper → Crownscamper · rindenwicht Barkimp |
| 3 | tupfling Dotling → Parasolling · irrfunke Wispark · nebelunke Fogtoad |
| 4 | glaskaefer Glassbeetle → Mirrorbeetle · duenenhuepfer Dunehopper · flimmerfuchs Shimmerfox |
| 5 | drachling Kiteling → Skykiteling · klippbock Cliffgoat · wolkenwal Cloudwhale |
| 6 | zahnmaus Cogmouse → Clockmouse · dampfkobold Steamsprite · messingeule Brassowl |
| 7 | frostrobbe Frostseal → Glacierseal · flockenhase Flakehare · aurorafink Aurorafinch |
| 8 | schnuppling Wishling → Cometling · nachtschaf Nightsheep · sternhirsch Starstag |

## Review Focus

1. **Paketwechsel mit Sprachwechsel mitten im Spiel:**
   - Lädt man im Menü ein Mathe-Paket über ein Englisch-Paket, ist danach alles auf Deutsch, umgekehrt alles auf Englisch.
   - Das gilt auch für Anzeigen, die schon offen waren: Menü, Welt, Name des Gebiets.
   - Auch eine Sicherung mit einem anderen Paket bringt dessen Sprache mit.
   - → Test in Task 1, Browser in Task 9
2. **Vergessene Texte:**
   - Im Prüfmodus `?sprache=xx` ist kein sichtbarer Text ohne ⟦ ⟧, außer Eigennamen, Inhalten aus dem Paket und der Seite für die Lehrkraft.
   - Kein Bewohner, kein Schild und kein Geschichtsstück fehlt auf Englisch.
   - → Tests in Task 2 und Task 6 bis 8, Browser in Task 9
3. **Seltsame Angaben im Paket:**
   - `FACH: Englisch 6b`, `FACH: ENGLISH`, `FACH: Deutsch als Zweitsprache`, `SPIELSPRACHE: Englisch` bei `FACH: Mathe`, eine unbekannte `SPIELSPRACHE`, `FACH: Französisch` (noch nicht fertig) und `FACH: Latein`
   - Jede gibt eine klare Sprache und, wo nötig, einen Hinweis.
   - → Test in Task 1
4. **Platz für englische Texte:**
   - Englische Wörter sind teils länger oder kürzer. Knöpfe, Reisemenü, Karte, Schilder am Duell und Textfenster laufen nicht über.
   - Das gilt bei 1024 × 707 und im 390 × 844-Rahmen.
   - → Browser in Task 9
5. **Grammatik mit Namen:**
   - „A wild Sprayling appears!“, „The wild Sprayling is tired out.“, „The light stone of the Mushroom Marsh shines again!“
   - Mit Spitznamen und mit Namen, die mit einem Vokal beginnen: „A wild Oakscamper“. Der Artikel gehört zu „wild“.
   - → Tests in Task 6 und Task 7

---

## Dateistruktur (neu und geändert)

```
js/pack/language.js          neu: Spielsprache aus SPIELSPRACHE oder FACH, mit Hinweis
js/pack/parser.js            + SPIELSPRACHE im Kopf, pack.language, Hinweise
js/i18n/i18n.js              neu: LANGUAGES, READY, setLanguage, language, t, tl, Prüfmodus
js/i18n/de.js, en.js         neu: Oberflächentexte
js/i18n/en-species.js        neu: Namen, Beschreibungen, Besonderheiten auf Englisch
js/i18n/en-world.js          neu: Gebietsnamen und alle Texte der Karten auf Englisch
js/i18n/en-story.js          neu: die 24 Geschichtsstücke auf Englisch
js/app/gamePack.js           neu: setGamePack(game, pack) setzt Paket, Sprache, <html lang> und Titel
js/data/species.js           speciesName, displayName, wildName, speciesText nach Sprache
js/data/story.js             + storyPieces(area)
js/data/texts.js             Standardtexte der Trainer nach Sprache
js/world/network.js          npcLines über worldLines; + worldLines, areaName, areaOf
js/world/fogEdge.js, caveGate.js, islandMap.js   Texte über t()
js/scenes/*.js, js/ui/*.js, js/menu/*.js, js/items/*.js   Texte über t() (teacherPage.js ausgenommen)
js/world/maps/*.js           jedes Objekt mit Text bekommt eine id (Schilder, Zierobjekte)
js/main.js                   setGamePack statt game.pack =, ?sprache=xx
pakete/vorlage.txt           SPIELSPRACHE erklärt
tests/i18n.test.js, tests/language.test.js, tests/i18nLint.test.js   neu
```

## Gemeinsame Schnittstellen

```js
// Erkennung (Task 1)
packLanguage({ subject, gameLanguage, gameLanguageLine }) → { language: 'de'|'en'|'fr'|'es', requested: string|null, hints: [{ line, message }] }
pack.language: 'de' | 'en'      // die Sprache, in der das Spiel wirklich läuft (nur READY)

// Textmodul (Task 2)
LANGUAGES = ['de', 'en', 'fr', 'es'];  READY = ['de', 'en']
setLanguage(lang) → string          // nicht bereit oder unbekannt → 'de'; gibt die aktive Sprache zurück
language() → string
setPseudo(on: boolean) → void       // Prüfmodus: t() liefert ⟦deutscher Text⟧
t(key, params = {}) → string        // {name}-Platzhalter; fehlt der Schlüssel in der Sprache → Deutsch; fehlt er ganz → Error
tl(key, params = {}) → string[]     // für Tabelleneinträge, die Zeilenlisten sind
setGamePack(game, pack) → void      // game.pack = pack; setLanguage(pack.data.language); <html lang>; document.title = t('app.title')

// Inhalte (Task 6 bis 8)
speciesText(id) → { names: string[], description: string, special?: { name, text } }   // in der aktiven Sprache
worldLines(def, o, field) → string[] | string    // field: lines, linesLit, linesOpen, linesNoClock, afterWin
areaName(def) → string;  areaOf(def) → string    // de: def.name / def.genitive; en: Tabelle oben
storyPieces(area) → string[]
```

**Schlüssel der Oberflächentexte:**
- Punkte trennen Bereich und Name, zum Beispiel `duel.check`, `menu.book`, `bag.feed`, `world.beaconRelit`.
- Platzhalter in geschweiften Klammern: `'world.beaconRelit': 'Der Leuchtstein {of} leuchtet wieder!'`
- Zeilenlisten sind Arrays.

---

### Task 1: Das Paket kennt seine Sprache

**Files:**
- Create: `js/pack/language.js`, `tests/language.test.js`
- Modify: `js/pack/parser.js`, `pakete/vorlage.txt`, `sw.js`
- Test: `tests/language.test.js`, `tests/parser.test.js`

**Interfaces:**
- Produces: `packLanguage`, `pack.language`. Die Hinweise landen bei den übrigen Hinweisen des Parsers.
- **Wörter** (klein geschrieben, Akzente zählen nicht):
  - de: `deutsch`, `german`, `de`, `allemand`, `aleman`
  - en: `englisch`, `english`, `en`, `anglais`, `ingles`
  - fr: `franzosisch`, `franzoesisch`, `french`, `fr`, `francais`, `frances`
  - es: `spanisch`, `spanish`, `es`, `espanol`, `espagnol`
- **Regeln:**
  - `SPIELSPRACHE` muss ganz einem Wort entsprechen.
  - Bei `FACH` genügt ein Wort darin. Ein „Deutsch“ darin gewinnt, damit „Deutsch als Zweitsprache“ deutsch bleibt.
- **Andere Sprachfächer** geben Deutsch mit Hinweis: Latein, Italienisch, Niederländisch, Russisch, Türkisch, Polnisch, Portugiesisch, Griechisch, Chinesisch, Japanisch, Arabisch.
- **Hinweistexte** (Deutsch, für die Lehrkraft):
  - nicht unterstützt: `Das Spiel gibt es noch nicht auf {Sprache}. Es läuft auf Deutsch.`
  - erkannt, aber noch nicht fertig (fr, es): `Das Spiel auf {Sprache} kommt in einer späteren Spielfassung. Bis dahin läuft es auf Deutsch.`
  - unbekannte SPIELSPRACHE: `Zeile {n}: Unbekannte SPIELSPRACHE „{wert}“. Möglich sind deutsch, englisch, französisch und spanisch.`
  - `{Sprache}` steht dabei im Dativ-tauglichen Namen: Italienisch, Französisch, …

- [ ] **Step 1: Tests schreiben**

```js
const lang = (subject, gameLanguage = null) => packLanguage({ subject, gameLanguage, gameLanguageLine: gameLanguage ? 5 : null });

test('Spielsprache aus dem Fach, auch mit Zusätzen und in anderer Schreibung', () => {
  for (const s of ['Englisch', 'ENGLISH', 'Englisch 6b', 'English (Year 6)']) assert.equal(lang(s).language, 'en', s);
  for (const s of ['Mathe', 'Deutsch als Zweitsprache', 'Biologie', '']) assert.equal(lang(s).language, 'de', s);
  assert.deepEqual(lang('Englisch').hints, []);
});

test('SPIELSPRACHE gewinnt vor dem Fach; Unbekanntes ist ein Hinweis mit Zeile', () => {
  assert.equal(lang('Mathe', 'Englisch').language, 'en');
  assert.equal(lang('Englisch', 'deutsch').language, 'de');
  const r = lang('Englisch', 'klingonisch');
  assert.equal(r.language, 'en'); // dann entscheidet das Fach
  assert.deepEqual(r.hints, [{ line: 5, message: 'Zeile 5: Unbekannte SPIELSPRACHE „klingonisch“. Möglich sind deutsch, englisch, französisch und spanisch.' }]);
});

test('Französisch und Spanisch werden erkannt, laufen aber noch auf Deutsch; Latein läuft auf Deutsch', () => {
  assert.deepEqual(lang('Französisch'), { language: 'de', requested: 'fr', hints: [{ line: null, message: 'Das Spiel auf Französisch kommt in einer späteren Spielfassung. Bis dahin läuft es auf Deutsch.' }] });
  assert.equal(lang('Español').requested, 'es');
  assert.deepEqual(lang('Latein').hints.map(h => h.message), ['Das Spiel gibt es noch nicht auf Latein. Es läuft auf Deutsch.']);
});

// tests/parser.test.js
test('Der Parser legt die Spielsprache ab und kennt SPIELSPRACHE als Schlüsselwort', () => {
  assert.equal(parsePack(makePackText()).pack.language, 'en'); // makePackText schreibt FACH: Englisch
  const r = parsePack(makePackText().replace('FACH: Englisch', 'FACH: Mathe\nSPIELSPRACHE: englisch'));
  assert.equal(r.pack.language, 'en');
  assert.ok(!r.warnings.some(w => /Unbekanntes Schlüsselwort/.test(w.message)));
});
```

  Liefert der Parser seine Hinweise in einer anderen Form als `{ line, message }`, übernimmt `packLanguage` diese Form. Die Tests werden entsprechend angepasst und das in den Ledger geschrieben.
- [ ] **Step 2: `node --test`.** Erwartet: FAIL (`language.js` fehlt).
- [ ] **Step 3: Umsetzen.**
  - `vorlage.txt` erklärt `SPIELSPRACHE`, mit dem Satz aus Design 10.6.
  - `language.js` kommt in `FILES`.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Im Browser prüfen.** `lehrkraft.html`: Ein Paket mit `FACH: Latein` zeigt den Hinweis.
- [ ] **Step 6: Commit**: `git commit -m "Lernpaket: Spielsprache aus SPIELSPRACHE oder FACH"`

---

### Task 2: Das Textmodul und die Startbildschirme

**Files:**
- Create: `js/i18n/i18n.js`, `js/i18n/de.js`, `js/i18n/en.js`, `js/app/gamePack.js`, `tests/i18n.test.js`, `tests/i18nLint.test.js`
- Modify:
  - `js/main.js`, `js/scenes/pack.js`, `js/scenes/start.js`, `js/menu/packPage.js` (je `setGamePack` statt `game.pack =`)
  - `js/scenes/title.js`, `intro.js`, `eggs.js`, `name.js`, `recover.js`, `install.js`
  - `sw.js`
- Test: `tests/i18n.test.js`, `tests/i18nLint.test.js`

**Interfaces:**
- Produces: das Textmodul (siehe Gemeinsame Schnittstellen), `setGamePack`, die Tabellen.
- **Prüfmodus:** `?sprache=xx`, nur auf localhost, ruft `setPseudo(true)`.
- **Vor dem Laden eines Pakets** bleibt Deutsch. Dafür sorgt `t()` ohne Paket, die Sprache ist dann `de`.
- **Lint-Test** `tests/i18nLint.test.js`:
  - Er liest die Dateien, die schon umgestellt sind. Die Liste `CONVERTED` im Test wächst mit jedem Task.
  - Er findet Zeichenketten (`'…'`, `"…"`, `` `…` ``) außerhalb von Kommentaren, die `[äöüÄÖÜß]` enthalten oder eines der Wörter `der die das und nicht du dein deine ist mit noch Zurück Ja Nein`.
  - Erlaubt sind nur Schlüssel von `t(...)` und `import`-Pfade.

- [ ] **Step 1: Tests schreiben**

```js
// tests/i18n.test.js
test.afterEach(() => { setLanguage('de'); setPseudo(false); });

test('Sprachen: nur fertige werden aktiv, sonst Deutsch', () => {
  assert.equal(setLanguage('en'), 'en');
  assert.equal(setLanguage('fr'), 'de');
  assert.equal(setLanguage('xy'), 'de');
});

test('t(): Platzhalter, Rückfall auf Deutsch, fehlender Schlüssel ist ein Fehler, Prüfmodus', () => {
  assert.equal(t('app.title'), 'Lumara – Das Land unter dem Nebel');
  setLanguage('en');
  assert.equal(t('app.title'), 'Lumara – The Land Beneath the Mist');
  assert.throws(() => t('gibt.es.nicht'));
  setLanguage('de');
  setPseudo(true);
  assert.equal(t('app.title'), '⟦Lumara – Das Land unter dem Nebel⟧');
});

test('Englisch hat jeden deutschen Schlüssel, mit gleicher Art und gleichen Platzhaltern', () => {
  const holes = s => [...String(s).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
  for (const [k, v] of Object.entries(DE)) {
    assert.ok(k in EN, `en fehlt: ${k}`);
    assert.equal(Array.isArray(EN[k]), Array.isArray(v), k);
    assert.equal(holes(EN[k]), holes(v), k);
  }
  assert.deepEqual(Object.keys(EN).filter(k => !(k in DE)), []);
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL (`i18n.js` fehlt).
- [ ] **Step 3: Umsetzen.**
  - Die Texte der sechs Startszenen kommen in die Tabellen, Deutsch unverändert, Englisch nach Glossar.
  - Alle Stellen mit `game.pack =` nutzen `setGamePack`.
  - Die sechs Szenen stehen in `CONVERTED`.
  - Die neuen Dateien kommen in `FILES`.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Im Browser prüfen**
  - Mit dem Beispielpaket sind Titel, Intro, Eierwahl und Namenseingabe auf Englisch, der Tab-Titel auch, und `<html lang="en">`.
  - Ohne Paket bleibt alles Deutsch.
- [ ] **Step 6: Commit**: `git commit -m "Textmodul für die Spielsprache und Startbildschirme auf Englisch"`

---

### Task 3: Duell und Zettel

**Files:**
- Modify:
  - `js/scenes/duel.js`, `js/scenes/note.js`, `js/ui/duelPanel.js`, `js/duel/answers.js` (Rückmeldetexte)
  - `js/items/stones.js` (`STONE_LINES`), `js/items/food.js`, `js/data/texts.js`
  - `js/i18n/de.js`, `en.js`, `tests/i18nLint.test.js`
- Test: `tests/i18n.test.js`, bestehende Duell-, Antwort- und Steintests

**Interfaces:**
- `DEFAULT_LINES` wird zu `defaultLines()`. Es liefert die Standardtexte der Trainer in der aktiven Sprache.
  - Englisch: hello `Show me what you have learned!`, win `Well done! You won.`, loss `Not this time. Practise a little and come back!`, rematch `You are back? This time I am ready!`
  - Wo der Parser die Standardtexte einsetzt, geschieht das jetzt beim Anzeigen, nicht beim Einlesen. Ein Paket ohne `SIEG` zeigt also den Text in seiner Sprache.
- Die Namen der Wesen in diesen Texten kommen weiter aus `wildName` und `displayName`. Englisch bekommen sie erst in Task 6.

- [ ] **Step 1: Tests schreiben**

```js
test('Duell auf Englisch: Knöpfe und Rückmeldungen', () => {
  setLanguage('en');
  assert.equal(t('duel.check'), 'Check');
  assert.equal(t('duel.flee'), 'Run');
  assert.equal(t('feedback.almost'), 'Almost! Check your spelling.');
  assert.equal(STONE_LINES.farsight(), 'You find a farsight stone!');
  assert.equal(defaultLines().win, 'Well done! You won.');
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Umsetzen**, die Dateien in `CONVERTED` aufnehmen.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Im Browser prüfen**
  - `?duell=wild` und `?duell=trainer` mit dem Beispielpaket: Alle Knöpfe, Rückmeldungen, Futterwahl, „Give up?“, XP-Zeilen und der Zeitbalken sind auf Englisch.
  - Ein Zettel genauso.
- [ ] **Step 6: Commit**: `git commit -m "Duell und Zettel in der Spielsprache"`

---

### Task 4: Ereignisse in der Welt

**Files:**
- Modify:
  - `js/scenes/worldEvents.js`, `js/scenes/world.js`, `js/scenes/beacon.js` (falls Text)
  - `js/world/fogEdge.js`, `js/world/caveGate.js`, `js/world/islandMap.js` (`mapLabels`, `caveLabels`)
  - `js/world/beacons.js`, `js/i18n/de.js`, `en.js`, `tests/i18nLint.test.js`
- Test: `tests/fogEdge.test.js`, `tests/caveGate.test.js`, `tests/islandMap.test.js`, `tests/i18n.test.js`

**Interfaces:**
- **Nebelschild:**
  - `fogEdgeLines` nimmt den Namen des Gebiets dahinter aus `areaName(MAPS[…])` (Task 7).
  - Bis dahin bleibt `sign.leadsToName` für Deutsch.
  - `leadsToPlural` gilt nur für Deutsch. Englisch sagt immer „Beyond the mist lies {name}.“
- **`breakName`** trennt nur deutsche Namen. Auf Englisch gibt es die Namen unverändert zurück.
- **„Der Leuchtstein {of} leuchtet wieder!“:** Bis Task 7 kommt `of` aus `def.genitive`. In Task 7 kommt es aus `areaOf(def)`.

- [ ] **Step 1: Tests schreiben**

```js
test('Welt auf Englisch: Nebelschild, Höhlentor und Karte der Insel', () => {
  setLanguage('en');
  assert.deepEqual(fogEdgeLines({ leadsTo: 3, lines: [] }, { gateBeaten: true, packHasNext: false, builtAreas: 8 }), ['This path opens as soon as your teacher shares the next topic.']);
  assert.deepEqual(caveGateLines(3).length > 0, true);
  assert.deepEqual(mapLabels({ open: false, lit: true, here: false }), ['☁ In the mist']);
  assert.deepEqual(caveLabels({ lit: 8 }), ['Mountain with a cave', '8 of 8 sockets are glowing']);
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Umsetzen.** Die Dateien kommen in `CONVERTED`. Die deutschen Erwartungen der bestehenden Tests bleiben unverändert.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Commit**: `git commit -m "Ereignisse der Welt in der Spielsprache"`

---

### Task 5: Menü und Einstellungen

**Files:**
- Modify:
  - `js/menu/menu.js`, `bagPage.js`, `mapPage.js`, `diaryPage.js`, `settings.js`, `packPage.js`, `backupPages.js`, `homePage.js`
  - `js/ui/sheet.js`, `js/ui/toast.js` und die Stelle mit „Neue Version da …“
  - `js/save/backup.js` (`BACKUP_MESSAGES` wird zu `backupMessage(kind)` mit den Arten `pack`, `unknown`, `damaged` und `newer`), `js/i18n/de.js`, `en.js`, `tests/i18nLint.test.js`
- Test: `tests/i18n.test.js`, `tests/backup.test.js`

**Interfaces:**
- `teacherPage.js` bleibt Deutsch und steht nicht in `CONVERTED`. Der Knopf dorthin heißt auf Englisch „For your teacher“.
- **Paketwechsel:** Ist nach dem Wechsel die Sprache eine andere, schließt `packPage` das Menü. Die Welt wird am selben Ort neu aufgebaut (`afterPackSwitch` in `worldEvents.js` reist auch bei gleicher Position, wenn sich `language()` geändert hat). So ist alles Sichtbare sofort in der neuen Sprache.

- [ ] **Step 1: Tests schreiben**

```js
test('Menü auf Englisch, die Seite für die Lehrkraft bleibt Deutsch', () => {
  setLanguage('en');
  assert.equal(t('menu.creature'), 'Creature');
  assert.equal(t('menu.teacher'), 'For your teacher');
  assert.equal(backupMessage('unknown'), 'This file is not a Lumara saved game.');
  setLanguage('de');
  assert.equal(backupMessage('damaged'), 'Diese Sicherung ist beschädigt und lässt sich nicht laden.');
});
```
- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Umsetzen**, dazu `CONVERTED` ergänzen.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Commit**: `git commit -m "Menü und Einstellungen in der Spielsprache"`

---

### Task 6: Die Wesen auf Englisch

**Files:**
- Create: `js/i18n/en-species.js`
- Modify: `js/data/species.js`, `js/scenes/eggs.js` (falls Texte direkt aus `SPECIES`), `js/menu/menu.js`, `sw.js`
- Test: `tests/species.test.js`, `tests/i18n.test.js`

**Interfaces:**
- **`EN_SPECIES[id]`:** `{ names, description, special? }`, mit den Namen aus der Tabelle oben. Die Beschreibungen sind eine Übersetzung der deutschen.
- **`speciesText(id)`** gibt Deutsch aus `SPECIES`, Englisch aus `EN_SPECIES`.
- **`speciesName`** und die Besonderheiten auf der Seite „Wesen“ nutzen `speciesText`.
- **`wildName(id, stage, form)`** auf Englisch:
  - `a` → `A wild {name}`. Der Artikel hängt an „wild“, also immer „A“, auch vor einem Vokal: `A wild Oakscamper`.
  - `the` → `The wild {name}`
  - Die Sätze drumherum (`… appears!`, `… is tired out.`) stehen in den Tabellen.

- [ ] **Step 1: Tests schreiben**

```js
test('Jede Art hat englische Namen für jede Stufe, eine Beschreibung und, bei Startwesen, ihre Besonderheit', () => {
  for (const [id, s] of Object.entries(SPECIES)) {
    assert.equal(EN_SPECIES[id]?.names.length, s.names.length, id);
    assert.ok(EN_SPECIES[id].description, id);
    if (s.kind === 'starter') assert.ok(EN_SPECIES[id].special?.name && EN_SPECIES[id].special?.text, id);
  }
});

test('Namen und Sätze mit Wesen auf Englisch', () => {
  setLanguage('en');
  assert.equal(speciesName('kiesel', 4), 'Mountainheart');
  assert.equal(wildName('eichhuscher', 1, 'a'), 'A wild Oakscamper');
  assert.equal(wildName('gischtling', 1, 'the'), 'The wild Sprayling');
  assert.equal(t('duel.wildAppears', { wild: wildName('gischtling', 1, 'a') }), 'A wild Sprayling appears!');
  assert.equal(displayName({ species: 'pieks', level: 1, nickname: 'Spiky' }), 'Spiky');
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Umsetzen**, `en-species.js` in `FILES`.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Commit**: `git commit -m "Die Wesen auf Englisch"`

---

### Task 7: Die Gebiete auf Englisch

**Files:**
- Create: `js/i18n/en-world.js`
- Modify:
  - `js/world/network.js` (`worldLines`, `areaName`, `areaOf`, `npcLines`), `js/scenes/world.js` (Schilder, Zierobjekte, Gebäude)
  - `js/scenes/worldEvents.js` (`afterWin`, Leuchtstein-Satz), `js/world/fogEdge.js`, `js/world/islandMap.js`, `js/menu/diaryPage.js`
  - `js/world/maps/*.js` (fehlende `id`s), `sw.js`
- Test: `tests/i18n.test.js`, `tests/network.test.js`

**Interfaces:**
- **`EN_WORLD`:**
  - `{ areas: { [mapId]: { name, of } }, objects: { [mapId]: { [objectId]: { lines?, linesLit?, linesOpen?, linesNoClock?, afterWin? } } } }`
  - Trainer haben die id `trainer`.
  - Das Höhlentor und die Gebäude mit `lines` haben schon ids.
- **ids:** Jedes Objekt mit Text bekommt eine `id`, die auf seiner Karte eindeutig ist, zum Beispiel `schild-ort` und `nebel-nord`. Eine id ändert keine Position.
- **`worldLines(def, o, field)`:** Englisch aus `EN_WORLD`, sonst `o[field]`.
- **`npcLines`** wählt die Zeilen wie bisher (offen, Stein, Uhr), liest sie aber über `worldLines`.
- **Gebietsnamen** überall über `areaName(def)`: Reisemenü, Karte, Tagebuch, Nebelschild. Der Leuchtstein-Satz nimmt `areaOf(def)`.

- [ ] **Step 1: Tests schreiben**

```js
const FIELDS = ['lines', 'linesLit', 'linesOpen', 'linesNoClock', 'afterWin'];

test('Jeder Text auf jeder Karte hat eine id und eine englische Fassung', () => {
  for (const def of Object.values(MAPS)) {
    assert.ok(EN_WORLD.areas[def.id]?.name && EN_WORLD.areas[def.id]?.of, def.id);
    const ids = new Set();
    for (const o of def.objects) {
      const fields = FIELDS.filter(f => o[f] != null);
      if (!fields.length) continue;
      const id = o.type === 'trainer' ? 'trainer' : o.id;
      assert.ok(id, `${def.id}: ${o.type} bei ${o.x},${o.y} ohne id`);
      assert.ok(!ids.has(id), `${def.id}: id ${id} doppelt`);
      ids.add(id);
      for (const f of fields) {
        const en = EN_WORLD.objects[def.id]?.[id]?.[f];
        assert.ok(Array.isArray(o[f]) ? Array.isArray(en) && en.length > 0 : typeof en === 'string' && en, `${def.id}.${id}.${f}`);
      }
    }
  }
});

test('Bewohner und Leuchtstein auf Englisch', () => {
  setLanguage('en');
  const ilvy = BUCHT.objects.find(o => o.id === 'ilvy');
  assert.equal(npcLines(ilvy, newGameState({ name: 'A', species: 'nixi', nickname: null }), 1, null)[0], EN_WORLD.objects.bucht.ilvy.lines[0]);
  assert.equal(areaName(MOOR), 'Mushroom Marsh');
  assert.equal(t('world.beaconRelit', { of: areaOf(MOOR) }), 'The light stone of the Mushroom Marsh shines again!');
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Umsetzen.**
  - Die englischen Texte übersetzen die deutschen Zeile für Zeile.
  - Hinweise auf Steuerung bleiben gleich, zum Beispiel „Mit B fliehen“ → „Press B to run“.
  - `en-world.js` kommt in `FILES`.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`. Der Test für `breakName` gilt weiter für Deutsch.
- [ ] **Step 5: Commit**: `git commit -m "Die Gebiete auf Englisch"`

---

### Task 8: Die Geschichte auf Englisch

**Files:**
- Create: `js/i18n/en-story.js`
- Modify: `js/data/story.js` (`storyPieces`), `js/world/notes.js`, `js/menu/diaryPage.js`, `sw.js`
- Test: `tests/story.test.js`

**Interfaces:**
- **`EN_STORY`** hat dieselbe Form wie `STORY`.
- **`storyPieces(area)`** liefert die Stücke in der aktiven Sprache.
- **Zettel und Tagebuch:**
  - `solveNote` speichert wie bisher nur die Anzahl der gefundenen Stücke (`state.story`).
  - Den Text liefert `storyPieces` in der aktiven Sprache.
  - Ein Stück, das auf Deutsch gefunden wurde, erscheint nach einem Wechsel zum Englisch-Paket also auf Englisch.
- **Morrows Name** kommt auch auf Englisch genau einmal vor, in `EN_STORY[8][2]`.

- [ ] **Step 1: Tests schreiben**

```js
test('Die Geschichte gibt es Stück für Stück auf Englisch, Morrow nur im letzten', () => {
  for (const a of Object.keys(STORY)) assert.equal(EN_STORY[a]?.length, STORY[a].length, a);
  const all = Object.values(EN_STORY).flat();
  assert.equal(all.filter(s => s.includes('Morrow')).length, 1);
  assert.ok(EN_STORY[8][2].includes('Morrow'));
  assert.ok(all.every(s => s.length <= 260));
});
```

- [ ] **Step 2: `node --test`.** Erwartet: FAIL.
- [ ] **Step 3: Umsetzen**, `en-story.js` in `FILES`.
- [ ] **Step 4: `node --test`.** Erwartet: `# fail 0`.
- [ ] **Step 5: Commit**: `git commit -m "Die Geschichte auf Englisch"`

---

### Task 9: Abschluss von Plan 4a

**Files:**
- Modify: `version.json`, `js/version.js`, `sw.js`, `README.md`

- [ ] **Step 1: Lint vervollständigen.** `CONVERTED` umfasst jetzt alle Dateien unter `js/scenes`, `js/ui`, `js/menu` (ohne `teacherPage.js`), `js/items`, `js/world` (ohne `maps/`) und `js/data/texts.js`. Erwartet: `node --test` ergibt `# fail 0`.
- [ ] **Step 2: Spielfassung `0.6.0`** an allen drei Stellen. README:
  - Status Plan 4a
  - die Spielsprache in einem kurzen Abschnitt für Lehrkräfte
  - `?sprache=xx` in der Tabelle der Entwickler-Adressen
- [ ] **Step 3: Gesamtdurchlauf in Chrome**
  1. **Prüfmodus:** `?dev&sprache=xx&gebiet=…` für alle acht Gebiete, mit Menü, Rucksack, Karte, Tagebuch, Einstellungen, einem wilden Duell und einem Zettel. Kein sichtbarer Text ohne ⟦ ⟧, außer Eigennamen, Inhalten aus dem Paket und der Seite für die Lehrkraft. Jeder Fund kommt in den Ledger und wird behoben.
  2. **Englisch:** Ohne `?dev` mit dem Beispielpaket ein neues Spiel bis zum Sieg über Maren spielen. Danach in den Wald, mit Bewohnern sprechen, einen Zettel lösen und das Stück im Tagebuch lesen.
  3. **Sprachwechsel:**
     - Im Menü ein Mathe-Paket (Testpaket mit `FACH: Mathe`) laden: Menü zu, die Welt auf Deutsch am selben Ort.
     - Zurück zum Beispielpaket: alles auf Englisch.
     - Eine Sicherung mit dem Mathe-Paket laden: Deutsch.
  4. **Platz:**
     - Reisemenü, Karte, Duellschilder und Textfenster auf Englisch bei 1024 × 707 und im 390 × 844-Rahmen: nichts läuft über.
     - Das Reisemenü auf Englisch hat Namen mit Leerzeichen und braucht keine weichen Trennstriche.
  5. Die Spielstände aus den Fixtures für Format 1 bis 3 laden: kein Verlust.
- [ ] **Step 4: Commit**: `git commit -m "Plan 4a abschließen: Spielfassung 0.6.0 und README"`
