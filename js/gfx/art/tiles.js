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

// ---------- Pilzmoor, Spiegeldünen, Windklippen (Plan 3b) ----------
// Farbstimmung (Design 5.3): Moor dunkles Türkis, Moosgrün und Pilzleuchten in Gelb und Rosa;
// Dünen helles Sandgold, Glas-Cyan und Spiegelweiß; Klippen Felsgrau, Himmelblau, Wolkenweiß, Holz.

// Torfboden: dunkelgrün mit Torf und Moos
const peat = speckled('F', 51, [['l', 0.07], ['b', 0.05], ['t', 0.02]]);

// Moorwasser: dunkel und ruhig, mit türkisen Wellenlinien, die sich zwischen zwei Bildern verschieben
function bog(shift) {
  const g = grid(16, 16, 'D');
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (noise(x, y, 52) < 0.07) g[y][x] = 'n';
  for (const [cx, cy] of [[2, 2], [10, 6], [5, 10], [12, 13]]) {
    const x = (cx + shift) % 16;
    for (let i = 0; i < 4; i++) g[cy][(x + i) % 16] = 't';
    g[cy][(x + 4) % 16] = 'n';
  }
  return toRows(g);
}

// Leuchtpilze (ohne Boden): gelbe und rosa Kappen
const glowshroom = [
  '................',
  '................',
  '................',
  '..........kkk...',
  '...kkkk..kRRRk..',
  '..kHHwHk.kRwRk..',
  '..khHHhk..kck...',
  '...kkkk...kck...',
  '....kck..kkckk..',
  '....kck.........',
  '...kkckk..kkk...',
  '.........kHwHk..',
  '..........kck...',
  '.........kkckk..',
  '................',
  '................',
];

// Schilf: Halme mit braunen Kolben, im zweiten Bild neigen sich die Spitzen
function reed(lean) {
  const g = grid(16, 16, 'F');
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (noise(x, y, 53) > 0.88) g[y][x] = 'b';
  for (const [x, top] of [[1, 3], [4, 1], [6, 5], [9, 2], [12, 4], [14, 1]]) {
    for (let y = top; y < 16; y++) {
      const lx = lean && y < top + 5 ? (x + 1) % 16 : x;
      g[y][lx] = y < top + 2 ? 'o' : y % 3 === 0 ? 'g' : 'l';
    }
  }
  return toRows(g);
}

const glasssand = speckled('Y', 61, [['y', 0.1], ['A', 0.035], ['w', 0.02]]);

// Dünengras: helle Büschel auf Sand
const dunegrass = lean => retint(tallGrass(lean), { l: 'Y', g: 'G', G: 'T', F: 'y' });

// Sandkamm: heller Kamm, darunter der Schatten der steilen Seite
function dune() {
  const g = grid(16, 16, 'Y');
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const crest = 5 + Math.round(2 * Math.sin((x / 16) * Math.PI * 2));
    if (y === crest) g[y][x] = 'w';
    else if (y > crest) g[y][x] = noise(x, y, 62) < 0.07 ? 'r' : 'y';
    else if (noise(x, y, 63) < 0.08) g[y][x] = 'y';
  }
  return toRows(g);
}

// Luftspiegelung: sieht aus wie ein Weg, nur ein feines Flimmern verrät sie
function mirage(shift) {
  const g = path.map(r => [...r]);
  for (const [cx, cy, len] of [[2, 4, 5], [9, 8, 4], [4, 12, 6]]) {
    for (let i = 0; i < len; i++) g[cy][(cx + shift + i) % 16] = i === 0 || i === len - 1 ? 'f' : 'A';
  }
  return toRows(g);
}

const cliffrock = speckled('m', 71, [['s', 0.14], ['f', 0.07], ['d', 0.03], ['g', 0.02]]);

// Windgras auf den Klippen, im zweiten Bild vom Wind gebeugt
const windgrass = lean => retint(tallGrass(lean), { l: 'g', g: 'G', G: 'T', F: 'l' });

// Wolken tief unter einem: Himmelblau mit weichen weißen Bäuschen
function clouds(shift) {
  const g = grid(16, 16, 'L');
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (noise(x, y, 72) < 0.04) g[y][x] = 'A';
  const puff = ['..ff..', '.fwwf.', 'fwwwwf', '.ffff.'];
  for (const [ox, oy] of [[2, 3], [9, 10]]) stamp(g, puff, ox + shift, oy);
  return toRows(g);
}

// Hängebrücke: Holzbretter zwischen zwei Seilen, darunter Wolken
function bridge() {
  const g = clouds(0).map(r => [...r]);
  for (let x = 0; x < 16; x++) {
    g[3][x] = 'b';
    g[12][x] = 'b';
    for (let y = 4; y < 12; y++) g[y][x] = x % 4 === 3 ? 'b' : y === 4 ? 'r' : 'o';
  }
  return toRows(g);
}
const transpose = rows => rows[0].split('').map((_, x) => rows.map(r => r[x]).join(''));

// Felsnadel (ohne Boden)
const spire = [
  '................',
  '.......kk.......',
  '......kmsk......',
  '......kmsk......',
  '.....kmmsdk.....',
  '.....kmssdk.....',
  '.....kmssdk.....',
  '....kmmssddk....',
  '....kmsssddk....',
  '....kmssgsdk....',
  '...kmmsssdddk...',
  '...kmssssdddk...',
  '..kmmsssssdddk..',
  '..kmsssssddddk..',
  '.kkkkkkkkkkkkkk.',
  '................',
];

// ---------- Uhrwerkruinen, Nordlichtsee, Sternenwiese (Plan 3c) ----------
// Farbstimmung (Design 5.3): Ruinen Messing und Kupfer, grünlicher Stein, dunkles Kanalwasser;
// See Weiß, Eisblau, Tannengrün; Wiese Nachtblau, Sternengold, dunkles Wiesengrün.

// Pflaster: helle Steine in versetzten Reihen, dazwischen Fugen mit etwas Moos
function cobble() {
  const g = grid(16, 16, 'm');
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const row = Math.floor(y / 4), off = row % 2 ? 3 : 0;
    const joint = y % 4 === 3 || (x + off) % 6 === 5;
    const r = noise(x, y, 81);
    if (joint) g[y][x] = r < 0.18 ? 't' : 's';
    else if (y % 4 === 0 && (x + off) % 6 < 2) g[y][x] = 'f';
    else if (r < 0.06) g[y][x] = 's';
  }
  return toRows(g);
}

// Kanalwasser: dunkel, mit langen ruhigen Linien, die sich zwischen zwei Bildern verschieben
function canal(shift) {
  const g = grid(16, 16, 'D');
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (noise(x, y, 82) < 0.05) g[y][x] = 'n';
  for (const [cx, cy] of [[1, 3], [9, 7], [4, 12]]) {
    const x = (cx + shift) % 16;
    for (let i = 0; i < 5; i++) g[cy][(x + i) % 16] = i === 0 || i === 4 ? 't' : 'S';
  }
  return toRows(g);
}

// Mauerrest: Ziegel aus grünlichem Stein, oben eine helle Kante, ein wenig Efeu
function ruinwall() {
  const g = grid(16, 16, 's');
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const off = Math.floor((y - 2) / 4) % 2 ? 4 : 0;
    if (y < 2) g[y][x] = y === 0 ? 'k' : 'm';
    else if ((y - 2) % 4 === 3 || (x + off) % 8 === 7) g[y][x] = 'd';
    else if ((y - 2) % 4 === 0) g[y][x] = noise(x, y, 83) < 0.5 ? 'm' : 's';
    else if (noise(x, y, 84) < 0.08) g[y][x] = 't';
    if (y === 15) g[y][x] = 'k';
  }
  for (const [x, y] of [[2, 2], [3, 3], [2, 4], [3, 5], [12, 2], [13, 3], [12, 4], [11, 3]]) g[y][x] = y % 2 ? 'F' : 'l';
  return toRows(g);
}

// Efeu ist das hohe Gras der Ruinen: dunkles Blattgrün mit türkisen Spitzen
const ivy = lean => retint(tallGrass(lean), { l: 'F', g: 't', G: 'T', F: 'l' });

const snow = speckled('w', 91, [['f', 0.06], ['A', 0.015]]);

// Eis des Sees: blassblau und ruhig, ein heller Glanzstreif und ein feiner Riss
function ice() {
  const g = grid(16, 16, 'A');
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (noise(x, y, 92) < 0.025) g[y][x] = 'w';
  for (const [x, y] of [[2, 3], [3, 3], [4, 3], [3, 4]]) g[y][x] = 'w';
  for (const [x, y] of [[10, 10], [11, 11], [12, 11]]) g[y][x] = 'L';
  return toRows(g);
}

// Offenes Wasser im Eis: tiefblau, dunkler als das Meer
const icewater = shift => retint(water(shift), { S: 'D', L: 'S', A: 'L', D: 'n' });

// Verschneite Tanne (ohne Boden)
const snowpine = [
  '.......kk.......',
  '......kwwk......',
  '.....kwFlwk.....',
  '.....kFllFk.....',
  '....kwwFlwwk....',
  '....kFlllFFk....',
  '...kwwwFlwwwk...',
  '...kFllllllFk...',
  '..kFFlllllFFFk..',
  '..kwwwwFlwwwwk..',
  '.kFlllllllllFFk.',
  '.kFFlllllllFFFk.',
  '.kkkkkkbbkkkkkk.',
  '.......bo.......',
  '......kbok......',
  '................',
];

