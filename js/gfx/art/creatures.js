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

// ---------- Startwesen, Stufe 2 (40 px) und Stufe 3 (48 px) ----------
// Jede Stufe behält Hauptfarbe und Grundform und wird größer und eindrucksvoller (Design 6.1).

// Eine Linie aus einzelnen Pixeln (für Adern, Ranken, Blitze).
function line(g, x0, y0, x1, y1, ch) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= n; i++) put(g, Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), ch);
}

// Kleine Blüte: Kreuz in der Blütenfarbe, gelbe Mitte.
function blossom(g, x, y, petal) {
  dots(g, [[x, y - 1, petal], [x - 1, y, petal], [x + 1, y, petal], [x, y + 1, petal], [x, y, 'H']]);
}

function funkelflug() {
  const g = canvas(40);
  ellipse(g, 13, 14, 12, 10, ['w', 'V', 'v']); // große Oberflügel
  ellipse(g, 12, 26, 9, 6, ['V', 'v', 'P']); // Unterflügel
  ellipse(g, 16, 29, 6, 5, ['w', 'H', 'h']); // hellerer Hinterleib
  ellipse(g, 25, 20, 9, 8, ['w', 'c', 'Y']); // flauschiger Körper
  outline(g);
  eye(g, 24, 17);
  eye(g, 29, 17);
  dots(g, [[26, 23, 'R'], [32, 22, 'R'], [27, 23, 'k'], [28, 23, 'k']]);
  // Fühler mit Leuchtspitzen
  line(g, 24, 12, 27, 7, 'k');
  line(g, 29, 12, 33, 8, 'k');
  dots(g, [[28, 6, 'H'], [28, 5, 'H'], [29, 5, 'w'], [34, 7, 'H'], [35, 7, 'H'], [34, 6, 'w']]);
  // Funkenpunkte auf den Flügeln, Glimmen um den Hinterleib
  dots(g, [[7, 10, 'H'], [11, 8, 'w'], [15, 11, 'H'], [5, 15, 'H'], [10, 17, 'w'], [17, 7, 'H'], [8, 24, 'H'], [12, 27, 'w'], [15, 28, 'w']]);
  dots(g, [[9, 35, 'H'], [22, 36, 'H'], [6, 31, 'H']]);
  return done(g);
}

function laternenfalter() {
  const g = canvas(48);
  ellipse(g, 15, 16, 14, 12, ['w', 'V', 'v']); // Oberflügel wie Pergament
  ellipse(g, 13, 31, 10, 7, ['V', 'v', 'P']); // Unterflügel
  poly(g, [[13, 30], [25, 30], [27, 42], [11, 42]], ['Y', 'r', 'o']); // Laternenrahmen
  poly(g, [[15, 32], [23, 32], [24, 40], [14, 40]], ['w', 'H', 'h']); // warmes Licht
  ellipse(g, 31, 23, 10, 9, ['w', 'c', 'Y']); // Körper
  outline(g);
  // Streben und Ring der Laterne
  line(g, 19, 31, 19, 41, 'r');
  dots(g, [[18, 28, 'r'], [19, 28, 'r'], [20, 28, 'r'], [19, 27, 'r']]);
  // Adern in den Flügeln
  line(g, 22, 14, 7, 7, 'P');
  line(g, 22, 18, 4, 17, 'P');
  line(g, 20, 30, 6, 33, 'v');
  eye(g, 30, 20);
  eye(g, 36, 20);
  dots(g, [[32, 26, 'R'], [38, 25, 'R'], [33, 26, 'k'], [34, 26, 'k']]);
  line(g, 30, 14, 33, 7, 'k');
  line(g, 36, 15, 41, 9, 'k');
  dots(g, [[34, 6, 'H'], [34, 5, 'w'], [42, 8, 'H'], [42, 7, 'w'], [9, 11, 'w'], [13, 9, 'w']]);
  dots(g, [[8, 45, 'H'], [28, 45, 'H'], [5, 40, 'H']]);
  return done(g);
}

function findling() {
  const g = canvas(40);
  ellipse(g, 13, 36, 5, 2.5, ['s', 'd', 'n']); // Füße
  ellipse(g, 27, 36, 5, 2.5, ['s', 'd', 'n']);
  ellipse(g, 20, 23, 15, 12, ['m', 's', 'd']); // breiter Steinkörper
  ellipse(g, 35, 25, 3, 4, ['m', 's', 'd']); // Ärmchen
  ellipse(g, 10, 15, 8, 6, ['G', 'g', 'l']); // Moosmantel über dem Rücken
  ellipse(g, 7, 23, 4, 6, ['G', 'g', 'l']);
  poly(g, [[19, 9], [21, 3], [24, 2], [26, 9], [22, 12]], ['w', 'A', 'L']); // Kristall
  outline(g);
  eye(g, 24, 19);
  eye(g, 30, 19);
  dots(g, [[25, 25, 'k'], [26, 26, 'k'], [27, 26, 'k'], [28, 25, 'k'], [23, 23, 'R'], [32, 23, 'R'],
    [15, 26, 'd'], [16, 27, 'd'], [16, 28, 'd'], [21, 31, 'd'], [22, 32, 'd'], [12, 31, 'd'],
    [9, 11, 'G'], [13, 12, 'l'], [6, 18, 'G'], [21, 4, 'w'], [22, 5, 'w']]);
  return done(g);
}

function felsenwaechter() {
  const g = canvas(48);
  ellipse(g, 17, 44, 6, 2.5, ['s', 'd', 'n']); // Füße
  ellipse(g, 31, 44, 6, 2.5, ['s', 'd', 'n']);
  ellipse(g, 24, 30, 13, 14, ['m', 's', 'd']); // aufrechter Körper
  ellipse(g, 26, 13, 9, 8, ['m', 's', 'd']); // Kopf
  poly(g, [[35, 20], [43, 25], [41, 36], [34, 31]], ['m', 's', 'd']); // Arm aus Steinplatten
  poly(g, [[13, 21], [6, 26], [8, 36], [14, 31]], ['m', 's', 'd']);
  ellipse(g, 15, 20, 6, 3, ['G', 'g', 'l']); // Moos auf den Schultern
  ellipse(g, 35, 19, 5, 3, ['G', 'g', 'l']);
  outline(g);
  eye(g, 26, 11);
  eye(g, 31, 11);
  dots(g, [[27, 16, 'k'], [28, 16, 'k'], [29, 16, 'k'], [25, 15, 'R'], [33, 15, 'R']]);
  // Plattenfugen und Risse
  line(g, 37, 27, 41, 30, 'd');
  line(g, 9, 29, 13, 27, 'd');
  dots(g, [[19, 33, 'd'], [20, 34, 'd'], [20, 35, 'd'], [28, 38, 'd'], [29, 39, 'd'], [17, 25, 'm'], [22, 8, 'f']]);
  blossom(g, 13, 19, 'R');
  blossom(g, 18, 19, 'V');
  blossom(g, 35, 18, 'R');
  return done(g);
}

