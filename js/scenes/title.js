// Titelbildschirm: der Leuchtturm im Nebel, das Meer, ein kreisender Lichtstrahl (Design 4).

import { musicTo } from '../audio/bus.js';
import { BUILDINGS } from '../gfx/art/tiles.js';
import { spriteFrom } from '../gfx/canvasSprites.js';
import { el } from '../ui/dom.js';
import { t as tr } from '../i18n/i18n.js';

const STARS = Array.from({ length: 46 }, (_, i) => {
  const h = Math.imul(i + 11, 2654435761) >>> 0;
  return { x: h % 240, y: (h >>> 8) % 80, twinkle: (h >>> 16) % 3 === 0, phase: (h >>> 20) % 1000 };
});

const LAMP = { x: 192, y: 40 };

function fogBlob(ctx, x, y, rx, ry, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, ry / rx);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
  g.addColorStop(0, `rgba(212, 214, 230, ${alpha})`);
  g.addColorStop(1, 'rgba(212, 214, 230, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
  ctx.restore();
}

// Wird auch vom Lade-Bildschirm als Hintergrund benutzt.
export function drawTitleArt(ctx, t, reducedMotion) {
  const time = reducedMotion ? 4000 : t;

  // Himmel
  const sky = ctx.createLinearGradient(0, 0, 0, 104);
  sky.addColorStop(0, '#12111f');
  sky.addColorStop(1, '#46496e');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 240, 104);

  for (const s of STARS) {
    const on = !s.twinkle || reducedMotion || Math.sin((time + s.phase * 3) / 900) > -0.3;
    ctx.fillStyle = on ? '#fffaf0' : '#6b6f94';
    ctx.fillRect(s.x, s.y, 1, 1);
  }

  // Mond
  ctx.fillStyle = '#f3ecd2';
  ctx.beginPath();
  ctx.arc(34, 24, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1b1a32';
  ctx.beginPath();
  ctx.arc(38, 21, 8, 0, Math.PI * 2);
  ctx.fill();

  // Meer
  ctx.fillStyle = '#1f3f66';
  ctx.fillRect(0, 100, 240, 60);
  ctx.fillStyle = '#2f6f9c';
  for (let y = 104; y < 160; y += 6) {
    const off = Math.floor(time / 90 + y * 3) % 24;
    for (let x = -24 + off; x < 240; x += 24) ctx.fillRect(x, y, 9, 1);
  }
  // Spiegelung des Lichts
  ctx.fillStyle = 'rgba(255, 224, 138, 0.35)';
  for (let y = 104; y < 160; y += 3) {
    const w = 2 + ((y * 7 + Math.floor(time / 200)) % 5);
    ctx.fillRect(LAMP.x - w / 2, y, w, 1);
  }

  // Klippe
  ctx.fillStyle = '#2b2d4a';
  ctx.beginPath();
  ctx.moveTo(150, 160);
  ctx.lineTo(158, 104);
  ctx.lineTo(168, 96);
  ctx.lineTo(214, 92);
  ctx.lineTo(232, 98);
  ctx.lineTo(240, 96);
  ctx.lineTo(240, 160);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#1b1a2e';
  for (const [x, y, h] of [[162, 108, 7], [180, 102, 5], [198, 112, 6], [222, 104, 8], [172, 124, 5], [214, 128, 6]]) {
    ctx.fillRect(x, y, 1, h);
    ctx.fillRect(x + 1, y + h, 1, 3);
  }
  ctx.fillStyle = '#46496e';
  ctx.fillRect(168, 98, 20, 1);
  ctx.fillRect(196, 96, 16, 1);
  ctx.fillStyle = '#24493d';
  ctx.fillRect(166, 94, 50, 3);
  ctx.fillRect(214, 94, 18, 4);

  // Leuchtturm
  ctx.drawImage(spriteFrom('building:lighthouse', BUILDINGS.lighthouse), LAMP.x - 16, 31);

  // Lichtstrahl: kreist um den Turm, wird schmal, wenn er auf uns oder von uns weg zeigt
  const angle = reducedMotion ? 2.4 : time / 1400;
  const reach = Math.cos(angle) * 230;
  const spread = 6 + Math.abs(Math.sin(angle)) * 10;
  if (Math.abs(reach) > 4) {
    const g = ctx.createLinearGradient(LAMP.x, LAMP.y, LAMP.x + reach, LAMP.y);
    g.addColorStop(0, 'rgba(255, 224, 138, 0.45)');
    g.addColorStop(1, 'rgba(255, 224, 138, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(LAMP.x, LAMP.y - 2);
    ctx.lineTo(LAMP.x + reach, LAMP.y - spread);
    ctx.lineTo(LAMP.x + reach, LAMP.y + spread);
    ctx.lineTo(LAMP.x, LAMP.y + 2);
    ctx.closePath();
    ctx.fill();
  }
  const glow = ctx.createRadialGradient(LAMP.x, LAMP.y, 0, LAMP.x, LAMP.y, 16);
  glow.addColorStop(0, 'rgba(255, 224, 138, 0.6)');
  glow.addColorStop(1, 'rgba(255, 224, 138, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(LAMP.x - 16, LAMP.y - 16, 32, 32);

  // Nebelbänke
  for (let i = 0; i < 6; i++) {
    const x = ((i * 61 + time / (60 + i * 15)) % 340) - 50;
    fogBlob(ctx, x, 96 + (i % 3) * 8, 46, 10, 0.5);
  }
}

export function createTitleScene(game, next, { hint = tr('title.tapStart') } = {}) {
  let root = null;
  let offA = null;
  let done = false;

  function go() {
    if (done) return;
    done = true;
    next();
  }

  function onPointer(e) {
    e.preventDefault();
    go();
  }

  return {
    enter() {
      game.mode = 'screen';
      musicTo('title');
      root = el(
        'div',
        { class: 'title-screen passive' },
        el('h1', { class: 'title-logo' }, 'Lumara'),
        el('p', { class: 'title-sub' }, tr('title.sub')),
        el('p', { class: 'title-tap' }, hint),
      );
      game.ui.append(root);
      offA = game.input.on('a', go);
      window.addEventListener('pointerdown', onPointer);
    },
    exit() {
      root?.remove();
      offA?.();
      window.removeEventListener('pointerdown', onPointer);
      game.input.consume();
    },
    update() {},
    render(ctx, t) {
      drawTitleArt(ctx, t, game.reducedMotion);
    },
  };
}