// Schneegras: grüne Halme mit mintfarbenem Reif auf weißem Grund
const snowgrass = lean => retint(tallGrass(lean), { l: 'f', g: 'l', G: 'T', F: 'm' });

// Nachtwiese: dunkles Wiesengrün
const nightgrass = retint(grass, { g: 'F', G: 'l', l: 'd' });

// Felsblock bei Nacht (ohne Boden)
const nightrock = retint(rock, { m: 's', f: 'm', s: 'd', d: 'n' });

// Felskante der Sternenwiese: oben Nachtwiese, darunter dunkler Fels, ganz unten Nacht
const nightcliff = retint(cliff(), { G: 'l', g: 'F', s: 'd', m: 's', n: 'n', d: 'n', A: 'n', L: 'd' });

// Fels des Bergs bei Nacht: dunkler, massiver Stein, in den das Höhlentor gehauen ist
const nightstone = speckled('d', 95, [['s', 0.12], ['n', 0.1], ['m', 0.02]]);

// Sternengras: Halme mit goldenen Spitzen
const startall = lean => retint(tallGrass(lean), { l: 'F', g: 'l', G: 'H', F: 'n' });

// Hohle Eiche (Plan 4c): Wurzelwände, dunkle Erde, Wurzelmoos als hohes Gras
const rootwall = speckled('n', 103, [['b', 0.22], ['o', 0.08], ['F', 0.04], ['k', 0.05]]);
const rootfloor = speckled('b', 101, [['o', 0.12], ['F', 0.05], ['n', 0.04]]);
const rootmoss = lean => retint(tallGrass(lean), { l: 'F', g: 'l', G: 'g', F: 'b' });

// Glasturm (Plan 4c): Glasboden mit Lichtbrechungen, Glaswand am Rand, Prismengras
const glassfloor = speckled('A', 111, [['w', 0.08], ['L', 0.06], ['V', 0.02], ['T', 0.02]]);
const glasswall = speckled('L', 113, [['S', 0.18], ['A', 0.1], ['w', 0.04]]);
const prismgrass = lean => retint(tallGrass(lean), { l: 'L', g: 'A', G: 'V', F: 'S' });

// Gezeiteninsel (Plan 4d): Tümpel mit Steinrand auf Sand (blockiert) und Seegras als hohes Gras
function tidepool() {
  const g = sand.map(r => [...r]);
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const dx = (x + 0.5 - 8) / 6.5, dy = (y + 0.5 - 8) / 5.5, d = dx * dx + dy * dy;
    if (d <= 0.62) g[y][x] = noise(x, y, 71) < 0.1 ? 'L' : 'S';
    else if (d <= 1) g[y][x] = noise(x, y, 72) < 0.5 ? 's' : 'm';
  }
  g[6][6] = 'A'; g[6][7] = 'A'; g[7][6] = 'L';
  for (const [x, y] of [[10, 9], [9, 9], [11, 9], [10, 8], [10, 10]]) g[y][x] = 'C'; // ein Seestern
  return toRows(g);
}
const tidegrass = lean => retint(tallGrass(lean), { l: 'Y', g: 't', G: 'l', F: 'y' });

// Eisgrotte (Plan 4d): blankes Rutscheis mit schrägen Glanzstreifen (anders als das stumpfe Eis
// des Sees), Wände aus dunklem Eis und Eissäulen, die beim Gleiten aufhalten
function slideice() {
  const g = grid(16, 16, 'L');
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (noise(x, y, 121) < 0.04) g[y][x] = 'A';
  for (const [x0, y0, n] of [[1, 13, 5], [8, 7, 5], [11, 15, 3], [3, 4, 3]]) {
    for (let i = 0; i < n; i++) g[(y0 - i + 16) % 16][(x0 + i) % 16] = i === 0 || i === n - 1 ? 'A' : 'w';
  }
  return toRows(g);
}
const icewall = speckled('S', 123, [['D', 0.16], ['L', 0.08], ['A', 0.03]]);
const icepillar = (() => {
  const g = slideice().map(r => [...r]);
  retint(rock, { m: 'A', f: 'w', s: 'L', d: 'S', k: 'D' }).forEach((r, y) => [...r].forEach((c, x) => { if (c !== '.') g[y][x] = c; }));
  return toRows(g);
})();

// Höhle im Berg (Plan 5a): dunkler Fels, Kristallmoos als hohes Gras, Treppen und stilles Wasser
const cavefloor = speckled('s', 131, [['d', 0.14], ['m', 0.04], ['V', 0.008]]);
const cavewall = speckled('n', 133, [['k', 0.45], ['d', 0.05], ['v', 0.012]]);
const crystalmoss = lean => retint(tallGrass(lean), { l: 'd', g: 'v', G: 'V', F: 'n' });
function stairs(down) {
  const g = grid(16, 16, 'd');
  for (let i = 0; i < 4; i++) {
    const shade = down ? ['s', 'd', 'n', 'k'][i] : ['m', 's', 's', 'd'][i];
    for (let y = i * 4; y < i * 4 + 4; y++) for (let x = 1; x < 15; x++) g[y][x] = y === i * 4 ? 'm' : shade;
  }
  for (let y = 0; y < 16; y++) { g[y][0] = 'k'; g[y][15] = 'k'; }
  return toRows(g);
}
const cavewater = shift => retint(water(shift), { S: 'D', L: 'S', A: 'L', D: 'n' });

// Sternwarte (Plan 4d): Tor zur Kuppel aus Bronzestäben mit einem Stern in der Mitte
const domegate = (() => {
  const g = grid(16, 16, 'n');
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    if (y === 0 || y === 15) g[y][x] = 'k';
    else if (y === 1 || y === 14) g[y][x] = 'r';
    else if (x % 4 === 1) g[y][x] = 'h';
    else if (x % 4 === 2) g[y][x] = 'r';
  }
  for (const [x, y] of [[7, 5], [8, 5], [6, 7], [7, 7], [8, 7], [9, 7], [7, 6], [8, 6], [7, 8], [8, 8], [7, 9], [8, 9], [6, 6], [9, 6]]) g[y][x] = 'H';
  g[7][7] = 'w';
  return toRows(g);
})();

// Felder ohne eigenen Boden, unter die der Boden der Umgebung gezeichnet wird
export const OVERLAY_TILES = new Set(['rock', 'fortree', 'mushroom', 'glowshroom', 'spire', 'snowpine', 'nightrock']);

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
  peat: [peat],
  reed: [reed(false), reed(true)],
  bog: [bog(0), bog(5)],
  glowshroom: [glowshroom],
  glasssand: [glasssand],
  dunegrass: [dunegrass(false), dunegrass(true)],
  dune: [dune()],
  mirage: [mirage(0), mirage(1)],
  cliffrock: [cliffrock],
  windgrass: [windgrass(false), windgrass(true)],
  clouds: [clouds(0), clouds(1)],
  bridge: [bridge()],
  bridgev: [transpose(bridge())],
  spire: [spire],
  cobble: [cobble()],
  canal: [canal(0), canal(5)],
  ruinwall: [ruinwall()],
  ivy: [ivy(false), ivy(true)],
  snow: [snow],
  ice: [ice()],
  icewater: [icewater(0), icewater(6)],
  snowpine: [snowpine],
  snowgrass: [snowgrass(false), snowgrass(true)],
  nightgrass: [nightgrass],
  nightrock: [nightrock],
  nightcliff: [nightcliff],
  startall: [startall(false), startall(true)],
  nightstone: [nightstone],
  rootwall: [rootwall],
  rootfloor: [rootfloor],
  rootmoss: [rootmoss(false), rootmoss(true)],
  glassfloor: [glassfloor],
  glasswall: [glasswall],
  prismgrass: [prismgrass(false), prismgrass(true)],
  tidepool: [tidepool()],
  tidegrass: [tidegrass(false), tidegrass(true)],
  slideice: [slideice()],
  icewall: [icewall],
  icepillar: [icepillar],
  domegate: [domegate],
  cavefloor: [cavefloor],
  cavewall: [cavewall],
  crystalmoss: [crystalmoss(false), crystalmoss(true)],
  stairsdown: [stairs(true)],
  stairsup: [stairs(false)],
  cavewater: [cavewater(0), cavewater(5)],
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

// Umriss: Jedes Pixel der Form, das an Leeres grenzt, wird dunkel.
function outline(g, ch = 'k') {
  const h = g.length, w = g[0].length;
  const empty = (x, y) => x < 0 || y < 0 || x >= w || y >= h || g[y][x] === '.';
  const edge = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (g[y][x] !== '.' && (empty(x - 1, y) || empty(x + 1, y) || empty(x, y - 1) || empty(x, y + 1))) edge.push([x, y]);
  }
  for (const [x, y] of edge) g[y][x] = ch;
  return g;
}

// Umriss außen herum: Leere Pixel neben der Form werden dunkel (für feine Formen wie Zahnräder).
function outlineOutside(g, ch = 'k') {
  const h = g.length, w = g[0].length;
  const solid = (x, y) => x >= 0 && y >= 0 && x < w && y < h && g[y][x] !== '.' && g[y][x] !== '#';
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (g[y][x] === '.' && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) g[y][x] = '#';
  }
  for (const row of g) row.forEach((c, x) => { if (c === '#') row[x] = ch; });
  return g;
}

