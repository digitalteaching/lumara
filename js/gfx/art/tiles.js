// Kacheln (16×16), Gebäude und kleine Gegenstände der Welt, alles als Pixelraster.
// Natürliche Flächen werden aus festem Rauschen erzeugt (immer gleich), feste Dinge sind von Hand gezeichnet.
// Zeichen: siehe gfx/palette.js. '.' ist durchsichtig.

function noise(x, y, seed) {
  let h = (Math.imul(x + 1, 374761393) + Math.imul(y + 1, 668265263) + Math.imul(seed + 7, 2246822519)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function grid(w, h, ch) {
  return Array.from({ length: h }, () => Array(w).fill(ch));
}

const toRows = g => g.map(r => r.join(''));

function stamp(g, pattern, ox, oy, { wrap = true } = {}) {
  const h = g.length, w = g[0].length;
  pattern.forEach((line, y) => {
    [...line].forEach((ch, x) => {
      if (ch === '.') return;
      let gx = ox + x, gy = oy + y;
      if (wrap) { gx = ((gx % w) + w) % w; gy = ((gy % h) + h) % h; }
      if (gx >= 0 && gy >= 0 && gx < w && gy < h) g[gy][gx] = ch;
    });
  });
}

// ---------- Flächen ----------

function grassGrid(seed) {
  const g = grid(16, 16, 'g');
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const r = noise(x, y, seed);
    if (r < 0.05) g[y][x] = 'G';
    else if (r > 0.95) g[y][x] = 'l';
  }
  // kleine V-Büschel
  for (const [x, y] of [[3, 3], [10, 1], [13, 8], [6, 10], [11, 13], [1, 13]]) {
    g[y][x] = 'l';
    g[(y + 15) % 16][(x + 15) % 16] = 'G';
    g[(y + 15) % 16][(x + 1) % 16] = 'G';
  }
  return g;
}

const grass = toRows(grassGrid(1));

function tallGrass(lean) {
  const g = grid(16, 16, 'l');
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (noise(x, y, 3) > 0.9) g[y][x] = 'F';
  const tuft = [
    '.G...G',
    'Gg..Gg',
    'gG.gGg',
    'ggGggg',
    'gggggg',
    'gFgggF',
    'FFFFFF',
  ];
  for (const [ox, oy] of [[0, 1], [8, 1], [4, 9], [12, 9]]) {
    const leaned = tuft.map((line, i) => (i < 3 && lean ? `.${line.slice(0, -1)}` : line));
    stamp(g, leaned, ox, oy);
  }
  return toRows(g);
}

function speckled(base, seed, specks) {
  const g = grid(16, 16, base);
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const r = noise(x, y, seed);
    let acc = 0;
    for (const [ch, p] of specks) {
      acc += p;
      if (r < acc) { g[y][x] = ch; break; }
    }
  }
  return toRows(g);
}

const sand = speckled('Y', 11, [['y', 0.12], ['c', 0.04], ['r', 0.006]]);
const path = speckled('y', 12, [['Y', 0.08], ['r', 0.06], ['o', 0.012]]);
const fog = speckled('f', 13, [['m', 0.22], ['w', 0.06]]);

function water(shift) {
  const g = grid(16, 16, 'S');
  // ruhige Wellenkämme: kurze helle Bögen, versetzt pro Reihe
  for (const [cx, cy] of [[2, 2], [10, 6], [5, 11], [13, 14]]) {
    const x = (cx + shift) % 16;
    for (let i = 0; i < 4; i++) g[cy][(x + i) % 16] = 'L';
    g[(cy + 15) % 16][(x + 1) % 16] = 'L';
    g[(cy + 15) % 16][(x + 2) % 16] = 'A';
  }
  for (const [cx, cy] of [[7, 3], [0, 9], [11, 11]]) g[cy][(cx + 16 - shift) % 16] = 'D';
  return toRows(g);
}

