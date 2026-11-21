// Gebiet 5: die Windklippen (Design 5.3). 40 × 30 Felder.
// Felsplattformen über einem Wolkenmeer, verbunden durch Hängebrücken. Westen: Eingang aus den
// Spiegeldünen. Norden und Süden: Plattformen mit Windgras und Windrädern. Osten: der Gipfel mit
// Leuchtstein und Drachenfliegerin, dahinter Nebel über dem Weg zu den Uhrwerkruinen.

export const KLIPPEN = {
  id: 'klippen',
  name: 'Windklippen',
  genitive: 'der Windklippen',
  at: 'auf den Windklippen', // „Freunde dich … an“
  to: 'die Windklippen', // „Besuche …“
  area: 5,
  ground: 'cliffrock',
  rows: [
    'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
    'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
    'CCCCCCCCCCCCCCcCcCcCcCcCCCCCCCCCCCCCCCCC',
    'CCCCCCCCCCCCCccccccccccccCCCSCCCCCCCCCCC',
    'CCSCCCCCCCCCcccwwwwwwwcccCCCCCCCCCCCCCCC',
    'CCCCCCCCCSCScccwwwwwwwcccCCCCCCCCCCCCCCC',
    'CCCCCCCCCCCCcccwwwwwwwcccCCCCCCCCCCCCCCC',
    'CCCCCCCCCCCCcccwwwwwwwcccCCCCCCCCCCCCCCC',
    'CCCCCCCCCCCCcccwwwwwwwcccCCCCCCCCCCCCCCC',
    'CCCCCCCCCCCCccccccccccccc-----cccccccCCC',
    'CCCCCCCCCCCCCCCCCC|CCCCCCCCCCCccccccccCC',
    'cccccccCCCCCCCCCCC|CCCCCCCCCCCccccccccCC',
    'ccccccccCCCCCCCCCC|CCCCCCCCCCCccccccccCC',
    'ccccccccCCCCCCCCCC|CCCCCCCCCCCcccccccc%%',
    'ccccccccCCCCCCCCCC|CCCCCCCCSCCccwwwwwc%%',
    'ccccccccCCCCCCCCCC|CCCCCCCCCCCccwwwwwc%%',
    'ccccccccCCCCcccccccccccccCCCCCccwwwwwc%%',
    'cccccccc----cccccccccccccCCCCCccwwwwwcCC',
    'cccccccCCCCCcccccccccccccCCCCCccccccccCC',
    'CCCCCCCCCCCCccccccccccccc-----ccccccccCC',
    'CCCCCCCCCCCCccccccwwwwwccCCCCCCccccccCCC',
    'CCCCCCCCCCCCccccccwwwwwccCCCCCCCCCCCCCCC',
    'CCCCCCCCCCCCccccccwwwwwccCCCCCCCCCCCCCCC',
    'CCCCCCCCCCCCccccccwwwwwccCCCCCCCCCCCCCCC',
    'CCCCCSCCCCCCcccccccccccccCCCCCCCCCCCCCCC',
    'CCCCCCCCCCCCCcccccccccccCCCCCCCCCSCCCCCC',
    'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
    'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
    'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
    'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
  ],
  legend: {
    c: 'cliffrock',
    w: 'windgrass',
    C: 'clouds',
    '-': 'bridge',
    '|': 'bridgev',
    S: 'spire',
    '%': 'fog',
  },
  objects: [
    { type: 'beacon', number: 5, x: 34, y: 11 },
    {
      type: 'trainer', number: 5, x: 31, y: 19, dir: 'left', sight: 4, sprite: 'trainer5',
      afterWin: 'Dein Leuchtstein strahlt. Spürst du den Wind? Er trägt wieder Grüße.',
    },

    {
      type: 'npc', id: 'ole', name: 'Ole', x: 5, y: 13, dir: 'down', sprite: 'ole',
      linesAfter: ['Der Wind trägt wieder Lieder über die Insel. Hörst du sie?'],
      lines: [
        'Hallo! Ich bin Ole und passe auf die Windräder auf.',
        'Lange war der Wind hier still. Meine Räder standen fast ein ganzes Jahr.',
        'Jetzt dreht er sich wieder ein bisschen. Hörst du, wie es knarrt?',
      ],
      linesLit: ['Der Leuchtstein strahlt, und meine Windräder drehen sich wie nie zuvor!'],
    },
    {
      type: 'npc', id: 'ina', name: 'Ina', x: 14, y: 20, dir: 'right', sprite: 'ina',
      linesAfter: ['Von hier oben sieht man jetzt sogar den Leuchtturm. Wink mal Morrow!'],
      lines: [
        'Ich erforsche die Wolken unter den Brücken. Jede sieht anders aus!',
        'Auf den Hängebrücken gilt: geradeaus schauen, nicht nach unten.',
        'Manchmal schwimmt ein Wolkenwal vorbei. Mit etwas Glück siehst du einen.',
      ],
      linesLit: ['Seit der Stein leuchtet, sind die Wolken weiß wie frische Wäsche.'],
    },
    {
      type: 'npc', id: 'tamo', name: 'Tamo', x: 23, y: 6, dir: 'down', sprite: 'tamo',
      linesAfter: ['Mein Drache fliegt bis zum Berg und zurück. Kein Nebel hält ihn auf!'],
      lines: [
        'Mein Drache fliegt fast so hoch wie der von Skye! Aber nur fast.',
        'Skye wartet oben auf dem Gipfel im Osten. Bei ihr läuft die Uhr noch schneller.',
        'Wenn du einen Zeitstein hast, nimm ihn mit. Er hält die Zeit kurz an!',
      ],
      // Mit ZEITDRUCK: aus läuft bei Skye keine Uhr.
      linesNoClock: [
        'Mein Drache fliegt fast so hoch wie der von Skye! Aber nur fast.',
        'Skye wartet oben auf dem Gipfel im Osten. Sie stellt richtig knifflige Fragen.',
      ],
      linesLit: ['Du hast Skye besiegt? Wow! Dann bist du ja schneller als der Wind!'],
    },

    { type: 'deco', id: 'windrad-west', x: 2, y: 12, prop: 'windmill', anim: true },
    { type: 'deco', id: 'windrad-nord', x: 13, y: 4, prop: 'windmill', anim: true },
    { type: 'deco', id: 'windrad-gipfel', x: 36, y: 10, prop: 'windmill', anim: true },
    { type: 'deco', id: 'windrad-sued', x: 23, y: 24, prop: 'windmill', anim: true },
    // Spielaufgabe (Lumara 1.2, js/data/tasks.js): drei Windräder an der Nordkante, die man mit A dreht,
    // bis ihr Wimpel so weht wie die Wimpel an den beiden Stangen. Dann steigt der Drachen an der Ecke
    // auf. Alle stehen auf früheren Wolkenfeldern, jetzt Fels; prop ist die Anfangsstellung.
    { type: 'task', id: 'task5-clue0', task: 5, role: 'clue', index: 0, prop: 'pennant1', x: 14, y: 2 },
    { type: 'task', id: 'task5-switch0', task: 5, role: 'switch', index: 0, prop: 'windwheel2', x: 16, y: 2 },
    { type: 'task', id: 'task5-switch1', task: 5, role: 'switch', index: 1, prop: 'windwheel0', x: 18, y: 2 },
    { type: 'task', id: 'task5-switch2', task: 5, role: 'switch', index: 2, prop: 'windwheel3', x: 20, y: 2 },
    { type: 'task', id: 'task5-clue1', task: 5, role: 'clue', index: 1, prop: 'pennant1', x: 22, y: 2 },
    { type: 'task', id: 'task5-prize', task: 5, role: 'prize', prop: 'kite', x: 24, y: 3 },

    { type: 'notestone', id: 'zettel-nord', x: 22, y: 8 },
    { type: 'notestone', id: 'zettel-sued', x: 13, y: 23 },
    { type: 'notestone', id: 'zettel-gipfel', x: 36, y: 19 },
    { type: 'bush', id: 'strauch-west', x: 5, y: 17 },
    { type: 'bush', id: 'strauch-sued', x: 24, y: 17 },

    { type: 'sign', id: 'schild-eingang', x: 4, y: 16, lines: ['Windklippen', 'Halt dich an den Seilen fest und schau beim Laufen nach vorn.'] },
    {
      // Nebelrand zu den Uhrwerkruinen (Design 10.4)
      type: 'sign', id: 'nebel-ost', role: 'fogEdge', x: 37, y: 12, gate: 5, leadsTo: 6, leadsToName: 'die Uhrwerkruinen', leadsToPlural: true,
      lines: ['Der Nebel ist hier zu dicht.', 'Vielleicht weicht er, wenn der Leuchtstein der Klippen wieder leuchtet.'],
      linesOpen: ['Osten: Uhrwerkruinen', 'Der Nebel hat sich zurückgezogen. Der Weg ist frei.'],
    },
  ],
  gates: [{ id: 'ost', leadsTo: 6, x: 38, y: 13, w: 2, h: 4, ground: 'cliffrock' }],
  exits: [
    { x: 0, y: 13, w: 1, h: 4, to: 'duenen', at: { x: 38, y: 14, dir: 'left' } },
    { x: 39, y: 13, w: 1, h: 4, to: 'ruinen', at: { x: 1, y: 14, dir: 'right' } },
  ],
  finds: [
    { id: 'glitzer-nord', x: 17, y: 6 },
    { id: 'glitzer-sued', x: 20, y: 22 },
    { id: 'glitzer-gipfel', x: 34, y: 15 },
  ],
  spawn: { x: 1, y: 14, dir: 'right' },
  respawn: { x: 34, y: 12, dir: 'up' },
  particles: ['windstreak', 'cloud'], // Windstreifen und kleine Wolken (Design 5.3)
};