// Zahnrad der Uhrwerkruinen auf einem Pfosten (16 × 32): sechs Zähne, zwei Stellungen, um einen
// halben Zahnabstand gedreht. Abwechselnd gezeigt, dreht es sich.
function gear(frame) {
  const g = grid(16, 32, '.');
  const rot = (frame * Math.PI) / 6;
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const dx = x - 7.5, dy = y - 7.5;
    const r = Math.hypot(dx, dy), a = Math.atan2(dy, dx) - rot;
    const tooth = r <= 7.2 && Math.cos(a * 6) > 0.35;
    if (!(r <= 4.7 || tooth)) continue;
    let ch = dx + dy > 2.5 ? 'r' : dx + dy < -5 ? 'H' : 'h';
    if (r < 3.2 && r >= 1.5 && Math.cos(a * 4) < 0.5) ch = 'b'; // Löcher zwischen den Speichen
    if (r < 1.5) ch = 'k'; // Achse
    g[y][x] = ch;
  }
  outlineOutside(g);
  // Pfosten aus dunklem Metall hinter dem Zahnrad, auf einem Steinsockel
  for (let y = 12; y < 29; y++) for (let x = 6; x <= 9; x++) {
    if (g[y][x] !== '.') continue;
    g[y][x] = x === 6 || x === 9 ? 'k' : x === 7 ? 's' : 'd';
  }
  for (let y = 28; y < 32; y++) for (let x = 3; x <= 12; x++) g[y][x] = y === 28 || y === 31 || x === 3 || x === 12 ? 'k' : y === 29 ? 'm' : 's';
  return toRows(g);
}

// Sternwarte (16 × 48): runder Turm mit Kupferkuppel und Spalt, aus dem ein Fernrohr schaut.
function observatory() {
  const g = grid(16, 48, '.');
  for (let y = 4; y < 16; y++) for (let x = 0; x < 16; x++) {
    const dx = (x - 7.5) / 7.5, dy = (y - 15.5) / 11.5;
    if (dx * dx + dy * dy > 1) continue;
    g[y][x] = x >= 7 && x <= 8 ? 'k' : x < 5 && y < 11 ? 'T' : 't';
  }
  outline(g);
  // Fernrohr aus dem Spalt
  for (const [x, y] of [[9, 4], [10, 3], [11, 2], [12, 1]]) g[y][x] = 'h';
  for (const [x, y] of [[10, 4], [11, 3], [12, 2], [13, 1]]) g[y][x] = 'r';
  for (let y = 16; y < 46; y++) for (let x = 2; x <= 13; x++) {
    let ch = x <= 4 ? 'f' : x >= 11 ? 's' : 'm';
    if ((y - 16) % 5 === 4) ch = 's';
    if (x === 2 || x === 13) ch = 'k';
    g[y][x] = ch;
  }
  for (const wy of [20, 31]) for (let y = wy; y < wy + 4; y++) for (let x = 7; x <= 8; x++) g[y][x] = y === wy ? 'k' : x === 7 && y === wy + 1 ? 'L' : 'D';
  for (let y = 40; y < 46; y++) for (let x = 6; x <= 9; x++) g[y][x] = x === 6 || x === 9 || y === 40 ? 'k' : 'b';
  for (let y = 46; y < 48; y++) for (let x = 1; x <= 14; x++) g[y][x] = y === 47 || x === 1 || x === 14 ? 'k' : 'd';
  return toRows(g);
}

// Eingang der Eisgrotte (16 × 32): ein Hügel aus Eis mit dunkler Öffnung und Eiszapfen.
function iceCave() {
  const g = grid(16, 32, '.');
  for (let y = 8; y < 32; y++) for (let x = 0; x < 16; x++) {
    const dx = (x - 7.5) / 8, dy = (y - 31.5) / 23.5;
    if (dx * dx + dy * dy > 1) continue;
    const r = noise(x, y, 93);
    g[y][x] = x < 6 && r < 0.6 ? 'w' : r < 0.12 ? 'L' : 'A';
  }
  outline(g, 'S');
  for (let y = 18; y < 32; y++) for (let x = 4; x <= 11; x++) {
    const dx = (x - 7.5) / 4, dy = (y - 31.5) / 13.5;
    if (dx * dx + dy * dy <= 1) g[y][x] = dx * dx + dy * dy > 0.7 ? 'D' : 'n';
  }
  for (const [x, len] of [[5, 2], [7, 3], [9, 2], [10, 1]]) for (let i = 0; i < len; i++) g[19 + i][x] = 'w';
  return toRows(g);
}

// Fischerzelt am See (16 × 32): rotes Zelt mit Eingang, oben ein kleiner Wimpel.
function tent() {
  const g = grid(16, 32, '.');
  for (let y = 12; y < 32; y++) {
    const half = Math.floor((y - 12) * 0.4) + 1;
    for (let x = 8 - half; x < 8 + half; x++) g[y][x] = x === 8 - half || x === 7 + half || y === 31 ? 'k' : x < 8 ? 'C' : 'e';
  }
  for (let y = 22; y < 31; y++) {
    const half = Math.floor((y - 22) * 0.4) + 1;
    for (let x = 8 - half; x < 8 + half; x++) g[y][x] = 'b';
  }
  for (let y = 5; y < 12; y++) g[y][7] = 'o';
  for (const [x, y] of [[8, 5], [9, 5], [10, 6], [8, 6], [9, 6], [8, 7]]) g[y][x] = 'h';
  return toRows(g);
}

// Höhlentor am Berg (48 × 48): ein verschlossenes Steintor im Fels, darüber acht Fassungen in einem
// Bogen. Hier leer gezeichnet; die Welt lässt die Fassungen der entzündeten Steine leuchten.
export const CAVE_SOCKETS = Array.from({ length: 8 }, (_, i) => {
  const a = Math.PI + (i * Math.PI) / 7;
  return [Math.round(23.5 + 18 * Math.cos(a)), Math.round(28 + 18 * Math.sin(a))];
});

function caveGate() {
  const W = 48, H = 48;
  const g = grid(W, H, '.');
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const top = 2 + Math.round(((x - 23.5) / 23.5) ** 2 * 12);
    if (y < top) continue;
    const r = noise(x, y, 94);
    g[y][x] = r < 0.12 ? 'm' : r > 0.85 ? 'd' : 's';
  }
  outline(g);
  // Tor: Bogen aus hellem Stein, darin eine dunkle Tür aus Steinplatten
  const inDoor = (x, y, grow) => (y >= 30 && x >= 16 - grow && x <= 31 + grow) || (x - 23.5) ** 2 + (y - 30) ** 2 <= (7.5 + grow) ** 2;
  for (let y = 18; y < H; y++) for (let x = 12; x < 36; x++) {
    if (inDoor(x, y, 0)) g[y][x] = (x - 16) % 4 === 3 || (y - 30) % 6 === 5 ? 'd' : 'n';
    else if (inDoor(x, y, 2)) g[y][x] = y % 3 === 0 ? 'f' : 'm';
  }
  for (let x = 14; x <= 33; x++) g[H - 1][x] = 'k';
  // Leere Fassungen: ein dunkler Ring um eine kleine Mulde
  for (const [cx, cy] of CAVE_SOCKETS) {
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) g[cy + dy][cx + dx] = dx === 0 && dy === 0 ? 'd' : 'k';
  }
  return toRows(g);
}

