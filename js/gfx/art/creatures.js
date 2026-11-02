// Wesen als Pixelraster (Design 6.1, 14). Alle schauen nach rechts, der Gegner wird gespiegelt.
// Jedes Wesen wird aus weichen Formen gebaut (Licht von links oben), dann bekommt es automatisch
// einen dunklen Umriss. Augen und feine Details kommen danach von Hand dazu.

export const STAGE_SIZE = { 1: 32, 2: 40, 3: 48, 4: 64 };

function canvas(n) {
  return Array.from({ length: n }, () => Array(n).fill('.'));
}

function put(g, x, y, ch) {
  if (y >= 0 && y < g.length && x >= 0 && x < g.length) g[y][x] = ch;
}

// Gefüllte Ellipse mit drei Tönen: hell (oben links), Grundton, dunkel (unten rechts).
function ellipse(g, cx, cy, rx, ry, [light, base, dark], { cutBelow = Infinity } = {}) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    if (y > cutBelow) continue;
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const nx = (x + 0.5 - cx) / rx;
      const ny = (y + 0.5 - cy) / ry;
      if (nx * nx + ny * ny > 1) continue;
      const s = nx * 0.6 + ny * 0.8;
      put(g, x, y, s < -0.45 ? light : s > 0.5 ? dark : base);
    }
  }
}

// Gefülltes Vieleck (Punkt-in-Polygon je Pixelmitte).
function poly(g, pts, [light, base, dark]) {
  const xs = pts.map(p => p[0]);
  const ys = pts.map(p => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
    for (let x = Math.floor(x0); x <= Math.ceil(x1); x++) {
      const px = x + 0.5, py = y + 0.5;
      let inside = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i], [xj, yj] = pts[j];
        if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
      }
      if (!inside) continue;
      const t = (px - x0) / Math.max(1, x1 - x0) * 0.6 + (py - y0) / Math.max(1, y1 - y0) * 0.8;
      put(g, x, y, t < 0.35 ? light : t > 1.0 ? dark : base);
    }
  }
}

// Dunkler Umriss um alles, was nicht durchsichtig ist.
function outline(g, ch = 'k') {
  const n = g.length;
  const filled = (x, y) => x >= 0 && y >= 0 && x < n && y < n && g[y][x] !== '.';
  const marks = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (g[y][x] !== '.') continue;
      if (filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1)) marks.push([x, y]);
    }
  }
  for (const [x, y] of marks) g[y][x] = ch;
}

// Großes freundliches Auge mit Lichtpunkt (w × h Pixel).
function eye(g, x, y, w = 2, h = 3) {
  for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) put(g, x + dx, y + dy, 'k');
  put(g, x, y, 'w');
}

function dots(g, list) {
  for (const [x, y, ch] of list) put(g, x, y, ch);
}

const done = g => g.map(r => r.join(''));

// ---------- Startwesen ----------

function funki() {
  const g = canvas(32);
  ellipse(g, 11, 12, 9, 8, ['w', 'V', 'v']); // Oberflügel
  ellipse(g, 10, 21, 7, 5, ['V', 'v', 'P']); // Unterflügel
  ellipse(g, 13, 23, 5, 4, ['w', 'H', 'h']); // glimmender Hinterleib
  ellipse(g, 20, 16, 7, 7, ['w', 'c', 'Y']); // flauschiger Körper
  outline(g);
  eye(g, 20, 14);
  eye(g, 24, 14);
  dots(g, [[22, 19, 'R'], [26, 18, 'R'], [23, 19, 'k'],
    [20, 8, 'k'], [21, 7, 'k'], [22, 6, 'k'], [23, 5, 'k'], [24, 4, 'H'], [24, 3, 'H'],
    [24, 8, 'k'], [25, 7, 'k'], [26, 6, 'k'], [27, 5, 'H'],
    [8, 10, 'w'], [12, 9, 'w'], [6, 13, 'R'], [10, 19, 'V'],
    [11, 22, 'w'], [13, 21, 'w'], [17, 24, 'b'], [21, 24, 'b']]);
  // leises Glimmen um den Hinterleib
  dots(g, [[7, 27, 'H'], [17, 28, 'H'], [6, 24, 'H']]);
  return done(g);
}

