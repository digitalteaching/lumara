# Lumara 1.1 bis 1.3 – Rucksack, Freunde und Verstecke · Design

Stand: 21.11.2026 · **Freigegeben am 21.11.2026.** Vom Builder geprüft, Rückfrage zum Veröffentlichen beantwortet. Nächster Schritt: Bauplan für Fassung 1.1.
Grundlage: das Gespräch vom 21.11.2026 und das bestehende Design `2026-11-01-lernwelt-rpg-design.md` (im Folgenden „Grunddesign“, Abschnittsnummern wie dort).

Kennzeichnung: **[Festgelegt]** hat die Lehrkraft im Gespräch entschieden. **(Claude)** ist eine Entscheidung von Claude. Einiges davon wurde im Gespräch vorgeschlagen, ohne dass widersprochen wurde, und ist dann als **(Claude, vorgeschlagen)** markiert.

---

## 1. Worum es geht und warum

Lumara ist fertig (Spielfassung 1.0.4) und wird von Schülerinnen und Schülern mit echten Spielständen gespielt. Jetzt soll das Spiel auf ein neues Level kommen: **Es soll immer etwas Neues zu entdecken geben, damit die Abwechslung hoch bleibt** und Kinder freiwillig in alte Gebiete zurückkehren.

Dazu kommen in drei Spielfassungen:

1. **1.1 Rucksack und Schätze:** ein Rucksack, den man direkt im Spiel aufklappt, und Schätze zum Sammeln.
2. **1.2 Freunde:** wilde Wesen befreunden, ein Garten für alle Freunde, ein Begleiter mit einer Gabe, Verstecke, die nur mit der passenden Gabe aufgehen, kleine Spielaufgaben, acht neue Wesen und Leckerli.
3. **1.3 Aushang und Wünsche:** jeden Tag drei neue kleine Aufgaben und Bewohner, die sich Schätze wünschen.

**Woran man Erfolg erkennt:**
- Kinder kehren mit einem anderen Begleiter in frühere Gebiete zurück, weil dort etwas Neues wartet.
- Jeder Spieltag ist ein bisschen anders.
- Jeder bestehende Spielstand lädt in jeder neuen Fassung, und kein Kind verliert etwas.
- In fast jedem Fund steckt weiterhin eine Frage aus dem Lernpaket.

## 2. Ziele, Nicht-Ziele, Anti-Ziele

**Ziele**
- Mehr zu entdecken, gebunden an die vorhandenen acht Gebiete. Es gibt keine neuen Gebiete, aber neue Ecken in den alten.
- Wesen befreunden mit Fragen, wenn sie erschöpft sind. **[Festgelegt]**
- Neue Wesen, neue Gegenstände, versteckte kleine Aufgaben. **[Festgelegt]**
- Der Rucksack öffnet sich direkt im Spiel, wie im Entwurf des Inselspiels: Er kommt groß nach vorne, die Klappe geht auf, innen liegen Fächer. **[Festgelegt]**
- Alle bisherigen Spielstände bleiben ladbar, die Kinder spielen einfach weiter. **[Festgelegt]**

**Nicht-Ziele**
- **Befreundete Wesen kämpfen nicht.** Das Startwesen bleibt der einzige Duellpartner, mit Level, Entwicklung und Energie wie bisher. **[Festgelegt: Sammlung plus Begleiter, kein Team]**
- Kein Tauschen zwischen Kindern, kein Mehrspieler, keine Ranglisten.
- Keine Änderung am Format des Lernpakets, am KI-Prompt, am Prüfcode und an der Statistikseite. **(Claude)**
- Keine neuen Gebiete und keine Verstecke an den geheimen Orten oder in der Höhle. **(Claude)**
- Kein Bauen und kein Ablegen von Gegenständen in der Welt. Das gehört zum Inselspiel.

**Anti-Ziele** (gescheitert, auch wenn alles funktioniert)
- **Es sieht nach einem bekannten Spiel aus.** Es gibt keinen Wurfgegenstand, keinen Behälter, in den ein Wesen gesperrt wird, kein Wackeln mit Spannung und keine Begriffe aus fremden Spielen. Man fängt nicht, man **befreundet**: Das Wesen kommt freiwillig mit. **[Festgelegt: „darf nicht kopiert aussehen“]** In keiner Datei, keinem Commit und keiner Doku im öffentlichen Repo wird ein bestehendes Spiel oder eine Marke genannt, auch nicht als Vergleich.
- Ein Kind verliert seinen Spielstand oder etwas daraus.
- Raten führt schneller zum Ziel als Wissen.
- Das Spielen verdrängt das Üben: Aufgaben ohne Fragen bleiben die Ausnahme.
- Der Rucksack wird unübersichtlich.

