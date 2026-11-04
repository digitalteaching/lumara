# Lumara – Das Land unter dem Nebel · Design

Stand: 01.11.2026 · **Von Stefan freigegeben am 01.11.2026.** Nächster Schritt: Bauplan.
Ergänzt am 03.11.2026: Spielsprache (10.6), auf Wunsch von Stefan: „Wenn das Lehrerpack für eine Sprache ist, soll das ganze Spiel in der Sprache sein. Sonst Deutsch.“
Arbeitstitel des Repos: Lernwelt RPG (`classtiles-labs/lernwelt-rpg`)
Grundlage: `docs/2026-10-17-zwischenstand-ideensammlung.md` und die Ideensammlung vom 01.11.2026.

Kennzeichnung: Was die Lehrkraft (Stefan) festgelegt hat, steht ohne Zusatz. Was Claude entschieden hat, ist mit **(Claude)** markiert. Stefan hat ausdrücklich gesagt: „Triff gerne alle Entscheidungen professionell und kreativ selber.“

---

## 1. Worum es geht und warum

Ein Rollenspiel im Stil alter Handheld-Konsolen, mit eigener Welt und eigener Optik. Schülerinnen und Schüler der Sekundarstufe 1 laufen mit ihrer Spielfigur durch eine geheimnisvolle Insel, ziehen ein eigenes Wesen groß und bestehen Duelle, indem sie Fragen aus dem Unterricht beantworten.

Das Besondere: **Das Spiel kennt kein Fach.** Alles Fachliche kommt aus einem **Lernpaket**, einer Textdatei, die die Lehrkraft selbst schreibt und an die Klasse weitergibt. Die Kinder laden diese Datei ins Spiel, danach geht es los. Dasselbe Spiel trägt so Englisch, Mathe, Französisch, Biologie oder Geschichte. Die erste Fassung wird mit einem Beispielpaket für Jahrgang 6 Englisch ausgeliefert.

Warum: Üben soll sich wie Spielen anfühlen. Die Welt muss so reich und geheimnisvoll sein, dass Kinder freiwillig weiterspielen, und jede Spielminute soll aus Fragen bestehen, die die Lehrkraft ausgewählt hat.

**Woran man Erfolg erkennt:**
- Kinder spielen von sich aus weiter, auch zu Hause, und wollen die Welt erkunden.
- Eine Lehrkraft kann in unter einer Stunde ein eigenes Lernpaket schreiben, ohne Programmierkenntnisse.
- Die Lehrkraft sieht per Screenshot, wie viel und wie treffsicher ein Kind geübt hat.

## 2. Ziele, Nicht-Ziele, Anti-Ziele

**Ziele**
- Eine umfangreiche, tiefe, kreative Welt mit 8 Gebieten, einer Höhle, Geschichte, Bewohnern, Aufträgen, Geheimnissen und einem Sammelbuch.
- Duelle, in denen jede Aktion eine Lernfrage ist. Es gibt drei Antwortformen.
- Lernpakete, die jede Lehrkraft für jedes Fach selbst schreiben kann.
- Endloses Weiterspielen nach dem Endgegner.
- Läuft auf Tablet und PC, ohne Anmeldung und ohne Server.

**Nicht-Ziele**
- Keine Duelle zwischen Kindern, kein Mehrspieler, keine Ranglisten.
- Kein Server, keine Konten, keine Cloud-Synchronisation.
- Keine fälschungssichere Notenerfassung. Der Prüfcode ist eine bewusst einfache Hürde, die für Jahrgang 6 reicht.
- Kein Fangen oder Tauschen von Wesen. Jedes Kind hat genau ein eigenes Wesen.
- Kein Editor für Lernpakete im Spiel. Pakete werden als Textdatei bearbeitet.

**Anti-Ziele** (das Spiel wäre gescheitert, auch wenn alles technisch funktioniert)
- Die Welt fühlt sich wie eine Schule oder ein Arbeitsblatt an.
- Fremde Bilder, Schriften, Musik oder Bibliotheken werden eingebunden, Daten verlassen das Gerät, oder es entstehen Lizenzfragen.
- Ein Kind verliert seinen Spielstand, ohne dass es eine Möglichkeit zur Rettung gab.
- Kinder kommen durch Raten schneller voran als durch Wissen.
- Die Optik erinnert an ein bestimmtes bestehendes Spiel, statt eigenständig zu wirken.

## 3. Rahmenbedingungen

- Sekundarstufe 1. Die erste Fassung ist für Jahrgang 6 Englisch.
- Das Spiel läuft auf **Tablet (vor allem iPad mit Safari) und PC**. Jedes Kind hat ein eigenes Gerät.
- Es ist **reines HTML, CSS und JavaScript** und wird per Link über **GitHub Pages** verteilt (Repo `classtiles-labs/lernwelt-rpg`). *Vermutung (Claude):* Die Adresse lautet wie beim Schwesterprojekt `https://classtiles.de/lernwelt-rpg/`.
- Es gibt keinen Server und keine Anmeldung. Der Spielstand liegt im Browser auf dem Gerät und ist verschleiert.
- **Musik und Ton** sind nur erlaubt, wenn sie frei sind und nichts hochgeladen werden muss. Umsetzung: Alles wird im Browser erzeugt, siehe Abschnitt 14.
- **Tablet-Steuerung:** Ein Steuerkreuz unten rechts auf dem Bildschirm.
- Die Inhalte kommen als **Lernpaket-Datei**. Die Lehrkraft gibt sie weiter, die Kinder laden sie ins Spiel, danach startet das Spiel.
- **(Claude)** Es gelten dieselben Grundsätze wie beim Schwesterprojekt `Lernspiele/`: keine externen Bibliotheken, keine Web-Fonts, keine fremden Bilder, Sounds oder Tracker. Es gibt keine Netzwerkanfragen außer zum Laden der eigenen Dateien, und alles wird per Code gezeichnet. Das ist auch für den Datenschutz an Schulen wichtig.

---

## 4. Erste Spielstunde im Überblick

1. Das Kind öffnet den Link. Es erscheint ein animierter Titelbildschirm: der Leuchtturm im Nebel, das Meer, ein Lichtstrahl.
2. Auf einem iPad in Safari ohne vorhandenen Spielstand erscheint zuerst die kurze Anleitung „Zum Home-Bildschirm hinzufügen“ (11). Ist noch kein Lernpaket gespeichert, sieht das Kind den großen Knopf **„Lernpaket laden“** und wählt die Datei von der Lehrkraft aus. **(Claude)** Darunter steht klein der Link „Ohne eigenes Paket ausprobieren“, der das Beispielpaket Englisch 6 lädt.
3. Ein kurzes Intro, das man überspringen kann: Ein Boot legt in der Leuchtturmbucht an. Die Leuchtturmwärterin **Ilvy** erzählt in drei bis vier Textfenstern vom Nebel des Vergessens.
4. Das Kind gibt seinen Namen ein (höchstens 12 Zeichen).
5. Ilvy zeigt fünf leuchtende Eier, die am Strand angespült wurden. Das Kind wählt sein Wesen. Zu jedem gibt es eine kurze Beschreibung und seine Besonderheit im Duell. **(Claude)** Danach kann das Kind seinem Wesen einen Spitznamen geben. Das ist freiwillig, sonst heißt es wie seine Art.
6. Das Kind erkundet das Dorf und spricht mit Bewohnern. Im hohen Gras trifft es wilde Wesen, unter Steinen findet es Zettel. Schließlich fordert es die Hüterin der Bucht heraus, den ersten Trainer.
7. Nach dem Sieg leuchtet der erste Leuchtstein auf, der Nebel weicht zurück und der Flüsterwald wird sichtbar.

---

## 5. Welt und Geschichte

### 5.1 Grundidee: Nebel und Leuchtsteine

Die Insel **Lumara** (Name: Claude) liegt unter einem **Nebel des Vergessens**. Früher bewahrten acht **Leuchtsteine** das Wissen der Insel und hielten den Nebel fern. Inzwischen sind sie erloschen. Jeder Stein wird von einer Hüterin oder einem Hüter bewacht, das sind die 8 Trainer. Wer einen Trainer im Duell besiegt, bringt seinen Stein zum Leuchten. Dann weicht der Nebel zurück und das nächste Gebiet wird frei.

