// Duell-Hintergründe (Design 7.1): Leuchtturmbucht, Flüsterwald, Pilzmoor, Spiegeldünen, Windklippen,
// Uhrwerkruinen, Nordlichtsee und Sternenwiese.

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

// Großes Zahnrad im Hintergrund der Ruinen
function bigGear(ctx, cx, cy, r, teeth, angle, fill, hole) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.fillStyle = fill;
  for (let i = 0; i < teeth; i++) {
    ctx.rotate((Math.PI * 2) / teeth);
    ctx.fillRect(-2, -r - 3, 4, 5);
  }
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = hole;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Uhrwerkruinen: Mauer aus grünlichem Stein, große Zahnräder, die sich langsam drehen, ein dunkler
// Kanal zwischen den Plattformen aus Pflaster.
function drawRuinArena(ctx, t = 0, reducedMotion = false) {
  const tt = reducedMotion ? 0 : t;
  ctx.fillStyle = '#56706a';
  ctx.fillRect(0, 0, 240, 56);
  ctx.fillStyle = '#46596a';
  for (let y = 6; y < 56; y += 8) {
    ctx.fillRect(0, y, 240, 1);
    for (let x = (y / 8) % 2 ? 0 : 10; x < 240; x += 20) ctx.fillRect(x, y - 7, 1, 7);
  }
  bigGear(ctx, 40, 22, 16, 10, tt / 3000, '#a8743a', '#46596a');
  bigGear(ctx, 70, 40, 9, 7, -tt / 1700, '#7a5236', '#46596a');
  bigGear(ctx, 200, 18, 12, 8, -tt / 2300, '#a8743a', '#46596a');
  // Pflasterboden
  ctx.fillStyle = '#a3a7c4';
  ctx.fillRect(0, 50, 240, 110);
  ctx.fillStyle = '#6b6f94';
  for (let y = 54; y < 160; y += 6) {
    ctx.fillRect(0, y, 240, 1);
    for (let x = (y / 6) % 2 ? 3 : 0; x < 240; x += 9) ctx.fillRect(x, y - 5, 1, 5);
  }
  // Kanal zwischen den Plattformen
  ctx.fillStyle = '#1f3f66';
  ctx.fillRect(0, 64, 240, 8);
  ctx.fillStyle = '#3f8f86';
  const shift = Math.floor(tt / 500) % 5;
  for (let x = shift - 5; x < 240; x += 15) ctx.fillRect(x, 67, 5, 1);
  ctx.fillStyle = '#46496e';
  ctx.fillRect(0, 63, 240, 1);
  ctx.fillRect(0, 72, 240, 1);
  for (const [p, rx, ry] of [[ARENA.foe, 30, 6], [ARENA.own, 34, 7]]) {
    oval(ctx, p.x, p.y, rx, ry, '#d4d6e6', '#46496e');
    ctx.fillStyle = '#a3a7c4';
    for (let dx = -rx + 7; dx < rx - 4; dx += 8) ctx.fillRect(p.x + dx, p.y - ry + 2, 1, ry * 2 - 3);
  }
}

// Nordlichtsee: dunkler Himmel mit Nordlicht in Grün und Violett, verschneite Tannen am Ufer,
// eine Eisfläche mit Rissen, Plattformen aus Schnee.
function drawLakeArena(ctx, t = 0, reducedMotion = false) {
  const tt = reducedMotion ? 0 : t;
  const sky = ctx.createLinearGradient(0, 0, 0, 46);
  sky.addColorStop(0, '#1b2a4a');
  sky.addColorStop(1, '#46496e');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 240, 46);
  // Nordlicht: zwei weiche Bänder, die sich langsam wellen
  for (const [base, color, phase] of [[10, 'rgba(127, 224, 168, 0.35)', 0], [20, 'rgba(196, 154, 217, 0.28)', 2]]) {
    ctx.fillStyle = color;
    for (let x = 0; x < 240; x += 2) {
      const y = base + Math.sin(x / 28 + phase + tt / 2200) * 4;
      ctx.fillRect(x, Math.round(y), 2, 8);
    }
  }
  ctx.fillStyle = '#fffaf0';
  for (const [x, y] of [[14, 6], [60, 3], [112, 8], [170, 4], [222, 9]]) ctx.fillRect(x, y, 1, 1);
  // verschneite Tannen am Ufer
  for (const x of [6, 24, 44, 96, 140, 158, 214, 232]) {
    ctx.fillStyle = '#24493d';
    ctx.beginPath();
    ctx.moveTo(x - 7, 48);
    ctx.lineTo(x, 30);
    ctx.lineTo(x + 7, 48);
    ctx.fill();
    ctx.fillStyle = '#fffaf0';
    ctx.fillRect(x - 1, 31, 2, 2);
    ctx.fillRect(x - 3, 38, 6, 1);
  }
  // Eisfläche
  ctx.fillStyle = '#a7dde8';
  ctx.fillRect(0, 47, 240, 113);
  ctx.fillStyle = '#fffaf0';
  for (let i = 0; i < 30; i++) ctx.fillRect((i * 67) % 240, 52 + ((i * 31) % 104), 3, 1);
  ctx.fillStyle = '#4fa3c4';
  for (const [x, y] of [[30, 100], [120, 66], [200, 120], [90, 140]]) {
    ctx.fillRect(x, y, 6, 1);
    ctx.fillRect(x + 6, y + 1, 5, 1);
    ctx.fillRect(x + 11, y + 2, 3, 1);
  }
  oval(ctx, ARENA.foe.x, ARENA.foe.y, 30, 6, '#fffaf0', '#a3a7c4');
  oval(ctx, ARENA.own.x, ARENA.own.y, 34, 7, '#fffaf0', '#a3a7c4');
}

