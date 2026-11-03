// Duell-Hintergründe (Design 7.1): Leuchtturmbucht, Flüsterwald, Pilzmoor, Spiegeldünen, Windklippen.

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

// Pilzmoor: dunkles Türkis, Riesenpilze mit leuchtenden Tupfen, Nebelband, Moorwasser,
// Plattformen aus Stegbrettern.
function drawMoorArena(ctx, t = 0, reducedMotion = false) {
  const tt = reducedMotion ? 0 : t;
  ctx.fillStyle = '#1b2f36';
  ctx.fillRect(0, 0, 240, 56);
  // Riesenpilze im Hintergrund
  for (const [x, h, r] of [[18, 30, 14], [70, 22, 10], [138, 34, 16], [205, 26, 12]]) {
    ctx.fillStyle = '#2b4a45';
    ctx.fillRect(x - 2, 52 - h, 5, h);
    ctx.fillStyle = '#5e3a6e';
    ctx.beginPath();
    ctx.ellipse(x, 52 - h, r, r * 0.55, 0, Math.PI, 0);
    ctx.fill();
  }
  // Leuchtende Tupfen, die langsam atmen
  const glow = reducedMotion ? 0.75 : 0.55 + 0.3 * Math.sin(tt / 1300);
  ctx.fillStyle = `rgba(255, 224, 138, ${glow})`;
  for (const [x, y] of [[12, 19], [22, 17], [66, 27], [74, 26], [130, 14], [142, 12], [149, 16], [200, 22], [210, 21]]) ctx.fillRect(x, y, 2, 2);
  ctx.fillStyle = `rgba(230, 163, 192, ${glow})`;
  for (const [x, y] of [[17, 21], [137, 17], [206, 24]]) ctx.fillRect(x, y, 2, 1);
  // Moorwasser
  ctx.fillStyle = '#1f3f66';
  ctx.fillRect(0, 50, 240, 110);
  ctx.fillStyle = '#3f8f86';
  const shift = Math.floor(tt / 500) % 4;
  for (let i = 0; i < 40; i++) ctx.fillRect(((i * 61) % 240) + shift, 54 + ((i * 37) % 104), 4, 1);
  // Nebelband über dem Wasser
  ctx.fillStyle = 'rgba(212, 214, 230, 0.16)';
  const mx = (tt / 90) % 60;
  for (let x = -60 + mx; x < 240; x += 60) ctx.fillRect(Math.round(x), 46, 42, 6);
  // Stegplattformen mit Brettfugen
  for (const [p, rx, ry] of [[ARENA.foe, 30, 6], [ARENA.own, 34, 7]]) {
    oval(ctx, p.x, p.y, rx, ry, '#7a5236', '#4a3328');
    ctx.fillStyle = '#4a3328';
    for (let dx = -rx + 6; dx < rx - 4; dx += 7) ctx.fillRect(p.x + dx, p.y - ry + 2, 1, ry * 2 - 3);
  }
}

// Spiegeldünen: heller Himmel, Dünen, ein Glasturm in der Ferne, ein Spiegelband am Horizont,
// Plattformen aus Glassand mit cyanfarbenem Rand.
function drawDuneArena(ctx, t = 0, reducedMotion = false) {
  const tt = reducedMotion ? 0 : t;
  const sky = ctx.createLinearGradient(0, 0, 0, 44);
  sky.addColorStop(0, '#a7dde8');
  sky.addColorStop(1, '#fffaf0');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 240, 44);
  // Glasturm
  ctx.fillStyle = '#a7dde8';
  ctx.fillRect(160, 14, 6, 28);
  ctx.fillStyle = '#4fa3c4';
  ctx.fillRect(165, 14, 1, 28);
  ctx.fillStyle = '#fffaf0';
  ctx.fillRect(161, 16, 1, 24);
  ctx.fillStyle = '#a7dde8';
  ctx.beginPath();
  ctx.moveTo(160, 14);
  ctx.lineTo(163, 6);
  ctx.lineTo(166, 14);
  ctx.fill();
  // ferne Dünen
  ctx.fillStyle = '#e2c48f';
  for (const [x, rx] of [[30, 50], [120, 46], [215, 40]]) {
    ctx.beginPath();
    ctx.ellipse(x, 46, rx, 12, 0, Math.PI, 0);
    ctx.fill();
  }
  // Spiegelband: flimmernde helle Striche am Horizont
  ctx.fillStyle = 'rgba(255, 250, 240, 0.7)';
  const sh = Math.floor(tt / 220) % 6;
  for (let x = sh - 6; x < 240; x += 6) ctx.fillRect(x, 44 + ((x + 60) % 3), 3, 1);
  // Sandboden
  ctx.fillStyle = '#f1ddb0';
  ctx.fillRect(0, 47, 240, 113);
  ctx.fillStyle = '#e2c48f';
  for (let i = 0; i < 80; i++) ctx.fillRect((i * 53) % 240, 50 + ((i * 29) % 108), 1, 1);
  ctx.fillStyle = '#a7dde8';
  for (let i = 0; i < 18; i++) ctx.fillRect((i * 71 + 13) % 240, 52 + ((i * 43) % 104), 1, 1);
  oval(ctx, ARENA.foe.x, ARENA.foe.y, 30, 6, '#fff2d0', '#4fa3c4');
  oval(ctx, ARENA.own.x, ARENA.own.y, 34, 7, '#fff2d0', '#4fa3c4');
}

