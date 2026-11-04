# Lumara – Das Land unter dem Nebel

*(Arbeitstitel: Lernwelt RPG)*

Ein HTML-Lernspiel im Stil alter Handheld-Konsolen. Ein Kind wählt ein Wesen, erkundet eine geheimnisvolle Insel unter einem Nebel des Vergessens und besteht Duelle mit Aufgaben aus dem Unterricht. Dafür bekommt es Punkte, und sein Wesen entwickelt sich weiter. Die Inhalte kommen aus einem Lernpaket, einer Textdatei, die die Lehrkraft selbst schreibt. Dadurch funktioniert das Spiel in jedem Fach. Das erste Beispielpaket ist für Jahrgang 6 Englisch.

**Status:** Plan 1, Plan 2, Plan 3a, Plan 3b, Plan 3c, Plan 4a, Plan 4b, Plan 4c, Plan 4d und Plan 5a sind gebaut (Spielfassung 0.10.0).

- **Plan 1**, spielbarer Kern:
  - Leuchtturmbucht, Lernpaket, fünf Startwesen
  - wilde Wesen im hohen Gras und die Hüterin der Bucht
  - alle drei Antwortformen, XP und Level-Aufstiege
- **Plan 2**, Spielstand und Lehrkraft:
  - Das Spiel speichert automatisch: nach jedem Duell, alle 30 Sekunden und beim Schließen. Beim nächsten Öffnen geht es dort weiter.
  - Den Spielstand samt Lernpaket kann man als Datei sichern und laden.
  - Menü mit Wesen und Einstellungen
  - Lernpaket wechseln
  - Statistik mit Prüfcode und die Seite für Lehrkräfte
  - „Erst installieren“ auf iPad und iPhone
  - offline spielbar, Updates werden beim nächsten Start aktiv
- **Plan 3a**, Welt und Flüsterwald:
  - Der Flüsterwald als zweites Gebiet, mit eigenen wilden Wesen, dem Waldläufer, Bewohnern und flüsternden Bäumen
  - Leuchtsteine: Ein Sieg über eine Hüterin oder einen Hüter entzündet den Stein, der Nebel weicht. Am Leuchtturm erscheint ein farbiger Ring. Zwischen leuchtenden Steinen kann man reisen, und nach einer Niederlage wacht man am zuletzt besuchten Stein auf.
  - Futter: Beeren an Sträuchern, Sternfrüchte, Füttern im Duell und im Rucksack. Pieks hat den Grünen Daumen.
  - Seltene Steine im Gras: Weitblick, Glanz und Leben
  - Zettel unter Steinen mit Aufgaben, Geschichtsstücken und einem Tagebuch
  - Möwen und Gischt in der Bucht, Glühwürmchen und Blätter im Wald
- **Plan 3b**, Pilzmoor, Spiegeldünen und Windklippen:
  - drei neue Gebiete mit je einer Hüterin oder einem Hüter (Hazel, Karim, Skye), Bewohnern, drei wilden Arten, eigener Arena, Teilchen und drei Geschichtsstücken
  - Pilzmoor mit Stegen, Leuchtpilzen und der Irrlichtinsel; Spiegeldünen mit Glasstatuen und Luftspiegelungen, die wie Wege aussehen; Windklippen mit Hängebrücken und Windrädern
  - Zeitdruck ab Trainer 4: ein Zeitbalken im Antwortfeld, beim Eintippen ×1,5, beim Satzbau ×2, Flausch +25 %. `ZEITDRUCK: lang` verdoppelt, `aus` schaltet die Uhr ab. Abgelaufene Zeit zählt als falsch.
  - Zeitsteine (ab Gebiet 4): halten die Uhr für eine Frage an
  - Beispielpaket mit den Themen 1 bis 5 und 21 Zetteln
