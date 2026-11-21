// Vertrauensring und Herz beim Befreunden (Lumara 1.2, Spec 6.1), im Pixel-Stil der Arena.
// Der Ring hat drei Bögen um die Mitte des Wesens; ein neues Feld füllt sich in 250 ms. Ist der
// Ring voll, steigt ein Herz auf. Bei „Bewegung reduzieren“ erscheint beides ohne Animation.
// DOM-frei: Gezeichnet wird in den übergebenen Canvas-Kontext, nur mit Farben der Palette.

export const RING = { r: 22, width: 2, segDeg: 120, gapDeg: 12, fillMs: 250 };
const EMPTY = '#46496e'; // dusk
const FULL = '#ffe08a'; // lamp

export const HEART = { riseMs: 1200, stillMs: 1000, rise: 20 };
// Pixel-Herz mit Rand: o Rand (ember), c Herz (coral), w Glanz (white)
const HEART_ROWS = [
  '.ooo.ooo.',
  'occcoccco',
  'owcccccco',
  'occccccco',
  '.occccco.',
  '..occco..',
  '...oco...',
  '....o....',
];
const HEART_COLORS = { o: '#b8412f', c: '#e0705a', w: '#fffaf0' };

// Die Bögen in Grad wie im Canvas (0° rechts, im Uhrzeigersinn). Der erste beginnt oben, jeder ist
// 120° lang, davon 12° Lücke (je 6° an beiden Enden).
export function ringArcs(n = 3) {
  const half = RING.gapDeg / 2;
  return Array.from({ length: n }, (_, i) => {
    const from = -90 + i * RING.segDeg + half;
    return { from, to: from + RING.segDeg - RING.gapDeg };
  });
}

// Wie weit Feld i gefüllt ist (0 bis 1). ring = { filled, since: [Startzeit je Feld] }.
export function ringFill(ring, i, t, reducedMotion) {
  if (i >= ring.filled) return 0;
  if (reducedMotion) return 1;
  return Math.max(0, Math.min(1, (t - (ring.since[i] ?? -Infinity)) / RING.fillMs));
}

export const heartMs = reducedMotion => (reducedMotion ? HEART.stillMs : HEART.riseMs);

// Lage des Herzens elapsed ms nach dem Start: { dy, alpha }, danach null. Es steigt gleichmäßig
// und verblasst in der zweiten Hälfte; bei „Bewegung reduzieren“ steht es still und voll da.
export function heartPose(elapsed, reducedMotion) {
  if (elapsed < 0 || elapsed >= heartMs(reducedMotion)) return null;
  if (reducedMotion) return { dy: 0, alpha: 1 };
  const p = elapsed / HEART.riseMs;
  const up = Math.round(HEART.rise * p);
  return { dy: up ? -up : 0, alpha: p < 0.5 ? 1 : (1 - p) * 2 };
}

// Ring um (cx, cy): zwei Pixel breit (Radius r - 1 und r), Schritt 1°, damit keine Lücken bleiben.
export function drawTrustRing(ctx, ring, cx, cy, t, reducedMotion) {
  ringArcs().forEach((arc, i) => {
    const span = arc.to - arc.from;
    // Grad 0 bis span sind span + 1 Schritte; lit davon sind hell (0: alles dunkel, span + 1: alles hell).
    const lit = Math.round((span + 1) * ringFill(ring, i, t, reducedMotion));
    for (const [color, a, b] of [[FULL, 0, lit - 1], [EMPTY, lit, span]]) {
      if (b < a) continue;
      ctx.fillStyle = color;
      for (let d = a; d <= b; d++) {
        const rad = ((arc.from + d) * Math.PI) / 180;
        for (let r = RING.r - RING.width + 1; r <= RING.r; r++) {
          ctx.fillRect(Math.round(cx + Math.cos(rad) * r), Math.round(cy + Math.sin(rad) * r), 1, 1);
        }
      }
    }
  });
}

// Herz mit der Mitte bei (cx, cy).
export function drawHeart(ctx, cx, cy, alpha) {
  const x0 = Math.round(cx - HEART_ROWS[0].length / 2);
  const y0 = Math.round(cy - HEART_ROWS.length / 2);
  ctx.globalAlpha = alpha;
  for (const [ch, color] of Object.entries(HEART_COLORS)) {
    ctx.fillStyle = color;
    HEART_ROWS.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) if (row[x] === ch) ctx.fillRect(x0 + x, y0 + y, 1, 1);
    });
  }
  ctx.globalAlpha = 1;
}