- Überall, wo kein Nebel ist, kann man frei herumlaufen. So fühlt sich die Welt offen an, und der Weg bleibt trotzdem geradlinig.
- Die Idee passt zu jedem Fach, denn Wissen vertreibt den Nebel.
- Nebel ist eine unpassierbare Grenze mit einer animierten, halbtransparenten Nebelschicht darüber. Wird ein Stein entzündet, gibt es eine kurze Szene von 2 bis 3 Sekunden: Der Stein flammt auf, der Nebel zieht sich zurück und der Weg öffnet sich.
- Im Leuchtturm der Startbucht erscheint für jeden entzündeten Stein ein farbiger Lichtring. So ist der Fortschritt von überall in der Bucht zu sehen.
- **(Claude) Leuchtstein-Reisen:** An jedem entzündeten Leuchtstein kann man zu jedem anderen entzündeten Stein reisen. Leuchtsteine füllen außerdem die Energie des Wesens ganz auf. Nach einer Niederlage wacht man am zuletzt besuchten Leuchtstein auf, oder am Leuchtturm, falls man noch keinen besucht hat.

### 5.2 Aufbau der Insel

Die Gebiete liegen im Ring um einen Berg in der Mitte. In diesem Berg ist die Höhle.

```
                 5 Windklippen
   4 Spiegeldünen               6 Uhrwerkruinen
                    ( Berg mit
   3 Pilzmoor         Höhle )   7 Nordlichtsee
   2 Flüsterwald                8 Sternenwiese
                1 Leuchtturmbucht
```

Die Sternenwiese ist eine Hochebene über der Bucht. Nach dem Sieg über Trainer 8 öffnet sich ein Pfad hinunter zur Bucht, damit schließt sich der Ring. Der Eingang zur Höhle liegt am Fuß des Bergs und ist von der Sternenwiese aus erreichbar. Das Tor hat acht Fassungen, die mit den Leuchtsteinen aufleuchten.

### 5.3 Die Gebiete

| # | Gebiet | Stimmung und Besonderheit | Trainerfigur (Aussehen) | Teilchen und Wetter |
|---|---|---|---|---|
| 1 | **Leuchtturmbucht** | Fischerdorf, Strand, Steg, Leuchtturm, Ilvys Haus. Startort. | junge Fischerin mit Netz und Kopftuch | Möwen, Gischt |
| 2 | **Flüsterwald** | Uralte Bäume mit Gesichtern in der Rinde. Wer an ihnen vorbeigeht, hört sie leise sprechen (Hinweise als Text). | Waldläufer mit Kapuze und Moosumhang | Glühwürmchen, fallende Blätter |
| 3 | **Pilzmoor** | Leuchtende Riesenpilze, Holzstege über dunklem Wasser, Irrlichter. | Pilzsammlerin mit großem Korb und Pilzhut | Sporen, aufsteigende Blasen |
| 4 | **Spiegeldünen** | Wüste aus Glassand, Luftspiegelungen, die Wege vortäuschen, und halb vergrabene Glasstatuen. | Karawanenführer mit Turban und Spiegel | Sandwehen, Glitzern |
| 5 | **Windklippen** | Hängebrücken zwischen Felsnadeln, Wolken unter einem, Windräder. | Drachenfliegerin mit Schutzbrille | Windstreifen, ziehende Wolken |
| 6 | **Uhrwerkruinen** | Eine versunkene Stadt mit Kanälen, deren Zahnräder sich noch drehen. | Erfinder mit Lupenbrille und Werkzeuggürtel | Funken, Dampfwölkchen |
| 7 | **Nordlichtsee** | Ein gefrorener See unter Polarlicht, Eisschollen und ein Fischerzelt. | Eisfischerin im Pelzmantel | Schnee, schimmerndes Nordlicht |
| 8 | **Sternenwiese** | Eine Hochebene, auf der immer Nacht ist und Sterne ins Gras fallen. | Sternendeuterin mit Fernrohr | fallende Sterne, Glimmen |
| – | **Die Höhle** | Drei Ebenen tief im Berg, Kristalle, Echos alter Stimmen. Endgegner ganz unten. | – | Tropfen, Kristallfunkeln |

Jedes Gebiet hat eine eigene Farbstimmung, eigene Musik, 2 bis 4 Bewohner, einen Auftrag, 3 Arten wilder Wesen, Beerensträucher, mehrere Zettelsteine und einen Leuchtstein mit seinem Trainer. Größe als Richtwert: etwa 40 × 30 Felder, dazu Innenräume.

Die Lehrkraft gibt den Trainern im Lernpaket Namen und Dialoge. Das Aussehen der Figuren ist fest. Die Vorlage beschreibt deshalb jede Figur, damit passende Namen gewählt werden können.

### 5.4 Die Geschichte

**(Claude)** Kindgerecht, ohne Gewalt. Wesen werden im Duell „erschöpft“, nicht verletzt.

- Früher sammelten die Menschen von Lumara alles, was sie lernten, in den acht Leuchtsteinen.
- Tief im Berg lebte ein kleines Wesen namens **Morrow**. Es sammelte die Echos vergessener Wörter. Niemand besuchte es, und mit der Zeit vergaßen alle, dass es Morrow überhaupt gab.
- Aus Einsamkeit begann Morrow, alles Vergessene zu sammeln. Je mehr es sammelte, desto mehr Nebel atmete es aus. Die Steine erloschen, und die Hüterinnen und Hüter zogen sich in ihre Gebiete zurück.
- Am Ende steht das Kind Morrow in der Höhle gegenüber. Morrow wird nicht zerstört. Das Kind besiegt es im Duell und spricht danach seinen Namen aus: Morrow wird **erinnert**. Der Nebel löst sich ganz auf, und Morrow wird ein Freund, der am Leuchtturm wohnt.
- Die Geschichte erfährt man in Stücken (5.5). Das letzte Stück verrät Morrows Namen. Hat ein Kind es nicht gefunden, nennt Ilvy den Namen vor dem Endkampf.

### 5.5 Geschichte in Stücken

- Es gibt **30 Geschichtsstücke**: 3 pro Gebiet, insgesamt 24 auf Zetteln unter Steinen, dazu je eines an den 6 geheimen Orten.
- Die Zettelstücke kommen pro Gebiet in fester Reihenfolge. Das nächste Stück erscheint, sobald man im Gebiet einen Zettel löst.
- Alle gefundenen Stücke stehen im **Tagebuch**.
- Die Geschichtstexte gehören zum Spiel und kommen nicht aus dem Lernpaket. Sie erscheinen in der Spielsprache (10.6).

### 5.6 Bewohner und Aufträge

- **(Claude)** In jedem Gebiet leben 2 bis 4 Bewohner. Sie geben Hinweise, kommentieren den Fortschritt und reagieren darauf, ob der Stein schon leuchtet.
- In jedem Gebiet gibt es **einen Auftrag**, insgesamt also 8. Arten von Aufträgen: etwas Verlorenes finden, etwas zu jemandem in einem anderen Gebiet bringen oder jemanden suchen. Der Auftrag kann erst nach dem Gebietstrainer abgeschlossen werden, angenommen werden kann er vorher.
- Belohnung: 50 XP und ein Gegenstand (Tabelle unten).
- Bewohnertexte gehören zum Spiel und erscheinen in der Spielsprache (10.6).

### 5.7 Geheime Orte und Schlüsselgegenstände

Abseits des Wegs liegen sechs geheime Orte. Man erreicht sie erst mit einem Schlüsselgegenstand, den man als Auftragsbelohnung bekommt, oft in einem anderen Gebiet. Das sorgt dafür, dass man in frühere Gebiete zurückkehrt. Jeder geheime Ort enthält eine seltene Wesenart, ein Geschichtsstück und einen seltenen Stein.

| Auftrag in | Belohnung | öffnet |
|---|---|---|
| 1 Leuchtturmbucht | Futterbeutel (mehr Platz für Futter) | – |
| 2 Flüsterwald | Lebensstein | – |
| 3 Pilzmoor | **Laterne** | Hohle Eiche im Flüsterwald (dunkler Gang) |
| 4 Spiegeldünen | 3 Glanzsteine | – |
| 5 Windklippen | **Kletterhaken** | Glasturm in den Spiegeldünen |
| 6 Uhrwerkruinen | **Nussschale** (kleines Boot) | Gezeiteninsel vor der Bucht und Irrlichtinsel im Pilzmoor |
| 7 Nordlichtsee | **Eiskufen** | Eisgrotte am Nordlichtsee (Rätsel: über Eis gleiten) |
| 8 Sternenwiese | **Sternkarte** | Sternwarte in den Uhrwerkruinen (Rätsel: Zahnräder drehen) |

Die Rätsel sind kurz und ohne Lernfragen. Sie sind eine Pause vom Üben.

---

## 6. Wesen

### 6.1 Die fünf Startwesen

