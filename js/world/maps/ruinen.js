// Gebiet 6: die Uhrwerkruinen (Design 5.3). 40 × 30 Felder.
// Eine versunkene Stadt aus Pflaster, Mauerresten und Kanälen. Westen: Eingang von den Windklippen.
// Norden: Zahnräder, die sich noch drehen, und im Becken die Sternwarte auf einer Insel (zu sehen,
// aber noch nicht erreichbar, Plan 4). Ein Kanal nach Süden trennt die Stadt; über die Brücke wacht
// der Erfinder. Süden: Nebel über dem Weg zum Nordlichtsee.

export const RUINEN = {
  id: 'ruinen',
  name: 'Uhrwerkruinen',
  genitive: 'der Uhrwerkruinen',
  at: 'in den Uhrwerkruinen', // „Freunde dich … an“
  to: 'die Uhrwerkruinen', // „Besuche …“
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
    // Geheimer Ort (Design 5.7): die Sternentafel am Kanal, mit der Sternkarte hinüber zur Sternwarte
    {
      type: 'secret', id: 'tafel-sternwarte', place: 'sternwarte', prop: 'starplaque', x: 28, y: 7,
      to: { map: 'sternwarte', x: 9, y: 10, dir: 'up' },
      lines: ['Eine Tafel aus Stein mit Sternbildern. Hinter dem Kanal wartet die Sternwarte.', 'Wer eine Sternkarte hätte, könnte die Tafel lesen.'],
      linesOpen: ['Du hältst die Sternkarte an die Tafel. Die Sterne darauf leuchten auf.', 'Eine schmale Brücke schiebt sich über den Kanal.'],
    },
    { type: 'beacon', number: 6, x: 33, y: 22 },
    {
      type: 'trainer', number: 6, x: 18, y: 15, dir: 'left', sight: 4, sprite: 'trainer6',
      afterWin: 'Dein Leuchtstein strahlt. Hörst du? Alle Zahnräder ticken wieder im Takt.',
    },

    {
      type: 'npc', id: 'greta', name: 'Greta', x: 25, y: 24, dir: 'left', sprite: 'greta',
      linesAfter: ['Mir ist warm, die Räder laufen, und der Nebel ist fort. Was für ein Tag!'],
      lines: [
        'Ich bin Greta, Mechanikerin. Ich öle die Zahnräder, die sich noch drehen.',
        'Niemand weiß, was sie antreibt. Aber wenn eins stehen bleibt, wird es kalt hier.',
        'Pass an den Kanälen auf. Das Wasser ist tief und still.',
      ],
      linesLit: ['Der Stein leuchtet! Hörst du das Ticken? Die Räder laufen wieder im Takt.'],
    },
    {
      type: 'npc', id: 'pino', name: 'Pino', x: 28, y: 5, dir: 'right', sprite: 'pino',
      linesAfter: ['Mit meiner neuen Fähre bringe ich Leute zum Leuchtturm, zu Morrow.'],
      lines: [
        'Ich bin Pino, der Fährmann. Nur mein Boot ist mir leider davongeschwommen.',
        'Siehst du die Sternwarte hinter dem Kanal? An ihrer Tafel leuchten Sternbilder.',
        'Wer die Sterne dort lesen kann, findet den Weg hinüber. Ich kann es leider nicht.',
      ],
      linesLit: [
        'Seit der Stein leuchtet, glänzt die Kuppel der Sternwarte wieder. Schön, oder?',
        'Mit der Nussschale kommst du zu den kleinen Inseln: vor der Bucht und im Moor.',
      ],
    },
    {
      type: 'npc', id: 'bo', name: 'Bo', x: 5, y: 17, dir: 'right', sprite: 'bo',
      linesAfter: ['Die Zahnräder ticken im Takt eines Liedes. Morrow hat es mir vorgesummt.'],
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
    // Die Sternwarte hinter dem Kanal: mit der Sternkarte über die Tafel am Kanal erreichbar
    { type: 'deco', id: 'sternwarte', x: 33, y: 6, prop: 'observatory' },

    // Spielaufgabe (Lumara 1.2, js/data/tasks.js): drei Hebel an der Südmauer, daneben eine
    // Wandzeichnung mit ihrer Reihenfolge. Richtig gezogen läuft das Kanalstück hinter der Schleuse
    // leer (TASKS[6].chamber, nur ein Bild: Die Kacheln bleiben Kanal).
    { type: 'task', id: 'task6-clue', task: 6, role: 'clue', prop: 'wallsketch', x: 9, y: 28 },
    { type: 'task', id: 'task6-switch0', task: 6, role: 'switch', index: 0, prop: 'lever0', x: 11, y: 28 },
    { type: 'task', id: 'task6-switch1', task: 6, role: 'switch', index: 1, prop: 'lever1', x: 12, y: 28 },
    { type: 'task', id: 'task6-switch2', task: 6, role: 'switch', index: 2, prop: 'lever2', x: 13, y: 28 },

    { type: 'notestone', id: 'zettel-nord', x: 20, y: 6 },
    { type: 'notestone', id: 'zettel-west', x: 10, y: 25 },
    { type: 'notestone', id: 'zettel-ost', x: 36, y: 25 },
    { type: 'bush', id: 'strauch-west', x: 12, y: 12 },
    { type: 'bush', id: 'strauch-ost', x: 22, y: 13 },

    { type: 'sign', id: 'schild-eingang', x: 3, y: 12, lines: ['Uhrwerkruinen', 'Bitte nicht in die Kanäle fallen. Die Zahnräder nicht anfassen.'] },
    {
      // Nebelrand zum Nordlichtsee (Design 10.4)
      type: 'sign', id: 'nebel-sued', role: 'fogEdge', x: 17, y: 27, gate: 6, leadsTo: 7, leadsToName: 'der Nordlichtsee',
      lines: ['Der Nebel ist hier zu dicht.', 'Vielleicht weicht er, wenn der Leuchtstein der Ruinen wieder leuchtet.'],
      linesOpen: ['Süden: Nordlichtsee', 'Der Nebel hat sich zurückgezogen. Der Weg ist frei.'],
    },
  ],
  gates: [{ id: 'sued', leadsTo: 7, x: 18, y: 28, w: 4, h: 2, ground: 'cobble' }],
  exits: [
    { x: 0, y: 13, w: 1, h: 4, to: 'klippen', at: { x: 38, y: 14, dir: 'left' } },
    { x: 18, y: 29, w: 4, h: 1, to: 'see', at: { x: 19, y: 1, dir: 'down' } },
  ],
  finds: [
    { id: 'glitzer-nord', x: 12, y: 6 },
    { id: 'glitzer-west', x: 5, y: 23 },
    { id: 'glitzer-ost', x: 27, y: 14 },
  ],
  spawn: { x: 1, y: 14, dir: 'right' },
  respawn: { x: 33, y: 23, dir: 'up' },
  particles: ['spark', 'steam'], // Funken an den Zahnrädern und Dampf (Design 5.3)
};