function pier() {
  const g = grid(16, 16, 'o');
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    if (x === 0 || x === 15) g[y][x] = 'b';
    else if (y % 4 === 3) g[y][x] = 'b';
    else if (y % 4 === 0) g[y][x] = 'r';
    if (y % 4 === 1 && (x === 2 || x === 13)) g[y][x] = 'k';
  }
  return toRows(g);
}

function flowers() {
  const g = grassGrid(5);
  const flower = (x, y, petal, center) => {
    for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0], [0, 1]]) g[(y + dy + 16) % 16][(x + dx + 16) % 16] = petal;
    g[y][x] = center;
  };
  flower(3, 3, 'R', 'h');
  flower(11, 4, 'w', 'H');
  flower(7, 10, 'H', 'r');
  flower(13, 12, 'R', 'h');
  flower(2, 12, 'w', 'H');
  return toRows(g);
}

function cliff() {
  const g = grid(16, 16, 's');
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const r = noise(x, y, 21);
    if (y < 2) g[y][x] = r < 0.4 ? 'G' : 'g';
    else if (y === 2) g[y][x] = 'k';
    else if (x % 6 === 2 && y % 5 < 3) g[y][x] = 'n';
    else if (y < 8 && r < 0.18) g[y][x] = 'm';
    else if (r > 0.85) g[y][x] = 'd';
    if (y === 15) g[y][x] = r < 0.5 ? 'A' : 'L';
  }
  return toRows(g);
}

const tree = [
  'ggggggFFFFgggggg',
  'ggggFFllllFFgggg',
  'gggFllGGlllllFgg',
  'ggFlGGGllllllFgg',
  'gFlGGlllllllllFg',
  'gFlGllllllllllFg',
  'FlllllllllllllFg',
  'FllllllllllllFFg',
  'FFlllllllllllFgg',
  'gFFlllllllllFFgg',
  'ggFFFllllFFFFggg',
  'gggggFFbbFFggggg',
  'ggggggbobggggggg',
  'ggggggbobggggggg',
  'gggggllbobllgggg',
  'gggggggllggggggg',
];

// Steine haben keinen eigenen Boden: Die Welt zeichnet den Boden der Nachbarfelder darunter.
const rock = [
  '................',
  '................',
  '.....kkkkk......',
  '....kmmffmkk....',
  '...kmffffmmsk...',
  '..kmffmmmmsssk..',
  '..kmmmmmsssssdk.',
  '.kmmmmmssssssddk',
  '.kmmmsssssssdddk',
  '.ksssssssssddddk',
  '.kdsssssssddddk.',
  '..kddsssdddddk..',
  '...kkdddddddk...',
  '....kkkkkkkk....',
  '................',
  '................',
];

// ---------- Flüsterwald (Plan 3a) ----------

const retint = (rows, map) => rows.map(r => [...r].map(c => map[c] ?? c).join(''));

const moss = speckled('l', 31, [['F', 0.1], ['g', 0.06], ['b', 0.012]]);

// Farn ist das hohe Gras des Waldes: dunkler Grund, hellere Wedel
const fern = lean => retint(tallGrass(lean), { l: 'F', g: 'l' });

// Waldbaum ohne eigenen Boden: Die Welt zeichnet den Waldboden darunter.
const fortree = retint(tree, { g: '.' });

const mushroom = [
  '................',
  '................',
  '......kkkk......',
  '....kkeeeekk....',
  '...keewweeeek...',
  '..keeeeeewweek..',
  '..kewweeeeeeek..',
  '..kkkkkkkkkkkk..',
  '.....kccwck.....',
  '.....kcccck.....',
  '.....kcccck.....',
  '....kkcccckk....',
  '....kkkkkkkk....',
  '................',
  '................',
  '................',
];

// Felder ohne eigenen Boden, unter die der Boden der Umgebung gezeichnet wird
export const OVERLAY_TILES = new Set(['rock', 'fortree', 'mushroom']);

