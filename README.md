# Lumara – Das Land unter dem Nebel

*(Arbeitstitel: Lernwelt RPG)*

Ein HTML-Lernspiel im Stil alter Handheld-Konsolen. Ein Kind wählt ein Wesen, erkundet eine geheimnisvolle Insel unter einem Nebel des Vergessens und besteht Duelle mit Aufgaben aus dem Unterricht. Dafür bekommt es Punkte, und sein Wesen entwickelt sich weiter. Die Inhalte kommen aus einem Lernpaket, einer Textdatei, die die Lehrkraft selbst schreibt. Dadurch funktioniert das Spiel in jedem Fach. Das erste Beispielpaket ist für Jahrgang 6 Englisch.

**Status:** Plan 1 ist gebaut: ein spielbarer Kern mit Leuchtturmbucht, Lernpaket und Duellen. Ein Kind lädt ein Paket (oder probiert das Beispielpaket), wählt eines von fünf Wesen, läuft durch die Bucht, trifft im hohen Gras wilde Wesen und fordert die Hüterin der Bucht heraus. Alle drei Antwortformen, XP und Level-Aufstiege funktionieren. **Noch kein Spielstand:** Nach einem Neuladen beginnt das Spiel wieder beim Titel, nur das Lernpaket bleibt gespeichert. Das kommt mit Plan 2.

- Design: [docs/superpowers/specs/2026-11-01-lernwelt-rpg-design.md](docs/superpowers/specs/2026-11-01-lernwelt-rpg-design.md)
- Bauplan 1: [docs/superpowers/plans/2026-11-02-lumara-plan-1-spielbarer-kern.md](docs/superpowers/plans/2026-11-02-lumara-plan-1-spielbarer-kern.md)
- Frühere Ideensammlung: [docs/2026-10-17-zwischenstand-ideensammlung.md](docs/2026-10-17-zwischenstand-ideensammlung.md)

## Lernpakete

- Vorlage für Lehrkräfte: [pakete/vorlage.txt](pakete/vorlage.txt)
- Beispielpaket Englisch 6 (Trainer 1 und 2): [pakete/englisch-6-beispiel.txt](pakete/englisch-6-beispiel.txt)

## Lokal starten

Das Spiel besteht aus ES-Modulen und braucht deshalb einen kleinen lokalen Webserver:

```bash
python3 -m http.server 8000
```

Dann `http://localhost:8000/` öffnen. Nach Änderungen am Code einmal hart neu laden (Cmd+Shift+R bzw. Strg+Shift+R), sonst nimmt der Browser manchmal noch alte Dateien aus dem Zwischenspeicher.

### Abkürzungen zum Testen (nur auf localhost)

| Adresse | Wirkung |
|---|---|
| `/?dev` | direkt in die Bucht, Name „Test“, Wesen Funki |
| `/?dev&wesen=kiesel` | wie oben mit einem anderen Startwesen (`funki`, `kiesel`, `nixi`, `flausch`, `pieks`) |
| `/?duell=wild` | direkt ein Duell gegen ein wildes Wesen, danach das nächste |
| `/?duell=trainer` | direkt das Duell gegen die Hüterin der Bucht |
| `/?galerie` | alle Wesen in Originalgröße |

## Tests

Die reine Spiellogik (Paket-Parser, Antwortprüfung, Fragenziehung, Duellregeln, XP, Karten) wird mit dem eingebauten Testläufer von Node geprüft, ohne npm-Pakete:

```bash
node --test
```

Grafik, Steuerung und Ton werden von Hand im Browser geprüft, am PC und auf dem iPad.

## Technik

- Reines HTML, CSS und JavaScript als ES-Module. Kein Framework, kein Build-Schritt, keine Abhängigkeiten.
- Keine externen Bibliotheken, Web-Fonts, Bilder, Sounds oder Tracker. Keine Netzwerkanfragen außer zu den eigenen Dateien.
- Alles wird im Code gezeichnet: Pixelraster mit einer eigenen Palette aus 32 Farben, auf 240 × 160 Pixeln, scharf hochskaliert.