Jedes Wesen entwickelt sich mehrfach und wird dabei größer und eindrucksvoller: Stufe 1 ab Level 1, Stufe 2 ab Level 15, Stufe 3 ab Level 35, Stufe 4 ab Level 60.

**(Claude)** Namen, Aussehen und Eigenschaften:

| Wesen | Aussehen | Stufen 1 → 2 → 3 → 4 | Besonderheit im Duell |
|---|---|---|---|
| **Funki** | kleine Leuchtmotte mit glimmendem Hinterleib | Funki → Funkelflug → Laternenfalter → Nordlichtfalter | *Erleuchtung:* einmal pro Duell eine kostenlose Hilfe wie beim Weitblickstein (8.2) |
| **Kiesel** | runder Steinkobold mit Moosbüscheln | Kiesel → Findling → Felsenwächter → Bergherz | *Standfest:* +1 Energie |
| **Nixi** | Axolotl mit Flossenkamm, der Wasserblasen macht | Nixi → Quellnix → Strudelnix → Gezeitennix | *Quelle:* nach 3 richtigen Antworten in Folge +1 Energie |
| **Flausch** | Wolkeneule mit Federn wie Watte | Flausch → Wolkenkauz → Sturmeule → Himmelsuhu | *Rückenwind:* einmal pro Duell eine Frage gegen eine andere tauschen, ohne Nachteil. Bei Zeitdruck zusätzlich 25 % mehr Zeit. |
| **Pieks** | Samenigel mit Blattstacheln | Pieks → Dornigel → Blütenigel → Waldhüter | *Grüner Daumen:* Beeren geben +4 statt +2 Energie. Nach jedem Sieg findet Pieks mit 50 % Wahrscheinlichkeit eine Beere. |

Die Besonderheiten sind etwa gleich nützlich, und zwar in jedem Duell und in jedem Paket, auch ohne Zeitdruck. Keine davon belohnt Raten. Das Wesen läuft in der Welt nicht hinter der Figur her, es erscheint nur im Duell und im Menü.

### 6.2 Energie und Fähigkeiten

- **Energie** ist die Energieleiste im Duell, angezeigt als Leiste mit Abschnitten.
- Energie des eigenen Wesens = 4 + Stufenbonus (Stufe 1: 0, Stufe 2: +1, Stufe 3: +2, Stufe 4: +3) + Lebenssteine (höchstens +3) + Kiesels Bonus (+1). Das ergibt 4 bis 11.
- Energie bleibt zwischen den Duellen erhalten. Aufgefüllt wird sie mit Futter oder an einem Leuchtstein.
- **(Claude) Fähigkeiten durch Entwicklung** (gelten für alle Wesen):
  - Stufe 2, *Zweite Chance:* Einmal pro Duell darf man nach einer falschen Antwort noch einmal antworten, ohne Energie zu verlieren.
  - Stufe 3, *Schwung:* Ein Volltreffer kommt schon nach 2 statt nach 3 richtigen Antworten in Folge.
  - Stufe 4, *Schild:* Die erste falsche Antwort im Duell kostet keine Energie.

### 6.3 Level und Erfahrung (XP)

- Die Wesen können bis **Level 100** steigen, und jedes Level braucht mehr XP als das vorige.
- **(Claude)** XP von Level n zu Level n+1: `10 + 5·n`. Daraus ergeben sich insgesamt etwa 665 XP bis Level 15, 3.315 bis Level 35, 9.440 bis Level 60 und 25.740 bis Level 100.
- Nur ein **Sieg** bringt XP. Eine Niederlage bringt nichts, man kann den Trainer aber unbegrenzt erneut herausfordern.

| Quelle | XP |
|---|---|
| Trainer k (1–8), erster Sieg mit dem aktuellen Paket | 40 + 20·k (60 bis 200) |
| Endgegner, erster Sieg mit dem aktuellen Paket | 500 |
| Erinnerungsduell gegen Morrow (9) auf Stufe t | 500 × 0,5 × (1 + 0,25·t) |
| Revanche auf Stufe t (1–5) | Grundwert × (1 + 0,25·t) |
| Wildes Wesen in Gebiet g (1–8) | 8 + 2·g |
| Zettel gelöst | 15 |
| Auftrag erledigt | 50 |
| Leuchtturm-Aufstieg, Etage e | 20 + 2·e |
| Bonus „Makellos“ (Duell ohne Fehler) | +25 % |
| Glanzstein aktiv | ×2 für den nächsten Sieg |

Ziel dieser Werte: Die erste Entwicklung kommt etwa bei Trainer 3 oder 4. Beim Endgegner liegt das Wesen um Level 30, Stufe 3 folgt kurz danach. Stufe 4 und Level 100 sind Langzeitziele für das ganze Schuljahr. Alle Zahlen stehen gesammelt in einer Konfigurationsdatei und lassen sich nachjustieren.

- Level-Aufstieg und Entwicklung bekommen je eine kurze Animation mit eigenem Jingle. Die Entwicklung ist ein großer Moment: Das Wesen leuchtet auf, verwandelt sich, und sein neuer Name erscheint.

### 6.4 Wilde Wesen und Wesen-Buch

- **(Claude)** Pro Gebiet gibt es 3 wilde Arten (2 häufige, 1 seltene). Dazu kommen 2 Arten in der Höhle, an jedem geheimen Ort 1 seltene Art und Morrow. Zusammen sind das **33 Einträge** im **Wesen-Buch**.
- Ein Eintrag wird bei der ersten Begegnung als „gesehen“ angelegt, mit Bild als Silhouette und Fundort. Nach dem ersten Sieg ist er „besiegt“, dann sind Bild in Farbe und eine kurze Beschreibung zu sehen.
- **(Claude) Glanzform:** Mit einer Wahrscheinlichkeit von 1 zu 64 erscheint ein wildes Wesen in einer seltenen Farbvariante. Sie wird im Buch mit einem Stern markiert.
- **Begegnungen im Gras:** Durchschnittlich alle 15 Schritte im hohen Gras, zufällig zwischen 8 und 25 Schritten, nie direkt hintereinander. Bevor es losgeht, kann man fliehen, und auch während des Duells ist Flucht jederzeit möglich (B). Wer flieht, bekommt keine XP und erleidet keinen Nachteil.
- Wilde Wesen tragen das Aussehen ihres Gebiets. Die Trainer kämpfen mit einer weiterentwickelten Form einer Art aus ihrem Gebiet.

---

## 7. Duelle

### 7.1 Ablauf

1. **Trainer:** Sieht der Trainer das Kind, erscheint ein Ausrufezeichen und er kommt näher. Man kann ihn auch selbst ansprechen. Dann folgt ein kurzer Dialog in der Sprache des Pakets (`HALLO`-Zeilen), danach eine Übergangsanimation.
   **Wild:** Kurze Übergangsanimation, dann „Ein wildes … taucht auf!“
2. **Arena:** **(Claude)** Beide Wesen stehen sich seitlich gegenüber, das eigene links, der Gegner rechts, vor einem Hintergrund, der zum Gebiet passt. Über jedem Wesen stehen Name, angezeigtes Level und Energieleiste. Dazu kommen eine Anzeige für richtige Antworten in Folge und, falls aktiv, ein Zeitbalken.
3. **Frage:** Unter der Arena erscheint die Frage mit der passenden Antwortform (7.2).
4. **Rückmeldung:**
   - *Richtig:* Grüner Haken, Ton, das eigene Wesen greift an, und der Gegner verliert 1 Energie. Ein Volltreffer kostet 2.
   - *Falsch:* Rotes Kreuz, Ton, und die richtige Antwort wird gezeigt, bis man tippt, mindestens 1,5 Sekunden. Dann greift der Gegner an, und das eigene Wesen verliert 1 Energie.
   - *Zeit abgelaufen:* zählt als falsch.
   - Rückmeldungen nutzen immer Symbol und Farbe zusammen, damit sie auch bei Farbschwäche erkennbar sind.
5. **Volltreffer:** Ein Zähler für richtige Antworten in Folge springt nur bei einer falschen Antwort oder bei abgelaufener Zeit auf 0 zurück. Steht er auf 3, 6, 9 usw., richtet die Antwort doppelten Schaden an. Ab Stufe 3 gilt das schon bei 2, 4, 6 usw. Nixis *Quelle* hängt am selben Zähler und greift bei 3, 6, 9 usw. Dadurch kommen sich die beiden Regeln nicht in die Quere.
6. **Ende:**
   - *Sieg:* `SIEG`-Zeile des Trainers, dann die XP-Anzeige und gegebenenfalls Level-Aufstieg und Entwicklung. Beim ersten Sieg über einen Trainer folgt die Leuchtstein-Szene.
   - *Niederlage:* `NIEDERLAGE`-Zeile, dann wacht man am letzten Leuchtstein mit voller Energie auf. Es gibt keinen weiteren Nachteil.
   - *Aufgeben:* Im Trainerduell fragt B nach „Aufgeben?“. Aufgeben zählt als Niederlage.

