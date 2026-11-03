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

// ---------- Gebiet 2: Flüsterwald ----------

function moosling() {
  const g = canvas(32);
  ellipse(g, 16, 21, 10, 8, ['G', 'g', 'l']); // Moosballen
  ellipse(g, 15, 11, 8, 4, ['p', 'C', 'e'], { cutBelow: 12 }); // Pilzhut
  for (let x = 8; x <= 22; x++) put(g, x, 13, 'c'); // Hutrand
  outline(g);
  dots(g, [[12, 9, 'w'], [17, 8, 'w'], [20, 10, 'w'], [10, 20, 'F'], [21, 24, 'F'], [14, 26, 'F'], [19, 18, 'G'], [8, 23, 'F']]);
  eye(g, 17, 17);
  eye(g, 21, 17);
  dots(g, [[19, 21, 'k'], [20, 21, 'k'], [11, 29, 'l'], [12, 29, 'l'], [20, 29, 'l'], [21, 29, 'l']]);
  return done(g);
}

function eichhuscher1() {
  const g = canvas(32);
  ellipse(g, 9, 14, 6, 10, ['h', 'r', 'o']); // buschiger Laubschwanz
  ellipse(g, 18, 22, 7, 6, ['p', 'C', 'e']); // Körper
  ellipse(g, 21, 13, 6, 5, ['p', 'C', 'e']); // Kopf
  ellipse(g, 21, 8, 4, 2.5, ['o', 'r', 'b']); // Eichelkappe
  outline(g);
  dots(g, [[21, 5, 'b'], [21, 4, 'b'], [6, 8, 'H'], [8, 12, 'H'], [7, 17, 'H'], [10, 20, 'r'], [15, 25, 'c'], [17, 26, 'c']]);
  eye(g, 21, 12);
  eye(g, 24, 12);
  dots(g, [[26, 15, 'k'], [23, 16, 'k'], [24, 16, 'k'], [14, 28, 'e'], [20, 28, 'e']]);
  return done(g);
}

// Kronenhuscher: größer, mit einer Krone aus Eichenblättern
function eichhuscher2() {
  const g = canvas(40);
  ellipse(g, 11, 17, 8, 13, ['h', 'r', 'o']);
  ellipse(g, 23, 28, 9, 8, ['p', 'C', 'e']);
  ellipse(g, 27, 16, 7, 6, ['p', 'C', 'e']);
  for (const [x, y] of [[21, 8], [25, 6], [29, 6], [33, 8]]) ellipse(g, x, y, 2.5, 3, ['G', 'g', 'l']);
  outline(g);
  dots(g, [[25, 3, 'h'], [29, 3, 'h'], [7, 10, 'H'], [9, 16, 'H'], [8, 23, 'H'], [12, 28, 'r'], [19, 33, 'c'], [22, 34, 'c']]);
  eye(g, 26, 14, 2, 3);
  eye(g, 30, 14, 2, 3);
  dots(g, [[33, 18, 'k'], [29, 20, 'k'], [30, 20, 'k'], [17, 36, 'e'], [26, 36, 'e']]);
  return done(g);
}

function rindenwicht() {
  const g = canvas(32);
  poly(g, [[9, 28], [7, 14], [11, 6], [19, 4], [24, 9], [25, 20], [23, 28], [19, 25], [16, 29], [13, 25]], ['r', 'o', 'b']);
  ellipse(g, 27, 14, 2, 3, ['g', 'l', 'F']); // Moosbüschel
  outline(g);
  dots(g, [[12, 10, 'b'], [12, 11, 'b'], [13, 18, 'b'], [13, 19, 'b'], [20, 20, 'b'], [20, 21, 'b'], [10, 22, 'b']]);
  // Laternenaugen
  for (const [x, y] of [[14, 12], [19, 12]]) dots(g, [[x, y, 'H'], [x + 1, y, 'H'], [x, y + 1, 'h'], [x + 1, y + 1, 'H']]);
  dots(g, [[16, 16, 'k'], [17, 16, 'k'], [27, 11, 'G']]);
  return done(g);
}

// ---------- Gebiet 3: Pilzmoor (dunkles Türkis, Moosgrün, Pilzleuchten in Gelb und Rosa) ----------