function quellnix() {
  const g = canvas(40);
  poly(g, [[2, 21], [15, 22], [15, 32], [3, 33]], ['V', 'v', 'P']); // Schwanzflosse
  poly(g, [[7, 25], [20, 20], [21, 23], [9, 28]], ['V', 'v', 'P']); // längerer Flossenkamm
  ellipse(g, 18, 28, 9, 6, ['w', 'R', 'C']); // Körper
  ellipse(g, 27, 20, 10, 9, ['w', 'R', 'C']); // großer Kopf
  ellipse(g, 14, 34, 2.5, 2.5, ['R', 'R', 'C']); // Beinchen
  ellipse(g, 23, 34, 2.5, 2.5, ['R', 'R', 'C']);
  poly(g, [[22, 13], [13, 3], [15, 9], [20, 15]], ['p', 'C', 'e']); // Kiemenkrone
  poly(g, [[21, 16], [9, 10], [12, 15], [20, 19]], ['p', 'C', 'e']);
  poly(g, [[21, 20], [10, 20], [12, 23], [21, 23]], ['p', 'C', 'e']);
  outline(g);
  // Wasserperlen an den Kiemen
  dots(g, [[13, 3, 'A'], [14, 2, 'w'], [9, 10, 'A'], [8, 9, 'w'], [10, 20, 'A'], [9, 19, 'w']]);
  eye(g, 28, 18, 2, 2);
  eye(g, 33, 18, 2, 2);
  dots(g, [[29, 23, 'k'], [30, 24, 'k'], [31, 24, 'k'], [32, 23, 'k'], [27, 22, 'p'], [34, 22, 'p'],
    [36, 6, 'A'], [37, 6, 'A'], [36, 5, 'w'], [32, 3, 'A'], [21, 26, 'w']]);
  return done(g);
}

function strudelnix() {
  const g = canvas(48);
  ellipse(g, 9, 30, 8, 8, ['V', 'v', 'P']); // Schwanzflosse als Strudel
  ellipse(g, 22, 33, 12, 5, ['w', 'R', 'C']); // schlanker Körper
  ellipse(g, 34, 24, 10, 9, ['w', 'R', 'C']); // Kopf
  ellipse(g, 18, 39, 2.5, 2.5, ['R', 'R', 'C']);
  ellipse(g, 28, 39, 2.5, 2.5, ['R', 'R', 'C']);
  // Kiemen wie Wellen
  poly(g, [[29, 16], [19, 6], [24, 9], [21, 4], [32, 15]], ['p', 'C', 'e']);
  poly(g, [[27, 20], [14, 15], [19, 17], [15, 12], [28, 23]], ['p', 'C', 'e']);
  poly(g, [[27, 25], [15, 25], [19, 27], [16, 29], [28, 28]], ['p', 'C', 'e']);
  outline(g);
  // Strudel im Schwanz
  dots(g, [[9, 30, 'w'], [10, 29, 'A'], [11, 30, 'A'], [11, 31, 'A'], [10, 32, 'A'], [8, 32, 'A'], [7, 31, 'A'], [7, 29, 'A'], [8, 27, 'A'], [10, 26, 'A'], [12, 27, 'A'], [13, 29, 'A']]);
  eye(g, 35, 22, 2, 2);
  eye(g, 40, 22, 2, 2);
  dots(g, [[36, 27, 'k'], [37, 28, 'k'], [38, 28, 'k'], [39, 27, 'k'], [34, 26, 'p'], [41, 26, 'p'],
    [43, 9, 'A'], [44, 9, 'A'], [43, 8, 'w'], [39, 5, 'A'], [24, 31, 'w'], [16, 33, 'w']]);
  return done(g);
}

function wolkenkauz() {
  const g = canvas(40);
  ellipse(g, 8, 25, 6, 6, ['w', 'f', 'm']); // Wolkenflügel
  ellipse(g, 33, 26, 6, 6, ['w', 'f', 'm']);
  ellipse(g, 14, 34, 6, 3.5, ['w', 'f', 'm']);
  ellipse(g, 27, 34, 6, 3.5, ['w', 'f', 'm']);
  ellipse(g, 20, 23, 13, 12, ['w', 'f', 'm']); // runder Körper
  // Wolkenbüschel als Federohren
  ellipse(g, 11, 10, 4, 3, ['w', 'f', 'm']);
  ellipse(g, 15, 7, 3, 3, ['w', 'f', 'm']);
  ellipse(g, 26, 8, 3, 3, ['w', 'f', 'm']);
  ellipse(g, 30, 10, 4, 3, ['w', 'f', 'm']);
  ellipse(g, 22, 19, 9, 7, ['w', 'c', 'Y']); // Gesicht
  ellipse(g, 21, 29, 7, 5, ['w', 'c', 'Y']); // runde Brust
  outline(g);
  for (const ex of [17, 24]) {
    dots(g, [[ex, 16, 'h'], [ex + 1, 16, 'h'], [ex + 2, 16, 'h'], [ex, 17, 'h'], [ex, 18, 'h'], [ex + 2, 17, 'h'], [ex + 2, 18, 'h'], [ex, 19, 'h'], [ex + 1, 19, 'h'], [ex + 2, 19, 'h']]);
    dots(g, [[ex + 1, 17, 'w'], [ex + 1, 18, 'k']]);
  }
  dots(g, [[22, 21, 'r'], [23, 21, 'r'], [22, 22, 'o'], [15, 33, 'h'], [16, 34, 'h'], [25, 34, 'h'], [26, 33, 'h'],
    [11, 18, 'w'], [13, 15, 'w'], [6, 22, 'w'], [19, 28, 'f'], [23, 30, 'f']]);
  return done(g);
}

function sturmeule() {
  const g = canvas(48);
  poly(g, [[3, 20], [16, 16], [19, 37], [2, 40]], ['f', 'm', 's']); // breite Flügel
  poly(g, [[45, 20], [32, 16], [29, 37], [46, 40]], ['f', 'm', 's']);
  ellipse(g, 24, 29, 13, 14, ['w', 'f', 'm']); // Körper
  ellipse(g, 17, 12, 3, 4, ['f', 'm', 's']); // Federohren
  ellipse(g, 31, 12, 3, 4, ['f', 'm', 's']);
  ellipse(g, 26, 23, 9, 7, ['w', 'c', 'Y']); // Gesicht
  ellipse(g, 17, 44, 5, 2.5, ['w', 'f', 'm']); // Füße
  ellipse(g, 31, 44, 5, 2.5, ['w', 'f', 'm']);
  outline(g);
  for (const ex of [21, 28]) {
    dots(g, [[ex, 20, 'h'], [ex + 1, 20, 'h'], [ex + 2, 20, 'h'], [ex, 21, 'h'], [ex, 22, 'h'], [ex + 2, 21, 'h'], [ex + 2, 22, 'h'], [ex, 23, 'h'], [ex + 1, 23, 'h'], [ex + 2, 23, 'h']]);
    dots(g, [[ex + 1, 21, 'w'], [ex + 1, 22, 'k']]);
  }
  dots(g, [[26, 25, 'r'], [27, 25, 'r'], [26, 26, 'o']]);
  // goldener Blitz auf der Brust
  line(g, 26, 30, 22, 35, 'h');
  line(g, 22, 35, 27, 35, 'h');
  line(g, 27, 35, 23, 41, 'h');
  dots(g, [[25, 31, 'H'], [24, 36, 'H'], [7, 25, 'w'], [41, 25, 'w'], [10, 31, 's'], [38, 31, 's']]);
  return done(g);
}

