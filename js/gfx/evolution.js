// Die Entwicklung (Design 6.3): Das Wesen leuchtet auf, wechselt ein paarmal zwischen alter und neuer
// Gestalt und klingt mit einem Lichtkranz aus. Nichts wechselt öfter als dreimal pro Sekunde
// (Design 14); bei „Bewegung reduzieren“ blendet es nur über, ohne Funkeln.

import { CONFIG } from '../config.js';
import { whiteOf } from './canvasSprites.js';

// Zustand der Szene nach ms Millisekunden. DOM-frei.
export function evolutionAt(ms, reducedMotion = false) {
  const { glowMs, swapMs, fadeMs } = CONFIG.evolution;
  const swapTotal = swapMs.reduce((a, b) => a + b, 0);
  if (ms >= glowMs + swapTotal + fadeMs) return { form: 'to', mix: 1, white: 0, sparkle: 0, done: true };
  if (ms < glowMs) return { form: 'from', mix: 0, white: ms / glowMs, sparkle: 0, done: false };
  if (ms < glowMs + swapTotal) {
    const into = ms - glowMs;
    if (reducedMotion) {
      const mix = into / swapTotal;
      return { form: mix >= 0.5 ? 'to' : 'from', mix, white: 1, sparkle: 0, done: false };
    }
    let acc = 0;
    let i = 0;
    while (i < swapMs.length - 1 && into >= acc + swapMs[i]) acc += swapMs[i++];
    const form = i % 2 === 0 ? 'to' : 'from';
    return { form, mix: form === 'to' ? 1 : 0, white: 1, sparkle: 0, done: false };
  }
  const f = (ms - glowMs - swapTotal) / fadeMs;
  return { form: 'to', mix: 1, white: 1 - f, sparkle: reducedMotion ? 0 : f, done: false };
}

// base: Füße des Wesens (wie ARENA.own). Die Bilder stehen mittig darauf.
export function drawEvolution(ctx, ms, { fromImg, toImg }, base, reducedMotion) {
  const s = evolutionAt(ms, reducedMotion);
  const layer = (img, alpha) => {
    if (alpha <= 0) return;
    const x = Math.round(base.x - img.width / 2), y = Math.round(base.y - img.height + 3);
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, x, y);
    if (s.white > 0) {
      ctx.globalAlpha = alpha * s.white;
      ctx.drawImage(whiteOf(img), x, y);
    }
  };
  if (reducedMotion) {
    layer(fromImg, 1 - s.mix);
    layer(toImg, s.mix);
  } else {
    layer(s.form === 'to' ? toImg : fromImg, 1);
  }
  if (s.sparkle > 0) {
    ctx.fillStyle = '#ffe08a';
    ctx.globalAlpha = 1 - s.sparkle;
    const cy = base.y - toImg.height / 2;
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const r = 10 + 24 * s.sparkle;
      ctx.fillRect(Math.round(base.x + Math.cos(ang) * r) - 1, Math.round(cy + Math.sin(ang) * r * 0.8) - 1, 2, 2);
    }
  }
  ctx.globalAlpha = 1;
}