function tupfling() {
  const g = canvas(32);
  ellipse(g, 12, 28, 3, 1.5, ['c', 'Y', 'y']); // Füße
  ellipse(g, 20, 28, 3, 1.5, ['c', 'Y', 'y']);
  ellipse(g, 16, 22, 7, 6, ['w', 'c', 'Y']); // Stielkörper
  ellipse(g, 16, 13, 12, 9, ['R', 'v', 'P'], { cutBelow: 15 }); // Tupfenkappe
  for (let x = 0; x < 32; x++) if (g[15][x] !== '.') g[15][x] = 'R'; // Lamellen
  outline(g);
  dots(g, [[10, 9, 'H'], [16, 7, 'H'], [22, 10, 'H'], [13, 12, 'H'], [20, 13, 'h'], [25, 13, 'H'], [8, 12, 'h'], [11, 8, 'w'], [17, 6, 'w']]);
  eye(g, 17, 19, 2, 2);
  eye(g, 21, 19, 2, 2);
  dots(g, [[19, 23, 'k'], [20, 23, 'k'], [16, 22, 'R'], [24, 22, 'R'], [3, 18, 'H'], [28, 19, 'H'], [5, 23, 'h']]);
  return done(g);
}

// Schirmling: großer Schirmhut mit gewelltem Rand, darunter ein kräftiger Stiel mit Ärmchen
function schirmling() {
  const g = canvas(40);
  ellipse(g, 15, 36, 3.5, 2, ['c', 'Y', 'y']);
  ellipse(g, 25, 36, 3.5, 2, ['c', 'Y', 'y']);
  ellipse(g, 20, 28, 8, 8, ['w', 'c', 'Y']);
  ellipse(g, 30, 28, 3, 2, ['w', 'c', 'Y']);
  ellipse(g, 20, 16, 17, 12, ['R', 'v', 'P'], { cutBelow: 18 });
  for (let x = 4; x <= 36; x++) if (x % 6 >= 1 && x % 6 <= 4) put(g, x, 19, 'P');
  for (let x = 0; x < 40; x++) if (g[18][x] !== '.') g[18][x] = 'R';
  outline(g);
  dots(g, [[11, 9, 'H'], [19, 7, 'H'], [27, 9, 'H'], [8, 14, 'h'], [15, 12, 'H'], [24, 13, 'H'], [31, 14, 'h'], [20, 16, 'h'],
    [12, 8, 'w'], [20, 6, 'w'], [28, 8, 'w']]);
  eye(g, 21, 24, 2, 3);
  eye(g, 26, 24, 2, 3);
  dots(g, [[23, 29, 'k'], [24, 29, 'k'], [25, 28, 'k'], [20, 28, 'R'], [28, 27, 'R'], [3, 24, 'H'], [36, 23, 'H'], [6, 30, 'h']]);
  return done(g);
}

function irrfunke() {
  const g = canvas(32);
  poly(g, [[9, 22], [2, 8], [11, 15], [9, 4], [16, 12], [19, 6], [21, 14], [14, 26]], ['w', 'T', 't']); // flackernde Spitzen
  ellipse(g, 18, 20, 8, 7.5, ['w', 'T', 't']);
  ellipse(g, 18, 21, 4.5, 4, ['w', 'H', 'T']); // heller Kern
  outline(g, 'F');
  eye(g, 18, 18, 2, 3);
  eye(g, 22, 18, 2, 3);
  dots(g, [[20, 23, 'F'], [21, 23, 'F'], [4, 26, 'T'], [27, 9, 'H'], [29, 14, 'T'], [7, 29, 'H'], [26, 27, 'T']]);
  return done(g);
}

function nebelunke() {
  const g = canvas(32);
  ellipse(g, 7, 27, 4, 2, ['f', 'm', 's']); // Hinterbein
  ellipse(g, 25, 28, 3, 1.5, ['f', 'm', 's']); // Vorderbein
  ellipse(g, 16, 22, 13, 7, ['w', 'f', 'm']); // breiter Körper
  ellipse(g, 19, 15, 3.5, 3.5, ['w', 'f', 'm']); // Augenhügel
  ellipse(g, 26, 16, 3.5, 3.5, ['w', 'f', 'm']);
  outline(g, 'd');
  eye(g, 19, 14, 2, 3);
  eye(g, 26, 15, 2, 3);
  dots(g, [[8, 19, 't'], [12, 17, 't'], [10, 23, 't'], [15, 20, 'T'], [6, 22, 'T'], [13, 25, 't'],
    [20, 22, 'd'], [21, 23, 'd'], [22, 23, 'd'], [23, 23, 'd'], [24, 22, 'd'],
    [23, 20, 'R'], [28, 20, 'R'], [3, 12, 'f'], [5, 10, 'w'], [29, 9, 'f'], [1, 17, 'f']]);
  return done(g);
}