function dornigel() {
  const g = canvas(40);
  const leaves = [[7, 15, 3], [11, 10, 3], [17, 7, 3], [23, 8, 2.8], [5, 21, 3], [6, 27, 2.8], [28, 11, 2.4]];
  for (const [x, y, r] of leaves) ellipse(g, x, y, r, r * 1.5, ['G', 'g', 'l']);
  ellipse(g, 19, 25, 13, 10, ['r', 'o', 'b']); // Körper
  ellipse(g, 29, 26, 6, 5, ['w', 'Y', 'y']); // Schnauze und Bauch
  ellipse(g, 14, 35, 3.5, 2, ['o', 'b', 'b']); // Füße
  ellipse(g, 24, 35, 3.5, 2, ['o', 'b', 'b']);
  outline(g);
  // Dornranken über den Blattstacheln
  line(g, 4, 25, 9, 14, 'F');
  line(g, 9, 14, 20, 9, 'F');
  line(g, 20, 9, 27, 12, 'F');
  dots(g, [[6, 19, 'Y'], [11, 12, 'Y'], [16, 10, 'Y'], [24, 9, 'Y'], [4, 24, 'Y']]);
  eye(g, 28, 21, 2, 2);
  dots(g, [[35, 26, 'k'], [34, 26, 'k'], [30, 28, 'k'], [31, 28, 'k'], [27, 24, 'R'],
    [12, 20, 'b'], [15, 18, 'b'], [10, 26, 'b'], [17, 30, 'b']]);
  return done(g);
}

function bluetenigel() {
  const g = canvas(48);
  const leaves = [[8, 18, 3.5], [12, 12, 3.5], [19, 8, 3.5], [27, 9, 3.2], [5, 25, 3.5], [6, 32, 3.2], [33, 13, 2.8]];
  for (const [x, y, r] of leaves) ellipse(g, x, y, r, r * 1.5, ['G', 'g', 'l']);
  ellipse(g, 23, 30, 15, 12, ['r', 'o', 'b']); // Körper
  ellipse(g, 35, 31, 7, 6, ['w', 'Y', 'y']); // Schnauze und Bauch
  ellipse(g, 17, 42, 4, 2.5, ['o', 'b', 'b']);
  ellipse(g, 29, 42, 4, 2.5, ['o', 'b', 'b']);
  outline(g);
  // Blüten zwischen den Stacheln
  blossom(g, 10, 15, 'R');
  blossom(g, 16, 10, 'V');
  blossom(g, 24, 8, 'R');
  blossom(g, 6, 22, 'V');
  blossom(g, 30, 11, 'R');
  blossom(g, 5, 29, 'R');
  eye(g, 34, 25, 2, 2);
  dots(g, [[42, 31, 'k'], [41, 31, 'k'], [36, 34, 'k'], [37, 34, 'k'], [33, 29, 'R'],
    [14, 24, 'b'], [18, 21, 'b'], [12, 31, 'b'], [20, 36, 'b'], [26, 22, 'o']]);
  return done(g);
}

// ---------- Startwesen, Stufe 4 (64 px) ----------

function nordlichtfalter() {
  const g = canvas(64);
  ellipse(g, 20, 21, 19, 16, ['w', 'V', 'v']); // weit ausgebreitete Oberflügel
  ellipse(g, 17, 42, 14, 9, ['V', 'v', 'P']); // Unterflügel
  ellipse(g, 22, 47, 7, 6, ['w', 'H', 'h']); // leuchtender Hinterleib
  ellipse(g, 41, 31, 13, 12, ['w', 'c', 'Y']); // Körper
  outline(g);
  // Nordlichtbänder in den Flügeln: Mint, Lagune, Flieder
  for (const [dy, ch] of [[-9, 'T'], [-4, 'L'], [1, 'T'], [6, 'A']]) {
    for (let x = 5; x <= 34; x++) {
      const y = Math.round(21 + dy + Math.sin(x / 4) * 2);
      if (g[y]?.[x] && g[y][x] !== '.' && g[y][x] !== 'k') put(g, x, y, ch);
    }
  }
  for (let x = 6; x <= 28; x++) {
    const y = Math.round(42 + Math.sin(x / 3) * 1.5);
    if (g[y]?.[x] && g[y][x] !== '.' && g[y][x] !== 'k') put(g, x, y, 'T');
  }
  eye(g, 40, 27, 3, 4);
  eye(g, 47, 27, 3, 4);
  dots(g, [[42, 35, 'R'], [51, 34, 'R'], [44, 35, 'k'], [45, 36, 'k'], [46, 35, 'k']]);
  // lange Fühler und eine kleine Krone aus Licht
  line(g, 39, 19, 42, 6, 'k');
  line(g, 47, 20, 55, 8, 'k');
  dots(g, [[42, 5, 'H'], [42, 4, 'H'], [43, 4, 'w'], [56, 7, 'H'], [57, 7, 'H'], [56, 6, 'w']]);
  dots(g, [[41, 18, 'H'], [43, 17, 'H'], [45, 16, 'w'], [47, 17, 'H'], [49, 18, 'H'], [45, 17, 'H']]);
  dots(g, [[10, 61, 'H'], [30, 62, 'H'], [6, 54, 'H'], [36, 57, 'H']]);
  return done(g);
}

