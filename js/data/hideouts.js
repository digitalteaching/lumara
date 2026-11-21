// Verstecke (Lumara 1.2, Spec 6.5): fünf je Gebietskarte, zusammen 40. Sie sind Daten, keine
// Kartenobjekte: Jedes liegt auf einem Feld, auf dem man nicht stehen kann (Wasser, Baum, Fels,
// Mauer, Wolken …), und man spricht es vom Nachbarfeld aus an. So ändert sich an keiner Karte, wo man
// stehen kann. Je Gebiet: ein Wesen-Versteck mit der Gabe des Gebiets (dort wartet das versteckte
// Wesen, HIDDEN_SPECIES) und vier Fund-Verstecke, mindestens eins mit der eigenen Gabe und mindestens
// zwei mit Gaben anderer Gebiete, einer früheren und einer späteren. Die Spürnase öffnet nichts.
// IDs und Gaben sind englisch; was man dort sieht, steht im Kommentar. tests/hideouts.test.js prüft
// Verteilung, Felder und Vorfelder.

// Auf diesen Kachelarten darf ein Versteck der Gabe liegen.
export const GIFT_TILES = {
  beachcomb: ['water', 'rock', 'dune'],
  climb: ['tree', 'fortree', 'snowpine'],
  glow: ['mushroom', 'glowshroom', 'rock', 'ruinwall', 'nightrock'],
  clearsight: ['mirage', 'clouds'],
  updraft: ['clouds', 'spire', 'cliff', 'nightcliff', 'dune'],
  tinker: ['ruinwall', 'fence', 'rock', 'nightrock'],
  dive: ['water', 'icewater', 'canal', 'bog'],
  startrail: ['nightrock', 'nightstone', 'nightcliff', 'rock', 'dune', 'clouds', 'snowpine'],
};

