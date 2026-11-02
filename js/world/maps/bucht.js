// Gebiet 1: die Leuchtturmbucht (Design 5.3). 40 × 30 Felder.
// Norden: Nebel über dem Weg zum Flüsterwald. Mitte: Fischerdorf. Osten: Leuchtturm. Süden: Strand, Steg, Meer.

export const BUCHT = {
  id: 'bucht',
  name: 'Leuchtturmbucht',
  area: 1,
  rows: [
    'TTTTTTTTTTTTTTT%%%%%%%%%%TTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTTT%%%%%%%%%%TTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTTT%%%%%%%%%%TTTTTTTTTTTTTTT',
    'TTTTT.........TT..____..TT.........TTTTT',
    'TTTTT.............____......,,,,,,,,.TTT',
    'TTT..,,,,,..o.....____......,,,,,,,,..TT',
    'TT.,,,,,,,,.....T.____......,,,,,,,,..TT',
    'TT.,,,,,,,,.......____......,,,,,,,,..TT',
    'TT.,,,,,,,,.......____.T..............TT',
    'TT.,,,,,,,,.......____....**.....o....TT',
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
    { type: 'building', id: 'leuchtturm', x: 33, y: 12, w: 2, h: 4, sprite: 'lighthouse', door: { dx: 1, dy: 3 }, onDoor: 'heal' },
    { type: 'building', id: 'haus-oda', x: 9, y: 11, w: 3, h: 3, sprite: 'housePlum', door: { dx: 1, dy: 2 }, onDoor: 'locked', lines: ['Odas Haus. Die Tür ist verschlossen.'] },
    { type: 'building', id: 'haus-ilvy', x: 23, y: 11, w: 3, h: 3, sprite: 'houseTeal', door: { dx: 1, dy: 2 }, onDoor: 'locked', lines: ['Ilvys Haus. Die Tür ist verschlossen.'] },
    { type: 'building', id: 'haus-bram', x: 13, y: 16, w: 3, h: 3, sprite: 'house', door: { dx: 1, dy: 2 }, onDoor: 'locked', lines: ['Brams Haus. Die Tür ist verschlossen.'] },
    { type: 'building', id: 'boot', x: 20, y: 24, w: 2, h: 1, sprite: 'boat', door: { dx: 0, dy: 0 }, onDoor: 'locked', lines: ['Das Boot schaukelt sanft im Wasser.'] },

    {
      type: 'npc', id: 'ilvy', name: 'Ilvy', x: 35, y: 16, dir: 'left', sprite: 'ilvy',
      lines: [
        'Willkommen in der Leuchtturmbucht! Ich passe hier auf den Leuchtturm auf.',
        'Der Nebel des Vergessens liegt über der Insel. Nur Wissen kann ihn vertreiben.',
        'Ist dein Wesen erschöpft, komm zur Tür des Leuchtturms. Sein Licht gibt neue Kraft.',
        'Die Hüterin der Bucht wartet oben am Nordweg. Zeig ihr, was du gelernt hast!',
      ],
    },
    {
      type: 'npc', id: 'bram', name: 'Bram', x: 18, y: 26, dir: 'right', sprite: 'fischer',
      lines: [
        'Ahoi! Hier am Steg legen die Boote an.',
        'Die Hüterin der Bucht steht oben am Nordweg, kurz vor dem Nebel.',
        'Wer an ihr vorbei will, muss ihre Fragen beantworten.',
      ],
    },
    {
      type: 'npc', id: 'pim', name: 'Pim', x: 11, y: 8, dir: 'left', sprite: 'kind',
      lines: [
        'Pass auf! Im hohen Gras wohnen wilde Wesen.',
        'Wenn dir eins zu stark ist, kannst du mit B fliehen.',
      ],
    },
    {
      type: 'npc', id: 'oda', name: 'Oda', x: 12, y: 13, dir: 'down', sprite: 'netz',
      lines: [
        'Früher leuchteten acht Leuchtsteine über der Insel.',
        'Seit sie erloschen sind, kommt der Nebel jedes Jahr ein Stück näher.',
        'Vielleicht kannst du sie wieder zum Leuchten bringen?',
      ],
    },

    { type: 'trainer', number: 1, x: 22, y: 6, dir: 'left', sight: 4, sprite: 'trainer1' },

    {
      type: 'sign', x: 17, y: 3,
      lines: ['Der Nebel ist hier zu dicht.', 'Vielleicht weicht er, wenn der Leuchtstein der Bucht wieder leuchtet.'],
    },
    { type: 'sign', x: 22, y: 13, lines: ['Leuchtturmbucht', 'Norden: Flüsterwald · Osten: Leuchtturm'] },
  ],
  spawn: { x: 19, y: 24, dir: 'up' },
  respawn: { x: 34, y: 16, dir: 'down' },
};
