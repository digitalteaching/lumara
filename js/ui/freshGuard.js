// Schutz gegen Doppeltipps: Knöpfe, die gerade erst unter dem Finger erschienen sind,
// nehmen für kurze Zeit nichts an. So landet der zweite Tipp nicht auf „Fliehen“ oder einer
// Antwort, die das Kind noch gar nicht gesehen hat.

export const FRESH_MS = 350;
// Fragen (dialog.js choose) schützen länger: Kinder tippen oft schnell durch Gesprächszeilen, und die
// Frage danach (Wunsch eintauschen, Aufgabe annehmen, Reiseziel) erscheint genau unter dem Finger.
export const CHOICE_FRESH_MS = 650;

export function createFreshGuard(ms = FRESH_MS, now = () => performance.now()) {
  let since = now();
  return {
    isFresh: () => now() - since < ms,
    reset() {
      since = now();
    },
  };
}

// Welche Finger (Zeiger) gerade aufliegen, nach pointerId. main.js meldet das einmal am Fenster an
// (Capture-Phase, vor allen anderen Zuhörern), damit eine Frage weiß, ob beim Erscheinen ein Finger lag.
const down = new Set();
export const pointerHeld = () => down.size > 0;
export function trackPointers(target = window) {
  const press = e => down.add(e.pointerId);
  const lift = e => down.delete(e.pointerId);
  // Verliert das Fenster den Fokus, kommt manches pointerup nie an.
  const forget = () => down.clear();
  const on = [['pointerdown', press], ['pointerup', lift], ['pointercancel', lift], ['blur', forget]];
  for (const [type, fn] of on) target.addEventListener(type, fn, { capture: true });
  return () => {
    for (const [type, fn] of on) target.removeEventListener(type, fn, { capture: true });
    down.clear();
  };
}

// Blockiert Klicks auf alles in `node`, solange der Wächter frisch ist (Capture-Phase).
// heldAtShow: Lag beim Erscheinen schon ein Finger auf (etwa der letzte Tipp auf eine Gesprächszeile),
// zählt ein Klick erst, wenn danach ein neuer Finger auf `node` aufgesetzt hat. Der Klick des alten
// Fingers wählt so nie etwas, auch wenn er länger liegen bleibt als die Schutzzeit. Ohne Finger beim
// Erscheinen gilt jeder Klick nach der Schutzzeit, auch einer ohne pointerdown (Tastatur, VoiceOver,
// Schaltersteuerung).
export function guardClicks(node, guard, { heldAtShow = false } = {}) {
  let held = heldAtShow;
  const press = () => {
    held = false;
  };
  const block = e => {
    if (!guard.isFresh() && !held) return;
    e.preventDefault();
    e.stopPropagation();
  };
  if (heldAtShow) node.addEventListener('pointerdown', press, true);
  node.addEventListener('click', block, true);
  return () => {
    node.removeEventListener('click', block, true);
    if (heldAtShow) node.removeEventListener('pointerdown', press, true);
  };
}
