// Automatisch speichern (Design 11): alle 30 Sekunden Spielzeit, dazu sofort, wenn die Seite
// versteckt oder geschlossen wird (Kinder wischen die App einfach weg).
// save() liefert true, false (Fehler) oder null (es gibt nichts zu speichern).

import { CONFIG } from '../config.js';

export function createAutosave({ save, intervalMs = CONFIG.save.autosaveMs, onFail = () => {} }) {
  let elapsed = 0;
  let failed = false;

  function saveNow() {
    elapsed = 0;
    const r = save();
    if (r === false && !failed) {
      failed = true;
      onFail();
    }
    return r;
  }

  return {
    tick(dt) {
      elapsed += dt;
      if (elapsed >= intervalMs) saveNow();
    },
    saveNow,
    attach(doc, win) {
      const onVisibility = () => {
        if (doc.hidden) saveNow();
      };
      const onHide = () => saveNow();
      doc.addEventListener('visibilitychange', onVisibility);
      win.addEventListener('pagehide', onHide);
      return () => {
        doc.removeEventListener('visibilitychange', onVisibility);
        win.removeEventListener('pagehide', onHide);
      };
    },
  };
}
