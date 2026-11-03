// Figuren (16×16): eine gemeinsame Grundform, je Figur eigene Farben und kleine Merkmale.
// Rollenzeichen der Vorlage: o Umriss, h/i Haar oder Kapuze (hell/dunkel), s/t Haut (hell/Schatten),
// e Augen, c/d/l Kleidung (Grund/Schatten/hell), b Beine und Schuhe.
// side schaut nach rechts, links wird gespiegelt. Bild 0 steht, Bild 1 macht einen Schritt.

const DOWN = [
  '................',
  '.....oooooo.....',
  '....ohhhhhho....',
  '...ohhhhhhhho...',
  '...ohhhhhhhho...',
  '...ohssssssho...',
  '...osessssseo...',
  '...otssssssto...',
  '....otttttto....',
  '...occclllcco...',
  '..oscccllcccso..',
  '..otdccllccdto..',
  '...oddddddddo...',
  '....obbo.obbo...',
  '....obbo.obbo...',
  '.....oo...oo....',
];
const DOWN_STEP = [...DOWN.slice(0, 13), '....obbo.obbo...', '....oooo.obbo...', '..........oo....'];

const UP = [
  '................',
  '.....oooooo.....',
  '....ohhhhhho....',
  '...ohhhhhhhho...',
  '...ohhhhhhhho...',
  '...ohhhhhhhho...',
  '...ohhhhhhhho...',
  '...oihhhhhhio...',
  '....oiiiiiio....',
  '...occcccccco...',
  '..osccccccccso..',
  '..otdccccccdto..',
  '...oddddddddo...',
  '....obbo.obbo...',
  '....obbo.obbo...',
  '.....oo...oo....',
];
const UP_STEP = [...UP.slice(0, 13), '....obbo.obbo...', '....oooo.obbo...', '..........oo....'];

const SIDE = [
  '................',
  '.....ooooo......',
  '....ohhhhho.....',
  '...ohhhhhhho....',
  '...ohhhhhsso....',
  '...ohhhhseso....',
  '...ohhhhsssso...',
  '...oihhhtssto...',
  '....oiiitto.....',
  '....occclllo....',
  '....occcllso....',
  '....odccllto....',
  '....oddddddo....',
  '.....obbbbo.....',
  '.....obbobbo....',
  '.....oo..oo.....',
];
const SIDE_STEP = [...SIDE.slice(0, 13), '....obbo.obo....', '...obbo...obo...', '...oo......oo...'];

const BASE = { o: 'k', e: 'k', s: 'p', t: 'C' };

function paint(template, colors) {
  return template.map(line => [...line].map(ch => (ch === '.' ? '.' : colors[ch] ?? BASE[ch] ?? ch)).join(''));
}

function stamp(rowsArr, marks) {
  const g = rowsArr.map(r => [...r]);
  for (const [x, y, ch] of marks) g[y][x] = ch;
  return g.map(r => r.join(''));
}

function character(colors, extras = {}) {
  const out = {};
  for (const [dir, frames] of Object.entries({ down: [DOWN, DOWN_STEP], up: [UP, UP_STEP], side: [SIDE, SIDE_STEP] })) {
    out[dir] = frames.map(f => stamp(paint(f, colors), extras[dir] ?? []));
  }
  return out;
}

// Laterne in der Hand (Ilvy)
const LANTERN_DOWN = [[13, 10, 'k'], [13, 11, 'H'], [13, 12, 'k'], [14, 11, 'k']];
const LANTERN_SIDE = [[11, 10, 'k'], [12, 10, 'k'], [12, 11, 'H'], [12, 12, 'k'], [13, 11, 'k']];
// Haarknoten (Ilvy)
const BUN_DOWN = [[7, 0, 'k'], [8, 0, 'k']];
// Bart (Bram)
const BEARD_DOWN = [[5, 7, 'm'], [6, 8, 'm'], [7, 8, 'm'], [8, 8, 'm'], [9, 8, 'm'], [10, 7, 'm']];
const BEARD_SIDE = [[9, 7, 'm'], [10, 7, 'm'], [9, 8, 'm']];
// Netz über der Schulter (Trainerin der Bucht)
const NET_DOWN = [[2, 9, 'm'], [1, 10, 'f'], [2, 11, 'm'], [1, 12, 'f'], [2, 13, 'm']];
const NET_SIDE = [[3, 9, 'm'], [2, 10, 'f'], [3, 11, 'm'], [2, 12, 'f']];
// Kopftuch-Knoten (Trainerin der Bucht)
const KNOT_UP = [[7, 8, 'e'], [8, 8, 'e'], [7, 9, 'e']];

