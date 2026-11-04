// Die Musik von Lumara (Design 15), selbst komponiert, als Notendaten (Schrift: js/audio/notes.js).
// Jede Schleife hat 8 Takte; Rechteck 1 singt die Melodie, Rechteck 2 begleitet, das Dreieck ist der
// Bass, das Rauschen das Schlagzeug. Jingles spielen einmal.

const x = (pattern, n) => Array(n).fill(pattern).join(' ');
const bars = (...b) => b.join(' | ');
const arp = (a, b, c) => x(`${a}/8 ${b}/8 ${c}/8 ${b}/8`, 2); // ein Takt Zerlegung
const off = (a, b) => x(`-/8 ${a}/8 -/8 ${b}/8`, 2); // ein Takt Nachschlag
const pairs = (a, b, n) => x(`${a}/8 ${b}/8`, n); // n Paare Achtel

export const SONGS = {
  // Titel: C-Dur, freundlich und offen
  title: {
    tempo: 96,
    voices: {
      sq1: bars('e5/4 g5/4 c6/2', 'b5/4 g5/4 e5/2', 'f5/4 a5/4 g5/4 e5/4', 'd5/2 -/2', 'e5/4 g5/4 c6/4 e6/4', 'd6/4 b5/4 g5/2', 'a5/4 f5/4 d5/4 b4/4', 'c5/2 -/2'),
      sq2: bars(arp('c4', 'e4', 'g4'), arp('b3', 'e4', 'g4'), arp('a3', 'c4', 'f4'), arp('b3', 'd4', 'g4'), arp('c4', 'e4', 'g4'), arp('b3', 'd4', 'g4'), arp('a3', 'd4', 'f4'), 'c4/8 e4/8 g4/8 e4/8 c4/2'),
      tri: bars('c3/2 g2/2', 'e2/2 b2/2', 'f2/2 c3/2', 'g2/2 d3/2', 'c3/2 g2/2', 'g2/2 d3/2', 'd3/2 a2/2', 'c3/2 c2/2'),
      noise: x('k/4 h/4 s/4 h/4', 8),
    },
  },

  // Leuchtturmbucht: Seemannslied in G-Dur, wiegend im Sechsachteltakt
  area1: {
    tempo: 100,
    voices: {
      sq1: bars('d4/8 g4/4 g4/8 a4/8 b4/8', 'c5/4 b4/8 a4/4 g4/8', 'a4/4 a4/8 b4/8 a4/8 g4/8', 'e4/4. d4/4.', 'd4/8 g4/4 g4/8 a4/8 b4/8', 'd5/4 c5/8 b4/4 a4/8', 'g4/4 b4/8 a4/8 f#4/8 a4/8', 'g4/2.'),
      sq2: bars('b3/4. d4/4.', 'c4/4. e4/4.', 'a3/4. d4/4.', 'g3/4. f#3/4.', 'b3/4. d4/4.', 'd4/4. f#4/4.', 'e4/4. f#4/4.', 'd4/4. b3/4.'),
      tri: bars('g2/4. d2/4.', 'c3/4. g2/4.', 'd2/4. a2/4.', 'e2/4. d2/4.', 'g2/4. d2/4.', 'b2/4. d3/4.', 'c3/4. d3/4.', 'g2/2.'),
      noise: x('k/8 h/8 h/8 s/8 h/8 h/8', 8),
    },
  },

  // Flüsterwald: eine Flöte über einem Bordun, D-Dorisch
  area2: {
    tempo: 84,
    voices: {
      sq1: bars('d5/4 e5/8 f5/8 a5/2', 'g5/4 f5/8 e5/8 d5/2', 'c5/4 d5/8 e5/8 f5/4 e5/4', 'd5/2. -/4', 'a5/4 g5/8 f5/8 e5/2', 'f5/4 e5/8 d5/8 c5/2', 'd5/4 f5/4 e5/4 c5/4', 'd5/1'),
      sq2: bars('d4/2 a4/2', 'd4/2 a4/2', 'c4/2 g4/2', 'd4/2 a4/2', 'd4/2 a4/2', 'c4/2 g4/2', 'd4/2 a4/2', 'd4/2 a4/2'),
      tri: bars('d2/1', 'd2/1', 'c2/1', 'd2/1', 'd2/1', 'c2/1', 'd2/2 a2/2', 'd2/1'),
      noise: x('h/4 -/4 h/4 -/4', 8),
    },
  },

  // Pilzmoor: verschmitzt in a-Moll, kurz gespielt
  area3: {
    tempo: 112,
    voices: {
      sq1: bars('a4/8 -/8 c5/8 -/8 e5/8 d5/8 c5/8 -/8', 'b4/8 -/8 g4/8 -/8 b4/4 -/4', 'a4/8 -/8 c5/8 -/8 e5/8 f5/8 e5/8 -/8', 'd5/4 c5/8 b4/8 a4/4 -/4', 'e5/8 -/8 e5/8 f5/8 g5/4 e5/4', 'f5/8 -/8 d5/8 -/8 f5/4 d5/4', 'c5/8 b4/8 a4/8 b4/8 c5/8 d5/8 e5/8 g#4/8', 'a4/4 -/4 a3/4 -/4'),
      sq2: bars(off('c4', 'e4'), off('b3', 'd4'), off('c4', 'e4'), off('a3', 'd4'), off('e4', 'g4'), off('a3', 'd4'), '-/8 c4/8 -/8 e4/8 -/8 b3/8 -/8 e4/8', off('c4', 'e4')),
      tri: bars('a2/4 e2/4 a2/4 e2/4', 'g2/4 d2/4 g2/4 d2/4', 'a2/4 e2/4 a2/4 e2/4', 'd2/4 a2/4 d2/4 a2/4', 'c3/4 g2/4 c3/4 g2/4', 'd2/4 a2/4 d2/4 a2/4', 'a2/4 e2/4 e2/4 g#2/4', 'a2/4 e2/4 a2/2'),
      noise: x('k/8 -/8 h/8 -/8 s/8 -/8 h/8 h/8', 8),
    },
  },

  // Spiegeldünen: D-Phrygisch, das Rauschen weht wie Wind
  area4: {
    tempo: 92,
    voices: {
      sq1: bars('d5/4 eb5/8 d5/8 c5/4 d5/4', 'f5/4 eb5/8 d5/8 d5/2', 'a4/4 bb4/8 c5/8 d5/4 c5/8 bb4/8', 'a4/2. -/4', 'd5/4 f5/4 g5/4 f5/8 eb5/8', 'd5/4 eb5/4 d5/2', 'c5/8 bb4/8 a4/8 bb4/8 c5/4 eb5/4', 'd5/1'),
      sq2: bars('d4/2 a4/2', 'd4/2 a4/2', 'c4/2 g4/2', 'c4/2 g4/2', 'd4/2 a4/2', 'd4/2 a4/2', 'c4/2 g4/2', 'd4/2 a4/2'),
      tri: bars('d2/4. a2/8 d2/2', 'd2/4. a2/8 d2/2', 'c2/4. g2/8 c2/2', 'c2/4. g2/8 c2/2', 'd2/4. a2/8 d2/2', 'd2/4. a2/8 d2/2', 'c2/4. g2/8 c2/2', 'd2/4. a2/8 d2/2'),
      noise: x('h/16 h/16 -/8 h/8 -/8 h/16 h/16 -/8 s/4', 8),
    },
  },

  // Windklippen: weit und hell, F-Lydisch
  area5: {
    tempo: 100,
    voices: {
      sq1: bars('f5/2 g5/4 a5/4', 'b5/2 a5/4 g5/4', 'c6/2 b5/4 a5/4', 'g5/2. -/4', 'a5/4 g5/4 f5/4 e5/4', 'd5/4 e5/4 f5/4 g5/4', 'a5/4 b5/4 g5/4 e5/4', 'f5/1'),
      sq2: bars(arp('f4', 'a4', 'c5'), arp('g4', 'b4', 'd5'), arp('f4', 'a4', 'c5'), arp('c4', 'e4', 'g4'), arp('d4', 'f4', 'a4'), arp('g4', 'b4', 'd5'), arp('c4', 'e4', 'g4'), arp('f4', 'a4', 'c5')),
      tri: bars('f2/1', 'g2/1', 'f2/1', 'c2/1', 'd2/1', 'g2/1', 'c2/1', 'f2/1'),
      noise: x('k/4 -/4 s/4 -/4', 8),
    },
  },

  // Uhrwerkruinen: C-Dur über einem tickenden Bass
  area6: {
    tempo: 104,
    voices: {
      sq1: bars('g4/8 c5/8 e5/8 g5/8 f5/4 e5/4', 'd5/8 e5/8 f5/8 d5/8 e5/4 c5/4', 'a4/8 c5/8 f5/8 a5/8 g5/4 f5/4', 'e5/4 d5/4 g4/2', 'g4/8 c5/8 e5/8 g5/8 a5/4 g5/4', 'f5/8 e5/8 d5/8 c5/8 b4/4 g4/4', 'c5/8 e5/8 d5/8 f5/8 e5/8 g5/8 f5/8 d5/8', 'c5/2 -/2'),
      sq2: x('c6/16 -/16 -/8 g5/16 -/16 -/8 c6/16 -/16 -/8 g5/16 -/16 -/8', 8),
      tri: bars(pairs('c3', 'g2', 4), pairs('g2', 'd3', 4), pairs('f2', 'c3', 4), pairs('g2', 'd3', 4), pairs('c3', 'g2', 4), pairs('g2', 'd3', 4), `${pairs('c3', 'g2', 2)} ${pairs('g2', 'd3', 2)}`, 'c3/2 c2/2'),
      noise: x('h/8 h/8 s/8 h/8 h/8 h/8 s/8 h/8', 8),
    },
  },

  // Nordlichtsee: langsam, e-Moll, das Dreieck klingt wie kleine Glocken
  area7: {
    tempo: 72,
    voices: {
      sq1: bars('e5/2 g5/4 b5/4', 'a5/2 g5/4 f#5/4', 'e5/2 d5/4 b4/4', 'e5/1', 'g5/2 a5/4 b5/4', 'c6/2 b5/4 a5/4', 'g5/4 f#5/4 d5/4 f#5/4', 'e5/1'),
      sq2: bars('g4/1', 'f#4/1', 'e4/1', 'e4/1', 'g4/1', 'a4/1', 'f#4/1', 'g4/1'),
      tri: bars('e4/4 b4/4 g4/4 b4/4', 'd4/4 a4/4 f#4/4 a4/4', 'c4/4 g4/4 e4/4 g4/4', 'e4/4 b4/4 g4/4 b4/4', 'g3/4 d4/4 b3/4 d4/4', 'a3/4 e4/4 c4/4 e4/4', 'd4/4 a4/4 f#4/4 a4/4', 'e4/4 b4/4 e5/2'),
      noise: x('-/2 h/4 -/4', 8),
    },
  },

  // Sternenwiese: ein sanfter Walzer in B-Dur
  area8: {
    tempo: 120,
    voices: {
      sq1: bars('f5/2 d5/4', 'bb4/2 c5/4', 'd5/4 eb5/4 f5/4', 'g5/2.', 'f5/2 eb5/4', 'd5/2 c5/4', 'bb4/4 c5/4 a4/4', 'bb4/2.'),
      sq2: bars('-/4 d4/4 f4/4', '-/4 d4/4 g4/4', '-/4 eb4/4 g4/4', '-/4 eb4/4 a4/4', '-/4 d4/4 f4/4', '-/4 d4/4 g4/4', '-/4 c4/4 a4/4', '-/4 d4/4 f4/4'),
      tri: bars('bb2/2.', 'g2/2.', 'eb2/2.', 'f2/2.', 'bb2/2.', 'g2/2.', 'f2/2.', 'bb2/2.'),
      noise: x('k/4 h/4 h/4', 8),
    },
  },

  // Die Höhle: c-Moll, tief, jede Note kommt als Echo zurück
  cave: {
    tempo: 76,
    voices: {
      sq1: bars('c5/4 -/4 eb5/4 -/4', 'g5/4 -/4 f5/4 eb5/4', 'd5/4 -/4 f5/4 -/4', 'g4/2 -/2', 'c5/4 -/4 eb5/4 g5/4', 'ab5/4 -/4 g5/4 f5/4', 'eb5/4 d5/4 b4/4 d5/4', 'c5/2 -/2'),
      sq2: `-/8 ${bars('c5/4 -/4 eb5/4 -/4', 'g5/4 -/4 f5/4 eb5/4', 'd5/4 -/4 f5/4 -/4', 'g4/2 -/2', 'c5/4 -/4 eb5/4 g5/4', 'ab5/4 -/4 g5/4 f5/4', 'eb5/4 d5/4 b4/4 d5/4', 'c5/2 -/4.')}`,
      tri: bars('c2/1', 'eb2/1', 'bb1/1', 'g2/1', 'c2/1', 'f2/1', 'g2/1', 'c2/1'),
      noise: x('-/2 h/8 -/8 -/4', 8),
    },
  },

  // Wildes Duell: fröhlich in G-Dur
  wild: {
    tempo: 140,
    voices: {
      sq1: bars('g4/8 b4/8 d5/8 g5/8 f#5/4 d5/4', 'e5/8 g5/8 e5/8 c5/8 d5/2', 'g4/8 b4/8 d5/8 g5/8 a5/4 g5/4', 'f#5/8 e5/8 d5/8 c5/8 b4/2', 'c5/8 e5/8 g5/8 c6/8 b5/4 a5/4', 'b5/8 g5/8 d5/8 b4/8 c5/4 d5/4', 'e5/8 f#5/8 g5/8 a5/8 b5/8 a5/8 g5/8 f#5/8', 'g5/2 d5/4 -/4'),
      sq2: bars(off('b3', 'd4'), off('c4', 'e4'), off('b3', 'd4'), off('a3', 'd4'), off('c4', 'e4'), off('b3', 'd4'), '-/8 b3/8 -/8 e4/8 -/8 a3/8 -/8 d4/8', off('b3', 'd4')),
      tri: bars('g2/4 d3/4 g2/4 d3/4', 'c3/4 g2/4 c3/4 g2/4', 'g2/4 d3/4 g2/4 d3/4', 'd3/4 a2/4 d3/4 a2/4', 'c3/4 g2/4 c3/4 g2/4', 'g2/4 d3/4 g2/4 b2/4', 'e2/4 b2/4 d2/4 a2/4', 'g2/4 d2/4 g2/2'),
      noise: x('k/8 h/8 s/8 h/8 k/8 k/8 s/8 h/8', 8),
    },
  },

  // Trainerduell: a-Moll, schneller und kräftiger
  trainer: {
    tempo: 150,
    voices: {
      sq1: bars('a4/8 a4/8 e5/8 a4/8 g5/8 a4/8 e5/8 a4/8', 'f5/8 e5/8 d5/8 c5/8 b4/4 e5/4', 'a4/8 a4/8 e5/8 a4/8 a5/8 a4/8 g5/8 a4/8', 'f5/8 g5/8 a5/8 g5/8 e5/2', 'd5/8 d5/8 a5/8 d5/8 c6/8 d5/8 a5/8 d5/8', 'g5/8 f5/8 e5/8 d5/8 c5/4 b4/4', 'c5/8 d5/8 e5/8 f5/8 g5/8 a5/8 b5/8 g#5/8', 'a5/2 e5/4 -/4'),
      sq2: bars(pairs('a3', 'e4', 4), `${pairs('f3', 'c4', 2)} ${pairs('g3', 'd4', 2)}`, pairs('a3', 'e4', 4), `${pairs('f3', 'c4', 2)} ${pairs('e3', 'b3', 2)}`, pairs('d3', 'a3', 4), `${pairs('g3', 'd4', 2)} ${pairs('c4', 'g4', 2)}`, `${pairs('a3', 'e4', 2)} ${pairs('e3', 'b3', 2)}`, pairs('a3', 'e4', 4)),
      tri: bars(pairs('a2', 'a3', 4), `${pairs('f2', 'f3', 2)} ${pairs('g2', 'g3', 2)}`, pairs('a2', 'a3', 4), `${pairs('f2', 'f3', 2)} ${pairs('e2', 'e3', 2)}`, pairs('d2', 'd3', 4), `${pairs('g2', 'g3', 2)} ${pairs('c2', 'c3', 2)}`, `${pairs('a2', 'a3', 2)} ${pairs('e2', 'e3', 2)}`, `${pairs('a2', 'a3', 2)} a2/2`),
      noise: x('k/8 h/8 s/8 h/8 k/8 h/8 s/8 s/8', 8),
    },
  },

  // Morrow: drängend, aber nicht bedrohlich; d-Moll, am Ende der Schleife hell nach D-Dur
  boss: {
    tempo: 132,
    voices: {
      sq1: bars('d5/8 f5/8 a5/8 f5/8 d6/4 a5/4', 'bb5/8 a5/8 g5/8 f5/8 e5/2', 'c5/8 e5/8 g5/8 e5/8 c6/4 g5/4', 'a5/8 g5/8 f5/8 e5/8 d5/2', 'bb4/8 d5/8 f5/8 d5/8 bb5/4 f5/4', 'c5/8 e5/8 g5/8 e5/8 c6/4 g5/4', 'a5/8 f#5/8 a5/8 d6/8 c#6/4 e6/4', 'd6/2 a5/4 -/4'),
      sq2: bars(pairs('d4', 'a4', 4), `${pairs('g4', 'bb4', 2)} ${pairs('a4', 'c#5', 2)}`, pairs('c4', 'g4', 4), pairs('d4', 'a4', 4), pairs('bb3', 'f4', 4), pairs('c4', 'g4', 4), `${pairs('d4', 'f#4', 2)} ${pairs('a4', 'c#5', 2)}`, `${pairs('d4', 'f#4', 2)} a4/2`),
      tri: bars(pairs('d2', 'd3', 4), `${pairs('g2', 'g3', 2)} ${pairs('a2', 'a3', 2)}`, pairs('c2', 'c3', 4), pairs('d2', 'd3', 4), pairs('bb1', 'bb2', 4), pairs('c2', 'c3', 4), `${pairs('d2', 'd3', 2)} ${pairs('a2', 'a3', 2)}`, 'd2/2 d3/2'),
      noise: x('k/8 h/8 s/8 k/8 k/8 h/8 s/8 h/8', 8),
    },
  },

  // Leuchtturm-Aufstieg: E-Dur, jede Phrase steigt höher
  ascent: {
    tempo: 126,
    voices: {
      sq1: bars('e4/8 g#4/8 b4/8 e5/8 g#5/4 e5/4', 'f#4/8 a4/8 c#5/8 f#5/8 a5/4 f#5/4', 'g#4/8 b4/8 e5/8 g#5/8 b5/4 g#5/4', 'a4/8 c#5/8 e5/8 a5/8 c#6/2', 'b4/8 d#5/8 f#5/8 b5/8 d#6/4 b5/4', 'c#5/8 e5/8 a5/8 c#6/8 e6/4 c#6/4', 'b5/8 a5/8 g#5/8 f#5/8 e5/8 f#5/8 g#5/8 b5/8', 'e6/2 b5/4 -/4'),
      sq2: bars(pairs('b3', 'e4', 4), pairs('c#4', 'f#4', 4), pairs('b3', 'e4', 4), pairs('c#4', 'e4', 4), pairs('d#4', 'f#4', 4), pairs('c#4', 'e4', 4), pairs('d#4', 'f#4', 4), `${pairs('e4', 'g#4', 2)} b4/2`),
      tri: bars('e2/4 b2/4 e2/4 b2/4', 'f#2/4 c#3/4 f#2/4 c#3/4', 'g#2/4 e2/4 g#2/4 b2/4', 'a2/4 e2/4 a2/4 c#3/4', 'b2/4 f#2/4 b2/4 d#3/4', 'a2/4 e2/4 a2/4 c#3/4', 'b2/4 f#2/4 b2/4 b1/4', 'e2/2 e3/2'),
      noise: x('k/8 h/8 s/8 h/8 k/8 h/8 s/8 h/8', 8),
    },
  },

  // ---------- Jingles (einmal) ----------
  victory: { tempo: 150, voices: { sq1: 'g4/8 c5/8 e5/8 g5/8 c6/4 -/8 g5/8 c6/2', sq2: 'e4/8 g4/8 c5/8 e5/8 e5/4 -/8 e5/8 e5/2', tri: 'c3/4 c3/4 g2/4 -/4 c3/2', noise: 'k/4 -/4 s/4 -/4 k/2' } },
  defeat: { tempo: 120, voices: { sq1: 'e5/4 d5/4 c5/4 b4/4 c5/2.', sq2: 'c4/2 g3/2 a3/2.', tri: 'a2/2 g2/2 c2/2.' } },
  levelup: { tempo: 160, voices: { sq1: 'c5/16 e5/16 g5/16 c6/16 e6/8 -/8 c6/4', sq2: 'e4/4 g4/4 c5/4', tri: 'c3/4 e3/4 c3/4' } },
  evolution: { tempo: 120, voices: { sq1: 'c5/8 e5/8 g5/8 c6/8 e5/8 g5/8 c6/8 e6/8 g6/2', sq2: 'c4/2 e4/2 g4/2', tri: 'c3/2 g2/2 c3/2' } },
  find: { tempo: 140, voices: { sq1: 'a5/16 c#6/16 e6/8 -/4', sq2: 'e5/4 -/4', tri: 'a3/4 -/4' } },
  beacon: { tempo: 110, voices: { sq1: 'c5/8 g5/8 c6/4 e6/4. -/8 d6/4 c6/2', sq2: 'e4/2 g4/2 c5/2.', tri: 'c3/2 e3/2 c3/2.', noise: '-/2 h/4 h/4 s/2.' } },
  finale: { tempo: 120, voices: { sq1: 'd5/4 f#5/4 a5/4 d6/4 c#6/4 a5/4 d6/2', sq2: 'a4/2 d5/2 e5/2 f#5/2', tri: 'd3/2 a2/2 a2/2 d3/2' } },
};

export const LOOPS = ['title', 'area1', 'area2', 'area3', 'area4', 'area5', 'area6', 'area7', 'area8', 'cave', 'wild', 'trainer', 'boss', 'ascent'];
export const JINGLES = ['victory', 'defeat', 'levelup', 'evolution', 'find', 'beacon', 'finale'];