- **Plan 3c**, Uhrwerkruinen, Nordlichtsee und Sternenwiese:
  - drei neue Gebiete mit Otto (30 s pro Frage), Freya (25 s) und Luna (20 s), Bewohnern, je drei wilden Arten, eigener Arena, Teilchen und drei Geschichtsstücken. Das letzte Stück verrät Morrows Namen.
  - Uhrwerkruinen mit Kanälen, Brücken und Zahnrädern, die Funken sprühen; Nordlichtsee mit Eis, Löchern im Eis, Schnee und Nordlicht; Sternenwiese mit Sternengras und Sternschnuppen
  - Sternwarte und Eisgrotte sind schon zu sehen; erreichbar werden sie mit Plan 4d.
  - Das Höhlentor am Berg: Seine acht Fassungen leuchten mit den Leuchtsteinen in den Farben der Ringe. Die Höhle selbst bleibt bis zum Finale zu.
  - Nach dem Sieg über Luna führt ein Pfad von der Sternenwiese hinunter in die Bucht: Der Ring der Insel ist geschlossen.
  - Karte der Insel im Menü: Gebiete im Nebel grau und mit „Im Nebel“, dazu „Du bist hier“. Das Reisemenü zeigt viele Ziele in zwei Spalten.
  - Beispielpaket mit allen acht Themen und 27 Zetteln
  - Mit `ZEITDRUCK: aus` gibt es keine Zeitsteine, und nach einem Zeitstein ist Füttern gesperrt.
- **Plan 4a**, die Spielsprache (Design 10.6):
  - Ist das Lernpaket für Englisch, ist das ganze Spiel auf Englisch: Oberfläche, Duelle, Bewohner, Schilder, Geschichte und die Namen der Gebiete und Wesen. Jedes andere Paket läuft auf Deutsch.
  - Die Sprache kommt aus `SPIELSPRACHE:` oder, ohne diese Zeile, aus `FACH:`. Französisch und Spanisch erkennt das Spiel schon; sie kommen in einem späteren Plan und laufen bis dahin auf Deutsch.
  - Auf Deutsch bleibt alles für die Lehrkraft: `lehrkraft.html`, die Seite „Für die Lehrkraft“ im Spiel und die Fehlerliste beim Laden eines Pakets.
- **Plan 4b**, Entwicklungen und Wesen-Buch:
  - Die fünf Startwesen haben Bilder für alle vier Stufen (32, 40, 48 und 64 Pixel).
  - Erreicht das Wesen Stufe 2, 3 oder 4, leuchtet es auf, wechselt die Gestalt und zeigt den neuen Namen und die neue Fähigkeit, im Duell und nach einem Zettel. Die neuen Energiefelder sind gleich gefüllt.
  - Die Seite „Wesen“ zeigt das Bild und die Fähigkeiten mit dem Level, ab dem sie gelten.
  - Das Wesen-Buch im Menü: 33 Einträge, gesehen mit Silhouette und Fundort, besiegt mit Bild und Beschreibung. Die Plätze 25 bis 33 füllen die geheimen Orte und das Finale.
  - Glanzform: Ein wildes Wesen erscheint mit 1 zu 64 in einer seltenen Farbe und bekommt im Buch einen Stern.
  - Spielstand-Format 4 (`book`); ältere Stände bekommen die Wesen ihrer besiegten Trainer ins Buch.
- **Plan 4c**, Aufträge, Schlüsselgegenstände und die ersten geheimen Orte:
  - In den Gebieten 1 bis 5 gibt je ein Bewohner einen Auftrag: Bram, Fenna, Jasper, Samir und Tamo. Annehmen geht jederzeit, abschließen erst, wenn der Leuchtstein des Gebiets leuchtet. Belohnung: 50 XP und ein Gegenstand.
  - Schlüsselgegenstände im Rucksack: der Futterbeutel (Platz für 20 Futter), die Laterne und der Kletterhaken.
  - Das Tagebuch zeigt die Aufträge mit einem Hinweis auf den nächsten Schritt.
  - Die Hohle Eiche im Flüsterwald (dunkler Wurzelgang, nur mit Laterne) und der Glasturm in den Spiegeldünen (mit dem Kletterhaken): je eine seltene Art (Wurzelgeist, Prismalibelle), ein Geschichtsstück und ein seltener Stein.
  - Spielstand-Format 5 (`quests`, `keys`, `secrets`).