function bergherz() {
  const g = canvas(64);
  ellipse(g, 20, 58, 8, 3.5, ['s', 'd', 'n']); // Füße
  ellipse(g, 42, 58, 8, 3.5, ['s', 'd', 'n']);
  poly(g, [[6, 55], [18, 14], [30, 5], [44, 12], [58, 55]], ['m', 's', 'd']); // kleiner Berg
  poly(g, [[22, 12], [30, 5], [40, 10], [36, 15], [30, 12], [25, 16]], ['w', 'w', 'f']); // Schneekappe
  ellipse(g, 56, 38, 4, 6, ['m', 's', 'd']); // Arm
  outline(g);
  // zwei Bäumchen auf den Schultern
  for (const [tx, ty] of [[13, 30], [50, 31]]) {
    line(g, tx, ty, tx, ty - 4, 'o');
    dots(g, [[tx - 2, ty - 5, 'g'], [tx - 1, ty - 5, 'g'], [tx, ty - 5, 'G'], [tx + 1, ty - 5, 'g'], [tx + 2, ty - 5, 'g'],
      [tx - 1, ty - 6, 'g'], [tx, ty - 6, 'G'], [tx + 1, ty - 6, 'g'], [tx, ty - 7, 'G'], [tx - 1, ty - 4, 'l'], [tx + 1, ty - 4, 'l']]);
  }
  eye(g, 33, 26, 3, 4);
  eye(g, 41, 26, 3, 4);
  dots(g, [[35, 34, 'k'], [36, 35, 'k'], [37, 35, 'k'], [38, 35, 'k'], [39, 34, 'k'], [31, 32, 'R'], [45, 32, 'R']]);
  // glühende Ader in der Brust
  line(g, 30, 40, 34, 45, 'h');
  line(g, 34, 45, 31, 50, 'h');
  line(g, 34, 45, 38, 48, 'h');
  dots(g, [[34, 44, 'H'], [33, 45, 'H'], [35, 45, 'H'], [34, 46, 'H']]);
  dots(g, [[16, 44, 'd'], [17, 45, 'd'], [17, 46, 'd'], [46, 47, 'd'], [47, 48, 'd'], [24, 24, 'f'], [27, 20, 'm']]);
  return done(g);
}

function gezeitennix() {
  const g = canvas(64);
  poly(g, [[2, 30], [18, 34], [18, 48], [3, 52]], ['V', 'v', 'P']); // Wellenflosse am Schwanz
  poly(g, [[10, 34], [30, 27], [31, 31], [12, 39]], ['V', 'v', 'P']); // Rückenflosse
  ellipse(g, 26, 41, 14, 8, ['w', 'R', 'C']); // langer Körper
  ellipse(g, 43, 29, 14, 12, ['w', 'R', 'C']); // großer Kopf
  ellipse(g, 20, 50, 3.5, 3.5, ['R', 'R', 'C']); // Beine
  ellipse(g, 33, 50, 3.5, 3.5, ['R', 'R', 'C']);
  // Kiemen wie Wellen
  poly(g, [[36, 19], [24, 6], [29, 11], [25, 3], [39, 17]], ['p', 'C', 'e']);
  poly(g, [[34, 24], [18, 16], [24, 19], [18, 13], [35, 27]], ['p', 'C', 'e']);
  poly(g, [[34, 30], [19, 30], [24, 33], [20, 36], [35, 34]], ['p', 'C', 'e']);
  // Muschelkrone
  poly(g, [[38, 18], [42, 11], [46, 17], [50, 11], [53, 18]], ['Y', 'y', 'r']);
  outline(g);
  // Wellenlinien in der Schwanzflosse
  line(g, 4, 37, 16, 38, 'A');
  line(g, 4, 44, 16, 44, 'A');
  // Mondzeichen auf der Stirn
  dots(g, [[45, 21, 'H'], [44, 22, 'H'], [44, 23, 'H'], [45, 24, 'H'], [46, 22, 'Y']]);
  eye(g, 44, 27, 3, 3);
  eye(g, 51, 27, 3, 3);
  dots(g, [[46, 33, 'k'], [47, 34, 'k'], [48, 34, 'k'], [49, 34, 'k'], [50, 33, 'k'], [42, 32, 'p'], [54, 32, 'p'],
    [57, 11, 'A'], [58, 11, 'A'], [57, 10, 'w'], [52, 6, 'A'], [24, 39, 'w'], [30, 37, 'w'], [25, 3, 'A']]);
  return done(g);
}

function himmelsuhu() {
  const g = canvas(64);
  poly(g, [[2, 26], [20, 18], [24, 50], [1, 54]], ['n', 'd', 'P']); // weite Schwingen mit Sternenhimmel
  poly(g, [[62, 26], [44, 18], [40, 50], [63, 54]], ['n', 'd', 'P']);
  ellipse(g, 32, 38, 17, 18, ['w', 'f', 'm']); // Körper
  ellipse(g, 22, 14, 4, 6, ['v', 'P', 'n']); // Federohren
  ellipse(g, 42, 14, 4, 6, ['v', 'P', 'n']);
  ellipse(g, 34, 30, 12, 9, ['w', 'c', 'Y']); // Gesicht
  ellipse(g, 23, 59, 6, 3, ['w', 'f', 'm']); // Füße
  ellipse(g, 41, 59, 6, 3, ['w', 'f', 'm']);
  outline(g);
  // Sterne im Gefieder der Schwingen
  dots(g, [[6, 30, 'w'], [12, 26, 'H'], [9, 38, 'w'], [16, 33, 'H'], [6, 46, 'H'], [14, 44, 'w'], [19, 39, 'w'],
    [56, 30, 'w'], [51, 27, 'H'], [55, 38, 'w'], [48, 34, 'H'], [57, 46, 'H'], [50, 44, 'w'], [45, 40, 'w']]);
  for (const ex of [27, 37]) {
    dots(g, [[ex, 26, 'h'], [ex + 1, 26, 'h'], [ex + 2, 26, 'h'], [ex + 3, 26, 'h'], [ex, 27, 'h'], [ex, 28, 'h'], [ex, 29, 'h'],
      [ex + 3, 27, 'h'], [ex + 3, 28, 'h'], [ex + 3, 29, 'h'], [ex, 30, 'h'], [ex + 1, 30, 'h'], [ex + 2, 30, 'h'], [ex + 3, 30, 'h']]);
    dots(g, [[ex + 1, 27, 'w'], [ex + 2, 27, 'k'], [ex + 1, 28, 'k'], [ex + 2, 28, 'k'], [ex + 1, 29, 'k'], [ex + 2, 29, 'k']]);
  }
  dots(g, [[33, 33, 'r'], [34, 33, 'r'], [33, 34, 'o'], [34, 34, 'o'], [33, 35, 'o']]);
  dots(g, [[28, 44, 'm'], [33, 47, 'm'], [38, 44, 'm'], [30, 51, 'm'], [36, 51, 'm'], [19, 9, 'H'], [45, 9, 'H']]);
  return done(g);
}

function waldhueter() {
  const g = canvas(64);
  const leaves = [[9, 30, 4], [13, 23, 4], [20, 18, 4], [7, 38, 4], [8, 46, 3.8], [48, 22, 3.5]];
  for (const [x, y, r] of leaves) ellipse(g, x, y, r, r * 1.5, ['G', 'g', 'l']);
  ellipse(g, 29, 42, 21, 15, ['r', 'o', 'b']); // großer Körper
  ellipse(g, 46, 44, 9, 8, ['w', 'Y', 'y']); // Schnauze und Bauch
  ellipse(g, 21, 57, 5, 3, ['o', 'b', 'b']); // Füße
  ellipse(g, 38, 57, 5, 3, ['o', 'b', 'b']);
  // kleiner Baum auf dem Rücken: Stamm und Krone
  poly(g, [[28, 27], [32, 27], [33, 16], [27, 16]], ['o', 'b', 'b']);
  ellipse(g, 30, 10, 11, 8, ['G', 'g', 'l']);
  ellipse(g, 22, 14, 5, 4, ['G', 'g', 'l']);
  ellipse(g, 38, 14, 5, 4, ['G', 'g', 'l']);
  // Bart aus Moos
  ellipse(g, 48, 51, 6, 4, ['G', 'g', 'l']);
  outline(g);
  eye(g, 45, 37, 3, 3);
  dots(g, [[55, 43, 'k'], [54, 43, 'k'], [55, 44, 'k'], [43, 41, 'R'], [24, 7, 'H'], [33, 5, 'R'], [37, 11, 'R'], [27, 12, 'H'],
    [20, 34, 'b'], [25, 31, 'b'], [16, 43, 'b'], [27, 49, 'b'], [35, 35, 'o'], [46, 53, 'l'], [49, 54, 'l'], [51, 52, 'l']]);
  return done(g);
}

