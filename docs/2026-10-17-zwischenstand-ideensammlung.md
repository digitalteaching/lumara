# Lernspiel als Rollenspiel – Zwischenstand der Ideensammlung

Stand: 17.10.2026 · Status: **Ideensammlung läuft noch, es wurde noch nichts gebaut.**

Ein Rollenspiel im Stil alter Handheld-Konsolen, mit eigener Optik und eigener Welt. Schülerinnen und Schüler üben darin Vokabeln und Grammatik. Die Inhalte sollen sich je nach Fach austauschen lassen, das Spiel selbst bleibt gleich.

## Bereits festgelegt

### Zielgruppe und Technik
- Sekundarstufe 1. Die erste Version ist für **Jahrgang 6 Englisch**.
- Das Spiel läuft auf **Tablet und PC**. Jedes Kind hat ein eigenes Gerät.
- Das Spiel ist **reines HTML** und wird per Link verteilt, zum Beispiel über **GitHub Pages**. Es gibt keinen Server und keine Anmeldung.
- Der Spielstand wird im Browser auf dem Gerät gespeichert, verschlüsselt bzw. verschleiert, damit man ihn nicht einfach ändern kann.

### Spielstart
- Das Kind gibt seinen Namen ein.
- Es wählt eines von **5 Wesen**. Jedes Wesen entwickelt sich mehrfach und wird dabei größer und eindrucksvoller.

### Welt
- Eine eigene, **geheimnisvolle Welt**, ausdrücklich keine Schule. Draußen gibt es Landschaft, dazu kommt eine **Höhle**, die man betreten kann.
- Die Welt soll sich wie eine **offene Welt** anfühlen. Insgesamt ist der Weg aber **geradlinig**, ohne dass es sofort auffällt.
- Die Spielfigur wird gesteuert und kann andere Figuren ansprechen.

### Duelle
- Gegner sind **computergesteuerte Trainer** (keine Duelle zwischen Kindern).
- Ablauf: Zuerst ein **kurzer Dialog auf Englisch**, dann das Duell: eigenes Wesen gegen das Wesen des Trainers, beide mit Energieleiste.
- Der Trainer stellt Fragen zu Vokabeln oder Grammatik.
  - Eine **richtige Antwort** kostet das gegnerische Wesen Energie.
  - Eine **falsche Antwort** kostet das eigene Wesen Energie.
- Drei Antwortarten wechseln sich **zufällig ab**:
  - A: Auswahl aus 4 Antworten
  - B: Antwort selbst eintippen
  - C: Satz aus Wortkärtchen bauen
- Nur ein **Sieg** bringt Punkte (XP).
- Bei einer **Niederlage** bekommt man nichts, kann den Trainer aber unbegrenzt erneut herausfordern.
- Die Trainer sind **unterschiedlich schwer**, zum Beispiel durch schwerere Fragen, Zeitdruck oder ein Wesen mit mehr Energie.

### Verlauf und Ende
- Es gibt **8 Trainer** entlang des Wegs, die nacheinander schwerer werden. Am Ende wartet ein **Endgegner in der Höhle**.
- Danach geht das Spiel **endlos** weiter:
  - Besiegte Trainer kann man erneut herausfordern. Sie sind dann stärker.
  - Im hohen Gras tauchen wilde Wesen für kurze Duelle auf.
  - Unter Steinen liegen immer wieder neue Zettel.
- Die Aufgaben werden jedes Mal zufällig aus dem Aufgabenpaket gezogen.
- Die Wesen können bis **Level 100** steigen. Jedes Level braucht mehr XP als das vorige.
- Die Wesen entwickeln sich an festen Stufen, vorgeschlagen sind Level 15, 35 und 60.

### Sammeln und Gegenstände
- **Futter** aufsammeln und das Wesen damit füttern. Futter füllt die Energie auf, auch zwischen den Duellen.
- **Seltene Steine** findet man im hohen Gras. Sie machen das Wesen stärker, etwa durch mehr Energie oder einen Joker im Duell, der zwei falsche Antworten wegstreicht.
- **Zettel unter Steinen** enthalten kleine Aufgaben. Wer sie löst, bekommt eine Belohnung.

### Überblick für die Lehrkraft
- In den Einstellungen gibt es eine **Statistikseite**: Name, Level, Entwicklungsstufe, gewonnene Duelle, Trefferquote und Spielzeit.
- Unter der Statistik steht ein **Prüfcode**, der aus allen Werten berechnet wird.
- Eine eigene **Prüfseite für die Lehrkraft** zeigt anhand eines Screenshots (Werte und Code), ob die Angaben echt sind.
- Das ist bewusst **nicht ganz fälschungssicher**, weil es keinen Server gibt. Für Jahrgang 6 reicht das aber aus.

### Austauschbare Inhalte
- Die Inhalte stehen in einer **Textdatei nach Vorlage**, die Lehrkräfte selbst bearbeiten und hochladen können.
- Austauschbar sind die Themen und Namen der Trainer, ihre Dialoge, die Fragen pro Thema und die Zettelaufgaben. Dialoge sind also zum Beispiel für Französisch auch auf Französisch.
- Welt, Wesen und Spielregeln bleiben immer gleich.

## Noch offen
1. **Inhalt Jahrgang 6 Englisch** (die letzte offene Frage): Welches Lehrbuch wird benutzt (Access, Green Line, Camden Town …)? Welche Themen und Grammatikbereiche decken die 8 Trainer ab? Oder schlägt Claude selbst einen ersten Fragensatz vor?
2. **Optik und Stil**: Wie sollen Welt und Wesen aussehen? Das soll im Browser mit Entwürfen besprochen werden.
3. **Steuerung am Tablet**: Steuerkreuz auf dem Bildschirm, Tippen zum Laufen oder etwas anderes?
4. **Ton**: Musik und Soundeffekte, ja oder nein?
5. **Gespräche mit Figuren**: Gibt es neben den Trainern weitere Figuren, die Aufträge vergeben (Quests), oder nur Hinweise?
6. Danach: Claude schreibt das vollständige Design-Dokument mit Prüfung durch einen Reviewer und anschließend einen Bauplan.

## Bisherige Entwürfe
- Antwortarten im Duell: `docs/entwuerfe/duell-antwortformen.html`. Das ist ein Ausschnitt, der nur im Browser-Werkzeug der Ideensammlung vollständig dargestellt wird.
