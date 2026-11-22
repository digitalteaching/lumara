# Lumara – Das Land unter dem Nebel

*(Arbeitstitel: Lernwelt RPG)*

Ein HTML-Lernspiel im Stil alter Handheld-Konsolen. Ein Kind wählt ein Wesen, erkundet eine geheimnisvolle Insel unter einem Nebel des Vergessens und besteht Duelle mit Aufgaben aus dem Unterricht. Dafür bekommt es Punkte, und sein Wesen entwickelt sich weiter. Die Inhalte kommen aus einem Lernpaket, einer Textdatei, die die Lehrkraft selbst schreibt. Dadurch funktioniert das Spiel in jedem Fach. Das erste Beispielpaket ist für Jahrgang 6 Englisch.

**Status:** Das Spiel ist fertig (Spielfassung 1.3.0). Gebaut in den Plänen 1 bis 8, danach 1.0.x, 1.1, 1.2 und 1.3. Es läuft unter https://digitalteaching.github.io/lumara/.

**Für Lehrkräfte:** Die [Anleitung](anleitung.html) erklärt, wie man ein Lernpaket erstellt, prüft und an die Klasse verteilt. Auf der [Seite für Lehrkräfte](lehrkraft.html) prüft man Pakete und Statistiken. Dazu gibt es die [Vorlage](pakete/vorlage.txt), das [Beispielpaket](pakete/englisch-6-beispiel.txt), einen [KI-Prompt](pakete/KI-PROMPT-Lernpaket.md), mit dem eine KI ein gültiges Paket schreibt, und eine [Kurzanleitung als PDF](pakete/Lumara-Kurzanleitung.pdf) zum Ausdrucken.

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
  - Die Sprache kommt aus `SPIELSPRACHE:` oder, ohne diese Zeile, aus `FACH:`. Das Spiel kann Deutsch, Englisch, Französisch und Spanisch.
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

- **Plan 5b**, endlos weiterspielen:
  - Revanchen: Besiegte Trainer bieten nach ihrem Satz eine Revanche an. Jede gewonnene Revanche hebt sie eine Stufe höher (bis 5): mehr Energie, weniger Zeit, mehr XP. Die Stufen gehören zum Lernpaket.
  - Das Erinnerungsduell: Morrow am Leuchtturm wiederholt das Endduell, wenn das Paket alle acht Trainer hat und alle mit diesem Paket besiegt sind. Der erste Sieg mit einem Paket zählt als „Endgegner besiegt“.
  - Sternschnuppen: Nach dem Finale liegt auf der Sternenwiese eine gefallene Sternschnuppe; in ihrer Nähe sind seltene Wesen fünfmal so häufig.
  - Der Leuchtturm-Aufstieg: Etage für Etage ein Duell mit Fragen aus allen Themen, Energie nur alle fünf Etagen zurück. Die höchste Etage steht in der Statistik.
  - Spielstand-Format 7 (`tiers` je Paket).
- **Plan 6**, Musik und Ton:
  - Alles wird im Browser erzeugt (Web Audio): zwei Rechteck-Stimmen, eine Dreieck-Stimme und Rauschen, wie bei einem alten Handheld. Keine Audiodateien.
  - Eine eigene Musikschleife für den Titel, jedes der acht Gebiete, die Höhle, wilde Duelle, Trainerduelle, Morrow und den Leuchtturm-Aufstieg; Jingles für Sieg, Niederlage, Level, Entwicklung, Fund, Leuchtstein und Finale.
  - Effekte für Menü, Bestätigen, richtig, falsch, Treffer, Volltreffer, Kärtchen, Tippen, Stein anheben, Übergang und Nebel.
  - Unter Einstellungen → Ton lassen sich Musik und Effekte getrennt ausschalten. Die Musik startet leise und erst nach der ersten Berührung (iOS).
  - Spielstand-Format 8 (`settings.music`, `settings.sfx`).
- **Plan 7**, Französisch und Spanisch:
  - Ist das Lernpaket für Französisch oder Spanisch, läuft das ganze Spiel in dieser Sprache, auf A1: Oberfläche, Duelle, Bewohner, Schilder, Geschichte und Aufträge.
  - Gebiete und Wesen haben eigene, kindgerechte Namen (etwa Baie du Phare, Bosque Susurrante, Coquillou, Espumín). Bewohner und Morrow behalten ihre Namen; alles für die Lehrkraft bleibt Deutsch.
  - Beim Eintippen zählen ¿ und ¡ nicht, « » gilt wie " ".
