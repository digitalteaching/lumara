// Gebiet 1: die Leuchtturmbucht (Design 5.3). 40 × 30 Felder.
// Norden: Nebel über dem Weg zum Flüsterwald. Mitte: Fischerdorf. Osten: Leuchtturm. Süden: Strand, Steg, Meer.
// Nordosten: Nebel über dem steilen Pfad hinauf zur Sternenwiese (offen nach dem Sieg über Trainer 8).

export const BUCHT = {
  id: 'bucht',
  name: 'Leuchtturmbucht',
  genitive: 'der Leuchtturmbucht',
  area: 1,
  rows: [
    'TTTTTTTTTTTTTTT%%%%%%%%%%TTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTTT%%%%%%%%%%TTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTTT%%%%%%%%%%TTTTTTTTTTTTTTT',
    'TTTTT.........TT..____..TT.........TTTTT',
    'TTTTT.............____......,,,,,,,,.TTT',
    'TTT..,,,,,..o.....____......,,,,,,,,..%%',
    'TT.,,,,,,,,.....T.____......,,,,,,,,..%%',
    'TT.,,,,,,,,.......____......,,,,,,,,..%%',
    'TT.,,,,,,,,.......____.T..............%%',
    'TT.,,,,,,,,.......____....**.....o.....T',
    'TT.,,,,,,,,.......____....**..........TT',
    'TT................____...............~~~',
    'TT.o.####.........____.....####.....~~~~',
    'TT................____..............~~~~',
    'TT...___________________________....~~~~',
    'TT.T.___________________________....~~~~',
    'TT....****........____.***....______~~~~',
    'TT....****..T.....____.***..T.______~~~~',
    'TT::::::::::::::::____::::::::......~~~~',
    'TTo:::::::::::::::____::::::::......~~~~',
    '::::::::::::::::::____::::::::^^^^^^^~~~',
    ':::::::::::::::o::____:::::o::::::::~~~~',
    '::::::::::::::::::==::::::::::::::::~~~~',
    '~~~~~~~~~~~~~~~~~~==~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~==~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~==~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~==~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~==~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
  ],
  legend: {
    '.': 'grass',
    ',': 'tallgrass',
    _: 'path',
    ':': 'sand',
    '~': 'water',
    T: 'tree',
    o: 'rock',
    '#': 'fence',
    '%': 'fog',
    '^': 'cliff',
    '*': 'flowers',
    '=': 'pier',
  },
  objects: [
    // Nach dem Finale (Design 9): Morrow wohnt am Leuchtturm. Als Nebelwesen schwebt es über dem Wasser
    // neben dem Weg; so bleibt jedes Feld frei, auf dem man früher stehen konnte.
    {
      type: 'npc', id: 'morrow', name: 'Morrow', x: 36, y: 17, dir: 'left', sprite: 'morrow', when: 'afterFinale', // schwebt über dem Wasser
      lines: ['Hier sehe ich die ganze Insel. Und jeden Tag kommt jemand vorbei!', 'Danke, dass du dich an mich erinnert hast.'],
    },
    // Geheimer Ort (Design 5.7): am Ende des Stegs ein Pfahl, mit der Nussschale zur Gezeiteninsel
    {
      type: 'secret', id: 'steg-gezeiten', place: 'gezeiten', prop: 'boatpost', x: 19, y: 28,
      to: { map: 'gezeiten', x: 8, y: 10, dir: 'up' },
      lines: ['Am Ende des Stegs steht ein Pfahl mit einem alten Seil.', 'Draußen liegt eine kleine Insel. Mit einem Boot käme man hinüber.'],
      linesOpen: ['Du setzt die Nussschale aufs Wasser und ruderst zur Gezeiteninsel.'],
    },
    { type: 'building', id: 'leuchtturm', x: 33, y: 12, w: 2, h: 4, sprite: 'lighthouse', door: { dx: 1, dy: 3 }, onDoor: 'heal' },
    { type: 'building', id: 'haus-oda', x: 9, y: 11, w: 3, h: 3, sprite: 'housePlum', door: { dx: 1, dy: 2 }, onDoor: 'locked', lines: ['Odas Haus. Die Tür ist verschlossen.'] },
    { type: 'building', id: 'haus-ilvy', x: 23, y: 11, w: 3, h: 3, sprite: 'houseTeal', door: { dx: 1, dy: 2 }, onDoor: 'locked', lines: ['Ilvys Haus. Die Tür ist verschlossen.'] },
    { type: 'building', id: 'haus-bram', x: 13, y: 16, w: 3, h: 3, sprite: 'house', door: { dx: 1, dy: 2 }, onDoor: 'locked', lines: ['Brams Haus. Die Tür ist verschlossen.'] },
    { type: 'building', id: 'boot', x: 20, y: 24, w: 2, h: 1, sprite: 'boat', door: { dx: 0, dy: 0 }, onDoor: 'locked', lines: ['Das Boot schaukelt sanft im Wasser.'] },

    {
      type: 'npc', id: 'ilvy', name: 'Ilvy', x: 35, y: 16, dir: 'left', sprite: 'ilvy',
      linesAfter: ['Morrow wohnt jetzt bei uns am Leuchtturm. Ich bringe ihm jeden Abend Tee.'],
      lines: [
        'Willkommen in der Leuchtturmbucht! Ich passe hier auf den Leuchtturm auf.',
        'Der Nebel des Vergessens liegt über der Insel. Nur Wissen kann ihn vertreiben.',
        'Ist dein Wesen erschöpft, komm zur Tür des Leuchtturms. Sein Licht gibt neue Kraft.',
        'Die Hüterin der Bucht wartet oben am Nordweg. Zeig ihr, was du gelernt hast!',
      ],
      linesLit: ['Der Leuchtstein der Bucht leuchtet wieder! Ich wusste, dass du es schaffst.'],
      linesOpen: [
        'Der Leuchtstein der Bucht leuchtet wieder! Ich wusste, dass du es schaffst.',
        'Nördlich der Bucht liegt der Flüsterwald. Hör gut zu, was die Bäume dort flüstern.',
      ],
    },
    {
      type: 'npc', id: 'bram', name: 'Bram', x: 18, y: 26, dir: 'right', sprite: 'fischer',
      linesAfter: ['Kein Nebel mehr über dem Wasser! Ich sehe bis zum Horizont.'],
      lines: [
        'Ahoi! Hier am Steg legen die Boote an.',
        'Die Hüterin der Bucht steht oben am Nordweg, kurz vor dem Nebel.',
        'Wer an ihr vorbei will, muss ihre Fragen beantworten.',
      ],
      linesLit: ['Der Leuchtstein strahlt! Jetzt fange ich wieder Fische bei Nacht.'],
      linesOpen: ['Hast du den Nebel im Norden gesehen? Er ist weg!'],
    },
    {
      type: 'npc', id: 'pim', name: 'Pim', x: 11, y: 8, dir: 'left', sprite: 'kind',
      linesAfter: ['Morrow hat mir gezeigt, wie man Echos fängt. Hallo-o-o!'],
      lines: [
        'Pass auf! Im hohen Gras wohnen wilde Wesen.',
        'Wenn dir eins zu stark ist, kannst du mit B fliehen.',
      ],
      linesLit: ['Ich habe gesehen, wie der Stein aufgeleuchtet hat. So hell!'],
    },
    {
      type: 'npc', id: 'oda', name: 'Oda', x: 12, y: 13, dir: 'down', sprite: 'netz',
      linesAfter: ['Ich erinnere mich wieder an alle Lieder meiner Großmutter. Danke!'],
      lines: [
        'Früher leuchteten acht Leuchtsteine über der Insel.',
        'Seit sie erloschen sind, kommt der Nebel jedes Jahr ein Stück näher.',
        'Vielleicht kannst du sie wieder zum Leuchten bringen?',
      ],
      linesLit: ['Ein Leuchtstein leuchtet wieder. Vielleicht kommen die anderen auch zurück.'],
    },

    {
      type: 'trainer', number: 1, x: 22, y: 6, dir: 'left', sight: 4, sprite: 'trainer1',
      afterWin: 'Dein Leuchtstein strahlt. Der Weg in den Flüsterwald ist frei.',
    },

    {
      // Nebelrand zum Flüsterwald (Design 10.4): Der Text hängt vom Stand ab, siehe world/fogEdge.js.
      type: 'sign', id: 'nebel-nord', role: 'fogEdge', x: 17, y: 3, gate: 1, leadsTo: 2, leadsToName: 'der Flüsterwald',
      lines: ['Der Nebel ist hier zu dicht.', 'Vielleicht weicht er, wenn der Leuchtstein der Bucht wieder leuchtet.'],
      linesOpen: ['Norden: Flüsterwald', 'Der Nebel hat sich zurückgezogen. Der Weg ist frei.'],
    },
    {
      // Nebelrand zur Sternenwiese: Der Pfad öffnet sich erst, wenn der achte Leuchtstein leuchtet.
      // Das Schild steht auf einem früheren Baumfeld, damit jede alte Position begehbar bleibt.
      type: 'sign', id: 'nebel-ost', role: 'fogEdge', x: 38, y: 9, gate: 8, leadsTo: 8, leadsToName: 'die Sternenwiese',
      lines: ['Ein steiler Pfad führt nach oben, doch der Nebel ist zu dicht.', 'Man sagt, er weicht erst, wenn der letzte Leuchtstein wieder leuchtet.'],
      linesOpen: ['Osten: Sternenwiese', 'Der Nebel hat sich zurückgezogen. Der Pfad ist frei.'],
    },
    { type: 'sign', id: 'schild-dorf', x: 22, y: 13, lines: ['Leuchtturmbucht', 'Norden: Flüsterwald · Osten: Leuchtturm'] },

    // Leuchtstein der Bucht, neben dem Nordweg und außerhalb des Blicks der Trainerin
    { type: 'beacon', number: 1, x: 24, y: 4 },
    { type: 'bush', id: 'strauch-dorf', x: 6, y: 13 },
    { type: 'notestone', id: 'zettel-wiese', x: 4, y: 16 },
    { type: 'notestone', id: 'zettel-ost', x: 31, y: 9 },
    { type: 'notestone', id: 'zettel-strand', x: 12, y: 21 },
  ],
  // Nebeltor über dem Nordweg: weicht, wenn Stein 1 leuchtet und das Paket Thema 2 hat
  gates: [
    { id: 'nord', leadsTo: 2, x: 18, y: 0, w: 4, h: 3, ground: 'path' },
    // Der steile Pfad hinauf zur Sternenwiese: erst nach dem Sieg über Trainer 8 (Design 5.2). Damit
    // ist der Ring der Insel geschlossen.
    { id: 'ost', leadsTo: 8, afterStone: 8, x: 38, y: 5, w: 2, h: 4, ground: 'path' },
  ],
  exits: [
    { x: 18, y: 0, w: 4, h: 1, to: 'wald', at: { x: 19, y: 28, dir: 'up' } },
    { x: 39, y: 5, w: 1, h: 4, to: 'wiese', at: { x: 1, y: 21, dir: 'right' } },
  ],
  finds: [
    { id: 'glitzer-west', x: 5, y: 7 },
    { id: 'glitzer-ost', x: 32, y: 5 },
  ],
  spawn: { x: 19, y: 24, dir: 'up' },
  respawn: { x: 34, y: 16, dir: 'down' },
  particles: ['gull', 'spray'], // Möwen und Gischt am Ufer (Design 5.3)
};