export const BUILDINGS = {
  lighthouse: lighthouse(),
  house: house({ base: 'C', dark: 'e', light: 'p' }),
  houseTeal: house({ base: 't', dark: 'F', light: 'T' }),
  housePlum: house({ base: 'v', dark: 'P', light: 'V' }),
  boat: boat(),
  cavegate: caveGate(),
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

// Riesenpilz im Moor (16 × 32): violette Kappe mit hellen Punkten, rosa Lamellen, heller Stiel.
function bigShroom() {
  const g = grid(16, 32, '.');
  for (let y = 3; y <= 15; y++) for (let x = 0; x < 16; x++) {
    const dx = (x - 7.5) / 8, dy = (y - 15.5) / 12.5;
    const d = dx * dx + dy * dy;
    if (d > 1) continue;
    let ch = d > 0.74 ? 'k' : y === 15 ? 'R' : y >= 13 ? 'P' : x < 7 && y < 9 ? 'V' : 'v';
    if (y === 15 && (x === 0 || x === 15)) ch = 'k';
    g[y][x] = ch;
  }
  for (const [x, y] of [[5, 6], [10, 7], [3, 10], [12, 11], [8, 10]]) if (g[y][x] !== 'k') g[y][x] = 'w';
  for (let x = 2; x <= 13; x++) g[16][x] = 'k';
  for (let y = 17; y < 31; y++) for (let x = 5; x <= 10; x++) g[y][x] = x === 5 || x === 10 ? 'k' : x === 9 ? 'f' : 'c';
  for (let x = 4; x <= 11; x++) g[31][x] = 'k';
  return toRows(g);
}

// Glasstatue in den Dünen (16 × 32): eine Gestalt aus Glas auf einem Steinsockel.
function statue() {
  const g = grid(16, 32, '.');
  const glass = (x, x0, x1) => (x === x0 || x === x1 ? 'S' : x === x0 + 1 ? 'w' : x === x1 - 1 ? 'L' : 'A');
  // Kopf
  for (let y = 3; y < 10; y++) for (let x = 4; x < 12; x++) {
    const dx = (x - 7.5) / 4, dy = (y - 6) / 3.5;
    if (dx * dx + dy * dy <= 1) g[y][x] = dx * dx + dy * dy > 0.6 ? 'S' : x < 7 ? 'w' : 'A';
  }
  // Körper, nach unten breiter, mit erhobenem Arm
  for (let y = 10; y < 25; y++) {
    const half = 2 + Math.floor((y - 10) / 4);
    const x0 = 8 - half, x1 = 7 + half;
    for (let x = x0; x <= x1; x++) g[y][x] = glass(x, x0, x1);
  }
  for (const [x, y] of [[11, 9], [12, 8], [12, 7], [13, 6], [11, 10], [12, 9]]) g[y][x] = 'S';
  g[7][12] = 'A';
  g[8][12] = 'A';
  // Sockel
  for (let y = 25; y < 32; y++) for (let x = 2; x < 14; x++) g[y][x] = y === 25 || y === 31 || x === 2 || x === 13 ? 'k' : y < 27 ? 'm' : 's';
  return toRows(g);
}

// Glasturm (16 × 48): hoch und schmal, mit Spitze; steht auf einem unerreichbaren Plateau.
// Eine alte Eiche mit einem Loch wie eine Tür (Eingang zur Hohlen Eiche).
function hollowOak() {
  const rows = oldTree().map(r => [...r]);
  const h = rows.length, w = rows[0].length;
  const cx = Math.floor(w / 2), bottom = h - 2;
  for (let y = bottom - 9; y <= bottom; y++) {
    for (let x = cx - 3; x <= cx + 2; x++) {
      const dy = (bottom - y) / 9, dx = (x - cx + 0.5) / 3;
      if (dx * dx + (dy > 0.6 ? ((dy - 0.6) / 0.4) ** 2 : 0) <= 1) rows[y][x] = y === bottom - 9 || Math.abs(x - cx + 0.5) > 2.2 ? 'b' : 'k';
    }
  }
  return rows.map(r => r.join(''));
}

// Eine Öse aus Metall in der Glaswand (Eingang zum Glasturm mit dem Kletterhaken).
function hookRing() {
  const g = Array.from({ length: 16 }, () => Array(16).fill('.'));
  const ring = [[6, 4], [7, 3], [8, 3], [9, 4], [10, 5], [10, 6], [9, 7], [8, 8], [7, 8], [6, 7], [5, 6], [5, 5]];
  for (const [x, y] of ring) g[y][x] = 's';
  for (const [x, y] of [[7, 4], [8, 4], [6, 5]]) g[y][x] = 'f';
  for (let y = 9; y < 15; y++) g[y][8] = 'd';
  g[15][7] = 'd'; g[15][8] = 'd'; g[15][9] = 'd';
  return g.map(r => r.join(''));
}

// Ein Pfahl mit Seil zum Festmachen (Eingang zu den Inseln mit der Nussschale).
function boatPost() {
  const g = Array.from({ length: 16 }, () => Array(16).fill('.'));
  for (let y = 1; y < 16; y++) for (let x = 5; x <= 10; x++) {
    g[y][x] = y === 1 || x === 5 || x === 10 ? 'k' : x === 6 ? 'r' : x === 9 ? 'b' : 'o';
  }
  for (const x of [5, 10]) g[1][x] = '.';
  g[2][6] = 'y';
  for (let x = 4; x <= 11; x++) { g[6][x] = x % 2 ? 'y' : 'c'; g[7][x] = x % 2 ? 'c' : 'y'; }
  for (const [x, y] of [[4, 5], [11, 5], [3, 6], [3, 7], [4, 8], [11, 8]]) g[y][x] = 'k';
  for (const [x, y] of [[12, 7], [12, 8], [13, 9], [13, 10], [12, 11], [13, 12]]) g[y][x] = 'y'; // loses Seilende
  return g.map(r => r.join(''));
}

// Die Eiskante am Nordlichtsee: eine Scholle aus glattem Eis mit Kufenspuren (Eingang zur Eisgrotte).
function iceEdge() {
  const g = Array.from({ length: 16 }, () => Array(16).fill('.'));
  for (let y = 4; y < 13; y++) for (let x = 1; x < 15; x++) {
    const edge = y === 4 || y === 12 || x === 1 || x === 14;
    if ((y === 4 || y === 12) && (x === 1 || x === 14)) continue;
    g[y][x] = edge ? 'S' : y > 10 ? 'L' : 'A';
  }
  for (let x = 3; x < 13; x++) { g[7][x] = x % 3 ? 'w' : 'A'; g[9][x] = x % 3 === 1 ? 'A' : 'w'; } // Kufenspuren
  return g.map(r => r.join(''));
}

// Ein großer Eiskristall auf Schnee (16 × 24); leuchtet, bis man sein Geschichtsstück kennt.
function iceCrystal(read) {
  const g = Array.from({ length: 24 }, () => Array(16).fill('.'));
  const spike = (cx, top, half, bottom) => {
    for (let y = top; y <= bottom; y++) {
      const w = Math.min(half, Math.floor((y - top) / 2));
      for (let x = cx - w; x <= cx + w; x++) g[y][x] = x === cx - w || x === cx + w ? 'k' : x < cx ? 'w' : x === cx ? 'A' : 'L';
    }
    g[top][cx] = 'k';
  };
  spike(4, 10, 2, 21);
  spike(11, 8, 2, 21);
  spike(8, 2, 3, 22);
  for (let x = 2; x < 14; x++) g[22][x] = g[22][x] === '.' ? 'k' : g[22][x];
  for (let x = 3; x < 13; x++) g[23][x] = 'k';
  if (!read) for (const [x, y] of [[7, 8], [8, 9], [7, 12], [8, 14], [4, 15], [11, 13]]) g[y][x] = 'H';
  return g.map(r => r.join(''));
}

// Zahnrad der Sternwarte (16 × 16): wie die Räder der Ruinen, mit einem Zeiger und einem hellen Stern,
// der nach oben (0), rechts (1), unten (2) oder links (3) zeigt.
function starGear(dir) {
  const up = gear(0).slice(0, 16).map(r => [...r]);
  // Blauer Zeiger und weißblauer Stern, damit die Stellung sich deutlich vom Gold abhebt
  for (let y = 4; y <= 6; y++) for (const x of [7, 8]) up[y][x] = 'D'; // Zeiger
  for (const [x, y] of [[7, 1], [8, 1], [7, 2], [8, 2]]) up[y][x] = 'w'; // Stern
  for (const [x, y] of [[7, 0], [8, 0], [5, 1], [6, 1], [5, 2], [6, 2], [9, 1], [10, 1], [9, 2], [10, 2], [7, 3], [8, 3]]) up[y][x] = 'L';
  for (const [x, y] of [[4, 1], [4, 2], [11, 1], [11, 2], [5, 0], [6, 0], [9, 0], [10, 0], [5, 3], [6, 3], [9, 3], [10, 3]]) up[y][x] = 'D';
  const at = [(x, y) => up[y][x], (x, y) => up[15 - x][y], (x, y) => up[15 - y][15 - x], (x, y) => up[x][15 - y]][dir];
  return Array.from({ length: 16 }, (_, y) => Array.from({ length: 16 }, (_, x) => at(x, y)).join(''));
}

// Eine Tafel aus Stein mit Sternbildern (Eingang der Sternwarte und Hinweis neben den Rädern).
function starPlaque() {
  const g = Array.from({ length: 16 }, () => Array(16).fill('.'));
  for (let y = 2; y < 15; y++) for (let x = 2; x < 14; x++) {
    g[y][x] = y === 2 || y === 14 || x === 2 || x === 13 ? 'k' : y > 11 ? 's' : 'D';
  }
  for (const [x, y] of [[4, 4], [7, 5], [10, 4], [5, 8], [9, 9], [11, 7]]) g[y][x] = 'H';
  for (const [x, y] of [[5, 4], [6, 5], [8, 5], [9, 4], [5, 7], [6, 6], [7, 8], [8, 9], [10, 8], [11, 8]]) g[y][x] = 'L';
  g[15][3] = 'k'; g[15][12] = 'k';
  return g.map(r => r.join(''));
}

// Höhle (Plan 5a): ein Echokristall (summt alte Sätze), der warme Kristall (füllt die Energie auf)
// und Morrow als Nebelgestalt in der unteren Ebene (16 × 24).
function caveCrystal(colors) {
  const [light, mid, dark] = colors;
  const g = Array.from({ length: 20 }, () => Array(16).fill('.'));
  const spike = (cx, top, half, bottom) => {
    for (let y = top; y <= bottom; y++) {
      const w = Math.min(half, Math.floor((y - top) / 2));
      for (let x = cx - w; x <= cx + w; x++) g[y][x] = x === cx - w || x === cx + w ? 'k' : x < cx ? light : x === cx ? mid : dark;
    }
    g[top][cx] = 'k';
  };
  spike(4, 9, 2, 18);
  spike(11, 7, 2, 18);
  spike(8, 2, 3, 18);
  for (let x = 2; x < 14; x++) g[19][x] = 'k';
  return g.map(r => r.join(''));
}

function morrowMist() {
  const g = Array.from({ length: 24 }, () => Array(16).fill('.'));
  for (let y = 0; y < 24; y++) for (let x = 0; x < 16; x++) {
    const head = ((x - 8) / 6) ** 2 + ((y - 8) / 6) ** 2 <= 1;
    const body = y >= 10 && y <= 22 && Math.abs(x - 7.5) <= 3 + (y - 10) / 3;
    if (head || body) g[y][x] = y > 18 ? 'f' : (x + y) % 5 === 0 ? 'V' : 'm';
  }
  for (const [x, y] of [[6, 7], [10, 7]]) { g[y][x] = 'H'; g[y][x + 1] = 'H'; g[y + 1][x] = 'h'; g[y + 1][x + 1] = 'w'; }
  for (const [x, y] of [[1, 3], [14, 5], [2, 15], [13, 13], [8, 0]]) g[y][x] = 'H';
  return g.map(r => r.join(''));
}

function glassTower() {
  const g = grid(16, 48, '.');
  for (let y = 0; y < 10; y++) {
    const half = Math.floor(y / 2);
    for (let x = 7 - half; x <= 8 + half; x++) g[y][x] = x === 7 - half || x === 8 + half ? 'S' : x < 8 ? 'w' : 'A';
  }
  g[0][7] = 'H';
  g[0][8] = 'H';
  for (let y = 10; y < 41; y++) for (let x = 3; x <= 12; x++) {
    let ch = x === 3 || x === 12 ? 'S' : x <= 5 ? 'w' : x >= 10 ? 'L' : 'A';
    if ((y - 10) % 8 === 7 && x > 3 && x < 12) ch = 'L';
    if ((y - 10) % 8 >= 2 && (y - 10) % 8 <= 4 && (x === 7 || x === 8)) ch = 'D';
    g[y][x] = ch;
  }
  for (let y = 41; y < 48; y++) for (let x = 1; x < 15; x++) g[y][x] = y === 41 || y === 47 || x === 1 || x === 14 ? 'k' : y < 43 ? 'm' : 's';
  return toRows(g);
}

// Windrad auf den Klippen (16 × 32): Holzturm mit rotem Dach, Flügel in zwei Stellungen (+ und ×).
// Jeder Flügel hat einen dunklen Holm und ein helles Segel, damit er auf Sand und Himmel zu sehen ist.
function windmill(frame) {
  const g = grid(16, 32, '.');
  for (let y = 9; y < 32; y++) {
    const half = 2 + Math.floor((y - 9) / 8);
    const x0 = 8 - half - 1, x1 = 7 + half + 1;
    for (let x = x0; x <= x1; x++) g[y][x] = x === x0 || x === x1 || y === 31 ? 'k' : (y - 9) % 4 === 3 ? 'b' : 'o';
  }
  for (let y = 26; y < 31; y++) for (let x = 7; x <= 8; x++) g[y][x] = y === 26 ? 'k' : 'b';
  for (let y = 5; y < 9; y++) for (let x = 7 - (y - 5); x <= 8 + (y - 5); x++) g[y][x] = x === 7 - (y - 5) || x === 8 + (y - 5) || y === 5 ? 'k' : 'e';
  const put = (x, y, ch) => {
    if (x >= 0 && x < 16 && y >= 0 && y < 16) g[y][x] = ch;
  };
  for (let i = 0; i < 16; i++) {
    if (frame === 0) {
      if (i === 7 || i === 8) continue;
      put(7, i, 'b');
      put(8, i, 'w');
      put(i, 7, 'b');
      put(i, 8, 'w');
    } else if (i > 0 && i < 15) {
      put(i, i, 'b');
      put(i + 1, i, 'w');
      put(15 - i, i, 'b');
      put(14 - i, i, 'w');
    }
  }
  for (const [x, y] of [[7, 7], [8, 7], [7, 8], [8, 8]]) g[y][x] = 'k';
  g[7][7] = 'h';
  return toRows(g);
}

// ---------- Spielaufgaben (Lumara 1.2, js/data/tasks.js) ----------

// Was die Bilder aus den Aufgaben brauchen: die Reihenfolge auf dem Zeichenstein (Wald) und auf der
// Wandzeichnung (Ruinen), Lage und Reihenfolge der Steine für die Sterntafel (Wiese). Die Quelle ist
// js/data/tasks.js; diese Abschrift erspart den Kacheln, die Karten mitzuladen. tests/tiles.test.js
// prüft, dass beide gleich sind.
export const TASK_ART = {
  runeOrder: [2, 1, 3, 0],
  leverOrder: [2, 0, 1],
  starTablet: {
    order: [1, 3, 2, 0],
    plates: [{ x: 14, y: 26 }, { x: 17, y: 24 }, { x: 19, y: 27 }, { x: 22, y: 25 }],
  },
};

// Ein Bild auf ein anderes legen; mit under nur auf dessen leere Pixel (es steht dann dahinter).
function layer(rows, sprite, ox, oy, { under = false } = {}) {
  const g = rows.map(r => [...r]);
  sprite.forEach((line, y) => [...line].forEach((ch, x) => {
    const gx = ox + x, gy = oy + y;
    if (ch === '.' || gy < 0 || gy >= g.length || gx < 0 || gx >= g[0].length) return;
    if (!under || g[gy][gx] === '.') g[gy][gx] = ch;
  }));
  return toRows(g);
}
const mirror = rows => rows.map(r => [...r].reverse().join(''));

// Kopf eines Möwenkükens, das nach rechts schaut: graues Flaumkleid, schwarzes Auge, gelber Schnabel.
const CHICK = [
  '.kkk..',
  'kwffk.',
  'kfkfhh',
  'kfffk.',
  'kfffk.',
];

// Holzkiste (Bucht): Rahmen, drei Bretter, darüber schaut ein Küken heraus.
const crate = (() => {
  const g = grid(16, 16, '.');
  for (let y = 6; y < 16; y++) for (let x = 2; x < 14; x++) {
    const edge = y === 6 || y === 15 || x === 2 || x === 13;
    const frame = y === 7 || y === 14 || x === 3 || x === 12;
    g[y][x] = edge ? 'k' : frame ? 'r' : y === 10 || y === 11 ? 'b' : (x + y) % 7 === 0 ? 'b' : 'o';
  }
  for (const [x, y] of [[3, 7], [12, 7], [3, 14], [12, 14]]) g[y][x] = 'm'; // Nägel
  return toRows(g);
})();

// Ein Blütenbusch: wie der Beerenstrauch, aber mit rosa Blüten statt Beeren.
const flowerBush = () => retint(bush, { e: 'R' });

// Ein altes Ruderboot liegt kieloben am Strand; darunter ist es dunkel.
const upturnedBoat = (() => {
  const g = grid(16, 16, '.');
  for (let y = 4; y <= 12; y++) for (let x = 0; x < 16; x++) {
    const dx = (x - 7.5) / 7.5, dy = (12.5 - y) / 8.5;
    if (dx * dx + dy * dy > 1) continue;
    g[y][x] = y === 12 ? 'r' : y === 9 ? 'b' : y < 7 && x < 8 ? 'r' : (x * 3 + y) % 11 === 0 ? 'b' : 'o';
  }
  outline(g);
  for (let x = 2; x < 14; x++) g[13][x] = x === 2 || x === 13 ? 'k' : 'n'; // Schatten unter dem Rand
  g[14][3] = 'k'; g[14][12] = 'k'; // Klötze, auf denen es liegt
  return toRows(g);
})();

// Die Möwenmutter auf ihrem Nest, das oben auf einem Pfahl im Wasser sitzt (sie schaut nach links);
// vor ihr im Nest n Küken (0 bis 3).
function gullNest(n) {
  const g = grid(16, 16, '.');
  for (let y = 11; y < 16; y++) for (let x = 6; x <= 9; x++) g[y][x] = x === 6 || x === 9 ? 'k' : x === 7 ? 'r' : 'o'; // Pfahl
  for (let y = 0; y < 10; y++) for (let x = 0; x < 16; x++) {
    const body = ((x - 11.5) / 4) ** 2 + ((y - 6.5) / 2.8) ** 2 <= 1;
    const head = ((x - 9.5) / 2.9) ** 2 + ((y - 3) / 2.5) ** 2 <= 1;
    if (body || head) g[y][x] = body && !head && y < 7 && x > 10 ? 's' : 'w';
  }
  outline(g);
  for (const [x, y] of [[12, 5], [13, 5], [12, 6], [13, 6], [14, 6]]) g[y][x] = 'm'; // Flügel
  g[3][9] = 'k'; // Auge
  g[3][6] = 'h'; g[3][5] = 'h'; g[4][6] = 'e'; // Schnabel mit rotem Punkt
  for (let y = 8; y <= 11; y++) for (let x = 0; x <= 15; x++) { // Nest aus Zweigen
    const inset = [1, 0, 0, 2][y - 8];
    if (x < inset || x > 15 - inset) continue;
    g[y][x] = x === inset || x === 15 - inset || y === 11 ? 'k' : (x + y * 2) % 4 === 0 ? 'r' : (x + y) % 3 === 0 ? 'b' : 'o';
  }
  let out = toRows(g);
  const small = ['.kk.', 'kwfk', 'kfkh']; // Kükenkopf, nach rechts; er sitzt auf dem Nestrand
  for (const [x, y] of [[0, 6], [4, 6], [8, 7]].slice(0, n)) out = layer(out, small, x, y);
  return out;
}

// Zeichen, in die Rinde geritzt (5 × 5): 0 Raute, 1 Dreieck, 2 Kreis, 3 Quadrat. Das Quadrat ist
// ausgefüllt, damit es sich auf dem kleinen Bild deutlich vom Kreis unterscheidet.
const RUNES = [
  ['..X..', '.X.X.', 'X...X', '.X.X.', '..X..'],
  ['..X..', '.X.X.', '.X.X.', 'X...X', 'XXXXX'],
  ['.XXX.', 'X...X', 'X...X', 'X...X', '.XXX.'],
  ['XXXXX', 'XXXXX', 'XXXXX', 'XXXXX', 'XXXXX'],
];
const rune = (i, ch) => RUNES[i].map(r => r.replace(/X/g, ch));

// Ein Zeichenbaum im Flüsterwald (16 × 32): ein alter Baum ohne Gesicht, im Stamm ein Zeichen. Es
// leuchtet (lit), wenn der Baum in der Reihenfolge dran war; open: darunter das offene Astloch.
// Seine Krone ist herbstlich golden (dunkel, Grundton, hell), damit man ihn nicht mit den grünen
// Flüsterbäumen verwechselt.
const RUNE_CROWN = ['r', 'h', 'H'];
function runeTree(i, { lit = false, open = false } = {}) {
  const g = grid(16, 32, '.');
  for (let y = 0; y < 18; y++) for (let x = 0; x < 16; x++) {
    const dx = (x - 7.5) / 8, dy = (y - 8.5) / 9;
    const d = dx * dx + dy * dy;
    if (d <= 1) g[y][x] = d > 0.8 ? 'k' : noise(x, y, 43 + i) < 0.3 ? RUNE_CROWN[0] : noise(x, y, 44) < 0.25 ? RUNE_CROWN[2] : RUNE_CROWN[1];
  }
  for (let y = 15; y < 31; y++) for (let x = 4; x < 12; x++) g[y][x] = x === 4 || x === 11 ? 'k' : (x + y) % 5 === 0 && (y < 18 || y > 24) ? 'b' : 'o';
  for (const [x, y] of [[3, 29], [2, 30], [12, 29], [13, 30], [4, 31], [5, 31], [10, 31], [11, 31]]) g[y][x] = 'k';
  if (open) {
    for (let y = 25; y <= 29; y++) for (let x = 6; x <= 9; x++) g[y][x] = (y === 25 || y === 29) && (x === 6 || x === 9) ? 'o' : y === 25 || x === 6 || x === 9 || y === 29 ? 'b' : 'k';
  }
  return layer(toRows(g), rune(i, lit ? 'H' : 'y'), 6, 19);
}

// Der Zeichenstein am Eingang des Waldes: eine Steintafel mit den vier Zeichen in der Reihenfolge der
// Aufgabe, zu lesen wie ein Buch (oben links, oben rechts, unten links, unten rechts).
function runeStone(order) {
  const g = grid(16, 16, '.');
  for (let y = 1; y < 16; y++) for (let x = 1; x < 15; x++) {
    if (y === 1 && (x === 1 || x === 14)) continue;
    const edge = y === 1 || y === 15 || x === 1 || x === 14 || (y === 2 && (x === 1 || x === 14));
    g[y][x] = edge ? 'k' : y < 4 && x < 5 ? 'm' : (x * 5 + y * 3) % 13 === 0 ? 'd' : 's';
  }
  let out = toRows(g);
  order.forEach((i, n) => {
    out = layer(out, rune(i, 'H'), n % 2 ? 9 : 2, n < 2 ? 3 : 9);
  });
  return out;
}

// Ein alter Wurzelstock im Moor, auf dem das Irrlicht am Ende ausruht.
const wispStump = (() => {
  const g = grid(16, 16, '.');
  for (let y = 4; y < 14; y++) for (let x = 3; x < 13; x++) {
    const top = ((x - 7.5) / 4.5) ** 2 + ((y - 6) / 2) ** 2 <= 1;
    if (top) g[y][x] = ((x - 7.5) / 2.6) ** 2 + ((y - 6) / 1.1) ** 2 <= 1 ? 'y' : 'r';
    else if (y > 6) g[y][x] = (x + y) % 4 === 0 ? 'b' : 'o';
  }
  for (const [x, y] of [[1, 13], [2, 13], [2, 12], [13, 13], [14, 13], [13, 12], [5, 14], [6, 14], [10, 14]]) g[y][x] = 'o'; // Wurzeln
  g[6][7] = 'r'; g[6][8] = 'r'; // Jahresringe
  outline(g);
  for (const [x, y] of [[4, 9], [5, 10], [11, 8], [10, 11], [4, 12]]) g[y][x] = 'g'; // Moos
  g[8][11] = 'T'; // ein winziger Leuchtpilz
  return toRows(g);
})();

// Glasstatue der Spielaufgabe (16 × 32): schaut nach oben (0, man sieht den Hinterkopf), rechts (1,
// zeigt mit dem Arm), unten (2, das Gesicht mit zwei Augen) oder links (3). Vorn am Sockel leuchtet
// ein kleiner Kristall mit Strahlen wie der des Leuchtsteins: So erkennt man die drei Statuen der
// Aufgabe neben den Glasstatuen zum Anschauen (statue), deren Sockel glatt ist.
const STATUE_MARK = [
  [5, 26, 'h'], [10, 26, 'h'], [4, 28, 'h'], [11, 28, 'h'], [5, 30, 'h'], [10, 30, 'h'], // Strahlen
  [7, 26, 'w'], [8, 26, 'H'], [7, 27, 'H'], [8, 27, 'h'], [6, 28, 'H'], [7, 28, 'w'], [8, 28, 'H'], [9, 28, 'h'],
  [7, 29, 'H'], [8, 29, 'h'], [7, 30, 'h'], [8, 30, 'H'], // Kristall
];
function glassStatue(dir) {
  const g = grid(16, 32, '.');
  const glass = (x, x0, x1) => (x === x0 || x === x1 ? 'S' : x === x0 + 1 ? 'w' : x === x1 - 1 ? 'L' : 'A');
  for (let y = 2; y < 10; y++) for (let x = 3; x < 13; x++) {
    const dx = (x - 7.5) / 3.6, dy = (y - 5.5) / 3.3;
    const d = dx * dx + dy * dy;
    if (d <= 1) g[y][x] = d > 0.62 ? 'S' : x < 7 ? 'w' : 'A';
  }
  for (let y = 10; y < 25; y++) {
    const half = 2 + Math.floor((y - 10) / 5);
    const x0 = 8 - half, x1 = 7 + half;
    for (let x = x0; x <= x1; x++) g[y][x] = glass(x, x0, x1);
  }
  if (dir === 2) {
    for (const [x, y] of [[6, 5], [9, 5], [6, 6], [9, 6]]) g[y][x] = 'D'; // Augen
    g[8][7] = 'L'; g[8][8] = 'L'; // Mund
  } else if (dir === 0) {
    for (let y = 3; y <= 8; y++) g[y][7] = 'L'; // Scheitel und Nacken
    g[2][7] = 'S'; g[2][8] = 'S'; g[1][7] = 'S'; g[1][8] = 'S'; // Haarknoten
  } else {
    // Profil nach rechts; links ist das Spiegelbild
    g[5][10] = 'D'; g[6][10] = 'D'; // Auge
    g[6][12] = 'S'; g[7][12] = 'S'; g[6][11] = 'A'; g[7][11] = 'A'; // Nase
    for (let x = 10; x <= 14; x++) { g[12][x] = 'S'; g[13][x] = x === 14 ? 'S' : 'A'; } // ausgestreckter Arm
    g[14][14] = 'S';
  }
  const figure = toRows(g);
  const out = (dir === 3 ? mirror(figure) : figure).map(r => [...r]);
  // Sockel und Zeichen erst nach dem Spiegeln: Das Licht fällt immer von links oben.
  for (let y = 25; y < 32; y++) for (let x = 2; x < 14; x++) out[y][x] = y === 25 || y === 31 || x === 2 || x === 13 ? 'k' : y < 27 ? 'm' : 's';
  for (const [x, y, ch] of STATUE_MARK) out[y][x] = ch;
  return toRows(out);
}

// ---------- Windklippen: Windräder, Wimpel an Stangen und ein Drachen ----------

// Ein Wimpel (7 × 5), der nach rechts weht: Koralle mit dunklem Rand, an der Stange ein heller Streifen.
const FLAG = ['eee....', 'CCCee..', 'wCCCCCe', 'CCCee..', 'eee....'];
// Um 90° nach links gedreht: Die Spitze zeigt nach oben.
const turnLeft = rows => Array.from({ length: rows[0].length }, (_, r) => rows.map(row => row[rows[0].length - 1 - r]).join(''));
// Nach Richtung 0 oben, 1 rechts, 2 unten, 3 links.
const FLAGS = [turnLeft(FLAG), FLAG, [...turnLeft(FLAG)].reverse(), mirror(FLAG)];

// Ein Windrad der Spielaufgabe (16 × 32): Holzturm mit türkisem Kopf, damit es sich von den roten
// Windrädern zum Anschauen unterscheidet. Hinten am Kopf weht ein Wimpel nach dir: Nach oben schaut
// das Rad zu uns (der Wimpel ragt dahinter auf), nach unten sehen wir die Rückseite des Rads (der Wimpel
// zeigt zu uns), nach rechts oder links sieht man das Rad von der Seite als schmalen Strich.
// spin: das zweite Bild, wenn es sich im Wind dreht.
function windWheel(dir, spin = false) {
  if (dir === 3) return mirror(windWheel(1, spin));
  const g = grid(16, 32, '.');
  const put = (x, y, ch) => {
    if (x >= 0 && x < 16 && y >= 0 && y < 32) g[y][x] = ch;
  };
  const flag = (rows, ox, oy) => rows.forEach((r, y) => [...r].forEach((ch, x) => ch !== '.' && put(ox + x, oy + y, ch)));
  if (dir === 0) flag(FLAGS[0], 5, 2); // hinter dem Rad
  for (let y = 12; y < 32; y++) {
    const half = 2 + Math.floor((y - 12) / 7);
    const x0 = 8 - half - 1, x1 = 7 + half + 1;
    for (let x = x0; x <= x1; x++) g[y][x] = x === x0 || x === x1 || y === 31 ? 'k' : (y - 12) % 4 === 3 ? 'b' : 'o';
  }
  for (let y = 27; y < 31; y++) for (const x of [7, 8]) g[y][x] = y === 27 ? 'k' : 'b'; // Tür
  for (let y = 8; y <= 12; y++) for (let x = 5; x <= 10; x++) {
    if (y === 8 && (x === 5 || x === 10)) continue;
    g[y][x] = y === 8 || y === 12 || x === 5 || x === 10 ? 'k' : x === 6 || y === 9 ? 'T' : 't';
  }
  if (dir === 1) {
    // von der Seite: das Rad als Strich, die Nabe, hinten der Wimpel
    const [top, bottom] = spin ? [6, 13] : [3, 16];
    for (let y = top; y <= bottom; y++) {
      put(2, y, spin ? 'w' : 'b');
      put(3, y, spin ? 'b' : 'w');
    }
    put(2, top - 1, 'k'); put(3, top - 1, 'k'); put(2, bottom + 1, 'k'); put(3, bottom + 1, 'k');
    for (const y of [9, 10]) { put(4, y, 'h'); put(5, y, 'k'); }
    flag(FLAGS[1], 9, 7);
    return toRows(g);
  }
  // von vorn (0) oder von hinten (2): Holm und Segel, hinten matter
  const sail = dir === 0 ? 'w' : 'm';
  if (spin) {
    for (let i = 4; i <= 15; i++) if (i !== 9 && i !== 10) { put(7, i, 'b'); put(8, i, sail); }
    for (let i = 2; i <= 13; i++) if (i !== 7 && i !== 8) { put(i, 9, 'b'); put(i, 10, sail); }
  } else {
    for (let i = 2; i <= 13; i++) {
      put(i, i + 2, 'b');
      put(i + 1, i + 2, sail);
      put(15 - i, i + 2, 'b');
      put(14 - i, i + 2, sail);
    }
  }
  for (const [x, y] of [[7, 9], [8, 9], [7, 10], [8, 10]]) put(x, y, 'k');
  if (dir === 0) put(7, 9, 'h'); // goldene Nabe vorn
  else flag(FLAGS[2], 5, 11); // der Wimpel zeigt zu uns
  return toRows(g);
}

// Eine Stange mit Wimpel auf einem Steinfuß (16 × 32); der Wimpel weht nach dir.
function pennant(dir) {
  const g = grid(16, 32, '.');
  for (let y = 5; y < 29; y++) { g[y][7] = 'o'; g[y][8] = 'b'; }
  g[4][7] = 'h'; g[4][8] = 'h'; g[3][7] = 'k'; g[3][8] = 'k';
  for (let y = 27; y < 32; y++) for (let x = 4; x <= 11; x++) {
    if (y === 27 && (x === 4 || x === 11)) continue;
    g[y][x] = y === 27 || y === 31 || x === 4 || x === 11 ? 'k' : y === 28 ? 'm' : 's';
  }
  const [rows, ox, oy] = [[FLAGS[0], 5, 0], [FLAGS[1], 9, 5], [FLAGS[2], 5, 6], [FLAGS[3], 0, 5]][dir];
  return layer(toRows(g), rows, ox, oy);
}

// Ein Drachen aus Koralle und Gold mit Holzkreuz, Rand dunkel (Raute um cx, cy mit Radius r).
function kiteShape(g, cx, cy, r) {
  for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) {
    const d = Math.abs(x - cx) + Math.abs(y - cy);
    if (d > r) continue;
    g[y][x] = d === r ? 'k' : x === cx || y === cy ? 'b' : (x < cx) === (y < cy) ? 'C' : 'h';
  }
}

