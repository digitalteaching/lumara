// Spielzeit für die Lehrkraft (Design 12.1): Sie zählt nur, solange das Spiel sichtbar ist und
// das Kind in den letzten 2 Minuten etwas eingegeben hat. Ein Schritt zählt höchstens maxStepMs,
// damit eine Pause (Tablet im Ruhezustand) nicht als Spielzeit durchrutscht.

import { CONFIG } from '../config.js';

export function createPlayClock({ idleMs = CONFIG.play.idleMs, maxStepMs = 1000 } = {}) {
  let prev = null;
  let lastActivity = null;
  return {
    activity(now) {
      lastActivity = now;
    },
    step(now, visible) {
      const from = prev ?? now;
      prev = now;
      if (!visible || lastActivity === null) return 0;
      const start = Math.max(from, now - maxStepMs);
      const end = Math.min(now, lastActivity + idleMs);
      return Math.max(0, end - start);
    },
  };
}