// ---------- Gebiet 4: Spiegeldünen (helles Sandgold, Glas-Cyan, Spiegelweiß) ----------

function glaskaefer() {
  const g = canvas(32);
  ellipse(g, 13, 19, 10, 7.5, ['w', 'A', 'L']); // gläserne Flügeldecken
  ellipse(g, 22, 19, 3.5, 5, ['A', 'L', 'S']); // Halsschild
  ellipse(g, 26, 21, 4, 3.5, ['s', 'd', 'n']); // Kopf
  outline(g);
  dots(g, [[7, 14, 'w'], [8, 13, 'w'], [9, 13, 'w'], [10, 12, 'w'], [6, 16, 'w'], [12, 16, 'A'], [16, 21, 'S'], [10, 22, 'S'], [14, 24, 'S'],
    [9, 27, 'k'], [8, 28, 'k'], [14, 27, 'k'], [14, 28, 'k'], [13, 29, 'k'], [20, 26, 'k'], [21, 27, 'k'], [22, 28, 'k'],
    [28, 17, 'k'], [29, 16, 'k'], [30, 15, 'k'], [30, 14, 'h'], [20, 15, 'w']]);
  eye(g, 27, 19, 2, 2);
  dots(g, [[29, 23, 'k'], [28, 23, 'k']]);
  return done(g);
}

// Spiegelkäfer: Flügeldecken wie Spiegel mit goldenem Rand, dazu ein Horn
function spiegelkaefer() {
  const g = canvas(40);
  ellipse(g, 16, 23, 13, 9.5, ['w', 'f', 'A']);
  ellipse(g, 28, 23, 4.5, 6, ['A', 'L', 'S']);
  ellipse(g, 33, 26, 5, 4.5, ['s', 'd', 'n']);
  poly(g, [[32, 22], [37, 11], [36, 22]], ['H', 'h', 'r']); // Horn
  outline(g);
  for (let x = 0; x < 28; x++) {
    let bottom = -1;
    for (let y = 0; y < 40; y++) if (g[y][x] !== '.' && g[y][x] !== 'k') bottom = y;
    if (bottom > 26 && x > 3) g[bottom][x] = 'h'; // goldener Rand unten
  }
  dots(g, [[8, 17, 'L'], [9, 17, 'L'], [10, 16, 'L'], [11, 16, 'L'], [12, 16, 'L'], [14, 17, 'L'], [15, 17, 'L'], // gespiegelter Himmel
    [7, 19, 'w'], [8, 20, 'w'], [17, 20, 'w'], [18, 21, 'w'], [6, 24, 'A'], [22, 26, 'A'],
    [11, 34, 'k'], [10, 35, 'k'], [9, 36, 'k'], [17, 34, 'k'], [17, 35, 'k'], [16, 36, 'k'], [25, 33, 'k'], [26, 34, 'k'], [27, 35, 'k']]);
  eye(g, 34, 24, 2, 3);
  dots(g, [[37, 28, 'k'], [36, 29, 'k'], [24, 19, 'w']]);
  return done(g);
}

function duenenhuepfer() {
  const g = canvas(32);
  poly(g, [[10, 22], [3, 14], [4, 13], [10, 20]], ['y', 'y', 'r']); // dünner Schwanz
  ellipse(g, 3, 12.5, 2.5, 2.5, ['w', 'c', 'Y']); // Quaste
  ellipse(g, 12, 28, 5, 2, ['Y', 'y', 'r']); // großer Hinterfuß
  ellipse(g, 15, 22, 7, 6, ['Y', 'y', 'r']); // Körper
  ellipse(g, 21, 23, 3, 3, ['w', 'c', 'Y']); // Bauch
  ellipse(g, 18, 6, 2.5, 6, ['p', 'y', 'r']); // Ohren
  ellipse(g, 23, 5, 2.5, 6, ['p', 'y', 'r']);
  ellipse(g, 22, 15, 5.5, 5, ['Y', 'y', 'r']); // Kopf
  outline(g);
  dots(g, [[18, 3, 'R'], [18, 4, 'R'], [18, 5, 'R'], [23, 2, 'R'], [23, 3, 'R'], [23, 4, 'R'], [27, 16, 'R'], [24, 18, 'k'], [25, 18, 'k'],
    [23, 27, 'y'], [24, 28, 'r'], [9, 19, 'r'], [12, 18, 'r']]);
  eye(g, 23, 13, 2, 3);
  return done(g);
}

