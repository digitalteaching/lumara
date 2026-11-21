// Gebiet 4: die Spiegeldünen (Design 5.3). 40 × 30 Felder.
// Süden: Eingang aus dem Pilzmoor. Mitte: ein Platz mit Leuchtstein und Glasstatuen. Im Westen und
// Norden glänzen Luftspiegelungen, die wie Wege aussehen, aber in Sackgassen führen. Im Nordwesten
// steht der Glasturm auf einem Plateau, das man noch nicht erreicht (Plan 4). Osten: Karawanenführer
// und Nebeltor zu den Windklippen.

export const DUENEN = {
  id: 'duenen',
  name: 'Spiegeldünen',
  genitive: 'der Spiegeldünen',
  area: 4,
  ground: 'glasssand',
  rows: [
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    'DDDsssssssDDDDDDDDDDDDDDssssssssssssssDD',
    'DDDsssssssDDDDDDsDDDDDDDssssssssssssssDD',
    'DDDsssssssMMMMssssssssDDdddddddddddsssDD',
    'DDDsssssssMMMMssssssssDDdddddddddddsssDD',
    'DDDsssssssDDMMssssssssDDdddddddddddsssDD',
    'DDDDDDDDDDDDMMssssssssDDdddddddddddsssDD',
    'DDDDDDDDDDDDMMssssssssDDdddddddddddsssDD',
    'DDDDDDDDDDDDMMsssssssssDssssssssssssssDD',
    'DDDDDDDDDDDsssssssssssssssssssssssssssDD',
    'DDDDDDDDDDDDssssssssssssssssssssssssssDD',
    'DDDDDDDDDDDDssssssssssssssssssssssssssDD',
    'DDDDDDDDDDDDssssss____________________%%',
    'DDDMMMMMM_____________________________%%',
    'DDDMMMMMM_____________________________%%',
    'DDDDDDDDDDDDssssss____________________%%',
    'DDDDDDDDDDDDssssss____ssssssssssssssssDD',
    'DDDDDDDDDDDDssssss____ssssssssssssssssDD',
    'DDDsssssssssssssss____sssssssssssssssDDD',
    'DDDsdddddddddsssss____sssssdddddddddsDDD',
    'DDDsdddddddddsssss____ssDDsdddddddddsDDD',
    'DDDsdddddddddsDDss____ssDDsdddddddddsDDD',
    'DDDsdddddddddsDDss____ssDDsdddddddddsDDD',
    'DDDsdddddddddsDDss____sssssdddddddddsDDD',
    'DDDsdddddddddsssss____sssssdddddddddsDDD',
    'DDDsssssssssssssss____sssssssssssssssDDD',
    'DDDDDDDDDDDDDDDDss____ssDDDDDDDDDDDDDDDD',
    'DDDDDDDDDDDDDDDDss____ssDDDDDDDDDDDDDDDD',
    'DDDDDDDDDDDDDDDDss____ssDDDDDDDDDDDDDDDD',
  ],
  legend: {
    s: 'glasssand',
    _: 'path',
    d: 'dunegrass',
    D: 'dune',
    M: 'mirage',
    '%': 'fog',
  },
  objects: [
    { type: 'beacon', number: 4, x: 16, y: 10 },
    {
      type: 'trainer', number: 4, x: 30, y: 12, dir: 'down', sight: 4, sprite: 'trainer4',
      afterWin: 'Dein Leuchtstein strahlt. Die Spiegel zeigen wieder echte Wege.',
    },

    {
      type: 'npc', id: 'samir', name: 'Samir', x: 14, y: 12, dir: 'down', sprite: 'samir',
      linesAfter: ['In meinen Gläsern sehe ich jetzt die ganze Insel, klar und hell.'],
      lines: [
        'Willkommen in den Spiegeldünen! Ich blase Gläser aus dem Sand hier.',
        'Pass auf: Manche Wege glänzen nur. Das sind Luftspiegelungen.',
        'Läufst du dagegen, merkst du es sofort. Dann such einfach einen anderen Weg!',
      ],
      linesLit: ['Der Leuchtstein strahlt! Jetzt glänzen meine Gläser wieder wie früher.'],
    },
    {
      type: 'npc', id: 'talia', name: 'Talia', x: 23, y: 25, dir: 'left', sprite: 'talia',
      linesAfter: ['Meine neue Karte hat keinen Nebel mehr. Nur Wege!'],
      lines: [
        'Ich zeichne Karten von den Dünen. Sie sehen jeden Tag ein bisschen anders aus.',
        'Karim wartet im Osten. Er ist schnell, und bei ihm läuft eine Uhr!',
        'Ein Zeitstein hält die Uhr für eine Frage an. Manchmal glitzert einer im Gras.',
        'Den Glasturm im Nordwesten kenne ich nur von weitem. Er ist zu hoch zum Klettern.',
      ],
      // Mit ZEITDRUCK: aus läuft bei Karim keine Uhr.
      linesNoClock: [
        'Ich zeichne Karten von den Dünen. Sie sehen jeden Tag ein bisschen anders aus.',
        'Karim wartet im Osten. Er ist schnell und kennt viele Wörter!',
        'Den Glasturm im Nordwesten kenne ich nur von weitem. Er ist zu hoch zum Klettern.',
      ],
      linesLit: ['Du hast Karim besiegt! Das trage ich gleich in meine Karte ein.'],
      linesOpen: [
        'Du hast Karim besiegt! Das trage ich gleich in meine Karte ein.',
        'Im Osten liegen die Windklippen. Halt deine Mütze fest, dort ist es windig!',
      ],
    },

    { type: 'deco', id: 'statue-sued-west', x: 17, y: 19, prop: 'statue', lines: ['Eine Statue aus Glas. Auf dem Sockel steht:', '„Wer gut hinschaut, findet den echten Weg.“'] },
    { type: 'deco', id: 'statue-sued-ost', x: 22, y: 19, prop: 'statue', lines: ['Eine Statue aus Glas. Auf dem Sockel steht:', '„Was du weißt, kann dir niemand nehmen.“'] },
    { type: 'deco', id: 'statue-platz', x: 26, y: 11, prop: 'statue', lines: ['Eine Statue aus Glas. Auf dem Sockel steht:', '„Früher spiegelte sich hier das Wissen der ganzen Insel.“'] },
    { type: 'deco', id: 'statue-west', x: 12, y: 12, prop: 'statue', lines: ['Eine Statue aus Glas. Auf dem Sockel steht:', '„Nicht jeder Weg, der glänzt, ist ein Weg.“'] },
    // Spielaufgabe (Lumara 1.2, js/data/tasks.js): drei Glasstatuen, die man mit A dreht, bis alle zum
    // Leuchtstein schauen. Sie stehen auf früheren Dünenfeldern westlich, östlich und nördlich von
    // ihm; prop ist ihre Anfangsstellung (TASKS[4].start).
    { type: 'task', id: 'task4-switch0', task: 4, role: 'switch', index: 0, prop: 'glassstatue3', x: 11, y: 10 },
    { type: 'task', id: 'task4-switch1', task: 4, role: 'switch', index: 1, prop: 'glassstatue0', x: 22, y: 9 },
    { type: 'task', id: 'task4-switch2', task: 4, role: 'switch', index: 2, prop: 'glassstatue0', x: 16, y: 3 },
    // Der Glasturm: zu sehen, aber noch nicht erreichbar (Platz für Plan 4)
    { type: 'deco', id: 'glasturm', x: 6, y: 4, prop: 'glasstower' },

    // Geheimer Ort (Design 5.7): eine Öse an der Glaswand, mit dem Kletterhaken hinauf zum Glasturm
    {
      type: 'secret', id: 'oese-glasturm', place: 'glasturm', prop: 'hookring', x: 15, y: 4,
      to: { map: 'glasturm', x: 7, y: 10, dir: 'up' },
      lines: ['An der Glaswand hängt eine alte Öse aus Metall.', 'Mit einem Kletterhaken käme man hier hinauf, bis zum Glasturm.'],
      linesOpen: ['Du hakst den Kletterhaken ein und kletterst die Glaswand hinauf.'],
    },
    { type: 'notestone', id: 'zettel-nord', x: 36, y: 3 },
    { type: 'notestone', id: 'zettel-sued', x: 5, y: 26 },
    { type: 'notestone', id: 'zettel-ost', x: 36, y: 19 },
    { type: 'bush', id: 'strauch-west', x: 13, y: 19 },
    { type: 'bush', id: 'strauch-ost', x: 35, y: 18 },

    { type: 'sign', id: 'schild-eingang', x: 17, y: 26, lines: ['Spiegeldünen', 'Nicht jeder glänzende Weg ist echt. Bleib auf dem Pfad!'] },
    {
      // Nebelrand zu den Windklippen (Design 10.4): Der Text hängt vom Stand ab, siehe world/fogEdge.js.
      type: 'sign', id: 'nebel-ost', role: 'fogEdge', x: 37, y: 12, gate: 4, leadsTo: 5, leadsToName: 'die Windklippen', leadsToPlural: true,
      lines: ['Der Nebel ist hier zu dicht.', 'Vielleicht weicht er, wenn der Leuchtstein der Dünen wieder leuchtet.'],
      linesOpen: ['Osten: Windklippen', 'Der Nebel hat sich zurückgezogen. Der Weg ist frei.'],
    },
  ],
  gates: [{ id: 'ost', leadsTo: 5, x: 38, y: 13, w: 2, h: 4, ground: 'glasssand' }],
  exits: [
    { x: 18, y: 29, w: 4, h: 1, to: 'moor', at: { x: 19, y: 1, dir: 'down' } },
    // Hinter dem Tor im Osten, nur begehbar, wenn es offen ist
    { x: 39, y: 13, w: 1, h: 4, to: 'klippen', at: { x: 1, y: 14, dir: 'right' } },
  ],
  finds: [
    { id: 'glitzer-suedwest', x: 8, y: 23 },
    { id: 'glitzer-nord', x: 30, y: 6 },
    { id: 'glitzer-suedost', x: 31, y: 22 },
  ],
  spawn: { x: 19, y: 28, dir: 'up' },
  respawn: { x: 16, y: 11, dir: 'up' },
  particles: ['sand', 'glint'], // Sandwehen und Glanzpunkte im Glas (Design 5.3)
};