## 3. Rahmenbedingungen

Alles aus dem Grunddesign gilt weiter, insbesondere:
- reines HTML, CSS und JavaScript als ES-Module, keine Abhängigkeiten, keine Netzwerkanfragen, alles im Code gezeichnet, Pixelraster 240 × 160 mit der eigenen Palette (Grunddesign 14, 16)
- iPad mit Safari als Hauptgerät, Quer- und Hochformat, Touch und Tastatur (Grunddesign 13)
- **vier Spielsprachen:** Jeder neue Text, jeder Name eines Wesens, Schatzes oder Gegenstands und jede Bewohnerzeile gibt es auf Deutsch, Englisch, Französisch und Spanisch, auf Englisch, Französisch und Spanisch auf Niveau A1 bis A2 (Grunddesign 10.6, Plan 7). Neue Wesen und Schätze bekommen in jeder Sprache eigene, kindgerechte Namen.
- Spielstände: Für jede Formatänderung gibt es eine Umwandlung in `js/save/migrate.js`, eine feste Testdatei in `tests/fixtures/` und eine Erweiterung der Reparatur (Abschnitt 8).
- Veröffentlichen wie bisher (README „Veröffentlichen“): Spielfassung an drei Stellen erhöhen, `sw.js`-Dateiliste, `node --test`, Push nach `digitalteaching/lumara`.
- Alle Zahlen kommen in `js/config.js`.

## 4. Wege, die zur Wahl standen

Gebaut wird im bestehenden Lumara. Offen war, wie die Arbeit geschnitten und ausgeliefert wird.

| Weg | Vorteil | Nachteil |
|---|---|---|
| **A · Drei Fassungen, jede für sich spielbar:** 1.1 Rucksack und Schätze, 1.2 Freunde, 1.3 Aushang und Wünsche | Kinder bekommen schnell etwas Neues, jede Fassung wird einzeln auf dem iPad geprüft, ein Fehler trifft nur einen Teil | Kinder erleben drei Umstellungen, und 1.1 hat noch wenige Schätze |
| B · alles in einer großen Fassung | ein großer Moment, nur eine Umwandlung | am längsten bis zum ersten Neuen, ein Fehler ist schwer zu finden |
| C · Freunde zuerst, Rucksack danach | das Spannendste zuerst | der Rucksack müsste später noch einmal umgebaut werden |

**[Festgelegt: A]** Der Rucksack ist die Grundlage, in die Schätze, Leckerli und Tauschware hineinkommen. Weil Kinder mit echten Spielständen spielen, ist eine Fassung nach der anderen sicherer. **(Claude)** Die Fassungen heißen 1.1.0, 1.2.0 und 1.3.0. Fassung 1.2 darf in mehreren Bauplänen entstehen, wird aber als Ganzes veröffentlicht, denn Befreunden, Begleiter, Gaben und Verstecke ergeben nur zusammen Sinn.

**(Claude)** Jede Fassung entsteht auf einem eigenen Zweig. Auf `main` landet sie erst, wenn sie fertig ist, denn GitHub Pages veröffentlicht von `main` direkt an die Kinder. So kommt nie ein halbfertiges Spielstand-Format zu ihnen.

---

## 5. Fassung 1.1: Rucksack und Schätze

### 5.1 Der Rucksack im Spiel

- **Knopf:** oben rechts, links neben dem Menüknopf ☰, gleich groß (52 px), mit einem kleinen Pixel-Rucksack statt eines Zeichens. Wie der Menüknopf ist er nur beim Laufen sichtbar. Am PC öffnet ihn die Taste **R**. **(Claude, vorgeschlagen)**
- **Öffnen:** Der Rucksack kommt groß von unten nach vorne, die Klappe klappt sichtbar nach oben auf (etwa 0,4 s), dann liegen die Fächer da. Schließen geht mit ✕, B, Esc oder Tippen neben den Rucksack. Bei „Bewegung reduzieren“ öffnet er sich ohne Animation. **[Festgelegt: wie Inselspiel-Entwurf „Blick hinein“ mit Fächern]**
- **Aussehen:** im Pixelstil von Lumara. Rahmen, Klappe und alle Gegenstände sind Pixelbilder aus dem Code. Die Gegenstände haben 16 × 16 Pixel und werden scharf vergrößert. Beschriftungen und Texte sind HTML in der Systemschrift wie die übrigen Texte (Grunddesign 14). Zum Inselspiel-Entwurf gehört die Bildsprache der Fächer, nicht dessen Grafikstil.
- **Kopfzeile:** Energie des Wesens und Futterplätze (wie heute auf der Rucksack-Seite).
- **Vier Fächer** (2 × 2, im Hochformat untereinander erlaubt):

