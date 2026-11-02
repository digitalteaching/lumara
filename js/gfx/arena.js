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