- **Plan 8**, Abschluss:
  - KI-Prompt für Lernpakete (`pakete/KI-PROMPT-Lernpaket.md`) und eine Anleitung für Lehrkräfte (`anleitung.html`), beide auf der Seite für Lehrkräfte verlinkt und offline verfügbar.
  - Feinschliff: Im Finale spricht das namenlose Wesen als „???“, die Kuppel der Sternwarte sagt, was zu tun ist, die Karte zeigt „Du bist hier“ auch in der Höhle, kürzere Texte auf Französisch und Spanisch.
  - Ton: Musik und Effekte aus lassen den Ton schlafen (Akku), die Probefrage der Lehrkraft bleibt stumm, Tipp-Ton auch mit Bildschirmtastaturen, weitere Jingles.
  - Geprüft im iPad-Quer- und Hochformat mit Touch-Steuerung und offline mit allen Dateien im Zwischenspeicher.
- **1.0.1**, Kurzanleitung:
  - Kurzanleitung für Lehrkräfte als PDF (`pakete/Lumara-Kurzanleitung.pdf`) mit Bildern aus dem Spiel und dem KI-Prompt im Anhang, verlinkt in der Anleitung und auf der Seite für Lehrkräfte. Sie liegt nicht im Zwischenspeicher, damit die iPads der Kinder sie nicht mitladen.
- **1.0.4**, Seite für Lehrkräfte ohne „null“: Unter dem Paketnamen stand nach dem Prüfen das Wort „null“ (ein natives append mit einem leeren Zweig). Ein Test sucht jetzt im ganzen Code nach solchen Aufrufen.
- **1.0.3**, Namensfeld mit Doppeltipp-Schutz: Der Tipp, der Ilvys letzten Satz schließt, landete auf iPads auf „Weiter“ im gerade erschienenen Namensfeld, und das Kind sah „Bitte gib einen Namen ein“, bevor es tippen konnte. Das Namensfeld nimmt jetzt wie Eier und Paket-Bildschirm 350 ms lang keinen Tipp an.
- **1.0.2**, ohne Copyright-Hinweis: Die Hinweise mit Namen sind aus den Seiten, dem README, dem PDF und den Plänen entfernt. Ein Test sorgt dafür, dass keiner zurückkommt.
- **1.1**, Rucksack und Schätze:
  - Der Rucksack klappt direkt im Spiel auf, nur beim Laufen. Er zeigt Futter, Steine, Schlüsselgegenstände und das Schatz-Album mit 24 Schätzen; man kann füttern, Glanzsteine einsetzen und Schätze ansehen. Antippen daneben schließt ihn. Bei „Bewegung reduzieren“ gibt es keine Klappen- und Flug-Animation.
  - Schätze findet man auf drei Wegen: an Glitzerstellen im Gras (etwa jedes dritte Mal statt eines Steins), unter Zetteln, die sonst nichts bringen (etwa jeder achte), und als seltene Beute wilder Wesen (jedes zehnte Mal). Die Zahlen stehen in `js/config.js` unter `treasures`.
  - Alle Schätze haben in allen vier Spielsprachen eigene, kindgerechte Namen und ein selbst gezeichnetes Bild. Alte Spielstände laden weiter: Format 9 ergänzt das Album leer, es zeigt 0 von 24.
- **1.2**, Freunde:
  - Befreunden: Nach einem gewonnenen Duell gegen ein wildes Wesen kann das Kind es mit dem Vertrauensring befreunden: 5 Fragen, 3 richtige. Die Antworten zählen in der Statistik wie bei den Zetteln.
  - Die Freunde leben im Garten am Leuchtturm, und ein Begleiter läuft hinter dem Kind her (Menü → Freunde).
  - 40 Verstecke öffnet man mit dem Geschenk des Begleiters: eine Frage aus dem Zettel-Pool oder eines von 8 neuen Wesen (das Buch hat jetzt 41 Plätze). Dazu gibt es je Gebiet eine kleine Spielaufgabe.
  - 1.2.1: Feinschliff. Hohes Gras verdeckt auch die Füße von Begleiter und Gartenfreunden, goldene Zeichenbäume im Wald, klarere Bilder für fünf neue Wesen und das Aufwind-Versteck, der Dünenkamm ist ein Strandgut-Versteck, kleine Text- und Menükorrekturen.