// Windklippen: Himmel, ziehende Wolken, ein Windrad in der Ferne, Felsplattformen über einem Wolkenmeer.
function drawCliffArena(ctx, t = 0, reducedMotion = false) {
  const tt = reducedMotion ? 0 : t;
  const sky = ctx.createLinearGradient(0, 0, 0, 110);
  sky.addColorStop(0, '#4fa3c4');
  sky.addColorStop(1, '#a7dde8');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 240, 160);
  // ziehende Wolken
  ctx.fillStyle = '#fffaf0';
  for (const [x, y, w] of [[20, 14, 30], [110, 8, 22], [180, 24, 36], [70, 34, 26]]) {
    const xx = ((x - tt / 300) % 280 + 280) % 280 - 20;
    ctx.fillRect(Math.round(xx), y, w, 4);
    ctx.fillRect(Math.round(xx) + 4, y - 3, w - 10, 3);
  }
  // Windrad in der Ferne
  ctx.fillStyle = '#6b6f94';
  ctx.fillRect(28, 40, 3, 22);
  ctx.fillRect(22, 41, 15, 1);
  ctx.fillRect(29, 34, 1, 15);
  // Wolkenmeer unten
  ctx.fillStyle = '#f3ecd2';
  for (let x = -20; x < 260; x += 26) {
    ctx.beginPath();
    ctx.ellipse(x + ((x / 26) % 2) * 6, 118 + ((x / 26) % 3) * 3, 20, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#fffaf0';
  ctx.fillRect(0, 124, 240, 36);
  // Felssäulen unter den Plattformen
  for (const [p, rx] of [[ARENA.foe, 30], [ARENA.own, 34]]) {
    ctx.fillStyle = '#6b6f94';
    ctx.beginPath();
    ctx.moveTo(p.x - rx + 6, p.y + 2);
    ctx.lineTo(p.x + rx - 6, p.y + 2);
    ctx.lineTo(p.x + 6, p.y + 40);
    ctx.lineTo(p.x - 6, p.y + 40);
    ctx.fill();
    ctx.fillStyle = '#46496e';
    ctx.fillRect(p.x + 2, p.y + 4, 2, 30);
  }
  oval(ctx, ARENA.foe.x, ARENA.foe.y, 30, 6, '#a3a7c4', '#46496e');
  oval(ctx, ARENA.own.x, ARENA.own.y, 34, 7, '#a3a7c4', '#46496e');
  ctx.fillStyle = '#6aa55c';
  ctx.fillRect(ARENA.foe.x - 18, ARENA.foe.y - 5, 8, 1);
  ctx.fillRect(ARENA.own.x + 10, ARENA.own.y - 6, 10, 1);
}

// Hintergrund passend zum Gebiet (Design 7.1). Gebiete ohne eigene Arena nehmen die Bucht.
// Bei „Bewegung reduzieren“ steht jede Arena still.
export const ARENAS = { 2: drawForestArena, 3: drawMoorArena, 4: drawDuneArena, 5: drawCliffArena };
export function drawArena(ctx, area, t = 0, reducedMotion = false) {
  (ARENAS[area] ?? drawBayArena)(ctx, t, reducedMotion);
}

export function drawBayArena(ctx, t = 0, reducedMotion = false) {
  if (reducedMotion) t = 0;
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