const fence = [
  'gggggggggggggggg',
  'gggggggggggggggg',
  'gbrbggggggbrbggg',
  'gbobggggggbobggg',
  'bbobbbbbbbbobbbb',
  'rrorrrrrrrrorrrr',
  'oooooooooooooooo',
  'bbobbbbbbbbobbbb',
  'gbobggggggbobggg',
  'bbobbbbbbbbobbbb',
  'rrorrrrrrrrorrrr',
  'oooooooooooooooo',
  'bbobbbbbbbbobbbb',
  'gbobggggggbobggg',
  'glbblgggglbblggg',
  'gggggggggggggggg',
];

export const TILES = {
  grass: [grass],
  tallgrass: [tallGrass(false), tallGrass(true)],
  path: [path],
  sand: [sand],
  flowers: [flowers()],
  pier: [pier()],
  water: [water(0), water(6)],
  tree: [tree],
  rock: [rock],
  fence: [fence],
  fog: [fog],
  cliff: [cliff()],
  moss: [moss],
  fern: [fern(false), fern(true)],
  fortree: [fortree],
  mushroom: [mushroom],
};

// ---------- Gebäude ----------

function lighthouse() {
  const W = 32, H = 64;
  const g = grid(W, H, '.');
  const row = (y, x0, x1, fn) => { for (let x = x0; x <= x1; x++) g[y][x] = fn(x); };

  // Steinsockel
  for (let y = 54; y < 64; y++) {
    row(y, 4, 27, x => {
      if (x === 4 || x === 27 || y === 63) return 'k';
      if (y === 54) return 'k';
      if (y === 55) return 'm';
      const band = Math.floor((y - 55) / 3);
      if ((y - 55) % 3 === 2) return 'd';
      return (x + (band % 2) * 3) % 6 === 0 ? 'd' : 's';
    });
  }
  // Turm mit Streifen, nach unten breiter
  for (let y = 17; y < 54; y++) {
    const half = 6 + Math.round(((y - 17) / 36) * 4);
    const x0 = 16 - half, x1 = 15 + half;
    const red = Math.floor((y - 17) / 8) % 2 === 1;
    row(y, x0, x1, x => {
      if (x === x0 || x === x1) return 'k';
      const rel = (x - x0) / (x1 - x0);
      if (red) return rel < 0.22 ? 'C' : rel > 0.7 ? 'P' : 'e';
      return rel < 0.22 ? 'w' : rel > 0.7 ? (rel > 0.88 ? 'm' : 'f') : 'w';
    });
  }
  // kleine Fenster
  for (const wy of [23, 39]) for (let y = wy; y < wy + 4; y++) row(y, 15, 16, () => (y === wy ? 'k' : 'n'));
  g[24][15] = 'A';
  g[40][15] = 'A';
  // Galerie
  row(14, 6, 25, () => 'k');
  row(15, 6, 25, x => (x % 3 === 0 ? 'k' : 'm'));
  row(16, 6, 25, () => 'k');
  // Laternenraum mit Licht
  for (let y = 7; y < 14; y++) {
    row(y, 9, 22, x => {
      if (x === 9 || x === 22) return 'k';
      if ((x - 9) % 4 === 0) return 'n';
      return y > 8 && y < 12 && x > 12 && x < 19 ? 'w' : 'H';
    });
  }
  // Dach
  row(6, 7, 24, () => 'k');
  for (let y = 0; y < 6; y++) {
    const half = 1 + y;
    row(y, 16 - half, 15 + half, x => (x === 16 - half || x === 15 + half ? 'k' : x < 16 ? 'd' : 'n'));
  }
  // Tür (unten Mitte, durch den Sockel)
  row(50, 14, 17, () => 'k');
  for (let y = 51; y < 63; y++) {
    row(y, 13, 18, x => {
      if (x === 13 || x === 18) return 'k';
      if (y === 56 && x === 17) return 'h';
      return (x - 14) % 2 === 0 ? 'b' : 'o';
    });
  }
  return toRows(g);
}