function flimmerfuchs() {
  const g = canvas(32);
  ellipse(g, 7, 15, 5, 8, ['w', 'f', 'A']); // buschiger Schwanz
  ellipse(g, 11, 27, 2, 2.5, ['f', 'A', 'L']); // Beine
  ellipse(g, 19, 27, 2, 2.5, ['f', 'A', 'L']);
  ellipse(g, 15, 21, 8, 5.5, ['w', 'f', 'A']); // Körper
  poly(g, [[19, 12], [20, 4], [23, 11]], ['w', 'f', 'A']); // Ohren
  poly(g, [[23, 11], [26, 4], [27, 12]], ['w', 'f', 'A']);
  ellipse(g, 23, 15, 5.5, 5, ['w', 'f', 'A']); // Kopf
  poly(g, [[25, 14], [31, 17], [26, 19]], ['f', 'A', 'L']); // Schnauze
  outline(g, 'L');
  eye(g, 24, 14, 2, 2);
  dots(g, [[30, 17, 'k'], [5, 8, 'w'], [6, 9, 'w'], [13, 19, 'Y'], [15, 18, 'Y'], [17, 19, 'Y'], [21, 7, 'R'], [25, 7, 'R'],
    [3, 4, 'w'], [12, 9, 'A'], [29, 8, 'w'], [2, 26, 'A'], [28, 25, 'w']]); // Flimmerpunkte
  return done(g);
}

// ---------- Gebiet 5: Windklippen (Felsgrau, Himmelblau, Wolkenweiß, Holzbraun) ----------

function drachling() {
  const g = canvas(32);
  poly(g, [[9, 22], [2, 27], [3, 28], [10, 24]], ['A', 'L', 'S']); // Schwanz
  ellipse(g, 12, 27, 2, 2, ['L', 'S', 'D']); // Beine
  ellipse(g, 18, 27, 2, 2, ['L', 'S', 'D']);
  ellipse(g, 15, 21, 7, 5.5, ['A', 'L', 'S']); // Körper
  poly(g, [[13, 17], [6, 4], [16, 9], [18, 17]], ['w', 'c', 'Y']); // Flügel wie ein Papierdrache
  ellipse(g, 26, 10, 1.5, 2.5, ['c', 'Y', 'y']); // Hörnchen
  ellipse(g, 23, 15, 5, 4.5, ['A', 'L', 'S']); // Kopf
  outline(g);
  dots(g, [[8, 7, 'e'], [9, 8, 'e'], [10, 9, 'e'], [11, 10, 'e'], [12, 11, 'e'], [13, 12, 'e'], [14, 13, 'e'], [9, 11, 'e'], [12, 9, 'e'],
    [3, 29, 'e'], [2, 30, 'C'], [4, 30, 'C'], [15, 23, 'A'], [17, 23, 'A']]);
  eye(g, 24, 13, 2, 2);
  dots(g, [[27, 16, 'k'], [25, 17, 'k'], [26, 17, 'k']]);
  return done(g);
}

// Himmelsdrachling: zwei Drachenflügel, langer Schwanz mit Schleifen, Hörner
function himmelsdrachling() {
  const g = canvas(40);
  poly(g, [[12, 29], [2, 35], [3, 37], [13, 31]], ['A', 'L', 'S']); // Schwanz
  poly(g, [[14, 24], [2, 11], [13, 14], [19, 25]], ['c', 'Y', 'y']); // hinterer Flügel
  ellipse(g, 15, 35, 2.5, 2.5, ['L', 'S', 'D']);
  ellipse(g, 23, 35, 2.5, 2.5, ['L', 'S', 'D']);
  ellipse(g, 19, 28, 9, 7, ['A', 'L', 'S']); // Körper
  poly(g, [[17, 23], [8, 3], [21, 10], [24, 23]], ['w', 'c', 'Y']); // vorderer Flügel
  ellipse(g, 31, 10, 1.5, 3.5, ['c', 'Y', 'y']); // Hörner
  ellipse(g, 34, 11, 1.5, 3, ['c', 'Y', 'y']);
  ellipse(g, 29, 18, 6, 5.5, ['A', 'L', 'S']); // Kopf
  poly(g, [[32, 17], [38, 19], [33, 22]], ['A', 'L', 'S']); // Schnauze
  outline(g);
  dots(g, [[10, 6, 'e'], [11, 7, 'e'], [12, 9, 'e'], [13, 11, 'e'], [14, 13, 'e'], [15, 15, 'e'], [16, 17, 'e'], [17, 19, 'e'], [12, 13, 'e'], [15, 10, 'e'],
    [5, 13, 'r'], [8, 15, 'r'], [11, 17, 'r'],
    [5, 34, 'e'], [4, 33, 'C'], [6, 33, 'C'], [9, 32, 'e'], [8, 31, 'C'], [10, 31, 'C'], [3, 38, 'e'], [2, 39, 'C'], [4, 39, 'C'],
    [18, 31, 'A'], [21, 31, 'A'], [24, 30, 'A']]);
  eye(g, 29, 16, 2, 3);
  dots(g, [[37, 19, 'k'], [34, 21, 'k'], [35, 21, 'k']]);
  return done(g);
}