### 7.2 Die drei Antwortformen

- **A, Auswahl aus 4 Antworten:** vier Knöpfe in zwei Reihen und zwei Spalten, die Reihenfolge ist zufällig. Am PC gehen auch die Tasten 1 bis 4.
- **B, Antwort selbst eintippen:** Ein Eingabefeld mit Knopf „Prüfen“, Enter schickt ab. Das Feld hat **Autokorrektur, automatische Großschreibung, Vorschläge und Rechtschreibprüfung ausgeschaltet**. Sonst verfälscht das iPad die Antworten. Wenn die Bildschirmtastatur aufgeht, bleiben Frage und Feld sichtbar.
- **C, Satz aus Wortkärtchen bauen:** Die Kärtchen liegen gemischt unten. Ein Tipp legt eines in die Satzzeile, ein weiterer Tipp auf ein gelegtes Kärtchen legt es zurück. Dann folgt der Knopf „Prüfen“.

Die Formen wechseln sich **zufällig** ab. **(Claude)** Regel: Für jede Frage wählt das Spiel zufällig eine Form aus denen, die die Frage erlaubt (10.2). Gibt es Alternativen, kommt dieselbe Form nicht dreimal hintereinander.

Die Optik der Antwortformen folgt dem Entwurf `docs/entwuerfe/duell-antwortformen.html`: cremefarbene Textkästen mit braunem Rahmen auf dunklem Blau.

### 7.3 Wie Antworten geprüft werden