- **Plan 4d**, die letzten Aufträge und geheimen Orte:
  - Aufträge in den Gebieten 6 bis 8: Pino sucht sein Boot (Nussschale), Sven schickt Tee zu Greta (Eiskufen), Selma sucht den Sternzähler Jonte (Sternkarte).
  - Mit der Nussschale vom Pfahl am Steg zur Gezeiteninsel und vom Pfahl am Moorufer zur Irrlichtinsel.
  - Die Eisgrotte: Auf Rutscheis gleitet man, bis eine Eissäule aufhält. Zum Kristall braucht man fünf Rutschzüge; über den Ausgang fängt man jederzeit neu an.
  - Die Sternwarte: drei Zahnräder, deren Sterne wie auf der Sternkarte zeigen müssen. Dann öffnet sich die Kuppel und bleibt offen.
  - Vier neue seltene Arten (Perlkrabbe, Irrlichtfee, Kristallotter, Zeitschnecke), vier Geschichtsstücke und die Buchplätze 27 bis 30.
- **Plan 5a**, die Höhle, Morrow und die Welt danach:
  - Leuchten alle acht Steine und hat das Lernpaket alle acht Trainer, öffnet sich das Höhlentor auf der Sternenwiese. Drei Ebenen führen hinunter, mit Kristallmoos, Echokristallen und zwei eigenen Arten (Echomaus, Kristallraupe).
  - Ilvy wartet am Eingang und nennt Morrows Namen, falls das letzte Geschichtsstück der Wiese noch fehlt.
  - Das Endduell gegen Morrow: drei Phasen mit je 6 Energie, Fragen aus allen Themen, Zeit wie bei Trainer 8. Morrow wechselt dabei die Gestalt. Der erste Sieg mit einem Paket bringt 500 XP und zählt in der Statistik als „Endgegner besiegt“.
  - Nach dem Sieg sagt das Kind Morrows Namen. Der Nebel löst sich, alle Bewohner sagen neue Sätze, und Morrow wohnt als Freund am Leuchtturm. Das bleibt auch bei einem Paketwechsel.
  - Das Wesen-Buch hat jetzt alle 33 Einträge.
  - Spielstand-Format 6 (`finale`).

Revanchen, das Erinnerungsduell, Sternschnuppen und der Leuchtturm-Aufstieg kommen mit dem nächsten Plan.

- Design: [docs/superpowers/specs/2026-11-01-lernwelt-rpg-design.md](docs/superpowers/specs/2026-11-01-lernwelt-rpg-design.md)
- Bauplan 1: [docs/superpowers/plans/2026-11-02-lumara-plan-1-spielbarer-kern.md](docs/superpowers/plans/2026-11-02-lumara-plan-1-spielbarer-kern.md)
- Bauplan 2: [docs/superpowers/plans/2026-11-03-lumara-plan-2-spielstand-lehrkraft.md](docs/superpowers/plans/2026-11-03-lumara-plan-2-spielstand-lehrkraft.md)
- Bauplan 3a: [docs/superpowers/plans/2026-11-03-lumara-plan-3a-welt-fluesterwald.md](docs/superpowers/plans/2026-11-03-lumara-plan-3a-welt-fluesterwald.md)
- Bauplan 3b: [docs/superpowers/plans/2026-11-03-lumara-plan-3b-gebiete-3-bis-5.md](docs/superpowers/plans/2026-11-03-lumara-plan-3b-gebiete-3-bis-5.md)
- Bauplan 3c: [docs/superpowers/plans/2026-11-03-lumara-plan-3c-gebiete-6-bis-8.md](docs/superpowers/plans/2026-11-03-lumara-plan-3c-gebiete-6-bis-8.md)
- Bauplan 4a: [docs/superpowers/plans/2026-11-03-lumara-plan-4a-spielsprache.md](docs/superpowers/plans/2026-11-03-lumara-plan-4a-spielsprache.md)
- Bauplan 4b: [docs/superpowers/plans/2026-11-03-lumara-plan-4b-entwicklungen-wesen-buch.md](docs/superpowers/plans/2026-11-03-lumara-plan-4b-entwicklungen-wesen-buch.md)
- Bauplan 4c: [docs/superpowers/plans/2026-11-04-lumara-plan-4c-auftraege-geheime-orte.md](docs/superpowers/plans/2026-11-04-lumara-plan-4c-auftraege-geheime-orte.md)
- Bauplan 4d: [docs/superpowers/plans/2026-11-04-lumara-plan-4d-auftraege-boot-eis-sterne.md](docs/superpowers/plans/2026-11-04-lumara-plan-4d-auftraege-boot-eis-sterne.md)
- Bauplan 5a: [docs/superpowers/plans/2026-11-04-lumara-plan-5a-hoehle-morrow.md](docs/superpowers/plans/2026-11-04-lumara-plan-5a-hoehle-morrow.md)
- Frühere Ideensammlung: [docs/2026-10-17-zwischenstand-ideensammlung.md](docs/2026-10-17-zwischenstand-ideensammlung.md)

