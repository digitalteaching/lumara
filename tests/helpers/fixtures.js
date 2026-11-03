// Gemeinsame Testdaten.

// Ein localStorage im Speicher.
export function fakeStorage() {
  const m = new Map();
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) };
}

export const TEST_MAP_DEF = {
  id: 't',
  name: 'Test',
  area: 1,
  rows: ['######', '#..,,#', '#..,.#', '#.~o.#', '######'],
  legend: { '#': 'tree', '.': 'grass', ',': 'tallgrass', '~': 'water', o: 'rock' },
  objects: [{ type: 'trainer', number: 1, x: 1, y: 1, dir: 'right', sight: 4, sprite: 'trainer1' }],
  spawn: { x: 1, y: 2, dir: 'down' },
  respawn: { x: 1, y: 2, dir: 'down' },
};

// Ein gültiges Lernpaket: je Trainer NAME, THEMA, eine HALLO-Zeile und Fragen „T{t} Frage {i}“.
export function makePackText({ trainers = 1, questions = 8, kennung = 'test-paket' } = {}) {
  let text = 'PAKET: Testpaket\n';
  if (kennung !== null) text += `KENNUNG: ${kennung}\n`;
  text += 'FACH: Englisch\n\n';
  for (let t = 1; t <= trainers; t++) {
    text += `=== TRAINER ${t} ===\nNAME: Trainer ${t}\nTHEMA: Thema ${t}\nHALLO: Hallo!\n\n`;
    for (let i = 1; i <= questions; i++) text += `FRAGE: T${t} Frage ${i}\nANTWORT: a${i}\nFALSCH: b | c | d\n\n`;
  }
  return text;
}

export function fillerQuestions(n, prefix) {
  let text = '';
  for (let i = 1; i <= n; i++) text += `FRAGE: ${prefix} Frage ${i}\nANTWORT: x${i}\n\n`;
  return text;
}

// Eine Frage, wie sie der Parser liefert.
export function q(overrides = {}) {
  const text = overrides.text ?? 'Frage';
  return {
    key: text.trim().replace(/\s+/g, ' ').toLowerCase(),
    text,
    line: 1,
    answer: 'plays',
    sentence: null,
    alsoCorrect: [],
    wrong: ['play', 'playing', 'played'],
    extra: [],
    forms: ['choice', 'typing'],
    trainer: 1,
    ...overrides,
    ...(overrides.text ? { key: text.trim().replace(/\s+/g, ' ').toLowerCase() } : {}),
  };
}