// ---------- Geheime Orte ----------

// Wurzelgeist: ein kleiner Geist aus Wurzeln mit einer Laternenblüte auf dem Kopf (Hohle Eiche).
function wurzelgeist() {
  const g = canvas(32);
  poly(g, [[8, 22], [12, 22], [10, 29], [5, 30]], ['o', 'b', 'b']); // Wurzelbeine
  poly(g, [[17, 22], [21, 22], [25, 30], [19, 29]], ['o', 'b', 'b']);
  poly(g, [[6, 17], [9, 16], [4, 23], [2, 22]], ['o', 'b', 'b']); // Wurzelarm
  ellipse(g, 15, 17, 9, 7, ['r', 'o', 'b']); // Körper aus Rinde
  ellipse(g, 17, 9, 1.5, 4, ['G', 'g', 'l']); // Stängel
  ellipse(g, 18, 5, 5, 3, ['w', 'H', 'h']); // Laternenblüte
  ellipse(g, 12, 11, 3, 2, ['G', 'g', 'l']); // Blatt
  outline(g);
  eye(g, 15, 15, 2, 3);
  eye(g, 20, 15, 2, 3);
  dots(g, [[17, 20, 'k'], [18, 21, 'k'], [19, 20, 'k'], [13, 19, 'R'], [22, 19, 'R'],
    [10, 15, 'b'], [11, 18, 'b'], [9, 20, 'g'], [16, 23, 'g'], [21, 23, 'b'],
    [17, 4, 'w'], [19, 3, 'w'], [15, 6, 'H'], [22, 6, 'H'], [24, 3, 'H'], [12, 3, 'H']]);
  return done(g);
}

// Prismalibelle: eine Libelle mit Flügeln aus Glas, die das Licht in Regenbogenfarben bricht (Glasturm).
function prismalibelle() {
  const g = canvas(32);
  ellipse(g, 10, 9, 8, 4, ['w', 'A', 'L']); // Vorderflügel oben
  ellipse(g, 9, 22, 8, 4, ['w', 'A', 'L']); // Vorderflügel unten
  ellipse(g, 7, 13, 6, 3, ['w', 'T', 'L']); // Hinterflügel
  ellipse(g, 7, 18, 6, 3, ['w', 'T', 'L']);
  poly(g, [[3, 15], [16, 14], [16, 17], [3, 17]], ['t', 'S', 'D']); // langer Hinterleib
  ellipse(g, 19, 15.5, 4, 3, ['T', 't', 'S']); // Brust
  ellipse(g, 25, 15.5, 4, 4, ['A', 'L', 'S']); // Kopf
  outline(g);
  eye(g, 25, 13, 3, 3);
  dots(g, [[28, 17, 'k'], [27, 18, 'k'],
    [6, 8, 'R'], [9, 7, 'H'], [12, 8, 'G'], [14, 10, 'V'], [5, 23, 'V'], [8, 21, 'H'], [11, 22, 'R'], [13, 23, 'G'],
    [4, 13, 'H'], [6, 12, 'V'], [4, 18, 'R'], [7, 19, 'G'], [8, 16, 'w'], [12, 15, 'T'], [18, 14, 'w']]);
  return done(g);
}

// Perlkrabbe: eine kleine Krabbe mit einem Panzer wie eine Perle (Gezeiteninsel).
function perlkrabbe() {
  const g = canvas(32);
  poly(g, [[7, 20], [10, 21], [6, 28], [4, 27]], ['C', 'e', 'e']); // Beine
  poly(g, [[10, 22], [13, 23], [11, 29], [9, 29]], ['C', 'e', 'e']);
  poly(g, [[19, 23], [22, 22], [24, 29], [22, 29]], ['C', 'e', 'e']);
  poly(g, [[22, 21], [25, 20], [29, 26], [27, 27]], ['C', 'e', 'e']);
  poly(g, [[8, 15], [11, 17], [10, 19], [7, 17]], ['C', 'e', 'e']); // Arme
  poly(g, [[24, 14], [21, 17], [22, 19], [25, 16]], ['C', 'e', 'e']);
  ellipse(g, 6, 11, 4, 3.5, ['p', 'C', 'e']); // Scheren
  ellipse(g, 26, 10, 4.5, 4, ['p', 'C', 'e']);
  ellipse(g, 16, 19, 9, 6.5, ['w', 'f', 'V']); // Perlenpanzer
  ellipse(g, 18.5, 11, 1, 2.5, ['C', 'C', 'e']); // Augenstiele
  ellipse(g, 21.5, 11, 1, 2.5, ['C', 'C', 'e']);
  outline(g);
  eye(g, 18, 8, 2, 3);
  eye(g, 21, 8, 2, 3);
  dots(g, [[5, 11, 'k'], [6, 11, 'k'], [26, 10, 'k'], [27, 10, 'k'], [28, 10, 'k'],
    [11, 16, 'w'], [12, 15, 'w'], [13, 15, 'A'], [17, 17, 'R'], [20, 18, 'A'], [14, 21, 'R'], [19, 22, 'm'],
    [17, 21, 'k'], [18, 22, 'k'], [19, 21, 'k']]);
  return done(g);
}