| Fach | Inhalt | Handlung beim Antippen |
|---|---|---|
| Futter | Beere, Sternfrucht, ab 1.2 Leckerli | Füttern wie heute; beim Leckerli „Gibst du beim Befreunden“ |
| Steine | Weitblick-, Glanz- und Zeitstein; darunter „Lebenssteine im Wesen: n von 3“ | Glanzstein: Einsetzen wie heute; Weitblick- und Zeitstein: „Wirkt im Duell“ |
| Schätze | Sammelalbum: 24 Plätze nach Gebiet geordnet, gefundene mit Bild und Anzahl, nie gefundene als „?“ | Ansehen: großes Bild, Name, Fundgebiet, ein Satz Text; ab 1.3 dazu „Wünscht sich: Name“ |
| Schlüssel | die sechs Schlüsselgegenstände, wenn vorhanden, sonst „Noch nichts“ | Text wie heute |

- Tippt man einen Gegenstand an, erscheint darunter eine Karte mit Name, Anzahl, Beschreibung und, wenn es eine gibt, einer Handlung. Beim Füttern fliegt das Futter sichtbar zur Energieanzeige. **(Claude)**
- **Menü → Rucksack** öffnet denselben Rucksack. Die alte Textseite entfällt.
- **Im Duell** ändert sich nichts. Füttern und Steine laufen weiter über das Antwortfeld.

### 5.2 Schätze

- **24 Schätze:** je Gebiet zwei häufige und ein seltener. **(Claude, vorgeschlagen)** Namensvorschläge auf Deutsch. Der Builder darf sie ändern, Übersetzungen entstehen neu:

| Gebiet | häufig | häufig | selten |
|---|---|---|---|
| 1 Leuchtturmbucht | Glasmuschel | Möwenfeder | Bernsteintropfen |
| 2 Flüsterwald | Eichelhütchen | Goldblatt | Flüsterzapfen |
| 3 Pilzmoor | Sporenkugel | Libellenflügel | Irrlichtglas |
| 4 Spiegeldünen | Sandrose | Spiegelscherbe | Sonnenprisma |
| 5 Windklippen | Wolkenwolle | Klippenkristall | Sturmfeder |
| 6 Uhrwerkruinen | Messingzahnrad | Uhrfeder | Taschenuhr |
| 7 Nordlichtsee | Frostblume | Schneeflockenstein | Nordlichtperle |
| 8 Sternenwiese | Sternstaub | Nachtschafwolle | Kometensplitter |

- **Woher in 1.1** (Zahlen in `config.js`, Startwerte von Claude):
  - **Glitzerstellen im Gras:** Mit 1 zu 3 gibt es einen häufigen Schatz des Gebiets statt eines Steins.
  - **Zettel:** Die Belohnungstabelle bekommt „häufiger Schatz des Gebiets“ mit dem Gewicht 2.
  - **Wilde Wesen:** Mit 10 % lassen sie nach einem Sieg einen häufigen Schatz ihres Gebiets fallen, zusätzlich zur Beere wie heute.
  - **Seltene Schätze** gibt es erst ab 1.2 (Spielaufgaben, selten in Verstecken). In 1.1 stehen sie als „?“ im Album. Das ist ein gewollter Ausblick.
- **Platz:** Für Schätze gibt es keine Obergrenze, jeder Schatz hat eine Anzahl. Das Album merkt sich, welche Schätze **je gefunden** wurden. Der Platz bleibt gefüllt, auch wenn man später einen Schatz hergibt (1.3).
- An Geheimen Orten und in der Höhle gelten die Tabellen des Gebiets, zu dem der Ort gehört. In der Höhle gibt es keine Schätze. **(Claude)**
- Ein Fund zeigt wie heute einen kurzen Text und spielt den Fund-Jingle.

---

## 6. Fassung 1.2: Freunde

### 6.1 Befreunden