function kiesel() {
  const g = canvas(32);
  ellipse(g, 10, 28, 4, 2, ['s', 'd', 'n']); // Füße
  ellipse(g, 21, 28, 4, 2, ['s', 'd', 'n']);
  ellipse(g, 16, 18, 11, 10, ['m', 's', 'd']); // runder Steinkörper
  ellipse(g, 27, 20, 2, 3, ['m', 's', 'd']); // Ärmchen
  ellipse(g, 12, 9, 5, 3, ['G', 'g', 'l']); // Moos
  ellipse(g, 20, 9, 4, 2, ['G', 'g', 'l']);
  outline(g);
  eye(g, 19, 15);
  eye(g, 24, 15);
  dots(g, [[21, 19, 'R'], [26, 19, 'R'], [22, 20, 'k'], [23, 20, 'k'],
    [7, 16, 'd'], [8, 17, 'd'], [8, 18, 'd'], [12, 23, 'd'], [13, 24, 'd'],
    [13, 6, 'G'], [14, 5, 'g'], [14, 4, 'G'], [15, 5, 'g'], [9, 13, 'm'], [11, 12, 'f']]);
  return done(g);
}

function nixi() {
  const g = canvas(32);
  poly(g, [[2, 17], [12, 18], [12, 25], [3, 26]], ['V', 'v', 'P']); // Schwanzflosse
  ellipse(g, 14, 22, 7, 5, ['w', 'R', 'C']); // Körper
  ellipse(g, 21, 16, 8, 7, ['w', 'R', 'C']); // großer Kopf
  ellipse(g, 11, 27, 2, 2, ['R', 'R', 'C']); // Beinchen
  ellipse(g, 18, 27, 2, 2, ['R', 'R', 'C']);
  // Kiemenbüschel hinter dem Kopf, fächerförmig
  poly(g, [[17, 11], [11, 4], [12, 8], [15, 12]], ['p', 'C', 'e']);
  poly(g, [[16, 13], [8, 9], [10, 12], [15, 15]], ['p', 'C', 'e']);
  poly(g, [[16, 16], [9, 16], [11, 18], [16, 18]], ['p', 'C', 'e']);
  outline(g);
  dots(g, [[13, 7, 'p'], [11, 11, 'p'], [12, 17, 'p']]);
  eye(g, 22, 14, 2, 2);
  eye(g, 26, 14, 2, 2);
  dots(g, [[23, 18, 'k'], [24, 19, 'k'], [25, 19, 'k'], [26, 18, 'k'],
    [21, 17, 'p'], [27, 17, 'p'], [15, 17, 'V'], [16, 17, 'V'], [17, 17, 'V'],
    [28, 6, 'A'], [29, 6, 'A'], [28, 5, 'w'], [25, 3, 'A'], [30, 2, 'A'], [17, 20, 'w']]);
  return done(g);
}

function flausch() {
  const g = canvas(32);
  ellipse(g, 7, 20, 5, 5, ['w', 'f', 'm']); // Wolkenpuffer als Flügel
  ellipse(g, 26, 21, 5, 5, ['w', 'f', 'm']);
  ellipse(g, 11, 27, 5, 3, ['w', 'f', 'm']);
  ellipse(g, 21, 27, 5, 3, ['w', 'f', 'm']);
  ellipse(g, 16, 18, 10, 10, ['w', 'f', 'm']); // runder Körper
  ellipse(g, 12, 7, 2, 3, ['f', 'm', 's']); // Federohren
  ellipse(g, 22, 7, 2, 3, ['f', 'm', 's']);
  ellipse(g, 18, 15, 7, 6, ['w', 'c', 'Y']); // Gesicht
  outline(g);
  // große Augen mit goldenem Ring
  for (const ex of [14, 20]) {
    dots(g, [[ex, 13, 'h'], [ex + 1, 13, 'h'], [ex + 2, 13, 'h'], [ex, 14, 'h'], [ex, 15, 'h'], [ex + 2, 14, 'h'], [ex + 2, 15, 'h'], [ex + 1, 16, 'h']]);
    dots(g, [[ex + 1, 14, 'k'], [ex + 1, 15, 'k'], [ex, 16, 'h'], [ex + 2, 16, 'h']]);
    put(g, ex + 1, 14, 'w');
  }
  dots(g, [[18, 17, 'r'], [19, 17, 'r'], [18, 18, 'o'], [13, 25, 'h'], [14, 26, 'h'], [20, 26, 'h'], [21, 25, 'h'],
    [9, 15, 'w'], [11, 13, 'w'], [5, 18, 'w']]);
  return done(g);
}