// Am Boden (16 × 16): ein Pflock, daran die Schnur, daneben liegt der Drachen. Gelöst (16 × 32): Er
// fliegt hoch über dem Pflock, mit Schwanz und Schleifen.
function kite(flying) {
  const g = grid(16, flying ? 32 : 16, '.');
  const h = g.length;
  for (let y = h - 10; y < h; y++) { g[y][2] = y === h - 10 ? 'k' : 'o'; g[y][3] = y === h - 10 ? 'k' : 'b'; }
  if (flying) {
    kiteShape(g, 10, 6, 5);
    for (let i = 0; i <= 10; i++) g[Math.round(11 + i * 1.1)][Math.round(10 - i * 0.6)] = 'c'; // Schnur zum Pflock
    for (const [x, y, bow] of [[11, 12, 0], [12, 14, 1], [12, 16, 0], [13, 18, 1], [13, 20, 0], [14, 22, 1]]) g[y][x] = bow ? 'R' : 'k';
    for (const [x, y] of [[11, 14], [13, 14], [12, 13], [12, 15], [12, 18], [14, 18], [13, 22], [15, 22]]) g[y][x] = 'R';
  } else {
    kiteShape(g, 10, 10, 4);
    for (const [x, y] of [[4, 8], [5, 9], [6, 9], [7, 10]]) g[y][x] = 'c';
    for (const [x, y] of [[11, 15], [13, 15], [15, 14]]) g[y][x] = 'R';
  }
  return toRows(g);
}