// Irrlichtfee: eine winzige Fee aus Licht mit einem leuchtenden Schweif (Irrlichtinsel).
function irrlichtfee() {
  const g = canvas(32);
  ellipse(g, 10, 9, 6, 4, ['w', 'A', 'L']); // Flügel oben
  ellipse(g, 9, 18, 5, 3, ['w', 'A', 'L']); // Flügel unten
  poly(g, [[3, 28], [11, 21], [14, 24], [6, 30]], ['H', 'h', 'r']); // Lichtschweif
  ellipse(g, 17, 19, 5.5, 6, ['w', 'H', 'h']); // leuchtender Körper
  ellipse(g, 21, 11, 5, 5, ['w', 'H', 'h']); // Kopf
  ellipse(g, 23, 4, 1.5, 2.5, ['T', 'g', 'l']); // Blatt auf dem Kopf
  outline(g);
  eye(g, 22, 10, 2, 3);
  dots(g, [[25, 14, 'k'], [24, 14, 'k'], [20, 13, 'R'], [25, 12, 'R'],
    [7, 7, 'w'], [12, 6, 'w'], [8, 17, 'w'], [15, 16, 'w'], [16, 22, 'h'],
    [1, 25, 'H'], [2, 31, 'H'], [8, 31, 'h'], [0, 29, 'h'], [27, 2, 'H'], [29, 7, 'H']]);
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

// ---------- Gebiet 6: Uhrwerkruinen (Messing, Kupfer, grünlicher Stein) ----------

// Zähne rund um ein Zahnrad (für Ohren und kleine Räder)
function gearTeeth(g, cx, cy, r, n, ch) {
  for (let i = 0; i < n; i++) {
    const a = (i * Math.PI * 2) / n;
    put(g, Math.round(cx - 0.5 + Math.cos(a) * (r + 0.9)), Math.round(cy - 0.5 + Math.sin(a) * (r + 0.9)), ch);
  }
}

// Aufziehschlüssel: Schaft und zwei runde Griffe
function windKey(g, x, y, s) {
  ellipse(g, x, y + 2 * s, 0.8 * s, 2.2 * s, ['H', 'h', 'r']);
  ellipse(g, x - 2 * s, y - 0.5 * s, 1.8 * s, 1.8 * s, ['H', 'h', 'r']);
  ellipse(g, x + 2 * s, y - 0.5 * s, 1.8 * s, 1.8 * s, ['H', 'h', 'r']);
}

function zahnmaus() {
  const g = canvas(32);
  poly(g, [[9, 23], [2, 19], [2, 17], [10, 21]], ['p', 'r', 'o']); // Schwanz
  ellipse(g, 12, 28, 2.5, 1.5, ['m', 's', 'd']); // Füße
  ellipse(g, 20, 28, 2.5, 1.5, ['m', 's', 'd']);
  windKey(g, 10, 11, 1);
  ellipse(g, 15, 21, 8, 6.5, ['f', 'm', 's']); // Körper
  ellipse(g, 17, 23, 4, 3, ['w', 'f', 'm']); // Bauch
  ellipse(g, 19, 10, 3, 3, ['H', 'h', 'r']); // Zahnrad-Ohren
  ellipse(g, 27, 9, 2.6, 2.6, ['H', 'h', 'r']);
  gearTeeth(g, 19, 10, 3, 6, 'h');
  gearTeeth(g, 27, 9, 2.6, 6, 'h');
  ellipse(g, 23, 17, 5.5, 5, ['f', 'm', 's']); // Kopf
  poly(g, [[26, 15], [31, 19], [26, 21]], ['f', 'm', 's']); // Schnauze
  outline(g);
  dots(g, [[18, 9, 'b'], [26, 8, 'b'], [30, 19, 'R'], [27, 21, 'd'], [28, 22, 'd'], [12, 19, 's'], [10, 22, 's']]);
  eye(g, 24, 15, 2, 2);
  return done(g);
}

// Uhrwerkmaus: größer, mit Zifferblatt auf dem Bauch und großem Schlüssel
function uhrwerkmaus() {
  const g = canvas(40);
  poly(g, [[11, 30], [2, 24], [3, 21], [12, 27]], ['p', 'r', 'o']);
  ellipse(g, 3, 22, 2, 2, ['H', 'h', 'r']); // kleines Rad an der Schwanzspitze
  ellipse(g, 15, 36, 3, 2, ['m', 's', 'd']);
  ellipse(g, 25, 36, 3, 2, ['m', 's', 'd']);
  windKey(g, 11, 13, 1.4);
  ellipse(g, 19, 27, 10, 8.5, ['f', 'm', 's']);
  ellipse(g, 21, 29, 5, 5, ['w', 'c', 'Y']); // Zifferblatt
  ellipse(g, 25, 12, 5, 5, ['H', 'h', 'r']);
  ellipse(g, 33, 12, 4, 4, ['H', 'h', 'r']);
  gearTeeth(g, 25, 12, 5, 8, 'h');
  gearTeeth(g, 33, 12, 4, 7, 'h');
  ellipse(g, 29, 21, 6.5, 6, ['f', 'm', 's']);
  poly(g, [[33, 19], [39, 23], [33, 26]], ['f', 'm', 's']);
  outline(g);
  dots(g, [[25, 12, 'b'], [24, 12, 'b'], [33, 12, 'b'], [38, 23, 'R'], [34, 26, 'd'], [35, 27, 'd'],
    [20, 25, 'h'], [25, 29, 'h'], [20, 33, 'h'], [16, 29, 'h'], // Ziffern
    [20, 29, 'k'], [20, 28, 'k'], [20, 27, 'k'], [21, 29, 'k'], [22, 29, 'k'], [13, 24, 's'], [11, 28, 's']]);
  eye(g, 30, 19, 2, 3);
  return done(g);
}

function dampfkobold() {
  const g = canvas(32);
  ellipse(g, 11, 29, 2.5, 1.5, ['r', 'o', 'b']); // Füße
  ellipse(g, 19, 29, 2.5, 1.5, ['r', 'o', 'b']);
  ellipse(g, 5, 20, 3, 4, ['r', 'o', 'b']); // Henkel
  ellipse(g, 5, 20, 1.2, 2.2, ['.', '.', '.']);
  poly(g, [[21, 22], [29, 15], [31, 17], [24, 25]], ['p', 'r', 'o']); // Tülle
  ellipse(g, 15, 21, 9, 7.5, ['p', 'r', 'o']); // Kesselkörper
  ellipse(g, 15, 13, 6, 2, ['p', 'r', 'o']); // Deckelhut
  ellipse(g, 15, 10, 1.5, 1.5, ['H', 'h', 'r']); // Knauf
  outline(g);
  for (let x = 7; x <= 23; x++) if (g[24][x] !== 'k' && g[24][x] !== '.') g[24][x] = 'o'; // Naht
  dots(g, [[9, 17, 'b'], [21, 17, 'b'], [9, 23, 'h'], [12, 25, 'h'], [18, 25, 'h'], [12, 20, 'R'], [21, 20, 'R'],
    [14, 6, 'f'], [15, 5, 'w'], [16, 6, 'f'], [17, 4, 'f'], [18, 3, 'w'], [13, 4, 'w'], [12, 3, 'f'], [30, 14, 'f'], [31, 13, 'w']]); // Dampf
  eye(g, 14, 18, 2, 2);
  eye(g, 18, 18, 2, 2);
  dots(g, [[16, 21, 'k'], [17, 21, 'k']]);
  return done(g);
}

function messingeule() {
  const g = canvas(32);
  poly(g, [[8, 10], [8, 3], [13, 9]], ['H', 'h', 'r']); // Federohren
  poly(g, [[19, 9], [23, 3], [24, 10]], ['H', 'h', 'r']);
  ellipse(g, 13, 30, 2, 1, ['r', 'o', 'b']); // Füße
  ellipse(g, 19, 30, 2, 1, ['r', 'o', 'b']);
  ellipse(g, 16, 19, 9, 10, ['H', 'h', 'r']); // Körper
  ellipse(g, 11, 21, 4.5, 7, ['h', 'r', 'o']); // Flügel
  ellipse(g, 18, 23, 4, 5, ['c', 'Y', 'y']); // Brustplatte
  outline(g);
  // Augen wie Lupen
  for (const [cx, cy] of [[14, 13], [20, 13]]) {
    ellipse(g, cx, cy, 3.4, 3.4, ['k', 'k', 'k']);
    ellipse(g, cx, cy, 2.4, 2.4, ['w', 'A', 'L']);
    dots(g, [[cx, cy, 'k'], [cx - 1, cy, 'k'], [cx, cy - 1, 'k'], [cx - 1, cy - 1, 'k'], [cx - 2, cy - 2, 'w']]);
  }
  dots(g, [[17, 16, 'H'], [16, 16, 'H'], [16, 17, 'r'], [17, 17, 'r'], [16, 18, 'r'], // Schnabel
    [9, 18, 'b'], [10, 22, 'b'], [11, 26, 'b'], [17, 21, 'r'], [19, 23, 'r'], [17, 25, 'r'], [19, 27, 'r']]); // Nieten und Federn
  return done(g);
}

// ---------- Gebiet 7: Nordlichtsee (Weiß, Eisblau, Tannengrün, Nordlicht) ----------

function frostrobbe() {
  const g = canvas(32);
  ellipse(g, 4, 24, 3, 2, ['f', 'm', 's']); // Schwanzflossen
  ellipse(g, 5, 28, 3, 1.5, ['f', 'm', 's']);
  ellipse(g, 14, 24, 11, 5.5, ['w', 'f', 'm']); // Körper
  ellipse(g, 23, 17, 5.5, 5, ['w', 'f', 'm']); // Kopf
  poly(g, [[16, 26], [22, 30], [14, 30]], ['f', 'm', 's']); // Vorderflosse
  outline(g, 'S');
  dots(g, [[28, 18, 'k'], [26, 20, 'm'], [27, 21, 'm'], [25, 21, 'm'], [9, 22, 'A'], [13, 21, 'A'], [17, 22, 'A'], [11, 25, 'A'], [6, 24, 'A']]);
  eye(g, 24, 15, 2, 3);
  return done(g);
}

// Gletscherrobbe: größer, mit Eiskristallen auf dem Rücken
function gletscherrobbe() {
  const g = canvas(40);
  ellipse(g, 5, 30, 3.5, 2.5, ['f', 'm', 's']);
  ellipse(g, 6, 35, 3.5, 2, ['f', 'm', 's']);
  poly(g, [[8, 27], [10, 17], [14, 26]], ['w', 'A', 'L']); // Eiskristalle
  poly(g, [[13, 26], [17, 12], [21, 25]], ['w', 'A', 'L']);
  poly(g, [[20, 25], [23, 17], [25, 25]], ['w', 'A', 'L']);
  ellipse(g, 18, 30, 14, 7, ['w', 'f', 'm']);
  ellipse(g, 30, 21, 7, 6, ['w', 'f', 'm']);
  poly(g, [[21, 33], [28, 38], [19, 38]], ['f', 'm', 's']);
  outline(g, 'S');
  dots(g, [[36, 22, 'k'], [37, 22, 'k'], [33, 25, 'm'], [34, 26, 'm'], [32, 26, 'm'], [11, 29, 'A'], [16, 28, 'A'], [21, 30, 'A'], [13, 33, 'A'],
    [8, 30, 'A'], [16, 15, 'w'], [9, 19, 'w'], [22, 19, 'w']]);
  eye(g, 31, 19, 2, 3);
  return done(g);
}

function flockenhase() {
  const g = canvas(32);
  ellipse(g, 12, 28, 5, 2, ['w', 'f', 'm']); // Hinterpfote
  ellipse(g, 5, 22, 2.5, 2.5, ['w', 'w', 'f']); // Stummelschwanz
  ellipse(g, 14, 22, 8, 6.5, ['w', 'f', 'm']); // Körper
  poly(g, [[17, 12], [16, 2], [19, 1], [20, 12]], ['w', 'f', 'm']); // lange Ohren
  poly(g, [[21, 12], [22, 1], [25, 2], [24, 12]], ['w', 'f', 'm']);
  ellipse(g, 22, 15, 5, 4.5, ['w', 'f', 'm']); // Kopf
  ellipse(g, 21, 28, 2, 1.5, ['w', 'f', 'm']); // Vorderpfote
  outline(g, 'S');
  dots(g, [[18, 4, 'R'], [18, 5, 'R'], [18, 6, 'R'], [23, 3, 'R'], [23, 4, 'R'], [23, 5, 'R'], [26, 16, 'R'],
    [21, 11, 'L'], [20, 11, 'A'], [22, 11, 'A'], [21, 10, 'A'], [21, 12, 'A'], // Schneeflocke
    [10, 20, 'f'], [13, 18, 'f'], [16, 24, 'f']]);
  eye(g, 23, 13, 2, 2);
  return done(g);
}

function aurorafink() {
  const g = canvas(32);
  poly(g, [[10, 21], [0, 30], [3, 30], [12, 23]], ['V', 'v', 'P']); // Schwanzfedern in Nordlichtfarben
  poly(g, [[10, 20], [1, 25], [2, 27], [11, 22]], ['T', 'g', 'l']);
  poly(g, [[11, 19], [2, 21], [2, 23], [11, 21]], ['A', 'L', 'S']);
  poly(g, [[19, 10], [18, 5], [22, 9]], ['V', 'v', 'P']); // Schopf
  ellipse(g, 16, 19, 7, 6, ['T', 't', 'F']); // Körper
  ellipse(g, 18, 22, 3.5, 3, ['w', 'c', 'Y']); // Bauch
  ellipse(g, 13, 18, 4.5, 3.5, ['V', 'v', 'P']); // Flügel
  ellipse(g, 22, 13, 4.5, 4.5, ['T', 't', 'F']); // Kopf
  poly(g, [[25, 12], [29, 14], [25, 15]], ['H', 'h', 'r']); // Schnabel
  outline(g);
  dots(g, [[15, 26, 'h'], [15, 27, 'h'], [18, 26, 'h'], [18, 27, 'h'], [11, 17, 'V'], [14, 19, 'P'], [4, 24, 'T'], [3, 28, 'V']]);
  eye(g, 23, 11, 2, 2);
  return done(g);
}

// ---------- Gebiet 8: Sternenwiese (Nachtblau, Sternengold, dunkles Wiesengrün) ----------

// Fünfzackiger Stern als Punktliste
function starPoints(cx, cy, R, r) {
  return Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const d = i % 2 ? r : R;
    return [cx + Math.cos(a) * d, cy + Math.sin(a) * d];
  });
}