export const HIDEOUTS = [
  // Gebiet 1: Leuchtturmbucht
  { id: 'bucht-bottle', map: 'bucht', x: 6, y: 23, gift: 'beachcomb', kind: 'creature' }, // im flachen Wasser am Strand schaukelt eine Flasche, darin regt sich etwas
  { id: 'bucht-sandrock', map: 'bucht', x: 27, y: 21, gift: 'beachcomb', kind: 'find' }, // am Fels mitten am Strand ist etwas im Sand vergraben
  { id: 'bucht-crevice', map: 'bucht', x: 2, y: 19, gift: 'beachcomb', kind: 'find' }, // in der Felsspalte am Westende des Strands klemmt angespültes Strandgut
  { id: 'bucht-ledge', map: 'bucht', x: 33, y: 20, gift: 'updraft', kind: 'find' }, // oben auf der kleinen Klippe am Strand liegt ein Möwennest
  { id: 'bucht-seabed', map: 'bucht', x: 17, y: 25, gift: 'dive', kind: 'find' }, // neben dem Steg glitzert etwas auf dem Grund

  // Gebiet 2: Flüsterwald
  { id: 'wald-treetop', map: 'wald', x: 13, y: 9, gift: 'climb', kind: 'creature' }, // in der Krone des einzelnen Baums auf der Lichtung raschelt es
  { id: 'wald-nest', map: 'wald', x: 38, y: 19, gift: 'climb', kind: 'find' }, // hoch oben in einem Baum am Ostrand ein Nest
  { id: 'wald-brook', map: 'wald', x: 10, y: 15, gift: 'beachcomb', kind: 'find' }, // am Südufer des Bachs hat sich eine Flaschenpost verfangen
  { id: 'wald-toadstool', map: 'wald', x: 14, y: 23, gift: 'glow', kind: 'find' }, // unter einem großen Pilz ist ein dunkles Loch
  { id: 'wald-streambed', map: 'wald', x: 30, y: 14, gift: 'dive', kind: 'find' }, // im Bach, östlich der Brücke, glitzert etwas am Grund

  // Gebiet 3: Pilzmoor
  { id: 'moor-roots', map: 'moor', x: 36, y: 21, gift: 'glow', kind: 'creature' }, // unter einem Leuchtpilz am Ostrand führt ein dunkler Wurzelgang in den Boden
  { id: 'moor-glowcap', map: 'moor', x: 4, y: 3, gift: 'glow', kind: 'find' }, // zwischen den Leuchtpilzen oben im Nordwesten eine finstere Höhle
  { id: 'moor-hollow', map: 'moor', x: 25, y: 26, gift: 'glow', kind: 'find' }, // ein Leuchtpilz am Eingang, dahinter ein Schattenloch
  { id: 'moor-nest', map: 'moor', x: 1, y: 20, gift: 'climb', kind: 'find' }, // ein Nest hoch in einem Baum am Westrand der Marsch
  { id: 'moor-bogpool', map: 'moor', x: 18, y: 13, gift: 'dive', kind: 'find' }, // neben dem Steg blubbert das Moorwasser, tief unten glitzert etwas

  // Gebiet 4: Spiegeldünen
  { id: 'duenen-mirage', map: 'duenen', x: 8, y: 14, gift: 'clearsight', kind: 'creature' }, // am Anfang der Luftspiegelung im Westen flimmert ein Schatten
  { id: 'duenen-shimmer', map: 'duenen', x: 13, y: 6, gift: 'clearsight', kind: 'find' }, // in der Luftspiegelung, die zum Glasturm zu führen scheint, schimmert etwas
  { id: 'duenen-bottle', map: 'duenen', x: 14, y: 24, gift: 'beachcomb', kind: 'find' }, // aus der kleinen Düne im Süden ragt der Hals einer Flasche
  { id: 'duenen-tracks', map: 'duenen', x: 25, y: 21, gift: 'startrail', kind: 'find' }, // leise glimmende Spuren führen in die kleine Düne östlich vom Weg
  { id: 'duenen-crest', map: 'duenen', x: 30, y: 1, gift: 'updraft', kind: 'find' }, // oben auf dem hohen Dünenkamm im Norden glänzt etwas in der Sonne

  // Gebiet 5: Windklippen
  { id: 'klippen-chimes', map: 'klippen', x: 11, y: 5, gift: 'updraft', kind: 'creature' }, // auf der Felsnadel direkt an der Plattform klingen im Wind kleine Glöckchen
  { id: 'klippen-ledge', map: 'klippen', x: 29, y: 14, gift: 'updraft', kind: 'find' }, // ein Sims über den Wolken, vor der Felsnadel am Gipfel
  { id: 'klippen-outcrop', map: 'klippen', x: 24, y: 25, gift: 'updraft', kind: 'find' }, // unter der Südkante ragt ein Felsvorsprung aus den Wolken
  { id: 'klippen-cloudbank', map: 'klippen', x: 3, y: 10, gift: 'clearsight', kind: 'find' }, // im Wolkenmeer am Eingang zeichnet sich ein Schatten ab
  { id: 'klippen-stardust', map: 'klippen', x: 34, y: 21, gift: 'startrail', kind: 'find' }, // unter dem Gipfel führt eine Spur aus Sternenstaub über die Wolken

  // Gebiet 6: Uhrwerkruinen
  { id: 'ruinen-crate', map: 'ruinen', x: 25, y: 4, gift: 'tinker', kind: 'creature' }, // an der Mauer bei den Zahnrädern steht eine rostige Kiste, darin klappert etwas
  { id: 'ruinen-niche', map: 'ruinen', x: 4, y: 3, gift: 'tinker', kind: 'find' }, // ein Mauerfach mit verrostetem Riegel im Nordwesten
  { id: 'ruinen-lockbox', map: 'ruinen', x: 9, y: 19, gift: 'tinker', kind: 'find' }, // in der Mauer im Südwesten ein Kasten mit rostigem Schloss
  { id: 'ruinen-crack', map: 'ruinen', x: 36, y: 19, gift: 'glow', kind: 'find' }, // ein dunkler Spalt in der Mauer im Osten
  { id: 'ruinen-basin', map: 'ruinen', x: 23, y: 19, gift: 'dive', kind: 'find' }, // im kleinen Becken auf dem Platz glitzert etwas am Grund

  // Gebiet 7: Nordlichtsee
  { id: 'see-icehole', map: 'see', x: 16, y: 18, gift: 'dive', kind: 'creature' }, // unter dem Eisloch zieht ein Schatten mit einem Licht seine Kreise
  { id: 'see-glint', map: 'see', x: 10, y: 11, gift: 'dive', kind: 'find' }, // tief im Eisloch im Westen glitzert etwas
  { id: 'see-hole', map: 'see', x: 30, y: 17, gift: 'dive', kind: 'find' }, // im Eisloch im Osten liegt etwas auf dem Grund
  { id: 'see-nest', map: 'see', x: 36, y: 11, gift: 'climb', kind: 'find' }, // in einer verschneiten Tanne am Ostufer ein Nest
  { id: 'see-trail', map: 'see', x: 13, y: 25, gift: 'startrail', kind: 'find' }, // zwischen den Tannen im Süden glimmt eine Spur

  // Gebiet 8: Sternenwiese
  { id: 'wiese-pawprints', map: 'wiese', x: 25, y: 22, gift: 'startrail', kind: 'creature' }, // leuchtende Pfotenspuren führen zu einem Felsen und enden dort
  { id: 'wiese-boulder', map: 'wiese', x: 14, y: 11, gift: 'startrail', kind: 'find' }, // um den Felsblock bei den Nachtschafen glimmen Spuren
  { id: 'wiese-mountain', map: 'wiese', x: 15, y: 4, gift: 'startrail', kind: 'find' }, // am Fuß des Bergs verschwindet eine glimmende Spur im Stein
  { id: 'wiese-ledge', map: 'wiese', x: 34, y: 8, gift: 'updraft', kind: 'find' }, // oben auf der Nachtklippe am Hügel liegt etwas im Sternenlicht
  { id: 'wiese-chest', map: 'wiese', x: 3, y: 26, gift: 'tinker', kind: 'find' }, // zwischen den Felsen im Südwesten klemmt eine alte, rostige Kiste
];