- **Wann:** nach einem **gewonnenen Duell gegen ein wildes Wesen**: im Gras, an geheimen Orten, in Wesen-Verstecken (6.5) und an der Sternschnuppe. Nicht bei Trainern, Revanchen, Morrow und im Leuchtturm-Aufstieg. **[Festgelegt: nur wilde Wesen]**
- Angeboten wird es nur, wenn die Art noch nicht befreundet ist, oder wenn eine Glanzform einer Art erscheint, die bisher nur in normaler Farbe befreundet ist. Dann wird der Freund zur Glanzform. **[Festgelegt: jede Art einmal]**
- **Ablauf** **[Festgelegt im Gespräch: Vertrauensring, 5 Fragen, 3 richtige]**:
  1. Nach der Siegmeldung (XP, Level, Beute wie heute) bleibt das erschöpfte Wesen sitzen: „Möchtest du dich mit … anfreunden?“ mit [Befreunden] [Weiterziehen]. Die XP für den Sieg gibt es in beiden Fällen.
  2. Liegt ein Leckerli im Rucksack, fragt das Spiel: „Gibst du … ein Leckerli?“ Ein Leckerli füllt vorab ein Feld des Rings, höchstens eines pro Versuch.
  3. Neben dem Wesen erscheint ein **Vertrauensring mit drei Feldern**. Es kommen bis zu **fünf Fragen** aus dem Pool der wilden Duelle, in den drei Antwortformen, **ohne Zeitdruck** und **ohne Energieverlust**. Jede richtige Antwort füllt ein Feld (mit eigenem Effekt-Ton). Ein Weitblickstein darf eingesetzt werden, die Besonderheiten der Startwesen gelten hier nicht. **(Claude)**
  4. Drei Felder voll: Der Ring schließt sich, ein Herz steigt auf, ein neuer Jingle spielt. „… ist jetzt dein Freund und wohnt im Garten am Leuchtturm.“ Hat das Kind noch keinen Begleiter: „Soll … dich begleiten?“
  5. Sind drei Felder nicht mehr zu schaffen, also nach der dritten falschen Antwort: „… ist noch scheu und läuft davon.“ Man versucht es bei der nächsten Begegnung wieder. Mit B kann man jederzeit weiterziehen.
- **Statistik:** Die Antworten zählen in Trefferquote, Themenliste und Fragenhistorie wie Antworten auf Zettel. Als Siege zählen sie nicht (Grunddesign 12.1).
- **Wesen-Buch:** Befreundete Arten bekommen ein Herz. Die Reihenfolge der Zustände ist: unbekannt → gesehen → besiegt → befreundet. Das Buch wächst auf **41 Einträge**. Die neuen Wesen (6.7) stehen auf den Plätzen 34 bis 41, die bisherigen Nummern bleiben unverändert.
- Befreundbar sind alle wilden Arten: 24 aus den Gebieten, 6 von geheimen Orten, 2 aus der Höhle und die 8 neuen, zusammen **40**. Morrow und die Startwesen sind es nicht.

### 6.2 Der Garten

- **Ort:** eine eigene kleine Karte „Garten“. Ihr Eingang liegt in der Leuchtturmbucht in der Nähe des Leuchtturms. **(Claude, vorgeschlagen)** Den genauen Platz wählt der Builder. Bedingung: Kein Feld, auf dem man heute stehen kann, wird zum Hindernis, außer höchstens dem Eingang selbst.
- **Inhalt:** Wiese, ein Teich, ein paar Bäume und Steine, ohne hohes Gras und ohne Begegnungen. Alle Freunde laufen langsam herum, Wasserwesen bleiben bevorzugt am Teich. Glanzformen glänzen. Ein Schild zeigt „Freunde: n von 40“.
- Spricht man einen Freund an (A), erscheint eine Karte mit Bild, Name, Gabe und [Als Begleiter mitnehmen] bzw. „… begleitet dich gerade“.
- **Menü → Freunde** (neuer Menüpunkt nach dem Wesen-Buch) zeigt dieselbe Liste mit Bild, Gabe und [Mitnehmen] / [Zurück in den Garten]. So kann man den Begleiter überall wechseln, ohne zum Garten zu reisen. **(Claude)** Ohne Freunde steht dort ein Satz, wie man Freunde findet.
- Musik: die der Bucht oder eine eigene ruhige Schleife, das entscheidet der Builder.

### 6.3 Der Begleiter

- **Höchstens einer** läuft mit. Alle anderen sind im Garten. **[Festgelegt]**
- Er läuft ein Feld hinter der Figur auf dem Feld, das sie gerade verlassen hat. Er ist kein Hindernis und kommt bei Gebietswechseln, Leuchtstein-Reisen, an geheime Orte und in die Höhle mit. Im Duell ist er nicht dabei. In Szenen ohne Spielfigur (Intro, Finale) ist er unsichtbar.
- Schaut die Figur ihn an und drückt A, sagt er einen kurzen Satz passend zu seiner Gabe. **(Claude)**
- **Bild:** Jede der 40 befreundbaren Arten bekommt ein **Kleinbild von 16 × 16 Pixeln** mit zwei Bildern zum Laufen oder Hüpfen. Nach links wird es gespiegelt, nach oben und unten gibt es dieselben Bilder. Glanzformen entstehen mit dem vorhandenen Farbtausch (`gfx/art/shiny.js`). **(Claude)**