function pieks() {
  const g = canvas(32);
  // Blattstacheln auf dem Rücken (nach links oben)
  const leaves = [[6, 12, 2.5], [9, 8, 2.5], [14, 6, 2.5], [19, 7, 2.2], [4, 17, 2.5], [5, 22, 2.2]];
  for (const [x, y, r] of leaves) ellipse(g, x, y, r, r * 1.5, ['G', 'g', 'l']);
  ellipse(g, 15, 20, 10, 8, ['r', 'o', 'b']); // Körper
  ellipse(g, 23, 21, 5, 4, ['w', 'Y', 'y']); // Schnauze und Bauch
  ellipse(g, 11, 28, 3, 1.5, ['o', 'b', 'b']); // Füße
  ellipse(g, 19, 28, 3, 1.5, ['o', 'b', 'b']);
  outline(g);
  eye(g, 22, 17, 2, 2);
  dots(g, [[28, 21, 'k'], [27, 21, 'k'], [24, 23, 'k'], [25, 23, 'k'], [21, 20, 'R'],
    [16, 12, 'G'], [17, 11, 'G'], [17, 10, 'g'], [18, 9, 'G'],
    [9, 9, 'l'], [14, 6, 'l'], [6, 12, 'l'], [11, 17, 'b'], [13, 15, 'b'], [9, 21, 'b']]);
  return done(g);
}

// ---------- Gebiet 1 ----------

function gischtling() {
  const g = canvas(32);
  poly(g, [[6, 26], [11, 20], [14, 28], [8, 29]], ['A', 'L', 'S']); // Wirbel unten
  ellipse(g, 17, 20, 9, 9, ['A', 'L', 'S']); // Wellenkörper
  ellipse(g, 26, 22, 3, 2, ['A', 'L', 'S']); // Ärmchen
  // Krone aus Gischt
  for (const [x, y, rx, ry] of [[11, 12, 3, 2], [15, 10, 3, 3], [20, 10, 3, 2.5], [24, 13, 2.5, 2]]) ellipse(g, x, y, rx, ry, ['w', 'w', 'f']);
  outline(g, 'n');
  eye(g, 18, 18);
  eye(g, 22, 18);
  dots(g, [[19, 23, 'D'], [20, 23, 'D'], [21, 23, 'D'], [13, 17, 'A'], [12, 19, 'A'], [23, 26, 'S'], [14, 26, 'S'],
    [27, 8, 'w'], [5, 14, 'w'], [29, 16, 'A']]);
  return done(g);
}

function haeuschel1() {
  const g = canvas(32);
  ellipse(g, 21, 23, 6, 4, ['p', 'C', 'e']); // Krebskörper
  ellipse(g, 27, 19, 3, 3, ['p', 'C', 'e']); // Scheren
  ellipse(g, 26, 26, 3, 2, ['p', 'C', 'e']);
  ellipse(g, 12, 16, 9, 9, ['Y', 'y', 'r']); // Schneckenhaus
  outline(g);
  // Spirale im Haus
  dots(g, [[12, 16, 'o'], [13, 16, 'o'], [13, 15, 'r'], [12, 14, 'r'], [11, 14, 'r'], [10, 15, 'r'], [10, 16, 'r'], [10, 17, 'r'],
    [11, 18, 'r'], [12, 19, 'r'], [13, 19, 'r'], [14, 19, 'r'], [15, 18, 'r'], [16, 17, 'r'], [16, 16, 'r'], [16, 15, 'r'],
    [15, 13, 'r'], [14, 12, 'r'], [9, 11, 'c'], [8, 12, 'c'], [7, 14, 'c']]);
  // Stielaugen
  dots(g, [[21, 18, 'e'], [21, 17, 'e'], [21, 16, 'e'], [24, 18, 'e'], [24, 17, 'e']]);
  eye(g, 20, 14, 2, 2);
  eye(g, 23, 15, 2, 2);
  dots(g, [[29, 18, 'k'], [29, 19, 'p'], [28, 25, 'k'], [18, 27, 'e'], [20, 28, 'e'], [23, 28, 'e'], [25, 23, 'k']]);
  return done(g);
}