// Sternenwiese: Nachthimmel mit Mond und Sternen, dunkle Hügel, eine dunkle Wiese mit
// Sternengras, Plattformen aus Gras.
function drawMeadowArena(ctx, t = 0, reducedMotion = false) {
  const tt = reducedMotion ? 0 : t;
  const sky = ctx.createLinearGradient(0, 0, 0, 50);
  sky.addColorStop(0, '#1b1a2e');
  sky.addColorStop(1, '#2b2d4a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 240, 50);
  // Mond als Sichel
  ctx.fillStyle = '#ffe08a';
  ctx.beginPath();
  ctx.arc(42, 17, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1e1d33';
  ctx.beginPath();
  ctx.arc(46, 14, 8, 0, Math.PI * 2);
  ctx.fill();
  // Sterne; ein paar leuchten langsam auf und ab (höchstens einmal in vier Sekunden)
  const glow = reducedMotion ? 0.8 : 0.55 + 0.35 * Math.sin(tt / 700);
  ctx.fillStyle = '#fffaf0';
  for (const [x, y] of [[80, 6], [104, 20], [130, 9], [160, 26], [188, 5], [214, 16], [232, 30], [70, 30], [16, 34], [150, 40]]) ctx.fillRect(x, y, 1, 1);
  ctx.fillStyle = `rgba(255, 224, 138, ${glow})`;
  for (const [x, y] of [[118, 14], [200, 30], [92, 38]]) {
    ctx.fillRect(x - 1, y, 3, 1);
    ctx.fillRect(x, y - 1, 1, 3);
  }
  // dunkle Hügel
  ctx.fillStyle = '#1f3a33';
  for (const [x, rx] of [[30, 60], [140, 70], [230, 50]]) {
    ctx.beginPath();
    ctx.ellipse(x, 50, rx, 12, 0, Math.PI, 0);
    ctx.fill();
  }
  // Wiese mit Sternengras
  ctx.fillStyle = '#24493d';
  ctx.fillRect(0, 48, 240, 112);
  ctx.fillStyle = '#3d7a55';
  for (let i = 0; i < 60; i++) ctx.fillRect((i * 53) % 240, 52 + ((i * 29) % 106), 1, 2);
  ctx.fillStyle = '#e8b64a';
  for (let i = 0; i < 16; i++) ctx.fillRect((i * 71 + 9) % 240, 54 + ((i * 41) % 102), 1, 1);
  oval(ctx, ARENA.foe.x, ARENA.foe.y, 30, 6, '#3d7a55', '#1b1a2e');
  oval(ctx, ARENA.own.x, ARENA.own.y, 34, 7, '#3d7a55', '#1b1a2e');
  ctx.fillStyle = '#ffe08a';
  ctx.fillRect(ARENA.foe.x - 16, ARENA.foe.y - 4, 1, 1);
  ctx.fillRect(ARENA.own.x + 12, ARENA.own.y - 5, 1, 1);
}

// Die Höhle im Berg (Plan 5a): dunkler Fels, Kristalle, die langsam glimmen, Plattformen aus Stein.
function drawCaveArena(ctx, t = 0, reducedMotion = false) {
  ctx.fillStyle = '#1b1a2e';
  ctx.fillRect(0, 0, 240, 160);
  ctx.fillStyle = '#2b2d4a';
  for (let x = 0; x < 240; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 15, 18 + ((x / 30) % 3) * 6);
    ctx.lineTo(x + 30, 0);
    ctx.fill();
  }
  ctx.fillStyle = '#46496e';
  ctx.fillRect(0, 56, 240, 104);
  ctx.fillStyle = '#2b2d4a';
  for (let i = 0; i < 50; i++) ctx.fillRect((i * 47) % 240, 58 + ((i * 31) % 100), 2, 1);
  // Kristalle an der Wand; sie glimmen langsam (bei „Bewegung reduzieren“ ruhig)
  const glow = reducedMotion ? 0.6 : 0.45 + 0.25 * Math.sin(t / 900);
  for (const [x, h, c] of [[18, 22, '#c49ad9'], [64, 16, '#a7dde8'], [120, 26, '#c49ad9'], [170, 18, '#ffe08a'], [214, 24, '#a7dde8']]) {
    ctx.globalAlpha = glow;
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(x, 56);
    ctx.lineTo(x + 5, 56 - h);
    ctx.lineTo(x + 10, 56);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  oval(ctx, ARENA.foe.x, ARENA.foe.y, 30, 6, '#6b6f94', '#1b1a2e');
  oval(ctx, ARENA.own.x, ARENA.own.y, 34, 7, '#6b6f94', '#1b1a2e');
}

// Hintergrund passend zum Gebiet (Design 7.1). Gebiete ohne eigene Arena nehmen die Bucht.
// Bei „Bewegung reduzieren“ steht jede Arena still.
export const ARENAS = {
  2: drawForestArena, 3: drawMoorArena, 4: drawDuneArena, 5: drawCliffArena,
  6: drawRuinArena, 7: drawLakeArena, 8: drawMeadowArena, cave: drawCaveArena,
};
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
