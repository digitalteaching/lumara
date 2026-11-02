// Ein 240×160-Puffer, der scharf auf den sichtbaren Canvas hochskaliert wird.
// Das Bildrechteck wird als CSS-Variablen veröffentlicht, damit HTML-Kästen genau darüber liegen.

import { CONFIG } from '../config.js';

const { width: W, height: H } = CONFIG.screen;

export function createScreen(displayCanvas, stageEl) {
  const buffer = document.createElement('canvas');
  buffer.width = W;
  buffer.height = H;
  const ctx = buffer.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const dctx = displayCanvas.getContext('2d');
  const root = document.documentElement.style;
  let dest = { x: 0, y: 0, w: W, h: H };

  function resize() {
    const box = stageEl.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    displayCanvas.width = Math.max(1, Math.round(box.width * dpr));
    displayCanvas.height = Math.max(1, Math.round(box.height * dpr));

    const scale = Math.min(box.width / W, box.height / H);
    const w = W * scale;
    const h = H * scale;
    const left = box.left + (box.width - w) / 2;
    const top = box.top + (box.height - h) / 2;

    dest = {
      x: Math.round((left - box.left) * dpr),
      y: Math.round((top - box.top) * dpr),
      w: Math.round(w * dpr),
      h: Math.round(h * dpr),
    };

    root.setProperty('--img-left', `${left}px`);
    root.setProperty('--img-top', `${top}px`);
    root.setProperty('--img-width', `${w}px`);
    root.setProperty('--img-height', `${h}px`);
    root.setProperty('--img-bottom', `${Math.max(0, window.innerHeight - top - h)}px`);
    root.setProperty('--gpx', `${scale}px`);
  }

  function present() {
    dctx.imageSmoothingEnabled = false;
    dctx.fillStyle = '#12111f';
    dctx.fillRect(0, 0, displayCanvas.width, displayCanvas.height);
    dctx.drawImage(buffer, 0, 0, W, H, dest.x, dest.y, dest.w, dest.h);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 50));
  resize();

  return { ctx, present, resize, width: W, height: H };
}