function house({ base, dark, light }) {
  const W = 48, H = 48;
  const g = grid(W, H, '.');
  // Schornstein
  for (let y = 0; y < 10; y++) for (let x = 34; x < 39; x++) g[y][x] = x === 34 || x === 38 || y === 0 ? 'k' : x === 35 ? 'm' : 's';
  // Dach
  for (let y = 2; y < 24; y++) {
    const left = Math.round(9 - ((y - 2) * 9) / 21);
    const right = W - 1 - left;
    for (let x = left; x <= right; x++) {
      let ch = base;
      if ((y - 2) % 4 === 3) ch = dark;
      else if ((x + (Math.floor((y - 2) / 4) % 2) * 4) % 8 === 0) ch = dark;
      else if (y < 6 && x < W / 2) ch = light;
      if (x === left || x === right || y === 2 || y === 23) ch = 'k';
      g[y][x] = ch;
    }
  }
  // Wände mit Fachwerk
  for (let y = 24; y < 48; y++) {
    for (let x = 3; x < 45; x++) {
      let ch = 'c';
      if (x === 3 || x === 44 || y === 47) ch = 'k';
      else if (x === 4 || x === 43 || x === 23 || x === 24 || y === 24 || y === 25) ch = 'o';
      else if (y > 42) ch = 'Y';
      g[y][x] = ch;
    }
  }
  // Fenster
  for (const wx of [8, 32]) {
    for (let y = 29; y < 37; y++) for (let x = wx; x < wx + 8; x++) {
      let ch = 'L';
      if (x === wx || x === wx + 7 || y === 29 || y === 36) ch = 'b';
      else if (x === wx + 3 || y === 32) ch = 'b';
      else if (x < wx + 3 && y < 32) ch = 'A';
      g[y][x] = ch;
    }
    for (let x = wx; x < wx + 8; x++) g[37][x] = x % 2 ? 'R' : 'g';
  }
  // Tür (Spalte 16–31 → Türfeld dx 1)
  for (let y = 33; y < 47; y++) for (let x = 19; x < 29; x++) {
    let ch = (x - 20) % 3 === 0 ? 'b' : 'o';
    if (x === 19 || x === 28 || y === 33) ch = 'k';
    if (x === 26 && y === 40) ch = 'h';
    g[y][x] = ch;
  }
  return toRows(g);
}

function boat() {
  const W = 32, H = 16;
  const g = grid(W, H, '.');
  const inset = [6, 3, 1, 0, 0, 1, 3, 6];
  for (let i = 0; i < inset.length; i++) {
    const y = 5 + i;
    for (let x = inset[i]; x < W - inset[i]; x++) {
      let ch = 'o';
      if (x === inset[i] || x === W - 1 - inset[i] || i === inset.length - 1) ch = 'k';
      else if (i === 0) ch = 'r';
      else if (i === 1) ch = 'b';
      else if (i === 4) ch = 'b';
      else if (i >= 6) ch = 'b';
      g[y][x] = ch;
    }
  }
  // Ruderbank
  for (let x = 13; x < 19; x++) g[6][x] = 'r';
  return toRows(g);
}

export const BUILDINGS = {
  lighthouse: lighthouse(),
  house: house({ base: 'C', dark: 'e', light: 'p' }),
  houseTeal: house({ base: 't', dark: 'F', light: 'T' }),
  housePlum: house({ base: 'v', dark: 'P', light: 'V' }),
  boat: boat(),
};

// ---------- Gegenstände ----------

