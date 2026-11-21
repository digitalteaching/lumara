// Gebiet 8: die Sternenwiese (Design 5.2, 5.3). 40 × 30 Felder.
// Eine Wiese, auf der immer Nacht ist, mit Sternengras und Felsblöcken. Norden: Eingang vom
// Nordlichtsee. Nordwesten: der Berg mit dem Höhlentor und seinen acht Fassungen (die Höhle bleibt
// bis zum Finale zu). Nordosten: der Hügel mit dem Leuchtstein. Westen: der Pfad hinunter zur
// Leuchtturmbucht, offen nach dem Sieg über die Sternendeuterin. Dann ist der Ring der Insel geschlossen.

export const WIESE = {
  id: 'wiese',
  name: 'Sternenwiese',
  genitive: 'der Sternenwiese',
  at: 'auf der Sternenwiese', // „Freunde dich … an“
  to: 'die Sternenwiese', // „Besuche …“
  area: 8,
  ground: 'nightgrass',
  rows: [
    'RRRRRRRRRRRRRRRRRRnnnnRRRRRRRRRRRRRRRRRR',
    'RRRRRRRRRRRRRRRRRRnnnnRRRRRRRRRRRRRRRRRR',
    'RRMMMMMMMMMMMMMMnnnnnnnnnnnnnnnnnnnnnnRR',
    'RRMMMMMMMMMMMMMMnnnnnnnnnnnnnnnnnnnnnnRR',
    'RRMMMMMMMMMMMMMMnnnnnnnnRnnnnnnnnnnnnnRR',
    'RRMMMMMMMMMMMMMMnnnnnnnnnnnnnnnnnnnnnnRR',
    'RRMMMMMMMMMMMMMMnnnnnnnnnnnnnnnnnnnnnnRR',
    'RRXXXXXMMMXXXXXXnnnnnnnnnnnnnnnnnnnnnnRR',
    'RRnnnnnnnnnnnnnnnnnnnnnnnnnXXXnnnXXXXnRR',
    'RRnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnRR',
    'RRnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnRR',
    'RRnnSSSSSSSnnnRnnnnnnnnnnnnnnnnnnnnnnnRR',
    'RRnnSSSSSSSnnnnnnnnnnnnnnnnnnnnnnnnnnnRR',
    'RRnnSSSSSSSnnnnnnnnnnnnnnnnnnnnnnnnnnnRR',
    'RRnnSSSSSSSnnnnnSSSSSSSSSnnnnnnnnnnnnnRR',
    'RRnnSSSSSSSnnnnnSSSSSSSSSnnnnnnnnnnRnnRR',
    'RRnnSSSSSSSnnnnnSSSSSSSSSnnnnnnnnnnnnnRR',
    'RRnnnnnnnnnnnnnnSSSSSSSSSnnnnnnnnnnnnnRR',
    'RRnnnnnnnnnnnnnnSSSSSSSSSnnnnnnnnnnnnnRR',
    'RRnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnRR',
    '%%nnnnnnnnnnnnnnnnnnnnnnnnnnnSSSSSSSSnRR',
    '%%nnnnnnnnnnnnnnnnnnnnnnnnnnnSSSSSSSSnRR',
    '%%nnnnnnnnnnnnnnnnnnnnnnnRnnnSSSSSSSSnRR',
    '%%nnnnnnnnnnnnnnnnnnnnnnnnnnnSSSSSSSSnRR',
    'RRnnnnnnnnnnnnnnnnnnnnnnnnnnnSSSSSSSSnRR',
    'RRnnnnnnnnnnnnnnnnnnnnnnnnnnnSSSSSSSSnRR',
    'RRnRnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnRR',
    'RRnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnRR',
    'RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
    'RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
  ],
  legend: {
    n: 'nightgrass',
    S: 'startall',
    R: 'nightrock',
    X: 'nightcliff',
    M: 'nightstone',
    '%': 'fog',
  },
  objects: [
    { type: 'beacon', number: 8, x: 31, y: 5 },
    {
      type: 'trainer', number: 8, x: 27, y: 14, dir: 'left', sight: 4, sprite: 'trainer8',
      afterWin: 'Dein Leuchtstein strahlt. Der Pfad hinunter zur Bucht ist frei.',
    },

    {
      type: 'npc', id: 'selma', name: 'Selma', x: 22, y: 9, dir: 'down', sprite: 'selma',
      linesAfter: ['Mein Wunsch ist wahr geworden. Niemand vergisst mehr, was ihm wichtig ist.'],
      lines: [
        'Ich bin Selma. Ich sammle Sternschnuppen, die ins Gras fallen.',
        'Wer eine fallen sieht, darf sich etwas wünschen. Ich wünsche mir immer dasselbe.',
        'Dass niemand mehr etwas vergisst, was ihm wichtig ist.',
      ],
      linesLit: ['Der Stein leuchtet! Heute Nacht fallen so viele Sterne wie seit Jahren nicht.'],
    },
    {
      type: 'npc', id: 'kai', name: 'Kai', x: 11, y: 9, dir: 'up', sprite: 'kai',
      linesAfter: ['Meine Schafe grasen jetzt bis zum Berg. Sogar in die Höhle wollen sie!'],
      lines: [
        'Ich bin Kai und hüte die Nachtschafe. Sie schlafen nie, wenn die Sterne scheinen.',
        'Siehst du das Tor im Berg? Es hat acht Fassungen, eine für jeden Leuchtstein.',
        'Meine Großmutter sagt, es öffnet sich erst, wenn alle acht wieder leuchten.',
      ],
      linesLit: ['Alle acht Fassungen? Das muss ich sehen! Meine Schafe kommen auch mit.'],
    },

    // Das Höhlentor: offen mit allen acht Steinen und einem Paket mit allen acht Trainern (caveOpen)
    { type: 'building', id: 'hoehlentor', x: 7, y: 5, w: 3, h: 3, sprite: 'cavegate', door: { dx: 1, dy: 2 }, onDoor: 'locked', to: { map: 'hoehle1', x: 9, y: 13, dir: 'up' } },

    // Spielaufgabe (Lumara 1.2, js/data/tasks.js): eine Tafel mit einem Sternbild, wo früher ein
    // Felsblock lag. Die vier flachen Steine daneben (TASKS[8].plates) betritt man in der Reihenfolge
    // seiner Linie.
    { type: 'task', id: 'task8-clue', task: 8, role: 'clue', prop: 'startablet', x: 12, y: 24 },

    { type: 'notestone', id: 'zettel-nord', x: 26, y: 4 },
    { type: 'notestone', id: 'zettel-west', x: 5, y: 19 },
    { type: 'notestone', id: 'zettel-ost', x: 37, y: 27 },
    { type: 'bush', id: 'strauch-sued', x: 14, y: 21 },
    { type: 'bush', id: 'strauch-ost', x: 34, y: 11 },

    { type: 'sign', id: 'schild-eingang', x: 17, y: 2, lines: ['Sternenwiese', 'Bitte leise sein. Die Nachtschafe schlafen nie, aber sie träumen gern.'] },
    {
      // Nebelrand am Pfad hinunter zur Bucht (Design 5.2, 10.4)
      type: 'sign', id: 'nebel-west', role: 'fogEdge', x: 2, y: 19, gate: 8, leadsTo: 1, leadsToName: 'die Leuchtturmbucht',
      lines: ['Ein Pfad führt hinunter zur Bucht, doch der Nebel ist zu dicht.', 'Vielleicht weicht er, wenn der Leuchtstein der Wiese wieder leuchtet.'],
      linesOpen: ['Westen: Leuchtturmbucht', 'Der Nebel hat sich zurückgezogen. Der Pfad führt hinunter zur Bucht.'],
    },
  ],
  // Der Pfad zur Bucht öffnet sich nach dem Sieg über Trainer 8 (afterStone).
  gates: [{ id: 'bucht', leadsTo: 1, afterStone: 8, x: 0, y: 20, w: 2, h: 4, ground: 'nightgrass' }],
  exits: [
    { x: 18, y: 0, w: 4, h: 1, to: 'see', at: { x: 19, y: 28, dir: 'up' } },
    { x: 0, y: 20, w: 1, h: 4, to: 'bucht', at: { x: 38, y: 6, dir: 'left' } },
  ],
  finds: [
    { id: 'glitzer-west', x: 6, y: 13 },
    { id: 'glitzer-mitte', x: 20, y: 16 },
    { id: 'glitzer-ost', x: 32, y: 22 },
  ],
  // Nach dem Finale fällt hier abwechselnd eine Sternschnuppe ins Sternengras (js/world/stars.js)
  starSpots: [{ x: 4, y: 11 }, { x: 10, y: 14 }, { x: 19, y: 14 }, { x: 24, y: 18 }, { x: 31, y: 20 }],
  spawn: { x: 19, y: 1, dir: 'down' },
  respawn: { x: 31, y: 6, dir: 'up' },
  particles: ['fallingstar', 'glimmer'], // Sternschnuppen und glimmendes Gras (Design 5.3)
};