**Eintippen (B):**
- Leerzeichen am Anfang und Ende entfernen, mehrere Leerzeichen zu einem zusammenfassen.
- Groß- und Kleinschreibung ignorieren.
- Apostrophe und Anführungszeichen vereinheitlichen (’ ‘ ` → ').
- Satzzeichen am Ende ignorieren (. ! ?).
- Ist die richtige Antwort eine Zahl, sind Komma und Punkt gleichwertig (3,5 = 3.5).
- Sonst muss die Antwort genau stimmen, denn Rechtschreibung zählt. Die Lehrkraft kann Alternativen angeben (`AUCH RICHTIG`).
- **(Claude) „Fast richtig“:** Weicht die Antwort nur um einen Buchstaben ab, zählt sie zwar als falsch, die Meldung lautet aber „Fast! Achte auf die Schreibweise.“ zusammen mit der richtigen Antwort.

**Satzbau (C):** Die Folge der gelegten Kärtchen muss genau dem `SATZ` oder einer seiner Alternativen entsprechen. Kärtchen behalten ihre Schreibung, Satzzeichen hängen am Wort davor.

**Auswahl (A):** Der richtige Knopf zählt.

### 7.4 Schwierigkeit

Die Trainer werden auf drei Wegen unterschiedlich schwer: durch mehr Energie beim Gegner, durch Zeitdruck und durch die Fragen, die die Lehrkraft im Paket für das jeweilige Thema schreibt.

| Gegner | Energie Gegner | Zeit pro Frage (Paketeinstellung `normal`) | angezeigtes Level |
|---|---|---|---|
| Trainer 1 Bucht | 5 | ohne Zeitdruck | 7 |
| Trainer 2 Wald | 6 | ohne Zeitdruck | 12 |
| Trainer 3 Moor | 7 | ohne Zeitdruck | 17 |
| Trainer 4 Dünen | 8 | 40 s | 22 |
| Trainer 5 Klippen | 9 | 35 s | 27 |
| Trainer 6 Ruinen | 10 | 30 s | 32 |
| Trainer 7 See | 11 | 25 s | 37 |
| Trainer 8 Wiese | 12 | 20 s | 42 |
| Endgegner Morrow | 3 Phasen à 6 | 20 s | 50 |
| Wilde Wesen | Gebiet 1–2: 3 · 3–5: 4 · 6–8 und danach: 5 | ohne Zeitdruck | passend zum Gebiet |

- Fürs Eintippen gibt es 1,5-mal so viel Zeit, für den Satzbau doppelt so viel.
- Mit der Paketeinstellung `ZEITDRUCK: lang` gelten doppelte Zeiten, mit `aus` gibt es nie Zeitdruck.
- **Endgegner:** Morrow hat drei Phasen mit je 6 Energie und ändert in jeder Phase seine Gestalt. Die Fragen kommen gemischt aus allen 8 Themen. Zwischen den Phasen erhält das eigene Wesen keine Energie zurück, man darf aber Futter benutzen.
- Das angezeigte Level ist nur Dekoration. Gerechnet wird mit den Werten in der Tabelle.

### 7.5 Revanchen

Besiegte Trainer kann man erneut herausfordern. Sie sind dann stärker.
- **(Claude)** Jede Revanche, die man gewinnt, hebt den Trainer eine Stufe höher, bis höchstens Stufe 5. Auf Stufe t hat der Gegner 2·t mehr Energie als in 7.4.
- Zeit pro Frage auf Stufe t: Grundzeit × 0,9^t, aber nie unter 10 Sekunden. Grundzeit ist die Zeit des Trainers aus 7.4. Trainer 1 bis 3 haben dort keinen Zeitdruck, für sie gilt in Revanchen eine Grundzeit von 40 s. Eine Revanche ist also nie leichter als das Duell davor.
- Die XP steigen wie in der Tabelle in 6.3.
- Die Revanche-Stufen werden pro Lernpaket gespeichert (10.4).

### 7.6 Futter und Steine im Duell

- **Futter:** Mit dem Knopf „Füttern“ isst das Wesen eine Beere, statt eine Frage zu beantworten. Das geht höchstens zweimal pro Duell. In diesem Zug verliert niemand Energie.
- **Weitblickstein und Zeitstein** werden mit einem Knopf neben der Frage eingesetzt (8.2).

### 7.7 Welche Frage kommt

- Bei Trainern kommen die Fragen aus dem Thema dieses Trainers.
- Bei wilden Wesen kommen sie aus den Themen der Trainer, die man mit dem aktuellen Paket schon besiegt hat, plus dem Thema des nächsten Trainers. Vor dem ersten Sieg kommen sie nur aus Thema 1.
- Beim Endgegner und im Leuchtturm-Aufstieg kommen die Fragen aus allen Themen.
- Zettel nehmen Fragen aus dem Abschnitt `ZETTEL` des Pakets. Fehlt dieser Abschnitt, nehmen sie Fragen wie bei wilden Wesen.
- **(Claude) Fehler kommen wieder:** Die Fragen werden gewichtet zufällig gezogen. Eine zuletzt falsch beantwortete Frage hat Gewicht 3, eine noch nie gestellte Gewicht 2 und eine normale Gewicht 1. Wurde eine Frage zweimal in Folge richtig beantwortet, sinkt ihr Gewicht auf 0,5. Innerhalb eines Duells wiederholt sich keine Frage, bis das Thema aufgebraucht ist.

---

## 8. Gegenstände

### 8.1 Futter

Futter sammelt man auf und füttert das Wesen damit. Es füllt die Energie auf, auch zwischen den Duellen.

- **(Claude) Beere:** +2 Energie. Sie wächst an Sträuchern, die nach 5 Minuten echter Spielzeit nachwachsen. Wilde Wesen lassen manchmal eine fallen.
- **Sternfrucht:** füllt die Energie ganz auf. Sie ist selten und kommt aus Zetteln, Aufträgen und geheimen Orten.
- Der Rucksack hat Platz für 10 Futter, mit dem Futterbeutel für 20.

### 8.2 Seltene Steine

Seltene Steine findet man im hohen Gras. Sie machen das Wesen stärker.

- **(Claude)** Im Gras glitzern Fundstellen, die man mit A aufhebt. Außerdem kann bei jedem Schritt im Gras mit einer Chance von 1 zu 150 ein Stein gefunden werden.

| Stein | Wirkung | Art |
|---|---|---|
| **Lebensstein** | +1 Energie dauerhaft, höchstens 3 Stück wirken | dauerhaft |
| **Weitblickstein** | Joker für eine Frage. Bei der Auswahl streicht er zwei falsche Antworten, beim Eintippen zeigt er den ersten Buchstaben, beim Satzbau legt er das erste Kärtchen. | verbraucht sich |
| **Zeitstein** | hält den Zeitbalken für eine Frage an | verbraucht sich |
| **Glanzstein** | doppelte XP beim nächsten Sieg | verbraucht sich |

### 8.3 Zettel unter Steinen

- Steine mit einer Markierung kann man anheben. Darunter liegt ein Zettel mit einer kleinen Aufgabe in einer der drei Antwortformen.
- Ist die Aufgabe gelöst, gibt es 15 XP, mit 50 % Wahrscheinlichkeit Futter oder einen Stein und, solange noch welche übrig sind, das nächste Geschichtsstück des Gebiets.
- Ist die Antwort falsch, bekommt man nichts, und der Zettel bleibt liegen.
- **(Claude)** Gelöste Zettelsteine füllen sich nach 10 Minuten echter Spielzeit wieder mit neuen Zetteln.

### 8.4 Schlüsselgegenstände

Laterne, Kletterhaken, Nussschale, Eiskufen, Sternkarte und Futterbeutel. Sie werden nie verbraucht (5.7).

---

## 9. Endlos weiterspielen

Nach dem Endgegner geht das Spiel endlos weiter:
- Besiegte Trainer kann man erneut herausfordern, sie werden dabei stärker (7.5).
- Im hohen Gras tauchen weiter wilde Wesen auf, und unter Steinen liegen immer wieder neue Zettel.
- **(Claude) Die Welt verändert sich:** Der Nebel ist ganz verschwunden, und die Bewohner sagen neue Sätze. Morrow wohnt am Leuchtturm. Dieser Zustand gehört dem Kind und bleibt auch bei einem Paketwechsel (10.4).
- **(Claude) Erinnerungsduell:** Morrow am Leuchtturm bietet an, das Endduell zu wiederholen: drei Phasen, Fragen aus allen Themen, Werte wie in 7.4 und dazu Revanche-Stufen wie in 7.5. Der erste Sieg mit einem Paket zählt in der Statistik als „Endgegner besiegt“ und bringt 500 XP. Danach gibt es XP wie in 6.3. Das Duell steht nur zur Verfügung, wenn das aktuelle Paket alle 8 Trainer enthält und alle 8 mit diesem Paket besiegt wurden. Auf der Sternenwiese erscheinen Sternschnuppen, an denen man mit erhöhter Chance seltene Wesen trifft.
- **(Claude) Leuchtturm-Aufstieg:** Im Leuchtturm geht es Etage für Etage nach oben, ohne Ende. Jede Etage ist ein Duell gegen ein zufälliges Wesen, die Fragen kommen aus allen Themen. Die Gegner-Energie beträgt 4 + Etage/3, abgerundet und höchstens 15. Zeitdruck gibt es ab Etage 5. Die Energie des eigenen Wesens wird zwischen den Etagen nicht aufgefüllt, nur alle 5 Etagen an einem Leuchtstein. Eine Niederlage beendet den Aufstieg. Die höchste erreichte Etage erscheint in der Statistik.

---

## 10. Das Lernpaket

### 10.1 So kommt das Paket ins Spiel

- Die Lehrkraft hat das Lernpaket als Textdatei und gibt sie wie gewohnt weiter, zum Beispiel über die Schulplattform oder AirDrop.
- Die Kinder öffnen den Link, tippen auf **„Lernpaket laden“** und wählen die Datei aus. Dabei wird ein Dateiauswahlfeld für `.txt` verwendet. Danach startet das Spiel.
- **(Claude)** Das Spiel speichert das Paket auf dem Gerät. In der nächsten Stunde öffnet man nur den Link und spielt weiter.
- **(Claude)** Ein neues Paket lädt man über *Menü → Einstellungen → Lernpaket wechseln*. Vorher erscheint der Hinweis: „Dein Wesen und alles, was du gesammelt hast, bleiben. Die Trainer fordern dich mit den neuen Fragen neu heraus.“

### 10.2 Dateiformat

**(Claude)** Es ist eine einfache Textdatei in UTF-8, die man mit jedem Texteditor bearbeiten kann. Jede Zeile beginnt mit einem Schlüsselwort und einem Doppelpunkt. Abschnitte beginnen mit `=== … ===`. Zeilen, die mit `#` beginnen, sind Kommentare. Leere Zeilen trennen die Fragen.

```
# Zeilen mit # sind Kommentare.

PAKET: Englisch Jahrgang 6 – Beispielpaket
KENNUNG: englisch6-beispiel
FACH: Englisch
ZEITDRUCK: normal

=== TRAINER 1 ===
NAME: Captain Maren
THEMA: Simple present
HALLO: Ahoy, traveller! Nobody passes my beach without a test.
HALLO: Show me what you know about the simple present!
SIEG: Well done! The first light is yours.
NIEDERLAGE: Not yet! Practise a little and come back.
REVANCHE: Back again? This time I am ready!

FRAGE: She ___ (play) tennis every Monday.
ANTWORT: plays
FALSCH: play | playing | played

FRAGE: Wie heißt „Schmetterling“ auf Englisch?
ANTWORT: butterfly

FRAGE: Bilde den Satz: „Er geht nie zu Fuß zur Schule.“
SATZ: He never walks to school.
EXTRA: walk | always

FRAGE: Which word means „oft“?
ANTWORT: often
FALSCH: never | sometimes | always
FORM: auswahl

=== TRAINER 2 ===
…

=== ENDGEGNER ===
HALLO: …
SIEG: …
NIEDERLAGE: …

=== ZETTEL ===
FRAGE: …
ANTWORT: …
```

**Schlüsselwörter im Kopf des Pakets**
- `PAKET:` Titel (Pflicht)
- `KENNUNG:` ein kurzer, frei gewählter Name für dieses Paket, zum Beispiel `englisch6-unit1-4`. Er ist freiwillig, wird aber in der Vorlage empfohlen und dort schon vorausgefüllt. Solange die Kennung gleich bleibt, gilt eine überarbeitete oder erweiterte Datei als dasselbe Paket (10.4).
- `FACH:` Fach (Pflicht)
- `ZEITDRUCK:` `normal`, `lang` oder `aus` (freiwillig, Standard ist `normal`)
- `SPIELSPRACHE:` `deutsch`, `englisch`, `französisch` oder `spanisch` (freiwillig, siehe 10.6)

**Trainerabschnitte** `=== TRAINER 1 ===` bis `=== TRAINER 8 ===`. **(Claude)** Mindestens Trainer 1 ist Pflicht. Die vorhandenen Trainer müssen ohne Lücke ab 1 durchnummeriert sein: 1 bis 3 ist erlaubt, 1, 2 und 4 nicht. So kann eine Lehrkraft während einer Unterrichtsreihe Thema für Thema freigeben (10.4).
- `NAME:` und `THEMA:` sind Pflicht.
- `HALLO:` sind 1 bis 5 Zeilen, die nacheinander als Sprechblasen erscheinen.
- `SIEG:`, `NIEDERLAGE:` und `REVANCHE:` sind freiwillig. Fehlen sie, gibt es neutrale deutsche Standardtexte.
- Danach folgen die Fragen. Pflicht sind mindestens 8, empfohlen 20 oder mehr.

**Endgegner** `=== ENDGEGNER ===` ist freiwillig. Er enthält nur Dialogzeilen (`HALLO`, `SIEG`, `NIEDERLAGE`), die Fragen kommen aus allen Themen. Ohne diesen Abschnitt spricht Morrow feste deutsche Texte.

**Zettel** `=== ZETTEL ===` ist freiwillig und enthält nur Fragen.

**Felder einer Frage**
- `FRAGE:` beginnt eine neue Frage (Pflicht).
- Genau eines der beiden Felder `ANTWORT:` oder `SATZ:` ist Pflicht.
- `AUCH RICHTIG:` sind weitere richtige Antworten oder Sätze, getrennt durch `|`.
- `FALSCH:` sind falsche Antworten für die Auswahl, getrennt durch `|`. Es braucht mindestens 3. Gibt es mehr, werden jedes Mal 3 zufällig gewählt.
- `EXTRA:` sind zusätzliche falsche Wortkärtchen beim Satzbau, getrennt durch `|`.
- `FORM:` ist freiwillig und erzwingt eine Form: `auswahl`, `eintippen` oder `satzbau`.

**Welche Formen eine Frage erlaubt** (ohne `FORM`)
- `ANTWORT` mit mindestens 3 `FALSCH` erlaubt Auswahl oder Eintippen, zufällig.
- `ANTWORT` ohne `FALSCH` erlaubt nur Eintippen.
- `SATZ` erlaubt nur Satzbau.

**Großzügig beim Einlesen:** Schlüsselwörter werden unabhängig von Groß- und Kleinschreibung erkannt, auch mit Leerzeichen vor dem Doppelpunkt. Ein BOM und Windows-Zeilenenden sind in Ordnung, ebenso `ue` statt `Ü` in Schlüsselwörtern. Die Datei darf höchstens 1 MB groß sein.

**Paketkennung:** Das Spiel erkennt ein Paket an `KENNUNG` wieder. Fehlt dieses Feld, nimmt es stattdessen den Inhalt ohne Kommentare und Leerzeilen. Aus diesem Wert berechnet es eine Kurzform aus 4 Zeichen, zum Beispiel `K7PX`. Sie steht in der Statistik und fließt in den Prüfcode ein. Ohne `KENNUNG` wird jede Änderung an der Datei zu einem neuen Paket. Darauf weisen die Vorlage und die Anleitung deutlich hin.

### 10.3 Prüfung beim Laden

- **Fehler** verhindern das Laden. Die Meldung ist verständlich und nennt die Zeilennummer, zum Beispiel „Zeile 48: Bei dieser Frage fehlt ANTWORT oder SATZ.“ oder „Trainer 4 fehlt, aber Trainer 5 ist vorhanden.“ oder „Zeile 112: Für die Auswahl braucht es mindestens 3 falsche Antworten.“
- **Hinweise** erlauben das Laden, zum Beispiel „Trainer 3 hat nur 9 Fragen, empfohlen sind 20.“ oder „Zeile 20: Unbekanntes Schlüsselwort ‚ANTWROT‘.“ oder „Das Paket enthält nur Trainer 1 bis 3. Die Wege ab Gebiet 4 bleiben im Nebel.“ oder „Keine KENNUNG angegeben. Jede Änderung an der Datei setzt die Statistik der Kinder zurück.“
- Den Kindern werden Fehler kurz angezeigt („Diese Datei ist kein gültiges Lernpaket. Frag deine Lehrkraft.“). Die Liste mit den Details ist aufklappbar.

### 10.4 Wechsel des Pakets

**(Claude)** Antwort auf die Frage: „Ein Kind hat sein Wesen mit dem Englisch-Paket auf Level 20 gebracht, drei Leuchtsteine entzündet und lädt jetzt das Mathe-Paket.“

- **Was immer bleibt, weil es dem Kind gehört:** Name, Wesen, Level, XP, Stufe, Gegenstände, Wesen-Buch, Geschichtsstücke, Aufträge, entzündete Leuchtsteine, offene Gebiete, Position und der Zustand nach dem Endgegner (Nebel weg, Morrow als Freund).
- **Was zum Paket gehört:** Statistik (Siege, Trefferquote, Spielzeit, Trefferquote je Thema, höchste Aufstiegs-Etage), welche Trainer mit diesem Paket besiegt wurden, ob der Endgegner mit diesem Paket besiegt wurde, die Revanche-Stufen und die Fragenhistorie für „Fehler kommen wieder“.
- Lädt das Kind ein neues Paket, gelten alle Trainer für dieses Paket als noch nicht besiegt. Trainer, deren Stein schon leuchtet, tragen ein Zeichen für eine neue Herausforderung. Ein Sieg bringt die vollen Erst-Sieg-XP, aber pro Paket und Trainer nur einmal. Die Welt bleibt offen.
- Lädt das Kind ein Paket mit derselben Kennung wieder, kommen dessen Statistik und Trainerstand zurück. Das gilt auch für eine überarbeitete oder erweiterte Fassung derselben Datei. Die Fragenhistorie hängt am Fragetext: Gelöschte Fragen fallen heraus, neue gelten als „noch nie gestellt“.
- **(Claude) Themen nach und nach freigeben:** Enthält ein Paket weniger als 8 Trainer, bleiben die Gebiete ab dem ersten fehlenden Trainer im Nebel. Das gilt auch dann, wenn das Kind diese Steine mit einem anderen Paket schon entzündet hat. Am Nebelrand steht ein Schild: „Dieser Weg öffnet sich, sobald deine Lehrkraft das nächste Thema freigibt.“ Fügt die Lehrkraft später Trainer hinzu und behält die `KENNUNG` bei, lädt das Kind die neue Datei und der Weg öffnet sich, ohne dass etwas verloren geht. Die Höhle und das Erinnerungsduell stehen nur mit einem Paket mit allen 8 Trainern zur Verfügung.
- Derselbe Nebelrand mit Schild markiert auch Gebiete, die in einer frühen Spielfassung noch nicht gebaut sind (17).

### 10.5 Mitgelieferte Dateien

- `pakete/vorlage.txt`: eine leere Vorlage mit Kommentaren. Sie erklärt jedes Schlüsselwort, beschreibt das Aussehen jeder Trainerfigur und enthält eine vorausgefüllte `KENNUNG` mit dem Hinweis, sie beim Überarbeiten nicht zu ändern.
- `pakete/englisch-6-beispiel.txt`: **(Claude)** das Beispielpaket Jahrgang 6 Englisch. Es ist an kein bestimmtes Lehrbuch gebunden, weil das Lehrbuch offen blieb. Pro Trainer gibt es mindestens 20 Fragen in allen drei Formen. Dazu kommen 20 Zettelaufgaben und Trainerdialoge in einfachem Englisch auf Niveau A2.

  | Trainer | Thema |
  |---|---|
  | 1 Bucht | Simple present und Häufigkeitsadverbien |
  | 2 Wald | Present progressive oder simple present |
  | 3 Moor | Wortschatz Essen und Einkaufen, some und any |
  | 4 Dünen | Steigerung von Adjektiven |
  | 5 Klippen | Simple past, regelmäßige Verben |
  | 6 Ruinen | Simple past, unregelmäßige Verben und Zeitangaben |
  | 7 See | Zukunft mit going to und will |
  | 8 Wiese | Modalverben (can, must, mustn't, needn't) und Fragewörter |

- `pakete/KI-PROMPT-Lernpaket.md`: **(Claude)** ein Prompt, mit dem Lehrkräfte von einer KI ein gültiges Lernpaket für ihr Fach, ihren Jahrgang und ihre 8 Themen erstellen lassen können, nach dem Muster des Schwesterprojekts `Lernspiele/PROMPT-Lernspiel-Generator.md`.
- `ANLEITUNG-LEHRKRAEFTE.md` (oder als Seite): eine kurze Anleitung zum Erstellen, Prüfen und Verteilen eines Pakets und zum Prüfen von Statistiken.

### 10.6 Spielsprache (Ergänzung vom 03.11.2026)

Stefan: Ist das Lernpaket für eine Sprache, ist das ganze Spiel in dieser Sprache, sonst auf Deutsch. So wird schon das Herumlaufen zum Sprachbad. Der Rest dieses Abschnitts ist **(Claude)**.

- **Welche Sprache:**
  - Steht im Kopf des Pakets `SPIELSPRACHE:`, gilt sie.
  - Sonst entscheidet `FACH:`. Nennt das Fach eine Sprache, die das Spiel kann, läuft es in dieser Sprache, sonst auf Deutsch.
  - Groß- und Kleinschreibung sind egal. Erkannt werden auch die englischen und eigenen Namen der Sprachen, zum Beispiel „English“, „français“ oder „español“, und die Kürzel `de`, `en`, `fr`, `es`.
- **Sprachen des Spiels:** Deutsch, Englisch, Französisch und Spanisch, die häufigsten Fremdsprachen der Sekundarstufe 1.
- **Andere Fächer:**
  - Andere Sprachfächer, etwa Latein, Italienisch oder Niederländisch, laufen auf Deutsch.
  - Die Prüfung des Pakets zeigt dann einen Hinweis, zum Beispiel: „Das Spiel gibt es noch nicht auf Italienisch. Es läuft auf Deutsch.“
  - Eine unbekannte `SPIELSPRACHE` ist ein Hinweis mit Zeilennummer. Dann entscheidet `FACH`.
- **Was übersetzt ist:** alles, was das Kind nach dem Laden des Pakets sieht:
  - Oberfläche, Menüs und Duelle
  - Bewohner, Schilder und die Geschichte
  - die Namen der Gebiete und der Wesen. Jede Sprache bekommt eigene, kindgerechte Namen, so wie die deutschen.
  - die Standardtexte der Trainer, wenn das Paket keine eigenen hat
- **Was nicht übersetzt wird:**
  - Eigennamen der Bewohner und Morrow
  - der Name des Kindes und der Spitzname seines Wesens
  - alles aus dem Paket selbst
- **Was auf Deutsch bleibt:**
  - alles für die Lehrkraft: `lehrkraft.html`, die Seite „Für die Lehrkraft“ im Spiel mit dem Prüfcode, die Fehlerliste beim Laden eines Pakets, Vorlage und Anleitung
  - alles, bevor ein Paket geladen ist: Titel, Hinweis zum Home-Bildschirm und der Knopf „Lernpaket laden“
- **Sprachniveau:**
  - Englisch auf A1 bis A2 für Jahrgang 6
  - Französisch und Spanisch auf A1, weil diese Sprachen meist später beginnen
  - kurze Sätze, häufige Wörter, dieselbe Geschichte und derselbe Ton wie im Deutschen
- **Paketwechsel:** Wechselt mit dem Paket die Sprache, ist das Spiel danach in der neuen Sprache. Der Spielstand hängt nicht an der Sprache.
- **Reihenfolge beim Bauen:**
  - Deutsch und Englisch kommen zuerst, Französisch und Spanisch, sobald alle Inhalte stehen.
  - Bis dahin läuft ein Paket für Französisch oder Spanisch auf Deutsch, und die Prüfung sagt das.

---

## 11. Spielstand

- Der Spielstand wird im Browser auf dem Gerät gespeichert (`localStorage`). Er ist verschleiert, damit man ihn nicht einfach ändern kann.
- **(Claude) Verschleierung:** JSON → UTF-8 → XOR mit einem festen Schlüsselstrom → Base64, dazu eine Prüfsumme (gesalzener Hash). Ist die Prüfsumme falsch, wird der Stand nicht geladen und die Sicherung angeboten. Ein Versionsfeld ermöglicht spätere Umstellungen.
- **Automatisch speichern:** nach jedem Duell, Fund, Auftrag und Gebietswechsel und alle 30 Sekunden. Der vorige Stand bleibt als Sicherung unter einem zweiten Schlüssel erhalten.
- **(Claude) Schutz vor Datenverlust:** Safari löscht Website-Daten nach 7 Tagen ohne Besuch, wenn die Seite nicht auf dem Home-Bildschirm liegt. Außerdem hat eine Web-App auf dem Home-Bildschirm unter iOS **einen eigenen Speicher, getrennt von Safari**. Wer erst in Safari spielt und das Spiel dann zum Home-Bildschirm hinzufügt, fängt dort ohne Spielstand und ohne Paket an. Deshalb gilt:
  1. **Erst installieren, dann spielen:** Öffnet ein Kind das Spiel auf einem iPad oder iPhone in Safari, also nicht vom Home-Bildschirm aus, und gibt es noch keinen Spielstand, erscheint vor dem Laden des Pakets ein Bildschirm mit kurzer Anleitung: „Tippe auf Teilen → Zum Home-Bildschirm, dann öffne Lumara dort.“ Darunter steht klein „Trotzdem im Browser spielen“. Auf anderen Geräten erscheint nur ein kurzer Hinweis in den Einstellungen.
  2. Das Spiel bittet den Browser um dauerhaften Speicher (`navigator.storage.persist()`).
  3. **Spielstand sichern und laden:** Unter *Einstellungen → Spielstand sichern* erzeugt das Spiel eine Datei `Lumara-<Name>-<Datum>.txt`. Sie enthält den verschleierten Spielstand **und das aktuelle Lernpaket**. Wo das Teilen-Menü verfügbar ist (Web Share API), öffnet es sich, damit man die Datei in „Dateien“ speichern oder per AirDrop senden kann. Sonst wird sie heruntergeladen. *Spielstand laden* holt alles zurück, auch das Paket. Das ist der Weg von Safari zur Home-Bildschirm-App, zu einem neuen Gerät oder nach dem Löschen der Browserdaten.
  4. Beim Laden einer Sicherung, die älter ist als der aktuelle Spielstand auf dem Gerät, warnt das Spiel und nennt beide Daten und Level. Einen automatischen Abgleich zwischen zwei Geräten gibt es nicht.
- Pro Gerät gibt es einen Spielstand, denn jedes Kind hat ein eigenes Gerät. *Neues Spiel* muss zweimal bestätigt werden.
- **(Claude) Spätere Spielfassungen:** Spielstände ab der ersten Fassung für den Unterricht (17, Schritt 4) müssen in jeder späteren Fassung ladbar bleiben. Jeder Stand trägt eine Versionsnummer, und für jede Änderung am Format gibt es eine Umwandlung, die mit Tests abgesichert ist. Gespeichert werden Level und XP innerhalb des Levels, nicht nur die Gesamt-XP. Änderungen an der XP-Kurve wirken sich dann nur auf künftige Level aus und können niemandem ein Level oder eine Entwicklung wegnehmen.

## 12. Überblick für die Lehrkraft

### 12.1 Statistikseite im Spiel

Sie liegt unter *Menü → Einstellungen → Für die Lehrkraft*. Groß und gut lesbar, damit ein Screenshot reicht:
- Name, Wesen mit Level und Entwicklungsstufe
- Paket-Titel und Paketkennung
- Gewonnene Duelle, Trefferquote in Prozent, Spielzeit (h:mm), jeweils mit dem aktuellen Paket
- Trainer besiegt mit diesem Paket (x von der Anzahl im Paket, dazu Endgegner ja/nein, siehe Erinnerungsduell in 9)
- **(Claude)** Trefferquote je Thema als Liste mit 8 Zeilen. So sieht die Lehrkraft, wo es hakt.
- Höchste Etage im Leuchtturm-Aufstieg
- **Prüfcode**

Gezählt wird die Spielzeit nur, solange das Spiel sichtbar ist und das Kind in den letzten 2 Minuten etwas eingegeben hat.

### 12.2 Prüfcode

- **(Claude)** Er besteht aus 6 Zeichen ohne verwechselbare Zeichen (kein 0, O, 1, I, L), angezeigt als `K7P-3QX`.
- Berechnet wird er mit einem gesalzenen Hash über Name, Paketkennung, Level, Stufe, gewonnene Duelle, Trefferquote (ganze Prozent), Spielzeit (Minuten) und besiegte Trainer (0 bis 9).
- Das ist bewusst nicht ganz fälschungssicher, weil es keinen Server gibt. Für Jahrgang 6 reicht das.

### 12.3 Seite für Lehrkräfte (`lehrkraft.html`)

Eine eigene Seite mit zwei Bereichen:
1. **Statistik prüfen:** Die Lehrkraft tippt die Werte vom Screenshot und den Prüfcode ab. Die Seite antwortet „Die Angaben sind echt.“ oder „Die Angaben passen nicht zum Prüfcode.“
2. **(Claude) Lernpaket prüfen:** Datei auswählen, dann zeigt die Seite Fehler und Hinweise mit Zeilennummern und eine Übersicht pro Trainer (Anzahl der Fragen, welche Formen möglich sind). Mit „Probefrage“ lassen sich zufällige Fragen in der echten Duell-Ansicht ausprobieren.

Dazu Links zu Vorlage, Beispielpaket, KI-Prompt und Anleitung.

---

## 13. Steuerung und Bildschirm

- **Tablet:** Das **Steuerkreuz liegt unten rechts.** **(Claude)** Unten links liegen der große Knopf **A** (Sprechen, Untersuchen, Bestätigen) und der kleinere Knopf **B** (Zurück, Abbrechen, Fliehen). Oben rechts ist der Menüknopf.
  - Hält man das Steuerkreuz gedrückt, läuft die Figur weiter. Der Finger darf zwischen den Richtungen gleiten. Diagonalen zählen zur stärkeren Richtung.
  - Größen: Das Steuerkreuz hat mindestens 140 px Durchmesser, die Knöpfe mindestens 64 px. Alle Tippflächen sind mindestens 48 px groß. Mehrere Finger gleichzeitig funktionieren.
  - Die Steuerelemente erscheinen, sobald das Gerät Berührungen meldet.
- **PC:** Pfeiltasten oder WASD zum Laufen, Enter oder Leertaste für A, Esc oder Rücktaste für B, M für das Menü. Antworten lassen sich auch mit der Maus anklicken.
- **Bewegung:** Die Figur läuft in vier Richtungen Feld für Feld mit weichem Übergang, die Kamera folgt ihr.
- **(Claude) Querformat** ist die Hauptansicht. Die Steuerelemente liegen halbtransparent über den Ecken des Spielbilds. **Hochformat** funktioniert auch: Das Spielbild ist oben, darunter liegt ein eigener Bereich mit Steuerkreuz rechts und Knöpfen links.
- Im Duell und in Textfenstern wird das Steuerkreuz nicht gebraucht. Man tippt direkt auf Antworten oder irgendwo hin, um weiterzulesen.
- **Menü:** Wesen (Werte, Stufe, Fähigkeiten), Rucksack, Wesen-Buch, Karte (Gebiete im Nebel grau), Tagebuch (Geschichtsstücke und Aufträge), Einstellungen.
- **Einstellungen:** Musik an/aus, Effekte an/aus, Textgeschwindigkeit, Lernpaket wechseln, Spielstand sichern/laden, Für die Lehrkraft, Hinweis zum Home-Bildschirm, Neues Spiel.

## 14. Grafik und Stil

- **(Claude)** Die interne Auflösung beträgt **240 × 160 Pixel**, die Felder sind 16 × 16 groß (15 × 10 sichtbar). Das Bild wird scharf ohne Weichzeichnen auf die Bildschirmgröße hochskaliert.
- **Alles wird im Code gezeichnet.** Die Sprites sind als Pixelraster mit Farbpalette im Code definiert und werden beim Start in Bilder umgewandelt. Es gibt keine Bilddateien von außen. Einzige Ausnahme ist das selbst erzeugte App-Symbol für den Home-Bildschirm.
- **Eigene Optik:** Weiches, leicht märchenhaftes Pixel-Art mit einer eigenen Hauptpalette von etwa 32 Farben. Jedes Gebiet nutzt 6 bis 8 davon für seine Farbstimmung. Ausdrücklich kein typisches Handheld-Grün und keine Anlehnung an ein bestehendes Spiel.
- **Größen der Wesen im Duell:** Stufe 1 ist 32 × 32 groß, Stufe 2 40 × 40, Stufe 3 48 × 48 und Stufe 4 64 × 64. Jedes Wesen hat eine Animation fürs Stehen und eine für den Angriff.
- **Spielfigur:** 16 × 16 mit vier Richtungen und zwei Lauf-Bildern pro Richtung. **(Claude)** Es ist eine neutrale Figur mit Kapuzenumhang, damit sich alle Kinder darin wiederfinden.
- **Lebendige Welt:** Teilchen und Wetter pro Gebiet (5.3), animiertes Wasser, Gras, das sich beim Durchlaufen bewegt, Nebel als wabernde Schicht und Licht am Leuchtturm.
- **Texte, Fragen und Menüs** liegen als HTML über dem Spielbild. **(Claude)** Sie nutzen eine Systemschrift, weil Lesbarkeit wichtiger ist als Retro-Optik, und stecken in Kästen im Pixel-Stil, cremefarben mit braunem Rahmen wie im Entwurf. Fragen sind mindestens 18 px groß.
- **Bewegung reduzieren:** Wenn das Gerät „Bewegung reduzieren“ eingestellt hat, gibt es kein Bildschirmwackeln und weniger Teilchen. Nichts blinkt öfter als dreimal pro Sekunde.

## 15. Musik und Ton

- **Alles wird im Browser erzeugt** (Web Audio API), wie bei alten Handhelds: zwei Rechteck-Stimmen, eine Dreieck-Stimme und Rauschen. Die Melodien stehen als Notendaten im Code. Es gibt keine Audiodateien, alles ist selbst komponiert und damit frei von Rechten Dritter.
- **(Claude) Musikstücke** als kurze Schleifen: Titel, eins pro Gebiet (8), Höhle, wildes Duell, Trainerduell, Endgegner und Leuchtturm-Aufstieg. Dazu Jingles für Sieg, Niederlage, Level-Aufstieg, Entwicklung, Fund und Leuchtstein.
- **Effekte:** Menü, Bestätigen, richtig, falsch, Treffer, Volltreffer, Kärtchen legen, Tippen, Stein anheben, Übergang und Nebel weicht.
- Musik und Effekte lassen sich getrennt ausschalten. Die Musik startet leise.
- Auf iPads beginnt der Ton erst nach der ersten Berührung, das ist eine Vorgabe von iOS.

## 16. Technik

- **(Claude)** Vanilla JavaScript als ES-Module, HTML und CSS. Kein Framework, kein Build-Schritt, keine Abhängigkeiten.
- **Zielgeräte:** Safari ab iPadOS 16 sowie aktuelle Versionen von Chrome und Edge, auch auf Chromebooks. Ziel sind 60 Bilder pro Sekunde.
- **Offline und Home-Bildschirm:** Ein Web-App-Manifest mit eigenem Symbol und ein Service Worker, der alle Dateien zwischenspeichert. Nach dem ersten Laden läuft das Spiel auch bei schlechtem WLAN im Klassenraum.
- **(Claude) Updates verlässlich ausliefern:** Eine kleine Versionsdatei wird beim Start immer zuerst über das Netz abgefragt und nur ohne Netz aus dem Zwischenspeicher genommen. Gibt es eine neue Fassung, lädt der Service Worker sie im Hintergrund. Das Spiel zeigt dann „Neue Version da – beim nächsten Start aktiv“ und wechselt erst beim nächsten Öffnen, nie mitten im Duell. Die Spielfassung steht klein in den Einstellungen.
- **Keine Netzwerkanfragen** außer zu den eigenen Dateien. Es gibt keine Analyse und keine Tracker. Das Lernpaket wird nur lokal gelesen.
- **Tests:** Die reine Logik wird mit dem eingebauten Testläufer von Node geprüft (`node --test`, ohne npm-Pakete). Dazu gehören der Paket-Parser mit Prüfung, die Antwortprüfung, die XP-Kurve, die Duellregeln, das Ziehen der Fragen, die Verschleierung des Spielstands und der Prüfcode. Grafik, Steuerung und Ton werden von Hand auf dem iPad und am PC geprüft.
- **Lokales Testen:** ES-Module brauchen einen kleinen lokalen Webserver, zum Beispiel `python3 -m http.server`.
- **Lizenz (Claude):** Kein Copyright-Hinweis mit Namen (Lizenzhinweis mit Namen, am 4.11.2026 entfernt).

## 17. Reihenfolge beim Bauen

**(Claude)** Ein Vorschlag, damit früh etwas Spielbares entsteht. Der Bauplan kann ihn anpassen.

1. **Grundgerüst:** Laufen auf einer Karte (Leuchtturmbucht), Steuerkreuz und Tastatur, Kamera, Kollision, Textfenster.
2. **Lernpaket:** Parser, Prüfung, Laden und Speichern, Vorlage und ein erstes Beispielpaket mit 2 Themen.
3. **Duell:** drei Antwortformen, Energie, Volltreffer, Trainer 1, wilde Wesen, XP und Level.
4. **Spielstand und Lehrkraft:** Speichern mit Versionsnummer und Umwandlung, Sicherung samt Paket, der Ablauf „erst installieren“, Statistik, Prüfcode, `lehrkraft.html`, Service Worker mit Update-Strategie, Nebelrand mit Schild für noch nicht gebaute Gebiete. *Ab hier lässt sich mit Gebiet 1 und 2 im Unterricht testen. Ab dann gelten die Regeln für spätere Spielfassungen aus Abschnitt 11.*
5. **Welt:** Gebiete 2 bis 8, Nebel und Leuchtsteine, Reisen, Futter, Steine, Zettel, Geschichtsstücke.
6. **Tiefe:** Entwicklungen mit Fähigkeiten, Wesen-Buch, Aufträge, geheime Orte und Rätsel.
7. **Finale:** Höhle, Morrow, veränderte Welt, Revanchen, Leuchtturm-Aufstieg.
8. **Musik und Ton.**
9. **Abschluss:** Offline-Fähigkeit und Home-Bildschirm, vollständiges Beispielpaket, KI-Prompt, Anleitung, Feinschliff auf dem iPad.

## 18. Was dem Builder überlassen ist

- Das genaue Pixel-Art von Welt, Figuren und Wesen, im Rahmen von Abschnitt 14.
- Namen, Aussehen und Beschreibungen der 33 wilden Arten.
- Die Karten der Gebiete im Detail (Wege, Häuser, Verstecke).
- Namen und Texte der Bewohner, die Details der 8 Aufträge und die 30 Geschichtsstücke, im Rahmen von 5.4 bis 5.7.
- Die Musikstücke und Effekte.
- Genaue Abstände und Größen der Oberfläche, solange die Mindestgrößen eingehalten sind.
- Die Code-Struktur und Dateiaufteilung.
- Das Feintuning aller Zahlen über die Konfigurationsdatei.
- Die Inhalte des Beispielpakets im Rahmen der Themen aus 10.5.