// ---------- Uhrwerkruinen: Hebel an der Mauer und eine Wandzeichnung ----------

// Griffe: 0 rot, 1 gelb, 2 blau (Farbe und heller Glanz).
const KNOBS = [['e', 'C'], ['h', 'H'], ['S', 'L']];

// Ein Hebel an der Mauer (16 × 16): eine Platte aus dunklem Metall mit Schlitz, darin ein Griff mit
// dicker farbiger Kugel. Oben steht er auf, gezogen ist er unten und die kleine Lampe leuchtet.
function lever(i, pulled) {
  const g = grid(16, 16, '.');
  for (let y = 2; y <= 15; y++) for (let x = 3; x <= 12; x++) {
    if ((y === 2 || y === 15) && (x === 3 || x === 12)) continue;
    g[y][x] = y === 2 || y === 15 || x === 3 || x === 12 ? 'k' : 'd';
  }
  for (const [x, y] of [[4, 3], [11, 3], [4, 14], [11, 14]]) g[y][x] = 's'; // Nieten
  for (let y = 4; y <= 13; y++) { g[y][7] = 'n'; g[y][8] = 'n'; } // Schlitz
  for (const [x, y] of [[10, 5], [10, 6]]) g[y][x] = pulled ? 'T' : 'n'; // Lampe
  const [color, shine] = KNOBS[i];
  const [from, to, top] = pulled ? [9, 11, 11] : [4, 8, 0];
  for (let y = from; y <= to; y++) { g[y][7] = 'm'; g[y][8] = 's'; } // Stange
  g[8][6] = 'k'; g[8][9] = 'k'; g[9][6] = 'k'; g[9][9] = 'k'; // Drehpunkt
  // Kugel (6 × 5) mit Rand und Glanz
  for (let y = top; y <= top + 4; y++) for (let x = 5; x <= 10; x++) {
    const corner = (y === top || y === top + 4) && (x === 5 || x === 10);
    if (corner) continue;
    g[y][x] = y === top || y === top + 4 || x === 5 || x === 10 ? 'k' : y === top + 1 && x <= 7 ? shine : color;
  }
  return toRows(g);
}