### 6.4 Gaben

**[Festgelegt: eine Gabe je Gebiet]** Wesen aus demselben Gebiet teilen sich eine Gabe. Jede Gabe öffnet eine Art von Versteck, und diese Verstecke liegen in mehreren Gebieten.

| Gabe | Wesen | öffnet |
|---|---|---|
| Strandgut | Gebiet 1 und Perlkrabbe | Flaschenpost und vergrabene Dinge im Sand |
| Klettern | Gebiet 2 und Wurzelgeist | Nester und Höhlen in Baumkronen |
| Leuchten | Gebiet 3 und Irrlichtfee | dunkle Ecken, Wurzelgänge, Schatten unter Stegen |
| Klarblick | Gebiet 4 und Prismalibelle | Luftspiegelungen: Hinter einigen liegt ein echter Weg |
| Aufwind | Gebiet 5 | Felsnadeln und Simse über Wolken oder Wasser |
| Tüfteln | Gebiet 6 und Zeitschnecke | verrostete Kisten, Mauerfächer, Schleusenkästen |
| Tauchen | Gebiet 7 und Kristallotter | Eislöcher, Kanäle, Teiche, Meer am Steg |
| Sternenspur | Gebiet 8 | Spuren, die erst leuchten, wenn ein Begleiter mit Sternenspur in der Nähe ist |
| **Spürnase** | Echomaus, Kristallraupe (Höhle) | öffnet nichts, zeigt aber jedes Versteck in der Nähe mit dem Zeichen der nötigen Gabe |

- Die neuen Wesen (6.7) haben die Gabe ihres Gebiets. Für Aufwind und Sternenspur gibt es keine Art von einem geheimen Ort, das ist so gewollt.
- Es gibt keinen Wechsel von Tag und Nacht. „Leuchtende Spuren“ und „dunkle Ecken“ sind feste Stellen auf den Karten, keine Tageszeit. **(Claude)**
- Die Spürnase ist eine Belohnung für spät im Spiel: Sie zeigt an, wohin es sich lohnt zurückzukehren.

### 6.5 Verstecke

- **Anzahl (Richtwert):** fünf je Gebiet, zusammen 40:
  - 1 **Wesen-Versteck**, das die Gabe des eigenen Gebiets braucht
  - 4 **Fund-Verstecke**, davon mindestens 1 mit der Gabe des eigenen Gebiets und mindestens 2 mit Gaben anderer Gebiete, sowohl früherer als auch späterer
  - So lohnt sich ein frisch befreundeter Begleiter sofort, und spätere Gaben ziehen zurück in frühere Gebiete.
- **Sichtbar, aber zu:** Jedes Versteck ist schwach zu sehen, damit neugierige Kinder es bemerken: ein Glitzern im Eisloch, ein Nest in der Krone, eine rostige Kiste, ein Riss im Fels, leise glimmende Spuren. Steht man davor und drückt A ohne passende Gabe, sagt ein Satz, was man sieht und welche Gabe hilft („Tief im Eisloch glitzert etwas. Ein Wesen, das tauchen kann, käme hin.“).
- **Mit passender Gabe:** Ist das Versteck höchstens 3 Felder entfernt, zeigt der Begleiter ein „!“. Mit A spielt eine kurze Szene von 1 bis 2 Sekunden, in der der Begleiter zum Versteck läuft und zum Beispiel taucht oder klettert. Bei „Bewegung reduzieren“ ist sie kürzer.
- **Fund-Verstecke** **[Festgelegt: Mischung, Öffnen kostet eine Frage]**: Nach der Szene kommt eine Frage aus dem Pool der Zettel (Abschnitt ZETTEL, sonst wie bei wilden Wesen), in einer der drei Formen, ohne Zeitdruck.
  - **Richtig:** 15 XP und ein Gegenstand aus der Tabelle des Verstecks: häufiger Schatz des Gebiets, Leckerli, Beere, Sternfrucht, Stein, selten der seltene Schatz des Gebiets. Gewichte stehen in `config.js`.
  - **Falsch:** nichts, das Versteck bleibt voll.
  - Die Antwort zählt in der Statistik wie ein Zettel.