const bush = [
  '................',
  '................',
  '.....kkkkkk.....',
  '...kkFllllFkk...',
  '..kFllGlllllFk..',
  '.kFlleelGllllFk.',
  '.kllleellllellk.',
  'kFlGllllleelllFk',
  'kllllellleellllk',
  'kFllleelllllGlFk',
  '.kFllllllelllFk.',
  '.kkFFllllllFFkk.',
  '...kkFFFFFFkk...',
  '.....kkkkkk.....',
  '................',
  '................',
];

// Zettelstein: ein Stein mit hellem Zeichen. Gelöst ist es ein gewöhnlicher Stein.
function marked(rows, cells, ch) {
  const g = rows.map(r => [...r]);
  for (const [x, y] of cells) g[y][x] = ch;
  return toRows(g);
}

// Leuchtstein: eine Säule auf einem Sockel mit einem Kristall, dunkel oder leuchtend (16 × 32).
function beacon(lit) {
  const g = grid(16, 32, '.');
  for (let y = 25; y < 31; y++) for (let x = 2; x < 14; x++) g[y][x] = y === 25 || y === 30 || x === 2 || x === 13 ? 'k' : y < 27 ? 'm' : 's';
  for (let y = 6; y < 25; y++) {
    const half = y < 9 ? y - 5 : 3;
    for (let x = 7 - half; x <= 8 + half; x++) g[y][x] = x === 7 - half || x === 8 + half ? 'k' : x < 8 ? 'd' : 's';
  }
  g[5][7] = 'k';
  g[5][8] = 'k';
  const glow = lit ? ['w', 'H', 'h'] : ['V', 'v', 'P'];
  for (const [x, y, i] of [[7, 11, 0], [8, 11, 1], [7, 12, 1], [8, 12, 2], [6, 13, 1], [7, 13, 0], [8, 13, 1], [9, 13, 2], [7, 14, 1], [8, 14, 2], [7, 15, 2], [8, 15, 1]]) g[y][x] = glow[i];
  return toRows(g);
}

// Altbaum im Flüsterwald mit freundlichem Rindengesicht (16 × 32, steht auf einem Feld).
function oldTree() {
  const g = grid(16, 32, '.');
  for (let y = 0; y < 18; y++) for (let x = 0; x < 16; x++) {
    const dx = (x - 7.5) / 8, dy = (y - 8.5) / 9;
    const d = dx * dx + dy * dy;
    if (d <= 1) g[y][x] = d > 0.8 ? 'k' : noise(x, y, 41) < 0.3 ? 'F' : noise(x, y, 42) < 0.25 ? 'g' : 'l';
  }
  for (let y = 15; y < 31; y++) for (let x = 4; x < 12; x++) g[y][x] = x === 4 || x === 11 ? 'k' : (x + y) % 5 === 0 ? 'b' : 'o';
  for (const [x, y] of [[3, 29], [2, 30], [12, 29], [13, 30], [4, 31], [5, 31], [10, 31], [11, 31]]) g[y][x] = 'k';
  for (const [x, y] of [[6, 20], [9, 20], [6, 21], [9, 21]]) g[y][x] = 'k';
  for (const [x, y] of [[6, 24], [7, 25], [8, 25], [9, 24]]) g[y][x] = 'b';
  return toRows(g);
}

export const PROPS = {
  bush,
  bushEmpty: retint(bush, { e: 'l' }),
  noteStone: marked(rock, [[7, 6], [6, 7], [7, 7], [8, 7], [7, 8]], 'H'),
  noteStoneDone: rock,
  beaconDark: beacon(false),
  beaconLit: beacon(true),
  oldtree: oldTree(),
  sign: [
    '................',
    '................',
    '..kkkkkkkkkkkk..',
    '..krrrrrrrrrrk..',
    '..kroooooooork..',
    '..krobbobbbork..',
    '..kroooooooork..',
    '..krobbbobbork..',
    '..kroooooooork..',
    '..krrrrrrrrrrk..',
    '..kkkkkkkkkkkk..',
    '.......kok......',
    '.......kok......',
    '.......kok......',
    '......kkokk.....',
    '................',
  ],
};
