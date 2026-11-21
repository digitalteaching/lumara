// Zeichnungen der Spielaufgaben, die keine Kartenobjekte sind (Lumara 1.2, Spec 6.6): das Irrlicht im
// Moor, Pfotenspuren im Schnee, die Schleuse in den Ruinen und der Schein heller Steine auf der
// Sternenwiese. Nur Farben aus js/gfx/palette.js, Durchsichtigkeit über globalAlpha. Die Szene
// (js/scenes/taskEvents.js) entscheidet, wann und wo.

const INK = '#1b1a2e';
const NIGHT = '#2b2d4a';
const DUSK = '#46496e';
const SLATE = '#6b6f94';
const MIST = '#a3a7c4';
const WHITE = '#fffaf0';
const BARK = '#4a3328';
const WOOD = '#7a5236';
const FRAME = '#a8743a';
const MINT = '#b5e3c4';
const TEAL = '#3f8f86';
const DEEP = '#1f3f66';
const SEA = '#2f6f9c';
const FOAM = '#a7dde8';
const LAMP = '#ffe08a';

// Ein kleines Irrlicht: weicher Schein, mintgrüner Körper mit hellem Kern, zwei Augen und eine kleine
// Flamme obendrauf. Schlafend leuchtet es schwächer und hat die Augen zu. (x, y): Mitte auf dem Schirm.
export function drawWisp(ctx, x, y, resting) {
  ctx.fillStyle = MINT;
  ctx.globalAlpha = resting ? 0.18 : 0.28;
  ctx.fillRect(x - 5, y - 3, 11, 7);
  ctx.fillRect(x - 3, y - 5, 7, 11);
  ctx.globalAlpha = resting ? 0.75 : 1;
  ctx.fillRect(x - 1, y - 3, 3, 1);
  ctx.fillRect(x - 2, y - 2, 5, 4);
  ctx.fillRect(x - 1, y + 2, 3, 1);
  ctx.fillRect(x, y - 4, 1, 1); // Flamme
  ctx.fillStyle = FOAM;
  ctx.fillRect(x + 1, y - 5, 1, 1);
  ctx.fillStyle = WHITE;
  ctx.fillRect(x - 1, y - 2, 2, 1);
  ctx.fillStyle = INK;
  if (resting) {
    ctx.fillRect(x - 1, y, 1, 1);
    ctx.fillRect(x + 1, y, 1, 1);
  } else {
    ctx.fillRect(x - 1, y - 1, 1, 2);
    ctx.fillRect(x + 1, y - 1, 1, 2);
  }
  ctx.globalAlpha = 1;
}

// Eine Hasenspur als Dellen im Schnee, Mitte (x, y), in Laufrichtung dir (0 oben, 1 rechts, 2 unten,
// 3 links): vorn zwei lange Hinterpfoten, dahinter zwei kleine Vorderpfoten. side verschiebt sie ein
// wenig zur Seite, damit eine Spur nicht wie mit dem Lineal gezogen aussieht.
// Je Pfote: [vorn, seitlich, Länge, Breite] in Pixeln, gedacht für den Lauf nach rechts.
const PAWS = [[1, -3, 4, 2], [1, 2, 4, 2], [-4, -2, 2, 1], [-4, 1, 2, 1]];
export function drawPaw(ctx, x, y, dir, { alpha = 1, side = 0 } = {}) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = SLATE;
  for (const [f, s, len, wide] of PAWS) {
    // ein Rechteck vorn f … f + len − 1, seitlich s … s + wide − 1, gedreht in die Laufrichtung
    const a = { f, s: s + side }, b = { f: f + len - 1, s: s + side + wide - 1 };
    const turn = ({ f: ff, s: ss }) => [[ss, -ff], [ff, ss], [-ss, ff], [-ff, -ss]][dir];
    const [x1, y1] = turn(a), [x2, y2] = turn(b);
    ctx.fillRect(x + Math.min(x1, x2), y + Math.min(y1, y2), Math.abs(x2 - x1) + 1, Math.abs(y2 - y1) + 1);
  }
  ctx.globalAlpha = 1;
}