- **Wesen-Verstecke:** Sie öffnen sich ohne Frage, und das versteckte Wesen des Gebiets erscheint zu einem wilden Duell. Danach ist Befreunden möglich.
- **Nachfüllen:** Ein geöffnetes Versteck füllt sich nach **10 Minuten Spielzeit** neu, wie die Zettel. Das gilt auch für Wesen-Verstecke.
- **Neue Wege:** Ein Versteck darf hinter einem Weg liegen, der nur mit der Gabe begehbar wird. Beispiele: Klarblick macht aus einer Luftspiegelung einen echten Pfad zu einer kleinen Oase, Aufwind trägt über eine Lücke auf eine Felsnadel. Solche Wege kommen dazu, es fällt keiner weg. Verlässt man sie ohne den passenden Begleiter, ist das kein Problem, denn der Rückweg bleibt offen. **(Claude)**
- Nur in Gebieten, deren Nebel schon gewichen ist. Verstecke hinter dem Nebel sind nicht erreichbar.

### 6.6 Spielaufgaben

**[Festgelegt: dazu ein paar reine Spielaufgaben als Pause]** Je Gebiet eine kleine Aufgabe ohne Lernfrage und ohne Gabe, etwa 1 bis 3 Minuten lang. Wer scheitert, setzt sie mit einem Tipp zurück, es gibt keine Strafe. Beim ersten Lösen gibt es den **seltenen Schatz des Gebiets** und ein Leckerli. Danach bleibt die Aufgabe gelöst. **(Claude)**

Vorschläge **(Claude)**. Der Builder darf eine Idee ersetzen, wenn sie auf der Karte nicht gut aufgeht:

| Gebiet | Aufgabe |
|---|---|
| 1 Bucht | **Möwenküken:** Drei Küken haben sich im Dorf versteckt (hinter Booten, Kisten, Büschen). Jedes gefundene läuft heim, die Möwenmutter belohnt. |
| 2 Flüsterwald | **Flüsterreihe:** Ein Zettel nennt, welche Bäume man in welcher Reihenfolge anspricht. Dann öffnet sich ein Astloch. |
| 3 Pilzmoor | **Irrlicht folgen:** Ein Irrlicht schwebt weiter, sobald man nah ist. Nach fünf Stationen liegt der Fund. |
| 4 Spiegeldünen | **Statuen drehen:** Mit A dreht man Glasstatuen, bis alle zum Leuchtstein schauen. |
| 5 Windklippen | **Windräder:** Wimpel zeigen die Windrichtung. Stehen drei Windräder richtig, steigt ein Drachen mit dem Fund auf. |
| 6 Uhrwerkruinen | **Schleuse:** Drei Hebel in der Reihenfolge einer Wandzeichnung lassen einen Kanal leerlaufen. |
| 7 Nordlichtsee | **Spuren im Schnee:** Frische Pfotenspuren führen zu einer Hasenfamilie, die etwas Schönes gefunden hat. |
| 8 Sternenwiese | **Sternbild:** Auf flache Steine treten, bis das Sternbild auf einer Tafel nachgelegt ist. |

### 6.7 Neue Wesen

**(Claude, vorgeschlagen)** Acht neue Arten, je eine pro Gebiet, die man **nur in ihrem Wesen-Versteck** trifft, nicht im Gras. Sie haben eine Stufe, ein Duellbild von 32 × 32, ein Kleinbild (6.3) und eine Glanzform mit 1 zu 64. Ihr Level liegt am oberen Rand des Gebiets. XP wie bei wilden Wesen des Gebiets. Namensvorschläge auf Deutsch, der Builder darf sie ändern:

| Gebiet | Name | Idee |
|---|---|---|
| 1 Bucht | Flaschling | wohnt in angespülten Flaschen und sammelt Briefe |
| 2 Flüsterwald | Wipfelwusel | winziges Kronenwesen mit Blattohren |
| 3 Pilzmoor | Glimmwurz | Wurzel mit Laternenblüte, wohnt in dunklen Wurzelgängen |
| 4 Spiegeldünen | Spiegelechse | zeigt sich nur, wer durch eine Luftspiegelung schaut |
| 5 Windklippen | Klingfeder | Vogel aus Federn und Glöckchen, nistet auf Felsnadeln |
| 6 Uhrwerkruinen | Rostbold | wohnt in rostigen Kisten und sammelt Schrauben |
| 7 Nordlichtsee | Eisflosse | Fisch mit Laternenflosse unter dem Eis |
| 8 Sternenwiese | Kometwiesel | hinterlässt leuchtende Pfotenspuren |