## Für Lehrkräfte

- Seite für Lehrkräfte: [lehrkraft.html](lehrkraft.html)
  - Statistik prüfen: Werte vom Screenshot abtippen, dazu den Prüfcode.
  - Lernpaket prüfen: Fehler und Hinweise mit Zeilennummern, eine Übersicht pro Trainer und Probefragen in der echten Duell-Ansicht.
- Die Statistik steht im Spiel unter Menü → Einstellungen → Für die Lehrkraft. Sie gilt jeweils für das aktuelle Lernpaket.
- **Spielsprache:** Mit `FACH: Englisch` (oder `SPIELSPRACHE: englisch`) läuft das ganze Spiel auf Englisch, auf Niveau A1 bis A2. So wird schon das Herumlaufen zum Sprachbad. Mit `SPIELSPRACHE: deutsch` bleibt ein Englisch-Paket auf Deutsch.
- Vorlage: [pakete/vorlage.txt](pakete/vorlage.txt)
- Beispielpaket Englisch 6 (Trainer 1 bis 8): [pakete/englisch-6-beispiel.txt](pakete/englisch-6-beispiel.txt)

## Lokal starten

Das Spiel besteht aus ES-Modulen und braucht deshalb einen kleinen lokalen Webserver:

```bash
python3 -m http.server 8000
```

Dann `http://localhost:8000/` öffnen. Nach Änderungen am Code einmal hart neu laden (Cmd+Shift+R bzw. Strg+Shift+R), sonst nimmt der Browser manchmal noch alte Dateien aus dem Zwischenspeicher.

Bleibt das Bild schwarz, einfach neu laden. Der einfache Python-Server bleibt bei vielen Modulen gleichzeitig manchmal hängen. Auf GitHub Pages passiert das nicht.

### Abkürzungen zum Testen (nur auf localhost)

| Adresse | Wirkung |
|---|---|
| `/?dev` | direkt in die Bucht, Name „Test“, Wesen Funki |
| `/?dev&wesen=kiesel` | wie oben mit einem anderen Startwesen (`funki`, `kiesel`, `nixi`, `flausch`, `pieks`) |
| `/?dev&gebiet=moor` | direkt am Eingang eines Gebiets (`wald`, `moor`, `duenen`, `klippen`, `ruinen`, `see`, `wiese`), alle Leuchtsteine davor leuchten |
| `/?duell=wild` | direkt ein Duell gegen ein wildes Wesen, danach das nächste |
| `/?duell=trainer` | direkt das Duell gegen die Hüterin der Bucht |
| `/?duell=wild&glanz` | jedes wilde Wesen als Glanzform |
| `&level=40` | zu `?dev` oder `?duell`: das Wesen gleich auf diesem Level (Stufen und Entwicklung testen) |
| `/?galerie` | alle Wesen in Originalgröße, A blättert weiter |
| `/?galerie&glanz` | alle Wesen als Glanzform |
| `/?ipad` | so tun, als liefe das Spiel auf einem iPad in Safari (zeigt „Bevor es losgeht“, wenn es noch keinen Spielstand gibt) |
| `/?sprache=xx` | Prüfmodus der Spielsprache: Jeder übersetzte Text steht in ⟦ ⟧, vergessene Texte fallen so sofort auf |
| `/?sw` | Service Worker auch lokal einschalten (zum Testen von Offline und Updates) |