// Moosflecken auf dem Umhang (Waldläufer)
const MOSS_DOWN = [[4, 10, 'g'], [11, 11, 'g'], [6, 12, 'G'], [9, 13, 'g']];
const MOSS_SIDE = [[5, 10, 'g'], [8, 12, 'G']];
// Kräuterkorb am Arm (Fenna)
const BASKET_DOWN = [[12, 11, 'o'], [13, 11, 'r'], [14, 11, 'k'], [12, 12, 'o'], [13, 12, 'o'], [13, 10, 'g']];
const BASKET_SIDE = [[11, 11, 'o'], [12, 11, 'r'], [11, 12, 'o'], [12, 10, 'g']];
// Glas für Glühwürmchen (Lio)
const JAR_DOWN = [[12, 10, 'k'], [12, 11, 'A'], [12, 12, 'H'], [13, 11, 'k']];
const JAR_SIDE = [[11, 10, 'k'], [11, 11, 'A'], [11, 12, 'H']];

// Pilzhut mit breiter Krempe und weißen Tupfen (Pilzsammlerin)
const HAT_DOWN = [[1, 4, 'k'], [2, 4, 'e'], [3, 4, 'e'], [12, 4, 'e'], [13, 4, 'e'], [14, 4, 'k'], [2, 5, 'k'], [13, 5, 'k'], [6, 2, 'w'], [9, 3, 'w'], [5, 4, 'w']];
const HAT_UP = [[1, 4, 'k'], [2, 4, 'e'], [3, 4, 'e'], [12, 4, 'e'], [13, 4, 'e'], [14, 4, 'k'], [6, 3, 'w'], [9, 2, 'w'], [10, 5, 'w']];
const HAT_SIDE = [[2, 3, 'k'], [3, 3, 'e'], [11, 3, 'e'], [12, 3, 'e'], [13, 3, 'k'], [6, 2, 'w'], [9, 3, 'w']];
// Großer Korb mit Pilzen am Arm (Pilzsammlerin)
const MUSHBASKET_DOWN = [[12, 11, 'o'], [13, 11, 'r'], [14, 11, 'k'], [12, 12, 'o'], [13, 12, 'o'], [14, 12, 'k'], [12, 10, 'R'], [13, 10, 'w']];
const MUSHBASKET_SIDE = [[11, 11, 'o'], [12, 11, 'r'], [11, 12, 'o'], [12, 12, 'o'], [11, 10, 'R'], [12, 10, 'w']];
// Kochlöffel (Wenke), Holzbrett über der Schulter (Jasper)
const LADLE_DOWN = [[13, 9, 'o'], [13, 10, 'o'], [13, 11, 'o'], [14, 8, 'r']];
const LADLE_SIDE = [[12, 9, 'o'], [12, 10, 'o'], [13, 8, 'r']];
const PLANK_DOWN = [[1, 8, 'k'], [2, 8, 'r'], [1, 9, 'r'], [2, 9, 'o'], [1, 10, 'o'], [2, 10, 'k']];
const PLANK_SIDE = [[3, 8, 'r'], [2, 9, 'r'], [3, 9, 'o'], [2, 10, 'o']];

// Spiegel in der Hand, der einen Lichtpunkt wirft (Karawanenführer), Juwel am Turban
const MIRROR_DOWN = [[13, 10, 'k'], [13, 11, 'w'], [14, 11, 'A'], [14, 10, 'k'], [7, 2, 'e']];
const MIRROR_SIDE = [[12, 10, 'k'], [12, 11, 'w'], [13, 11, 'A']];
// Glasbläserpfeife (Samir), Kartenrolle (Talia)
const PIPE_DOWN = [[13, 9, 'r'], [13, 10, 'r'], [13, 11, 'r'], [13, 12, 'A']];
const PIPE_SIDE = [[12, 9, 'r'], [12, 10, 'r'], [12, 11, 'A']];
const SCROLL_DOWN = [[12, 11, 'c'], [13, 11, 'w'], [14, 11, 'k'], [12, 12, 'Y']];
const SCROLL_SIDE = [[11, 11, 'c'], [12, 11, 'w'], [11, 12, 'Y']];

// Schutzbrille auf der Stirn und flatternder Schal (Drachenfliegerin)
const GOGGLES_DOWN = [[4, 3, 'k'], [5, 3, 'A'], [6, 3, 'k'], [9, 3, 'k'], [10, 3, 'A'], [11, 3, 'k'], [7, 3, 'k'], [8, 3, 'k']];
const GOGGLES_SIDE = [[6, 3, 'k'], [7, 3, 'k'], [8, 3, 'A'], [9, 3, 'k']];
const SCARF_DOWN = [[5, 8, 'e'], [6, 8, 'C'], [7, 8, 'e'], [8, 8, 'C'], [9, 8, 'e'], [10, 8, 'C'], [11, 9, 'e'], [12, 10, 'C']];
const SCARF_SIDE = [[5, 8, 'e'], [6, 8, 'C'], [7, 8, 'e'], [3, 8, 'C'], [4, 9, 'e']];
const SCARF_UP = [[5, 8, 'e'], [6, 8, 'C'], [7, 8, 'e'], [8, 8, 'C'], [9, 8, 'e'], [10, 8, 'C']];
// Notizbuch (Ina), Drachenschnur (Tamo)
const BOOK_DOWN = [[12, 11, 'c'], [13, 11, 'w'], [12, 12, 'k'], [13, 12, 'k']];
const BOOK_SIDE = [[11, 11, 'c'], [12, 11, 'w'], [11, 12, 'k']];
const KITE_DOWN = [[13, 10, 'w'], [14, 9, 'w'], [15, 8, 'e'], [15, 7, 'C']];
const KITE_SIDE = [[12, 10, 'w'], [13, 9, 'w'], [14, 8, 'e'], [14, 7, 'C']];

