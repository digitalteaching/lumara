// Gebiet 6: die Uhrwerkruinen (Design 5.3). 40 × 30 Felder.
// Eine versunkene Stadt aus Pflaster, Mauerresten und Kanälen. Westen: Eingang von den Windklippen.
// Norden: Zahnräder, die sich noch drehen, und im Becken die Sternwarte auf einer Insel (zu sehen,
// aber noch nicht erreichbar, Plan 4). Ein Kanal nach Süden trennt die Stadt; über die Brücke wacht
// der Erfinder. Süden: Nebel über dem Weg zum Nordlichtsee.

export const RUINEN = {
  id: 'ruinen',
  name: 'Uhrwerkruinen',
  genitive: 'der Uhrwerkruinen',
  area: 6,
  ground: 'cobble',
  rows: [
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWccccccccccccccccccccccccccc~~~~~~~~~WW',
    'WWcWWWccccccccccccccccccWWWcc~~~~~~~~~WW',
    'WWccccccccccccccccccccccWWWcc~~~ccc~~~WW',
    'WWccccccciiiiiiiccccccccccccc~~~ccc~~~WW',
    'WWccccccciiiiiiiccccccccccccc~~~ccc~~~WW',
    'WWccccccciiiiiiiccccccccccccc~~~~~~~~~WW',
    'WWccccccccccccccccccccccccccc~~~~~~~~~WW',
    'WW~~~~==~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~WW',
    'WW~~~~==~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~WW',
    'WWcccccccccccc~~ccccccccccccccccccccccWW',
    'WWcccccccccccc~~ccccccccccccccccccccccWW',
    'cccccccccccccc~~ccccccccciiiiiicccccccWW',
    'cccccccccccccc~~ccccccccciiiiiicccccccWW',
    'cccccccccciiic==ccccccccciiiiiicccccccWW',
    'cccccccccciiic~~ccccccccciiiiiicccccccWW',
    'WWcccccccciiic~~ccccccccccccccccccccccWW',
    'WWcccccWWccccc~~cccccc~~~cccccccccccccWW',
    'WWcccccWWWWWcc~~cccccc~~~cccccWWcccWWcWW',
    'WWcccccccccccc~~ccccccccccccccccccccccWW',
    'WWciiiiiiccccc~~cccWWWccccccccccccccccWW',
    'WWciiiiiiccccc~~ccccccccccccccccccccccWW',
    'WWciiiiiiccccc~~ccccccccccccccccccccccWW',
    'WWciiiiiiccccc~~ccccccccccccccccccccccWW',
    'WWciiiiiiccccc~~ccccccccccccccccccccccWW',
    'WWWWcccccccccc~~ccccccccccccccciiiiiWWWW',
    'WWWWcWWccccccc~~ccccccccccccccciiiiiWWWW',
    'WWWWWWWWWWWWWWWWWW%%%%WWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWW%%%%WWWWWWWWWWWWWWWWWW',
  ],
  legend: {
    c: 'cobble',
    '~': 'canal',
    '=': 'pier',
    W: 'ruinwall',
    i: 'ivy',
    '%': 'fog',
  },
  objects: [
    { type: 'beacon', number: 6, x: 33, y: 22 },
    {
      type: 'trainer', number: 6, x: 18, y: 15, dir: 'left', sight: 4, sprite: 'trainer6',
      afterWin: 'Dein Leuchtstein strahlt. Hörst du? Alle Zahnräder ticken wieder im Takt.',
    },

    {
      type: 'npc', id: 'greta', name: 'Greta', x: 25, y: 24, dir: 'left', sprite: 'greta',
      lines: [
        'Ich bin Greta, Mechanikerin. Ich öle die Zahnräder, die sich noch drehen.',
        'Niemand weiß, was sie antreibt. Aber wenn eins stehen bleibt, wird es kalt hier.',
        'Pass an den Kanälen auf. Das Wasser ist tief und still.',
      ],
      linesLit: ['Der Stein leuchtet! Hörst du das Ticken? Die Räder laufen wieder im Takt.'],
    },
    {
      type: 'npc', id: 'pino', name: 'Pino', x: 28, y: 5, dir: 'right', sprite: 'pino',
      lines: [
        'Ich bin Pino, der Fährmann. Nur mein Boot ist mir leider davongeschwommen.',
        'Siehst du die Sternwarte dort drüben? Sie steht auf einer Insel im Kanal.',
        'Hin kommt man nur mit einem Boot. Vielleicht finde ich meins eines Tages wieder.',
      ],
      linesLit: ['Seit der Stein leuchtet, glänzt die Kuppel der Sternwarte wieder. Schön, oder?'],
    },
    {
      type: 'npc', id: 'bo', name: 'Bo', x: 5, y: 17, dir: 'right', sprite: 'bo',
      lines: [
        'Hast du die Funken an den Zahnrädern gesehen? Ich zähle sie jeden Tag!',
        'Unter manchen Steinen liegen Zettel. Wer die Aufgabe löst, findet etwas.',
      ],
      linesLit: ['Heute sprühen die Zahnräder doppelt so viele Funken. Das warst du, oder?'],
    },

    { type: 'deco', id: 'zahnrad-nord-1', x: 10, y: 3, prop: 'gear', anim: true },
    { type: 'deco', id: 'zahnrad-nord-2', x: 16, y: 3, prop: 'gear', anim: true },
    { type: 'deco', id: 'zahnrad-nord-3', x: 21, y: 3, prop: 'gear', anim: true },
    { type: 'deco', id: 'zahnrad-ost', x: 36, y: 12, prop: 'gear', anim: true },
    { type: 'deco', id: 'zahnrad-sued', x: 27, y: 26, prop: 'gear', anim: true },
    // Die Sternwarte auf ihrer Insel: zu sehen, aber noch nicht erreichbar (Plan 4)
    { type: 'deco', id: 'sternwarte', x: 33, y: 6, prop: 'observatory' },

    { type: 'notestone', id: 'zettel-nord', x: 20, y: 6 },
    { type: 'notestone', id: 'zettel-west', x: 10, y: 25 },
    { type: 'notestone', id: 'zettel-ost', x: 36, y: 25 },
    { type: 'bush', id: 'strauch-west', x: 12, y: 12 },
    { type: 'bush', id: 'strauch-ost', x: 22, y: 13 },

    { type: 'sign', x: 3, y: 12, lines: ['Uhrwerkruinen', 'Bitte nicht in die Kanäle fallen. Die Zahnräder nicht anfassen.'] },
    {
      // Nebelrand zum Nordlichtsee (Design 10.4)
      type: 'sign', role: 'fogEdge', x: 17, y: 27, gate: 6, leadsTo: 7, leadsToName: 'der Nordlichtsee',
      lines: ['Der Nebel ist hier zu dicht.', 'Vielleicht weicht er, wenn der Leuchtstein der Ruinen wieder leuchtet.'],
      linesOpen: ['Süden: Nordlichtsee', 'Der Nebel hat sich zurückgezogen. Der Weg ist frei.'],
    },
  ],
  // Hinter dem Tor liegt Gebiet 7; den Ausgang dorthin gibt es, sobald es gebaut ist.
  gates: [{ id: 'sued', leadsTo: 7, x: 18, y: 28, w: 4, h: 2, ground: 'cobble' }],
  exits: [{ x: 0, y: 13, w: 1, h: 4, to: 'klippen', at: { x: 38, y: 14, dir: 'left' } }],
  finds: [
    { id: 'glitzer-nord', x: 12, y: 6 },
    { id: 'glitzer-west', x: 5, y: 23 },
    { id: 'glitzer-ost', x: 27, y: 14 },
  ],
  spawn: { x: 1, y: 14, dir: 'right' },
  respawn: { x: 33, y: 23, dir: 'up' },
  particles: ['spark', 'steam'], // Funken an den Zahnrädern und Dampf (Design 5.3)
};