// Die Wandzeichnung (16 × 16): ein heller Putzfleck, darauf die drei Griffe in der Reihenfolge der
// Aufgabe mit Pfeilen dazwischen, darunter Wasser, das abläuft.
function wallSketch(order) {
  const g = grid(16, 16, '.');
  for (let y = 1; y <= 14; y++) for (let x = 0; x <= 15; x++) {
    if ((y === 1 || y === 14) && (x === 0 || x === 15)) continue;
    g[y][x] = y === 1 || y === 14 || x === 0 || x === 15 ? 'y' : 'c';
  }
  order.forEach((lev, n) => {
    const [color, shine] = KNOBS[lev];
    const x0 = 1 + n * 5;
    for (let y = 3; y <= 5; y++) for (let x = x0; x <= x0 + 2; x++) g[y][x] = y === 3 && x === x0 ? shine : color;
    for (let y = 6; y <= 8; y++) g[y][x0 + 1] = 'd'; // die Stange, nach unten gezogen
    if (n < 2) for (const [dx, dy] of [[3, 3], [4, 4], [3, 5]]) g[dy][x0 + dx] = 'd'; // Pfeil
  });
  for (let x = 2; x <= 13; x++) g[10 + ((x >> 1) % 2)][x] = 'L'; // Wasser
  for (let x = 4; x <= 11; x++) g[12][x] = x % 3 ? 'S' : 'L';
  return toRows(g);
}

// ---------- Nordlichtsee: die Hasenfamilie ----------

// Am Waldrand kuscheln sich eine Häsin und zwei Kleine in eine Schneemulde (16 × 16). withGift: Vor
// ihnen glitzert, was sie gefunden haben (ungelöst); gelöst haben sie es verschenkt.
function rabbits({ withGift }) {
  const g = grid(16, 16, '.');
  for (let y = 9; y < 16; y++) for (let x = 0; x < 16; x++) {
    const dx = (x - 7.5) / 8, dy = (y - 15.5) / 6.5;
    const d = dx * dx + dy * dy;
    if (d <= 1) g[y][x] = d > 0.75 ? 'f' : y > 13 ? 'm' : 'f';
  }
  // Hasen schauen nach rechts: lange Ohren mit rosa Innenseite, ein dunkles Auge, rosa Nase.
  const MOTHER = [
    '.kk.kk...', 'kwRkwRk..', 'kwRkwRk..', 'kwRkwRk..', '.kwwwwk..', '.kwwwwwk.', 'kwwwkwwRk', 'kwwwwwwk.',
    'kwwwwwwwk', 'kwwwwwwwk', 'kfwwwwwfk', '.kkkkkkk.',
  ];
  const KIT = ['k.k..', 'RkRk.', 'kwwk.', 'kwkwk', 'kwwRk', 'kfwk.', '.kk..'];
  const put = (rows, ox, oy) => rows.forEach((r, y) => [...r].forEach((ch, x) => { if (ch !== '.') g[oy + y][ox + x] = ch; }));
  put(MOTHER, 0, 3);
  put(KIT, 8, 8);
  put(KIT, 11, 9);
  if (withGift) for (const [x, y, ch] of [[9, 15, 'H'], [8, 15, 'h'], [10, 15, 'h'], [9, 14, 'h']]) g[y][x] = ch;
  return toRows(g);
}