export const CHARACTERS = {
  // Windklippen (Plan 3b): Drachenfliegerin mit Schutzbrille (Design 5.3) und die Bewohner
  trainer5: character({ h: 'h', i: 'r', c: 'L', d: 'S', l: 'w', b: 'b' }, { down: [...GOGGLES_DOWN, ...SCARF_DOWN], up: SCARF_UP, side: [...GOGGLES_SIDE, ...SCARF_SIDE] }),
  ole: character({ h: 'm', i: 's', c: 'o', d: 'b', l: 'c', b: 'k' }, { down: BEARD_DOWN.map(([x, y]) => [x, y, 'f']), side: BEARD_SIDE.map(([x, y]) => [x, y, 'f']) }),
  ina: character({ h: 'n', i: 'k', c: 'w', d: 'f', l: 'A', b: 'D' }, { down: BOOK_DOWN, side: BOOK_SIDE }),
  tamo: character({ h: 'o', i: 'b', c: 'G', d: 'g', l: 'Y', b: 'o' }, { down: KITE_DOWN, side: KITE_SIDE }),
  // Spiegeldünen (Plan 3b): Karawanenführer mit Turban und Spiegel (Design 5.3) und die Bewohner
  trainer4: character({ h: 'c', i: 'Y', c: 'S', d: 'D', l: 'h', b: 'b' }, { down: MIRROR_DOWN, side: MIRROR_SIDE }),
  samir: character({ h: 'b', i: 'k', c: 'A', d: 'L', l: 'w', b: 'b' }, { down: PIPE_DOWN, side: PIPE_SIDE }),
  talia: character({ h: 'e', i: 'C', c: 'Y', d: 'y', l: 'c', b: 'o' }, { down: SCROLL_DOWN, side: SCROLL_SIDE }),
  // Pilzmoor (Plan 3b): Pilzsammlerin mit großem Korb und Pilzhut (Design 5.3) und die Bewohner
  trainer3: character({ h: 'C', i: 'e', c: 'g', d: 'l', l: 'G', b: 'b' }, { down: [...HAT_DOWN, ...MUSHBASKET_DOWN], up: HAT_UP, side: [...HAT_SIDE, ...MUSHBASKET_SIDE] }),
  wenke: character({ h: 'w', i: 'f', c: 'R', d: 'P', l: 'w', b: 'b' }, { down: LADLE_DOWN, side: LADLE_SIDE }),
  jasper: character({ h: 'o', i: 'b', c: 't', d: 'F', l: 'Y', b: 'k' }, { down: PLANK_DOWN, side: PLANK_SIDE }),
  nele: character({ h: 'V', i: 'v', c: 'H', d: 'h', l: 'Y', b: 'D' }),
  // Flüsterwald (Plan 3a): Waldläufer mit Kapuze und Moosumhang (Design 5.3) und die Bewohner
  trainer2: character({ h: 'F', i: 'k', c: 'l', d: 'F', l: 'o', b: 'b' }, { down: MOSS_DOWN, side: MOSS_SIDE }),
  fenna: character({ h: 'h', i: 'r', c: 'v', d: 'P', l: 'c', b: 'b' }, { down: BASKET_DOWN, side: BASKET_SIDE }),
  birk: character({ h: 'm', i: 's', c: 'o', d: 'b', l: 'Y', b: 'k' }, { down: BEARD_DOWN.map(([x, y]) => [x, y, 'w']), side: BEARD_SIDE.map(([x, y]) => [x, y, 'w']) }),
  lio: character({ h: 'b', i: 'k', c: 'h', d: 'r', l: 'D', b: 'b' }, { down: JAR_DOWN, side: JAR_SIDE }),
  // neutrale Figur mit Kapuzenumhang (Design 14)
  player: character({ h: 't', i: 'F', c: 't', d: 'F', l: 'c', b: 'b' }),
  ilvy: character({ h: 'm', i: 's', c: 'D', d: 'n', l: 'S', b: 'n' }, { down: [...LANTERN_DOWN, ...BUN_DOWN], side: LANTERN_SIDE }),
  fischer: character({ h: 'S', i: 'D', c: 'o', d: 'b', l: 'Y', b: 'n' }, { down: BEARD_DOWN, side: BEARD_SIDE }),
  kind: character({ h: 'h', i: 'r', c: 'C', d: 'e', l: 'p', b: 'o' }),
  netz: character({ h: 'o', i: 'b', c: 'v', d: 'P', l: 'c', b: 'b' }),
  // junge Fischerin mit Netz und Kopftuch (Design 5.3)
  trainer1: character({ h: 'R', i: 'e', c: 'L', d: 'S', l: 'A', b: 'b' }, { down: NET_DOWN, side: NET_SIDE, up: KNOT_UP }),
};