Die Optik bleibt eigenständig und märchenhaft wie die vorhandenen Wesen (Grunddesign 14).

### 6.8 Leckerli

Ein neuer Gegenstand im Fach „Futter“. Er füllt beim Befreunden vorab ein Feld (6.1). Leckerli brauchen keinen Futterplatz und haben keine Obergrenze. Man findet sie in Verstecken, bei Spielaufgaben und ab 1.3 am Aushang. **(Claude, vorgeschlagen)**

---

## 7. Fassung 1.3: Aushang und Wünsche

### 7.1 Aushang am Leuchtturm

**[Festgelegt: eigene Idee 1]**
- Eine Tafel in der Bucht neben dem Leuchtturm. Beim ersten Mal weist Ilvy darauf hin.
- Jeden **Kalendertag** (Datum des Geräts) gibt es **drei neue Aufgaben**. Sie entstehen beim ersten Start des Tages und stehen an der Tafel und im **Tagebuch** (neuer Abschnitt „Heute am Aushang“).
- Es gibt nur Aufgaben, die das Kind gerade schaffen kann: offene Gebiete, noch nicht befreundete Arten in offenen Gebieten, Verstecke für die Gaben, die es hat. **(Claude)** Arten von Aufgaben:
  - Befreunde ein Wesen in Gebiet X
  - Öffne n Verstecke
  - Beantworte n Fragen in Folge richtig
  - Gewinne n Duelle gegen wilde Wesen
  - Löse n Zettel
  - Finde einen Schatz
  - Besuche Gebiet X
  - Erfülle einen Wunsch (7.2)
  - n zwischen 2 und 5 (`config.js`)
- **Belohnung:** Ist eine Aufgabe erledigt, gibt es sofort ein Leckerli oder einen häufigen Schatz, mit kurzer Meldung und Jingle. Man muss dafür nicht zur Tafel laufen. Für alle drei Aufgaben eines Tages kommen eine Sternfrucht und 30 XP dazu. **(Claude)**
- Nicht erledigte Aufgaben verfallen beim Tageswechsel ohne Nachteil.

### 7.2 Wünsche der Bewohner

**[Festgelegt: eigene Idee 2]**
- In jedem Gebiet hat **ein Bewohner** Wünsche, nicht derjenige mit dem Auftrag, zusammen also 8. Hat er einen offenen Wunsch, zeigt eine kleine Sprechblase mit dem Schatzbild über ihm, was er sich wünscht.
- Ein Wunsch ist immer **ein Schatz**. Bevorzugt kommt er aus einem anderen offenen Gebiet, damit Kinder herumkommen. Ist er schwer zu bekommen, verrät der Bewohner, wo man ihn findet.
- Spricht man ihn an und hat den Schatz: „Gibst du mir …?“ [Ja] [Nein]. Für Ja gibt es eine Belohnung aus einer Tabelle: Sternfrucht, Stein, zwei Leckerli oder 30 XP. Der Schatz verlässt den Rucksack, sein Platz im Album bleibt gefüllt.
- Der **nächste Wunsch** kommt am nächsten Kalendertag. Das geht endlos weiter.
- Offene Wünsche stehen im Tagebuch. Im Rucksack zeigt die Karte eines Schatzes, wer ihn sich wünscht.
- Die Zeilen der Bewohner sind kurze Vorlagen mit Platzhalter für den Schatz, dazu je Bewohner ein eigener Satz, alles in vier Sprachen.

---

## 8. Spielstand

**[Festgelegt: Die Änderungen müssen mit den bisherigen Spielständen kompatibel sein.]**

| Fassung | Format | neu im Spielstand (Vorschlag für die Namen, Builder darf anpassen) | Umwandlung aus dem Vorgänger |
|---|---|---|---|
| 1.1 | 9 | `treasures` (Anzahl je Schatz), `album` (je gefundene Schätze) | leer |
| 1.2 | 10 | `friends` (je Art: Glanzform ja/nein), `companion` (Art oder null), `bag.treat`, `world.hideouts` (wann ein Versteck wieder voll ist), `tasks` (gelöste Spielaufgaben) | leer, kein Begleiter |
| 1.3 | 11 | `board` (Tag, drei Aufgaben, Fortschritt, abgeholt), `wishes` (je Bewohner: Schatz, Tag, erfüllt) | leer, wird beim ersten Start erzeugt |