// Die Schleuse in den Ruinen: ein Holztor zwischen zwei Steinpfosten am oberen Rand des Kanalstücks
// (x, y: linke obere Ecke auf dem Schirm, w × h Felder). drained 0 … 1: wie weit das Wasser dahinter
// gesunken ist; 1 heißt leer, dann liegt der nasse Steingrund frei.
export function drawChamber(ctx, x, y, { w, h }, drained) {
  const W = w * 16, H = h * 16;
  if (drained >= 1) {
    ctx.fillStyle = DUSK;
    ctx.fillRect(x, y + 4, W, H - 4);
    ctx.fillStyle = SLATE; // Fugen der Steine am Grund
    for (let row = 0; y + 8 + row * 6 < y + H; row++) {
      for (let col = row % 2 ? 3 : 0; col < W; col += 8) ctx.fillRect(x + col, y + 8 + row * 6, 6, 1);
    }
    ctx.fillStyle = NIGHT; // nasse Ränder an den Mauern
    ctx.fillRect(x, y + 4, 1, H - 4);
    ctx.fillRect(x + W - 1, y + 4, 1, H - 4);
    ctx.fillStyle = DEEP; // Pfützen
    ctx.fillRect(x + 5, y + 18, 7, 3);
    ctx.fillRect(x + 19, y + 33, 8, 3);
    ctx.fillStyle = SEA;
    ctx.fillRect(x + 6, y + 18, 3, 1);
    ctx.fillRect(x + 20, y + 33, 3, 1);
    ctx.fillStyle = TEAL; // Algen
    for (const [ax, ay] of [[2, 10], [27, 14], [3, 29], [28, 40], [14, 44]]) ctx.fillRect(x + ax, y + ay, 2, 1);
  } else if (drained > 0) {
    const band = Math.round(drained * 14);
    ctx.fillStyle = DUSK; // nasse Mauer über dem Wasser
    ctx.fillRect(x, y + 4, W, band);
    ctx.fillStyle = TEAL; // Algenrand an der Wasserlinie
    ctx.fillRect(x, y + 3 + band, W, 1);
  }
  // Tor: Rahmen, Bretter, Pfosten
  ctx.fillStyle = INK;
  ctx.fillRect(x, y, W, 5);
  ctx.fillStyle = WOOD;
  ctx.fillRect(x + 1, y + 1, W - 2, 3);
  ctx.fillStyle = FRAME;
  ctx.fillRect(x + 1, y + 1, W - 2, 1);
  ctx.fillStyle = BARK;
  for (let px = 6; px < W - 2; px += 6) ctx.fillRect(x + px, y + 1, 1, 3);
  for (const px of [-1, W - 2]) {
    ctx.fillStyle = INK;
    ctx.fillRect(x + px, y - 3, 3, 9);
    ctx.fillStyle = MIST;
    ctx.fillRect(x + px + 1, y - 2, 1, 7);
  }
}

// Der Schein um einen hellen Stein der Sternenwiese (x, y: linke obere Ecke des Felds), flach wie der
// Stein selbst: ein breites Oval auf dem Boden. Mit ms > 0 atmet er langsam (unter 1 Hz), sonst
// leuchtet er ruhig.
export function drawPlateGlow(ctx, x, y, ms = 0) {
  ctx.fillStyle = LAMP;
  ctx.globalAlpha = ms ? 0.3 + 0.1 * Math.sin(ms / 600) : 0.35;
  ctx.fillRect(x - 3, y + 7, 22, 5);
  ctx.fillRect(x - 1, y + 5, 18, 9);
  ctx.fillRect(x + 3, y + 3, 10, 13);
  ctx.globalAlpha = 1;
}