- **1.3**, Aushang und Wünsche:
  - Am Leuchtturm hängt jeden Tag ein Aushang mit drei Aufgaben, die zu dem passen, was das Kind jetzt kann. Es gibt Belohnungen und einen Tagesbonus. Der Aushang steht auch im Tagebuch.
  - Je Gebiet wünscht sich ein Bewohner einen Schatz. Das Kind tauscht ihn gegen eine Belohnung, am nächsten Tag gibt es einen neuen Wunsch. Die Wünsche stehen im Tagebuch und auf der Rucksack-Karte.
  - Spielstand-Format 11 mit einer Ereignisliste.

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
- Bauplan 5b: [docs/superpowers/plans/2026-11-04-lumara-plan-5b-revanchen-aufstieg.md](docs/superpowers/plans/2026-11-04-lumara-plan-5b-revanchen-aufstieg.md)
- Bauplan 6: [docs/superpowers/plans/2026-11-04-lumara-plan-6-musik-ton.md](docs/superpowers/plans/2026-11-04-lumara-plan-6-musik-ton.md)
- Bauplan 7: [docs/superpowers/plans/2026-11-04-lumara-plan-7-sprachen.md](docs/superpowers/plans/2026-11-04-lumara-plan-7-sprachen.md)
- Bauplan 8: [docs/superpowers/plans/2026-11-04-lumara-plan-8-abschluss.md](docs/superpowers/plans/2026-11-04-lumara-plan-8-abschluss.md)
- Design 1.1: [docs/superpowers/specs/2026-11-21-lumara-freunde-und-verstecke-design.md](docs/superpowers/specs/2026-11-21-lumara-freunde-und-verstecke-design.md)
- Bauplan 1.1, Rucksack und Schätze: [docs/superpowers/plans/2026-11-21-lumara-1.1-rucksack-schaetze.md](docs/superpowers/plans/2026-11-21-lumara-1.1-rucksack-schaetze.md)
- Bauplan 1.2a, Freunde, Begleiter, Garten: [docs/superpowers/plans/2026-11-21-lumara-1.2a-freunde-begleiter-garten.md](docs/superpowers/plans/2026-11-21-lumara-1.2a-freunde-begleiter-garten.md)
- Bauplan 1.2b, Verstecke, Wesen, Aufgaben: [docs/superpowers/plans/2026-11-21-lumara-1.2b-verstecke-wesen-aufgaben.md](docs/superpowers/plans/2026-11-21-lumara-1.2b-verstecke-wesen-aufgaben.md)
- Bauplan 1.3, Aushang und Wünsche: [docs/superpowers/plans/2026-11-22-lumara-1.3-aushang-wuensche.md](docs/superpowers/plans/2026-11-22-lumara-1.3-aushang-wuensche.md)
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
| `/?dev&gebiet=garten` | gleich im Garten am Leuchtturm (mit `&freunde=12` mit Freunden) |
| `/?dev&gebiet=moor` | direkt am Eingang eines Gebiets (`wald`, `moor`, `duenen`, `klippen`, `ruinen`, `see`, `wiese`), alle Leuchtsteine davor leuchten |
| `/?duell=wild` | direkt ein Duell gegen ein wildes Wesen, danach das nächste |
| `/?duell=trainer` | direkt das Duell gegen die Hüterin der Bucht |
| `/?duell=wild&glanz` | jedes wilde Wesen als Glanzform |
| `&freunde=n` | zu `?dev`: die ersten n befreundbaren Wesen sind Freunde, das erste läuft als Begleiter mit (mit `&gebiet=garten` gleich im Garten) |
| `&leckerli=n` | zu `?dev`: n Leckerli im Rucksack, zum Befreunden |
| `&level=40` | zu `?dev` oder `?duell`: das Wesen gleich auf diesem Level (Stufen und Entwicklung testen) |
| `/?galerie` | alle Wesen in Originalgröße, A blättert weiter |
| `/?galerie&klein` | die Galerie mit den kleinen Bildern (Minis) der Wesen |
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
3. Hat sich der KI-Prompt oder etwas in der Kurzanleitung Beschriebenes geändert: das PDF mit `python3 tools/kurzanleitung/bauen.py` neu bauen (braucht reportlab und die macOS-Schriften Arial und Menlo).
4. `node --test` laufen lassen.
5. Hochladen nach `digitalteaching/lumara`, Zweig `main`. GitHub Pages veröffentlicht von dort.

Kinder bekommen die neue Fassung beim nächsten Öffnen. Das laufende Spiel lädt nie mitten drin neu.

**Spielstände müssen ladbar bleiben.** Festgeschrieben sind:

- Format 1 mit `tests/fixtures/spielstand-v1.txt`
- Format 2 (seit Spielfassung 0.3.0) mit `tests/fixtures/spielstand-v2.txt`
- Format 3 (seit Spielfassung 0.4.0, mit Zeitsteinen im Rucksack) mit `tests/fixtures/spielstand-v3.txt`
- Format 9 (seit 1.1.0, Schätze und Album) mit `tests/fixtures/spielstand-v9.txt`
- Format 10 (seit 1.2.0, Freunde, Begleiter, Leckerli, Verstecke, Spielaufgaben) mit `tests/fixtures/spielstand-v10.txt`
- Format 11 (seit 1.3.0, Aushang, Wünsche und Ereignisse) mit `tests/fixtures/spielstand-v11.txt`

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