function schnuppling() {
  const g = canvas(32);
  poly(g, [[13, 15], [1, 22], [3, 27], [15, 21]], ['V', 'v', 'P']); // Schweif
  poly(g, [[14, 16], [4, 22], [5, 24], [15, 20]], ['w', 'V', 'v']);
  poly(g, starPoints(19, 15, 11.5, 5.5), ['H', 'h', 'r']); // Sternkörper
  outline(g);
  dots(g, [[19, 17, 'k'], [20, 18, 'k'], [21, 18, 'k'], [22, 17, 'k'], [16, 16, 'R'], [25, 16, 'R'],
    [5, 26, 'H'], [8, 25, 'w'], [2, 20, 'H'], [10, 27, 'H']]); // Mund, Wangen, Sternenstaub
  eye(g, 18, 13, 2, 2);
  eye(g, 22, 13, 2, 2);
  return done(g);
}

// Kometling: runder Kometenkopf mit langem, wehendem Schweif
function kometling() {
  const g = canvas(40);
  poly(g, [[18, 17], [1, 30], [3, 36], [20, 27]], ['V', 'v', 'P']);
  poly(g, [[18, 20], [4, 30], [6, 33], [19, 25]], ['A', 'L', 'S']);
  poly(g, [[19, 21], [8, 28], [9, 30], [20, 24]], ['w', 'f', 'A']);
  poly(g, [[24, 10], [26, 3], [29, 10]], ['H', 'h', 'r']); // Zacken
  poly(g, [[30, 11], [35, 6], [34, 13]], ['H', 'h', 'r']);
  poly(g, [[33, 16], [39, 15], [34, 20]], ['H', 'h', 'r']);
  ellipse(g, 26, 20, 10, 10, ['H', 'h', 'r']);
  outline(g);
  dots(g, [[27, 24, 'k'], [28, 25, 'k'], [29, 25, 'k'], [30, 24, 'k'], [23, 23, 'R'], [34, 22, 'R'], [21, 15, 'w'], [20, 16, 'w'],
    [6, 34, 'H'], [10, 31, 'w'], [3, 31, 'H'], [13, 29, 'H'], [15, 25, 'w']]);
  eye(g, 26, 18, 2, 3);
  eye(g, 31, 18, 2, 3);
  return done(g);
}