// ---------- Sternenwiese: Sterntafel und flache Steine ----------

// Zeichen auf den Steinen (7 × 7): 0 Mond, 1 Stern, 2 Komet, 3 Planet mit Ring.
const SKY = [
  ['..XXX..', '.XX....', 'XXX....', 'XXX....', 'XXX....', '.XX....', '..XXX..'],
  ['...X...', '...X...', 'XXXXXXX', '.XXXXX.', '..XXX..', '.XX.XX.', 'XX...XX'],
  ['X......', '.X.X...', '..X.X..', '...XXX.', '..XXXXX', '...XXXX', '....XX.'],
  ['.....XX', '..XXX.X', '.XXXXX.', '.XXXXX.', '.XXXXX.', 'X.XXX..', 'XX.....'],
];
// Die Zeichen klein (3 × 3) für die Sterntafel.
const SKY_SMALL = [
  ['XX.', 'X..', 'XX.'],
  ['.X.', 'XXX', 'X.X'],
  ['X..', '.XX', '.XX'],
  ['XXX', 'X.X', 'XXX'],
];

// Ein flacher Stein im Gras der Sternenwiese (16 × 16), eben mit dem Boden wie eine Trittplatte: hell,
// flach, ohne Schatten, nur ein dünner Rand, über den ein paar Halme wachsen. So sieht er nicht aus wie
// die runden dunklen Felsen, die sonst den Weg versperren. Darauf ein Zeichen: eingeritzt oder
// leuchtend (dann mit goldenem Rand).
function starPlate(i, lit) {
  const g = grid(16, 16, '.');
  const inside = (x, y) => x >= 0 && x < 16 && ((x - 7.5) / 7.8) ** 2 + ((y - 9) / 4.6) ** 2 <= 1;
  for (let y = 4; y < 15; y++) for (let x = 0; x < 16; x++) {
    if (!inside(x, y)) continue;
    const rim = !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1);
    g[y][x] = rim ? (lit ? 'h' : y > 9 ? 'd' : 's') : 'm';
  }
  for (const [x, y] of [[2, 8], [13, 10], [12, 6], [3, 11]]) g[y][x] = 'f'; // Sprenkel im Stein
  const mark = [];
  SKY[i].forEach((r, y) => [...r].forEach((ch, x) => { if (ch === 'X') mark.push([4 + x, 6 + y]); }));
  if (lit) { // goldener Schein um das helle Zeichen, damit es auf dem hellen Stein leuchtet
    for (const [x, y] of mark) for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) if (g[y + dy][x + dx] === 'm') g[y + dy][x + dx] = 'h';
  }
  for (const [x, y] of mark) g[y][x] = lit ? 'H' : 'd';
  if (lit) g[9][7] = 'w';
  for (const [x, y] of [[0, 9], [1, 11], [14, 7], [15, 10], [9, 13]]) g[y][x] = 'l'; // Halme über dem Rand
  return toRows(g);
}

// Die Sterntafel (16 × 16): eine dunkle Steintafel, darauf das Sternbild so, wie die vier Steine auf der
// Wiese liegen. Eine Linie verbindet die Zeichen in der Reihenfolge der Aufgabe; das erste leuchtet gold.
function starTablet({ plates, order }) {
  const g = grid(16, 16, '.');
  for (let y = 0; y < 16; y++) for (let x = 1; x < 15; x++) {
    if (y === 0 && (x === 1 || x === 14)) continue;
    g[y][x] = y === 0 || y === 15 || x === 1 || x === 14 ? 'k' : y > 12 ? 's' : 'D';
  }
  const xs = plates.map(p => p.x), ys = plates.map(p => p.y);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  // Linke obere Ecke jedes kleinen Zeichens auf der Tafel (Platz: x 2 bis 13, y 1 bis 12).
  const at = plates.map(p => ({
    x: 2 + Math.round(((p.x - minX) / Math.max(1, maxX - minX)) * 9),
    y: 1 + Math.round(((p.y - minY) / Math.max(1, maxY - minY)) * 9),
  }));
  order.slice(1).forEach((to, n) => {
    const a = at[order[n]], b = at[to];
    const steps = Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y));
    for (let s = 1; s < steps; s++) g[a.y + 1 + Math.round(((b.y - a.y) * s) / steps)][a.x + 1 + Math.round(((b.x - a.x) * s) / steps)] = 'L';
  });
  order.forEach((i, n) => {
    SKY_SMALL[i].forEach((r, y) => [...r].forEach((ch, x) => { if (ch === 'X') g[at[i].y + y][at[i].x + x] = n === 0 ? 'H' : 'A'; }));
  });
  return toRows(g);
}

const TASK_PROPS = {
  chickcrate: layer(crate, CHICK, 5, 2, { under: true }),
  chickcrateDone: crate,
  chickbush: layer(flowerBush(), CHICK, 10, 0, { under: true }),
  chickbushDone: flowerBush(),
  chickboat: layer(upturnedBoat, mirror(CHICK), 1, 11),
  chickboatDone: upturnedBoat,
  ...Object.fromEntries([0, 1, 2, 3].map(n => [`gullnest${n}`, gullNest(n)])),
  ...Object.fromEntries([0, 1, 2, 3].flatMap(i => [
    [`runetree${i}`, runeTree(i)],
    [`runetree${i}Lit`, runeTree(i, { lit: true })],
    [`runetree${i}Open`, runeTree(i, { lit: true, open: true })],
  ])),
  runestone: runeStone(TASK_ART.runeOrder),
  wispstump: wispStump,
  ...Object.fromEntries([0, 1, 2, 3].map(d => [`glassstatue${d}`, glassStatue(d)])),
  ...Object.fromEntries([0, 1, 2, 3].flatMap(d => [
    [`windwheel${d}`, windWheel(d)],
    [`windwheel${d}Spin`, windWheel(d, true)],
    [`pennant${d}`, pennant(d)],
  ])),
  kite: kite(false),
  kiteDone: kite(true),
  ...Object.fromEntries([0, 1, 2].flatMap(i => [
    [`lever${i}`, lever(i, false)],
    [`lever${i}Lit`, lever(i, true)],
    [`lever${i}Open`, lever(i, true)], // der letzte Hebel: gezogen, das Kanalstück ist leer
  ])),
  wallsketch: wallSketch(TASK_ART.leverOrder),
  rabbits: rabbits({ withGift: true }),
  rabbitsDone: rabbits({ withGift: false }),
  startablet: starTablet(TASK_ART.starTablet),
  ...Object.fromEntries([0, 1, 2, 3].flatMap(i => [[`starplate${i}`, starPlate(i, false)], [`starplate${i}Lit`, starPlate(i, true)]])),
};

export const PROPS = {
  ...TASK_PROPS,
  bigshroom: bigShroom(),
  statue: statue(),
  glasstower: glassTower(),
  windmill0: windmill(0),
  windmill1: windmill(1),
  gear0: gear(0),
  gear1: gear(1),
  observatory: observatory(),
  icecave: iceCave(),
  tent: tent(),
  bush,
  bushEmpty: retint(bush, { e: 'l' }),
  noteStone: marked(rock, [[7, 6], [6, 7], [7, 7], [8, 7], [7, 8]], 'H'),
  noteStoneDone: rock,
  beaconDark: beacon(false),
  beaconLit: beacon(true),
  oldtree: oldTree(),
  hollowoak: hollowOak(),
  hookring: hookRing(),
  boatpost: boatPost(),
  // Das Gartentor über dem Leuchtturm: ein Bogen aus geflochtenen Weidenruten (zwei Holztöne),
  // oben silbriges Weidenlaub mit hängenden Blättern, dazwischen rosa und fliederfarbene Blüten.
  gardengate: [
    '.......kk.......',
    '....kkkTTkkk....',
    '...kTTlllRwTk...',
    '..kTwgggglTlTk..',
    '.kTRglkkkkTTVTk.',
    '.kgTlk.l..kllTk.',
    '.klokl.T..lkrTk.',
    'kgVrkT....TkrRTk',
    'klgrk......kogTk',
    '.krok......kork.',
    '.kRok......krrk.',
    '.kork......krok.',
    '.krrk......koVk.',
    '.krok......kork.',
    '.kook......krrk.',
    '.kkkk......kkkk.',
  ],
  iceedge: iceEdge(),
  icecrystal: iceCrystal(false),
  icecrystalDone: iceCrystal(true),
  stargear0: starGear(0),
  stargear1: starGear(1),
  stargear2: starGear(2),
  stargear3: starGear(3),
  starplaque: starPlaque(),
  echocrystal: caveCrystal(['V', 'v', 'P']),
  warmcrystal: caveCrystal(['H', 'h', 'r']),
  morrowmist: morrowMist(),
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