function haeuschel2() {
  const g = canvas(40);
  ellipse(g, 28, 31, 8, 5, ['p', 'C', 'e']); // großer Körper
  ellipse(g, 36, 25, 3.5, 4, ['p', 'C', 'e']); // große Scheren
  ellipse(g, 35, 34, 3, 2.5, ['p', 'C', 'e']);
  // Haus wie ein kleiner Leuchtturm
  poly(g, [[6, 35], [22, 35], [19, 9], [10, 9]], ['Y', 'y', 'r']);
  ellipse(g, 14.5, 8, 6, 3, ['C', 'e', 'e']); // Dach
  outline(g);
  // Streifen und Fenster
  for (const y of [15, 16, 23, 24, 31, 32]) {
    for (let x = 6; x < 23; x++) if (g[y][x] !== '.' && g[y][x] !== 'k') g[y][x] = y % 2 ? 'C' : 'e';
  }
  dots(g, [[14, 11, 'H'], [15, 11, 'H'], [14, 12, 'H'], [15, 12, 'h'], [13, 11, 'k'], [16, 11, 'k'],
    [11, 19, 'c'], [11, 20, 'c'], [10, 27, 'c'], [14, 5, 'k'], [14, 4, 'H']]);
  // Stielaugen
  dots(g, [[28, 25, 'e'], [28, 24, 'e'], [28, 23, 'e'], [32, 25, 'e'], [32, 24, 'e']]);
  eye(g, 27, 20, 2, 3);
  eye(g, 31, 21, 2, 3);
  dots(g, [[38, 24, 'k'], [38, 25, 'p'], [37, 34, 'k'], [24, 36, 'e'], [27, 37, 'e'], [30, 37, 'e'], [33, 31, 'k']]);
  return done(g);
}

function glimmqualle() {
  const g = canvas(32);
  ellipse(g, 16, 13, 10, 9, ['V', 'v', 'P'], { cutBelow: 15 }); // Schirm
  for (let x = 6; x <= 26; x++) put(g, x, 16, 'R');
  outline(g);
  // Tentakel
  for (let i = 0; i < 5; i++) {
    const bx = 8 + i * 4;
    for (let y = 18; y < 30 - (i % 2) * 3; y++) put(g, bx + Math.round(Math.sin(y / 2 + i) * 1.2), y, y % 3 ? 'V' : 'R');
  }
  dots(g, [[10, 8, 'H'], [15, 6, 'H'], [21, 9, 'H'], [12, 12, 'H'], [24, 13, 'H'], [9, 6, 'w'], [11, 5, 'w']]);
  eye(g, 16, 11, 2, 2);
  eye(g, 20, 11, 2, 2);
  dots(g, [[17, 14, 'k'], [18, 14, 'k'], [19, 14, 'k']]);
  return done(g);
}

export const CREATURE_ART = {
  funki: { 1: funki() },
  kiesel: { 1: kiesel() },
  nixi: { 1: nixi() },
  flausch: { 1: flausch() },
  pieks: { 1: pieks() },
  gischtling: { 1: gischtling() },
  haeuschel: { 1: haeuschel1(), 2: haeuschel2() },
  glimmqualle: { 1: glimmqualle() },
};

// Höchste vorhandene Stufe ≤ der gewünschten (spätere Stufen kommen in Plan 4).
export function creatureRows(speciesId, stage) {
  const art = CREATURE_ART[speciesId];
  for (let s = stage; s >= 1; s--) if (art?.[s]) return art[s];
  return null;
}