function nachtschaf() {
  const g = canvas(32);
  for (const x of [10, 14, 19, 23]) ellipse(g, x, 28, 1.2, 2.5, ['d', 'n', 'n']); // Beine
  ellipse(g, 15, 21, 10, 6.5, ['V', 'm', 's']); // Wollkörper
  for (const [x, y, r] of [[8, 14, 3.8], [14, 12, 4.2], [20, 13.5, 3.8], [5, 20, 3.5]]) ellipse(g, x, y, r, r, ['V', 'V', 'm']); // Wollbäusche
  ellipse(g, 23, 14, 2.5, 1.5, ['s', 'd', 'n']); // Ohr
  ellipse(g, 25, 18, 4.5, 4.5, ['m', 's', 'd']); // Gesicht
  ellipse(g, 25, 13, 3, 2, ['V', 'm', 's']); // Wolllocke
  outline(g);
  dots(g, [[26, 17, 'w'], [27, 17, 'k'], [26, 18, 'w'], [27, 18, 'k'], [29, 20, 'm'], [27, 21, 's'],
    [9, 15, 'H'], [14, 12, 'H'], [19, 19, 'H'], [11, 22, 'H'], [21, 14, 'H'], [6, 20, 'h'], [16, 24, 'h']]); // Sterne in der Wolle
  return done(g);
}

function sternhirsch() {
  const g = canvas(32);
  for (const x of [10, 13, 19, 22]) ellipse(g, x, 27, 1.2, 3.5, ['v', 'P', 'n']); // Beine
  ellipse(g, 7, 17, 1.5, 2, ['w', 'f', 'm']); // Schwanz
  ellipse(g, 15, 20, 8, 5, ['V', 'v', 'P']); // Körper
  poly(g, [[19, 19], [22, 10], [26, 12], [23, 21]], ['V', 'v', 'P']); // Hals
  ellipse(g, 25, 11, 3.5, 3, ['V', 'v', 'P']); // Kopf
  poly(g, [[26, 10], [31, 12], [27, 14]], ['V', 'v', 'P']); // Schnauze
  // Geweih aus Sternenlicht: vor dem Umriss, damit es einen dunklen Rand bekommt
  dots(g, [[23, 8, 'h'], [23, 7, 'H'], [22, 6, 'H'], [22, 5, 'h'], [21, 4, 'H'], [20, 3, 'w'], [23, 5, 'H'], [24, 4, 'H'], [25, 3, 'w'],
    [26, 8, 'h'], [26, 7, 'H'], [27, 6, 'H'], [28, 5, 'h'], [29, 4, 'H'], [30, 3, 'w'], [27, 4, 'H'], [27, 3, 'w']]);
  outline(g);
  dots(g, [[30, 12, 'k'], [11, 18, 'w'], [14, 17, 'w'], [17, 18, 'w'], [12, 21, 'w']]);
  eye(g, 24, 10, 2, 2);
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
  zahnmaus: { 1: zahnmaus(), 2: uhrwerkmaus() },
  dampfkobold: { 1: dampfkobold() },
  messingeule: { 1: messingeule() },
  frostrobbe: { 1: frostrobbe(), 2: gletscherrobbe() },
  flockenhase: { 1: flockenhase() },
  aurorafink: { 1: aurorafink() },
  schnuppling: { 1: schnuppling(), 2: kometling() },
  nachtschaf: { 1: nachtschaf() },
  sternhirsch: { 1: sternhirsch() },
  moosling: { 1: moosling() },
  eichhuscher: { 1: eichhuscher1(), 2: eichhuscher2() },
  rindenwicht: { 1: rindenwicht() },
  funki: { 1: funki(), 2: funkelflug(), 3: laternenfalter(), 4: nordlichtfalter() },
  kiesel: { 1: kiesel(), 2: findling(), 3: felsenwaechter(), 4: bergherz() },
  nixi: { 1: nixi(), 2: quellnix(), 3: strudelnix(), 4: gezeitennix() },
  flausch: { 1: flausch(), 2: wolkenkauz(), 3: sturmeule(), 4: himmelsuhu() },
  pieks: { 1: pieks(), 2: dornigel(), 3: bluetenigel(), 4: waldhueter() },
  gischtling: { 1: gischtling() },
  haeuschel: { 1: haeuschel1(), 2: haeuschel2() },
  glimmqualle: { 1: glimmqualle() },
  wurzelgeist: { 1: wurzelgeist() },
  prismalibelle: { 1: prismalibelle() },
  perlkrabbe: { 1: perlkrabbe() },
  irrlichtfee: { 1: irrlichtfee() },
};

// Höchste vorhandene Stufe ≤ der gewünschten: Wilde Arten haben ein oder zwei Stufen.
export function creatureRows(speciesId, stage) {
  const art = CREATURE_ART[speciesId];
  for (let s = stage; s >= 1; s--) if (art?.[s]) return art[s];
  return null;
}