- `?dev`, `?duell` und `?galerie` speichern nie einen Spielstand. Der echte Stand auf dem Rechner bleibt also erhalten.
- Ohne `?sw` werden lokale Service Worker wieder entfernt, damit immer die frischen Dateien kommen.

## Spielstand

- Gespeichert wird im Browser, verschleiert und mit Prüfsumme. Der Hauptstand liegt unter `lumara.spielstand.v1`, der vorige Stand als Sicherung unter `lumara.spielstand.v1.vorher`.
- Ist der Hauptstand beschädigt, bietet das Spiel die Sicherung an. Es überschreibt nie still.
- Fortschritt, Statistik und besiegte Trainer gehören zum Lernpaket, genauer zu seiner Kennung. Name, Wesen und Level gehören dem Kind.

## Veröffentlichen

1. Die Spielfassung an drei Stellen gleich erhöhen: `version.json`, `js/version.js` und `sw.js` (`VERSION`). Der Test `tests/sw.test.js` prüft das.
2. Neue Dateien des Spiels in die Liste `FILES` in `sw.js` eintragen. Der Test findet fehlende oder überzählige Einträge.
3. `node --test` laufen lassen.

Kinder bekommen die neue Fassung beim nächsten Öffnen. Das laufende Spiel lädt nie mitten drin neu.

**Spielstände müssen ladbar bleiben.** Festgeschrieben sind:

- Format 1 mit `tests/fixtures/spielstand-v1.txt`
- Format 2 (seit Spielfassung 0.3.0) mit `tests/fixtures/spielstand-v2.txt`
- Format 3 (seit Spielfassung 0.4.0, mit Zeitsteinen im Rucksack) mit `tests/fixtures/spielstand-v3.txt`

Diese Dateien werden nie geändert. Für jede Änderung am Format gilt:

- eine neue Version in `js/save/migrate.js`
- eine Umwandlung von der alten zur neuen Version
- eine neue Testdatei `tests/fixtures/spielstand-v4.*`

Auch Prüfcode, Verschleierung und Paketkennung (`hash32`, `mix32`, Salze) werden nie geändert.

App-Symbole neu erzeugen: `node tools/make-icons.mjs`

## Tests

Die reine Spiellogik wird mit dem eingebauten Testläufer von Node geprüft, ohne npm-Pakete. Dazu gehören:

- Paket-Parser und Antwortprüfung
- Fragenziehung, Duellregeln und XP
- Karten
- Spielstand, Sicherungsdatei und Spielzeit
- Prüfcode und Eingaben der Lehrkraft
- Dateiliste des Service Workers

Ein weiterer Test prüft alle Spieldateien auf Syntaxfehler.

```bash
node --test
```

Grafik, Steuerung und Ton werden von Hand im Browser geprüft, am PC und auf dem iPad.

**Noch offen, auf einem echten iPad zu prüfen:**

- Lumara zum Home-Bildschirm hinzufügen
- den Spielstand von Safari in die App mitnehmen (sichern, dort laden)
- das Teilen-Menü beim Sichern („In Dateien sichern“)
- die Bildschirmtastatur beim Eintippen und auf der Seite für Lehrkräfte
- die Statistikseite mit einem Paket mit 8 Themen, ob sie ohne Scrollen auf einen Screenshot passt

## Technik

- Reines HTML, CSS und JavaScript als ES-Module. Kein Framework, kein Build-Schritt, keine Abhängigkeiten.
- Keine externen Bibliotheken, Web-Fonts, Bilder, Sounds oder Tracker. Keine Netzwerkanfragen außer zu den eigenen Dateien.
- Alles wird im Code gezeichnet: Pixelraster mit einer eigenen Palette aus 32 Farben, auf 240 × 160 Pixeln, scharf hochskaliert. Einzige Bilddateien sind die selbst erzeugten App-Symbole.
- Offline über einen Service Worker, installierbar über ein Web-App-Manifest.
