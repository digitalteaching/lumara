// Steuerkreuz, A und B auf dem Bildschirm (nur bei Touch-Geräten sichtbar).

import { dpadDirection } from '../core/input.js';
import { t } from '../i18n/i18n.js';

export function mountControls(padEl, input) {
  padEl.innerHTML = `
    <div class="dpad" aria-label="${t('controls.dpad')}">
      <span class="dpad-arm up"></span><span class="dpad-arm down"></span>
      <span class="dpad-arm left"></span><span class="dpad-arm right"></span>
      <span class="dpad-hub"></span>
    </div>
    <div class="ab">
      <button class="pad-btn b" type="button" aria-label="B">B</button>
      <button class="pad-btn a" type="button" aria-label="A">A</button>
    </div>`;

  const dpad = padEl.querySelector('.dpad');
  let dpadPointer = null;
  let current = null;

  function setDir(dir) {
    if (dir === current) return;
    if (current) input.setVirtual(current, false);
    current = dir;
    if (current) input.setVirtual(current, true);
    dpad.dataset.dir = current ?? '';
  }

  function dirFromEvent(e) {
    const r = dpad.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    return dpadDirection(dx, dy, r.width * 0.15);
  }

  dpad.addEventListener('pointerdown', e => {
    e.preventDefault();
    if (dpadPointer !== null) return;
    dpadPointer = e.pointerId;
    try { dpad.setPointerCapture(e.pointerId); } catch { /* synthetischer Zeiger */ }
    setDir(dirFromEvent(e));
  });
  dpad.addEventListener('pointermove', e => {
    if (e.pointerId === dpadPointer) setDir(dirFromEvent(e));
  });
  const endDpad = e => {
    if (e.pointerId !== dpadPointer) return;
    dpadPointer = null;
    setDir(null);
  };
  dpad.addEventListener('pointerup', endDpad);
  dpad.addEventListener('pointercancel', endDpad);
  dpad.addEventListener('lostpointercapture', endDpad);

  for (const name of ['a', 'b']) {
    const btn = padEl.querySelector(`.pad-btn.${name}`);
    let pointer = null;
    btn.addEventListener('pointerdown', e => {
      e.preventDefault();
      if (pointer !== null) return;
      pointer = e.pointerId;
      try { btn.setPointerCapture(e.pointerId); } catch { /* synthetischer Zeiger */ }
      btn.classList.add('down');
      input.setVirtual(name, true);
    });
    const end = e => {
      if (e.pointerId !== pointer) return;
      pointer = null;
      btn.classList.remove('down');
      input.setVirtual(name, false);
    };
    btn.addEventListener('pointerup', end);
    btn.addEventListener('pointercancel', end);
    btn.addEventListener('lostpointercapture', end);
    btn.addEventListener('contextmenu', e => e.preventDefault());
  }

  // Sichtbar, sobald das Gerät Berührungen meldet.
  const markTouch = () => document.body.classList.add('touch');
  if (matchMedia('(any-pointer: coarse)').matches) markTouch();
  window.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch') markTouch();
  }, { capture: true });
}