- Für jedes Format: ein Schritt in `MIGRATIONS`, eine feste Testdatei `tests/fixtures/spielstand-v9.*` (v10, v11) und Tests, dass **alle** älteren Testdateien (v1 bis v8 und folgende) im neuen Format laden.
- **Wichtig:** Die Reparatur in `migrateState` baut den Stand Feld für Feld neu auf und wirft Unbekanntes weg (zum Beispiel kennt `repairWorld` nur `bushes`, `notes` und `finds`). Jedes neue Feld braucht deshalb eine eigene Reparatur, sonst geht es beim nächsten Laden verloren. Unbekannte Arten oder Schätze werden entfernt, Anzahlen auf sinnvolle Grenzen gesetzt, ein Begleiter, der kein Freund ist, wird zu null.
- Eine ältere Spielfassung, die einen neueren Stand findet, lädt ihn nicht und überschreibt ihn nicht (vorhandenes Verhalten „newer“). Das muss erhalten bleiben.
- Sicherungsdateien (Einstellungen → Spielstand sichern/laden) laufen durch dieselbe Umwandlung.
- Prüfcode, Verschleierung, Salze und Paketkennung bleiben unverändert (README).
- Freunde, Begleiter, Schätze, Album, Spielaufgaben, Aushang und Wünsche gehören **dem Kind**, nicht dem Lernpaket. Sie bleiben bei einem Paketwechsel erhalten (Grunddesign 10.4).

## 9. Für die Lehrkraft

- Statistikseite, Prüfcode und `lehrkraft.html` bleiben, wie sie sind. Antworten beim Befreunden und in Verstecken fließen wie Zettel-Antworten in Trefferquote, Themen und Fragenhistorie ein.
- Das Lernpaket ändert sich nicht. Bestehende Pakete laufen ohne Änderung.
- **(Claude)** Die Anleitung (`anleitung.html`) bekommt einen kurzen Absatz: Kinder können Wesen befreunden und Verstecke öffnen, auch das sind Fragen aus dem Paket und sie zählen in der Statistik. Die PDF-Kurzanleitung wird nur neu gebaut, wenn sich etwas darin Beschriebenes ändert.

## 10. Ton

Neu **(Claude)**:
- Effekt „Feld im Vertrauensring gefüllt“
- Jingle „Freundschaft“
- Effekt „Versteck öffnet sich“ (die Fund-Jingles bleiben)
- Effekt „Rucksack auf/zu“
- Jingle „Aufgabe am Aushang erledigt“

Alles wie bisher im Browser erzeugt (Grunddesign 15).

## 11. Prüfen

- `node --test` mit neuen Tests für:
  - Schätze und Album
  - Befreunden: 5 Fragen und 3 richtige, Leckerli, Glanzform-Aufwertung, wer befreundbar ist
  - Gaben-Zuordnung und Verstecke (bereit, Nachfüllen, Belohnung)
  - Aushang: nur machbare Aufgaben, Tageswechsel
  - Wünsche
  - alle Umwandlungen
- Die i18n-Tests und `?sprache=xx` finden vergessene Übersetzungen.
- **[Festgelegt: direkt veröffentlichen]** Claude prüft jede Fassung selbst im Browser in iPad-Größe mit Touch, im Quer- und Hochformat, und veröffentlicht sie danach direkt auf `digitalteaching/lumara`. Die Lehrkraft bekommt den Link. Eine eigene Testadresse gibt es nicht. Dabei geht es besonders um:
  - Rucksack-Knopf neben ☰
  - Öffnen und Antippen im Rucksack
  - Begleiter bei Gebietswechseln und auf Rutscheis
  - Tippen im Vertrauensring
- Vor dem Veröffentlichen wird außerdem ein echter Spielstand der Fassung 1.0.4 (Format 8) im Browser geladen. Danach wird geprüft, dass alles erhalten ist.
- Vor jedem Push wird das ganze Repo samt Historie nach Namen bestehender Spiele und Marken durchsucht.

## 12. Was dem Builder überlassen ist

- genaue Positionen von Garteneingang, Verstecken, Spielaufgaben, Tafel und Wunsch-Bewohnern auf den Karten
- alle Pixelbilder (Rucksack, Gegenstände, Schätze, Kleinbilder, neue Wesen, Verstecke), Animationen und ihre Zeiten
- Namen und Texte im Einzelnen, in vier Sprachen, auch Änderungen an den Namensvorschlägen in 5.2 und 6.7
- Ausgestaltung der Spielaufgaben (6.6), einschließlich Ersatz einer Idee
- alle Zahlen und Gewichte in `config.js`
- Aufteilung in Baupläne. Fassung 1.2 wird trotzdem als Ganzes veröffentlicht.
- Namen der neuen Felder im Spielstand
