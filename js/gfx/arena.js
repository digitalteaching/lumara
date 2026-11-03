// Duell-Hintergrund der Leuchtturmbucht: Himmel, Meer, Sand und zwei Plattformen.

export const ARENA = {
  own: { x: 56, y: 80 }, // Mitte der eigenen Plattform (Füße), über dem Antwort-Panel
  foe: { x: 184, y: 55 },
};

function oval(ctx, cx, cy, rx, ry, fill, rim) {
  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 1, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx - 1, ry - 1, 0, 0, Math.PI * 2);
  ctx.fill();
}

// Waldlichtung: Stämme im Hintergrund, Blätterdach, Waldboden mit Lichtflecken, Plattformen aus Moos.
function drawForestArena(ctx, t = 0, reducedMotion = false) {
  ctx.fillStyle = '#24493d';
  ctx.fillRect(0, 0, 240, 56);
  // Stämme
  for (const [x, w] of [[8, 10], [40, 14], [78, 9], [112, 12], [150, 10], [190, 16], [226, 10]]) {
    ctx.fillStyle = '#4a3328';
    ctx.fillRect(x, 0, w, 56);
    ctx.fillStyle = '#7a5236';
    ctx.fillRect(x + 2, 0, 2, 56);
  }
  // Blätterdach
  ctx.fillStyle = '#3d7a55';
  for (let x = -10; x < 250; x += 22) {
    ctx.beginPath();
    ctx.ellipse(x, 6 + ((x / 22) % 2) * 4, 18, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#6aa55c';
  for (let x = 4; x < 250; x += 37) ctx.fillRect(x, 10, 6, 2);
  // Waldboden
  ctx.fillStyle = '#3d7a55';
  ctx.fillRect(0, 50, 240, 110);
  ctx.fillStyle = '#24493d';
  for (let i = 0; i < 70; i++) ctx.fillRect((i * 53) % 240, 52 + ((i * 29) % 106), 2, 1);
  // Lichtflecken, die langsam atmen (still bei „Bewegung reduzieren“)
  const a = reducedMotion ? 0.18 : 0.14 + 0.06 * Math.sin(t / 1400);
  ctx.fillStyle = `rgba(255, 224, 138, ${a})`;
  for (const [x, y, rx, ry] of [[100, 70, 22, 6], [30, 120, 18, 5], [200, 105, 20, 6]]) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  oval(ctx, ARENA.foe.x, ARENA.foe.y, 30, 6, '#6aa55c', '#24493d');
  oval(ctx, ARENA.own.x, ARENA.own.y, 34, 7, '#6aa55c', '#24493d');
}

// Hintergrund passend zum Gebiet (Design 7.1). Gebiete ohne eigene Arena nehmen die Bucht.
const ARENAS = { 2: drawForestArena };
export function drawArena(ctx, area, t = 0, reducedMotion = false) {
  (ARENAS[area] ?? drawBayArena)(ctx, t, reducedMotion);
}

export function drawBayArena(ctx, t = 0) {
  const sky = ctx.createLinearGradient(0, 0, 0, 40);
  sky.addColorStop(0, '#4fa3c4');
  sky.addColorStop(1, '#a7dde8');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 240, 40);
  ctx.fillStyle = '#f3ecd2';
  for (const [x, y, w] of [[26, 12, 26], [150, 18, 34], [96, 7, 18]]) {
    const dx = Math.floor(t / 400) % 240;
    const xx = ((x + dx) % 280) - 20;
    ctx.fillRect(xx, y, w, 4);
    ctx.fillRect(xx + 4, y - 3, w - 10, 3);
  }
  ctx.fillStyle = '#2f6f9c';
  ctx.fillRect(0, 36, 240, 14);
  ctx.fillStyle = '#4fa3c4';
  for (let x = (Math.floor(t / 120) % 12) - 12; x < 240; x += 12) ctx.fillRect(x, 40, 6, 1);
  ctx.fillStyle = '#a7dde8';
  for (let x = (Math.floor(t / 180) % 10) - 10; x < 240; x += 10) ctx.fillRect(x, 49, 5, 1);
  ctx.fillStyle = '#f1ddb0';
  ctx.fillRect(0, 50, 240, 110);
  ctx.fillStyle = '#e2c48f';
  for (let i = 0; i < 80; i++) ctx.fillRect((i * 53) % 240, 52 + ((i * 29) % 106), 1, 1);
  oval(ctx, ARENA.foe.x, ARENA.foe.y, 30, 6, '#e2c48f', '#a8743a');
  oval(ctx, ARENA.own.x, ARENA.own.y, 34, 7, '#e2c48f', '#a8743a');
}