function klippbock() {
  const g = canvas(32);
  for (const x of [9, 13, 18, 22]) ellipse(g, x, 27, 1.5, 3, ['m', 's', 'd']); // Beine
  ellipse(g, 15, 19, 9, 6, ['w', 'f', 'm']); // zotteliger Körper
  ellipse(g, 24, 13, 4.5, 4.5, ['w', 'f', 'm']); // Kopf
  poly(g, [[25, 13], [30, 16], [26, 18]], ['f', 'm', 's']); // Schnauze
  ellipse(g, 21, 8, 3.5, 3.5, ['r', 'o', 'b']); // eingerolltes Horn
  outline(g);
  dots(g, [[21, 8, 'b'], [22, 8, 'r'], [22, 9, 'b'], [21, 9, 'b'], [20, 9, 'b'], [20, 8, 'b'], [20, 7, 'b'], [21, 6, 'b'], [22, 6, 'b'], [23, 7, 'b'],
    [26, 19, 'f'], [26, 20, 'm'], [27, 19, 'f'], // Bart
    [9, 30, 'n'], [13, 30, 'n'], [18, 30, 'n'], [22, 30, 'n'], [10, 17, 'm'], [13, 15, 'm'], [17, 16, 'm'], [8, 21, 'm'], [12, 23, 'm']]);
  eye(g, 24, 12, 2, 2);
  dots(g, [[29, 16, 'k']]);
  return done(g);
}

function wolkenwal() {
  const g = canvas(32);
  ellipse(g, 3, 13, 2.5, 4, ['w', 'f', 'm']); // Schwanzflosse
  ellipse(g, 3, 23, 2.5, 4, ['w', 'f', 'm']);
  ellipse(g, 6, 18, 3, 3, ['w', 'f', 'm']);
  ellipse(g, 17, 19, 13, 8, ['w', 'f', 'm']); // Körper
  for (const [x, y, r] of [[11, 12, 3.5], [17, 10, 4], [23, 12, 3.5]]) ellipse(g, x, y, r, r, ['w', 'w', 'f']); // Wolkenbäusche
  ellipse(g, 18, 24, 9, 2.5, ['A', 'A', 'L']); // bläulicher Bauch
  poly(g, [[14, 23], [10, 29], [18, 26]], ['f', 'm', 's']); // Flosse
  outline(g, 'S');
  eye(g, 25, 18, 2, 2);
  dots(g, [[26, 22, 'S'], [27, 22, 'S'], [28, 21, 'S'], [23, 21, 'R'], [19, 4, 'A'], [18, 3, 'w'], [20, 3, 'w'], [17, 2, 'A'], [21, 2, 'A']]);
  return done(g);
}

export const CREATURE_ART = {
  tupfling: { 1: tupfling(), 2: schirmling() },
  irrfunke: { 1: irrfunke() },
  nebelunke: { 1: nebelunke() },
  glaskaefer: { 1: glaskaefer(), 2: spiegelkaefer() },
  duenenhuepfer: { 1: duenenhuepfer() },
  flimmerfuchs: { 1: flimmerfuchs() },
  drachling: { 1: drachling(), 2: himmelsdrachling() },
  klippbock: { 1: klippbock() },
  wolkenwal: { 1: wolkenwal() },
  moosling: { 1: moosling() },
  eichhuscher: { 1: eichhuscher1(), 2: eichhuscher2() },
  rindenwicht: { 1: rindenwicht() },
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
